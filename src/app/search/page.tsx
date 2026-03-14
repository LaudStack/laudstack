"use client";

/**
 * LaudStack SearchResults Page
 *
 * Design: "Warm Professional" — consistent with the rest of LaudStack
 * - Reads ?q= from URL via wouter's useSearch
 * - Filters allTools by name, tagline, and tags (case-insensitive)
 * - Category filter pills + sort dropdown
 * - Polished empty state with suggestions
 * - Navigates to /tools/:slug on card click
 */

import { useState, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, ArrowRight, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import ToolCard from '@/components/ToolCard';
import { useToolsData } from '@/hooks/useToolsData';
import { CATEGORY_META } from '@/lib/categories';

const SORT_OPTIONS = [
  { value: 'relevance',      label: 'Most Relevant' },
  { value: 'featured_first', label: '✦ Featured First' },
  { value: 'rating',         label: 'Highest Rated' },
  { value: 'reviews',        label: 'Most Reviewed' },
  { value: 'newest',         label: 'Newest First' },
  { value: 'upvotes',        label: 'Most Lauded' },
];

const SUGGESTED_SEARCHES = [
  'AI writing', 'code editor', 'design products', 'analytics', 'project management',
  'video editing', 'automation', 'CRM',
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i } }),
};

function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} style={{ background: '#FEF3C7', color: '#92400E', borderRadius: '2px', padding: '0 1px' }}>{part}</mark>
      : part
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
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: "system-ui, -apple-system, sans-serif" }}>
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
        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '12px', boxShadow: '0 1px 8px rgba(0,0,0,0.07)', border: '1.5px solid #E2E8F0', overflow: 'hidden', maxWidth: '680px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94A3B8' }} />
            <input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search products by name, category, or tag..."
              autoFocus
              style={{ width: '100%', paddingLeft: '46px', paddingRight: inputValue ? '40px' : '14px', height: '46px', fontSize: '14px', color: '#171717', background: 'transparent', border: 'none', outline: 'none' }}
            />
            {inputValue && (
              <button onClick={clearSearch} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center', padding: '4px' }}>
                <X style={{ width: '14px', height: '14px' }} />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            style={{ height: '46px', padding: '0 22px', fontWeight: 700, color: '#0A0A0A', fontSize: '13px', background: '#F59E0B', border: 'none', cursor: 'pointer', flexShrink: 0, transition: 'opacity 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >Search</button>
        </div>
      </PageHero>

      {/* ── Filters bar ────────────────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #F1F5F9', position: 'sticky', top: '72px', zIndex: 40 }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', padding: '12px 0', scrollbarWidth: 'none' }}>
            {/* Category pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              {['All', ...CATEGORY_META.map(c => c.name)].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  style={{
                    padding: '5px 13px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                    border: '1px solid', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
                    background: selectedCat === cat ? '#171717' : '#fff',
                    borderColor: selectedCat === cat ? '#171717' : '#E2E8F0',
                    color: selectedCat === cat ? '#fff' : '#475569',
                    boxShadow: selectedCat === cat ? '0 2px 8px rgba(15,23,42,0.15)' : 'none',
                  }}
                >{cat}</button>
              ))}
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Featured toggle */}
            <button
              onClick={() => setFeaturedOnly(f => !f)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '5px 12px', borderRadius: '8px', cursor: 'pointer',
                fontSize: '12px', fontWeight: 700, transition: 'all 0.13s', fontFamily: 'inherit',
                border: featuredOnly ? '1.5px solid #F59E0B' : '1px solid #E2E8F0',
                background: featuredOnly ? '#FFF7ED' : '#fff',
                color: featuredOnly ? '#B45309' : '#475569',
                flexShrink: 0,
              }}
              onMouseEnter={e => { if (!featuredOnly) { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#FDE68A'; b.style.color = '#D97706'; b.style.background = '#FFFBEB'; } }}
              onMouseLeave={e => { if (!featuredOnly) { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#E2E8F0'; b.style.color = '#475569'; b.style.background = '#fff'; } }}
            >
              <Sparkles style={{ width: '11px', height: '11px' }} />
              Featured Only
            </button>

            {/* Sort */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <SlidersHorizontal style={{ width: '14px', height: '14px', color: '#94A3B8' }} />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{ fontSize: '13px', fontWeight: 600, color: '#475569', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', outline: 'none' }}
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

        <>
          {toolsLoading ? (
            /* ── Loading state ──────────────────────────────────────── */
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ width: '48px', height: '48px', border: '3px solid #E2E8F0', borderTopColor: '#F59E0B', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
              <p style={{ fontSize: '15px', color: '#64748B', fontWeight: 500 }}>Loading products...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>

          ) : !query ? (
            /* ── No query: show suggestions ──────────────────────────────── */
            <div key="empty-query"    >
              <div style={{ textAlign: 'center', padding: '60px 0 40px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'linear-gradient(135deg, #FEF3C7, #FED7AA)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Search style={{ width: '28px', height: '28px', color: '#D97706' }} />
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#171717', margin: '0 0 8px', fontFamily: "'Inter', sans-serif" }}>Search LaudStack</h2>
                <p style={{ fontSize: '15px', color: '#64748B', margin: '0 0 36px' }}>Find the best SaaS & AI stacks by name, category, or tag.</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', maxWidth: '560px', margin: '0 auto' }}>
                  {SUGGESTED_SEARCHES.map(term => (
                    <button
                      key={term}
                      onClick={() => handleSuggestion(term)}
                      style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#fff', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                      onMouseEnter={e => { (e.currentTarget.style.borderColor = '#F59E0B'); (e.currentTarget.style.color = '#B45309'); (e.currentTarget.style.background = '#FFFBEB'); }}
                      onMouseLeave={e => { (e.currentTarget.style.borderColor = '#E2E8F0'); (e.currentTarget.style.color = '#475569'); (e.currentTarget.style.background = '#fff'); }}
                    >{term}</button>
                  ))}
                </div>
              </div>
            </div>

          ) : results.length === 0 ? (
            /* ── No results ──────────────────────────────────────────────── */
            <div key="no-results"    >
              <div style={{ textAlign: 'center', padding: '60px 0 40px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Sparkles style={{ width: '28px', height: '28px', color: '#94A3B8' }} />
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#171717', margin: '0 0 8px', fontFamily: "'Inter', sans-serif" }}>No results for "{query}"</h2>
                <p style={{ fontSize: '15px', color: '#64748B', margin: '0 0 28px' }}>Try a different keyword, or browse by category below.</p>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={clearSearch}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', background: '#171717', color: '#fff', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    <X style={{ width: '14px', height: '14px' }} /> Clear search
                  </button>
                  <button
                    onClick={() => { setSelectedCat('All'); router.push('/'); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', background: '#fff', color: '#171717', border: '1px solid #E2E8F0', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget.style.borderColor = '#F59E0B'); (e.currentTarget.style.color = '#B45309'); }}
                    onMouseLeave={e => { (e.currentTarget.style.borderColor = '#E2E8F0'); (e.currentTarget.style.color = '#171717'); }}
                  >
                    Browse all tools <ArrowRight style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>

                {/* Suggested searches */}
                <div style={{ marginTop: '40px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try searching for</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                    {SUGGESTED_SEARCHES.map(term => (
                      <button
                        key={term}
                        onClick={() => handleSuggestion(term)}
                        style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#fff', fontSize: '12px', fontWeight: 600, color: '#475569', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => { (e.currentTarget.style.borderColor = '#F59E0B'); (e.currentTarget.style.color = '#B45309'); (e.currentTarget.style.background = '#FFFBEB'); }}
                        onMouseLeave={e => { (e.currentTarget.style.borderColor = '#E2E8F0'); (e.currentTarget.style.color = '#475569'); (e.currentTarget.style.background = '#fff'); }}
                      >{term}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          ) : (
            /* ── Results grid ────────────────────────────────────────────── */
            <div key={`results-${query}-${selectedCat}-${sortBy}`}    >
              {/* Result count bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  Showing <strong style={{ color: '#171717' }}>{results.length}</strong> product{results.length !== 1 ? 's' : ''}
                  {selectedCat !== 'All' && <> in <strong style={{ color: '#171717' }}>{selectedCat}</strong></>}
                </p>
              </div>

              {/* Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {results.map((tool, i) => (
                  <div
                    key={tool.id}
                    
                  >
                    <ToolCard tool={tool} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      </div>

      <Footer />
    </div>
  );
}
