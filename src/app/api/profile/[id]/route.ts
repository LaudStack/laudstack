import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users, reviews, tools, savedTools, userFollows } from "@/drizzle/schema";
import { eq, sql, count, and, ne, or } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * GET /api/profile/[id]
 * Returns public profile data for a user.
 * Respects `publicProfile` and `showReviewsPublicly` privacy settings.
 * No private details (email, etc.) are ever returned.
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

    // Fetch user (limited fields, including privacy flags)
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
        linkedinUrl: users.linkedinUrl,
        founderStatus: users.founderStatus,
        createdAt: users.createdAt,
        role: users.role,
        jobTitle: users.jobTitle,
        company: users.company,
        city: users.city,
        state: users.state,
        country: users.country,
        emailVerified: users.emailVerified,
        publicProfile: users.publicProfile,
        showReviewsPublicly: users.showReviewsPublicly,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ── Privacy gate: private profiles return only a minimal stub ──────────
    if (!user.publicProfile) {
      return NextResponse.json({
        user: {
          id: user.id,
          name: "Private User",
          avatarUrl: null,
          bio: null,
          headline: null,
          website: null,
          twitterHandle: null,
          linkedinUrl: null,
          founderStatus: user.founderStatus,
          role: user.role,
          memberSince: user.createdAt,
          jobTitle: null,
          company: null,
          city: null,
          state: null,
          country: null,
        isPrivate: true,
      },
      stats: { reviewCount: 0, avgRating: 0, savedToolsCount: 0, followers: 0, following: 0 },
      badges: [],
      founderTools: [],
      recentReviews: [],
    });
  }

  // Fetch follow counts
  const [followerResult, followingResult] = await Promise.all([
    db.select({ count: count() })
      .from(userFollows)
      .where(eq(userFollows.followingId, userId)),
    db.select({ count: count() })
      .from(userFollows)
      .where(eq(userFollows.followerId, userId)),
  ]);
  const followersCount = followerResult[0]?.count ?? 0;
  const followingCount = followingResult[0]?.count ?? 0;

  // Count published reviews only (hidden/removed reviews should not appear publicly)
    const [reviewStats] = await db
      .select({
        count: count(),
        avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
      })
      .from(reviews)
      .where(and(eq(reviews.userId, userId), ne(reviews.status, "removed"), ne(reviews.status, "hidden")));

    // Count saved products
    const [savedStats] = await db
      .select({ count: count() })
      .from(savedTools)
      .where(eq(savedTools.userId, userId));

    // ── Reviews: only shown when showReviewsPublicly is true ───────────────
    let recentReviews: any[] = [];
    if (user.showReviewsPublicly) {
      recentReviews = await db
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
        .where(and(eq(reviews.userId, userId), ne(reviews.status, "removed"), ne(reviews.status, "hidden")))
        .orderBy(sql`${reviews.createdAt} DESC`)
        .limit(5);
    }

    // ── Founder tools: include both submittedBy AND claimedBy ──────────────
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
        .where(or(eq(tools.submittedBy, userId), eq(tools.claimedBy, userId)))
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
    const badges: { id: string; label: string; icon: string; color: string }[] = [];

    if (reviewCount >= 1)
      badges.push({ id: "first_review", label: "First Review", icon: "star", color: "amber" });
    if (reviewCount >= 5)
      badges.push({ id: "reviewer", label: "Active Reviewer", icon: "star", color: "blue" });
    if (reviewCount >= 25)
      badges.push({ id: "top_reviewer", label: "Top Reviewer", icon: "award", color: "purple" });
    if (savedCount >= 10)
      badges.push({ id: "curator", label: "Tool Curator", icon: "bookmark", color: "green" });
    if (user.founderStatus === "verified")
      badges.push({ id: "founder", label: "Verified Founder", icon: "rocket", color: "amber" });
    if (avgRating >= 4.5 && reviewCount >= 3)
      badges.push({ id: "quality", label: "Quality Reviewer", icon: "check", color: "emerald" });
    // Early adopter: joined before 2026-06-01
    if (user.createdAt && new Date(user.createdAt) < new Date("2026-06-01")) {
      badges.push({ id: "early_adopter", label: "Early Adopter", icon: "zap", color: "orange" });
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
        linkedinUrl: user.linkedinUrl,
        founderStatus: user.founderStatus,
        role: user.role,
        memberSince: user.createdAt,
        jobTitle: user.jobTitle,
        company: user.company,
        city: user.city,
        state: user.state,
        country: user.country,
        emailVerified: user.emailVerified,
        isPrivate: false,
      },
      stats: {
        reviewCount,
        avgRating,
        savedToolsCount: savedCount,
        followers: followersCount,
        following: followingCount,
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
