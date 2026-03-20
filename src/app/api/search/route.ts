import { NextRequest, NextResponse } from "next/server";
import { autocompleteSearch, searchToolsPg } from "@/server/search";
import { dbToolToFrontend } from "@/lib/adapters";

/**
 * GET /api/search
 *
 * Query params:
 *   q        — search query (required, min 1 char)
 *   mode     — "autocomplete" (fast, limited fields) or "full" (paginated, full results)
 *   category — filter by category
 *   pricing  — filter by pricing model
 *   featured — "true" to show only featured
 *   sort     — sort order (relevance, rating, reviews, newest, upvotes)
 *   page     — page number (default 1)
 *   limit    — results per page (default 20, max 50)
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = params.get("q") ?? "";
  const mode = params.get("mode") ?? "autocomplete";

  if (q.trim().length < 1 && mode === "autocomplete") {
    return NextResponse.json([]);
  }

  try {
    if (mode === "autocomplete") {
      const limit = Math.min(Number(params.get("limit") ?? 6), 10);
      const results = await autocompleteSearch(q.trim(), limit);
      return NextResponse.json(results);
    }

    // Full search mode
    const category = params.get("category") ?? undefined;
    const pricingModel = params.get("pricing") ?? undefined;
    const isFeatured = params.get("featured") === "true" ? true : undefined;
    const page = Math.max(1, Number(params.get("page") ?? 1));
    const perPage = Math.min(Math.max(1, Number(params.get("limit") ?? 20)), 50);

    const searchResult = await searchToolsPg(q.trim(), {
      category,
      pricingModel,
      isFeatured,
      page,
      perPage,
    });

    return NextResponse.json({
      tools: searchResult.results.map(r => ({
        ...dbToolToFrontend(r.tool),
        _relevance: r.relevance,
        _matchType: r.matchType,
      })),
      total: searchResult.total,
      page: searchResult.page,
      perPage: searchResult.perPage,
      query: searchResult.query,
    });
  } catch (error) {
    console.error("[search API]", error);
    if (mode === "autocomplete") {
      return NextResponse.json([]);
    }
    return NextResponse.json({
      tools: [],
      total: 0,
      page: 1,
      perPage: 20,
      query: q,
    });
  }
}
