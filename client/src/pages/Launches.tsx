// LaudStack — Launches Leaderboard Page
// Design: Dark editorial, amber accent, rank-focused layout with period tabs

import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import {
  TrendingUp, TrendingDown, Minus, Trophy, Flame, Star, ArrowUpRight,
  ChevronRight, Zap, Clock, Calendar, BarChart3, Medal, Crown, Award
} from 'lucide-react';
import { MOCK_TOOLS } from '@/lib/mockData';
import type { Tool } from '@/lib/types';

type Period = 'today' | 'week' | 'month' | 'all_time';

interface RankedTool {
  rank: number;
  tool: Tool;
  rank_change: number;
  period_upvotes: number;
  period_reviews: number;
}

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

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="w-5 h-5 text-amber-400" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-300" />;
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
    <span className="flex items-center gap-0.5 text-emerald-400 text-xs font-semibold">
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
  const { tool, rank_change, period_upvotes, period_reviews } = entry;
  const isFirst = position === 1;

  const borderColors = { 1: 'border-amber-400/40', 2: 'border-slate-400/30', 3: 'border-amber-700/30' };
  const bgColors = { 1: 'bg-amber-400/5', 2: 'bg-slate-400/5', 3: 'bg-amber-700/5' };
  const rankColors = { 1: 'text-amber-400', 2: 'text-slate-300', 3: 'text-amber-600' };

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
            className="w-12 h-12 rounded-xl object-cover bg-slate-700"
            onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=1e293b&color=f59e0b&size=48`; }}
          />
          <div>
            <h3 className="text-white font-bold text-lg leading-tight group-hover:text-amber-400 transition-colors">{tool.name}</h3>
            <p className="text-slate-400 text-sm">{tool.tagline}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 text-amber-400 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            {period_upvotes.toLocaleString()} upvotes
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {tool.average_rating.toFixed(1)}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="text-xs bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded-full">{tool.category}</span>
          <span className="text-xs bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded-full">{tool.pricing_model}</span>
        </div>
      </div>
    </Link>
  );
}

function LeaderboardRow({ entry, index }: { entry: RankedTool; index: number }) {
  const { rank, tool, rank_change, period_upvotes } = entry;

  return (
    <Link href={`/tools/${tool.slug}`}>
      <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-800/50 transition-colors cursor-pointer group border-b border-slate-800/50 last:border-0">
        {/* Rank */}
        <div className="w-10 flex-shrink-0 flex items-center justify-center">
          {getRankIcon(rank) || (
            <span className="text-slate-400 font-bold text-sm w-6 text-center">{rank}</span>
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
          className="w-10 h-10 rounded-lg object-cover bg-slate-700 flex-shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=1e293b&color=f59e0b&size=40`; }}
        />

        {/* Name + tagline */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold group-hover:text-amber-400 transition-colors truncate">{tool.name}</span>
            {tool.badges.includes('new_launch') && (
              <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full flex-shrink-0">New</span>
            )}
            {tool.badges.includes('trending') && (
              <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full flex-shrink-0">🔥 Hot</span>
            )}
          </div>
          <p className="text-slate-400 text-sm truncate">{tool.tagline}</p>
        </div>

        {/* Category */}
        <span className="hidden md:block text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-full flex-shrink-0">{tool.category}</span>

        {/* Pricing */}
        <span className="hidden lg:block text-xs text-slate-400 flex-shrink-0 w-20 text-right">{tool.pricing_model}</span>

        {/* Rating */}
        <div className="hidden sm:flex items-center gap-1 flex-shrink-0 w-14 justify-end">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-slate-300 text-sm font-medium">{tool.average_rating.toFixed(1)}</span>
        </div>

        {/* Upvotes */}
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

export default function Launches() {
  const [period, setPeriod] = useState<Period>('week');

  const rankedTools = useMemo((): RankedTool[] => {
    const sorted = [...MOCK_TOOLS].sort((a, b) => b.rank_score - a.rank_score);
    const multiplier = PERIOD_MULTIPLIERS[period];
    const changes = RANK_CHANGES[period];

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
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-slate-900/50" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="max-w-6xl mx-auto px-4 py-16 relative">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-4">
            <Trophy className="w-4 h-4" />
            <span>LaudStack Leaderboard</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            Top AI & SaaS Tools
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            {periodInfo.description}. Rankings are calculated from upvotes, reviews, and engagement signals.
          </p>

          {/* Period tabs */}
          <div className="flex items-center gap-2 mt-8 flex-wrap">
            {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => {
              const info = PERIOD_LABELS[p];
              const isActive = period === p;
              return (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-400 text-slate-900'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {info.icon}
                  {info.label}
                </button>
              );
            })}

            <div className="ml-auto flex items-center gap-2 text-slate-500 text-sm">
              <Clock className="w-4 h-4" />
              <span>Updated hourly</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Tools Ranked', value: rankedTools.length, icon: <BarChart3 className="w-4 h-4 text-amber-400" /> },
            { label: 'Total Upvotes', value: rankedTools.reduce((s, e) => s + e.period_upvotes, 0).toLocaleString(), icon: <TrendingUp className="w-4 h-4 text-emerald-400" /> },
            { label: 'Avg Rating', value: (rankedTools.reduce((s, e) => s + e.tool.average_rating, 0) / rankedTools.length).toFixed(1), icon: <Star className="w-4 h-4 text-amber-400" /> },
            { label: 'New Launches', value: rankedTools.filter(e => e.tool.badges.includes('new_launch')).length, icon: <Zap className="w-4 h-4 text-sky-400" /> },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                {stat.icon}
                <span className="text-slate-400 text-xs">{stat.label}</span>
              </div>
              <div className="text-white font-bold text-xl">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Top 3 podium */}
        <div className="mb-10">
          <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            Top 3 This Period
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topThree.map((entry) => (
              <TopThreeCard key={entry.tool.id} entry={entry} position={entry.rank as 1 | 2 | 3} />
            ))}
          </div>
        </div>

        {/* Full leaderboard */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-4 px-5 py-3 border-b border-slate-800 bg-slate-800/50">
            <div className="w-10 flex-shrink-0 text-slate-500 text-xs font-medium">#</div>
            <div className="w-8 flex-shrink-0 text-slate-500 text-xs font-medium">±</div>
            <div className="w-10 flex-shrink-0" />
            <div className="flex-1 text-slate-500 text-xs font-medium">Tool</div>
            <div className="hidden md:block text-slate-500 text-xs font-medium w-24">Category</div>
            <div className="hidden lg:block text-slate-500 text-xs font-medium w-20 text-right">Pricing</div>
            <div className="hidden sm:block text-slate-500 text-xs font-medium w-14 text-right">Rating</div>
            <div className="text-slate-500 text-xs font-medium w-20 text-right">Upvotes</div>
            <div className="w-4 flex-shrink-0" />
          </div>

          {rest.map((entry, i) => (
            <LeaderboardRow key={entry.tool.id} entry={entry} index={i} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-8 text-center">
          <h3 className="text-white font-bold text-xl mb-2">Is your tool missing from the leaderboard?</h3>
          <p className="text-slate-400 mb-5">Submit your AI or SaaS product to LaudStack and start collecting reviews from real users.</p>
          <Link href="/launchpad">
            <button className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors">
              Submit Your Tool
              <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
