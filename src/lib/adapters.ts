/**
 * Adapters to convert Drizzle DB records (camelCase) to frontend types (snake_case).
 * This allows all existing components (ToolCard, etc.) to work without modification.
 */
import type { Tool as FrontendTool, Review as FrontendReview, LeaderboardEntry, Founder } from "./types";
import type { Tool as DbTool, Review as DbReview } from "@/drizzle/schema";

export function dbToolToFrontend(t: DbTool, founderMap?: Map<number, Founder>): FrontendTool {
  const founder = (founderMap && t.claimedBy) ? founderMap.get(t.claimedBy) : undefined;
  return {
    id: String(t.id),
    slug: t.slug,
    name: t.name,
    tagline: t.tagline,
    description: t.description,
    logo_url: t.logoUrl ?? `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${new URL(t.websiteUrl).hostname}&size=128`,
    website_url: t.websiteUrl,
    affiliate_url: t.affiliateUrl ?? undefined,
    category: t.category as FrontendTool["category"],
    pricing_model: t.pricingModel as FrontendTool["pricing_model"],
    tags: (Array.isArray(t.tags) ? t.tags : typeof t.tags === "string" ? JSON.parse(t.tags) : []) as string[],
    badges: (Array.isArray(t.badges) ? t.badges : typeof t.badges === "string" ? JSON.parse(t.badges) : []) as FrontendTool["badges"],
    upvote_count: t.upvoteCount,
    review_count: t.reviewCount,
    average_rating: t.averageRating,
    rank_score: t.rankScore,
    weekly_rank_change: t.weeklyRankChange ?? 0,
    is_featured: t.isFeatured,
    is_verified: t.isVerified,
    is_pro: t.isPro,
    screenshot_url: t.screenshotUrl ?? undefined,
    launched_at: t.launchedAt.toISOString(),
    created_at: t.createdAt.toISOString(),
    updated_at: t.updatedAt.toISOString(),
    founder,
    features: (Array.isArray(t.features) ? t.features : typeof t.features === "string" ? JSON.parse(t.features) : []) as FrontendTool["features"],
    pricing_tiers: (Array.isArray(t.pricingTiers) ? t.pricingTiers : typeof t.pricingTiers === "string" ? JSON.parse(t.pricingTiers) : []) as FrontendTool["pricing_tiers"],
  };
}

export function dbToolsToFrontend(tools: DbTool[], founderMap?: Map<number, Founder>): FrontendTool[] {
  return tools.map(t => dbToolToFrontend(t, founderMap));
}

export function dbReviewToFrontend(
  r: DbReview & { userName?: string | null; userAvatar?: string | null }
): FrontendReview {
  return {
    id: String(r.id),
    tool_id: String(r.toolId),
    user_id: String(r.userId),
    rating: r.rating,
    title: r.title ?? "",
    body: r.body ?? "",
    pros: r.pros ?? undefined,
    cons: r.cons ?? undefined,
    is_verified_purchase: r.isVerified,
    helpful_count: r.helpfulCount,
    created_at: r.createdAt.toISOString(),
    user: {
      id: String(r.userId),
      name: r.userName ?? "Anonymous",
      avatar_url: r.userAvatar ?? undefined,
    },
  };
}

export function dbToolToLeaderboard(t: DbTool, rank: number): LeaderboardEntry {
  return {
    rank,
    tool: dbToolToFrontend(t),
    rank_change: t.weeklyRankChange ?? 0,
    period: "weekly",
  };
}
