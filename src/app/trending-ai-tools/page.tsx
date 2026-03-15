import type { Metadata } from "next";
import { getDiscoverySEOData } from "@/app/actions/seo";
import { discoveryMetadata } from "@/lib/seo-metadata";
import { dbToolToFrontend } from "@/lib/adapters";
import type { Tool as DbTool } from "@/drizzle/schema";
import DiscoveryClient from "./client";


export const metadata: Metadata = discoveryMetadata(
  "Trending AI Tools",
  "Discover the hottest AI tools gaining momentum this week, ranked by community activity and Laud votes.",
  "/trending-ai-tools"
);

export default async function TrendingAIToolsPage() {
  const data = await getDiscoverySEOData("trending");
  const tools = data.tools.map((t) => dbToolToFrontend(t as unknown as DbTool));

  return (
    <DiscoveryClient
      type="trending"
      title="Trending AI Tools"
      description="Discover the hottest AI tools gaining momentum this week, ranked by community activity and Laud votes."
      initialTools={tools}
      totalCount={data.total}
    />
  );
}
