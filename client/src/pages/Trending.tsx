// Design: LaudStack dark-slate + amber accent. Trending tools with momentum indicators.
// Layout: Hero stats bar + ranked card list with sparklines and rank-change badges.

import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MOCK_TOOLS } from '@/lib/mockData';
import { TrendingUp, Flame, Rocket, ArrowUp, Star, MessageSquare, ThumbsUp, ChevronRight } from 'lucide-react';

const PERIOD_OPTIONS = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: 'all', label: 'All Time' },
];

const CATEGORY_OPTIONS = ['All Categories', 'AI Writing', 'AI Image', 'AI Video', 'AI Code', 'AI Productivity', 'Design', 'Marketing', 'Developer Tools'];

function MomentumBadge({ change }: { change: number }) {
  if (change >= 20) return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-emerald-400">
      <Rocket className="h-3 w-3" /> Rocket
    </span>
  );
  if (change >= 12) return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-xs font-bold text-orange-400">
      <Flame className="h-3 w-3" /> Hot
    </span>
  );
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-xs font-bold text-amber-400">
      <TrendingUp className="h-3 w-3" /> Rising
    </span>
  );
}

function Sparkline({ change }: { change: number }) {
  // Generate a 7-bar sparkline trending upward
  const bars = Array.from({ length: 7 }, (_, i) => {
    const base = 20 + i * (change / 8);
    return Math.min(100, Math.max(10, base + (Math.random() * 10 - 5)));
  });
  return (
    <div className="flex items-end gap-0.5 h-8">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-2 rounded-sm"
          style={{
            height: `${h}%`,
            background: i === 6
              ? 'rgb(251 191 36)'
              : `rgba(251, 191, 36, ${0.2 + (i / 6) * 0.5})`,
          }}
        />
      ))}
    </div>
  );
}

export default function Trending() {
  const [, navigate] = useLocation();
  const [period, setPeriod] = useState('7d');
  const [category, setCategory] = useState('All Categories');

  const trendingTools = useMemo(() => {
    let tools = MOCK_TOOLS.filter(t => (t.weekly_rank_change || 0) > 0);

    if (category !== 'All Categories') {
      tools = tools.filter(t => t.category === category);
    }

    // Sort by rank change descending
    tools.sort((a, b) => (b.weekly_rank_change || 0) - (a.weekly_rank_change || 0));

    return tools.slice(0, 30);
  }, [period, category]);

  const topGainer = trendingTools[0];
  const avgChange = trendingTools.length
    ? Math.round(trendingTools.reduce((s, t) => s + (t.weekly_rank_change || 0), 0) / trendingTools.length)
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800 pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-xs font-bold text-amber-400 uppercase tracking-widest">
              <TrendingUp className="h-3 w-3" /> Trending
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            What's Hot Right Now
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Tools with the biggest rank gains this week — ranked by community momentum, upvotes, and review velocity.
          </p>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-lg">
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-amber-400">{trendingTools.length}</div>
              <div className="text-xs text-slate-400 mt-0.5 font-medium">Rising Tools</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-emerald-400">+{topGainer?.weekly_rank_change || 0}</div>
              <div className="text-xs text-slate-400 mt-0.5 font-medium">Top Gain</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-white">+{avgChange}</div>
              <div className="text-xs text-slate-400 mt-0.5 font-medium">Avg Gain</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Period */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            {PERIOD_OPTIONS.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-4 py-2 text-xs font-bold transition-colors ${
                  period === p.value
                    ? 'bg-amber-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {/* Category */}
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            {CATEGORY_OPTIONS.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Trending list */}
        <div className="space-y-3">
          {trendingTools.map((tool, i) => (
            <div
              key={tool.id}
              onClick={() => navigate(`/tools/${tool.slug}`)}
              className="group bg-slate-900 border border-slate-800 rounded-2xl p-5 cursor-pointer hover:border-amber-500/50 hover:bg-slate-800/80 transition-all duration-200"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="w-10 shrink-0 text-center">
                  <span className={`text-2xl font-black ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-700' : 'text-slate-500'}`}>
                    {i + 1}
                  </span>
                </div>

                {/* Logo */}
                <div className="w-12 h-12 shrink-0 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                  {tool.logo_url ? (
                    <img src={tool.logo_url} alt={tool.name} className="w-8 h-8 object-contain" />
                  ) : (
                    <span className="text-lg font-black text-amber-400">{tool.name[0]}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">{tool.name}</h3>
                    <MomentumBadge change={tool.weekly_rank_change || 0} />
                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{tool.category}</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-0.5 truncate">{tool.tagline}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="font-semibold text-white">{tool.average_rating.toFixed(1)}</span>
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <MessageSquare className="h-3 w-3" />
                      {tool.review_count} reviews
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <ThumbsUp className="h-3 w-3" />
                      {tool.upvote_count}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">{tool.pricing_model}</span>
                  </div>
                </div>

                {/* Sparkline */}
                <div className="hidden md:block shrink-0">
                  <Sparkline change={tool.weekly_rank_change || 0} />
                </div>

                {/* Rank change */}
                <div className="shrink-0 text-right">
                  <div className="flex items-center gap-1 text-emerald-400 font-black text-lg">
                    <ArrowUp className="h-4 w-4" />
                    <span>+{tool.weekly_rank_change}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">rank gain</div>
                </div>

                {/* Arrow */}
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            </div>
          ))}
        </div>

        {trendingTools.length === 0 && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📈</div>
            <h3 className="text-xl font-bold text-white mb-2">No trending tools in this category</h3>
            <p className="text-slate-400 text-sm">Try selecting "All Categories" to see all trending tools</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
