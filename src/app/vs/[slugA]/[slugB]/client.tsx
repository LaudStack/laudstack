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
      className="grid grid-cols-3 gap-0"
      style={{
        borderBottom: "1px solid #F1F5F9",
      }}
    >
      <div
        className="px-3 py-3 sm:px-4 sm:py-3.5 text-[12px] sm:text-[13px] font-bold text-gray-600 flex items-center"
      >
        {label}
      </div>
      <div
        className="px-3 py-3 sm:px-4 sm:py-3.5 text-[12px] sm:text-[13px] font-semibold text-slate-900 flex items-center gap-1 sm:gap-1.5 flex-wrap"
        style={{
          background: highlight === "a" ? "#FEFCE8" : "transparent",
        }}
      >
        {valueA}
        {highlight === "a" && <WinnerBadge label="Winner" />}
      </div>
      <div
        className="px-3 py-3 sm:px-4 sm:py-3.5 text-[12px] sm:text-[13px] font-semibold text-slate-900 flex items-center gap-1 sm:gap-1.5 flex-wrap"
        style={{
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
    <div className="text-center p-3 sm:p-5">
      <div
        className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center mx-auto mb-2 sm:mb-2.5"
      >
        <LogoWithFallback src={tool.logo_url} alt={tool.name} className="w-10 h-10 sm:w-12 sm:h-12 object-contain" fallbackSize="text-xl sm:text-2xl" />
      </div>
      <h2
        className="text-[14px] sm:text-[18px] font-extrabold text-slate-900 m-0 mb-1 flex items-center justify-center gap-1.5"
      >
        {tool.name}
        {tool.is_verified && (
          <Shield
            className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-500"
          />
        )}
      </h2>
      <p
        className="text-[11px] sm:text-[12px] text-gray-500 m-0 mb-2 leading-snug line-clamp-2"
      >
        {tool.tagline}
      </p>
      <Link
        href={`/tools/${tool.slug}`}
        className="text-[11px] sm:text-[12px] font-bold text-amber-600 no-underline inline-flex items-center gap-1"
      >
        View profile <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
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
            className="grid grid-cols-3"
            style={{
              borderBottom: "2px solid #E8ECF0",
            }}
          >
            <div
              className="p-3 sm:p-4 flex items-center justify-center"
            >
              <GitCompareArrows
                className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500"
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
                className="px-3 py-3 sm:px-4 sm:py-3.5 bg-slate-50"
                style={{
                  borderBottom: "1px solid #E8ECF0",
                  borderTop: "2px solid #E8ECF0",
                }}
              >
                <span
                  className="text-[11px] sm:text-[12px] font-extrabold text-gray-500 uppercase tracking-widest"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-6">
          <Link
            href={`/tools/${toolA.slug}`}
            className="flex items-center justify-center gap-2 py-3 sm:py-3.5 bg-white rounded-xl border-[1.5px] border-slate-200 no-underline text-[13px] sm:text-[14px] font-bold text-slate-900 hover:border-amber-300 transition-colors"
          >
            View {toolA.name}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={`/tools/${toolB.slug}`}
            className="flex items-center justify-center gap-2 py-3 sm:py-3.5 bg-white rounded-xl border-[1.5px] border-slate-200 no-underline text-[13px] sm:text-[14px] font-bold text-slate-900 hover:border-amber-300 transition-colors"
          >
            View {toolB.name}
            <ArrowRight className="w-3.5 h-3.5" />
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
