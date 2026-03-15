import Typesense from "typesense";
import type { Tool } from "@/drizzle/schema";

// ─── Client ───────────────────────────────────────────────────────────────────

export const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST ?? "localhost",
      port: parseInt(process.env.TYPESENSE_PORT ?? "8108"),
      protocol: process.env.TYPESENSE_PROTOCOL ?? "http",
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY ?? "xyz",
  connectionTimeoutSeconds: 2,
});

// ─── Collection schema ────────────────────────────────────────────────────────

export const TOOLS_COLLECTION = "tools";

export const toolsCollectionSchema = {
  name: TOOLS_COLLECTION,
  fields: [
    { name: "id", type: "string" as const },
    { name: "slug", type: "string" as const },
    { name: "name", type: "string" as const },
    { name: "tagline", type: "string" as const },
    { name: "description", type: "string" as const },
    { name: "category", type: "string" as const, facet: true },
    { name: "pricing_model", type: "string" as const, facet: true },
    { name: "tags", type: "string[]" as const, facet: true },
    { name: "badges", type: "string[]" as const, facet: true },
    { name: "is_featured", type: "bool" as const, facet: true },
    { name: "is_verified", type: "bool" as const },
    { name: "is_visible", type: "bool" as const },
    { name: "status", type: "string" as const },
    { name: "is_approved", type: "bool" as const },  // derived field for easy filtering
    { name: "average_rating", type: "float" as const },
    { name: "review_count", type: "int32" as const },
    { name: "upvote_count", type: "int32" as const },
    { name: "rank_score", type: "float" as const },
    { name: "weekly_rank_change", type: "int32" as const },
    { name: "logo_url", type: "string" as const, optional: true },
    { name: "launched_at", type: "int64" as const },
  ],
  default_sorting_field: "rank_score",
};

// ─── Index a product ─────────────────────────────────────────────────────────────

export async function indexTool(tool: Tool): Promise<void> {
  const doc = {
    id: tool.id.toString(),
    slug: tool.slug,
    name: tool.name,
    tagline: tool.tagline,
    description: tool.description,
    category: tool.category,
    pricing_model: tool.pricingModel,
    tags: (tool.tags as string[]) ?? [],
    badges: (tool.badges as string[]) ?? [],
    is_featured: tool.isFeatured,
    is_verified: tool.isVerified,
    is_visible: tool.isVisible,
    status: tool.status,
    is_approved: tool.status === "approved",
    average_rating: tool.averageRating,
    review_count: tool.reviewCount,
    upvote_count: tool.upvoteCount,
    rank_score: tool.rankScore,
    weekly_rank_change: tool.weeklyRankChange ?? 0,
    logo_url: tool.logoUrl ?? "",
    launched_at: Math.floor(new Date(tool.launchedAt).getTime() / 1000),
  };

  try {
    await typesenseClient
      .collections(TOOLS_COLLECTION)
      .documents()
      .upsert(doc);
  } catch (err) {
    console.error("[Typesense] Failed to index tool:", err);
  }
}

// ─── Search products ─────────────────────────────────────────────────────────────

export async function searchTools(
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
  } = {}
) {
  const filterParts: string[] = [
    // Always restrict to approved and visible tools
    "is_approved:=true",
    "is_visible:=true",
  ];

  if (category && category !== "All") {
    filterParts.push(`category:=${category}`);
  }
  if (pricingModel && pricingModel !== "All") {
    filterParts.push(`pricing_model:=${pricingModel}`);
  }
  if (isFeatured) {
    filterParts.push("is_featured:=true");
  }

  const searchParams = {
    q: query || "*",
    query_by: "name,tagline,description,tags",
    filter_by: filterParts.join(" && ") || undefined,
    sort_by: query ? "_text_match:desc,rank_score:desc" : "rank_score:desc",
    page,
    per_page: perPage,
    highlight_full_fields: "name,tagline",
  };

  try {
    const result = await typesenseClient
      .collections(TOOLS_COLLECTION)
      .documents()
      .search(searchParams);

    return result;
  } catch (err) {
    console.error("[Typesense] Search failed:", err);
    return null;
  }
}

// ─── Initialize collection ────────────────────────────────────────────────────

export async function initTypesenseCollection(): Promise<void> {
  try {
    await typesenseClient.collections(TOOLS_COLLECTION).retrieve();
    console.log("[Typesense] Collection already exists");
  } catch {
    try {
      await typesenseClient.collections().create(toolsCollectionSchema);
      console.log("[Typesense] Collection created");
    } catch (err) {
      console.error("[Typesense] Failed to create collection:", err);
    }
  }
}
