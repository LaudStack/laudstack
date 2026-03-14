/**
 * Adapters to convert Drizzle DB records (camelCase) to frontend types (snake_case).
 * This allows all existing components (ToolCard, etc.) to work without modification.
 */
import type { Tool as FrontendTool, Review as FrontendReview, LeaderboardEntry } from "./types";
import type { Tool as DbTool, Review as DbReview } from "@/drizzle/schema";

export function dbToolToFrontend(t: DbTool): FrontendTool {
  return {
    id: String(t.id),
    slug: t.slug,
    name: t.name,
    tagline: t.tagline,
    description: t.description,
    logo_url: t.logoUrl ?? `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${new URL(t.websiteUrl).hostname}&size=128`,
    website_url: t.websiteUrl,
    category: t.category as FrontendTool["category"],
    pricing_model: t.pricingModel as FrontendTool["pricing_model"],
    tags: (t.tags ?? []) as string[],
    badges: (t.badges ?? []) as FrontendTool["badges"],
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
  };
}

export function dbToolsToFrontend(tools: DbTool[]): FrontendTool[] {
  return tools.map(dbToolToFrontend);
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
