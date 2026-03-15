import type { Metadata } from "next";
import { getDiscoverySEOData } from "@/app/actions/seo";
import { discoveryMetadata } from "@/lib/seo-metadata";
import { dbToolToFrontend } from "@/lib/adapters";
import type { Tool as DbTool } from "@/drizzle/schema";
import DiscoveryClient from "../trending-ai-tools/client";


export const metadata: Metadata = discoveryMetadata(
  "Most Popular SaaS Tools",
  "The most popular SaaS and AI tools on LaudStack, ranked by community Laud votes.",
  "/most-popular-saas-tools"
);

export default async function MostPopularSaaSToolsPage() {
  const data = await getDiscoverySEOData("popular");
  const tools = data.tools.map((t) => dbToolToFrontend(t as unknown as DbTool));

  return (
    <DiscoveryClient
      type="popular"
      title="Most Popular SaaS Tools"
      description="The most popular SaaS and AI tools on LaudStack, ranked by community Laud votes."
      initialTools={tools}
      totalCount={data.total}
    />
  );
}
