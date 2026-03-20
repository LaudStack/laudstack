// Force dynamic rendering — prevents static analysis at build time
export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db";
import { users, marketplaceProducts } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import {
  createMarketplaceBoostCheckoutSession,
  MARKETPLACE_BOOST_PLANS,
  type MarketplaceBoostPlan,
} from "@/server/stripe";

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

    if (!dbUser.isMarketplaceCreator) {
      return NextResponse.json({ error: "Not a marketplace creator" }, { status: 403 });
    }

    const body = await req.json();
    const { productId, plan } = body as { productId: number; plan: string };

    if (!plan || !(plan in MARKETPLACE_BOOST_PLANS)) {
      return NextResponse.json({ error: "Invalid boost plan" }, { status: 400 });
    }

    const product = await db.query.marketplaceProducts.findFirst({
      where: eq(marketplaceProducts.id, productId),
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.creatorId !== dbUser.id) {
      return NextResponse.json({ error: "Not your product" }, { status: 403 });
    }

    if (product.status !== "approved") {
      return NextResponse.json({ error: "Product must be approved before boosting" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "https://www.laudstack.com";

    const session = await createMarketplaceBoostCheckoutSession({
      productId: product.id,
      productName: product.name,
      plan: plan as MarketplaceBoostPlan,
      userId: dbUser.id,
      userEmail: dbUser.email || supabaseUser.email || "",
      successUrl: `${origin}/dashboard/creator?tab=products&payment=success`,
      cancelUrl: `${origin}/dashboard/creator?tab=products&payment=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[Stripe Marketplace Boost] Error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
