import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAlternativesData } from "@/app/actions/seo";
import { alternativesMetadata } from "@/lib/seo-metadata";
import { dbToolToFrontend } from "@/lib/adapters";
import type { Tool as DbTool } from "@/drizzle/schema";
import AlternativesClient from "./client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getAlternativesData(slug);
  if (!data) return { title: "Alternatives Not Found" };
  return alternativesMetadata(
    data.tool.name,
    data.total,
    `/${slug}-alternatives`
  );
}

export default async function AlternativesPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getAlternativesData(slug);
  if (!data) notFound();

  const mainTool = dbToolToFrontend(data.tool as unknown as DbTool);
  const alternatives = data.alternatives.map((t) =>
    dbToolToFrontend(t as unknown as DbTool)
  );

  // Build comparison links: main tool vs each alternative
  const comparisonLinks = alternatives.slice(0, 6).map((alt) => ({
    label: `${mainTool.name} vs ${alt.name}`,
    href: `/${mainTool.slug}-vs-${alt.slug}`,
  }));

  // Build alternative-of-alternative links
  const altOfAltLinks = alternatives.slice(0, 4).map((alt) => ({
    label: `${alt.name} Alternatives`,
    href: `/${alt.slug}-alternatives`,
  }));

  return (
    <AlternativesClient
      mainTool={mainTool}
      initialAlternatives={alternatives}
      totalCount={data.total}
      comparisonLinks={comparisonLinks}
      altOfAltLinks={altOfAltLinks}
    />
  );
}
