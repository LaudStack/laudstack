"use server";

import { db } from "@/server/db";
import { tools } from "@/drizzle/schema";
import { and, eq, inArray, desc, sql } from "drizzle-orm";
import { dbToolToFrontend } from "@/lib/adapters";
import type { Tool as DbTool } from "@/drizzle/schema";
import type { Tool } from "@/lib/types";

/**
 * Visible tool statuses — tools that should appear on public-facing pages.
 */
const VISIBLE_STATUSES = ["approved", "featured"] as const;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface StackFinderInput {
  /** Step 1: selected categories (at least one) */
  categories: string[];
  /** Step 2: business type */
  businessType: string;
  /** Step 2: team size */
  teamSize: string;
  /** Step 3: budget preference */
  budget: string;
  /** Step 3: pricing model preferences */
  pricingPreferences: string[];
  /** Step 4: priority signals (optional, up to 3) */
  priorities: string[];
}

export interface StackFinderResult {
  tool: Tool;
  matchScore: number;        // 0-100
  matchReasons: string[];    // human-readable explanations
}

export interface StackFinderResponse {
  results: StackFinderResult[];
  totalMatched: number;
  query: StackFinderInput;
}

// ─── Budget → pricing compatibility ─────────────────────────────────────────

function budgetCompatibleModels(budget: string): string[] {
  switch (budget) {
    case "free_only":
      return ["Free", "Open Source"];
    case "under_50":
      return ["Free", "Freemium", "Free Trial", "Open Source"];
    case "50_200":
      return ["Free", "Freemium", "Free Trial", "Paid", "Open Source"];
    case "200_500":
    case "500_plus":
    case "no_limit":
      return ["Free", "Freemium", "Free Trial", "Paid", "Open Source"];
    default:
      return ["Free", "Freemium", "Free Trial", "Paid", "Open Source"];
  }
}

function budgetMatchScore(toolPricing: string, budget: string): number {
  const compatible = budgetCompatibleModels(budget);
  if (!compatible.includes(toolPricing)) return 0;

  // Stronger signal for exact alignment
  if (budget === "free_only" && (toolPricing === "Free" || toolPricing === "Open Source")) return 1.0;
  if (budget === "free_only") return 0;
  if (budget === "under_50" && (toolPricing === "Free" || toolPricing === "Freemium" || toolPricing === "Open Source")) return 1.0;
  if (budget === "under_50" && toolPricing === "Free Trial") return 0.7;
  if (budget === "under_50" && toolPricing === "Paid") return 0.4;
  return 0.8; // general compatibility
}

// ─── Priority scoring ───────────────────────────────────────────────────────

function priorityScore(
  tool: { averageRating: number; upvoteCount: number; launchedAt: Date; isVerified: boolean; reviewCount: number; features: unknown[] | null; rankScore: number; pricingModel: string },
  priorities: string[],
  maxUpvotes: number,
  maxReviews: number,
  newestTs: number,
  oldestTs: number
): number {
  if (priorities.length === 0) return 0.5; // neutral if no priorities selected

  let score = 0;
  const weight = 1 / priorities.length;

  for (const p of priorities) {
    switch (p) {
      case "community_trust":
        // Normalized rating (0-5 → 0-1)
        score += weight * Math.min(tool.averageRating / 5, 1);
        break;
      case "popularity":
        // Normalized upvotes
        score += weight * (maxUpvotes > 0 ? tool.upvoteCount / maxUpvotes : 0);
        break;
      case "new_innovative":
        // Recency score
        if (newestTs > oldestTs) {
          const ts = tool.launchedAt.getTime();
          score += weight * ((ts - oldestTs) / (newestTs - oldestTs));
        } else {
          score += weight * 0.5;
        }
        break;
      case "verified_established":
        score += weight * (tool.isVerified ? 1 : 0.3);
        break;
      case "best_value":
        // Free/Open Source get highest, then Freemium, then others
        const pricingVal: Record<string, number> = { "Free": 1, "Open Source": 1, "Freemium": 0.8, "Free Trial": 0.5, "Paid": 0.2 };
        score += weight * (pricingVal[tool.pricingModel as string] ?? 0.5);
        break;
      case "feature_rich":
        // Based on features count + review count as proxy
        const featureCount = (tool.features as unknown[] | null)?.length ?? 0;
        const featureScore = Math.min(featureCount / 8, 1) * 0.5 + (maxReviews > 0 ? (tool.reviewCount / maxReviews) * 0.5 : 0);
        score += weight * featureScore;
        break;
    }
  }

  return Math.min(score, 1);
}

// ─── Main matching function ─────────────────────────────────────────────────

export async function findMatchingStacks(input: StackFinderInput): Promise<StackFinderResponse> {
  // 1. Fetch all visible tools with their data
  const allTools = await db
    .select()
    .from(tools)
    .where(
      and(
        inArray(tools.status, [...VISIBLE_STATUSES]),
        eq(tools.isVisible, true)
      )
    )
    .orderBy(desc(tools.rankScore));

  if (allTools.length === 0) {
    return { results: [], totalMatched: 0, query: input };
  }

  // 2. Compute normalization bounds
  const maxUpvotes = Math.max(...allTools.map(t => t.upvoteCount));
  const maxReviews = Math.max(...allTools.map(t => t.reviewCount));
  const maxRankScore = Math.max(...allTools.map(t => t.rankScore));
  const timestamps = allTools.map(t => t.launchedAt.getTime());
  const newestTs = Math.max(...timestamps);
  const oldestTs = Math.min(...timestamps);

  // 3. Score each tool
  const scored: { tool: DbTool; score: number; reasons: string[] }[] = [];

  for (const tool of allTools) {
    const reasons: string[] = [];
    let totalScore = 0;

    // ── Category match (40%) ──────────────────────────────────────────
    const categoryMatch = input.categories.includes(tool.category);
    const tagOverlap = (tool.tags as string[] | null)?.some(tag =>
      input.categories.some(cat => cat.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(cat.toLowerCase()))
    ) ?? false;

    let categoryScore = 0;
    if (categoryMatch) {
      categoryScore = 1.0;
      reasons.push(`Matches your ${tool.category} category`);
    } else if (tagOverlap) {
      categoryScore = 0.4;
      reasons.push(`Related through tags`);
    } else {
      categoryScore = 0;
    }
    totalScore += categoryScore * 0.40;

    // ── Pricing match (25%) ──────────────────────────────────────────
    let pricingScore = 0;

    // Check explicit pricing model preference
    const pricingModelMatch = input.pricingPreferences.length === 0 || input.pricingPreferences.includes(tool.pricingModel);
    const budgetScore = budgetMatchScore(tool.pricingModel, input.budget);

    if (pricingModelMatch && budgetScore > 0) {
      pricingScore = budgetScore;
      if (tool.pricingModel === "Free" || tool.pricingModel === "Open Source") {
        reasons.push(`${tool.pricingModel} — no cost to start`);
      } else if (tool.pricingModel === "Freemium") {
        reasons.push(`Freemium plan available`);
      } else if (tool.pricingModel === "Free Trial") {
        reasons.push(`Free trial available`);
      }
    } else if (pricingModelMatch) {
      pricingScore = 0.5;
    } else if (budgetScore > 0) {
      pricingScore = budgetScore * 0.6;
    }
    totalScore += pricingScore * 0.25;

    // ── Quality signal (20%) ─────────────────────────────────────────
    const qualityScore = maxRankScore > 0 ? tool.rankScore / maxRankScore : 0;
    totalScore += qualityScore * 0.20;

    if (tool.averageRating >= 4.5 && tool.reviewCount >= 3) {
      reasons.push(`${tool.averageRating.toFixed(1)}★ rating from ${tool.reviewCount} reviews`);
    } else if (tool.averageRating >= 4.0 && tool.reviewCount >= 1) {
      reasons.push(`${tool.averageRating.toFixed(1)}★ community rating`);
    }

    // ── Priority alignment (15%) ─────────────────────────────────────
    const priScore = priorityScore(
      {
        averageRating: tool.averageRating,
        upvoteCount: tool.upvoteCount,
        launchedAt: tool.launchedAt,
        isVerified: tool.isVerified,
        reviewCount: tool.reviewCount,
        features: tool.features as unknown[] | null,
        rankScore: tool.rankScore,
        pricingModel: tool.pricingModel,
      },
      input.priorities,
      maxUpvotes,
      maxReviews,
      newestTs,
      oldestTs
    );
    totalScore += priScore * 0.15;

    if (input.priorities.includes("community_trust") && tool.averageRating >= 4.0) {
      // already added rating reason above
    }
    if (input.priorities.includes("popularity") && tool.upvoteCount > 0) {
      reasons.push(`${tool.upvoteCount} community lauds`);
    }
    if (input.priorities.includes("verified_established") && tool.isVerified) {
      reasons.push(`Verified product`);
    }

    // Only include tools with meaningful match (at least category or pricing match)
    if (categoryScore > 0 || (pricingScore > 0.3 && qualityScore > 0.3)) {
      scored.push({
        tool,
        score: Math.round(totalScore * 100),
        reasons: reasons.slice(0, 4), // max 4 reasons
      });
    }
  }

  // 4. Sort by score DESC, then by rank_score as tiebreaker
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.tool.rankScore - a.tool.rankScore;
  });

  // 5. Return top 20
  const top = scored.slice(0, 20);

  return {
    results: top.map(s => ({
      tool: dbToolToFrontend(s.tool),
      matchScore: s.score,
      matchReasons: s.reasons,
    })),
    totalMatched: scored.length,
    query: input,
  };
}
