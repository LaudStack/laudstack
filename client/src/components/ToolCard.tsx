/*
 * LaudStack ToolCard — Premium Polished Design
 *
 * Design philosophy: "Precision Editorial"
 *  - Generous whitespace, clear visual hierarchy
 *  - 64px logo with soft shadow, prominent name + tagline
 *  - Star rating inline with review count
 *  - Pricing badge + category pill in footer
 *  - Upvote as a standalone pill-button with chevron
 *  - Smooth lift + border-color transition on hover
 *  - Compact variant for leaderboard sidebar (horizontal strip)
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  ExternalLink, ChevronUp, ShieldCheck, Zap,
  TrendingUp, TrendingDown, Minus, GitCompareArrows, Bookmark, Star, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import type { Tool, BadgeType } from '@/lib/types';
import { useCompare } from '@/contexts/CompareContext';
import { useSavedTools } from '@/hooks/useSavedTools';

// ─── Badge config ─────────────────────────────────────────────────────────────
const BADGE_CONFIG: Record<BadgeType, { label: string; bg: string; color: string; border: string }> = {
  top_rated:      { label: 'Top Rated',      bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
  featured:       { label: 'Featured',        bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  verified:       { label: 'Verified',        bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
  new_launch:     { label: 'New Launch',      bg: '#F0F9FF', color: '#0369A1', border: '#BAE6FD' },
  editors_pick:   { label: "Editor's Pick",   bg: '#FAF5FF', color: '#7E22CE', border: '#E9D5FF' },
  trending:       { label: 'Trending',        bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' },
  pro_founder:    { label: 'Pro Founder',     bg: '#171717', color: '#F59E0B', border: '#171717' },
  community_pick: { label: 'Community Pick',  bg: '#FFF1F2', color: '#BE123C', border: '#FECDD3' },
  best_value:     { label: 'Best Value',      bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
  laudstack_pick: { label: 'LaudStack Pick',  bg: '#FFF7ED', color: '#D97706', border: '#FDBA74' },
};

// ─── Pricing badge colours ─────────────────────────────────────────────────────
function pricingStyle(model: string): React.CSSProperties {
  if (model === 'Free')     return { background: '#F0FDF4', color: '#15803D', borderColor: '#BBF7D0' };
  if (model === 'Freemium') return { background: '#EFF6FF', color: '#1D4ED8', borderColor: '#BFDBFE' };
  return { background: '#F8FAFC', color: '#475569', borderColor: '#CBD5E1' };
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function StarRating({ rating, count, size = 'sm' }: { rating: number; count?: number; size?: 'sm' | 'xs' }) {
  const sz = size === 'xs' ? 11 : 13;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          style={{ width: sz, height: sz }}
          fill={i <= Math.round(rating) ? '#FBBF24' : '#E2E8F0'}
          color={i <= Math.round(rating) ? '#FBBF24' : '#E2E8F0'}
        />
      ))}
      <span style={{ fontSize: sz + 1, fontWeight: 700, color: '#171717', marginLeft: '3px' }}>{rating.toFixed(1)}</span>
      {count !== undefined && (
        <span style={{ fontSize: sz, color: '#94A3B8', fontWeight: 500 }}>({count})</span>
      )}
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const isTop3 = rank <= 3;
  const bg = rank === 1 ? '#D97706' : rank === 2 ? '#94A3B8' : '#B45309';
  return (
    <div style={{
      width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: isTop3 ? bg : '#F1F5F9', color: isTop3 ? '#fff' : '#374151',
      fontWeight: 800, fontSize: 13, flexShrink: 0,
      boxShadow: isTop3 ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
    }}>
      {rank}
    </div>
  );
}

function RankChange({ change }: { change: number }) {
  if (change === 0) return <Minus style={{ width: 10, height: 10, color: '#CBD5E1' }} />;
  if (change > 0) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#22C55E', fontSize: 11, fontWeight: 700 }}>
      <TrendingUp style={{ width: 11, height: 11 }} />{change}
    </div>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#EF4444', fontSize: 11, fontWeight: 700 }}>
      <TrendingDown style={{ width: 11, height: 11 }} />{Math.abs(change)}
    </div>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function ToolLogo({ tool, size = 64 }: { tool: Tool; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.22, overflow: 'hidden',
      background: '#F8FAFC', border: '1px solid #E2E8F0', flexShrink: 0,
      boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
    }}>
      <img
        src={tool.logo_url}
        alt={tool.name}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        onError={e => {
          const t = e.currentTarget;
          t.style.display = 'none';
          const p = t.parentElement;
          if (p) {
            p.style.display = 'flex';
            p.style.alignItems = 'center';
            p.style.justifyContent = 'center';
            p.style.background = '#F1F5F9';
            p.innerHTML = `<span style="font-size:${size * 0.35}px;font-weight:800;color:#64748B;font-family:'Inter',sans-serif">${tool.name.charAt(0)}</span>`;
          }
        }}
      />
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface ToolCardProps {
  tool: Tool;
  rank?: number;
  rankChange?: number;
  compact?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPACT CARD — leaderboard sidebar strip
// ═══════════════════════════════════════════════════════════════════════════════
function CompactCard({ tool, rank, rankChange }: ToolCardProps) {
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(tool.upvote_count);
  const [hovered, setHovered] = useState(false);
  const [, navigate] = useLocation();

  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setUpvoted(v => !v);
    setUpvoteCount(c => upvoted ? c - 1 : c + 1);
    if (!upvoted) toast.success(`Upvoted ${tool.name}!`);
  };

  return (
    <div
      onClick={() => navigate(`/tools/${tool.slug}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
        background: hovered ? '#FAFAFA' : '#fff',
        border: '1px solid', borderColor: hovered ? '#D1D5DB' : '#F1F5F9',
        borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s',
        boxShadow: hovered ? '0 2px 8px rgba(15,23,42,0.06)' : 'none',
      }}
    >
      {rank !== undefined && <RankBadge rank={rank} />}
      <ToolLogo tool={tool} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#171717', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {tool.name}
          </span>
          {tool.is_verified && <ShieldCheck style={{ width: 12, height: 12, color: '#22C55E', flexShrink: 0 }} />}
        </div>
        <StarRating rating={tool.average_rating} size="xs" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
        {rankChange !== undefined && <RankChange change={rankChange} />}
        <button
          onClick={handleUpvote}
          style={{
            display: 'flex', alignItems: 'center', gap: 3, padding: '3px 8px',
            borderRadius: 6, border: '1px solid', fontSize: 11, fontWeight: 700,
            background: upvoted ? '#FFF7ED' : '#F8FAFC',
            borderColor: upvoted ? '#FED7AA' : '#E2E8F0',
            color: upvoted ? '#D97706' : '#64748B',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          <ChevronUp style={{ width: 11, height: 11 }} />
          {upvoteCount >= 1000 ? `${(upvoteCount / 1000).toFixed(1)}k` : upvoteCount}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FULL CARD — directory listing
// ═══════════════════════════════════════════════════════════════════════════════
function FullCard({ tool, rank, rankChange }: ToolCardProps) {
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(tool.upvote_count);
  const [hovered, setHovered] = useState(false);
  const { toggle, isSelected, canAdd } = useCompare();
  const comparing = isSelected(tool.id);
  const { isSaved, toggle: toggleSave } = useSavedTools();
  const saved = isSaved(tool.id);
  const [, navigate] = useLocation();

  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setUpvoted(v => !v);
    setUpvoteCount(c => upvoted ? c - 1 : c + 1);
    if (!upvoted) toast.success(`Upvoted ${tool.name}!`);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    toggleSave(tool.id);
    toast.success(saved ? `Removed from saved` : `${tool.name} saved!`);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!comparing && !canAdd) { toast.error('You can compare up to 3 tools at a time'); return; }
    toggle(tool);
    if (!comparing) toast.success(`${tool.name} added to comparison`);
  };

  const handleVisit = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    window.open(tool.website_url, '_blank', 'noopener,noreferrer');
  };

  const visibleBadges = tool.badges.slice(0, 1);
  const isFeatured = tool.is_featured;

  return (
    <div
      onClick={() => navigate(`/tools/${tool.slug}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isFeatured ? '#FFFDF7' : '#fff',
        border: '1.5px solid',
        borderColor: isFeatured
          ? (hovered ? '#F59E0B' : '#FDE68A')
          : (hovered ? '#CBD5E1' : '#E8EDF2'),
        borderRadius: 18,
        padding: '22px 24px 18px',
        paddingLeft: isFeatured ? 28 : 24,
        cursor: 'pointer',
        transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: isFeatured
          ? (hovered
            ? '0 10px 32px rgba(245,158,11,0.18), 0 2px 8px rgba(245,158,11,0.08)'
            : '0 2px 8px rgba(245,158,11,0.10), 0 1px 3px rgba(15,23,42,0.04)')
          : (hovered
            ? '0 10px 32px rgba(15,23,42,0.10), 0 2px 8px rgba(15,23,42,0.04)'
            : '0 1px 4px rgba(15,23,42,0.04)'),
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Featured left-border accent bar */}
      {isFeatured && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
          background: 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)',
          borderRadius: '18px 0 0 18px',
        }} />
      )}
      {/* Promotional banner */}
      {tool.promotional_banner && tool.is_pro && (
        <div style={{
          margin: '-22px -24px 18px',
          padding: '7px 24px',
          background: '#FFFBEB',
          borderBottom: '1px solid #FDE68A',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 12, color: '#92400E', fontWeight: 500 }}>🎉 {tool.promotional_banner}</span>
          {tool.promotional_cta && (
            <button
              onClick={e => { e.stopPropagation(); handleVisit(e); }}
              style={{ fontSize: 11, color: '#B45309', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {tool.promotional_cta} →
            </button>
          )}
        </div>
      )}

      {/* ── Header row ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        {/* Rank */}
        {rank !== undefined && (
          <div style={{ paddingTop: 4, flexShrink: 0 }}>
            <RankBadge rank={rank} />
          </div>
        )}

        {/* Logo */}
        <ToolLogo tool={tool} size={64} />

        {/* Name + tagline + rating */}
        <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
            <h3 style={{
              fontWeight: 800, fontSize: 18, color: '#0F172A', margin: 0,
              letterSpacing: '-0.02em', lineHeight: 1.2,
            }}>
              {tool.name}
            </h3>
            {tool.is_verified && (
              <span title="Verified Tool">
                <ShieldCheck style={{ width: 15, height: 15, color: '#22C55E', flexShrink: 0 }} />
              </span>
            )}
            {tool.is_pro && (
              <span title="Pro Founder">
                <Zap style={{ width: 13, height: 13, color: '#F59E0B', flexShrink: 0 }} />
              </span>
            )}
            {isFeatured && (
              <span
                title="Featured Listing"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em',
                  padding: '2px 8px', borderRadius: 6,
                  background: '#FFF7ED', color: '#B45309', border: '1px solid #FDE68A',
                  textTransform: 'uppercase',
                }}
              >
                <Sparkles style={{ width: 9, height: 9 }} />
                Featured
              </span>
            )}
          </div>
          <p style={{
            fontSize: 13, color: '#64748B', margin: '0 0 7px', fontWeight: 500,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {tool.tagline}
          </p>
          <StarRating rating={tool.average_rating} count={tool.review_count} />
        </div>

        {/* Upvote pill */}
        <button
          onClick={handleUpvote}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '9px 13px', borderRadius: 12, border: '1.5px solid',
            borderColor: upvoted ? '#FDBA74' : '#E2E8F0',
            background: upvoted ? '#FFF7ED' : '#F8FAFC',
            color: upvoted ? '#D97706' : '#64748B',
            cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
            minWidth: 52,
            boxShadow: upvoted ? '0 2px 8px rgba(245,158,11,0.2)' : 'none',
          }}
          onMouseEnter={e => {
            if (!upvoted) {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.borderColor = '#FED7AA'; b.style.color = '#D97706'; b.style.background = '#FFF7ED';
            }
          }}
          onMouseLeave={e => {
            if (!upvoted) {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.borderColor = '#E2E8F0'; b.style.color = '#64748B'; b.style.background = '#F8FAFC';
            }
          }}
        >
          <ChevronUp style={{ width: 16, height: 16 }} />
          <span style={{ fontSize: 12, fontWeight: 800, lineHeight: 1, marginTop: 2 }}>
            {upvoteCount >= 1000 ? `${(upvoteCount / 1000).toFixed(1)}k` : upvoteCount}
          </span>
        </button>
      </div>

      {/* ── Description ── */}
      <p style={{
        fontSize: 13.5, color: '#475569', margin: '14px 0 0', lineHeight: 1.7,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {tool.description}
      </p>

      {/* ── Footer row ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 14, paddingTop: 12, borderTop: '1px solid #F1F5F9',
        gap: 8, flexWrap: 'wrap',
      }}>
        {/* Left: pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 11.5, fontWeight: 600, borderRadius: 7, padding: '3px 9px',
            border: '1px solid', background: '#F8FAFC', color: '#374151', borderColor: '#E2E8F0',
          }}>
            {tool.category}
          </span>
          <span style={{
            fontSize: 11.5, fontWeight: 600, borderRadius: 7, padding: '3px 9px',
            border: '1px solid', ...pricingStyle(tool.pricing_model),
          }}>
            {tool.pricing_model}
          </span>
          {visibleBadges.map(badge => {
            const cfg = BADGE_CONFIG[badge];
            if (!cfg) return null;
            return (
              <span key={badge} style={{
                fontSize: 11.5, fontWeight: 600, borderRadius: 7, padding: '3px 9px',
                background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
              }}>
                {cfg.label}
              </span>
            );
          })}
          {rankChange !== undefined && (
            <div style={{ marginLeft: 2 }}>
              <RankChange change={rankChange} />
            </div>
          )}
        </div>

        {/* Right: actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Bookmark */}
          <button
            onClick={handleSave}
            title={saved ? 'Remove from saved' : 'Save tool'}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 30, height: 30, borderRadius: 7, border: '1.5px solid',
              borderColor: saved ? '#FDE68A' : '#E2E8F0',
              background: saved ? '#FFFBEB' : '#F8FAFC',
              color: saved ? '#D97706' : '#94A3B8',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; if (!saved) { b.style.borderColor = '#FDE68A'; b.style.color = '#D97706'; b.style.background = '#FFFBEB'; } }}
            onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; if (!saved) { b.style.borderColor = '#E2E8F0'; b.style.color = '#94A3B8'; b.style.background = '#F8FAFC'; } }}
          >
            <Bookmark style={{ width: 13, height: 13, fill: saved ? '#D97706' : 'none' }} />
          </button>

          {/* Compare */}
          <button
            onClick={handleCompare}
            title={comparing ? 'Remove from comparison' : canAdd ? 'Add to comparison' : 'Max 3 tools'}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700,
              padding: '4px 10px', borderRadius: 7, border: '1.5px solid', cursor: 'pointer', transition: 'all 0.15s',
              background: comparing ? '#EFF6FF' : '#F8FAFC',
              borderColor: comparing ? '#BFDBFE' : '#E2E8F0',
              color: comparing ? '#1D4ED8' : '#64748B',
            }}
            onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; if (!comparing) { b.style.borderColor = '#BFDBFE'; b.style.color = '#1D4ED8'; b.style.background = '#EFF6FF'; } }}
            onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; if (!comparing) { b.style.borderColor = '#E2E8F0'; b.style.color = '#64748B'; b.style.background = '#F8FAFC'; } }}
          >
            <GitCompareArrows style={{ width: 11, height: 11 }} />
            {comparing ? 'Comparing' : 'Compare'}
          </button>

          {/* Visit */}
          <button
            onClick={handleVisit}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700,
              padding: '5px 12px', borderRadius: 7, border: '1.5px solid #E2E8F0',
              background: '#F8FAFC', color: '#374151', cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#FDBA74'; b.style.color = '#D97706'; b.style.background = '#FFFBEB'; }}
            onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#E2E8F0'; b.style.color = '#374151'; b.style.background = '#F8FAFC'; }}
          >
            Visit <ExternalLink style={{ width: 11, height: 11 }} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
export default function ToolCard({ tool, rank, rankChange, compact = false }: ToolCardProps) {
  if (compact) return <CompactCard tool={tool} rank={rank} rankChange={rankChange} />;
  return <FullCard tool={tool} rank={rank} rankChange={rankChange} />;
}

export { StarRating, RankChange, BADGE_CONFIG };
