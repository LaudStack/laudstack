import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { tools, reviews, upvotes, savedTools, toolViews, outboundClicks } from "@/drizzle/schema";
import { eq, sql, and, gte, count, avg } from "drizzle-orm";

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
 * Weekly momentum: change in upvotes + reviews in last 7 days vs prior 7 days
 */

export async function POST(request: Request) {
  try {
    // Simple admin auth check via header
    const authHeader = request.headers.get("x-admin-key");
    const cronSecret = process.env.CRON_SECRET;
    // Allow if admin key matches or if called from cron
    if (cronSecret && authHeader !== cronSecret) {
      // Also allow if called from admin UI (check cookie-based auth in production)
      // For now, allow all POST requests to this endpoint
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Get all approved tools
    const allTools = await db.select().from(tools).where(eq(tools.status, "approved"));

    let updatedCount = 0;

    for (const tool of allTools) {
      // Count reviews
      const [reviewStats] = await db
        .select({
          count: count(),
          avgRating: avg(reviews.rating),
        })
        .from(reviews)
        .where(and(eq(reviews.toolId, tool.id), eq(reviews.isVerified, true)));

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

      const [thisWeekReviews] = await db
        .select({ count: count() })
        .from(reviews)
        .where(
          and(
            eq(reviews.toolId, tool.id),
            eq(reviews.isVerified, true),
            gte(reviews.createdAt, sevenDaysAgo)
          )
        );

      const [lastWeekReviews] = await db
        .select({ count: count() })
        .from(reviews)
        .where(
          and(
            eq(reviews.toolId, tool.id),
            eq(reviews.isVerified, true),
            gte(reviews.createdAt, fourteenDaysAgo),
            sql`${reviews.createdAt} < ${sevenDaysAgo}`
          )
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

      // Compute rank score
      const rankScore =
        (avgRating * 25) +
        (reviewCount * 15) +
        (upvoteCount * 10) +
        (saveCount * 8) +
        (viewCount * 0.1) +
        (clickCount * 5) +
        recencyBoost +
        (weeklyMomentum * 20);

      // Determine weekly rank change (difference from previous score)
      const previousScore = tool.rankScore ?? 0;
      const weeklyRankChange = Math.round(rankScore - previousScore);

      // Update tool
      await db
        .update(tools)
        .set({
          rankScore: Math.round(rankScore * 100) / 100,
          weeklyRankChange,
          upvoteCount,
          reviewCount,
          averageRating: Math.round(avgRating * 100) / 100,
          saveCount,
          viewCount,
          outboundClickCount: clickCount,
          updatedAt: now,
        })
        .where(eq(tools.id, tool.id));

      updatedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Rankings recalculated for ${updatedCount} tools`,
      updatedCount,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Ranking recalculation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to recalculate rankings" },
      { status: 500 }
    );
  }
}
