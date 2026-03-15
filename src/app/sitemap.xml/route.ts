import { NextResponse } from "next/server";
import {
  getAllCategoriesWithCounts,
  getAllBestToolsSlugs,
  getAllAlternativeSlugs,
  getPopularComparisonPairs,
} from "@/app/actions/seo";
import { db } from "@/server/db";
import { tools } from "@/drizzle/schema";
import { eq, inArray } from "drizzle-orm";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://laudstack.com";

function url(path: string, priority: string = "0.7", changefreq: string = "weekly"): string {
  return `  <url>
    <loc>${SITE_URL}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export async function GET() {
  const urls: string[] = [];

  // Static pages
  const staticPages = [
    { path: "/", priority: "1.0", freq: "daily" },
    { path: "/categories", priority: "0.8", freq: "weekly" },
    { path: "/best", priority: "0.8", freq: "weekly" },
    { path: "/alternatives", priority: "0.8", freq: "weekly" },
    { path: "/comparisons", priority: "0.8", freq: "weekly" },
    { path: "/trending-ai-tools", priority: "0.8", freq: "daily" },
    { path: "/top-rated-ai-tools", priority: "0.8", freq: "daily" },
    { path: "/new-ai-tools", priority: "0.8", freq: "daily" },
    { path: "/most-popular-saas-tools", priority: "0.8", freq: "daily" },
    { path: "/trending", priority: "0.7", freq: "daily" },
    { path: "/top-rated", priority: "0.7", freq: "daily" },
    { path: "/launches", priority: "0.7", freq: "daily" },
    { path: "/deals", priority: "0.7", freq: "weekly" },
    { path: "/launchpad", priority: "0.6", freq: "monthly" },
    { path: "/about", priority: "0.5", freq: "monthly" },
  ];

  for (const p of staticPages) {
    urls.push(url(p.path, p.priority, p.freq));
  }

  // Category SEO pages
  try {
    const categories = await getAllCategoriesWithCounts();
    for (const cat of categories) {
      urls.push(url(`/c/${cat.slug}`, "0.8", "weekly"));
    }
  } catch {
    // Skip if DB unavailable
  }

  // Best tools pages
  try {
    const bestSlugs = await getAllBestToolsSlugs();
    for (const slug of bestSlugs) {
      urls.push(url(`/best/${slug}`, "0.8", "weekly"));
    }
  } catch {
    // Skip if DB unavailable
  }

  // Tool detail pages
  try {
    const allTools = await db
      .select({ slug: tools.slug })
      .from(tools)
      .where(inArray(tools.status, ["approved", "featured"]));

    for (const t of allTools) {
      urls.push(url(`/tools/${t.slug}`, "0.7", "weekly"));
    }
  } catch {
    // Skip if DB unavailable
  }

  // Alternatives pages
  try {
    const altSlugs = await getAllAlternativeSlugs();
    for (const slug of altSlugs) {
      urls.push(url(`/${slug}-alternatives`, "0.7", "weekly"));
    }
  } catch {
    // Skip if DB unavailable
  }

  // Comparison pages
  try {
    const pairs = await getPopularComparisonPairs();
    for (const pair of pairs) {
      urls.push(url(`/${pair.slugA}-vs-${pair.slugB}`, "0.6", "weekly"));
    }
  } catch {
    // Skip if DB unavailable
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
