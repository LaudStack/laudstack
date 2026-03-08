/*
 * LaudStack ToolCard — Premium "Warm Professional"
 * Design: Sleek horizontal card, refined logo, clean hierarchy,
 * subtle lift on hover, polished upvote, rank indicator
 * Target audience: experienced developers & technical founders
 */

import { useState } from 'react';
import { Star, ExternalLink, ChevronUp, ShieldCheck, Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { toast } from 'sonner';
import type { Tool, BadgeType } from '@/lib/types';

const BADGE_CONFIG: Record<BadgeType, { label: string; bg: string; color: string; border: string }> = {
  top_rated:      { label: 'Top Rated',      bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
  featured:       { label: 'Featured',        bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  verified:       { label: 'Verified',        bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
  new_launch:     { label: 'New Launch',      bg: '#F0F9FF', color: '#0369A1', border: '#BAE6FD' },
  editors_pick:   { label: "Editor's Pick",   bg: '#FAF5FF', color: '#7E22CE', border: '#E9D5FF' },
  trending:       { label: 'Trending',        bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' },
  pro_founder:    { label: 'Pro Founder',     bg: '#0F172A', color: '#F59E0B', border: '#0F172A' },
  community_pick: { label: 'Community Pick',  bg: '#FFF1F2', color: '#BE123C', border: '#FECDD3' },
  best_value:     { label: 'Best Value',      bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
  laudstack_pick: { label: 'LaudStack Pick',  bg: '#FFF7ED', color: '#EA580C', border: '#FDBA74' },
};

interface ToolCardProps {
  tool: Tool;
  rank?: number;
  rankChange?: number;
  compact?: boolean;
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'xs' }) {
  const sz = size === 'xs' ? '11px' : '13px';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={sz} height={sz} viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#FBBF24' : '#E2E8F0'} stroke="none">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
      <span style={{ fontSize: size === 'xs' ? '11px' : '12px', color: '#64748B', marginLeft: '3px', fontWeight: 600 }}>{rating.toFixed(1)}</span>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const isTop3 = rank <= 3;
  const colors = ['#F59E0B', '#94A3B8', '#CD7C3E'];
  return (
    <div style={{
      width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      background: isTop3 ? colors[rank - 1] : '#F1F5F9',
      color: isTop3 ? '#fff' : '#64748B',
      fontWeight: 800, fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {rank}
    </div>
  );
}

function RankChange({ change }: { change: number }) {
  if (change === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#94A3B8', fontSize: '11px', fontWeight: 600 }}>
      <Minus style={{ width: '10px', height: '10px' }} />
    </div>
  );
  if (change > 0) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#10B981', fontSize: '11px', fontWeight: 700 }}>
      <TrendingUp style={{ width: '11px', height: '11px' }} />
      {change}
    </div>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#EF4444', fontSize: '11px', fontWeight: 700 }}>
      <TrendingDown style={{ width: '11px', height: '11px' }} />
      {Math.abs(change)}
    </div>
  );
}

export default function ToolCard({ tool, rank, rankChange, compact = false }: ToolCardProps) {
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(tool.upvote_count);
  const [hovered, setHovered] = useState(false);

  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (upvoted) {
      setUpvoted(false);
      setUpvoteCount(c => c - 1);
    } else {
      setUpvoted(true);
      setUpvoteCount(c => c + 1);
      toast.success(`Upvoted ${tool.name}!`);
    }
  };

  const handleVisit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(tool.website_url, '_blank', 'noopener,noreferrer');
  };

  const visibleBadges = tool.badges.slice(0, compact ? 1 : 2);

  // ─── COMPACT (leaderboard sidebar) ───────────────────────────────────────
  if (compact) {
    return (
      <div
        onClick={() => toast.info('Tool detail page coming soon!')}
        style={{
          display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
          background: hovered ? '#FAFAFA' : '#fff',
          border: '1px solid', borderColor: hovered ? '#E2E8F0' : '#F1F5F9',
          borderRadius: '12px', cursor: 'pointer', transition: 'all 0.15s',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {rank && <RankBadge rank={rank} />}
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', overflow: 'hidden', background: '#F8FAFC', border: '1px solid #E2E8F0', flexShrink: 0 }}>
          <img src={tool.logo_url} alt={tool.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{tool.name}</span>
            {tool.is_verified && <ShieldCheck style={{ width: '12px', height: '12px', color: '#10B981', flexShrink: 0 }} />}
          </div>
          <StarRating rating={tool.average_rating} size="xs" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
          {rankChange !== undefined && <RankChange change={rankChange} />}
          <button
            onClick={handleUpvote}
            style={{
              display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 8px',
              borderRadius: '6px', border: '1px solid', fontSize: '11px', fontWeight: 700,
              background: upvoted ? '#FFF7ED' : '#F8FAFC',
              borderColor: upvoted ? '#FED7AA' : '#E2E8F0',
              color: upvoted ? '#EA580C' : '#64748B',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <ChevronUp style={{ width: '11px', height: '11px' }} />
            {upvoteCount >= 1000 ? `${(upvoteCount / 1000).toFixed(1)}k` : upvoteCount}
          </button>
        </div>
      </div>
    );
  }

  // ─── FULL CARD ────────────────────────────────────────────────────────────
  return (
    <div
      onClick={() => toast.info('Tool detail page coming soon!')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        border: '1px solid', borderColor: hovered ? '#CBD5E1' : '#E2E8F0',
        borderRadius: '16px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: hovered ? '0 8px 30px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Promotional banner */}
      {tool.promotional_banner && tool.is_pro && (
        <div style={{ margin: '-20px -20px 16px -20px', padding: '8px 20px', background: '#FFFBEB', borderBottom: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', color: '#92400E', fontWeight: 500 }}>🎉 {tool.promotional_banner}</span>
          {tool.promotional_cta && (
            <button onClick={e => { e.stopPropagation(); handleVisit(e); }} style={{ fontSize: '11px', color: '#B45309', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              {tool.promotional_cta} →
            </button>
          )}
        </div>
      )}

      {/* Top row: logo + info + upvote */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>

        {/* Rank */}
        {rank && (
          <div style={{ paddingTop: '2px', flexShrink: 0 }}>
            <RankBadge rank={rank} />
          </div>
        )}

        {/* Logo */}
        <div style={{ width: '52px', height: '52px', borderRadius: '12px', overflow: 'hidden', background: '#F8FAFC', border: '1px solid #E2E8F0', flexShrink: 0 }}>
          <img src={tool.logo_url} alt={tool.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <h3 style={{ fontWeight: 800, fontSize: '15px', color: '#0F172A', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.2 }}>{tool.name}</h3>
            {tool.is_verified && (
              <span title="Verified Tool"><ShieldCheck style={{ width: '14px', height: '14px', color: '#10B981', flexShrink: 0 }} /></span>
            )}
            {tool.is_pro && (
              <span title="Pro Founder"><Zap style={{ width: '13px', height: '13px', color: '#F59E0B', flexShrink: 0 }} /></span>
            )}
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '3px 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tool.tagline}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <StarRating rating={tool.average_rating} />
            <span style={{ fontSize: '11px', color: '#94A3B8' }}>({tool.review_count} reviews)</span>
          </div>
        </div>

        {/* Upvote button */}
        <button
          onClick={handleUpvote}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '8px 12px', borderRadius: '10px', border: '1.5px solid',
            borderColor: upvoted ? '#FDBA74' : '#E2E8F0',
            background: upvoted ? 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)' : '#F8FAFC',
            color: upvoted ? '#EA580C' : '#64748B',
            cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
            minWidth: '48px',
          }}
          onMouseEnter={e => { if (!upvoted) { (e.currentTarget as HTMLButtonElement).style.borderColor = '#FED7AA'; (e.currentTarget as HTMLButtonElement).style.color = '#EA580C'; } }}
          onMouseLeave={e => { if (!upvoted) { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLButtonElement).style.color = '#64748B'; } }}
        >
          <ChevronUp style={{ width: '16px', height: '16px' }} />
          <span style={{ fontSize: '12px', fontWeight: 800, lineHeight: 1, marginTop: '1px' }}>
            {upvoteCount >= 1000 ? `${(upvoteCount / 1000).toFixed(1)}k` : upvoteCount}
          </span>
        </button>
      </div>

      {/* Description */}
      <p style={{ fontSize: '13px', color: '#475569', margin: '14px 0 0', lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {tool.description}
      </p>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {/* Category */}
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '3px 8px' }}>
            {tool.category}
          </span>
          {/* Pricing model */}
          <span style={{
            fontSize: '11px', fontWeight: 600, borderRadius: '6px', padding: '3px 8px', border: '1px solid',
            ...(tool.pricing_model === 'Free'
              ? { background: '#F0FDF4', color: '#15803D', borderColor: '#BBF7D0' }
              : tool.pricing_model === 'Freemium'
              ? { background: '#EFF6FF', color: '#1D4ED8', borderColor: '#BFDBFE' }
              : { background: '#F8FAFC', color: '#475569', borderColor: '#E2E8F0' })
          }}>
            {tool.pricing_model}
          </span>
          {/* Platform badges */}
          {visibleBadges.map(badge => {
            const cfg = BADGE_CONFIG[badge];
            if (!cfg) return null;
            return (
              <span key={badge} style={{ fontSize: '11px', fontWeight: 600, borderRadius: '6px', padding: '3px 8px', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                {cfg.label}
              </span>
            );
          })}
        </div>

        <button
          onClick={handleVisit}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s', flexShrink: 0 }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#EA580C'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8'; }}
        >
          Visit <ExternalLink style={{ width: '11px', height: '11px' }} />
        </button>
      </div>
    </div>
  );
}

export { StarRating, RankChange, BADGE_CONFIG };
