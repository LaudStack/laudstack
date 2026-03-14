"use client";
export const dynamic = 'force-dynamic';
/*
 * LaudStack — Alternatives Page
 *
 * Find alternatives to any AI or SaaS product.
 * Search for a product, then see alternatives in the same category
 * with ratings, pricing, and quick comparison CTAs.
 *
 * Design: light, consistent with platform theme — amber accents, slate typography.
 */
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, ArrowRight, Star, Layers, ChevronRight,
  ShieldCheck, ExternalLink, GitCompareArrows, Sparkles,
  TrendingUp, Filter, X,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { useToolsData } from '@/hooks/useToolsData';
import { CATEGORY_META } from '@/lib/categories';
import type { Tool } from '@/lib/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pricingStyle(model: string): React.CSSProperties {
  if (model === 'Free')     return { background: '#F0FDF4', color: '#15803D', borderColor: '#BBF7D0' };
  if (model === 'Freemium') return { background: '#EFF6FF', color: '#1D4ED8', borderColor: '#BFDBFE' };
  if (model === 'Open Source') return { background: '#F5F3FF', color: '#7C3AED', borderColor: '#DDD6FE' };
  return { background: '#F8FAFC', color: '#475569', borderColor: '#CBD5E1' };
}

// ─── Product Selector Card ────────────────────────────────────────────────────
function ProductSelectorCard({
  product,
  isSelected,
  onSelect,
}: {
  product: Tool;
  isSelected: boolean;
  onSelect: (slug: string) => void;
}) {
  const router = useRouter();
  return (
    <div
      onClick={() => onSelect(product.slug)}
      style={{
        background: isSelected ? '#FFFBEB' : '#FFFFFF',
        border: `1.5px solid ${isSelected ? '#F59E0B' : '#E2E8F0'}`,
        borderRadius: 14,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        cursor: 'pointer',
        transition: 'all 0.18s',
        boxShadow: isSelected ? '0 2px 12px rgba(245,158,11,0.10)' : '0 1px 4px rgba(15,23,42,0.04)',
      }}
      onMouseEnter={e => {
        if (!isSelected) {
          (e.currentTarget as HTMLDivElement).style.borderColor = '#FDE68A';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(15,23,42,0.08)';
        }
      }}
      onMouseLeave={e => {
        if (!isSelected) {
          (e.currentTarget as HTMLDivElement).style.borderColor = '#E2E8F0';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(15,23,42,0.04)';
        }
      }}
    >
      {/* Logo */}
      <img
        src={product.logo_url || `https://www.google.com/s2/favicons?domain=${product.website_url}&sz=64`}
        alt={product.name}
        style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', border: '1px solid #F1F5F9', flexShrink: 0 }}
        onError={e => { (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${product.website_url}&sz=64`; }}
      />
      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 800, color: '#111827' }}>{product.name}</span>
          {product.is_verified && <ShieldCheck style={{ width: 13, height: 13, color: '#22C55E' }} />}
        </div>
        <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {product.tagline}
        </p>
      </div>
      {/* Rating */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
        <Star style={{ width: 13, height: 13, fill: '#F59E0B', color: '#F59E0B' }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{product.average_rating.toFixed(1)}</span>
      </div>
      {/* Selection indicator */}
      <div style={{
        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
        border: isSelected ? '2px solid #F59E0B' : '2px solid #CBD5E1',
        background: isSelected ? '#F59E0B' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
      </div>
    </div>
  );
}

// ─── Alternative Card ─────────────────────────────────────────────────────────
function AlternativeCard({
  product,
  selectedProduct,
  rank,
}: {
  product: Tool;
  selectedProduct: Tool;
  rank: number;
}) {
  const router = useRouter();
  const isTop3 = rank <= 3;

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: `1.5px solid ${isTop3 ? '#E0F2FE' : '#E2E8F0'}`,
        borderRadius: 16,
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        cursor: 'pointer',
        transition: 'all 0.18s',
        boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
      }}
      onClick={() => router.push(`/tools/${product.slug}`)}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 28px rgba(15,23,42,0.10)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(15,23,42,0.04)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Rank */}
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: isTop3 ? '#EFF6FF' : '#F8FAFC',
        border: `1px solid ${isTop3 ? '#BFDBFE' : '#E2E8F0'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 800, color: isTop3 ? '#2563EB' : '#94A3B8',
      }}>
        {rank}
      </div>

      {/* Logo */}
      <img
        src={product.logo_url || `https://www.google.com/s2/favicons?domain=${product.website_url}&sz=64`}
        alt={product.name}
        style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover', border: '1px solid #F1F5F9', flexShrink: 0 }}
        onError={e => { (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${product.website_url}&sz=64`; }}
      />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 800, color: '#111827' }}>{product.name}</span>
          {product.is_verified && <ShieldCheck style={{ width: 14, height: 14, color: '#22C55E' }} />}
          <span style={{ ...pricingStyle(product.pricing_model), fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, border: '1px solid', lineHeight: '16px' }}>
            {product.pricing_model}
          </span>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.tagline}
        </p>
        {/* Rating row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {[1,2,3,4,5].map(i => (
              <Star key={i} style={{ width: 12, height: 12, fill: i <= Math.round(product.average_rating) ? '#F59E0B' : 'transparent', color: i <= Math.round(product.average_rating) ? '#F59E0B' : '#CBD5E1' }} />
            ))}
            <span style={{ fontSize: 12, fontWeight: 700, color: '#111827', marginLeft: 3 }}>{product.average_rating.toFixed(1)}</span>
          </div>
          <span style={{ fontSize: 11, color: '#94A3B8' }}>({product.review_count} reviews)</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
        <button
          onClick={e => { e.stopPropagation(); router.push(`/compare?tools=${selectedProduct.slug},${product.slug}`); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 10,
            fontSize: 12, fontWeight: 700, color: '#2563EB', background: '#EFF6FF',
            border: '1px solid #BFDBFE', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#DBEAFE'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#EFF6FF'; }}
        >
          <GitCompareArrows style={{ width: 12, height: 12 }} /> Compare
        </button>
        <button
          onClick={e => { e.stopPropagation(); router.push(`/tools/${product.slug}`); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 10,
            fontSize: 12, fontWeight: 700, color: '#475569', background: '#F8FAFC',
            border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F1F5F9'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC'; }}
        >
          <ExternalLink style={{ width: 12, height: 12 }} /> View
        </button>
      </div>
    </div>
  );
}

// ─── Popular Alternatives Grid ────────────────────────────────────────────────
function PopularAlternativeCard({
  product,
  alternativeCount,
}: {
  product: Tool;
  alternativeCount: number;
}) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/alternatives?product=${product.slug}`)}
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #E2E8F0',
        borderRadius: 14,
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.18s',
        boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 24px rgba(15,23,42,0.08)';
        (e.currentTarget as HTMLDivElement).style.borderColor = '#FDE68A';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(15,23,42,0.04)';
        (e.currentTarget as HTMLDivElement).style.borderColor = '#E2E8F0';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <img
          src={product.logo_url || `https://www.google.com/s2/favicons?domain=${product.website_url}&sz=64`}
          alt={product.name}
          style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', border: '1px solid #F1F5F9' }}
          onError={e => { (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${product.website_url}&sz=64`; }}
        />
        <div>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 800, color: '#111827' }}>{product.name}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
            <Star style={{ width: 11, height: 11, fill: '#F59E0B', color: '#F59E0B' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#111827' }}>{product.average_rating.toFixed(1)}</span>
            <span style={{ fontSize: 10, color: '#94A3B8', marginLeft: 2 }}>({product.review_count})</span>
          </div>
        </div>
      </div>
      <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {product.tagline}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#D97706' }}>{alternativeCount} alternatives</span>
        <ArrowRight style={{ width: 14, height: 14, color: '#D97706' }} />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AlternativesPage() {
  const { tools: allTools, loading } = useToolsData();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Parse URL param for pre-selected product
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const urlProduct = urlParams?.get('product');

  // Auto-select from URL
  useState(() => {
    if (urlProduct && !selectedSlug) {
      setSelectedSlug(urlProduct);
    }
  });

  const selectedProduct = useMemo(() => {
    const slug = selectedSlug || urlProduct;
    return slug ? allTools.find(t => t.slug === slug) : null;
  }, [allTools, selectedSlug, urlProduct]);

  // Search results for product selector
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allTools
      .filter(t => t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q))
      .slice(0, 8);
  }, [allTools, searchQuery]);

  // Alternatives: same category, excluding selected product, sorted by rating
  const alternatives = useMemo(() => {
    if (!selectedProduct) return [];
    return allTools
      .filter(t => t.category === selectedProduct.category && t.slug !== selectedProduct.slug)
      .sort((a, b) => b.average_rating - a.average_rating);
  }, [allTools, selectedProduct]);

  // Popular products (most reviewed) for the "Popular Alternatives" grid
  const popularProducts = useMemo(() => {
    return [...allTools]
      .sort((a, b) => b.review_count - a.review_count)
      .slice(0, 12);
  }, [allTools]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allTools.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
    return counts;
  }, [allTools]);

  const categories = CATEGORY_META.filter(c => c.name !== 'All' && (categoryCounts[c.name] || 0) > 1);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFFFFF' }}>
      <Navbar />
      <div style={{ height: 72, flexShrink: 0 }} />

      <PageHero
        layout="centered"
        eyebrow="ALTERNATIVES"
        badge="Compare & Choose"
        title="Find the Best Alternatives"
        subtitle="Search for any AI or SaaS product and discover top-rated alternatives. Compare features, pricing, and reviews side by side."
        accent="blue"
        stats={[
          { label: 'Products', value: allTools.length.toString() },
          { label: 'Categories', value: categories.length.toString() },
          { label: 'Reviews', value: allTools.reduce((s, t) => s + t.review_count, 0).toLocaleString() },
        ]}
      />

      <main style={{ flex: 1 }}>
        {/* ── Search Section ── */}
        <section style={{ background: '#FFFFFF', padding: '40px 0 32px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ maxWidth: 680, margin: '0 auto' }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8, display: 'block' }}>
                Search for a product to find alternatives
              </label>
              <div style={{
                display: 'flex', alignItems: 'center', background: '#FFFFFF',
                borderRadius: 14, border: '1.5px solid #E2E8F0', overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94A3B8' }} />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="e.g. ChatGPT, Notion, Figma..."
                    style={{ width: '100%', paddingLeft: 44, paddingRight: 16, height: 52, fontSize: 15, color: '#111827', background: 'transparent', border: 'none', outline: 'none' }}
                  />
                </div>
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); }}
                    style={{ padding: '0 12px', height: 52, background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                  >
                    <X style={{ width: 16, height: 16 }} />
                  </button>
                )}
              </div>

              {/* Search results dropdown */}
              {searchQuery.trim() && searchResults.length > 0 && (
                <div style={{
                  marginTop: 8, background: '#FFFFFF', border: '1.5px solid #E2E8F0',
                  borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', overflow: 'hidden',
                }}>
                  {searchResults.map(tool => (
                    <ProductSelectorCard
                      key={tool.slug}
                      product={tool}
                      isSelected={selectedSlug === tool.slug}
                      onSelect={(slug) => { setSelectedSlug(slug); setSearchQuery(''); }}
                    />
                  ))}
                </div>
              )}

              {searchQuery.trim() && searchResults.length === 0 && !loading && (
                <div style={{ marginTop: 12, padding: '16px 20px', background: '#F8FAFC', borderRadius: 12, textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: '#6B7280' }}>No products found matching &ldquo;{searchQuery}&rdquo;</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Selected Product + Alternatives ── */}
        {selectedProduct && (
          <section style={{ background: '#FAFBFC', padding: '48px 0 56px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 24px' }}>
              {/* Selected product header */}
              <div style={{
                background: '#FFFFFF', border: '1.5px solid #FDE68A', borderRadius: 18,
                padding: '24px 28px', marginBottom: 32,
                boxShadow: '0 2px 12px rgba(245,158,11,0.08)',
                display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
              }}>
                <img
                  src={selectedProduct.logo_url || `https://www.google.com/s2/favicons?domain=${selectedProduct.website_url}&sz=64`}
                  alt={selectedProduct.name}
                  style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'cover', border: '1px solid #F1F5F9', flexShrink: 0 }}
                  onError={e => { (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${selectedProduct.website_url}&sz=64`; }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 20, fontWeight: 900, color: '#111827', margin: 0 }}>
                      Alternatives to {selectedProduct.name}
                    </h2>
                    {selectedProduct.is_verified && <ShieldCheck style={{ width: 16, height: 16, color: '#22C55E' }} />}
                  </div>
                  <p style={{ fontSize: 14, color: '#6B7280', margin: '4px 0 0' }}>
                    {alternatives.length} alternative{alternatives.length !== 1 ? 's' : ''} in {selectedProduct.category}
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedSlug(null); setSearchQuery(''); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '8px 16px', borderRadius: 10,
                    fontSize: 13, fontWeight: 700, color: '#6B7280', background: '#F8FAFC',
                    border: '1px solid #E2E8F0', cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  <X style={{ width: 14, height: 14 }} /> Clear
                </button>
              </div>

              {/* Alternatives list */}
              {alternatives.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {alternatives.map((tool, i) => (
                    <AlternativeCard
                      key={tool.slug}
                      product={tool}
                      selectedProduct={selectedProduct}
                      rank={i + 1}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '48px 20px', background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0' }}>
                  <Layers style={{ width: 40, height: 40, color: '#CBD5E1', margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#374151', margin: '0 0 6px' }}>No alternatives found</h3>
                  <p style={{ fontSize: 13, color: '#6B7280' }}>
                    We don&apos;t have other products in the {selectedProduct.category} category yet.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Popular Alternatives (shown when no product selected) ── */}
        {!selectedProduct && (
          <section style={{ background: '#FAFBFC', padding: '48px 0 56px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 24px' }}>
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: '#FEF3C7', border: '1px solid #FDE68A', marginBottom: 14 }}>
                  <Sparkles style={{ width: 12, height: 12, color: '#D97706' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#D97706', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Popular</span>
                </div>
                <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 900, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                  Most Searched Alternatives
                </h2>
                <p style={{ fontSize: 14, color: '#6B7280', maxWidth: 480 }}>
                  Discover alternatives to the most popular SaaS and AI stacks on the platform.
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
              }}>
                {popularProducts.map(product => (
                  <PopularAlternativeCard
                    key={product.slug}
                    product={product}
                    alternativeCount={allTools.filter(t => t.category === product.category && t.slug !== product.slug).length}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Browse by Category ── */}
        <section style={{ background: '#FFFFFF', padding: '48px 0 56px' }}>
          <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: '#EFF6FF', border: '1px solid #BFDBFE', marginBottom: 14 }}>
                <Filter style={{ width: 12, height: 12, color: '#2563EB' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', letterSpacing: '0.08em', textTransform: 'uppercase' }}>By Category</span>
              </div>
              <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 900, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                Find Alternatives by Category
              </h2>
              <p style={{ fontSize: 14, color: '#6B7280', maxWidth: 480 }}>
                Browse categories to discover alternative products in your area of interest.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 12,
            }}>
              {categories.map(cat => (
                <div
                  key={cat.name}
                  onClick={() => router.push(`/tools?category=${encodeURIComponent(cat.name)}`)}
                  style={{
                    background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 14,
                    padding: '16px 20px', cursor: 'pointer', transition: 'all 0.18s',
                    display: 'flex', alignItems: 'center', gap: 14,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = '#FDE68A';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(15,23,42,0.06)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = '#E2E8F0';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                  }}
                >
                  <span style={{ fontSize: 24 }}>{cat.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{cat.name}</span>
                    <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>
                      {categoryCounts[cat.name] || 0} products
                    </p>
                  </div>
                  <ChevronRight style={{ width: 16, height: 16, color: '#CBD5E1', flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
