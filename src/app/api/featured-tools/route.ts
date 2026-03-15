import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { tools } from "@/drizzle/schema";
import { eq, and, sql, inArray } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * GET /api/featured-tools
 * Returns featured/recommended products for monetization.
 * Rotates results using random ordering so different tools show on each load.
 */
export async function GET() {
  try {
    const featured = await db
      .select()
      .from(tools)
      .where(and(inArray(tools.status, ["approved", "featured"]), eq(tools.isVisible, true), eq(tools.isFeatured, true)))
      .orderBy(sql`RANDOM()`)
      .limit(6);

    // If not enough featured products, fill with top-rated tools
    if (featured.length < 4) {
      const topRated = await db
        .select()
        .from(tools)
      .where(and(inArray(tools.status, ["approved", "featured"]), eq(tools.isVisible, true)))
      .orderBy(sql`${tools.averageRating} DESC, RANDOM()`)
        .limit(6);

      const existingIds = new Set(featured.map((t) => t.id));
      for (const t of topRated) {
        if (!existingIds.has(t.id) && featured.length < 6) {
          featured.push(t);
          existingIds.add(t.id);
        }
      }
    }

    // Normalize to snake_case for frontend consistency
    const normalized = featured.map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      tagline: t.tagline,
      logo_url: t.logoUrl,
      category: t.category,
      average_rating: t.averageRating,
      review_count: t.reviewCount,
      pricing_model: t.pricingModel,
      website_url: t.websiteUrl,
      is_featured: t.isFeatured,
      badges: t.badges,
    }));

    return NextResponse.json({ tools: normalized });
  } catch (error) {
    console.error("Featured tools error:", error);
    return NextResponse.json({ tools: [] });
  }
}
