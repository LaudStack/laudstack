// Force dynamic rendering — prevents static analysis at build time
export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import {
  createConnectAccount,
  createConnectOnboardingLink,
  getConnectAccount,
} from "@/server/stripe";

/**
 * POST: Create a Stripe Connect Express account and return the onboarding link.
 * If the user already has a Connect account, return a fresh onboarding link.
 */
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

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "https://www.laudstack.com";

    let accountId = dbUser.stripeConnectAccountId;

    // Create a new Connect account if one doesn't exist
    if (!accountId) {
      const account = await createConnectAccount({
        userId: dbUser.id,
        email: dbUser.email || supabaseUser.email || "",
      });
      accountId = account.id;

      // Save the Connect account ID to the user record
      await db.update(users)
        .set({ stripeConnectAccountId: accountId })
        .where(eq(users.id, dbUser.id));
    }

    // Generate the onboarding link
    const accountLink = await createConnectOnboardingLink({
      accountId,
      refreshUrl: `${origin}/marketplace/creator/onboarding?step=stripe-connect&refresh=true`,
      returnUrl: `${origin}/marketplace/creator/onboarding?step=complete`,
    });

    return NextResponse.json({ url: accountLink.url, accountId });
  } catch (error) {
    console.error("[Stripe Connect Onboarding] Error:", error);
    return NextResponse.json({ error: "Failed to create Connect onboarding" }, { status: 500 });
  }
}

/**
 * GET: Check the status of the user's Stripe Connect account.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.supabaseId, supabaseUser.id),
    });

    if (!dbUser || !dbUser.stripeConnectAccountId) {
      return NextResponse.json({
        hasAccount: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
      });
    }

    const account = await getConnectAccount(dbUser.stripeConnectAccountId);

    // If onboarding is complete and the user isn't yet marked as a creator, update them
    if (account.charges_enabled && account.payouts_enabled && !dbUser.isMarketplaceCreator) {
      await db.update(users)
        .set({
          isMarketplaceCreator: true,
          stripeConnectOnboarded: true,
          creatorActivatedAt: new Date(),
        })
        .where(eq(users.id, dbUser.id));
    }

    return NextResponse.json({
      hasAccount: true,
      accountId: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    });
  } catch (error) {
    console.error("[Stripe Connect Status] Error:", error);
    return NextResponse.json({ error: "Failed to check Connect status" }, { status: 500 });
  }
}
