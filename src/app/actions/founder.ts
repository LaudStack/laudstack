"use server";

import { db } from "@/server/db";
import { tools, reviews, users, deals, toolClaims, moderationLogs } from "@/drizzle/schema";
import { eq, and, or, desc, count, sum, inArray } from "drizzle-orm";
import { requireAuth } from "@/lib/admin-auth";
import { createNotification, notifyAdmins } from "@/app/actions/notifications";
import { sendReplyNotificationEmail, sendAdminNewClaimAlert, sendAdminPromotionRequestAlert, sendAdminNewDealAlert } from "@/server/email";

async function requireFounder() {
  const dbUser = await requireAuth();
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
      .where(or(eq(tools.submittedBy, user.id), eq(tools.claimedBy, user.id)))
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
      .where(or(eq(tools.submittedBy, user.id), eq(tools.claimedBy, user.id)));

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
        status: reviews.status,
        isFlagged: reviews.isFlagged,
        flagReason: reviews.flagReason,
        flaggedAt: reviews.flaggedAt,
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
      where: and(eq(tools.id, review.toolId), or(eq(tools.submittedBy, user.id), eq(tools.claimedBy, user.id))),
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

    // Notify the reviewer that the founder replied
    if (review.userId && review.userId !== user.id) {
      try {
        await createNotification({
          recipientId: review.userId,
          type: "founder_reply",
          title: "Founder replied to your review",
          message: `The founder of ${tool.name} replied to your review.`,
          link: `/tools/${tool.slug}#reviews`,
          actorId: user.id,
          toolId: tool.id,
        });
        // Also send email notification to the reviewer
        const reviewer = await db.query.users.findFirst({
          where: eq(users.id, review.userId),
          columns: { email: true },
        });
        if (reviewer?.email) {
          await sendReplyNotificationEmail(
            reviewer.email,
            tool.name,
            tool.slug,
            user.firstName || 'The founder',
            reply.trim()
          ).catch(e => console.error('[replyToReview] email error:', e));
        }
      } catch (e) {
        console.error("[replyToReview] notification error:", e);
      }
    }

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
      where: and(eq(tools.id, review.toolId), or(eq(tools.submittedBy, user.id), eq(tools.claimedBy, user.id))),
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

/// ─── Flag Review for Moderation ───────────────────────────────────────────

export async function flagReview(reviewId: number, reason: string) {
  try {
    const user = await requireFounder();

    if (!reason?.trim()) return { success: false, error: "Please provide a reason for flagging" };

    const review = await db.query.reviews.findFirst({
      where: eq(reviews.id, reviewId),
    });
    if (!review) return { success: false, error: "Review not found" };

    // Verify the review belongs to one of the founder's tools
    const tool = await db.query.tools.findFirst({
      where: and(eq(tools.id, review.toolId), or(eq(tools.submittedBy, user.id), eq(tools.claimedBy, user.id))),
    });
    if (!tool) return { success: false, error: "You can only flag reviews on your own stacks" };

    if (review.isFlagged) return { success: false, error: "This review has already been flagged" };

    await db.update(reviews).set({
      isFlagged: true,
      flagReason: reason.trim(),
      flaggedBy: user.id,
      flaggedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(reviews.id, reviewId));

    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Get Founder's Deals ────────────────────────────────────────────────────

export async function getFounderDeals() {
  try {
    const user = await requireFounder();

    // Get founder's tool IDs
    const founderTools = await db
      .select({ id: tools.id, name: tools.name, slug: tools.slug, logoUrl: tools.logoUrl })
      .from(tools)
      .where(or(eq(tools.submittedBy, user.id), eq(tools.claimedBy, user.id)));

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
  dealType?: "discount" | "lifetime" | "free_trial" | "exclusive";
  discountPercent?: number;
  originalPrice?: string;
  dealPrice?: string;
  couponCode: string;
  dealUrl?: string;
  expiresAt?: string;
  maxClaims?: number;
}) {
  try {
    const user = await requireFounder();

    // Verify the product belongs to this founder
    const tool = await db.query.tools.findFirst({
      where: and(eq(tools.id, data.toolId), or(eq(tools.submittedBy, user.id), eq(tools.claimedBy, user.id))),
    });
    if (!tool) return { success: false, error: "Tool not found or not owned by you" };

    const [newDeal] = await db
      .insert(deals)
      .values({
        toolId: data.toolId,
        title: data.title.trim(),
        description: data.description.trim(),
        dealType: data.dealType || "discount",
        discountPercent: data.discountPercent || null,
        originalPrice: data.originalPrice?.trim() || null,
        dealPrice: data.dealPrice?.trim() || null,
        couponCode: data.couponCode.trim().toUpperCase(),
        dealUrl: data.dealUrl?.trim() || null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        maxClaims: data.maxClaims || null,
        createdBy: user.id,
        isActive: false,
        approvalStatus: "pending",
        placement: "none",
      })
      .returning();

    // Notify admins about new deal submission (in-app)
    notifyAdmins({
      type: "system",
      title: "New Deal Submitted",
      message: `${user.name || user.email} submitted a new deal "${data.title}" for ${tool.name}. Review and approve it in the admin panel.`,
      link: "/ops-console/deals",
      toolId: data.toolId,
    }).catch(() => {});

    // Notify admins via email
    sendAdminNewDealAlert({
      dealTitle: data.title,
      toolName: tool.name,
      founderName: user.name || "Unknown",
      founderEmail: user.email || "N/A",
      dealType: data.dealType || "discount",
      discountPercent: data.discountPercent,
    }).catch((err) => {
      console.error("[createFounderDeal] Failed to send admin deal alert email:", err);
    });

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
      where: and(eq(tools.id, deal.toolId), or(eq(tools.submittedBy, user.id), eq(tools.claimedBy, user.id))),
    });
    if (!tool) return { success: false, error: "Unauthorized" };

    // Only allow toggling approved deals
    if (deal.approvalStatus !== "approved") {
      return { success: false, error: "Deal must be approved before it can be activated" };
    }

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
      where: and(eq(tools.id, deal.toolId), or(eq(tools.submittedBy, user.id), eq(tools.claimedBy, user.id))),
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
      .where(or(eq(tools.submittedBy, user.id), eq(tools.claimedBy, user.id)));

    if (founderTools.length === 0) {
      return {
        success: true,
        totalTools: 0,
        totalReviews: 0,
        totalUpvotes: 0,
        totalViews: 0,
        totalClicks: 0,
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
    const totalViews = founderTools.reduce((sum, t) => sum + (t.viewCount || 0), 0);
    const totalClicks = founderTools.reduce((sum, t) => sum + (t.outboundClickCount || 0), 0);
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
      viewCount: t.viewCount || 0,
      outboundClickCount: t.outboundClickCount || 0,
    }));

    return {
      success: true,
      totalTools: founderTools.length,
      totalReviews,
      totalUpvotes,
      totalViews,
      totalClicks,
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
      totalViews: 0,
      totalClicks: 0,
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
  emailNotifications?: boolean;
  reviewAlerts?: boolean;
  weeklyReport?: boolean;
}) {
  try {
    const user = await requireFounder();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.founderBio !== undefined) updateData.founderBio = data.founderBio.trim();
    if (data.founderWebsite !== undefined) updateData.founderWebsite = data.founderWebsite.trim();
    if (data.twitterHandle !== undefined) updateData.twitterHandle = data.twitterHandle.trim();
    if (data.linkedinUrl !== undefined) updateData.linkedinUrl = data.linkedinUrl.trim();
    if (data.emailNotifications !== undefined) updateData.emailNotifications = data.emailNotifications;
    if (data.reviewAlerts !== undefined) updateData.reviewAlerts = data.reviewAlerts;
    if (data.weeklyReport !== undefined) updateData.weeklyReport = data.weeklyReport;

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
    features?: { icon: string; title: string; description: string }[];
    pricingTiers?: { name: string; price: string; period?: string; description: string; features: string[]; cta: string; highlighted?: boolean; badge?: string }[];
  }
) {
  try {
    const user = await requireFounder();

    // Allow founders to edit tools they submitted OR claimed
    const tool = await db.query.tools.findFirst({
      where: and(eq(tools.id, toolId), or(eq(tools.submittedBy, user.id), eq(tools.claimedBy, user.id))),
    });
    if (!tool) return { success: false, error: "Tool not found or not owned by you" };

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.tagline !== undefined) updateData.tagline = data.tagline.trim();
    if (data.description !== undefined) updateData.description = data.description.trim();
    if (data.websiteUrl !== undefined) updateData.websiteUrl = data.websiteUrl.trim();
    if (data.category !== undefined) updateData.category = data.category;
    if (data.pricingModel !== undefined) updateData.pricingModel = data.pricingModel;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.features !== undefined) updateData.features = data.features;
    if (data.pricingTiers !== undefined) updateData.pricingTiers = data.pricingTiers;

    await db.update(tools).set(updateData).where(eq(tools.id, toolId));

    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Claim Existing Tool ────────────────────────────────────────────────────

export async function claimExistingTool(toolId: number, data: {
  proofUrl?: string;
  message?: string;
}) {
  try {
    const dbUser = await requireAuth().catch(() => null);
    if (!dbUser) return { success: false, error: "Please sign in to claim a tool" };

    // Check if tool exists
    const tool = await db.query.tools.findFirst({
      where: eq(tools.id, toolId),
      columns: { id: true, name: true, claimedBy: true, submittedBy: true },
    });
    if (!tool) return { success: false, error: "Tool not found" };

    // Check if already claimed
    if (tool.claimedBy) {
      return { success: false, error: "This tool has already been claimed by another founder" };
    }

    // Check if user already has a pending claim for this tool
    const existingClaim = await db.query.toolClaims.findFirst({
      where: and(
        eq(toolClaims.toolId, toolId),
        eq(toolClaims.userId, dbUser.id),
        eq(toolClaims.status, "pending"),
      ),
    });
    if (existingClaim) {
      return { success: false, error: "You already have a pending claim for this tool" };
    }

    // Create the claim
    await db.insert(toolClaims).values({
      toolId,
      userId: dbUser.id,
      status: "pending",
      proofUrl: data.proofUrl ?? null,
      notes: data.message ?? null,
    });

    // Admin notification: new claim request (email + in-app)
    sendAdminNewClaimAlert({
      toolName: tool.name,
      toolId,
      claimantName: dbUser.name || "",
      claimantEmail: dbUser.email || "",
      proofUrl: data.proofUrl,
      message: data.message,
    }).catch((e) => console.error("[claimExistingTool] admin alert error:", e));

    notifyAdmins({
      type: "new_claim",
      title: "New ownership claim",
      message: `${dbUser.name || dbUser.email || "A user"} submitted a claim for "${tool.name}".`,
      link: "/ops-console/stacks/claimed",
      actorId: dbUser.id,
      toolId,
    }).catch((e) => console.error("[claimExistingTool] admin in-app notification error:", e));

    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Get Founder's Claims ───────────────────────────────────────────────────

export async function getFounderClaims() {
  try {
    const dbUser = await requireAuth().catch(() => null);
    if (!dbUser) return { success: false, claims: [] };

    const claims = await db
      .select({
        id: toolClaims.id,
        status: toolClaims.status,
        proofUrl: toolClaims.verificationToken,
        createdAt: toolClaims.createdAt,
        toolId: tools.id,
        toolName: tools.name,
        toolSlug: tools.slug,
        toolLogo: tools.logoUrl,
      })
      .from(toolClaims)
      .leftJoin(tools, eq(toolClaims.toolId, tools.id))
      .where(eq(toolClaims.userId, dbUser.id))
      .orderBy(desc(toolClaims.createdAt));

    return { success: true, claims };
  } catch (e: unknown) {
    return { success: false, claims: [], error: (e as Error).message };
  }
}

// ─── Request Tool Verification ───────────────────────────────────────────────
export async function requestToolVerification(toolId: number, data: {
  proofUrl?: string;
  message?: string;
}) {
  try {
    const dbUser = await requireAuth().catch(() => null);
    if (!dbUser) return { success: false, error: "Not authenticated" };

    // Check tool ownership
    const tool = await db.query.tools.findFirst({
      where: eq(tools.id, toolId),
    });
    if (!tool) return { success: false, error: "Tool not found" };
    if (tool.claimedBy !== dbUser.id && tool.submittedBy !== dbUser.id) {
      return { success: false, error: "You don't own this tool" };
    }
    if (tool.isVerified) {
      return { success: false, error: "This tool is already verified" };
    }

    // Create a claim-like record for verification request
    const existing = await db.query.toolClaims.findFirst({
      where: and(
        eq(toolClaims.toolId, toolId),
        eq(toolClaims.userId, dbUser.id),
        eq(toolClaims.status, "pending"),
      ),
    });
    if (existing) {
      return { success: false, error: "You already have a pending verification request" };
    }

    await db.insert(toolClaims).values({
      toolId,
      userId: dbUser.id,
      status: "pending",
      proofUrl: data.proofUrl ?? null,
      notes: data.message ?? null,
      verifyMethod: "verification_request",
    });

    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Request Promotion (contact admin for featured/sponsored/newsletter) ─────
export async function requestPromotion(data: {
  toolId: number;
  promotionType: "featured" | "sponsored" | "newsletter";
  message: string;
}) {
  try {
    const dbUser = await requireAuth().catch(() => null);
    if (!dbUser) return { success: false, error: "Not authenticated" };

    // Verify tool ownership
    const tool = await db.query.tools.findFirst({
      where: eq(tools.id, data.toolId),
    });
    if (!tool) return { success: false, error: "Tool not found" };
    if (tool.claimedBy !== dbUser.id && tool.submittedBy !== dbUser.id) {
      return { success: false, error: "You don't own this tool" };
    }

    // Log as a moderation log entry for admin to review
    await db.insert(moderationLogs).values({
      toolId: data.toolId,
      adminId: dbUser.id,
      action: `promotion_request_${data.promotionType}`,
      notes: `Founder ${dbUser.name || dbUser.email} requested ${data.promotionType} promotion: ${data.message}`,
    });

    // Admin notification: promotion request (email + in-app)
    sendAdminPromotionRequestAlert({
      toolName: tool.name,
      toolId: data.toolId,
      founderName: dbUser.name || "",
      founderEmail: dbUser.email || "",
      promotionType: data.promotionType,
      message: data.message,
    }).catch((e) => console.error("[requestPromotion] admin alert error:", e));

    notifyAdmins({
      type: "system",
      title: "Promotion request",
      message: `${dbUser.name || dbUser.email || "A founder"} requested ${data.promotionType} promotion for "${tool.name}".`,
      link: `/admin/tools/${data.toolId}`,
      actorId: dbUser.id,
      toolId: data.toolId,
    }).catch((e) => console.error("[requestPromotion] admin in-app notification error:", e));

    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}
