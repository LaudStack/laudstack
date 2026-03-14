import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { tools, toolSubmissions, users } from "@/drizzle/schema";
import { eq, and, gt, desc, sql } from "drizzle-orm";

/**
 * GET /api/launches/upcoming
 * Returns upcoming launches — tools with a future launched_at date,
 * plus approved submissions with a future launch_date.
 */
export async function GET() {
  try {
    const now = new Date();

    // 1. Approved tools that haven't launched yet (launched_at in the future)
    const upcomingTools = await db
      .select()
      .from(tools)
      .where(
        and(
          eq(tools.status, "approved"),
          gt(tools.launchedAt, now)
        )
      )
      .orderBy(tools.launchedAt)
      .limit(8);

    // 2. Approved submissions with a future launch date (not yet converted to tools)
    const upcomingSubmissions = await db
      .select({
        id: toolSubmissions.id,
        name: toolSubmissions.name,
        tagline: toolSubmissions.tagline,
        logoUrl: toolSubmissions.logoUrl,
        category: toolSubmissions.category,
        pricingModel: toolSubmissions.pricingModel,
        launchDate: toolSubmissions.launchDate,
        founderName: toolSubmissions.founderName,
        website: toolSubmissions.website,
        userId: toolSubmissions.userId,
      })
      .from(toolSubmissions)
      .where(
        and(
          eq(toolSubmissions.status, "approved"),
          gt(toolSubmissions.launchDate, now)
        )
      )
      .orderBy(toolSubmissions.launchDate)
      .limit(8);

    // Combine and format
    const upcoming = [
      ...upcomingTools.map((t) => ({
        id: `tool-${t.id}`,
        name: t.name,
        tagline: t.tagline,
        logo: t.logoUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=F59E0B&color=fff&size=64`,
        category: t.category,
        pricing: t.pricingModel,
        launchDate: t.launchedAt.toISOString(),
        slug: t.slug,
        source: "tool" as const,
      })),
      ...upcomingSubmissions.map((s) => ({
        id: `sub-${s.id}`,
        name: s.name,
        tagline: s.tagline,
        logo: s.logoUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=F59E0B&color=fff&size=64`,
        category: s.category ?? "Uncategorized",
        pricing: s.pricingModel ?? "Free",
        launchDate: s.launchDate?.toISOString() ?? new Date().toISOString(),
        slug: null,
        source: "submission" as const,
      })),
    ]
      .sort((a, b) => new Date(a.launchDate).getTime() - new Date(b.launchDate).getTime())
      .slice(0, 8);

    return NextResponse.json({ upcoming });
  } catch (error) {
    console.error("[upcoming launches API] Error:", error);
    return NextResponse.json({ upcoming: [] });
  }
}
