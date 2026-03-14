import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getComparisonData } from "@/app/actions/seo";
import { comparisonMetadata } from "@/lib/seo-metadata";
import { dbToolToFrontend } from "@/lib/adapters";
import type { Tool as DbTool } from "@/drizzle/schema";
import ComparisonClient from "./client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slugA: string; slugB: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slugA, slugB } = await params;
  const data = await getComparisonData(slugA, slugB);
  if (!data) return { title: "Comparison Not Found" };
  return comparisonMetadata(
    data.toolA.name,
    data.toolB.name,
    `/${slugA}-vs-${slugB}`
  );
}

export default async function ComparisonPage({ params }: PageProps) {
  const { slugA, slugB } = await params;
  const data = await getComparisonData(slugA, slugB);
  if (!data) notFound();

  const toolA = dbToolToFrontend(data.toolA as unknown as DbTool);
  const toolB = dbToolToFrontend(data.toolB as unknown as DbTool);

  return <ComparisonClient toolA={toolA} toolB={toolB} />;
}
