"use client";

/**
 * LaudStack SearchResults Page
 *
 * Design: "Warm Professional" — consistent with the rest of LaudStack
 * - Reads ?q= from URL
 * - Server-side PostgreSQL full-text search via /api/search
 * - Category filter pills + sort dropdown + featured toggle
 * - Pagination with page controls
 * - Polished empty state with suggestions
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, ArrowRight, Sparkles, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import ToolCard from '@/components/ToolCard';
import FeaturedStacksSidebar from '@/components/FeaturedStacksSidebar';
import { CATEGORY_META } from '@/lib/categories';
import type { Tool } from '@/lib/types';

const SORT_OPTIONS = [
  { value: 'relevance',      label: 'Most Relevant' },
  { value: 'featured_first', label: 'Featured First' },
  { value: 'rating',         label: 'Highest Rated' },
  { value: 'reviews',        label: 'Most Reviewed' },
  { value: 'newest',         label: 'Newest First' },
  { value: 'upvotes',        label: 'Most Lauded' },
];

const SUGGESTED_SEARCHES = [
  'AI writing', 'code editor', 'design products', 'analytics', 'project management',
  'video editing', 'automation', 'CRM',
];

const PER_PAGE = 20; // 2 columns × 10 rows

function CardSkeleton() {
  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-slate-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-2/3" />
          <div className="h-3 bg-slate-100 rounded w-full" />
        </div>
      </div>
      <div className="h-3 bg-slate-100 rounded w-1/2 mb-3" />
      <div className="flex gap-1.5">
        <div className="h-5 bg-slate-100 rounded w-14" />
        <div className="h-5 bg-slate-100 rounded w-14" />
        <div className="h-5 bg-slate-100 rounded w-14" />
      </div>
    </div>
  );
}

export default function SearchResults() {
  const searchStr = useSearchParams();
  const initialQ = searchStr?.get('q') || '';

  const [query, setQuery] = useState(initialQ);
  const [inputValue, setInputValue] = useState(initialQ);
  const [selectedCat, setSelectedCat] = useState('All');
  const [sortBy, setSortBy] = useState('relevance');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<Tool[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();
  const abortRef = useRef<AbortController | null>(null);

  // Fetch results from server
  const fetchResults = useCallback(async (q: string, cat: string, sort: string, featured: boolean, pg: number) => {
    // Abort previous request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('q', q);
      params.set('mode', 'full');
      params.set('page', String(pg));
      params.set('limit', String(PER_PAGE));
      if (cat && cat !== 'All') params.set('category', cat);
      if (featured) params.set('featured', 'true');

      const res = await fetch(`/api/search?${params.toString()}`, { signal: controller.signal });
      const data = await res.json();

      if (!controller.signal.aborted) {
        let tools: Tool[] = data.tools ?? [];

        // Client-side sort (server returns by relevance, we re-sort if user picks a different sort)
        if (sort !== 'relevance' && tools.length > 0) {
          tools = [...tools];
          switch (sort) {
            case 'rating': tools.sort((a, b) => b.average_rating - a.average_rating); break;
            case 'reviews': tools.sort((a, b) => b.review_count - a.review_count); break;
            case 'newest': tools.sort((a, b) => new Date(b.launched_at).getTime() - new Date(a.launched_at).getTime()); break;
            case 'upvotes': tools.sort((a, b) => b.upvote_count - a.upvote_count); break;
            case 'featured_first': tools.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)); break;
          }
        }

        setResults(tools);
        setTotal(data.total ?? 0);
        setHasSearched(true);
        setLoading(false);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setResults([]);
        setTotal(0);
        setLoading(false);
        setHasSearched(true);
      }
    }
  }, []);

  // Trigger search when query/filters/page change
  useEffect(() => {
    if (query.trim()) {
      fetchResults(query, selectedCat, sortBy, featuredOnly, page);
    } else {
      // Empty query — browse all tools
      fetchResults('', selectedCat, sortBy, featuredOnly, page);
    }
  }, [query, selectedCat, sortBy, featuredOnly, page, fetchResults]);

  // Sync URL query param to state
  useEffect(() => {
    const urlQ = searchStr?.get('q') || '';
    if (urlQ !== query) {
      setQuery(urlQ);
      setInputValue(urlQ);
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchStr]);

  const handleSearch = () => {
    const trimmed = inputValue.trim();
    setQuery(trimmed);
    setPage(1);
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`, { scroll: false });
    } else {
      router.push('/search', { scroll: false });
    }
  };

  const handleSuggestion = (term: string) => {
    setInputValue(term);
    setQuery(term);
    setPage(1);
    router.push(`/search?q=${encodeURIComponent(term)}`, { scroll: false });
  };

  const clearSearch = () => {
    setInputValue('');
    setQuery('');
    setPage(1);
    router.push('/search', { scroll: false });
  };

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <PageHero
        breadcrumbs={[{ label: 'Search' }]}
        eyebrow="Search"
        title={query ? `Results for "${query}"` : 'Search All Products'}
        subtitle={query
          ? `${total} tool${total !== 1 ? 's' : ''} found${selectedCat !== 'All' ? ` in ${selectedCat}` : ''} — refine below or try a different query.`
          : `Find the right SaaS and AI stack from our verified product catalog.`}
        accent="amber"
        layout="centered"
        size="md"
      >
        {/* Inline search bar — centered */}
        <div className="flex items-center bg-white rounded-xl shadow-md border-[1.5px] border-slate-200 overflow-hidden w-full max-w-[560px] mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search products by name, category, or tag..."
              autoFocus
              className="w-full pl-11 pr-10 h-[46px] text-sm text-slate-900 bg-transparent border-none outline-none placeholder:text-slate-500"
            />
            {inputValue && (
              <button onClick={clearSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-600 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="h-[46px] px-5 font-bold text-slate-900 text-[13px] bg-amber-500 hover:bg-amber-400 transition-colors flex-shrink-0"
          >Search</button>
        </div>
      </PageHero>

      {/* ── Filters bar ────────────────────────────────────────────────────── */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-[56px] sm:top-[64px] z-40 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-2.5 sm:py-3 scrollbar-hide">
            {/* Category pills */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {['All', ...CATEGORY_META.map(c => c.name)].map(cat => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCat(cat); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border whitespace-nowrap transition-all ${
                    selectedCat === cat
                      ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >{cat}</button>
              ))}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Featured toggle */}
            <button
              onClick={() => { setFeaturedOnly(f => !f); setPage(1); }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${
                featuredOnly
                  ? 'border-[1.5px] border-amber-500 bg-orange-50 text-amber-700'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:text-amber-600 hover:bg-amber-50'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              Featured Only
            </button>

            {/* Sort */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortBy}
                onChange={e => { setSortBy(e.target.value); setPage(1); }}
                className="text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 cursor-pointer outline-none hover:border-slate-300 transition-colors"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Results + Sidebar split-screen ─────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0 py-6 sm:py-8 lg:py-10 pb-16">
        {loading ? (
          /* ── Loading skeleton ──────────────────────────────────── */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>

        ) : !hasSearched && !query ? (
          /* ── No query: show suggestions ──────────────────────────────── */
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-[18px] bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center mx-auto mb-5">
              <Search className="w-7 h-7 text-amber-600" />
            </div>
            <h2 className="text-[22px] font-black text-slate-900 mb-2">Search LaudStack</h2>
            <p className="text-[15px] text-slate-600 mb-7">Type a keyword above, or try one of these popular searches:</p>

            <div className="flex flex-wrap gap-2.5 justify-center max-w-[560px] mx-auto">
              {SUGGESTED_SEARCHES.map(term => (
                <button
                  key={term}
                  onClick={() => handleSuggestion(term)}
                  className="px-4 py-2 rounded-[10px] border border-slate-200 bg-slate-50 text-[13px] font-semibold text-slate-600 shadow-sm hover:border-amber-500 hover:text-amber-700 hover:bg-amber-50 transition-all"
                >{term}</button>
              ))}
            </div>
          </div>

        ) : results.length === 0 ? (
          /* ── No results ──────────────────────────────────────────────── */
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-[18px] bg-slate-100 flex items-center justify-center mx-auto mb-5">
              <Sparkles className="w-7 h-7 text-slate-500" />
            </div>
            <h2 className="text-[22px] font-black text-slate-900 mb-2">No results for &ldquo;{query}&rdquo;</h2>
            <p className="text-[15px] text-slate-600 mb-7">Try a different keyword, or browse by category below.</p>

            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={clearSearch}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-[10px] bg-slate-900 text-white text-[13px] font-bold hover:bg-slate-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Clear search
              </button>
              <button
                onClick={() => { setSelectedCat('All'); router.push('/tools'); }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-[10px] bg-slate-50 text-slate-900 border border-slate-200 text-[13px] font-bold hover:border-amber-500 hover:text-amber-700 transition-all"
              >
                Browse all tools <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Suggested searches */}
            <div className="mt-10">
              <p className="text-[13px] font-semibold text-slate-500 mb-3 uppercase tracking-wide">Try searching for</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTED_SEARCHES.map(term => (
                  <button
                    key={term}
                    onClick={() => handleSuggestion(term)}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 hover:border-amber-500 hover:text-amber-700 hover:bg-amber-50 transition-all"
                  >{term}</button>
                ))}
              </div>
            </div>
          </div>

        ) : (
          /* ── Results grid ────────────────────────────────────────────── */
          <div>
            {/* Result count bar */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-[13px] text-slate-600">
                Showing <strong className="text-slate-900">{(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)}</strong> of <strong className="text-slate-900">{total}</strong> product{total !== 1 ? 's' : ''}
                {selectedCat !== 'All' && <> in <strong className="text-slate-900">{selectedCat}</strong></>}
              </p>
              {totalPages > 1 && (
                <p className="text-[13px] text-slate-600">
                  Page {page} of {totalPages}
                </p>
              )}
            </div>

            {/* Grid — 2 per row for cleaner alignment with sidebar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {results.map((tool) => (
                <div key={tool.id}>
                  <ToolCard tool={tool} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600 hover:border-amber-500 hover:text-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (page <= 4) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = page - 3 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                          page === pageNum
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-500 hover:text-amber-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600 hover:border-amber-500 hover:text-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
        </div>

        {/* Promoted stacks sidebar — split-screen panel, no rounded corners */}
        <aside className="hidden lg:block w-[280px] shrink-0 sticky top-[116px] self-start">
          <FeaturedStacksSidebar limit={5} title="Featured" variant="panel" />
        </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
