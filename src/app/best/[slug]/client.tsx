"use client";

import SEOPageClient from "@/components/SEOPageClient";
import ComparisonTable from "@/components/ComparisonTable";
import SEOJsonLd from "@/components/SEOJsonLd";
import { fetchBestTools } from "@/app/actions/seo-fetchers";
import type { Tool } from "@/lib/types";

interface Props {
  title: string;
  description: string;
  slug: string;
  initialTools: Tool[];
  totalCount: number;
  relatedLinks: { label: string; href: string; description?: string }[];
}

export default function BestToolsClient({
  title,
  description,
  slug,
  initialTools,
  totalCount,
  relatedLinks,
}: Props) {
  return (
    <>
      <SEOJsonLd
        title={title}
        description={description}
        url={`/best/${slug}`}
        tools={initialTools}
      />
      <SEOPageClient
        eyebrow="Curated Collection"
        title={title}
        subtitle={description}
        initialTools={initialTools}
        totalCount={totalCount}
        fetchAction={async (sort, page) => fetchBestTools(slug, sort, page)}
        breadcrumbs={[
          { label: "Best Stacks", href: "/best" },
          { label: title },
        ]}
        introText={`${description} Browse our curated collection of stacks ranked by community reviews, verified ratings, and Laud votes. Updated automatically as new stacks are added.`}
        relatedLinks={relatedLinks}
        relatedLinksTitle="Related Collections"
      >
        {/* Comparison table for top tools in this category */}
        {initialTools.length >= 3 && (
          <ComparisonTable tools={initialTools} maxRows={10} />
        )}
      </SEOPageClient>
    </>
  );
}
