/**
 * Compare.tsx — LaudStack Tool Comparison Page
 * Design: Clean white, enterprise-grade, G2-inspired
 * Shows a side-by-side table for 2–3 selected tools.
 * Supports shareable URLs: /compare?tools=slug1,slug2,slug3
 */

import { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import {
  Star, ExternalLink, ShieldCheck, ArrowLeft, CheckCircle2,
  XCircle, GitCompareArrows, ChevronRight, Minus, Share2, Check, Link2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import PageHero from '@/components/PageHero';
import Footer from '@/components/Footer';
import { useCompare } from '@/contexts/CompareContext';
import { MOCK_TOOLS } from '@/lib/mockData';
import { getToolExtras } from '@/lib/toolExtras';
import type { Tool } from '@/lib/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StarRow({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          style={{
            width: '14px', height: '14px',
            fill: i <= Math.round(rating) ? '#F59E0B' : 'transparent',
            color: i <= Math.round(rating) ? '#F59E0B' : '#CBD5E1',
          }}
        />
      ))}
      <span style={{ fontSize: '14px', fontWeight: 800, color: '#171717', marginLeft: '4px' }}>{rating.toFixed(1)}</span>
    </div>
  );
}

function CheckCell({ val }: { val: boolean | null }) {
  if (val === null) return <Minus style={{ width: '16px', height: '16px', color: '#CBD5E1' }} />;
  return val
    ? <CheckCircle2 style={{ width: '16px', height: '16px', color: '#22C55E' }} />
    : <XCircle style={{ width: '16px', height: '16px', color: '#F87171' }} />;
}

// Derive feature support from tool data
function getFeatures(tool: Tool) {
  return {
    'Free Plan Available':    tool.pricing_model === 'Free' || tool.pricing_model === 'Freemium',
    'API Access':             tool.tags.some((t: string) => /api|developer/i.test(t)),
    'Integrations':           tool.tags.some((t: string) => /integrat|zapier|slack|notion/i.test(t)),
    'Mobile App':             tool.tags.some((t: string) => /mobile|ios|android/i.test(t)),
    'Team Collaboration':     tool.tags.some((t: string) => /team|collab|workspace/i.test(t)),
    'Analytics & Reporting':  tool.tags.some((t: string) => /analytic|report|insight|dashboard/i.test(t)),
    'AI-Powered':             tool.tags.some((t: string) => /ai|gpt|llm|ml|machine/i.test(t)),
    'Verified Tool':          tool.is_verified,
  };
}

// ─── Row types ────────────────────────────────────────────────────────────────

const SECTION_ROWS: { section: string; rows: { label: string; key: string }[] }[] = [
  {
    section: 'Overview',
    rows: [
      { label: 'Category',       key: 'category' },
      { label: 'Pricing Model',  key: 'pricing_model' },
      { label: 'Overall Rating', key: 'average_rating' },
      { label: 'Total Reviews',  key: 'review_count' },
      { label: 'Upvotes',        key: 'upvote_count' },
    ],
  },
  {
    section: 'Features',
    rows: [
      { label: 'Free Plan Available',   key: 'feat_free' },
      { label: 'API Access',            key: 'feat_api' },
      { label: 'Integrations',          key: 'feat_integrations' },
      { label: 'Mobile App',            key: 'feat_mobile' },
      { label: 'Team Collaboration',    key: 'feat_team' },
      { label: 'Analytics & Reporting', key: 'feat_analytics' },
      { label: 'AI-Powered',            key: 'feat_ai' },
      { label: 'Verified Tool',         key: 'feat_verified' },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Compare() {
  const [location, navigate] = useLocation();
  const { selected, remove, clear, toggle } = useCompare();
  const [copied, setCopied] = useState(false);

  // ── Hydrate from URL query params (?tools=slug1,slug2,slug3) ──────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slugsParam = params.get('tools');
    if (!slugsParam) return;

    const slugs = slugsParam.split(',').filter(Boolean).slice(0, 3);
    if (slugs.length < 2) return;

    // Only hydrate if the context is currently empty (avoid overwriting user selection)
    if (selected.length === 0) {
      const toolsFromUrl = slugs
        .map(slug => MOCK_TOOLS.find(t => t.slug === slug))
        .filter((t): t is Tool => Boolean(t));

      toolsFromUrl.forEach(tool => toggle(tool));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // ── Build shareable URL ───────────────────────────────────────────────────
  function buildShareUrl(tools: Tool[]): string {
    const slugs = tools.map(t => t.slug).join(',');
    const base = window.location.origin;
    return `${base}/compare?tools=${slugs}`;
  }

  function handleShare() {
    if (selected.length < 2) return;
    const url = buildShareUrl(selected);
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success('Comparison link copied to clipboard!', {
        description: `Share this link to let others see your ${selected.length}-tool comparison.`,
        duration: 4000,
      });
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      // Fallback: show the URL in a toast
      toast.info('Share this link:', { description: url, duration: 8000 });
    });
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (selected.length < 2) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFC' }}>
        <Navbar />
        <div style={{ height: '72px' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(135deg, #F59E0B22, #D9770622)', border: '1.5px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GitCompareArrows style={{ width: '32px', height: '32px', color: '#F59E0B' }} />
          </div>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: '28px', fontWeight: 900, color: '#171717', margin: 0, letterSpacing: '-0.03em' }}>No tools selected</h1>
          <p style={{ fontSize: '16px', color: '#64748B', margin: 0, maxWidth: '400px', lineHeight: 1.6 }}>
            Select 2–3 tools using the <strong>Compare</strong> button on any tool card, then click <strong>Compare Now</strong> in the tray.
          </p>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '11px 22px', borderRadius: '10px', background: '#F59E0B', color: '#0A0A0A', fontWeight: 700, fontSize: '14px', textDecoration: 'none', boxShadow: '0 4px 14px rgba(245,158,11,0.3)' }}>
            <ArrowLeft style={{ width: '14px', height: '14px' }} /> Browse Tools
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const tools = selected;
  const colCount = tools.length;

  // Build feature maps
  const featureMaps = tools.map(t => getFeatures(t));

  // Build pricing data from toolExtras
  const pricingExtras = tools.map(t => getToolExtras(t.slug, t.name, t.pricing_model));

  // Collect all unique tier names across all tools
  const allTierNames = Array.from(
    new Set(pricingExtras.flatMap(e => e.pricing_tiers.map((tier: { name: string }) => tier.name)))
  );

  function getCellValue(tool: typeof tools[0], key: string, featMap: Record<string, boolean>): React.ReactNode {
    switch (key) {
      case 'category':       return <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{tool.category}</span>;
      case 'pricing_model': {
        const colors: Record<string, { bg: string; color: string; border: string }> = {
          Free:     { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
          Freemium: { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
          Paid:     { bg: '#F1F5F9', color: '#374151', border: '#CBD5E1' },
        };
        const c = colors[tool.pricing_model] || colors.Paid;
        return <span style={{ fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '7px', background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>{tool.pricing_model}</span>;
      }
      case 'average_rating': return <StarRow rating={tool.average_rating} />;
      case 'review_count':   return <span style={{ fontSize: '14px', fontWeight: 700, color: '#171717' }}>{tool.review_count.toLocaleString()}</span>;
      case 'upvote_count':   return <span style={{ fontSize: '14px', fontWeight: 700, color: '#171717' }}>{tool.upvote_count.toLocaleString()}</span>;
      case 'feat_free':         return <CheckCell val={featMap['Free Plan Available']} />;
      case 'feat_api':          return <CheckCell val={featMap['API Access']} />;
      case 'feat_integrations': return <CheckCell val={featMap['Integrations']} />;
      case 'feat_mobile':       return <CheckCell val={featMap['Mobile App']} />;
      case 'feat_team':         return <CheckCell val={featMap['Team Collaboration']} />;
      case 'feat_analytics':    return <CheckCell val={featMap['Analytics & Reporting']} />;
      case 'feat_ai':           return <CheckCell val={featMap['AI-Powered']} />;
      case 'feat_verified':     return <CheckCell val={featMap['Verified Tool']} />;
      default: return null;
    }
  }

  // Determine "winner" for numeric rows (highest = green highlight)
  function isWinner(tools: typeof selected, key: string, idx: number): boolean {
    if (!['average_rating', 'review_count', 'upvote_count'].includes(key)) return false;
    const vals = tools.map(t => key === 'average_rating' ? t.average_rating : key === 'review_count' ? t.review_count : t.upvote_count);
    const max = Math.max(...vals);
    return vals[idx] === max && vals.filter(v => v === max).length === 1;
  }

  const gridCols = `220px repeat(${colCount}, 1fr)`;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFC', paddingTop: '72px' }}>
      <Navbar />
      <PageHero
        eyebrow="Side-by-side"
        title="Tool Comparison"
        subtitle={`Comparing ${tools.length} tool${tools.length !== 1 ? 's' : ''} — ratings, features, pricing, and more.`}
        accent="amber"
        layout="default"
        size="sm"
      >
        {/* Action row: share + back + shareable URL */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleShare}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 16px', borderRadius: '9px', border: copied ? '1.5px solid #BBF7D0' : '1.5px solid #E2E8F0', background: copied ? '#F0FDF4' : '#F8FAFC', color: copied ? '#15803D' : '#374151', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            {copied ? <><Check style={{ width: '13px', height: '13px' }} /> Copied!</> : <><Share2 style={{ width: '13px', height: '13px' }} /> Share</>}
          </button>
          <button
            onClick={() => { clear(); navigate('/'); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '9px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', color: '#374151', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
          >
            <ArrowLeft style={{ width: '13px', height: '13px' }} /> Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '9px', maxWidth: '400px', overflow: 'hidden' }}>
            <Link2 style={{ width: '13px', height: '13px', color: '#94A3B8', flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: '#64748B', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{buildShareUrl(tools)}</span>
          </div>
        </div>
      </PageHero>

      {/* ── Main content ── */}
      <div className="max-w-[1200px] mx-auto" style={{ padding: '40px 40px 80px', width: '100%', boxSizing: 'border-box' }}>

        {/* ── Tool header cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '16px', marginBottom: '28px', alignItems: 'stretch' }}
        >
          {/* Label column header */}
          <div />

          {tools.map((tool, i) => (
            <div
              key={tool.id}
              style={{
                background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0',
                padding: '24px 20px', boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
                display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative',
              }}
            >
              {/* Remove button */}
              <button
                onClick={() => { remove(tool.id); if (selected.length <= 2) navigate('/'); }}
                style={{ position: 'absolute', top: '12px', right: '12px', width: '26px', height: '26px', borderRadius: '7px', border: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94A3B8', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FEF2F2'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#FECACA'; (e.currentTarget as HTMLButtonElement).style.color = '#EF4444'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8'; }}
              >
                ×
              </button>

              {/* Logo */}
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', overflow: 'hidden' }}>
                <img
                  src={tool.logo_url}
                  alt={tool.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={e => {
                    const t = e.currentTarget;
                    t.style.display = 'none';
                    const p = t.parentElement;
                    if (p) {
                      p.style.background = '#F1F5F9';
                      p.style.display = 'flex';
                      p.style.alignItems = 'center';
                      p.style.justifyContent = 'center';
                      p.innerHTML = `<span style="font-size:22px;font-weight:800;color:#64748B">${tool.name.charAt(0)}</span>`;
                    }
                  }}
                />
              </div>

              {/* Name + verified */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '17px', fontWeight: 800, color: '#171717', margin: 0, letterSpacing: '-0.02em' }}>{tool.name}</h2>
                  {tool.is_verified && <ShieldCheck style={{ width: '14px', height: '14px', color: '#22C55E', flexShrink: 0 }} />}
                </div>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>{tool.tagline}</p>
              </div>

              {/* Rating */}
              <StarRow rating={tool.average_rating} />

              {/* CTA */}
              <a
                href={tool.website_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', background: i === 0 ? '#F59E0B' : '#F8FAFC', color: i === 0 ? '#0A0A0A' : '#374151', fontWeight: 700, fontSize: '13px', textDecoration: 'none', border: i === 0 ? 'none' : '1.5px solid #E2E8F0', boxShadow: i === 0 ? '0 4px 12px rgba(245,158,11,0.3)' : 'none', transition: 'all 0.15s', marginTop: 'auto' }}
                onMouseEnter={e => { if (i !== 0) { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#CBD5E1'; (e.currentTarget as HTMLAnchorElement).style.background = '#F1F5F9'; } }}
                onMouseLeave={e => { if (i !== 0) { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLAnchorElement).style.background = '#F8FAFC'; } }}
              >
                Visit {tool.name} <ExternalLink style={{ width: '12px', height: '12px' }} />
              </a>
            </div>
          ))}
        </motion.div>

        {/* ── Comparison table ── */}
        {SECTION_ROWS.map((section, si) => (
          <motion.div
            key={section.section}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 + si * 0.06 }}
            style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,23,42,0.04)', marginBottom: '20px' }}
          >
            {/* Section header */}
            <div style={{ padding: '14px 24px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#171717', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{section.section}</span>
            </div>

            {/* Rows */}
            {section.rows.map((row, ri) => (
              <div
                key={row.key}
                style={{
                  display: 'grid', gridTemplateColumns: gridCols, gap: '16px',
                  padding: '14px 24px', alignItems: 'center',
                  background: ri % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                  borderBottom: ri < section.rows.length - 1 ? '1px solid #F1F5F9' : 'none',
                }}
              >
                {/* Row label */}
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>{row.label}</div>

                {/* Tool values */}
                {tools.map((tool, ti) => {
                  const winner = isWinner(tools, row.key, ti);
                  return (
                    <div
                      key={tool.id}
                      style={{
                        display: 'flex', alignItems: 'center',
                        padding: '6px 10px', borderRadius: '8px',
                        background: winner ? '#F0FDF4' : 'transparent',
                        border: winner ? '1px solid #BBF7D0' : '1px solid transparent',
                        transition: 'all 0.15s',
                      }}
                    >
                      {getCellValue(tool, row.key, featureMaps[ti])}
                      {winner && <span style={{ marginLeft: '6px', fontSize: '10px', fontWeight: 700, color: '#15803D', background: '#DCFCE7', padding: '1px 6px', borderRadius: '100px' }}>Best</span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </motion.div>
        ))}

        {/* ── Tags row ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}
          style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,23,42,0.04)', marginBottom: '20px' }}
        >
          <div style={{ padding: '14px 24px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#171717', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tags</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '16px', padding: '16px 24px', alignItems: 'start' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Keywords</div>
            {tools.map(tool => (
              <div key={tool.id} style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {tool.tags.slice(0, 6).map(tag => (
                  <span key={tag} style={{ fontSize: '11px', fontWeight: 600, padding: '3px 9px', borderRadius: '7px', background: '#F8FAFC', color: '#475569', border: '1px solid #E2E8F0' }}>#{tag}</span>
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Pricing comparison ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.28 }}
          style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,23,42,0.04)', marginBottom: '20px' }}
        >
          <div style={{ padding: '14px 24px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#171717', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pricing</span>
          </div>

          {/* Tier rows */}
          {allTierNames.map((tierName, ri) => (
            <div
              key={tierName}
              style={{
                display: 'grid', gridTemplateColumns: gridCols, gap: '16px',
                padding: '16px 24px', alignItems: 'start',
                background: ri % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                borderBottom: ri < allTierNames.length - 1 ? '1px solid #F1F5F9' : 'none',
              }}
            >
              {/* Row label */}
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', paddingTop: '4px' }}>{tierName}</div>

              {/* Per-tool pricing cell */}
              {pricingExtras.map((extras, ti) => {
                const tier = extras.pricing_tiers.find((t: { name: string }) => t.name === tierName);
                if (!tier) {
                  return (
                    <div key={tools[ti].id} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#CBD5E1' }}>
                      <Minus style={{ width: '14px', height: '14px' }} />
                      <span style={{ fontSize: '12px', color: '#CBD5E1' }}>Not available</span>
                    </div>
                  );
                }
                return (
                  <div key={tools[ti].id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span style={{ fontSize: '18px', fontWeight: 900, color: '#171717', letterSpacing: '-0.02em' }}>{tier.price}</span>
                      {tier.period && <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>{tier.period}</span>}
                      {tier.highlighted && (
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '100px', background: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A', marginLeft: '4px' }}>Popular</span>
                      )}
                    </div>
                    <p style={{ fontSize: '11px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>{tier.description}</p>
                    {tier.features && tier.features.length > 0 && (
                      <ul style={{ margin: '4px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {tier.features.slice(0, 4).map((f: string, fi: number) => (
                          <li key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', fontSize: '11px', color: '#374151' }}>
                            <CheckCircle2 style={{ width: '11px', height: '11px', color: '#22C55E', flexShrink: 0, marginTop: '1px' }} />
                            {f}
                          </li>
                        ))}
                        {tier.features.length > 4 && (
                          <li style={{ fontSize: '11px', color: '#94A3B8' }}>+{tier.features.length - 4} more features</li>
                        )}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Pricing disclaimer */}
          <div style={{ padding: '12px 24px', background: '#F8FAFC', borderTop: '1px solid #F1F5F9' }}>
            <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>Pricing is indicative. Visit each tool’s website for the latest plans and pricing.</p>
          </div>
        </motion.div>

        {/* ── Bottom CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
          style={{ background: '#171717', borderRadius: '16px', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}
        >
          <div>
            <p style={{ fontSize: '16px', fontWeight: 800, color: '#F1F5F9', margin: '0 0 4px', fontFamily: "'Inter', sans-serif" }}>Ready to decide?</p>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>Visit each tool's page to read full reviews and make your choice.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Share button in CTA row */}
            <button
              onClick={handleShare}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', color: '#CBD5E1', fontWeight: 700, fontSize: '13px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(245,158,11,0.15)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(245,158,11,0.3)'; (e.currentTarget as HTMLButtonElement).style.color = '#F59E0B'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLButtonElement).style.color = '#CBD5E1'; }}
            >
              <Share2 style={{ width: '13px', height: '13px' }} />
              Share
            </button>
            {tools.map((tool, i) => (
              <a
                key={tool.id}
                href={tool.website_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '10px', background: i === 0 ? '#F59E0B' : 'rgba(255,255,255,0.08)', color: i === 0 ? '#0A0A0A' : '#CBD5E1', fontWeight: 700, fontSize: '13px', textDecoration: 'none', border: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.1)', transition: 'all 0.15s' }}
              >
                Visit {tool.name} <ExternalLink style={{ width: '12px', height: '12px' }} />
              </a>
            ))}
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
