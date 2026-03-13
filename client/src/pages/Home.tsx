/*
 * LaudStack Homepage — Enterprise-Grade Polish
 *
 * Design Philosophy: "Warm Professional" — G2 meets ProductHunt
 *  - Clean white/off-white alternating sections with precise border separators
 *  - Amber (#F59E0B → #D97706) as the single accent color system
 *  - Inter for headings, system-ui for body
 *  - Generous whitespace, tight typography scale, zero visual noise
 *  - Every section header follows: label pill → headline → subtext → CTA
 *
 * Conversion flow:
 *  1. HERO             — Value prop + search + social proof
 *  2. THREE PILLARS    — Platform differentiation
 *  3. TRENDING         — Community momentum (FOMO)
 *  4. FRESH LAUNCHES   — Founder activity + novelty
 *  5. BROWSE + SIDEBAR — Full directory + leaderboard
 *  6. LAUNCHPAD CTA    — Founder conversion
 */

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search, Rocket, Star, BarChart3, Shield, ArrowRight,
  TrendingUp, Users, ChevronUp, Trophy, Zap,
  CheckCircle2, Award, MessageSquare, Flame,
  Sparkles, Eye, Filter, Globe, ShieldCheck, BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';

import ToolCard from '@/components/ToolCard';
import { useLocation } from 'wouter';
import { MOCK_TOOLS, MOCK_REVIEWS, MOCK_LEADERBOARD, CATEGORIES } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

// ─── Animation variants ────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.45 } }),
};

// ─── Static data ───────────────────────────────────────────────────────────
const POPULAR_SEARCHES = ['AI Writing', 'Code Editor', 'Project Management', 'Design Tools', 'Analytics', 'CRM'];

const THREE_PILLARS = [
  {
    icon: Search,
    accent: '#2563EB', accentBg: '#EFF6FF', accentBorder: '#BFDBFE',
    label: 'Discover',
    headline: 'Find the right tool, fast',
    body: 'Browse 95+ AI and SaaS tools across 12 categories. Filter by pricing, rating, and use case. No noise — just the tools that matter.',
    cta: 'Browse Tools',
  },
  {
    icon: Star,
    accent: '#D97706', accentBg: '#FFFBEB', accentBorder: '#FDE68A',
    label: 'Review',
    headline: 'Trust built on real evidence',
    body: 'Every review is verified. Star breakdowns, written feedback, and founder replies give you the full picture before you commit.',
    cta: 'Read Reviews',
  },
  {
    icon: Rocket,
    accent: '#DC2626', accentBg: '#FFF1F2', accentBorder: '#FECDD3',
    label: 'Launch',
    headline: 'Get your tool discovered',
    body: 'Founders submit via LaunchPad and build credibility through community reviews, editorial features, and organic rankings.',
    cta: 'Go to LaunchPad',
  },
];

// trendingTools and newLaunches are now computed inside the component (reactive to selectedCategory)

const LAUNCH_ACCENTS = [
  { from: '#F59E0B', to: '#D97706' },
  { from: '#22C55E', to: '#16A34A' },
  { from: '#F59E0B', to: '#D97706' },
  { from: '#22C55E', to: '#16A34A' },
];

// ─── Reusable section header ───────────────────────────────────────────────
function SectionHeader({
  label, labelIcon: LabelIcon, labelColor, labelBg, labelBorder,
  headline, subtext, cta, ctaColor, onCta,
}: {
  label: string; labelIcon: React.ElementType; labelColor: string; labelBg: string; labelBorder: string;
  headline: string; subtext: string; cta?: string; ctaColor?: string; onCta?: () => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px', gap: '16px', flexWrap: 'wrap' }}>
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '100px', background: labelBg, border: `1px solid ${labelBorder}`, marginBottom: '14px' }}>
          <LabelIcon style={{ width: '12px', height: '12px', color: labelColor }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: labelColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
        </div>
        <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(22px, 2.5vw, 30px)', fontWeight: 800, color: '#171717', letterSpacing: '-0.025em', margin: '0 0 8px', lineHeight: 1.2 }}>
          {headline}
        </h2>
        <p style={{ fontSize: '14px', color: '#64748B', fontWeight: 500, margin: 0, lineHeight: 1.6 }}>{subtext}</p>
      </div>
      {cta && onCta && (
        <button
          onClick={onCta}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 700, color: ctaColor || '#D97706', background: 'none', border: 'none', cursor: 'pointer', padding: 0, whiteSpace: 'nowrap', transition: 'opacity 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          {cta} <ArrowRight style={{ width: '13px', height: '13px' }} />
        </button>
      )}
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function Home() {
  const [searchQuery, setSearchQuery]           = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPricing, setSelectedPricing] = useState<string>('All');
  const [browseSort, setBrowseSort] = useState<'top_rated' | 'trending' | 'newest' | 'most_reviewed' | 'featured_first'>('top_rated');
  const [browseVisible, setBrowseVisible] = useState(20);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [bannerVisible, setBannerVisible]        = useState(true);
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { slugs: recentSlugs } = useRecentlyViewed();
  const recentTools = recentSlugs
    .map(s => MOCK_TOOLS.find(t => t.slug === s))
    .filter(Boolean) as typeof MOCK_TOOLS;
  const go = () => navigate('/launchpad');
  const goTrending = () => navigate('/trending');
  const goToTool = (slug: string) => navigate(`/tools/${slug}`);
  const handleSearch = () => {
    const q = searchQuery.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
    else navigate('/search');
  };

  const filteredBase = selectedCategory === 'All'
    ? MOCK_TOOLS
    : MOCK_TOOLS.filter(t => t.category === selectedCategory);

  const allToolsSorted = (() => {
    let base = selectedPricing === 'All' ? filteredBase : filteredBase.filter(t => t.pricing_model === selectedPricing);
    if (featuredOnly) base = base.filter(t => t.is_featured);
    const copy = [...base];
    if (browseSort === 'top_rated')     copy.sort((a, b) => b.average_rating - a.average_rating);
    if (browseSort === 'trending')      copy.sort((a, b) => (b.weekly_rank_change ?? 0) - (a.weekly_rank_change ?? 0));
    if (browseSort === 'newest')        copy.sort((a, b) => new Date(b.launched_at).getTime() - new Date(a.launched_at).getTime());
    if (browseSort === 'most_reviewed') copy.sort((a, b) => b.review_count - a.review_count);
    if (browseSort === 'featured_first') copy.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    return copy;
  })();
  const allTools = allToolsSorted.slice(0, browseVisible);

  // Trending: top 4 tools with the biggest weekly_rank_change (last 7 days)
  const trendingTools = [...(selectedCategory === 'All' ? MOCK_TOOLS : filteredBase)]
    .filter(t => (t.weekly_rank_change ?? 0) > 0)
    .sort((a, b) => (b.weekly_rank_change ?? 0) - (a.weekly_rank_change ?? 0))
    .slice(0, 4);

  // Fresh Launches: newest tools (by launched_at), filtered by category
  const newLaunches = [...filteredBase]
    .sort((a, b) => new Date(b.launched_at).getTime() - new Date(a.launched_at).getTime())
    .slice(0, 4);

  const leaderboard = MOCK_LEADERBOARD.slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFFFFF' }}>
      <Navbar />
      {/* Spacer for fixed 72px navbar */}
      <div style={{ height: '72px', flexShrink: 0 }} />

      {/* ══════════════════════════════════════════════════════
          ANNOUNCEMENT BANNER
      ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {bannerVisible && (
          <motion.div
            key="banner"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden', background: '#171717', borderBottom: '1px solid rgba(245,158,11,0.25)' }}
          >
            <div className="max-w-[1200px] mx-auto px-6 lg:px-10" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', height: '42px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, justifyContent: 'center' }}>
                <span style={{ fontSize: '13px' }}>🎉</span>
                <p style={{ fontSize: '13px', color: '#CBD5E1', fontWeight: 500, margin: 0 }}>
                  <strong style={{ color: '#F59E0B', fontWeight: 700 }}>50 new tools</strong> added this month — AI coding, design, and analytics.
                  <button onClick={go} style={{ marginLeft: '10px', fontSize: '12px', fontWeight: 700, color: '#F59E0B', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '2px', padding: 0 }}>Browse what's new →</button>
                </p>
              </div>
              <button
                onClick={() => setBannerVisible(false)}
                aria-label="Dismiss"
                style={{ flexShrink: 0, width: '26px', height: '26px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', lineHeight: 1, transition: 'background 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; }}
              >×</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════════════════ */}
      <section
        className="relative px-6 lg:px-10"
        style={{
          background: 'linear-gradient(160deg, #F8FAFC 0%, #F1F5F9 60%, #EFF6FF 100%)',
          minHeight: 'calc(100vh - 114px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          paddingTop: '72px', paddingBottom: '96px',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        {/* Subtle dot grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)', backgroundSize: '28px 28px', opacity: 0.35, pointerEvents: 'none' }} />
        {/* Amber glow */}
        <div style={{ position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '600px', background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: '760px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 1 }}>

          {/* Trust badge */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#fff', border: '1px solid #E2E8F0', color: '#475569', fontSize: '12px', fontWeight: 600, padding: '6px 16px', borderRadius: '100px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', marginBottom: '32px' }}
          >
            <ShieldCheck style={{ width: '13px', height: '13px', color: '#22C55E' }} />
            Trusted by 12,000+ professionals and founders
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
            style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(42px, 5.8vw, 68px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.03em', color: '#171717', margin: 0 }}
          >
            The Trusted Source for<br />
            <span style={{ color: '#F59E0B' }}>
              AI &amp; SaaS Tools.
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
            style={{ marginTop: '22px', fontSize: '18px', color: '#475569', lineHeight: 1.65, maxWidth: '540px', fontWeight: 400 }}
          >
            Real reviews. Honest rankings. The smartest way to discover, compare, and choose the tools your business actually needs.
          </motion.p>

          {/* Search bar */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} style={{ marginTop: '40px', width: '100%', maxWidth: '680px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 28px rgba(0,0,0,0.09)', border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#94A3B8' }} />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Search 95+ AI & SaaS tools..."
                  style={{ width: '100%', paddingLeft: '50px', paddingRight: '16px', height: '58px', fontSize: '15px', color: '#171717', background: 'transparent', border: 'none', outline: 'none' }}
                />
              </div>
              <button
                onClick={handleSearch}
                style={{ height: '58px', padding: '0 32px', fontWeight: 700, color: '#fff', fontSize: '14px', letterSpacing: '0.01em', background: '#F59E0B', border: 'none', cursor: 'pointer', flexShrink: 0, transition: 'opacity 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Search
              </button>
            </div>

            {/* Popular searches */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>Popular:</span>
              {POPULAR_SEARCHES.map(term => (
                <button key={term} onClick={() => navigate(`/search?q=${encodeURIComponent(term)}`)}
                  style={{ fontSize: '12px', color: '#475569', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '4px 11px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.15s', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
                  onMouseEnter={e => { (e.target as HTMLButtonElement).style.borderColor = '#F59E0B'; (e.target as HTMLButtonElement).style.color = '#B45309'; (e.target as HTMLButtonElement).style.background = '#FFFBEB'; }}
                  onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = '#E2E8F0'; (e.target as HTMLButtonElement).style.color = '#475569'; (e.target as HTMLButtonElement).style.background = '#fff'; }}
                >{term}</button>
              ))}
            </div>
          </motion.div>

          {/* Social proof row */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}
            style={{ marginTop: '40px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex' }}>
                {[11,12,13,14,15].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/32?img=${i}`} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #fff', marginLeft: i === 11 ? 0 : '-8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
                ))}
              </div>
              <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}><strong style={{ color: '#171717', fontWeight: 700 }}>12,000+</strong> professionals</span>
            </div>
            <div style={{ width: '1px', height: '20px', background: '#E2E8F0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {[1,2,3,4,5].map(i => <Star key={i} style={{ width: '14px', height: '14px', fill: '#FBBF24', color: '#FBBF24' }} />)}
              <span style={{ fontSize: '13px', color: '#475569', marginLeft: '5px', fontWeight: 500 }}><strong style={{ color: '#171717', fontWeight: 700 }}>4.9</strong> avg rating</span>
            </div>
            <div style={{ width: '1px', height: '20px', background: '#E2E8F0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 style={{ width: '15px', height: '15px', color: '#22C55E' }} />
              <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}><strong style={{ color: '#171717', fontWeight: 700 }}>98%</strong> verified reviews</span>
            </div>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0, zIndex: 2 }}>
          <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }} preserveAspectRatio="none">
            <path d="M0,56 C360,0 1080,0 1440,56 L1440,56 L0,56 Z" fill="#ffffff"/>
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          1b. RECENTLY VIEWED — only for authenticated users with history
      ══════════════════════════════════════════════════════ */}
      {isAuthenticated && recentTools.length > 0 && (
        <section style={{ background: '#FFFFFF', padding: '40px 0 36px', borderBottom: '1px solid #F1F5F9' }}>
          <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Eye style={{ width: '15px', height: '15px', color: '#fff' }} />
                </div>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 1px' }}>Continue exploring</p>
                  <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '18px', fontWeight: 800, color: '#171717', margin: 0, letterSpacing: '-0.02em' }}>
                    Recently Viewed
                  </h2>
                </div>
              </div>
              {user && (
                <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  Welcome back, <strong style={{ color: '#171717' }}>{user.name.split(' ')[0]}</strong>
                </span>
              )}
            </div>

            {/* Horizontal scroll row */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${recentTools.length}, minmax(220px, 1fr))`, gap: '16px', overflowX: 'auto' }}>
              {recentTools.map((tool, i) => (
                <motion.div
                  key={tool.slug}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                  onClick={() => goToTool(tool.slug)}
                  style={{
                    background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px',
                    padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '10px',
                    boxShadow: '0 1px 3px rgba(15,23,42,0.04)', transition: 'all 0.2s ease',
                    position: 'relative', overflow: 'hidden',
                  }}
                  whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(15,23,42,0.09)', borderColor: '#FDE68A' }}
                >
                  {/* Amber top bar on hover */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: '#F59E0B', opacity: 0, transition: 'opacity 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                  />

                  {/* Logo + name row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', overflow: 'hidden', flexShrink: 0 }}>
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
                            p.innerHTML = `<span style="font-size:16px;font-weight:800;color:#64748B">${tool.name.charAt(0)}</span>`;
                          }
                        }}
                      />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#171717', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'Inter', sans-serif" }}>{tool.name}</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>{tool.category}</div>
                    </div>
                  </div>

                  {/* Rating row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ display: 'flex', gap: '1px' }}>
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} style={{ width: '11px', height: '11px', fill: s <= Math.round(tool.average_rating) ? '#F59E0B' : 'transparent', color: s <= Math.round(tool.average_rating) ? '#F59E0B' : '#CBD5E1' }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#171717' }}>{tool.average_rating.toFixed(1)}</span>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>({tool.review_count})</span>
                  </div>

                  {/* Tagline */}
                  <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{tool.tagline}</p>

                  {/* Pricing badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', background: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0' }}>{tool.pricing_model}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      View <ArrowRight style={{ width: '10px', height: '10px' }} />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          3. TRENDING THIS WEEK
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: '#F0F7F4', padding: '80px 0', borderBottom: '1px solid #E0EDE6' }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <SectionHeader
            label="Trending This Week"
            labelIcon={Flame}
            labelColor="#92400E"
            labelBg="#FEF3C7"
            labelBorder="#FDE68A"
            headline="Biggest movers in the last 7 days"
            subtext="Ranked by rank-position gain over the past week — tools climbing fastest right now."
            cta="View All Trending"
            ctaColor="#D97706"
            onCta={goTrending}
          />
          {trendingTools.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8' }}>
              <p style={{ fontSize: '15px', fontWeight: 500 }}>No trending tools in this category yet.</p>
              <button onClick={() => setSelectedCategory('All')} style={{ marginTop: '12px', fontSize: '13px', fontWeight: 700, color: '#F59E0B', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>View all categories</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: '16px' }}>
              {trendingTools.map((tool, i) => {
                const change = tool.weekly_rank_change ?? 0;
                const momentum = change >= 20 ? 'rocket' : change >= 12 ? 'hot' : 'rising';
                const momentumEmoji = momentum === 'rocket' ? '🚀' : momentum === 'hot' ? '🔥' : '📈';
                const momentumLabel = momentum === 'rocket' ? 'Rocket' : momentum === 'hot' ? 'Hot' : 'Rising';
                const momentumColor = momentum === 'rocket' ? '#F59E0B' : momentum === 'hot' ? '#D97706' : '#16A34A';
                const momentumTextBg = momentum === 'rocket' ? 'rgba(245,158,11,0.12)' : momentum === 'hot' ? 'rgba(217,119,6,0.12)' : 'rgba(22,163,74,0.12)';
                const rankColor = i === 0 ? '#F59E0B' : i === 1 ? '#94A3B8' : i === 2 ? '#CD7F32' : '#CBD5E1';
                // Fallback screenshot — abstract tech/UI image from Unsplash
                const fallbackScreenshot = [
                  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&auto=format',
                  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&auto=format',
                  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop&auto=format',
                  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop&auto=format',
                ][i % 4];
                const screenshotSrc = tool.screenshot_url ?? fallbackScreenshot;
                return (
                  <motion.div key={tool.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.07}>
                    <div
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E8ECF0',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.2s',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLDivElement;
                        el.style.boxShadow = '0 12px 40px rgba(245,158,11,0.15), 0 4px 12px rgba(0,0,0,0.08)';
                        el.style.borderColor = '#FCD34D';
                        el.style.transform = 'translateY(-3px)';
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLDivElement;
                        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                        el.style.borderColor = '#E8ECF0';
                        el.style.transform = 'translateY(0)';
                      }}
                      onClick={() => navigate(`/tools/${tool.slug}`)}
                    >
                      {/* ── Screenshot hero (square aspect ratio) ── */}
                      <div style={{ position: 'relative', width: '100%', paddingTop: '72%', overflow: 'hidden', background: '#F3F4F6', flexShrink: 0 }}>
                        <img
                          src={screenshotSrc}
                          alt={`${tool.name} screenshot`}
                          style={{
                            position: 'absolute', inset: 0,
                            width: '100%', height: '100%',
                            objectFit: 'cover', objectPosition: 'top center',
                            transition: 'transform 0.35s ease',
                          }}
                          onError={e => { (e.target as HTMLImageElement).src = fallbackScreenshot; }}
                          onMouseEnter={e => { (e.target as HTMLImageElement).style.transform = 'scale(1.04)'; }}
                          onMouseLeave={e => { (e.target as HTMLImageElement).style.transform = 'scale(1)'; }}
                        />
                        {/* Gradient overlay at bottom of screenshot */}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)', pointerEvents: 'none' }} />

                        {/* Rank badge — top-left */}
                        <div style={{
                          position: 'absolute', top: '10px', left: '10px',
                          background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
                          borderRadius: '8px', padding: '3px 9px',
                          display: 'flex', alignItems: 'center', gap: '4px',
                        }}>
                          <span style={{ fontSize: '11px', fontWeight: 900, color: rankColor, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>#{i + 1}</span>
                        </div>
                        {/* Featured badge — below rank badge */}
                        {tool.is_featured && (
                          <div style={{
                            position: 'absolute', top: '38px', left: '10px',
                            background: '#F59E0B',
                            borderRadius: '6px', padding: '2px 7px',
                            display: 'flex', alignItems: 'center', gap: '3px',
                          }}>
                            <Sparkles style={{ width: '8px', height: '8px', color: '#fff' }} />
                            <span style={{ fontSize: '9px', fontWeight: 800, color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Featured</span>
                          </div>
                        )}

                        {/* Rank change pill — top-right */}
                        <div style={{
                          position: 'absolute', top: '10px', right: '10px',
                          background: momentumTextBg, backdropFilter: 'blur(6px)',
                          border: `1px solid ${momentumColor}50`,
                          borderRadius: '8px', padding: '3px 8px',
                          display: 'flex', alignItems: 'center', gap: '3px',
                        }}>
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={momentumColor} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: momentumColor }}>+{change}</span>
                        </div>

                        {/* Tool logo — bottom-left of screenshot */}
                        <div style={{
                          position: 'absolute', bottom: '10px', left: '10px',
                          width: '36px', height: '36px', borderRadius: '9px',
                          border: '1.5px solid rgba(255,255,255,0.3)',
                          background: 'rgba(255,255,255,0.95)',
                          overflow: 'hidden', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        }}>
                          <img
                            src={tool.logo_url}
                            alt={tool.name}
                            style={{ width: '26px', height: '26px', objectFit: 'contain' }}
                            onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=f1f5f9&color=64748b&size=26`; }}
                          />
                        </div>

                        {/* Momentum badge — bottom-right of screenshot */}
                        <div style={{
                          position: 'absolute', bottom: '10px', right: '10px',
                          background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
                          borderRadius: '20px', padding: '3px 9px',
                          display: 'flex', alignItems: 'center', gap: '4px',
                        }}>
                          <span style={{ fontSize: '9px' }}>{momentumEmoji}</span>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: momentumColor, letterSpacing: '0.02em' }}>{momentumLabel}</span>
                        </div>
                      </div>

                      {/* ── Info panel ── */}
                      <div style={{ padding: '13px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {/* Tool name + category */}
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 800, color: '#171717', letterSpacing: '-0.01em', lineHeight: 1.2, marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tool.name}</p>
                          <p style={{ fontSize: '11px', color: '#6B7280', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{tool.tagline}</p>
                        </div>

                        {/* Stats row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto', paddingTop: '4px', borderTop: '1px solid #F3F4F6' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 700, color: '#374151' }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            {tool.average_rating.toFixed(1)}
                          </span>
                          <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 500 }}>{tool.review_count} reviews</span>
                          <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 600, color: '#6B7280', background: '#F3F4F6', padding: '2px 7px', borderRadius: '5px' }}>{tool.pricing_model}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          5. BROWSE BY CATEGORY + SIDEBAR
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: '#F8FAFC', padding: '80px 0 88px', borderBottom: '1px solid #E2E8F0' }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">

          <SectionHeader
            label="Browse by Category"
            labelIcon={Filter}
            labelColor="#F59E0B"
            labelBg="#F1F5F9"
            labelBorder="#E2E8F0"
            headline="Find tools for every use case"
            subtext={`${MOCK_TOOLS.length} verified tools across ${CATEGORIES.length - 1} categories.`}
            cta="All Categories"
            ctaColor="#D97706"
            onCta={go}
          />

          {/* ── Category + Filter Container (full width, static) ── */}
          <div
            style={{
              background: '#EFF3F8',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              marginBottom: '24px',
            }}
          >
            {/* Category tab strip */}
            <div style={{ borderBottom: '1px solid #E2E8F0', padding: '0 16px' }}>
              <div
                className="flex gap-1.5 overflow-x-auto"
                style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingBottom: '0', paddingTop: '8px' }}
              >
                {CATEGORIES.map(({ name, icon, count }) => {
                  const active = selectedCategory === name;
                  return (
                    <button
                      key={name}
                      onClick={() => { setSelectedCategory(name); setBrowseVisible(20); }}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '7px 13px', borderRadius: '8px', cursor: 'pointer',
                        fontSize: '12px', fontWeight: 700, transition: 'all 0.14s',
                        flexShrink: 0, whiteSpace: 'nowrap', fontFamily: 'inherit',
                        border: active ? '1.5px solid #F59E0B' : '1.5px solid transparent',
                        background: active ? '#F59E0B' : 'transparent',
                        color: active ? '#0A0A0A' : '#6B7280',
                        boxShadow: active ? '0 2px 10px rgba(245,158,11,0.22)' : 'none',
                        marginBottom: '8px',
                      }}
                      onMouseEnter={e => { if (!active) { const b = e.currentTarget as HTMLButtonElement; b.style.color = '#B45309'; b.style.background = 'rgba(245,158,11,0.08)'; } }}
                      onMouseLeave={e => { if (!active) { const b = e.currentTarget as HTMLButtonElement; b.style.color = '#6B7280'; b.style.background = 'transparent'; } }}
                    >
                      <span style={{ fontSize: '13px', lineHeight: 1 }}>{icon}</span>
                      <span>{name}</span>
                      <span style={{
                        fontSize: '10px', fontWeight: 700, padding: '1px 5px', borderRadius: '4px',
                        background: active ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.05)',
                        color: active ? '#0A0A0A' : '#9CA3AF',
                      }}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
              padding: '10px 16px',
            }}>
            {/* Pricing pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap', marginRight: '2px' }}>Pricing</span>
              {([
                { key: 'All',         label: 'All',         activeColor: '#374151', activeBg: '#F3F4F6', activeBorder: '#D1D5DB' },
                { key: 'Free',        label: 'Free',        activeColor: '#065F46', activeBg: '#ECFDF5', activeBorder: '#6EE7B7' },
                { key: 'Freemium',    label: 'Freemium',    activeColor: '#92400E', activeBg: '#FFFBEB', activeBorder: '#FCD34D' },
                { key: 'Paid',        label: 'Paid',        activeColor: '#1E3A5F', activeBg: '#EFF6FF', activeBorder: '#93C5FD' },
                { key: 'Free Trial',  label: 'Free Trial',  activeColor: '#4C1D95', activeBg: '#F5F3FF', activeBorder: '#C4B5FD' },
                { key: 'Open Source', label: 'Open Source', activeColor: '#1F2937', activeBg: '#F9FAFB', activeBorder: '#9CA3AF' },
              ] as const).map(({ key, label, activeColor, activeBg, activeBorder }) => {
                const active = selectedPricing === key;
                return (
                  <button
                    key={key}
                    onClick={() => { setSelectedPricing(key); setBrowseVisible(20); }}
                    style={{
                      padding: '4px 11px', borderRadius: '6px', cursor: 'pointer',
                      fontSize: '11px', fontWeight: 700, transition: 'all 0.13s', fontFamily: 'inherit',
                      border: active ? `1.5px solid ${activeBorder}` : '1.5px solid #E8ECF0',
                      background: active ? activeBg : 'transparent',
                      color: active ? activeColor : '#9CA3AF',
                    }}
                    onMouseEnter={e => { if (!active) { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#D1D5DB'; b.style.color = '#374151'; } }}
                    onMouseLeave={e => { if (!active) { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#E8ECF0'; b.style.color = '#9CA3AF'; } }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div style={{ width: '1px', height: '24px', background: '#E8ECF0', flexShrink: 0 }} />
            {/* Featured toggle */}
            <button
              onClick={() => { setFeaturedOnly(f => !f); setBrowseVisible(20); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '5px 12px', borderRadius: '7px', cursor: 'pointer',
                fontSize: '11px', fontWeight: 700, transition: 'all 0.13s', fontFamily: 'inherit',
                border: featuredOnly ? '1.5px solid #F59E0B' : '1.5px solid #E8ECF0',
                background: featuredOnly ? '#FFF7ED' : 'transparent',
                color: featuredOnly ? '#B45309' : '#9CA3AF',
                flexShrink: 0,
              }}
              onMouseEnter={e => { if (!featuredOnly) { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#FDE68A'; b.style.color = '#D97706'; b.style.background = '#FFFBEB'; } }}
              onMouseLeave={e => { if (!featuredOnly) { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#E8ECF0'; b.style.color = '#9CA3AF'; b.style.background = 'transparent'; } }}
            >
              <Sparkles style={{ width: '10px', height: '10px' }} />
              Featured
            </button>
            {/* Divider */}
            <div style={{ width: '1px', height: '24px', background: '#E8ECF0', flexShrink: 0 }} />
            {/* Sort select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>Sort</span>
              <select
                value={browseSort}
                onChange={e => { setBrowseSort(e.target.value as typeof browseSort); setBrowseVisible(20); }}
                style={{ fontSize: '12px', fontWeight: 700, color: '#374151', background: '#F9FAFB', border: '1.5px solid #E8ECF0', borderRadius: '7px', padding: '5px 10px', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                <option value="top_rated">Top Rated</option>
                <option value="trending">Trending</option>
                <option value="newest">Newest</option>
                <option value="most_reviewed">Most Reviewed</option>
                <option value="featured_first">✦ Featured First</option>
              </select>
            </div>

            {/* Clear filters */}
            {(selectedPricing !== 'All' || featuredOnly) && (
              <div style={{ flexShrink: 0, marginLeft: 'auto' }}>
                <button
                  onClick={() => { setSelectedPricing('All'); setFeaturedOnly(false); setBrowseVisible(20); }}
                  style={{ fontSize: '11px', fontWeight: 700, color: '#F59E0B', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline', textUnderlineOffset: '2px', fontFamily: 'inherit' }}
                >Clear filters</button>
              </div>
            )}
            </div>
          </div>

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: '32px' }}>

            {/* Tools list (2/3) */}
            <div className="lg:col-span-2">

              <div className="flex flex-col" style={{ gap: '12px' }}>
                {allTools.map((tool, i) => (
                  <motion.div key={tool.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.06}>
                    <ToolCard tool={tool} />
                  </motion.div>
                ))}
              </div>

              {/* Show more */}
              {browseVisible < allToolsSorted.length && (
                <div style={{ marginTop: '28px', textAlign: 'center' }}>
                  <button
                    onClick={() => setBrowseVisible(v => v + 20)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 28px', borderRadius: '10px', border: '1.5px solid #E8ECF0', fontSize: '13px', fontWeight: 700, color: '#374151', background: '#FFFFFF', cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', fontFamily: 'inherit' }}
                    onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#F59E0B'; b.style.color = '#B45309'; b.style.background = '#FFFBEB'; }}
                    onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#E8ECF0'; b.style.color = '#374151'; b.style.background = '#FFFFFF'; }}
                  >
                    Show 20 more <ArrowRight style={{ width: '13px', height: '13px' }} />
                  </button>
                </div>
              )}


            </div>

            {/* Sidebar (1/3) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Weekly Leaderboard */}
                <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAFAFA' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: '#FFFBEB', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trophy style={{ width: '13px', height: '13px', color: '#D97706' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: '#D97706', letterSpacing: '0.07em', textTransform: 'uppercase', margin: 0, lineHeight: 1 }}>This Week</p>
                        <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 800, color: '#171717', margin: '2px 0 0' }}>Top Ranked Tools</h3>
                      </div>
                    </div>
                    <button onClick={go} style={{ fontSize: '11px', fontWeight: 700, color: '#D97706', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'opacity 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >Full Board →</button>
                  </div>
                  <div>
                    {leaderboard.map(({ rank, tool, rank_change }: { rank: number; tool: import('@/lib/types').Tool; rank_change: number }, idx: number) => (
                      <div
                        key={tool.id}
                        onClick={() => goToTool(tool.slug)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 18px', cursor: 'pointer', borderBottom: idx < leaderboard.length - 1 ? '1px solid #F8FAFC' : 'none', transition: 'background 0.12s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#FAFAFA')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ width: '22px', textAlign: 'center', flexShrink: 0 }}>
                          {rank <= 3
                            ? <span style={{ fontSize: '15px' }}>{['🥇','🥈','🥉'][rank-1]}</span>
                            : <span style={{ fontSize: '12px', fontWeight: 800, color: '#94A3B8' }}>{rank}</span>
                          }
                        </div>
                        <div style={{ width: '34px', height: '34px', borderRadius: '10px', overflow: 'hidden', background: '#F1F5F9', flexShrink: 0, border: '1px solid #E2E8F0' }}>
                           <img src={tool.logo_url} alt={tool.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => { const t = e.currentTarget; t.style.display='none'; const p = t.parentElement; if(p){ p.style.background='#F1F5F9'; p.style.display='flex'; p.style.alignItems='center'; p.style.justifyContent='center'; p.innerHTML=`<span style="font-size:16px;font-weight:800;color:#64748B">${tool.name.charAt(0)}</span>`; } }} />
                         </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: '#171717', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tool.name}</p>
                          <p style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500, margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tool.category}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '12px', fontWeight: 700, color: '#374151' }}>
                            <ChevronUp style={{ width: '11px', height: '11px', color: '#F59E0B' }} />
                            {tool.upvote_count >= 1000 ? `${(tool.upvote_count/1000).toFixed(1)}k` : tool.upvote_count}
                          </div>
                          {rank_change !== 0 && (
                            <span style={{ fontSize: '10px', fontWeight: 700, color: rank_change > 0 ? '#22C55E' : '#EF4444' }}>
                              {rank_change > 0 ? `▲${rank_change}` : `▼${Math.abs(rank_change)}`}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '10px 18px', background: '#FAFAFA', borderTop: '1px solid #F1F5F9' }}>
                    <button onClick={go} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '12px', fontWeight: 700, color: '#D97706', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', transition: 'opacity 0.12s' }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      View Full Leaderboard <ArrowRight style={{ width: '12px', height: '12px' }} />
                    </button>
                  </div>
                </div>

                {/* Recent Reviews */}
                <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '18px', boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '16px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MessageSquare style={{ width: '13px', height: '13px', color: '#16A34A' }} />
                    </div>
                    <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 800, color: '#171717', margin: 0 }}>Recent Reviews</h3>
                  </div>
                  {MOCK_REVIEWS.slice(0, 3).map((review, idx) => (
                    <div key={review.id} style={{ marginBottom: idx < 2 ? '14px' : 0, paddingBottom: idx < 2 ? '14px' : 0, borderBottom: idx < 2 ? '1px solid #F1F5F9' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} style={{ width: '11px', height: '11px', fill: i <= review.rating ? '#FBBF24' : '#E2E8F0', color: i <= review.rating ? '#FBBF24' : '#E2E8F0' }} />
                          ))}
                        </div>
                        <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>{review.user?.name}</span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#374151', fontWeight: 500, margin: 0, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{review.title}</p>
                    </div>
                  ))}
                  <button onClick={go} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '14px', fontSize: '12px', fontWeight: 700, color: '#16A34A', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'opacity 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    Read All Reviews <ArrowRight style={{ width: '11px', height: '11px' }} />
                  </button>
                </div>

                {/* Founder CTA card */}
                <div style={{ borderRadius: '18px', overflow: 'hidden', border: '1px solid #FDE68A', background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 60%, #FFF7ED 100%)', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '12px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(245,158,11,0.3)' }}>
                      <Rocket style={{ width: '15px', height: '15px', color: '#FFFFFF' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: '#92400E', letterSpacing: '0.07em', textTransform: 'uppercase', margin: 0 }}>For Founders</p>
                      <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 800, color: '#171717', margin: '2px 0 0' }}>Are you a founder?</h3>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: '#78350F', fontWeight: 400, margin: '0 0 16px', lineHeight: 1.6 }}>Submit your tool and get discovered by thousands of buyers. Free to list.</p>
                  <button
                    onClick={go}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 16px', borderRadius: '11px', fontSize: '13px', fontWeight: 700, color: '#FFFFFF', background: '#F59E0B', border: 'none', cursor: 'pointer', transition: 'box-shadow 0.15s', boxShadow: '0 2px 8px rgba(245,158,11,0.25)' }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 18px rgba(245,158,11,0.4)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(245,158,11,0.25)')}
                  >
                    <Rocket style={{ width: '13px', height: '13px' }} />
                    Go to LaunchPad
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          4. FRESH LAUNCHES
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: '#FFFFFF', padding: '80px 0', borderBottom: '1px solid #F1F5F9' }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <SectionHeader
            label="Fresh Launches"
            labelIcon={Sparkles}
            labelColor="#F59E0B"
            labelBg="#EFF6FF"
            labelBorder="#BFDBFE"
            headline="Newly launched tools"
            subtext="The latest AI and SaaS tools submitted by founders this week."
            cta="View All Launches"
            ctaColor="#D97706"
            onCta={go}
          />

          {newLaunches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8' }}>
              <p style={{ fontSize: '15px', fontWeight: 500 }}>No recent launches in this category yet.</p>
              <button onClick={() => setSelectedCategory('All')} style={{ marginTop: '12px', fontSize: '13px', fontWeight: 700, color: '#F59E0B', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>View all categories</button>
            </div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4" style={{ gap: '20px' }}>
            {newLaunches.map((tool, i) => {
              // Time since launch
              const launchedDate = new Date(tool.launched_at);
              const now = new Date();
              const diffDays = Math.floor((now.getTime() - launchedDate.getTime()) / (1000 * 60 * 60 * 24));
              const timeLabel = diffDays === 0 ? 'Today' : diffDays === 1 ? '1 day ago' : diffDays < 30 ? `${diffDays}d ago` : diffDays < 365 ? `${Math.floor(diffDays / 30)}mo ago` : `${Math.floor(diffDays / 365)}y ago`;
              // Fallback screenshot
              const fallbackShots = [
                'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop&auto=format',
                'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop&auto=format',
                'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=500&fit=crop&auto=format',
                'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=500&fit=crop&auto=format',
              ];
              const screenshotSrc = tool.screenshot_url ?? fallbackShots[i % 4];
              return (
                <motion.div
                  key={tool.id}
                  initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.08}
                  onClick={() => goToTool(tool.slug)}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E8ECF0',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                  }}
                  whileHover={{ y: -4, boxShadow: '0 12px 36px rgba(0,0,0,0.10)', borderColor: '#FCD34D' }}
                >
                  {/* ── Header: logo + name + category + upvote ── */}
                  <div style={{ padding: '14px 14px 10px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    {/* Logo */}
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
                      border: '1px solid #E8ECF0', background: '#F8FAFC',
                      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <img
                        src={tool.logo_url}
                        alt={tool.name}
                        style={{ width: '36px', height: '36px', objectFit: 'contain' }}
                        onError={e => {
                          const t = e.currentTarget;
                          t.style.display = 'none';
                          const p = t.parentElement;
                          if (p) { p.innerHTML = `<span style="font-size:18px;font-weight:800;color:#64748B">${tool.name.charAt(0)}</span>`; }
                        }}
                      />
                    </div>

                    {/* Name + category */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#171717', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tool.name}</span>
                        {tool.is_verified && (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="#3B82F6"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        )}
                        {tool.is_featured && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 2,
                            fontSize: 9, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase',
                            padding: '2px 6px', borderRadius: 5,
                            background: '#FFF7ED', color: '#B45309', border: '1px solid #FDE68A',
                          }}>
                            <Sparkles style={{ width: 8, height: 8 }} />
                            Featured
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>{tool.category}</span>
                      </div>
                    </div>

                    {/* Upvote button */}
                    <button
                      onClick={e => { e.stopPropagation(); toast.success('Upvoted!'); }}
                      style={{
                        flexShrink: 0, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: '1px',
                        padding: '6px 10px', borderRadius: '10px',
                        border: '1.5px solid #E8ECF0', background: '#F9FAFB',
                        cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                        minWidth: '42px',
                      }}
                      onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#F59E0B'; b.style.background = '#FFFBEB'; }}
                      onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#E8ECF0'; b.style.background = '#F9FAFB'; }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#374151', lineHeight: 1.2 }}>{tool.upvote_count > 999 ? `${(tool.upvote_count / 1000).toFixed(1)}k` : tool.upvote_count}</span>
                    </button>
                  </div>

                  {/* ── Screenshot ── */}
                  <div style={{ position: 'relative', width: '100%', paddingTop: '58%', overflow: 'hidden', background: '#F3F4F6', flexShrink: 0 }}>
                    <img
                      src={screenshotSrc}
                      alt={`${tool.name} screenshot`}
                      style={{
                        position: 'absolute', inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover', objectPosition: 'top center',
                        transition: 'transform 0.4s ease',
                      }}
                      onError={e => { (e.target as HTMLImageElement).src = fallbackShots[i % 4]; }}
                    />
                    {/* Stats overlay on screenshot */}
                    <div style={{
                      position: 'absolute', top: '8px', left: '8px',
                      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
                      borderRadius: '6px', padding: '3px 8px',
                      display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                      <BarChart3 style={{ width: '10px', height: '10px', color: '#9CA3AF' }} />
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#E5E7EB' }}>{(tool.upvote_count * 3 + tool.review_count * 12).toLocaleString()}</span>
                    </div>
                    {/* New badge */}
                    <div style={{
                      position: 'absolute', top: '8px', right: '8px',
                      background: '#F59E0B', borderRadius: '5px',
                      padding: '2px 7px',
                    }}>
                      <span style={{ fontSize: '9px', fontWeight: 800, color: '#0A0A0A', letterSpacing: '0.06em', textTransform: 'uppercase' }}>New</span>
                    </div>
                  </div>

                  {/* ── Description ── */}
                  <div style={{ padding: '10px 14px 0' }}>
                    <p style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.55, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{tool.tagline}</p>
                  </div>

                  {/* ── Footer ── */}
                  <div style={{
                    padding: '10px 14px 13px',
                    marginTop: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderTop: '1px solid #F3F4F6',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* Time since launch */}
                      <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>{timeLabel}</span>
                      <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#D1D5DB', display: 'inline-block' }} />
                      {/* Rating */}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '11px', fontWeight: 700, color: '#374151' }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        {tool.average_rating.toFixed(1)}
                      </span>
                    </div>
                    {/* Pricing */}
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', background: '#F3F4F6', padding: '2px 8px', borderRadius: '5px' }}>{tool.pricing_model}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          2. THREE PILLARS — Discover · Review · Launch
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: '#FFFFFF', padding: '88px 0 80px', borderBottom: '1px solid #F1F5F9' }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">

          {/* Section header — centered */}
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
              style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>
              Everything in one place
            </motion.p>
            <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
              style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 800, color: '#171717', letterSpacing: '-0.025em', margin: '0 0 16px', lineHeight: 1.15 }}>
              Built for how people actually choose tools
            </motion.h2>
            <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
              style={{ fontSize: '16px', color: '#64748B', maxWidth: '500px', margin: '0 auto', lineHeight: 1.65, fontWeight: 400 }}>
              LaudStack is where professionals discover, evaluate, and launch AI & SaaS tools.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '20px' }}>
            {THREE_PILLARS.map(({ icon: Icon, accent, accentBg, accentBorder, label, headline, body, cta }, i) => (
              <motion.div
                key={label}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.1}
                onClick={go}
                style={{
                  background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px',
                  padding: '32px 28px 28px', cursor: 'pointer', position: 'relative', overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(15,23,42,0.04)', transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                }}
                whileHover={{ y: -5, boxShadow: '0 16px 40px rgba(15,23,42,0.10)', borderColor: accentBorder }}
              >
                {/* Top accent bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: accent }} />

                {/* Icon + heading row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '13px', background: accentBg, border: `1px solid ${accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon style={{ width: '20px', height: '20px', color: accent }} />
                  </div>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', fontSize: '10px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: accent, background: accentBg, border: `1px solid ${accentBorder}`, padding: '2px 8px', borderRadius: '100px', marginBottom: '5px' }}>
                      {label}
                    </div>
                    <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '17px', fontWeight: 800, color: '#171717', margin: 0, lineHeight: 1.2, letterSpacing: '-0.02em' }}>{headline}</h3>
                  </div>
                </div>

                <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.7, margin: '0 0 22px', fontWeight: 400 }}>{body}</p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 700, color: accent }}>
                  {cta} <ArrowRight style={{ width: '13px', height: '13px' }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          6. LAUNCHPAD CTA — For Founders
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: '#FFFFFF', padding: '88px 0', borderTop: '1px solid #F1F5F9' }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div style={{ borderRadius: '24px', border: '1px solid #FDE68A', background: 'linear-gradient(135deg, #FFFBEB 0%, #FFF7ED 60%, #FFEDD5 100%)', overflow: 'hidden', boxShadow: '0 4px 32px rgba(245,158,11,0.1)' }}>
            <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 0 }}>

              {/* Left — copy */}
              <div style={{ padding: '56px 52px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '5px 14px', borderRadius: '100px', background: '#FFF7ED', border: '1px solid #FDE68A', marginBottom: '24px' }}>
                  <Rocket style={{ width: '12px', height: '12px', color: '#D97706' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#D97706', letterSpacing: '0.09em', textTransform: 'uppercase' }}>For Founders</span>
                </div>
                <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 900, color: '#171717', letterSpacing: '-0.025em', lineHeight: 1.15, margin: '0 0 18px' }}>
                  Get your tool in front of the right buyers
                </h2>
                <p style={{ fontSize: '16px', color: '#64748B', lineHeight: 1.7, margin: '0 0 36px', fontWeight: 400 }}>
                  Submit your AI or SaaS tool via LaunchPad and start building credibility through verified community reviews. Free to list — no credit card required.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  <button
                    onClick={go}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 28px', borderRadius: '13px', fontSize: '14px', fontWeight: 700, color: '#FFFFFF', background: '#F59E0B', border: 'none', cursor: 'pointer', transition: 'box-shadow 0.2s', boxShadow: '0 4px 16px rgba(245,158,11,0.3)' }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 28px rgba(245,158,11,0.45)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(245,158,11,0.3)')}
                  >
                    <Rocket style={{ width: '15px', height: '15px' }} />
                    Submit via LaunchPad
                  </button>
                  <button
                    onClick={go}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 24px', borderRadius: '13px', fontSize: '14px', fontWeight: 600, color: '#374151', background: '#F8FAFC', border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F1F5F9'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#CBD5E1'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0'; }}
                  >
                    <Eye style={{ width: '15px', height: '15px' }} />
                    Learn More
                  </button>
                </div>
              </div>

              {/* Right — feature grid */}
              <div className="lg:border-t-0" style={{ padding: '56px 52px', borderLeft: '1px solid #F1F5F9', borderTop: '1px solid #F1F5F9', background: '#FAFAFA' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '28px' }}>What you get</p>
                <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '20px' }}>
                  {[
                    { icon: Globe,         label: 'Global Visibility',  desc: 'Reach 12,000+ professionals' },
                    { icon: Shield,        label: 'Verified Reviews',   desc: 'Build authentic social proof' },
                    { icon: BarChart3,     label: 'Founder Analytics',  desc: 'Track visits and conversions' },
                    { icon: MessageSquare, label: 'Review Replies',     desc: 'Engage directly with users' },
                    { icon: Award,         label: 'Editorial Features', desc: 'Get hand-picked by our team' },
                    { icon: TrendingUp,    label: 'Real Rankings',      desc: 'Earn your rank organically' },
                  ].map(({ icon: Icon, label, desc }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#FFF7ED', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon style={{ width: '15px', height: '15px', color: '#D97706' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#171717', margin: 0 }}>{label}</p>
                        <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 400, margin: '2px 0 0', lineHeight: 1.5 }}>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
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
