"use client";

export const dynamic = 'force-dynamic';


// Design: LaudStack dark-slate + amber accent. Top Rated tools with podium and rating breakdown.
// Layout: Podium top-3 + ranked list with rating bars.
// URL persistence: ?category=AI+Writing&min=10&pricing=Free — defaults omitted for clean links.

import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { useToolsData } from '@/hooks/useToolsData';
import type { Tool } from '@/lib/types';
import { Star, Award, ChevronRight, MessageSquare, ThumbsUp, Shield, Crown, X } from 'lucide-react';

const CATEGORY_OPTIONS = ['All Categories', 'AI Writing', 'AI Image', 'AI Video', 'AI Code', 'AI Productivity', 'Design', 'Marketing', 'Developer Tools'];

const BADGE_LABELS: Record<string, string> = {
  editors_pick:   "Editor's Pick",
  top_rated:      'Top Rated',
  featured:       'Spotlight',
  verified:       'Verified',
  new_launch:     'New Launch',
  trending:       'Rising',
  pro_founder:    'Pro Founder',
  community_pick: 'Community Pick',
  best_value:     'Best Value',
  laudstack_pick: 'LaudStack Pick',
};

const BADGE_DOT: Record<string, string> = {
  editors_pick: '#7C3AED', top_rated: '#D97706', featured: '#1D4ED8',
  verified: '#15803D', new_launch: '#0369A1', trending: '#C2410C',
  pro_founder: '#F59E0B', community_pick: '#BE123C', best_value: '#15803D', laudstack_pick: '#D97706',
};
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

function PodiumCard({ tool, rank }: { tool: Tool; rank: number }) {
  const router = useRouter();
  const colors = {
    1: { border: 'border-amber-500/60', bg: 'bg-amber-500/10', text: 'text-amber-400', crown: 'text-amber-400' },
    2: { border: 'border-slate-400/40', bg: 'bg-slate-400/10', text: 'text-slate-600', crown: 'text-slate-500' },
    3: { border: 'border-orange-700/40', bg: 'bg-orange-700/10', text: 'text-orange-600', crown: 'text-orange-700' },
  }[rank] || { border: 'border-gray-300', bg: 'bg-white', text: 'text-slate-500', crown: 'text-slate-500' };

  return (
    <div
      onClick={() => router.push(`/tools/${tool.slug}`)}
      className={`relative cursor-pointer rounded-2xl border ${colors.border} ${colors.bg} p-6 text-center hover:scale-[1.02] transition-transform duration-200`}
    >
      {rank === 1 && (
        <Crown className={`h-6 w-6 ${colors.crown} absolute -top-3 left-1/2 -translate-x-1/2`} />
      )}
      <div className={`text-4xl font-black ${colors.text} mb-3`}>#{rank}</div>
      <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-300 flex items-center justify-center mx-auto mb-3 overflow-hidden">
        {tool.logo_url ? (
          <img src={tool.logo_url} alt={tool.name} className="w-10 h-10 object-contain" />
        ) : (
          <span className="text-2xl font-black text-amber-400">{tool.name[0]}</span>
        )}
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{tool.name}</h3>
      <p className="text-xs text-slate-500 mb-3 line-clamp-2">{tool.tagline}</p>
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <StarRow rating={tool.average_rating} />
        <span className={`text-lg font-black ${colors.text}`}>{tool.average_rating.toFixed(1)}</span>
      </div>
      <div className="text-xs text-slate-500">{tool.review_count} reviews</div>
    </div>
  );
}

// ── URL helpers ───────────────────────────────────────────────────────────────────────────────
function parseUrlFilters() {
  const p = new URLSearchParams(window.location.search);
  return {
    category:    p.get('category') || 'All Categories',
    minReviews:  Number(p.get('min') || 0),
    pricing:     p.get('pricing') || '',
    badge:       p.get('badge') || '',
  };
}

export default function TopRated() {
  const { tools: allTools, reviews: allReviews, loading: toolsLoading } = useToolsData();

  const router = useRouter();
  const pathname = usePathname();
  const [syncingFromUrl, setSyncingFromUrl] = useState(false);

  // Initialise from URL on first render
  const initial = parseUrlFilters();
  const [category,     setCategory]     = useState(initial.category);
  const [minReviews,   setMinReviews]   = useState(initial.minReviews);
  const [pricingFilter, setPricingFilter] = useState(initial.pricing);
  const [activeBadge,  setActiveBadge]  = useState(initial.badge);

  // Inbound: URL → state (handles browser back/forward and shared links)
  useEffect(() => {
    setSyncingFromUrl(true);
    const f = parseUrlFilters();
    setCategory(f.category);
    setMinReviews(f.minReviews);
    setPricingFilter(f.pricing);
    setActiveBadge(f.badge);
    setTimeout(() => setSyncingFromUrl(false), 0);
  }, [pathname]);

  // Outbound: state → URL (omit defaults to keep URLs clean)
  useEffect(() => {
    if (syncingFromUrl) return;
    const p = new URLSearchParams();
    if (category    !== 'All Categories') p.set('category', category);
    if (minReviews  !== 0)               p.set('min', String(minReviews));
    if (pricingFilter !== '')            p.set('pricing', pricingFilter);
    if (activeBadge !== '')             p.set('badge', activeBadge);
    const qs = p.toString();
    router.replace(qs ? `/top-rated?${qs}` : '/top-rated');
  }, [category, minReviews, pricingFilter, activeBadge, syncingFromUrl]);

  const sortedTools = useMemo(() => {
    let tools = [...allTools];

    if (category !== 'All Categories') {
      tools = tools.filter(t => t.category === category);
    }

    if (minReviews > 0) {
      tools = tools.filter(t => t.review_count >= minReviews);
    }

    if (pricingFilter) {
      tools = tools.filter(t => t.pricing_model === pricingFilter);
    }

    if (activeBadge) {
      tools = tools.filter(t => (t.badges || []).includes(activeBadge as any));
    }

    tools.sort((a, b) => {
      // Primary: average_rating, secondary: review_count (credibility weight)
      const ratingDiff = b.average_rating - a.average_rating;
      if (Math.abs(ratingDiff) > 0.05) return ratingDiff;
      return b.review_count - a.review_count;
    });

    return tools;
  }, [category, minReviews, pricingFilter, activeBadge]);

  const top3 = sortedTools.slice(0, 3);
  const rest = sortedTools.slice(3, 50);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <PageHero
        eyebrow="Top Rated"
        title="Highest Community Scores"
        subtitle="Tools ranked by verified community ratings — weighted by review count, recency, and reviewer credibility."
        accent="amber"
        layout="split"
        size="md"
      >
        {/* Top-3 award cards */}
        <div className="flex gap-2 sm:gap-2.5 flex-shrink-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {[{ rank: 1, medal: '🥇', bg: '#FFFBEB', border: '#FDE68A', rankColor: '#D97706' },
            { rank: 2, medal: '🥈', bg: '#F8FAFC', border: '#E2E8F0', rankColor: '#64748B' },
            { rank: 3, medal: '🥉', bg: '#FFF7ED', border: '#FED7AA', rankColor: '#C2410C' }].map(({ rank, medal, bg, border, rankColor }) => {
            const tool = top3[rank - 1];
            if (!tool) return null;
            return (
              <div
                key={rank}
                onClick={() => router.push(`/tools/${tool.slug}`)}
                style={{
                  background: bg, border: `1px solid ${border}`, borderRadius: '12px',
                  padding: '10px 12px', cursor: 'pointer', minWidth: '100px', textAlign: 'center',
                  transition: 'transform 0.15s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
              >
                <span style={{ fontSize: '20px' }}>{medal}</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fff', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {tool.logo_url
                    ? <img src={tool.logo_url} alt={tool.name} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                    : <span style={{ fontWeight: 900, fontSize: '14px', color: rankColor }}>{tool.name[0]}</span>}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#111827', lineHeight: 1.2, maxWidth: '110px' }}>{tool.name}</div>
                <div style={{ fontSize: '13px', fontWeight: 900, color: rankColor }}>{tool.average_rating.toFixed(1)}★</div>
                <div style={{ fontSize: '10px', color: '#9CA3AF' }}>{tool.review_count} reviews</div>
              </div>
            );
          })}
        </div>
      </PageHero>

      <div className="max-w-[1300px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
          >
            {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={minReviews}
            onChange={e => setMinReviews(Number(e.target.value))}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
          >
            {MIN_REVIEWS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <select
            value={pricingFilter}
            onChange={e => setPricingFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Pricing</option>
            {['Free', 'Freemium', 'Paid', 'Free Trial', 'Open Source'].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          {/* Badge active chip */}
          {activeBadge && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs text-purple-700 font-semibold">
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: BADGE_DOT[activeBadge] || '#7C3AED', display: 'inline-block', flexShrink: 0 }} />
              {BADGE_LABELS[activeBadge] || activeBadge}
              <button onClick={() => setActiveBadge('')} className="ml-0.5 text-purple-400 hover:text-purple-700">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {(category !== 'All Categories' || minReviews > 0 || pricingFilter || activeBadge) && (
            <button
              onClick={() => { setCategory('All Categories'); setMinReviews(0); setPricingFilter(''); setActiveBadge(''); }}
              className="text-xs text-amber-600 hover:text-amber-500 font-semibold"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Badge filter pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 self-center mr-1">Badges:</span>
          <button
            onClick={() => setActiveBadge('')}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
              activeBadge === '' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-gray-200 hover:border-slate-400'
            }`}
          >
            All
          </button>
          {Object.entries(BADGE_LABELS).map(([key, label]) => {
            const count = allTools.filter(t => (t.badges || []).includes(key as any)).length;
            if (count === 0) return null;
            const isActive = activeBadge === key;
            return (
              <button
                key={key}
                onClick={() => setActiveBadge(isActive ? '' : key)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                  isActive ? 'text-white border-transparent' : 'bg-white text-slate-600 border-gray-200 hover:border-slate-400'
                }`}
                style={isActive ? { background: BADGE_DOT[key] || '#7C3AED', borderColor: BADGE_DOT[key] || '#7C3AED' } : {}}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? 'rgba(255,255,255,0.7)' : (BADGE_DOT[key] || '#7C3AED'), display: 'inline-block', flexShrink: 0 }} />
                {label}
                <span className={`${isActive ? 'text-white/70' : 'text-slate-400'}`}>({count})</span>
              </button>
            );
          })}
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
              onClick={() => router.push(`/tools/${tool.slug}`)}
              className="group bg-white border border-gray-200 rounded-xl px-5 py-4 cursor-pointer hover:border-amber-500/40 hover:bg-gray-100/80 transition-all duration-200 flex items-center gap-4"
            >
              {/* Rank */}
              <div className="w-8 shrink-0 text-center text-sm font-bold text-slate-500">
                #{i + 4}
              </div>

              {/* Logo */}
              <div className="w-10 h-10 shrink-0 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden">
                {tool.logo_url ? (
                  <img src={tool.logo_url} alt={tool.name} className="w-7 h-7 object-contain" />
                ) : (
                  <span className="text-sm font-black text-amber-400">{tool.name[0]}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900 group-hover:text-amber-400 transition-colors">{tool.name}</span>
                  {tool.is_verified && <Shield className="h-3.5 w-3.5 text-blue-400" />}
                  <span className="text-xs text-slate-500 bg-gray-100 px-2 py-0.5 rounded-full">{tool.category}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{tool.tagline}</p>
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
            <h3 className="text-xl font-bold text-slate-900 mb-2">No tools match these filters</h3>
            <p className="text-slate-500 text-sm">Try adjusting the category or review count filter</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
