"use client";

import SEOPageClient from "@/components/SEOPageClient";
import { fetchDiscoveryTools } from "@/app/actions/seo-fetchers";
import type { Tool } from "@/lib/types";

interface Props {
  type: "trending" | "top-rated" | "new" | "popular";
  title: string;
  description: string;
  initialTools: Tool[];
  totalCount: number;
}

const DISCOVERY_LINKS = [
  { label: "Trending AI Tools", href: "/trending-ai-tools" },
  { label: "Top Rated AI Tools", href: "/top-rated-ai-tools" },
  { label: "New AI Tools", href: "/new-ai-tools" },
  { label: "Most Popular SaaS Tools", href: "/most-popular-saas-tools" },
];

export default function DiscoveryClient({
  type,
  title,
  description,
  initialTools,
  totalCount,
}: Props) {
  const relatedLinks = DISCOVERY_LINKS.filter(
    (l) => l.label !== title
  ).map((l) => ({ ...l, description: undefined as string | undefined }));

  return (
    <SEOPageClient
      eyebrow="Discovery"
      title={title}
      subtitle={description}
      initialTools={initialTools}
      totalCount={totalCount}
      fetchAction={async (_sort, page) => fetchDiscoveryTools(type, _sort, page)}
      breadcrumbs={[{ label: title }]}
      introText={description}
      relatedLinks={relatedLinks}
      relatedLinksTitle="Explore More"
    />
  );
}
