"use client";

// New Launches — Recently Added Tools
// Clean, professional, light theme. Amber accent. Real data from /api/homepage.

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { useToolsData, invalidateToolsCache } from '@/hooks/useToolsData';
import { CATEGORY_META } from '@/lib/categories';
import { toggleUpvote } from '@/app/actions/public';
import {
  Zap, Star, BarChart3, Rocket, Shield, ChevronRight, Calendar,
  ChevronUp, Loader2, Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Tool } from '@/lib/types';

// ─── Constants ──────────────────────────────────────────────────────────────

const PRICING_OPTIONS = ['All Pricing', 'Free', 'Freemium', 'Paid', 'Free Trial', 'Open Source'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'upvotes', label: 'Most Lauded' },
  { value: 'rating', label: 'Top Rated' },
];

const FALLBACK_SHOTS = [
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=500&fit=crop&auto=format',
];

// ─── Helpers ────────────────────────────────────────────────────────────────

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

function parseNewLaunchesParams(params: URLSearchParams) {
  return {
    category: params.get('category') || 'All',
    pricing:  params.get('pricing')  || 'All Pricing',
    sort:     params.get('sort')     || 'newest',
  };
}

// ─── Loading Skeleton ───────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Navbar />
      <div className="bg-white border-b border-slate-200 py-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="h-4 w-32 bg-slate-100 rounded mb-3 animate-pulse" />
          <div className="h-8 w-64 bg-slate-100 rounded mb-2 animate-pulse" />
          <div className="h-4 w-96 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
      </div>
      <Footer />
    </div>
  );
}

// ─── Tool Card (Grid) ───────────────────────────────────────────────────────

function ToolGridCard({
  tool,
  index,
  laudedIds,
  onLaud,
  laudingId,
}: {
  tool: Tool;
  index: number;
  laudedIds: Set<string>;
  onLaud: (toolId: number) => void;
  laudingId: number | null;
}) {
  const screenshotSrc = tool.screenshot_url ?? FALLBACK_SHOTS[index % FALLBACK_SHOTS.length];
  const viewCount = tool.upvote_count * 3 + tool.review_count * 12;
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
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#3B82F6" className="flex-shrink-0">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
          </Link>
          <span className="text-[11px] text-slate-500 font-medium">{tool.category}</span>
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
          {/* View count overlay */}
          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-md px-2 py-0.5 flex items-center gap-1">
            <Eye className="w-2.5 h-2.5 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-200">{viewCount.toLocaleString()}</span>
          </div>
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

// ─── Tool Row (List) ────────────────────────────────────────────────────────

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
          {tool.is_verified && <Shield className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
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

// ─── Main Component ─────────────────────────────────────────────────────────

export default function NewLaunches() {
  const { tools: allTools, loading: toolsLoading } = useToolsData();
  const router = useRouter();
  const pathname = usePathname();

  const initial = useMemo(() => {
    if (typeof window === 'undefined') return { category: 'All', pricing: 'All Pricing', sort: 'newest' };
    return parseNewLaunchesParams(new URLSearchParams(window.location.search));
  }, []);

  const [category, setCategory] = useState(initial.category);
  const [pricing,  setPricing]  = useState(initial.pricing);
  const [sort,     setSort]     = useState(initial.sort);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [visible,  setVisible]  = useState(20);
  const [syncingFromUrl, setSyncingFromUrl] = useState(false);
  const [laudedIds, setLaudedIds] = useState<Set<string>>(new Set());
  const [laudingId, setLaudingId] = useState<number | null>(null);

  // Load user's lauded tool IDs
  useEffect(() => {
    import('@/app/actions/user').then(({ getUserUpvotes }) => {
      getUserUpvotes().then(ids => {
        if (Array.isArray(ids)) setLaudedIds(new Set(ids.map(String)));
      }).catch(() => {});
    });
  }, []);

  // Outbound: write filter state to URL
  useEffect(() => {
    if (syncingFromUrl) return;
    const params = new URLSearchParams();
    if (category !== 'All')         params.set('category', category);
    if (pricing  !== 'All Pricing') params.set('pricing',  pricing);
    if (sort     !== 'newest')      params.set('sort',     sort);
    const qs = params.toString();
    const newPath = qs ? `/new-launches?${qs}` : '/new-launches';
    if (window.location.pathname + window.location.search !== newPath) {
      router.replace(newPath);
    }
  }, [category, pricing, sort, syncingFromUrl, router]);

  // Inbound: read URL to filter state on external navigation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.toString()) return;
    const parsed = parseNewLaunchesParams(params);
    setSyncingFromUrl(true);
    setCategory(parsed.category);
    setPricing(parsed.pricing);
    setSort(parsed.sort);
    setVisible(20);
    setTimeout(() => setSyncingFromUrl(false), 0);
  }, [pathname]);

  const allCategories = useMemo(() => ['All', ...CATEGORY_META.map(c => c.name).filter(n => n !== 'All')], []);

  const filteredTools = useMemo(() => {
    let tools = [...allTools];
    if (category !== 'All') tools = tools.filter(t => t.category === category);
    if (pricing !== 'All Pricing') tools = tools.filter(t => t.pricing_model === pricing);
    if (sort === 'newest') tools.sort((a, b) => new Date(b.launched_at).getTime() - new Date(a.launched_at).getTime());
    else if (sort === 'upvotes') tools.sort((a, b) => b.upvote_count - a.upvote_count);
    else if (sort === 'rating') tools.sort((a, b) => b.average_rating - a.average_rating);
    return tools;
  }, [allTools, category, pricing, sort]);

  const newCount = filteredTools.filter(t => isNew(t.launched_at)).length;
  const visibleTools = filteredTools.slice(0, visible);

  // ── Laud handler ──
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

  // Show skeleton while loading
  if (toolsLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Navbar />

      <PageHero
        eyebrow="New Launches"
        title="Recently Added Stacks"
        subtitle="The freshest SaaS & AI stacks launched by founders — sorted by launch date, newest first."
        accent="green"
        layout="default"
        size="md"
      >
        {/* Latest activity strip */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Just added:</span>
          {[...allTools]
            .sort((a, b) => new Date(b.launched_at).getTime() - new Date(a.launched_at).getTime())
            .slice(0, 4)
            .map(tool => (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300 transition-all"
              >
                {tool.logo_url ? (
                  <img src={tool.logo_url} alt="" className="w-[18px] h-[18px] rounded object-contain bg-white" />
                ) : (
                  <span className="w-[18px] h-[18px] rounded bg-green-500 flex items-center justify-center text-[10px] font-black text-white">{tool.name[0]}</span>
                )}
                {tool.name}
              </Link>
            ))}
          <span className="text-xs text-slate-400">+ {newCount} this month</span>
        </div>
      </PageHero>

      {/* ── Filters ── */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-[1280px] mx-auto px-3 sm:px-6 lg:px-10 py-3.5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Left: category scroll + pricing + sort */}
            <div className="flex items-center gap-2 flex-wrap flex-1">
              {/* Category scrollable pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                {allCategories.slice(0, 8).map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setCategory(cat); setVisible(20); }}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border-[1.5px] transition-all ${
                      category === cat
                        ? 'border-amber-500 bg-amber-500 text-slate-900'
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-amber-300 hover:text-amber-700'
                    }`}
                  >{cat}</button>
                ))}
              </div>

              <div className="w-px h-6 bg-slate-200 flex-shrink-0" />

              {/* Pricing select */}
              <select
                value={pricing}
                onChange={e => { setPricing(e.target.value); setVisible(20); }}
                className="px-2.5 py-1.5 rounded-lg border-[1.5px] border-slate-200 text-xs font-semibold text-slate-600 bg-slate-50 cursor-pointer outline-none focus:border-amber-400"
              >
                {PRICING_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              {/* Sort select */}
              <select
                value={sort}
                onChange={e => { setSort(e.target.value); setVisible(20); }}
                className="px-2.5 py-1.5 rounded-lg border-[1.5px] border-slate-200 text-xs font-semibold text-slate-600 bg-slate-50 cursor-pointer outline-none focus:border-amber-400"
              >
                {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>

              <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                <span className="text-slate-900 font-extrabold">{filteredTools.length}</span> stacks
              </span>
            </div>

            {/* Right: view toggle */}
            <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5 flex-shrink-0">
              {(['grid', 'list'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                    viewMode === mode
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >{mode === 'grid' ? 'Grid' : 'List'}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-[1280px] mx-auto w-full px-3 sm:px-6 lg:px-10 py-6 flex-1">
        {filteredTools.length === 0 ? (
          <div className="text-center py-20">
            <Rocket className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">No stacks match these filters</h3>
            <p className="text-sm text-slate-400">Try adjusting the category or pricing filter</p>
          </div>
        ) : viewMode === 'grid' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {visibleTools.map((tool, i) => (
                <ToolGridCard
                  key={tool.id}
                  tool={tool}
                  index={i}
                  laudedIds={laudedIds}
                  onLaud={handleLaud}
                  laudingId={laudingId}
                />
              ))}
            </div>

            {/* Load more */}
            <div className="text-center mt-10">
              {visible < filteredTools.length ? (
                <button
                  onClick={() => setVisible(v => v + 20)}
                  className="px-8 py-3 rounded-xl border-[1.5px] border-slate-200 bg-white text-sm font-bold text-slate-700 hover:border-amber-400 hover:text-amber-700 transition-all shadow-sm"
                >
                  Show {Math.min(20, filteredTools.length - visible)} more
                </button>
              ) : (
                <p className="text-sm text-slate-400 font-medium">All {filteredTools.length} stacks shown</p>
              )}
            </div>
          </>
        ) : (
          /* ── List view ── */
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

            {/* Load more */}
            <div className="text-center mt-6">
              {visible < filteredTools.length ? (
                <button
                  onClick={() => setVisible(v => v + 20)}
                  className="px-6 py-2.5 rounded-xl border-[1.5px] border-slate-200 bg-white text-sm font-bold text-slate-700 hover:border-amber-400 hover:text-amber-700 transition-all"
                >
                  Show {Math.min(20, filteredTools.length - visible)} more
                </button>
              ) : (
                <p className="text-sm text-slate-400 font-medium">All {filteredTools.length} stacks shown</p>
              )}
            </div>
          </div>
        )}

        {/* ── Launch CTA ── */}
        <div className="mt-16 bg-amber-50 border border-amber-200 rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center mx-auto mb-5">
            <Rocket className="w-7 h-7 text-slate-900" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">
            Have a stack to launch?
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
            Launch your AI or SaaS stack on LaudStack and get discovered by thousands of professionals.
          </p>
          <Link href="/launchpad">
            <button className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-extrabold px-7 py-3 rounded-xl transition-colors text-sm active:scale-[0.98]">
              <Rocket className="w-4 h-4" />
              Launch Your Stack
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
