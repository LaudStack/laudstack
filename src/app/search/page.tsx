"use client";

/**
 * LaudStack SearchResults Page
 *
 * Design: "Warm Professional" — consistent with the rest of LaudStack
 * - Reads ?q= from URL
 * - Filters allTools by name, tagline, and tags (case-insensitive)
 * - Category filter pills + sort dropdown
 * - Polished empty state with suggestions
 * - Navigates to /tools/:slug on card click
 */

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, ArrowRight, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import ToolCard from '@/components/ToolCard';
import { useToolsData } from '@/hooks/useToolsData';
import { CATEGORY_META } from '@/lib/categories';

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

function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-amber-100 text-amber-800 rounded-sm px-px">{part}</mark>
      : part
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-100 rounded w-full" />
        </div>
      </div>
      <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
      <div className="flex gap-1.5">
        <div className="h-5 bg-gray-100 rounded w-14" />
        <div className="h-5 bg-gray-100 rounded w-14" />
        <div className="h-5 bg-gray-100 rounded w-14" />
      </div>
    </div>
  );
}

export default function SearchResults() {
  const { tools: allTools, reviews: allReviews, loading: toolsLoading } = useToolsData();

  const searchStr = useSearchParams();
  const params    = new URLSearchParams(searchStr ?? undefined);
  const initialQ  = params.get('q') || '';

  const [query,           setQuery]           = useState(initialQ);
  const [inputValue,      setInputValue]      = useState(initialQ);
  const [selectedCat,     setSelectedCat]     = useState('All');
  const [sortBy,          setSortBy]          = useState('relevance');
  const [featuredOnly,    setFeaturedOnly]    = useState(false);
  const router = useRouter();

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    let filtered = allTools.filter(tool => {
      const matchesQuery = !q
        || tool.name.toLowerCase().includes(q)
        || tool.tagline.toLowerCase().includes(q)
        || tool.description.toLowerCase().includes(q)
        || tool.tags.some(tag => tag.toLowerCase().includes(q))
        || tool.category.toLowerCase().includes(q);

      const matchesCat = selectedCat === 'All' || tool.category === selectedCat;
      const matchesFeatured = !featuredOnly || tool.is_featured;

      return matchesQuery && matchesCat && matchesFeatured;
    });

    switch (sortBy) {
      case 'rating':    filtered = [...filtered].sort((a, b) => b.average_rating - a.average_rating); break;
      case 'reviews':   filtered = [...filtered].sort((a, b) => b.review_count - a.review_count); break;
      case 'newest':    filtered = [...filtered].sort((a, b) => new Date(b.launched_at).getTime() - new Date(a.launched_at).getTime()); break;
      case 'upvotes':        filtered = [...filtered].sort((a, b) => b.upvote_count - a.upvote_count); break;
      case 'featured_first': filtered = [...filtered].sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)); break;
      default: break; // relevance = natural order
    }

    return filtered;
  }, [query, selectedCat, sortBy, featuredOnly, allTools]);

  const handleSearch = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSuggestion = (term: string) => {
    setInputValue(term);
    setQuery(term);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const clearSearch = () => {
    setInputValue('');
    setQuery('');
    router.push('/search');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <PageHero
        eyebrow="Search"
        title={query ? `Results for "${query}"` : 'Search All Products'}
        subtitle={query
          ? `${results.length} tool${results.length !== 1 ? 's' : ''} found${selectedCat !== 'All' ? ` in ${selectedCat}` : ''} — refine below or try a different query.`
          : `Find the right SaaS and AI stack from ${allTools.length}+ verified products.`}
        accent="amber"
        layout="default"
        size="sm"
      >
        {/* Inline search bar */}
        <div className="flex items-center bg-white rounded-xl shadow-md border-[1.5px] border-gray-200 overflow-hidden max-w-[680px]">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search products by name, category, or tag..."
              autoFocus
              className="w-full pl-11 pr-10 h-[46px] text-sm text-slate-900 bg-transparent border-none outline-none placeholder:text-slate-400"
            />
            {inputValue && (
              <button onClick={clearSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors">
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
      <div className="bg-white border-b border-slate-100 sticky top-[72px] z-40">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none">
            {/* Category pills */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {['All', ...CATEGORY_META.map(c => c.name)].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border whitespace-nowrap transition-all ${
                    selectedCat === cat
                      ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                      : 'bg-white border-gray-200 text-slate-600 hover:border-gray-300'
                  }`}
                >{cat}</button>
              ))}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Featured toggle */}
            <button
              onClick={() => setFeaturedOnly(f => !f)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${
                featuredOnly
                  ? 'border-[1.5px] border-amber-500 bg-orange-50 text-amber-700'
                  : 'border border-gray-200 bg-white text-slate-600 hover:border-amber-200 hover:text-amber-600 hover:bg-amber-50'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              Featured Only
            </button>

            {/* Sort */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="text-[13px] font-semibold text-slate-600 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 cursor-pointer outline-none hover:border-gray-300 transition-colors"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Results ────────────────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10 pb-16">

        {toolsLoading ? (
          /* ── Loading skeleton ──────────────────────────────────── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>

        ) : !query ? (
          /* ── No query: show suggestions ──────────────────────────────── */
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-[18px] bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center mx-auto mb-5">
              <Search className="w-7 h-7 text-amber-600" />
            </div>
            <h2 className="text-[22px] font-extrabold text-slate-900 mb-2">Search LaudStack</h2>
            <p className="text-[15px] text-slate-500 mb-7">Type a keyword above, or try one of these popular searches:</p>

            <div className="flex flex-wrap gap-2.5 justify-center max-w-[560px] mx-auto">
              {SUGGESTED_SEARCHES.map(term => (
                <button
                  key={term}
                  onClick={() => handleSuggestion(term)}
                  className="px-4 py-2 rounded-[10px] border border-gray-200 bg-white text-[13px] font-semibold text-slate-600 shadow-sm hover:border-amber-500 hover:text-amber-700 hover:bg-amber-50 transition-all"
                >{term}</button>
              ))}
            </div>
          </div>

        ) : results.length === 0 ? (
          /* ── No results ──────────────────────────────────────────────── */
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-[18px] bg-slate-100 flex items-center justify-center mx-auto mb-5">
              <Sparkles className="w-7 h-7 text-slate-400" />
            </div>
            <h2 className="text-[22px] font-extrabold text-slate-900 mb-2">No results for &ldquo;{query}&rdquo;</h2>
            <p className="text-[15px] text-slate-500 mb-7">Try a different keyword, or browse by category below.</p>

            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={clearSearch}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-[10px] bg-slate-900 text-white text-[13px] font-bold hover:bg-slate-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Clear search
              </button>
              <button
                onClick={() => { setSelectedCat('All'); router.push('/'); }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-[10px] bg-white text-slate-900 border border-gray-200 text-[13px] font-bold hover:border-amber-500 hover:text-amber-700 transition-all"
              >
                Browse all tools <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Suggested searches */}
            <div className="mt-10">
              <p className="text-[13px] font-semibold text-slate-400 mb-3 uppercase tracking-wide">Try searching for</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTED_SEARCHES.map(term => (
                  <button
                    key={term}
                    onClick={() => handleSuggestion(term)}
                    className="px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-slate-600 hover:border-amber-500 hover:text-amber-700 hover:bg-amber-50 transition-all"
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
              <p className="text-[13px] text-slate-500">
                Showing <strong className="text-slate-900">{results.length}</strong> product{results.length !== 1 ? 's' : ''}
                {selectedCat !== 'All' && <> in <strong className="text-slate-900">{selectedCat}</strong></>}
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((tool) => (
                <div key={tool.id}>
                  <ToolCard tool={tool} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
