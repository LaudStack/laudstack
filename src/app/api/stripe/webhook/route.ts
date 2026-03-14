// Force dynamic rendering — prevents static analysis at build time
export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/server/stripe";
import { db } from "@/server/db";
import { tools, toolUpgrades } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { FEATURED_PLANS, type FeaturedPlan } from "@/server/stripe";

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

      if (!metadata?.tool_id || !metadata?.user_id || !metadata?.plan) {
        break;
      }

      const toolId = parseInt(metadata.tool_id);
      const userId = parseInt(metadata.user_id);
      const plan = metadata.plan as FeaturedPlan;
      const planDetails = FEATURED_PLANS[plan];

      // Calculate expiry date
      let expiresAt: Date | null = null;
      if (planDetails.duration_days) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + planDetails.duration_days);
      }

      // Record the upgrade
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

      // Mark tool as featured
      await db
        .update(tools)
        .set({ isFeatured: true, updatedAt: new Date() })
        .where(eq(tools.id, toolId));

      console.log(
        `[Stripe] Tool ${toolId} marked as featured until ${expiresAt}`
      );
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
