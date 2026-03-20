// Force dynamic rendering — prevents static analysis at build time
export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db";
import { users, marketplaceProducts } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { createMarketplacePurchaseSession } from "@/server/stripe";

/**
 * GET handler: Redirect-based purchase flow (used by dashboard offer links).
 * Query params: product_id, offer_id (optional)
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    if (!supabaseUser) {
      const loginUrl = `/signin?redirect=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
      return NextResponse.redirect(new URL(loginUrl, req.url));
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.supabaseId, supabaseUser.id),
    });

    if (!dbUser) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const productId = parseInt(req.nextUrl.searchParams.get("product_id") || "", 10);
    const offerIdParam = req.nextUrl.searchParams.get("offer_id");
    const offerId = offerIdParam ? parseInt(offerIdParam, 10) : undefined;

    if (!productId || isNaN(productId)) {
      return NextResponse.redirect(new URL("/marketplace?error=invalid_product", req.url));
    }

    const product = await db.query.marketplaceProducts.findFirst({
      where: eq(marketplaceProducts.id, productId),
    });

    if (!product || product.status !== "approved") {
      return NextResponse.redirect(new URL("/marketplace?error=product_unavailable", req.url));
    }

    if (product.creatorId === dbUser.id) {
      return NextResponse.redirect(new URL(`/marketplace/${product.slug}?error=own_product`, req.url));
    }

    const creator = await db.query.users.findFirst({
      where: eq(users.id, product.creatorId),
    });

    if (!creator || !creator.stripeConnectAccountId) {
      return NextResponse.redirect(new URL(`/marketplace/${product.slug}?error=creator_not_setup`, req.url));
    }

    let amountCents = product.price;
    if (offerId) {
      const { marketplaceOffers } = await import("@/drizzle/schema");
      const offer = await db.query.marketplaceOffers.findFirst({
        where: eq(marketplaceOffers.id, offerId),
      });
      if (!offer || offer.buyerId !== dbUser.id) {
        return NextResponse.redirect(new URL("/dashboard?tab=offers&error=invalid_offer", req.url));
      }
      if (offer.status !== "accepted" && offer.status !== "countered") {
        return NextResponse.redirect(new URL("/dashboard?tab=offers&error=offer_not_payable", req.url));
      }
      amountCents = offer.status === "countered" && offer.counterAmountCents
        ? offer.counterAmountCents
        : offer.offerAmountCents;
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "https://www.laudstack.com";

    const session = await createMarketplacePurchaseSession({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      buyerId: dbUser.id,
      buyerEmail: dbUser.email || supabaseUser.email || "",
      creatorConnectAccountId: creator.stripeConnectAccountId,
      amountCents,
      successUrl: `${origin}/marketplace/purchase-success?product=${product.slug}`,
      cancelUrl: `${origin}/marketplace/${product.slug}`,
      offerId,
    });

    if (session.url) {
      return NextResponse.redirect(session.url);
    }
    return NextResponse.redirect(new URL("/marketplace?error=checkout_failed", req.url));
  } catch (error) {
    console.error("[Stripe Marketplace Purchase GET] Error:", error);
    return NextResponse.redirect(new URL("/marketplace?error=checkout_failed", req.url));
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.supabaseId, supabaseUser.id),
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { productId, offerId } = body as { productId: number; offerId?: number };

    // Get the product
    const product = await db.query.marketplaceProducts.findFirst({
      where: eq(marketplaceProducts.id, productId),
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.status !== "approved") {
      return NextResponse.json({ error: "Product is not available for purchase" }, { status: 400 });
    }

    if (product.creatorId === dbUser.id) {
      return NextResponse.json({ error: "You cannot purchase your own product" }, { status: 400 });
    }

    // Get the creator's Stripe Connect account
    const creator = await db.query.users.findFirst({
      where: eq(users.id, product.creatorId),
    });

    if (!creator || !creator.stripeConnectAccountId) {
      return NextResponse.json({ error: "Creator payment account not set up" }, { status: 400 });
    }

    // Determine the amount (could be from an accepted offer)
    let amountCents = product.price;
    if (offerId) {
      // If paying via an accepted offer, use the offer/counter amount
      const { marketplaceOffers } = await import("@/drizzle/schema");
      const offer = await db.query.marketplaceOffers.findFirst({
        where: eq(marketplaceOffers.id, offerId),
      });
      if (!offer || offer.buyerId !== dbUser.id) {
        return NextResponse.json({ error: "Invalid offer" }, { status: 400 });
      }
      if (offer.status !== "accepted" && offer.status !== "countered") {
        return NextResponse.json({ error: "Offer is not in a payable state" }, { status: 400 });
      }
      // Use counter amount if countered, otherwise original offer amount
      amountCents = offer.status === "countered" && offer.counterAmountCents
        ? offer.counterAmountCents
        : offer.offerAmountCents;
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "https://www.laudstack.com";

    const session = await createMarketplacePurchaseSession({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      buyerId: dbUser.id,
      buyerEmail: dbUser.email || supabaseUser.email || "",
      creatorConnectAccountId: creator.stripeConnectAccountId,
      amountCents,
      successUrl: `${origin}/marketplace/purchase-success?product=${product.slug}`,
      cancelUrl: `${origin}/marketplace/${product.slug}`,
      offerId,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[Stripe Marketplace Purchase] Error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
