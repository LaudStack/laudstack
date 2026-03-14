import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users, reviews, tools, savedTools } from "@/drizzle/schema";
import { eq, sql, count } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * GET /api/profile/[id]
 * Returns public profile data for a user. No private details (email, etc).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Fetch user (limited fields)
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        firstName: users.firstName,
        lastName: users.lastName,
        avatarUrl: users.avatarUrl,
        bio: users.bio,
        headline: users.headline,
        website: users.website,
        twitterHandle: users.twitterHandle,
        founderStatus: users.founderStatus,
        createdAt: users.createdAt,
        role: users.role,
        jobTitle: users.jobTitle,
        company: users.company,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Count reviews
    const [reviewStats] = await db
      .select({
        count: count(),
        avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
      })
      .from(reviews)
      .where(eq(reviews.userId, userId));

    // Count saved products
    const [savedStats] = await db
      .select({ count: count() })
      .from(savedTools)
      .where(eq(savedTools.userId, userId));

    // Get recent reviews with tool info (limited to 5)
    const recentReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        title: reviews.title,
        body: reviews.body,
        createdAt: reviews.createdAt,
        toolId: reviews.toolId,
        toolName: tools.name,
        toolSlug: tools.slug,
        toolLogo: tools.logoUrl,
      })
      .from(reviews)
      .leftJoin(tools, eq(reviews.toolId, tools.id))
      .where(eq(reviews.userId, userId))
      .orderBy(sql`${reviews.createdAt} DESC`)
      .limit(5);

    // Fetch founder's tools (if they are a verified founder)
    let founderTools: any[] = [];
    if (user.founderStatus === "verified") {
      founderTools = await db
        .select({
          id: tools.id,
          name: tools.name,
          slug: tools.slug,
          tagline: tools.tagline,
          logoUrl: tools.logoUrl,
          screenshotUrl: tools.screenshotUrl,
          averageRating: tools.averageRating,
          reviewCount: tools.reviewCount,
          upvoteCount: tools.upvoteCount,
          category: tools.category,
          isVerified: tools.isVerified,
        })
        .from(tools)
        .where(eq(tools.submittedBy, userId))
        .orderBy(sql`${tools.createdAt} DESC`)
        .limit(10);
    }

    // Build display name — prefer firstName + lastName over legacy name field
    const displayName =
      (user.firstName ? [user.firstName, user.lastName].filter(Boolean).join(" ") : null) ||
      user.name ||
      "Anonymous User";

    // Compute badges
    const reviewCount = reviewStats?.count ?? 0;
    const avgRating = Number(reviewStats?.avgRating ?? 0);
    const savedCount = savedStats?.count ?? 0;
    const badges: { id: string; label: string; icon: string; color: string }[] =
      [];

    if (reviewCount >= 1)
      badges.push({
        id: "first_review",
        label: "First Review",
        icon: "star",
        color: "amber",
      });
    if (reviewCount >= 5)
      badges.push({
        id: "reviewer",
        label: "Active Reviewer",
        icon: "star",
        color: "blue",
      });
    if (reviewCount >= 25)
      badges.push({
        id: "top_reviewer",
        label: "Top Reviewer",
        icon: "award",
        color: "purple",
      });
    if (savedCount >= 10)
      badges.push({
        id: "curator",
        label: "Tool Curator",
        icon: "bookmark",
        color: "green",
      });
    if (user.founderStatus === "verified")
      badges.push({
        id: "founder",
        label: "Verified Founder",
        icon: "rocket",
        color: "amber",
      });
    if (avgRating >= 4.5 && reviewCount >= 3)
      badges.push({
        id: "quality",
        label: "Quality Reviewer",
        icon: "check",
        color: "emerald",
      });
    // Early adopter: joined before 2026-06-01
    if (
      user.createdAt &&
      new Date(user.createdAt) < new Date("2026-06-01")
    ) {
      badges.push({
        id: "early_adopter",
        label: "Early Adopter",
        icon: "zap",
        color: "orange",
      });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        headline: user.headline,
        website: user.website,
        twitterHandle: user.twitterHandle,
        founderStatus: user.founderStatus,
        role: user.role,
        memberSince: user.createdAt,
        jobTitle: user.jobTitle,
        company: user.company,
      },
      stats: {
        reviewCount,
        avgRating,
        savedToolsCount: savedCount,
      },
      badges,
      founderTools,
      recentReviews,
    });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 }
    );
  }
}
