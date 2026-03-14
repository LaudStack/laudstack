"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db, getUserBySupabaseId } from "@/server/db";
import {
  users, tools, reviews, toolSubmissions, toolClaims,
  newsletterSubscribers, deals, toolScreenshots, moderationLogs,
} from "@/drizzle/schema";
import { eq, desc, ilike, or, sql, and, count } from "drizzle-orm";
import {
  sendClaimApprovedEmail,
  sendClaimRejectedEmail,
  sendVerificationOutcomeEmail,
  sendPromotionOutcomeEmail,
} from "@/server/email";

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function requireAdmin() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(list: { name: string; value: string; options?: Record<string, unknown> }[]) {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    }
  );
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (!supabaseUser) throw new Error("UNAUTHORIZED");
  const dbUser = await getUserBySupabaseId(supabaseUser.id);
  if (!dbUser || (dbUser.role !== "admin" && dbUser.role !== "super_admin")) throw new Error("FORBIDDEN");
  return dbUser;
}

async function requireSuperAdmin() {
  const dbUser = await requireAdmin();
  if (dbUser.role !== "super_admin") throw new Error("FORBIDDEN: Super admin required");
  return dbUser;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export async function getAdminStats() {
  await requireAdmin();
  const [
    totalUsers, totalTools, totalReviews, pendingSubmissions,
    pendingClaims, pendingFounders, approvedTools,
  ] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(tools),
    db.select({ count: count() }).from(reviews),
    db.select({ count: count() }).from(toolSubmissions).where(eq(toolSubmissions.status, "pending")),
    db.select({ count: count() }).from(toolClaims).where(eq(toolClaims.status, "pending")),
    db.select({ count: count() }).from(users).where(eq(users.founderStatus, "pending")),
    db.select({ count: count() }).from(tools).where(eq(tools.status, "approved")),
  ]);
  return {
    totalUsers: totalUsers[0].count,
    totalTools: totalTools[0].count,
    totalReviews: totalReviews[0].count,
    pendingSubmissions: pendingSubmissions[0].count,
    pendingClaims: pendingClaims[0].count,
    pendingFounders: pendingFounders[0].count,
    approvedTools: approvedTools[0].count,
  };
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

export async function updateUserRole(userId: number, role: "user" | "admin" | "super_admin") {
  const admin = await requireAdmin();
  // Only super_admin can assign super_admin role
  if (role === "super_admin" && admin.role !== "super_admin") throw new Error("FORBIDDEN: Only super admins can assign super admin role");
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

export async function getAdminTools(opts: { search?: string; status?: string; category?: string; page?: number } = {}) {
  await requireAdmin();
  const { search, status, category, page = 1 } = opts;
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (search) conditions.push(or(ilike(tools.name, `%${search}%`), ilike(tools.tagline, `%${search}%`)));
  if (status && status !== "all") conditions.push(eq(tools.status, status as "pending" | "approved" | "rejected" | "featured"));
  if (category && category !== "all") conditions.push(eq(tools.category, category));

  const [rows, total] = await Promise.all([
    db.select().from(tools)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(tools.createdAt)).limit(limit).offset(offset),
    db.select({ count: count() }).from(tools)
      .where(conditions.length ? and(...conditions) : undefined),
  ]);
  return { tools: rows, total: total[0].count, page, limit };
}

export async function updateToolStatus(toolId: number, status: "pending" | "approved" | "rejected" | "featured") {
  await requireAdmin();
  await db.update(tools).set({ status, updatedAt: new Date() }).where(eq(tools.id, toolId));
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

export async function getAdminSubmissions(opts: { status?: string; page?: number } = {}) {
  await requireAdmin();
  const { status, page = 1 } = opts;
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (status && status !== "all") conditions.push(eq(toolSubmissions.status, status));

  const [rows, total] = await Promise.all([
    db.select().from(toolSubmissions)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(toolSubmissions.createdAt)).limit(limit).offset(offset),
    db.select({ count: count() }).from(toolSubmissions)
      .where(conditions.length ? and(...conditions) : undefined),
  ]);
  return { submissions: rows, total: total[0].count, page, limit };
}

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

  // If approved, update the submitter's founderStatus to verified
  if (action === "approved") {
    const [submission] = await db.select({ userId: toolSubmissions.userId })
      .from(toolSubmissions).where(eq(toolSubmissions.id, submissionId));
    if (submission) {
      await db.update(users).set({
        founderStatus: "verified",
        founderVerifiedAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(users.id, submission.userId));
    }
  }
  return { success: true };
}

// ─── Reviews Management ───────────────────────────────────────────────────────

export async function getAdminReviews(opts: { search?: string; page?: number } = {}) {
  await requireAdmin();
  const { search, page = 1 } = opts;
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (search) conditions.push(ilike(reviews.body, `%${search}%`));

  const [rows, total] = await Promise.all([
    db.select().from(reviews)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(reviews.createdAt)).limit(limit).offset(offset),
    db.select({ count: count() }).from(reviews)
      .where(conditions.length ? and(...conditions) : undefined),
  ]);
  return { reviews: rows, total: total[0].count, page, limit };
}

export async function deleteReview(reviewId: number) {
  await requireAdmin();
  await db.delete(reviews).where(eq(reviews.id, reviewId));
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

export async function getAdminClaims(opts: { status?: string; page?: number } = {}) {
  await requireAdmin();
  const { status, page = 1 } = opts;
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (status && status !== "all") conditions.push(eq(toolClaims.status, status));

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
      userName: users.name,
      userEmail: users.email,
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
  return { claims: rows, total: total[0].count, page, limit };
}

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

  return { success: true };
}

// ─── Platform Stats for Charts ────────────────────────────────────────────────

export async function getGrowthData() {
  await requireAdmin();
  // Get user signups per day for last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const userGrowth = await db
    .select({
      date: sql<string>`DATE(${users.createdAt})`,
      count: count(),
    })
    .from(users)
    .where(sql`${users.createdAt} >= ${thirtyDaysAgo}`)
    .groupBy(sql`DATE(${users.createdAt})`)
    .orderBy(sql`DATE(${users.createdAt})`);

  const toolGrowth = await db
    .select({
      date: sql<string>`DATE(${tools.createdAt})`,
      count: count(),
    })
    .from(tools)
    .where(sql`${tools.createdAt} >= ${thirtyDaysAgo}`)
    .groupBy(sql`DATE(${tools.createdAt})`)
    .orderBy(sql`DATE(${tools.createdAt})`);

  return { userGrowth, toolGrowth };
}

export async function deleteSubscriber(subscriberId: number) {
  await requireAdmin();
  await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, subscriberId));
  return { success: true };
}

// ─── Create Admin User (Super Admin only) ───────────────────────────────────

export async function createAdminUser(data: {
  email: string;
  name: string;
  role: "admin" | "super_admin";
}) {
  await requireSuperAdmin();

  // Check if user already exists by email
  const existing = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
  if (existing.length > 0) {
    // Update existing user's role
    await db.update(users).set({ role: data.role, updatedAt: new Date() }).where(eq(users.id, existing[0].id));
    return { success: true, userId: existing[0].id, action: "updated" };
  }

  // Create new user with admin role (they'll need to sign up via Supabase Auth)
  const [newUser] = await db.insert(users).values({
    supabaseId: `pending_${Date.now()}`,
    name: data.name,
    email: data.email,
    role: data.role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  }).returning({ id: users.id });
  return { success: true, userId: newUser.id, action: "created" };
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
    db.select({ count: count() }).from(users).where(sql`${users.createdAt} >= ${sevenDaysAgo}`),
    db.select({ count: count() }).from(tools).where(sql`${tools.createdAt} >= ${sevenDaysAgo}`),
    db.select({ count: count() }).from(reviews).where(sql`${reviews.createdAt} >= ${sevenDaysAgo}`),
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

export async function getAdminDeals() {
  await requireAdmin();
  return db
    .select({
      id: deals.id,
      title: deals.title,
      description: deals.description,
      discountPercent: deals.discountPercent,
      couponCode: deals.couponCode,
      dealUrl: deals.dealUrl,
      isActive: deals.isActive,
      expiresAt: deals.expiresAt,
      claimCount: deals.claimCount,
      createdAt: deals.createdAt,
      toolId: deals.toolId,
      toolName: tools.name,
      toolSlug: tools.slug,
    })
    .from(deals)
    .leftJoin(tools, eq(deals.toolId, tools.id))
    .orderBy(desc(deals.createdAt));
}

export async function createAdminDeal(data: {
  title: string;
  toolSlug: string;
  discountPercent: number;
  couponCode?: string;
  dealUrl?: string;
  description?: string;
  expiresAt?: string;
}) {
  await requireAdmin();

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
    discountPercent: data.discountPercent,
    couponCode: data.couponCode || null,
    dealUrl: data.dealUrl || null,
    description: data.description || null,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    isActive: true,
  });

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
  await db.delete(deals).where(eq(deals.id, dealId));
  return { success: true };
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

  return { tool, screenshots, reviews: toolReviews, founderInfo };
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

export async function adminGetScreenshots(toolId: number) {
  await requireAdmin();
  return db.select().from(toolScreenshots)
    .where(eq(toolScreenshots.toolId, toolId))
    .orderBy(toolScreenshots.sortOrder);
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

// ─── Admin Delete Review ────────────────────────────────────────────────────

export async function adminDeleteReview(reviewId: number, reason?: string) {
  const admin = await requireAdmin();
  
  // Get the review to find the tool
  const review = await db.query.reviews.findFirst({
    where: eq(reviews.id, reviewId),
    columns: { toolId: true },
  });
  
  if (!review) return { success: false, error: "Review not found" };

  await db.delete(reviews).where(eq(reviews.id, reviewId));

  // Recalculate tool stats
  const stats = await db.select({
    avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
    totalReviews: count(),
  }).from(reviews).where(eq(reviews.toolId, review.toolId));

  await db.update(tools).set({
    averageRating: Number(stats[0].avgRating),
    reviewCount: stats[0].totalReviews,
    updatedAt: new Date(),
  }).where(eq(tools.id, review.toolId));

  // Log the action
  await db.insert(moderationLogs).values({
    toolId: review.toolId,
    adminId: admin.id,
    action: "review_deleted",
    notes: reason || "Admin deleted review",
  });

  return { success: true };
}

// ─── Review Promotion Request ─────────────────────────────────────────────────

export async function reviewPromotionRequest(
  logId: number,
  action: "approved" | "rejected",
  notes?: string
) {
  const admin = await requireAdmin();

  // Get the moderation log entry
  const logEntry = await db.query.moderationLogs.findFirst({
    where: eq(moderationLogs.id, logId),
  });
  if (!logEntry) return { success: false, error: "Request not found" };

  // Parse the promotion type from the action field (e.g., "promotion_request_featured")
  const promotionType = logEntry.action.replace("promotion_request_", "");

  // Get the tool info
  const tool = logEntry.toolId ? await db.query.tools.findFirst({
    where: eq(tools.id, logEntry.toolId),
    columns: { id: true, name: true, slug: true, claimedBy: true, submittedBy: true, isFeatured: true },
  }) : null;

  // If approved and it's a featured request, actually feature the tool
  if (action === "approved" && tool) {
    if (promotionType === "featured") {
      await db.update(tools).set({ isFeatured: true, updatedAt: new Date() }).where(eq(tools.id, tool.id));
    } else if (promotionType === "sponsored") {
      await db.update(tools).set({ isSpotlighted: true, updatedAt: new Date() }).where(eq(tools.id, tool.id));
    }
  }

  // Log the admin decision
  await db.insert(moderationLogs).values({
    toolId: logEntry.toolId,
    adminId: admin.id,
    action: `promotion_${action}_${promotionType}`,
    notes: notes || `Admin ${action} ${promotionType} promotion request`,
  });

  // Send email notification to the founder
  if (tool) {
    const ownerId = tool.claimedBy || tool.submittedBy;
    if (ownerId) {
      const owner = await db.query.users.findFirst({
        where: eq(users.id, ownerId),
        columns: { email: true },
      });
      if (owner?.email) {
        sendPromotionOutcomeEmail(
          owner.email,
          tool.name,
          tool.slug,
          promotionType,
          action === "approved",
          notes
        ).catch(() => {});
      }
    }
  }

  return { success: true };
}
