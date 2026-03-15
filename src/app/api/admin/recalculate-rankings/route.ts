import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { tools, reviews, upvotes, savedTools, toolViews, outboundClicks } from "@/drizzle/schema";
import { eq, sql, and, gte, count, avg } from "drizzle-orm";
import { indexTool } from "@/server/search";
import { computeRankScore } from "@/lib/ranking";

/**
 * LaudStack Ranking Algorithm
 *
 * Weighted composite score:
 *   rankScore = (avgRating * 25)
 *             + (reviewCount * 15)
 *             + (upvoteCount * 10)
 *             + (saveCount * 8)
 *             + (viewCount * 0.1)
 *             + (outboundClickCount * 5)
 *             + (recencyBoost)
 *             + (weeklyMomentum * 20)
 *
 * Recency boost: tools launched in last 30 days get +50, last 90 days get +25
 * Weekly momentum: change in upvotes + published reviews in last 7 days vs prior 7 days
 * weeklyRankChange: actual rank position delta (prevRank - newRank), positive = moved up
 * Review filter: status = 'published' is the moderation gate.
 *   isVerified on reviews means the reviewer's email is verified, not that the review passed moderation.
 */

export async function POST(request: Request) {
  // ── Auth guard ────────────────────────────────────────────────────────────
  const authHeader =
    request.headers.get("x-admin-key") ?? request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const isValid =
      authHeader === cronSecret || authHeader === `Bearer ${cronSecret}`;
    if (!isValid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
   }

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Get all approved, visible tools
    const allTools = await db
      .select()
      .from(tools)
      .where(and(eq(tools.status, "approved"), eq(tools.isVisible, true)));

    // Snapshot previous rank positions before we overwrite scores
    const previousRanks = new Map<number, number>();
    [...allTools]
      .sort((a, b) => (b.rankScore ?? 0) - (a.rankScore ?? 0))
      .forEach((t, i) => previousRanks.set(t.id, i + 1));

    // Accumulate new scores so we can compute position deltas after the loop
    const newScores = new Map<number, number>();

    for (const tool of allTools) {
      // Published reviews only — status = 'published' is the moderation gate
      const [reviewStats] = await db
        .select({
          count: count(),
          avgRating: avg(reviews.rating),
        })
        .from(reviews)
        .where(and(eq(reviews.toolId, tool.id), eq(reviews.status, "published")));

      const reviewCount = reviewStats?.count ?? 0;
      const avgRating = parseFloat(String(reviewStats?.avgRating ?? 0));

      // Count upvotes
      const [upvoteStats] = await db
        .select({ count: count() })
        .from(upvotes)
        .where(eq(upvotes.toolId, tool.id));
      const upvoteCount = upvoteStats?.count ?? 0;

      // Count saves
      const [saveStats] = await db
        .select({ count: count() })
        .from(savedTools)
        .where(eq(savedTools.toolId, tool.id));
      const saveCount = saveStats?.count ?? 0;

      // Count views (last 30 days)
      const [viewStats] = await db
        .select({ count: count() })
        .from(toolViews)
        .where(and(eq(toolViews.toolId, tool.id), gte(toolViews.createdAt, thirtyDaysAgo)));
      const viewCount = viewStats?.count ?? 0;

      // Count outbound clicks (last 30 days)
      const [clickStats] = await db
        .select({ count: count() })
        .from(outboundClicks)
        .where(and(eq(outboundClicks.toolId, tool.id), gte(outboundClicks.createdAt, thirtyDaysAgo)));
      const clickCount = clickStats?.count ?? 0;

      // Weekly momentum: upvotes this week vs last week
      const [thisWeekUpvotes] = await db
        .select({ count: count() })
        .from(upvotes)
        .where(and(eq(upvotes.toolId, tool.id), gte(upvotes.createdAt, sevenDaysAgo)));

      const [lastWeekUpvotes] = await db
        .select({ count: count() })
        .from(upvotes)
        .where(
          and(
            eq(upvotes.toolId, tool.id),
            gte(upvotes.createdAt, fourteenDaysAgo),
            sql`${upvotes.createdAt} < ${sevenDaysAgo}`
          )
        );

      // Weekly momentum: published reviews this week vs last week
      const [thisWeekReviews] = await db
        .select({ count: count() })
        .from(reviews)
        .where(
          and(
            eq(reviews.toolId, tool.id),
            eq(reviews.status, "published"),
            gte(reviews.createdAt, sevenDaysAgo),
          ),
        );

      const [lastWeekReviews] = await db
        .select({ count: count() })
        .from(reviews)
        .where(
          and(
            eq(reviews.toolId, tool.id),
            eq(reviews.status, "published"),
            gte(reviews.createdAt, fourteenDaysAgo),
            sql`${reviews.createdAt} < ${sevenDaysAgo}`,
          ),
        );

      const weeklyMomentum =
        ((thisWeekUpvotes?.count ?? 0) - (lastWeekUpvotes?.count ?? 0)) +
        ((thisWeekReviews?.count ?? 0) - (lastWeekReviews?.count ?? 0));

      // Recency boost
      const launchedAt = tool.launchedAt ? new Date(tool.launchedAt) : null;
      let recencyBoost = 0;
      if (launchedAt) {
        if (launchedAt >= thirtyDaysAgo) recencyBoost = 50;
        else if (launchedAt >= ninetyDaysAgo) recencyBoost = 25;
      }

      const rawScore = computeRankScore({
        avgRating,
        reviewCount,
        upvoteCount,
        saveCount,
        viewCount,
        clickCount,
        recencyBoost,
        weeklyMomentum,
      });
      const rankScore = Math.round(rawScore * 100) / 100;
      newScores.set(tool.id, rankScore);

      // Write updated stats + score (weeklyRankChange written in second pass below)
      await db
        .update(tools)
        .set({
          rankScore,
          averageRating: Math.round(avgRating * 100) / 100,
          reviewCount,
          upvoteCount,
          saveCount,
          viewCount,
          outboundClickCount: clickCount,
          updatedAt: now,
        })
        .where(eq(tools.id, tool.id));
    }

    // Second pass: compute actual rank position deltas and write weeklyRankChange
    const sortedByNewScore = [...allTools].sort(
      (a, b) => (newScores.get(b.id) ?? 0) - (newScores.get(a.id) ?? 0),
    );
    const newRanks = new Map<number, number>();
    sortedByNewScore.forEach((t, i) => newRanks.set(t.id, i + 1));

    for (const tool of allTools) {
      const prevRank = previousRanks.get(tool.id) ?? 0;
      const newRank = newRanks.get(tool.id) ?? 0;
      // prevRank - newRank: positive = moved up (e.g. was #5, now #3 → +2)
      const weeklyRankChange = prevRank > 0 ? prevRank - newRank : 0;
      await db
        .update(tools)
        .set({ weeklyRankChange, updatedAt: now })
        .where(eq(tools.id, tool.id));

      // Sync updated document to Typesense search index (fire-and-forget)
      const updatedTool = await db.query.tools.findFirst({
        where: eq(tools.id, tool.id),
      });
      if (updatedTool) {
        indexTool(updatedTool).catch((err) =>
          console.error(`[Ranking] Typesense sync failed for tool ${tool.id}:`, err),
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Rankings recalculated for ${allTools.length} tools`,
      updatedCount: allTools.length,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("[Ranking] Recalculation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to recalculate rankings" },
      { status: 500 },
    );
  }
}
