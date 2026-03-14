"use client";
export const dynamic = 'force-dynamic';
/*
 * LaudStack — Comparisons Hub
 *
 * Browse popular product matchups and start your own comparison.
 * Shows popular head-to-head matchups, category-based comparisons,
 * and a product picker to build custom comparisons.
 *
 * Design: light, consistent with platform theme — amber accents, slate typography.
 */
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  GitCompareArrows, Search, Star, ShieldCheck, ArrowRight,
  Sparkles, Layers, ChevronRight, TrendingUp, X, Zap,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { useToolsData } from '@/hooks/useToolsData';
import { CATEGORY_META } from '@/lib/categories';
import type { Tool } from '@/lib/types';

// ─── Matchup Card ─────────────────────────────────────────────────────────────
function MatchupCard({ toolA, toolB }: { toolA: Tool; toolB: Tool }) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/compare?tools=${toolA.slug},${toolB.slug}`)}
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #E2E8F0',
        borderRadius: 16,
        padding: '24px',
        cursor: 'pointer',
        transition: 'all 0.18s',
        boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 28px rgba(15,23,42,0.10)';
        (e.currentTarget as HTMLDivElement).style.borderColor = '#FDE68A';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(15,23,42,0.04)';
        (e.currentTarget as HTMLDivElement).style.borderColor = '#E2E8F0';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Two logos with VS badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <img
            src={toolA.logo_url || `https://www.google.com/s2/favicons?domain=${toolA.website_url}&sz=64`}
            alt={toolA.name}
            style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover', border: '1px solid #F1F5F9' }}
            onError={e => { (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${toolA.website_url}&sz=64`; }}
          />
          <p style={{ fontSize: 12, fontWeight: 700, color: '#111827', margin: '6px 0 0' }}>{toolA.name}</p>
        </div>

        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: '#FEF3C7', border: '1.5px solid #FDE68A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 900, color: '#D97706',
        }}>
          VS
        </div>

        <div style={{ textAlign: 'center' }}>
          <img
            src={toolB.logo_url || `https://www.google.com/s2/favicons?domain=${toolB.website_url}&sz=64`}
            alt={toolB.name}
            style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover', border: '1px solid #F1F5F9' }}
            onError={e => { (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${toolB.website_url}&sz=64`; }}
          />
          <p style={{ fontSize: 12, fontWeight: 700, color: '#111827', margin: '6px 0 0' }}>{toolB.name}</p>
        </div>
      </div>

      {/* Rating comparison */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid #F1F5F9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Star style={{ width: 12, height: 12, fill: '#F59E0B', color: '#F59E0B' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{toolA.average_rating.toFixed(1)}</span>
          <span style={{ fontSize: 10, color: '#94A3B8' }}>({toolA.review_count})</span>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Compare</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Star style={{ width: 12, height: 12, fill: '#F59E0B', color: '#F59E0B' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{toolB.average_rating.toFixed(1)}</span>
          <span style={{ fontSize: 10, color: '#94A3B8' }}>({toolB.review_count})</span>
        </div>
      </div>

      {/* Category */}
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{toolA.category}</span>
      </div>
    </div>
  );
}

// ─── Product Picker ───────────────────────────────────────────────────────────
function ProductPicker({
  label,
  selected,
  onSelect,
  onClear,
  allTools,
}: {
  label: string;
  selected: Tool | null;
  onSelect: (tool: Tool) => void;
  onClear: () => void;
  allTools: Tool[];
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allTools.filter(t => t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q)).slice(0, 6);
  }, [allTools, query]);

  if (selected) {
    return (
      <div style={{
        background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 14,
        padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 260,
      }}>
        <img
          src={selected.logo_url || `https://www.google.com/s2/favicons?domain=${selected.website_url}&sz=64`}
          alt={selected.name}
          style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', border: '1px solid #F1F5F9' }}
          onError={e => { (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${selected.website_url}&sz=64`; }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>{selected.name}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
            <Star style={{ width: 11, height: 11, fill: '#F59E0B', color: '#F59E0B' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#111827' }}>{selected.average_rating.toFixed(1)}</span>
          </div>
        </div>
        <button onClick={onClear} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4 }}>
          <X style={{ width: 16, height: 16 }} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      <div style={{
        display: 'flex', alignItems: 'center', background: '#FFFFFF',
        borderRadius: 12, border: '1.5px solid #E2E8F0', overflow: 'hidden',
      }}>
        <Search style={{ marginLeft: 14, width: 14, height: 14, color: '#94A3B8', flexShrink: 0 }} />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search products..."
          style={{ flex: 1, padding: '12px 14px', fontSize: 14, color: '#111827', background: 'transparent', border: 'none', outline: 'none' }}
        />
      </div>
      {open && query.trim() && results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20, marginTop: 4,
          background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.10)', overflow: 'hidden',
        }}>
          {results.map(tool => (
            <div
              key={tool.slug}
              onClick={() => { onSelect(tool); setQuery(''); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                cursor: 'pointer', transition: 'background 0.12s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#F8FAFC'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
            >
              <img
                src={tool.logo_url || `https://www.google.com/s2/favicons?domain=${tool.website_url}&sz=64`}
                alt={tool.name}
                style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', border: '1px solid #F1F5F9' }}
                onError={e => { (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${tool.website_url}&sz=64`; }}
              />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{tool.name}</span>
              <span style={{ fontSize: 11, color: '#94A3B8', marginLeft: 'auto' }}>{tool.category}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ComparisonsPage() {
  const { tools: allTools, loading } = useToolsData();
  const router = useRouter();
  const [productA, setProductA] = useState<Tool | null>(null);
  const [productB, setProductB] = useState<Tool | null>(null);

  // Generate popular matchups from top-rated products in each category
  const matchups = useMemo(() => {
    const pairs: { a: Tool; b: Tool }[] = [];
    const categories = [...new Set(allTools.map(t => t.category))];

    for (const cat of categories) {
      const catTools = allTools.filter(t => t.category === cat).sort((a, b) => b.average_rating - a.average_rating);
      if (catTools.length >= 2) {
        pairs.push({ a: catTools[0], b: catTools[1] });
        if (catTools.length >= 4) {
          pairs.push({ a: catTools[2], b: catTools[3] });
        }
      }
    }
    return pairs.slice(0, 12);
  }, [allTools]);

  // Category matchups — top 2 products per category
  const categoryMatchups = useMemo(() => {
    const cats = CATEGORY_META.filter(c => c.name !== 'All');
    return cats.map(cat => {
      const catTools = allTools.filter(t => t.category === cat.name).sort((a, b) => b.average_rating - a.average_rating);
      return { ...cat, tools: catTools.slice(0, 2), count: catTools.length };
    }).filter(c => c.tools.length >= 2);
  }, [allTools]);

  const canCompare = productA && productB && productA.slug !== productB.slug;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFFFFF' }}>
      <Navbar />
      <div style={{ height: 72, flexShrink: 0 }} />

      <PageHero
        layout="centered"
        eyebrow="COMPARISONS"
        badge="Side by Side"
        title="Compare Products Head to Head"
        subtitle="Put any two AI or SaaS products side by side. Compare features, pricing, ratings, and reviews to make the right choice."
        accent="amber"
        stats={[
          { label: 'Products', value: allTools.length.toString() },
          { label: 'Matchups', value: matchups.length.toString() },
          { label: 'Categories', value: categoryMatchups.length.toString() },
        ]}
      />

      <main style={{ flex: 1 }}>
        {/* ── Custom Comparison Builder ── */}
        <section style={{ background: '#FFFFFF', padding: '40px 0 36px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 24px' }}>
            <div style={{
              background: '#FAFBFC', border: '1.5px solid #E2E8F0', borderRadius: 18,
              padding: '28px 32px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <GitCompareArrows style={{ width: 18, height: 18, color: '#D97706' }} />
                <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 900, color: '#111827', margin: 0 }}>
                  Build Your Comparison
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
                <ProductPicker
                  label="Product A"
                  selected={productA}
                  onSelect={setProductA}
                  onClear={() => setProductA(null)}
                  allTools={allTools}
                />

                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: '#FEF3C7', border: '1.5px solid #FDE68A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 900, color: '#D97706', marginBottom: 2,
                }}>
                  VS
                </div>

                <ProductPicker
                  label="Product B"
                  selected={productB}
                  onSelect={setProductB}
                  onClear={() => setProductB(null)}
                  allTools={allTools}
                />

                <button
                  onClick={() => {
                    if (canCompare) router.push(`/compare?tools=${productA!.slug},${productB!.slug}`);
                  }}
                  disabled={!canCompare}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '12px 24px', borderRadius: 12,
                    fontSize: 14, fontWeight: 800, color: '#FFFFFF',
                    background: canCompare ? '#F59E0B' : '#CBD5E1',
                    border: 'none', cursor: canCompare ? 'pointer' : 'not-allowed',
                    transition: 'all 0.15s', flexShrink: 0, whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { if (canCompare) (e.currentTarget as HTMLButtonElement).style.background = '#D97706'; }}
                  onMouseLeave={e => { if (canCompare) (e.currentTarget as HTMLButtonElement).style.background = '#F59E0B'; }}
                >
                  <GitCompareArrows style={{ width: 16, height: 16 }} /> Compare Now
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Popular Matchups ── */}
        <section style={{ background: '#FAFBFC', padding: '48px 0 56px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: '#FEF3C7', border: '1px solid #FDE68A', marginBottom: 14 }}>
                <Sparkles style={{ width: 12, height: 12, color: '#D97706' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#D97706', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Popular</span>
              </div>
              <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 900, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                Trending Matchups
              </h2>
              <p style={{ fontSize: 14, color: '#6B7280', maxWidth: 480 }}>
                The most popular head-to-head comparisons on the platform right now.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}>
              {matchups.map((m, i) => (
                <MatchupCard key={`${m.a.slug}-${m.b.slug}-${i}`} toolA={m.a} toolB={m.b} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Compare by Category ── */}
        <section style={{ background: '#FFFFFF', padding: '48px 0 56px' }}>
          <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: '#EFF6FF', border: '1px solid #BFDBFE', marginBottom: 14 }}>
                <Layers style={{ width: 12, height: 12, color: '#2563EB' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', letterSpacing: '0.08em', textTransform: 'uppercase' }}>By Category</span>
              </div>
              <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 900, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                Compare by Category
              </h2>
              <p style={{ fontSize: 14, color: '#6B7280', maxWidth: 480 }}>
                See how the top products stack up in each category.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {categoryMatchups.map(cat => (
                <div
                  key={cat.name}
                  onClick={() => router.push(`/compare?tools=${cat.tools[0].slug},${cat.tools[1].slug}`)}
                  style={{
                    background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 14,
                    padding: '16px 24px', cursor: 'pointer', transition: 'all 0.18s',
                    display: 'flex', alignItems: 'center', gap: 16,
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
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>{cat.name}</span>
                    <p style={{ fontSize: 12, color: '#94A3B8', margin: '2px 0 0' }}>{cat.count} products</p>
                  </div>

                  {/* Top 2 logos */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <img
                      src={cat.tools[0].logo_url || `https://www.google.com/s2/favicons?domain=${cat.tools[0].website_url}&sz=64`}
                      alt={cat.tools[0].name}
                      style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', border: '1px solid #F1F5F9' }}
                      onError={e => { (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${cat.tools[0].website_url}&sz=64`; }}
                    />
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#D97706' }}>vs</span>
                    <img
                      src={cat.tools[1].logo_url || `https://www.google.com/s2/favicons?domain=${cat.tools[1].website_url}&sz=64`}
                      alt={cat.tools[1].name}
                      style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', border: '1px solid #F1F5F9' }}
                      onError={e => { (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${cat.tools[1].website_url}&sz=64`; }}
                    />
                  </div>

                  <span style={{ fontSize: 12, fontWeight: 700, color: '#D97706', flexShrink: 0 }}>
                    {cat.tools[0].name} vs {cat.tools[1].name}
                  </span>
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
