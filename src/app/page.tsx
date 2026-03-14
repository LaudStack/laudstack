"use client";

/*
 * LaudStack Homepage — Redesigned
 *
 * Sections:
 *  1. HERO             — Value prop + search + social proof
 *  2. RECENTLY VIEWED  — Personalized (auth only)
 *  3. BROWSE + SIDEBAR — Full catalog + leaderboard
 *  4. TRENDING         — Editorial picks with screenshots
 *  5. FRESH LAUNCHES   — PH-style numbered list
 *  6. EVERYTHING IN ONE PLACE — Discover · Review · Launch
 */

import { useState } from 'react';
import {
  Search, Rocket, Star, BarChart3, Shield, ArrowRight,
  TrendingUp, Users, ChevronUp, Trophy,
  CheckCircle2, Award, MessageSquare, Flame,
  Sparkles, Eye, Filter, Globe,
  Clock, ExternalLink, ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import ToolCard from '@/components/ToolCard';
import { useRouter } from 'next/navigation';
import { CATEGORY_META } from '@/lib/categories';
import { useToolsData } from '@/hooks/useToolsData';
import { useAuth } from '@/hooks/useAuth';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

// ─── Static data ───────────────────────────────────────────────────────────
const POPULAR_SEARCHES = ['Product Launches', 'AI Writing', 'SaaS Deals', 'Code Templates', 'Design Tools', 'Analytics'];

const FIVE_PILLARS = [
  {
    icon: Rocket,
    accent: '#DC2626', accentBg: '#FFF1F2', accentBorder: '#FECDD3',
    label: 'Launch',
    headline: 'Launch your product to thousands',
    body: 'Launch via LaunchPad, get community votes, and build momentum with real user feedback from day one.',
    cta: 'Go to LaunchPad',
  },
  {
    icon: Search,
    accent: '#2563EB', accentBg: '#EFF6FF', accentBorder: '#BFDBFE',
    label: 'Discover',
    headline: 'Find the right product, fast',
    body: 'Browse SaaS and AI stacks across 20 categories. Filter by pricing, rating, and use case. No noise — just what matters.',
    cta: 'Browse Products',
  },
  {
    icon: Star,
    accent: '#D97706', accentBg: '#FFFBEB', accentBorder: '#FDE68A',
    label: 'Review',
    headline: 'Trust built on real evidence',
    body: 'Verified reviews, star breakdowns, written feedback, and founder replies give you the full picture before you commit.',
    cta: 'Read Reviews',
  },
];

// ─── Reusable section header ───────────────────────────────────────────────
function SectionHeader({
  headline, subtext, cta, ctaColor, onCta,
  // Keep these in the interface for backward compat but don't render pill
  label: _label, labelIcon: _LabelIcon, labelColor: _labelColor, labelBg: _labelBg, labelBorder: _labelBorder,
}: {
  label?: string; labelIcon?: React.ElementType; labelColor?: string; labelBg?: string; labelBorder?: string;
  headline: string; subtext: string; cta?: string; ctaColor?: string; onCta?: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 lg:mb-12 gap-4 sm:gap-5">
      <div>
        <h2 className="text-xl sm:text-2xl lg:text-[28px] font-extrabold text-gray-900 tracking-tight leading-tight mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
          {headline}
        </h2>
        {subtext && <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed max-w-xl">{subtext}</p>}
      </div>
      {cta && onCta && (
        <button
          onClick={onCta}
          className="flex items-center gap-2 text-sm font-bold bg-transparent border-none cursor-pointer p-0 whitespace-nowrap transition-opacity hover:opacity-75"
          style={{ color: ctaColor || '#D97706' }}
        >
          {cta} <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function Home() {
  const { tools: allTools, reviews: allReviews, leaderboard: apiLeaderboard, loading: toolsLoading } = useToolsData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPricing, setSelectedPricing] = useState<string>('All');
  const [browseSort, setBrowseSort] = useState<'top_rated' | 'trending' | 'newest' | 'most_reviewed' | 'most_lauded' | 'featured_first'>('top_rated');
  const [browseVisible, setBrowseVisible] = useState(20);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const router = useRouter();


  const { isAuthenticated } = useAuth();
  const { slugs: recentSlugs } = useRecentlyViewed();
  const recentTools = recentSlugs
    .map(s => allTools.find(t => t.slug === s))
    .filter(Boolean) as typeof allTools;
  const go = () => router.push('/launchpad');
  const goToTool = (slug: string) => router.push(`/tools/${slug}`);
  const handleSearch = () => {
    const q = searchQuery.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
    else router.push('/search');
  };

  const filteredBase = selectedCategory === 'All'
    ? allTools
    : allTools.filter(t => t.category === selectedCategory);

  const allToolsSorted = (() => {
    let base = selectedPricing === 'All' ? filteredBase : filteredBase.filter(t => t.pricing_model === selectedPricing);
    if (featuredOnly) base = base.filter(t => t.is_featured);
    const copy = [...base];
    if (browseSort === 'top_rated')     copy.sort((a, b) => b.average_rating - a.average_rating);
    if (browseSort === 'trending')      copy.sort((a, b) => (b.weekly_rank_change ?? 0) - (a.weekly_rank_change ?? 0));
    if (browseSort === 'newest')        copy.sort((a, b) => new Date(b.launched_at).getTime() - new Date(a.launched_at).getTime());
    if (browseSort === 'most_reviewed') copy.sort((a, b) => b.review_count - a.review_count);
    if (browseSort === 'most_lauded')    copy.sort((a, b) => (b.upvote_count ?? 0) - (a.upvote_count ?? 0));
    if (browseSort === 'featured_first') copy.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    return copy;
  })();
  const visibleTools = allToolsSorted.slice(0, browseVisible);

  // Featured: editorial picks (is_featured = true)
  const featuredTools = allTools.filter(t => t.is_featured).slice(0, 4);

  // Trending: top 6 tools with the biggest weekly_rank_change
  const trendingTools = [...(selectedCategory === 'All' ? allTools : filteredBase)]
    .filter(t => (t.weekly_rank_change ?? 0) > 0)
    .sort((a, b) => (b.weekly_rank_change ?? 0) - (a.weekly_rank_change ?? 0))
    .slice(0, 6);

  // Fresh Launches: newest tools
  const newLaunches = [...filteredBase]
    .sort((a, b) => new Date(b.launched_at).getTime() - new Date(a.launched_at).getTime())
    .slice(0, 6);

  const leaderboard = apiLeaderboard.length > 0
    ? apiLeaderboard.slice(0, 5)
    : [...allTools]
        .sort((a, b) => (b.rank_score ?? 0) - (a.rank_score ?? 0))
        .slice(0, 5)
        .map((t) => ({
          tool_id: t.id,
          name: t.name,
          slug: t.slug,
          logo_url: t.logo_url,
          average_rating: t.average_rating,
          review_count: t.review_count,
          upvote_count: t.upvote_count,
          weekly_rank_change: t.weekly_rank_change,
          rank_score: t.rank_score ?? 0,
        }));

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="h-16 sm:h-[72px] shrink-0" />


      {/* ══════════════════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════════════════ */}
      <section
        className="relative px-4 sm:px-6 lg:px-10 py-10 sm:py-12 lg:py-0"
        style={{
          background: '#F8FAFC',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: 'min(100vh - 64px, 800px)',
          borderBottom: '1px solid #FFFFFF',
        }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-30" style={{ backgroundImage: 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute pointer-events-none" style={{ top: '35%', left: '50%', transform: 'translate(-50%, -50%)', width: 800, height: 600, background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.07) 0%, transparent 65%)' }} />

        <div className="w-full max-w-[760px] flex flex-col items-center text-center relative z-10">


          <h1
            className="text-[28px] sm:text-[36px] md:text-[44px] lg:text-[54px]"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900, lineHeight: 1.12, letterSpacing: '-0.03em', color: '#171717', margin: 0 }}
          >
            Launch, Discover &amp; Review{' '}<span style={{ color: '#F59E0B' }}>SaaS &amp; AI Tools.</span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg mt-4 text-gray-500 leading-relaxed max-w-[620px] px-2">
            Where founders launch Stacks, the community gives Laud, and builders discover tools, deals, and templates.
          </p>

          {/* Search bar */}
          <div className="mt-6 sm:mt-10 w-full max-w-[680px]">
            <div className="flex items-center rounded-xl sm:rounded-2xl overflow-hidden bg-white shadow-lg border-[1.5px] border-gray-200">
              <div className="relative flex-1">
                <Search className="absolute left-3 sm:left-[18px] top-1/2 -translate-y-1/2 h-4 w-4 sm:h-[18px] sm:w-[18px] text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Search SaaS & AI stacks, deals, templates..."
                  className="w-full pl-10 sm:pl-[50px] pr-3 sm:pr-4 h-12 sm:h-[58px] text-sm sm:text-[15px] text-gray-900 bg-transparent border-none outline-none"
                />
              </div>
              <button
                onClick={handleSearch}
                className="h-12 sm:h-[58px] px-5 sm:px-8 font-bold text-white text-sm shrink-0 transition-opacity hover:opacity-90 cursor-pointer"
                style={{ background: '#F59E0B' }}
              >
                Search
              </button>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 flex-wrap justify-center">
              <span className="text-[11px] sm:text-xs text-gray-400 font-semibold">Popular:</span>
              {POPULAR_SEARCHES.map(term => (
                <button key={term} onClick={() => router.push(`/search?q=${encodeURIComponent(term)}`)}
                  className="text-[11px] sm:text-xs text-gray-600 bg-white border border-gray-200 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 font-semibold transition-all hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                >{term}</button>
              ))}
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-6 sm:mt-10 flex items-center gap-3 sm:gap-5 flex-wrap justify-center">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[11,12,13,14,15].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/32?img=${i}`} alt="" className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white" style={{ marginLeft: i === 11 ? 0 : '-8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
                ))}
              </div>
              <span className="text-xs sm:text-[13px] text-gray-600 font-medium"><strong className="text-gray-900 font-bold">Thousands</strong> of users</span>
            </div>
            <div className="hidden sm:block w-px h-5 bg-gray-200" />
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />)}
              <span className="text-xs sm:text-[13px] text-gray-600 ml-1 font-medium"><strong className="text-gray-900 font-bold">4.9</strong> avg</span>
            </div>
            <div className="hidden sm:block w-px h-5 bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
              <span className="text-xs sm:text-[13px] text-gray-600 font-medium"><strong className="text-gray-900 font-bold">500+</strong> stacks launched</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 leading-[0] z-[2]">
          <svg viewBox="0 0 1440 56" fill="none" className="block w-full" preserveAspectRatio="none">
            <path d="M0,56 C360,0 1080,0 1440,56 L1440,56 L0,56 Z" fill="#ffffff"/>
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          1b. RECENTLY VIEWED
      ══════════════════════════════════════════════════════ */}
      {isAuthenticated && recentTools.length > 0 && (
        <section className="bg-white border-b border-gray-100 py-8 sm:py-10 lg:py-12">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-gray-900 font-extrabold text-lg tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Pick Up Where You Left Off
                  </h2>
                  <p className="text-gray-500 text-xs font-medium mt-0.5">
                    {recentTools.length} tool{recentTools.length !== 1 ? 's' : ''} you recently explored
                  </p>
                </div>
              </div>
              <Link href="/tools" className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-2 rounded-xl transition-all">
                Browse All Stacks <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 lg:grid lg:overflow-visible" style={{ gridTemplateColumns: `repeat(${Math.min(recentTools.length, 4)}, 1fr)`, scrollbarWidth: 'none' }}>
              {recentTools.slice(0, 8).map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="group shrink-0 w-[220px] sm:w-[260px] lg:w-auto bg-white border border-gray-200 rounded-2xl p-3 sm:p-4 hover:border-amber-300 hover:shadow-md transition-all duration-200 flex flex-col no-underline"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
                      {tool.logo_url ? (
                        <img src={tool.logo_url} alt={tool.name} className="w-full h-full object-contain"
                          onError={e => { e.currentTarget.style.display = 'none'; const p = e.currentTarget.parentElement; if (p) { p.innerHTML = `<span style="font-size:16px;font-weight:800;color:#64748B">${tool.name.charAt(0)}</span>`; } }}
                        />
                      ) : (
                        <span className="text-base font-extrabold text-gray-600">{tool.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-gray-900 font-bold text-sm group-hover:text-amber-600 transition-colors truncate">{tool.name}</h3>
                      <span className="text-xs text-gray-400 font-medium">{tool.category}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-amber-500 transition-colors shrink-0" />
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3 flex-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{tool.tagline}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-3 h-3 ${s <= Math.round(tool.average_rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-gray-700 tabular-nums">{tool.average_rating.toFixed(1)}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">{tool.pricing_model}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          4. TRENDING THIS WEEK — Editorial picks with screenshots
      ══════════════════════════════════════════════════════ */}
      {trendingTools.length > 0 && (
        <section className="py-10 sm:py-14 lg:py-16 bg-white border-b border-gray-100">
          <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10">
            {/* Bold container — deeper amber/burnt orange shade */}
            <div
              className="rounded-3xl px-5 sm:px-7 lg:px-9 pt-6 sm:pt-8 pb-6 sm:pb-8"
              style={{ background: '#E3EDE8' }}
            >
              {/* Header row inside the container */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-[28px] font-extrabold text-gray-950 tracking-tight leading-tight mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Rising This Week
                  </h2>
                  <p className="text-sm sm:text-base text-gray-700 font-medium">
                    The most lauded and discussed stacks right now.
                  </p>
                </div>
                <button
                  onClick={() => router.push('/trending')}
                  className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all hover:opacity-90"
                  style={{ background: '#F59E0B', color: '#FFFFFF' }}
                >
                  View All Trending <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Cards row — horizontal scroll */}
              <div
                className="flex gap-4 sm:gap-5 overflow-x-auto pb-2 snap-x snap-mandatory"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {trendingTools.map((tool, i) => (
                  <div key={tool.id} className="shrink-0 snap-start" style={{ width: 'clamp(260px, 25vw, 300px)' }}>
                    <ToolCard tool={tool} rank={i + 1} featured />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Rising This Week — hidden until we have enough user activity */}
      {/* ══════════════════════════════════════════════════════
          3. BROWSE BY CATEGORY + SIDEBAR
      ══════════════════════════════════════════════════════ */}
      <section className="py-12 sm:py-16 lg:py-20 border-b border-gray-200" style={{ background: '#F8FAFC' }}>
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10">
          <SectionHeader
            label="Explore by Category"
            labelIcon={Filter}
            labelColor="#F59E0B"
            labelBg="#F1F5F9"
            labelBorder="#E2E8F0"
            headline="Explore SaaS & AI stacks by category"
            subtext=""
            cta="All Categories"
            ctaColor="#D97706"
            onCta={() => router.push('/tools')}
          />

          {/* ── Category + Filter Container (full width, static) ── */}
          <div
            className="border border-gray-200 rounded-xl mb-8"
            style={{
              background: '#EFF3F8',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            }}
          >
            {/* Category Tab Navigation */}
            <div className="border-b border-gray-200 px-4 sm:px-6">
              <div className="flex gap-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                {CATEGORY_META.map(({ name, icon }) => {
                  const count = name === 'All' ? allTools.length : allTools.filter(t => t.category === name).length;
                  const active = selectedCategory === name;
                  return (
                    <button
                      key={name}
                      onClick={() => { setSelectedCategory(name); setBrowseVisible(20); }}
                      className="inline-flex items-center gap-2 px-4 py-3 cursor-pointer text-sm font-semibold transition-all shrink-0 whitespace-nowrap relative"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: active ? '#171717' : '#6B7280',
                        borderBottom: active ? '2.5px solid #F59E0B' : '2.5px solid transparent',
                        marginBottom: '-1px',
                      }}
                    >
                      <span className="text-base leading-none">{icon}</span>
                      <span>{name}</span>
                      <span
                        className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: active ? '#FEF3C7' : '#E5E7EB',
                          color: active ? '#92400E' : '#9CA3AF',
                        }}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-3 px-4 sm:px-6 py-3 sm:py-3.5">
              {/* Pricing filters */}
              <div className="flex items-center gap-1.5 flex-wrap flex-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap mr-1">Pricing</span>
                {([
                  { key: 'All', label: 'All', activeColor: '#374151', activeBg: '#FFFFFF', activeBorder: '#D1D5DB' },
                  { key: 'Free', label: 'Free', activeColor: '#065F46', activeBg: '#ECFDF5', activeBorder: '#6EE7B7' },
                  { key: 'Freemium', label: 'Freemium', activeColor: '#92400E', activeBg: '#FFFBEB', activeBorder: '#FCD34D' },
                  { key: 'Paid', label: 'Paid', activeColor: '#1E3A5F', activeBg: '#EFF6FF', activeBorder: '#93C5FD' },
                  { key: 'Free Trial', label: 'Free Trial', activeColor: '#4C1D95', activeBg: '#F5F3FF', activeBorder: '#C4B5FD' },
                  { key: 'Open Source', label: 'Open Source', activeColor: '#1F2937', activeBg: '#F9FAFB', activeBorder: '#9CA3AF' },
                ] as const).map(({ key, label, activeColor, activeBg, activeBorder }) => {
                  const active = selectedPricing === key;
                  return (
                    <button
                      key={key}
                      onClick={() => { setSelectedPricing(key); setBrowseVisible(20); }}
                      className="px-3 py-1.5 rounded-lg cursor-pointer text-xs font-bold transition-all"
                      style={{
                        border: active ? `1.5px solid ${activeBorder}` : '1.5px solid transparent',
                        background: active ? activeBg : 'transparent',
                        color: active ? activeColor : '#9CA3AF',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="hidden sm:block w-px h-6 bg-gray-300/50 shrink-0" />

              {/* Featured toggle */}
              <button
                onClick={() => { setFeaturedOnly(f => !f); setBrowseVisible(20); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer text-xs font-bold transition-all shrink-0"
                style={{
                  border: featuredOnly ? '1.5px solid #F59E0B' : '1.5px solid transparent',
                  background: featuredOnly ? '#FFF7ED' : 'transparent',
                  color: featuredOnly ? '#B45309' : '#9CA3AF',
                }}
              >
                <Sparkles className="w-3 h-3" /> Featured
              </button>

              <div className="hidden sm:block w-px h-6 bg-gray-300/50 shrink-0" />

              {/* Sort */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Sort</span>
                <select
                  value={browseSort}
                  onChange={e => { setBrowseSort(e.target.value as typeof browseSort); setBrowseVisible(20); }}
                  className="text-xs font-bold text-gray-700 bg-white border-[1.5px] border-gray-200 rounded-lg px-3 py-2 outline-none cursor-pointer appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236B7280\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', paddingRight: 24 }}
                >
                  <option value="top_rated">Top Rated</option>
                  <option value="trending">Trending</option>
                  <option value="newest">Newest</option>
                  <option value="most_reviewed">Most Reviewed</option>
                  <option value="most_lauded">Most Lauded</option>
                  <option value="featured_first">Featured First</option>
                </select>
              </div>

              {/* Active filter chips */}
              {(selectedPricing !== 'All' || featuredOnly) && (
                <>
                  <div className="hidden sm:block w-px h-6 bg-gray-300/50 shrink-0" />
                  <div className="flex items-center gap-1.5 shrink-0">
                    {selectedPricing !== 'All' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {selectedPricing}
                        <button onClick={() => { setSelectedPricing('All'); setBrowseVisible(20); }} className="ml-0.5 text-amber-400 hover:text-amber-600 bg-transparent border-none cursor-pointer text-xs leading-none p-0">×</button>
                      </span>
                    )}
                    {featuredOnly && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Featured
                        <button onClick={() => { setFeaturedOnly(false); setBrowseVisible(20); }} className="ml-0.5 text-amber-400 hover:text-amber-600 bg-transparent border-none cursor-pointer text-xs leading-none p-0">×</button>
                      </span>
                    )}
                    <button onClick={() => { setSelectedPricing('All'); setFeaturedOnly(false); setBrowseVisible(20); }} className="text-[11px] font-bold text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer underline underline-offset-2">Clear all</button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            {/* Tools list (2/3) */}
            <div className="lg:col-span-2">

              {/* Tool cards list */}
              {toolsLoading ? (
                /* Skeleton loading placeholders */
                <div className="flex flex-col gap-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="flex items-center gap-5 p-5 rounded-2xl border border-gray-200 bg-white animate-pulse">
                      <div className="w-16 h-16 rounded-[14px] bg-gray-200 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="h-5 bg-gray-200 rounded w-40 mb-2" />
                        <div className="h-3 bg-gray-100 rounded w-24 mb-3" />
                        <div className="h-3 bg-gray-100 rounded w-full mb-1" />
                        <div className="h-3 bg-gray-100 rounded w-3/4" />
                      </div>
                      <div className="w-14 h-16 rounded-xl bg-gray-100 shrink-0" />
                    </div>
                  ))}
                </div>
              ) : visibleTools.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <Search className="w-7 h-7 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No products found</h3>
                  <p className="text-sm text-gray-500 max-w-sm mb-5 leading-relaxed">
                    {selectedCategory !== 'All' || selectedPricing !== 'All' || featuredOnly
                      ? 'Try adjusting your filters or browsing a different category.'
                      : 'No products have been listed yet. Check back soon!'}
                  </p>
                  {(selectedCategory !== 'All' || selectedPricing !== 'All' || featuredOnly) && (
                    <button
                      onClick={() => { setSelectedCategory('All'); setSelectedPricing('All'); setFeaturedOnly(false); setBrowseVisible(20); }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 cursor-pointer transition-all hover:bg-amber-100"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {visibleTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} hideCategory={selectedCategory !== 'All'} />
                  ))}
                </div>
              )}

              {/* Show more button */}
              {!toolsLoading && visibleTools.length > 0 && browseVisible < allToolsSorted.length && (
                <div className="mt-8 flex flex-col items-center gap-3">
                  {/* Progress bar */}
                  <div className="w-full max-w-xs">
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-300"
                        style={{ width: `${Math.round((browseVisible / allToolsSorted.length) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setBrowseVisible(v => v + 20)}
                    className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl border-[1.5px] border-gray-200 text-sm font-bold text-gray-700 bg-white cursor-pointer transition-all hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50"
                  >
                    Show 20 more <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}


            </div>

            {/* ── Sidebar (1/3) ── */}
            <div className="lg:col-span-1">
              <div className="sticky top-[140px] flex flex-col gap-5">

                {/* Contextual Leaderboard — changes title based on selected category */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                        <Trophy className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider leading-none">This Week</p>
                        <h3 className="text-[13px] font-extrabold text-gray-900 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {selectedCategory === 'All' ? 'Top Ranked Stacks' : `Top in ${selectedCategory}`}
                        </h3>
                      </div>
                    </div>
                    <button onClick={() => router.push('/trending')} className="text-[11px] font-bold text-amber-600 bg-transparent border-none cursor-pointer transition-opacity hover:opacity-70">Full Board →</button>
                  </div>
                  <div>
                    {(() => {
                      const contextualLeaderboard = selectedCategory === 'All'
                        ? leaderboard
                        : [...allTools]
                            .filter(t => t.category === selectedCategory)
                            .sort((a, b) => (b.rank_score ?? 0) - (a.rank_score ?? 0))
                            .slice(0, 5)
                            .map((t) => ({
                              tool_id: t.id,
                              name: t.name,
                              slug: t.slug,
                              logo_url: t.logo_url,
                              average_rating: t.average_rating,
                              review_count: t.review_count,
                              upvote_count: t.upvote_count,
                              weekly_rank_change: t.weekly_rank_change,
                              rank_score: t.rank_score ?? 0,
                            }));
                      return contextualLeaderboard.length === 0 ? (
                        <div className="py-8 px-4 text-center">
                          <p className="text-xs text-gray-400">No products ranked in this category yet</p>
                        </div>
                      ) : contextualLeaderboard.map((entry, idx) => {
                        const rank = idx + 1;
                        const rankChange = entry.weekly_rank_change ?? 0;
                        return (
                          <div
                            key={entry.tool_id}
                            onClick={() => goToTool(entry.slug)}
                            className="flex items-center gap-2.5 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50"
                            style={{ borderBottom: idx < contextualLeaderboard.length - 1 ? '1px solid #F3F4F6' : 'none' }}
                          >
                            <div className="w-[22px] text-center shrink-0">
                              {rank <= 3
                                ? <span className="text-[15px]">{['🥇','🥈','🥉'][rank-1]}</span>
                                : <span className="text-xs font-extrabold text-gray-400">{rank}</span>
                              }
                            </div>
                            <div className="w-[34px] h-[34px] rounded-[10px] overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                              <img src={entry.logo_url} alt={entry.name} className="w-full h-full object-cover"
                                onError={e => { e.currentTarget.style.display='none'; const p = e.currentTarget.parentElement; if(p){ p.style.display='flex'; p.style.alignItems='center'; p.style.justifyContent='center'; p.innerHTML=`<span style="font-size:16px;font-weight:800;color:#64748B">${entry.name.charAt(0)}</span>`; } }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-bold text-gray-900 truncate">{entry.name}</p>
                              <p className="text-[11px] text-gray-400 font-medium mt-0.5 truncate">{entry.average_rating.toFixed(1)}★ · {entry.review_count} reviews</p>
                            </div>
                            <div className="flex flex-col items-end shrink-0">
                              <div className="flex items-center gap-0.5 text-xs font-bold text-gray-700">
                                <ChevronUp className="w-3 h-3 text-amber-500" />
                                {entry.upvote_count >= 1000 ? `${(entry.upvote_count/1000).toFixed(1)}k` : entry.upvote_count}
                              </div>
                              {rankChange !== 0 && (
                                <span className="text-[10px] font-bold" style={{ color: rankChange > 0 ? '#22C55E' : '#EF4444' }}>
                                  {rankChange > 0 ? `▲${rankChange}` : `▼${Math.abs(rankChange)}`}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
                    <button onClick={() => router.push('/trending')} className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-amber-600 bg-transparent border-none cursor-pointer py-1 transition-opacity hover:opacity-70">
                      View Full Leaderboard <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Compare Products CTA */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-[10px] bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>Compare Products</h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">Side-by-side comparison</p>
                    </div>
                  </div>
                  <p className="text-[13px] text-gray-500 leading-relaxed mb-4">Can&apos;t decide? Compare up to 3 products side by side — features, pricing, and ratings.</p>
                  <button
                    onClick={() => router.push('/compare')}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-[13px] font-bold text-blue-700 bg-blue-50 border border-blue-200 cursor-pointer transition-all hover:bg-blue-100 hover:border-blue-300"
                  >
                    <BarChart3 className="w-3.5 h-3.5" /> Start Comparing
                  </button>
                </div>

                {/* Weekly Picks Newsletter */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-[10px] bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>Get Weekly Picks</h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">Curated products, every week</p>
                    </div>
                  </div>
                  <p className="text-[13px] text-gray-500 leading-relaxed mb-4">The best new SaaS and AI stacks, handpicked by our editors. Delivered every Thursday.</p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200 transition-all bg-gray-50"
                    />
                    <button
                      onClick={() => toast.success('Thanks! You\'ll get our weekly picks.')}
                      className="px-4 py-2.5 rounded-xl text-sm font-bold text-white border-none cursor-pointer transition-all hover:opacity-90 shrink-0"
                      style={{ background: '#7C3AED' }}
                    >
                      Subscribe
                    </button>
                  </div>
                </div>

                {/* Founder CTA card — hidden on mobile */}
                <div className="hidden lg:block rounded-2xl overflow-hidden border border-amber-200 p-5" style={{ background: '#FFFBEB' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-[10px] bg-amber-500 flex items-center justify-center shrink-0">
                      <Rocket className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">For Founders</p>
                      <h3 className="text-sm font-extrabold text-gray-900 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>Are you a founder?</h3>
                    </div>
                  </div>
                  <p className="text-[13px] text-amber-900 leading-relaxed mb-4">Launch your product and get discovered by thousands of buyers. Free to list.</p>
                  <button
                    onClick={go}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-[13px] font-bold text-white border-none cursor-pointer transition-all hover:opacity-90"
                    style={{ background: '#F59E0B' }}
                  >
                    <Rocket className="w-3.5 h-3.5" /> Go to LaunchPad
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>




      {/* ══════════════════════════════════════════════════════
          5. FRESH LAUNCHES — PH-style numbered list
      ══════════════════════════════════════════════════════ */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
          <SectionHeader
            label="Fresh Launches"
            labelIcon={Sparkles}
            labelColor="#2563EB"
            labelBg="#EFF6FF"
            labelBorder="#BFDBFE"
            headline="Newly launched Stacks"
            subtext="The latest SaaS and AI stacks submitted by founders."
            cta="View All Launches"
            ctaColor="#D97706"
            onCta={go}
          />

          {newLaunches.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-[15px] font-medium">No recent launches in this category yet.</p>
              <button onClick={() => setSelectedCategory('All')} className="mt-3 text-[13px] font-bold text-amber-500 bg-transparent border-none cursor-pointer underline">View all categories</button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {newLaunches.map((tool, i) => (
                <ToolCard key={tool.id} tool={tool} rank={i + 1} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          6. EVERYTHING IN ONE PLACE — Launch · Discover · Review
      ══════════════════════════════════════════════════════ */}
      <section className="py-12 sm:py-16 lg:py-20 border-b border-gray-200" style={{ background: '#F8FAFC' }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
          {/* Sleek container */}
          <div
            className="relative overflow-hidden rounded-3xl"
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 6px rgba(15,23,42,0.04), 0 4px 24px rgba(15,23,42,0.03)',
            }}
          >
            {/* Top accent line */}
            <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg, #DC2626 0%, #2563EB 50%, #D97706 100%)' }} />

            {/* Header area */}
            <div className="px-6 sm:px-10 lg:px-14 pt-8 sm:pt-10 lg:pt-12 pb-6 sm:pb-8">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-2">Everything in one place</p>
                  <h2 className="text-xl sm:text-2xl lg:text-[30px] font-extrabold text-slate-900 tracking-tight leading-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                    One platform. Three ways to grow.
                  </h2>
                  <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-[640px] leading-relaxed">
                    Where founders launch Stacks, the community gives Laud and reviews them, builders discover powerful tools, unlock exclusive deals, and ship faster with templates.
                  </p>
                </div>
                <button
                  onClick={go}
                  className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all hover:opacity-90 cursor-pointer border-none text-white"
                  style={{ background: '#F59E0B' }}
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="mx-6 sm:mx-10 lg:mx-14 h-px bg-slate-100" />

            {/* Cards grid inside container */}
              <div className="px-6 sm:px-10 lg:px-14 py-8 sm:py-10">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                {FIVE_PILLARS.map(({ icon: Icon, accent, accentBg, accentBorder, label, headline, body, cta }) => (
                  <div
                    key={label}
                    onClick={() => {
                      if (label === 'Launch') router.push('/launchpad');
                      else if (label === 'Discover') router.push('/tools');
                      else if (label === 'Review') router.push('/reviews');
                    }}
                    className="group relative cursor-pointer rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      background: '#FAFBFC',
                      border: '1px solid #EEF1F5',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = accentBorder;
                      e.currentTarget.style.boxShadow = `0 4px 16px rgba(15,23,42,0.06)`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#EEF1F5';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: accentBg, border: `1px solid ${accentBorder}` }}>
                        <Icon style={{ width: 18, height: 18, color: accent }} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-full" style={{ color: accent, background: accentBg, border: `1px solid ${accentBorder}` }}>
                        {label}
                      </span>
                    </div>
                    <h3 className="text-[15px] sm:text-base font-extrabold text-slate-900 leading-snug tracking-tight mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>{headline}</h3>
                    <p className="text-[13px] text-slate-500 leading-relaxed mb-4">{body}</p>
                    <div className="flex items-center gap-1.5 text-[13px] font-bold transition-all group-hover:gap-2.5" style={{ color: accent }}>
                      {cta} <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
}
