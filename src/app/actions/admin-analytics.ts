"use server";

import { db } from "@/server/db";
import { requireStaff } from "@/lib/admin-auth";
import {
  users, tools, reviews, toolSubmissions, toolClaims,
  upvotes, savedTools, toolViews, outboundClicks, comments,
  promotions, marketplaceOrders, toolUpgrades, deals, dealClaims,
  marketplaceProducts, newsletterSubscribers, userFollows, stackFollows,
} from "@/drizzle/schema";
import { eq, desc, sql, and, count, sum, gte, lte, isNotNull, ne } from "drizzle-orm";

// ─── Types ──────────────────────────────────────────────────────────────────

export type TimeSeriesPoint = {
  date: string; // YYYY-MM-DD
  value: number;
};

export type GeoDistribution = {
  country: string;
  count: number;
  iso: string; // ISO 3166-1 alpha-3 for map
};

export type CityDistribution = {
  city: string;
  country: string;
  count: number;
};

export type CategoryCount = {
  category: string;
  count: number;
};

export type TopStack = {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  category: string;
  metric: number;
  metricLabel: string;
};

export type PlatformActivityPoint = {
  date: string;
  reviews: number;
  comments: number;
  upvotes: number;
  dealClaims: number;
};

export type AnalyticsOverview = {
  // Core metrics
  totalUsers: number;
  activeUsers: number; // signed in within last 30 days
  newUsersThisPeriod: number;
  userGrowthPct: number;
  totalFounders: number;
  totalCreators: number;
  newFoundersThisPeriod: number;
  newCreatorsThisPeriod: number;
  // Engagement
  totalViews: number;
  totalClicks: number;
  totalSaves: number;
  totalUpvotes: number;
  totalReviews: number;
  totalComments: number;
  avgRating: number;
  // Stacks
  totalStacks: number;
  totalLaunches: number;
  totalDeals: number;
  totalMarketplaceProducts: number;
  // Subscribers
  totalSubscribers: number;
  // Deltas
  viewsDelta: number;
  clicksDelta: number;
  reviewsDelta: number;
  upvotesDelta: number;
};

export type AnalyticsData = {
  overview: AnalyticsOverview;
  // Time series
  userGrowth: TimeSeriesPoint[];
  stackGrowth: TimeSeriesPoint[];
  reviewGrowth: TimeSeriesPoint[];
  viewsTrend: TimeSeriesPoint[];
  clicksTrend: TimeSeriesPoint[];
  // Geographic
  usersByCountry: GeoDistribution[];
  foundersByCountry: GeoDistribution[];
  topCities: CityDistribution[];
  // Category & content
  categoryBreakdown: CategoryCount[];
  pricingBreakdown: CategoryCount[];
  ratingDistribution: { rating: number; count: number }[];
  // Top stacks
  topRated: TopStack[];
  mostReviewed: TopStack[];
  mostSaved: TopStack[];
  mostViewed: TopStack[];
  trendingStacks: TopStack[];
  // Activity
  platformActivity: PlatformActivityPoint[];
  // Top pages
  topViewedTools: { name: string; slug: string; views: number }[];
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function getDateRange(days: number) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  const prevStart = new Date(start);
  prevStart.setDate(prevStart.getDate() - days);
  return {
    currentStart: start,
    previousStart: prevStart,
    now,
  };
}

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

// Country name to ISO 3166-1 alpha-3 mapping (common countries)
const COUNTRY_TO_ISO3: Record<string, string> = {
  "United States": "USA", "US": "USA", "USA": "USA",
  "United Kingdom": "GBR", "UK": "GBR", "GB": "GBR",
  "Canada": "CAN", "Australia": "AUS", "Germany": "DEU",
  "France": "FRA", "India": "IND", "Japan": "JPN",
  "China": "CHN", "Brazil": "BRA", "Mexico": "MEX",
  "Spain": "ESP", "Italy": "ITA", "Netherlands": "NLD",
  "Sweden": "SWE", "Norway": "NOR", "Denmark": "DNK",
  "Finland": "FIN", "Switzerland": "CHE", "Austria": "AUT",
  "Belgium": "BEL", "Ireland": "IRL", "Portugal": "PRT",
  "Poland": "POL", "Czech Republic": "CZE", "Romania": "ROU",
  "Hungary": "HUN", "Greece": "GRC", "Turkey": "TUR",
  "Russia": "RUS", "Ukraine": "UKR", "South Korea": "KOR",
  "Singapore": "SGP", "Malaysia": "MYS", "Indonesia": "IDN",
  "Thailand": "THA", "Vietnam": "VNM", "Philippines": "PHL",
  "New Zealand": "NZL", "South Africa": "ZAF", "Nigeria": "NGA",
  "Kenya": "KEN", "Egypt": "EGY", "Israel": "ISR",
  "UAE": "ARE", "United Arab Emirates": "ARE",
  "Saudi Arabia": "SAU", "Argentina": "ARG", "Colombia": "COL",
  "Chile": "CHL", "Peru": "PER", "Pakistan": "PAK",
  "Bangladesh": "BGD", "Sri Lanka": "LKA", "Taiwan": "TWN",
  "Hong Kong": "HKG",
};

function countryToISO3(country: string): string {
  return COUNTRY_TO_ISO3[country] || country.substring(0, 3).toUpperCase();
}

// ─── Main Analytics Query ──────────────────────────────────────────────────

export async function getComprehensiveAnalytics(days: number = 30): Promise<AnalyticsData> {
  await requireStaff();
  const { currentStart, previousStart } = getDateRange(days);

  try {
    // ── Batch 1: Overview counts ──────────────────────────────────────
    const [
      totalUsers, activeUsers, totalFounders, totalCreators,
      totalStacks, totalLaunches, totalDeals, totalMktProducts,
      totalViews, totalClicks, totalSaves, totalUpvotes,
      totalReviews, totalComments, totalSubscribers, avgRatingResult,
      // Period counts
      newUsersPeriod, newFoundersPeriod, newCreatorsPeriod,
      // Period engagement
      viewsPeriod, clicksPeriod, reviewsPeriod, upvotesPeriod,
      // Previous period engagement
      viewsPrev, clicksPrev, reviewsPrev, upvotesPrev,
      // Previous period users
      prevUsers,
    ] = await Promise.all([
      // Totals
      db.select({ c: count() }).from(users).then(r => r[0].c),
      db.select({ c: count() }).from(users).where(gte(users.lastSignedIn, new Date(Date.now() - 30 * 86400000))).then(r => r[0].c),
      db.select({ c: count() }).from(users).where(eq(users.founderStatus, "verified")).then(r => r[0].c),
      db.select({ c: count() }).from(users).where(
        sql`EXISTS (SELECT 1 FROM marketplace_products WHERE marketplace_products.creator_id = ${users.id})`
      ).then(r => r[0].c),
      db.select({ c: count() }).from(tools).where(eq(tools.status, "approved")).then(r => r[0].c),
      db.select({ c: count() }).from(tools).where(
        and(eq(tools.status, "approved"), isNotNull(tools.launchedAt))
      ).then(r => r[0].c),
      db.select({ c: count() }).from(deals).then(r => r[0].c),
      db.select({ c: count() }).from(marketplaceProducts).where(eq(marketplaceProducts.status, "approved")).then(r => r[0].c),
      db.select({ c: count() }).from(toolViews).then(r => r[0].c),
      db.select({ c: count() }).from(outboundClicks).then(r => r[0].c),
      db.select({ c: count() }).from(savedTools).then(r => r[0].c),
      db.select({ c: count() }).from(upvotes).then(r => r[0].c),
      db.select({ c: count() }).from(reviews).then(r => r[0].c),
      db.select({ c: count() }).from(comments).then(r => r[0].c),
      db.select({ c: count() }).from(newsletterSubscribers).then(r => r[0].c),
      db.select({ avg: sql<number>`COALESCE(AVG(${reviews.rating}), 0)` }).from(reviews).then(r => Number(r[0].avg) || 0),
      // Period new
      db.select({ c: count() }).from(users).where(gte(users.createdAt, currentStart)).then(r => r[0].c),
      db.select({ c: count() }).from(users).where(
        and(eq(users.founderStatus, "verified"), gte(users.founderVerifiedAt, currentStart))
      ).then(r => r[0].c),
      db.select({ c: count() }).from(users).where(
        sql`EXISTS (SELECT 1 FROM marketplace_products WHERE marketplace_products.creator_id = ${users.id} AND marketplace_products.created_at >= ${currentStart.toISOString()}::timestamp)`
      ).then(r => r[0].c),
      // Period engagement
      db.select({ c: count() }).from(toolViews).where(gte(toolViews.createdAt, currentStart)).then(r => r[0].c),
      db.select({ c: count() }).from(outboundClicks).where(gte(outboundClicks.createdAt, currentStart)).then(r => r[0].c),
      db.select({ c: count() }).from(reviews).where(gte(reviews.createdAt, currentStart)).then(r => r[0].c),
      db.select({ c: count() }).from(upvotes).where(gte(upvotes.createdAt, currentStart)).then(r => r[0].c),
      // Previous period engagement
      db.select({ c: count() }).from(toolViews).where(and(gte(toolViews.createdAt, previousStart), lte(toolViews.createdAt, currentStart))).then(r => r[0].c),
      db.select({ c: count() }).from(outboundClicks).where(and(gte(outboundClicks.createdAt, previousStart), lte(outboundClicks.createdAt, currentStart))).then(r => r[0].c),
      db.select({ c: count() }).from(reviews).where(and(gte(reviews.createdAt, previousStart), lte(reviews.createdAt, currentStart))).then(r => r[0].c),
      db.select({ c: count() }).from(upvotes).where(and(gte(upvotes.createdAt, previousStart), lte(upvotes.createdAt, currentStart))).then(r => r[0].c),
      // Previous period users
      db.select({ c: count() }).from(users).where(and(gte(users.createdAt, previousStart), lte(users.createdAt, currentStart))).then(r => r[0].c),
    ]);

    const calcDelta = (current: number, prev: number) =>
      prev > 0 ? Math.round(((current - prev) / prev) * 100) : current > 0 ? 100 : 0;

    // ── Batch 2: Time series (GROUP BY queries) ─────────────────────
    const [userRows, stackRows, reviewRows, viewRows, clickRows] = await Promise.all([
      db.select({
        date: sql<string>`TO_CHAR(${users.createdAt}, 'YYYY-MM-DD')`,
        cnt: count(),
      }).from(users).where(gte(users.createdAt, currentStart))
        .groupBy(sql`TO_CHAR(${users.createdAt}, 'YYYY-MM-DD')`),

      db.select({
        date: sql<string>`TO_CHAR(${tools.createdAt}, 'YYYY-MM-DD')`,
        cnt: count(),
      }).from(tools).where(gte(tools.createdAt, currentStart))
        .groupBy(sql`TO_CHAR(${tools.createdAt}, 'YYYY-MM-DD')`),

      db.select({
        date: sql<string>`TO_CHAR(${reviews.createdAt}, 'YYYY-MM-DD')`,
        cnt: count(),
      }).from(reviews).where(gte(reviews.createdAt, currentStart))
        .groupBy(sql`TO_CHAR(${reviews.createdAt}, 'YYYY-MM-DD')`),

      db.select({
        date: sql<string>`TO_CHAR(${toolViews.createdAt}, 'YYYY-MM-DD')`,
        cnt: count(),
      }).from(toolViews).where(gte(toolViews.createdAt, currentStart))
        .groupBy(sql`TO_CHAR(${toolViews.createdAt}, 'YYYY-MM-DD')`),

      db.select({
        date: sql<string>`TO_CHAR(${outboundClicks.createdAt}, 'YYYY-MM-DD')`,
        cnt: count(),
      }).from(outboundClicks).where(gte(outboundClicks.createdAt, currentStart))
        .groupBy(sql`TO_CHAR(${outboundClicks.createdAt}, 'YYYY-MM-DD')`),
    ]);

    const userMap = generateDateMap(currentStart, days);
    const stackMap = generateDateMap(currentStart, days);
    const reviewMap = generateDateMap(currentStart, days);
    const viewsMap = generateDateMap(currentStart, days);
    const clicksMap = generateDateMap(currentStart, days);

    for (const r of userRows) userMap.set(r.date, r.cnt);
    for (const r of stackRows) stackMap.set(r.date, r.cnt);
    for (const r of reviewRows) reviewMap.set(r.date, r.cnt);
    for (const r of viewRows) viewsMap.set(r.date, r.cnt);
    for (const r of clickRows) clicksMap.set(r.date, r.cnt);

    // ── Batch 3: Geographic, categories, ratings, top stacks ────────
    const [
      geoUsers, geoFounders, topCitiesRaw,
      categoryRows, pricingRows, ratingRows,
      topRatedRows, mostReviewedRows, mostSavedRows, mostViewedRows, trendingRows,
      topViewedToolsRaw,
    ] = await Promise.all([
      // Users by country
      db.select({
        country: users.country,
        cnt: count(),
      }).from(users)
        .where(isNotNull(users.country))
        .groupBy(users.country)
        .orderBy(desc(count()))
        .limit(50),

      // Founders by country
      db.select({
        country: users.country,
        cnt: count(),
      }).from(users)
        .where(and(eq(users.founderStatus, "verified"), isNotNull(users.country)))
        .groupBy(users.country)
        .orderBy(desc(count()))
        .limit(50),

      // Top cities
      db.select({
        city: users.city,
        country: users.country,
        cnt: count(),
      }).from(users)
        .where(and(isNotNull(users.city), isNotNull(users.country)))
        .groupBy(users.city, users.country)
        .orderBy(desc(count()))
        .limit(20),

      // Category breakdown
      db.select({ category: tools.category, cnt: count() })
        .from(tools)
        .where(eq(tools.status, "approved"))
        .groupBy(tools.category)
        .orderBy(desc(count())),

      // Pricing model breakdown
      db.select({ category: tools.pricingModel, cnt: count() })
        .from(tools)
        .where(eq(tools.status, "approved"))
        .groupBy(tools.pricingModel)
        .orderBy(desc(count())),

      // Rating distribution
      db.select({ rating: reviews.rating, cnt: count() })
        .from(reviews)
        .groupBy(reviews.rating)
        .orderBy(reviews.rating),

      // Top rated stacks
      db.select({
        id: tools.id, name: tools.name, slug: tools.slug,
        logoUrl: tools.logoUrl, category: tools.category,
        averageRating: tools.averageRating,
      }).from(tools)
        .where(and(eq(tools.status, "approved"), gte(tools.reviewCount, 1)))
        .orderBy(desc(tools.averageRating))
        .limit(8),

      // Most reviewed stacks
      db.select({
        id: tools.id, name: tools.name, slug: tools.slug,
        logoUrl: tools.logoUrl, category: tools.category,
        reviewCount: tools.reviewCount,
      }).from(tools)
        .where(eq(tools.status, "approved"))
        .orderBy(desc(tools.reviewCount))
        .limit(8),

      // Most saved stacks
      db.select({
        id: tools.id, name: tools.name, slug: tools.slug,
        logoUrl: tools.logoUrl, category: tools.category,
        saveCount: tools.saveCount,
      }).from(tools)
        .where(eq(tools.status, "approved"))
        .orderBy(desc(tools.saveCount))
        .limit(8),

      // Most viewed stacks
      db.select({
        id: tools.id, name: tools.name, slug: tools.slug,
        logoUrl: tools.logoUrl, category: tools.category,
        viewCount: tools.viewCount,
      }).from(tools)
        .where(eq(tools.status, "approved"))
        .orderBy(desc(tools.viewCount))
        .limit(8),

      // Trending stacks (by weekly rank change)
      db.select({
        id: tools.id, name: tools.name, slug: tools.slug,
        logoUrl: tools.logoUrl, category: tools.category,
        weeklyRankChange: tools.weeklyRankChange,
      }).from(tools)
        .where(eq(tools.status, "approved"))
        .orderBy(desc(tools.weeklyRankChange))
        .limit(8),

      // Top viewed tools (for top pages)
      db.select({
        name: tools.name,
        slug: tools.slug,
        views: tools.viewCount,
      }).from(tools)
        .where(eq(tools.status, "approved"))
        .orderBy(desc(tools.viewCount))
        .limit(10),
    ]);

    // ── Batch 4: Platform activity time series ──────────────────────
    const [reviewActivityRows, commentActivityRows, upvoteActivityRows, dealClaimActivityRows] = await Promise.all([
      db.select({
        date: sql<string>`TO_CHAR(${reviews.createdAt}, 'YYYY-MM-DD')`,
        cnt: count(),
      }).from(reviews).where(gte(reviews.createdAt, currentStart))
        .groupBy(sql`TO_CHAR(${reviews.createdAt}, 'YYYY-MM-DD')`),

      db.select({
        date: sql<string>`TO_CHAR(${comments.createdAt}, 'YYYY-MM-DD')`,
        cnt: count(),
      }).from(comments).where(gte(comments.createdAt, currentStart))
        .groupBy(sql`TO_CHAR(${comments.createdAt}, 'YYYY-MM-DD')`),

      db.select({
        date: sql<string>`TO_CHAR(${upvotes.createdAt}, 'YYYY-MM-DD')`,
        cnt: count(),
      }).from(upvotes).where(gte(upvotes.createdAt, currentStart))
        .groupBy(sql`TO_CHAR(${upvotes.createdAt}, 'YYYY-MM-DD')`),

      db.select({
        date: sql<string>`TO_CHAR(${dealClaims.claimedAt}, 'YYYY-MM-DD')`,
        cnt: count(),
      }).from(dealClaims).where(gte(dealClaims.claimedAt, currentStart))
        .groupBy(sql`TO_CHAR(${dealClaims.claimedAt}, 'YYYY-MM-DD')`),
    ]);

    // Build platform activity series
    const reviewActMap = generateDateMap(currentStart, days);
    const commentActMap = generateDateMap(currentStart, days);
    const upvoteActMap = generateDateMap(currentStart, days);
    const dealClaimActMap = generateDateMap(currentStart, days);

    for (const r of reviewActivityRows) reviewActMap.set(r.date, r.cnt);
    for (const r of commentActivityRows) commentActMap.set(r.date, r.cnt);
    for (const r of upvoteActivityRows) upvoteActMap.set(r.date, r.cnt);
    for (const r of dealClaimActivityRows) dealClaimActMap.set(r.date, r.cnt);

    const platformActivity: PlatformActivityPoint[] = [];
    const dates = Array.from(reviewActMap.keys());
    for (const date of dates) {
      platformActivity.push({
        date,
        reviews: reviewActMap.get(date) || 0,
        comments: commentActMap.get(date) || 0,
        upvotes: upvoteActMap.get(date) || 0,
        dealClaims: dealClaimActMap.get(date) || 0,
      });
    }

    // ── Assemble response ───────────────────────────────────────────
    return {
      overview: {
        totalUsers,
        activeUsers,
        newUsersThisPeriod: newUsersPeriod,
        userGrowthPct: calcDelta(newUsersPeriod, prevUsers),
        totalFounders,
        totalCreators,
        newFoundersThisPeriod: newFoundersPeriod,
        newCreatorsThisPeriod: newCreatorsPeriod,
        totalViews,
        totalClicks,
        totalSaves,
        totalUpvotes,
        totalReviews,
        totalComments,
        avgRating: avgRatingResult,
        totalStacks,
        totalLaunches,
        totalDeals,
        totalMarketplaceProducts: totalMktProducts,
        totalSubscribers,
        viewsDelta: calcDelta(viewsPeriod, viewsPrev),
        clicksDelta: calcDelta(clicksPeriod, clicksPrev),
        reviewsDelta: calcDelta(reviewsPeriod, reviewsPrev),
        upvotesDelta: calcDelta(upvotesPeriod, upvotesPrev),
      },
      userGrowth: dateMapToSeries(userMap),
      stackGrowth: dateMapToSeries(stackMap),
      reviewGrowth: dateMapToSeries(reviewMap),
      viewsTrend: dateMapToSeries(viewsMap),
      clicksTrend: dateMapToSeries(clicksMap),
      usersByCountry: geoUsers.map(r => ({
        country: r.country || "Unknown",
        count: r.cnt,
        iso: countryToISO3(r.country || ""),
      })),
      foundersByCountry: geoFounders.map(r => ({
        country: r.country || "Unknown",
        count: r.cnt,
        iso: countryToISO3(r.country || ""),
      })),
      topCities: topCitiesRaw.map(r => ({
        city: r.city || "Unknown",
        country: r.country || "Unknown",
        count: r.cnt,
      })),
      categoryBreakdown: categoryRows.map(r => ({ category: r.category, count: r.cnt })),
      pricingBreakdown: pricingRows.map(r => ({ category: r.category, count: r.cnt })),
      ratingDistribution: [1, 2, 3, 4, 5].map(rating => ({
        rating,
        count: ratingRows.find(r => r.rating === rating)?.cnt || 0,
      })),
      topRated: topRatedRows.map(r => ({
        id: r.id, name: r.name, slug: r.slug, logoUrl: r.logoUrl,
        category: r.category, metric: r.averageRating, metricLabel: "Rating",
      })),
      mostReviewed: mostReviewedRows.map(r => ({
        id: r.id, name: r.name, slug: r.slug, logoUrl: r.logoUrl,
        category: r.category, metric: r.reviewCount, metricLabel: "Reviews",
      })),
      mostSaved: mostSavedRows.map(r => ({
        id: r.id, name: r.name, slug: r.slug, logoUrl: r.logoUrl,
        category: r.category, metric: r.saveCount, metricLabel: "Saves",
      })),
      mostViewed: mostViewedRows.map(r => ({
        id: r.id, name: r.name, slug: r.slug, logoUrl: r.logoUrl,
        category: r.category, metric: r.viewCount, metricLabel: "Views",
      })),
      trendingStacks: trendingRows.map(r => ({
        id: r.id, name: r.name, slug: r.slug, logoUrl: r.logoUrl,
        category: r.category, metric: r.weeklyRankChange || 0, metricLabel: "Rank Change",
      })),
      platformActivity,
      topViewedTools: topViewedToolsRaw.map(r => ({
        name: r.name, slug: r.slug, views: r.views,
      })),
    };
  } catch (err) {
    console.error("[getComprehensiveAnalytics] Error:", (err as Error).message);
    throw new Error("Failed to load analytics data");
  }
}
