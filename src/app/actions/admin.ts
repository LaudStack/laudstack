"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db, getUserBySupabaseId } from "@/server/db";
import {
  users, tools, reviews, toolSubmissions, toolClaims,
  newsletterSubscribers, deals,
} from "@/drizzle/schema";
import { eq, desc, ilike, or, sql, and, count } from "drizzle-orm";

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

  const [rows, total] = await Promise.all([
    db.select().from(toolClaims)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(toolClaims.createdAt)).limit(limit).offset(offset),
    db.select({ count: count() }).from(toolClaims)
      .where(conditions.length ? and(...conditions) : undefined),
  ]);
  return { claims: rows, total: total[0].count, page, limit };
}

export async function reviewClaim(claimId: number, action: "approved" | "rejected") {
  await requireAdmin();
  await db.update(toolClaims).set({
    status: action,
    updatedAt: new Date(),
  }).where(eq(toolClaims.id, claimId));
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
