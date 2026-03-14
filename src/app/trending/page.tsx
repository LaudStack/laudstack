"use client";

/*
 * Trending — LaudStack
 * Design: Clean light (#FAFAFA bg) + amber accent system per Build Plan v2.1
 * Layout: Hero stats → filter bar → full ranked list with sparklines + momentum badges
 * Typography: Inter variable font, tabular-nums rank display
 */

import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { useToolsData } from '@/hooks/useToolsData';
import {
  TrendingUp, Flame, Search, Star, MessageSquare,
  ChevronRight, ArrowUpRight, SlidersHorizontal, X,
} from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────────────────────

const PERIOD_OPTIONS = [
  { value: '7d',  label: 'This Week' },
  { value: '30d', label: 'This Month' },
  { value: 'all', label: 'All Time' },
];

const ALL_CATEGORIES = [
  'All Categories',
  'AI Analytics', 'AI Audio', 'AI Code', 'AI Image',
  'AI Productivity', 'AI Video', 'AI Writing',
  'CRM', 'Customer Support', 'Design',
  'Developer Tools', 'Marketing', 'Project Management', 'Sales',
];

const SORT_OPTIONS = [
  { value: 'rank_change', label: 'Rank Gain' },
  { value: 'rating',      label: 'Top Rated' },
  { value: 'upvotes',     label: 'Most Lauded' },
  { value: 'reviews',     label: 'Most Reviewed' },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function Sparkline({ change, color }: { change: number; color: string }) {
  const heights = [0.22, 0.35, 0.28, 0.48, 0.60, 0.78, 1.0];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '24px' }}>
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            width: '4px',
            height: `${h * 24}px`,
            borderRadius: '2px',
            background: i === 6
              ? color
              : `${color}${Math.round(30 + h * 130).toString(16).padStart(2, '0')}`,
          }}
        />
      ))}
    </div>
  );
}

function MomentumChip({ change }: { change: number }) {
  const tier =
    change >= 20 ? { emoji: '🚀', label: 'Rocket', color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' } :
    change >= 12 ? { emoji: '🔥', label: 'Hot',    color: '#D97706', bg: '#FFF7ED', border: '#FCD34D' } :
                   { emoji: '📈', label: 'Rising', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '3px',
      fontSize: '10px', fontWeight: 700,
      color: tier.color, background: tier.bg, border: `1px solid ${tier.border}`,
      padding: '2px 7px', borderRadius: '20px', letterSpacing: '0.02em', whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: '9px' }}>{tier.emoji}</span>
      {tier.label}
    </span>
  );
}

function StatCard({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #E8ECF0', borderRadius: '12px',
      padding: '14px 16px', minWidth: '100px',
    }}>
      <div style={{ fontSize: '24px', fontWeight: 900, color: '#171717', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', marginTop: '4px', letterSpacing: '0.01em' }}>{label}</div>
      {sub && <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '2px' }}>{sub}</div>}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

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

// Helper: parse Trending filter params from URL
function parseTrendingParams(params: URLSearchParams) {
  return {
    period:   params.get('period')   || '7d',
    category: params.get('category') || 'All Categories',
    sort:     params.get('sort')     || 'rank_change',
    query:    params.get('q')        ? decodeURIComponent(params.get('q')!) : '',
    badge:    params.get('badge')    || '',
  };
}

export default function Trending() {
  const { tools: allTools, reviews: allReviews, loading: toolsLoading } = useToolsData();

  const router = useRouter();
  const pathname = usePathname();

  const initial = useMemo(() => parseTrendingParams(new URLSearchParams(window.location.search)), []);

  const [period,      setPeriod]      = useState(initial.period);
  const [category,    setCategory]    = useState(initial.category);
  const [sortBy,      setSortBy]      = useState(initial.sort);
  const [query,       setQuery]       = useState(initial.query);
  const [activeBadge, setActiveBadge] = useState(initial.badge);
  const [showFilters, setShowFilters] = useState(false);
  const [syncingFromUrl, setSyncingFromUrl] = useState(false);

  // ── Outbound: write filter state → URL ──────────────────────────────────────
  useEffect(() => {
    if (syncingFromUrl) return;
    const params = new URLSearchParams();
    if (period   !== '7d')             params.set('period',   period);
    if (category !== 'All Categories') params.set('category', category);
    if (sortBy   !== 'rank_change')    params.set('sort',     sortBy);
    if (query.trim())                  params.set('q',        query.trim());
    if (activeBadge)                   params.set('badge',    activeBadge);
    const qs = params.toString();
    const newPath = qs ? `/trending?${qs}` : '/trending';
    if (window.location.pathname + window.location.search !== newPath) {
      router.replace(newPath);
    }
  }, [period, category, sortBy, query, activeBadge]);

  // ── Inbound: read URL → filter state on external navigation ─────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.toString()) return;
    const parsed = parseTrendingParams(params);
    setSyncingFromUrl(true);
    setPeriod(parsed.period);
    setCategory(parsed.category);
    setSortBy(parsed.sort);
    setQuery(parsed.query);
    setActiveBadge(parsed.badge);
    setTimeout(() => setSyncingFromUrl(false), 0);
  }, [pathname]);

  const trendingTools = useMemo(() => {
    let tools = allTools.filter(t => (t.weekly_rank_change || 0) > 0);

    if (category !== 'All Categories') {
      tools = tools.filter(t => t.category === category);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      tools = tools.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }

    if (activeBadge) {
      tools = tools.filter(t => (t.badges || []).includes(activeBadge as any));
    }

    tools.sort((a, b) => {
      if (sortBy === 'rank_change') return (b.weekly_rank_change || 0) - (a.weekly_rank_change || 0);
      if (sortBy === 'rating')      return b.average_rating - a.average_rating;
      if (sortBy === 'upvotes')     return b.upvote_count - a.upvote_count;
      if (sortBy === 'reviews')     return b.review_count - a.review_count;
      return 0;
    });

    return tools;
  }, [period, category, sortBy, query, activeBadge]);

  const topGain   = allTools.filter(t => (t.weekly_rank_change || 0) > 0)
                               .reduce((max, t) => Math.max(max, t.weekly_rank_change || 0), 0);
  const totalRising = allTools.filter(t => (t.weekly_rank_change || 0) > 0).length;
  const avgGain   = totalRising
    ? Math.round(allTools.filter(t => (t.weekly_rank_change || 0) > 0)
        .reduce((s, t) => s + (t.weekly_rank_change || 0), 0) / totalRising)
    : 0;
  const rocketCount = allTools.filter(t => (t.weekly_rank_change || 0) >= 20).length;

  const getMomentumColor = (change: number) =>
    change >= 20 ? '#F59E0B' : change >= 12 ? '#D97706' : '#16A34A';

  const fadeUp = {
    hidden:  { opacity: 0, y: 16 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.3, delay: i * 0.04 } }),
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <PageHero
        eyebrow="Rising This Week"
        title="What's Hot Right Now"
        subtitle="Tools ranked by weekly position gain — the fastest-climbing SaaS and AI stacks in the community right now."
        accent="amber"
        layout="split"
        size="md"
        stats={[
          { value: String(totalRising), label: 'Rising Tools' },
          { value: `+${topGain}`,       label: 'Top Gain' },
          { value: `+${avgGain}`,       label: 'Avg Gain' },
          { value: String(rocketCount), label: 'Rocket Tier' },
        ]}
      />

      {/* ── Filters + List ──────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 pb-16">

        {/* Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#FFFFFF', border: '1px solid #E8ECF0', borderRadius: '10px',
            padding: '8px 12px', flex: '1', minWidth: '140px', maxWidth: '320px',
          }}>
            <Search style={{ width: '14px', height: '14px', color: '#9CA3AF', flexShrink: 0 }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search rising stacks…"
              style={{
                flex: 1, border: 'none', outline: 'none', fontSize: '13px',
                color: '#171717', background: 'transparent', fontFamily: 'inherit',
              }}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9CA3AF', display: 'flex' }}>
                <X style={{ width: '13px', height: '13px' }} />
              </button>
            )}
          </div>

          {/* Period toggle */}
          <div style={{ display: 'flex', background: '#FFFFFF', border: '1px solid #E8ECF0', borderRadius: '10px', overflow: 'hidden' }}>
            {PERIOD_OPTIONS.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                style={{
                  padding: '8px 14px', fontSize: '12px', fontWeight: 700,
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                  background: period === p.value ? '#F59E0B' : 'transparent',
                  color: period === p.value ? '#0A0A0A' : '#6B7280',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Category select */}
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{
              background: '#FFFFFF', border: '1px solid #E8ECF0', borderRadius: '10px',
              padding: '8px 12px', fontSize: '12px', fontWeight: 600, color: '#374151',
              outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Sort select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FFFFFF', border: '1px solid #E8ECF0', borderRadius: '10px', padding: '8px 12px' }}>
            <SlidersHorizontal style={{ width: '13px', height: '13px', color: '#9CA3AF' }} />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                border: 'none', outline: 'none', fontSize: '12px', fontWeight: 600,
                color: '#374151', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* Active badge chip */}
          {activeBadge && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', background: '#F5F3FF', border: '1px solid #DDD6FE', fontSize: '12px', fontWeight: 700, color: '#6D28D9' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: BADGE_DOT[activeBadge] || '#7C3AED', display: 'inline-block', flexShrink: 0 }} />
              {BADGE_LABELS[activeBadge] || activeBadge}
              <button onClick={() => setActiveBadge('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#A78BFA', display: 'flex', alignItems: 'center' }}>
                <X style={{ width: '12px', height: '12px' }} />
              </button>
            </span>
          )}

          {/* Result count */}
          <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 500, marginLeft: 'auto' }}>
            {trendingTools.length} tool{trendingTools.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Badge filter pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: '4px' }}>Badges:</span>
          <button
            onClick={() => setActiveBadge('')}
            style={{
              padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
              background: activeBadge === '' ? '#171717' : '#FFFFFF',
              color: activeBadge === '' ? '#FFFFFF' : '#6B7280',
              border: activeBadge === '' ? '1px solid #171717' : '1px solid #E8ECF0',
            }}
          >All</button>
          {Object.entries(BADGE_LABELS).map(([key, label]) => {
            const count = allTools.filter(t => (t.badges || []).includes(key as any)).length;
            if (count === 0) return null;
            const isActive = activeBadge === key;
            return (
              <button
                key={key}
                onClick={() => setActiveBadge(isActive ? '' : key)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                  background: isActive ? (BADGE_DOT[key] || '#7C3AED') : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#6B7280',
                  border: `1px solid ${isActive ? (BADGE_DOT[key] || '#7C3AED') : '#E8ECF0'}`,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? 'rgba(255,255,255,0.7)' : (BADGE_DOT[key] || '#7C3AED'), display: 'inline-block', flexShrink: 0 }} />
                {label} <span style={{ opacity: 0.6 }}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* ── Ranked list ─────────────────────────────────────────────── */}
        {trendingTools.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#171717', marginBottom: '8px' }}>No results found</h3>
            <p style={{ fontSize: '14px', color: '#9CA3AF' }}>
              {query ? `No rising stacks match "${query}"` : 'Try selecting "All Categories"'}
            </p>
            {(query || category !== 'All Categories') && (
              <button
                onClick={() => { setQuery(''); setCategory('All Categories'); }}
                style={{ marginTop: '16px', fontSize: '13px', fontWeight: 700, color: '#F59E0B', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '2px' }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {trendingTools.map((tool, i) => {
              const change = tool.weekly_rank_change ?? 0;
              const color  = getMomentumColor(change);

              return (
                <div
                  key={tool.id}
                  
                >
                  <div
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E8ECF0',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'box-shadow 0.18s, border-color 0.18s, transform 0.18s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.boxShadow = '0 6px 24px rgba(245,158,11,0.12), 0 2px 6px rgba(0,0,0,0.05)';
                      el.style.borderColor = '#FCD34D';
                      el.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                      el.style.borderColor = '#E8ECF0';
                      el.style.transform = 'translateY(0)';
                    }}
                    onClick={() => router.push(`/tools/${tool.slug}`)}
                  >
                    {/* Top accent stripe */}
                    <div style={{ height: '2px', background: `linear-gradient(90deg, ${color} 0%, ${color}30 100%)` }} />

                    <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>

                      {/* Rank number */}
                      <div style={{ flexShrink: 0, width: '36px', textAlign: 'center' }}>
                        <span style={{
                          fontSize: '20px', fontWeight: 900, lineHeight: 1,
                          letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums',
                          color: i === 0 ? '#F59E0B' : i === 1 ? '#9CA3AF' : i === 2 ? '#D97706' : '#D1D5DB',
                        }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>

                      {/* Tool logo */}
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '10px',
                        border: '1px solid #E8ECF0', background: '#F8FAFC',
                        overflow: 'hidden', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <img
                          src={tool.logo_url}
                          alt={tool.name}
                          style={{ width: '34px', height: '34px', objectFit: 'contain' }}
                          onError={e => {
                            (e.target as HTMLImageElement).src =
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=f1f5f9&color=64748b&size=34`;
                          }}
                        />
                      </div>

                      {/* Main info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                          <span style={{
                            fontSize: '14px', fontWeight: 800, color: '#171717',
                            letterSpacing: '-0.01em', whiteSpace: 'nowrap',
                            overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60vw',
                          }}>
                            {tool.name}
                          </span>
                          <MomentumChip change={change} />
                          <span style={{
                            fontSize: '10px', fontWeight: 600, color: '#6B7280',
                            background: '#F3F4F6', padding: '2px 7px', borderRadius: '5px',
                          }}>
                            {tool.category}
                          </span>
                        </div>
                        <p style={{
                          fontSize: '12px', color: '#6B7280', lineHeight: 1.4,
                          overflow: 'hidden', display: '-webkit-box',
                          WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                        }}>
                          {tool.tagline}
                        </p>

                        {/* Stats row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 700, color: '#374151' }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            {tool.average_rating.toFixed(1)}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#9CA3AF' }}>
                            <MessageSquare style={{ width: '10px', height: '10px' }} />
                            {tool.review_count}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#9CA3AF' }}>
                            <TrendingUp style={{ width: '10px', height: '10px' }} />
                            {tool.upvote_count.toLocaleString()}
                          </span>
                          <span style={{
                            fontSize: '10px', fontWeight: 600, color: '#6B7280',
                            background: '#F3F4F6', padding: '2px 6px', borderRadius: '4px',
                          }}>
                            {tool.pricing_model}
                          </span>
                        </div>
                      </div>

                      {/* Sparkline — hidden on mobile */}
                      <div className="hidden md:block" style={{ flexShrink: 0 }}>
                        <Sparkline change={change} color={color} />
                      </div>

                      {/* Rank change badge */}
                      <div style={{
                        flexShrink: 0, display: 'flex', flexDirection: 'column',
                        alignItems: 'flex-end', gap: '4px',
                      }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '3px',
                          background: change >= 20 ? '#FFFBEB' : change >= 12 ? '#FFF7ED' : '#F0FDF4',
                          border: `1px solid ${change >= 20 ? '#FDE68A' : change >= 12 ? '#FCD34D' : '#BBF7D0'}`,
                          borderRadius: '8px', padding: '4px 10px',
                        }}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="18 15 12 9 6 15"/>
                          </svg>
                          <span style={{ fontSize: '13px', fontWeight: 900, color, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
                            +{change}
                          </span>
                        </div>
                        <span style={{ fontSize: '9px', color: '#9CA3AF', fontWeight: 500, textAlign: 'right' }}>rank gain</span>
                      </div>

                      {/* Arrow */}
                      <ChevronRight style={{ width: '15px', height: '15px', color: '#D1D5DB', flexShrink: 0 }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        {trendingTools.length > 0 && (
          <div style={{
            marginTop: '40px', padding: '20px 16px',
            background: '#FFFFFF', border: '1px solid #E8ECF0', borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#171717', marginBottom: '4px' }}>
                Want your tool on this list?
              </div>
              <div style={{ fontSize: '13px', color: '#6B7280' }}>
                Launch your AI or SaaS tool and let the community decide where it ranks.
              </div>
            </div>
            <button
              onClick={() => router.push('/launchpad')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '10px 20px', borderRadius: '10px',
                background: '#F59E0B', color: '#0A0A0A',
                fontWeight: 800, fontSize: '13px', border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(245,158,11,0.25)', transition: 'all 0.15s',
                fontFamily: 'inherit', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#D97706'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F59E0B'; }}
            >
              <ArrowUpRight style={{ width: '14px', height: '14px' }} />
              Launch Your Tool
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
