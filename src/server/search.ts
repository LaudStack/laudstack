/**
 * PostgreSQL Full-Text Search with pg_trgm fuzzy matching
 *
 * Replaces the non-functional Typesense integration with native PostgreSQL
 * full-text search using tsvector/tsquery for relevance ranking and
 * pg_trgm for typo-tolerant fuzzy matching.
 *
 * Features:
 * - Full-text search with tsvector/tsquery (weighted: name A, tagline B, description/category C)
 * - Trigram similarity for typo tolerance (e.g. "analtics" → "analytics")
 * - Combined relevance scoring: ts_rank + similarity
 * - Category, pricing model, and featured filters
 * - Pagination support
 * - Permission-aware: only returns approved + visible tools
 */

import { db } from "./db";
import { sql } from "drizzle-orm";
import type { Tool } from "@/drizzle/schema";

export interface SearchResult {
  tool: Tool;
  relevance: number;
  matchType: "fulltext" | "fuzzy" | "ilike";
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  perPage: number;
  query: string;
}

/**
 * Full-text search with fuzzy fallback.
 *
 * Strategy:
 * 1. Try tsvector full-text search first (handles exact words, stemming, prefixes)
 * 2. If < perPage results, supplement with trigram similarity search (handles typos)
 * 3. If still nothing, fall back to basic ILIKE (handles partial substrings)
 */
export async function searchToolsPg(
  query: string,
  {
    category,
    pricingModel,
    isFeatured,
    page = 1,
    perPage = 20,
    minSimilarity = 0.15,
  }: {
    category?: string;
    pricingModel?: string;
    isFeatured?: boolean;
    page?: number;
    perPage?: number;
    minSimilarity?: number;
  } = {}
): Promise<SearchResponse> {
  const trimmed = query.trim();
  if (!trimmed) {
    return browseTools({ category, pricingModel, isFeatured, page, perPage });
  }

  const offset = (page - 1) * perPage;

  // Build filter conditions
  const filterParts: string[] = [
    `t.status IN ('approved', 'featured')`,
    `t.is_visible = true`,
  ];
  const filterParams: unknown[] = [];
  let paramIndex = 1;

  if (category && category !== "All") {
    filterParts.push(`t.category = $${paramIndex}`);
    filterParams.push(category);
    paramIndex++;
  }
  if (pricingModel && pricingModel !== "All") {
    filterParts.push(`t.pricing_model = $${paramIndex}`);
    filterParams.push(pricingModel);
    paramIndex++;
  }
  if (isFeatured) {
    filterParts.push(`t.is_featured = true`);
  }

  const filterClause = filterParts.join(" AND ");

  // Prepare the search query for tsquery — handle multi-word queries
  // Convert "ai writing tool" → "ai:* & writing:* & tool:*" for prefix matching
  const tsQueryTerms = trimmed
    .split(/\s+/)
    .filter(w => w.length > 0)
    .map(w => w.replace(/[^a-zA-Z0-9]/g, ""))
    .filter(w => w.length > 0)
    .map(w => `${w}:*`)
    .join(" & ");

  const queryParam = `$${paramIndex}`;
  filterParams.push(trimmed);
  paramIndex++;

  const tsQueryParam = `$${paramIndex}`;
  filterParams.push(tsQueryTerms || trimmed);
  paramIndex++;

  // Combined search: full-text + trigram similarity
  // Uses COALESCE to handle NULL search_vector gracefully
  const searchSql = `
    WITH scored AS (
      SELECT
        t.*,
        COALESCE(
          ts_rank_cd(COALESCE(t.search_vector, to_tsvector('english', t.name || ' ' || t.tagline || ' ' || COALESCE(t.description, ''))), to_tsquery('english', ${tsQueryParam})),
          0
        ) AS ts_score,
        GREATEST(
          similarity(t.name, ${queryParam}),
          similarity(t.tagline, ${queryParam})
        ) AS trgm_score
      FROM tools t
      WHERE ${filterClause}
        AND (
          -- Full-text match
          COALESCE(t.search_vector, to_tsvector('english', t.name || ' ' || t.tagline || ' ' || COALESCE(t.description, ''))) @@ to_tsquery('english', ${tsQueryParam})
          -- OR trigram similarity match on name/tagline
          OR similarity(t.name, ${queryParam}) > ${minSimilarity}
          OR similarity(t.tagline, ${queryParam}) > ${minSimilarity}
          -- OR basic ILIKE fallback for substring matches
          OR t.name ILIKE '%' || ${queryParam} || '%'
          OR t.tagline ILIKE '%' || ${queryParam} || '%'
        )
    )
    SELECT *,
      (ts_score * 2.0 + trgm_score + CASE WHEN t.is_featured THEN 0.1 ELSE 0 END) AS combined_score
    FROM scored t
    ORDER BY combined_score DESC, t.rank_score DESC
    LIMIT ${perPage}
    OFFSET ${offset}
  `;

  const countSql = `
    SELECT COUNT(*) as total
    FROM tools t
    WHERE ${filterClause}
      AND (
        COALESCE(t.search_vector, to_tsvector('english', t.name || ' ' || t.tagline || ' ' || COALESCE(t.description, ''))) @@ to_tsquery('english', ${tsQueryParam})
        OR similarity(t.name, ${queryParam}) > ${minSimilarity}
        OR similarity(t.tagline, ${queryParam}) > ${minSimilarity}
        OR t.name ILIKE '%' || ${queryParam} || '%'
        OR t.tagline ILIKE '%' || ${queryParam} || '%'
      )
  `;

  try {
    const [rows, countResult] = await Promise.all([
      db.execute(sql.raw(searchSql.replace(/\$(\d+)/g, (_, n) => {
        const idx = parseInt(n) - 1;
        const val = filterParams[idx];
        if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`;
        if (typeof val === "boolean") return val ? "true" : "false";
        return String(val);
      }))),
      db.execute(sql.raw(countSql.replace(/\$(\d+)/g, (_, n) => {
        const idx = parseInt(n) - 1;
        const val = filterParams[idx];
        if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`;
        if (typeof val === "boolean") return val ? "true" : "false";
        return String(val);
      }))),
    ]);

    const results: SearchResult[] = (rows as unknown as Record<string, unknown>[]).map(row => ({
      tool: rowToTool(row),
      relevance: Number(row.combined_score ?? 0),
      matchType: Number(row.ts_score ?? 0) > 0 ? "fulltext" as const :
                 Number(row.trgm_score ?? 0) > 0 ? "fuzzy" as const : "ilike" as const,
    }));

    const total = Number((countResult as unknown as Record<string, unknown>[])[0]?.total ?? 0);

    return { results, total, page, perPage, query: trimmed };
  } catch (err) {
    console.error("[PG Search] Error:", err);
    // Fallback to simple ILIKE search
    return fallbackSearch(trimmed, { category, pricingModel, isFeatured, page, perPage });
  }
}

/**
 * Browse tools without a search query — returns all tools sorted by rank_score.
 */
async function browseTools({
  category,
  pricingModel,
  isFeatured,
  page = 1,
  perPage = 20,
}: {
  category?: string;
  pricingModel?: string;
  isFeatured?: boolean;
  page?: number;
  perPage?: number;
}): Promise<SearchResponse> {
  const offset = (page - 1) * perPage;
  const conditions: string[] = [
    `status IN ('approved', 'featured')`,
    `is_visible = true`,
  ];

  if (category && category !== "All") conditions.push(`category = '${category.replace(/'/g, "''")}'`);
  if (pricingModel && pricingModel !== "All") conditions.push(`pricing_model = '${pricingModel.replace(/'/g, "''")}'`);
  if (isFeatured) conditions.push(`is_featured = true`);

  const whereClause = conditions.join(" AND ");

  const [rows, countResult] = await Promise.all([
    db.execute(sql.raw(`SELECT * FROM tools WHERE ${whereClause} ORDER BY rank_score DESC LIMIT ${perPage} OFFSET ${offset}`)),
    db.execute(sql.raw(`SELECT COUNT(*) as total FROM tools WHERE ${whereClause}`)),
  ]);

  return {
    results: (rows as unknown as Record<string, unknown>[]).map(row => ({
      tool: rowToTool(row),
      relevance: 0,
      matchType: "ilike" as const,
    })),
    total: Number((countResult as unknown as Record<string, unknown>[])[0]?.total ?? 0),
    page,
    perPage,
    query: "",
  };
}

/**
 * Simple ILIKE fallback search when full-text search fails.
 */
async function fallbackSearch(
  query: string,
  {
    category,
    pricingModel,
    isFeatured,
    page = 1,
    perPage = 20,
  }: {
    category?: string;
    pricingModel?: string;
    isFeatured?: boolean;
    page?: number;
    perPage?: number;
  }
): Promise<SearchResponse> {
  const offset = (page - 1) * perPage;
  const escaped = query.replace(/'/g, "''");
  const conditions: string[] = [
    `status IN ('approved', 'featured')`,
    `is_visible = true`,
    `(name ILIKE '%${escaped}%' OR tagline ILIKE '%${escaped}%' OR description ILIKE '%${escaped}%')`,
  ];

  if (category && category !== "All") conditions.push(`category = '${category.replace(/'/g, "''")}'`);
  if (pricingModel && pricingModel !== "All") conditions.push(`pricing_model = '${pricingModel.replace(/'/g, "''")}'`);
  if (isFeatured) conditions.push(`is_featured = true`);

  const whereClause = conditions.join(" AND ");

  const [rows, countResult] = await Promise.all([
    db.execute(sql.raw(`SELECT * FROM tools WHERE ${whereClause} ORDER BY rank_score DESC LIMIT ${perPage} OFFSET ${offset}`)),
    db.execute(sql.raw(`SELECT COUNT(*) as total FROM tools WHERE ${whereClause}`)),
  ]);

  return {
    results: (rows as unknown as Record<string, unknown>[]).map(row => ({
      tool: rowToTool(row),
      relevance: 0,
      matchType: "ilike" as const,
    })),
    total: Number((countResult as unknown as Record<string, unknown>[])[0]?.total ?? 0),
    page,
    perPage,
    query,
  };
}

/**
 * Quick autocomplete search — returns up to `limit` tools matching the query.
 * Optimized for speed: uses trigram index on name + tagline only.
 */
export async function autocompleteSearch(
  query: string,
  limit = 6
): Promise<{ id: number; slug: string; name: string; tagline: string; category: string; logoUrl: string | null; averageRating: number }[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const escaped = trimmed.replace(/'/g, "''");

  try {
    const rows = await db.execute(sql.raw(`
      SELECT id, slug, name, tagline, category, logo_url, average_rating
      FROM tools
      WHERE status IN ('approved', 'featured')
        AND is_visible = true
        AND (
          name ILIKE '%${escaped}%'
          OR tagline ILIKE '%${escaped}%'
          OR similarity(name, '${escaped}') > 0.15
        )
      ORDER BY
        CASE WHEN name ILIKE '${escaped}%' THEN 0 ELSE 1 END,
        similarity(name, '${escaped}') DESC,
        rank_score DESC
      LIMIT ${limit}
    `));

    return (rows as unknown as Record<string, unknown>[]).map(row => ({
      id: Number(row.id),
      slug: String(row.slug),
      name: String(row.name),
      tagline: String(row.tagline),
      category: String(row.category),
      logoUrl: row.logo_url ? String(row.logo_url) : null,
      averageRating: Number(row.average_rating ?? 0),
    }));
  } catch (err) {
    console.error("[Autocomplete] Error:", err);
    return [];
  }
}

/**
 * Convert a raw SQL row to a Tool object.
 * Maps snake_case DB columns to camelCase schema fields.
 */
function rowToTool(row: Record<string, unknown>): Tool {
  return {
    id: Number(row.id),
    slug: String(row.slug ?? ""),
    name: String(row.name ?? ""),
    tagline: String(row.tagline ?? ""),
    description: String(row.description ?? ""),
    logoUrl: row.logo_url ? String(row.logo_url) : null,
    screenshotUrl: row.screenshot_url ? String(row.screenshot_url) : null,
    websiteUrl: String(row.website_url ?? ""),
    category: String(row.category ?? ""),
    pricingModel: String(row.pricing_model ?? "Freemium") as Tool["pricingModel"],
    tags: (typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags ?? []) as string[],
    badges: (typeof row.badges === "string" ? JSON.parse(row.badges) : row.badges ?? []) as string[],
    submittedBy: row.submitted_by ? Number(row.submitted_by) : null,
    status: String(row.status ?? "pending") as Tool["status"],
    isFeatured: Boolean(row.is_featured),
    isVerified: Boolean(row.is_verified),
    isPro: Boolean(row.is_pro),
    upvoteCount: Number(row.upvote_count ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    averageRating: Number(row.average_rating ?? 0),
    rankScore: Number(row.rank_score ?? 0),
    weeklyRankChange: row.weekly_rank_change != null ? Number(row.weekly_rank_change) : 0,
    launchedAt: row.launched_at instanceof Date ? row.launched_at : new Date(String(row.launched_at ?? Date.now())),
    stripeProductId: row.stripe_product_id ? String(row.stripe_product_id) : null,
    typesenseId: row.typesense_id ? String(row.typesense_id) : null,
    affiliateUrl: row.affiliate_url ? String(row.affiliate_url) : null,
    viewCount: Number(row.view_count ?? 0),
    outboundClickCount: Number(row.outbound_click_count ?? 0),
    saveCount: Number(row.save_count ?? 0),
    isVisible: Boolean(row.is_visible ?? true),
    isSpotlighted: Boolean(row.is_spotlighted),
    isTrending: Boolean(row.is_trending),
    claimedBy: row.claimed_by ? Number(row.claimed_by) : null,
    claimedAt: row.claimed_at instanceof Date ? row.claimed_at : row.claimed_at ? new Date(String(row.claimed_at)) : null,
    scheduledLaunchAt: row.scheduled_launch_at instanceof Date ? row.scheduled_launch_at : row.scheduled_launch_at ? new Date(String(row.scheduled_launch_at)) : null,
    shortDescription: row.short_description ? String(row.short_description) : null,
    pricingDetails: row.pricing_details ? String(row.pricing_details) : null,
    features: (row.features as Tool["features"]) ?? [],
    pricingTiers: (row.pricing_tiers as Tool["pricingTiers"]) ?? [],
    createdAt: row.created_at instanceof Date ? row.created_at : new Date(String(row.created_at ?? Date.now())),
    updatedAt: row.updated_at instanceof Date ? row.updated_at : new Date(String(row.updated_at ?? Date.now())),
  };
}
