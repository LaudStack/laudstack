/**
 * PageHero.tsx — LaudStack Reusable Page Hero
 *
 * Design philosophy:
 *  - White / very light neutral background — clearly separated from the dark navy navbar
 *  - Thin amber left-edge accent bar as the brand anchor
 *  - Clean, editorial typography — no heavy backgrounds, no gradients
 *  - Flexible layout: each page can vary height, stat placement, and actions
 *  - Unified language, not a uniform template
 *
 * Props:
 *  - eyebrow:   small uppercase label (shown in amber)
 *  - title:     main headline (supports JSX for inline highlights)
 *  - subtitle:  supporting text
 *  - stats:     array of { value, label } — rendered as a horizontal stat row
 *  - actions:   optional JSX slot (right side on desktop, below title on mobile)
 *  - badge:     optional pill (e.g. "Live", "Beta")
 *  - accent:    'amber' | 'blue' | 'green' | 'rose'  (default: 'amber')
 *  - size:      'sm' | 'md' | 'lg'  (default: 'md')
 *  - layout:    'default' | 'centered' | 'split'
 *              default  — left-aligned title, optional right actions
 *              centered — centered title + subtitle, stats below
 *              split    — title left, large stat block right
 */

import React from 'react';

type AccentKey  = 'amber' | 'blue' | 'green' | 'rose';
type SizeKey    = 'sm' | 'md' | 'lg';
type LayoutKey  = 'default' | 'centered' | 'split';

interface StatItem {
  value: string;
  label: string;
}

interface PageHeroProps {
  eyebrow?:  string;
  title:     React.ReactNode;
  subtitle?: string;
  stats?:    StatItem[];
  actions?:  React.ReactNode;
  badge?:    string;
  accent?:   AccentKey;
  size?:     SizeKey;
  layout?:   LayoutKey;
  className?: string;
}

const ACCENT: Record<AccentKey, { bar: string; eyebrow: string; badgeBg: string; badgeBorder: string; badgeText: string; statValue: string; divider: string }> = {
  amber: { bar: '#F59E0B', eyebrow: '#B45309', badgeBg: '#FFFBEB', badgeBorder: '#FDE68A', badgeText: '#92400E', statValue: '#D97706', divider: '#E5E7EB' },
  blue:  { bar: '#3B82F6', eyebrow: '#1D4ED8', badgeBg: '#EFF6FF', badgeBorder: '#BFDBFE', badgeText: '#1E40AF', statValue: '#2563EB', divider: '#E5E7EB' },
  green: { bar: '#22C55E', eyebrow: '#15803D', badgeBg: '#F0FDF4', badgeBorder: '#BBF7D0', badgeText: '#14532D', statValue: '#16A34A', divider: '#E5E7EB' },
  rose:  { bar: '#F43F5E', eyebrow: '#BE123C', badgeBg: '#FFF1F2', badgeBorder: '#FECDD3', badgeText: '#9F1239', statValue: '#E11D48', divider: '#E5E7EB' },
};

const SIZE: Record<SizeKey, { pt: string; pb: string; titleSize: string; subtitleSize: string; barHeight: string }> = {
  sm: { pt: '28px', pb: '24px', titleSize: '22px', subtitleSize: '13px', barHeight: '36px' },
  md: { pt: '40px', pb: '32px', titleSize: '30px', subtitleSize: '14px', barHeight: '44px' },
  lg: { pt: '52px', pb: '44px', titleSize: '38px', subtitleSize: '15px', barHeight: '52px' },
};

export default function PageHero({
  eyebrow,
  title,
  subtitle,
  stats,
  actions,
  badge,
  accent  = 'amber',
  size    = 'md',
  layout  = 'default',
  className = '',
}: PageHeroProps) {
  const a = ACCENT[accent];
  const s = SIZE[size];

  return (
    <div
      className={className}
      style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        position: 'relative',
        paddingTop: '64px', /* offset for fixed navbar */
      }}
    >
      {/* Left accent bar */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          background: a.bar,
        }}
      />

      <div
        className="max-w-[1300px] mx-auto px-6 lg:px-10"
        style={{
          paddingTop: s.pt,
          paddingBottom: s.pb,
        }}
      >
        {/* ── DEFAULT layout ── */}
        {layout === 'default' && (
          <>
            {/* Eyebrow + badge */}
            {(eyebrow || badge) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                {eyebrow && (
                  <span style={{
                    fontSize: '11px', fontWeight: 800,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: a.eyebrow,
                  }}>
                    {eyebrow}
                  </span>
                )}
                {badge && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '2px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                    background: a.badgeBg, border: `1px solid ${a.badgeBorder}`, color: a.badgeText,
                  }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: a.bar, display: 'inline-block' }} />
                    {badge}
                  </span>
                )}
              </div>
            )}

            {/* Title row */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 0', minWidth: '260px' }}>
                <h1 style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: s.titleSize, fontWeight: 900,
                  color: '#111827', margin: 0,
                  letterSpacing: '-0.025em', lineHeight: 1.2,
                }}>
                  {title}
                </h1>
                {subtitle && (
                  <p style={{
                    fontSize: s.subtitleSize, color: '#6B7280',
                    margin: '8px 0 0', lineHeight: 1.6,
                    maxWidth: '560px', fontWeight: 400,
                  }}>
                    {subtitle}
                  </p>
                )}
              </div>
              {actions && <div style={{ flexShrink: 0 }}>{actions}</div>}
            </div>

            {/* Stats */}
            {stats && stats.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginTop: '24px', flexWrap: 'wrap' }}>
                {stats.map((stat, i) => (
                  <React.Fragment key={stat.label}>
                    {i > 0 && <div style={{ width: '1px', height: '28px', background: a.divider, margin: '0 20px', flexShrink: 0 }} />}
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: 900, color: a.statValue, letterSpacing: '-0.02em', lineHeight: 1 }}>
                        {stat.value}
                      </div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600, marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {stat.label}
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── CENTERED layout ── */}
        {layout === 'centered' && (
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto' }}>
            {(eyebrow || badge) && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                {eyebrow && (
                  <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: a.eyebrow }}>
                    {eyebrow}
                  </span>
                )}
                {badge && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: a.badgeBg, border: `1px solid ${a.badgeBorder}`, color: a.badgeText }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: a.bar, display: 'inline-block' }} />
                    {badge}
                  </span>
                )}
              </div>
            )}
            <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: s.titleSize, fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{ fontSize: s.subtitleSize, color: '#6B7280', margin: '10px 0 0', lineHeight: 1.65, fontWeight: 400 }}>
                {subtitle}
              </p>
            )}
            {actions && <div style={{ marginTop: '20px' }}>{actions}</div>}
            {stats && stats.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', marginTop: '24px', flexWrap: 'wrap' }}>
                {stats.map((stat, i) => (
                  <React.Fragment key={stat.label}>
                    {i > 0 && <div style={{ width: '1px', height: '28px', background: a.divider, margin: '0 20px', flexShrink: 0 }} />}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: 900, color: a.statValue, letterSpacing: '-0.02em', lineHeight: 1 }}>{stat.value}</div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600, marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SPLIT layout ── */}
        {layout === 'split' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '48px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 0', minWidth: '260px' }}>
              {(eyebrow || badge) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  {eyebrow && (
                    <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: a.eyebrow }}>
                      {eyebrow}
                    </span>
                  )}
                  {badge && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: a.badgeBg, border: `1px solid ${a.badgeBorder}`, color: a.badgeText }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: a.bar, display: 'inline-block' }} />
                      {badge}
                    </span>
                  )}
                </div>
              )}
              <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: s.titleSize, fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
                {title}
              </h1>
              {subtitle && (
                <p style={{ fontSize: s.subtitleSize, color: '#6B7280', margin: '8px 0 0', lineHeight: 1.6, maxWidth: '480px', fontWeight: 400 }}>
                  {subtitle}
                </p>
              )}
              {actions && <div style={{ marginTop: '20px' }}>{actions}</div>}
            </div>

            {/* Right: stat block */}
            {stats && stats.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(stats.length, 2)}, 1fr)`,
                gap: '1px',
                background: '#E5E7EB',
                border: '1px solid #E5E7EB',
                borderRadius: '14px',
                overflow: 'hidden',
                flexShrink: 0,
              }}>
                {stats.map(stat => (
                  <div key={stat.label} style={{ background: '#FAFAFA', padding: '18px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: a.statValue, letterSpacing: '-0.02em', lineHeight: 1 }}>{stat.value}</div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
