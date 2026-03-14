import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCategorySEOData,
  getAllCategoriesWithCounts,
  categoryToSlug,
} from "@/app/actions/seo";
import { categorySEOMetadata } from "@/lib/seo-metadata";
import { dbToolToFrontend } from "@/lib/adapters";
import type { Tool as DbTool } from "@/drizzle/schema";
import CategorySEOClient from "./client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategorySEOData(slug);
  if (!data) return { title: "Category Not Found" };
  return categorySEOMetadata(data.name, data.total, `/c/${slug}`);
}

export default async function CategorySEOPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getCategorySEOData(slug);
  if (!data) notFound();

  const allCategories = await getAllCategoriesWithCounts();
  const frontendTools = data.tools.map((t) =>
    dbToolToFrontend(t as unknown as DbTool)
  );

  // Build related category links
  const relatedLinks = allCategories
    .filter((c) => c.slug !== slug)
    .slice(0, 9)
    .map((c) => ({
      label: `${c.icon} ${c.name} Tools`,
      href: `/c/${c.slug}`,
      description: `${c.count} tools`,
    }));

  // Build alternative page links for top tools in this category
  const altLinks = frontendTools.slice(0, 6).map((t) => ({
    label: `${t.name} Alternatives`,
    href: `/${t.slug}-alternatives`,
  }));

  return (
    <CategorySEOClient
      categoryName={data.name}
      categoryIcon={data.icon}
      categoryDescription={data.description}
      categorySlug={slug}
      initialTools={frontendTools}
      totalCount={data.total}
      relatedCategoryLinks={relatedLinks}
      alternativeLinks={altLinks}
    />
  );
}
