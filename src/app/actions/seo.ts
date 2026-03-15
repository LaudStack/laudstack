"use server";

import { db } from "@/server/db";
import { tools } from "@/drizzle/schema";
import { eq, and, desc, count, sql, ilike, or, ne } from "drizzle-orm";
import { CATEGORY_META } from "@/lib/categories";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SEOTool = typeof tools.$inferSelect;

export interface CategorySEOData {
  name: string;
  slug: string;
  icon: string;
  description: string;
  tools: SEOTool[];
  total: number;
}

export interface BestToolsData {
  title: string;
  slug: string;
  description: string;
  tools: SEOTool[];
  total: number;
  relatedPages: { title: string; href: string }[];
}

export interface AlternativesData {
  tool: SEOTool;
  alternatives: SEOTool[];
  total: number;
}

export interface ComparisonData {
  toolA: SEOTool;
  toolB: SEOTool;
}

// ─── Slug Helpers ─────────────────────────────────────────────────────────────

/** Convert a category name to a URL slug: "AI Writing" → "ai-writing-tools" */
export async function categoryToSlug(name: string): Promise<string> {
  return _categoryToSlugSync(name);
}

/** Sync slug helper for internal use */
function _categoryToSlugSync(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") + "-tools";
}

/** Convert a URL slug back to a category name: "ai-writing-tools" → "AI Writing" */
export async function slugToCategory(slug: string): Promise<string | null> {
  const match = CATEGORY_META.find(
    (c) => c.name !== "All" && _categoryToSlugSync(c.name) === slug
  );
  return match?.name ?? null;
}

// ─── Category SEO Data ────────────────────────────────────────────────────────

/** Get all categories with tool counts (for sitemap / index pages) */
export async function getAllCategoriesWithCounts(): Promise<
  { name: string; slug: string; icon: string; description: string; count: number }[]
> {
  const rows = await db
    .select({ category: tools.category, count: count() })
    .from(tools)
    .where(and(eq(tools.status, "approved"), eq(tools.isVisible, true)))
    .groupBy(tools.category);

  return CATEGORY_META
    .filter((c) => c.name !== "All")
    .map((c) => {
      const row = rows.find((r) => r.category === c.name);
      return {
        name: c.name,
        slug: _categoryToSlugSync(c.name),
        icon: c.icon,
        description: c.description,
        count: row?.count ?? 0,
      };
    })
    .filter((c) => c.count > 0);
}

/** Get tools for a specific category SEO page */
export async function getCategorySEOData(
  categorySlug: string,
  opts: { sort?: string; page?: number; limit?: number } = {}
): Promise<CategorySEOData | null> {
   const categoryName = await slugToCategory(categorySlug);
  if (!categoryName) return null;
  const meta = CATEGORY_META.find((c) => c.name === categoryName);
  if (!meta) return null;

  const { sort = "rank_score", page = 1, limit = 24 } = opts;
  const offset = (page - 1) * limit;

  let orderBy;
  switch (sort) {
    case "newest": orderBy = desc(tools.launchedAt); break;
    case "trending": orderBy = desc(tools.weeklyRankChange); break;
    case "top_rated": orderBy = desc(tools.averageRating); break;
    case "most_lauded": orderBy = desc(tools.upvoteCount); break;
    case "most_reviewed": orderBy = desc(tools.reviewCount); break;
    default: orderBy = desc(tools.rankScore);
  }

  const conditions = [eq(tools.status, "approved"), eq(tools.isVisible, true), eq(tools.category, categoryName)];

  const [rows, totalResult] = await Promise.all([
    db.select().from(tools).where(and(...conditions)).orderBy(orderBy).limit(limit).offset(offset),
    db.select({ count: count() }).from(tools).where(and(...conditions)),
  ]);

  return {
    name: meta.name,
    slug: categorySlug,
    icon: meta.icon,
    description: meta.description,
    tools: rows,
    total: totalResult[0].count,
  };
}

// ─── "Best Tools" Pages ───────────────────────────────────────────────────────

/** Definition of "best tools" page types that can be generated */
interface BestToolsPageDef {
  slug: string;
  title: string;
  description: string;
  /** SQL filter: category match or tag match */
  categories: string[];
  tags: string[];
}

/** Generate the list of all possible "best tools" pages */
function getBestToolsPageDefs(): BestToolsPageDef[] {
  const pages: BestToolsPageDef[] = [];

  // Category-based pages
  const categoryPages: { slug: string; title: string; desc: string; cats: string[] }[] = [
    { slug: "ai-tools-for-marketing", title: "Best AI Tools for Marketing", desc: "Discover the best AI-powered marketing tools ranked by community reviews, ratings, and Laud votes.", cats: ["Marketing"] },
    { slug: "ai-tools-for-writing", title: "Best AI Tools for Writing", desc: "Find the top AI writing assistants and content generators trusted by professionals.", cats: ["AI Writing"] },
    { slug: "ai-tools-for-coding", title: "Best AI Tools for Coding", desc: "Explore the best AI coding assistants and developer tools for faster development.", cats: ["AI Code", "Developer Tools"] },
    { slug: "ai-tools-for-design", title: "Best AI Tools for Design", desc: "Discover the best AI design tools for creators, from image generation to UI design.", cats: ["AI Image", "Design"] },
    { slug: "ai-tools-for-video", title: "Best AI Tools for Video", desc: "Find the top AI video creation and editing platforms for content creators.", cats: ["AI Video"] },
    { slug: "ai-tools-for-productivity", title: "Best AI Productivity Tools", desc: "Boost your workflow with the best AI-powered productivity and automation tools.", cats: ["AI Productivity"] },
    { slug: "ai-tools-for-analytics", title: "Best AI Tools for Analytics", desc: "Discover the best AI analytics and research tools for data-driven decisions.", cats: ["AI Analytics"] },
    { slug: "ai-tools-for-audio", title: "Best AI Tools for Audio", desc: "Find the top AI voice generation and audio tools for podcasters and creators.", cats: ["AI Audio"] },
    { slug: "saas-tools-for-startups", title: "Best SaaS Tools for Startups", desc: "The essential SaaS tools every startup needs, ranked by community reviews.", cats: ["AI Productivity", "Project Management", "CRM", "Sales", "Marketing"] },
    { slug: "ai-tools-for-customer-support", title: "Best AI Tools for Customer Support", desc: "Discover the best AI-powered customer service and support tools.", cats: ["Customer Support"] },
    { slug: "ai-tools-for-sales", title: "Best AI Tools for Sales", desc: "Find the top AI sales intelligence and outreach tools for growing revenue.", cats: ["Sales", "CRM"] },
    { slug: "ai-tools-for-hr", title: "Best AI Tools for HR & Recruiting", desc: "Discover the best AI-powered human resources and recruitment tools.", cats: ["HR & Recruiting"] },
    { slug: "ai-tools-for-education", title: "Best AI Tools for Education", desc: "Find the top AI educational technology and learning tools.", cats: ["Education"] },
    { slug: "ai-tools-for-ecommerce", title: "Best AI Tools for E-commerce", desc: "Discover the best AI tools for e-commerce platforms and online stores.", cats: ["E-commerce"] },
    { slug: "ai-tools-for-finance", title: "Best AI Tools for Finance", desc: "Find the top AI financial management and accounting tools.", cats: ["Finance"] },
    { slug: "ai-tools-for-security", title: "Best AI Tools for Security", desc: "Discover the best AI cybersecurity and data protection tools.", cats: ["Security"] },
    { slug: "project-management-tools", title: "Best Project Management Tools", desc: "Find the top project and task management platforms for teams of all sizes.", cats: ["Project Management"] },
    { slug: "crm-tools", title: "Best CRM Tools", desc: "Discover the best customer relationship management platforms for growing businesses.", cats: ["CRM"] },
  ];

  for (const cp of categoryPages) {
    pages.push({
      slug: cp.slug,
      title: cp.title,
      description: cp.desc,
      categories: cp.cats,
      tags: [],
    });
  }

  return pages;
}

/** Get all best-tools page slugs (for sitemap) */
export async function getAllBestToolsSlugs(): Promise<string[]> {
  const defs = getBestToolsPageDefs();
  // Only return pages that have at least 1 tool
  const results: string[] = [];
  for (const def of defs) {
    const catConditions = def.categories.map((c) => eq(tools.category, c));
    const whereClause = and(
      eq(tools.status, "approved"),
      eq(tools.isVisible, true),
      catConditions.length === 1 ? catConditions[0] : or(...catConditions)
    );
    const [{ count: c }] = await db.select({ count: count() }).from(tools).where(whereClause!);
    if (c > 0) results.push(def.slug);
  }
  return results;
}

/** Get data for a specific "best tools" page */
export async function getBestToolsData(
  slug: string,
  opts: { sort?: string; page?: number; limit?: number } = {}
): Promise<BestToolsData | null> {
  const def = getBestToolsPageDefs().find((d) => d.slug === slug);
  if (!def) return null;

  const { sort = "rank_score", page = 1, limit = 24 } = opts;
  const offset = (page - 1) * limit;

  let orderBy;
  switch (sort) {
    case "newest": orderBy = desc(tools.launchedAt); break;
    case "trending": orderBy = desc(tools.weeklyRankChange); break;
    case "top_rated": orderBy = desc(tools.averageRating); break;
    case "most_lauded": orderBy = desc(tools.upvoteCount); break;
    default: orderBy = desc(tools.rankScore);
  }

  const catConditions = def.categories.map((c) => eq(tools.category, c));
  const whereClause = and(
    eq(tools.status, "approved"),
    eq(tools.isVisible, true),
    catConditions.length === 1 ? catConditions[0] : or(...catConditions)
  );

  const [rows, totalResult] = await Promise.all([
    db.select().from(tools).where(whereClause!).orderBy(orderBy).limit(limit).offset(offset),
    db.select({ count: count() }).from(tools).where(whereClause!),
  ]);

  if (totalResult[0].count === 0) return null;

  // Build related pages
  const allDefs = getBestToolsPageDefs();
  const relatedPages = allDefs
    .filter((d) => d.slug !== slug && d.categories.some((c) => def.categories.includes(c)))
    .slice(0, 6)
    .map((d) => ({ title: d.title, href: `/best/${d.slug}` }));

  return {
    title: def.title,
    slug: def.slug,
    description: def.description,
    tools: rows,
    total: totalResult[0].count,
    relatedPages,
  };
}

// ─── Alternatives Pages ───────────────────────────────────────────────────────

/** Get all tool slugs that have alternatives (for sitemap) */
export async function getAllAlternativeSlugs(): Promise<string[]> {
  const approvedTools = await db
    .select({ slug: tools.slug, category: tools.category })
    .from(tools)
    .where(and(eq(tools.status, "approved"), eq(tools.isVisible, true)));

  // Only generate alternatives pages for tools that have at least 2 alternatives in the same category
  const categoryCounts: Record<string, number> = {};
  for (const t of approvedTools) {
    categoryCounts[t.category] = (categoryCounts[t.category] ?? 0) + 1;
  }

  return approvedTools
    .filter((t) => (categoryCounts[t.category] ?? 0) >= 3) // tool + at least 2 alternatives
    .map((t) => t.slug);
}

/** Get alternatives data for a specific tool */
export async function getAlternativesData(
  toolSlug: string,
  opts: { sort?: string; page?: number; limit?: number } = {}
): Promise<AlternativesData | null> {
  const [tool] = await db
    .select()
    .from(tools)
    .where(and(eq(tools.slug, toolSlug), eq(tools.status, "approved")))
    .limit(1);

  if (!tool) return null;

  const { sort = "rank_score", page = 1, limit = 20 } = opts;
  const offset = (page - 1) * limit;

  let orderBy;
  switch (sort) {
    case "newest": orderBy = desc(tools.launchedAt); break;
    case "trending": orderBy = desc(tools.weeklyRankChange); break;
    case "top_rated": orderBy = desc(tools.averageRating); break;
    case "most_lauded": orderBy = desc(tools.upvoteCount); break;
    default: orderBy = desc(tools.rankScore);
  }

  // Find alternatives: same category, different tool
  const conditions = [
    eq(tools.status, "approved"),
    eq(tools.isVisible, true),
    eq(tools.category, tool.category),
    ne(tools.id, tool.id),
  ];

  const [rows, totalResult] = await Promise.all([
    db.select().from(tools).where(and(...conditions)).orderBy(orderBy).limit(limit).offset(offset),
    db.select({ count: count() }).from(tools).where(and(...conditions)),
  ]);

  return {
    tool,
    alternatives: rows,
    total: totalResult[0].count,
  };
}

// ─── Comparison Pages ─────────────────────────────────────────────────────────

/** Get comparison data for two tools */
export async function getComparisonData(
  slugA: string,
  slugB: string
): Promise<ComparisonData | null> {
  const [toolA] = await db
    .select()
    .from(tools)
    .where(and(eq(tools.slug, slugA), eq(tools.status, "approved")))
    .limit(1);

  const [toolB] = await db
    .select()
    .from(tools)
    .where(and(eq(tools.slug, slugB), eq(tools.status, "approved")))
    .limit(1);

  if (!toolA || !toolB) return null;

  return { toolA, toolB };
}

/** Get popular comparison pairs (for sitemap and index) */
export async function getPopularComparisonPairs(): Promise<
  { slugA: string; slugB: string; nameA: string; nameB: string }[]
> {
  // Get top tools by rank score, group by category, and create pairs within each category
  const topTools = await db
    .select({
      slug: tools.slug,
      name: tools.name,
      category: tools.category,
      rankScore: tools.rankScore,
    })
    .from(tools)
    .where(and(eq(tools.status, "approved"), eq(tools.isVisible, true)))
    .orderBy(desc(tools.rankScore))
    .limit(100);

  const byCategory: Record<string, typeof topTools> = {};
  for (const t of topTools) {
    if (!byCategory[t.category]) byCategory[t.category] = [];
    byCategory[t.category].push(t);
  }

  const pairs: { slugA: string; slugB: string; nameA: string; nameB: string }[] = [];
  for (const cat of Object.values(byCategory)) {
    // Create pairs from top tools in each category (max 3 pairs per category)
    for (let i = 0; i < Math.min(cat.length, 4); i++) {
      for (let j = i + 1; j < Math.min(cat.length, 4); j++) {
        pairs.push({
          slugA: cat[i].slug,
          slugB: cat[j].slug,
          nameA: cat[i].name,
          nameB: cat[j].name,
        });
      }
    }
  }

  return pairs.slice(0, 50); // Cap at 50 comparison pages
}

// ─── Discovery / Trending SEO Pages ──────────────────────────────────────────

export interface DiscoverySEOData {
  title: string;
  description: string;
  tools: SEOTool[];
  total: number;
}

/** Get data for discovery SEO pages (trending, top-rated, new, popular) */
export async function getDiscoverySEOData(
  type: "trending" | "top-rated" | "new" | "popular",
  opts: { page?: number; limit?: number } = {}
): Promise<DiscoverySEOData> {
  const { page = 1, limit = 24 } = opts;
  const offset = (page - 1) * limit;

  let orderBy;
  let title: string;
  let description: string;

  switch (type) {
    case "trending":
      orderBy = desc(tools.weeklyRankChange);
      title = "Trending AI Tools";
      description = "Discover the hottest AI tools gaining momentum this week, ranked by community activity and Laud votes.";
      break;
    case "top-rated":
      orderBy = desc(tools.averageRating);
      title = "Top Rated AI Tools";
      description = "The highest-rated AI and SaaS tools on LaudStack, ranked by verified community reviews.";
      break;
    case "new":
      orderBy = desc(tools.launchedAt);
      title = "New AI Tools";
      description = "The latest AI and SaaS tools launched on LaudStack. Be the first to discover and review them.";
      break;
    case "popular":
      orderBy = desc(tools.upvoteCount);
      title = "Most Popular SaaS Tools";
      description = "The most popular SaaS and AI tools on LaudStack, ranked by community Laud votes.";
      break;
  }

  const conditions = [eq(tools.status, "approved"), eq(tools.isVisible, true)];

  const [rows, totalResult] = await Promise.all([
    db.select().from(tools).where(and(...conditions)).orderBy(orderBy).limit(limit).offset(offset),
    db.select({ count: count() }).from(tools).where(and(...conditions)),
  ]);

  return { title, description, tools: rows, total: totalResult[0].count };
}
