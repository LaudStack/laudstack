"use client";
export const dynamic = 'force-dynamic';
/*
 * LaudStack — Launch Archive
 *
 * Browse all past product launches organized by month.
 * Timeline view with month-by-month grouping, search, and category filters.
 *
 * Design: light, consistent with platform theme — amber accents, slate typography.
 */
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Archive, Search, Star, ShieldCheck, ChevronUp,
  Calendar, Filter, ArrowRight, Rocket, Clock,
  ExternalLink, ChevronDown,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { useToolsData } from '@/hooks/useToolsData';
import { CATEGORY_META } from '@/lib/categories';
import type { Tool } from '@/lib/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(key: string): string {
  const [year, month] = key.split('-');
  return `${MONTH_NAMES[parseInt(month) - 1]} ${year}`;
}

function pricingStyle(model: string): React.CSSProperties {
  if (model === 'Free')     return { background: '#F0FDF4', color: '#15803D', borderColor: '#BBF7D0' };
  if (model === 'Freemium') return { background: '#EFF6FF', color: '#1D4ED8', borderColor: '#BFDBFE' };
  if (model === 'Open Source') return { background: '#F5F3FF', color: '#7C3AED', borderColor: '#DDD6FE' };
  return { background: '#F8FAFC', color: '#475569', borderColor: '#CBD5E1' };
}

// ─── Launch Card ──────────────────────────────────────────────────────────────
function LaunchCard({ product }: { product: Tool }) {
  const router = useRouter();
  const launchDate = new Date(product.launched_at);
  const dayStr = launchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div
      onClick={() => router.push(`/tools/${product.slug}`)}
      style={{
        background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 14,
        padding: '18px 20px', cursor: 'pointer', transition: 'all 0.18s',
        display: 'flex', alignItems: 'center', gap: 14,
        boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(15,23,42,0.08)';
        (e.currentTarget as HTMLDivElement).style.borderColor = '#FDE68A';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(15,23,42,0.04)';
        (e.currentTarget as HTMLDivElement).style.borderColor = '#E2E8F0';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Date badge */}
      <div style={{
        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
        background: '#FFFBEB', border: '1px solid #FDE68A',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#D97706', textTransform: 'uppercase', lineHeight: 1 }}>
          {launchDate.toLocaleDateString('en-US', { month: 'short' })}
        </span>
        <span style={{ fontSize: 16, fontWeight: 900, color: '#B45309', lineHeight: 1.1 }}>
          {launchDate.getDate()}
        </span>
      </div>

      {/* Logo */}
      <img
        src={product.logo_url || `https://www.google.com/s2/favicons?domain=${product.website_url}&sz=64`}
        alt={product.name}
        style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', border: '1px solid #F1F5F9', flexShrink: 0 }}
        onError={e => { (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${product.website_url}&sz=64`; }}
      />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 800, color: '#111827' }}>{product.name}</span>
          {product.is_verified && <ShieldCheck style={{ width: 13, height: 13, color: '#22C55E' }} />}
          <span style={{ ...pricingStyle(product.pricing_model), fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, border: '1px solid', lineHeight: '15px' }}>
            {product.pricing_model}
          </span>
        </div>
        <p style={{ fontSize: 12, color: '#6B7280', margin: '3px 0 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.tagline}
        </p>
      </div>

      {/* Rating + lauds */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Star style={{ width: 13, height: 13, fill: '#F59E0B', color: '#F59E0B' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{product.average_rating.toFixed(1)}</span>
        </div>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
          padding: '6px 10px', borderRadius: 8, background: '#F8FAFC', border: '1px solid #E2E8F0',
        }}>
          <ChevronUp style={{ width: 14, height: 14, color: '#94A3B8' }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: '#475569' }}>{product.upvote_count || 0}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LaunchArchivePage() {
  const { tools: allTools, loading } = useToolsData();
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  // Group products by launch month
  const monthGroups = useMemo(() => {
    let filtered = category === 'All' ? allTools : allTools.filter(t => t.category === category);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t => t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q));
    }

    const sorted = [...filtered].sort((a, b) => new Date(b.launched_at).getTime() - new Date(a.launched_at).getTime());

    const groups: { key: string; label: string; products: Tool[] }[] = [];
    const map = new Map<string, Tool[]>();

    for (const product of sorted) {
      const key = getMonthKey(new Date(product.launched_at));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(product);
    }

    for (const [key, products] of map) {
      groups.push({ key, label: getMonthLabel(key), products });
    }

    return groups;
  }, [allTools, category, searchQuery]);

  // Auto-expand first 3 months
  const visibleMonths = useMemo(() => {
    const autoExpand = new Set(monthGroups.slice(0, 3).map(g => g.key));
    return new Set([...autoExpand, ...expandedMonths]);
  }, [monthGroups, expandedMonths]);

  const toggleMonth = (key: string) => {
    setExpandedMonths(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const categories = CATEGORY_META.filter(c => c.name !== 'All');
  const totalLaunches = monthGroups.reduce((s, g) => s + g.products.length, 0);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFFFFF' }}>
      <Navbar />
      <div style={{ height: 72, flexShrink: 0 }} />

      <PageHero
        layout="centered"
        eyebrow="LAUNCH ARCHIVE"
        badge="Every Launch, Ever"
        title="Product Launch Archive"
        subtitle="Browse every product that has launched on LaudStack, organized by month. Discover the full history of SaaS and AI innovation."
        accent="amber"
        stats={[
          { label: 'Total Launches', value: totalLaunches.toString() },
          { label: 'Months', value: monthGroups.length.toString() },
          { label: 'Categories', value: categories.length.toString() },
        ]}
      />

      <main style={{ flex: 1 }}>
        {/* ── Search + Filters ── */}
        <section style={{ background: '#FFFFFF', padding: '24px 0', borderBottom: '1px solid #F1F5F9', position: 'sticky', top: 72, zIndex: 10 }}>
          <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              {/* Search */}
              <div style={{
                display: 'flex', alignItems: 'center', flex: 1, minWidth: 240,
                background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0', overflow: 'hidden',
              }}>
                <Search style={{ marginLeft: 12, width: 14, height: 14, color: '#94A3B8', flexShrink: 0 }} />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search launches..."
                  style={{ flex: 1, padding: '9px 12px', fontSize: 13, color: '#111827', background: 'transparent', border: 'none', outline: 'none' }}
                />
              </div>

              {/* Category filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Filter style={{ width: 14, height: 14, color: '#94A3B8' }} />
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  style={{
                    padding: '9px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                    color: '#475569', background: '#F8FAFC', border: '1px solid #E2E8F0',
                    cursor: 'pointer', outline: 'none',
                  }}
                >
                  <option value="All">All Categories</option>
                  {categories.map(c => (
                    <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* ── Timeline ── */}
        <section style={{ background: '#FAFBFC', padding: '32px 0 56px' }}>
          <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 24px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ width: 32, height: 32, border: '3px solid #E2E8F0', borderTopColor: '#F59E0B', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                <p style={{ fontSize: 13, color: '#6B7280' }}>Loading archive...</p>
              </div>
            ) : monthGroups.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {monthGroups.map(group => {
                  const isExpanded = visibleMonths.has(group.key);
                  return (
                    <div key={group.key} style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
                      {/* Month header */}
                      <button
                        onClick={() => toggleMonth(group.key)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                          padding: '18px 24px', background: 'transparent', border: 'none',
                          cursor: 'pointer', transition: 'background 0.12s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FAFBFC'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                      >
                        <Calendar style={{ width: 18, height: 18, color: '#D97706', flexShrink: 0 }} />
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, fontWeight: 900, color: '#111827', flex: 1, textAlign: 'left' }}>
                          {group.label}
                        </span>
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: '#D97706', background: '#FEF3C7',
                          padding: '3px 10px', borderRadius: 6, border: '1px solid #FDE68A',
                        }}>
                          {group.products.length} {group.products.length === 1 ? 'launch' : 'launches'}
                        </span>
                        <ChevronDown style={{
                          width: 16, height: 16, color: '#94A3B8', flexShrink: 0,
                          transition: 'transform 0.2s',
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                        }} />
                      </button>

                      {/* Products */}
                      {isExpanded && (
                        <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {group.products.map(product => (
                            <LaunchCard key={product.slug} product={product} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0' }}>
                <Archive style={{ width: 40, height: 40, color: '#CBD5E1', margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#374151', margin: '0 0 6px' }}>No launches found</h3>
                <p style={{ fontSize: 13, color: '#6B7280' }}>Try a different search or category.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
