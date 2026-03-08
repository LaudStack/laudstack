/*
 * LaudStack Homepage — Enterprise-Grade Polish
 *
 * Design Philosophy: "Warm Professional" — G2 meets ProductHunt
 *  - Clean white/off-white alternating sections with precise border separators
 *  - Amber (#F59E0B → #EA580C) as the single accent color system
 *  - Plus Jakarta Sans for headings, system-ui for body
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
import ToolCard from '@/components/ToolCard';
import { MOCK_TOOLS, MOCK_LEADERBOARD, MOCK_REVIEWS, CATEGORIES } from '@/lib/mockData';

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

const trendingTools = MOCK_TOOLS.filter(t => t.badges.includes('trending') || t.badges.includes('top_rated')).slice(0, 4);
const newLaunches   = MOCK_TOOLS.slice(4, 8);

const LAUNCH_ACCENTS = [
  { from: '#3B82F6', to: '#6366F1' },
  { from: '#10B981', to: '#06B6D4' },
  { from: '#F59E0B', to: '#EF4444' },
  { from: '#8B5CF6', to: '#EC4899' },
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
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(22px, 2.5vw, 30px)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', margin: '0 0 8px', lineHeight: 1.2 }}>
          {headline}
        </h2>
        <p style={{ fontSize: '14px', color: '#64748B', fontWeight: 500, margin: 0, lineHeight: 1.6 }}>{subtext}</p>
      </div>
      {cta && onCta && (
        <button
          onClick={onCta}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 700, color: ctaColor || '#B45309', background: 'none', border: 'none', cursor: 'pointer', padding: 0, whiteSpace: 'nowrap', transition: 'opacity 0.15s' }}
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
  const [bannerVisible, setBannerVisible]        = useState(true);
  const go = () => toast.info('Feature coming soon!');

  const allTools = selectedCategory === 'All'
    ? MOCK_TOOLS
    : MOCK_TOOLS.filter(t => t.category === selectedCategory);

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
            style={{ overflow: 'hidden', background: '#0F172A', borderBottom: '1px solid rgba(245,158,11,0.25)' }}
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
            <ShieldCheck style={{ width: '13px', height: '13px', color: '#10B981' }} />
            Trusted by 12,000+ professionals and founders
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(38px, 5.5vw, 64px)', fontWeight: 900, lineHeight: 1.04, letterSpacing: '-0.03em', color: '#0F172A', margin: 0 }}
          >
            The Trusted Source for{' '}
            <span style={{ background: 'linear-gradient(90deg, #D97706 0%, #EA580C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              AI & SaaS Tools.
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
                  onKeyDown={e => e.key === 'Enter' && go()}
                  placeholder="Search 95+ AI & SaaS tools..."
                  style={{ width: '100%', paddingLeft: '50px', paddingRight: '16px', height: '58px', fontSize: '15px', color: '#1E293B', background: 'transparent', border: 'none', outline: 'none' }}
                />
              </div>
              <button
                onClick={go}
                style={{ height: '58px', padding: '0 32px', fontWeight: 700, color: '#fff', fontSize: '14px', letterSpacing: '0.01em', background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)', border: 'none', cursor: 'pointer', flexShrink: 0, transition: 'opacity 0.15s' }}
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
                <button key={term} onClick={go}
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
              <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}><strong style={{ color: '#0F172A', fontWeight: 700 }}>12,000+</strong> professionals</span>
            </div>
            <div style={{ width: '1px', height: '20px', background: '#E2E8F0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {[1,2,3,4,5].map(i => <Star key={i} style={{ width: '14px', height: '14px', fill: '#FBBF24', color: '#FBBF24' }} />)}
              <span style={{ fontSize: '13px', color: '#475569', marginLeft: '5px', fontWeight: 500 }}><strong style={{ color: '#0F172A', fontWeight: 700 }}>4.9</strong> avg rating</span>
            </div>
            <div style={{ width: '1px', height: '20px', background: '#E2E8F0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 style={{ width: '15px', height: '15px', color: '#10B981' }} />
              <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}><strong style={{ color: '#0F172A', fontWeight: 700 }}>98%</strong> verified reviews</span>
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
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', margin: '0 0 16px', lineHeight: 1.15 }}>
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
                    <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.2, letterSpacing: '-0.02em' }}>{headline}</h3>
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
          3. TRENDING THIS WEEK
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: '#FAFAFA', padding: '80px 0', borderBottom: '1px solid #F1F5F9' }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <SectionHeader
            label="Trending This Week"
            labelIcon={Flame}
            labelColor="#C2410C"
            labelBg="#FFF7ED"
            labelBorder="#FED7AA"
            headline="What the community is loving right now"
            subtext="Ranked by community votes, reviews, and engagement over the last 7 days."
            cta="View All Trending"
            ctaColor="#C2410C"
            onCta={go}
          />
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '14px' }}>
            {trendingTools.map((tool, i) => (
              <motion.div key={tool.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.08}>
                <ToolCard tool={tool} />
              </motion.div>
            ))}
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
            labelColor="#1D4ED8"
            labelBg="#EFF6FF"
            labelBorder="#BFDBFE"
            headline="Newly launched tools"
            subtext="The latest AI and SaaS tools submitted by founders this week."
            cta="View All Launches"
            ctaColor="#1D4ED8"
            onCta={go}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4" style={{ gap: '16px' }}>
            {newLaunches.map((tool, i) => (
              <motion.div
                key={tool.id}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.08}
                onClick={go}
                style={{
                  background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0',
                  overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                  boxShadow: '0 1px 4px rgba(15,23,42,0.05)', transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                }}
                whileHover={{ y: -5, boxShadow: '0 14px 36px rgba(15,23,42,0.10)', borderColor: '#CBD5E1' }}
              >
                {/* Gradient accent bar */}
                <div style={{ height: '3px', background: `linear-gradient(90deg, ${LAUNCH_ACCENTS[i % 4].from}, ${LAUNCH_ACCENTS[i % 4].to})` }} />

                <div style={{ padding: '20px 20px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Logo + upvote row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '13px', overflow: 'hidden', border: '1px solid #E2E8F0', flexShrink: 0, background: '#F8FAFC' }}>
                      <img src={tool.logo_url} alt={tool.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); go(); }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1px', padding: '7px 11px', borderRadius: '10px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', transition: 'all 0.15s ease', minWidth: '44px' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#F59E0B'; (e.currentTarget as HTMLButtonElement).style.background = '#FFFBEB'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC'; }}
                    >
                      <ChevronUp style={{ width: '14px', height: '14px', color: '#64748B' }} />
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', lineHeight: 1 }}>{tool.upvote_count}</span>
                    </button>
                  </div>

                  {/* Name + tagline */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 800, fontSize: '15px', color: '#0F172A', margin: '0 0 5px', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.2, letterSpacing: '-0.01em' }}>{tool.name}</h3>
                    <p style={{ fontSize: '13px', color: '#64748B', fontWeight: 400, margin: 0, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{tool.tagline}</p>
                  </div>

                  {/* Footer row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star style={{ width: '13px', height: '13px', fill: '#FBBF24', color: '#FBBF24' }} />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>{tool.average_rating.toFixed(1)}</span>
                      <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>({tool.review_count})</span>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', textTransform: 'uppercase', letterSpacing: '0.06em' }}>New</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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
            labelColor="#475569"
            labelBg="#F1F5F9"
            labelBorder="#E2E8F0"
            headline="Find tools for every use case"
            subtext={`${MOCK_TOOLS.length} verified tools across ${CATEGORIES.length - 1} categories.`}
            cta="All Categories"
            ctaColor="#B45309"
            onCta={go}
          />

          {/* Category pills — single-row scroll on mobile, wrap on desktop */}
          <div style={{ marginBottom: '36px', paddingBottom: '28px', borderBottom: '1px solid #E2E8F0' }}>
            <div className="flex md:flex-wrap gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
              {CATEGORIES.map(({ name, icon, count }) => {
                const active = selectedCategory === name;
                return (
                  <button
                    key={name}
                    onClick={() => setSelectedCategory(name)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '7px',
                      padding: '8px 14px', borderRadius: '10px', cursor: 'pointer',
                      fontSize: '13px', fontWeight: 600, transition: 'all 0.15s',
                      flexShrink: 0,
                      border: active ? '1.5px solid #0F172A' : '1.5px solid #E2E8F0',
                      background: active ? '#0F172A' : '#FFFFFF',
                      color: active ? '#FFFFFF' : '#374151',
                      boxShadow: active ? '0 2px 8px rgba(15,23,42,0.15)' : '0 1px 2px rgba(15,23,42,0.04)',
                    }}
                    onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.borderColor = '#F59E0B'; (e.currentTarget as HTMLButtonElement).style.color = '#B45309'; (e.currentTarget as HTMLButtonElement).style.background = '#FFFBEB'; } }}
                    onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLButtonElement).style.color = '#374151'; (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF'; } }}
                  >
                    <span style={{ fontSize: '14px', lineHeight: 1 }}>{icon}</span>
                    <span>{name}</span>
                    <span style={{
                      fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '5px',
                      background: active ? 'rgba(255,255,255,0.15)' : '#F1F5F9',
                      color: active ? '#FFFFFF' : '#64748B',
                    }}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: '32px' }}>

            {/* Tools grid (2/3) */}
            <div className="lg:col-span-2">
              {/* Result bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', padding: '10px 16px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
                    {selectedCategory === 'All' ? 'All Tools' : selectedCategory}
                  </span>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#CBD5E1', display: 'inline-block' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{allTools.length} results</span>
                </div>
                <select
                  style={{ fontSize: '12px', fontWeight: 600, color: '#374151', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '6px 10px', outline: 'none', cursor: 'pointer' }}
                  onChange={go}
                >
                  <option>Top Rated</option>
                  <option>Trending</option>
                  <option>Newest</option>
                  <option>Most Reviewed</option>
                </select>
              </div>

              <div className="flex flex-col" style={{ gap: '12px' }}>
                {allTools.map((tool, i) => (
                  <motion.div key={tool.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.06}>
                    <ToolCard tool={tool} />
                  </motion.div>
                ))}
              </div>

              <div style={{ marginTop: '28px', textAlign: 'center' }}>
                <button
                  onClick={go}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '11px 28px', borderRadius: '12px', border: '1.5px solid #E2E8F0', fontSize: '13px', fontWeight: 700, color: '#374151', background: '#FFFFFF', cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#F59E0B'; (e.currentTarget as HTMLButtonElement).style.color = '#B45309'; (e.currentTarget as HTMLButtonElement).style.background = '#FFFBEB'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLButtonElement).style.color = '#374151'; (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF'; }}
                >
                  Load more tools <ArrowRight style={{ width: '13px', height: '13px' }} />
                </button>
              </div>
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
                        <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: '2px 0 0' }}>Top Ranked Tools</h3>
                      </div>
                    </div>
                    <button onClick={go} style={{ fontSize: '11px', fontWeight: 700, color: '#D97706', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'opacity 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >Full Board →</button>
                  </div>
                  <div>
                    {leaderboard.map(({ rank, tool, rank_change }, idx) => (
                      <div
                        key={tool.id}
                        onClick={go}
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
                          <img src={tool.logo_url} alt={tool.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tool.name}</p>
                          <p style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500, margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tool.category}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '12px', fontWeight: 700, color: '#374151' }}>
                            <ChevronUp style={{ width: '11px', height: '11px', color: '#F59E0B' }} />
                            {tool.upvote_count >= 1000 ? `${(tool.upvote_count/1000).toFixed(1)}k` : tool.upvote_count}
                          </div>
                          {rank_change !== 0 && (
                            <span style={{ fontSize: '10px', fontWeight: 700, color: rank_change > 0 ? '#10B981' : '#EF4444' }}>
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
                    <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Recent Reviews</h3>
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
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #F59E0B, #EA580C)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(245,158,11,0.3)' }}>
                      <Rocket style={{ width: '15px', height: '15px', color: '#FFFFFF' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: '#92400E', letterSpacing: '0.07em', textTransform: 'uppercase', margin: 0 }}>For Founders</p>
                      <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: '2px 0 0' }}>Are you a founder?</h3>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: '#78350F', fontWeight: 400, margin: '0 0 16px', lineHeight: 1.6 }}>Submit your tool and get discovered by thousands of buyers. Free to list.</p>
                  <button
                    onClick={go}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 16px', borderRadius: '11px', fontSize: '13px', fontWeight: 700, color: '#FFFFFF', background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)', border: 'none', cursor: 'pointer', transition: 'box-shadow 0.15s', boxShadow: '0 2px 8px rgba(245,158,11,0.25)' }}
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
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.025em', lineHeight: 1.15, margin: '0 0 18px' }}>
                  Get your tool in front of the right buyers
                </h2>
                <p style={{ fontSize: '16px', color: '#64748B', lineHeight: 1.7, margin: '0 0 36px', fontWeight: 400 }}>
                  Submit your AI or SaaS tool via LaunchPad and start building credibility through verified community reviews. Free to list — no credit card required.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  <button
                    onClick={go}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 28px', borderRadius: '13px', fontSize: '14px', fontWeight: 700, color: '#FFFFFF', background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)', border: 'none', cursor: 'pointer', transition: 'box-shadow 0.2s', boxShadow: '0 4px 16px rgba(245,158,11,0.3)' }}
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
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: 0 }}>{label}</p>
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
    </div>
  );
}
