"use server";

import { db } from "@/server/db";
import { requireStaff } from "@/lib/admin-auth";
import {
  users, tools, reviews, toolSubmissions, toolClaims,
  upvotes, savedTools, toolViews, outboundClicks, comments,
  promotions, marketplaceOrders, toolUpgrades, deals,
  marketplaceProducts, newsletterSubscribers,
  userFollows, stackFollows,
} from "@/drizzle/schema";
import { eq, desc, sql, and, count, sum, gte, lte } from "drizzle-orm";

// ─── Types ──────────────────────────────────────────────────────────────────

export type DashboardKPIs = {
  totalUsers: number;
  totalStacks: number;
  totalReviews: number;
  totalRevenue: number; // cents
  totalUpvotes: number;
  totalDeals: number;
  pendingSubmissions: number;
  pendingClaims: number;
  totalUserFollows: number;
  totalStackFollows: number;
  // Deltas (vs previous period)
  usersDelta: number;
  stacksDelta: number;
  reviewsDelta: number;
  revenueDelta: number;
};

export type TimeSeriesPoint = {
  date: string; // YYYY-MM-DD
  value: number;
};

export type RevenueBreakdown = {
  promotions: number;
  marketplace: number;
  upgrades: number;
};

export type CategoryBreakdown = {
  category: string;
  count: number;
};

export type TopStack = {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  category: string;
  averageRating: number;
  reviewCount: number;
  upvoteCount: number;
  viewCount: number;
  rankScore: number;
};

export type RecentActivityItem = {
  id: number;
  type: "signup" | "review" | "submission" | "deal_claim" | "upvote";
  title: string;
  subtitle: string;
  timestamp: Date;
  meta?: string;
};

export type PlatformHealth = {
  activeDeals: number;
  activePromotions: number;
  marketplaceProducts: number;
  newsletterSubs: number;
  verifiedFounders: number;
  avgRating: number;
};

// ─── Helper: date range boundaries ─────────────────────────────────────────

function getDateRange(days: number) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  const prevStart = new Date(start);
  prevStart.setDate(prevStart.getDate() - days);
  return {
    currentStart: start.toISOString(),
    previousStart: prevStart.toISOString(),
    now: now.toISOString(),
    currentStartDate: start,
  };
}

/**
 * Helper: generate a map of date strings for the period, pre-filled with 0.
 * Used to fill gaps in GROUP BY results.
 */
function generateDateMap(startDate: Date, days: number): Map<string, number> {
  const map = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    map.set(d.toISOString().split("T")[0], 0);
  }
  return map;
}

function dateMapToSeries(map: Map<string, number>): TimeSeriesPoint[] {
  return Array.from(map.entries()).map(([date, value]) => ({ date, value }));
}

// ─── Dashboard KPIs ─────────────────────────────────────────────────────────

export async function getDashboardKPIs(period: number = 30): Promise<DashboardKPIs> {
  await requireStaff();
  const { currentStart, previousStart, now } = getDateRange(period);

  try {
    const [
      totalUsers, totalStacks, totalReviews, totalUpvotes, totalDeals,
      pendingSubmissions, pendingClaims,
      totalUserFollows, totalStackFollows,
      promoRevenue, marketplaceRevenue, upgradeRevenue,
      currentUsers, currentStacks, currentReviews,
      currentPromoRev, currentMarketRev, currentUpgradeRev,
      prevUsers, prevStacks, prevReviews,
      prevPromoRev, prevMarketRev, prevUpgradeRev,
    ] = await Promise.all([
      db.select({ c: count() }).from(users).then(r => r[0].c),
      db.select({ c: count() }).from(tools).then(r => r[0].c),
      db.select({ c: count() }).from(reviews).then(r => r[0].c),
      db.select({ c: count() }).from(upvotes).then(r => r[0].c),
      db.select({ c: count() }).from(deals).then(r => r[0].c),
      db.select({ c: count() }).from(toolSubmissions).where(eq(toolSubmissions.status, "pending")).then(r => r[0].c),
      db.select({ c: count() }).from(toolClaims).where(eq(toolClaims.status, "pending")).then(r => r[0].c),
      db.select({ c: count() }).from(userFollows).then(r => r[0].c),
      db.select({ c: count() }).from(stackFollows).then(r => r[0].c),
      db.select({ s: sum(promotions.amountPaid) }).from(promotions).where(eq(promotions.status, "active")).then(r => Number(r[0].s) || 0),
      db.select({ s: sum(marketplaceOrders.platformFee) }).from(marketplaceOrders).where(eq(marketplaceOrders.status, "completed")).then(r => Number(r[0].s) || 0),
      db.select({ s: sum(toolUpgrades.amountPaid) }).from(toolUpgrades).where(eq(toolUpgrades.status, "active")).then(r => Number(r[0].s) || 0),
      db.select({ c: count() }).from(users).where(gte(users.createdAt, new Date(currentStart))).then(r => r[0].c),
      db.select({ c: count() }).from(tools).where(gte(tools.createdAt, new Date(currentStart))).then(r => r[0].c),
      db.select({ c: count() }).from(reviews).where(gte(reviews.createdAt, new Date(currentStart))).then(r => r[0].c),
      db.select({ s: sum(promotions.amountPaid) }).from(promotions).where(and(eq(promotions.status, "active"), gte(promotions.createdAt, new Date(currentStart)))).then(r => Number(r[0].s) || 0),
      db.select({ s: sum(marketplaceOrders.platformFee) }).from(marketplaceOrders).where(and(eq(marketplaceOrders.status, "completed"), gte(marketplaceOrders.createdAt, new Date(currentStart)))).then(r => Number(r[0].s) || 0),
      db.select({ s: sum(toolUpgrades.amountPaid) }).from(toolUpgrades).where(and(eq(toolUpgrades.status, "active"), gte(toolUpgrades.createdAt, new Date(currentStart)))).then(r => Number(r[0].s) || 0),
      db.select({ c: count() }).from(users).where(and(gte(users.createdAt, new Date(previousStart)), lte(users.createdAt, new Date(currentStart)))).then(r => r[0].c),
      db.select({ c: count() }).from(tools).where(and(gte(tools.createdAt, new Date(previousStart)), lte(tools.createdAt, new Date(currentStart)))).then(r => r[0].c),
      db.select({ c: count() }).from(reviews).where(and(gte(reviews.createdAt, new Date(previousStart)), lte(reviews.createdAt, new Date(currentStart)))).then(r => r[0].c),
      db.select({ s: sum(promotions.amountPaid) }).from(promotions).where(and(eq(promotions.status, "active"), gte(promotions.createdAt, new Date(previousStart)), lte(promotions.createdAt, new Date(currentStart)))).then(r => Number(r[0].s) || 0),
      db.select({ s: sum(marketplaceOrders.platformFee) }).from(marketplaceOrders).where(and(eq(marketplaceOrders.status, "completed"), gte(marketplaceOrders.createdAt, new Date(previousStart)), lte(marketplaceOrders.createdAt, new Date(currentStart)))).then(r => Number(r[0].s) || 0),
      db.select({ s: sum(toolUpgrades.amountPaid) }).from(toolUpgrades).where(and(eq(toolUpgrades.status, "active"), gte(toolUpgrades.createdAt, new Date(previousStart)), lte(toolUpgrades.createdAt, new Date(currentStart)))).then(r => Number(r[0].s) || 0),
    ]);

    const totalRevenue = promoRevenue + marketplaceRevenue + upgradeRevenue;
    const currentRevenue = currentPromoRev + currentMarketRev + currentUpgradeRev;
    const prevRevenue = prevPromoRev + prevMarketRev + prevUpgradeRev;

    return {
      totalUsers,
      totalStacks,
      totalReviews,
      totalRevenue,
      totalUpvotes,
      totalDeals,
      pendingSubmissions,
      pendingClaims,
      totalUserFollows,
      totalStackFollows,
      usersDelta: prevUsers > 0 ? Math.round(((currentUsers - prevUsers) / prevUsers) * 100) : currentUsers > 0 ? 100 : 0,
      stacksDelta: prevStacks > 0 ? Math.round(((currentStacks - prevStacks) / prevStacks) * 100) : currentStacks > 0 ? 100 : 0,
      reviewsDelta: prevReviews > 0 ? Math.round(((currentReviews - prevReviews) / prevReviews) * 100) : currentReviews > 0 ? 100 : 0,
      revenueDelta: prevRevenue > 0 ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100) : currentRevenue > 0 ? 100 : 0,
    };
  } catch (err) {
    console.error("[getDashboardKPIs] Error:", (err as Error).message);
    return {
      totalUsers: 0, totalStacks: 0, totalReviews: 0, totalRevenue: 0,
      totalUpvotes: 0, totalDeals: 0, pendingSubmissions: 0, pendingClaims: 0,
      totalUserFollows: 0, totalStackFollows: 0,
      usersDelta: 0, stacksDelta: 0, reviewsDelta: 0, revenueDelta: 0,
    };
  }
}

// ─── Revenue Time Series (OPTIMIZED: single GROUP BY queries) ──────────────

export async function getRevenueTimeSeries(days: number = 30): Promise<{
  series: TimeSeriesPoint[];
  breakdown: RevenueBreakdown;
}> {
  await requireStaff();
  const { currentStartDate } = getDateRange(days);

  try {
    // Single GROUP BY query per revenue source instead of per-day loop
    const [promoRows, mktRows, upgRows, promoTotal, mktTotal, upgTotal] = await Promise.all([
      db.select({
        date: sql<string>`TO_CHAR(${promotions.createdAt}, 'YYYY-MM-DD')`,
        total: sum(promotions.amountPaid),
      })
        .from(promotions)
        .where(and(eq(promotions.status, "active"), gte(promotions.createdAt, currentStartDate)))
        .groupBy(sql`TO_CHAR(${promotions.createdAt}, 'YYYY-MM-DD')`),

      db.select({
        date: sql<string>`TO_CHAR(${marketplaceOrders.createdAt}, 'YYYY-MM-DD')`,
        total: sum(marketplaceOrders.platformFee),
      })
        .from(marketplaceOrders)
        .where(and(eq(marketplaceOrders.status, "completed"), gte(marketplaceOrders.createdAt, currentStartDate)))
        .groupBy(sql`TO_CHAR(${marketplaceOrders.createdAt}, 'YYYY-MM-DD')`),

      db.select({
        date: sql<string>`TO_CHAR(${toolUpgrades.createdAt}, 'YYYY-MM-DD')`,
        total: sum(toolUpgrades.amountPaid),
      })
        .from(toolUpgrades)
        .where(and(eq(toolUpgrades.status, "active"), gte(toolUpgrades.createdAt, currentStartDate)))
        .groupBy(sql`TO_CHAR(${toolUpgrades.createdAt}, 'YYYY-MM-DD')`),

      // Breakdown totals
      db.select({ s: sum(promotions.amountPaid) }).from(promotions)
        .where(and(eq(promotions.status, "active"), gte(promotions.createdAt, currentStartDate)))
        .then(r => Number(r[0].s) || 0),
      db.select({ s: sum(marketplaceOrders.platformFee) }).from(marketplaceOrders)
        .where(and(eq(marketplaceOrders.status, "completed"), gte(marketplaceOrders.createdAt, currentStartDate)))
        .then(r => Number(r[0].s) || 0),
      db.select({ s: sum(toolUpgrades.amountPaid) }).from(toolUpgrades)
        .where(and(eq(toolUpgrades.status, "active"), gte(toolUpgrades.createdAt, currentStartDate)))
        .then(r => Number(r[0].s) || 0),
    ]);

    // Merge all revenue sources into a single date map
    const dateMap = generateDateMap(currentStartDate, days);
    for (const row of promoRows) {
      const existing = dateMap.get(row.date) || 0;
      dateMap.set(row.date, existing + (Number(row.total) || 0));
    }
    for (const row of mktRows) {
      const existing = dateMap.get(row.date) || 0;
      dateMap.set(row.date, existing + (Number(row.total) || 0));
    }
    for (const row of upgRows) {
      const existing = dateMap.get(row.date) || 0;
      dateMap.set(row.date, existing + (Number(row.total) || 0));
    }

    return {
      series: dateMapToSeries(dateMap),
      breakdown: { promotions: promoTotal, marketplace: mktTotal, upgrades: upgTotal },
    };
  } catch (err) {
    console.error("[getRevenueTimeSeries] Error:", (err as Error).message);
    return { series: [], breakdown: { promotions: 0, marketplace: 0, upgrades: 0 } };
  }
}

// ─── Growth Time Series (OPTIMIZED: single GROUP BY queries) ───────────────

export async function getGrowthTimeSeries(days: number = 30): Promise<{
  users: TimeSeriesPoint[];
  stacks: TimeSeriesPoint[];
  reviews: TimeSeriesPoint[];
}> {
  await requireStaff();
  const { currentStartDate } = getDateRange(days);

  try {
    // 3 queries total instead of 3 * days queries
    const [userRows, stackRows, reviewRows] = await Promise.all([
      db.select({
        date: sql<string>`TO_CHAR(${users.createdAt}, 'YYYY-MM-DD')`,
        cnt: count(),
      })
        .from(users)
        .where(gte(users.createdAt, currentStartDate))
        .groupBy(sql`TO_CHAR(${users.createdAt}, 'YYYY-MM-DD')`),

      db.select({
        date: sql<string>`TO_CHAR(${tools.createdAt}, 'YYYY-MM-DD')`,
        cnt: count(),
      })
        .from(tools)
        .where(gte(tools.createdAt, currentStartDate))
        .groupBy(sql`TO_CHAR(${tools.createdAt}, 'YYYY-MM-DD')`),

      db.select({
        date: sql<string>`TO_CHAR(${reviews.createdAt}, 'YYYY-MM-DD')`,
        cnt: count(),
      })
        .from(reviews)
        .where(gte(reviews.createdAt, currentStartDate))
        .groupBy(sql`TO_CHAR(${reviews.createdAt}, 'YYYY-MM-DD')`),
    ]);

    const userMap = generateDateMap(currentStartDate, days);
    const stackMap = generateDateMap(currentStartDate, days);
    const reviewMap = generateDateMap(currentStartDate, days);

    for (const row of userRows) userMap.set(row.date, row.cnt);
    for (const row of stackRows) stackMap.set(row.date, row.cnt);
    for (const row of reviewRows) reviewMap.set(row.date, row.cnt);

    return {
      users: dateMapToSeries(userMap),
      stacks: dateMapToSeries(stackMap),
      reviews: dateMapToSeries(reviewMap),
    };
  } catch (err) {
    console.error("[getGrowthTimeSeries] Error:", (err as Error).message);
    return { users: [], stacks: [], reviews: [] };
  }
}

// ─── Category Breakdown ─────────────────────────────────────────────────────

export async function getCategoryBreakdown(): Promise<CategoryBreakdown[]> {
  await requireStaff();
  try {
    const rows = await db
      .select({ category: tools.category, count: count() })
      .from(tools)
      .groupBy(tools.category)
      .orderBy(desc(count()));
    return rows.map(r => ({ category: r.category, count: r.count }));
  } catch (err) {
    console.error("[getCategoryBreakdown] Error:", (err as Error).message);
    return [];
  }
}

// ─── Top Performing Stacks ──────────────────────────────────────────────────

export async function getTopStacks(limit: number = 10): Promise<TopStack[]> {
  await requireStaff();
  try {
    const rows = await db
      .select({
        id: tools.id,
        name: tools.name,
        slug: tools.slug,
        logoUrl: tools.logoUrl,
        category: tools.category,
        averageRating: tools.averageRating,
        reviewCount: tools.reviewCount,
        upvoteCount: tools.upvoteCount,
        viewCount: tools.viewCount,
        rankScore: tools.rankScore,
      })
      .from(tools)
      .where(eq(tools.status, "approved"))
      .orderBy(desc(tools.rankScore))
      .limit(limit);
    return rows;
  } catch (err) {
    console.error("[getTopStacks] Error:", (err as Error).message);
    return [];
  }
}

// ─── Recent Activity Feed ───────────────────────────────────────────────────

export async function getDashboardActivity(limit: number = 12): Promise<RecentActivityItem[]> {
  await requireStaff();
  try {
    const [recentUsers, recentReviews, recentSubmissions] = await Promise.all([
      db.select({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt })
        .from(users).orderBy(desc(users.createdAt)).limit(limit),
      db.select({
        id: reviews.id, rating: reviews.rating, createdAt: reviews.createdAt,
        title: reviews.title, toolId: reviews.toolId,
        toolName: tools.name,
      })
        .from(reviews)
        .leftJoin(tools, eq(reviews.toolId, tools.id))
        .orderBy(desc(reviews.createdAt)).limit(limit),
      db.select({ id: toolSubmissions.id, name: toolSubmissions.name, status: toolSubmissions.status, createdAt: toolSubmissions.createdAt })
        .from(toolSubmissions).orderBy(desc(toolSubmissions.createdAt)).limit(limit),
    ]);

    const items: RecentActivityItem[] = [];

    recentUsers.forEach(u => items.push({
      id: u.id,
      type: "signup",
      title: u.name || u.email || "New user",
      subtitle: "signed up",
      timestamp: u.createdAt,
    }));

    recentReviews.forEach(r => items.push({
      id: r.id,
      type: "review",
      title: r.title || "New review",
      subtitle: `on ${r.toolName || "a stack"}`,
      timestamp: r.createdAt,
      meta: `${r.rating}/5`,
    }));

    recentSubmissions.forEach(s => items.push({
      id: s.id,
      type: "submission",
      title: s.name,
      subtitle: `submitted (${s.status})`,
      timestamp: s.createdAt,
      meta: s.status,
    }));

    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return items.slice(0, limit);
  } catch (err) {
    console.error("[getDashboardActivity] Error:", (err as Error).message);
    return [];
  }
}

// ─── Platform Health ────────────────────────────────────────────────────────

export async function getPlatformHealth(): Promise<PlatformHealth> {
  await requireStaff();
  try {
    const [
      activeDeals, activePromotions, mktProducts, nlSubs, verifiedFounders, avgRating,
    ] = await Promise.all([
      db.select({ c: count() }).from(deals).where(eq(deals.isActive, true)).then(r => r[0].c),
      db.select({ c: count() }).from(promotions).where(eq(promotions.status, "active")).then(r => r[0].c),
      db.select({ c: count() }).from(marketplaceProducts).where(eq(marketplaceProducts.status, "approved")).then(r => r[0].c),
      db.select({ c: count() }).from(newsletterSubscribers).then(r => r[0].c),
      db.select({ c: count() }).from(users).where(eq(users.founderStatus, "verified")).then(r => r[0].c),
      db.select({ avg: sql<number>`COALESCE(AVG(${tools.averageRating}), 0)` }).from(tools).where(eq(tools.status, "approved")).then(r => Number(r[0].avg) || 0),
    ]);
    return { activeDeals, activePromotions, marketplaceProducts: mktProducts, newsletterSubs: nlSubs, verifiedFounders, avgRating };
  } catch (err) {
    console.error("[getPlatformHealth] Error:", (err as Error).message);
    return { activeDeals: 0, activePromotions: 0, marketplaceProducts: 0, newsletterSubs: 0, verifiedFounders: 0, avgRating: 0 };
  }
}

// ─── Engagement Stats (OPTIMIZED: single GROUP BY query) ────────────────────

export async function getEngagementStats(days: number = 30): Promise<{
  totalViews: number;
  totalClicks: number;
  totalSaves: number;
  totalComments: number;
  viewsSeries: TimeSeriesPoint[];
}> {
  await requireStaff();
  const { currentStartDate } = getDateRange(days);

  try {
    // 5 queries total instead of 4 + days queries
    const [totalViews, totalClicks, totalSaves, totalComments, viewRows] = await Promise.all([
      db.select({ c: count() }).from(toolViews).then(r => r[0].c),
      db.select({ c: count() }).from(outboundClicks).then(r => r[0].c),
      db.select({ c: count() }).from(savedTools).then(r => r[0].c),
      db.select({ c: count() }).from(comments).then(r => r[0].c),
      // Single GROUP BY query for views per day
      db.select({
        date: sql<string>`TO_CHAR(${toolViews.createdAt}, 'YYYY-MM-DD')`,
        cnt: count(),
      })
        .from(toolViews)
        .where(gte(toolViews.createdAt, currentStartDate))
        .groupBy(sql`TO_CHAR(${toolViews.createdAt}, 'YYYY-MM-DD')`),
    ]);

    const viewsMap = generateDateMap(currentStartDate, days);
    for (const row of viewRows) viewsMap.set(row.date, row.cnt);

    return {
      totalViews,
      totalClicks,
      totalSaves,
      totalComments,
      viewsSeries: dateMapToSeries(viewsMap),
    };
  } catch (err) {
    console.error("[getEngagementStats] Error:", (err as Error).message);
    return { totalViews: 0, totalClicks: 0, totalSaves: 0, totalComments: 0, viewsSeries: [] };
  }
}
