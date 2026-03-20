"use client";

/**
 * PageHero.tsx — LaudStack Reusable Page Hero (Premium Edition)
 *
 * Design:
 *  - Refined off-white background with subtle decorative dot grid pattern
 *  - Soft radial accent glow for depth and warmth
 *  - Thin accent left-edge bar as brand anchor
 *  - Tight editorial typography — professional and polished
 *  - Consistent vertical rhythm across all layout variants
 *
 * Props:
 *  - eyebrow:     small uppercase label (shown in accent color)
 *  - title:       main headline (supports JSX for inline highlights)
 *  - subtitle:    supporting text
 *  - children:    optional JSX rendered below title/subtitle
 *  - actions:     optional JSX slot (right side on default/split, below title on centered)
 *  - badge:       optional pill (e.g. "Live", "Beta")
 *  - accent:      'amber' | 'navy' | 'green' | 'rose'
 *  - size:        'sm' | 'md' | 'lg'
 *  - layout:      'default' | 'centered' | 'split'
 */

import React from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';

type AccentKey = 'amber' | 'navy' | 'green' | 'rose';
type SizeKey   = 'sm' | 'md' | 'lg';
type LayoutKey = 'default' | 'centered' | 'split';

interface BackLink {
  href: string;
  label: string;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeroProps {
  eyebrow?:   string;
  title:      React.ReactNode;
  subtitle?:  string;
  children?:  React.ReactNode;
  actions?:   React.ReactNode;
  badge?:     string;
  accent?:    AccentKey;
  size?:      SizeKey;
  layout?:    LayoutKey;
  className?: string;
  backLink?:  BackLink;
  breadcrumbs?: BreadcrumbItem[];
}

const ACCENT: Record<AccentKey, {
  bar: string; eyebrow: string;
  badgeBg: string; badgeBorder: string; badgeText: string;
  glowColor: string;
}> = {
  amber: { bar: '#D97706', eyebrow: '#92400E', badgeBg: '#FFFBEB', badgeBorder: '#FDE68A', badgeText: '#92400E', glowColor: 'rgba(245, 158, 11, 0.06)' },
  navy:  { bar: '#1E3A5F', eyebrow: '#1E3A5F', badgeBg: '#ECF2FF', badgeBorder: '#D6E2FF', badgeText: '#1E3A5F', glowColor: 'rgba(30, 58, 95, 0.05)' },
  green: { bar: '#16A34A', eyebrow: '#16A34A', badgeBg: '#F0FDF4', badgeBorder: '#DCFCE7', badgeText: '#16A34A', glowColor: 'rgba(22, 163, 74, 0.05)' },
  rose:  { bar: '#EF4444', eyebrow: '#EF4444', badgeBg: '#FEF2F2', badgeBorder: '#FEE2E2', badgeText: '#EF4444', glowColor: 'rgba(239, 68, 68, 0.05)' },
};

/* Reduced padding for compact heroes */
const SIZE: Record<SizeKey, { pt: string; pb: string; titleSize: string; titleSizeMobile: string; subtitleSize: string; subtitleSizeMobile: string }> = {
  sm: { pt: '22px', pb: '20px', titleSize: '24px', titleSizeMobile: '20px', subtitleSize: '15px', subtitleSizeMobile: '14px' },
  md: { pt: '30px', pb: '26px', titleSize: '30px', titleSizeMobile: '24px', subtitleSize: '16px', subtitleSizeMobile: '15px' },
  lg: { pt: '38px', pb: '32px', titleSize: '36px', titleSizeMobile: '28px', subtitleSize: '17px', subtitleSizeMobile: '15px' },
};

function EyebrowBadge({ eyebrow, badge, a }: { eyebrow?: string; badge?: string; a: typeof ACCENT['amber'] }) {
  if (!eyebrow && !badge) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
      {eyebrow && (
        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: a.eyebrow }}>
          {eyebrow}
        </span>
      )}
      {badge && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: a.badgeBg, border: `1px solid ${a.badgeBorder}`, color: a.badgeText }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: a.bar, display: 'inline-block' }} />
          {badge}
        </span>
      )}
    </div>
  );
}

function BackLinkRow({ backLink, a }: { backLink: BackLink; a: typeof ACCENT['amber'] }) {
  return (
    <a
      href={backLink.href}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '12px',
        fontWeight: 600,
        color: '#64748B',
        textDecoration: 'none',
        marginBottom: '8px',
        transition: 'color 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = a.eyebrow)}
      onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
        <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {backLink.label}
    </a>
  );
}

function BreadcrumbsRow({ items }: { items: BreadcrumbItem[] }) {
  if (!items || items.length === 0) return null;
  return <Breadcrumbs items={items} className="mb-3 sm:mb-4" />;
}

export default function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
  actions,
  badge,
  accent    = 'amber',
  size      = 'md',
  layout    = 'default',
  className = '',
  backLink,
  breadcrumbs,
}: PageHeroProps) {
  const a = ACCENT[accent];
  const s = SIZE[size];

  return (
    <div
      className={`pt-[60px] lg:pt-[64px] ${className}`}
      style={{
        background: '#F8FAFC',
        borderBottom: '1px solid #E2E8F0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Decorative background layers ── */}

      {/* Subtle dot grid pattern */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, #CBD5E1 0.8px, transparent 0.8px)',
          backgroundSize: '24px 24px',
          opacity: 0.35,
          pointerEvents: 'none',
        }}
      />

      {/* Soft radial accent glow — positioned top-right for visual interest */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-5%',
          width: '500px',
          height: '400px',
          background: `radial-gradient(ellipse at center, ${a.glowColor} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Secondary subtle glow — bottom-left for balance */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-5%',
          width: '400px',
          height: '300px',
          background: 'radial-gradient(ellipse at center, rgba(30, 58, 95, 0.03) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Subtle horizontal line decoration at bottom */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(30, 58, 95, 0.08) 20%, rgba(217, 119, 6, 0.12) 50%, rgba(30, 58, 95, 0.08) 80%, transparent 100%)',
        }}
      />

      {/* Left accent bar */}
      <div
        aria-hidden
        style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: a.bar }}
      />

      <div
        className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8"
        style={{ paddingTop: s.pt, paddingBottom: s.pb, position: 'relative', zIndex: 1 }}
      >

        {/* ── DEFAULT layout ── */}
        {layout === 'default' && (
          <>
            {breadcrumbs && breadcrumbs.length > 0 ? <BreadcrumbsRow items={breadcrumbs} /> : backLink && <BackLinkRow backLink={backLink} a={a} />}
            <EyebrowBadge eyebrow={eyebrow} badge={badge} a={a} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 0', minWidth: '0' }}>
                <h1 className="hero-title" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, color: '#0C1830', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.25, fontSize: `clamp(${s.titleSizeMobile}, 3vw, ${s.titleSize})` }}>
                  {title}
                </h1>
                {subtitle && (
                  <p style={{ fontSize: `clamp(${s.subtitleSizeMobile}, 1.5vw, ${s.subtitleSize})`, color: '#475569', margin: '8px 0 0', lineHeight: 1.55, maxWidth: '540px', fontWeight: 450 }}>
                    {subtitle}
                  </p>
                )}
              </div>
              {actions && <div className="shrink-0 w-full sm:w-auto" style={{ flexShrink: 0 }}>{actions}</div>}
            </div>
            {children && <div style={{ marginTop: '14px' }}>{children}</div>}
          </>
        )}

        {/* ── CENTERED layout ── */}
        {layout === 'centered' && (
          <>
            {/* Breadcrumbs always left-aligned, outside the centered container */}
            {breadcrumbs && breadcrumbs.length > 0 ? <BreadcrumbsRow items={breadcrumbs} /> : backLink && <div style={{ marginBottom: '6px' }}><BackLinkRow backLink={backLink} a={a} /></div>}
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              {eyebrow && (
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: a.eyebrow }}>
                  {eyebrow}
                </span>
              )}
              {badge && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: a.badgeBg, border: `1px solid ${a.badgeBorder}`, color: a.badgeText }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: a.bar, display: 'inline-block' }} />
                  {badge}
                </span>
              )}
            </div>
            <h1 className="hero-title" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, color: '#0C1830', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.25, fontSize: `clamp(${s.titleSizeMobile}, 3vw, ${s.titleSize})` }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{ fontSize: `clamp(${s.subtitleSizeMobile}, 1.5vw, ${s.subtitleSize})`, color: '#475569', margin: '8px 0 0', lineHeight: 1.55, fontWeight: 450 }}>
                {subtitle}
              </p>
            )}
            {actions && <div style={{ marginTop: '14px' }}>{actions}</div>}
            {children && <div style={{ marginTop: '14px' }}>{children}</div>}
          </div>
          </>
        )}

        {/* ── SPLIT layout ── */}
        {layout === 'split' && (
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-5">
            <div className="flex-1 min-w-0">
              {breadcrumbs && breadcrumbs.length > 0 ? <BreadcrumbsRow items={breadcrumbs} /> : backLink && <BackLinkRow backLink={backLink} a={a} />}
              <EyebrowBadge eyebrow={eyebrow} badge={badge} a={a} />
              <h1 className="hero-title" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, color: '#0C1830', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.25, fontSize: `clamp(${s.titleSizeMobile}, 3vw, ${s.titleSize})` }}>
                {title}
              </h1>
              {subtitle && (
                <p style={{ fontSize: `clamp(${s.subtitleSizeMobile}, 1.5vw, ${s.subtitleSize})`, color: '#475569', margin: '8px 0 0', lineHeight: 1.55, maxWidth: '460px', fontWeight: 450 }}>
                  {subtitle}
                </p>
              )}
              {actions && <div style={{ marginTop: '14px' }}>{actions}</div>}
            </div>
            {children && <div className="shrink-0 w-full md:w-auto overflow-hidden">{children}</div>}
          </div>
        )}

      </div>
    </div>
  );
}
