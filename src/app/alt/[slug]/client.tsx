"use client";

import { useTransition } from "react";
import Link from "next/link";
import {
  Star,
  Shield,
  ExternalLink,
  ArrowRight,
  GitCompareArrows,
} from "lucide-react";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import LogoWithFallback from '@/components/LogoWithFallback';
import SEOPageClient from "@/components/SEOPageClient";
import { fetchAlternatives } from "@/app/actions/seo-fetchers";
import type { Tool } from "@/lib/types";

interface Props {
  mainTool: Tool;
  initialAlternatives: Tool[];
  totalCount: number;
  comparisonLinks: { label: string; href: string }[];
  altOfAltLinks: { label: string; href: string }[];
}

function ToolOverviewCard({ tool }: { tool: Tool }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: "16px",
        border: "1px solid #E2E8F0",
        padding: "24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "16px",
            flexShrink: 0,
            border: "1px solid #E2E8F0",
            background: "#F8FAFC",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LogoWithFallback src={tool.logo_url} alt={tool.name} className="w-12 h-12 object-contain" fallbackSize="text-2xl" />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "4px",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "#0C1830",
                margin: 0,
              }}
            >
              {tool.name}
            </h2>
            {tool.is_verified && (
              <Shield
                style={{ width: "16px", height: "16px", color: "#16A34A" }}
              />
            )}
          </div>
          <p
            style={{
              fontSize: "14px",
              color: "#64748B",
              lineHeight: 1.5,
              margin: "4px 0 12px",
            }}
          >
            {tool.tagline}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Star
                style={{
                  width: "14px",
                  height: "14px",
                  fill: "#F59E0B",
                  color: "#F59E0B",
                }}
              />
              <span
                style={{ fontSize: "13px", fontWeight: 700, color: "#0C1830" }}
              >
                {tool.average_rating > 0
                  ? tool.average_rating.toFixed(1)
                  : "N/A"}
              </span>
              {tool.review_count > 0 && (
                <span
                  style={{ fontSize: "12px", color: "#94A3B8", fontWeight: 500 }}
                >
                  ({tool.review_count} reviews)
                </span>
              )}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: 6,
                border: '1.5px solid #E2E8F0',
                background: '#F8FAFC',
                color: '#64748B',
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
                <path fill="#FFFFFF" stroke="currentColor" strokeWidth="1.5" d="M6.579 3.467c.71-1.067 2.132-1.067 2.842 0L12.975 8.8c.878 1.318.043 3.2-1.422 3.2H4.447c-1.464 0-2.3-1.882-1.422-3.2z" />
              </svg>
              {tool.upvote_count}
            </div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color:
                  tool.pricing_model === "Free" ? "#16A34A" : "#475569",
                background:
                  tool.pricing_model === "Free" ? "#F0FDF4" : "#F8FAFC",
                padding: "3px 10px",
                borderRadius: "6px",
                border: `1px solid ${tool.pricing_model === "Free" ? "#DCFCE7" : "#E2E8F0"}`,
              }}
            >
              {tool.pricing_model}
            </span>
            <Link
              href={`/tools/${tool.slug}`}
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#D97706",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              View full profile
              <ArrowRight style={{ width: "13px", height: "13px" }} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AlternativesClient({
  mainTool,
  initialAlternatives,
  totalCount,
  comparisonLinks,
  altOfAltLinks,
}: Props) {
  const allRelatedLinks = [
    ...comparisonLinks.map((l) => ({
      ...l,
      description: undefined as string | undefined,
    })),
    ...altOfAltLinks.map((l) => ({
      ...l,
      description: undefined as string | undefined,
    })),
  ];

  return (
    <SEOPageClient
      eyebrow="Alternatives"
      title={`Best ${mainTool.name} Alternatives`}
      subtitle={`Discover the best alternatives to ${mainTool.name} ranked by community reviews, ratings, and Laud votes.`}
      initialTools={initialAlternatives}
      totalCount={totalCount}
      fetchAction={async (sort, page) =>
        fetchAlternatives(mainTool.slug, sort, page)
      }
      breadcrumbs={[
        { label: "Alternatives", href: "/alternatives" },
        { label: `${mainTool.name} Alternatives` },
      ]}
      relatedLinks={allRelatedLinks}
      relatedLinksTitle="Compare & Explore"
    >
      {/* Tool overview card above the grid */}
      <div
        className="max-w-[1400px] mx-auto w-full px-3 sm:px-6 lg:px-8"
        style={{ paddingBottom: "24px" }}
      >
        <h3
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#94A3B8",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: "12px",
          }}
        >
          Looking for alternatives to
        </h3>
        <ToolOverviewCard tool={mainTool} />
      </div>
    </SEOPageClient>
  );
}
