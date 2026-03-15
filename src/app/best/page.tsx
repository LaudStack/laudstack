import type { Metadata } from "next";
import { buildSEOMetadata } from "@/lib/seo-metadata";
import { getAllBestToolsSlugs, getBestToolsData } from "@/app/actions/seo";
import BestToolsIndexClient from "./index-client";


export const metadata: Metadata = buildSEOMetadata({
  title: "Best AI & SaaS Tools Collections",
  description:
    "Browse curated collections of the best AI and SaaS tools for marketing, writing, coding, design, and more. Ranked by community reviews and Laud votes.",
  path: "/best",
  keywords: ["best AI tools", "best SaaS tools", "tool collections"],
});

export default async function BestToolsIndexPage() {
  const slugs = await getAllBestToolsSlugs();
  const collections: { slug: string; title: string; description: string; count: number }[] = [];

  for (const slug of slugs) {
    const data = await getBestToolsData(slug, { limit: 1 });
    if (data) {
      collections.push({
        slug,
        title: data.title,
        description: data.description,
        count: data.total,
      });
    }
  }

  return <BestToolsIndexClient collections={collections} />;
}
