"use server";

import { db } from "@/server/db";
import { tools, reviews, users, upvotes, savedTools, deals } from "@/drizzle/schema";
import { eq, desc, asc, and, or, ilike, sql, count, avg, ne } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { getUserBySupabaseId } from "@/server/db";

// ─── Homepage Data ───────────────────────────────────────────────────────────

export async function getHomepageData() {
  const [
    featuredTools,
    trendingTools,
    recentLaunches,
    topRatedTools,
    totalToolCount,
    totalReviewCount,
    totalUserCount,
  ] = await Promise.all([
    db.select().from(tools)
      .where(and(eq(tools.status, "approved"), eq(tools.isFeatured, true)))
      .orderBy(desc(tools.rankScore))
      .limit(6),
    db.select().from(tools)
      .where(and(eq(tools.status, "approved"), sql`${tools.weeklyRankChange} > 0`))
      .orderBy(desc(tools.weeklyRankChange))
      .limit(4),
    db.select().from(tools)
      .where(eq(tools.status, "approved"))
      .orderBy(desc(tools.launchedAt))
      .limit(4),
    db.select().from(tools)
      .where(and(eq(tools.status, "approved"), sql`${tools.reviewCount} > 0`))
      .orderBy(desc(tools.averageRating))
      .limit(5),
    db.select({ count: count() }).from(tools).where(eq(tools.status, "approved")),
    db.select({ count: count() }).from(reviews),
    db.select({ count: count() }).from(users),
  ]);

  return {
    featuredTools,
    trendingTools,
    recentLaunches,
    topRatedTools,
    totalTools: totalToolCount[0].count,
    totalReviews: totalReviewCount[0].count,
    totalUsers: totalUserCount[0].count,
  };
}

// ─── Tools Listing ───────────────────────────────────────────────────────────

export async function getToolsListing(opts: {
  category?: string;
  pricingModel?: string;
  sort?: string;
  page?: number;
  limit?: number;
} = {}) {
  const { category, pricingModel, sort = "rank_score", page = 1, limit = 20 } = opts;
  const offset = (page - 1) * limit;

  const conditions = [eq(tools.status, "approved")];
  if (category && category !== "All") conditions.push(eq(tools.category, category));
  if (pricingModel && pricingModel !== "All") {
    conditions.push(eq(tools.pricingModel, pricingModel as "Free" | "Freemium" | "Paid" | "Free Trial" | "Open Source"));
  }

  let orderBy;
  switch (sort) {
    case "newest": orderBy = desc(tools.launchedAt); break;
    case "trending": orderBy = desc(tools.weeklyRankChange); break;
    case "most_reviewed": orderBy = desc(tools.reviewCount); break;
    case "top_rated": orderBy = desc(tools.averageRating); break;
    default: orderBy = desc(tools.rankScore);
  }

  const [rows, total] = await Promise.all([
    db.select().from(tools).where(and(...conditions)).orderBy(orderBy).limit(limit).offset(offset),
    db.select({ count: count() }).from(tools).where(and(...conditions)),
  ]);

  return { tools: rows, total: total[0].count, page, limit };
}

// ─── Tool Detail ─────────────────────────────────────────────────────────────

export async function getToolDetail(slug: string) {
  const tool = await db.query.tools.findFirst({
    where: eq(tools.slug, slug),
  });

  if (!tool) return null;

  // Get reviews with user info
  const toolReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      title: reviews.title,
      body: reviews.body,
      pros: reviews.pros,
      cons: reviews.cons,
      isVerified: reviews.isVerified,
      helpfulCount: reviews.helpfulCount,
      createdAt: reviews.createdAt,
      userName: users.name,
      userFirstName: users.firstName,
      userLastName: users.lastName,
      userAvatar: users.avatarUrl,
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.toolId, tool.id))
    .orderBy(desc(reviews.createdAt))
    .limit(50);

  // Compute display names from firstName/lastName
  const enrichedReviews = toolReviews.map(r => ({
    ...r,
    userName: (r.userFirstName ? [r.userFirstName, r.userLastName].filter(Boolean).join(' ') : null) ?? r.userName ?? 'Anonymous',
  }));

  // Get related products (same category)
  const relatedTools = await db.select().from(tools)
    .where(and(
      eq(tools.status, "approved"),
      eq(tools.category, tool.category),
      ne(tools.id, tool.id)
    ))
    .orderBy(desc(tools.rankScore))
    .limit(4);

  // Rating distribution
  const ratingDist = await db
    .select({
      rating: reviews.rating,
      count: count(),
    })
    .from(reviews)
    .where(eq(reviews.toolId, tool.id))
    .groupBy(reviews.rating);

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingDist.forEach(r => { distribution[r.rating] = r.count; });

  return {
    tool,
    reviews: enrichedReviews,
    relatedTools,
    ratingDistribution: distribution,
  };
}

// ─── Search ──────────────────────────────────────────────────────────────────

export async function searchToolsAction(query: string, opts: {
  category?: string;
  pricingModel?: string;
  limit?: number;
} = {}) {
  const { category, pricingModel, limit = 30 } = opts;

  const conditions = [
    eq(tools.status, "approved"),
    or(
      ilike(tools.name, `%${query}%`),
      ilike(tools.tagline, `%${query}%`),
      ilike(tools.description, `%${query}%`),
    ),
  ];

  if (category && category !== "All") conditions.push(eq(tools.category, category));
  if (pricingModel && pricingModel !== "All") {
    conditions.push(eq(tools.pricingModel, pricingModel as "Free" | "Freemium" | "Paid" | "Free Trial" | "Open Source"));
  }

  return db.select().from(tools)
    .where(and(...conditions))
    .orderBy(desc(tools.rankScore))
    .limit(limit);
}

// ─── Trending ────────────────────────────────────────────────────────────────

export async function getTrendingToolsAction(limit = 20) {
  return db.select().from(tools)
    .where(eq(tools.status, "approved"))
    .orderBy(desc(tools.weeklyRankChange))
    .limit(limit);
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function getCategoriesWithCounts() {
  return db.select({
    category: tools.category,
    count: count(),
  })
    .from(tools)
    .where(eq(tools.status, "approved"))
    .groupBy(tools.category)
    .orderBy(desc(count()));
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export async function getLeaderboard(limit = 10) {
  return db.select().from(tools)
    .where(and(eq(tools.status, "approved"), sql`${tools.reviewCount} > 0`))
    .orderBy(desc(tools.averageRating), desc(tools.reviewCount))
    .limit(limit);
}

// ─── Deals ───────────────────────────────────────────────────────────────────

export async function getActiveDeals() {
  return db
    .select({
      id: deals.id,
      title: deals.title,
      description: deals.description,
      discountPercent: deals.discountPercent,
      couponCode: deals.couponCode,
      dealUrl: deals.dealUrl,
      claimCount: deals.claimCount,
      maxClaims: deals.maxClaims,
      expiresAt: deals.expiresAt,
      startsAt: deals.startsAt,
      toolId: deals.toolId,
      toolName: tools.name,
      toolSlug: tools.slug,
      toolLogo: tools.logoUrl,
      toolCategory: tools.category,
      toolTagline: tools.tagline,
      toolRating: tools.averageRating,
      toolReviewCount: tools.reviewCount,
    })
    .from(deals)
    .leftJoin(tools, eq(deals.toolId, tools.id))
    .where(and(
      eq(deals.isActive, true),
      or(sql`${deals.expiresAt} IS NULL`, sql`${deals.expiresAt} > NOW()`)
    ))
    .orderBy(desc(deals.createdAt));
}

// ─── User Actions (authenticated) ────────────────────────────────────────────

async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;
  return getUserBySupabaseId(authUser.id);
}

export async function toggleUpvote(toolId: number) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Please sign in to upvote" };

  const existing = await db.query.upvotes.findFirst({
    where: and(eq(upvotes.toolId, toolId), eq(upvotes.userId, user.id)),
  });

  if (existing) {
    await db.delete(upvotes).where(eq(upvotes.id, existing.id));
    await db.update(tools).set({ upvoteCount: sql`${tools.upvoteCount} - 1` }).where(eq(tools.id, toolId));
    return { success: true, upvoted: false };
  } else {
    await db.insert(upvotes).values({ toolId, userId: user.id });
    await db.update(tools).set({ upvoteCount: sql`${tools.upvoteCount} + 1` }).where(eq(tools.id, toolId));
    return { success: true, upvoted: true };
  }
}

export async function toggleSaveTool(toolId: number) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Please sign in to save tools" };

  const existing = await db.query.savedTools.findFirst({
    where: and(eq(savedTools.toolId, toolId), eq(savedTools.userId, user.id)),
  });

  if (existing) {
    await db.delete(savedTools).where(eq(savedTools.id, existing.id));
    return { success: true, saved: false };
  } else {
    await db.insert(savedTools).values({ toolId, userId: user.id });
    return { success: true, saved: true };
  }
}

export async function getUserSavedTools() {
  const user = await getCurrentUser();
  if (!user) return [];

  return db
    .select({
      id: tools.id,
      slug: tools.slug,
      name: tools.name,
      tagline: tools.tagline,
      logoUrl: tools.logoUrl,
      category: tools.category,
      pricingModel: tools.pricingModel,
      averageRating: tools.averageRating,
      reviewCount: tools.reviewCount,
      upvoteCount: tools.upvoteCount,
      savedAt: savedTools.createdAt,
    })
    .from(savedTools)
    .innerJoin(tools, eq(savedTools.toolId, tools.id))
    .where(eq(savedTools.userId, user.id))
    .orderBy(desc(savedTools.createdAt));
}

export async function getUserUpvotedToolIds() {
  const user = await getCurrentUser();
  if (!user) return [];

  const rows = await db.select({ toolId: upvotes.toolId })
    .from(upvotes)
    .where(eq(upvotes.userId, user.id));

  return rows.map(r => r.toolId);
}

export async function getUserSavedToolIds() {
  const user = await getCurrentUser();
  if (!user) return [];

  const rows = await db.select({ toolId: savedTools.toolId })
    .from(savedTools)
    .where(eq(savedTools.userId, user.id));

  return rows.map(r => r.toolId);
}

// ─── Submit Review ───────────────────────────────────────────────────────────

export async function submitReview(data: {
  toolId: number;
  rating: number;
  title: string;
  body: string;
  pros?: string;
  cons?: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Please sign in to submit a review" };

  // Check if user already reviewed this product
  const existing = await db.query.reviews.findFirst({
    where: and(eq(reviews.toolId, data.toolId), eq(reviews.userId, user.id)),
  });
  if (existing) return { success: false, error: "You have already reviewed this product" };

  await db.insert(reviews).values({
    toolId: data.toolId,
    userId: user.id,
    rating: data.rating,
    title: data.title,
    body: data.body,
    pros: data.pros ?? null,
    cons: data.cons ?? null,
    isVerified: user.emailVerified ?? false,
  });

  // Update tool average rating and review count
  const stats = await db.select({
    avgRating: avg(reviews.rating),
    totalReviews: count(),
  }).from(reviews).where(eq(reviews.toolId, data.toolId));

  await db.update(tools).set({
    averageRating: parseFloat(String(stats[0].avgRating ?? 0)),
    reviewCount: stats[0].totalReviews,
    updatedAt: new Date(),
  }).where(eq(tools.id, data.toolId));

  return { success: true };
}

// ─── User Profile ────────────────────────────────────────────────────────────

export async function getUserProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [reviewCount, upvoteCount, savedCount] = await Promise.all([
    db.select({ count: count() }).from(reviews).where(eq(reviews.userId, user.id)),
    db.select({ count: count() }).from(upvotes).where(eq(upvotes.userId, user.id)),
    db.select({ count: count() }).from(savedTools).where(eq(savedTools.userId, user.id)),
  ]);

  return {
    ...user,
    reviewCount: reviewCount[0].count,
    upvoteCount: upvoteCount[0].count,
    savedCount: savedCount[0].count,
  };
}

export async function updateUserProfile(data: {
  name?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  country?: string;
  founderBio?: string;
  founderWebsite?: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Not authenticated" };

  await db.update(users).set({
    ...data,
    updatedAt: new Date(),
  }).where(eq(users.id, user.id));

  return { success: true };
}

// ─── Founder Upgrade ─────────────────────────────────────────────────────────

export async function requestFounderUpgrade(data: {
  founderBio: string;
  founderWebsite: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Not authenticated" };

  if (user.founderStatus === "verified") {
    return { success: false, error: "You are already a verified founder" };
  }
  if (user.founderStatus === "pending") {
    return { success: false, error: "Your founder application is already pending review" };
  }

  await db.update(users).set({
    founderStatus: "pending",
    founderBio: data.founderBio,
    founderWebsite: data.founderWebsite,
    updatedAt: new Date(),
  }).where(eq(users.id, user.id));

  return { success: true };
}

// ─── User Reviews ────────────────────────────────────────────────────────────

export async function getUserReviews() {
  const user = await getCurrentUser();
  if (!user) return [];

  return db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      title: reviews.title,
      body: reviews.body,
      createdAt: reviews.createdAt,
      toolName: tools.name,
      toolSlug: tools.slug,
      toolLogo: tools.logoUrl,
    })
    .from(reviews)
    .innerJoin(tools, eq(reviews.toolId, tools.id))
    .where(eq(reviews.userId, user.id))
    .orderBy(desc(reviews.createdAt));
}

// ─── Edit Own Review ────────────────────────────────────────────────────────

export async function editReview(reviewId: number, data: {
  rating: number;
  title: string;
  body: string;
  pros?: string;
  cons?: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Please sign in to edit your review" };

  // Verify ownership
  const existing = await db.query.reviews.findFirst({
    where: and(eq(reviews.id, reviewId), eq(reviews.userId, user.id)),
  });
  if (!existing) return { success: false, error: "Review not found or you don't own it" };

  await db.update(reviews).set({
    rating: data.rating,
    title: data.title,
    body: data.body,
    pros: data.pros ?? null,
    cons: data.cons ?? null,
    updatedAt: new Date(),
  }).where(eq(reviews.id, reviewId));

  // Recalculate tool stats
  const stats = await db.select({
    avgRating: avg(reviews.rating),
    totalReviews: count(),
  }).from(reviews).where(eq(reviews.toolId, existing.toolId));

  await db.update(tools).set({
    averageRating: parseFloat(String(stats[0].avgRating ?? 0)),
    reviewCount: stats[0].totalReviews,
    updatedAt: new Date(),
  }).where(eq(tools.id, existing.toolId));

  return { success: true };
}

// ─── Delete Own Review ──────────────────────────────────────────────────────

export async function deleteReview(reviewId: number) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Please sign in to delete your review" };

  // Verify ownership
  const existing = await db.query.reviews.findFirst({
    where: and(eq(reviews.id, reviewId), eq(reviews.userId, user.id)),
  });
  if (!existing) return { success: false, error: "Review not found or you don't own it" };

  await db.delete(reviews).where(eq(reviews.id, reviewId));

  // Recalculate tool stats
  const stats = await db.select({
    avgRating: avg(reviews.rating),
    totalReviews: count(),
  }).from(reviews).where(eq(reviews.toolId, existing.toolId));

  await db.update(tools).set({
    averageRating: parseFloat(String(stats[0].avgRating ?? 0)),
    reviewCount: stats[0].totalReviews,
    updatedAt: new Date(),
  }).where(eq(tools.id, existing.toolId));

  return { success: true };
}

// ─── Get Tool Screenshots ───────────────────────────────────────────────────

export async function getToolScreenshots(toolId: number) {
  const { toolScreenshots } = await import("@/drizzle/schema");
  return db.select().from(toolScreenshots)
    .where(eq(toolScreenshots.toolId, toolId))
    .orderBy(toolScreenshots.sortOrder);
}


// ─── Platform Stats ──────────────────────────────────────────────────────────
export async function getPlatformStats() {
  const [toolCount, reviewCount, userCount, avgRatingResult] = await Promise.all([
    db.select({ count: count() }).from(tools).where(eq(tools.status, "approved")),
    db.select({ count: count() }).from(reviews),
    db.select({ count: count() }).from(users),
    db.select({ avg: avg(reviews.rating) }).from(reviews),
  ]);
  const totalTools = toolCount[0]?.count ?? 0;
  const totalReviews = reviewCount[0]?.count ?? 0;
  const totalUsers = userCount[0]?.count ?? 0;
  const averageRating = parseFloat(String(avgRatingResult[0]?.avg ?? 0)).toFixed(1);
  const verifiedPct = totalReviews > 0 ? "100%" : "—";
  return {
    totalTools,
    totalReviews,
    totalUsers,
    averageRating,
    verifiedPct,
  };
}
