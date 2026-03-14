"use client";

export const dynamic = 'force-dynamic';


// Launches.tsx — LaudStack Launch Leaderboard
// Design: Dark editorial, amber accent, rank-focused layout with period tabs + upcoming launches section

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp, TrendingDown, Minus, Trophy, Flame, Star, ArrowUpRight,
  ChevronRight, Zap, Clock, Calendar, BarChart3, Medal, Crown, Award,
  Rocket, Timer, CheckCircle2, Eye
} from 'lucide-react';
import { useToolsData } from '@/hooks/useToolsData';
import type { Tool } from '@/lib/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';

// ─── Types ───────────────────────────────────────────────────────────────────

type Period = 'today' | 'week' | 'month' | 'all_time';
type LaunchStatus = 'upcoming' | 'live' | 'ended';

interface UpcomingLaunch {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  category: string;
  pricing: string;
  launchDate: Date;
  status: LaunchStatus;
  notifyCount: number;
  founderName: string;
  slug: string;
}

interface RankedTool {
  rank: number;
  tool: Tool;
  rank_change: number;
  period_upvotes: number;
  period_reviews: number;
}

// ─── Mock Upcoming Launches ───────────────────────────────────────────────────

const now = new Date();
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

const UPCOMING_LAUNCHES: UpcomingLaunch[] = [
  {
    id: 'ul-1',
    name: 'VoiceFlow AI',
    tagline: 'Build conversational AI agents without writing a single line of code',
    logo: 'https://ui-avatars.com/api/?name=VoiceFlow+AI&background=7C3AED&color=fff&size=64',
    category: 'AI Productivity',
    pricing: 'Freemium',
    launchDate: addDays(now, 1),
    status: 'upcoming',
    notifyCount: 847,
    founderName: 'Alex Chen',
    slug: 'voiceflow-ai',
  },
  {
    id: 'ul-2',
    name: 'DataPulse',
    tagline: 'Real-time analytics dashboard that connects to 200+ data sources in minutes',
    logo: 'https://ui-avatars.com/api/?name=DataPulse&background=0EA5E9&color=fff&size=64',
    category: 'AI Analytics',
    pricing: 'Free Trial',
    launchDate: addDays(now, 3),
    status: 'upcoming',
    notifyCount: 1243,
    founderName: 'Sarah Kim',
    slug: 'datapulse',
  },
  {
    id: 'ul-3',
    name: 'CodeReview Pro',
    tagline: 'AI-powered code review that catches bugs before your team does',
    logo: 'https://ui-avatars.com/api/?name=CodeReview+Pro&background=10B981&color=fff&size=64',
    category: 'AI Code',
    pricing: 'Paid',
    launchDate: addDays(now, 7),
    status: 'upcoming',
    notifyCount: 562,
    founderName: 'Marcus Johnson',
    slug: 'codereview-pro',
  },
  {
    id: 'ul-4',
    name: 'NarrateAI',
    tagline: 'Turn any text into studio-quality voiceovers with 500+ natural voices',
    logo: 'https://ui-avatars.com/api/?name=NarrateAI&background=F59E0B&color=fff&size=64',
    category: 'AI Audio',
    pricing: 'Freemium',
    launchDate: addDays(now, 0),  // launching today
    status: 'live',
    notifyCount: 2104,
    founderName: 'Priya Patel',
    slug: 'narrateai',
  },
];

// ─── Ranking Data ─────────────────────────────────────────────────────────────

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
  month:    { label: 'This Month', icon: <Calendar className="w-4 h-4" />, description: 'Best tools launched this month' },
  all_time: { label: 'All Time', icon: <Trophy className="w-4 h-4" />, description: 'The greatest tools ever listed on LaudStack' },
};

// ─── Momentum Score (Prompt 15 algorithm) ─────────────────────────────────────
// Score = (lauds × 1.0 + reviews × 2.5 + clicks × 0.5) / (hours_since_launch + 2)^1.5
// We simulate this with rank_score + weekly_rank_change weighting

function getMomentumScore(tool: Tool, multiplier: number): number {
  const base = tool.rank_score * multiplier;
  const weeklyBoost = (tool.weekly_rank_change ?? 0) * 0.8;
  const reviewBoost = tool.review_count * 2.5 * multiplier;
  return base + weeklyBoost + reviewBoost;
}

// ─── Countdown Hook ────────────────────────────────────────────────────────────

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetDate));

  function getTimeLeft(target: Date) {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds, expired: false };
  }

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

// ─── Components ───────────────────────────────────────────────────────────────

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 min-w-[48px] text-center">
        <span className="text-slate-900 font-black text-xl tabular-nums leading-none">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-slate-500 text-[10px] font-medium mt-1 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function UpcomingLaunchCard({ launch }: { launch: UpcomingLaunch }) {
  const countdown = useCountdown(launch.launchDate);
  const [notified, setNotified] = useState(false);
  const [notifyCount, setNotifyCount] = useState(launch.notifyCount);

  const isLive = launch.status === 'live' || countdown.expired;

  const handleNotify = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!notified) {
      setNotified(true);
      setNotifyCount(c => c + 1);
    }
  };

  return (
    <div className={`relative bg-white border rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300 hover:border-amber-400/40 ${
      isLive ? 'border-green-500/40 ring-1 ring-green-500/20' : 'border-gray-300/60'
    }`}>
      {/* Status badge */}
      {isLive ? (
        <div className="absolute -top-3 left-4 flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-green-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          LIVE NOW
        </div>
      ) : (
        <div className="absolute -top-3 left-4 flex items-center gap-1.5 bg-gray-200 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full border border-gray-400">
          <Timer className="w-3 h-3" />
          UPCOMING
        </div>
      )}

      {/* Tool info */}
      <div className="flex items-start gap-3 mt-1">
        <img
          src={launch.logo}
          alt={launch.name}
          className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-slate-900 font-bold text-base leading-tight">{launch.name}</h3>
          <p className="text-slate-500 text-sm mt-0.5 line-clamp-2">{launch.tagline}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs bg-gray-100 text-slate-600 px-2 py-0.5 rounded-full border border-gray-300">{launch.category}</span>
            <span className="text-xs bg-gray-100 text-slate-600 px-2 py-0.5 rounded-full border border-gray-300">{launch.pricing}</span>
          </div>
        </div>
      </div>

      {/* Countdown or Live indicator */}
      {isLive ? (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl p-3">
          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span className="text-green-500 text-sm font-semibold">This product is live on LaudStack!</span>
        </div>
      ) : (
        <div>
          <div className="text-slate-500 text-xs font-medium mb-2 flex items-center gap-1">
            <Timer className="w-3 h-3" />
            Launches in
          </div>
          <div className="flex items-center gap-2">
            <CountdownUnit value={countdown.days} label="days" />
            <span className="text-slate-600 font-bold text-lg mb-4">:</span>
            <CountdownUnit value={countdown.hours} label="hrs" />
            <span className="text-slate-600 font-bold text-lg mb-4">:</span>
            <CountdownUnit value={countdown.minutes} label="min" />
            <span className="text-slate-600 font-bold text-lg mb-4">:</span>
            <CountdownUnit value={countdown.seconds} label="sec" />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-200">
        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
          <Eye className="w-3.5 h-3.5" />
          <span className="font-semibold text-slate-500">{notifyCount.toLocaleString()}</span>
          <span>watching</span>
        </div>
        {isLive ? (
          <Link href={`/tools/${launch.slug}`}>
            <button className="flex items-center gap-1.5 bg-green-500 hover:bg-green-400 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
              View Tool <ArrowUpRight className="w-3 h-3" />
            </button>
          </Link>
        ) : (
          <button
            onClick={handleNotify}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
              notified
                ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-900'
            }`}
          >
            {notified ? (
              <><CheckCircle2 className="w-3 h-3" /> Notified</>
            ) : (
              <><Rocket className="w-3 h-3" /> Notify Me</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="w-5 h-5 text-amber-400" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-600" />;
  if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
  return null;
}

function RankChange({ change }: { change: number }) {
  if (change === 0) return (
    <span className="flex items-center gap-0.5 text-slate-500 text-xs font-medium">
      <Minus className="w-3 h-3" />
    </span>
  );
  if (change > 0) return (
    <span className="flex items-center gap-0.5 text-green-500 text-xs font-semibold">
      <TrendingUp className="w-3 h-3" />
      {change}
    </span>
  );
  return (
    <span className="flex items-center gap-0.5 text-rose-400 text-xs font-semibold">
      <TrendingDown className="w-3 h-3" />
      {Math.abs(change)}
    </span>
  );
}

function TopThreeCard({ entry, position }: { entry: RankedTool; position: 1 | 2 | 3 }) {
  const { tool, rank_change, period_upvotes } = entry;
  const isFirst = position === 1;

  const borderColors = { 1: 'border-amber-400/40', 2: 'border-slate-400/30', 3: 'border-amber-700/30' };
  const bgColors = { 1: 'bg-amber-400/5', 2: 'bg-slate-400/5', 3: 'bg-amber-700/5' };
  const rankColors = { 1: 'text-amber-400', 2: 'text-slate-600', 3: 'text-amber-600' };

  return (
    <Link href={`/tools/${tool.slug}`}>
      <div className={`relative border ${borderColors[position]} ${bgColors[position]} rounded-2xl p-6 cursor-pointer hover:border-amber-400/60 transition-all duration-300 group ${isFirst ? 'ring-1 ring-amber-400/20' : ''}`}>
        {isFirst && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">
            #1 This Period
          </div>
        )}
        <div className="flex items-start justify-between mb-4">
          <span className={`text-4xl font-black ${rankColors[position]}`}>#{position}</span>
          <div className="flex items-center gap-2">
            <RankChange change={rank_change} />
            {getRankIcon(position)}
          </div>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <img
            src={tool.logo_url}
            alt={tool.name}
            className="w-12 h-12 rounded-xl object-cover bg-gray-200"
            onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=1e293b&color=f59e0b&size=48`; }}
          />
          <div>
            <h3 className="text-slate-900 font-bold text-lg leading-tight group-hover:text-amber-400 transition-colors">{tool.name}</h3>
            <p className="text-slate-500 text-sm">{tool.tagline}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 text-amber-400 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            {period_upvotes.toLocaleString()} lauds
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {tool.average_rating.toFixed(1)}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="text-xs bg-gray-200/60 text-slate-600 px-2 py-0.5 rounded-full">{tool.category}</span>
          <span className="text-xs bg-gray-200/60 text-slate-600 px-2 py-0.5 rounded-full">{tool.pricing_model}</span>
        </div>
      </div>
    </Link>
  );
}

function LeaderboardRow({ entry }: { entry: RankedTool }) {
  const { rank, tool, rank_change, period_upvotes } = entry;

  return (
    <Link href={`/tools/${tool.slug}`}>
      <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-100/50 transition-colors cursor-pointer group border-b border-gray-200/50 last:border-0">
        {/* Rank */}
        <div className="w-10 flex-shrink-0 flex items-center justify-center">
          {getRankIcon(rank) || (
            <span className="text-slate-500 font-bold text-sm w-6 text-center">{rank}</span>
          )}
        </div>

        {/* Rank change */}
        <div className="w-8 flex-shrink-0">
          <RankChange change={rank_change} />
        </div>

        {/* Logo */}
        <img
          src={tool.logo_url}
          alt={tool.name}
          className="w-10 h-10 rounded-lg object-cover bg-gray-200 flex-shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=1e293b&color=f59e0b&size=40`; }}
        />

        {/* Name + tagline */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-900 font-semibold group-hover:text-amber-400 transition-colors truncate">{tool.name}</span>
            {tool.badges.includes('new_launch') && (
              <span className="text-xs bg-green-500/20 text-green-500 border border-green-500/30 px-1.5 py-0.5 rounded-full flex-shrink-0">New</span>
            )}
            {tool.badges.includes('trending') && (
              <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full flex-shrink-0">🔥 Hot</span>
            )}
          </div>
          <p className="text-slate-500 text-sm truncate">{tool.tagline}</p>
        </div>

        {/* Category */}
        <span className="hidden md:block text-xs text-slate-500 bg-gray-100 px-2 py-1 rounded-full flex-shrink-0">{tool.category}</span>

        {/* Pricing */}
        <span className="hidden lg:block text-xs text-slate-500 flex-shrink-0 w-20 text-right">{tool.pricing_model}</span>

        {/* Rating */}
        <div className="hidden sm:flex items-center gap-1 flex-shrink-0 w-14 justify-end">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-slate-600 text-sm font-medium">{tool.average_rating.toFixed(1)}</span>
        </div>

        {/* Lauds */}
        <div className="flex items-center gap-1 flex-shrink-0 w-20 justify-end">
          <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-amber-400 font-semibold text-sm">{period_upvotes.toLocaleString()}</span>
        </div>

        {/* Arrow */}
        <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors flex-shrink-0" />
      </div>
    </Link>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function Launches() {
  const { tools: allTools, reviews: allReviews, loading: toolsLoading } = useToolsData();

  const [period, setPeriod] = useState<Period>('week');

  const rankedTools = useMemo((): RankedTool[] => {
    const multiplier = PERIOD_MULTIPLIERS[period];
    const changes = RANK_CHANGES[period];

    // Momentum-based sort: combines rank_score with weekly_rank_change boost
    const sorted = [...allTools].sort((a, b) => getMomentumScore(b, multiplier) - getMomentumScore(a, multiplier));

    return sorted.map((tool, i) => ({
      rank: i + 1,
      tool,
      rank_change: changes[i % changes.length] ?? 0,
      period_upvotes: Math.round(tool.upvote_count * multiplier * (0.8 + Math.random() * 0.4)),
      period_reviews: Math.round(tool.review_count * multiplier * (0.8 + Math.random() * 0.4)),
    }));
  }, [period]);

  const topThree = rankedTools.slice(0, 3);
  const rest = rankedTools.slice(3);
  const periodInfo = PERIOD_LABELS[period];

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 flex flex-col">
      <Navbar />

      <PageHero
        eyebrow="LaudStack Leaderboard"
        title="Top SaaS & AI Tools"
        subtitle={`${periodInfo.description}. Rankings use momentum scoring — rewarding recent engagement over raw historical counts.`}
        accent="amber"
        layout="default"
        size="md"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => {
            const info = PERIOD_LABELS[p];
            const isActive = period === p;
            return (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s', border: '1.5px solid',
                  background: isActive ? '#F59E0B' : '#F8FAFC',
                  borderColor: isActive ? '#F59E0B' : '#E2E8F0',
                  color: isActive ? '#0A0A0A' : '#374151',
                }}
              >
                {info.icon}{info.label}
              </button>
            );
          })}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#9CA3AF' }}>
            <Clock style={{ width: '13px', height: '13px' }} />
            Updated hourly
          </div>
        </div>
      </PageHero>

      <div className="max-w-[1300px] mx-auto px-4 py-10 w-full flex-1">

        {/* ── Upcoming Launches ── */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-slate-900 font-bold text-xl flex items-center gap-2">
                <Rocket className="w-5 h-5 text-amber-400" />
                Upcoming Launches
              </h2>
              <p className="text-slate-500 text-sm mt-0.5">Tools launching soon — get notified when they go live</p>
            </div>
            <Link href="/launchpad">
              <button className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 text-sm font-semibold transition-colors">
                Launch yours <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {UPCOMING_LAUNCHES.map((launch) => (
              <UpcomingLaunchCard key={launch.id} launch={launch} />
            ))}
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Tools Ranked', value: rankedTools.length, icon: <BarChart3 className="w-4 h-4 text-amber-400" /> },
            { label: 'Total Lauds', value: rankedTools.reduce((s, e) => s + e.period_upvotes, 0).toLocaleString(), icon: <TrendingUp className="w-4 h-4 text-green-500" /> },
            { label: 'Avg Rating', value: (rankedTools.reduce((s, e) => s + e.tool.average_rating, 0) / rankedTools.length).toFixed(1), icon: <Star className="w-4 h-4 text-amber-400" /> },
            { label: 'New Launches', value: rankedTools.filter(e => e.tool.badges.includes('new_launch')).length, icon: <Zap className="w-4 h-4 text-sky-400" /> },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                {stat.icon}
                <span className="text-slate-500 text-xs">{stat.label}</span>
              </div>
              <div className="text-slate-900 font-bold text-xl">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* ── Top 3 podium ── */}
        <div className="mb-10">
          <h2 className="text-slate-900 font-bold text-lg mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            Top 3 This Period
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topThree.map((entry) => (
              <TopThreeCard key={entry.tool.id} entry={entry} position={entry.rank as 1 | 2 | 3} />
            ))}
          </div>
        </div>

        {/* ── Full leaderboard ── */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-4 px-5 py-3 border-b border-gray-200 bg-gray-100/50">
            <div className="w-10 flex-shrink-0 text-slate-500 text-xs font-medium">#</div>
            <div className="w-8 flex-shrink-0 text-slate-500 text-xs font-medium">±</div>
            <div className="w-10 flex-shrink-0" />
            <div className="flex-1 text-slate-500 text-xs font-medium">Tool</div>
            <div className="hidden md:block text-slate-500 text-xs font-medium w-24">Category</div>
            <div className="hidden lg:block text-slate-500 text-xs font-medium w-20 text-right">Pricing</div>
            <div className="hidden sm:block text-slate-500 text-xs font-medium w-14 text-right">Rating</div>
            <div className="text-slate-500 text-xs font-medium w-20 text-right">Lauds</div>
            <div className="w-4 flex-shrink-0" />
          </div>

          {rest.map((entry, i) => (
            <LeaderboardRow key={entry.tool.id} entry={entry} />
          ))}
        </div>

        {/* ── Bottom CTA ── */}
        <div className="mt-10 bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <h3 className="text-slate-900 font-bold text-xl mb-2">Is your tool missing from the leaderboard?</h3>
          <p className="text-slate-500 mb-5">Launch your AI or SaaS product on LaudStack and start collecting reviews from real users. Schedule a launch date to build anticipation.</p>
          <Link href="/launchpad">
            <button className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors">
              Launch Your Tool
              <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
