"use server";

import { db, getUserBySupabaseId } from "@/server/db";
import { tools, reviews, users, deals } from "@/drizzle/schema";
import { eq, and, desc, sql, count, sum, avg, inArray } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function requireFounder() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) throw new Error("UNAUTHORIZED");
  const dbUser = await getUserBySupabaseId(authUser.id);
  if (!dbUser) throw new Error("USER_NOT_FOUND");
  if (dbUser.founderStatus !== "verified" && dbUser.founderStatus !== "pending") {
    throw new Error("NOT_A_FOUNDER");
  }
  return dbUser;
}

// ─── Get Founder's Tools ──────────────────────────────────────────────────────

export async function getFounderTools() {
  try {
    const user = await requireFounder();
    const founderTools = await db
      .select()
      .from(tools)
      .where(eq(tools.submittedBy, user.id))
      .orderBy(desc(tools.createdAt));
    return { success: true, tools: founderTools };
  } catch (e: unknown) {
    return { success: false, tools: [], error: (e as Error).message };
  }
}

// ─── Get Reviews on Founder's Tools ───────────────────────────────────────────

export async function getFounderReviews() {
  try {
    const user = await requireFounder();
    // Get all tool IDs owned by this founder
    const founderTools = await db
      .select({ id: tools.id, name: tools.name, slug: tools.slug, logoUrl: tools.logoUrl })
      .from(tools)
      .where(eq(tools.submittedBy, user.id));

    if (founderTools.length === 0) {
      return { success: true, reviews: [] };
    }

    const toolIds = founderTools.map((t) => t.id);
    const toolMap = Object.fromEntries(founderTools.map((t) => [t.id, t]));

    // Get all reviews for those products
    const toolReviews = await db
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
        founderReply: reviews.founderReply,
        founderReplyAt: reviews.founderReplyAt,
        createdAt: reviews.createdAt,
        userName: users.name,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userAvatar: users.avatarUrl,
        userEmail: users.email,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(inArray(reviews.toolId, toolIds))
      .orderBy(desc(reviews.createdAt));

    // Enrich with tool info and compute display name
    const enrichedReviews = toolReviews.map((r) => ({
      ...r,
      userName: (r.userFirstName ? [r.userFirstName, r.userLastName].filter(Boolean).join(' ') : null) ?? r.userName ?? 'Anonymous',
      toolName: toolMap[r.toolId]?.name || "Unknown",
      toolSlug: toolMap[r.toolId]?.slug || "",
      toolLogoUrl: toolMap[r.toolId]?.logoUrl || "",
    }));

    return { success: true, reviews: enrichedReviews };
  } catch (e: unknown) {
    return { success: false, reviews: [], error: (e as Error).message };
  }
}

// ─── Reply to Review ──────────────────────────────────────────────────────────

export async function replyToReview(reviewId: number, reply: string) {
  try {
    const user = await requireFounder();

    // Verify the review belongs to one of the founder's tools
    const review = await db.query.reviews.findFirst({
      where: eq(reviews.id, reviewId),
    });
    if (!review) return { success: false, error: "Review not found" };

    const tool = await db.query.tools.findFirst({
      where: and(eq(tools.id, review.toolId), eq(tools.submittedBy, user.id)),
    });
    if (!tool) return { success: false, error: "You can only reply to reviews on your own tools" };

    await db
      .update(reviews)
      .set({
        founderReply: reply.trim(),
        founderReplyAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, reviewId));

    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Delete Review Reply ──────────────────────────────────────────────────────

export async function deleteReviewReply(reviewId: number) {
  try {
    const user = await requireFounder();

    const review = await db.query.reviews.findFirst({
      where: eq(reviews.id, reviewId),
    });
    if (!review) return { success: false, error: "Review not found" };

    const tool = await db.query.tools.findFirst({
      where: and(eq(tools.id, review.toolId), eq(tools.submittedBy, user.id)),
    });
    if (!tool) return { success: false, error: "Unauthorized" };

    await db
      .update(reviews)
      .set({
        founderReply: null,
        founderReplyAt: null,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, reviewId));

    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Get Founder's Deals ──────────────────────────────────────────────────────

export async function getFounderDeals() {
  try {
    const user = await requireFounder();

    // Get founder's tool IDs
    const founderTools = await db
      .select({ id: tools.id, name: tools.name, slug: tools.slug, logoUrl: tools.logoUrl })
      .from(tools)
      .where(eq(tools.submittedBy, user.id));

    if (founderTools.length === 0) {
      return { success: true, deals: [], tools: [] };
    }

    const toolIds = founderTools.map((t) => t.id);
    const toolMap = Object.fromEntries(founderTools.map((t) => [t.id, t]));

    // Get deals for those products
    const founderDeals = await db
      .select()
      .from(deals)
      .where(inArray(deals.toolId, toolIds))
      .orderBy(desc(deals.createdAt));

    const enrichedDeals = founderDeals.map((d) => ({
      ...d,
      toolName: toolMap[d.toolId]?.name || "Unknown",
      toolSlug: toolMap[d.toolId]?.slug || "",
      toolLogoUrl: toolMap[d.toolId]?.logoUrl || "",
    }));

    return { success: true, deals: enrichedDeals, tools: founderTools };
  } catch (e: unknown) {
    return { success: false, deals: [], tools: [], error: (e as Error).message };
  }
}

// ─── Create Deal ──────────────────────────────────────────────────────────────

export async function createFounderDeal(data: {
  toolId: number;
  title: string;
  description: string;
  discountPercent: number;
  couponCode: string;
  dealUrl?: string;
  expiresAt?: string;
  maxClaims?: number;
}) {
  try {
    const user = await requireFounder();

    // Verify the product belongs to this founder
    const tool = await db.query.tools.findFirst({
      where: and(eq(tools.id, data.toolId), eq(tools.submittedBy, user.id)),
    });
    if (!tool) return { success: false, error: "Tool not found or not owned by you" };

    const [newDeal] = await db
      .insert(deals)
      .values({
        toolId: data.toolId,
        title: data.title.trim(),
        description: data.description.trim(),
        discountPercent: data.discountPercent,
        couponCode: data.couponCode.trim().toUpperCase(),
        dealUrl: data.dealUrl?.trim() || null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        maxClaims: data.maxClaims || null,
        createdBy: user.id,
        isActive: true,
      })
      .returning();

    return { success: true, deal: newDeal };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Toggle Deal Active Status ────────────────────────────────────────────────

export async function toggleFounderDeal(dealId: number) {
  try {
    const user = await requireFounder();

    const deal = await db.query.deals.findFirst({
      where: eq(deals.id, dealId),
    });
    if (!deal) return { success: false, error: "Deal not found" };

    // Verify the deal's tool belongs to this founder
    const tool = await db.query.tools.findFirst({
      where: and(eq(tools.id, deal.toolId), eq(tools.submittedBy, user.id)),
    });
    if (!tool) return { success: false, error: "Unauthorized" };

    await db
      .update(deals)
      .set({
        isActive: !deal.isActive,
        updatedAt: new Date(),
      })
      .where(eq(deals.id, dealId));

    return { success: true, isActive: !deal.isActive };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Delete Deal ──────────────────────────────────────────────────────────────

export async function deleteFounderDeal(dealId: number) {
  try {
    const user = await requireFounder();

    const deal = await db.query.deals.findFirst({
      where: eq(deals.id, dealId),
    });
    if (!deal) return { success: false, error: "Deal not found" };

    const tool = await db.query.tools.findFirst({
      where: and(eq(tools.id, deal.toolId), eq(tools.submittedBy, user.id)),
    });
    if (!tool) return { success: false, error: "Unauthorized" };

    await db.delete(deals).where(eq(deals.id, dealId));

    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Get Founder Analytics ────────────────────────────────────────────────────

export async function getFounderAnalytics() {
  try {
    const user = await requireFounder();

    const founderTools = await db
      .select()
      .from(tools)
      .where(eq(tools.submittedBy, user.id));

    if (founderTools.length === 0) {
      return {
        success: true,
        totalTools: 0,
        totalReviews: 0,
        totalUpvotes: 0,
        averageRating: 0,
        totalDeals: 0,
        totalDealClaims: 0,
        tools: [],
      };
    }

    const toolIds = founderTools.map((t) => t.id);

    // Aggregate stats
    const totalReviews = founderTools.reduce((sum, t) => sum + t.reviewCount, 0);
    const totalUpvotes = founderTools.reduce((sum, t) => sum + t.upvoteCount, 0);
    const avgRating =
      founderTools.filter((t) => t.reviewCount > 0).length > 0
        ? founderTools.reduce((sum, t) => sum + t.averageRating * t.reviewCount, 0) / totalReviews
        : 0;

    // Deal stats
    const dealStats = await db
      .select({
        totalDeals: count(),
        totalClaims: sum(deals.claimCount),
      })
      .from(deals)
      .where(inArray(deals.toolId, toolIds));

    // Per-tool breakdown
    const toolBreakdown = founderTools.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      logoUrl: t.logoUrl,
      status: t.status,
      upvoteCount: t.upvoteCount,
      reviewCount: t.reviewCount,
      averageRating: t.averageRating,
      weeklyRankChange: t.weeklyRankChange,
      isFeatured: t.isFeatured,
    }));

    return {
      success: true,
      totalTools: founderTools.length,
      totalReviews,
      totalUpvotes,
      averageRating: Math.round(avgRating * 10) / 10,
      totalDeals: dealStats[0]?.totalDeals || 0,
      totalDealClaims: Number(dealStats[0]?.totalClaims) || 0,
      tools: toolBreakdown,
    };
  } catch (e: unknown) {
    return {
      success: false,
      totalTools: 0,
      totalReviews: 0,
      totalUpvotes: 0,
      averageRating: 0,
      totalDeals: 0,
      totalDealClaims: 0,
      tools: [],
      error: (e as Error).message,
    };
  }
}

// ─── Update Founder Settings ──────────────────────────────────────────────────

export async function updateFounderSettings(data: {
  name?: string;
  founderBio?: string;
  founderWebsite?: string;
  twitterHandle?: string;
  linkedinUrl?: string;
}) {
  try {
    const user = await requireFounder();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.founderBio !== undefined) updateData.founderBio = data.founderBio.trim();
    if (data.founderWebsite !== undefined) updateData.founderWebsite = data.founderWebsite.trim();
    if (data.twitterHandle !== undefined) updateData.twitterHandle = data.twitterHandle.trim();
    if (data.linkedinUrl !== undefined) updateData.linkedinUrl = data.linkedinUrl.trim();

    await db.update(users).set(updateData).where(eq(users.id, user.id));

    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Update Tool Details ──────────────────────────────────────────────────────

export async function updateFounderTool(
  toolId: number,
  data: {
    tagline?: string;
    description?: string;
    websiteUrl?: string;
    category?: string;
    pricingModel?: string;
    tags?: string[];
  }
) {
  try {
    const user = await requireFounder();

    const tool = await db.query.tools.findFirst({
      where: and(eq(tools.id, toolId), eq(tools.submittedBy, user.id)),
    });
    if (!tool) return { success: false, error: "Tool not found or not owned by you" };

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.tagline !== undefined) updateData.tagline = data.tagline.trim();
    if (data.description !== undefined) updateData.description = data.description.trim();
    if (data.websiteUrl !== undefined) updateData.websiteUrl = data.websiteUrl.trim();
    if (data.category !== undefined) updateData.category = data.category;
    if (data.pricingModel !== undefined) updateData.pricingModel = data.pricingModel;
    if (data.tags !== undefined) updateData.tags = data.tags;

    await db.update(tools).set(updateData).where(eq(tools.id, toolId));

    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}
