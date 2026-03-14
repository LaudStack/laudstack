"use client";

import SEOPageClient from "@/components/SEOPageClient";
import { fetchCategoryTools } from "@/app/actions/seo-fetchers";
import type { Tool } from "@/lib/types";

interface Props {
  categoryName: string;
  categoryIcon: string;
  categoryDescription: string;
  categorySlug: string;
  initialTools: Tool[];
  totalCount: number;
  relatedCategoryLinks: { label: string; href: string; description?: string }[];
  alternativeLinks: { label: string; href: string }[];
}

export default function CategorySEOClient({
  categoryName,
  categoryIcon,
  categoryDescription,
  categorySlug,
  initialTools,
  totalCount,
  relatedCategoryLinks,
  alternativeLinks,
}: Props) {
  const allRelatedLinks = [
    ...relatedCategoryLinks,
    ...alternativeLinks.map((l) => ({ ...l, description: undefined })),
  ];

  return (
    <SEOPageClient
      eyebrow={`${categoryIcon} ${categoryName}`}
      title={`Best ${categoryName} Tools`}
      subtitle={categoryDescription}
      initialTools={initialTools}
      totalCount={totalCount}
      fetchAction={async (sort, page) => fetchCategoryTools(categorySlug, sort, page)}
      breadcrumbs={[
        { label: "Categories", href: "/categories" },
        { label: `${categoryName} Tools` },
      ]}
      introText={`Explore the best ${categoryName.toLowerCase()} tools on LaudStack, ranked by community reviews, ratings, and Laud votes. All tools are verified and reviewed by real users.`}
      relatedLinks={allRelatedLinks}
      relatedLinksTitle="Explore More Categories"
    />
  );
}
