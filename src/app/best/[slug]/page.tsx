import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBestToolsData, getAllBestToolsSlugs } from "@/app/actions/seo";
import { bestToolsMetadata } from "@/lib/seo-metadata";
import { dbToolToFrontend } from "@/lib/adapters";
import type { Tool as DbTool } from "@/drizzle/schema";
import BestToolsClient from "./client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBestToolsData(slug);
  if (!data) return { title: "Page Not Found" };
  return bestToolsMetadata(data.title, data.description, `/best/${slug}`);
}

export default async function BestToolsPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getBestToolsData(slug);
  if (!data) notFound();

  const frontendTools = data.tools.map((t) =>
    dbToolToFrontend(t as unknown as DbTool)
  );

  // Build related "best tools" links
  const relatedLinks = data.relatedPages.map((p) => ({
    label: p.title,
    href: p.href,
  }));

  // Build alternative links for top tools
  const altLinks = frontendTools.slice(0, 4).map((t) => ({
    label: `${t.name} Alternatives`,
    href: `/${t.slug}-alternatives`,
  }));

  return (
    <BestToolsClient
      title={data.title}
      description={data.description}
      slug={slug}
      initialTools={frontendTools}
      totalCount={data.total}
      relatedLinks={[...relatedLinks, ...altLinks]}
    />
  );
}
