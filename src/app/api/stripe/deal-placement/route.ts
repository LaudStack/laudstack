// Force dynamic rendering — prevents static analysis at build time
export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db";
import { deals, users } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { isRoleAtLeast } from "@/lib/permissions";
import {
  createDealPlacementCheckoutSession,
  DEAL_PLACEMENT_PLANS,
  type DealPlacementPlan,
} from "@/server/stripe";

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get internal user
    const dbUser = await db.query.users.findFirst({
      where: eq(users.supabaseId, supabaseUser.id),
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Progressive verification: require email verification to publish a deal
    if (!dbUser.emailVerified) {
      return NextResponse.json(
        { error: "EMAIL_NOT_VERIFIED", message: "Please verify your email to publish a deal." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { dealId, plan } = body as { dealId: number; plan: string };

    // Validate plan
    if (!plan || !(plan in DEAL_PLACEMENT_PLANS)) {
      return NextResponse.json(
        { error: "Invalid placement plan" },
        { status: 400 }
      );
    }

    // Verify deal exists and belongs to this user (or user is admin)
    const deal = await db.query.deals.findFirst({
      where: eq(deals.id, dealId),
    });

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    // Only the deal creator or an admin can purchase placement
    if (deal.createdBy !== dbUser.id && !isRoleAtLeast(dbUser.role, "admin")) {
      return NextResponse.json(
        { error: "You can only upgrade your own deals" },
        { status: 403 }
      );
    }

    // Deal must be approved to purchase placement
    if (deal.approvalStatus !== "approved") {
      return NextResponse.json(
        { error: "Deal must be approved before purchasing placement" },
        { status: 400 }
      );
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "";

    const session = await createDealPlacementCheckoutSession({
      dealId: deal.id,
      dealTitle: deal.title,
      plan: plan as DealPlacementPlan,
      userId: dbUser.id,
      userEmail: dbUser.email || supabaseUser.email || "",
      successUrl: `${origin}/dashboard/founder?tab=deals&placement=success`,
      cancelUrl: `${origin}/dashboard/founder?tab=deals&placement=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[Stripe Deal Placement] Error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
