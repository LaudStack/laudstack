// Force dynamic rendering — prevents static analysis at build time
export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { createCreatorOnboardingCheckoutSession } from "@/server/stripe";

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

    // Check if already a creator
    if (dbUser.isMarketplaceCreator) {
      return NextResponse.json({ error: "Already a marketplace creator" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "https://www.laudstack.com";

    const session = await createCreatorOnboardingCheckoutSession({
      userId: dbUser.id,
      userEmail: dbUser.email || supabaseUser.email || "",
      successUrl: `${origin}/marketplace/creator/onboarding?step=stripe-connect&payment=success`,
      cancelUrl: `${origin}/marketplace/creator/onboarding?payment=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[Stripe Marketplace Onboarding] Error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
