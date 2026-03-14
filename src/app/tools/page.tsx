"use client";

export const dynamic = 'force-dynamic';

/**
 * All Stacks — /tools
 *
 * Professional product catalog with sidebar filters, sorting, view modes,
 * and URL-synced filter state. Light theme, amber accent, clean alignment.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import { useToolsData } from '@/hooks/useToolsData';
import { CATEGORY_META as CATEGORIES } from '@/lib/categories';
import {
  Search, SlidersHorizontal, X, ChevronDown, ChevronUp,
  Grid3X3, List, ArrowUpDown, Sparkles, LayoutGrid,
  Star, Shield, Tag, Filter, Package
} from 'lucide-react';

/* ── Constants ──────────────────────────────────────────────────────────────── */

const PRICING_OPTIONS = ['Free', 'Freemium', 'Paid', 'Free Trial', 'Open Source'];

const SORT_OPTIONS = [
  { value: 'rank_score', label: 'Top Ranked' },
  { value: 'average_rating', label: 'Highest Rated' },
  { value: 'review_count', label: 'Most Reviewed' },
  { value: 'upvote_count', label: 'Most Upvoted' },
  { value: 'newest', label: 'Newest First' },
  { value: 'name', label: 'A–Z' },
];

const RATING_OPTIONS = [
  { value: 0, label: 'Any rating' },
  { value: 4.5, label: '4.5+ stars' },
  { value: 4, label: '4.0+ stars' },
  { value: 3.5, label: '3.5+ stars' },
];

const BADGE_LABELS: Record<string, string> = {
  editors_pick: "Editor's Pick",
  top_rated: 'Top Rated',
  featured: 'Spotlight',
  verified: 'Verified',
  new_launch: 'New Launch',
  trending: 'Rising',
  pro_founder: 'Pro Founder',
  community_pick: 'Community Pick',
  best_value: 'Best Value',
  laudstack_pick: 'LaudStack Pick',
};

const BADGE_COLORS: Record<string, string> = {
  editors_pick: '#7C3AED',
  top_rated: '#D97706',
  featured: '#1D4ED8',
  verified: '#15803D',
  new_launch: '#0369A1',
  trending: '#C2410C',
  pro_founder: '#F59E0B',
  community_pick: '#BE123C',
  best_value: '#15803D',
  laudstack_pick: '#D97706',
};

/* ── URL param helpers ──────────────────────────────────────────────────────── */

function parseParams(params: URLSearchParams) {
  const cat = params.get('category');
  const pricing = params.get('pricing');
  const rating = params.get('rating');
  const sort = params.get('sort');
  const q = params.get('q');
  const badge = params.get('badge');
  return {
    categories: cat ? decodeURIComponent(cat).split(',').map(c => c.trim()).filter(Boolean) : [],
    pricing: pricing ? decodeURIComponent(pricing).split(',').map(p => p.trim()).filter(Boolean) : [],
    rating: rating ? parseFloat(rating) : 0,
    sort: sort || 'rank_score',
    search: q ? decodeURIComponent(q) : '',
    badge: badge || '',
  };
}

/* ── Collapsible filter section ─────────────────────────────────────────────── */

function FilterSection({
  title,
  icon: Icon,
  expanded,
  onToggle,
  count,
  children,
}: {
  title: string;
  icon: React.ElementType;
  expanded: boolean;
  onToggle: () => void;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon style={{ width: 14, height: 14, color: '#6B7280' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1F2937', letterSpacing: '-0.01em' }}>{title}</span>
          {count !== undefined && count > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#B45309', background: '#FEF3C7',
              padding: '1px 6px', borderRadius: 10, minWidth: 18, textAlign: 'center',
            }}>
              {count}
            </span>
          )}
        </div>
        {expanded
          ? <ChevronUp style={{ width: 14, height: 14, color: '#9CA3AF' }} />
          : <ChevronDown style={{ width: 14, height: 14, color: '#9CA3AF' }} />
        }
      </button>
      {expanded && (
        <div style={{ padding: '0 12px 12px', maxHeight: 280, overflowY: 'auto' }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ── Checkbox / Radio row ───────────────────────────────────────────────────── */

function FilterCheckbox({
  label, checked, onChange, count, dot,
}: {
  label: string; checked: boolean; onChange: () => void; count?: number; dot?: string;
}) {
  return (
    <label
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 8px', borderRadius: 8, cursor: 'pointer',
        background: checked ? '#FFFBEB' : 'transparent',
        transition: 'background 0.12s',
      }}
      onMouseEnter={e => { if (!checked) e.currentTarget.style.background = '#F9FAFB'; }}
      onMouseLeave={e => { if (!checked) e.currentTarget.style.background = 'transparent'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          style={{ accentColor: '#F59E0B', width: 14, height: 14, cursor: 'pointer' }}
        />
        {dot && (
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot, flexShrink: 0 }} />
        )}
        <span style={{
          fontSize: 12, fontWeight: checked ? 700 : 500,
          color: checked ? '#92400E' : '#4B5563',
          transition: 'color 0.12s',
        }}>
          {label}
        </span>
      </div>
      {count !== undefined && (
        <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
          {count}
        </span>
      )}
    </label>
  );
}

function FilterRadio({
  label, checked, onChange, count,
}: {
  label: string; checked: boolean; onChange: () => void; count?: number;
}) {
  return (
    <label
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 8px', borderRadius: 8, cursor: 'pointer',
        background: checked ? '#FFFBEB' : 'transparent',
        transition: 'background 0.12s',
      }}
      onMouseEnter={e => { if (!checked) e.currentTarget.style.background = '#F9FAFB'; }}
      onMouseLeave={e => { if (!checked) e.currentTarget.style.background = 'transparent'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="radio"
          checked={checked}
          onChange={onChange}
          style={{ accentColor: '#F59E0B', width: 14, height: 14, cursor: 'pointer' }}
        />
        <span style={{
          fontSize: 12, fontWeight: checked ? 700 : 500,
          color: checked ? '#92400E' : '#4B5563',
        }}>
          {label}
        </span>
      </div>
      {count !== undefined && (
        <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>{count}</span>
      )}
    </label>
  );
}

/* ── Active filter chip ─────────────────────────────────────────────────────── */

function FilterChip({ label, color, onRemove }: { label: string; color: string; onRemove: () => void }) {
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 10px 3px 12px', borderRadius: 20,
        fontSize: 11, fontWeight: 600, color,
        background: `${color}12`, border: `1px solid ${color}30`,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
      <button
        onClick={onRemove}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color, display: 'flex', padding: 0 }}
      >
        <X style={{ width: 12, height: 12 }} />
      </button>
    </span>
  );
}

/* ── Main component ─────────────────────────────────────────────────────────── */

export default function AllTools() {
  const { tools: allTools, loading: toolsLoading } = useToolsData();
  const router = useRouter();
  const pathname = usePathname();

  const initialParams = useMemo(() => {
    if (typeof window === 'undefined') return { categories: [], pricing: [], rating: 0, sort: 'rank_score', search: '', badge: '' };
    return parseParams(new URLSearchParams(window.location.search));
  }, []);

  const [search, setSearch] = useState(initialParams.search);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialParams.categories);
  const [selectedPricing, setSelectedPricing] = useState<string[]>(initialParams.pricing);
  const [minRating, setMinRating] = useState(initialParams.rating);
  const [sortBy, setSortBy] = useState(initialParams.sort);
  const [activeBadge, setActiveBadge] = useState(initialParams.badge);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [catExpanded, setCatExpanded] = useState(true);
  const [pricingExpanded, setPricingExpanded] = useState(true);
  const [ratingExpanded, setRatingExpanded] = useState(true);
  const [badgeExpanded, setBadgeExpanded] = useState(true);
  const [syncingFromUrl, setSyncingFromUrl] = useState(false);
  const [visibleCount, setVisibleCount] = useState(30);

  /* ── URL sync: outbound ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (syncingFromUrl) return;
    const params = new URLSearchParams();
    if (selectedCategories.length > 0) params.set('category', selectedCategories.join(','));
    if (selectedPricing.length > 0) params.set('pricing', selectedPricing.join(','));
    if (minRating > 0) params.set('rating', String(minRating));
    if (sortBy !== 'rank_score') params.set('sort', sortBy);
    if (search.trim()) params.set('q', search.trim());
    if (activeBadge) params.set('badge', activeBadge);
    const qs = params.toString();
    const newPath = qs ? `/tools?${qs}` : '/tools';
    if (typeof window !== 'undefined' && window.location.pathname + window.location.search !== newPath) {
      router.replace(newPath);
    }
  }, [selectedCategories, selectedPricing, minRating, sortBy, search, activeBadge]);

  /* ── URL sync: inbound ──────────────────────────────────────────────────── */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (!params.toString()) return;
    const parsed = parseParams(params);
    setSyncingFromUrl(true);
    setSelectedCategories(parsed.categories);
    setSelectedPricing(parsed.pricing);
    setMinRating(parsed.rating);
    setSortBy(parsed.sort);
    setSearch(parsed.search);
    setActiveBadge(parsed.badge);
    setTimeout(() => setSyncingFromUrl(false), 0);
  }, [pathname]);

  /* ── Filtering + sorting ────────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    let tools = [...allTools];
    if (search.trim()) {
      const q = search.toLowerCase();
      tools = tools.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.tags || []).some(tag => tag.toLowerCase().includes(q))
      );
    }
    if (selectedCategories.length > 0) {
      tools = tools.filter(t => selectedCategories.includes(t.category));
    }
    if (selectedPricing.length > 0) {
      tools = tools.filter(t => selectedPricing.includes(t.pricing_model));
    }
    if (minRating > 0) {
      tools = tools.filter(t => (t.average_rating || 0) >= minRating);
    }
    if (activeBadge) {
      tools = tools.filter(t => (t.badges || []).includes(activeBadge as any));
    }
    tools.sort((a, b) => {
      switch (sortBy) {
        case 'average_rating': return (b.average_rating || 0) - (a.average_rating || 0);
        case 'review_count': return (b.review_count || 0) - (a.review_count || 0);
        case 'upvote_count': return (b.upvote_count || 0) - (a.upvote_count || 0);
        case 'newest': return new Date(b.launched_at).getTime() - new Date(a.launched_at).getTime();
        case 'name': return a.name.localeCompare(b.name);
        default: return (b.rank_score || 0) - (a.rank_score || 0);
      }
    });
    return tools;
  }, [allTools, search, selectedCategories, selectedPricing, minRating, sortBy, activeBadge]);

  const visibleTools = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  /* ── Toggle helpers ─────────────────────────────────────────────────────── */
  const toggleCategory = useCallback((cat: string) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
    setVisibleCount(30);
  }, []);

  const togglePricing = useCallback((p: string) => {
    setSelectedPricing(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
    setVisibleCount(30);
  }, []);

  const clearAll = useCallback(() => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedPricing([]);
    setMinRating(0);
    setSortBy('rank_score');
    setActiveBadge('');
    setVisibleCount(30);
  }, []);

  const hasFilters = selectedCategories.length > 0 || selectedPricing.length > 0 || minRating > 0 || search.trim() || !!activeBadge;
  const activeFilterCount = selectedCategories.length + selectedPricing.length + (minRating > 0 ? 1 : 0) + (activeBadge ? 1 : 0);

  /* ── Counts ─────────────────────────────────────────────────────────────── */
  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allTools.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
    return counts;
  }, [allTools]);

  const badgeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allTools.forEach(t => {
      (t.badges || []).forEach((b: string) => { counts[b] = (counts[b] || 0) + 1; });
    });
    return counts;
  }, [allTools]);

  const availableBadges = useMemo(() =>
    Object.entries(BADGE_LABELS)
      .filter(([key]) => (badgeCounts[key] || 0) > 0)
      .sort((a, b) => (badgeCounts[b[0]] || 0) - (badgeCounts[a[0]] || 0)),
  [badgeCounts]);

  const categoryNames = useMemo(() => CATEGORIES.filter(c => c.name !== 'All').map(c => c.name), []);

  /* ── Stats for hero ─────────────────────────────────────────────────────── */
  const avgRating = useMemo(() => {
    if (allTools.length === 0) return 0;
    return (allTools.reduce((sum, t) => sum + (t.average_rating || 0), 0) / allTools.length).toFixed(1);
  }, [allTools]);

  const totalReviews = useMemo(() => allTools.reduce((sum, t) => sum + (t.review_count || 0), 0), [allTools]);
  const verifiedCount = useMemo(() => allTools.filter(t => t.is_verified).length, [allTools]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFC' }}>
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        paddingTop: 100,
        paddingBottom: 0,
      }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 24px' }}>
          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
            <Link href="/" style={{ fontSize: 12, color: '#9CA3AF', textDecoration: 'none', fontWeight: 500 }}>Home</Link>
            <span style={{ fontSize: 11, color: '#D1D5DB' }}>/</span>
            <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>All Stacks</span>
          </nav>

          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: 11, fontWeight: 700, color: '#B45309',
                  background: '#FEF3C7', border: '1px solid #FDE68A',
                  padding: '3px 10px', borderRadius: 20,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  <Package style={{ width: 11, height: 11 }} />
                  Product Catalog
                </span>
              </div>
              <h1 style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 'clamp(28px, 3.5vw, 38px)',
                fontWeight: 900,
                color: '#111827',
                letterSpacing: '-0.025em',
                lineHeight: 1.15,
                margin: 0,
              }}>
                All Stacks
              </h1>
              <p style={{ fontSize: 15, color: '#6B7280', fontWeight: 400, margin: '8px 0 0', lineHeight: 1.6 }}>
                Discover {allTools.length} SaaS &amp; AI stacks, verified and ranked by the community.
              </p>
            </div>

            {/* Search bar */}
            <div style={{ position: 'relative', width: '100%', maxWidth: 340 }}>
              <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#9CA3AF', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => { setSearch(e.target.value); setVisibleCount(30); }}
                style={{
                  width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB',
                  borderRadius: 10, padding: '11px 36px 11px 40px', fontSize: 13,
                  color: '#111827', outline: 'none', fontFamily: 'inherit',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#F59E0B'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; }}
              />
              {search && (
                <button
                  onClick={() => { setSearch(''); setVisibleCount(30); }}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', padding: 0 }}
                >
                  <X style={{ width: 14, height: 14 }} />
                </button>
              )}
            </div>
          </div>

          {/* Stats strip */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
            padding: '16px 0',
            borderTop: '1px solid #F3F4F6',
          }}>
            {[
              { value: String(allTools.length), label: 'Products' },
              { value: String(avgRating), label: 'Avg Rating' },
              { value: totalReviews.toLocaleString(), label: 'Reviews' },
              { value: String(verifiedCount), label: 'Verified' },
              { value: String(CATEGORIES.length - 1), label: 'Categories' },
            ].map((stat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>{stat.value}</span>
                <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>{stat.label}</span>
                {i < 4 && <span style={{ width: 1, height: 16, background: '#E5E7EB', marginLeft: 18 }} />}
              </div>
            ))}
          </div>

          {/* Category quick-filter pills */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
            padding: '14px 0 18px',
            borderTop: '1px solid #F3F4F6',
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 4 }}>
              Quick filter:
            </span>
            {CATEGORIES.filter(c => c.name !== 'All').slice(0, 12).map(cat => {
              const isActive = selectedCategories.includes(cat.name);
              return (
                <button
                  key={cat.name}
                  onClick={() => toggleCategory(cat.name)}
                  style={{
                    padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.15s', border: '1px solid',
                    background: isActive ? '#F59E0B' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#4B5563',
                    borderColor: isActive ? '#F59E0B' : '#E5E7EB',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = '#FCD34D';
                      e.currentTarget.style.background = '#FFFBEB';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.background = '#FFFFFF';
                    }
                  }}
                >
                  {cat.icon} {cat.name}
                </button>
              );
            })}
            {selectedCategories.length > 0 && (
              <button
                onClick={() => setSelectedCategories([])}
                style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                  cursor: 'pointer', background: '#FEF2F2', color: '#DC2626',
                  border: '1px solid #FECACA', transition: 'all 0.15s',
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          MAIN CONTENT: SIDEBAR + GRID
      ═══════════════════════════════════════════════════════════════════════ */}
      <div style={{ maxWidth: 1300, margin: '0 auto', width: '100%', padding: '28px 24px 64px' }}>
        <div style={{ display: 'flex', gap: 28 }}>

          {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
          {sidebarOpen && (
            <aside style={{ width: 256, flexShrink: 0 }}>
              <div style={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 8 }}>

                {/* Sidebar header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, padding: '0 2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Filter style={{ width: 13, height: 13, color: '#6B7280' }} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Filters
                    </span>
                    {activeFilterCount > 0 && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: '#fff', background: '#F59E0B',
                        width: 18, height: 18, borderRadius: '50%', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        {activeFilterCount}
                      </span>
                    )}
                  </div>
                  {hasFilters && (
                    <button
                      onClick={clearAll}
                      style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Category */}
                <FilterSection
                  title="Category"
                  icon={LayoutGrid}
                  expanded={catExpanded}
                  onToggle={() => setCatExpanded(v => !v)}
                  count={selectedCategories.length || undefined}
                >
                  {categoryNames.map(cat => (
                    <FilterCheckbox
                      key={cat}
                      label={cat}
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      count={catCounts[cat] || 0}
                    />
                  ))}
                </FilterSection>

                {/* Pricing */}
                <FilterSection
                  title="Pricing"
                  icon={Tag}
                  expanded={pricingExpanded}
                  onToggle={() => setPricingExpanded(v => !v)}
                  count={selectedPricing.length || undefined}
                >
                  {PRICING_OPTIONS.map(p => (
                    <FilterCheckbox
                      key={p}
                      label={p}
                      checked={selectedPricing.includes(p)}
                      onChange={() => togglePricing(p)}
                    />
                  ))}
                </FilterSection>

                {/* Badges */}
                <FilterSection
                  title="Badges"
                  icon={Sparkles}
                  expanded={badgeExpanded}
                  onToggle={() => setBadgeExpanded(v => !v)}
                  count={activeBadge ? 1 : undefined}
                >
                  <FilterRadio
                    label="Any badge"
                    checked={activeBadge === ''}
                    onChange={() => setActiveBadge('')}
                    count={allTools.length}
                  />
                  {availableBadges.map(([key, label]) => (
                    <FilterCheckbox
                      key={key}
                      label={label}
                      checked={activeBadge === key}
                      onChange={() => setActiveBadge(activeBadge === key ? '' : key)}
                      count={badgeCounts[key] || 0}
                      dot={BADGE_COLORS[key]}
                    />
                  ))}
                </FilterSection>

                {/* Rating */}
                <FilterSection
                  title="Min Rating"
                  icon={Star}
                  expanded={ratingExpanded}
                  onToggle={() => setRatingExpanded(v => !v)}
                  count={minRating > 0 ? 1 : undefined}
                >
                  {RATING_OPTIONS.map(r => (
                    <FilterRadio
                      key={r.value}
                      label={r.label}
                      checked={minRating === r.value}
                      onChange={() => setMinRating(r.value)}
                    />
                  ))}
                </FilterSection>

              </div>
            </aside>
          )}

          {/* ── MAIN GRID AREA ──────────────────────────────────────────────── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Toolbar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 20, gap: 12, flexWrap: 'wrap',
            }}>
              {/* Left: toggle + count + active chips */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setSidebarOpen(v => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '7px 12px', borderRadius: 8,
                    background: '#FFFFFF', border: '1px solid #E5E7EB',
                    fontSize: 12, fontWeight: 600, color: '#4B5563',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#D1D5DB'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; }}
                >
                  <SlidersHorizontal style={{ width: 13, height: 13 }} />
                  {sidebarOpen ? 'Hide Filters' : 'Show Filters'}
                </button>

                <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>
                  <strong style={{ color: '#111827', fontWeight: 800 }}>{filtered.length}</strong>
                  {' '}product{filtered.length !== 1 ? 's' : ''}
                  {hasFilters && <span style={{ color: '#F59E0B', fontWeight: 600, marginLeft: 4 }}>(filtered)</span>}
                </span>

                {/* Active filter chips */}
                {selectedCategories.map(cat => (
                  <FilterChip key={cat} label={cat} color="#D97706" onRemove={() => toggleCategory(cat)} />
                ))}
                {selectedPricing.map(p => (
                  <FilterChip key={p} label={p} color="#2563EB" onRemove={() => togglePricing(p)} />
                ))}
                {activeBadge && (
                  <FilterChip label={BADGE_LABELS[activeBadge] || activeBadge} color="#7C3AED" onRemove={() => setActiveBadge('')} />
                )}
                {minRating > 0 && (
                  <FilterChip label={`${minRating}+ stars`} color="#059669" onRemove={() => setMinRating(0)} />
                )}
              </div>

              {/* Right: sort + view toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <ArrowUpDown style={{ position: 'absolute', left: 10, width: 12, height: 12, color: '#9CA3AF', pointerEvents: 'none' }} />
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    style={{
                      appearance: 'none',
                      background: '#FFFFFF', border: '1px solid #E5E7EB',
                      borderRadius: 8, padding: '7px 32px 7px 28px',
                      fontSize: 12, fontWeight: 600, color: '#374151',
                      cursor: 'pointer', outline: 'none',
                    }}
                  >
                    {SORT_OPTIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <ChevronDown style={{ position: 'absolute', right: 10, width: 12, height: 12, color: '#9CA3AF', pointerEvents: 'none' }} />
                </div>

                {/* View toggle */}
                <div style={{
                  display: 'flex', alignItems: 'center',
                  background: '#FFFFFF', border: '1px solid #E5E7EB',
                  borderRadius: 8, overflow: 'hidden',
                }}>
                  <button
                    onClick={() => setViewMode('grid')}
                    style={{
                      padding: '7px 9px', border: 'none', cursor: 'pointer',
                      background: viewMode === 'grid' ? '#F59E0B' : 'transparent',
                      color: viewMode === 'grid' ? '#FFFFFF' : '#9CA3AF',
                      display: 'flex', transition: 'all 0.15s',
                    }}
                  >
                    <Grid3X3 style={{ width: 14, height: 14 }} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    style={{
                      padding: '7px 9px', border: 'none', cursor: 'pointer',
                      background: viewMode === 'list' ? '#F59E0B' : 'transparent',
                      color: viewMode === 'list' ? '#FFFFFF' : '#9CA3AF',
                      display: 'flex', transition: 'all 0.15s',
                    }}
                  >
                    <List style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Tool grid / list */}
            {toolsLoading ? (
              /* Loading skeleton */
              <div style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'grid'
                  ? (sidebarOpen ? 'repeat(auto-fill, minmax(300px, 1fr))' : 'repeat(auto-fill, minmax(280px, 1fr))')
                  : '1fr',
                gap: 12,
              }}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} style={{
                    background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 16,
                    padding: 20, height: viewMode === 'grid' ? 180 : 100,
                  }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F3F4F6' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ width: '60%', height: 14, borderRadius: 6, background: '#F3F4F6', marginBottom: 8 }} />
                        <div style={{ width: '40%', height: 10, borderRadius: 4, background: '#F3F4F6', marginBottom: 12 }} />
                        <div style={{ width: '90%', height: 10, borderRadius: 4, background: '#F3F4F6', marginBottom: 6 }} />
                        <div style={{ width: '70%', height: 10, borderRadius: 4, background: '#F3F4F6' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              /* Empty state */
              <div style={{
                textAlign: 'center', padding: '80px 20px',
                background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 16,
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <h3 style={{
                  fontSize: 20, fontWeight: 800, color: '#111827',
                  letterSpacing: '-0.02em', margin: '0 0 8px',
                }}>
                  No stacks found
                </h3>
                <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 24px', lineHeight: 1.6 }}>
                  Try adjusting your filters or search term to find what you&apos;re looking for.
                </p>
                <button
                  onClick={clearAll}
                  style={{
                    padding: '10px 24px', borderRadius: 10,
                    background: '#F59E0B', color: '#FFFFFF',
                    fontSize: 13, fontWeight: 700, border: 'none',
                    cursor: 'pointer', transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div style={{
                  display: viewMode === 'grid' ? 'grid' : 'flex',
                  gridTemplateColumns: viewMode === 'grid'
                    ? (sidebarOpen ? 'repeat(auto-fill, minmax(300px, 1fr))' : 'repeat(auto-fill, minmax(280px, 1fr))')
                    : undefined,
                  flexDirection: viewMode === 'list' ? 'column' : undefined,
                  gap: 12,
                }}>
                  {visibleTools.map((tool, i) => (
                    <div
                      key={tool.id}
                      style={{
                        opacity: 0,
                        animation: `fadeSlideUp 0.3s ease forwards`,
                        animationDelay: `${Math.min(i, 15) * 25}ms`,
                      }}
                    >
                      <ToolCard
                        tool={tool}
                        rank={sortBy === 'rank_score' ? i + 1 : undefined}
                        hideCategory={selectedCategories.length === 1}
                      />
                    </div>
                  ))}
                </div>

                {/* Load more */}
                {hasMore && (
                  <div style={{ textAlign: 'center', marginTop: 32 }}>
                    <button
                      onClick={() => setVisibleCount(v => v + 30)}
                      style={{
                        padding: '12px 36px', borderRadius: 10,
                        background: '#FFFFFF', border: '1px solid #E5E7EB',
                        fontSize: 13, fontWeight: 700, color: '#374151',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#F59E0B';
                        e.currentTarget.style.color = '#B45309';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#E5E7EB';
                        e.currentTarget.style.color = '#374151';
                      }}
                    >
                      Load More ({filtered.length - visibleCount} remaining)
                    </button>
                  </div>
                )}

                {/* Results summary */}
                {!hasMore && filtered.length > 0 && (
                  <div style={{
                    textAlign: 'center', marginTop: 32, padding: '16px 0',
                    fontSize: 12, color: '#9CA3AF', fontWeight: 500,
                  }}>
                    Showing all {filtered.length} product{filtered.length !== 1 ? 's' : ''}
                    {hasFilters && ' matching your filters'}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* Keyframe animation */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
