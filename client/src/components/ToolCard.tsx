/*
 * LaudStack ToolCard — "Warm Professional"
 * Warm card shadow, amber upvote button, badge pills
 * Lift on hover (translateY -2px)
 */

import { useState } from 'react';
import { Link } from 'wouter';
import { Star, ExternalLink, ChevronUp, Shield, Zap } from 'lucide-react';
import { toast } from 'sonner';
import type { Tool, BadgeType } from '@/lib/types';

const BADGE_CONFIG: Record<BadgeType, { label: string; className: string }> = {
  top_rated:      { label: '⭐ Top Rated',      className: 'ls-badge ls-badge-amber' },
  featured:       { label: '✦ Featured',        className: 'ls-badge ls-badge-navy' },
  verified:       { label: '✓ Verified',        className: 'ls-badge ls-badge-green' },
  new_launch:     { label: '🚀 New Launch',     className: 'ls-badge ls-badge-blue' },
  editors_pick:   { label: '✏️ Editor\'s Pick', className: 'ls-badge ls-badge-purple' },
  trending:       { label: '🔥 Trending',       className: 'ls-badge ls-badge-red' },
  pro_founder:    { label: '👑 Pro Founder',    className: 'ls-badge ls-badge-navy' },
  community_pick: { label: '❤️ Community Pick', className: 'ls-badge ls-badge-amber' },
  best_value:     { label: '💎 Best Value',     className: 'ls-badge ls-badge-green' },
  laudstack_pick: { label: '✦ LaudStack Pick',  className: 'ls-badge ls-badge-navy' },
};

interface ToolCardProps {
  tool: Tool;
  rank?: number;
  rankChange?: number;
  compact?: boolean;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-0.5">{rating.toFixed(1)}</span>
    </div>
  );
}

function RankChange({ change }: { change: number }) {
  if (change === 0) return <span className="text-xs text-muted-foreground">—</span>;
  if (change > 0) return <span className="text-xs text-emerald-600 font-medium">▲ {change}</span>;
  return <span className="text-xs text-red-500 font-medium">▼ {Math.abs(change)}</span>;
}

export default function ToolCard({ tool, rank, rankChange, compact = false }: ToolCardProps) {
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(tool.upvote_count);

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
    toast.info('Opening tool website...');
    window.open(tool.website_url, '_blank', 'noopener,noreferrer');
  };

  const visibleBadges = tool.badges.slice(0, compact ? 1 : 2);

  if (compact) {
    return (
      <div className="ls-card flex items-center gap-4 p-4 group cursor-pointer" onClick={() => toast.info('Tool detail page coming soon!')}>
        {rank && (
          <div className="shrink-0 w-8 text-center">
            <span className="text-lg font-bold text-slate-300">{rank}</span>
          </div>
        )}
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0">
          <img src={tool.logo_url} alt={tool.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-slate-900 truncate">{tool.name}</span>
            {tool.is_verified && <Shield className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
            {tool.is_pro && <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground truncate">{tool.tagline}</p>
          <StarRating rating={tool.average_rating} />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {rankChange !== undefined && <RankChange change={rankChange} />}
          <button
            onClick={handleUpvote}
            className={`ls-upvote ${upvoted ? 'active' : ''}`}
          >
            <ChevronUp className="h-3.5 w-3.5" />
            <span>{upvoteCount >= 1000 ? `${(upvoteCount / 1000).toFixed(1)}k` : upvoteCount}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`ls-card flex flex-col p-5 cursor-pointer group ${tool.is_featured ? 'ls-featured-accent' : ''}`}
      onClick={() => toast.info('Tool detail page coming soon!')}
    >
      {/* Promotional banner */}
      {tool.promotional_banner && tool.is_pro && (
        <div className="mb-4 -mx-5 -mt-5 px-5 py-2.5 bg-amber-50 border-b border-amber-100 rounded-t-xl">
          <p className="text-xs text-amber-800 font-medium">
            🎉 {tool.promotional_banner}
            {tool.promotional_cta && (
              <button
                onClick={e => { e.stopPropagation(); handleVisit(e); }}
                className="ml-2 underline hover:no-underline"
              >
                {tool.promotional_cta} →
              </button>
            )}
          </p>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-border">
          <img src={tool.logo_url} alt={tool.name} className="w-full h-full object-cover" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-base text-slate-900 leading-tight">{tool.name}</h3>
            {tool.is_verified && (
              <span title="Verified Tool">
                <Shield className="h-4 w-4 text-emerald-500" />
              </span>
            )}
            {tool.is_pro && (
              <span title="Pro Founder">
                <Zap className="h-4 w-4 text-amber-500" />
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{tool.tagline}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <StarRating rating={tool.average_rating} />
            <span className="text-xs text-muted-foreground">({tool.review_count} reviews)</span>
          </div>
        </div>

        {/* Upvote */}
        <button
          onClick={handleUpvote}
          className={`ls-upvote shrink-0 ${upvoted ? 'active' : ''}`}
        >
          <ChevronUp className="h-4 w-4" />
          <span className="text-xs font-bold">
            {upvoteCount >= 1000 ? `${(upvoteCount / 1000).toFixed(1)}k` : upvoteCount}
          </span>
        </button>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-600 mt-3 line-clamp-2 leading-relaxed">
        {tool.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category */}
          <span className="ls-badge bg-slate-100 text-slate-600">{tool.category}</span>
          {/* Pricing */}
          <span className={`ls-badge ${
            tool.pricing_model === 'Free' ? 'ls-badge-green' :
            tool.pricing_model === 'Freemium' ? 'ls-badge-blue' :
            'bg-slate-100 text-slate-600'
          }`}>
            {tool.pricing_model}
          </span>
          {/* Badges */}
          {visibleBadges.map(badge => (
            <span key={badge} className={BADGE_CONFIG[badge]?.className}>
              {BADGE_CONFIG[badge]?.label}
            </span>
          ))}
        </div>

        <button
          onClick={handleVisit}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-amber-600 transition-colors shrink-0"
        >
          Visit <ExternalLink className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

export { StarRating, RankChange, BADGE_CONFIG };
