import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { promotions, tools } from "@/drizzle/schema";
import { eq, and, sql, desc, inArray } from "drizzle-orm";
import { dbToolToFrontend } from "@/lib/adapters";

/**
 * GET /api/featured-stacks
 *
 * Returns featured stacks from two sources:
 * 1. Active `stack_featured` promotions (paid or admin-granted)
 * 2. Tools with `isFeatured = true` (admin toggle)
 *
 * Implements time-based rotation for fair visibility when many stacks are featured.
 * Tracks impressions for fairness weighting.
 *
 * Query params:
 *   ?limit=5       — max stacks to return (default 5 for homepage, 3 for sidebar)
 *   ?context=home   — "home" | "sidebar" (affects limit default)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const context = searchParams.get("context") ?? "home";
    const defaultLimit = context === "sidebar" ? 3 : 5;
    const limit = Math.min(
      parseInt(searchParams.get("limit") ?? String(defaultLimit), 10),
      20
    );

    // ── 1. Get all active featured promotions ──
    const activePromos = await db
      .select({
        promoId: promotions.id,
        toolId: promotions.targetEntityId,
        isManual: promotions.isManual,
        impressionCount: promotions.impressionCount,
        startsAt: promotions.startsAt,
      })
      .from(promotions)
      .where(
        and(
          eq(promotions.target, "stack"),
          eq(promotions.type, "stack_featured"),
          eq(promotions.status, "active"),
          eq(promotions.isPaused, false)
        )
      );

    // ── 2. Get tools with isFeatured = true (admin direct toggle) ──
    const adminFeaturedTools = await db
      .select({ id: tools.id })
      .from(tools)
      .where(
        and(
          eq(tools.isFeatured, true),
          eq(tools.isVisible, true),
          inArray(tools.status, ["approved", "featured"])
        )
      );

    // ── 3. Merge unique tool IDs ──
    // Track which are sponsored (paid promotions, not manual)
    const toolPromoMap = new Map<
      number,
      { promoId: number | null; isSponsored: boolean; impressionCount: number }
    >();

    for (const promo of activePromos) {
      const existing = toolPromoMap.get(promo.toolId);
      toolPromoMap.set(promo.toolId, {
        promoId: promo.promoId,
        isSponsored: !promo.isManual || (existing?.isSponsored ?? false),
        impressionCount: promo.impressionCount,
      });
    }

    // Admin-featured tools that don't have an active promotion
    for (const t of adminFeaturedTools) {
      if (!toolPromoMap.has(t.id)) {
        toolPromoMap.set(t.id, {
          promoId: null,
          isSponsored: false,
          impressionCount: 0,
        });
      }
    }

    const featuredToolIds = Array.from(toolPromoMap.keys());

    if (featuredToolIds.length === 0) {
      // ── Fallback: return top-rated stacks ──
      const fallback = await db
        .select()
        .from(tools)
        .where(
          and(
            eq(tools.isVisible, true),
            inArray(tools.status, ["approved", "featured"]),
            sql`${tools.reviewCount} > 0`
          )
        )
        .orderBy(desc(tools.rankScore))
        .limit(limit);

      return NextResponse.json({
        stacks: fallback.map((t) => ({
          ...dbToolToFrontend(t),
          isSponsored: false,
        })),
        source: "fallback",
        totalFeatured: 0,
      });
    }

    // ── 4. Fetch full tool data ──
    const featuredTools = await db
      .select()
      .from(tools)
      .where(
        and(
          inArray(tools.id, featuredToolIds),
          eq(tools.isVisible, true),
          inArray(tools.status, ["approved", "featured"])
        )
      );

    // ── 5. Apply rotation algorithm ──
    // Deterministic time-based shuffle: changes every hour
    // Uses impression count as secondary weight (fewer impressions = higher priority)
    const now = new Date();
    const hourSlot = Math.floor(now.getTime() / (1000 * 60 * 60)); // changes every hour

    const rotated = featuredTools
      .map((t) => {
        const meta = toolPromoMap.get(t.id)!;
        // Seeded hash: combine hourSlot with tool ID for deterministic shuffle
        const hash = seededHash(hourSlot, t.id);
        // Weight: lower impressions get a boost (normalized)
        const maxImpressions = Math.max(
          ...Array.from(toolPromoMap.values()).map((m) => m.impressionCount),
          1
        );
        const impressionWeight =
          1 - meta.impressionCount / (maxImpressions + 1);
        // Final score: hash provides rotation, impression weight provides fairness
        const score = hash * 0.7 + impressionWeight * 0.3;

        return {
          tool: t,
          isSponsored: meta.isSponsored,
          promoId: meta.promoId,
          score,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // ── 6. Increment impression counts (fire-and-forget) ──
    const promoIdsToIncrement = rotated
      .map((r) => r.promoId)
      .filter((id): id is number => id !== null);

    if (promoIdsToIncrement.length > 0) {
      // Batch increment — non-blocking
      db.update(promotions)
        .set({
          impressionCount: sql`${promotions.impressionCount} + 1`,
        })
        .where(inArray(promotions.id, promoIdsToIncrement))
        .then(() => {})
        .catch((err) =>
          console.error("[featured-stacks] impression increment error:", err)
        );
    }

    // ── 7. Build response ──
    const stacks = rotated.map((r) => ({
      ...dbToolToFrontend(r.tool),
      isSponsored: r.isSponsored,
    }));

    // ── 8. Backfill if not enough featured stacks ──
    if (stacks.length < limit) {
      const existingIds = stacks.map((s) => parseInt(s.id, 10));
      const backfillCount = limit - stacks.length;

      const backfill = await db
        .select()
        .from(tools)
        .where(
          and(
            eq(tools.isVisible, true),
            inArray(tools.status, ["approved", "featured"]),
            sql`${tools.id} NOT IN (${sql.join(
              existingIds.map((id) => sql`${id}`),
              sql`, `
            )})`
          )
        )
        .orderBy(desc(tools.rankScore))
        .limit(backfillCount);

      for (const t of backfill) {
        stacks.push({
          ...dbToolToFrontend(t),
          isSponsored: false,
        });
      }
    }

    return NextResponse.json({
      stacks,
      source: "promotions",
      totalFeatured: featuredToolIds.length,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error("[featured-stacks] Error:", error);
    return NextResponse.json(
      { stacks: [], source: "error", totalFeatured: 0 },
      { status: 500 }
    );
  }
}

/**
 * Deterministic hash function for rotation.
 * Returns a value between 0 and 1 based on the seed and tool ID.
 * Same inputs always produce the same output (consistent within time window).
 */
function seededHash(seed: number, toolId: number): number {
  let h = seed ^ (toolId * 2654435761);
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  h = (h ^= h >>> 16) >>> 0;
  return h / 4294967295; // normalize to 0-1
}
