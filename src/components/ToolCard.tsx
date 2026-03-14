"use client";

/*
 * LaudStack ToolCard — v3
 *
 * Three variants:
 *   1. Standard (default) — Large horizontal row card (PH-sized)
 *   2. Featured — Card with screenshot hero, homepage featured/trending only
 *   3. Compact — Minimal row for leaderboards and sidebars
 *
 * Layout (Standard):
 *   [Logo 64px]  [Name + ✓]           [Upvote btn]
 *                [★ Rating]            [stacked icon+num]
 *                [Description 2 lines]
 *                [1 badge max]
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ChevronUp,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Bookmark,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import type { Tool } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { toggleSaveTool } from "@/app/actions/public";
import { toggleLaud } from "@/app/actions/laud";
import AuthGateModal from "@/components/AuthGateModal";

// ─── Badge config ─────────────────────────────────────────────────────────────

type BadgeType =
  | "top_rated"
  | "featured"
  | "verified"
  | "new_launch"
  | "editors_pick"
  | "trending"
  | "pro_founder"
  | "community_pick"
  | "best_value"
  | "laudstack_pick";

const BADGE_CONFIG: Record<
  BadgeType,
  { label: string; bg: string; color: string; border: string }
> = {
  top_rated: { label: "Top Rated", bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" },
  featured: { label: "Featured", bg: "#DBEAFE", color: "#1E40AF", border: "#93C5FD" },
  verified: { label: "Verified", bg: "#DCFCE7", color: "#166534", border: "#86EFAC" },
  new_launch: { label: "New", bg: "#E0F2FE", color: "#075985", border: "#7DD3FC" },
  editors_pick: { label: "Editor's Pick", bg: "#F3E8FF", color: "#6B21A8", border: "#C4B5FD" },
  trending: { label: "Trending", bg: "#FFEDD5", color: "#9A3412", border: "#FDBA74" },
  pro_founder: { label: "Pro", bg: "#1C1917", color: "#F59E0B", border: "#44403C" },
  community_pick: { label: "Community Pick", bg: "#FFE4E6", color: "#9F1239", border: "#FDA4AF" },
  best_value: { label: "Best Value", bg: "#DCFCE7", color: "#166534", border: "#86EFAC" },
  laudstack_pick: { label: "LaudStack Pick", bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" },
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function StarRating({ rating, count, size = "sm" }: { rating: number; count?: number; size?: "sm" | "md" | "xs" }) {
  const sz = size === "xs" ? 10 : size === "md" ? 14 : 12;
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: sz, height: sz }}
          fill={i <= fullStars ? "#F59E0B" : (i === fullStars + 1 && hasHalf ? "#FCD34D" : "#E2E8F0")}
          color={i <= fullStars ? "#F59E0B" : (i === fullStars + 1 && hasHalf ? "#FCD34D" : "#E2E8F0")}
        />
      ))}
      <span className="ml-1 tabular-nums" style={{ fontSize: sz + 2, fontWeight: 700, color: "#1E293B" }}>
        {rating.toFixed(1)}
      </span>
      {count !== undefined && (
        <span style={{ fontSize: sz + 1, color: "#94A3B8", fontWeight: 500, marginLeft: 2 }}>
          ({count})
        </span>
      )}
    </div>
  );
}

function ToolLogo({ tool, size = 48 }: { tool: Tool; size?: number }) {
  const radius = size >= 56 ? 16 : size >= 48 ? 14 : size >= 36 ? 10 : 8;
  return (
    <div
      className="shrink-0 flex items-center justify-center overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: "#FFFFFF",
        border: "1.5px solid #E5E7EB",

      }}
    >
      <img
        src={tool.logo_url}
        alt={tool.name}
        loading="lazy"
        className="w-full h-full object-cover"
        style={{ borderRadius: radius - 1 }}
        onError={(e) => {
          const t = e.currentTarget;
          t.style.display = "none";
          const p = t.parentElement;
          if (p) {
            p.style.background = "#F1F5F9";
            p.innerHTML = `<span style="font-size:${Math.round(size * 0.38)}px;font-weight:800;color:#64748B;font-family:system-ui;line-height:1">${tool.name.charAt(0)}</span>`;
          }
        }}
      />
    </div>
  );
}

function UpvoteButton({
  count,
  active,
  onClick,
  pending,
  variant = "default",
}: {
  count: number;
  active: boolean;
  onClick: (e: React.MouseEvent) => void;
  pending: boolean;
  variant?: "default" | "compact" | "featured";
}) {
  const displayCount = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count;

  if (variant === "compact") {
    return (
      <button
        onClick={onClick}
        disabled={pending}
        className="flex items-center gap-1 transition-all"
        style={{
          padding: "3px 8px",
          borderRadius: 6,
          border: "1.5px solid",
          fontSize: 11,
          fontWeight: 700,
          background: active ? "#FEF3C7" : "#F8FAFC",
          borderColor: active ? "#FCD34D" : "#E5E7EB",
          color: active ? "#B45309" : "#6B7280",
          cursor: pending ? "wait" : "pointer",
          opacity: pending ? 0.6 : 1,
        }}
      >
        <ChevronUp style={{ width: 11, height: 11 }} />
        {displayCount}
      </button>
    );
  }

  // Default and featured — stacked icon + number, bigger button
  const isLarge = variant === "featured" || variant === "default";
  return (
    <button
      onClick={onClick}
      disabled={pending}
      className="flex flex-col items-center justify-center transition-all shrink-0"
      style={{
        padding: isLarge ? "10px 16px" : "6px 12px",
        borderRadius: 12,
        border: "1.5px solid",
        background: active ? "#FEF3C7" : "#FAFAFA",
        borderColor: active ? "#FCD34D" : "#E5E7EB",
        color: active ? "#B45309" : "#6B7280",
        cursor: pending ? "wait" : "pointer",
        opacity: pending ? 0.6 : 1,
        minWidth: isLarge ? 56 : 46,
        gap: 2,
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = "#FCD34D";
          e.currentTarget.style.background = "#FFFBEB";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = "#E5E7EB";
          e.currentTarget.style.background = "#FAFAFA";
        }
      }}
    >
      <ChevronUp style={{ width: isLarge ? 22 : 15, height: isLarge ? 22 : 15 }} strokeWidth={isLarge ? 3 : 2.5} />
      <span className="tabular-nums" style={{ fontSize: isLarge ? 14 : 12, fontWeight: 800 }}>
        {displayCount}
      </span>
    </button>
  );
}

function PricingPill({ model }: { model: string }) {
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    Free: { bg: "#DCFCE7", color: "#166534", border: "#86EFAC" },
    Freemium: { bg: "#DBEAFE", color: "#1E40AF", border: "#93C5FD" },
    "Open Source": { bg: "#F3E8FF", color: "#6B21A8", border: "#C4B5FD" },
    "Free Trial": { bg: "#E0F2FE", color: "#075985", border: "#7DD3FC" },
  };
  const s = styles[model] || { bg: "#F1F5F9", color: "#475569", border: "#CBD5E1" };
  return (
    <span
      className="shrink-0"
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: 6,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        letterSpacing: "0.02em",
      }}
    >
      {model}
    </span>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ToolCardProps {
  tool: Tool;
  rank?: number;
  rankChange?: number;
  compact?: boolean;
  featured?: boolean;
  initialUpvoted?: boolean;
  initialSaved?: boolean;
  showScreenshot?: boolean;
  hideCategory?: boolean; // hide category pill when user already selected a category
}

// ─── Shared laud/save hooks ─────────────────────────────────────────────────

function useUpvote(tool: Tool, initialUpvoted: boolean) {
  const { isAuthenticated } = useAuth();
  const [upvoted, setUpvoted] = useState(initialUpvoted);
  const [upvoteCount, setUpvoteCount] = useState(tool.upvote_count);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    const toolId = parseInt(tool.id, 10);
    const wasUpvoted = upvoted;
    setUpvoted(!wasUpvoted);
    setUpvoteCount((c) => (wasUpvoted ? c - 1 : c + 1));
    if (!wasUpvoted) toast.success(`Lauded ${tool.name}!`);

    startTransition(async () => {
      const result = await toggleLaud(toolId);
      if (!result.success) {
        setUpvoted(wasUpvoted);
        setUpvoteCount((c) => (wasUpvoted ? c + 1 : c - 1));
        toast.error(result.error || "Failed to laud");
      } else if (result.newCount !== undefined) {
        setUpvoteCount(result.newCount);
      }
    });
  };

  return { upvoted, upvoteCount, handleUpvote, isPending, showAuthModal, setShowAuthModal };
}

function useSave(tool: Tool, initialSaved: boolean) {
  const { isAuthenticated } = useAuth();
  const [saved, setSaved] = useState(initialSaved);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    const toolId = parseInt(tool.id, 10);
    const wasSaved = saved;
    setSaved(!wasSaved);
    toast.success(wasSaved ? "Removed from saved" : `${tool.name} saved!`);

    startTransition(async () => {
      const result = await toggleSaveTool(toolId);
      if (!result.success) {
        setSaved(wasSaved);
        toast.error(result.error || "Failed to save");
      }
    });
  };

  return { saved, handleSave, isPending, showAuthModal, setShowAuthModal };
}

// ─── Compact Card ─────────────────────────────────────────────────────────────
// Minimal row for leaderboards, sidebars, and small lists

function CompactCard({ tool, rank, rankChange, initialUpvoted = false }: ToolCardProps) {
  const { upvoted, upvoteCount, handleUpvote, isPending, showAuthModal, setShowAuthModal } =
    useUpvote(tool, initialUpvoted);

  return (
    <>
      <AuthGateModal open={showAuthModal} onClose={() => setShowAuthModal(false)} action="upvote" />
      <Link
        href={`/tools/${tool.slug}`}
        className="group flex items-center gap-3 px-3 py-3 rounded-xl border border-gray-100 bg-white hover:bg-gray-50/80 hover:border-gray-200 transition-all no-underline"
        style={{ boxShadow: "none" }}
      >
        {rank !== undefined && (
          <span
            className="shrink-0 flex items-center justify-center tabular-nums"
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 800,
              background: rank <= 3 ? (rank === 1 ? "#F59E0B" : rank === 2 ? "#94A3B8" : "#CD7F32") : "#F1F5F9",
              color: rank <= 3 ? "#fff" : "#6B7280",
              boxShadow: rank <= 3 ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
            }}
          >
            {rank}
          </span>
        )}

        <ToolLogo tool={tool} size={36} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[13px] font-bold text-gray-900 truncate">{tool.name}</span>
            {tool.is_verified && <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />}
          </div>
          <StarRating rating={tool.average_rating} size="xs" />
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          {rankChange !== undefined && rankChange !== 0 && (
            <span
              className="flex items-center gap-0.5 text-[10px] font-bold"
              style={{ color: rankChange > 0 ? "#16A34A" : "#EF4444" }}
            >
              {rankChange > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {Math.abs(rankChange)}
            </span>
          )}
          <UpvoteButton
            count={upvoteCount}
            active={upvoted}
            onClick={handleUpvote}
            pending={isPending}
            variant="compact"
          />
        </div>
      </Link>
    </>
  );
}

// ─── Standard Card ──────────────────────────────────────────────────────────
// Large horizontal row card — the workhorse for browse, search, categories
// Layout: [Logo 64px] [Name+✓ / ★Rating / Description 2 lines / 1 badge] [Upvote btn centered]

function StandardCard({ tool, rank, initialUpvoted = false, initialSaved = false, hideCategory = false }: ToolCardProps) {
  const { upvoted, upvoteCount, handleUpvote, isPending: isPendingUpvote, showAuthModal: showUpvoteAuth, setShowAuthModal: setShowUpvoteAuth } =
    useUpvote(tool, initialUpvoted);
  const { saved, handleSave, isPending: isPendingSave, showAuthModal: showSaveAuth, setShowAuthModal: setShowSaveAuth } =
    useSave(tool, initialSaved);

  // Only show 1 badge max to keep it clean
  const visibleBadges = (tool.badges as BadgeType[]).filter(b => BADGE_CONFIG[b]).slice(0, 1);

  return (
    <>
      <AuthGateModal open={showUpvoteAuth} onClose={() => setShowUpvoteAuth(false)} action="upvote" />
      <AuthGateModal open={showSaveAuth} onClose={() => setShowSaveAuth(false)} action="save" />
      <Link
        href={`/tools/${tool.slug}`}
        className="group flex items-start gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl border bg-white transition-all no-underline relative overflow-hidden"
        style={{
          borderColor: "#E5E7EB",
          borderLeft: (tool.is_featured || tool.badges.includes('top_rated')) ? '3px solid #F59E0B' : undefined,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#D1D5DB";
          if (tool.is_featured || tool.badges.includes('top_rated')) {
            e.currentTarget.style.borderLeft = '3px solid #D97706';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#E5E7EB";
          if (tool.is_featured || tool.badges.includes('top_rated')) {
            e.currentTarget.style.borderLeft = '3px solid #F59E0B';
          }
        }}
      >
        {/* Logo — 64px desktop, 52px mobile, aligned with tool name */}
        <div className="hidden sm:block mt-0.5"><ToolLogo tool={tool} size={64} /></div>
        <div className="sm:hidden mt-0.5"><ToolLogo tool={tool} size={52} /></div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Row 1: Name + verified check */}
          <div className="flex items-center gap-1.5 mb-1">
            {rank !== undefined && (
              <span
                className="shrink-0 tabular-nums"
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#94A3B8",
                  marginRight: 2,
                }}
              >
                #{rank}
              </span>
            )}
            <span className="text-[17px] sm:text-lg font-extrabold text-gray-900 tracking-tight truncate">
              {tool.name}
            </span>
            {tool.is_verified && <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />}
          </div>

          {/* Row 2: Star rating directly under name */}
          <div className="mb-2">
            <StarRating rating={tool.average_rating} count={tool.review_count} size="sm" />
          </div>

          {/* Row 3: Description — 2 lines */}
          <p
            className="text-sm text-gray-500 leading-relaxed mb-2"
            style={{
              margin: 0,
              marginBottom: 8,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {tool.tagline}
          </p>

          {/* Row 4: Badges (max 1) + category + pricing */}
          <div className="flex items-center gap-2 flex-wrap">
            {visibleBadges.map((badge) => {
              const cfg = BADGE_CONFIG[badge];
              return (
                <span
                  key={badge}
                  className="shrink-0"
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 6,
                    background: cfg.bg,
                    color: cfg.color,
                    border: `1px solid ${cfg.border}`,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  {cfg.label}
                </span>
              );
            })}
            {!hideCategory && (
              <span
                className="shrink-0"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#6B7280",
                  background: "#F3F4F6",
                  padding: "3px 10px",
                  borderRadius: 6,
                }}
              >
                {tool.category}
              </span>
            )}
            <PricingPill model={tool.pricing_model} />
          </div>
        </div>

        {/* Right side: Upvote button — top-aligned, bigger */}
        <div className="hidden sm:flex flex-col items-center justify-start gap-2 shrink-0 mt-0.5">
          <UpvoteButton
            count={upvoteCount}
            active={upvoted}
            onClick={handleUpvote}
            pending={isPendingUpvote}
          />
          <button
            onClick={handleSave}
            disabled={isPendingSave}
            className="flex items-center justify-center transition-all"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "1.5px solid",
              background: saved ? "#DBEAFE" : "#FAFAFA",
              borderColor: saved ? "#93C5FD" : "#E5E7EB",
              color: saved ? "#1D4ED8" : "#9CA3AF",
              cursor: isPendingSave ? "wait" : "pointer",
              opacity: isPendingSave ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!saved) {
                e.currentTarget.style.borderColor = "#93C5FD";
                e.currentTarget.style.background = "#EFF6FF";
              }
            }}
            onMouseLeave={(e) => {
              if (!saved) {
                e.currentTarget.style.borderColor = "#E5E7EB";
                e.currentTarget.style.background = "#FAFAFA";
              }
            }}
          >
            <Bookmark style={{ width: 14, height: 14 }} fill={saved ? "#1D4ED8" : "none"} />
          </button>
        </div>

        {/* Mobile upvote — top right */}
        <div className="sm:hidden shrink-0 self-start mt-0.5">
          <UpvoteButton
            count={upvoteCount}
            active={upvoted}
            onClick={handleUpvote}
            pending={isPendingUpvote}
          />
        </div>
      </Link>
    </>
  );
}

// ─── Featured Card ──────────────────────────────────────────────────────────
// Polished card with screenshot hero — for homepage featured/trending sections

function FeaturedCard({ tool, rank, initialUpvoted = false }: ToolCardProps) {
  const { upvoted, upvoteCount, handleUpvote, isPending, showAuthModal, setShowAuthModal } =
    useUpvote(tool, initialUpvoted);

  const screenshotSrc = tool.screenshot_url || `https://api.microlink.io/?url=${encodeURIComponent(tool.website_url)}&screenshot=true&meta=false&embed=screenshot.url`;

  // Only show max 2 badges below image to avoid clutter
  const visibleBadges = (tool.badges as BadgeType[]).filter(b => BADGE_CONFIG[b]).slice(0, 2);

  return (
    <>
      <AuthGateModal open={showAuthModal} onClose={() => setShowAuthModal(false)} action="upvote" />
      <Link
        href={`/tools/${tool.slug}`}
        className="group block rounded-2xl bg-white overflow-hidden transition-all no-underline h-full"
        style={{
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(15,23,42,0.04), 0 1px 2px rgba(15,23,42,0.02)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#CBD5E1";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(15,23,42,0.08), 0 2px 6px rgba(15,23,42,0.04)";
          e.currentTarget.style.transform = "translateY(-3px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#E2E8F0";
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(15,23,42,0.04), 0 1px 2px rgba(15,23,42,0.02)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {/* ── TOP: Logo + Name + Rating + Rank Badge + Tagline ── */}
        <div className="p-4 sm:p-5 pb-3">
          <div className="flex items-start gap-3">
            <div className="shrink-0 rounded-xl overflow-hidden" style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.06)' }}>
              <ToolLogo tool={tool} size={44} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[15px] font-extrabold text-slate-900 truncate" style={{ letterSpacing: '-0.01em' }}>
                  {tool.name}
                </span>
                {tool.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
              </div>
              <div className="flex items-center justify-between">
                <StarRating rating={tool.average_rating} count={tool.review_count} size="xs" />
                {rank !== undefined && (
                  <div
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md shrink-0 ml-2"
                    style={{
                      background: '#FEF3C7',
                      border: '1px solid #FDE68A',
                    }}
                  >
                    <TrendingUp style={{ width: 10, height: 10, color: '#D97706' }} />
                    <span className="text-[11px] font-extrabold text-amber-700 tabular-nums">#{rank}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <p
            className="text-[13px] text-slate-500 leading-[1.5] mt-2.5"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {tool.tagline}
          </p>
        </div>

        {/* ── CENTER: Screenshot with rounded edges ── */}
        <div className="mx-3 sm:mx-4">
          <div
            className="relative w-full overflow-hidden rounded-xl"
            style={{
              aspectRatio: '16 / 9',
              background: '#F1F5F9',
            }}
          >
            <img
              src={screenshotSrc}
              alt={`${tool.name} preview`}
              className="absolute inset-0 w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              style={{
                objectFit: 'cover',
                objectPosition: 'top center',
                display: 'block',
              }}
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
                const parent = img.parentElement;
                if (parent && !parent.querySelector('.placeholder-fallback')) {
                  const placeholder = document.createElement('div');
                  placeholder.className = 'placeholder-fallback absolute inset-0 flex items-center justify-center';
                  placeholder.style.background = '#F1F5F9';
                  placeholder.innerHTML = `<div style="text-align:center"><div style="width:40px;height:40px;margin:0 auto 8px;border-radius:10px;background:#E2E8F0;display:flex;align-items:center;justify-content:center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></div><span style="font-size:11px;color:#94A3B8;font-weight:500">Preview unavailable</span></div>`;
                  parent.appendChild(placeholder);
                }
              }}
            />

          </div>
        </div>

        {/* ── BOTTOM: Voting + Badges + Tags ── */}
        <div className="p-4 sm:p-5 pt-3 flex flex-col gap-3">
          {/* Voting row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <UpvoteButton
                count={upvoteCount}
                active={upvoted}
                onClick={handleUpvote}
                pending={isPending}
                variant="compact"
              />
              <PricingPill model={tool.pricing_model} />
            </div>
            <span
              className="shrink-0 truncate"
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#64748B",
                background: "#F8FAFC",
                padding: "3px 8px",
                borderRadius: 6,
                border: '1px solid #F1F5F9',
                maxWidth: '50%',
              }}
            >
              {tool.category}
            </span>
          </div>

          {/* Badges row — below image, max 2 */}
          {visibleBadges.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {visibleBadges.map(b => (
                <span
                  key={b}
                  className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md"
                  style={{
                    color: BADGE_CONFIG[b].color,
                    background: BADGE_CONFIG[b].bg,
                    border: `1px solid ${BADGE_CONFIG[b].border}`,
                    letterSpacing: '0.04em',
                  }}
                >
                  {BADGE_CONFIG[b].label}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function ToolCard(props: ToolCardProps) {
  if (props.compact) return <CompactCard {...props} />;
  if (props.featured || props.showScreenshot) return <FeaturedCard {...props} />;
  return <StandardCard {...props} />;
}

export { StarRating, ToolLogo, PricingPill, UpvoteButton };
export type { ToolCardProps };
