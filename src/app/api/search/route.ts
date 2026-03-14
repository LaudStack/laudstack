import { NextRequest, NextResponse } from "next/server";
import { searchTools } from "@/server/db";
import { dbToolsToFrontend } from "@/lib/adapters";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  if (q.trim().length < 1) {
    return NextResponse.json([]);
  }

  try {
    const results = await searchTools(q.trim(), 5);
    return NextResponse.json(dbToolsToFrontend(results));
  } catch (error) {
    console.error("[search API]", error);
    return NextResponse.json([]);
  }
}
