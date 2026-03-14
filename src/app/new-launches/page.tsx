"use client";

// Design: LaudStack amber + neutral. New Launches page with TAAFT-style screenshot cards.
// Consistent with homepage Fresh Launches section card design.

import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { useToolsData } from '@/hooks/useToolsData';
import { CATEGORY_META } from '@/lib/categories';
import { Zap, Star, BarChart3, Rocket, Shield, ChevronRight, Calendar, Filter } from 'lucide-react';
import { toast } from 'sonner';

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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: d, ease: 'easeOut' as const } }),
};

// Helper: parse New Launches filter params from URL
function parseNewLaunchesParams(params: URLSearchParams) {
  return {
    category: params.get('category') || 'All',
    pricing:  params.get('pricing')  || 'All Pricing',
    sort:     params.get('sort')     || 'newest',
  };
}

export default function NewLaunches() {
  const { tools: allTools, reviews: allReviews, loading: toolsLoading } = useToolsData();

  const router = useRouter();
  const pathname = usePathname();

  const initial = useMemo(() => parseNewLaunchesParams(new URLSearchParams(window.location.search)), []);

  const [category, setCategory] = useState(initial.category);
  const [pricing,  setPricing]  = useState(initial.pricing);
  const [sort,     setSort]     = useState(initial.sort);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [visible,  setVisible]  = useState(20);
  const [syncingFromUrl, setSyncingFromUrl] = useState(false);

  // Outbound: write filter state to URL
  useEffect(() => {
    if (syncingFromUrl) return;
    const params = new URLSearchParams();
    if (category !== 'All')         params.set('category', category);
    if (pricing  !== 'All Pricing') params.set('pricing',  pricing);
    if (sort     !== 'newest')      params.set('sort',     sort);
    const qs = params.toString();
    const newPath = qs ? `/launches?${qs}` : '/launches';
    if (window.location.pathname + window.location.search !== newPath) {
      router.replace(newPath);
    }
  }, [category, pricing, sort]);

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

  const allCategories = ['All', ...CATEGORY_META.map(c => c.name).filter(n => n !== 'All')];

  const filteredTools = useMemo(() => {
    let tools = [...allTools];
    if (category !== 'All') tools = tools.filter(t => t.category === category);
    if (pricing !== 'All Pricing') tools = tools.filter(t => t.pricing_model === pricing);
    if (sort === 'newest') tools.sort((a, b) => new Date(b.launched_at).getTime() - new Date(a.launched_at).getTime());
    else if (sort === 'upvotes') tools.sort((a, b) => b.upvote_count - a.upvote_count);
    else if (sort === 'rating') tools.sort((a, b) => b.average_rating - a.average_rating);
    return tools;
  }, [category, pricing, sort]);

  const newCount = filteredTools.filter(t => isNew(t.launched_at)).length;
  const visibleTools = filteredTools.slice(0, visible);

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <PageHero
        eyebrow="New Launches"
        title="Recently Added Tools"
        subtitle="The freshest SaaS & AI stacks launched by founders — sorted by launch date, newest first."
        accent="green"
        layout="default"
        size="md"
      >
        {/* Latest activity strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: '4px' }}>Just added:</span>
          {[...allTools]
            .sort((a, b) => new Date(b.launched_at).getTime() - new Date(a.launched_at).getTime())
            .slice(0, 4)
            .map(tool => (
              <button
                key={tool.id}
                onClick={() => router.push(`/tools/${tool.slug}`)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '5px 10px 5px 6px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                  background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#15803D',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#DCFCE7'; e.currentTarget.style.borderColor = '#86EFAC'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#F0FDF4'; e.currentTarget.style.borderColor = '#BBF7D0'; }}
              >
                {tool.logo_url
                  ? <img src={tool.logo_url} alt="" style={{ width: '18px', height: '18px', borderRadius: '4px', objectFit: 'contain', background: '#fff' }} />
                  : <span style={{ width: '18px', height: '18px', borderRadius: '4px', background: '#22C55E', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900, color: '#fff' }}>{tool.name[0]}</span>
                }
                {tool.name}
              </button>
            ))}
          <span style={{ fontSize: '12px', color: '#9CA3AF' }}>+ {newCount} this month</span>
        </div>
      </PageHero>

      {/* ── Filters ── */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E8ECF0', position: 'sticky', top: '64px', zIndex: 40 }}>
        <div className="max-w-[1280px] mx-auto px-3 sm:px-6 lg:px-10" style={{ paddingTop: '14px', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>

            {/* Left: category scroll + pricing + sort */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
              {/* Category scrollable pills */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                {allCategories.slice(0, 8).map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setCategory(cat); setVisible(20); }}
                    style={{
                      flexShrink: 0, padding: '5px 12px', borderRadius: '8px',
                      fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                      border: category === cat ? '1.5px solid #F59E0B' : '1.5px solid #E8ECF0',
                      background: category === cat ? '#F59E0B' : '#F9FAFB',
                      color: category === cat ? '#0A0A0A' : '#6B7280',
                      transition: 'all 0.15s', fontFamily: 'inherit',
                    }}
                  >{cat}</button>
                ))}
              </div>

              {/* Divider */}
              <div style={{ width: '1px', height: '24px', background: '#E8ECF0', flexShrink: 0 }} />

              {/* Pricing select */}
              <select
                value={pricing}
                onChange={e => { setPricing(e.target.value); setVisible(20); }}
                style={{
                  padding: '5px 10px', borderRadius: '8px', border: '1.5px solid #E8ECF0',
                  fontSize: '12px', fontWeight: 600, color: '#374151', background: '#F9FAFB',
                  cursor: 'pointer', fontFamily: 'inherit', outline: 'none',
                }}
              >
                {PRICING_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              {/* Sort select */}
              <select
                value={sort}
                onChange={e => { setSort(e.target.value); setVisible(20); }}
                style={{
                  padding: '5px 10px', borderRadius: '8px', border: '1.5px solid #E8ECF0',
                  fontSize: '12px', fontWeight: 600, color: '#374151', background: '#F9FAFB',
                  cursor: 'pointer', fontFamily: 'inherit', outline: 'none',
                }}
              >
                {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>

              <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 500, whiteSpace: 'nowrap' }}>
                <span style={{ color: '#171717', fontWeight: 800 }}>{filteredTools.length}</span> tools
              </span>
            </div>

            {/* Right: view toggle */}
            <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: '10px', padding: '3px', gap: '2px', flexShrink: 0 }}>
              {(['grid', 'list'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    padding: '5px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 700,
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                    background: viewMode === mode ? '#FFFFFF' : 'transparent',
                    color: viewMode === mode ? '#171717' : '#9CA3AF',
                    boxShadow: viewMode === mode ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  }}
                >{mode === 'grid' ? 'Grid' : 'List'}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-[1280px] mx-auto w-full px-3 sm:px-6 lg:px-10" style={{ paddingTop: '24px', paddingBottom: '48px', flex: 1 }}>

        {filteredTools.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#171717', marginBottom: '8px' }}>No tools match these filters</h3>
            <p style={{ fontSize: '14px', color: '#9CA3AF' }}>Try adjusting the category or pricing filter</p>
          </div>
        ) : viewMode === 'grid' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ gap: '20px' }}>
              {visibleTools.map((tool, i) => {
                const screenshotSrc = tool.screenshot_url ?? FALLBACK_SHOTS[i % FALLBACK_SHOTS.length];
                const viewCount = (tool.upvote_count * 3 + tool.review_count * 12);
                return (
                  <div
                    key={tool.id}
                    
                    onClick={() => router.push(`/tools/${tool.slug}`)}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #E8ECF0',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                    }}
                    
                  >
                    {/* ── Header: logo + name + category + laud ── */}
                    <div style={{ padding: '14px 14px 10px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      {/* Logo */}
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
                        border: '1px solid #E8ECF0', background: '#F8FAFC',
                        overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <img
                          src={tool.logo_url}
                          alt={tool.name}
                          style={{ width: '36px', height: '36px', objectFit: 'contain' }}
                          onError={e => {
                            const t = e.currentTarget;
                            t.style.display = 'none';
                            const p = t.parentElement;
                            if (p) { p.innerHTML = `<span style="font-size:18px;font-weight:800;color:#64748B">${tool.name.charAt(0)}</span>`; }
                          }}
                        />
                      </div>

                      {/* Name + category */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: '#171717', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {tool.name}
                          </span>
                          {tool.is_verified && (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="#3B82F6">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                        <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>{tool.category}</span>
                      </div>

                      {/* Laud button */}
                      <button
                        onClick={e => { e.stopPropagation(); toast.success('Lauded!'); }}
                        style={{
                          flexShrink: 0, display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center', gap: '1px',
                          padding: '6px 10px', borderRadius: '10px',
                          border: '1.5px solid #E8ECF0', background: '#F9FAFB',
                          cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                          minWidth: '42px',
                        }}
                        onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#F59E0B'; b.style.background = '#FFFBEB'; }}
                        onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#E8ECF0'; b.style.background = '#F9FAFB'; }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="18 15 12 9 6 15" />
                        </svg>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#374151', lineHeight: 1.2 }}>
                          {tool.upvote_count > 999 ? `${(tool.upvote_count / 1000).toFixed(1)}k` : tool.upvote_count}
                        </span>
                      </button>
                    </div>

                    {/* ── Screenshot ── */}
                    <div style={{ position: 'relative', width: '100%', paddingTop: '58%', overflow: 'hidden', background: '#F3F4F6', flexShrink: 0 }}>
                      <img
                        src={screenshotSrc}
                        alt={`${tool.name} screenshot`}
                        style={{
                          position: 'absolute', inset: 0,
                          width: '100%', height: '100%',
                          objectFit: 'cover', objectPosition: 'top center',
                          transition: 'transform 0.4s ease',
                        }}
                        onError={e => { (e.target as HTMLImageElement).src = FALLBACK_SHOTS[i % FALLBACK_SHOTS.length]; }}
                      />
                      {/* View count overlay */}
                      <div style={{
                        position: 'absolute', top: '8px', left: '8px',
                        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
                        borderRadius: '6px', padding: '3px 8px',
                        display: 'flex', alignItems: 'center', gap: '4px',
                      }}>
                        <BarChart3 style={{ width: '10px', height: '10px', color: '#9CA3AF' }} />
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#E5E7EB' }}>{viewCount.toLocaleString()}</span>
                      </div>
                      {/* New badge */}
                      {isNew(tool.launched_at) && (
                        <div style={{
                          position: 'absolute', top: '8px', right: '8px',
                          background: '#F59E0B', borderRadius: '5px', padding: '2px 7px',
                        }}>
                          <span style={{ fontSize: '9px', fontWeight: 800, color: '#0A0A0A', letterSpacing: '0.06em', textTransform: 'uppercase' }}>New</span>
                        </div>
                      )}
                    </div>

                    {/* ── Description ── */}
                    <div style={{ padding: '10px 14px 0' }}>
                      <p style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.55, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {tool.tagline}
                      </p>
                    </div>

                    {/* ── Footer ── */}
                    <div style={{
                      padding: '10px 14px 13px',
                      marginTop: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      borderTop: '1px solid #F3F4F6',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>{timeAgo(tool.launched_at)}</span>
                        <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#D1D5DB', display: 'inline-block' }} />
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '11px', fontWeight: 700, color: '#374151' }}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="#F59E0B">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          {tool.average_rating.toFixed(1)}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', background: '#F3F4F6', padding: '2px 8px', borderRadius: '5px' }}>
                        {tool.pricing_model}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load more / end state */}
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              {visible < filteredTools.length ? (
                <button
                  onClick={() => setVisible(v => v + 20)}
                  style={{
                    padding: '12px 32px', borderRadius: '12px', border: '1.5px solid #E8ECF0',
                    background: '#FFFFFF', fontSize: '13px', fontWeight: 700, color: '#374151',
                    cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  }}
                  onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#F59E0B'; b.style.color = '#D97706'; }}
                  onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#E8ECF0'; b.style.color = '#374151'; }}
                >
                  Show {Math.min(20, filteredTools.length - visible)} more
                </button>
              ) : (
                <p style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: 500 }}>All {filteredTools.length} tools shown</p>
              )}
            </div>
          </>
        ) : (
          /* ── List view ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {visibleTools.map((tool, i) => (
              <div
                key={tool.id}
                
                onClick={() => router.push(`/tools/${tool.slug}`)}
                style={{
                  background: '#FFFFFF', border: '1px solid #E8ECF0', borderRadius: '14px',
                  padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.15s',
                }}
                
              >
                {/* Logo */}
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
                  border: '1px solid #E8ECF0', background: '#F8FAFC',
                  overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <img
                    src={tool.logo_url}
                    alt={tool.name}
                    style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                    onError={e => {
                      const t = e.currentTarget;
                      t.style.display = 'none';
                      const p = t.parentElement;
                      if (p) { p.innerHTML = `<span style="font-size:16px;font-weight:800;color:#64748B">${tool.name.charAt(0)}</span>`; }
                    }}
                  />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#171717', letterSpacing: '-0.01em' }}>{tool.name}</span>
                    {tool.is_verified && <Shield style={{ width: '13px', height: '13px', color: '#3B82F6', flexShrink: 0 }} />}
                    {isNew(tool.launched_at) && (
                      <span style={{ fontSize: '9px', fontWeight: 800, color: '#0A0A0A', background: '#F59E0B', padding: '1px 6px', borderRadius: '4px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>New</span>
                    )}
                    <span style={{ fontSize: '11px', color: '#9CA3AF', background: '#F3F4F6', padding: '1px 7px', borderRadius: '5px', fontWeight: 500 }}>{tool.category}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tool.tagline}</p>
                </div>

                {/* Stats */}
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right', display: 'none' }} className="sm:block">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#171717' }}>{tool.average_rating.toFixed(1)}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{timeAgo(tool.launched_at)}</div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', background: '#F3F4F6', padding: '3px 10px', borderRadius: '6px' }}>{tool.pricing_model}</span>
                  <ChevronRight style={{ width: '16px', height: '16px', color: '#D1D5DB' }} />
                </div>
              </div>
            ))}

            {/* Load more */}
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              {visible < filteredTools.length ? (
                <button
                  onClick={() => setVisible(v => v + 20)}
                  style={{
                    padding: '10px 28px', borderRadius: '10px', border: '1.5px solid #E8ECF0',
                    background: '#FFFFFF', fontSize: '13px', fontWeight: 700, color: '#374151',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#F59E0B'; b.style.color = '#D97706'; }}
                  onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#E8ECF0'; b.style.color = '#374151'; }}
                >
                  Show {Math.min(20, filteredTools.length - visible)} more
                </button>
              ) : (
                <p style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: 500 }}>All {filteredTools.length} tools shown</p>
              )}
            </div>
          </div>
        )}

        {/* ── Launch CTA ── */}
        <div style={{
          marginTop: '64px', background: '#FFFBEB', border: '1px solid #FCD34D',
          borderRadius: '20px', padding: '48px 32px', textAlign: 'center',
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px', background: '#F59E0B',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
          }}>
            <Rocket style={{ width: '26px', height: '26px', color: '#0A0A0A' }} />
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#171717', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Have a product to launch?
          </h3>
          <p style={{ fontSize: '14px', color: '#6B7280', maxWidth: '400px', margin: '0 auto 24px', lineHeight: 1.6 }}>
            Launch your AI or SaaS tool on LaudStack and get discovered by thousands of professionals.
          </p>
          <button
            onClick={() => router.push('/launchpad')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 28px', borderRadius: '12px',
              background: '#F59E0B', border: 'none',
              fontSize: '14px', fontWeight: 800, color: '#0A0A0A',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#D97706'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F59E0B'; }}
          >
            <Rocket style={{ width: '16px', height: '16px' }} />
            Launch Your Tool
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
