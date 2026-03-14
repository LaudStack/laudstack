"use client";
export const dynamic = 'force-dynamic';
/*
 * LaudStack — Community Voting
 *
 * Product Hunt-style voting page where the community lauds
 * their favorite SaaS and AI stacks. Sorted by votes with
 * time-period filters and category filtering.
 *
 * Design: light, consistent with platform theme — amber accents, slate typography.
 */
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronUp, Users, Star, ShieldCheck, TrendingUp,
  Filter, Award, Flame, ArrowRight, Sparkles, Clock,
  ExternalLink, MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { useToolsData } from '@/hooks/useToolsData';
import { CATEGORY_META } from '@/lib/categories';
import type { Tool } from '@/lib/types';

// ─── Constants ────────────────────────────────────────────────────────────────
const TIME_PERIODS = [
  { key: 'today', label: 'Today', icon: Flame },
  { key: 'this_week', label: 'This Week', icon: TrendingUp },
  { key: 'this_month', label: 'This Month', icon: Clock },
  { key: 'all_time', label: 'All Time', icon: Award },
] as const;
type TimePeriod = (typeof TIME_PERIODS)[number]['key'];

function pricingStyle(model: string): React.CSSProperties {
  if (model === 'Free')     return { background: '#F0FDF4', color: '#15803D', borderColor: '#BBF7D0' };
  if (model === 'Freemium') return { background: '#EFF6FF', color: '#1D4ED8', borderColor: '#BFDBFE' };
  if (model === 'Open Source') return { background: '#F5F3FF', color: '#7C3AED', borderColor: '#DDD6FE' };
  return { background: '#F8FAFC', color: '#475569', borderColor: '#CBD5E1' };
}

// ─── Voting Card ──────────────────────────────────────────────────────────────
function VotingCard({
  product,
  rank,
  votes,
  voted,
  onVote,
}: {
  product: Tool;
  rank: number;
  votes: number;
  voted: boolean;
  onVote: (slug: string) => void;
}) {
  const router = useRouter();
  const isTop3 = rank <= 3;
  const rankColors = ['#D97706', '#94A3B8', '#B45309'];
  const rankBgs = ['#FEF3C7', '#F1F5F9', '#FEF3C7'];

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: `1.5px solid ${isTop3 ? '#FDE68A' : '#E2E8F0'}`,
        borderRadius: 16,
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        transition: 'all 0.18s',
        boxShadow: isTop3 ? '0 2px 12px rgba(245,158,11,0.06)' : '0 1px 4px rgba(15,23,42,0.04)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 24px rgba(15,23,42,0.08)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = isTop3 ? '0 2px 12px rgba(245,158,11,0.06)' : '0 1px 4px rgba(15,23,42,0.04)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Rank */}
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: isTop3 ? rankBgs[rank - 1] : '#F8FAFC',
        border: `1.5px solid ${isTop3 ? '#FDE68A' : '#E2E8F0'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 900,
        color: isTop3 ? rankColors[rank - 1] : '#94A3B8',
      }}>
        {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
      </div>

      {/* Laud button */}
      <button
        onClick={e => { e.stopPropagation(); onVote(product.slug); }}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          padding: '8px 12px', borderRadius: 10, flexShrink: 0,
          background: voted ? '#FEF3C7' : '#F8FAFC',
          border: `1.5px solid ${voted ? '#F59E0B' : '#E2E8F0'}`,
          cursor: 'pointer', transition: 'all 0.15s', minWidth: 52,
        }}
        onMouseEnter={e => {
          if (!voted) {
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#FDE68A';
            (e.currentTarget as HTMLButtonElement).style.background = '#FFFBEB';
          }
        }}
        onMouseLeave={e => {
          if (!voted) {
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0';
            (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC';
          }
        }}
      >
        <ChevronUp style={{ width: 16, height: 16, color: voted ? '#D97706' : '#94A3B8' }} />
        <span style={{ fontSize: 13, fontWeight: 800, color: voted ? '#D97706' : '#475569' }}>{votes}</span>
      </button>

      {/* Logo */}
      <img
        src={product.logo_url || `https://www.google.com/s2/favicons?domain=${product.website_url}&sz=64`}
        alt={product.name}
        onClick={() => router.push(`/tools/${product.slug}`)}
        style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover', border: '1px solid #F1F5F9', flexShrink: 0, cursor: 'pointer' }}
        onError={e => { (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${product.website_url}&sz=64`; }}
      />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => router.push(`/tools/${product.slug}`)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 800, color: '#111827' }}>{product.name}</span>
          {product.is_verified && <ShieldCheck style={{ width: 14, height: 14, color: '#22C55E' }} />}
          <span style={{ ...pricingStyle(product.pricing_model), fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, border: '1px solid', lineHeight: '16px' }}>
            {product.pricing_model}
          </span>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.tagline}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Star style={{ width: 12, height: 12, fill: '#F59E0B', color: '#F59E0B' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{product.average_rating.toFixed(1)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <MessageSquare style={{ width: 11, height: 11, color: '#94A3B8' }} />
            <span style={{ fontSize: 11, color: '#94A3B8' }}>{product.review_count} reviews</span>
          </div>
          <span style={{ fontSize: 11, color: '#CBD5E1' }}>·</span>
          <span style={{ fontSize: 11, color: '#94A3B8' }}>{product.category}</span>
        </div>
      </div>

      {/* View button */}
      <button
        onClick={() => router.push(`/tools/${product.slug}`)}
        style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 10,
          fontSize: 12, fontWeight: 700, color: '#475569', background: '#F8FAFC',
          border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F1F5F9'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC'; }}
      >
        <ExternalLink style={{ width: 12, height: 12 }} /> View
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CommunityVotingPage() {
  const { tools: allTools, loading } = useToolsData();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('this_week');
  const [category, setCategory] = useState('All');
  const [votedSlugs, setVotedSlugs] = useState<Set<string>>(new Set());

  const handleVote = (slug: string) => {
    setVotedSlugs(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
    toast.success(votedSlugs.has(slug) ? 'Vote removed' : 'Vote recorded!');
  };

  // Simulate vote counts based on lauds + review_count
  const productsWithVotes = useMemo(() => {
    let filtered = category === 'All' ? allTools : allTools.filter(t => t.category === category);

    return filtered
      .map(t => ({
        ...t,
        voteCount: (t.upvote_count || 0) + Math.floor(t.review_count * 1.5) + (votedSlugs.has(t.slug) ? 1 : 0),
      }))
      .sort((a, b) => b.voteCount - a.voteCount);
  }, [allTools, category, votedSlugs]);

  const categories = CATEGORY_META.filter(c => c.name !== 'All');
  const totalVotes = productsWithVotes.reduce((s, t) => s + t.voteCount, 0);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFFFFF' }}>
      <Navbar />
      <div style={{ height: 72, flexShrink: 0 }} />

      <PageHero
        layout="centered"
        eyebrow="COMMUNITY VOTING"
        badge="Your Voice Matters"
        title="Vote for the Best Products"
        subtitle="The community decides. Laud the SaaS and AI stacks you love and help others discover the best software."
        accent="amber"
      />

      <main style={{ flex: 1 }}>
        {/* ── Filters ── */}
        <section style={{ background: '#FFFFFF', padding: '24px 0', borderBottom: '1px solid #F1F5F9', position: 'sticky', top: 72, zIndex: 10 }}>
          <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              {/* Time period tabs */}
              <div style={{ display: 'flex', background: '#F8FAFC', borderRadius: 10, padding: 3, border: '1px solid #E2E8F0' }}>
                {TIME_PERIODS.map(tp => {
                  const Icon = tp.icon;
                  const active = timePeriod === tp.key;
                  return (
                    <button
                      key={tp.key}
                      onClick={() => setTimePeriod(tp.key)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8,
                        fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                        background: active ? '#FFFFFF' : 'transparent',
                        color: active ? '#D97706' : '#6B7280',
                        boxShadow: active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                      }}
                    >
                      <Icon style={{ width: 13, height: 13 }} /> {tp.label}
                    </button>
                  );
                })}
              </div>

              {/* Category filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
                <Filter style={{ width: 14, height: 14, color: '#94A3B8' }} />
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  style={{
                    padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
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

        {/* ── Voting List ── */}
        <section style={{ background: '#FAFBFC', padding: '32px 0 56px' }}>
          <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 24px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ width: 32, height: 32, border: '3px solid #E2E8F0', borderTopColor: '#F59E0B', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                <p style={{ fontSize: 13, color: '#6B7280' }}>Loading products...</p>
              </div>
            ) : productsWithVotes.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {productsWithVotes.map((product, i) => (
                  <VotingCard
                    key={product.slug}
                    product={product}
                    rank={i + 1}
                    votes={product.voteCount}
                    voted={votedSlugs.has(product.slug)}
                    onVote={handleVote}
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0' }}>
                <Users style={{ width: 40, height: 40, color: '#CBD5E1', margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#374151', margin: '0 0 6px' }}>No products found</h3>
                <p style={{ fontSize: 13, color: '#6B7280' }}>Try a different category or time period.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
