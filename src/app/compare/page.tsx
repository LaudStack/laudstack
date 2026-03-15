"use client";

/**
 * Compare.tsx — LaudStack Stack Comparison Page
 * Design: Clean white, enterprise-grade, G2-inspired
 * Shows a side-by-side table for 2–3 selected tools.
 * Supports shareable URLs: /compare?tools=slug1,slug2,slug3
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import LogoWithFallback from '@/components/LogoWithFallback';
import {
  Star, ExternalLink, ShieldCheck, ArrowLeft, CheckCircle2,
  XCircle, GitCompareArrows, ChevronRight, Minus, Share2, Check, Link2
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';

import Footer from '@/components/Footer';
import { useCompare } from '@/contexts/CompareContext';
import { useToolsData } from '@/hooks/useToolsData';
import { getToolExtras } from '@/lib/toolExtras';
import type { Tool } from '@/lib/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-slate-300'}`}
        />
      ))}
      <span className="text-sm font-extrabold text-slate-900 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function CheckCell({ val }: { val: boolean | null }) {
  if (val === null) return <Minus className="w-4 h-4 text-slate-300" />;
  return val
    ? <CheckCircle2 className="w-4 h-4 text-green-500" />
    : <XCircle className="w-4 h-4 text-red-400" />;
}

// Derive feature support from product data
function getFeatures(tool: Tool) {
  return {
    'Free Plan Available':    tool.pricing_model === 'Free' || tool.pricing_model === 'Freemium',
    'API Access':             tool.tags.some((t: string) => /api|developer/i.test(t)),
    'Integrations':           tool.tags.some((t: string) => /integrat|zapier|slack|notion/i.test(t)),
    'Mobile App':             tool.tags.some((t: string) => /mobile|ios|android/i.test(t)),
    'Team Collaboration':     tool.tags.some((t: string) => /team|collab|workspace/i.test(t)),
    'Analytics & Reporting':  tool.tags.some((t: string) => /analytic|report|insight|dashboard/i.test(t)),
    'AI-Powered':             tool.tags.some((t: string) => /ai|gpt|llm|ml|machine/i.test(t)),
    'Verified Product':        tool.is_verified,
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
      { label: 'Lauds',        key: 'upvote_count' },
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
      { label: 'Verified Product',       key: 'feat_verified' },
    ],
  },
];

const PRICING_CLASSES: Record<string, string> = {
  Free:     'bg-green-50 text-green-700 border-green-200',
  Freemium: 'bg-blue-50 text-blue-700 border-blue-200',
  Paid:     'bg-slate-100 text-slate-700 border-slate-300',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Compare() {
  const { tools: allTools, reviews: allReviews, loading: toolsLoading } = useToolsData();

  const router = useRouter();
  const pathname = usePathname();
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
        .map(slug => allTools.find(t => t.slug === slug))
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
        description: `Share this link to let others see your ${selected.length}-product comparison.`,
        duration: 4000,
      });
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      toast.info('Share this link:', { description: url, duration: 8000 });
    });
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (selected.length < 2) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="h-[72px]" />
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 py-20 text-center">
          <div className="w-[72px] h-[72px] rounded-[20px] bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-[1.5px] border-amber-200 flex items-center justify-center">
            <GitCompareArrows className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="font-black text-[28px] text-slate-900 tracking-tight">No stacks selected</h1>
          <p className="text-base text-slate-500 max-w-[400px] leading-relaxed">
            Select 2–3 products using the <strong>Compare</strong> button on any stack card, then click <strong>Compare Now</strong> in the tray.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[10px] bg-amber-500 text-slate-900 font-bold text-sm shadow-lg shadow-amber-500/30 hover:bg-amber-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Browse Stacks
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
  const pricingExtras = tools.map(t => getToolExtras(t.slug, t.name, t.pricing_model, t.screenshot_url, t.website_url));

  // Collect all unique tier names across all tools
  const allTierNames = Array.from(
    new Set(pricingExtras.flatMap(e => e.pricing_tiers.map((tier: { name: string }) => tier.name)))
  );

  function getCellValue(tool: typeof tools[0], key: string, featMap: Record<string, boolean>): React.ReactNode {
    switch (key) {
      case 'category':       return <span className="text-[13px] font-semibold text-gray-700">{tool.category}</span>;
      case 'pricing_model': {
        const cls = PRICING_CLASSES[tool.pricing_model] || PRICING_CLASSES.Paid;
        return <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${cls}`}>{tool.pricing_model}</span>;
      }
      case 'average_rating': return <StarRow rating={tool.average_rating} />;
      case 'review_count':   return <span className="text-sm font-bold text-slate-900">{tool.review_count.toLocaleString()}</span>;
      case 'upvote_count':   return <span className="text-sm font-bold text-slate-900">{tool.upvote_count.toLocaleString()}</span>;
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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* ══════════ UNIFIED HERO — matches /categories pattern ══════════ */}
      <section className="bg-white border-b border-gray-200 pt-[84px] pb-6">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 mb-5">
            <Link href="/" className="text-xs text-slate-400 no-underline font-medium hover:text-slate-600 transition-colors">Home</Link>
            <span className="text-[11px] text-slate-300">/</span>
            <Link href="/comparisons" className="text-xs text-slate-400 no-underline font-medium hover:text-slate-600 transition-colors">Comparisons</Link>
            <span className="text-[11px] text-slate-300">/</span>
            <span className="text-xs text-slate-500 font-semibold">Compare</span>
          </nav>

          {/* Title row */}
          <div className="flex items-start justify-between gap-6 flex-wrap mb-2">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  <GitCompareArrows className="w-3 h-3" />
                  Side by Side
                </span>
              </div>
              <h1 className="font-['Inter',system-ui,sans-serif] text-[clamp(24px,3vw,30px)] font-black text-gray-900 tracking-tight leading-tight m-0">
                Stack Comparison
              </h1>
              <p className="text-[15px] text-slate-500 font-normal mt-2 leading-relaxed max-w-xl">
                {`Comparing ${tools.length} stack${tools.length !== 1 ? 's' : ''} — ratings, features, pricing, and more.`}
              </p>
            </div>
          </div>

          {/* Action row: share + back + shareable URL */}
          <div className="flex items-center gap-2.5 flex-wrap mt-3">
          <button
            onClick={handleShare}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border-[1.5px] font-bold text-[13px] transition-all ${
              copied
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-gray-200 bg-slate-50 text-gray-700 hover:border-gray-300'
            }`}
          >
            {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Share2 className="w-3.5 h-3.5" /> Share</>}
          </button>
          <button
            onClick={() => { clear(); router.push('/'); }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border-[1.5px] border-gray-200 bg-slate-50 text-gray-700 font-semibold text-[13px] hover:border-gray-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg max-w-[400px] overflow-hidden">
            <Link2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-[11px] text-slate-500 flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono">{buildShareUrl(tools)}</span>
          </div>
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-10 pt-10 pb-20">

        {/* ── Tool header cards ── */}
        <div className="grid gap-4 mb-7 items-stretch" style={{ gridTemplateColumns: gridCols }}>
          {/* Label column header */}
          <div />

          {tools.map((tool, i) => (
            <div
              key={tool.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col gap-3 relative"
            >
              {/* Remove button */}
              <button
                onClick={() => { remove(tool.id); if (selected.length <= 2) router.push('/'); }}
                className="absolute top-3 right-3 w-[26px] h-[26px] rounded-lg border border-gray-200 bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all"
              >
                ×
              </button>

              {/* Logo */}
              <div className="w-14 h-14 rounded-[14px] border-[1.5px] border-gray-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                <LogoWithFallback src={tool.logo_url} alt={tool.name} className="w-full h-full object-contain" fallbackSize="text-[22px]" />
              </div>

              {/* Name + verified */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <h2 className="text-[17px] font-extrabold text-slate-900 tracking-tight">{tool.name}</h2>
                  {tool.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
                </div>
                <p className="text-[13px] text-slate-500 leading-snug">{tool.tagline}</p>
              </div>

              {/* Rating */}
              <StarRow rating={tool.average_rating} />

              {/* CTA */}
              <a
                href={tool.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] font-bold text-[13px] transition-all mt-auto ${
                  i === 0
                    ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/30 hover:bg-amber-400'
                    : 'bg-slate-50 text-gray-700 border-[1.5px] border-gray-200 hover:border-gray-300 hover:bg-slate-100'
                }`}
              >
                Visit {tool.name} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>

        {/* ── Comparison table ── */}
        {SECTION_ROWS.map((section) => (
          <div
            key={section.section}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-5"
          >
            {/* Section header */}
            <div className="px-6 py-3.5 bg-slate-50 border-b border-gray-200">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">{section.section}</span>
            </div>

            {/* Rows */}
            {section.rows.map((row, ri) => (
              <div
                key={row.key}
                className={`grid gap-4 px-6 py-3.5 items-center ${ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} ${ri < section.rows.length - 1 ? 'border-b border-slate-100' : ''}`}
                style={{ gridTemplateColumns: gridCols }}
              >
                {/* Row label */}
                <div className="text-[13px] font-semibold text-slate-500">{row.label}</div>

                {/* Tool values */}
                {tools.map((tool, ti) => {
                  const winner = isWinner(tools, row.key, ti);
                  return (
                    <div
                      key={tool.id}
                      className={`flex items-center px-2.5 py-1.5 rounded-lg transition-all ${
                        winner ? 'bg-green-50 border border-green-200' : 'border border-transparent'
                      }`}
                    >
                      {getCellValue(tool, row.key, featureMaps[ti])}
                      {winner && <span className="ml-1.5 text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-px rounded-full">Best</span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}

        {/* ── Tags row ── */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-5">
          <div className="px-6 py-3.5 bg-slate-50 border-b border-gray-200">
            <span className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">Tags</span>
          </div>
          <div className="grid gap-4 px-6 py-4 items-start" style={{ gridTemplateColumns: gridCols }}>
            <div className="text-[13px] font-semibold text-slate-500">Keywords</div>
            {tools.map(tool => (
              <div key={tool.id} className="flex flex-wrap gap-1.5">
                {tool.tags.slice(0, 6).map(tag => (
                  <span key={tag} className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-50 text-slate-600 border border-gray-200">#{tag}</span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Pricing comparison ── */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-5">
          <div className="px-6 py-3.5 bg-slate-50 border-b border-gray-200">
            <span className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">Pricing</span>
          </div>

          {/* Tier rows */}
          {allTierNames.map((tierName, ri) => (
            <div
              key={tierName}
              className={`grid gap-4 px-6 py-4 items-start ${ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} ${ri < allTierNames.length - 1 ? 'border-b border-slate-100' : ''}`}
              style={{ gridTemplateColumns: gridCols }}
            >
              {/* Row label */}
              <div className="text-[13px] font-bold text-gray-700 pt-1">{tierName}</div>

              {/* Per-tool pricing cell */}
              {pricingExtras.map((extras, ti) => {
                const tier = extras.pricing_tiers.find((t: { name: string }) => t.name === tierName);
                if (!tier) {
                  return (
                    <div key={tools[ti].id} className="flex items-center gap-1.5 text-slate-300">
                      <Minus className="w-3.5 h-3.5" />
                      <span className="text-xs text-slate-300">Not available</span>
                    </div>
                  );
                }
                return (
                  <div key={tools[ti].id} className="flex flex-col gap-1.5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-slate-900 tracking-tight">{tier.price}</span>
                      {tier.period && <span className="text-[11px] text-slate-400 font-medium">{tier.period}</span>}
                      {tier.highlighted && (
                        <span className="text-[10px] font-bold px-1.5 py-px rounded-full bg-amber-50 text-amber-700 border border-amber-200 ml-1">Popular</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{tier.description}</p>
                    {tier.features && tier.features.length > 0 && (
                      <ul className="mt-1 flex flex-col gap-0.5">
                        {tier.features.slice(0, 4).map((f: string, fi: number) => (
                          <li key={fi} className="flex items-start gap-1.5 text-[11px] text-gray-700">
                            <CheckCircle2 className="w-[11px] h-[11px] text-green-500 flex-shrink-0 mt-px" />
                            {f}
                          </li>
                        ))}
                        {tier.features.length > 4 && (
                          <li className="text-[11px] text-slate-400">+{tier.features.length - 4} more features</li>
                        )}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Pricing disclaimer */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
            <p className="text-[11px] text-slate-400">Pricing is indicative. Visit each product's website for the latest plans and pricing.</p>
          </div>
        </div>

        {/* ── Bottom CTA ── */}
        <div className="bg-slate-900 rounded-2xl px-8 py-7 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-base font-extrabold text-slate-100 mb-1">Ready to decide?</p>
            <p className="text-[13px] text-slate-500">Visit each stack's page to read full reviews and make your choice.</p>
          </div>
          <div className="flex gap-2.5 flex-wrap items-center">
            {/* Share button in CTA row */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] bg-white/[0.08] text-slate-300 font-bold text-[13px] border border-white/10 hover:bg-amber-500/15 hover:border-amber-500/30 hover:text-amber-500 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
            {tools.map((tool, i) => (
              <a
                key={tool.id}
                href={tool.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] font-bold text-[13px] transition-all ${
                  i === 0
                    ? 'bg-amber-500 text-slate-900 hover:bg-amber-400'
                    : 'bg-white/[0.08] text-slate-300 border border-white/10 hover:bg-white/[0.12]'
                }`}
              >
                Visit {tool.name} <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
