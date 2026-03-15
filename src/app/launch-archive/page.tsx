"use client";

/**
 * /launch-archive — LaudStack Launch Archive
 *
 * Browse all past stack launches organized by month.
 * Timeline view with month-by-month grouping, search, and category filters.
 * Data comes from useToolsData() → /api/homepage → Supabase.
 *
 * Design: light, consistent with platform theme — amber accents, slate typography.
 */

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Archive, Search, Star, ShieldCheck, ChevronUp,
  Calendar, Filter, ChevronDown,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import LogoWithFallback from '@/components/LogoWithFallback';
import { useToolsData } from '@/hooks/useToolsData';
import { CATEGORY_META } from '@/lib/categories';
import type { Tool } from '@/lib/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(key: string): string {
  const [year, month] = key.split('-');
  return `${MONTH_NAMES[parseInt(month) - 1]} ${year}`;
}

function pricingCls(model: string): string {
  if (model === 'Free')        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (model === 'Freemium')    return 'bg-blue-50 text-blue-700 border-blue-200';
  if (model === 'Open Source') return 'bg-violet-50 text-violet-700 border-violet-200';
  return 'bg-slate-50 text-slate-600 border-slate-300';
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function MonthGroupSkeleton() {
  return (
    <div className="bg-white border-[1.5px] border-slate-200 rounded-2xl overflow-hidden">
      <div className="p-4 sm:px-6 flex items-center gap-3">
        <div className="animate-pulse w-4 h-4 rounded bg-slate-100" />
        <div className="animate-pulse w-36 h-4.5 rounded-md bg-slate-100 flex-1" />
        <div className="animate-pulse w-18 h-5.5 rounded-md bg-amber-50" />
      </div>
      <div className="px-4 sm:px-5 pb-5 flex flex-col gap-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3.5 p-4 bg-slate-50/60 rounded-xl">
            <div className="animate-pulse w-11 h-11 rounded-lg bg-slate-100 shrink-0 hidden sm:block" />
            <div className="animate-pulse w-11 h-11 rounded-lg bg-slate-100 shrink-0" />
            <div className="flex-1">
              <div className="animate-pulse w-1/2 h-3.5 rounded bg-slate-100 mb-1.5" />
              <div className="animate-pulse w-4/5 h-2.5 rounded bg-slate-50" />
            </div>
            <div className="animate-pulse w-10 h-10 rounded-lg bg-slate-50 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Launch Card ──────────────────────────────────────────────────────────────
function LaunchCard({ tool }: { tool: Tool }) {
  const router = useRouter();
  const launchDate = new Date(tool.launched_at);

  return (
    <div
      onClick={() => router.push(`/tools/${tool.slug}`)}
      className="bg-white border-[1.5px] border-slate-200 rounded-xl px-4 sm:px-5 py-4 cursor-pointer transition-all duration-150 flex items-center gap-3 sm:gap-3.5 shadow-[0_1px_4px_rgba(15,23,42,0.04)] hover:shadow-lg hover:border-amber-200 hover:-translate-y-px"
    >
      {/* Date badge */}
      <div className="hidden sm:flex w-11 h-11 rounded-lg shrink-0 bg-amber-50 border border-amber-200 flex-col items-center justify-center">
        <span className="text-[9px] font-bold text-amber-600 uppercase leading-none">
          {launchDate.toLocaleDateString('en-US', { month: 'short' })}
        </span>
        <span className="text-base font-black text-amber-700 leading-tight">
          {launchDate.getDate()}
        </span>
      </div>

      {/* Logo */}
      <LogoWithFallback
        src={tool.logo_url}
        fallbackSrc={`https://www.google.com/s2/favicons?domain=${tool.website_url}&sz=64`}
        alt={tool.name}
        size={44}
        className="rounded-lg border border-slate-100 shrink-0"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[15px] font-extrabold text-slate-900">{tool.name}</span>
          {tool.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
          <span className={`hidden sm:inline text-[10px] font-bold px-1.5 py-px rounded border leading-snug ${pricingCls(tool.pricing_model)}`}>
            {tool.pricing_model}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-1">
          {tool.tagline}
        </p>
      </div>

      {/* Rating + lauds */}
      <div className="flex items-center gap-3 sm:gap-3.5 shrink-0">
        {tool.average_rating > 0 && (
          <div className="hidden sm:flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-slate-900">{tool.average_rating.toFixed(1)}</span>
          </div>
        )}
        <div className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-extrabold text-slate-500">{tool.upvote_count || 0}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LaunchArchivePage() {
  const { tools: allTools, loading } = useToolsData();
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  // Group stacks by launch month
  const monthGroups = useMemo(() => {
    let filtered = category === 'All' ? allTools : allTools.filter(t => t.category === category);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t => t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q) || (t.tags ?? []).some(tag => tag.toLowerCase().includes(q)));
    }

    const sorted = [...filtered].sort((a, b) => new Date(b.launched_at).getTime() - new Date(a.launched_at).getTime());

    const groups: { key: string; label: string; tools: Tool[] }[] = [];
    const map = new Map<string, Tool[]>();

    for (const tool of sorted) {
      const key = getMonthKey(new Date(tool.launched_at));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(tool);
    }

    for (const [key, tools] of map) {
      groups.push({ key, label: getMonthLabel(key), tools });
    }

    return groups;
  }, [allTools, category, searchQuery]);

  // Auto-expand first 3 months
  const visibleMonths = useMemo(() => {
    const autoExpand = new Set(monthGroups.slice(0, 3).map(g => g.key));
    return new Set([...autoExpand, ...expandedMonths]);
  }, [monthGroups, expandedMonths]);

  const toggleMonth = (key: string) => {
    setExpandedMonths(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const categories = CATEGORY_META.filter(c => c.name !== 'All');
  const totalLaunches = monthGroups.reduce((s, g) => s + g.tools.length, 0);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <PageHero
        eyebrow="LAUNCH ARCHIVE"
        title="Stack Launch Archive"
        subtitle="Browse every stack that has launched on LaudStack, organized by month. Discover the full history of SaaS and AI innovation."
        accent="amber"
        layout="default"
        size="md"
      />

      <main className="flex-1">
        {/* ── Search + Filters ── */}
        <section className="bg-white py-6 border-b border-slate-100 sticky top-16 z-10">
          <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="flex items-center flex-1 min-w-[200px] bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                <Search className="ml-3 w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search launches..."
                  className="flex-1 px-3 py-2.5 text-sm text-slate-900 bg-transparent border-none outline-none placeholder:text-slate-400"
                />
              </div>

              {/* Category filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="px-3 py-2.5 rounded-lg text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 cursor-pointer outline-none"
                >
                  <option value="All">All Categories</option>
                  {categories.map(c => (
                    <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>

              {/* Results count */}
              <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                <span className="text-slate-900 font-extrabold">{totalLaunches}</span> stacks across{' '}
                <span className="text-slate-900 font-extrabold">{monthGroups.length}</span> months
              </span>
            </div>
          </div>
        </section>

        {/* ── Timeline ── */}
        <section className="py-8 pb-14">
          <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map(i => <MonthGroupSkeleton key={i} />)}
              </div>
            ) : monthGroups.length > 0 ? (
              <div className="flex flex-col gap-4">
                {monthGroups.map(group => {
                  const isExpanded = visibleMonths.has(group.key);
                  return (
                    <div key={group.key} className="bg-white border-[1.5px] border-slate-200 rounded-2xl overflow-hidden">
                      {/* Month header */}
                      <button
                        onClick={() => toggleMonth(group.key)}
                        className="w-full flex items-center gap-3 px-4 sm:px-6 py-4 bg-transparent border-none cursor-pointer transition-colors hover:bg-slate-50/60"
                      >
                        <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="text-base sm:text-lg font-black text-slate-900 flex-1 text-left">
                          {group.label}
                        </span>
                        <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                          {group.tools.length} {group.tools.length === 1 ? 'launch' : 'launches'}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Tools in this month */}
                      {isExpanded && (
                        <div className="px-4 sm:px-5 pb-5 flex flex-col gap-2">
                          {group.tools.map(tool => (
                            <LaunchCard key={tool.slug} tool={tool} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 px-5 bg-white rounded-2xl border border-slate-200">
                <Archive className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-extrabold text-slate-700 mb-1.5">No launches found</h3>
                <p className="text-sm text-slate-500">Try a different search or category.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
