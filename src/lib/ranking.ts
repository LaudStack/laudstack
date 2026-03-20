/**
 * LaudStack Ranking Utilities
 *
 * Single source of truth for the ranking score formula and the lightweight
 * inline recalculation helper used after review / laud mutations.
 *
 * The full batch recalculation (with all signals including views, clicks,
 * weekly momentum) lives in /api/admin/recalculate-rankings and runs daily.
 * The inline helper here is a fast approximation that keeps scores fresh
 * between cron runs by updating the most volatile signals immediately.
 */

import { db } from "@/server/db";
import { tools, reviews, upvotes, savedTools } from "@/drizzle/schema";
import { eq, and, count, avg, sql } from "drizzle-orm";

/**
 * Compute the composite rank score.
 * viewCount and clickCount are passed as the stored counters (not recounted from DB)
 * to keep the inline helper fast.
 */
export function computeRankScore({
  avgRating,
  reviewCount,
  upvoteCount,
  saveCount,
  viewCount,
  clickCount,
  recencyBoost,
  weeklyMomentum,
}: {
  avgRating: number;
  reviewCount: number;
  upvoteCount: number;
  saveCount: number;
  viewCount: number;
  clickCount: number;
  recencyBoost: number;
  weeklyMomentum: number;
}): number {
  return (
    avgRating * 25 +
    reviewCount * 15 +
    upvoteCount * 10 +
    saveCount * 8 +
    viewCount * 0.1 +
    clickCount * 5 +
    recencyBoost +
    weeklyMomentum * 20
  );
}

/**
 * Inline recalculation of a single tool's averageRating, reviewCount,
 * upvoteCount, saveCount, and rankScore.
 *
 * Called immediately after:
 *  - A review is submitted / approved / rejected / deleted
 *  - A laud is toggled
 *  - A tool is approved (initial score)
 *
 * Does NOT update viewCount, outboundClickCount, or weeklyMomentum —
 * those are refreshed by the daily cron.
 */
export async function recalcAndPersistToolScore(toolId: number): Promise<void> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  // Fetch current stored counters we won't recount (views, clicks, weeklyMomentum)
  const current = await db.query.tools.findFirst({
    where: eq(tools.id, toolId),
    columns: {
      viewCount: true,
      outboundClickCount: true,
      weeklyRankChange: true,
      launchedAt: true,
    },
  });
  if (!current) return;

  // Recount from source of truth
  const [reviewStats] = await db
    .select({ count: count(), avgRating: avg(reviews.rating) })
    .from(reviews)
    .where(and(eq(reviews.toolId, toolId), eq(reviews.status, "published")));

  const [upvoteStats] = await db
    .select({ count: count() })
    .from(upvotes)
    .where(eq(upvotes.toolId, toolId));

  const [saveStats] = await db
    .select({ count: count() })
    .from(savedTools)
    .where(eq(savedTools.toolId, toolId));

  const reviewCount = reviewStats?.count ?? 0;
  const avgRating = parseFloat(String(reviewStats?.avgRating ?? 0));
  const upvoteCount = upvoteStats?.count ?? 0;
  const saveCount = saveStats?.count ?? 0;

  // Recency boost (same thresholds as the full cron)
  const launchedAt = current.launchedAt ? new Date(current.launchedAt) : null;
  let recencyBoost = 0;
  if (launchedAt) {
    if (launchedAt >= thirtyDaysAgo) recencyBoost = 50;
    else if (launchedAt >= ninetyDaysAgo) recencyBoost = 25;
  }

  const rankScore = Math.round(
    computeRankScore({
      avgRating,
      reviewCount,
      upvoteCount,
      saveCount,
      viewCount: current.viewCount ?? 0,
      clickCount: current.outboundClickCount ?? 0,
      recencyBoost,
      // weeklyMomentum is not recomputed inline — keep the last cron value
      weeklyMomentum: 0,
    }) * 100,
  ) / 100;

  await db
    .update(tools)
    .set({
      averageRating: Math.round(avgRating * 100) / 100,
      reviewCount,
      upvoteCount,
      saveCount,
      rankScore,
      updatedAt: now,
    })
    .where(eq(tools.id, toolId));
}
