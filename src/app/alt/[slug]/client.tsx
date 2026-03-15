"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Star,
  Shield,
  ChevronUp,
  ExternalLink,
  ArrowRight,
  GitCompareArrows,
} from "lucide-react";
import Navbar from "@/components/Navbar";
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
        border: "1px solid #E8ECF0",
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
            border: "1px solid #E8ECF0",
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
                color: "#171717",
                margin: 0,
              }}
            >
              {tool.name}
            </h2>
            {tool.is_verified && (
              <Shield
                style={{ width: "16px", height: "16px", color: "#22C55E" }}
              />
            )}
          </div>
          <p
            style={{
              fontSize: "14px",
              color: "#6B7280",
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
                style={{ fontSize: "13px", fontWeight: 700, color: "#171717" }}
              >
                {tool.average_rating > 0
                  ? tool.average_rating.toFixed(1)
                  : "N/A"}
              </span>
              {tool.review_count > 0 && (
                <span
                  style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 500 }}
                >
                  ({tool.review_count} reviews)
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <ChevronUp
                style={{ width: "14px", height: "14px", color: "#6B7280" }}
              />
              <span
                style={{ fontSize: "13px", fontWeight: 700, color: "#171717" }}
              >
                {tool.upvote_count} Lauds
              </span>
            </div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color:
                  tool.pricing_model === "Free" ? "#15803D" : "#475569",
                background:
                  tool.pricing_model === "Free" ? "#F0FDF4" : "#F8FAFC",
                padding: "3px 10px",
                borderRadius: "6px",
                border: `1px solid ${tool.pricing_model === "Free" ? "#BBF7D0" : "#E8ECF0"}`,
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
        className="max-w-[1280px] mx-auto w-full px-3 sm:px-6 lg:px-10"
        style={{ paddingBottom: "24px" }}
      >
        <h3
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#9CA3AF",
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
