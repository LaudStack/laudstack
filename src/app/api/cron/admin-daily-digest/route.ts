import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users, tools, reviews, toolSubmissions, toolClaims } from "@/drizzle/schema";
import { count, eq, sql, and, gte, avg } from "drizzle-orm";
import { sendAdminDailyDigest } from "@/server/email";

/**
 * GET /api/cron/admin-daily-digest
 *
 * Called by Vercel Cron daily at 08:00 UTC.
 * Gathers platform metrics and sends a digest email to all admins.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      totalUsersResult,
      totalToolsResult,
      totalReviewsResult,
      newUsersTodayResult,
      newToolsTodayResult,
      newReviewsTodayResult,
      pendingSubmissionsResult,
      pendingClaimsResult,
      flaggedReviewsResult,
      avgRatingResult,
    ] = await Promise.all([
      // Total counts
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(tools).where(eq(tools.status, "approved")),
      db.select({ count: count() }).from(reviews),
      // Today's new items (last 24 hours)
      db.select({ count: count() }).from(users).where(gte(users.createdAt, oneDayAgo)),
      db.select({ count: count() }).from(tools).where(gte(tools.createdAt, oneDayAgo)),
      db.select({ count: count() }).from(reviews).where(gte(reviews.createdAt, oneDayAgo)),
      // Pending action items
      db.select({ count: count() }).from(toolSubmissions).where(eq(toolSubmissions.status, "pending")),
      db.select({ count: count() }).from(toolClaims).where(eq(toolClaims.status, "pending")),
      db.select({ count: count() }).from(reviews).where(eq(reviews.status, "pending")),
      // Average rating
      db.select({ avg: sql<number>`COALESCE(AVG(${reviews.rating}), 0)` }).from(reviews),
    ]);

    const digestData = {
      totalUsers: totalUsersResult[0].count,
      totalTools: totalToolsResult[0].count,
      totalReviews: totalReviewsResult[0].count,
      newUsersToday: newUsersTodayResult[0].count,
      newToolsToday: newToolsTodayResult[0].count,
      newReviewsToday: newReviewsTodayResult[0].count,
      pendingSubmissions: pendingSubmissionsResult[0].count,
      pendingClaims: pendingClaimsResult[0].count,
      flaggedReviews: flaggedReviewsResult[0].count,
      avgRating: Number(avgRatingResult[0].avg).toFixed(1),
    };

    const sent = await sendAdminDailyDigest(digestData);

    console.log("[Cron] Admin daily digest:", {
      sent,
      ...digestData,
    });

    return NextResponse.json({
      success: true,
      sent,
      ...digestData,
    });
  } catch (error) {
    console.error("[Cron] Admin daily digest error:", error);
    return NextResponse.json(
      { error: "Internal error during admin daily digest" },
      { status: 500 },
    );
  }
}
