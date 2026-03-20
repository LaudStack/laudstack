"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, Sparkles, ArrowUpRight, Megaphone } from "lucide-react";

interface FeaturedStack {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  category: string;
  average_rating: number;
  review_count: number;
  description: string;
  isSponsored: boolean;
}

interface FeaturedStacksSidebarProps {
  /** Max number of stacks to show (default 5) */
  limit?: number;
  /** Optional: exclude a specific tool ID (e.g., the current tool page) */
  excludeToolId?: string;
  /** Optional: custom title */
  title?: string;
  /** Layout variant: 'panel' for split-screen sidebar (no rounded corners), 'inline' for horizontal strip */
  variant?: "panel" | "inline";
}

// Module-level cache to avoid re-fetching on every mount
let cachedStacks: FeaturedStack[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export default function FeaturedStacksSidebar({
  limit = 5,
  excludeToolId,
  title = "Featured",
  variant = "panel",
}: FeaturedStacksSidebarProps) {
  const [stacks, setStacks] = useState<FeaturedStack[]>(
    cachedStacks
      ? cachedStacks.filter((s) => s.id !== excludeToolId).slice(0, limit)
      : []
  );
  const [loading, setLoading] = useState(!cachedStacks);

  useEffect(() => {
    if (
      cachedStacks &&
      cacheTimestamp &&
      Date.now() - cacheTimestamp < CACHE_TTL_MS
    ) {
      setStacks(
        cachedStacks.filter((s) => s.id !== excludeToolId).slice(0, limit)
      );
      setLoading(false);
      return;
    }

    fetch(`/api/featured-stacks?context=sidebar&limit=8`)
      .then((r) => r.json())
      .then((data) => {
        const fetched: FeaturedStack[] = (data.stacks ?? []).map(
          (s: Record<string, unknown>) => ({
            id: String(s.id),
            name: String(s.name ?? ""),
            slug: String(s.slug ?? ""),
            logo_url: String(s.logo_url ?? ""),
            category: String(s.category ?? ""),
            average_rating: Number(s.average_rating ?? 0),
            review_count: Number(s.review_count ?? 0),
            description: String(s.description ?? ""),
            isSponsored: Boolean(s.isSponsored),
          })
        );
        cachedStacks = fetched;
        cacheTimestamp = Date.now();
        setStacks(
          fetched.filter((s) => s.id !== excludeToolId).slice(0, limit)
        );
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [excludeToolId, limit]);

  if (loading) {
    return <PanelSkeleton title={title} count={limit} variant={variant} />;
  }

  if (stacks.length === 0) {
    return null;
  }

  // ── Inline horizontal strip (for deals page, etc.) ──
  if (variant === "inline") {
    return (
      <div
        style={{
          background: "#FAFBFD",
          borderTop: "1px solid #E2E8F0",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Megaphone className="w-3.5 h-3.5" style={{ color: "#D97706" }} />
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {title}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {stacks.map((stack) => (
              <InlineCard key={stack.id} stack={stack} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Panel sidebar (split-screen, no rounded corners) ──
  return (
    <div
      className="flex flex-col"
      style={{
        background: "#FAFBFD",
        borderLeft: "1px solid #E2E8F0",
        borderRadius: "12px 12px 12px 12px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid #E2E8F0",
          background: "#F8FAFC",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center"
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "7px",
              background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
            }}
          >
            <Megaphone className="w-3 h-3" style={{ color: "#FFFFFF" }} />
          </div>
          <h3
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#1E293B",
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {title}
          </h3>
        </div>
      </div>

      {/* Stack entries */}
      <div>
        {stacks.map((stack, i) => (
          <PanelCard
            key={stack.id}
            stack={stack}
            isLast={i === stacks.length - 1}
          />
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "10px 16px",
          borderTop: "1px solid #E2E8F0",
          background: "#F8FAFC",
        }}
      >
        <Link
          href="/advertise"
          className="flex items-center justify-center gap-1.5 text-xs font-semibold no-underline transition-colors"
          style={{ color: "#D97706" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#B45309")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#D97706")}
        >
          <Sparkles className="w-3 h-3" />
          Promote your stack here
        </Link>
      </div>
    </div>
  );
}

// ── Panel Card ──────────────────────────────────────────────────────────────

function PanelCard({
  stack,
  isLast,
}: {
  stack: FeaturedStack;
  isLast: boolean;
}) {
  const [logoErr, setLogoErr] = useState(false);

  return (
    <Link
      href={`/tools/${stack.slug}`}
      className="group flex gap-3 no-underline transition-colors"
      style={{
        padding: "12px 16px",
        borderBottom: isLast ? "none" : "1px solid #F1F5F9",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#F1F5F9")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Logo */}
      <div
        className="shrink-0 flex items-center justify-center overflow-hidden"
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: logoErr ? "#F1F5F9" : "#FFFFFF",
          border: "1.5px solid #E2E8F0",
        }}
      >
        {logoErr ? (
          <span
            style={{
              fontSize: "16px",
              fontWeight: 800,
              color: "#64748B",
              fontFamily: "system-ui",
            }}
          >
            {stack.name.charAt(0)}
          </span>
        ) : (
          <img
            src={stack.logo_url}
            alt={stack.name}
            width={32}
            height={32}
            style={{ objectFit: "contain", borderRadius: "6px" }}
            onError={() => setLogoErr(true)}
          />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name row */}
        <div className="flex items-center gap-1.5 mb-0.5">
          <span
            className="truncate"
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#0F172A",
              lineHeight: "18px",
            }}
          >
            {stack.name}
          </span>
          {stack.isSponsored && (
            <span
              style={{
                fontSize: "9px",
                fontWeight: 700,
                color: "#D97706",
                background: "#FEF3C7",
                padding: "1px 5px",
                borderRadius: "4px",
                flexShrink: 0,
                lineHeight: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Ad
            </span>
          )}
          <ArrowUpRight
            className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: "#94A3B8" }}
          />
        </div>

        {/* Description */}
        <p
          className="line-clamp-2"
          style={{
            fontSize: "11px",
            color: "#64748B",
            margin: "0 0 4px",
            lineHeight: "15px",
          }}
        >
          {stack.description}
        </p>

        {/* Category */}
        <div className="flex items-center gap-2">
          {stack.average_rating > 0 && (
            <div className="flex items-center gap-0.5">
              <Star
                className="w-2.5 h-2.5"
                style={{ color: "#F59E0B", fill: "#F59E0B" }}
              />
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#1E293B",
                }}
              >
                {stack.average_rating.toFixed(1)}
              </span>
              {stack.review_count > 0 && (
                <span
                  style={{
                    fontSize: "9px",
                    color: "#94A3B8",
                    fontWeight: 500,
                  }}
                >
                  ({stack.review_count})
                </span>
              )}
            </div>
          )}
          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              color: "#64748B",
              background: "#F1F5F9",
              padding: "1px 6px",
              borderRadius: "4px",
            }}
          >
            {stack.category}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Inline Card (for horizontal strip) ──────────────────────────────────────

function InlineCard({ stack }: { stack: FeaturedStack }) {
  const [logoErr, setLogoErr] = useState(false);

  return (
    <Link
      href={`/tools/${stack.slug}`}
      className="group flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all no-underline"
      style={{ borderRadius: "10px" }}
    >
      <div
        className="shrink-0 flex items-center justify-center overflow-hidden"
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "8px",
          background: logoErr ? "#F1F5F9" : "#FFFFFF",
          border: "1px solid #E2E8F0",
        }}
      >
        {logoErr ? (
          <span style={{ fontSize: "14px", fontWeight: 800, color: "#64748B" }}>
            {stack.name.charAt(0)}
          </span>
        ) : (
          <img
            src={stack.logo_url}
            alt={stack.name}
            width={28}
            height={28}
            style={{ objectFit: "contain", borderRadius: "6px" }}
            onError={() => setLogoErr(true)}
          />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="flex items-center gap-1.5">
          <span
            className="truncate"
            style={{ fontSize: "13px", fontWeight: 600, color: "#0F172A" }}
          >
            {stack.name}
          </span>
          {stack.isSponsored && (
            <span
              style={{
                fontSize: "8px",
                fontWeight: 700,
                color: "#D97706",
                background: "#FEF3C7",
                padding: "1px 4px",
                borderRadius: "3px",
                flexShrink: 0,
                textTransform: "uppercase",
              }}
            >
              Ad
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          {stack.average_rating > 0 && (
            <>
              <Star
                className="w-2.5 h-2.5"
                style={{ color: "#F59E0B", fill: "#F59E0B" }}
              />
              <span style={{ fontSize: "10px", fontWeight: 600, color: "#475569" }}>
                {stack.average_rating.toFixed(1)}
              </span>
            </>
          )}
          <span style={{ fontSize: "10px", color: "#94A3B8" }}>
            {stack.category}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Skeleton ────────────────────────────────────────────────────────────────

function PanelSkeleton({
  title,
  count,
  variant,
}: {
  title: string;
  count: number;
  variant: "panel" | "inline";
}) {
  if (variant === "inline") {
    return (
      <div
        style={{
          background: "#FAFBFD",
          borderTop: "1px solid #E2E8F0",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3.5 h-3.5 rounded bg-slate-200 animate-pulse" />
            <div className="w-24 h-3 rounded bg-slate-200 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200"
                style={{ borderRadius: "10px" }}
              >
                <div className="w-9 h-9 rounded-lg bg-slate-200 animate-pulse shrink-0" />
                <div className="flex-1">
                  <div className="w-20 h-3 rounded bg-slate-200 animate-pulse mb-1.5" />
                  <div className="w-14 h-2.5 rounded bg-slate-100 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col"
      style={{
        background: "#FAFBFD",
        borderLeft: "1px solid #E2E8F0",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <div
        className="flex items-center gap-2"
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid #E2E8F0",
          background: "#F8FAFC",
        }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            width: "26px",
            height: "26px",
            borderRadius: "7px",
            background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
          }}
        >
          <Megaphone className="w-3 h-3" style={{ color: "#FFFFFF" }} />
        </div>
        <h3
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "#1E293B",
            margin: 0,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {title}
        </h3>
      </div>
      <div>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex gap-3"
            style={{
              padding: "12px 16px",
              borderBottom: i === count - 1 ? "none" : "1px solid #F1F5F9",
            }}
          >
            <div
              className="animate-pulse shrink-0"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "#E2E8F0",
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                className="animate-pulse"
                style={{
                  width: "75%",
                  height: "13px",
                  borderRadius: "4px",
                  background: "#E2E8F0",
                  marginBottom: "6px",
                }}
              />
              <div
                className="animate-pulse"
                style={{
                  width: "100%",
                  height: "11px",
                  borderRadius: "4px",
                  background: "#F1F5F9",
                  marginBottom: "4px",
                }}
              />
              <div
                className="animate-pulse"
                style={{
                  width: "50%",
                  height: "10px",
                  borderRadius: "4px",
                  background: "#F1F5F9",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
