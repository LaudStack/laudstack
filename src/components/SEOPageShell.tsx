"use client";
/**
 * SEOPageShell — Shared layout for all programmatic SEO pages.
 *
 * Provides: Navbar + PageHero + filter bar + tool grid + pagination + internal links + Footer
 * All SEO pages compose this shell with their specific data.
 */
import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  Shield,
  ChevronUp,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import type { Tool } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InternalLink {
  label: string;
  href: string;
  description?: string;
}

interface SEOPageShellProps {
  /** PageHero props */
  eyebrow: string;
  title: string;
  subtitle: string;
  accent?: "amber" | "blue" | "green" | "rose";
  /** Tool data */
  tools: Tool[];
  totalCount: number;
  /** Sort options */
  sortOptions?: { value: string; label: string }[];
  defaultSort?: string;
  onSortChange?: (sort: string) => void;
  /** Pagination */
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  /** Internal linking section */
  relatedLinks?: InternalLink[];
  relatedLinksTitle?: string;
  /** Breadcrumbs */
  breadcrumbs?: { label: string; href?: string }[];
  /** Optional intro text for SEO */
  introText?: string;
  /** Optional children below the tool grid */
  children?: React.ReactNode;
}

const DEFAULT_SORT_OPTIONS = [
  { value: "rank_score", label: "Best Match" },
  { value: "top_rated", label: "Top Rated" },
  { value: "trending", label: "Trending" },
  { value: "newest", label: "Newest" },
  { value: "most_lauded", label: "Most Lauded" },
];

// ─── Tool Grid Card ───────────────────────────────────────────────────────────

function SEOToolCard({ tool }: { tool: Tool }) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/tools/${tool.slug}`)}
      style={{
        background: "#FFFFFF",
        borderRadius: "16px",
        border: "1px solid #E8ECF0",
        overflow: "hidden",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 14px 10px",
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            flexShrink: 0,
            border: "1px solid #E8ECF0",
            background: "#F8FAFC",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={tool.logo_url}
            alt={tool.name}
            style={{ width: "36px", height: "36px", objectFit: "contain" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              if (e.currentTarget.parentElement)
                e.currentTarget.parentElement.innerHTML = `<span style="font-size:18px;font-weight:800;color:#64748B">${tool.name.charAt(0)}</span>`;
            }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              marginBottom: "3px",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: 800,
                color: "#171717",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {tool.name}
            </span>
            {tool.is_verified && (
              <Shield
                style={{ width: "12px", height: "12px", color: "#22C55E" }}
              />
            )}
          </div>
          <span
            style={{
              fontSize: "11px",
              color: "#6B7280",
              fontWeight: 600,
              background: "#F3F4F6",
              padding: "2px 8px",
              borderRadius: "6px",
            }}
          >
            {tool.category}
          </span>
        </div>
      </div>

      {/* Tagline */}
      <div style={{ padding: "0 14px 10px" }}>
        <p
          style={{
            fontSize: "13px",
            color: "#6B7280",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {tool.tagline}
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "auto",
          padding: "10px 14px",
          borderTop: "1px solid #F1F5F9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Rating */}
          <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            <Star
              style={{
                width: "12px",
                height: "12px",
                fill: "#F59E0B",
                color: "#F59E0B",
              }}
            />
            <span
              style={{ fontSize: "12px", fontWeight: 700, color: "#171717" }}
            >
              {tool.average_rating > 0
                ? tool.average_rating.toFixed(1)
                : "N/A"}
            </span>
            {tool.review_count > 0 && (
              <span
                style={{
                  fontSize: "11px",
                  color: "#9CA3AF",
                  fontWeight: 500,
                }}
              >
                ({tool.review_count})
              </span>
            )}
          </div>
          {/* Pricing */}
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: tool.pricing_model === "Free" ? "#15803D" : "#475569",
              background:
                tool.pricing_model === "Free" ? "#F0FDF4" : "#F8FAFC",
              padding: "2px 8px",
              borderRadius: "6px",
              border: `1px solid ${tool.pricing_model === "Free" ? "#BBF7D0" : "#E8ECF0"}`,
            }}
          >
            {tool.pricing_model}
          </span>
        </div>
        {/* Lauds */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "3px",
            color: "#6B7280",
          }}
        >
          <ChevronUp style={{ width: "14px", height: "14px" }} />
          <span style={{ fontSize: "12px", fontWeight: 700 }}>
            {tool.upvote_count}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Breadcrumbs ──────────────────────────────────────────────────────────────

function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        padding: "12px 0",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        flexWrap: "wrap",
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
      {items.map((item, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <ChevronRight
            style={{ width: "12px", height: "12px", color: "#CBD5E1" }}
          />
          {item.href ? (
            <Link
              href={item.href}
              style={{
                fontSize: "13px",
                color: "#6B7280",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              {item.label}
            </Link>
          ) : (
            <span
              style={{
                fontSize: "13px",
                color: "#171717",
                fontWeight: 600,
              }}
            >
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        padding: "32px 0",
      }}
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          padding: "6px 10px",
          borderRadius: "8px",
          border: "1px solid #E8ECF0",
          background: currentPage === 1 ? "#F9FAFB" : "#FFFFFF",
          color: currentPage === 1 ? "#CBD5E1" : "#374151",
          cursor: currentPage === 1 ? "default" : "pointer",
          fontSize: "13px",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <ChevronLeft style={{ width: "14px", height: "14px" }} /> Prev
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`dots-${i}`}
            style={{ padding: "0 4px", color: "#9CA3AF", fontSize: "13px" }}
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "8px",
              border:
                p === currentPage
                  ? "1.5px solid #F59E0B"
                  : "1px solid #E8ECF0",
              background: p === currentPage ? "#FFFBEB" : "#FFFFFF",
              color: p === currentPage ? "#B45309" : "#374151",
              fontWeight: p === currentPage ? 800 : 600,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          padding: "6px 10px",
          borderRadius: "8px",
          border: "1px solid #E8ECF0",
          background: currentPage === totalPages ? "#F9FAFB" : "#FFFFFF",
          color: currentPage === totalPages ? "#CBD5E1" : "#374151",
          cursor: currentPage === totalPages ? "default" : "pointer",
          fontSize: "13px",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        Next <ChevronRight style={{ width: "14px", height: "14px" }} />
      </button>
    </div>
  );
}

// ─── Related Links Section ────────────────────────────────────────────────────

function RelatedLinksSection({
  title,
  links,
}: {
  title: string;
  links: InternalLink[];
}) {
  if (links.length === 0) return null;
  return (
    <section
      style={{
        background: "#F8FAFC",
        borderTop: "1px solid #E8ECF0",
        padding: "40px 0",
      }}
    >
      <div className="max-w-[1280px] mx-auto w-full px-3 sm:px-6 lg:px-10">
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 800,
            color: "#171717",
            marginBottom: "20px",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h2>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          style={{ gap: "12px" }}
        >
          {links.map((link) => (
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
                transition: "border-color 0.15s",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#171717",
                  }}
                >
                  {link.label}
                </span>
                {link.description && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#9CA3AF",
                      margin: "2px 0 0",
                      lineHeight: 1.4,
                    }}
                  >
                    {link.description}
                  </p>
                )}
              </div>
              <ArrowRight
                style={{
                  width: "14px",
                  height: "14px",
                  color: "#CBD5E1",
                  flexShrink: 0,
                }}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Main Shell ───────────────────────────────────────────────────────────────

export default function SEOPageShell({
  eyebrow,
  title,
  subtitle,
  accent = "amber",
  tools,
  totalCount,
  sortOptions = DEFAULT_SORT_OPTIONS,
  defaultSort = "rank_score",
  onSortChange,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  relatedLinks = [],
  relatedLinksTitle = "Related Pages",
  breadcrumbs = [],
  introText,
  children,
}: SEOPageShellProps) {
  const [sort, setSort] = useState(defaultSort);

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    onSortChange?.(newSort);
  };

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
      {breadcrumbs.length > 0 && (
        <div
          className="max-w-[1280px] mx-auto w-full px-3 sm:px-6 lg:px-10"
          style={{ paddingTop: "80px" }}
        >
          <Breadcrumbs items={breadcrumbs} />
        </div>
      )}

      <PageHero
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        accent={accent}
        layout="default"
        size="sm"
      />

      {/* Intro text for SEO */}
      {introText && (
        <div className="max-w-[1280px] mx-auto w-full px-3 sm:px-6 lg:px-10">
          <p
            style={{
              fontSize: "15px",
              color: "#475569",
              lineHeight: 1.7,
              maxWidth: "800px",
              padding: "0 0 24px",
            }}
          >
            {introText}
          </p>
        </div>
      )}

      {/* Filter bar */}
      <div
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #E8ECF0",
          position: "sticky",
          top: 64,
          zIndex: 20,
        }}
      >
        <div
          className="max-w-[1280px] mx-auto w-full px-3 sm:px-6 lg:px-10"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "52px",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              overflow: "auto",
              flex: 1,
            }}
          >
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              style={{
                padding: "5px 10px",
                borderRadius: "8px",
                border: "1.5px solid #E8ECF0",
                fontSize: "12px",
                fontWeight: 600,
                color: "#374151",
                background: "#F9FAFB",
                cursor: "pointer",
                fontFamily: "inherit",
                outline: "none",
              }}
            >
              {sortOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <span
              style={{
                fontSize: "12px",
                color: "#9CA3AF",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ color: "#171717", fontWeight: 800 }}>
                {totalCount}
              </span>{" "}
              tools
            </span>
          </div>
        </div>
      </div>

      {/* Tool Grid */}
      <div
        className="max-w-[1280px] mx-auto w-full px-3 sm:px-6 lg:px-10"
        style={{ paddingTop: "24px", paddingBottom: "16px", flex: 1 }}
      >
        {tools.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "#171717",
                marginBottom: "8px",
              }}
            >
              No tools found
            </h3>
            <p style={{ fontSize: "14px", color: "#9CA3AF" }}>
              Check back soon as new tools are added regularly.
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            style={{ gap: "20px" }}
          >
            {tools.map((tool) => (
              <SEOToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {onPageChange && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </div>

      {/* Optional children */}
      {children}

      {/* Related Links */}
      {relatedLinks.length > 0 && (
        <RelatedLinksSection
          title={relatedLinksTitle}
          links={relatedLinks}
        />
      )}

      <Footer />
    </div>
  );
}
