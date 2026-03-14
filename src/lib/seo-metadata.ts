/**
 * SEO Metadata Helpers for Programmatic Pages
 *
 * Generates consistent, optimized metadata for all dynamic SEO pages.
 * Used by Next.js generateMetadata() in each route.
 */
import type { Metadata } from "next";

const SITE_NAME = "LaudStack";
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://laudstack.com";
const CURRENT_YEAR = new Date().getFullYear();

interface MetadataInput {
  title: string;
  description: string;
  path: string;
  /** Additional keywords beyond the default set */
  keywords?: string[];
  /** noindex for thin pages */
  noindex?: boolean;
}

export function buildSEOMetadata(input: MetadataInput): Metadata {
  const fullTitle = `${input.title} (${CURRENT_YEAR})`;
  const canonicalUrl = `${SITE_URL}${input.path}`;

  return {
    title: fullTitle,
    description: input.description,
    keywords: [
      "AI tools",
      "SaaS tools",
      "software reviews",
      "tool comparison",
      ...(input.keywords ?? []),
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonicalUrl,
      siteName: SITE_NAME,
      title: fullTitle,
      description: input.description,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: input.description,
    },
    robots: input.noindex
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

/** Generate category page metadata */
export function categorySEOMetadata(categoryName: string, toolCount: number, path: string): Metadata {
  return buildSEOMetadata({
    title: `Best ${categoryName} Tools`,
    description: `Discover the ${toolCount} best ${categoryName.toLowerCase()} tools ranked by community reviews, ratings, and Laud votes on LaudStack.`,
    path,
    keywords: [categoryName.toLowerCase(), `${categoryName.toLowerCase()} tools`, `best ${categoryName.toLowerCase()} software`],
  });
}

/** Generate "best tools" page metadata */
export function bestToolsMetadata(title: string, description: string, path: string): Metadata {
  return buildSEOMetadata({
    title,
    description,
    path,
    keywords: [title.toLowerCase().replace("best ", "")],
  });
}

/** Generate alternatives page metadata */
export function alternativesMetadata(toolName: string, alternativeCount: number, path: string): Metadata {
  return buildSEOMetadata({
    title: `Best ${toolName} Alternatives`,
    description: `Discover the ${alternativeCount} best alternatives to ${toolName} ranked by community reviews, ratings, and Laud votes on LaudStack.`,
    path,
    keywords: [`${toolName.toLowerCase()} alternatives`, `tools like ${toolName.toLowerCase()}`, `${toolName.toLowerCase()} competitors`],
  });
}

/** Generate comparison page metadata */
export function comparisonMetadata(nameA: string, nameB: string, path: string): Metadata {
  return buildSEOMetadata({
    title: `${nameA} vs ${nameB}`,
    description: `Compare ${nameA} and ${nameB} side by side. See features, pricing, ratings, and community reviews to find the best tool for your needs.`,
    path,
    keywords: [`${nameA.toLowerCase()} vs ${nameB.toLowerCase()}`, `${nameA.toLowerCase()} alternative`, `${nameB.toLowerCase()} alternative`],
  });
}

/** Generate discovery page metadata */
export function discoveryMetadata(title: string, description: string, path: string): Metadata {
  return buildSEOMetadata({
    title,
    description,
    path,
    keywords: [title.toLowerCase()],
  });
}
