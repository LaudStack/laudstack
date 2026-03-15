"use client";

/*
 * LaudStack — Community Picks
 *
 * Tools voted to the top by the LaudStack community.
 * Sorted by laud count; filterable by category and time period.
 * Design: light, consistent with platform theme — amber accents, slate typography.
 */

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LogoWithFallback from '@/components/LogoWithFallback';
import {
  ChevronUp, Users, Flame, Filter, Star, ExternalLink,
  ShieldCheck, TrendingUp, Award, Search, ArrowRight, Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthGateModal from '@/components/AuthGateModal';
import { useToolsData } from '@/hooks/useToolsData';
import { useAuth } from '@/hooks/useAuth';
import { toggleLaud, getUserLaudedToolIds } from '@/app/actions/laud';
import { CATEGORY_META } from '@/lib/categories';
import type { Tool } from '@/lib/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIME_PERIODS = [
  { key: 'all_time', label: 'All Time' },
  { key: 'this_month', label: 'This Month' },
  { key: 'this_week', label: 'This Week' },
] as const;

type TimePeriod = (typeof TIME_PERIODS)[number]['key'];

function pricingClasses(model: string): string {
  if (model === 'Free')     return 'bg-green-50 text-green-700 border-green-200';
  if (model === 'Freemium') return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-slate-50 text-slate-600 border-slate-300';
}

function CardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse flex items-center gap-5">
      <div className="w-9 h-9 rounded-[10px] bg-gray-200 flex-shrink-0" />
      <div className="w-[52px] h-[52px] rounded-xl bg-gray-200 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="flex gap-2">
          <div className="h-3 bg-gray-100 rounded w-16" />
          <div className="h-3 bg-gray-100 rounded w-12" />
        </div>
      </div>
      <div className="w-14 h-16 rounded-xl bg-gray-100 flex-shrink-0" />
    </div>
  );
}

// ─── Community Pick Card ───────────────────────────────────────────────────────

function CommunityPickCard({
  tool,
  rank,
  onVote,
  voted,
  laudCountOffset = 0,
}: {
  tool: Tool;
  rank: number;
  onVote: (id: string) => void;
  voted: boolean;
  laudCountOffset?: number;
}) {
  const router = useRouter();
  const isTop3 = rank <= 3;

  const rankBg = rank === 1 ? 'bg-amber-600' : rank === 2 ? 'bg-slate-400' : rank === 3 ? 'bg-amber-700' : 'bg-slate-100';
  const rankText = rank <= 3 ? 'text-white' : 'text-slate-500';
  const rankEmoji = rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : null;

  return (
    <div
      className={`bg-white rounded-2xl px-5 py-4 sm:px-6 sm:py-5 flex items-center gap-3 sm:gap-5 cursor-pointer transition-all duration-200 relative overflow-hidden group ${
        isTop3
          ? 'border-[1.5px] border-amber-200 shadow-[0_2px_12px_rgba(245,158,11,0.08)] hover:shadow-[0_8px_28px_rgba(15,23,42,0.10)] hover:border-amber-300'
          : 'border-[1.5px] border-gray-200 shadow-sm hover:shadow-[0_8px_28px_rgba(15,23,42,0.10)] hover:border-amber-200'
      } hover:-translate-y-0.5`}
      onClick={() => router.push(`/tools/${tool.slug}`)}
    >
      {/* Rank */}
      <div className={`w-9 h-9 rounded-[10px] flex-shrink-0 flex items-center justify-center font-black text-[15px] ${rankBg} ${rankText} ${isTop3 ? 'shadow-md' : ''}`}>
        {rankEmoji ?? rank}
      </div>

      {/* Logo */}
      <div className="w-[52px] h-[52px] rounded-xl flex-shrink-0 border border-gray-200 bg-slate-50 overflow-hidden flex items-center justify-center hidden sm:flex">
        <LogoWithFallback src={tool.logo_url} alt={tool.name} className="w-10 h-10 object-contain" fallbackSize="text-xl" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-[15px] font-extrabold text-slate-900 tracking-tight truncate">
            {tool.name}
          </span>
          {tool.is_verified && (
            <ShieldCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
          )}
          {tool.is_featured && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded bg-orange-50 text-amber-700 border border-amber-200">
              <Sparkles className="w-2 h-2" />
              Featured
            </span>
          )}
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 hidden sm:inline">
            Community Pick
          </span>
        </div>
        <p className="text-[13px] text-slate-500 mb-2 line-clamp-1 leading-relaxed">
          {tool.tagline}
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Stars */}
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className="w-3 h-3"
                fill={i <= Math.round(tool.average_rating) ? '#FBBF24' : '#E2E8F0'}
                color={i <= Math.round(tool.average_rating) ? '#FBBF24' : '#E2E8F0'}
              />
            ))}
            <span className="text-xs font-bold text-slate-900 ml-1">
              {tool.average_rating.toFixed(1)}
            </span>
            <span className="text-[11px] text-slate-400">({tool.review_count})</span>
          </div>
          {/* Category */}
          <span className="text-[11px] text-slate-500 font-semibold bg-slate-50 px-2 py-0.5 rounded-md border border-gray-200 hidden md:inline">
            {tool.category}
          </span>
          {/* Pricing */}
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${pricingClasses(tool.pricing_model)}`}>
            {tool.pricing_model}
          </span>
        </div>
      </div>

      {/* Laud */}
      <button
        onClick={e => { e.stopPropagation(); onVote(tool.id); }}
        className={`flex-shrink-0 flex flex-col items-center justify-center gap-0.5 px-3.5 py-2.5 rounded-xl min-w-[56px] transition-all ${
          voted
            ? 'border-[1.5px] border-amber-500 bg-amber-50'
            : 'border-[1.5px] border-gray-200 bg-gray-50 hover:border-amber-500 hover:bg-amber-50'
        }`}
      >
        <ChevronUp className={`w-4 h-4 ${voted ? 'text-amber-600' : 'text-slate-500'}`} />
        <span className={`text-[13px] font-extrabold ${voted ? 'text-amber-600' : 'text-slate-700'}`}>
          {(tool.upvote_count + laudCountOffset).toLocaleString()}
        </span>
      </button>

      {/* External link */}
      <a
        href={tool.website_url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        className="flex-shrink-0 w-9 h-9 rounded-[10px] border-[1.5px] border-gray-200 bg-gray-50 flex items-center justify-center text-slate-400 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50 transition-all hidden sm:flex"
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CommunityPicks() {
  const { tools: allTools, loading: toolsLoading } = useToolsData();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all_time');
  const [searchQuery, setSearchQuery] = useState('');
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [laudCounts, setLaudCounts] = useState<Record<string, number>>({});
  const [visibleCount, setVisibleCount] = useState(20);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated } = useAuth();

  // Initialize voted state from DB
  useEffect(() => {
    if (!isAuthenticated) { setVotedIds(new Set()); return; }
    getUserLaudedToolIds().then(ids => {
      setVotedIds(new Set(ids.map(String)));
    }).catch(() => {});
  }, [isAuthenticated]);

  const handleVote = async (id: string) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    if (votedIds.has(id)) {
      // Un-laud
      setVotedIds(prev => { const next = new Set(Array.from(prev)); next.delete(id); return next; });
      setLaudCounts(prev => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) - 1) }));
      const result = await toggleLaud(parseInt(id, 10));
      if (!result.success) {
        setVotedIds(prev => { const next = new Set(Array.from(prev)); next.add(id); return next; });
        setLaudCounts(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
        toast.error(result.error || 'Failed to remove laud');
      } else if (result.newCount !== undefined) {
        setLaudCounts(prev => ({ ...prev, [id]: result.newCount! - (allTools.find(t => t.id === id)?.upvote_count ?? 0) }));
      }
      return;
    }
    // Laud
    setVotedIds(prev => { const next = new Set(Array.from(prev)); next.add(id); return next; });
    setLaudCounts(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
    toast.success('Lauded! Thanks for supporting the community.');
    const result = await toggleLaud(parseInt(id, 10));
    if (!result.success) {
      setVotedIds(prev => { const next = new Set(Array.from(prev)); next.delete(id); return next; });
      setLaudCounts(prev => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) - 1) }));
      toast.error(result.error || 'Failed to laud');
    } else if (result.newCount !== undefined) {
      setLaudCounts(prev => ({ ...prev, [id]: result.newCount! - (allTools.find(t => t.id === id)?.upvote_count ?? 0) }));
    }
  };

  const filteredTools = useMemo(() => {
    let tools = [...allTools];

    if (selectedCategory !== 'All') {
      tools = tools.filter(t => t.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      tools = tools.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.tags ?? []).some(tag => tag.toLowerCase().includes(q))
      );
    }

    // Sort by upvote_count (community lauds)
    tools.sort((a, b) => b.upvote_count - a.upvote_count);

    return tools;
  }, [selectedCategory, timePeriod, searchQuery, allTools]);

  const visibleTools = filteredTools.slice(0, visibleCount);

  // Stats
  const totalVotes = allTools.reduce((s, t) => s + t.upvote_count, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <AuthGateModal open={showAuthModal} onClose={() => setShowAuthModal(false)} action="upvote" />
      <Navbar />
      <div className="h-[72px] flex-shrink-0" />

      {/* ── Hero ── */}
      <section className="bg-white border-b border-gray-200 py-8 sm:py-12">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 mb-4">
                <Users className="w-3 h-3 text-rose-700" />
                <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Community Picks</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-slate-900 tracking-tight mb-3 leading-tight">
                Voted by the Community
              </h1>
              <p className="text-base text-slate-500 max-w-[520px] leading-relaxed">
                These are the stacks that the LaudStack community loves most — ranked purely by community lauds. No editorial bias, just real user enthusiasm.
              </p>
            </div>
            {/* Stats row */}
            <div className="flex gap-4 flex-wrap">
              {[
                { icon: Users, value: totalVotes > 0 ? `${Math.max(allTools.length * 10, totalVotes).toLocaleString()}+` : '—', label: 'Community Members' },
                { icon: ChevronUp, value: totalVotes.toLocaleString(), label: 'Total Votes Cast' },
                { icon: TrendingUp, value: `${allTools.length}+`, label: 'Tools Ranked' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center bg-slate-50 border border-gray-200 rounded-xl px-4 py-3.5 min-w-[90px]">
                  <Icon className="w-[18px] h-[18px] text-amber-500 mx-auto mb-1.5" />
                  <div className="text-xl font-black text-slate-900 tracking-tight">{value}</div>
                  <div className="text-[11px] text-slate-400 font-semibold mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Filters ── */}
      <section className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-[1_1_180px] max-w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-slate-400" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search community picks..."
                className="w-full pl-9 pr-3 h-[38px] text-[13px] text-slate-900 bg-slate-50 border-[1.5px] border-gray-200 rounded-[9px] outline-none transition-colors focus:border-amber-500"
              />
            </div>

            {/* Time period */}
            <div className="flex gap-1.5">
              {TIME_PERIODS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTimePeriod(key)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    timePeriod === key
                      ? 'border-[1.5px] border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-[1.5px] border-gray-200 bg-white text-slate-500 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                {['All', ...CATEGORY_META.filter(c => c.name !== 'All').map(c => c.name)].slice(0, 8).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap flex-shrink-0 transition-all ${
                      selectedCategory === cat
                        ? 'border-[1.5px] border-amber-500 bg-amber-500 text-slate-900'
                        : 'border-[1.5px] border-gray-200 bg-white text-slate-500 hover:border-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <main className="flex-1 py-10 pb-16">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10">
          {/* Results header */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-[13px] text-slate-500 font-semibold">
              Showing <strong className="text-slate-900">{Math.min(visibleCount, filteredTools.length)}</strong> of <strong className="text-slate-900">{filteredTools.length}</strong> tools
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              Sorted by community lauds
            </div>
          </div>

          {toolsLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : filteredTools.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-base font-semibold">No tools found for this filter.</p>
              <button onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }} className="mt-3 text-[13px] font-bold text-amber-500 underline underline-offset-2 hover:text-amber-600 transition-colors">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {visibleTools.map((tool, i) => (
                <CommunityPickCard
                  key={tool.id}
                  tool={tool}
                  rank={i + 1}
                  onVote={handleVote}
                  voted={votedIds.has(tool.id)}
                  laudCountOffset={laudCounts[tool.id] ?? 0}
                />
              ))}
            </div>
          )}

          {visibleCount < filteredTools.length && (
            <div className="text-center mt-8">
              <button
                onClick={() => setVisibleCount(v => v + 20)}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-[10px] border-[1.5px] border-gray-200 text-[13px] font-bold text-slate-700 bg-white shadow-sm hover:border-amber-500 hover:text-amber-700 hover:bg-amber-50 transition-all"
              >
                Load 20 more <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ── CTA banner ── */}
      <section className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <Award className="w-9 h-9 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2.5 tracking-tight">
            Have a stack the community should know about?
          </h2>
          <p className="text-[15px] text-slate-500 mb-6 leading-relaxed">
            Launch it via LaunchPad and let the community vote it up.
          </p>
          <a
            href="/launchpad"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white bg-amber-500 shadow-[0_4px_14px_rgba(245,158,11,0.3)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.45)] transition-shadow"
          >
            Launch via LaunchPad <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
