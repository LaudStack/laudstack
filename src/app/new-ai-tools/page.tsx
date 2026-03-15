import type { Metadata } from "next";
import { getDiscoverySEOData } from "@/app/actions/seo";
import { discoveryMetadata } from "@/lib/seo-metadata";
import { dbToolToFrontend } from "@/lib/adapters";
import type { Tool as DbTool } from "@/drizzle/schema";
import DiscoveryClient from "../trending-ai-tools/client";


export const metadata: Metadata = discoveryMetadata(
  "New AI Tools",
  "The latest AI and SaaS tools launched on LaudStack. Be the first to discover and review them.",
  "/new-ai-tools"
);

export default async function NewAIToolsPage() {
  const data = await getDiscoverySEOData("new");
  const tools = data.tools.map((t) => dbToolToFrontend(t as unknown as DbTool));

  return (
    <DiscoveryClient
      type="new"
      title="New AI Tools"
      description="The latest AI and SaaS tools launched on LaudStack. Be the first to discover and review them."
      initialTools={tools}
      totalCount={data.total}
    />
  );
}
