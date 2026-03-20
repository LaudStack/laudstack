// Force dynamic rendering
export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db";
import { users, tools, deals, marketplaceProducts, promotionPricing } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { isRoleAtLeast } from "@/lib/permissions";
import { getStripe } from "@/server/stripe";
import { createPendingPromotion } from "@/app/actions/promotions";
import type { PromotionTarget, PromotionType } from "@/app/actions/promotions";

/**
 * POST /api/stripe/promotion-checkout
 *
 * Unified checkout for all promotion types.
 * Body: { pricingId: number, entityId: number, slotDate?: string }
 *
 * Flow:
 * 1. Validate user auth
 * 2. Look up pricing tier
 * 3. Verify entity ownership
 * 4. Create pending promotion record
 * 5. Create Stripe checkout session
 * 6. Return checkout URL
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate
    const supabase = await createClient();
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();
    if (!supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.supabaseId, supabaseUser.id),
    });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Parse & validate body
    const body = await req.json();
    const { pricingId, entityId, slotDate } = body as {
      pricingId: number;
      entityId: number;
      slotDate?: string;
    };

    if (!pricingId || !entityId) {
      return NextResponse.json({ error: "Missing pricingId or entityId" }, { status: 400 });
    }

    // 3. Look up pricing tier
    const [pricing] = await db
      .select()
      .from(promotionPricing)
      .where(and(eq(promotionPricing.id, pricingId), eq(promotionPricing.isActive, true)))
      .limit(1);

    if (!pricing) {
      return NextResponse.json({ error: "Invalid or inactive pricing tier" }, { status: 400 });
    }

    // 4. Determine target from promotion type
    const targetMap: Record<string, PromotionTarget> = {
      stack_featured: "stack",
      stack_spotlight: "stack",
      stack_category_boost: "stack",
      deal_pinned: "deal",
      deal_featured: "deal",
      deal_of_day: "deal",
      marketplace_boost: "marketplace",
      marketplace_spotlight: "marketplace",
    };
    const target = targetMap[pricing.promotionType];
    if (!target) {
      return NextResponse.json({ error: "Invalid promotion type" }, { status: 400 });
    }

    // 5. Verify entity exists and user has ownership
    if (target === "stack") {
      const tool = await db.query.tools.findFirst({
        where: eq(tools.id, entityId),
      });
      if (!tool) {
        return NextResponse.json({ error: "Tool not found" }, { status: 404 });
      }
      const isOwner = tool.submittedBy === dbUser.id || tool.claimedBy === dbUser.id;
      const isAdminUser = isRoleAtLeast(dbUser.role, "admin");
      if (!isOwner && !isAdminUser) {
        return NextResponse.json({ error: "You can only promote your own tools" }, { status: 403 });
      }
      if (tool.status !== "approved" && tool.status !== "featured") {
        return NextResponse.json({ error: "Tool must be approved before promotion" }, { status: 400 });
      }
    } else if (target === "deal") {
      const deal = await db.query.deals.findFirst({
        where: eq(deals.id, entityId),
      });
      if (!deal) {
        return NextResponse.json({ error: "Deal not found" }, { status: 404 });
      }
      const isOwner = deal.createdBy === dbUser.id;
      const isAdminUser = isRoleAtLeast(dbUser.role, "admin");
      if (!isOwner && !isAdminUser) {
        return NextResponse.json({ error: "You can only promote your own deals" }, { status: 403 });
      }
      if (deal.approvalStatus !== "approved") {
        return NextResponse.json({ error: "Deal must be approved before promotion" }, { status: 400 });
      }
      // For deal_of_day, slotDate is required
      if (pricing.promotionType === "deal_of_day" && !slotDate) {
        return NextResponse.json({ error: "slotDate is required for Deal of the Day" }, { status: 400 });
      }
    } else if (target === "marketplace") {
      const product = await db.query.marketplaceProducts.findFirst({
        where: eq(marketplaceProducts.id, entityId),
      });
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      if (product.creatorId !== dbUser.id) {
        const isAdminUser = isRoleAtLeast(dbUser.role, "admin");
        if (!isAdminUser) {
          return NextResponse.json({ error: "You can only promote your own products" }, { status: 403 });
        }
      }      if (product.status !== "approved") {
        return NextResponse.json({ error: "Product must be approved before promotion" }, { status: 400 });      }
    }

    // 6. Create pending promotion record
    const pendingPromo = await createPendingPromotion({
      userId: dbUser.id,
      target,
      type: pricing.promotionType as PromotionType,
      targetEntityId: entityId,
      durationDays: pricing.durationDays,
      amountPaid: pricing.priceInCents,
      slotDate: slotDate ?? undefined,
    });

    // 7. Create Stripe checkout session
    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "https://www.laudstack.com";

    // Determine success/cancel URLs based on target
    let successPath = "/dashboard/founder?tab=promote&payment=success";
    let cancelPath = "/dashboard/founder?tab=promote&payment=cancelled";
    if (target === "marketplace") {
      successPath = "/dashboard/creator?tab=promote&payment=success";
      cancelPath = "/dashboard/creator?tab=promote&payment=cancelled";
    }

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_email: dbUser.email || supabaseUser.email || "",
      line_items: [
        {
          price_data: {
            currency: pricing.currency || "usd",
            product_data: {
              name: pricing.displayName,
              description: pricing.description || `${pricing.durationDays}-day promotion`,
              metadata: {
                promotion_id: pendingPromo.id.toString(),
                promotion_type: pricing.promotionType,
                entity_id: entityId.toString(),
                target,
              },
            },
            unit_amount: pricing.priceInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "promotion_purchase",
        promotion_id: pendingPromo.id.toString(),
        promotion_type: pricing.promotionType,
        entity_id: entityId.toString(),
        target,
        user_id: dbUser.id.toString(),
      },
      success_url: `${origin}${successPath}`,
      cancel_url: `${origin}${cancelPath}`,
    });

    return NextResponse.json({ url: session.url, promotionId: pendingPromo.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Stripe Promotion Checkout] Error:", message);

    // Handle specific errors
    if (message.includes("already booked") || message.includes("currently held")) {
      return NextResponse.json({ error: message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
