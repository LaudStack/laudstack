/**
 * LaudStack SearchResults Page
 *
 * Design: "Warm Professional" — consistent with the rest of LaudStack
 * - Reads ?q= from URL via wouter's useSearch
 * - Filters MOCK_TOOLS by name, tagline, and tags (case-insensitive)
 * - Category filter pills + sort dropdown
 * - Polished empty state with suggestions
 * - Navigates to /tools/:slug on card click
 */

import { useState, useMemo } from 'react';
import { useSearch, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, ArrowRight, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import { MOCK_TOOLS, CATEGORIES } from '@/lib/mockData';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'rating',    label: 'Highest Rated' },
  { value: 'reviews',   label: 'Most Reviewed' },
  { value: 'newest',    label: 'Newest First' },
  { value: 'upvotes',   label: 'Most Upvoted' },
];

const SUGGESTED_SEARCHES = [
  'AI writing', 'code editor', 'design tools', 'analytics', 'project management',
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
  const searchStr = useSearch();
  const params    = new URLSearchParams(searchStr);
  const initialQ  = params.get('q') || '';

  const [query,           setQuery]           = useState(initialQ);
  const [inputValue,      setInputValue]      = useState(initialQ);
  const [selectedCat,     setSelectedCat]     = useState('All');
  const [sortBy,          setSortBy]          = useState('relevance');
  const [, navigate]                          = useLocation();

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    let filtered = MOCK_TOOLS.filter(tool => {
      const matchesQuery = !q
        || tool.name.toLowerCase().includes(q)
        || tool.tagline.toLowerCase().includes(q)
        || tool.description.toLowerCase().includes(q)
        || tool.tags.some(tag => tag.toLowerCase().includes(q))
        || tool.category.toLowerCase().includes(q);

      const matchesCat = selectedCat === 'All' || tool.category === selectedCat;

      return matchesQuery && matchesCat;
    });

    switch (sortBy) {
      case 'rating':    filtered = [...filtered].sort((a, b) => b.average_rating - a.average_rating); break;
      case 'reviews':   filtered = [...filtered].sort((a, b) => b.review_count - a.review_count); break;
      case 'newest':    filtered = [...filtered].sort((a, b) => new Date(b.launched_at).getTime() - new Date(a.launched_at).getTime()); break;
      case 'upvotes':   filtered = [...filtered].sort((a, b) => b.upvote_count - a.upvote_count); break;
      default: break; // relevance = natural order
    }

    return filtered;
  }, [query, selectedCat, sortBy]);

  const handleSearch = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSuggestion = (term: string) => {
    setInputValue(term);
    setQuery(term);
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const clearSearch = () => {
    setInputValue('');
    setQuery('');
    navigate('/search');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Navbar />

      {/* ── Search Header ──────────────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', paddingTop: '88px', paddingBottom: '28px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>

          {/* Search bar */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '14px', boxShadow: '0 2px 20px rgba(0,0,0,0.08)', border: '1.5px solid #E2E8F0', overflow: 'hidden', maxWidth: '760px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#94A3B8' }} />
              <input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search tools by name, category, or tag..."
                autoFocus
                style={{ width: '100%', paddingLeft: '50px', paddingRight: inputValue ? '44px' : '16px', height: '54px', fontSize: '15px', color: '#171717', background: 'transparent', border: 'none', outline: 'none' }}
              />
              {inputValue && (
                <button onClick={clearSearch} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center', padding: '4px' }}>
                  <X style={{ width: '16px', height: '16px' }} />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              style={{ height: '54px', padding: '0 28px', fontWeight: 700, color: '#fff', fontSize: '14px', background: '#F59E0B', border: 'none', cursor: 'pointer', flexShrink: 0, transition: 'opacity 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Search
            </button>
          </div>

          {/* Result summary */}
          {query && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '14px', color: '#64748B' }}>
                <strong style={{ color: '#171717' }}>{results.length}</strong> result{results.length !== 1 ? 's' : ''} for
              </span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#171717', background: '#F1F5F9', padding: '2px 10px', borderRadius: '6px' }}>"{query}"</span>
              {selectedCat !== 'All' && (
                <span style={{ fontSize: '13px', color: '#64748B' }}>in <strong>{selectedCat}</strong></span>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Filters bar ────────────────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #F1F5F9', position: 'sticky', top: '72px', zIndex: 40 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', padding: '12px 0', scrollbarWidth: 'none' }}>
            {/* Category pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              {['All', ...CATEGORIES.map(c => c.name)].map(cat => (
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
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 40px 64px' }}>

        <AnimatePresence mode="wait">
          {!query ? (
            /* ── No query: show suggestions ──────────────────────────────── */
            <motion.div key="empty-query" initial="hidden" animate="visible" exit={{ opacity: 0 }} variants={fadeUp}>
              <div style={{ textAlign: 'center', padding: '60px 0 40px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'linear-gradient(135deg, #FEF3C7, #FED7AA)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Search style={{ width: '28px', height: '28px', color: '#D97706' }} />
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#171717', margin: '0 0 8px', fontFamily: "'Inter', sans-serif" }}>Search LaudStack</h2>
                <p style={{ fontSize: '15px', color: '#64748B', margin: '0 0 36px' }}>Find the best AI & SaaS tools by name, category, or tag.</p>

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
            </motion.div>

          ) : results.length === 0 ? (
            /* ── No results ──────────────────────────────────────────────── */
            <motion.div key="no-results" initial="hidden" animate="visible" exit={{ opacity: 0 }} variants={fadeUp}>
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
                    onClick={() => { setSelectedCat('All'); navigate('/'); }}
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
            </motion.div>

          ) : (
            /* ── Results grid ────────────────────────────────────────────── */
            <motion.div key={`results-${query}-${selectedCat}-${sortBy}`} initial="hidden" animate="visible" exit={{ opacity: 0 }} variants={fadeUp}>
              {/* Result count bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  Showing <strong style={{ color: '#171717' }}>{results.length}</strong> tool{results.length !== 1 ? 's' : ''}
                  {selectedCat !== 'All' && <> in <strong style={{ color: '#171717' }}>{selectedCat}</strong></>}
                </p>
              </div>

              {/* Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {results.map((tool, i) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.04 }}
                  >
                    <ToolCard tool={tool} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
}
