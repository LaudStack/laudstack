import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { tools, toolUpgrades, deals } from "@/drizzle/schema";
import { eq, and, lt, ne, isNotNull } from "drizzle-orm";
import { processPromotionLifecycle } from "@/app/actions/promotions";

export const runtime = "nodejs";

/**
 * GET /api/cron/expire-placements
 *
 * Called by Vercel Cron daily at 04:00 UTC.
 * Expires featured tool placements and deal placements whose expiry has passed.
 *
 * 1. Finds all active tool_upgrades where expires_at < now and status = 'active'
 *    → Sets status to 'expired', un-features the tool (if no other active upgrade exists)
 * 2. Finds all deals where placement_expires_at < now and placement != 'none'
 *    → Resets placement to 'none'
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[Cron] CRON_SECRET is not set — refusing to run");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  let expiredToolUpgrades = 0;
  let unfeaturedTools = 0;
  let expiredDealPlacements = 0;

  try {
    // ── 1. Expire tool featured placements ──
    // Find all active upgrades that have expired
    const expiredUpgrades = await db
      .select({ id: toolUpgrades.id, toolId: toolUpgrades.toolId })
      .from(toolUpgrades)
      .where(
        and(
          eq(toolUpgrades.status, "active"),
          isNotNull(toolUpgrades.expiresAt),
          lt(toolUpgrades.expiresAt, now)
        )
      );

    for (const upgrade of expiredUpgrades) {
      // Mark upgrade as expired
      await db
        .update(toolUpgrades)
        .set({ status: "expired", updatedAt: now })
        .where(eq(toolUpgrades.id, upgrade.id));
      expiredToolUpgrades++;

      // Check if tool has any other active upgrades
      const otherActive = await db
        .select({ id: toolUpgrades.id })
        .from(toolUpgrades)
        .where(
          and(
            eq(toolUpgrades.toolId, upgrade.toolId),
            eq(toolUpgrades.status, "active"),
            ne(toolUpgrades.id, upgrade.id)
          )
        )
        .limit(1);

      // If no other active upgrades, un-feature the tool
      if (otherActive.length === 0) {
        await db
          .update(tools)
          .set({ isFeatured: false, updatedAt: now })
          .where(eq(tools.id, upgrade.toolId));
        unfeaturedTools++;
      }
    }

    // ── 2. Expire deal placements ──
    const expiredDeals = await db
      .select({ id: deals.id })
      .from(deals)
      .where(
        and(
          ne(deals.placement, "none"),
          isNotNull(deals.placementExpiresAt),
          lt(deals.placementExpiresAt, now)
        )
      );

    for (const deal of expiredDeals) {
      await db
        .update(deals)
        .set({
          placement: "none",
          updatedAt: now,
        })
        .where(eq(deals.id, deal.id));
      expiredDealPlacements++;
    }

    // ── 3. Process unified promotions table (new system) ──
    let promoResult = { expired: 0, activated: 0, timestamp: "" };
    try {
      promoResult = await processPromotionLifecycle();
    } catch (promoErr) {
      console.error("[Cron] promotions lifecycle error:", promoErr);
    }

    const summary = {
      success: true,
      timestamp: now.toISOString(),
      expiredToolUpgrades,
      unfeaturedTools,
      expiredDealPlacements,
      promotionsExpired: promoResult.expired,
      promotionsActivated: promoResult.activated,
    };

    console.info("[Cron] expire-placements:", JSON.stringify(summary));
    return NextResponse.json(summary);
  } catch (error) {
    console.error("[Cron] expire-placements error:", error);
    return NextResponse.json(
      { error: "Failed to expire placements" },
      { status: 500 }
    );
  }
}
