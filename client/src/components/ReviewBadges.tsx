/**
 * ReviewBadges — Display reviewer milestone badges
 *
 * Badges:
 * - First Review (1 review)
 * - 5 Reviews (5 reviews)
 * - 10 Reviews (10 reviews)
 * - Category Expert (5+ reviews in same category)
 * - Top Reviewer (25+ reviews)
 * - Trusted Voice (50+ reviews)
 */

import { Star, Award, Trophy, Shield, Flame, Crown } from 'lucide-react';

export interface BadgeInfo {
  key: string;
  label: string;
  icon: typeof Star;
  color: string;
  bg: string;
  border: string;
  description: string;
}

const ALL_BADGES: BadgeInfo[] = [
  {
    key: 'first_review',
    label: 'First Review',
    icon: Star,
    color: '#F59E0B',
    bg: '#FFFBEB',
    border: '#FDE68A',
    description: 'Wrote their first review',
  },
  {
    key: '5_reviews',
    label: '5 Reviews',
    icon: Award,
    color: '#3B82F6',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    description: 'Contributed 5 reviews',
  },
  {
    key: '10_reviews',
    label: '10 Reviews',
    icon: Trophy,
    color: '#8B5CF6',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    description: 'Contributed 10 reviews',
  },
  {
    key: 'category_expert',
    label: 'Category Expert',
    icon: Shield,
    color: '#22C55E',
    bg: '#F0FDF4',
    border: '#BBF7D0',
    description: '5+ reviews in a single category',
  },
  {
    key: 'top_reviewer',
    label: 'Top Reviewer',
    icon: Flame,
    color: '#EF4444',
    bg: '#FEF2F2',
    border: '#FECACA',
    description: '25+ reviews contributed',
  },
  {
    key: 'trusted_voice',
    label: 'Trusted Voice',
    icon: Crown,
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
    description: '50+ reviews — a pillar of the community',
  },
];

export function getBadgesForReviewCount(reviewCount: number, categoryReviewCount?: number): BadgeInfo[] {
  const badges: BadgeInfo[] = [];
  if (reviewCount >= 1) badges.push(ALL_BADGES[0]);
  if (reviewCount >= 5) badges.push(ALL_BADGES[1]);
  if (reviewCount >= 10) badges.push(ALL_BADGES[2]);
  if (categoryReviewCount && categoryReviewCount >= 5) badges.push(ALL_BADGES[3]);
  if (reviewCount >= 25) badges.push(ALL_BADGES[4]);
  if (reviewCount >= 50) badges.push(ALL_BADGES[5]);
  return badges;
}

interface Props {
  reviewCount: number;
  categoryReviewCount?: number;
  compact?: boolean;
}

export default function ReviewBadges({ reviewCount, categoryReviewCount, compact = false }: Props) {
  const badges = getBadgesForReviewCount(reviewCount, categoryReviewCount);

  if (badges.length === 0) return null;

  if (compact) {
    // Show only the highest badge inline
    const highest = badges[badges.length - 1];
    const Icon = highest.icon;
    return (
      <span
        title={highest.description}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '3px',
          fontSize: '10px', fontWeight: 700,
          padding: '2px 7px', borderRadius: '100px',
          background: highest.bg, color: highest.color,
          border: `1px solid ${highest.border}`,
          whiteSpace: 'nowrap',
        }}
      >
        <Icon style={{ width: '9px', height: '9px' }} />
        {highest.label}
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {badges.map(badge => {
        const Icon = badge.icon;
        return (
          <span
            key={badge.key}
            title={badge.description}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '11px', fontWeight: 700,
              padding: '3px 10px', borderRadius: '100px',
              background: badge.bg, color: badge.color,
              border: `1px solid ${badge.border}`,
              cursor: 'default',
              transition: 'transform 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Icon style={{ width: '11px', height: '11px' }} />
            {badge.label}
          </span>
        );
      })}
    </div>
  );
}
