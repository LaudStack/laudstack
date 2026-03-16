/**
 * ReviewShareButtons — Share individual reviews on social platforms
 * Compact inline buttons: Twitter/X, LinkedIn, Copy Link
 */

import { useState } from 'react';
import { toast } from 'sonner';

interface Props {
  toolName: string;
  toolSlug: string;
  reviewTitle: string;
  reviewerName: string;
  rating: number;
}

export default function ReviewShareButtons({ toolName, toolSlug, reviewTitle, reviewerName, rating }: Props) {
  const [copied, setCopied] = useState(false);

  const reviewUrl = `${window.location.origin}/tools/${toolSlug}#reviews`;
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  const shareText = `${stars} "${reviewTitle}" — ${reviewerName}'s review of ${toolName} on LaudStack`;

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(reviewUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(reviewUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${shareText}\n${reviewUrl}`).then(() => {
      setCopied(true);
      toast.success('Review link copied!');
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const btnStyle = (hoverBg: string, hoverBorder: string, hoverColor: string) => ({
    base: {
      display: 'inline-flex' as const,
      alignItems: 'center' as const,
      gap: '4px',
      padding: '4px 8px',
      borderRadius: '6px',
      border: '1px solid #E2E8F0',
      background: '#F8FAFC',
      fontSize: '11px',
      fontWeight: 600 as const,
      color: '#64748B',
      cursor: 'pointer' as const,
      transition: 'all 0.15s',
      fontFamily: 'inherit',
    },
    hover: { background: hoverBg, borderColor: hoverBorder, color: hoverColor },
  });

  const twitter = btnStyle('#EFF6FF', '#BFDBFE', '#1D4ED8');
  const linkedin = btnStyle('#EFF6FF', '#BFDBFE', '#0A66C2');
  const copy = btnStyle(copied ? '#F0FDF4' : '#FFFBEB', copied ? '#BBF7D0' : '#FDE68A', copied ? '#15803D' : '#B45309');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>Share:</span>
      <button
        onClick={handleTwitter}
        style={twitter.base}
        onMouseEnter={e => Object.assign(e.currentTarget.style, twitter.hover)}
        onMouseLeave={e => Object.assign(e.currentTarget.style, { background: twitter.base.background, borderColor: '#E2E8F0', color: twitter.base.color })}
      >
        𝕏
      </button>
      <button
        onClick={handleLinkedIn}
        style={linkedin.base}
        onMouseEnter={e => Object.assign(e.currentTarget.style, linkedin.hover)}
        onMouseLeave={e => Object.assign(e.currentTarget.style, { background: linkedin.base.background, borderColor: '#E2E8F0', color: linkedin.base.color })}
      >
        in
      </button>
      <button
        onClick={handleCopy}
        style={{ ...copy.base, ...(copied ? copy.hover : {}) }}
        onMouseEnter={e => { if (!copied) Object.assign(e.currentTarget.style, copy.hover); }}
        onMouseLeave={e => { if (!copied) Object.assign(e.currentTarget.style, { background: copy.base.background, borderColor: '#E2E8F0', color: copy.base.color }); }}
      >
        {copied ? '✓' : '🔗'}
      </button>
    </div>
  );
}
