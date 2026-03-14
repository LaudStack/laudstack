import type { Metadata } from "next";
import { getDiscoverySEOData } from "@/app/actions/seo";
import { discoveryMetadata } from "@/lib/seo-metadata";
import { dbToolToFrontend } from "@/lib/adapters";
import type { Tool as DbTool } from "@/drizzle/schema";
import DiscoveryClient from "../trending-ai-tools/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = discoveryMetadata(
  "Top Rated AI Tools",
  "The highest-rated AI and SaaS tools on LaudStack, ranked by verified community reviews.",
  "/top-rated-ai-tools"
);

export default async function TopRatedAIToolsPage() {
  const data = await getDiscoverySEOData("top-rated");
  const tools = data.tools.map((t) => dbToolToFrontend(t as unknown as DbTool));

  return (
    <DiscoveryClient
      type="top-rated"
      title="Top Rated AI Tools"
      description="The highest-rated AI and SaaS tools on LaudStack, ranked by verified community reviews."
      initialTools={tools}
      totalCount={data.total}
    />
  );
}
