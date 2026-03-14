import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { tools, reviews, users } from "@/drizzle/schema";
import { eq, desc, and, sql, count } from "drizzle-orm";
import { dbToolsToFrontend, dbToolToLeaderboard } from "@/lib/adapters";

export async function GET() {
  try {
    const [
      allApprovedTools,
      totalReviewCount,
      totalUserCount,
    ] = await Promise.all([
      db.select().from(tools).where(eq(tools.status, "approved")).orderBy(desc(tools.rankScore)),
      db.select({ count: count() }).from(reviews).where(eq(reviews.status, "published")),
      db.select({ count: count() }).from(users),
    ]);

    const frontendTools = dbToolsToFrontend(allApprovedTools);

    // Build leaderboard from top tools by average rating
    const leaderboard = allApprovedTools
      .filter(t => t.reviewCount > 0)
      .sort((a, b) => b.averageRating - a.averageRating || b.reviewCount - a.reviewCount)
      .slice(0, 10)
      .map((t, i) => dbToolToLeaderboard(t, i + 1));

    // Build recent reviews
    const recentReviews = await db
      .select({
        id: reviews.id,
        toolId: reviews.toolId,
        userId: reviews.userId,
        rating: reviews.rating,
        title: reviews.title,
        body: reviews.body,
        pros: reviews.pros,
        cons: reviews.cons,
        isVerified: reviews.isVerified,
        helpfulCount: reviews.helpfulCount,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
        userName: users.name,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userAvatar: users.avatarUrl,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.status, "published"))
      .orderBy(desc(reviews.createdAt))
      .limit(5);

    const frontendReviews = recentReviews.map(r => ({
      id: String(r.id),
      tool_id: String(r.toolId),
      user_id: String(r.userId),
      rating: r.rating,
      title: r.title ?? "",
      body: r.body ?? "",
      pros: r.pros ?? undefined,
      cons: r.cons ?? undefined,
      is_verified_purchase: r.isVerified,
      helpful_count: r.helpfulCount,
      created_at: r.createdAt.toISOString(),
      user: {
        id: String(r.userId),
        name: (r.userFirstName ? [r.userFirstName, r.userLastName].filter(Boolean).join(' ') : null) ?? r.userName ?? "Anonymous",
        avatar_url: r.userAvatar ?? undefined,
      },
    }));

    return NextResponse.json({
      tools: frontendTools,
      leaderboard,
      reviews: frontendReviews,
      totalReviews: totalReviewCount[0].count,
      totalUsers: totalUserCount[0].count,
    });
  } catch (error) {
    console.error("[homepage API] Error:", error instanceof Error ? error.message : error);
    console.error("[homepage API] Stack:", error instanceof Error ? error.stack : "no stack");
    return NextResponse.json({
      tools: [],
      leaderboard: [],
      reviews: [],
      totalReviews: 0,
      totalUsers: 0,
      _error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
