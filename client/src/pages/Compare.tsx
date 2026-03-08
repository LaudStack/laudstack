/**
 * Compare.tsx — LaudStack Tool Comparison Page
 * Design: Clean white, enterprise-grade, G2-inspired
 * Shows a side-by-side table for 2–3 selected tools.
 * Sections: Hero header, key metrics, pricing, features, ratings breakdown, CTA row
 */

import { useLocation, Link } from 'wouter';
import {
  Star, ExternalLink, ShieldCheck, ArrowLeft, CheckCircle2,
  XCircle, GitCompareArrows, ChevronRight, Minus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCompare } from '@/contexts/CompareContext';
import { MOCK_TOOLS } from '@/lib/mockData';
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
      <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginLeft: '4px' }}>{rating.toFixed(1)}</span>
    </div>
  );
}

function Check({ val }: { val: boolean | null }) {
  if (val === null) return <Minus style={{ width: '16px', height: '16px', color: '#CBD5E1' }} />;
  return val
    ? <CheckCircle2 style={{ width: '16px', height: '16px', color: '#10B981' }} />
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
  const [, navigate] = useLocation();
  const { selected, remove, clear } = useCompare();

  // Redirect if fewer than 2 tools
  if (selected.length < 2) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFC' }}>
        <Navbar />
        <div style={{ height: '72px' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(135deg, #F59E0B22, #EA580C22)', border: '1.5px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GitCompareArrows style={{ width: '32px', height: '32px', color: '#F59E0B' }} />
          </div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '28px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.03em' }}>No tools selected</h1>
          <p style={{ fontSize: '16px', color: '#64748B', margin: 0, maxWidth: '400px', lineHeight: 1.6 }}>
            Select 2–3 tools using the <strong>Compare</strong> button on any tool card, then click <strong>Compare Now</strong> in the tray.
          </p>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '11px 22px', borderRadius: '10px', background: 'linear-gradient(135deg, #F59E0B, #EA580C)', color: '#fff', fontWeight: 700, fontSize: '14px', textDecoration: 'none', boxShadow: '0 4px 14px rgba(245,158,11,0.3)' }}>
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
      case 'review_count':   return <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{tool.review_count.toLocaleString()}</span>;
      case 'upvote_count':   return <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{tool.upvote_count.toLocaleString()}</span>;
      case 'feat_free':         return <Check val={featMap['Free Plan Available']} />;
      case 'feat_api':          return <Check val={featMap['API Access']} />;
      case 'feat_integrations': return <Check val={featMap['Integrations']} />;
      case 'feat_mobile':       return <Check val={featMap['Mobile App']} />;
      case 'feat_team':         return <Check val={featMap['Team Collaboration']} />;
      case 'feat_analytics':    return <Check val={featMap['Analytics & Reporting']} />;
      case 'feat_ai':           return <Check val={featMap['AI-Powered']} />;
      case 'feat_verified':     return <Check val={featMap['Verified Tool']} />;
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
    <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFC' }}>
      <Navbar />
      <div style={{ height: '72px', flexShrink: 0 }} />

      {/* ── Breadcrumb ── */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10" style={{ padding: '12px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748B' }}>
            <Link href="/" style={{ color: '#64748B', textDecoration: 'none', fontWeight: 500 }}>Home</Link>
            <ChevronRight style={{ width: '12px', height: '12px' }} />
            <span style={{ color: '#0F172A', fontWeight: 600 }}>Compare Tools</span>
          </div>
        </div>
      </div>

      {/* ── Page header ── */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '32px 0 28px' }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #F59E0B, #EA580C)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <GitCompareArrows style={{ width: '20px', height: '20px', color: '#fff' }} />
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 2px' }}>Side-by-side</p>
                <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '24px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.03em' }}>
                  Tool Comparison
                </h1>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => { clear(); navigate('/'); }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', color: '#374151', fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#CBD5E1'; (e.currentTarget as HTMLButtonElement).style.background = '#F1F5F9'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC'; }}
              >
                <ArrowLeft style={{ width: '13px', height: '13px' }} /> Back to Browse
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10" style={{ padding: '40px 40px 80px', width: '100%', boxSizing: 'border-box' }}>

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
                  <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>{tool.name}</h2>
                  {tool.is_verified && <ShieldCheck style={{ width: '14px', height: '14px', color: '#10B981', flexShrink: 0 }} />}
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
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', background: i === 0 ? 'linear-gradient(135deg, #F59E0B, #EA580C)' : '#F8FAFC', color: i === 0 ? '#fff' : '#374151', fontWeight: 700, fontSize: '13px', textDecoration: 'none', border: i === 0 ? 'none' : '1.5px solid #E2E8F0', boxShadow: i === 0 ? '0 4px 12px rgba(245,158,11,0.3)' : 'none', transition: 'all 0.15s', marginTop: 'auto' }}
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
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{section.section}</span>
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
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tags</span>
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

        {/* ── Bottom CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
          style={{ background: '#0F172A', borderRadius: '16px', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}
        >
          <div>
            <p style={{ fontSize: '16px', fontWeight: 800, color: '#F1F5F9', margin: '0 0 4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ready to decide?</p>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>Visit each tool's page to read full reviews and make your choice.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {tools.map((tool, i) => (
              <a
                key={tool.id}
                href={tool.website_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '10px', background: i === 0 ? 'linear-gradient(135deg, #F59E0B, #EA580C)' : 'rgba(255,255,255,0.08)', color: i === 0 ? '#fff' : '#CBD5E1', fontWeight: 700, fontSize: '13px', textDecoration: 'none', border: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.1)', transition: 'all 0.15s' }}
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
