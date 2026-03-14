"use client";

export const dynamic = 'force-dynamic';


/*
 * LaudStack — Community Picks
 *
 * Tools voted to the top by the LaudStack community.
 * Sorted by laud count; filterable by category and time period.
 * Design: light, consistent with platform theme — amber accents, slate typography.
 */

import { useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  ChevronUp, Users, Flame, Filter, Star, ExternalLink,
  ShieldCheck, TrendingUp, Award, Search, ArrowRight, Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToolsData } from '@/hooks/useToolsData';
import { CATEGORY_META } from '@/lib/categories';
import type { Tool } from '@/lib/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIME_PERIODS = [
  { key: 'all_time', label: 'All Time' },
  { key: 'this_month', label: 'This Month' },
  { key: 'this_week', label: 'This Week' },
] as const;

type TimePeriod = (typeof TIME_PERIODS)[number]['key'];

function pricingStyle(model: string): React.CSSProperties {
  if (model === 'Free')     return { background: '#F0FDF4', color: '#15803D', borderColor: '#BBF7D0' };
  if (model === 'Freemium') return { background: '#EFF6FF', color: '#1D4ED8', borderColor: '#BFDBFE' };
  return { background: '#F8FAFC', color: '#475569', borderColor: '#CBD5E1' };
}

// ─── Community Pick Card ───────────────────────────────────────────────────────

function CommunityPickCard({
  tool,
  rank,
  onVote,
  voted,
}: {
  tool: Tool;
  rank: number;
  onVote: (id: string) => void;
  voted: boolean;
}) {
  const router = useRouter();
  const isTop3 = rank <= 3;
  const rankColors = ['#D97706', '#94A3B8', '#B45309'];

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: `1.5px solid ${isTop3 ? '#FDE68A' : '#E2E8F0'}`,
        borderRadius: 16,
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        cursor: 'pointer',
        transition: 'box-shadow 0.18s, border-color 0.18s, transform 0.18s',
        boxShadow: isTop3 ? '0 2px 12px rgba(245,158,11,0.08)' : '0 1px 4px rgba(15,23,42,0.05)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = '0 8px 28px rgba(15,23,42,0.10)';
        el.style.borderColor = '#FDE68A';
        el.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = isTop3 ? '0 2px 12px rgba(245,158,11,0.08)' : '0 1px 4px rgba(15,23,42,0.05)';
        el.style.borderColor = isTop3 ? '#FDE68A' : '#E2E8F0';
        el.style.transform = 'translateY(0)';
      }}
      onClick={() => router.push(`/tools/${tool.slug}`)}
    >
      {/* Rank */}
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isTop3 ? rankColors[rank - 1] : '#F1F5F9',
        color: isTop3 ? '#fff' : '#64748B',
        fontWeight: 900, fontSize: 15,
        boxShadow: isTop3 ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
      }}>
        {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
      </div>

      {/* Logo */}
      <div style={{
        width: 52, height: 52, borderRadius: 13, flexShrink: 0,
        border: '1px solid #E2E8F0', background: '#F8FAFC',
        overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <img
          src={tool.logo_url}
          alt={tool.name}
          style={{ width: 40, height: 40, objectFit: 'contain' }}
          onError={e => {
            const t = e.currentTarget;
            t.style.display = 'none';
            const p = t.parentElement;
            if (p) p.innerHTML = `<span style="font-size:20px;font-weight:800;color:#64748B">${tool.name.charAt(0)}</span>`;
          }}
        />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#171717', letterSpacing: '-0.01em' }}>
            {tool.name}
          </span>
          {tool.is_verified && (
            <ShieldCheck style={{ width: 14, height: 14, color: '#22C55E', flexShrink: 0 }} />
          )}
          {tool.is_featured && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              fontSize: 10, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase',
              padding: '2px 7px', borderRadius: 5,
              background: '#FFF7ED', color: '#B45309', border: '1px solid #FDE68A',
            }}>
              <Sparkles style={{ width: 8, height: 8 }} />
              Featured
            </span>
          )}
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
            background: '#FFF1F2', color: '#BE123C', border: '1px solid #FECDD3',
          }}>
            Community Pick
          </span>
        </div>
        <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 8px', lineHeight: 1.5 }}>
          {tool.tagline}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Stars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {[1,2,3,4,5].map(i => (
              <Star key={i} style={{ width: 12, height: 12 }}
                fill={i <= Math.round(tool.average_rating) ? '#FBBF24' : '#E2E8F0'}
                color={i <= Math.round(tool.average_rating) ? '#FBBF24' : '#E2E8F0'}
              />
            ))}
            <span style={{ fontSize: 12, fontWeight: 700, color: '#171717', marginLeft: 3 }}>
              {tool.average_rating.toFixed(1)}
            </span>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>({tool.review_count})</span>
          </div>
          {/* Category */}
          <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, background: '#F8FAFC', padding: '2px 8px', borderRadius: 6, border: '1px solid #E2E8F0' }}>
            {tool.category}
          </span>
          {/* Pricing */}
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, border: '1px solid', ...pricingStyle(tool.pricing_model) }}>
            {tool.pricing_model}
          </span>
        </div>
      </div>

      {/* Upvote */}
      <button
        onClick={e => { e.stopPropagation(); onVote(tool.id); }}
        style={{
          flexShrink: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 2,
          padding: '10px 14px', borderRadius: 12, minWidth: 56,
          border: voted ? '1.5px solid #F59E0B' : '1.5px solid #E2E8F0',
          background: voted ? '#FFFBEB' : '#FAFAFA',
          cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
        }}
        onMouseEnter={e => {
          if (!voted) {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.borderColor = '#F59E0B';
            b.style.background = '#FFFBEB';
          }
        }}
        onMouseLeave={e => {
          if (!voted) {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.borderColor = '#E2E8F0';
            b.style.background = '#FAFAFA';
          }
        }}
      >
        <ChevronUp style={{ width: 16, height: 16, color: voted ? '#D97706' : '#64748B' }} />
        <span style={{ fontSize: 13, fontWeight: 800, color: voted ? '#D97706' : '#374151' }}>
          {(tool.upvote_count + (voted ? 1 : 0)).toLocaleString()}
        </span>
      </button>

      {/* External link */}
      <a
        href={tool.website_url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        style={{
          flexShrink: 0, width: 36, height: 36, borderRadius: 10,
          border: '1.5px solid #E2E8F0', background: '#FAFAFA',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s', color: '#94A3B8',
        }}
        onMouseEnter={e => {
          const a = e.currentTarget as HTMLAnchorElement;
          a.style.borderColor = '#F59E0B';
          a.style.color = '#D97706';
          a.style.background = '#FFFBEB';
        }}
        onMouseLeave={e => {
          const a = e.currentTarget as HTMLAnchorElement;
          a.style.borderColor = '#E2E8F0';
          a.style.color = '#94A3B8';
          a.style.background = '#FAFAFA';
        }}
      >
        <ExternalLink style={{ width: 14, height: 14 }} />
      </a>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CommunityPicks() {
  const { tools: allTools, reviews: allReviews, loading: toolsLoading } = useToolsData();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all_time');
  const [searchQuery, setSearchQuery] = useState('');
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(20);

  const handleVote = (id: string) => {
    if (votedIds.has(id)) {
      toast.info('You already voted for this product.');
      return;
    }
    setVotedIds(prev => { const next = new Set(Array.from(prev)); next.add(id); return next; });
    toast.success('Vote recorded! Thanks for supporting the community.');
  };

  const filteredTools = useMemo(() => {
    let tools = [...allTools];

    if (selectedCategory !== 'All') {
      tools = tools.filter(t => t.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      tools = tools.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }

    // Sort by upvote_count (community lauds)
    tools.sort((a, b) => b.upvote_count - a.upvote_count);

    return tools;
  }, [selectedCategory, timePeriod, searchQuery]);

  const visibleTools = filteredTools.slice(0, visibleCount);

  // Stats
  const totalVotes = allTools.reduce((s, t) => s + t.upvote_count, 0);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFC' }}>
      <Navbar />
      <div style={{ height: 72, flexShrink: 0 }} />

      {/* ── Hero ── */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }} className="py-8 sm:py-12">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderRadius: 100, background: '#FFF1F2', border: '1px solid #FECDD3', marginBottom: 16 }}>
                <Users style={{ width: 12, height: 12, color: '#BE123C' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#BE123C', letterSpacing: '0.09em', textTransform: 'uppercase' }}>Community Picks</span>
              </div>
              <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 900, color: '#171717', letterSpacing: '-0.03em', margin: '0 0 12px', lineHeight: 1.1 }}>
                Voted by the Community
              </h1>
              <p style={{ fontSize: 16, color: '#64748B', maxWidth: 520, lineHeight: 1.65, margin: 0 }}>
                These are the stacks that the LaudStack community loves most — ranked purely by community lauds. No editorial bias, just real user enthusiasm.
              </p>
            </div>
            {/* Stats row */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[
                { icon: Users, value: '12,000+', label: 'Community Members' },
                { icon: ChevronUp, value: totalVotes.toLocaleString(), label: 'Total Votes Cast' },
                { icon: TrendingUp, value: `${allTools.length}+`, label: 'Tools Ranked' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} style={{ textAlign: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 16px', minWidth: 90 }}>
                  <Icon style={{ width: 18, height: 18, color: '#F59E0B', margin: '0 auto 6px' }} />
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#171717', letterSpacing: '-0.02em' }}>{value}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Filters ── */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 0' }}>
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 180px', maxWidth: 320 }}>
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#94A3B8' }} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search community picks..."
                style={{
                  width: '100%', paddingLeft: 36, paddingRight: 12, height: 38,
                  fontSize: 13, color: '#171717', background: '#F8FAFC',
                  border: '1.5px solid #E2E8F0', borderRadius: 9, outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.target.style.borderColor = '#F59E0B')}
                onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
              />
            </div>

            {/* Time period */}
            <div style={{ display: 'flex', gap: 6 }}>
              {TIME_PERIODS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTimePeriod(key)}
                  style={{
                    padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                    border: timePeriod === key ? '1.5px solid #F59E0B' : '1.5px solid #E2E8F0',
                    background: timePeriod === key ? '#FFFBEB' : '#FFFFFF',
                    color: timePeriod === key ? '#B45309' : '#64748B',
                    transition: 'all 0.14s', fontFamily: 'inherit',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Category filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter style={{ width: 14, height: 14, color: '#94A3B8', flexShrink: 0 }} />
              <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                {['All', ...CATEGORY_META.filter(c => c.name !== 'All').map(c => c.name)].slice(0, 8).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: 700,
                      border: selectedCategory === cat ? '1.5px solid #F59E0B' : '1.5px solid #E2E8F0',
                      background: selectedCategory === cat ? '#F59E0B' : '#FFFFFF',
                      color: selectedCategory === cat ? '#0A0A0A' : '#64748B',
                      transition: 'all 0.14s', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0,
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <main style={{ flex: 1, padding: '40px 0 64px' }}>
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10">
          {/* Results header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <p style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
              Showing <strong style={{ color: '#171717' }}>{Math.min(visibleCount, filteredTools.length)}</strong> of <strong style={{ color: '#171717' }}>{filteredTools.length}</strong> tools
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94A3B8' }}>
              <Flame style={{ width: 13, height: 13, color: '#F59E0B' }} />
              Sorted by community lauds
            </div>
          </div>

          {filteredTools.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#94A3B8' }}>
              <Users style={{ width: 48, height: 48, margin: '0 auto 16px', opacity: 0.3 }} />
              <p style={{ fontSize: 16, fontWeight: 600 }}>No tools found for this filter.</p>
              <button onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }} style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: '#F59E0B', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>
                Clear filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {visibleTools.map((tool, i) => (
                <CommunityPickCard
                  key={tool.id}
                  tool={tool}
                  rank={i + 1}
                  onVote={handleVote}
                  voted={votedIds.has(tool.id)}
                />
              ))}
            </div>
          )}

          {visibleCount < filteredTools.length && (
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <button
                onClick={() => setVisibleCount(v => v + 20)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '11px 28px', borderRadius: 10, border: '1.5px solid #E2E8F0',
                  fontSize: 13, fontWeight: 700, color: '#374151', background: '#FFFFFF',
                  cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
                onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#F59E0B'; b.style.color = '#B45309'; b.style.background = '#FFFBEB'; }}
                onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#E2E8F0'; b.style.color = '#374151'; b.style.background = '#FFFFFF'; }}
              >
                Load 20 more <ArrowRight style={{ width: 13, height: 13 }} />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ── CTA banner ── */}
      <section style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '48px 0' }}>
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10" style={{ textAlign: 'center' }}>
          <Award style={{ width: 36, height: 36, color: '#F59E0B', margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 26, fontWeight: 800, color: '#171717', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            Have a stack the community should know about?
          </h2>
          <p style={{ fontSize: 15, color: '#64748B', margin: '0 0 24px', lineHeight: 1.65 }}>
            Launch it via LaunchPad and let the community vote it up.
          </p>
          <a
            href="/launchpad"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px', borderRadius: 12, fontSize: 14, fontWeight: 700,
              color: '#FFFFFF', background: '#F59E0B', textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(245,158,11,0.3)', transition: 'box-shadow 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 20px rgba(245,158,11,0.45)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 14px rgba(245,158,11,0.3)')}
          >
            Launch via LaunchPad <ArrowRight style={{ width: 14, height: 14 }} />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
