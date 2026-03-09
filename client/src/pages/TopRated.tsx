// Design: LaudStack dark-slate + amber accent. Top Rated tools with podium and rating breakdown.
// Layout: Podium top-3 + ranked list with rating bars.

import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MOCK_TOOLS } from '@/lib/mockData';
import { Star, Award, ChevronRight, MessageSquare, ThumbsUp, Shield, Crown } from 'lucide-react';

const CATEGORY_OPTIONS = ['All Categories', 'AI Writing', 'AI Image', 'AI Video', 'AI Code', 'AI Productivity', 'Design', 'Marketing', 'Developer Tools'];
const MIN_REVIEWS = [
  { value: 0, label: 'Any reviews' },
  { value: 5, label: '5+ reviews' },
  { value: 10, label: '10+ reviews' },
  { value: 20, label: '20+ reviews' },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
        />
      ))}
    </div>
  );
}

function PodiumCard({ tool, rank }: { tool: typeof MOCK_TOOLS[0]; rank: number }) {
  const [, navigate] = useLocation();
  const colors = {
    1: { border: 'border-amber-500/60', bg: 'bg-amber-500/10', text: 'text-amber-400', crown: 'text-amber-400' },
    2: { border: 'border-slate-400/40', bg: 'bg-slate-400/10', text: 'text-slate-300', crown: 'text-slate-400' },
    3: { border: 'border-orange-700/40', bg: 'bg-orange-700/10', text: 'text-orange-600', crown: 'text-orange-700' },
  }[rank] || { border: 'border-slate-700', bg: 'bg-slate-900', text: 'text-slate-400', crown: 'text-slate-500' };

  return (
    <div
      onClick={() => navigate(`/tools/${tool.slug}`)}
      className={`relative cursor-pointer rounded-2xl border ${colors.border} ${colors.bg} p-6 text-center hover:scale-[1.02] transition-transform duration-200`}
    >
      {rank === 1 && (
        <Crown className={`h-6 w-6 ${colors.crown} absolute -top-3 left-1/2 -translate-x-1/2`} />
      )}
      <div className={`text-4xl font-black ${colors.text} mb-3`}>#{rank}</div>
      <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-3 overflow-hidden">
        {tool.logo_url ? (
          <img src={tool.logo_url} alt={tool.name} className="w-10 h-10 object-contain" />
        ) : (
          <span className="text-2xl font-black text-amber-400">{tool.name[0]}</span>
        )}
      </div>
      <h3 className="text-base font-bold text-white mb-1">{tool.name}</h3>
      <p className="text-xs text-slate-400 mb-3 line-clamp-2">{tool.tagline}</p>
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <StarRow rating={tool.average_rating} />
        <span className={`text-lg font-black ${colors.text}`}>{tool.average_rating.toFixed(1)}</span>
      </div>
      <div className="text-xs text-slate-500">{tool.review_count} reviews</div>
    </div>
  );
}

export default function TopRated() {
  const [, navigate] = useLocation();
  const [category, setCategory] = useState('All Categories');
  const [minReviews, setMinReviews] = useState(0);
  const [pricingFilter, setPricingFilter] = useState('');

  const sortedTools = useMemo(() => {
    let tools = [...MOCK_TOOLS];

    if (category !== 'All Categories') {
      tools = tools.filter(t => t.category === category);
    }

    if (minReviews > 0) {
      tools = tools.filter(t => t.review_count >= minReviews);
    }

    if (pricingFilter) {
      tools = tools.filter(t => t.pricing_model === pricingFilter);
    }

    tools.sort((a, b) => {
      // Primary: average_rating, secondary: review_count (credibility weight)
      const ratingDiff = b.average_rating - a.average_rating;
      if (Math.abs(ratingDiff) > 0.05) return ratingDiff;
      return b.review_count - a.review_count;
    });

    return tools;
  }, [category, minReviews, pricingFilter]);

  const top3 = sortedTools.slice(0, 3);
  const rest = sortedTools.slice(3, 50);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-xs font-bold text-amber-400 uppercase tracking-widest">
              <Award className="h-3 w-3" /> Top Rated
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            Highest Community Scores
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Tools ranked by verified community ratings — weighted by review count, recency, and reviewer credibility.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-lg">
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-amber-400">{sortedTools.length}</div>
              <div className="text-xs text-slate-400 mt-0.5 font-medium">Rated Tools</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-emerald-400">{top3[0]?.average_rating.toFixed(1) || '—'}</div>
              <div className="text-xs text-slate-400 mt-0.5 font-medium">Top Score</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-white">
                {sortedTools.length
                  ? (sortedTools.reduce((s, t) => s + t.average_rating, 0) / sortedTools.length).toFixed(1)
                  : '—'}
              </div>
              <div className="text-xs text-slate-400 mt-0.5 font-medium">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={minReviews}
            onChange={e => setMinReviews(Number(e.target.value))}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            {MIN_REVIEWS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <select
            value={pricingFilter}
            onChange={e => setPricingFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="">All Pricing</option>
            {['Free', 'Freemium', 'Paid', 'Free Trial', 'Open Source'].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Podium top 3 */}
        {top3.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-10">
            {/* 2nd place */}
            <div className="mt-8"><PodiumCard tool={top3[1]} rank={2} /></div>
            {/* 1st place */}
            <div><PodiumCard tool={top3[0]} rank={1} /></div>
            {/* 3rd place */}
            <div className="mt-16"><PodiumCard tool={top3[2]} rank={3} /></div>
          </div>
        )}

        {/* Rest of the list */}
        <div className="space-y-2">
          {rest.map((tool, i) => (
            <div
              key={tool.id}
              onClick={() => navigate(`/tools/${tool.slug}`)}
              className="group bg-slate-900 border border-slate-800 rounded-xl px-5 py-4 cursor-pointer hover:border-amber-500/40 hover:bg-slate-800/80 transition-all duration-200 flex items-center gap-4"
            >
              {/* Rank */}
              <div className="w-8 shrink-0 text-center text-sm font-bold text-slate-500">
                #{i + 4}
              </div>

              {/* Logo */}
              <div className="w-10 h-10 shrink-0 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                {tool.logo_url ? (
                  <img src={tool.logo_url} alt={tool.name} className="w-7 h-7 object-contain" />
                ) : (
                  <span className="text-sm font-black text-amber-400">{tool.name[0]}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">{tool.name}</span>
                  {tool.is_verified && <Shield className="h-3.5 w-3.5 text-blue-400" />}
                  <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{tool.category}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{tool.tagline}</p>
              </div>

              {/* Rating */}
              <div className="shrink-0 flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="flex items-center gap-1 justify-end">
                    <StarRow rating={tool.average_rating} />
                    <span className="text-sm font-black text-amber-400 ml-1">{tool.average_rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 justify-end">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <MessageSquare className="h-3 w-3" />{tool.review_count}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <ThumbsUp className="h-3 w-3" />{tool.upvote_count}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>

        {sortedTools.length === 0 && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">⭐</div>
            <h3 className="text-xl font-bold text-white mb-2">No tools match these filters</h3>
            <p className="text-slate-400 text-sm">Try adjusting the category or review count filter</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
