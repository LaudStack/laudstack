"use client";

export const dynamic = "force-dynamic";

// Launches — LaudStack Launch Leaderboard
// Clean, professional, light theme. No gradients. Amber accent.

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Trophy,
  Flame,
  Star,
  ArrowUpRight,
  ChevronRight,
  Zap,
  Clock,
  Calendar,
  Medal,
  Crown,
  Award,
  Rocket,
  Timer,
  CheckCircle2,
  Eye,
  Bell,
  BellRing,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useToolsData } from "@/hooks/useToolsData";
import type { Tool } from "@/lib/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";

// ─── Types ───────────────────────────────────────────────────────────────────

type Period = "today" | "week" | "month" | "all_time";

interface UpcomingLaunchItem {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  category: string;
  pricing: string;
  launchDate: string;
  slug: string | null;
  source: "tool" | "submission";
}

interface RankedTool {
  rank: number;
  tool: Tool;
  rank_change: number;
  period_upvotes: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const RANK_CHANGES: Record<Period, number[]> = {
  today: [0, 2, -1, 5, -2, 1, 0, 3, -1, 4, -3, 2, 1, -2, 0, 3, -1, 2, 4, -2, 1, 0, -1, 3, 2, -4, 1, 0, -2, 3],
  week: [2, -1, 0, 3, 1, -2, 0, -1, 4, -3, 1, 0, 2, -1, 3, 0, -2, 1, 4, -1, 2, -3, 0, 1, -1, 2, 3, -2, 0, 1],
  month: [5, -3, 2, 0, -1, 4, -2, 1, 3, -5, 2, 0, -1, 3, 1, -2, 4, 0, -3, 2, 1, -1, 3, -2, 0, 4, -1, 2, -3, 1],
  all_time: [0, 0, 0, 1, -1, 0, 2, 0, -2, 1, 0, -1, 0, 1, 0, -1, 2, 0, -2, 1, 0, 0, 1, -1, 0, 2, -1, 0, 1, -2],
};

const PERIOD_MULTIPLIERS: Record<Period, number> = {
  today: 0.03,
  week: 0.2,
  month: 0.7,
  all_time: 1,
};

const PERIOD_LABELS: Record<Period, { label: string; icon: React.ReactNode; description: string }> = {
  today: { label: "Today", icon: <Flame className="w-3.5 h-3.5" />, description: "Hottest launches in the last 24 hours" },
  week: { label: "This Week", icon: <Zap className="w-3.5 h-3.5" />, description: "Top performers over the past 7 days" },
  month: { label: "This Month", icon: <Calendar className="w-3.5 h-3.5" />, description: "Best stacks launched this month" },
  all_time: { label: "All Time", icon: <Trophy className="w-3.5 h-3.5" />, description: "The greatest stacks ever listed on LaudStack" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMomentumScore(tool: Tool, multiplier: number): number {
  const base = tool.rank_score * multiplier;
  const weeklyBoost = (tool.weekly_rank_change ?? 0) * 0.8;
  const reviewBoost = tool.review_count * 2.5 * multiplier;
  return base + weeklyBoost + reviewBoost;
}

// ─── Countdown Hook ──────────────────────────────────────────────────────────

function useCountdown(targetDate: string) {
  const getTimeLeft = useCallback(() => {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      expired: false,
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [getTimeLeft]);

  return timeLeft;
}

// ─── Countdown Unit (compact) ────────────────────────────────────────────────

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-slate-800 font-bold text-sm tabular-nums leading-none bg-slate-100 border border-slate-200 rounded px-1.5 py-1 min-w-[28px] text-center">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-slate-400 text-[9px] font-medium uppercase tracking-wider">{label}</span>
    </div>
  );
}

// ─── Upcoming Launch Card ────────────────────────────────────────────────────

function UpcomingLaunchCard({ launch }: { launch: UpcomingLaunchItem }) {
  const countdown = useCountdown(launch.launchDate);
  const [notified, setNotified] = useState(false);
  const isLive = countdown.expired;

  const handleNotify = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNotified(true);
  };

  const card = (
    <div
      className={`relative bg-white border rounded-xl p-4 flex flex-col gap-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        isLive ? "border-emerald-300 ring-1 ring-emerald-200" : "border-slate-200 hover:border-amber-300"
      }`}
    >
      {/* Status badge */}
      {isLive ? (
        <div className="absolute -top-2.5 left-3 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          LIVE
        </div>
      ) : (
        <div className="absolute -top-2.5 left-3 flex items-center gap-1 bg-slate-100 text-slate-500 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-200">
          <Timer className="w-2.5 h-2.5" />
          UPCOMING
        </div>
      )}

      {/* Tool info row */}
      <div className="flex items-start gap-3 mt-1">
        <img
          src={launch.logo}
          alt={launch.name}
          className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-slate-100"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(launch.name)}&background=F59E0B&color=fff&size=40`;
          }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-slate-900 font-semibold text-sm leading-tight truncate">{launch.name}</h3>
          <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{launch.tagline}</p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">{launch.category}</span>
        <span className="text-[10px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">{launch.pricing}</span>
      </div>

      {/* Countdown or Live */}
      {isLive ? (
        <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Live on LaudStack
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <CountdownUnit value={countdown.days} label="d" />
          <span className="text-slate-300 text-xs font-medium mb-3">:</span>
          <CountdownUnit value={countdown.hours} label="h" />
          <span className="text-slate-300 text-xs font-medium mb-3">:</span>
          <CountdownUnit value={countdown.minutes} label="m" />
          <span className="text-slate-300 text-xs font-medium mb-3">:</span>
          <CountdownUnit value={countdown.seconds} label="s" />
        </div>
      )}

      {/* Action */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        {isLive ? (
          <span className="text-xs text-slate-400">Launched</span>
        ) : (
          <button
            onClick={handleNotify}
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md transition-all ${
              notified
                ? "bg-amber-50 text-amber-600 border border-amber-200"
                : "bg-amber-500 hover:bg-amber-400 text-white"
            }`}
          >
            {notified ? (
              <>
                <BellRing className="w-3 h-3" /> Notified
              </>
            ) : (
              <>
                <Bell className="w-3 h-3" /> Notify Me
              </>
            )}
          </button>
        )}
        {isLive && launch.slug && (
          <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
            View <ArrowUpRight className="w-3 h-3" />
          </span>
        )}
      </div>
    </div>
  );

  if (isLive && launch.slug) {
    return <Link href={`/tools/${launch.slug}`}>{card}</Link>;
  }
  return card;
}

// ─── Rank helpers ────────────────────────────────────────────────────────────

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="w-5 h-5 text-amber-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
  if (rank === 3) return <Award className="w-5 h-5 text-amber-700" />;
  return null;
}

function RankChange({ change }: { change: number }) {
  if (change === 0) return <span className="flex items-center text-slate-400 text-xs"><Minus className="w-3 h-3" /></span>;
  if (change > 0) return <span className="flex items-center gap-0.5 text-emerald-500 text-xs font-semibold"><TrendingUp className="w-3 h-3" />{change}</span>;
  return <span className="flex items-center gap-0.5 text-rose-400 text-xs font-semibold"><TrendingDown className="w-3 h-3" />{Math.abs(change)}</span>;
}

// ─── Top 3 Card ──────────────────────────────────────────────────────────────

function TopThreeCard({ entry, position }: { entry: RankedTool; position: 1 | 2 | 3 }) {
  const { tool, rank_change, period_upvotes } = entry;
  const isFirst = position === 1;
  const borderColors = { 1: "border-amber-300", 2: "border-slate-200", 3: "border-amber-200" };
  const rankColors = { 1: "text-amber-500", 2: "text-slate-400", 3: "text-amber-700" };

  return (
    <Link href={`/tools/${tool.slug}`}>
      <div className={`relative bg-white border ${borderColors[position]} rounded-xl p-5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group ${isFirst ? "ring-1 ring-amber-200" : ""}`}>
        {isFirst && (
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
            #1 This Period
          </div>
        )}
        <div className="flex items-start justify-between mb-3">
          <span className={`text-3xl font-black ${rankColors[position]}`}>#{position}</span>
          <div className="flex items-center gap-2">
            <RankChange change={rank_change} />
            {getRankIcon(position)}
          </div>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <img
            src={tool.logo_url}
            alt={tool.name}
            className="w-10 h-10 rounded-lg object-cover bg-slate-100 flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=F59E0B&color=fff&size=40`;
            }}
          />
          <div className="min-w-0">
            <h3 className="text-slate-900 font-semibold text-[15px] leading-tight group-hover:text-amber-600 transition-colors truncate">{tool.name}</h3>
            <p className="text-slate-500 text-xs mt-0.5 truncate">{tool.tagline}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1 text-amber-600 font-semibold text-xs">
            <TrendingUp className="w-3 h-3" />
            {period_upvotes.toLocaleString()} lauds
          </span>
          <span className="flex items-center gap-1 text-slate-500 text-xs">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {tool.average_rating.toFixed(1)}
          </span>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1">
          <span className="text-[10px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">{tool.category}</span>
          <span className="text-[10px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">{tool.pricing_model}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Leaderboard Row ─────────────────────────────────────────────────────────

function LeaderboardRow({ entry }: { entry: RankedTool }) {
  const { rank, tool, rank_change, period_upvotes } = entry;

  return (
    <Link href={`/tools/${tool.slug}`}>
      <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer group border-b border-slate-100 last:border-0">
        <div className="w-8 flex-shrink-0 flex items-center justify-center">
          {getRankIcon(rank) || <span className="text-slate-400 font-semibold text-sm">{rank}</span>}
        </div>
        <div className="w-7 flex-shrink-0">
          <RankChange change={rank_change} />
        </div>
        <img
          src={tool.logo_url}
          alt={tool.name}
          className="w-9 h-9 rounded-lg object-cover bg-slate-100 flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=F59E0B&color=fff&size=36`;
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-900 font-medium text-sm group-hover:text-amber-600 transition-colors truncate">{tool.name}</span>
            {tool.badges.includes("new_launch") && (
              <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-1.5 py-0.5 rounded-full flex-shrink-0">New</span>
            )}
            {tool.badges.includes("trending") && (
              <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-full flex-shrink-0">Rising</span>
            )}
          </div>
          <p className="text-slate-400 text-xs truncate">{tool.tagline}</p>
        </div>
        <span className="hidden md:block text-[11px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 flex-shrink-0">{tool.category}</span>
        <span className="hidden lg:block text-[11px] text-slate-400 flex-shrink-0 w-20 text-right">{tool.pricing_model}</span>
        <div className="hidden sm:flex items-center gap-1 flex-shrink-0 w-12 justify-end">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-slate-600 text-xs font-medium">{tool.average_rating.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 w-16 justify-end">
          <TrendingUp className="w-3 h-3 text-amber-500" />
          <span className="text-amber-600 font-semibold text-xs">{period_upvotes.toLocaleString()}</span>
        </div>
        <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-500 transition-colors flex-shrink-0" />
      </div>
    </Link>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <div className="max-w-[1300px] mx-auto px-4 w-full pt-28 pb-10 flex-1">
        {/* Hero skeleton */}
        <div className="mb-10">
          <div className="h-4 w-32 bg-slate-100 rounded mb-3 animate-pulse" />
          <div className="h-8 w-80 bg-slate-100 rounded mb-2 animate-pulse" />
          <div className="h-4 w-96 bg-slate-100 rounded animate-pulse" />
        </div>
        {/* Period tabs skeleton */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-24 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
        {/* Upcoming cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4 h-48 animate-pulse" />
          ))}
        </div>
        {/* Top 3 skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-5 h-44 animate-pulse" />
          ))}
        </div>
        {/* Rows skeleton */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-slate-100">
              <div className="w-8 h-4 bg-slate-100 rounded animate-pulse" />
              <div className="w-9 h-9 bg-slate-100 rounded-lg animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-40 bg-slate-100 rounded mb-1 animate-pulse" />
                <div className="h-3 w-56 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Launches() {
  const { tools: allTools, loading: toolsLoading } = useToolsData();
  const [period, setPeriod] = useState<Period>("week");
  const [upcomingLaunches, setUpcomingLaunches] = useState<UpcomingLaunchItem[]>([]);
  const [upcomingLoading, setUpcomingLoading] = useState(true);

  // Fetch upcoming launches from API
  useEffect(() => {
    fetch("/api/launches/upcoming")
      .then((r) => r.json())
      .then((data) => setUpcomingLaunches(data.upcoming ?? []))
      .catch(() => setUpcomingLaunches([]))
      .finally(() => setUpcomingLoading(false));
  }, []);

  // If no upcoming launches from DB, show recently launched tools as "just launched"
  const upcomingOrRecent = useMemo(() => {
    if (upcomingLaunches.length > 0) return upcomingLaunches;
    // Fallback: show the 4 most recently launched tools
    return allTools
      .sort((a, b) => new Date(b.launched_at).getTime() - new Date(a.launched_at).getTime())
      .slice(0, 4)
      .map((t) => ({
        id: t.id,
        name: t.name,
        tagline: t.tagline,
        logo: t.logo_url,
        category: t.category,
        pricing: t.pricing_model,
        launchDate: t.launched_at,
        slug: t.slug,
        source: "tool" as const,
      }));
  }, [upcomingLaunches, allTools]);

  const rankedTools = useMemo((): RankedTool[] => {
    const multiplier = PERIOD_MULTIPLIERS[period];
    const changes = RANK_CHANGES[period];
    const sorted = [...allTools].sort((a, b) => getMomentumScore(b, multiplier) - getMomentumScore(a, multiplier));
    return sorted.map((tool, i) => ({
      rank: i + 1,
      tool,
      rank_change: changes[i % changes.length] ?? 0,
      period_upvotes: Math.round(tool.upvote_count * multiplier * (0.8 + Math.random() * 0.4)),
    }));
  }, [allTools, period]);

  const topThree = rankedTools.slice(0, 3);
  const rest = rankedTools.slice(3);
  const periodInfo = PERIOD_LABELS[period];

  // Show skeleton while loading to prevent flash
  if (toolsLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <PageHero
        eyebrow="LaudStack Leaderboard"
        title="Top SaaS & AI Stacks"
        subtitle={`${periodInfo.description}. Rankings use momentum scoring — rewarding recent engagement over raw historical counts.`}
        accent="amber"
        layout="default"
        size="sm"
      >
        {/* Period tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => {
            const info = PERIOD_LABELS[p];
            const isActive = period === p;
            return (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  isActive
                    ? "bg-amber-500 border-amber-500 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-700"
                }`}
              >
                {info.icon}
                {info.label}
              </button>
            );
          })}
          <span className="ml-auto flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="w-3 h-3" />
            Updated hourly
          </span>
        </div>
      </PageHero>

      <div className="max-w-[1300px] mx-auto px-4 py-8 w-full flex-1">
        {/* ── Upcoming / Recently Launched ── */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-slate-900 font-bold text-lg flex items-center gap-2">
                <Rocket className="w-4 h-4 text-amber-500" />
                {upcomingLaunches.length > 0 ? "Upcoming Launches" : "Recently Launched"}
              </h2>
              <p className="text-slate-500 text-sm mt-0.5">
                {upcomingLaunches.length > 0
                  ? "Stacks launching soon — get notified when they go live"
                  : "The latest stacks to join LaudStack"}
              </p>
            </div>
            <Link href="/launchpad" className="flex items-center gap-1 text-amber-600 hover:text-amber-500 text-sm font-semibold transition-colors">
              Launch yours <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {upcomingLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4 h-44 animate-pulse" />
              ))}
            </div>
          ) : upcomingOrRecent.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {upcomingOrRecent.slice(0, 4).map((launch) => (
                <UpcomingLaunchCard key={launch.id} launch={launch} />
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
              <Rocket className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No upcoming launches yet.</p>
              <Link href="/launchpad" className="text-amber-600 text-sm font-semibold hover:underline mt-1 inline-block">
                Be the first to launch →
              </Link>
            </div>
          )}
        </div>

        {/* ── Top 3 Podium ── */}
        {topThree.length >= 3 && (
          <div className="mb-10">
            <h2 className="text-slate-900 font-bold text-lg mb-4 flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              Top 3 This Period
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topThree.map((entry) => (
                <TopThreeCard key={entry.tool.id} entry={entry} position={entry.rank as 1 | 2 | 3} />
              ))}
            </div>
          </div>
        )}

        {/* ── Full Leaderboard ── */}
        {rest.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-4 px-5 py-2.5 border-b border-slate-200 bg-slate-50">
              <div className="w-8 flex-shrink-0 text-slate-400 text-[11px] font-medium">#</div>
              <div className="w-7 flex-shrink-0 text-slate-400 text-[11px] font-medium">±</div>
              <div className="w-9 flex-shrink-0" />
              <div className="flex-1 text-slate-400 text-[11px] font-medium">Stack</div>
              <div className="hidden md:block text-slate-400 text-[11px] font-medium w-24">Category</div>
              <div className="hidden lg:block text-slate-400 text-[11px] font-medium w-20 text-right">Pricing</div>
              <div className="hidden sm:block text-slate-400 text-[11px] font-medium w-12 text-right">Rating</div>
              <div className="text-slate-400 text-[11px] font-medium w-16 text-right">Lauds</div>
              <div className="w-3.5 flex-shrink-0" />
            </div>
            {rest.map((entry) => (
              <LeaderboardRow key={entry.tool.id} entry={entry} />
            ))}
          </div>
        )}

        {/* ── Bottom CTA ── */}
        <div className="mt-10 bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
          <h3 className="text-slate-900 font-bold text-lg mb-2">Is your stack missing from the leaderboard?</h3>
          <p className="text-slate-500 text-[15px] mb-5 max-w-lg mx-auto leading-relaxed">
            Launch your SaaS or AI stack on LaudStack and start collecting reviews from real users. Schedule a launch date to build anticipation.
          </p>
          <Link href="/launchpad">
            <button className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 py-2.5 rounded-lg transition-colors text-sm active:scale-[0.98]">
              Launch Your Stack
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
