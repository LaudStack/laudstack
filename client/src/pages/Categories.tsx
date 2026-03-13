/*
 * Categories.tsx — LaudStack Category Browse Page
 * Design: Clean white, enterprise-grade
 * Layout: Hero → Category grid (with top tools per category) → CTA
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  Grid3X3, ArrowRight, Search, Star, TrendingUp, Zap, Code2,
  Video, PenTool, Wrench, Image, BarChart3, ClipboardList,
  Layers, ChevronRight, Rocket
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MOCK_TOOLS, CATEGORIES } from '@/lib/mockData';

// ─── Category Icon Map ────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'AI Productivity':    Zap,
  'Design':             PenTool,
  'AI Code':            Code2,
  'AI Video':           Video,
  'AI Writing':         PenTool,
  'Developer Tools':    Wrench,
  'AI Image':           Image,
  'AI Analytics':       BarChart3,
  'Project Management': ClipboardList,
  'All':                Grid3X3,
};

const CATEGORY_COLORS: Record<string, { bg: string; border: string; icon: string; accent: string }> = {
  'AI Productivity':    { bg: '#FFFBEB', border: '#FDE68A', icon: '#F59E0B', accent: '#B45309' },
  'Design':             { bg: '#FDF4FF', border: '#E9D5FF', icon: '#A855F7', accent: '#7C3AED' },
  'AI Code':            { bg: '#EFF6FF', border: '#BFDBFE', icon: '#3B82F6', accent: '#1D4ED8' },
  'AI Video':           { bg: '#FFF1F2', border: '#FECDD3', icon: '#F43F5E', accent: '#BE123C' },
  'AI Writing':         { bg: '#F0FDF4', border: '#BBF7D0', icon: '#22C55E', accent: '#15803D' },
  'Developer Tools':    { bg: '#F8FAFC', border: '#CBD5E1', icon: '#475569', accent: '#171717' },
  'AI Image':           { bg: '#FFF7ED', border: '#FED7AA', icon: '#F97316', accent: '#C2410C' },
  'AI Analytics':       { bg: '#F0F9FF', border: '#BAE6FD', icon: '#0EA5E9', accent: '#0369A1' },
  'Project Management': { bg: '#F0FDF4', border: '#A7F3D0', icon: '#22C55E', accent: '#15803D' },
};

const DEFAULT_COLOR = { bg: '#F8FAFC', border: '#E2E8F0', icon: '#64748B', accent: '#374151' };

// ─── Component ────────────────────────────────────────────────────────────────

export default function Categories() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState('');

  // Build enriched category data from MOCK_TOOLS
  const categoriesWithTools = CATEGORIES
    .filter(c => c.name !== 'All')
    .map(cat => {
      const tools = MOCK_TOOLS.filter(t => t.category === cat.name);
      const topTools = [...tools]
        .sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0))
        .slice(0, 3);
      return { ...cat, tools, topTools };
    })
    .filter(c => search === '' || c.name.toLowerCase().includes(search.toLowerCase()));

  const totalTools = MOCK_TOOLS.length;

  const goToCategory = (catName: string) =>
    navigate(`/search?q=&category=${encodeURIComponent(catName)}`);

  const goToTool = (slug: string) => navigate(`/tools/${slug}`);

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* ── Hero ── */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '72px 24px 48px', marginTop: '72px' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '20px', background: '#FEF3C7', border: '1px solid #FDE68A', marginBottom: '20px' }}>
            <Grid3X3 style={{ width: '13px', height: '13px', color: '#D97706' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#B45309', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Browse Categories</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: '#171717', lineHeight: 1.2, marginBottom: '14px', letterSpacing: '-0.02em' }}>
            Find tools by category
          </h1>
          <p style={{ fontSize: '16px', color: '#64748B', lineHeight: 1.7, marginBottom: '32px' }}>
            Browse {totalTools} verified AI & SaaS tools across {CATEGORIES.length - 1} categories. Every listing is reviewed by our team.
          </p>
          {/* Search */}
          <div style={{ position: 'relative', maxWidth: '440px', margin: '0 auto' }}>
            <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94A3B8' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter categories..."
              style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '12px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', color: '#171717', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.15s' }}
              onFocus={e => { e.currentTarget.style.borderColor = '#F59E0B'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0'; }}
            />
          </div>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '16px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
          {[
            { icon: Grid3X3,   label: `${CATEGORIES.length - 1} categories` },
            { icon: Layers,    label: `${totalTools} tools listed` },
            { icon: TrendingUp, label: 'Updated daily' },
            { icon: Star,      label: '4.9 avg rating' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Icon style={{ width: '14px', height: '14px', color: '#F59E0B' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Category Grid ── */}
      <div style={{ flex: 1, padding: '56px 24px 80px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {categoriesWithTools.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <Grid3X3 style={{ width: '40px', height: '40px', color: '#CBD5E1', margin: '0 auto 16px' }} />
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>No categories match "{search}"</p>
              <button onClick={() => setSearch('')} style={{ fontSize: '13px', color: '#F59E0B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Clear search</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {categoriesWithTools.map((cat, i) => {
                const colors = CATEGORY_COLORS[cat.name] ?? DEFAULT_COLOR;
                const Icon = CATEGORY_ICONS[cat.name] ?? Grid3X3;

                return (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.04 }}
                    onClick={() => goToCategory(cat.name)}
                    style={{ background: '#fff', borderRadius: '16px', border: `1px solid #E2E8F0`, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
                      (e.currentTarget as HTMLDivElement).style.borderColor = colors.border;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                      (e.currentTarget as HTMLDivElement).style.borderColor = '#E2E8F0';
                    }}
                  >
                    {/* Card Header */}
                    <div style={{ padding: '20px 20px 16px', background: colors.bg, borderBottom: `1px solid ${colors.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fff', border: `1.5px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                            <Icon style={{ width: '18px', height: '18px', color: colors.icon }} />
                          </div>
                          <div>
                            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#171717', margin: 0 }}>{cat.name}</h3>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: colors.accent }}>
                              {cat.tools.length} {cat.tools.length === 1 ? 'tool' : 'tools'}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: colors.accent }}>
                          Browse <ChevronRight style={{ width: '13px', height: '13px' }} />
                        </div>
                      </div>
                    </div>

                    {/* Top Tools */}
                    <div style={{ padding: '12px 20px 16px' }}>
                      {cat.topTools.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {cat.topTools.map(tool => (
                            <div
                              key={tool.id}
                              onClick={e => { e.stopPropagation(); goToTool(tool.slug); }}
                              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 10px', borderRadius: '8px', transition: 'background 0.15s', cursor: 'pointer' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#F8FAFC'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                            >
                              <img
                                src={tool.logo_url}
                                alt={tool.name}
                                style={{ width: '26px', height: '26px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #E2E8F0', flexShrink: 0 }}
                                onError={e => {
                                  const el = e.currentTarget as HTMLImageElement;
                                  el.style.display = 'none';
                                  const parent = el.parentElement!;
                                  const fallback = document.createElement('div');
                                  fallback.style.cssText = `width:26px;height:26px;border-radius:6px;background:${colors.bg};border:1px solid ${colors.border};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:${colors.icon};flex-shrink:0`;
                                  fallback.textContent = tool.name[0];
                                  parent.insertBefore(fallback, el);
                                }}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#171717', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tool.name}</div>
                                <div style={{ fontSize: '11px', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tool.tagline}</div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                                <Star style={{ width: '10px', height: '10px', color: '#F59E0B', fill: '#F59E0B' }} />
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#374151' }}>{tool.average_rating?.toFixed(1)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ padding: '12px 0', textAlign: 'center', fontSize: '12px', color: '#CBD5E1' }}>
                          No tools yet — be the first to submit
                        </div>
                      )}

                      {cat.tools.length > 3 && (
                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                          <button
                            onClick={e => { e.stopPropagation(); goToCategory(cat.name); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: colors.accent, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
                          >
                            View all {cat.tools.length} tools <ArrowRight style={{ width: '12px', height: '12px' }} />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Founder CTA ── */}
      <div style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0', padding: '48px 24px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 16px rgba(245,158,11,0.3)' }}>
            <Rocket style={{ width: '20px', height: '20px', color: '#fff' }} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#171717', marginBottom: '10px' }}>Don't see your tool?</h2>
          <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.7, marginBottom: '24px' }}>
            Submit your AI or SaaS tool to LaudStack. Free to list — reviewed within 48 hours.
          </p>
          <button
            onClick={() => navigate('/launchpad')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '12px', background: '#F59E0B', color: '#0A0A0A', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(245,158,11,0.3)', fontFamily: 'inherit', transition: 'box-shadow 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 28px rgba(245,158,11,0.45)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(245,158,11,0.3)'; }}
          >
            <Rocket style={{ width: '15px', height: '15px' }} /> Submit via LaunchPad
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
