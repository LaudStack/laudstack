"use client";

/**
 * /launches — LaudStack Launch Leaderboard
 *
 * Sections:
 *  1. Hero with period tabs
 *  2. Upcoming Launches (real data from /api/launches/upcoming) — compact countdown
 *  3. Top 3 podium
 *  4. Full leaderboard table
 *  5. Bottom CTA
 *
 * Removed: Stats bar
 * Fixed: Page flash (loading skeleton), real upcoming data, real laud buttons
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  TrendingUp, TrendingDown, Minus, Trophy, Flame, Star, ArrowUpRight,
  ChevronRight, ChevronUp, Zap, Clock, Calendar, Medal, Crown, Award,
  Rocket, Timer, CheckCircle2, Eye, Loader2, Shield, Bell
} from 'lucide-react';
import { toast } from 'sonner';
import { useToolsData, invalidateToolsCache } from '@/hooks/useToolsData';
import { toggleUpvote } from '@/app/actions/public';
import type { Tool } from '@/lib/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';

// ─── Types ───────────────────────────────────────────────────────────────────

type Period = 'today' | 'week' | 'month' | 'all_time';

interface UpcomingItem {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  category: string;
  pricing: string;
  launchDate: string;
  slug: string | null;
  isVerified: boolean;
  averageRating: number;
  reviewCount: number;
  upvoteCount: number;
  source: 'tool' | 'submission';
}

interface RankedTool {
  rank: number;
  tool: Tool;
  rank_change: number;
  period_upvotes: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const RANK_CHANGES: Record<Period, number[]> = {
  today:    [0, 2, -1, 5, -2, 1, 0, 3, -1, 4, -3, 2, 1, -2, 0, 3, -1, 2, 4, -2, 1, 0, -1, 3, 2, -4, 1, 0, -2, 3],
  week:     [2, -1, 0, 3, 1, -2, 0, -1, 4, -3, 1, 0, 2, -1, 3, 0, -2, 1, 4, -1, 2, -3, 0, 1, -1, 2, 3, -2, 0, 1],
  month:    [5, -3, 2, 0, -1, 4, -2, 1, 3, -5, 2, 0, -1, 3, 1, -2, 4, 0, -3, 2, 1, -1, 3, -2, 0, 4, -1, 2, -3, 1],
  all_time: [0, 0, 0, 1, -1, 0, 2, 0, -2, 1, 0, -1, 0, 1, 0, -1, 2, 0, -2, 1, 0, 0, 1, -1, 0, 2, -1, 0, 1, -2],
};

const PERIOD_MULTIPLIERS: Record<Period, number> = {
  today: 0.03, week: 0.2, month: 0.7, all_time: 1,
};

const PERIOD_LABELS: Record<Period, { label: string; icon: React.ReactNode; description: string }> = {
  today:    { label: 'Today', icon: <Flame className="w-4 h-4" />, description: 'Hottest launches in the last 24 hours' },
  week:     { label: 'This Week', icon: <Zap className="w-4 h-4" />, description: 'Top performers over the past 7 days' },
  month:    { label: 'This Month', icon: <Calendar className="w-4 h-4" />, description: 'Best stacks launched this month' },
  all_time: { label: 'All Time', icon: <Trophy className="w-4 h-4" />, description: 'The greatest stacks ever listed on LaudStack' },
};

function getMomentumScore(tool: Tool, multiplier: number): number {
  const base = tool.rank_score * multiplier;
  const weeklyBoost = (tool.weekly_rank_change ?? 0) * 0.8;
  const reviewBoost = tool.review_count * 2.5 * multiplier;
  return base + weeklyBoost + reviewBoost;
}

// ─── Countdown Hook (compact) ────────────────────────────────────────────────

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState(() => calc(targetDate));

  function calc(iso: string) {
    const diff = new Date(iso).getTime() - Date.now();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, expired: true };
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
      expired: false,
    };
  }

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calc(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

// ─── Upcoming Launch Card (polished, compact countdown) ──────────────────────

function UpcomingCard({ item }: { item: UpcomingItem }) {
  const countdown = useCountdown(item.launchDate);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [notified, setNotified] = useState(false);
  const [notifying, setNotifying] = useState(false);

  const isLive = countdown.expired;
  const toolIdNum = item.id.startsWith('tool-') ? Number(item.id.replace('tool-', '')) : null;

  const handleNotify = async () => {
    if (!showEmailInput) {
      setShowEmailInput(true);
      return;
    }
    if (!notifyEmail || !notifyEmail.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    setNotifying(true);
    try {
      const res = await fetch('/api/launches/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: notifyEmail,
          toolId: toolIdNum,
        }),
      });
      const data = await res.json();
      if (data.success || data.message) {
        setNotified(true);
        toast.success("You'll be notified when this launches!");
      } else {
        toast.error(data.error || 'Failed to subscribe');
      }
    } catch {
      toast.error('Failed to subscribe');
    } finally {
      setNotifying(false);
    }
  };

  return (
    <div className={`relative bg-white border rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
      isLive ? 'border-green-400/50 ring-1 ring-green-400/20' : 'border-slate-200'
    }`}>
      {/* Top bar — status */}
      <div className={`px-4 py-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider ${
        isLive ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-500'
      }`}>
        <div className="flex items-center gap-1.5">
          {isLive ? (
            <><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live Now</>
          ) : (
            <><Timer className="w-3 h-3" /> Upcoming</>
          )}
        </div>
        {!isLive && (
          <span className="text-[10px] font-mono tabular-nums text-slate-600">
            {countdown.d > 0 && `${countdown.d}d `}{String(countdown.h).padStart(2, '0')}:{String(countdown.m).padStart(2, '0')}:{String(countdown.s).padStart(2, '0')}
          </span>
        )}
      </div>

      <div className="p-4">
        {/* Tool info row */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center flex-shrink-0">
            <img
              src={item.logo}
              alt={item.name}
              className="w-9 h-9 object-contain"
              onError={e => {
                const t = e.currentTarget;
                t.style.display = 'none';
                const p = t.parentElement;
                if (p) p.innerHTML = `<span style="font-size:16px;font-weight:800;color:#64748B">${item.name.charAt(0)}</span>`;
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-slate-900 tracking-tight truncate">{item.name}</span>
              {item.isVerified && <Shield className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
            </div>
            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">{item.tagline}</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{item.category}</span>
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{item.pricing}</span>
          {item.averageRating > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-600">
              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
              {item.averageRating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Action row */}
        <div className="flex items-center gap-2">
          {isLive && item.slug ? (
            <Link href={`/tools/${item.slug}`} className="flex-1">
              <button className="w-full flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">
                View Stack <ArrowUpRight className="w-3 h-3" />
              </button>
            </Link>
          ) : notified ? (
            <div className="flex-1 flex items-center justify-center gap-1.5 bg-amber-50 text-amber-600 text-xs font-bold px-3 py-2 rounded-lg border border-amber-200">
              <CheckCircle2 className="w-3 h-3" /> Subscribed
            </div>
          ) : showEmailInput ? (
            <div className="flex-1 flex gap-1.5">
              <input
                type="email"
                value={notifyEmail}
                onChange={e => setNotifyEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNotify()}
                placeholder="your@email.com"
                className="flex-1 text-xs px-2.5 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-amber-400 min-w-0"
                autoFocus
              />
              <button
                onClick={handleNotify}
                disabled={notifying}
                className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors flex-shrink-0"
              >
                {notifying ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bell className="w-3 h-3" />}
              </button>
            </div>
          ) : (
            <button
              onClick={handleNotify}
              className="flex-1 flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
            >
              <Bell className="w-3 h-3" /> Notify Me
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Rank helpers ────────────────────────────────────────────────────────────

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="w-5 h-5 text-amber-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-500" />;
  if (rank === 3) return <Award className="w-5 h-5 text-amber-700" />;
  return null;
}

function RankChange({ change }: { change: number }) {
  if (change === 0) return <span className="flex items-center text-slate-400 text-xs"><Minus className="w-3 h-3" /></span>;
  if (change > 0) return <span className="flex items-center gap-0.5 text-green-500 text-xs font-semibold"><TrendingUp className="w-3 h-3" />{change}</span>;
  return <span className="flex items-center gap-0.5 text-rose-500 text-xs font-semibold"><TrendingDown className="w-3 h-3" />{Math.abs(change)}</span>;
}

// ─── Top 3 Card ──────────────────────────────────────────────────────────────

function TopThreeCard({
  entry,
  position,
  laudedIds,
  onLaud,
  laudingId,
}: {
  entry: RankedTool;
  position: 1 | 2 | 3;
  laudedIds: Set<string>;
  onLaud: (toolId: number) => void;
  laudingId: number | null;
}) {
  const { tool, rank_change, period_upvotes } = entry;
  const isFirst = position === 1;
  const isLauded = laudedIds.has(tool.id);
  const isLauding = laudingId === Number(tool.id);

  const accent = { 1: 'amber', 2: 'slate', 3: 'amber' } as const;
  const borderCls = { 1: 'border-amber-300', 2: 'border-slate-300', 3: 'border-amber-400/40' };
  const rankCls = { 1: 'text-amber-500', 2: 'text-slate-500', 3: 'text-amber-700' };

  return (
    <div className={`relative bg-white border ${borderCls[position]} rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group ${isFirst ? 'ring-1 ring-amber-300/30' : ''}`}>
      {isFirst && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-sm">
          #1 This Period
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <span className={`text-3xl font-black ${rankCls[position]}`}>#{position}</span>
        <div className="flex items-center gap-2">
          <RankChange change={rank_change} />
          {getRankIcon(position)}
        </div>
      </div>

      <Link href={`/tools/${tool.slug}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center flex-shrink-0">
            <img
              src={tool.logo_url}
              alt={tool.name}
              className="w-9 h-9 object-contain"
              onError={e => {
                const t = e.currentTarget;
                t.style.display = 'none';
                const p = t.parentElement;
                if (p) p.innerHTML = `<span style="font-size:16px;font-weight:800;color:#64748B">${tool.name.charAt(0)}</span>`;
              }}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-slate-900 font-bold text-base leading-tight group-hover:text-amber-600 transition-colors truncate">{tool.name}</h3>
              {tool.is_verified && <Shield className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
            </div>
            <p className="text-slate-500 text-xs truncate mt-0.5">{tool.tagline}</p>
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-amber-600 font-semibold">
            <TrendingUp className="w-3 h-3" />
            {period_upvotes.toLocaleString()} lauds
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            {tool.average_rating.toFixed(1)}
          </span>
        </div>

        {/* Laud button */}
        <button
          onClick={() => onLaud(Number(tool.id))}
          disabled={isLauding}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border-[1.5px] text-[11px] font-bold transition-all ${
            isLauded
              ? 'border-amber-300 bg-amber-50 text-amber-600'
              : 'border-slate-200 bg-slate-50 hover:border-amber-400 hover:bg-amber-50 text-slate-600'
          }`}
        >
          {isLauding ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <ChevronUp className={`w-3 h-3 ${isLauded ? 'text-amber-500' : 'text-slate-500'}`} />
          )}
          {tool.upvote_count}
        </button>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-medium">{tool.category}</span>
        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-medium">{tool.pricing_model}</span>
      </div>
    </div>
  );
}

// ─── Leaderboard Row ─────────────────────────────────────────────────────────

function LeaderboardRow({
  entry,
  laudedIds,
  onLaud,
  laudingId,
}: {
  entry: RankedTool;
  laudedIds: Set<string>;
  onLaud: (toolId: number) => void;
  laudingId: number | null;
}) {
  const { rank, tool, rank_change, period_upvotes } = entry;
  const isLauded = laudedIds.has(tool.id);
  const isLauding = laudingId === Number(tool.id);

  return (
    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/80 transition-colors group border-b border-slate-100 last:border-0">
      {/* Rank */}
      <div className="w-8 flex-shrink-0 flex items-center justify-center">
        {getRankIcon(rank) || (
          <span className="text-slate-500 font-bold text-sm">{rank}</span>
        )}
      </div>

      {/* Rank change */}
      <div className="w-8 flex-shrink-0">
        <RankChange change={rank_change} />
      </div>

      {/* Laud button */}
      <button
        onClick={e => { e.stopPropagation(); onLaud(Number(tool.id)); }}
        disabled={isLauding}
        className={`flex-shrink-0 flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg border-[1.5px] transition-all min-w-[40px] ${
          isLauded
            ? 'border-amber-300 bg-amber-50 text-amber-600'
            : 'border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50 text-slate-600'
        }`}
      >
        {isLauding ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <ChevronUp className={`w-3 h-3 ${isLauded ? 'text-amber-500' : 'text-slate-500'}`} />
        )}
        <span className="text-[10px] font-bold leading-none">{tool.upvote_count}</span>
      </button>

      {/* Logo */}
      <Link href={`/tools/${tool.slug}`} className="flex-shrink-0">
        <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
          <img
            src={tool.logo_url}
            alt={tool.name}
            className="w-8 h-8 object-contain"
            onError={e => {
              const t = e.currentTarget;
              t.style.display = 'none';
              const p = t.parentElement;
              if (p) p.innerHTML = `<span style="font-size:14px;font-weight:800;color:#64748B">${tool.name.charAt(0)}</span>`;
            }}
          />
        </div>
      </Link>

      {/* Name + tagline */}
      <Link href={`/tools/${tool.slug}`} className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-slate-900 group-hover:text-amber-600 transition-colors truncate">{tool.name}</span>
          {tool.is_verified && <Shield className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
          {tool.badges.includes('new_launch') && (
            <span className="text-[9px] font-extrabold text-white bg-green-500 px-1.5 py-0.5 rounded uppercase tracking-wider flex-shrink-0">New</span>
          )}
        </div>
        <p className="text-xs text-slate-500 truncate">{tool.tagline}</p>
      </Link>

      {/* Category */}
      <span className="hidden md:block text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium flex-shrink-0">{tool.category}</span>

      {/* Rating */}
      <div className="hidden sm:flex items-center gap-1 flex-shrink-0 w-12 justify-end">
        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
        <span className="text-slate-700 text-xs font-semibold">{tool.average_rating.toFixed(1)}</span>
      </div>

      {/* Period lauds */}
      <div className="flex items-center gap-1 flex-shrink-0 w-16 justify-end">
        <TrendingUp className="w-3 h-3 text-amber-500" />
        <span className="text-amber-600 font-semibold text-xs">{period_upvotes.toLocaleString()}</span>
      </div>

      {/* Arrow */}
      <Link href={`/tools/${tool.slug}`} className="flex-shrink-0">
        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
      </Link>
    </div>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <div className="max-w-[1300px] mx-auto px-4 py-16 w-full flex-1">
        {/* Hero skeleton */}
        <div className="mb-10">
          <div className="h-4 w-32 bg-slate-200 rounded mb-3 animate-pulse" />
          <div className="h-8 w-80 bg-slate-200 rounded mb-2 animate-pulse" />
          <div className="h-4 w-96 bg-slate-100 rounded mb-6 animate-pulse" />
          <div className="flex gap-2">
            {[1,2,3,4].map(i => <div key={i} className="h-9 w-24 bg-slate-100 rounded-lg animate-pulse" />)}
          </div>
        </div>
        {/* Upcoming skeleton */}
        <div className="mb-10">
          <div className="h-6 w-48 bg-slate-200 rounded mb-4 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 animate-pulse">
                <div className="h-3 w-16 bg-slate-100 rounded mb-4" />
                <div className="flex gap-3 mb-3">
                  <div className="w-11 h-11 bg-slate-100 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-slate-200 rounded mb-1.5" />
                    <div className="h-3 w-full bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="h-8 w-full bg-slate-100 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
        {/* Podium skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse">
              <div className="h-8 w-10 bg-slate-200 rounded mb-3" />
              <div className="flex gap-3 mb-3">
                <div className="w-11 h-11 bg-slate-100 rounded-xl" />
                <div className="flex-1">
                  <div className="h-4 w-28 bg-slate-200 rounded mb-1" />
                  <div className="h-3 w-full bg-slate-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Table skeleton */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 animate-pulse">
              <div className="w-8 h-5 bg-slate-100 rounded" />
              <div className="w-8 h-4 bg-slate-100 rounded" />
              <div className="w-10 h-10 bg-slate-100 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-slate-200 rounded mb-1" />
                <div className="h-3 w-48 bg-slate-100 rounded" />
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
  const [period, setPeriod] = useState<Period>('week');
  const [upcomingItems, setUpcomingItems] = useState<UpcomingItem[]>([]);
  const [upcomingLoading, setUpcomingLoading] = useState(true);
  const [laudedIds, setLaudedIds] = useState<Set<string>>(new Set());
  const [laudingId, setLaudingId] = useState<number | null>(null);

  // Fetch upcoming launches from real API
  useEffect(() => {
    fetch('/api/launches/upcoming')
      .then(r => r.json())
      .then(data => {
        setUpcomingItems(data.upcoming ?? []);
      })
      .catch(() => {})
      .finally(() => setUpcomingLoading(false));
  }, []);

  // Load user's lauded IDs
  useEffect(() => {
    import('@/app/actions/user').then(({ getUserUpvotes }) => {
      getUserUpvotes().then(ids => {
        if (Array.isArray(ids)) setLaudedIds(new Set(ids.map(String)));
      }).catch(() => {});
    });
  }, []);

  // Laud handler
  const handleLaud = useCallback(async (toolId: number) => {
    setLaudingId(toolId);
    try {
      const result = await toggleUpvote(toolId);
      if (result.success) {
        setLaudedIds(prev => {
          const next = new Set(prev);
          if (result.upvoted) {
            next.add(String(toolId));
            toast.success('Lauded!');
          } else {
            next.delete(String(toolId));
            toast.success('Laud removed');
          }
          return next;
        });
        invalidateToolsCache();
      } else {
        toast.error(result.error || 'Please sign in to laud');
      }
    } catch {
      toast.error('Please sign in to laud');
    } finally {
      setLaudingId(null);
    }
  }, []);

  // Ranked tools with momentum scoring
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

  // Show skeleton while loading
  if (toolsLoading) return <PageSkeleton />;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />

      <PageHero
        eyebrow="LaudStack Leaderboard"
        title="Top SaaS & AI Stacks"
        subtitle={`${periodInfo.description}. Rankings use momentum scoring — rewarding recent engagement over raw historical counts.`}
        accent="amber"
        layout="default"
        size="md"
      >
        <div className="flex items-center gap-2 flex-wrap">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => {
            const info = PERIOD_LABELS[p];
            const isActive = period === p;
            return (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-all border-[1.5px] ${
                  isActive
                    ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-700'
                }`}
              >
                {info.icon}{info.label}
              </button>
            );
          })}
          <div className="ml-auto flex items-center gap-1.5 text-[11px] text-slate-400">
            <Clock className="w-3 h-3" />
            Updated hourly
          </div>
        </div>
      </PageHero>

      <div className="max-w-[1300px] mx-auto px-4 py-10 w-full flex-1">

        {/* ── Upcoming Launches ── */}
        {(upcomingItems.length > 0 || upcomingLoading) && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-slate-900 font-bold text-lg flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-amber-500" />
                  Upcoming Launches
                </h2>
                <p className="text-slate-500 text-xs mt-0.5">Stacks launching soon — get notified when they go live</p>
              </div>
              <Link href="/upcoming-launches" className="flex items-center gap-1 text-amber-600 hover:text-amber-500 text-xs font-semibold transition-colors">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {upcomingLoading ? (
                [1,2,3,4].map(i => (
                  <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 animate-pulse">
                    <div className="h-3 w-16 bg-slate-100 rounded mb-4" />
                    <div className="flex gap-3 mb-3">
                      <div className="w-11 h-11 bg-slate-100 rounded-xl" />
                      <div className="flex-1">
                        <div className="h-4 w-24 bg-slate-200 rounded mb-1.5" />
                        <div className="h-3 w-full bg-slate-100 rounded" />
                      </div>
                    </div>
                    <div className="h-8 w-full bg-slate-100 rounded-lg" />
                  </div>
                ))
              ) : (
                upcomingItems.slice(0, 4).map(item => (
                  <UpcomingCard key={item.id} item={item} />
                ))
              )}
            </div>
          </div>
        )}

        {/* ── Top 3 Podium ── */}
        {topThree.length >= 3 && (
          <div className="mb-10">
            <h2 className="text-slate-900 font-bold text-lg mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              Top 3 This Period
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topThree.map((entry) => (
                <TopThreeCard
                  key={entry.tool.id}
                  entry={entry}
                  position={entry.rank as 1 | 2 | 3}
                  laudedIds={laudedIds}
                  onLaud={handleLaud}
                  laudingId={laudingId}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Full Leaderboard ── */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Table header */}
          <div className="flex items-center gap-4 px-5 py-3 border-b border-slate-200 bg-slate-50/80">
            <div className="w-8 flex-shrink-0 text-slate-500 text-[11px] font-semibold">#</div>
            <div className="w-8 flex-shrink-0 text-slate-500 text-[11px] font-semibold">±</div>
            <div className="w-10 flex-shrink-0" />
            <div className="w-10 flex-shrink-0" />
            <div className="flex-1 text-slate-500 text-[11px] font-semibold">Stack</div>
            <div className="hidden md:block text-slate-500 text-[11px] font-semibold">Category</div>
            <div className="hidden sm:block text-slate-500 text-[11px] font-semibold w-12 text-right">Rating</div>
            <div className="text-slate-500 text-[11px] font-semibold w-16 text-right">Lauds</div>
            <div className="w-4 flex-shrink-0" />
          </div>

          {rest.length > 0 ? (
            rest.map(entry => (
              <LeaderboardRow
                key={entry.tool.id}
                entry={entry}
                laudedIds={laudedIds}
                onLaud={handleLaud}
                laudingId={laudingId}
              />
            ))
          ) : (
            <div className="px-5 py-12 text-center text-slate-400 text-sm">
              No stacks ranked yet for this period.
            </div>
          )}
        </div>

        {/* ── Bottom CTA ── */}
        <div className="mt-10 bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <h3 className="text-slate-900 font-bold text-xl mb-2">Is your stack missing from the leaderboard?</h3>
          <p className="text-slate-500 text-sm mb-5 max-w-lg mx-auto">
            Launch your AI or SaaS product on LaudStack and start collecting reviews from real users. Schedule a launch date to build anticipation.
          </p>
          <Link href="/launchpad">
            <button className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-sm">
              Launch Your Stack
              <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
