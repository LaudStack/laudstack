"use client";

import Link from "next/link";
import {
  Star,
  Shield,
  ChevronUp,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Minus,
  GitCompareArrows,
  ChevronRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import LogoWithFallback from '@/components/LogoWithFallback';
import type { Tool } from "@/lib/types";

interface Props {
  toolA: Tool;
  toolB: Tool;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StarRow({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{
            width: "14px",
            height: "14px",
            fill: i <= Math.round(rating) ? "#F59E0B" : "transparent",
            color: i <= Math.round(rating) ? "#F59E0B" : "#CBD5E1",
          }}
        />
      ))}
    </div>
  );
}

function WinnerBadge({ label }: { label: string }) {
  return (
    <span
      style={{
        fontSize: "10px",
        fontWeight: 800,
        color: "#15803D",
        background: "#F0FDF4",
        border: "1px solid #BBF7D0",
        padding: "2px 8px",
        borderRadius: "6px",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {label}
    </span>
  );
}

// ─── Comparison Row ───────────────────────────────────────────────────────────

function ComparisonRow({
  label,
  valueA,
  valueB,
  highlight,
}: {
  label: string;
  valueA: React.ReactNode;
  valueB: React.ReactNode;
  highlight?: "a" | "b" | null;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "0",
        borderBottom: "1px solid #F1F5F9",
      }}
    >
      <div
        style={{
          padding: "14px 16px",
          fontSize: "13px",
          fontWeight: 700,
          color: "#374151",
          display: "flex",
          alignItems: "center",
        }}
      >
        {label}
      </div>
      <div
        style={{
          padding: "14px 16px",
          fontSize: "13px",
          color: "#171717",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: highlight === "a" ? "#FEFCE8" : "transparent",
        }}
      >
        {valueA}
        {highlight === "a" && <WinnerBadge label="Winner" />}
      </div>
      <div
        style={{
          padding: "14px 16px",
          fontSize: "13px",
          color: "#171717",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: highlight === "b" ? "#FEFCE8" : "transparent",
        }}
      >
        {valueB}
        {highlight === "b" && <WinnerBadge label="Winner" />}
      </div>
    </div>
  );
}

// ─── Tool Header Card ─────────────────────────────────────────────────────────

function ToolHeaderCard({ tool }: { tool: Tool }) {
  return (
    <div style={{ textAlign: "center", padding: "20px 12px" }}>
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "16px",
          border: "1px solid #E8ECF0",
          background: "#F8FAFC",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 10px",
        }}
      >
        <LogoWithFallback src={tool.logo_url} alt={tool.name} className="w-12 h-12 object-contain" fallbackSize="text-2xl" />
      </div>
      <h2
        style={{
          fontSize: "18px",
          fontWeight: 800,
          color: "#171717",
          margin: "0 0 4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
        }}
      >
        {tool.name}
        {tool.is_verified && (
          <Shield
            style={{ width: "14px", height: "14px", color: "#22C55E" }}
          />
        )}
      </h2>
      <p
        style={{
          fontSize: "12px",
          color: "#6B7280",
          margin: "0 0 8px",
          lineHeight: 1.4,
        }}
      >
        {tool.tagline}
      </p>
      <Link
        href={`/tools/${tool.slug}`}
        style={{
          fontSize: "12px",
          fontWeight: 700,
          color: "#D97706",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "3px",
        }}
      >
        View profile <ArrowRight style={{ width: "11px", height: "11px" }} />
      </Link>
    </div>
  );
}

// ─── Feature Comparison ───────────────────────────────────────────────────────

function FeatureCheck({ has }: { has: boolean }) {
  return has ? (
    <CheckCircle2
      style={{ width: "16px", height: "16px", color: "#22C55E" }}
    />
  ) : (
    <XCircle style={{ width: "16px", height: "16px", color: "#E5E7EB" }} />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ComparisonClient({ toolA, toolB }: Props) {
  // Determine winners for each metric
  const ratingWinner =
    toolA.average_rating > toolB.average_rating
      ? "a"
      : toolB.average_rating > toolA.average_rating
        ? "b"
        : null;
  const laudWinner =
    toolA.upvote_count > toolB.upvote_count
      ? "a"
      : toolB.upvote_count > toolA.upvote_count
        ? "b"
        : null;
  const reviewWinner =
    toolA.review_count > toolB.review_count
      ? "a"
      : toolB.review_count > toolA.review_count
        ? "b"
        : null;

  // Build features comparison from tool features
  const allFeatureTitles = new Set<string>();
  (toolA.features ?? []).forEach((f) => allFeatureTitles.add(f.title));
  (toolB.features ?? []).forEach((f) => allFeatureTitles.add(f.title));
  const featureTitles = Array.from(allFeatureTitles);
  const toolAFeatures = new Set(
    (toolA.features ?? []).map((f) => f.title)
  );
  const toolBFeatures = new Set(
    (toolB.features ?? []).map((f) => f.title)
  );

  // Related links
  const relatedLinks = [
    {
      label: `${toolA.name} Alternatives`,
      href: `/${toolA.slug}-alternatives`,
    },
    {
      label: `${toolB.name} Alternatives`,
      href: `/${toolB.slug}-alternatives`,
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8FAFC",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />

      {/* Breadcrumbs */}
      <div
        className="max-w-[1280px] mx-auto w-full px-3 sm:px-6 lg:px-10"
        style={{ paddingTop: "80px" }}
      >
        <nav
          aria-label="Breadcrumb"
          style={{
            padding: "12px 0",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: "13px",
              color: "#6B7280",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Home
          </Link>
          <ChevronRight
            style={{ width: "12px", height: "12px", color: "#CBD5E1" }}
          />
          <Link
            href="/comparisons"
            style={{
              fontSize: "13px",
              color: "#6B7280",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Comparisons
          </Link>
          <ChevronRight
            style={{ width: "12px", height: "12px", color: "#CBD5E1" }}
          />
          <span
            style={{ fontSize: "13px", color: "#171717", fontWeight: 600 }}
          >
            {toolA.name} vs {toolB.name}
          </span>
        </nav>
      </div>

      <PageHero
        eyebrow="Comparison"
        title={`${toolA.name} vs ${toolB.name}`}
        subtitle={`Compare ${toolA.name} and ${toolB.name} side by side. See ratings, pricing, features, and community reviews to find the best tool for your needs.`}
        accent="amber"
        layout="default"
        size="sm"
      />

      {/* Comparison Table */}
      <div
        className="max-w-[1280px] mx-auto w-full px-3 sm:px-6 lg:px-10"
        style={{ paddingTop: "24px", paddingBottom: "48px", flex: 1 }}
      >
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid #E8ECF0",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          {/* Tool Headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              borderBottom: "2px solid #E8ECF0",
            }}
          >
            <div
              style={{
                padding: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <GitCompareArrows
                style={{ width: "20px", height: "20px", color: "#F59E0B" }}
              />
            </div>
            <ToolHeaderCard tool={toolA} />
            <ToolHeaderCard tool={toolB} />
          </div>

          {/* Comparison Rows */}
          <ComparisonRow
            label="Category"
            valueA={toolA.category}
            valueB={toolB.category}
          />
          <ComparisonRow
            label="Rating"
            valueA={
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <StarRow rating={toolA.average_rating} />
                <span style={{ fontSize: "13px", fontWeight: 700 }}>
                  {toolA.average_rating > 0
                    ? toolA.average_rating.toFixed(1)
                    : "N/A"}
                </span>
              </div>
            }
            valueB={
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <StarRow rating={toolB.average_rating} />
                <span style={{ fontSize: "13px", fontWeight: 700 }}>
                  {toolB.average_rating > 0
                    ? toolB.average_rating.toFixed(1)
                    : "N/A"}
                </span>
              </div>
            }
            highlight={ratingWinner}
          />
          <ComparisonRow
            label="Community Lauds"
            valueA={`${toolA.upvote_count} Lauds`}
            valueB={`${toolB.upvote_count} Lauds`}
            highlight={laudWinner}
          />
          <ComparisonRow
            label="Reviews"
            valueA={`${toolA.review_count} reviews`}
            valueB={`${toolB.review_count} reviews`}
            highlight={reviewWinner}
          />
          <ComparisonRow
            label="Pricing"
            valueA={
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color:
                    toolA.pricing_model === "Free" ? "#15803D" : "#475569",
                  background:
                    toolA.pricing_model === "Free" ? "#F0FDF4" : "#F8FAFC",
                  padding: "3px 10px",
                  borderRadius: "6px",
                  border: `1px solid ${toolA.pricing_model === "Free" ? "#BBF7D0" : "#E8ECF0"}`,
                }}
              >
                {toolA.pricing_model}
              </span>
            }
            valueB={
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color:
                    toolB.pricing_model === "Free" ? "#15803D" : "#475569",
                  background:
                    toolB.pricing_model === "Free" ? "#F0FDF4" : "#F8FAFC",
                  padding: "3px 10px",
                  borderRadius: "6px",
                  border: `1px solid ${toolB.pricing_model === "Free" ? "#BBF7D0" : "#E8ECF0"}`,
                }}
              >
                {toolB.pricing_model}
              </span>
            }
          />
          <ComparisonRow
            label="Verified"
            valueA={<FeatureCheck has={toolA.is_verified} />}
            valueB={<FeatureCheck has={toolB.is_verified} />}
          />

          {/* Feature Comparison */}
          {featureTitles.length > 0 && (
            <>
              <div
                style={{
                  padding: "14px 16px",
                  background: "#F8FAFC",
                  borderBottom: "1px solid #E8ECF0",
                  borderTop: "2px solid #E8ECF0",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#6B7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Features
                </span>
              </div>
              {featureTitles.map((title) => (
                <ComparisonRow
                  key={title}
                  label={title}
                  valueA={
                    <FeatureCheck has={toolAFeatures.has(title)} />
                  }
                  valueB={
                    <FeatureCheck has={toolBFeatures.has(title)} />
                  }
                />
              ))}
            </>
          )}
        </div>

        {/* CTA Buttons */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginTop: "24px",
          }}
        >
          <Link
            href={`/tools/${toolA.slug}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "14px",
              background: "#FFFFFF",
              borderRadius: "12px",
              border: "1.5px solid #E8ECF0",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 700,
              color: "#171717",
              transition: "border-color 0.15s",
            }}
          >
            View {toolA.name}
            <ArrowRight style={{ width: "14px", height: "14px" }} />
          </Link>
          <Link
            href={`/tools/${toolB.slug}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "14px",
              background: "#FFFFFF",
              borderRadius: "12px",
              border: "1.5px solid #E8ECF0",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 700,
              color: "#171717",
              transition: "border-color 0.15s",
            }}
          >
            View {toolB.name}
            <ArrowRight style={{ width: "14px", height: "14px" }} />
          </Link>
        </div>

        {/* Related Links */}
        {relatedLinks.length > 0 && (
          <div style={{ marginTop: "40px" }}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 800,
                color: "#171717",
                marginBottom: "16px",
              }}
            >
              Explore More
            </h3>
            <div
              className="grid grid-cols-1 sm:grid-cols-2"
              style={{ gap: "12px" }}
            >
              {relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    background: "#FFFFFF",
                    borderRadius: "10px",
                    border: "1px solid #E8ECF0",
                    textDecoration: "none",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#171717",
                    }}
                  >
                    {link.label}
                  </span>
                  <ArrowRight
                    style={{
                      width: "14px",
                      height: "14px",
                      color: "#CBD5E1",
                    }}
                  />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
