// Force dynamic rendering — prevents static analysis at build time
export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db";
import { tools, users } from "@/drizzle/schema";
import { eq, or } from "drizzle-orm";
import { isRoleAtLeast } from "@/lib/permissions";
import {
  createFeaturedCheckoutSession,
  FEATURED_PLANS,
  type FeaturedPlan,
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

    const body = await req.json();
    const { toolId, plan } = body as { toolId: number; plan: string };

    // Validate plan
    if (!plan || !(plan in FEATURED_PLANS)) {
      return NextResponse.json(
        { error: "Invalid featured plan" },
        { status: 400 }
      );
    }

    // Verify tool exists and belongs to this user (submitted or claimed)
    const tool = await db.query.tools.findFirst({
      where: eq(tools.id, toolId),
    });

    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    // Only the tool owner (submitter or claimer) or an admin can purchase
    const isOwner = tool.submittedBy === dbUser.id || tool.claimedBy === dbUser.id;
    const isAdminUser = isRoleAtLeast(dbUser.role, "admin");

    if (!isOwner && !isAdminUser) {
      return NextResponse.json(
        { error: "You can only upgrade your own tools" },
        { status: 403 }
      );
    }

    // Tool must be approved to purchase featured placement
    if (tool.status !== "approved" && tool.status !== "featured") {
      return NextResponse.json(
        { error: "Tool must be approved before purchasing featured placement" },
        { status: 400 }
      );
    }

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "https://www.laudstack.com";

    const session = await createFeaturedCheckoutSession({
      toolId: tool.id,
      toolName: tool.name,
      toolSlug: tool.slug,
      plan: plan as FeaturedPlan,
      userId: dbUser.id,
      userEmail: dbUser.email || supabaseUser.email || "",
      successUrl: `${origin}/dashboard/founder?tab=promote&payment=success`,
      cancelUrl: `${origin}/dashboard/founder?tab=promote&payment=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[Stripe Featured Placement] Error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
