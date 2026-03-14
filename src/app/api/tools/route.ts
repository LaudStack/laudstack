import { NextRequest, NextResponse } from "next/server";
import { getTools, getTrendingTools, getRecentLaunches } from "@/server/db";
import { dbToolsToFrontend } from "@/lib/adapters";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const type = params.get("type"); // "trending" | "recent" | "all"
  const category = params.get("category") ?? undefined;
  const pricingModel = params.get("pricing") ?? undefined;
  const sort = params.get("sort") ?? "rank_score";
  const limit = parseInt(params.get("limit") ?? "20");
  const offset = parseInt(params.get("offset") ?? "0");

  try {
    let results;
    if (type === "trending") {
      results = await getTrendingTools(limit);
    } else if (type === "recent") {
      results = await getRecentLaunches(limit);
    } else {
      results = await getTools({ category, pricingModel, sort, limit, offset });
    }
    return NextResponse.json(dbToolsToFrontend(results));
  } catch (error) {
    console.error("[tools API]", error);
    return NextResponse.json([]);
  }
}
