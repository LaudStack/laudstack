/**
 * SEOJsonLd — LaudStack
 * Renders JSON-LD structured data for SEO comparison/best pages.
 * Supports ItemList schema for category pages.
 */

import type { Tool } from "@/lib/types";

interface Props {
  title: string;
  description: string;
  url: string;
  tools: Tool[];
}

export default function SEOJsonLd({ title, description, url, tools }: Props) {
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    description: description,
    url: `https://laudstack.com${url}`,
    numberOfItems: tools.length,
    itemListElement: tools.slice(0, 20).map((tool, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "SoftwareApplication",
        name: tool.name,
        description: tool.tagline || tool.description?.slice(0, 160),
        url: `https://laudstack.com/tools/${tool.slug}`,
        applicationCategory: tool.category,
        ...(tool.logo_url ? { image: tool.logo_url } : {}),
        aggregateRating:
          tool.review_count > 0
            ? {
                "@type": "AggregateRating",
                ratingValue: tool.average_rating.toFixed(1),
                reviewCount: tool.review_count,
                bestRating: 5,
                worstRating: 1,
              }
            : undefined,
        offers: {
          "@type": "Offer",
          price: tool.pricing_model === "Free" || tool.pricing_model === "Open Source" ? "0" : undefined,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
    />
  );
}
