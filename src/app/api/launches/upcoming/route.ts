import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { tools, toolSubmissions } from "@/drizzle/schema";
import { eq, and, gt, or, desc, sql } from "drizzle-orm";

/**
 * GET /api/launches/upcoming
 * Returns upcoming launches:
 *  1. Tools with a future scheduled_launch_at (admin-set upcoming date)
 *  2. Approved tools with a future launched_at
 *  3. Approved submissions with a future launch_date
 *
 * Also returns recently launched tools as fallback so the page is never empty.
 */
export async function GET() {
  try {
    const now = new Date();

    // 1. Tools with future scheduled_launch_at OR approved tools with future launched_at
    const upcomingTools = await db
      .select()
      .from(tools)
      .where(
        or(
          gt(tools.scheduledLaunchAt, now),
          and(
            eq(tools.status, "approved"),
            gt(tools.launchedAt, now)
          )
        )
      )
      .orderBy(sql`COALESCE(${tools.scheduledLaunchAt}, ${tools.launchedAt}) ASC`)
      .limit(12);

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

    // 3. Most recently launched tools as fallback (ensures page is never empty)
    const recentlyLaunched = await db
      .select()
      .from(tools)
      .where(
        and(
          eq(tools.status, "approved"),
          eq(tools.isVisible, true)
        )
      )
      .orderBy(desc(tools.launchedAt))
      .limit(12);

    // Format upcoming
    const upcoming = [
      ...upcomingTools.map((t) => ({
        id: `tool-${t.id}`,
        name: t.name,
        tagline: t.tagline,
        description: t.shortDescription ?? t.tagline,
        logo: t.logoUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=F59E0B&color=fff&size=64`,
        category: t.category,
        pricing: t.pricingModel,
        launchDate: (t.scheduledLaunchAt ?? t.launchedAt).toISOString(),
        slug: t.slug,
        isVerified: t.isVerified,
        isFeatured: t.isFeatured,
        averageRating: t.averageRating,
        reviewCount: t.reviewCount,
        upvoteCount: t.upvoteCount,
        tags: t.tags ?? [],
        source: "tool" as const,
      })),
      ...upcomingSubmissions.map((s) => ({
        id: `sub-${s.id}`,
        name: s.name,
        tagline: s.tagline,
        description: s.tagline,
        logo: s.logoUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=F59E0B&color=fff&size=64`,
        category: s.category ?? "Uncategorized",
        pricing: s.pricingModel ?? "Free",
        launchDate: s.launchDate?.toISOString() ?? new Date().toISOString(),
        slug: null,
        isVerified: false,
        isFeatured: false,
        averageRating: 0,
        reviewCount: 0,
        upvoteCount: 0,
        tags: [],
        source: "submission" as const,
      })),
    ]
      .sort((a, b) => new Date(a.launchDate).getTime() - new Date(b.launchDate).getTime())
      .slice(0, 12);

    // Format recently launched
    const recent = recentlyLaunched.map((t) => ({
      id: `tool-${t.id}`,
      name: t.name,
      tagline: t.tagline,
      description: t.shortDescription ?? t.tagline,
      logo: t.logoUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=F59E0B&color=fff&size=64`,
      category: t.category,
      pricing: t.pricingModel,
      launchDate: t.launchedAt.toISOString(),
      slug: t.slug,
      isVerified: t.isVerified,
      isFeatured: t.isFeatured,
      averageRating: t.averageRating,
      reviewCount: t.reviewCount,
      upvoteCount: t.upvoteCount,
      tags: t.tags ?? [],
      source: "tool" as const,
    }));

    return NextResponse.json({ upcoming, recent });
  } catch (error) {
    console.error("[upcoming launches API] Error:", error);
    return NextResponse.json({ upcoming: [], recent: [] });
  }
}
