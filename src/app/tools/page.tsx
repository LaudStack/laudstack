"use client";

/**
 * All Stacks — /tools
 *
 * Professional stack catalog with sidebar filters, sorting, view modes,
 * and URL-synced filter state. Light theme, amber accent, clean alignment.
 * Card design matches /new-launches polished style.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToolsData, invalidateToolsCache } from '@/hooks/useToolsData';
import { CATEGORY_META as CATEGORIES } from '@/lib/categories';
import { toggleUpvote } from '@/app/actions/public';
import {
  Search, SlidersHorizontal, X, ChevronDown, ChevronUp,
  Grid3X3, List, ArrowUpDown, Sparkles, LayoutGrid,
  Star, ShieldCheck, Tag, Filter, Package, Loader2,
  ChevronRight, Rocket,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Tool } from '@/lib/types';

/* ── Constants ──────────────────────────────────────────────────────────────── */

const PRICING_OPTIONS = ['Free', 'Freemium', 'Paid', 'Free Trial', 'Open Source'];

const SORT_OPTIONS = [
  { value: 'rank_score', label: 'Top Ranked' },
  { value: 'average_rating', label: 'Highest Rated' },
  { value: 'review_count', label: 'Most Reviewed' },
  { value: 'upvote_count', label: 'Most Lauded' },
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

const FALLBACK_SHOTS = [
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=500&fit=crop&auto=format',
];

/* ── Helpers ────────────────────────────────────────────────────────────────── */

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

function isNew(dateStr: string): boolean {
  return (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24) <= 30;
}

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

/* ── Polished Grid Card (matches /new-launches design) ──────────────────────── */

function ToolGridCard({
  tool,
  index,
  laudedIds,
  onLaud,
  laudingId,
  hideCategory,
}: {
  tool: Tool;
  index: number;
  laudedIds: Set<string>;
  onLaud: (toolId: number) => void;
  laudingId: number | null;
  hideCategory?: boolean;
}) {
  const screenshotSrc = tool.screenshot_url || FALLBACK_SHOTS[index % FALLBACK_SHOTS.length];
  const isLauded = laudedIds.has(tool.id);
  const isLauding = laudingId === Number(tool.id);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col group">
      {/* Header: logo + name + category + laud */}
      <div className="p-3.5 pb-2.5 flex items-start gap-3">
        <Link href={`/tools/${tool.slug}`} className="flex-shrink-0">
          <div className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
            <img
              src={tool.logo_url}
              alt={tool.name}
              className="w-9 h-9 object-contain"
              onError={e => {
                const t = e.currentTarget;
                t.style.display = 'none';
                const p = t.parentElement;
                if (p) { p.innerHTML = `<span style="font-size:18px;font-weight:800;color:#64748B">${tool.name.charAt(0)}</span>`; }
              }}
            />
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <Link href={`/tools/${tool.slug}`}>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-sm font-extrabold text-slate-900 tracking-tight truncate">
                {tool.name}
              </span>
              {tool.is_verified && (
                <ShieldCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              )}
            </div>
          </Link>
          {!hideCategory && (
            <span className="text-[11px] text-slate-500 font-medium">{tool.category}</span>
          )}
        </div>

        {/* Laud button */}
        <button
          onClick={e => { e.stopPropagation(); onLaud(Number(tool.id)); }}
          disabled={isLauding}
          className={`flex-shrink-0 flex flex-col items-center justify-center gap-0.5 px-2.5 py-1.5 rounded-xl border-[1.5px] transition-all min-w-[44px] ${
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
          <span className="text-[11px] font-bold leading-none">
            {tool.upvote_count > 999 ? `${(tool.upvote_count / 1000).toFixed(1)}k` : tool.upvote_count}
          </span>
        </button>
      </div>

      {/* Screenshot */}
      <Link href={`/tools/${tool.slug}`} className="block">
        <div className="relative w-full" style={{ paddingTop: '58%' }}>
          <img
            src={screenshotSrc}
            alt={`${tool.name} screenshot`}
            className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-500"
            onError={e => { (e.target as HTMLImageElement).src = FALLBACK_SHOTS[index % FALLBACK_SHOTS.length]; }}
          />

          {/* New badge */}
          {isNew(tool.launched_at) && (
            <div className="absolute top-2 right-2 bg-amber-500 rounded-md px-1.5 py-0.5">
              <span className="text-[9px] font-extrabold text-slate-900 uppercase tracking-wider">New</span>
            </div>
          )}
        </div>
      </Link>

      {/* Description */}
      <Link href={`/tools/${tool.slug}`} className="block px-3.5 pt-2.5">
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{tool.tagline}</p>
      </Link>

      {/* Footer */}
      <div className="mt-auto px-3.5 py-2.5 flex items-center justify-between border-t border-slate-100 mt-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium">{timeAgo(tool.launched_at)}</span>
          <span className="w-[3px] h-[3px] rounded-full bg-slate-300" />
          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
            <Star className="w-[9px] h-[9px] text-amber-500 fill-amber-500" />
            {tool.average_rating.toFixed(1)}
          </span>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
          {tool.pricing_model}
        </span>
      </div>
    </div>
  );
}

/* ── Polished List Row (matches /new-launches design) ───────────────────────── */

function ToolListRow({
  tool,
  laudedIds,
  onLaud,
  laudingId,
}: {
  tool: Tool;
  laudedIds: Set<string>;
  onLaud: (toolId: number) => void;
  laudingId: number | null;
}) {
  const isLauded = laudedIds.has(tool.id);
  const isLauding = laudingId === Number(tool.id);

  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3.5 hover:shadow-sm hover:border-slate-300 transition-all">
      {/* Laud button */}
      <button
        onClick={() => onLaud(Number(tool.id))}
        disabled={isLauding}
        className={`flex-shrink-0 flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg border-[1.5px] transition-all min-w-[40px] ${
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
        <span className="text-[11px] font-bold leading-none">
          {tool.upvote_count > 999 ? `${(tool.upvote_count / 1000).toFixed(1)}k` : tool.upvote_count}
        </span>
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
              if (p) { p.innerHTML = `<span style="font-size:16px;font-weight:800;color:#64748B">${tool.name.charAt(0)}</span>`; }
            }}
          />
        </div>
      </Link>

      {/* Info */}
      <Link href={`/tools/${tool.slug}`} className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <span className="text-sm font-extrabold text-slate-900 tracking-tight">{tool.name}</span>
          {tool.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
          {isNew(tool.launched_at) && (
            <span className="text-[9px] font-extrabold text-slate-900 bg-amber-500 px-1.5 py-0.5 rounded uppercase tracking-wider">New</span>
          )}
          <span className="text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-medium">{tool.category}</span>
        </div>
        <p className="text-xs text-slate-500 truncate">{tool.tagline}</p>
      </Link>

      {/* Stats */}
      <div className="flex-shrink-0 flex items-center gap-5">
        <div className="text-right hidden sm:block">
          <div className="flex items-center gap-1 justify-end">
            <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
            <span className="text-[13px] font-bold text-slate-900">{tool.average_rating.toFixed(1)}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{timeAgo(tool.launched_at)}</div>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">{tool.pricing_model}</span>
        <ChevronRight className="w-4 h-4 text-slate-300" />
      </div>
    </div>
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
  const [laudedIds, setLaudedIds] = useState<Set<string>>(new Set());
  const [laudingId, setLaudingId] = useState<number | null>(null);

  /* ── Load user's lauded tool IDs ─────────────────────────────────────────── */
  useEffect(() => {
    import('@/app/actions/user').then(({ getUserUpvotes }) => {
      getUserUpvotes().then(ids => {
        if (Array.isArray(ids)) setLaudedIds(new Set(ids.map(String)));
      }).catch(() => {});
    });
  }, []);

  /* ── Laud handler ────────────────────────────────────────────────────────── */
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

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFC' }}>
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        paddingTop: 84,
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
                  Stack Directory
                </span>
              </div>
              <h1 style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 'clamp(24px, 3vw, 30px)',
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
                  placeholder="Search stacks..."
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
            <aside style={{ width: 256, flexShrink: 0 }} className="hidden lg:block">
              <div style={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 8 }}>

                {/* Sidebar header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
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
                  className="hidden lg:flex"
                  style={{
                    alignItems: 'center', gap: 5,
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
                  {' '}stack{filtered.length !== 1 ? 's' : ''}
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
                <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
                  {(['grid', 'list'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                        viewMode === mode
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {mode === 'grid' ? <Grid3X3 className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
                      {mode === 'grid' ? 'Grid' : 'List'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tool grid / list */}
            {toolsLoading ? (
              /* Loading skeleton — matches new-launches style */
              <div className={viewMode === 'grid'
                ? `grid grid-cols-1 sm:grid-cols-2 ${sidebarOpen ? 'lg:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'} gap-5`
                : 'flex flex-col gap-2'
              }>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="p-4 flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 animate-pulse flex-shrink-0" />
                      <div className="flex-1">
                        <div className="h-4 w-24 bg-slate-100 rounded mb-2 animate-pulse" />
                        <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="h-40 bg-slate-100 animate-pulse" />
                    <div className="p-4">
                      <div className="h-3 w-full bg-slate-100 rounded mb-2 animate-pulse" />
                      <div className="h-3 w-3/4 bg-slate-100 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              /* Empty state */
              <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
                <Rocket className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">No stacks found</h3>
                <p className="text-sm text-slate-400 mb-6">Try adjusting your filters or search term to find what you&apos;re looking for.</p>
                <button
                  onClick={clearAll}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-400 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <>
                <div className={`grid grid-cols-1 sm:grid-cols-2 ${sidebarOpen ? 'lg:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'} gap-5`}>
                  {visibleTools.map((tool, i) => (
                    <ToolGridCard
                      key={tool.id}
                      tool={tool}
                      index={i}
                      laudedIds={laudedIds}
                      onLaud={handleLaud}
                      laudingId={laudingId}
                      hideCategory={selectedCategories.length === 1}
                    />
                  ))}
                </div>

                {/* Load more */}
                <div className="text-center mt-10">
                  {hasMore ? (
                    <button
                      onClick={() => setVisibleCount(v => v + 30)}
                      className="px-8 py-3 rounded-xl border-[1.5px] border-slate-200 bg-white text-sm font-bold text-slate-700 hover:border-amber-400 hover:text-amber-700 transition-all shadow-sm"
                    >
                      Load More ({filtered.length - visibleCount} remaining)
                    </button>
                  ) : (
                    <p className="text-sm text-slate-400 font-medium">
                      All {filtered.length} stacks shown{hasFilters ? ' matching your filters' : ''}
                    </p>
                  )}
                </div>
              </>
            ) : (
              /* ── List view ── */
              <>
                <div className="flex flex-col gap-2">
                  {visibleTools.map(tool => (
                    <ToolListRow
                      key={tool.id}
                      tool={tool}
                      laudedIds={laudedIds}
                      onLaud={handleLaud}
                      laudingId={laudingId}
                    />
                  ))}
                </div>

                {/* Load more */}
                <div className="text-center mt-6">
                  {hasMore ? (
                    <button
                      onClick={() => setVisibleCount(v => v + 30)}
                      className="px-6 py-2.5 rounded-xl border-[1.5px] border-slate-200 bg-white text-sm font-bold text-slate-700 hover:border-amber-400 hover:text-amber-700 transition-all"
                    >
                      Load More ({filtered.length - visibleCount} remaining)
                    </button>
                  ) : (
                    <p className="text-sm text-slate-400 font-medium">
                      All {filtered.length} stacks shown{hasFilters ? ' matching your filters' : ''}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
