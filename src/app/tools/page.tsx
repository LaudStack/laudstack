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

/* ── Collapsible filter section (accordion) ────────────────────────────────── */

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
    <div
      className={`rounded-xl border overflow-hidden transition-all duration-200 ${
        expanded
          ? 'bg-white border-slate-200 shadow-sm'
          : 'bg-white/60 border-slate-200/60 hover:bg-white hover:border-slate-200 hover:shadow-sm'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-transparent border-none cursor-pointer transition-colors group"
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
              expanded
                ? 'bg-amber-50 border border-amber-200/60'
                : 'bg-slate-50 border border-slate-100 group-hover:bg-slate-100'
            }`}
          >
            <Icon
              className={`w-3.5 h-3.5 transition-colors duration-200 ${
                expanded ? 'text-amber-600' : 'text-slate-400 group-hover:text-slate-500'
              }`}
            />
          </div>
          <span
            className={`text-[13px] font-bold tracking-tight transition-colors duration-200 ${
              expanded ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-800'
            }`}
          >
            {title}
          </span>
          {count !== undefined && count > 0 && (
            <span className="text-[10px] font-bold text-white bg-amber-500 px-1.5 py-px rounded-full min-w-[18px] text-center shadow-sm shadow-amber-500/20">
              {count}
            </span>
          )}
        </div>
        <div
          className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200 ${
            expanded ? 'bg-amber-50 rotate-180' : 'group-hover:bg-slate-100'
          }`}
        >
          <ChevronDown
            className={`w-3.5 h-3.5 transition-colors duration-200 ${
              expanded ? 'text-amber-500' : 'text-slate-400'
            }`}
          />
        </div>
      </button>
      <div
        className="grid transition-all duration-200 ease-in-out"
        style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-3 max-h-[300px] overflow-y-auto border-t border-slate-100/80">
            <div className="pt-2 flex flex-col gap-0.5">
              {children}
            </div>
          </div>
        </div>
      </div>
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
      className={`flex items-center justify-between px-2.5 py-[7px] rounded-lg cursor-pointer transition-colors ${
        checked ? 'bg-amber-50/80' : 'hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className="relative flex-shrink-0">
          <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
          <div className={`w-4 h-4 rounded-[5px] border-[1.5px] transition-all flex items-center justify-center ${
            checked
              ? 'bg-amber-500 border-amber-500 shadow-sm shadow-amber-500/20'
              : 'bg-white border-slate-300 peer-hover:border-slate-400'
          }`}>
            {checked && (
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
        {dot && (
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dot }} />
        )}
        <span className={`text-[12.5px] leading-tight transition-colors ${
          checked ? 'font-bold text-amber-900' : 'font-medium text-slate-600'
        }`}>
          {label}
        </span>
      </div>
      {count !== undefined && (
        <span className="text-[11px] text-slate-400 font-medium tabular-nums ml-2">
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
      className={`flex items-center justify-between px-2.5 py-[7px] rounded-lg cursor-pointer transition-colors ${
        checked ? 'bg-amber-50/80' : 'hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className="relative flex-shrink-0">
          <input type="radio" checked={checked} onChange={onChange} className="sr-only peer" />
          <div className={`w-4 h-4 rounded-full border-[1.5px] transition-all flex items-center justify-center ${
            checked
              ? 'border-amber-500 shadow-sm shadow-amber-500/20'
              : 'bg-white border-slate-300 peer-hover:border-slate-400'
          }`}>
            {checked && (
              <div className="w-2 h-2 rounded-full bg-amber-500" />
            )}
          </div>
        </div>
        <span className={`text-[12.5px] leading-tight transition-colors ${
          checked ? 'font-bold text-amber-900' : 'font-medium text-slate-600'
        }`}>
          {label}
        </span>
      </div>
      {count !== undefined && (
        <span className="text-[11px] text-slate-400 font-medium tabular-nums ml-2">{count}</span>
      )}
    </label>
  );
}

/* ── Active filter chip ─────────────────────────────────────────────── */

const CHIP_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  '#D97706': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  '#2563EB': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  '#7C3AED': { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700' },
  '#059669': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
};

function FilterChip({ label, color, onRemove }: { label: string; color: string; onRemove: () => void }) {
  const style = CHIP_STYLES[color] || { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700' };
  return (
    <span className={`inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap border ${style.bg} ${style.border} ${style.text}`}>
      {label}
      <button
        onClick={onRemove}
        className={`flex items-center justify-center w-4 h-4 rounded-full transition-colors hover:bg-black/5 ${style.text}`}
      >
        <X className="w-3 h-3" />
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
  const [logoError, setLogoError] = useState(false);
  const [screenshotError, setScreenshotError] = useState(false);
  const isLauded = laudedIds.has(tool.id);
  const isLauding = laudingId === Number(tool.id);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col group">
      {/* Header: logo + name + category + laud */}
      <div className="p-4 pb-3 flex items-start gap-3.5">
        <Link href={`/tools/${tool.slug}`} className="flex-shrink-0">
          <div className="w-[52px] h-[52px] rounded-xl border border-slate-200 bg-white overflow-hidden flex items-center justify-center shadow-sm">
            {logoError ? (
              <span className="text-xl font-extrabold text-slate-500">{tool.name.charAt(0)}</span>
            ) : (
              <img
                src={tool.logo_url}
                alt={tool.name}
                className="w-10 h-10 object-contain"
                onError={() => setLogoError(true)}
              />
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0 pt-0.5">
          <Link href={`/tools/${tool.slug}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[15px] font-extrabold text-slate-900 tracking-tight truncate">
                {tool.name}
              </span>
              {tool.is_verified && (
                <ShieldCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              )}
            </div>
          </Link>
          {!hideCategory && (
            <span className="text-xs text-slate-500 font-medium">{tool.category}</span>
          )}
        </div>

        {/* Laud button */}
        <button
          onClick={e => { e.stopPropagation(); onLaud(Number(tool.id)); }}
          disabled={isLauding}
          className={`flex-shrink-0 flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl border-[1.5px] transition-all min-w-[48px] ${
            isLauded
              ? 'border-amber-300 bg-amber-50 text-amber-600'
              : 'border-slate-200 bg-slate-50/80 hover:border-amber-400 hover:bg-amber-50 text-slate-600'
          }`}
        >
          {isLauding ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ChevronUp className={`w-3.5 h-3.5 ${isLauded ? 'text-amber-500' : 'text-slate-500'}`} />
          )}
          <span className="text-xs font-bold leading-none">
            {tool.upvote_count > 999 ? `${(tool.upvote_count / 1000).toFixed(1)}k` : tool.upvote_count}
          </span>
        </button>
      </div>

      {/* Screenshot — centered with rounded corners (matches homepage Rising cards) */}
      <Link href={`/tools/${tool.slug}`} className="block px-3 sm:px-4">
        <div
          className="relative w-full overflow-hidden rounded-xl bg-slate-100 aspect-video"
        >
          {!tool.screenshot_url || screenshotError ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-9 h-9 mx-auto mb-1.5 rounded-lg bg-slate-200/80 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth={1.5}>
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Preview unavailable</span>
              </div>
            </div>
          ) : (
            <img
              src={tool.screenshot_url}
              alt={`${tool.name} screenshot`}
              className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-700 ease-out"
              onError={() => setScreenshotError(true)}
            />
          )}

          {/* New badge */}
          {isNew(tool.launched_at) && (
            <div className="absolute top-2.5 right-2.5 bg-amber-500 rounded-md px-2 py-0.5 shadow-sm">
              <span className="text-[10px] font-extrabold text-white uppercase tracking-wider">New</span>
            </div>
          )}
        </div>
      </Link>

      {/* Description */}
      <Link href={`/tools/${tool.slug}`} className="block px-4 pt-3">
        <p className="text-[13px] text-slate-600 leading-relaxed line-clamp-2">{tool.tagline}</p>
      </Link>

      {/* Footer */}
      <div className="mt-auto px-4 py-3 flex items-center justify-between border-t border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-slate-400 font-medium">{timeAgo(tool.launched_at)}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="flex items-center gap-1 text-xs font-bold text-slate-700">
            <Star className="w-[11px] h-[11px] text-amber-500 fill-amber-500" />
            {tool.average_rating.toFixed(1)}
          </span>
        </div>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
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
  const [logoError, setLogoError] = useState(false);
  const isLauded = laudedIds.has(tool.id);
  const isLauding = laudingId === Number(tool.id);

  return (
    <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl px-3 sm:px-5 py-3 sm:py-4 flex items-center gap-3 sm:gap-4 hover:shadow-md hover:border-slate-300 transition-all">
      {/* Laud button */}
      <button
        onClick={() => onLaud(Number(tool.id))}
        disabled={isLauding}
        className={`flex-shrink-0 flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl border-[1.5px] transition-all min-w-[48px] ${
          isLauded
            ? 'border-amber-300 bg-amber-50 text-amber-600'
            : 'border-slate-200 bg-slate-50/80 hover:border-amber-400 hover:bg-amber-50 text-slate-600'
        }`}
      >
        {isLauding ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <ChevronUp className={`w-3.5 h-3.5 ${isLauded ? 'text-amber-500' : 'text-slate-500'}`} />
        )}
        <span className="text-xs font-bold leading-none">
          {tool.upvote_count > 999 ? `${(tool.upvote_count / 1000).toFixed(1)}k` : tool.upvote_count}
        </span>
      </button>

      {/* Logo */}
      <Link href={`/tools/${tool.slug}`} className="flex-shrink-0">
        <div className="w-11 h-11 rounded-xl border border-slate-200 bg-white overflow-hidden flex items-center justify-center shadow-sm">
          {logoError ? (
            <span className="text-base font-extrabold text-slate-500">{tool.name.charAt(0)}</span>
          ) : (
            <img
              src={tool.logo_url}
              alt={tool.name}
              className="w-8 h-8 object-contain"
              onError={() => setLogoError(true)}
            />
          )}
        </div>
      </Link>

      {/* Info */}
      <Link href={`/tools/${tool.slug}`} className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <span className="text-[15px] font-extrabold text-slate-900 tracking-tight">{tool.name}</span>
          {tool.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
          {isNew(tool.launched_at) && (
            <span className="text-[9px] font-extrabold text-white bg-amber-500 px-1.5 py-0.5 rounded uppercase tracking-wider">New</span>
          )}
          <span className="text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-medium">{tool.category}</span>
        </div>
        <p className="text-xs text-slate-500 truncate">{tool.tagline}</p>
      </Link>

      {/* Stats */}
      <div className="flex-shrink-0 flex items-center gap-3 sm:gap-5">
        <div className="text-right hidden sm:block">
          <div className="flex items-center gap-1 justify-end">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span className="text-sm font-bold text-slate-900">{tool.average_rating.toFixed(1)}</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{timeAgo(tool.launched_at)}</div>
        </div>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md hidden sm:inline">{tool.pricing_model}</span>
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>('category');
  const toggleSection = useCallback((id: string) => {
    setOpenSection(prev => prev === id ? null : id);
  }, []);
  const [catSearch, setCatSearch] = useState('');
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
  }, [selectedCategories, selectedPricing, minRating, sortBy, search, activeBadge, router, syncingFromUrl]);

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

  /* Close mobile filters on route change */
  useEffect(() => { setMobileFiltersOpen(false); }, [pathname]);
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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-slate-200 pt-[84px]">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 mb-5">
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors">Home</Link>
            <span className="text-[11px] text-slate-300">/</span>
            <span className="text-xs text-slate-500 font-semibold">All Stacks</span>
          </nav>

          {/* Title row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  <Package className="w-[11px] h-[11px]" />
                  Stack Directory
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                All Stacks
              </h1>
              <p className="text-[15px] text-slate-500 mt-2 leading-relaxed">
                Discover {allTools.length} SaaS &amp; AI stacks, verified and ranked by the community.
              </p>
            </div>

            {/* Search bar */}
            <div className="relative w-full sm:max-w-[340px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search stacks..."
                value={search}
                onChange={e => { setSearch(e.target.value); setVisibleCount(30); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-[10px] py-2.5 pl-10 pr-9 text-[13px] text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
              />
              {search && (
                <button
                  onClick={() => { setSearch(''); setVisibleCount(30); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category quick-filter pills */}
          <div className="flex gap-1.5 items-center py-3.5 border-t border-slate-100 overflow-x-auto scrollbar-hide flex-nowrap sm:flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex-shrink-0 whitespace-nowrap">
              Quick filter:
            </span>
            {CATEGORIES.filter(c => c.name !== 'All').slice(0, 12).map(cat => {
              const isActive = selectedCategories.includes(cat.name);
              return (
                <button
                  key={cat.name}
                  onClick={() => toggleCategory(cat.name)}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold border transition-all flex-shrink-0 whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:bg-amber-50'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              );
            })}
            {selectedCategories.length > 0 && (
              <button
                onClick={() => setSelectedCategories([])}
                className="px-3 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors flex-shrink-0 whitespace-nowrap"
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
      <div className="max-w-[1300px] mx-auto w-full px-4 sm:px-6 pt-7 pb-16">
        <div className="flex gap-7">

          {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
          {sidebarOpen && (
            <aside className="w-[264px] flex-shrink-0 hidden lg:block">
              <div className="sticky top-[88px] flex flex-col gap-3">

                {/* Sidebar header */}
                <div className="flex items-center justify-between px-1 mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center">
                      <Filter className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <span className="text-[13px] font-extrabold text-slate-800 tracking-tight">
                      Filters
                    </span>
                    {activeFilterCount > 0 && (
                      <span className="text-[10px] font-bold text-white bg-amber-500 w-[20px] h-[20px] rounded-full flex items-center justify-center shadow-sm shadow-amber-500/20">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>
                  {hasFilters && (
                    <button
                      onClick={clearAll}
                      className="text-[11px] font-bold text-red-500 hover:text-red-600 bg-transparent border-none cursor-pointer px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Category */}
                <FilterSection
                  title="Category"
                  icon={LayoutGrid}
                  expanded={openSection === 'category'}
                  onToggle={() => toggleSection('category')}
                  count={selectedCategories.length || undefined}
                >
                  <div className="mb-1.5">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                      <input
                        type="text"
                        value={catSearch}
                        onChange={e => setCatSearch(e.target.value)}
                        placeholder="Search categories..."
                        className="w-full pl-7 pr-2 py-[6px] text-[12px] text-slate-700 bg-slate-50 border border-slate-200/80 rounded-lg outline-none placeholder:text-slate-400 focus:border-amber-300 focus:ring-1 focus:ring-amber-200 transition-colors"
                      />
                    </div>
                  </div>
                  {categoryNames
                    .filter(cat => !catSearch.trim() || cat.toLowerCase().includes(catSearch.toLowerCase()))
                    .map(cat => (
                      <FilterCheckbox
                        key={cat}
                        label={cat}
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        count={catCounts[cat] || 0}
                      />
                    ))
                  }
                  {catSearch.trim() && categoryNames.filter(cat => cat.toLowerCase().includes(catSearch.toLowerCase())).length === 0 && (
                    <p className="text-[11px] text-slate-400 text-center py-2">No matching categories</p>
                  )}
                </FilterSection>

                {/* Pricing */}
                <FilterSection
                  title="Pricing"
                  icon={Tag}
                  expanded={openSection === 'pricing'}
                  onToggle={() => toggleSection('pricing')}
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
                  expanded={openSection === 'badges'}
                  onToggle={() => toggleSection('badges')}
                  count={activeBadge ? 1 : undefined}
                >
                  <FilterRadio
                    label="Any badge"
                    checked={activeBadge === ''}
                    onChange={() => setActiveBadge('')}
                    count={allTools.length}
                  />
                  {availableBadges.map(([key, label]) => (
                    <FilterRadio
                      key={key}
                      label={label}
                      checked={activeBadge === key}
                      onChange={() => setActiveBadge(activeBadge === key ? '' : key)}
                      count={badgeCounts[key] || 0}
                    />
                  ))}
                </FilterSection>

                {/* Rating */}
                <FilterSection
                  title="Min Rating"
                  icon={Star}
                  expanded={openSection === 'rating'}
                  onToggle={() => toggleSection('rating')}
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
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
              {/* Left: toggle + count + active chips */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Desktop sidebar toggle */}
                <button
                  onClick={() => setSidebarOpen(v => !v)}
                  className="hidden lg:flex items-center gap-1.5 px-3 py-[7px] rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer transition-all hover:border-slate-300 hover:shadow-sm"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  {sidebarOpen ? 'Hide Filters' : 'Show Filters'}
                </button>

                {/* Mobile filter button */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-[7px] rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer transition-all hover:border-slate-300 hover:shadow-sm relative"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold text-white bg-amber-500 w-4 h-4 rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <span className="text-[13px] text-slate-500 font-medium">
                  <strong className="text-slate-900 font-extrabold">{filtered.length}</strong>
                  {' '}stack{filtered.length !== 1 ? 's' : ''}
                  {hasFilters && <span className="text-amber-500 font-semibold ml-1">(filtered)</span>}
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
              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <ArrowUpDown className="absolute left-2.5 w-3 h-3 text-slate-400 pointer-events-none" />
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 rounded-lg pl-7 pr-8 py-[7px] text-xs font-semibold text-slate-700 cursor-pointer outline-none hover:border-slate-300 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all"
                  >
                    {SORT_OPTIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 w-3 h-3 text-slate-400 pointer-events-none" />
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
              /* Loading skeleton — adapts to current view mode */
              viewMode === 'grid' ? (
                <div className={`grid grid-cols-1 sm:grid-cols-2 ${sidebarOpen ? 'lg:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'} gap-6`}>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                      <div className="p-4 pb-3 flex items-start gap-3.5">
                        <div className="w-[52px] h-[52px] rounded-xl bg-slate-100 animate-pulse flex-shrink-0" />
                        <div className="flex-1 pt-0.5">
                          <div className="h-4 w-28 bg-slate-100 rounded mb-2 animate-pulse" />
                          <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-slate-100 animate-pulse flex-shrink-0" />
                      </div>
                      <div className="px-3 sm:px-4">
                        <div className="bg-slate-100 animate-pulse rounded-xl aspect-video" />
                      </div>
                      <div className="px-4 pt-3 pb-3">
                        <div className="h-3 w-full bg-slate-100 rounded mb-2 animate-pulse" />
                        <div className="h-3 w-3/4 bg-slate-100 rounded animate-pulse" />
                      </div>
                      <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
                        <div className="h-5 w-16 bg-slate-100 rounded-md animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-200/80 shadow-sm px-5 py-4 flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 animate-pulse flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="h-4 w-32 bg-slate-100 rounded mb-2 animate-pulse" />
                        <div className="h-3 w-48 bg-slate-100 rounded animate-pulse" />
                      </div>
                      <div className="hidden sm:flex items-center gap-5">
                        <div className="h-4 w-10 bg-slate-100 rounded animate-pulse" />
                        <div className="h-5 w-16 bg-slate-100 rounded-md animate-pulse" />
                      </div>
                      <div className="w-4 h-4 bg-slate-100 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              )
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
                <div className={`grid grid-cols-1 sm:grid-cols-2 ${sidebarOpen ? 'lg:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'} gap-6`}>
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
                      Load More ({Math.max(0, filtered.length - visibleCount)} remaining)
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
                <div className="flex flex-col gap-3">
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
                      Load More ({Math.max(0, filtered.length - visibleCount)} remaining)
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

      {/* ═══════════════════════════════════════════════════════════════════════
          MOBILE FILTER DRAWER
      ═══════════════════════════════════════════════════════════════════════ */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-[320px] max-w-[85vw] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-extrabold text-slate-900">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="text-[10px] font-bold text-white bg-amber-500 w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasFilters && (
                  <button
                    onClick={clearAll}
                    className="text-[11px] font-bold text-red-500 hover:text-red-600 px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {/* Category */}
              <FilterSection
                title="Category"
                icon={LayoutGrid}
                expanded={openSection === 'category'}
                onToggle={() => toggleSection('category')}
                count={selectedCategories.length || undefined}
              >
                <div className="mb-1.5">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                    <input
                      type="text"
                      value={catSearch}
                      onChange={e => setCatSearch(e.target.value)}
                      placeholder="Search categories..."
                      className="w-full pl-7 pr-2 py-[6px] text-[12px] text-slate-700 bg-slate-50 border border-slate-200/80 rounded-lg outline-none placeholder:text-slate-400 focus:border-amber-300 focus:ring-1 focus:ring-amber-200 transition-colors"
                    />
                  </div>
                </div>
                {categoryNames
                  .filter(cat => !catSearch.trim() || cat.toLowerCase().includes(catSearch.toLowerCase()))
                  .map(cat => (
                    <FilterCheckbox
                      key={cat}
                      label={cat}
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      count={catCounts[cat] || 0}
                    />
                  ))
                }
              </FilterSection>

              {/* Pricing */}
              <FilterSection
                title="Pricing"
                icon={Tag}
                expanded={openSection === 'pricing'}
                onToggle={() => toggleSection('pricing')}
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
                expanded={openSection === 'badges'}
                onToggle={() => toggleSection('badges')}
                count={activeBadge ? 1 : undefined}
              >
                <FilterRadio
                  label="Any badge"
                  checked={activeBadge === ''}
                  onChange={() => setActiveBadge('')}
                  count={allTools.length}
                />
                {availableBadges.map(([key, label]) => (
                  <FilterRadio
                    key={key}
                    label={label}
                    checked={activeBadge === key}
                    onChange={() => setActiveBadge(activeBadge === key ? '' : key)}
                    count={badgeCounts[key] || 0}
                  />
                ))}
              </FilterSection>

              {/* Rating */}
              <FilterSection
                title="Min Rating"
                icon={Star}
                expanded={openSection === 'rating'}
                onToggle={() => toggleSection('rating')}
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

            {/* Drawer footer */}
            <div className="px-5 py-4 border-t border-slate-100">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-400 transition-colors"
              >
                Show {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
