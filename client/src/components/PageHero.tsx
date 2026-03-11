/**
 * PageHero.tsx — LaudStack Reusable Page Hero
 * Design: Flat solid navy (#0F1629), zero gradients, dot-grid texture, amber accent.
 * Used on all non-homepage pages for consistent, professional top-of-page identity.
 *
 * Props:
 *  - eyebrow: small uppercase label above the headline
 *  - title: main headline (supports JSX for amber highlights)
 *  - subtitle: supporting description text
 *  - stats: array of { value, label, icon? } for the stat row
 *  - actions: optional JSX for CTA buttons
 *  - badge: optional pill badge (e.g. "Live" or "Beta")
 *  - accent: 'amber' | 'blue' | 'green' | 'rose' (default: 'amber')
 *  - size: 'sm' | 'md' | 'lg' (default: 'md')
 */

import React from 'react';

type AccentKey = 'amber' | 'blue' | 'green' | 'rose';
type SizeKey   = 'sm' | 'md' | 'lg';

interface StatItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
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
  className?: string;
}

const ACCENT: Record<AccentKey, {
  eyebrow: string;
  badgeBg: string;
  badgeBorder: string;
  badgeDot: string;
  statValue: string;
}> = {
  amber: { eyebrow: '#F59E0B', badgeBg: 'rgba(245,158,11,0.1)',  badgeBorder: 'rgba(245,158,11,0.3)',  badgeDot: '#F59E0B', statValue: '#F59E0B' },
  blue:  { eyebrow: '#60A5FA', badgeBg: 'rgba(96,165,250,0.1)',  badgeBorder: 'rgba(96,165,250,0.3)',  badgeDot: '#60A5FA', statValue: '#60A5FA' },
  green: { eyebrow: '#22C55E', badgeBg: 'rgba(34,197,94,0.1)',   badgeBorder: 'rgba(34,197,94,0.3)',   badgeDot: '#22C55E', statValue: '#22C55E' },
  rose:  { eyebrow: '#FB7185', badgeBg: 'rgba(251,113,133,0.1)', badgeBorder: 'rgba(251,113,133,0.3)', badgeDot: '#FB7185', statValue: '#FB7185' },
};

const SIZE: Record<SizeKey, { paddingTop: string; paddingBottom: string; titleSize: string; subtitleSize: string }> = {
  sm: { paddingTop: '40px', paddingBottom: '32px', titleSize: '26px', subtitleSize: '14px' },
  md: { paddingTop: '52px', paddingBottom: '44px', titleSize: '34px', subtitleSize: '15px' },
  lg: { paddingTop: '64px', paddingBottom: '52px', titleSize: '42px', subtitleSize: '16px' },
};

export default function PageHero({
  eyebrow,
  title,
  subtitle,
  stats,
  actions,
  badge,
  accent = 'amber',
  size   = 'md',
  className = '',
}: PageHeroProps) {
  const a = ACCENT[accent];
  const s = SIZE[size];

  return (
    <div
      className={className}
      style={{
        background: '#0F1629',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Dot-grid texture — subtle, no gradient */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div
        className="max-w-[1300px] mx-auto px-6 lg:px-10"
        style={{
          paddingTop: s.paddingTop,
          paddingBottom: s.paddingBottom,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Eyebrow + badge row */}
        {(eyebrow || badge) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
            {eyebrow && (
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: a.eyebrow,
              }}>
                {eyebrow}
              </span>
            )}
            {eyebrow && badge && (
              <span style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.15)', display: 'inline-block' }} />
            )}
            {badge && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 700,
                background: a.badgeBg,
                border: `1px solid ${a.badgeBorder}`,
                color: a.badgeDot,
              }}>
                <span style={{
                  width: '5px', height: '5px', borderRadius: '50%',
                  background: a.badgeDot, display: 'inline-block',
                }} />
                {badge}
              </span>
            )}
          </div>
        )}

        {/* Title + subtitle + actions */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '32px',
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: '1 1 0', minWidth: '280px' }}>
            <h1 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: s.titleSize,
              fontWeight: 900,
              color: '#FFFFFF',
              margin: 0,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
            }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{
                fontSize: s.subtitleSize,
                color: 'rgba(255,255,255,0.5)',
                margin: '12px 0 0',
                lineHeight: 1.65,
                maxWidth: '560px',
                fontWeight: 400,
              }}>
                {subtitle}
              </p>
            )}
          </div>

          {actions && (
            <div style={{ flexShrink: 0 }}>
              {actions}
            </div>
          )}
        </div>

        {/* Stats row */}
        {stats && stats.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: '32px',
            flexWrap: 'wrap',
            gap: '0',
          }}>
            {stats.map((stat, i) => (
              <React.Fragment key={stat.label}>
                {i > 0 && (
                  <div style={{
                    width: '1px',
                    height: '36px',
                    background: 'rgba(255,255,255,0.1)',
                    margin: '0 28px',
                    flexShrink: 0,
                  }} />
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {stat.icon && (
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {stat.icon}
                    </div>
                  )}
                  <div>
                    <div style={{
                      fontSize: '22px',
                      fontWeight: 900,
                      color: a.statValue,
                      letterSpacing: '-0.02em',
                      lineHeight: 1,
                    }}>
                      {stat.value}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.38)',
                      fontWeight: 600,
                      marginTop: '3px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                    }}>
                      {stat.label}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
