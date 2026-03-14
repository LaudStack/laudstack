"use client";

export const dynamic = 'force-dynamic';


/*
 * LaudStack — Editor's Picks
 *
 * Hand-curated selections by the LaudStack editorial team.
 * Organised into themed collections with spotlight hero cards.
 * Design: light, consistent with platform theme — amber accents, slate typography.
 */

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Shield, Star, ExternalLink, ArrowRight,
  Sparkles, CheckCircle2, Award, BookOpen,
  ChevronRight, ShieldCheck, Zap, TrendingUp,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToolsData } from '@/hooks/useToolsData';
import type { Tool } from '@/lib/types';

// ─── Editorial collections ────────────────────────────────────────────────────

const EDITORIAL_COLLECTIONS = [
  {
    id: 'best_ai_2026',
    label: 'Best AI Tools of 2026',
    icon: Sparkles,
    accentColor: '#7E22CE',
    accentBg: '#FAF5FF',
    accentBorder: '#E9D5FF',
    description: 'The most impactful AI tools redefining how professionals work this year — rigorously tested by our editorial team.',
    badgeFilter: 'editors_pick' as const,
    limit: 6,
  },
  {
    id: 'top_rated',
    label: 'Highest Rated by Users',
    icon: Star,
    accentColor: '#D97706',
    accentBg: '#FFFBEB',
    accentBorder: '#FDE68A',
    description: 'Tools that consistently earn 4.7 stars or above across hundreds of verified reviews.',
    badgeFilter: 'top_rated' as const,
    limit: 6,
  },
  {
    id: 'best_value',
    label: 'Best Value for Money',
    icon: CheckCircle2,
    accentColor: '#15803D',
    accentBg: '#F0FDF4',
    accentBorder: '#BBF7D0',
    description: 'Free and Freemium tools that punch well above their price point — verified by the community.',
    badgeFilter: 'best_value' as const,
    limit: 6,
  },
  {
    id: 'new_standouts',
    label: 'New Standouts',
    icon: Zap,
    accentColor: '#0369A1',
    accentBg: '#F0F9FF',
    accentBorder: '#BAE6FD',
    description: 'Recently launched tools that have already earned editorial recognition for quality and innovation.',
    badgeFilter: 'new_launch' as const,
    limit: 6,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pricingStyle(model: string): React.CSSProperties {
  if (model === 'Free')     return { background: '#F0FDF4', color: '#15803D', borderColor: '#BBF7D0' };
  if (model === 'Freemium') return { background: '#EFF6FF', color: '#1D4ED8', borderColor: '#BFDBFE' };
  return { background: '#F8FAFC', color: '#475569', borderColor: '#CBD5E1' };
}

// getCollectionTools is defined inside the component

// ─── Spotlight hero card (first tool in each collection) ──────────────────────

function SpotlightCard({ tool, accentColor, accentBg, accentBorder }: {
  tool: Tool;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
}) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/tools/${tool.slug}`)}
      style={{
        background: '#FFFFFF', border: `1.5px solid ${accentBorder}`,
        borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
        transition: 'box-shadow 0.2s, transform 0.2s',
        boxShadow: `0 2px 12px ${accentColor}18`,
        display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = `0 12px 36px ${accentColor}28`;
        el.style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = `0 2px 12px ${accentColor}18`;
        el.style.transform = 'translateY(0)';
      }}
    >
      {/* Accent top bar */}
      <div style={{ height: 4, background: accentColor, flexShrink: 0 }} />
      <div style={{ padding: '28px 28px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Logo + name */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, flexShrink: 0,
            border: '1px solid #E2E8F0', background: '#F8FAFC',
            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img
              src={tool.logo_url} alt={tool.name}
              style={{ width: 48, height: 48, objectFit: 'contain' }}
              onError={e => {
                const t = e.currentTarget; t.style.display = 'none';
                const p = t.parentElement;
                if (p) p.innerHTML = `<span style="font-size:24px;font-weight:800;color:#64748B">${tool.name.charAt(0)}</span>`;
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#171717', letterSpacing: '-0.02em' }}>{tool.name}</span>
              {tool.is_verified && <ShieldCheck style={{ width: 16, height: 16, color: '#22C55E', flexShrink: 0 }} />}
            </div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100,
              background: accentBg, color: accentColor, border: `1px solid ${accentBorder}`,
            }}>
              <Shield style={{ width: 10, height: 10 }} /> Editor's Pick
            </span>
          </div>
        </div>

        {/* Tagline */}
        <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.65, margin: 0 }}>{tool.tagline}</p>

        {/* Description excerpt */}
        {tool.description && (
          <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {tool.description}
          </p>
        )}

        {/* Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {[1,2,3,4,5].map(i => (
              <Star key={i} style={{ width: 13, height: 13 }}
                fill={i <= Math.round(tool.average_rating) ? '#FBBF24' : '#E2E8F0'}
                color={i <= Math.round(tool.average_rating) ? '#FBBF24' : '#E2E8F0'}
              />
            ))}
            <span style={{ fontSize: 13, fontWeight: 700, color: '#171717', marginLeft: 3 }}>{tool.average_rating.toFixed(1)}</span>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>({tool.review_count} reviews)</span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, border: '1px solid', ...pricingStyle(tool.pricing_model) }}>
            {tool.pricing_model}
          </span>
          <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, background: '#F8FAFC', padding: '2px 8px', borderRadius: 6, border: '1px solid #E2E8F0' }}>
            {tool.category}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button
            onClick={e => { e.stopPropagation(); window.open(tool.website_url, '_blank'); }}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700,
              color: '#FFFFFF', background: accentColor, border: 'none', cursor: 'pointer',
              transition: 'opacity 0.15s', fontFamily: 'inherit',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <ExternalLink style={{ width: 13, height: 13 }} /> Visit Site
          </button>
          <button
            style={{
              padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700,
              color: '#374151', background: '#F8FAFC', border: '1.5px solid #E2E8F0',
              cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
            onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = accentBorder; b.style.background = accentBg; b.style.color = accentColor; }}
            onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#E2E8F0'; b.style.background = '#F8FAFC'; b.style.color = '#374151'; }}
          >
            View Details <ChevronRight style={{ width: 13, height: 13 }} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Compact list card ────────────────────────────────────────────────────────

function CompactCard({ tool, accentColor, accentBorder }: { tool: Tool; accentColor: string; accentBorder: string }) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/tools/${tool.slug}`)}
      style={{
        background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 12,
        padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14,
        cursor: 'pointer', transition: 'box-shadow 0.15s, border-color 0.15s, transform 0.15s',
        boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = '0 6px 20px rgba(15,23,42,0.09)';
        el.style.borderColor = accentBorder;
        el.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = '0 1px 3px rgba(15,23,42,0.04)';
        el.style.borderColor = '#E2E8F0';
        el.style.transform = 'translateY(0)';
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 11, flexShrink: 0,
        border: '1px solid #E2E8F0', background: '#F8FAFC',
        overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <img src={tool.logo_url} alt={tool.name} style={{ width: 32, height: 32, objectFit: 'contain' }}
          onError={e => {
            const t = e.currentTarget; t.style.display = 'none';
            const p = t.parentElement;
            if (p) p.innerHTML = `<span style="font-size:16px;font-weight:800;color:#64748B">${tool.name.charAt(0)}</span>`;
          }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#171717', letterSpacing: '-0.01em' }}>{tool.name}</span>
          {tool.is_verified && <ShieldCheck style={{ width: 12, height: 12, color: '#22C55E', flexShrink: 0 }} />}
        </div>
        <p style={{ fontSize: 12, color: '#64748B', margin: 0, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tool.tagline}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Star style={{ width: 11, height: 11, fill: '#FBBF24', color: '#FBBF24' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#171717' }}>{tool.average_rating.toFixed(1)}</span>
        </div>
        <ChevronRight style={{ width: 14, height: 14, color: '#CBD5E1' }} />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditorsPicks() {
  const { tools: allTools, reviews: allReviews, loading: toolsLoading } = useToolsData();

  const [activeCollection, setActiveCollection] = useState(EDITORIAL_COLLECTIONS[0].id);
  const active = EDITORIAL_COLLECTIONS.find(c => c.id === activeCollection) ?? EDITORIAL_COLLECTIONS[0];
  const getCollectionTools = (badgeFilter: string, limit: number): Tool[] => {
    return allTools
      .filter(t => t.badges?.includes(badgeFilter as any))
      .sort((a, b) => b.average_rating - a.average_rating)
      .slice(0, limit);
  };
  const collectionTools = getCollectionTools(active.badgeFilter, active.limit);
  const spotlightTool = collectionTools[0];
  const listTools = collectionTools.slice(1);

  // All editors_pick tools for the hero stats
  const totalEditorsPicks = allTools.filter(t => t.badges?.includes('editors_pick')).length;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFC' }}>
      <Navbar />
      <div style={{ height: 72, flexShrink: 0 }} />

      {/* ── Hero ── */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '48px 0 40px' }}>
        <div className="max-w-[1300px] mx-auto px-6 lg:px-10">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderRadius: 100, background: '#FAF5FF', border: '1px solid #E9D5FF', marginBottom: 16 }}>
                <Shield style={{ width: 12, height: 12, color: '#7E22CE' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#7E22CE', letterSpacing: '0.09em', textTransform: 'uppercase' }}>Editor's Picks</span>
              </div>
              <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 900, color: '#171717', letterSpacing: '-0.03em', margin: '0 0 12px', lineHeight: 1.1 }}>
                Curated by Our Editorial Team
              </h1>
              <p style={{ fontSize: 16, color: '#64748B', maxWidth: 540, lineHeight: 1.65, margin: 0 }}>
                Every stack here has been individually tested, reviewed, and selected by the LaudStack editorial team for outstanding quality, innovation, and real-world value.
              </p>
            </div>
            {/* Stats */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { icon: Award, value: `${totalEditorsPicks}`, label: "Editor's Picks" },
                { icon: BookOpen, value: '4', label: 'Collections' },
                { icon: TrendingUp, value: 'Weekly', label: 'Updated' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} style={{ textAlign: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 20px', minWidth: 100 }}>
                  <Icon style={{ width: 18, height: 18, color: '#7E22CE', margin: '0 auto 6px' }} />
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#171717', letterSpacing: '-0.02em' }}>{value}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Editorial process note */}
          <div style={{ marginTop: 28, padding: '14px 20px', background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: 12, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <Shield style={{ width: 18, height: 18, color: '#7E22CE', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: '#6B21A8', lineHeight: 1.6, margin: 0 }}>
              <strong>Editorial Independence:</strong> Our picks are never paid placements. Every stack is evaluated against our editorial rubric covering functionality, UX, support quality, pricing fairness, and community reception. Founders cannot purchase an Editor's Pick badge.
            </p>
          </div>
        </div>
      </section>

      {/* ── Collection tabs ── */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0' }}>
        <div className="max-w-[1300px] mx-auto px-6 lg:px-10">
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {EDITORIAL_COLLECTIONS.map(col => {
              const Icon = col.icon;
              const isActive = col.id === activeCollection;
              return (
                <button
                  key={col.id}
                  onClick={() => setActiveCollection(col.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '16px 20px', fontSize: 13, fontWeight: 700,
                    color: isActive ? col.accentColor : '#64748B',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    borderBottom: isActive ? `2.5px solid ${col.accentColor}` : '2.5px solid transparent',
                    transition: 'all 0.15s', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#171717'; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#64748B'; }}
                >
                  <Icon style={{ width: 15, height: 15 }} />
                  {col.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <main style={{ flex: 1, padding: '40px 0 64px' }}>
        <div className="max-w-[1300px] mx-auto px-6 lg:px-10">
          {/* Collection description */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderRadius: 100, background: active.accentBg, border: `1px solid ${active.accentBorder}`, marginBottom: 12 }}>
              <active.icon style={{ width: 12, height: 12, color: active.accentColor }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: active.accentColor, letterSpacing: '0.09em', textTransform: 'uppercase' }}>{active.label}</span>
            </div>
            <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.65, maxWidth: 640, margin: 0 }}>{active.description}</p>
          </div>

          {collectionTools.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#94A3B8' }}>
              <Shield style={{ width: 48, height: 48, margin: '0 auto 16px', opacity: 0.3 }} />
              <p style={{ fontSize: 16, fontWeight: 600 }}>No picks in this collection yet.</p>
              <p style={{ fontSize: 13, marginTop: 8 }}>Our editors are reviewing tools for this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 24 }}>
              {/* Spotlight (left 2/3) */}
              <div className="lg:col-span-2">
                {spotlightTool && (
                  <SpotlightCard
                    tool={spotlightTool}
                    accentColor={active.accentColor}
                    accentBg={active.accentBg}
                    accentBorder={active.accentBorder}
                  />
                )}
              </div>

              {/* List (right 1/3) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 4px' }}>
                  Also in this collection
                </p>
                {listTools.map(tool => (
                  <CompactCard
                    key={tool.id}
                    tool={tool}
                    accentColor={active.accentColor}
                    accentBorder={active.accentBorder}
                  />
                ))}
                {listTools.length === 0 && (
                  <p style={{ fontSize: 13, color: '#94A3B8', fontStyle: 'italic' }}>More picks coming soon.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── All collections grid ── */}
      <section style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '56px 0' }}>
        <div className="max-w-[1300px] mx-auto px-6 lg:px-10">
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 26, fontWeight: 800, color: '#171717', letterSpacing: '-0.02em', margin: '0 0 10px' }}>
              Browse All Collections
            </h2>
            <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
              Explore every editorial collection curated by our team.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 16 }}>
            {EDITORIAL_COLLECTIONS.map(col => {
              const Icon = col.icon;
              const tools = getCollectionTools(col.badgeFilter, col.limit);
              return (
                <button
                  key={col.id}
                  onClick={() => { setActiveCollection(col.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  style={{
                    textAlign: 'left', background: '#FFFFFF', border: `1.5px solid ${col.accentBorder}`,
                    borderRadius: 16, padding: '20px 20px', cursor: 'pointer',
                    transition: 'box-shadow 0.18s, transform 0.18s', fontFamily: 'inherit',
                    boxShadow: `0 1px 4px ${col.accentColor}12`,
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.boxShadow = `0 8px 24px ${col.accentColor}22`;
                    el.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.boxShadow = `0 1px 4px ${col.accentColor}12`;
                    el.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 11, background: col.accentBg,
                    border: `1px solid ${col.accentBorder}`, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', marginBottom: 14,
                  }}>
                    <Icon style={{ width: 18, height: 18, color: col.accentColor }} />
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: '#171717', margin: '0 0 6px', letterSpacing: '-0.01em' }}>{col.label}</p>
                  <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 12px', lineHeight: 1.5 }}>{col.description.slice(0, 80)}…</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: col.accentColor }}>
                    {tools.length} tools <ArrowRight style={{ width: 12, height: 12 }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
