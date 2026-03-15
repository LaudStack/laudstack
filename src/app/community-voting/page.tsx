"use client";
export const dynamic = "force-dynamic";

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
import { toggleLaud, getUserLaudedToolIds } from "@/app/actions/laud";
import { getPlatformStats } from "@/app/actions/public";
import { CATEGORY_META } from "@/lib/categories";
import type { Tool } from "@/lib/types";
import {
  ChevronUp,
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
    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 flex items-center gap-3 sm:gap-4 animate-pulse">
      <div className="w-9 h-9 rounded-[10px] bg-gray-200 shrink-0" />
      <div className="w-12 h-14 rounded-xl bg-gray-100 shrink-0" />
      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gray-100 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="w-28 sm:w-36 h-4 bg-gray-200 rounded mb-2" />
        <div className="w-44 sm:w-56 h-3 bg-gray-100 rounded mb-2" />
        <div className="flex gap-3">
          <div className="w-12 h-3 bg-gray-100 rounded" />
          <div className="w-16 h-3 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="hidden sm:block w-16 h-8 bg-gray-100 rounded-lg shrink-0" />
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
    : "border-gray-200";

  const rankBgClass = isTop3
    ? rank === 1
      ? "bg-amber-100 text-amber-700"
      : rank === 2
        ? "bg-slate-100 text-slate-500"
        : "bg-amber-50 text-amber-700"
    : "bg-slate-50 text-slate-400";

  return (
    <div
      className={`group bg-white rounded-2xl border transition-all duration-200 p-4 sm:p-5 flex items-center gap-3 sm:gap-4 cursor-pointer
        ${isTop3 ? "border-amber-200 shadow-[0_2px_12px_rgba(245,158,11,0.06)] hover:shadow-[0_8px_28px_rgba(245,158,11,0.12)]" : "border-gray-200 shadow-sm hover:shadow-md"}
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
        className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl shrink-0 min-w-[52px] border-[1.5px] transition-all duration-150 cursor-pointer
          ${
            voted
              ? "bg-amber-50 border-amber-400 shadow-[0_0_0_1px_rgba(245,158,11,0.1)]"
              : "bg-slate-50 border-gray-200 hover:border-amber-300 hover:bg-amber-50/50"
          }`}
      >
        <ChevronUp
          className={`w-4 h-4 transition-colors ${voted ? "text-amber-600" : "text-slate-400 group-hover:text-amber-500"}`}
        />
        <span
          className={`text-[13px] font-extrabold transition-colors ${voted ? "text-amber-600" : "text-slate-600"}`}
        >
          {displayCount.toLocaleString()}
        </span>
      </button>

      {/* Logo */}
      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl border border-gray-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
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
          <span className="text-[15px] font-extrabold text-gray-900 tracking-tight truncate">
            {tool.name}
          </span>
          {tool.is_verified && (
            <ShieldCheck className="w-3.5 h-3.5 text-green-500 shrink-0" />
          )}
          {tool.is_featured && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-50 text-amber-700 border border-amber-200">
              <Sparkles className="w-2.5 h-2.5" />
              Featured
            </span>
          )}
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded border leading-none ${pricingClasses(tool.pricing_model)}`}
          >
            {tool.pricing_model}
          </span>
        </div>
        <p className="text-[13px] text-gray-500 leading-snug line-clamp-1 mb-1.5">
          {tool.tagline}
        </p>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span className="font-bold text-gray-900">
              {tool.average_rating.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <MessageSquare className="w-3 h-3" />
            <span>{tool.review_count}</span>
          </div>
          <span className="text-gray-300 hidden sm:inline">·</span>
          <span className="text-gray-400 hidden sm:inline truncate">
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
        className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-slate-500 bg-slate-50 border border-gray-200 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0 cursor-pointer"
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
    <div className="text-center bg-slate-50 border border-gray-200 rounded-xl px-4 py-3.5 min-w-[90px]">
      <Icon className="w-[18px] h-[18px] text-amber-500 mx-auto mb-1.5" />
      <div className="text-xl font-black text-gray-900 tracking-tight">
        {value}
      </div>
      <div className="text-[11px] text-gray-400 font-semibold mt-0.5">
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

  const [timePeriod, setTimePeriod] = useState<TimePeriod>("all_time");
  const [category, setCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);

  // Auth gate
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Laud state
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [laudCounts, setLaudCounts] = useState<Record<string, number>>({});

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

  // Initialize voted state from DB when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setVotedIds(new Set());
      return;
    }
    getUserLaudedToolIds()
      .then((ids) => setVotedIds(new Set(ids.map(String))))
      .catch(() => {});
  }, [isAuthenticated]);

  // Handle vote with optimistic update
  const handleVote = useCallback(
    async (id: string) => {
      if (!isAuthenticated) {
        setShowAuthModal(true);
        return;
      }

      const wasVoted = votedIds.has(id);

      // Optimistic update
      setVotedIds((prev) => {
        const next = new Set(Array.from(prev));
        if (wasVoted) next.delete(id);
        else next.add(id);
        return next;
      });
      setLaudCounts((prev) => ({
        ...prev,
        [id]: (prev[id] ?? 0) + (wasVoted ? -1 : 1),
      }));

      if (!wasVoted) {
        toast.success("Lauded! Thanks for your vote.");
      }

      // Server call
      const result = await toggleLaud(parseInt(id, 10));

      if (!result.success) {
        // Rollback
        setVotedIds((prev) => {
          const next = new Set(Array.from(prev));
          if (wasVoted) next.add(id);
          else next.delete(id);
          return next;
        });
        setLaudCounts((prev) => ({
          ...prev,
          [id]: (prev[id] ?? 0) + (wasVoted ? 1 : -1),
        }));
        toast.error(result.error || "Failed to update vote");
      } else if (result.newCount !== undefined) {
        // Reconcile with server count
        const baseTool = allTools.find((t) => t.id === id);
        const baseCount = baseTool?.upvote_count ?? 0;
        setLaudCounts((prev) => ({
          ...prev,
          [id]: result.newCount! - baseCount,
        }));
        invalidateToolsCache();
      }
    },
    [isAuthenticated, votedIds, allTools]
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
          t.category.toLowerCase().includes(q)
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
      <div className="h-[72px] shrink-0" />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-200 py-8 sm:py-12">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 mb-4">
                <Award className="w-3 h-3 text-amber-600" />
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">
                  Community Voting
                </span>
              </div>
              <h1 className="font-[Inter,sans-serif] text-[clamp(28px,3.5vw,42px)] font-black text-gray-900 tracking-tight leading-[1.1] mb-3">
                Vote for the Best Stacks
              </h1>
              <p className="text-base text-gray-500 max-w-[520px] leading-relaxed">
                The community decides. Laud the SaaS and AI stacks you love and
                help others discover the best software — ranked purely by real
                votes.
              </p>
            </div>
            {/* Stats */}
            <div className="flex gap-3 sm:gap-4 flex-wrap">
              <StatCard
                icon={Users}
                value={
                  stats
                    ? stats.totalUsers.toLocaleString()
                    : "—"
                }
                label="Members"
              />
              <StatCard
                icon={ChevronUp}
                value={totalVotes.toLocaleString()}
                label="Total Votes"
              />
              <StatCard
                icon={BarChart3}
                value={
                  stats
                    ? `${stats.totalTools}+`
                    : `${allTools.length}+`
                }
                label="Tools Ranked"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Filters ──────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 py-4 sticky top-[72px] z-10">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[160px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-gray-400 pointer-events-none" />
              <input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(20);
                }}
                placeholder="Search stacks..."
                className="w-full pl-9 pr-3 h-[38px] text-[13px] text-gray-900 bg-slate-50 border-[1.5px] border-gray-200 rounded-lg outline-none transition-colors focus:border-amber-400 focus:ring-1 focus:ring-amber-100 placeholder:text-gray-400"
              />
            </div>

            {/* Time period */}
            <div className="flex gap-1.5">
              {TIME_PERIODS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTimePeriod(key)}
                  className={`px-3.5 py-[7px] rounded-lg text-xs font-bold border-[1.5px] transition-all cursor-pointer
                    ${
                      timePeriod === key
                        ? "border-amber-400 bg-amber-50 text-amber-700"
                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Category */}
            <div className="flex items-center gap-2 ml-auto">
              <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setVisibleCount(20);
                }}
                className="px-3 py-[7px] rounded-lg text-xs font-bold text-gray-600 bg-slate-50 border border-gray-200 cursor-pointer outline-none focus:border-amber-400 transition-colors"
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
      </section>

      {/* ── Main Content ─────────────────────────────────────── */}
      <main className="flex-1 bg-[#FAFBFC] py-8 sm:py-10">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10">
          {/* Results header */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-[13px] text-gray-500 font-semibold">
              {toolsLoading ? (
                "Loading..."
              ) : (
                <>
                  Showing{" "}
                  <strong className="text-gray-900">
                    {Math.min(visibleCount, filteredTools.length)}
                  </strong>{" "}
                  of{" "}
                  <strong className="text-gray-900">
                    {filteredTools.length}
                  </strong>{" "}
                  stacks
                </>
              )}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
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
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-extrabold text-gray-700 mb-1.5">
                No stacks found
              </h3>
              <p className="text-[13px] text-gray-500 mb-4">
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
                  voted={votedIds.has(tool.id)}
                  laudCountOffset={laudCounts[tool.id] ?? 0}
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
                className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl border-[1.5px] border-gray-200 bg-white text-[13px] font-bold text-gray-700 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50/50 transition-all cursor-pointer shadow-sm"
              >
                Load more ({filteredTools.length - visibleCount} remaining)
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <Award className="w-9 h-9 text-amber-500 mx-auto mb-4" />
          <h2 className="font-[Inter,sans-serif] text-2xl font-extrabold text-gray-900 tracking-tight mb-2.5">
            Have a stack the community should know about?
          </h2>
          <p className="text-[15px] text-gray-500 mb-6 leading-relaxed">
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
