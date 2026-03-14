"use client";

import SEOPageClient from "@/components/SEOPageClient";
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
    <SEOPageClient
      eyebrow="Curated Collection"
      title={title}
      subtitle={description}
      initialTools={initialTools}
      totalCount={totalCount}
      fetchAction={async (sort, page) => fetchBestTools(slug, sort, page)}
      breadcrumbs={[
        { label: "Best Tools", href: "/best" },
        { label: title },
      ]}
      introText={`${description} Browse our curated collection of tools ranked by community reviews, verified ratings, and Laud votes. Updated automatically as new tools are added.`}
      relatedLinks={relatedLinks}
      relatedLinksTitle="Related Collections"
    />
  );
}
