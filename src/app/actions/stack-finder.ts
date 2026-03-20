"use server";

import { db } from "@/server/db";
import { tools } from "@/drizzle/schema";
import { and, eq, inArray, desc } from "drizzle-orm";
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

// ─── Related category map ──────────────────────────────────────────────────
// Only truly related categories get a small bonus. This prevents "AI Writing"
// from appearing when searching for "AI Video".

const RELATED_CATEGORIES: Record<string, string[]> = {
  "AI Productivity":    ["AI Writing", "AI Code", "AI Analytics", "Project Management"],
  "AI Writing":         ["AI Productivity", "Marketing"],
  "AI Image":           ["Design", "AI Video"],
  "AI Video":           ["AI Image", "AI Audio", "Design"],
  "AI Audio":           ["AI Video"],
  "AI Code":            ["Developer Tools", "AI Productivity"],
  "AI Analytics":       ["AI Productivity", "Marketing"],
  "Design":             ["AI Image", "AI Video"],
  "Marketing":          ["AI Writing", "AI Analytics", "Sales", "CRM"],
  "Developer Tools":    ["AI Code"],
  "Project Management": ["AI Productivity"],
  "Customer Support":   ["CRM", "Sales"],
  "CRM":                ["Sales", "Customer Support", "Marketing"],
  "Sales":              ["CRM", "Marketing", "Customer Support"],
  "HR & Recruiting":    [],
  "Finance":            [],
  "Security":           [],
  "E-commerce":         ["Marketing", "Sales"],
  "Education":          [],
  "Other":              [],
};

// ─── Budget → pricing compatibility ─────────────────────────────────────────

function budgetMatchScore(toolPricing: string, budget: string): number {
  switch (budget) {
    case "free_only":
      if (toolPricing === "Free" || toolPricing === "Open Source") return 1.0;
      return 0; // strict: free_only means no paid tools
    case "under_50":
      if (toolPricing === "Free" || toolPricing === "Open Source") return 1.0;
      if (toolPricing === "Freemium") return 0.9;
      if (toolPricing === "Free Trial") return 0.7;
      if (toolPricing === "Paid") return 0.4;
      return 0.5;
    case "50_200":
    case "200_500":
    case "500_plus":
    case "no_limit":
      // All pricing models are acceptable at higher budgets
      if (toolPricing === "Free" || toolPricing === "Open Source") return 0.9;
      if (toolPricing === "Freemium") return 0.95;
      if (toolPricing === "Free Trial") return 0.8;
      if (toolPricing === "Paid") return 0.85;
      return 0.7;
    default:
      return 0.7;
  }
}

// ─── Priority scoring ───────────────────────────────────────────────────────

function priorityScore(
  tool: {
    averageRating: number;
    upvoteCount: number;
    launchedAt: Date;
    isVerified: boolean;
    reviewCount: number;
    features: unknown[] | null;
    rankScore: number;
    pricingModel: string;
  },
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
        score += weight * Math.min(tool.averageRating / 5, 1);
        break;
      case "popularity":
        score += weight * (maxUpvotes > 0 ? tool.upvoteCount / maxUpvotes : 0);
        break;
      case "new_innovative":
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
      case "best_value": {
        const pricingVal: Record<string, number> = {
          "Free": 1, "Open Source": 1, "Freemium": 0.8, "Free Trial": 0.5, "Paid": 0.2,
        };
        score += weight * (pricingVal[tool.pricingModel] ?? 0.5);
        break;
      }
      case "feature_rich": {
        const featureCount = (tool.features as unknown[] | null)?.length ?? 0;
        const featureScore =
          Math.min(featureCount / 8, 1) * 0.5 +
          (maxReviews > 0 ? (tool.reviewCount / maxReviews) * 0.5 : 0);
        score += weight * featureScore;
        break;
      }
    }
  }

  return Math.min(score, 1);
}

// ─── Main matching function ─────────────────────────────────────────────────

export async function findMatchingStacks(
  input: StackFinderInput
): Promise<StackFinderResponse> {
  // 1. Build the set of categories to query: selected + related
  const selectedSet = new Set(input.categories);
  const relatedSet = new Set<string>();

  for (const cat of input.categories) {
    const related = RELATED_CATEGORIES[cat] ?? [];
    for (const r of related) {
      if (!selectedSet.has(r)) relatedSet.add(r);
    }
  }

  // All categories to fetch (selected + related)
  const allCategories = [...selectedSet, ...relatedSet];

  // 2. Fetch only tools in matching categories (much faster than fetching all)
  const matchingTools = await db
    .select()
    .from(tools)
    .where(
      and(
        inArray(tools.status, [...VISIBLE_STATUSES]),
        eq(tools.isVisible, true),
        inArray(tools.category, allCategories)
      )
    )
    .orderBy(desc(tools.rankScore));

  if (matchingTools.length === 0) {
    return { results: [], totalMatched: 0, query: input };
  }

  // 3. Compute normalization bounds
  const maxUpvotes = Math.max(...matchingTools.map((t) => t.upvoteCount), 1);
  const maxReviews = Math.max(...matchingTools.map((t) => t.reviewCount), 1);
  const maxRankScore = Math.max(...matchingTools.map((t) => t.rankScore), 1);
  const timestamps = matchingTools.map((t) => t.launchedAt.getTime());
  const newestTs = Math.max(...timestamps);
  const oldestTs = Math.min(...timestamps);

  // 4. Score each tool
  const scored: { tool: DbTool; score: number; reasons: string[] }[] = [];

  for (const tool of matchingTools) {
    const reasons: string[] = [];
    let totalScore = 0;

    // ── Category match (45%) — strict, no loose tag matching ──────────
    let categoryScore = 0;
    if (selectedSet.has(tool.category)) {
      // Exact category match — full score
      categoryScore = 1.0;
      reasons.push(`Matches your ${tool.category} category`);
    } else if (relatedSet.has(tool.category)) {
      // Related category — small bonus only
      categoryScore = 0.25;
      reasons.push(`Related category: ${tool.category}`);
    }
    totalScore += categoryScore * 0.45;

    // ── Pricing match (25%) ──────────────────────────────────────────
    let pricingScore = 0;
    const pricingModelMatch =
      input.pricingPreferences.length === 0 ||
      input.pricingPreferences.includes(tool.pricingModel);
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
      pricingScore = budgetScore * 0.5;
    }
    totalScore += pricingScore * 0.25;

    // ── Quality signal (15%) ─────────────────────────────────────────
    const qualityScore = tool.rankScore / maxRankScore;
    totalScore += qualityScore * 0.15;

    if (tool.averageRating >= 4.5 && tool.reviewCount >= 3) {
      reasons.push(
        `${tool.averageRating.toFixed(1)}★ rating from ${tool.reviewCount} reviews`
      );
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

    if (input.priorities.includes("popularity") && tool.upvoteCount > 0) {
      reasons.push(`${tool.upvoteCount} community lauds`);
    }
    if (input.priorities.includes("verified_established") && tool.isVerified) {
      reasons.push(`Verified product`);
    }

    // ── Minimum threshold: must have category match ──────────────────
    // Only include tools that actually match a selected or related category
    if (categoryScore > 0) {
      scored.push({
        tool,
        score: Math.round(totalScore * 100),
        reasons: reasons.slice(0, 4),
      });
    }
  }

  // 5. Sort: exact category matches first, then by score, then by rank_score
  scored.sort((a, b) => {
    // Primary: exact category match vs related
    const aExact = selectedSet.has(a.tool.category) ? 1 : 0;
    const bExact = selectedSet.has(b.tool.category) ? 1 : 0;
    if (bExact !== aExact) return bExact - aExact;
    // Secondary: match score
    if (b.score !== a.score) return b.score - a.score;
    // Tertiary: rank_score tiebreaker
    return b.tool.rankScore - a.tool.rankScore;
  });

  // 6. Return top 20
  const top = scored.slice(0, 20);

  return {
    results: top.map((s) => ({
      tool: dbToolToFrontend(s.tool),
      matchScore: s.score,
      matchReasons: s.reasons,
    })),
    totalMatched: scored.length,
    query: input,
  };
}
