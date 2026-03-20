"use client";

/*
 * Trending / Rising — LaudStack
 * Design: Clean light bg + amber accent system
 * Layout: PageHero → filter bar → badge pills → ranked list with sparklines + momentum badges
 * All Tailwind CSS — zero inline styles except dynamic color values
 */

import { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import LogoWithFallback from "@/components/LogoWithFallback";
import FeaturedStacksSidebar from "@/components/FeaturedStacksSidebar";
import { useToolsData } from "@/hooks/useToolsData";
import {
  TrendingUp,
  Search,
  MessageSquare,
  ChevronRight,
  ArrowUpRight,
  SlidersHorizontal,
  X,
} from "lucide-react";

/* ─── Constants ──────────────────────────────────────────────────────────────── */

const PERIOD_OPTIONS = [
  { value: "7d", label: "This Week" },
  { value: "30d", label: "This Month" },
  { value: "all", label: "All Time" },
];

const ALL_CATEGORIES = [
  "All Categories",
  "AI Analytics",
  "AI Audio",
  "AI Code",
  "AI Image",
  "AI Productivity",
  "AI Video",
  "AI Writing",
  "CRM",
  "Customer Support",
  "Design",
  "Developer Tools",
  "Marketing",
  "Project Management",
  "Sales",
];

const SORT_OPTIONS = [
  { value: "rank_change", label: "Rank Gain" },
  { value: "rating", label: "Top Rated" },
  { value: "upvotes", label: "Most Lauded" },
  { value: "reviews", label: "Most Reviewed" },
];

const BADGE_LABELS: Record<string, string> = {
  editors_pick: "Editor's Pick",
  top_rated: "Top Rated",
  featured: "Spotlight",
  verified: "Verified",
  new_launch: "New Launch",
  trending: "Rising",
  pro_founder: "Pro Founder",
  community_pick: "Community Pick",
  best_value: "Best Value",
  laudstack_pick: "LaudStack Pick",
};

const BADGE_DOT: Record<string, string> = {
  editors_pick: "#5178FF",
  top_rated: "#D97706",
  featured: "#3D64EB",
  verified: "#16A34A",
  new_launch: "#3D64EB",
  trending: "#92400E",
  pro_founder: "#F59E0B",
  community_pick: "#EF4444",
  best_value: "#16A34A",
  laudstack_pick: "#D97706",
};

/* ─── Sub-components ─────────────────────────────────────────────────────────── */

function Sparkline({ change, color }: { change: number; color: string }) {
  const heights = [0.22, 0.35, 0.28, 0.48, 0.6, 0.78, 1.0];
  return (
    <div className="flex items-end gap-0.5 h-6">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-1 rounded-sm"
          style={{
            height: `${h * 24}px`,
            background:
              i === 6
                ? color
                : `${color}${Math.round(30 + h * 130)
                    .toString(16)
                    .padStart(2, "0")}`,
          }}
        />
      ))}
    </div>
  );
}

function MomentumChip({ change }: { change: number }) {
  const tier =
    change >= 20
      ? { emoji: "🚀", label: "Rocket", cls: "text-amber-500 bg-amber-50 border-amber-200" }
      : change >= 12
        ? { emoji: "🔥", label: "Hot", cls: "text-amber-600 bg-orange-50 border-amber-300" }
        : { emoji: "📈", label: "Rising", cls: "text-green-600 bg-green-50 border-green-200" };
  return (
    <span
      className={`inline-flex items-center gap-[3px] text-xs font-bold px-[7px] py-[2px] rounded-full tracking-wide whitespace-nowrap border ${tier.cls}`}
    >
      <span className="text-[11px]">{tier.emoji}</span>
      {tier.label}
    </span>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────────────────── */

function ToolRowSkeleton() {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-0.5 bg-slate-100" />
      <div className="px-3 sm:px-[18px] py-3 sm:py-[14px] flex items-center gap-3 sm:gap-[14px]">
        <div className="shrink-0 w-9 text-center">
          <div className="h-5 w-6 bg-slate-200 rounded mx-auto" />
        </div>
        <div className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-[10px] bg-slate-100 border border-slate-200" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-28 bg-slate-200 rounded" />
            <div className="h-4 w-14 bg-slate-100 rounded-full" />
            <div className="h-4 w-16 bg-slate-100 rounded" />
          </div>
          <div className="h-3 w-48 bg-slate-100 rounded" />
          <div className="flex items-center gap-3 mt-1">
            <div className="h-3 w-8 bg-slate-100 rounded" />
            <div className="h-3 w-6 bg-slate-100 rounded" />
            <div className="h-3 w-10 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="hidden md:block shrink-0 w-[34px] h-6 bg-slate-100 rounded" />
        <div className="shrink-0 flex flex-col items-end gap-1">
          <div className="h-7 w-14 bg-slate-100 rounded-lg" />
          <div className="h-2 w-12 bg-slate-50 rounded" />
        </div>
        <div className="shrink-0 w-4 h-4 bg-slate-100 rounded" />
      </div>
    </div>
  );
}

/* ─── URL param helpers ──────────────────────────────────────────────────────── */

function parseTrendingParams(params: URLSearchParams) {
  return {
    period: params.get("period") || "7d",
    category: params.get("category") || "All Categories",
    sort: params.get("sort") || "rank_change",
    query: params.get("q") ? decodeURIComponent(params.get("q")!) : "",
    badge: params.get("badge") || "",
  };
}

/* ─── Main Component ─────────────────────────────────────────────────────────── */

export default function Trending() {
  const { tools: allTools, loading: toolsLoading } = useToolsData();
  const router = useRouter();
  const pathname = usePathname();

  const initial = useMemo(
    () => {
      if (typeof window === 'undefined') return parseTrendingParams(new URLSearchParams());
      return parseTrendingParams(new URLSearchParams(window.location.search));
    },
    [],
  );

  const [period, setPeriod] = useState(initial.period);
  const [category, setCategory] = useState(initial.category);
  const [sortBy, setSortBy] = useState(initial.sort);
  const [query, setQuery] = useState(initial.query);
  const [activeBadge, setActiveBadge] = useState(initial.badge);
  const [syncingFromUrl, setSyncingFromUrl] = useState(false);

  /* ── Outbound: write filter state → URL ──────────────────────────────────── */
  useEffect(() => {
    if (syncingFromUrl) return;
    const params = new URLSearchParams();
    if (period !== "7d") params.set("period", period);
    if (category !== "All Categories") params.set("category", category);
    if (sortBy !== "rank_change") params.set("sort", sortBy);
    if (query.trim()) params.set("q", query.trim());
    if (activeBadge) params.set("badge", activeBadge);
    const qs = params.toString();
    const newPath = qs ? `/trending?${qs}` : "/trending";
    if (typeof window !== 'undefined' && window.location.pathname + window.location.search !== newPath) {
      router.replace(newPath);
    }
  }, [period, category, sortBy, query, activeBadge, syncingFromUrl, router]);

  /* ── Inbound: read URL → filter state on external navigation ─────────────── */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (!params.toString()) return;
    const parsed = parseTrendingParams(params);
    setSyncingFromUrl(true);
    setPeriod(parsed.period);
    setCategory(parsed.category);
    setSortBy(parsed.sort);
    setQuery(parsed.query);
    setActiveBadge(parsed.badge);
    setTimeout(() => setSyncingFromUrl(false), 0);
  }, [pathname]);

  /* ── Filtered + sorted list ──────────────────────────────────────────────── */
  const trendingTools = useMemo(() => {
    // Period filter: "7d" and "30d" restrict to tools updated within that window.
    // "all" shows all tools regardless of update date.
    // If no tools have positive weekly_rank_change, fall back to showing all tools
    // sorted by rank_score to avoid an empty page on a fresh platform.
    const now = Date.now();
    const periodMs =
      period === "7d" ? 7 * 24 * 60 * 60 * 1000
      : period === "30d" ? 30 * 24 * 60 * 60 * 1000
      : null;

    // Check if any tools have positive rank changes
    const hasRankChanges = allTools.some((t) => (t.weekly_rank_change || 0) > 0);

    let tools = allTools.filter((t) => {
      // If we have real rank change data, only show tools with positive changes
      if (hasRankChanges && (t.weekly_rank_change || 0) <= 0) return false;
      // Period filter: restrict to tools updated within the time window
      if (periodMs !== null) {
        const updatedMs = t.updated_at ? new Date(t.updated_at).getTime() : (t.launched_at ? new Date(t.launched_at).getTime() : 0);
        if (now - updatedMs > periodMs) return false;
      }
      return true;
    });

    // If period filter is too restrictive and yields no results, fall back to showing all
    if (tools.length === 0 && periodMs !== null) {
      tools = allTools.filter((t) => {
        if (hasRankChanges && (t.weekly_rank_change || 0) <= 0) return false;
        return true;
      });
    }

    if (category !== "All Categories") {
      tools = tools.filter((t) => t.category === category);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      tools = tools.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.tagline.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q),
      );
    }
    if (activeBadge) {
      tools = tools.filter((t) =>
        (t.badges || []).includes(activeBadge as any),
      );
    }

    tools.sort((a, b) => {
      if (sortBy === "rank_change") {
        const changeA = a.weekly_rank_change || 0;
        const changeB = b.weekly_rank_change || 0;
        if (changeB !== changeA) return changeB - changeA;
        // Tie-break by rank score
        return (b.rank_score || 0) - (a.rank_score || 0);
      }
      if (sortBy === "rating") return b.average_rating - a.average_rating;
      if (sortBy === "upvotes") return b.upvote_count - a.upvote_count;
      if (sortBy === "reviews") return b.review_count - a.review_count;
      return 0;
    });

    return tools;
  }, [allTools, category, sortBy, query, activeBadge, period]);

  const getMomentumColor = (change: number) =>
    change >= 20 ? "#F59E0B" : change >= 12 ? "#D97706" : "#16A34A";

  /* ── Rank colors for top 3 ───────────────────────────────────────────────── */
  const rankColor = (i: number) =>
    i === 0
      ? "text-amber-500"
      : i === 1
        ? "text-slate-400"
        : i === 2
          ? "text-amber-600"
          : "text-slate-300";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <PageHero
        breadcrumbs={[{ label: 'Rising' }]}
        eyebrow="Rising This Week"
        title="What's Hot Right Now"
        subtitle="Fastest-climbing SaaS and AI stacks, ranked by weekly gain."
        accent="amber"
        layout="centered"
        size="md"
      />

      {/* ── Filter Bar ──────────────────────────────────────────────── */}
      <div
        className="sticky top-[56px] sm:top-[64px] z-20"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6">
          <div className="flex items-center gap-2.5 py-3 sm:py-3.5 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-2 bg-white rounded-xl flex-1 min-w-0 sm:min-w-[140px] max-w-[320px]" style={{ border: "1.5px solid #E2E8F0" }}>
              <span className="pl-3 flex items-center shrink-0"><Search className="w-3.5 h-3.5 text-slate-500" /></span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search rising stacks…"
                className="flex-1 border-none outline-none text-[13px] text-slate-900 bg-transparent font-medium placeholder:text-slate-500 py-[8px] pr-3 min-w-0"
                style={{ paddingLeft: "4px" }}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="pr-3 bg-transparent border-none cursor-pointer p-0 text-slate-500 flex hover:text-slate-600 transition-colors"
                >
                  <X className="w-[13px] h-[13px]" />
                </button>
              )}
            </div>

            {/* Period toggle */}
            <div className="flex rounded-xl overflow-hidden" style={{ border: "1.5px solid #E2E8F0" }}>
              {PERIOD_OPTIONS.map((p, idx) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className="px-3.5 py-[8px] text-[12px] font-bold border-none cursor-pointer transition-all"
                  style={{
                    background: period === p.value ? "#F59E0B" : "white",
                    color: period === p.value ? "#1E293B" : "#64748B",
                    borderRight: idx < PERIOD_OPTIONS.length - 1 ? "1px solid #E2E8F0" : "none",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Category select */}
            <div className="flex items-center bg-white rounded-xl overflow-hidden" style={{ border: "1.5px solid #E2E8F0" }}>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-[8px] text-[13px] font-semibold text-slate-700 bg-transparent border-none outline-none cursor-pointer"
              >
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Sort select */}
            <div className="flex items-center gap-1.5 bg-white rounded-xl overflow-hidden" style={{ border: "1.5px solid #E2E8F0" }}>
              <span className="pl-3 flex items-center"><SlidersHorizontal className="w-[13px] h-[13px] text-slate-500" /></span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pr-3 py-[8px] text-[13px] font-semibold text-slate-700 bg-transparent border-none outline-none cursor-pointer"
                style={{ paddingLeft: "4px" }}
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Badge dropdown */}
            <div className="flex items-center bg-slate-50 rounded-xl overflow-hidden" style={{ border: activeBadge ? "1.5px solid #7C3AED" : "1.5px solid #E2E8F0" }}>
              <select
                value={activeBadge}
                onChange={(e) => setActiveBadge(e.target.value)}
                className="px-3 py-[8px] text-[13px] font-semibold bg-transparent border-none outline-none cursor-pointer"
                style={{ color: activeBadge ? "#7C3AED" : "#374151" }}
              >
                <option value="">All Badges</option>
                {Object.entries(BADGE_LABELS).map(([key, label]) => {
                  const count = allTools.filter((t) => (t.badges || []).includes(key as any)).length;
                  if (count === 0) return null;
                  return <option key={key} value={key}>{label} ({count})</option>;
                })}
              </select>
            </div>

            {/* Result count */}
            <span className="text-[12px] text-slate-500 font-medium ml-auto whitespace-nowrap">
              {toolsLoading
                ? "Loading…"
                : <><span className="text-slate-900 font-extrabold">{trendingTools.length}</span> stack{trendingTools.length !== 1 ? "s" : ""}</>}
            </span>
          </div>
        </div>
      </div>

      {/* ── Content + Sidebar split ────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8">
      <div className="flex gap-8">
      <div className="flex-1 min-w-0 py-6 sm:py-8 pb-16">



        {/* ── Loading skeleton ────────────────────────────────────────── */}
        {toolsLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <ToolRowSkeleton key={i} />
            ))}
          </div>
        ) : trendingTools.length === 0 ? (
          /* ── Empty state ──────────────────────────────────────────── */
          <div className="text-center py-20">
            <div className="text-3xl sm:text-5xl mb-4">📈</div>
            <h3 className="text-xl font-black text-slate-900 mb-2 section-title">
              No results found
            </h3>
            <p className="text-sm text-slate-600">
              {query
                ? `No rising stacks match "${query}"`
                : 'Try selecting "All Categories"'}
            </p>
            {(query || category !== "All Categories") && (
              <button
                onClick={() => {
                  setQuery("");
                  setCategory("All Categories");
                }}
                className="mt-4 text-[13px] font-bold text-amber-500 bg-transparent border-none cursor-pointer underline underline-offset-2 hover:text-amber-600 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          /* ── Ranked list ──────────────────────────────────────────── */
          <div className="flex flex-col gap-2">
            {trendingTools.map((tool, i) => {
              const change = tool.weekly_rank_change ?? 0;
              const color = getMomentumColor(change);

              return (
                <button
                  key={tool.id}
                  onClick={() => router.push(`/tools/${tool.slug}`)}
                  className="group bg-slate-50 border border-slate-200 rounded-xl overflow-hidden cursor-pointer shadow-sm text-left w-full transition-all duration-200 hover:shadow-[0_6px_24px_rgba(245,158,11,0.12),0_2px_6px_rgba(0,0,0,0.05)] hover:border-amber-300 hover:-translate-y-px"
                >
                  {/* Top accent stripe */}
                  <div
                    className="h-0.5"
                    style={{
                      background: `linear-gradient(90deg, ${color} 0%, ${color}30 100%)`,
                    }}
                  />

                  <div className="px-3 sm:px-[18px] py-3 sm:py-[14px] flex items-center gap-3 sm:gap-[14px]">
                    {/* Rank number */}
                    <div className="shrink-0 w-9 text-center">
                      <span
                        className={`text-xl font-black leading-none tracking-tight tabular-nums ${rankColor(i)}`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Tool logo */}
                    <div className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-[10px] border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                      <LogoWithFallback
                        src={tool.logo_url}
                        alt={tool.name}
                        className="w-[34px] h-[34px] object-contain"
                        fallbackSize="text-lg"
                      />
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-[3px]">
                        <span className="text-base font-extrabold text-slate-900 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[60vw] sm:max-w-none">
                          {tool.name}
                        </span>
                        <MomentumChip change={change} />
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-[7px] py-[2px] rounded hidden sm:inline">
                          {tool.category}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 leading-snug line-clamp-1">
                        {tool.tagline}
                      </p>

                      {/* Stats row */}
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-[3px] text-[11px] font-bold text-slate-700">
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="#F59E0B"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          {tool.average_rating.toFixed(1)}
                        </span>
                        <span className="flex items-center gap-[3px] text-xs text-slate-500">
                          <MessageSquare className="w-[10px] h-[10px]" />
                          {tool.review_count}
                        </span>
                        <span className="hidden sm:flex items-center gap-[3px] text-xs text-slate-500">
                          <TrendingUp className="w-[10px] h-[10px]" />+
                          {change} this week
                        </span>
                        <span className="hidden sm:inline text-xs font-semibold text-slate-500 bg-slate-100 px-1.5 py-[2px] rounded">
                          {tool.pricing_model}
                        </span>
                      </div>
                    </div>

                    {/* Sparkline — hidden on mobile */}
                    <div className="hidden md:block shrink-0">
                      <Sparkline change={change} color={color} />
                    </div>

                    {/* Rank change badge */}
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <div
                        className="flex items-center gap-[3px] rounded-lg px-2.5 py-1 border"
                        style={{
                          background:
                            change >= 20
                              ? "#FFFBEB"
                              : change >= 12
                                ? "#FFFBEB"
                                : "#F0FDF4",
                          borderColor:
                            change >= 20
                              ? "#FDE68A"
                              : change >= 12
                                ? "#FBBF24"
                                : "#DCFCE7",
                        }}
                      >
                        <svg
                          width="9"
                          height="9"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={color}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="18 15 12 9 6 15" />
                        </svg>
                        <span
                          className="text-[13px] font-black tracking-tight tabular-nums"
                          style={{ color }}
                        >
                          +{change}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium text-right">
                        rank gain
                      </span>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-[15px] h-[15px] text-slate-300 shrink-0 group-hover:text-amber-500 transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        {!toolsLoading && trendingTools.length > 0 && (
          <div className="mt-10 px-4 sm:px-5 py-5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-4 flex-wrap shadow-sm">
            <div>
              <div className="text-[15px] font-extrabold text-slate-900 mb-1">
                Want your stack on this list?
              </div>
              <div className="text-[13px] text-slate-600">
                Launch your AI or SaaS stack and let the community decide where
                it ranks.
              </div>
            </div>
            <Link
              href="/launchpad"
              className="inline-flex items-center gap-[7px] px-5 py-2.5 rounded-[10px] bg-amber-500 text-slate-900 font-extrabold text-[13px] shadow-[0_4px_14px_rgba(245,158,11,0.25)] whitespace-nowrap transition-all hover:bg-amber-600 no-underline"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Launch Your Stack
            </Link>
          </div>
        )}
      </div>

      {/* Promoted stacks sidebar */}
      <aside className="hidden lg:block w-[280px] shrink-0 sticky top-[116px] self-start">
        <FeaturedStacksSidebar limit={5} title="Featured" variant="panel" />
      </aside>
      </div>
      </div>

      <Footer />
    </div>
  );
}
