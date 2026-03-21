"use server";

import { db } from "@/server/db";
import { requireAdmin } from "@/lib/admin-auth";
import {
  users, tools, reviews, toolSubmissions, toolClaims,
  newsletterSubscribers, deals, dealClaims, toolScreenshots, moderationLogs,
  emailTemplates, contactSubmissions,
} from "@/drizzle/schema";
import { eq, desc, ilike, or, sql, and, count, isNull } from "drizzle-orm";
import { recalcAndPersistToolScore } from "@/lib/ranking";
import {
  sendClaimApprovedEmail,
  sendClaimRejectedEmail,
  sendVerificationOutcomeEmail,
  sendDealApprovalEmail,
  sendDealRejectionEmail,
} from "@/server/email";
import { createNotification } from "@/app/actions/notifications";
import { notifyStackFollowersAboutDeal } from "@/lib/notifyFollowers";

// Auth helpers imported from @/lib/admin-auth

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export async function getAdminStats() {
  try {
    await requireAdmin();
  } catch (authErr) {
    console.error("[getAdminStats] Auth failed:", (authErr as Error).message);
    throw authErr;
  }
  try {
    const [
      totalUsers, totalTools, totalReviews, pendingSubmissions,
      pendingClaims, pendingFounders, approvedTools, verifiedFounders,
    ] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(tools),
      db.select({ count: count() }).from(reviews).where(eq(reviews.status, "published")),
      db.select({ count: count() }).from(toolSubmissions).where(eq(toolSubmissions.status, "pending")),
      db.select({ count: count() }).from(toolClaims).where(eq(toolClaims.status, "pending")),
      db.select({ count: count() }).from(users).where(eq(users.founderStatus, "pending")),
      db.select({ count: count() }).from(tools).where(eq(tools.status, "approved")),
      db.select({ count: count() }).from(users).where(eq(users.founderStatus, "verified")),
    ]);
    return {
      totalUsers: totalUsers[0].count,
      totalTools: totalTools[0].count,
      totalReviews: totalReviews[0].count,
      pendingSubmissions: pendingSubmissions[0].count,
      pendingClaims: pendingClaims[0].count,
      pendingFounders: pendingFounders[0].count,
      approvedTools: approvedTools[0].count,
      verifiedFounders: verifiedFounders[0].count,
    };
  } catch (dbErr) {
    console.error("[getAdminStats] DB query failed:", (dbErr as Error).message);
    throw dbErr;
  }
}

export async function getWeeklyGrowth() {
  await requireAdmin();
  try {
    // Get counts per day for the last 7 days using ISO date strings for compatibility
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      days.push({ start: dayStart.toISOString(), end: dayEnd.toISOString() });
    }
    const [userCounts, toolCounts, reviewCounts] = await Promise.all([
      Promise.all(days.map(d =>
        db.select({ count: count() }).from(users)
          .where(and(
            sql`${users.createdAt} >= ${d.start}::timestamp`,
            sql`${users.createdAt} <= ${d.end}::timestamp`
          ))
          .then(r => r[0].count)
      )),
      Promise.all(days.map(d =>
        db.select({ count: count() }).from(tools)
          .where(and(
            sql`${tools.createdAt} >= ${d.start}::timestamp`,
            sql`${tools.createdAt} <= ${d.end}::timestamp`
          ))
          .then(r => r[0].count)
      )),
      Promise.all(days.map(d =>
        db.select({ count: count() }).from(reviews)
          .where(and(
            sql`${reviews.createdAt} >= ${d.start}::timestamp`,
            sql`${reviews.createdAt} <= ${d.end}::timestamp`
          ))
          .then(r => r[0].count)
      )),
    ]);
    return { weeklyUsers: userCounts, weeklyTools: toolCounts, weeklyReviews: reviewCounts };
  } catch (err) {
    console.error("[getWeeklyGrowth] Error:", (err as Error).message);
    // Return empty data rather than failing the entire dashboard
    return { weeklyUsers: [0,0,0,0,0,0,0], weeklyTools: [0,0,0,0,0,0,0], weeklyReviews: [0,0,0,0,0,0,0] };
  }
}

export async function getRecentActivity() {
  await requireAdmin();
  const [recentUsers, recentReviews, recentSubmissions] = await Promise.all([
    db.select({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt, role: users.role })
      .from(users).orderBy(desc(users.createdAt)).limit(5),
    db.select({ id: reviews.id, rating: reviews.rating, createdAt: reviews.createdAt, userId: reviews.userId, toolId: reviews.toolId, title: reviews.title })
      .from(reviews).orderBy(desc(reviews.createdAt)).limit(5),
    db.select({ id: toolSubmissions.id, name: toolSubmissions.name, status: toolSubmissions.status, createdAt: toolSubmissions.createdAt })
      .from(toolSubmissions).orderBy(desc(toolSubmissions.createdAt)).limit(5),
  ]);
  return { recentUsers, recentReviews, recentSubmissions };
}

// ─── Users Management ─────────────────────────────────────────────────────────

export async function getAdminUsers(opts: { search?: string; role?: string; page?: number } = {}) {
  await requireAdmin();
  const { search, role, page = 1 } = opts;
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (search) conditions.push(or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`)));
  if (role && role !== "all") conditions.push(eq(users.role, role as "user" | "admin" | "super_admin"));

  const [rows, total] = await Promise.all([
    db.select().from(users)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(users.createdAt)).limit(limit).offset(offset),
    db.select({ count: count() }).from(users)
      .where(conditions.length ? and(...conditions) : undefined),
  ]);
  return { users: rows, total: total[0].count, page, limit };
}

export async function updateUserRole(
  userId: number,
  role: "user" | "customer_rep" | "moderator" | "analyst" | "manager" | "admin" | "super_admin"
) {
  const admin = await requireAdmin();
  // Only super_admin can assign admin or super_admin roles
  if ((role === "admin" || role === "super_admin") && admin.role !== "super_admin") {
    throw new Error("FORBIDDEN: Only super admins can assign admin or super admin roles");
  }
  // Only super_admin can modify other super_admins
  const target = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (target?.role === "super_admin" && admin.role !== "super_admin") {
    throw new Error("FORBIDDEN: Cannot modify super admin");
  }
  // Prevent self-demotion
  if (target?.id === admin.id) {
    throw new Error("Cannot change your own role");
  }
  await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, userId));
  return { success: true };
}

export async function deleteUser(userId: number) {
  await requireAdmin();
  await db.delete(users).where(eq(users.id, userId));
  return { success: true };
}

// ─── Founders Management ──────────────────────────────────────────────────────

export async function getAdminFounders(opts: { status?: string; page?: number } = {}) {
  await requireAdmin();
  const { status, page = 1 } = opts;
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (status && status !== "all") {
    conditions.push(eq(users.founderStatus, status as "none" | "pending" | "verified" | "rejected"));
  } else {
    // By default show pending + verified + rejected (not 'none')
    conditions.push(or(
      eq(users.founderStatus, "pending"),
      eq(users.founderStatus, "verified"),
      eq(users.founderStatus, "rejected"),
    ));
  }

  const [rows, total] = await Promise.all([
    db.select().from(users)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(users.createdAt)).limit(limit).offset(offset),
    db.select({ count: count() }).from(users)
      .where(conditions.length ? and(...conditions) : undefined),
  ]);
  return { founders: rows, total: total[0].count, page, limit };
}

export async function verifyFounder(userId: number, status: "verified" | "rejected") {
  await requireAdmin();
  await db.update(users).set({
    founderStatus: status,
    founderVerifiedAt: status === "verified" ? new Date() : null,
    updatedAt: new Date(),
  }).where(eq(users.id, userId));
  return { success: true };
}

// ─── Tools Management ─────────────────────────────────────────────────────────


export async function updateToolStatus(toolId: number, status: "pending" | "approved" | "rejected" | "featured") {
  await requireAdmin();
  await db.update(tools).set({ status, updatedAt: new Date() }).where(eq(tools.id, toolId));
  // Recalculate rank score when a tool is approved or featured so it appears in ranked lists
  if (status === "approved" || status === "featured") {
    await recalcAndPersistToolScore(toolId);
  }
  return { success: true };
}

export async function deleteTool(toolId: number) {
  await requireAdmin();
  await db.delete(tools).where(eq(tools.id, toolId));
  return { success: true };
}

export async function updateToolFeatured(toolId: number, isFeatured: boolean) {
  await requireAdmin();
  await db.update(tools).set({ isFeatured, updatedAt: new Date() }).where(eq(tools.id, toolId));
  return { success: true };
}

export async function createToolManually(data: {
  name: string; slug: string; tagline: string; websiteUrl: string;
  description: string; logoUrl?: string; category: string;
  pricingModel?: "Free" | "Freemium" | "Paid" | "Free Trial" | "Open Source";
}) {
  await requireAdmin();
  const [tool] = await db.insert(tools).values({
    name: data.name,
    slug: data.slug,
    tagline: data.tagline,
    websiteUrl: data.websiteUrl,
    description: data.description,
    logoUrl: data.logoUrl ?? null,
    category: data.category,
    pricingModel: data.pricingModel ?? "Freemium",
    status: "approved",
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning({ id: tools.id });
  return { success: true, toolId: tool.id };
}

// ─── Tool Submissions Management ──────────────────────────────────────────────


export async function reviewSubmission(
  submissionId: number,
  action: "approved" | "rejected",
  notes?: string
) {
  await requireAdmin();
  await db.update(toolSubmissions).set({
    status: action,
    reviewNotes: notes ?? null,
    reviewedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(toolSubmissions.id, submissionId));

  // If approved, create the tool and update founder status
  if (action === "approved") {
    const [submission] = await db.select()
      .from(toolSubmissions).where(eq(toolSubmissions.id, submissionId));
    if (submission) {
      // Update founder status to verified
      await db.update(users).set({
        founderStatus: "verified",
        founderVerifiedAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(users.id, submission.userId));

      // Check if a tool already exists for this submission (by name + website)
      const [existingTool] = await db.select({ id: tools.id })
        .from(tools)
        .where(eq(tools.name, submission.name))
        .limit(1);

      if (!existingTool) {
        // Create the tool from the submission
        let slug = submission.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        // L4: Prevent slug collisions by appending a numeric suffix if needed
        const [slugConflict] = await db.select({ id: tools.id })
          .from(tools)
          .where(eq(tools.slug, slug))
          .limit(1);
        if (slugConflict) {
          slug = `${slug}-${Date.now().toString(36)}`;
        }

        const now = new Date();
        const hasScheduledLaunch = submission.launchDate && new Date(submission.launchDate) > now;

        await db.insert(tools).values({
          slug,
          name: submission.name,
          tagline: submission.tagline,
          description: submission.description,
          logoUrl: submission.logoUrl ?? null,
          websiteUrl: submission.website,
          category: submission.category ?? "Other",
          pricingModel: (submission.pricingModel as any) ?? "Freemium",
          tags: submission.tags ? JSON.parse(submission.tags) : [],
          submittedBy: submission.userId,
          // L1: Auto-assign ownership and verification to the submitting founder
          claimedBy: submission.userId,
          claimedAt: now,
          isVerified: true,
          status: "approved",
          isVisible: hasScheduledLaunch ? false : true,
          // If founder set a future launch date, put it on the upcoming page
          scheduledLaunchAt: hasScheduledLaunch ? new Date(submission.launchDate!) : null,
          // L5: For scheduled launches, set launchedAt to the scheduled time (cron will clear scheduledLaunchAt)
          // For immediate launches, set launchedAt to now
          launchedAt: hasScheduledLaunch ? new Date(submission.launchDate!) : now,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  }

  // Notify the founder about the submission decision
  try {
    const [sub] = await db.select({ userId: toolSubmissions.userId, name: toolSubmissions.name })
      .from(toolSubmissions).where(eq(toolSubmissions.id, submissionId));
    if (sub) {
      await createNotification({
        recipientId: sub.userId,
        type: action === "approved" ? "submission_approved" : "submission_rejected",
        title: action === "approved" ? "Your tool has been approved!" : "Tool submission update",
        message: action === "approved"
          ? `${sub.name} has been approved and is now live on LaudStack.`
          : `Your submission for ${sub.name} was not approved.${notes ? ` Reason: ${notes}` : ""}`,
        link: action === "approved" ? "/founder" : "/launch",
      });
    }
  } catch (e) {
    console.error("[reviewSubmission] notification error:", e);
  }

  return { success: true };
}

/// ─── Reviews Management (Full Moderation) ─────────────────────────────────

/** Recalculate tool stats and rank score after an admin review mutation */
async function recalcToolStats(toolId: number) {
  await recalcAndPersistToolScore(toolId);
}

export async function getAdminReviews(opts: {
  search?: string;
  page?: number;
  filter?: 'all' | 'published' | 'hidden' | 'removed' | 'pending' | 'flagged';
} = {}) {
  await requireAdmin();
  const { search, page = 1, filter = 'all' } = opts;
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions: any[] = [];
  if (search) {
    conditions.push(or(
      ilike(reviews.body, `%${search}%`),
      ilike(reviews.title, `%${search}%`)
    ));
  }
  if (filter === 'flagged') {
    conditions.push(eq(reviews.isFlagged, true));
  } else if (filter !== 'all') {
    conditions.push(eq(reviews.status, filter));
  }

  const [rows, total] = await Promise.all([
    db.select({
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
      ipAddress: reviews.ipAddress,
      userAgent: reviews.userAgent,
      isFlagged: reviews.isFlagged,
      flagReason: reviews.flagReason,
      flaggedBy: reviews.flaggedBy,
      flaggedAt: reviews.flaggedAt,
      moderationNote: reviews.moderationNote,
      moderatedBy: reviews.moderatedBy,
      moderatedAt: reviews.moderatedAt,
      createdAt: reviews.createdAt,
      updatedAt: reviews.updatedAt,
      userName: users.name,
      userFirstName: users.firstName,
      userLastName: users.lastName,
      userEmail: users.email,
      userAvatar: users.avatarUrl,
      toolName: tools.name,
      toolSlug: tools.slug,
      toolLogo: tools.logoUrl,
    })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .leftJoin(tools, eq(reviews.toolId, tools.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(reviews.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(reviews)
      .where(conditions.length ? and(...conditions) : undefined),
  ]);

  // Get counts for each filter tab
  const [allCount, publishedCount, hiddenCount, removedCount, pendingCount, flaggedCount] = await Promise.all([
    db.select({ count: count() }).from(reviews),
    db.select({ count: count() }).from(reviews).where(eq(reviews.status, "published")),
    db.select({ count: count() }).from(reviews).where(eq(reviews.status, "hidden")),
    db.select({ count: count() }).from(reviews).where(eq(reviews.status, "removed")),
    db.select({ count: count() }).from(reviews).where(eq(reviews.status, "pending")),
    db.select({ count: count() }).from(reviews).where(eq(reviews.isFlagged, true)),
  ]);

  const enrichedRows = rows.map(r => ({
    ...r,
    userName: (r.userFirstName ? [r.userFirstName, r.userLastName].filter(Boolean).join(' ') : null) ?? r.userName ?? 'Anonymous',
  }));

  return {
    reviews: enrichedRows,
    total: total[0].count,
    page,
    limit,
    counts: {
      all: allCount[0].count,
      published: publishedCount[0].count,
      hidden: hiddenCount[0].count,
      removed: removedCount[0].count,
      pending: pendingCount[0].count,
      flagged: flaggedCount[0].count,
    },
  };
}

/** Approve a review (set status to published) */
export async function approveReview(reviewId: number) {
  const admin = await requireAdmin();
  const review = await db.query.reviews.findFirst({ where: eq(reviews.id, reviewId) });
  if (!review) return { success: false, error: "Review not found" };

  await db.update(reviews).set({
    status: "published",
    isFlagged: false,
    flagReason: null,
    moderationNote: null,
    moderatedBy: admin.id,
    moderatedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(reviews.id, reviewId));

  await recalcToolStats(review.toolId);
  return { success: true };
}

/** Hide a review (not visible to public, but not deleted) */
export async function hideReview(reviewId: number, note?: string) {
  const admin = await requireAdmin();
  const review = await db.query.reviews.findFirst({ where: eq(reviews.id, reviewId) });
  if (!review) return { success: false, error: "Review not found" };

  await db.update(reviews).set({
    status: "hidden",
    moderationNote: note?.trim() || null,
    moderatedBy: admin.id,
    moderatedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(reviews.id, reviewId));

  await recalcToolStats(review.toolId);
  return { success: true };
}

/** Remove a review (soft-delete, marked as removed) */
export async function removeReview(reviewId: number, note?: string) {
  const admin = await requireAdmin();
  const review = await db.query.reviews.findFirst({ where: eq(reviews.id, reviewId) });
  if (!review) return { success: false, error: "Review not found" };

  await db.update(reviews).set({
    status: "removed",
    moderationNote: note?.trim() || "Removed by admin",
    moderatedBy: admin.id,
    moderatedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(reviews.id, reviewId));

  // Log moderation action
  await db.insert(moderationLogs).values({
    toolId: review.toolId,
    adminId: admin.id,
    action: "review_removed",
    previousStatus: review.status,
    newStatus: "removed",
    notes: note?.trim() || `Review #${reviewId} removed`,
  });

  await recalcToolStats(review.toolId);
  return { success: true };
}

/** Permanently delete a review */
export async function deleteReview(reviewId: number) {
  const admin = await requireAdmin();
  const review = await db.query.reviews.findFirst({ where: eq(reviews.id, reviewId) });
  if (!review) return { success: false, error: "Review not found" };

  await db.delete(reviews).where(eq(reviews.id, reviewId));

  // Log moderation action
  await db.insert(moderationLogs).values({
    toolId: review.toolId,
    adminId: admin.id,
    action: "review_deleted",
    previousStatus: review.status,
    newStatus: "deleted",
    notes: `Review #${reviewId} permanently deleted`,
  });

  await recalcToolStats(review.toolId);
  return { success: true };
}

/** Reject a founder's flag (unflag the review) */
export async function rejectFlag(reviewId: number, note?: string) {
  const admin = await requireAdmin();
  const review = await db.query.reviews.findFirst({ where: eq(reviews.id, reviewId) });
  if (!review) return { success: false, error: "Review not found" };

  await db.update(reviews).set({
    isFlagged: false,
    flagReason: null,
    moderationNote: note?.trim() || "Flag rejected by admin",
    moderatedBy: admin.id,
    moderatedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(reviews.id, reviewId));

  return { success: true };
}

// ─── Newsletter Subscribers ───────────────────────────────────────────────────

export async function getAdminSubscribers(opts: { search?: string; page?: number } = {}) {
  await requireAdmin();
  const { search, page = 1 } = opts;
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (search) conditions.push(ilike(newsletterSubscribers.email, `%${search}%`));

  const [rows, total] = await Promise.all([
    db.select().from(newsletterSubscribers)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(newsletterSubscribers.subscribedAt)).limit(limit).offset(offset),
    db.select({ count: count() }).from(newsletterSubscribers)
      .where(conditions.length ? and(...conditions) : undefined),
  ]);
  return { subscribers: rows, total: total[0].count, page, limit };
}

// ─── Tool Claims Management ───────────────────────────────────────────────────


export async function reviewClaim(claimId: number, action: "approved" | "rejected") {
  await requireAdmin();
  
  // Get the claim details
  const claim = await db.query.toolClaims.findFirst({
    where: eq(toolClaims.id, claimId),
  });
  if (!claim) return { success: false, error: "Claim not found" };

  await db.update(toolClaims).set({
    status: action,
    updatedAt: new Date(),
  }).where(eq(toolClaims.id, claimId));

  // Look up the user and tool for email notification
  const claimUser = await db.query.users.findFirst({
    where: eq(users.id, claim.userId),
    columns: { id: true, email: true, founderStatus: true },
  });
  const claimTool = claim.toolId ? await db.query.tools.findFirst({
    where: eq(tools.id, claim.toolId),
    columns: { id: true, name: true, slug: true },
  }) : null;

  // If approved, update the tool to set claimedBy and submittedBy
  if (action === "approved" && claim.toolId && claim.userId) {
    await db.update(tools).set({
      claimedBy: claim.userId,
      claimedAt: new Date(),
      submittedBy: claim.userId,
      updatedAt: new Date(),
    }).where(eq(tools.id, claim.toolId));

    // Also upgrade user to founder if not already
    if (claimUser && claimUser.founderStatus !== "verified") {
      await db.update(users).set({
        founderStatus: "verified",
        updatedAt: new Date(),
      }).where(eq(users.id, claim.userId));
    }

    // Send approval email
    if (claimUser?.email && claimTool) {
      sendClaimApprovedEmail(claimUser.email, claimTool.name, claimTool.slug).catch(() => {});
    }
  } else if (action === "rejected") {
    // Send rejection email
    if (claimUser?.email && claimTool) {
      sendClaimRejectedEmail(claimUser.email, claimTool.name).catch(() => {});
    }
  }

  // In-app notification for the claim decision
  try {
    await createNotification({
      recipientId: claim.userId,
      type: action === "approved" ? "claim_approved" : "claim_rejected",
      title: action === "approved" ? "Your claim has been approved!" : "Claim update",
      message: action === "approved"
        ? `Your claim for ${claimTool?.name ?? "a tool"} has been approved. You now have founder access.`
        : `Your claim for ${claimTool?.name ?? "a tool"} was not approved.`,
      link: action === "approved" ? "/founder" : "/claim",
      toolId: claim.toolId ?? undefined,
    });
  } catch (e) {
    console.error("[reviewClaim] notification error:", e);
  }

  return { success: true };
}


export async function deleteSubscriber(subscriberId: number) {
  await requireAdmin();
  await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, subscriberId));
  return { success: true };
}


// ─── Platform Analytics ─────────────────────────────────────────────────────

export async function getPlatformAnalytics() {
  await requireAdmin();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [totalUsers, totalTools, totalReviews, newUsersThisWeek, newToolsThisWeek, newReviewsThisWeek, avgRating] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(tools).where(eq(tools.status, "approved")),
    db.select({ count: count() }).from(reviews),
    db.select({ count: count() }).from(users).where(sql`${users.createdAt} >= ${sevenDaysAgo.toISOString()}::timestamp`),
    db.select({ count: count() }).from(tools).where(sql`${tools.createdAt} >= ${sevenDaysAgo.toISOString()}::timestamp`),
    db.select({ count: count() }).from(reviews).where(sql`${reviews.createdAt} >= ${sevenDaysAgo.toISOString()}::timestamp`),
    db.select({ avg: sql<number>`COALESCE(AVG(${reviews.rating}), 0)` }).from(reviews),
  ]);

  return {
    totalUsers: totalUsers[0].count,
    totalTools: totalTools[0].count,
    totalReviews: totalReviews[0].count,
    newUsersThisWeek: newUsersThisWeek[0].count,
    newToolsThisWeek: newToolsThisWeek[0].count,
    newReviewsThisWeek: newReviewsThisWeek[0].count,
    avgRating: Number(avgRating[0].avg).toFixed(1),
  };
}

// ─── Revenue Stats ─────────────────────────────────────────────────────────

export async function getRevenueStats() {
  await requireAdmin();
  // Placeholder until Stripe is integrated
  return {
    totalRevenue: 0,
    monthlyRevenue: [] as { month: string; revenue: number }[],
    activeSubscriptions: 0,
    activeUpgrades: 0,
    featuredUpgrades: 0,
    revenueGrowth: [] as { month: string; revenue: number }[],
    revenueByTier: [] as { tier: string; count: number; revenue: number }[],
  };
}

// ─── Admin Deals CRUD ─────────────────────────────────────────────────────

export async function getAdminDeals(opts: {
  approvalStatus?: string;
  placement?: string;
  page?: number;
} = {}) {
  await requireAdmin();
  const { approvalStatus, placement, page = 1 } = opts;
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions: ReturnType<typeof eq>[] = [];
  if (approvalStatus && approvalStatus !== "all") {
    conditions.push(eq(deals.approvalStatus, approvalStatus as "pending" | "approved" | "rejected"));
  }
  if (placement && placement !== "all") {
    conditions.push(eq(deals.placement, placement as "none" | "pinned" | "featured" | "deal_of_day"));
  }

  const [rows, total, pendingCount] = await Promise.all([
    db
      .select({
        id: deals.id,
        title: deals.title,
        description: deals.description,
        dealType: deals.dealType,
        discountPercent: deals.discountPercent,
        originalPrice: deals.originalPrice,
        dealPrice: deals.dealPrice,
        couponCode: deals.couponCode,
        dealUrl: deals.dealUrl,
        placement: deals.placement,
        approvalStatus: deals.approvalStatus,
        isActive: deals.isActive,
        expiresAt: deals.expiresAt,
        startsAt: deals.startsAt,
        claimCount: deals.claimCount,
        maxClaims: deals.maxClaims,
        createdAt: deals.createdAt,
        createdBy: deals.createdBy,
        toolId: deals.toolId,
        placementExpiresAt: deals.placementExpiresAt,
        placementPlan: deals.placementPlan,
        placementPaidAmount: deals.placementPaidAmount,
        placementStripeSessionId: deals.placementStripeSessionId,
        toolName: tools.name,
        toolSlug: tools.slug,
        toolLogo: tools.logoUrl,
        founderName: users.name,
        founderEmail: users.email,
      })
      .from(deals)
      .leftJoin(tools, eq(deals.toolId, tools.id))
      .leftJoin(users, eq(deals.createdBy, users.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(deals.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(deals)
      .where(conditions.length ? and(...conditions) : undefined),
    db.select({ count: count() }).from(deals)
      .where(eq(deals.approvalStatus, "pending")),
  ]);

  return { deals: rows, total: total[0].count, pendingCount: pendingCount[0].count, page, limit };
}

export async function createAdminDeal(data: {
  title: string;
  toolSlug: string;
  dealType?: "discount" | "lifetime" | "free_trial" | "exclusive";
  discountPercent?: number;
  originalPrice?: string;
  dealPrice?: string;
  couponCode?: string;
  dealUrl?: string;
  description?: string;
  placement?: "none" | "pinned" | "featured" | "deal_of_day";
  expiresAt?: string;
  maxClaims?: number;
}) {
  const admin = await requireAdmin();

  // Find the product by slug
  const [tool] = await db
    .select({ id: tools.id })
    .from(tools)
    .where(eq(tools.slug, data.toolSlug))
    .limit(1);

  if (!tool) return { success: false, error: "Tool not found with that slug" };

  await db.insert(deals).values({
    title: data.title,
    toolId: tool.id,
    dealType: data.dealType || "discount",
    discountPercent: data.discountPercent ?? null,
    originalPrice: data.originalPrice || null,
    dealPrice: data.dealPrice || null,
    couponCode: data.couponCode || null,
    dealUrl: data.dealUrl || null,
    description: data.description || null,
    placement: data.placement || "none",
    approvalStatus: "approved", // Admin-created deals are auto-approved
    isActive: true,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    maxClaims: data.maxClaims ?? null,
    createdBy: admin.id,
  });

  // Admin-created deals are auto-approved — notify followers immediately
  const toolInfo = await db.query.tools.findFirst({
    where: eq(tools.id, tool.id),
    columns: { name: true, slug: true },
  });
  if (toolInfo) {
    notifyStackFollowersAboutDeal({
      toolId: tool.id,
      toolName: toolInfo.name,
      toolSlug: toolInfo.slug,
      dealTitle: data.title,
    }).catch((err) => console.error("[createAdminDeal] Follower notification failed:", err));
  }

  return { success: true };
}

export async function approveDeal(dealId: number) {
  const _admin = await requireAdmin();

  const deal = await db.query.deals.findFirst({
    where: eq(deals.id, dealId),
  });
  if (!deal) return { success: false, error: "Deal not found" };
  if (deal.approvalStatus === "approved") return { success: false, error: "Deal is already approved" };

  await db.update(deals).set({
    approvalStatus: "approved",
    isActive: true,
    updatedAt: new Date(),
  }).where(eq(deals.id, dealId));

  // Notify the founder who created the deal
  if (deal.createdBy) {
    const tool = await db.query.tools.findFirst({
      where: eq(tools.id, deal.toolId),
      columns: { name: true, slug: true },
    });
    const founder = await db.query.users.findFirst({
      where: eq(users.id, deal.createdBy),
      columns: { email: true },
    });
    if (founder?.email && tool) {
      sendDealApprovalEmail(founder.email, {
        dealTitle: deal.title,
        toolName: tool.name,
        toolSlug: tool.slug,
      }).catch((err) => console.error("[approveDeal] Email failed:", err));
    }
    // In-app notification to founder
    createNotification({
      recipientId: deal.createdBy,
      type: "system",
      title: "Deal Approved",
      message: `Your deal "${deal.title}" has been approved and is now live!`,
      link: tool ? `/tools/${tool.slug}` : "/deals",
      toolId: deal.toolId,
    }).catch(() => {});

    // Notify followers of this stack about the new deal
    if (tool) {
      notifyStackFollowersAboutDeal({
        toolId: deal.toolId,
        toolName: tool.name,
        toolSlug: tool.slug,
        dealTitle: deal.title,
      }).catch((err) => console.error("[approveDeal] Follower notification failed:", err));
    }
  }

  return { success: true };
}

export async function rejectDeal(dealId: number, reason?: string) {
  const _admin = await requireAdmin();

  const deal = await db.query.deals.findFirst({
    where: eq(deals.id, dealId),
  });
  if (!deal) return { success: false, error: "Deal not found" };
  if (deal.approvalStatus === "rejected") return { success: false, error: "Deal is already rejected" };

  await db.update(deals).set({
    approvalStatus: "rejected",
    isActive: false,
    updatedAt: new Date(),
  }).where(eq(deals.id, dealId));

  // Notify the founder
  if (deal.createdBy) {
    const tool = await db.query.tools.findFirst({
      where: eq(tools.id, deal.toolId),
      columns: { name: true, slug: true },
    });
    const founder = await db.query.users.findFirst({
      where: eq(users.id, deal.createdBy),
      columns: { email: true },
    });
    if (founder?.email && tool) {
      sendDealRejectionEmail(founder.email, {
        dealTitle: deal.title,
        toolName: tool.name,
        reason,
      }).catch((err) => console.error("[rejectDeal] Email failed:", err));
    }
    // In-app notification
    createNotification({
      recipientId: deal.createdBy,
      type: "system",
      title: "Deal Not Approved",
      message: `Your deal "${deal.title}" was not approved.${reason ? ` Reason: ${reason}` : ""}`,
      link: "/dashboard/founder",
      toolId: deal.toolId,
    }).catch(() => {});
  }

  return { success: true };
}

export async function updateDealPlacement(
  dealId: number,
  placement: "none" | "pinned" | "featured" | "deal_of_day"
) {
  await requireAdmin();

  const deal = await db.query.deals.findFirst({
    where: eq(deals.id, dealId),
  });
  if (!deal) return { success: false, error: "Deal not found" };

  // If setting deal_of_day, clear any existing deal_of_day
  if (placement === "deal_of_day") {
    await db.update(deals).set({
      placement: "none",
      updatedAt: new Date(),
    }).where(eq(deals.placement, "deal_of_day"));
  }

  await db.update(deals).set({
    placement,
    updatedAt: new Date(),
  }).where(eq(deals.id, dealId));

  return { success: true };
}

export async function editDeal(dealId: number, data: {
  title?: string;
  description?: string;
  dealType?: "discount" | "lifetime" | "free_trial" | "exclusive";
  discountPercent?: number | null;
  originalPrice?: string | null;
  dealPrice?: string | null;
  couponCode?: string | null;
  dealUrl?: string | null;
  expiresAt?: string | null;
  maxClaims?: number | null;
  placement?: "none" | "pinned" | "featured" | "deal_of_day";
}) {
  await requireAdmin();

  const deal = await db.query.deals.findFirst({
    where: eq(deals.id, dealId),
  });
  if (!deal) return { success: false, error: "Deal not found" };

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.dealType !== undefined) updateData.dealType = data.dealType;
  if (data.discountPercent !== undefined) updateData.discountPercent = data.discountPercent;
  if (data.originalPrice !== undefined) updateData.originalPrice = data.originalPrice;
  if (data.dealPrice !== undefined) updateData.dealPrice = data.dealPrice;
  if (data.couponCode !== undefined) updateData.couponCode = data.couponCode;
  if (data.dealUrl !== undefined) updateData.dealUrl = data.dealUrl;
  if (data.maxClaims !== undefined) updateData.maxClaims = data.maxClaims;
  if (data.placement !== undefined) updateData.placement = data.placement;
  if (data.expiresAt !== undefined) {
    updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
  }

  await db.update(deals).set(updateData).where(eq(deals.id, dealId));
  return { success: true };
}

export async function toggleAdminDealStatus(dealId: number) {
  await requireAdmin();

  const [deal] = await db
    .select({ isActive: deals.isActive })
    .from(deals)
    .where(eq(deals.id, dealId))
    .limit(1);

  if (!deal) return { success: false, error: "Deal not found" };

  await db
    .update(deals)
    .set({ isActive: !deal.isActive, updatedAt: new Date() })
    .where(eq(deals.id, dealId));

  return { success: true };
}

export async function deleteAdminDeal(dealId: number) {
  await requireAdmin();
  // Delete associated claims first
  await db.delete(dealClaims).where(eq(dealClaims.dealId, dealId));
  await db.delete(deals).where(eq(deals.id, dealId));
  return { success: true };
}

export async function getDealClaimAnalytics(dealId: number) {
  await requireAdmin();

  const deal = await db.query.deals.findFirst({
    where: eq(deals.id, dealId),
  });
  if (!deal) return { success: false, error: "Deal not found" };

  const claims = await db
    .select({
      id: dealClaims.id,
      userId: dealClaims.userId,
      claimedAt: dealClaims.claimedAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(dealClaims)
    .leftJoin(users, eq(dealClaims.userId, users.id))
    .where(eq(dealClaims.dealId, dealId))
    .orderBy(desc(dealClaims.claimedAt));

  return {
    success: true,
    deal: {
      id: deal.id,
      title: deal.title,
      claimCount: deal.claimCount,
      maxClaims: deal.maxClaims,
    },
    claims,
  };
}

// ─── Admin Tool Detail ──────────────────────────────────────────────────────

export async function getAdminToolDetail(toolId: number) {
  await requireAdmin();
  const tool = await db.query.tools.findFirst({
    where: eq(tools.id, toolId),
  });
  if (!tool) return null;

  // Get screenshots
  const screenshots = await db.select().from(toolScreenshots)
    .where(eq(toolScreenshots.toolId, toolId))
    .orderBy(toolScreenshots.sortOrder);

  // Get reviews
  const toolReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      title: reviews.title,
      body: reviews.body,
      pros: reviews.pros,
      cons: reviews.cons,
      isVerified: reviews.isVerified,
      createdAt: reviews.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.toolId, toolId))
    .orderBy(desc(reviews.createdAt))
    .limit(100);

  // Get founder/submitter info
  let founderInfo = null;
  const ownerId = tool.claimedBy || tool.submittedBy;
  if (ownerId) {
    const owner = await db.query.users.findFirst({
      where: eq(users.id, ownerId),
      columns: { id: true, name: true, email: true, avatarUrl: true, founderStatus: true, founderBio: true, founderWebsite: true },
    });
    if (owner) founderInfo = owner;
  }

  // Get moderation logs
  const modLogs = await db
    .select({
      id: moderationLogs.id,
      action: moderationLogs.action,
      notes: moderationLogs.notes,
      createdAt: moderationLogs.createdAt,
      staffName: users.name,
    })
    .from(moderationLogs)
    .leftJoin(users, eq(moderationLogs.adminId, users.id))
    .where(eq(moderationLogs.toolId, toolId))
    .orderBy(desc(moderationLogs.createdAt))
    .limit(50);

  return { tool, screenshots, reviews: toolReviews, founderInfo, modLogs };
}

// ─── Admin Update Tool (full edit) ──────────────────────────────────────────

export async function adminUpdateTool(toolId: number, data: {
  name?: string;
  tagline?: string;
  description?: string;
  shortDescription?: string;
  websiteUrl?: string;
  category?: string;
  pricingModel?: string;
  pricingDetails?: string;
  logoUrl?: string;
  screenshotUrl?: string;
  affiliateUrl?: string;
  isFeatured?: boolean;
  isSpotlighted?: boolean;
  isVisible?: boolean;
  isTrending?: boolean;
  isVerified?: boolean;
  isPro?: boolean;
  tags?: string[];
  status?: string;
  features?: { icon: string; title: string; description: string }[];
  pricingTiers?: { name: string; price: string; period?: string; description: string; features: string[]; cta: string; highlighted?: boolean; badge?: string }[];
  scheduledLaunchAt?: string | null;
}) {
  const admin = await requireAdmin();
  
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  
  if (data.name !== undefined) updateData.name = data.name;
  if (data.tagline !== undefined) updateData.tagline = data.tagline;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription;
  if (data.websiteUrl !== undefined) updateData.websiteUrl = data.websiteUrl;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.pricingModel !== undefined) updateData.pricingModel = data.pricingModel;
  if (data.pricingDetails !== undefined) updateData.pricingDetails = data.pricingDetails;
  if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
  if (data.screenshotUrl !== undefined) updateData.screenshotUrl = data.screenshotUrl;
  if (data.affiliateUrl !== undefined) updateData.affiliateUrl = data.affiliateUrl;
  if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
  if (data.isSpotlighted !== undefined) updateData.isSpotlighted = data.isSpotlighted;
  if (data.isVisible !== undefined) updateData.isVisible = data.isVisible;
  if (data.isTrending !== undefined) updateData.isTrending = data.isTrending;
  if (data.isVerified !== undefined) updateData.isVerified = data.isVerified;
  if (data.isPro !== undefined) updateData.isPro = data.isPro;
  if (data.tags !== undefined) updateData.tags = data.tags;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.features !== undefined) updateData.features = data.features;
  if (data.pricingTiers !== undefined) updateData.pricingTiers = data.pricingTiers;
  if (data.scheduledLaunchAt !== undefined) updateData.scheduledLaunchAt = data.scheduledLaunchAt ? new Date(data.scheduledLaunchAt) : null;

  // Check if isVerified is being changed — we need the old value for email notification
  let wasVerified: boolean | null = null;
  if (data.isVerified !== undefined) {
    const existingTool = await db.query.tools.findFirst({
      where: eq(tools.id, toolId),
      columns: { isVerified: true, name: true, slug: true, claimedBy: true, submittedBy: true },
    });
    if (existingTool) {
      wasVerified = existingTool.isVerified;
    }
  }

  await db.update(tools).set(updateData).where(eq(tools.id, toolId));

  // Log moderation action if status changed
  if (data.status) {
    await db.insert(moderationLogs).values({
      toolId,
      adminId: admin.id,
      action: `status_changed_to_${data.status}`,
      notes: `Admin updated tool status to ${data.status}`,
    });
  }

  // Send verification email if isVerified changed
  if (data.isVerified !== undefined && data.isVerified !== wasVerified) {
    const tool = await db.query.tools.findFirst({
      where: eq(tools.id, toolId),
      columns: { name: true, slug: true, claimedBy: true, submittedBy: true },
    });
    if (tool) {
      const ownerId = tool.claimedBy || tool.submittedBy;
      if (ownerId) {
        const owner = await db.query.users.findFirst({
          where: eq(users.id, ownerId),
          columns: { email: true },
        });
        if (owner?.email) {
          sendVerificationOutcomeEmail(owner.email, tool.name, tool.slug, data.isVerified).catch(() => {});
        }
      }
    }
    await db.insert(moderationLogs).values({
      toolId,
      adminId: admin.id,
      action: data.isVerified ? "verified" : "unverified",
      notes: `Admin ${data.isVerified ? "verified" : "removed verification from"} tool`,
    });
  }

  return { success: true };
}

// ─── Admin Moderation Actions ───────────────────────────────────────────────

export async function adminSuspendTool(toolId: number, reason: string) {
  const admin = await requireAdmin();
  await db.update(tools).set({
    status: "suspended",
    isVisible: false,
    updatedAt: new Date(),
  }).where(eq(tools.id, toolId));

  await db.insert(moderationLogs).values({
    toolId,
    adminId: admin.id,
    action: "suspended",
    notes: reason,
  });

  return { success: true };
}

export async function adminUnsuspendTool(toolId: number) {
  const admin = await requireAdmin();
  await db.update(tools).set({
    status: "approved",
    isVisible: true,
    updatedAt: new Date(),
  }).where(eq(tools.id, toolId));

  await db.insert(moderationLogs).values({
    toolId,
    adminId: admin.id,
    action: "unsuspended",
    notes: "Tool reinstated by admin",
  });

  return { success: true };
}

export async function adminToggleSpotlight(toolId: number) {
  await requireAdmin();
  const tool = await db.query.tools.findFirst({
    where: eq(tools.id, toolId),
    columns: { isSpotlighted: true },
  });
  if (!tool) return { success: false, error: "Tool not found" };

  await db.update(tools).set({
    isSpotlighted: !tool.isSpotlighted,
    updatedAt: new Date(),
  }).where(eq(tools.id, toolId));

  return { success: true, isSpotlighted: !tool.isSpotlighted };
}

export async function adminToggleVisibility(toolId: number) {
  await requireAdmin();
  const tool = await db.query.tools.findFirst({
    where: eq(tools.id, toolId),
    columns: { isVisible: true },
  });
  if (!tool) return { success: false, error: "Tool not found" };

  await db.update(tools).set({
    isVisible: !tool.isVisible,
    updatedAt: new Date(),
  }).where(eq(tools.id, toolId));

  return { success: true, isVisible: !tool.isVisible };
}

// ─── Admin Screenshot Management ────────────────────────────────────────────

export async function adminAddScreenshot(toolId: number, url: string, caption?: string) {
  await requireAdmin();
  
  // Get the next sort order
  const existing = await db.select({ maxOrder: sql<number>`COALESCE(MAX(${toolScreenshots.sortOrder}), 0)` })
    .from(toolScreenshots)
    .where(eq(toolScreenshots.toolId, toolId));
  
  const nextOrder = (existing[0]?.maxOrder ?? 0) + 1;

  await db.insert(toolScreenshots).values({
    toolId,
    url,
    caption: caption ?? null,
    sortOrder: nextOrder,
  });

  return { success: true };
}

export async function adminDeleteScreenshot(screenshotId: number) {
  await requireAdmin();
  await db.delete(toolScreenshots).where(eq(toolScreenshots.id, screenshotId));
  return { success: true };
}


// ─── Admin Moderation Log ───────────────────────────────────────────────────

export async function getAdminModerationLog(toolId: number) {
  await requireAdmin();
  return db
    .select({
      id: moderationLogs.id,
      action: moderationLogs.action,
      notes: moderationLogs.notes,
      createdAt: moderationLogs.createdAt,
      adminName: users.name,
    })
    .from(moderationLogs)
    .leftJoin(users, eq(moderationLogs.adminId, users.id))
    .where(eq(moderationLogs.toolId, toolId))
    .orderBy(desc(moderationLogs.createdAt))
    .limit(50);
}


// ─── Platform Settings (key-value store) ─────────────────────────────────────

import { platformSettings } from "@/drizzle/schema";

export async function getPlatformSettings() {
  await requireAdmin();
  const rows = await db.select().from(platformSettings);
  const map: Record<string, string> = {};
  for (const r of rows) {
    map[r.key] = r.value ?? "";
  }
  return map;
}

export async function savePlatformSettings(settings: Record<string, string>) {
  await requireAdmin();
  try {
    for (const [key, value] of Object.entries(settings)) {
      // Upsert each key
      const existing = await db.query.platformSettings.findFirst({
        where: eq(platformSettings.key, key),
      });
      if (existing) {
        await db
          .update(platformSettings)
          .set({ value, updatedAt: new Date() })
          .where(eq(platformSettings.key, key));
      } else {
        await db.insert(platformSettings).values({ key, value });
      }
    }
    return { success: true };
  } catch (error) {
    console.error("[savePlatformSettings] Error:", error);
    return { success: false, error: "Failed to save settings" };
  }
}

// ─── Contact Submissions Management ──────────────────────────────────────────

export async function getContactSubmissions(opts: {
  status?: string;
  search?: string;
  page?: number;
} = {}) {
  await requireAdmin();
  const { status, search, page = 1 } = opts;
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (status && status !== "all") {
    conditions.push(eq(contactSubmissions.status, status as "new" | "read" | "replied" | "archived"));
  }
  if (search) {
    conditions.push(
      or(
        ilike(contactSubmissions.name, `%${search}%`),
        ilike(contactSubmissions.email, `%${search}%`),
        ilike(contactSubmissions.message, `%${search}%`)
      )
    );
  }

  const [rows, total, newCount] = await Promise.all([
    db
      .select()
      .from(contactSubmissions)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(contactSubmissions.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(contactSubmissions)
      .where(conditions.length ? and(...conditions) : undefined),
    db
      .select({ count: count() })
      .from(contactSubmissions)
      .where(eq(contactSubmissions.status, "new")),
  ]);

  return {
    submissions: rows,
    total: total[0].count,
    newCount: newCount[0].count,
    page,
    limit,
  };
}

export async function updateContactSubmissionStatus(
  submissionId: number,
  status: "new" | "read" | "replied" | "archived"
) {
  await requireAdmin();
  const updateData: Record<string, unknown> = { status };
  if (status === "archived") {
    updateData.archivedAt = new Date();
  }
  await db
    .update(contactSubmissions)
    .set(updateData)
    .where(eq(contactSubmissions.id, submissionId));
  return { success: true };
}

export async function addContactSubmissionNote(submissionId: number, notes: string) {
  await requireAdmin();
  await db
    .update(contactSubmissions)
    .set({ adminNotes: notes })
    .where(eq(contactSubmissions.id, submissionId));
  return { success: true };
}

export async function deleteContactSubmission(submissionId: number) {
  await requireAdmin();
  await db.delete(contactSubmissions).where(eq(contactSubmissions.id, submissionId));
  return { success: true };
}

// ─── Email Templates CRUD ───────────────────────────────────────────────────

export async function getEmailTemplates(opts: {
  recipient?: string;
} = {}) {
  await requireAdmin();
  const conditions: any[] = [];
  if (opts.recipient && opts.recipient !== "all") {
    conditions.push(eq(emailTemplates.recipient, opts.recipient as "user" | "founder" | "admin"));
  }
  const rows = await db
    .select()
    .from(emailTemplates)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(emailTemplates.id);
  return rows;
}

export async function toggleEmailTemplate(templateId: number) {
  await requireAdmin();
  const [existing] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, templateId));
  if (!existing) throw new Error("Template not found");
  await db.update(emailTemplates)
    .set({ isActive: !existing.isActive, updatedAt: new Date() })
    .where(eq(emailTemplates.id, templateId));
  return { success: true, isActive: !existing.isActive };
}

export async function updateEmailTemplate(templateId: number, data: {
  name?: string;
  subject?: string;
  trigger?: string;
  recipient?: "user" | "founder" | "admin";
  bodyHtml?: string;
  bodyText?: string;
  preview?: string;
}) {
  await requireAdmin();
  await db.update(emailTemplates)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(emailTemplates.id, templateId));
  return { success: true };
}

export async function createEmailTemplate(data: {
  name: string;
  subject: string;
  trigger: string;
  recipient: "user" | "founder" | "admin";
  preview?: string;
}) {
  await requireAdmin();
  const [row] = await db.insert(emailTemplates).values(data).returning();
  return row;
}

export async function deleteEmailTemplate(templateId: number) {
  await requireAdmin();
  await db.delete(emailTemplates).where(eq(emailTemplates.id, templateId));
  return { success: true };
}

// ─── Admin Sidebar Badge Counts ─────────────────────────────────────────────

export async function getAdminBadgeCounts() {
  await requireAdmin();
  try {
    const [pendingSubmissions] = await db
      .select({ count: count() })
      .from(toolSubmissions)
      .where(eq(toolSubmissions.status, "pending"));
    
    const [pendingClaims] = await db
      .select({ count: count() })
      .from(toolClaims)
      .where(eq(toolClaims.status, "pending"));
    
    const [pendingFounders] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.founderStatus, "pending"));
    
    const [unreadMessages] = await db
      .select({ count: count() })
      .from(contactSubmissions)
      .where(eq(contactSubmissions.status, "new"));
    
    return {
      submissions: pendingSubmissions?.count ?? 0,
      claims: pendingClaims?.count ?? 0,
      founders: pendingFounders?.count ?? 0,
      messages: unreadMessages?.count ?? 0,
    };
  } catch (err) {
    console.error("[getAdminBadgeCounts] Error:", (err as Error).message);
    return { submissions: 0, claims: 0, founders: 0, messages: 0 };
  }
}


// ─── Stacks: Listed (admin-created stacks) ──────────────────────────────────

export async function getAdminListedStacks(opts: {
  search?: string;
  status?: string;
  category?: string;
  page?: number;
} = {}) {
  await requireAdmin();
  const { search, status, category, page = 1 } = opts;
  const limit = 20;
  const offset = (page - 1) * limit;

  // Listed = stacks where submittedBy IS NULL (admin-created, not founder-submitted)
  const conditions: any[] = [isNull(tools.submittedBy)];
  if (search) conditions.push(or(ilike(tools.name, `%${search}%`), ilike(tools.tagline, `%${search}%`)));
  if (status && status !== "all") conditions.push(eq(tools.status, status as any));
  if (category && category !== "all") conditions.push(eq(tools.category, category));

  const whereClause = and(...conditions);

  const [rows, total] = await Promise.all([
    db.select().from(tools)
      .where(whereClause)
      .orderBy(desc(tools.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(tools)
      .where(whereClause),
  ]);

  return { tools: rows, total: total[0].count, page, limit };
}

// ─── Stacks: Launches (founder-submitted stacks) ────────────────────────────

export async function getAdminLaunches(opts: {
  status?: string;
  search?: string;
  page?: number;
} = {}) {
  await requireAdmin();
  const { status, search, page = 1 } = opts;
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions: any[] = [];
  if (status && status !== "all") conditions.push(eq(toolSubmissions.status, status));
  if (search) conditions.push(or(
    ilike(toolSubmissions.name, `%${search}%`),
    ilike(toolSubmissions.tagline, `%${search}%`)
  ));

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const [rows, total] = await Promise.all([
    db.select({
      id: toolSubmissions.id,
      userId: toolSubmissions.userId,
      name: toolSubmissions.name,
      tagline: toolSubmissions.tagline,
      website: toolSubmissions.website,
      description: toolSubmissions.description,
      logoUrl: toolSubmissions.logoUrl,
      launchDate: toolSubmissions.launchDate,
      category: toolSubmissions.category,
      tags: toolSubmissions.tags,
      pricingModel: toolSubmissions.pricingModel,
      screenshots: toolSubmissions.screenshots,
      demoVideoUrl: toolSubmissions.demoVideoUrl,
      verifyMethod: toolSubmissions.verifyMethod,
      founderName: toolSubmissions.founderName,
      founderRole: toolSubmissions.founderRole,
      founderBio: toolSubmissions.founderBio,
      founderLinkedin: toolSubmissions.founderLinkedin,
      status: toolSubmissions.status,
      reviewNotes: toolSubmissions.reviewNotes,
      reviewedAt: toolSubmissions.reviewedAt,
      createdAt: toolSubmissions.createdAt,
      updatedAt: toolSubmissions.updatedAt,
      userName: users.name,
      userEmail: users.email,
      userAvatar: users.avatarUrl,
    })
      .from(toolSubmissions)
      .leftJoin(users, eq(toolSubmissions.userId, users.id))
      .where(whereClause)
      .orderBy(desc(toolSubmissions.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(toolSubmissions)
      .where(whereClause),
  ]);

  // Get counts for each status tab
  const [allCount, pendingCount, approvedCount, rejectedCount] = await Promise.all([
    db.select({ count: count() }).from(toolSubmissions),
    db.select({ count: count() }).from(toolSubmissions).where(eq(toolSubmissions.status, "pending")),
    db.select({ count: count() }).from(toolSubmissions).where(eq(toolSubmissions.status, "approved")),
    db.select({ count: count() }).from(toolSubmissions).where(eq(toolSubmissions.status, "rejected")),
  ]);

  return {
    launches: rows,
    total: total[0].count,
    page,
    limit,
    counts: {
      all: allCount[0].count,
      pending: pendingCount[0].count,
      approved: approvedCount[0].count,
      rejected: rejectedCount[0].count,
    },
  };
}

// ─── Stacks: Claimed (founder-claimed stacks) ──────────────────────────────

export async function getAdminClaimedStacks(opts: {
  status?: string;
  search?: string;
  page?: number;
} = {}) {
  await requireAdmin();
  const { status, search, page = 1 } = opts;
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions: any[] = [];
  if (status && status !== "all") conditions.push(eq(toolClaims.status, status));
  if (search) {
    conditions.push(or(
      ilike(tools.name, `%${search}%`),
      ilike(users.name, `%${search}%`),
      ilike(users.email, `%${search}%`)
    ));
  }

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const [rows, total] = await Promise.all([
    db.select({
      id: toolClaims.id,
      toolId: toolClaims.toolId,
      userId: toolClaims.userId,
      status: toolClaims.status,
      notes: toolClaims.notes,
      proofUrl: toolClaims.proofUrl,
      verifyMethod: toolClaims.verifyMethod,
      createdAt: toolClaims.createdAt,
      updatedAt: toolClaims.updatedAt,
      toolName: tools.name,
      toolSlug: tools.slug,
      toolLogoUrl: tools.logoUrl,
      toolCategory: tools.category,
      toolStatus: tools.status,
      userName: users.name,
      userEmail: users.email,
      userAvatar: users.avatarUrl,
      userFounderStatus: users.founderStatus,
    })
      .from(toolClaims)
      .leftJoin(tools, eq(toolClaims.toolId, tools.id))
      .leftJoin(users, eq(toolClaims.userId, users.id))
      .where(whereClause)
      .orderBy(desc(toolClaims.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(toolClaims).where(whereClause),
  ]);

  // Get counts for each status tab
  const [allCount, pendingCount, approvedCount, rejectedCount] = await Promise.all([
    db.select({ count: count() }).from(toolClaims),
    db.select({ count: count() }).from(toolClaims).where(eq(toolClaims.status, "pending")),
    db.select({ count: count() }).from(toolClaims).where(eq(toolClaims.status, "approved")),
    db.select({ count: count() }).from(toolClaims).where(eq(toolClaims.status, "rejected")),
  ]);

  return {
    claims: rows,
    total: total[0].count,
    page,
    limit,
    counts: {
      all: allCount[0].count,
      pending: pendingCount[0].count,
      approved: approvedCount[0].count,
      rejected: rejectedCount[0].count,
    },
  };
}

