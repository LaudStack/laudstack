"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import LogoWithFallback from '@/components/LogoWithFallback';
import { useToolsData } from '@/hooks/useToolsData';
import type { Tool } from '@/lib/types';
import { Star, ChevronRight, MessageSquare, ThumbsUp, Shield, Crown, X } from 'lucide-react';

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
          className={`h-3.5 w-3.5 ${s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
        />
      ))}
    </div>
  );
}

/* ── Podium Card ─────────────────────────────────────────────────────── */
function PodiumCard({ tool, rank }: { tool: Tool; rank: number }) {
  const colors = {
    1: { border: 'border-amber-500/60', bg: 'bg-amber-50', text: 'text-amber-500', crown: 'text-amber-400' },
    2: { border: 'border-slate-300', bg: 'bg-slate-50', text: 'text-slate-500', crown: 'text-slate-400' },
    3: { border: 'border-orange-400/50', bg: 'bg-orange-50', text: 'text-orange-500', crown: 'text-orange-400' },
  }[rank] || { border: 'border-gray-300', bg: 'bg-white', text: 'text-slate-500', crown: 'text-slate-500' };

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className={`relative block rounded-2xl border ${colors.border} ${colors.bg} p-4 sm:p-6 text-center hover:scale-[1.02] transition-transform duration-200`}
    >
      {rank === 1 && (
        <Crown className={`h-5 w-5 sm:h-6 sm:w-6 ${colors.crown} absolute -top-3 left-1/2 -translate-x-1/2`} />
      )}
      <div className={`text-2xl sm:text-4xl font-black ${colors.text} mb-2 sm:mb-3`}>#{rank}</div>
      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white border border-gray-200 flex items-center justify-center mx-auto mb-2 sm:mb-3 overflow-hidden">
        <LogoWithFallback
          src={tool.logo_url || ''}
          alt={tool.name}
          className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
          fallbackSize="text-lg sm:text-2xl"
        />
      </div>
      <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-0.5 sm:mb-1 truncate">{tool.name}</h3>
      <p className="text-[11px] sm:text-xs text-slate-500 mb-2 sm:mb-3 line-clamp-2">{tool.tagline}</p>
      <div className="flex items-center justify-center gap-1.5 mb-0.5 sm:mb-1">
        <StarRow rating={tool.average_rating} />
        <span className={`text-base sm:text-lg font-black ${colors.text}`}>{tool.average_rating.toFixed(1)}</span>
      </div>
      <div className="text-[10px] sm:text-xs text-slate-500">{tool.review_count} reviews</div>
    </Link>
  );
}

/* ── Hero Award Mini Card ────────────────────────────────────────────── */
const HERO_AWARD_STYLES = [
  { bg: 'bg-amber-50', border: 'border-amber-200', rankColor: 'text-amber-600', medal: '🥇' },
  { bg: 'bg-slate-50', border: 'border-slate-200', rankColor: 'text-slate-500', medal: '🥈' },
  { bg: 'bg-orange-50', border: 'border-orange-200', rankColor: 'text-orange-600', medal: '🥉' },
];

/* ── Skeletons ───────────────────────────────────────────────────────── */
function PodiumSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-10">
      {[8, 0, 16].map((mt, i) => (
        <div key={i} className={`rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 text-center animate-pulse`} style={{ marginTop: `${mt * 4}px` }}>
          <div className="h-6 sm:h-10 w-8 sm:w-12 bg-gray-200 rounded mx-auto mb-2 sm:mb-3" />
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-xl sm:rounded-2xl mx-auto mb-2 sm:mb-3" />
          <div className="h-4 w-20 bg-gray-200 rounded mx-auto mb-1" />
          <div className="h-3 w-28 bg-gray-100 rounded mx-auto mb-2" />
          <div className="h-4 w-16 bg-gray-200 rounded mx-auto mb-1" />
          <div className="h-3 w-14 bg-gray-100 rounded mx-auto" />
        </div>
      ))}
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-3 sm:px-5 py-3 sm:py-4 flex items-center gap-3 sm:gap-4 animate-pulse">
      <div className="w-8 shrink-0"><div className="h-4 w-6 bg-gray-200 rounded mx-auto" /></div>
      <div className="w-10 h-10 shrink-0 rounded-lg bg-gray-200" />
      <div className="flex-1 min-w-0">
        <div className="h-4 w-32 bg-gray-200 rounded mb-1" />
        <div className="h-3 w-48 bg-gray-100 rounded" />
      </div>
      <div className="shrink-0 hidden sm:block">
        <div className="h-4 w-20 bg-gray-200 rounded mb-1 ml-auto" />
        <div className="h-3 w-16 bg-gray-100 rounded ml-auto" />
      </div>
      <div className="w-4 h-4 bg-gray-200 rounded shrink-0" />
    </div>
  );
}

/* ── URL helpers ─────────────────────────────────────────────────────── */
function parseUrlFilters() {
  const p = new URLSearchParams(window.location.search);
  return {
    category:   p.get('category') || 'All Categories',
    minReviews: Number(p.get('min') || 0),
    pricing:    p.get('pricing') || '',
    badge:      p.get('badge') || '',
  };
}

/* ── Main Component ──────────────────────────────────────────────────── */
export default function TopRated() {
  const { tools: allTools, loading: toolsLoading } = useToolsData();

  const router = useRouter();
  const pathname = usePathname();
  const [syncingFromUrl, setSyncingFromUrl] = useState(false);

  const initial = parseUrlFilters();
  const [category, setCategory] = useState(initial.category);
  const [minReviews, setMinReviews] = useState(initial.minReviews);
  const [pricingFilter, setPricingFilter] = useState(initial.pricing);
  const [activeBadge, setActiveBadge] = useState(initial.badge);

  // Inbound: URL → state
  useEffect(() => {
    setSyncingFromUrl(true);
    const f = parseUrlFilters();
    setCategory(f.category);
    setMinReviews(f.minReviews);
    setPricingFilter(f.pricing);
    setActiveBadge(f.badge);
    setTimeout(() => setSyncingFromUrl(false), 0);
  }, [pathname]);

  // Outbound: state → URL
  useEffect(() => {
    if (syncingFromUrl) return;
    const p = new URLSearchParams();
    if (category !== 'All Categories') p.set('category', category);
    if (minReviews !== 0) p.set('min', String(minReviews));
    if (pricingFilter !== '') p.set('pricing', pricingFilter);
    if (activeBadge !== '') p.set('badge', activeBadge);
    const qs = p.toString();
    router.replace(qs ? `/top-rated?${qs}` : '/top-rated', { scroll: false });
  }, [category, minReviews, pricingFilter, activeBadge, syncingFromUrl, router]);

  const sortedTools = useMemo(() => {
    let tools = [...allTools];
    if (category !== 'All Categories') tools = tools.filter(t => t.category === category);
    if (minReviews > 0) tools = tools.filter(t => t.review_count >= minReviews);
    if (pricingFilter) tools = tools.filter(t => t.pricing_model === pricingFilter);
    if (activeBadge) tools = tools.filter(t => (t.badges || []).includes(activeBadge as any));
    tools.sort((a, b) => {
      const ratingDiff = b.average_rating - a.average_rating;
      if (Math.abs(ratingDiff) > 0.05) return ratingDiff;
      return b.review_count - a.review_count;
    });
    return tools;
  }, [allTools, category, minReviews, pricingFilter, activeBadge]);

  const top3 = sortedTools.slice(0, 3);
  const rest = sortedTools.slice(3, 50);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <PageHero
        eyebrow="Top Rated"
        title="Highest Community Scores"
        subtitle="Stacks ranked by verified community ratings — weighted by review count, recency, and reviewer credibility."
        accent="amber"
        layout="split"
        size="md"
      >
        {/* Top-3 award mini cards */}
        <div className="flex gap-2 sm:gap-2.5 shrink-0 overflow-x-auto scrollbar-hide">
          {HERO_AWARD_STYLES.map(({ bg, border, rankColor, medal }, idx) => {
            const tool = top3[idx];
            if (!tool) return null;
            return (
              <Link
                key={idx}
                href={`/tools/${tool.slug}`}
                className={`${bg} border ${border} rounded-xl px-3 py-2.5 min-w-[100px] text-center flex flex-col items-center gap-1.5 hover:-translate-y-0.5 transition-transform duration-150`}
              >
                <span className="text-xl leading-none">{medal}</span>
                <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                  <LogoWithFallback
                    src={tool.logo_url || ''}
                    alt={tool.name}
                    className="w-6 h-6 object-contain"
                    fallbackSize="text-sm"
                  />
                </div>
                <div className="text-xs font-bold text-gray-900 leading-tight max-w-[110px] truncate">{tool.name}</div>
                <div className={`text-[13px] font-black ${rankColor}`}>{tool.average_rating.toFixed(1)}★</div>
                <div className="text-[10px] text-gray-400">{tool.review_count} reviews</div>
              </Link>
            );
          })}
        </div>
      </PageHero>

      <div className="max-w-[1300px] mx-auto w-full px-4 sm:px-6 py-8">
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
              <span className="w-[7px] h-[7px] rounded-full inline-block shrink-0" style={{ background: BADGE_DOT[activeBadge] || '#7C3AED' }} />
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
                <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0" style={{ background: isActive ? 'rgba(255,255,255,0.7)' : (BADGE_DOT[key] || '#7C3AED') }} />
                {label}
                <span className={`${isActive ? 'text-white/70' : 'text-slate-400'}`}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Loading state */}
        {toolsLoading && (
          <>
            <PodiumSkeleton />
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)}
            </div>
          </>
        )}

        {/* Podium top 3 */}
        {!toolsLoading && top3.length >= 3 && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-10">
            <div className="mt-4 sm:mt-8"><PodiumCard tool={top3[1]} rank={2} /></div>
            <div><PodiumCard tool={top3[0]} rank={1} /></div>
            <div className="mt-8 sm:mt-16"><PodiumCard tool={top3[2]} rank={3} /></div>
          </div>
        )}

        {/* Rest of the list */}
        {!toolsLoading && rest.length > 0 && (
          <div className="space-y-2">
            {rest.map((tool, i) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                className="group bg-white border border-gray-200 rounded-xl px-3 sm:px-5 py-3 sm:py-4 hover:border-amber-500/40 hover:bg-gray-50 transition-all duration-200 flex items-center gap-3 sm:gap-4"
              >
                {/* Rank */}
                <div className="w-6 sm:w-8 shrink-0 text-center text-xs sm:text-sm font-bold text-slate-400">
                  #{i + 4}
                </div>

                {/* Logo */}
                <div className="w-10 h-10 shrink-0 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
                  <LogoWithFallback
                    src={tool.logo_url || ''}
                    alt={tool.name}
                    className="w-7 h-7 object-contain"
                    fallbackSize="text-sm"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900 group-hover:text-amber-500 transition-colors truncate">{tool.name}</span>
                    {tool.is_verified && <Shield className="h-3.5 w-3.5 text-blue-400 shrink-0" />}
                    <span className="text-xs text-slate-500 bg-gray-100 px-2 py-0.5 rounded-full hidden sm:inline">{tool.category}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{tool.tagline}</p>
                </div>

                {/* Rating */}
                <div className="shrink-0 flex items-center gap-2 sm:gap-3">
                  {/* Mobile: compact rating */}
                  <span className="text-sm font-black text-amber-500 sm:hidden">{tool.average_rating.toFixed(1)}</span>
                  {/* Desktop: full rating */}
                  <div className="text-right hidden sm:block">
                    <div className="flex items-center gap-1 justify-end">
                      <StarRow rating={tool.average_rating} />
                      <span className="text-sm font-black text-amber-500 ml-1">{tool.average_rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 justify-end">
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <MessageSquare className="h-3 w-3" />{tool.review_count}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <ThumbsUp className="h-3 w-3" />{tool.upvote_count}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!toolsLoading && sortedTools.length === 0 && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">⭐</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No stacks match these filters</h3>
            <p className="text-slate-500 text-sm mb-4">Try adjusting the category or review count filter</p>
            <button
              onClick={() => { setCategory('All Categories'); setMinReviews(0); setPricingFilter(''); setActiveBadge(''); }}
              className="text-sm text-amber-600 hover:text-amber-500 font-semibold"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
