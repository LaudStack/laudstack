"use client";

/**
 * LaudStack — Community Voting
 *
 * Production-ready voting page where the community lauds their favorite
 * SaaS and AI stacks. Real backend wiring with auth-gated voting,
 * optimistic updates, loading skeletons, and full mobile responsiveness.
 */

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import LogoWithFallback from "@/components/LogoWithFallback";
import AuthGateModal from "@/components/AuthGateModal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToolsData, invalidateToolsCache } from "@/hooks/useToolsData";
import { useAuth } from "@/hooks/useAuth";
import { useLaudedTools } from "@/hooks/useLaudedTools";
import { getPlatformStats } from "@/app/actions/public";
import { CATEGORY_META } from "@/lib/categories";
import type { Tool } from "@/lib/types";
import {

  Users,
  Star,
  ShieldCheck,
  TrendingUp,
  Filter,
  Award,
  Flame,
  ArrowRight,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Search,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

/* ─── Time Period Tabs ──────────────────────────────────────────────── */
const TIME_PERIODS = [
  { key: "all_time", label: "All Time" },
  { key: "this_month", label: "This Month" },
  { key: "this_week", label: "This Week" },
] as const;
type TimePeriod = (typeof TIME_PERIODS)[number]["key"];

/* ─── Pricing Badge Styles ──────────────────────────────────────────── */
function pricingClasses(model: string): string {
  if (model === "Free")
    return "bg-green-50 text-green-700 border-green-200";
  if (model === "Freemium")
    return "bg-blue-50 text-blue-700 border-blue-200";
  if (model === "Open Source")
    return "bg-violet-50 text-violet-700 border-violet-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
}

/* ─── Card Skeleton ─────────────────────────────────────────────────── */
function CardSkeleton() {
  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 flex items-center gap-3 sm:gap-4 animate-pulse">
      <div className="w-9 h-9 rounded-[10px] bg-slate-200 shrink-0" />
      <div className="w-12 h-14 rounded-xl bg-slate-100 shrink-0" />
      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-100 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="w-28 sm:w-36 h-4 bg-slate-200 rounded mb-2" />
        <div className="w-44 sm:w-56 h-3 bg-slate-100 rounded mb-2" />
        <div className="flex gap-3">
          <div className="w-12 h-3 bg-slate-100 rounded" />
          <div className="w-16 h-3 bg-slate-100 rounded" />
        </div>
      </div>
      <div className="hidden sm:block w-16 h-8 bg-slate-100 rounded-lg shrink-0" />
    </div>
  );
}

/* ─── Voting Card ───────────────────────────────────────────────────── */
function VotingCard({
  tool,
  rank,
  voted,
  laudCountOffset,
  onVote,
}: {
  tool: Tool;
  rank: number;
  voted: boolean;
  laudCountOffset: number;
  onVote: (id: string) => void;
}) {
  const router = useRouter();
  const isTop3 = rank <= 3;
  const displayCount = tool.upvote_count + laudCountOffset;

  const rankBadge = isTop3
    ? ["🥇", "🥈", "🥉"][rank - 1]
    : String(rank);

  const rankBorderClass = isTop3
    ? "border-amber-200"
    : "border-slate-200";

  const rankBgClass = isTop3
    ? rank === 1
      ? "bg-amber-100 text-amber-700"
      : rank === 2
        ? "bg-slate-100 text-slate-500"
        : "bg-amber-50 text-amber-700"
    : "bg-slate-50 text-slate-400";

  return (
    <div
      className={`group bg-slate-50 rounded-2xl border transition-all duration-200 p-4 sm:p-5 flex items-center gap-3 sm:gap-4 cursor-pointer
        ${isTop3 ? "border-amber-200 shadow-[0_2px_12px_rgba(245,158,11,0.06)] hover:shadow-[0_8px_28px_rgba(245,158,11,0.12)]" : "border-slate-200 shadow-sm hover:shadow-md"}
        hover:-translate-y-0.5 hover:border-amber-200`}
      onClick={() => router.push(`/tools/${tool.slug}`)}
    >
      {/* Rank */}
      <div
        className={`w-9 h-9 rounded-[10px] shrink-0 flex items-center justify-center text-sm font-black border-[1.5px] ${rankBorderClass} ${rankBgClass}`}
      >
        {rankBadge}
      </div>

      {/* Laud Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onVote(tool.id);
        }}
        className="flex flex-col items-center justify-center shrink-0 transition-all duration-150 cursor-pointer"
        style={{
          padding: '10px 16px',
          borderRadius: 12,
          border: '1.5px solid',
          background: voted ? '#FEF3C7' : '#F8FAFC',
          borderColor: voted ? '#FBBF24' : '#E2E8F0',
          color: voted ? '#B45309' : '#64748B',
          minWidth: 56,
          gap: 2,
        }}
        onMouseEnter={(e) => {
          if (!voted) {
            e.currentTarget.style.borderColor = '#FBBF24';
            e.currentTarget.style.background = '#FFFBEB';
          }
        }}
        onMouseLeave={(e) => {
          if (!voted) {
            e.currentTarget.style.borderColor = '#E2E8F0';
            e.currentTarget.style.background = '#F8FAFC';
          }
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
          <path fill="#FFFFFF" stroke="currentColor" strokeWidth="1.5" d="M6.579 3.467c.71-1.067 2.132-1.067 2.842 0L12.975 8.8c.878 1.318.043 3.2-1.422 3.2H4.447c-1.464 0-2.3-1.882-1.422-3.2z" />
        </svg>
        <span className="tabular-nums" style={{ fontSize: 14, fontWeight: 800 }}>
          {displayCount.toLocaleString()}
        </span>
      </button>

      {/* Logo */}
      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
        <LogoWithFallback
          src={tool.logo_url}
          alt={tool.name}
          className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
          fallbackSize="text-lg"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap mb-1">
          <span className="text-[15px] font-extrabold text-slate-900 tracking-tight truncate">
            {tool.name}
          </span>
          {tool.is_verified && (
            <ShieldCheck className="w-3.5 h-3.5 text-green-500 shrink-0" />
          )}
          {tool.is_featured && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-50 text-amber-700 border border-amber-200">
              <Sparkles className="w-2.5 h-2.5" />
              Featured
            </span>
          )}
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded border leading-none ${pricingClasses(tool.pricing_model)}`}
          >
            {tool.pricing_model}
          </span>
        </div>
        <p className="text-[13px] text-slate-600 leading-snug line-clamp-1 mb-1.5">
          {tool.tagline}
        </p>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span className="font-bold text-slate-900">
              {tool.average_rating.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <MessageSquare className="w-3 h-3" />
            <span>{tool.review_count}</span>
          </div>
          <span className="text-slate-300 hidden sm:inline">·</span>
          <span className="text-slate-500 hidden sm:inline truncate">
            {tool.category}
          </span>
        </div>
      </div>

      {/* View Button — desktop only */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/tools/${tool.slug}`);
        }}
        className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0 cursor-pointer"
      >
        <ExternalLink className="w-3 h-3" /> View
      </button>
    </div>
  );
}

/* ─── Stats Card ────────────────────────────────────────────────────── */
function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
}) {
  return (
    <div className="text-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 min-w-[90px]">
      <Icon className="w-[18px] h-[18px] text-amber-500 mx-auto mb-1.5" />
      <div className="text-xl font-black text-slate-900 tracking-tight">
        {value}
      </div>
      <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
        {label}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export default function CommunityVotingPage() {
  const router = useRouter();
  const { tools: allTools, loading: toolsLoading } = useToolsData();
  const { isAuthenticated } = useAuth();

  // Use the global useLaudedTools hook — syncs with all other pages
  const { isLauded, toggle: toggleLaudGlobal } = useLaudedTools();

  const [timePeriod, setTimePeriod] = useState<TimePeriod>("all_time");
  const [category, setCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);

  // Auth gate
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Local count overrides (optimistic delta on top of base tool counts)
  const [laudCountOverrides, setLaudCountOverrides] = useState<Record<string, number>>({});

  // Platform stats
  const [stats, setStats] = useState<{
    totalTools: number;
    totalUsers: number;
  } | null>(null);

  // Fetch platform stats
  useEffect(() => {
    getPlatformStats()
      .then((s) => setStats({ totalTools: s.totalTools, totalUsers: s.totalUsers }))
      .catch(() => {});
  }, []);

  // Handle vote with optimistic update via global hook
  const handleVote = useCallback(
    async (id: string) => {
      if (!isAuthenticated) {
        setShowAuthModal(true);
        return;
      }

      const wasVoted = isLauded(id);

      // Optimistic count update
      setLaudCountOverrides((prev) => ({
        ...prev,
        [id]: (prev[id] ?? 0) + (wasVoted ? -1 : 1),
      }));

      if (!wasVoted) {
        toast.success("Lauded! Thanks for your vote.");
      }

      // Server call via global hook (handles DB + global state)
      try {
        const result = await toggleLaudGlobal(id);

        if (result.requiresAuth) {
          setLaudCountOverrides((prev) => ({
            ...prev,
            [id]: (prev[id] ?? 0) + (wasVoted ? 1 : -1),
          }));
          setShowAuthModal(true);
          return;
        }

        if (result.error) {
          // Rollback
          setLaudCountOverrides((prev) => ({
            ...prev,
            [id]: (prev[id] ?? 0) + (wasVoted ? 1 : -1),
          }));
          toast.error(result.error || "Failed to update vote");
        } else if (result.newCount !== undefined) {
          // Reconcile with server count
          const baseTool = allTools.find((t) => t.id === id);
          const baseCount = baseTool?.upvote_count ?? 0;
          setLaudCountOverrides((prev) => ({
            ...prev,
            [id]: result.newCount! - baseCount,
          }));
          invalidateToolsCache();
        }
      } catch {
        // Rollback on network error
        setLaudCountOverrides((prev) => ({
          ...prev,
          [id]: (prev[id] ?? 0) + (wasVoted ? 1 : -1),
        }));
        toast.error("Something went wrong. Please try again.");
      }
    },
    [isAuthenticated, isLauded, toggleLaudGlobal, allTools]
  );

  // Filter and sort tools
  const filteredTools = useMemo(() => {
    let tools = [...allTools];

    if (category !== "All") {
      tools = tools.filter((t) => t.category === category);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      tools = tools.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.tagline.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.tags ?? []).some(tag => tag.toLowerCase().includes(q))
      );
    }

    // Sort by upvote_count (real laud data)
    tools.sort((a, b) => b.upvote_count - a.upvote_count);

    return tools;
  }, [allTools, category, searchQuery]);

  const visibleTools = filteredTools.slice(0, visibleCount);
  const totalVotes = allTools.reduce((s, t) => s + t.upvote_count, 0);
  const categories = CATEGORY_META.filter((c) => c.name !== "All");

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AuthGateModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        action="laud"
      />
      <Navbar />
      <div className="h-[60px] lg:h-[64px] shrink-0" />
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative border-b border-slate-200 py-8 sm:py-12 overflow-hidden" style={{ background: '#F8FAFC' }}>
        <div aria-hidden className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #CBD5E1 0.8px, transparent 0.8px)', backgroundSize: '24px 24px', opacity: 0.35, pointerEvents: 'none' }} />
        <div aria-hidden className="absolute" style={{ top: '-20%', right: '-5%', width: '500px', height: '400px', background: 'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div aria-hidden className="absolute left-0 top-0 bottom-0" style={{ width: '3px', background: '#D97706' }} />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-[1]">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 mb-4">
                <Award className="w-3 h-3 text-amber-600" />
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">
                  Community Voting
                </span>
              </div>
              <h1 className="font-[Inter,sans-serif] text-[clamp(24px,3vw,30px)] font-black text-slate-900 tracking-tight leading-[1.1] mb-3">
                Vote for the Best Stacks
              </h1>
              <p className="text-base text-slate-600 max-w-[520px] leading-relaxed">
                Laud your favorite SaaS and AI stacks. Ranked by real votes.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Filter Bar ──────────────────────────────────────────── */}
      <div
        className="sticky top-[56px] sm:top-[64px] z-20"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5 py-3 sm:py-3.5 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl flex-1 min-w-0 sm:min-w-[160px] max-w-[320px]" style={{ border: "1.5px solid #E2E8F0" }}>
              <span className="pl-3 flex items-center shrink-0"><Search className="w-3.5 h-3.5 text-slate-500" /></span>
              <input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(20);
                }}
                placeholder="Search stacks..."
                className="flex-1 border-none outline-none text-[13px] text-slate-900 bg-transparent font-medium placeholder:text-slate-500 py-[8px] pr-3 min-w-0"
                style={{ paddingLeft: "4px" }}
              />
            </div>

            {/* Time period toggle */}
            <div className="flex rounded-xl overflow-hidden" style={{ border: "1.5px solid #E2E8F0" }}>
              {TIME_PERIODS.map(({ key, label }, idx) => (
                <button
                  key={key}
                  onClick={() => setTimePeriod(key)}
                  className="px-3.5 py-[8px] text-[12px] font-bold border-none cursor-pointer transition-all"
                  style={{
                    background: timePeriod === key ? "#F59E0B" : "white",
                    color: timePeriod === key ? "#1E293B" : "#64748B",
                    borderRight: idx < TIME_PERIODS.length - 1 ? "1px solid #E2E8F0" : "none",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Category */}
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl overflow-hidden ml-auto" style={{ border: "1.5px solid #E2E8F0" }}>
              <span className="pl-3 flex items-center shrink-0"><Filter className="w-3.5 h-3.5 text-slate-500" /></span>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setVisibleCount(20);
                }}
                className="pr-3 py-[8px] text-[13px] font-semibold text-slate-700 bg-transparent border-none outline-none cursor-pointer"
                style={{ paddingLeft: "4px" }}
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────── */}
      <main className="flex-1 bg-white py-8 sm:py-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results header */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-[13px] text-slate-600 font-semibold">
              {toolsLoading ? (
                "Loading..."
              ) : (
                <>
                  Showing{" "}
                  <strong className="text-slate-900">
                    {Math.min(visibleCount, filteredTools.length)}
                  </strong>{" "}
                  of{" "}
                  <strong className="text-slate-900">
                    {filteredTools.length}
                  </strong>{" "}
                  stacks
                </>
              )}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              Sorted by community lauds
            </div>
          </div>

          {/* Loading state */}
          {toolsLoading ? (
            <div className="flex flex-col gap-2.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : filteredTools.length === 0 ? (
            /* Empty state */
            <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-200">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-black text-slate-700 mb-1.5">
                No stacks found
              </h3>
              <p className="text-[13px] text-slate-600 mb-4">
                Try a different category or search term.
              </p>
              <button
                onClick={() => {
                  setCategory("All");
                  setSearchQuery("");
                }}
                className="text-[13px] font-bold text-amber-600 hover:text-amber-700 transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            /* Tool list */
            <div className="flex flex-col gap-2.5">
              {visibleTools.map((tool, i) => (
                <VotingCard
                  key={tool.id}
                  tool={tool}
                  rank={i + 1}
                  voted={isLauded(tool.id)}
                  laudCountOffset={laudCountOverrides[tool.id] ?? 0}
                  onVote={handleVote}
                />
              ))}
            </div>
          )}

          {/* Load more */}
          {!toolsLoading && visibleCount < filteredTools.length && (
            <div className="text-center mt-8">
              <button
                onClick={() => setVisibleCount((v) => v + 20)}
                className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl border-[1.5px] border-slate-200 bg-slate-50 text-[13px] font-bold text-slate-700 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50/50 transition-all cursor-pointer shadow-sm"
              >
                Load more ({filteredTools.length - visibleCount} remaining)
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Award className="w-9 h-9 text-amber-500 mx-auto mb-4" />
          <h2 className="font-[Inter,sans-serif] text-2xl font-black text-slate-900 tracking-tight mb-2.5">
            Have a stack the community should know about?
          </h2>
          <p className="text-[15px] text-slate-600 mb-6 leading-relaxed">
            Launch it via LaunchPad and let the community vote it up.
          </p>
          <a
            href="/launchpad"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-[0_4px_14px_rgba(245,158,11,0.3)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.45)]"
          >
            Launch via LaunchPad
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
