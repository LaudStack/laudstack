// Force dynamic rendering — prevents static analysis at build time
export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/server/stripe";
import { db } from "@/server/db";
import {
  tools,
  toolUpgrades,
  deals,
  users,
  marketplaceProducts,
  marketplaceOrders,
  marketplaceOffers,
} from "@/drizzle/schema";
import { eq, sql } from "drizzle-orm";
import {
  notifyPurchaseConfirmation,
  notifySaleReceived,
} from "@/lib/marketplaceNotifications";
import {
  FEATURED_PLANS,
  type FeaturedPlan,
  DEAL_PLACEMENT_PLANS,
  type DealPlacementPlan,
  MARKETPLACE_BOOST_PLANS,
  type MarketplaceBoostPlan,
  MARKETPLACE_COMMISSION_RATE,
} from "@/server/stripe";
import { activatePromotion } from "@/app/actions/promotions";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = constructWebhookEvent(body, signature);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const metadata = session.metadata;

      // ── Unified Promotion Purchase ──
      if (metadata?.type === "promotion_purchase" && metadata?.promotion_id) {
        const promotionId = parseInt(metadata.promotion_id);
        try {
          await activatePromotion(
            promotionId,
            session.id,
            (session.payment_intent as string) || ""
          );
          console.log(
            `[Stripe] Promotion ${promotionId} activated (type: ${metadata.promotion_type}, entity: ${metadata.entity_id})`
          );
        } catch (err) {
          console.error(`[Stripe] Failed to activate promotion ${promotionId}:`, err);
        }
        break;
      }

      // ── Creator Onboarding Payment ──
      if (metadata?.type === "creator_onboarding" && metadata?.user_id) {
        const userId = parseInt(metadata.user_id);
        try {
          await db.update(users)
            .set({ creatorOnboardingStripeSessionId: session.id })
            .where(eq(users.id, userId));
          console.log(`[Stripe] Creator onboarding payment completed for user ${userId}`);
        } catch (err) {
          console.error(`[Stripe] Failed to update creator onboarding for user ${userId}:`, err);
        }
        break;
      }

      // ── Marketplace Product Purchase ──
      if (metadata?.type === "marketplace_purchase" && metadata?.product_id && metadata?.buyer_id) {
        const productId = parseInt(metadata.product_id);
        const buyerId = parseInt(metadata.buyer_id);
        const offerId = metadata.offer_id ? parseInt(metadata.offer_id) : null;
        const amountTotal = session.amount_total ?? 0;
        const platformFee = Math.round(amountTotal * MARKETPLACE_COMMISSION_RATE);
        const creatorPayout = amountTotal - platformFee;

        try {
          // Get the product to find the creator
          const product = await db.query.marketplaceProducts.findFirst({
            where: eq(marketplaceProducts.id, productId),
          });

          if (product) {
            // Create the order record
            await db.insert(marketplaceOrders).values({
              productId,
              buyerId,
              creatorId: product.creatorId,
              amount: amountTotal,
              platformFee,
              creatorPayout,
              currency: session.currency ?? "usd",
              stripeSessionId: session.id,
              stripePaymentIntentId: (session.payment_intent as string) ?? null,
              status: "completed",
              offerId,
            });

            // Update product sales count and revenue
            await db.update(marketplaceProducts)
              .set({
                salesCount: sql`${marketplaceProducts.salesCount} + 1`,
                totalRevenue: sql`${marketplaceProducts.totalRevenue} + ${creatorPayout}`,
                updatedAt: new Date(),
              })
              .where(eq(marketplaceProducts.id, productId));

            // If this was an offer purchase, mark the offer as completed
            if (offerId) {
              await db.update(marketplaceOffers)
                .set({ status: "completed" })
                .where(eq(marketplaceOffers.id, offerId));
            }

            // Send notifications (non-blocking)
            notifyPurchaseConfirmation({
              buyerId,
              productName: product.name,
              productSlug: product.slug,
              amount: amountTotal,
            });
            notifySaleReceived({
              creatorId: product.creatorId,
              buyerId,
              productName: product.name,
              productSlug: product.slug,
              amount: amountTotal,
              payout: creatorPayout,
            });

            console.log(
              `[Stripe] Marketplace purchase: product ${productId}, buyer ${buyerId}, amount $${(amountTotal / 100).toFixed(2)}, fee $${(platformFee / 100).toFixed(2)}`
            );
          }
        } catch (err) {
          console.error(`[Stripe] Failed to process marketplace purchase for product ${productId}:`, err);
        }
        break;
      }

      // ── Marketplace Boost Payment ──
      if (metadata?.type === "marketplace_boost" && metadata?.product_id && metadata?.plan) {
        const productId = parseInt(metadata.product_id);
        const plan = metadata.plan as MarketplaceBoostPlan;
        const planDetails = MARKETPLACE_BOOST_PLANS[plan];

        try {
          const boostExpiresAt = new Date();
          boostExpiresAt.setDate(boostExpiresAt.getDate() + planDetails.duration_days);

          await db.update(marketplaceProducts)
            .set({
              isBoosted: true,
              boostExpiresAt,
              boostPlan: plan,
              updatedAt: new Date(),
            })
            .where(eq(marketplaceProducts.id, productId));

          console.log(
            `[Stripe] Marketplace boost: product ${productId}, plan ${plan}, expires ${boostExpiresAt.toISOString()}`
          );
        } catch (err) {
          console.error(`[Stripe] Failed to process marketplace boost for product ${productId}:`, err);
        }
        break;
      }

      // ── Deal Placement Payment ──
      if (metadata?.type === "deal_placement" && metadata?.deal_id && metadata?.plan) {
        const dealId = parseInt(metadata.deal_id);
        const plan = metadata.plan as DealPlacementPlan;
        const planDetails = DEAL_PLACEMENT_PLANS[plan];

        const placementExpiresAt = new Date();
        placementExpiresAt.setDate(placementExpiresAt.getDate() + planDetails.duration_days);

        await db
          .update(deals)
          .set({
            placement: planDetails.placement,
            placementExpiresAt,
            placementPlan: plan,
            placementPaidAmount: session.amount_total ?? planDetails.amount,
            placementStripeSessionId: session.id,
            updatedAt: new Date(),
          })
          .where(eq(deals.id, dealId));

        console.log(
          `[Stripe] Deal ${dealId} upgraded to ${planDetails.placement} (plan: ${plan}) until ${placementExpiresAt.toISOString()}`
        );
        break;
      }

      // ── Tool Featured Payment (existing logic) ──
      if (metadata?.tool_id && metadata?.user_id && metadata?.plan) {
        const toolId = parseInt(metadata.tool_id);
        const userId = parseInt(metadata.user_id);
        const plan = metadata.plan as FeaturedPlan;
        const planDetails = FEATURED_PLANS[plan];

        let expiresAt: Date | null = null;
        if (planDetails.duration_days) {
          expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + planDetails.duration_days);
        }

        await db.insert(toolUpgrades).values({
          toolId,
          userId,
          tier: "featured",
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent as string,
          amountPaid: session.amount_total ?? 0,
          currency: session.currency ?? "usd",
          status: "active",
          expiresAt,
        });

        await db
          .update(tools)
          .set({ isFeatured: true, updatedAt: new Date() })
          .where(eq(tools.id, toolId));

        console.log(
          `[Stripe] Tool ${toolId} marked as featured until ${expiresAt}`
        );
      }
      break;
    }

    // ── Stripe Connect account updated ──
    case "account.updated": {
      const account = event.data.object;
      const userId = account.metadata?.laudstack_user_id;

      if (userId && account.charges_enabled && account.payouts_enabled) {
        try {
          await db.update(users)
            .set({
              stripeConnectOnboarded: true,
              isMarketplaceCreator: true,
              creatorActivatedAt: new Date(),
            })
            .where(eq(users.id, parseInt(userId)));

          console.log(`[Stripe] Connect account ${account.id} fully onboarded for user ${userId}`);
        } catch (err) {
          console.error(`[Stripe] Failed to update Connect status for user ${userId}:`, err);
        }
      }
      break;
    }

    case "checkout.session.expired": {
      // Handle expired sessions if needed
      break;
    }
  }

  return NextResponse.json({ received: true });
}

// Stripe requires raw body for webhook verification
export const config = {
  api: {
    bodyParser: false,
  },
};
