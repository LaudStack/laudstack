"use server";
/**
 * SEO Page Fetcher Actions
 *
 * These server actions are called by client components to fetch data
 * for programmatic SEO pages. They return frontend-typed Tool objects.
 */
import {
  getCategorySEOData,
  getBestToolsData,
  getAlternativesData,
  getDiscoverySEOData,
} from "@/app/actions/seo";
import { dbToolToFrontend } from "@/lib/adapters";
import type { Tool as DbTool } from "@/drizzle/schema";
import type { Tool } from "@/lib/types";

/** Fetch tools for a category SEO page (client-callable) */
export async function fetchCategoryTools(
  categorySlug: string,
  sort: string,
  page: number
): Promise<{ tools: Tool[]; total: number }> {
  const data = await getCategorySEOData(categorySlug, { sort, page, limit: 24 });
  if (!data) return { tools: [], total: 0 };
  return {
    tools: data.tools.map((t) => dbToolToFrontend(t as unknown as DbTool)),
    total: data.total,
  };
}

/** Fetch tools for a "best tools" SEO page (client-callable) */
export async function fetchBestTools(
  slug: string,
  sort: string,
  page: number
): Promise<{ tools: Tool[]; total: number }> {
  const data = await getBestToolsData(slug, { sort, page, limit: 24 });
  if (!data) return { tools: [], total: 0 };
  return {
    tools: data.tools.map((t) => dbToolToFrontend(t as unknown as DbTool)),
    total: data.total,
  };
}

/** Fetch alternatives for a tool (client-callable) */
export async function fetchAlternatives(
  toolSlug: string,
  sort: string,
  page: number
): Promise<{ tools: Tool[]; total: number }> {
  const data = await getAlternativesData(toolSlug, { sort, page, limit: 20 });
  if (!data) return { tools: [], total: 0 };
  return {
    tools: data.alternatives.map((t) => dbToolToFrontend(t as unknown as DbTool)),
    total: data.total,
  };
}

/** Fetch tools for a discovery SEO page (client-callable) */
export async function fetchDiscoveryTools(
  type: "trending" | "top-rated" | "new" | "popular",
  sort: string,
  page: number
): Promise<{ tools: Tool[]; total: number }> {
  // Discovery pages have a fixed sort based on type, but we allow override
  const data = await getDiscoverySEOData(type, { page, limit: 24 });
  return {
    tools: data.tools.map((t) => dbToolToFrontend(t as unknown as DbTool)),
    total: data.total,
  };
}

/** Fetch recently launched tools for showcase strips (client-callable) */
export async function fetchRecentlyLaunched(
  limit: number = 6
): Promise<Tool[]> {
  const data = await getDiscoverySEOData("new", { page: 1, limit });
  return data.tools.map((t) => dbToolToFrontend(t as unknown as DbTool));
}
