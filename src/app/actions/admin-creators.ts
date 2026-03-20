"use server";
/**
 * Admin Creators Management — Server Actions
 *
 * Handles all admin operations for marketplace creators:
 * listing, stats, detail views, suspension, reactivation, revocation.
 */
import { db } from "@/server/db";
import { requireAdmin } from "@/lib/admin-auth";
import {
  users,
  marketplaceProducts,
  marketplaceOrders,
  marketplaceReviews,
  marketplaceOffers,
} from "@/drizzle/schema";
import {
  eq, desc, ilike, or, sql, and, count, sum, isNull, isNotNull,
} from "drizzle-orm";

// ─── Get Admin Creators (paginated list) ──────────────────────────────────────
export async function getAdminCreators(opts: {
  search?: string;
  status?: "all" | "active" | "suspended" | "pending_stripe";
  page?: number;
  limit?: number;
} = {}) {
  await requireAdmin();
  const { search, status = "all", page = 1, limit = 20 } = opts;
  const offset = (page - 1) * limit;

  const conditions: any[] = [eq(users.isMarketplaceCreator, true)];

  // Status filters
  if (status === "active") {
    conditions.push(eq(users.stripeConnectOnboarded, true));
    // Not suspended: we use a convention where creatorActivatedAt being null after isMarketplaceCreator=true means suspended
    conditions.push(isNotNull(users.creatorActivatedAt));
  } else if (status === "suspended") {
    // Suspended = isMarketplaceCreator true but creatorActivatedAt set to null (we use this as suspension flag)
    conditions.push(isNull(users.creatorActivatedAt));
  } else if (status === "pending_stripe") {
    conditions.push(eq(users.stripeConnectOnboarded, false));
  }

  // Search
  if (search?.trim()) {
    const term = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(users.name, term),
        ilike(users.email, term),
        ilike(users.firstName, term),
        ilike(users.lastName, term),
      )
    );
  }

  const whereClause = and(...conditions);

  const [rows, totalResult] = await Promise.all([
    db.select({
      id: users.id,
      name: users.name,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      avatarUrl: users.avatarUrl,
      creatorActivatedAt: users.creatorActivatedAt,
      stripeConnectAccountId: users.stripeConnectAccountId,
      stripeConnectOnboarded: users.stripeConnectOnboarded,
      createdAt: users.createdAt,
      lastSignedIn: users.lastSignedIn,
    })
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.creatorActivatedAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(users).where(whereClause),
  ]);

  // Enrich with product/revenue counts per creator
  const creatorIds = rows.map(r => r.id);
  const productCounts: Record<number, number> = {};
  const revenueTotals: Record<number, { totalRevenue: number; totalOrders: number }> = {};

  if (creatorIds.length > 0) {
    // Product counts
    const prodCounts = await db
      .select({
        creatorId: marketplaceProducts.creatorId,
        count: count(),
      })
      .from(marketplaceProducts)
      .where(sql`${marketplaceProducts.creatorId} IN (${sql.join(creatorIds.map(id => sql`${id}`), sql`, `)})`)
      .groupBy(marketplaceProducts.creatorId);

    prodCounts.forEach(r => { productCounts[r.creatorId] = r.count; });

    // Revenue totals
    const revTotals = await db
      .select({
        creatorId: marketplaceOrders.creatorId,
        totalRevenue: sum(marketplaceOrders.creatorPayout),
        totalOrders: count(),
      })
      .from(marketplaceOrders)
      .where(
        and(
          sql`${marketplaceOrders.creatorId} IN (${sql.join(creatorIds.map(id => sql`${id}`), sql`, `)})`,
          eq(marketplaceOrders.status, "completed"),
        )
      )
      .groupBy(marketplaceOrders.creatorId);

    revTotals.forEach(r => {
      revenueTotals[r.creatorId] = {
        totalRevenue: Number(r.totalRevenue) || 0,
        totalOrders: r.totalOrders,
      };
    });
  }

  const creators = rows.map(r => ({
    ...r,
    productCount: productCounts[r.id] || 0,
    totalRevenue: revenueTotals[r.id]?.totalRevenue || 0,
    totalOrders: revenueTotals[r.id]?.totalOrders || 0,
    isSuspended: r.creatorActivatedAt === null,
  }));

  return { creators, total: totalResult[0].count, page, limit };
}

// ─── Get Admin Creator Stats ──────────────────────────────────────────────────
export async function getAdminCreatorStats() {
  await requireAdmin();

  const baseCondition = eq(users.isMarketplaceCreator, true);

  const [totalResult, activeResult, suspendedResult, pendingStripeResult, revenueResult] = await Promise.all([
    db.select({ count: count() }).from(users).where(baseCondition),
    db.select({ count: count() }).from(users).where(
      and(baseCondition, isNotNull(users.creatorActivatedAt), eq(users.stripeConnectOnboarded, true))
    ),
    db.select({ count: count() }).from(users).where(
      and(baseCondition, isNull(users.creatorActivatedAt))
    ),
    db.select({ count: count() }).from(users).where(
      and(baseCondition, eq(users.stripeConnectOnboarded, false))
    ),
    db.select({
      totalRevenue: sum(marketplaceOrders.creatorPayout),
      platformFees: sum(marketplaceOrders.platformFee),
      totalOrders: count(),
    }).from(marketplaceOrders).where(eq(marketplaceOrders.status, "completed")),
  ]);

  return {
    totalCreators: totalResult[0].count,
    activeCreators: activeResult[0].count,
    suspendedCreators: suspendedResult[0].count,
    pendingStripeCreators: pendingStripeResult[0].count,
    totalCreatorRevenue: Number(revenueResult[0].totalRevenue) || 0,
    totalPlatformFees: Number(revenueResult[0].platformFees) || 0,
    totalOrders: revenueResult[0].totalOrders,
  };
}

// ─── Get Admin Creator Details (full profile) ─────────────────────────────────
export async function getAdminCreatorDetails(creatorId: number) {
  await requireAdmin();

  // Get user profile
  const [creator] = await db.select().from(users).where(eq(users.id, creatorId));
  if (!creator || !creator.isMarketplaceCreator) {
    return { error: "Creator not found" };
  }

  // Get all their marketplace products
  const products = await db
    .select()
    .from(marketplaceProducts)
    .where(eq(marketplaceProducts.creatorId, creatorId))
    .orderBy(desc(marketplaceProducts.createdAt));

  // Get all orders for this creator
  const orders = await db
    .select({
      id: marketplaceOrders.id,
      productId: marketplaceOrders.productId,
      buyerId: marketplaceOrders.buyerId,
      amount: marketplaceOrders.amount,
      platformFee: marketplaceOrders.platformFee,
      creatorPayout: marketplaceOrders.creatorPayout,
      status: marketplaceOrders.status,
      createdAt: marketplaceOrders.createdAt,
    })
    .from(marketplaceOrders)
    .where(eq(marketplaceOrders.creatorId, creatorId))
    .orderBy(desc(marketplaceOrders.createdAt))
    .limit(50);

  // Get reviews on their products
  const productIds = products.map(p => p.id);
  let reviews: any[] = [];
  if (productIds.length > 0) {
    reviews = await db
      .select({
        id: marketplaceReviews.id,
        productId: marketplaceReviews.productId,
        userId: marketplaceReviews.userId,
        rating: marketplaceReviews.rating,
        title: marketplaceReviews.title,
        body: marketplaceReviews.body,
        status: marketplaceReviews.status,
        createdAt: marketplaceReviews.createdAt,
      })
      .from(marketplaceReviews)
      .where(sql`${marketplaceReviews.productId} IN (${sql.join(productIds.map(id => sql`${id}`), sql`, `)})`)
      .orderBy(desc(marketplaceReviews.createdAt))
      .limit(30);
  }

  // Get offers for their products
  let offers: any[] = [];
  if (productIds.length > 0) {
    offers = await db
      .select({
        id: marketplaceOffers.id,
        productId: marketplaceOffers.productId,
        buyerId: marketplaceOffers.buyerId,
        offerAmountCents: marketplaceOffers.offerAmountCents,
        status: marketplaceOffers.status,
        createdAt: marketplaceOffers.createdAt,
      })
      .from(marketplaceOffers)
      .where(sql`${marketplaceOffers.productId} IN (${sql.join(productIds.map(id => sql`${id}`), sql`, `)})`)
      .orderBy(desc(marketplaceOffers.createdAt))
      .limit(30);
  }

  // Revenue summary
  const completedOrders = orders.filter(o => o.status === "completed");
  const revenueSummary = {
    totalRevenue: completedOrders.reduce((s, o) => s + (o.creatorPayout || 0), 0),
    totalPlatformFees: completedOrders.reduce((s, o) => s + (o.platformFee || 0), 0),
    totalGross: completedOrders.reduce((s, o) => s + (o.amount || 0), 0),
    completedOrders: completedOrders.length,
    pendingOrders: orders.filter(o => o.status === "pending").length,
    refundedOrders: orders.filter(o => o.status === "refunded").length,
  };

  return {
    creator,
    products,
    orders,
    reviews,
    offers,
    revenueSummary,
  };
}

// ─── Suspend Creator ──────────────────────────────────────────────────────────
export async function adminSuspendCreator(creatorId: number) {
  const admin = await requireAdmin();

  const [creator] = await db.select().from(users).where(eq(users.id, creatorId));
  if (!creator || !creator.isMarketplaceCreator) {
    return { success: false, error: "Creator not found" };
  }

  // Suspend: set creatorActivatedAt to null
  await db.update(users).set({
    creatorActivatedAt: null,
    updatedAt: new Date(),
  }).where(eq(users.id, creatorId));

  // Hide all their marketplace products (set status to draft)
  await db.update(marketplaceProducts).set({
    status: "draft",
    updatedAt: new Date(),
  }).where(eq(marketplaceProducts.creatorId, creatorId));

  return { success: true };
}

// ─── Reactivate Creator ───────────────────────────────────────────────────────
export async function adminReactivateCreator(creatorId: number) {
  const admin = await requireAdmin();

  const [creator] = await db.select().from(users).where(eq(users.id, creatorId));
  if (!creator || !creator.isMarketplaceCreator) {
    return { success: false, error: "Creator not found" };
  }

  // Reactivate: restore creatorActivatedAt
  await db.update(users).set({
    creatorActivatedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(users.id, creatorId));

  return { success: true };
}

// ─── Revoke Creator Status ────────────────────────────────────────────────────
export async function adminRevokeCreator(creatorId: number) {
  const admin = await requireAdmin();

  const [creator] = await db.select().from(users).where(eq(users.id, creatorId));
  if (!creator || !creator.isMarketplaceCreator) {
    return { success: false, error: "Creator not found" };
  }

  // Revoke: remove creator status entirely
  await db.update(users).set({
    isMarketplaceCreator: false,
    creatorActivatedAt: null,
    stripeConnectOnboarded: false,
    updatedAt: new Date(),
  }).where(eq(users.id, creatorId));

  // Set all their products to draft
  await db.update(marketplaceProducts).set({
    status: "draft",
    updatedAt: new Date(),
  }).where(eq(marketplaceProducts.creatorId, creatorId));

  return { success: true };
}

// ─── Admin Update Creator Note ────────────────────────────────────────────────

