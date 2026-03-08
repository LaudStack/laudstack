/*
 * LaudStack Homepage — Optimised Section Hierarchy
 *
 * Conversion flow rationale:
 *  1. HERO             — Capture attention, state the value prop, search CTA
 *  2. THREE PILLARS    — Explain the platform: Discover · Review · Launch
 *  3. TRENDING         — Show social proof via community activity (FOMO)
 *  4. FRESH LAUNCHES   — Surface novelty & founder activity
 *  5. BROWSE + SIDEBAR — Full directory + leaderboard (exploration mode)
 *  6. LAUNCHPAD CTA    — Founder conversion after user trust is built
 *
 * Design: "Warm Professional" — G2-grade, amber accent, Plus Jakarta Sans headings
 */

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Search, Rocket, Star, BarChart3, Shield, ArrowRight,
  TrendingUp, Users, ChevronUp, Trophy, Zap,
  CheckCircle2, Award, MessageSquare, Flame,
  Sparkles, Eye, Filter, Globe, ShieldCheck, Quote, BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import { MOCK_TOOLS, MOCK_LEADERBOARD, MOCK_REVIEWS, CATEGORIES } from '@/lib/mockData';

// ─── Animation ─────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.48 } }),
};

// ─── Static data ───────────────────────────────────────────────────────────
const POPULAR_SEARCHES = ['AI Writing', 'Code Editor', 'Project Management', 'Design Tools', 'Analytics', 'CRM'];

const STATS = [
  { value: '95+',     label: 'AI & SaaS Tools',     icon: Zap,         color: '#F59E0B' },
  { value: '4,200+',  label: 'Verified Reviews',    icon: Star,        color: '#10B981' },
  { value: '12,000+', label: 'Community Members',   icon: Users,       color: '#3B82F6' },
  { value: '98%',     label: 'Review Authenticity', icon: ShieldCheck, color: '#8B5CF6' },
];

const THREE_PILLARS = [
  {
    icon: Search,
    accent: '#3B82F6', accentBg: '#EFF6FF', accentBorder: '#BFDBFE',
    label: 'Discover',
    headline: 'Find the right tool, fast',
    body: 'Browse 95+ AI and SaaS tools across 12 categories. Filter by pricing, rating, and use case. No noise — just the tools that matter.',
    cta: 'Browse Tools',
  },
  {
    icon: Star,
    accent: '#F59E0B', accentBg: '#FFFBEB', accentBorder: '#FDE68A',
    label: 'Review',
    headline: 'Trust built on real evidence',
    body: 'Every review is verified. Star breakdowns, written feedback, and founder replies give you the full picture before you commit.',
    cta: 'Read Reviews',
  },
  {
    icon: Rocket,
    accent: '#EA580C', accentBg: '#FFF7ED', accentBorder: '#FED7AA',
    label: 'Launch',
    headline: 'Get your tool discovered',
    body: 'Founders submit via LaunchPad and build credibility through community reviews, editorial features, and organic rankings.',
    cta: 'Go to LaunchPad',
  },
];

const trendingTools = MOCK_TOOLS.filter(t => t.badges.includes('trending') || t.badges.includes('top_rated')).slice(0, 4);
const topRated      = [...MOCK_TOOLS].sort((a, b) => b.average_rating - a.average_rating).slice(0, 4);
const newLaunches   = MOCK_TOOLS.slice(4, 8);
const featuredTools = MOCK_TOOLS.filter(t => t.is_featured).slice(0, 6);

const LAUNCH_ACCENTS = [
  'linear-gradient(90deg, #3B82F6, #6366F1)',
  'linear-gradient(90deg, #10B981, #06B6D4)',
  'linear-gradient(90deg, #F59E0B, #EF4444)',
  'linear-gradient(90deg, #8B5CF6, #EC4899)',
];

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
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* ══════════════════════════════════════════════════════
          ANNOUNCEMENT BANNER — dismissible, below navbar
      ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {bannerVisible && (
          <motion.div
            key="banner"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden', background: 'linear-gradient(90deg, #0F172A 0%, #1E293B 100%)', borderBottom: '1px solid rgba(245,158,11,0.2)' }}
          >
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', height: '44px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, justifyContent: 'center' }}>
                <span style={{ fontSize: '14px' }}>🎉</span>
                <p style={{ fontSize: '13px', color: '#E2E8F0', fontWeight: 500, margin: 0 }}>
                  <strong style={{ color: '#F59E0B', fontWeight: 700 }}>50 new tools</strong> added this month — including AI coding, design, and analytics tools.
                  <button onClick={go} style={{ marginLeft: '10px', fontSize: '12px', fontWeight: 700, color: '#F59E0B', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '2px', padding: 0 }}>Browse what's new →</button>
                </p>
              </div>
              <button
                onClick={() => setBannerVisible(false)}
                aria-label="Dismiss announcement"
                style={{ flexShrink: 0, width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', lineHeight: 1, transition: 'background 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.14)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'; }}
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════
          1. HERO
          First impression. Value prop → Search → Social proof.
      ══════════════════════════════════════════════════════ */}
      <section
        className="relative bg-[#F8F9FA]"
        style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '96px', paddingBottom: '100px', paddingLeft: '24px', paddingRight: '24px' }}
      >
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', width: '700px', height: '500px', background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 1 }}>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#fff', border: '1px solid #E2E8F0', color: '#475569', fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '100px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '36px' }}
          >
            <ShieldCheck style={{ width: '13px', height: '13px', color: '#10B981' }} />
            Trusted by 12,000+ developers and founders
          </motion.div>

          <motion.h1
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(36px, 5vw, 58px)', fontWeight: 900, lineHeight: 1.06, letterSpacing: '-0.025em', color: '#0F172A', margin: 0 }}
          >
            The Trusted Source for{' '}
            <span style={{ background: 'linear-gradient(90deg, #D97706 0%, #EA580C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              AI & SaaS Tools.
            </span>
          </motion.h1>

          <motion.p
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
            style={{ marginTop: '20px', fontSize: '17px', color: '#334155', lineHeight: 1.65, maxWidth: '520px' }}
          >
            Real reviews. Honest rankings. The smartest way to discover, compare, and choose the tools your business actually needs.
          </motion.p>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} style={{ marginTop: '36px', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '14px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#94A3B8' }} />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && go()}
                  placeholder="Search 95+ AI & SaaS tools..."
                  style={{ width: '100%', paddingLeft: '48px', paddingRight: '16px', height: '56px', fontSize: '15px', color: '#1E293B', background: 'transparent', border: 'none', outline: 'none' }}
                />
              </div>
              <button onClick={go} style={{ height: '56px', padding: '0 28px', fontWeight: 700, color: '#fff', fontSize: '14px', background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                Search
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Popular:</span>
              {POPULAR_SEARCHES.map(term => (
                <button key={term} onClick={go}
                  style={{ fontSize: '12px', color: '#334155', background: '#fff', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.target as HTMLButtonElement).style.borderColor = '#F59E0B'; (e.target as HTMLButtonElement).style.color = '#B45309'; }}
                  onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = '#E2E8F0'; (e.target as HTMLButtonElement).style.color = '#475569'; }}
                >{term}</button>
              ))}
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}
            style={{ marginTop: '36px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex' }}>
                {[11,12,13,14,15].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/28?img=${i}`} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #F8F9FA', marginLeft: i === 11 ? 0 : '-6px', objectFit: 'cover' }} />
                ))}
              </div>
              <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}><strong style={{ color: '#0F172A' }}>12,000+</strong> professionals</span>
            </div>
            <div style={{ width: '1px', height: '18px', background: '#CBD5E1' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {[1,2,3,4,5].map(i => <Star key={i} style={{ width: '14px', height: '14px', fill: '#FBBF24', color: '#FBBF24' }} />)}
              <span style={{ fontSize: '13px', color: '#475569', marginLeft: '4px', fontWeight: 500 }}><strong style={{ color: '#0F172A' }}>4.9</strong> avg rating</span>
            </div>
            <div style={{ width: '1px', height: '18px', background: '#CBD5E1' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 style={{ width: '15px', height: '15px', color: '#10B981' }} />
              <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}><strong style={{ color: '#0F172A' }}>98%</strong> verified reviews</span>
            </div>
          </motion.div>
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0, zIndex: 2 }}>
          <svg viewBox="0 0 1440 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }} preserveAspectRatio="none">
            <path d="M0,72 C360,0 1080,0 1440,72 L1440,72 L0,72 Z" fill="#ffffff"/>
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          2. THREE PILLARS — Discover · Review · Launch
          Explain the platform before showing content.
          Users need to understand WHY this place is different.
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: '#FFFFFF', padding: '80px 0 72px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
              style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Everything in one place
            </motion.p>
            <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', margin: '0 0 14px' }}>
              Built for how developers actually choose tools
            </motion.h2>
            <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
              style={{ fontSize: '15px', color: '#475569', maxWidth: '480px', margin: '0 auto', lineHeight: 1.65 }}>
              LaudStack is where the technical community discovers, evaluates, and launches AI & SaaS tools.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '20px' }}>
            {THREE_PILLARS.map(({ icon: Icon, accent, accentBg, accentBorder, label, headline, body, cta }, i) => (
              <motion.div
                key={label}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.1}
                onClick={go}
                style={{
                  background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '18px',
                  padding: '32px 28px', cursor: 'pointer', position: 'relative', overflow: 'hidden',
                  boxShadow: '0 1px 4px rgba(15,23,42,0.05)', transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                }}
                whileHover={{ y: -4, boxShadow: '0 14px 36px rgba(15,23,42,0.09)', borderColor: accentBorder }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: accent }} />
                <div style={{ width: '48px', height: '48px', borderRadius: '13px', background: accentBg, border: `1px solid ${accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <Icon style={{ width: '22px', height: '22px', color: accent }} />
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: accent, background: accentBg, border: `1px solid ${accentBorder}`, padding: '3px 9px', borderRadius: '100px', marginBottom: '12px' }}>
                  {label}
                </div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 10px', lineHeight: 1.25, letterSpacing: '-0.02em' }}>{headline}</h3>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.65, margin: '0 0 20px' }}>{body}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 700, color: accent }}>
                  {cta} <ArrowRight style={{ width: '13px', height: '13px' }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          4. TRENDING THIS WEEK
          Community momentum — FOMO drives engagement.
          Show what's popular before showing what's best.
      ══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#F8FAFC] border-y border-slate-100">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-100">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">Trending This Week</p>
                </div>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.025em' }}>
                What the community is loving right now
              </h2>
              <p className="text-slate-500 mt-2 text-sm font-medium">Ranked by community votes, reviews, and engagement over the last 7 days.</p>
            </div>
            <button onClick={go} className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors group">
              View All Trending <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trendingTools.map((tool, i) => (
              <motion.div key={tool.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.1}>
                <ToolCard tool={tool} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          5. FRESH LAUNCHES
          Novelty signal — after trust is established, show new.
          Founders' tools get visibility; users get first-mover edge.
      ══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#F8FAFC] border-y border-slate-100">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100">
                  <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Fresh Launches</p>
                </div>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.025em' }}>
                Newly launched tools
              </h2>
              <p className="text-slate-500 mt-2 text-sm font-medium">The latest AI and SaaS tools submitted by founders this week.</p>
            </div>
            <button onClick={go} className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors group">
              View All Launches <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {newLaunches.map((tool, i) => (
              <motion.div
                key={tool.id}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.08}
                onClick={go}
                style={{
                  background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0',
                  overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                  boxShadow: '0 1px 4px rgba(15,23,42,0.06)', transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                }}
                whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(15,23,42,0.10)', borderColor: '#CBD5E1' }}
              >
                <div style={{ height: '3px', background: LAUNCH_ACCENTS[i % 4] }} />
                <div style={{ padding: '18px 18px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0', flexShrink: 0, background: '#F8FAFC' }}>
                      <img src={tool.logo_url} alt={tool.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); go(); }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1px', padding: '6px 10px', borderRadius: '10px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', transition: 'all 0.15s ease', minWidth: '44px' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#F59E0B'; (e.currentTarget as HTMLButtonElement).style.background = '#FFFBEB'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC'; }}
                    >
                      <ChevronUp style={{ width: '14px', height: '14px', color: '#64748B' }} />
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', lineHeight: 1 }}>{tool.upvote_count}</span>
                    </button>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 800, fontSize: '15px', color: '#0F172A', margin: '0 0 4px', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.2 }}>{tool.name}</h3>
                    <p style={{ fontSize: '13px', color: '#475569', fontWeight: 500, margin: 0, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{tool.tagline}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star style={{ width: '13px', height: '13px', fill: '#FBBF24', color: '#FBBF24' }} />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>{tool.average_rating.toFixed(1)}</span>
                      <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>({tool.review_count})</span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          5. BROWSE + TOOLS GRID + LEADERBOARD SIDEBAR
          Full directory — users are now warmed up and ready to explore.
          Placed after trust sections so intent is high.
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: '#F8FAFC', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '72px 40px 80px' }}>

          {/* ── Section header ── */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '28px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: '#F1F5F9', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Filter style={{ width: '11px', height: '11px', color: '#64748B' }} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Browse by Category</span>
              </div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '28px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', margin: 0 }}>
                Find tools for every use case
              </h2>
            </div>
            <button onClick={go} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 700, color: '#B45309', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#92400E')}
              onMouseLeave={e => (e.currentTarget.style.color = '#B45309')}
            >
              All Categories <ArrowRight style={{ width: '13px', height: '13px' }} />
            </button>
          </div>

          {/* ── Category pills ── */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '36px', paddingBottom: '28px', borderBottom: '1px solid #E2E8F0' }}>
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

          {/* ── Two-column layout: tools grid + sidebar ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: '32px' }}>

            {/* Tools Grid (2/3) */}
            <div className="lg:col-span-2">
              {/* Result bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', padding: '10px 14px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
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
                  <motion.div key={tool.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.07}>
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
                <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAFAFA' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#FFFBEB', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trophy style={{ width: '13px', height: '13px', color: '#D97706' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: '#D97706', letterSpacing: '0.07em', textTransform: 'uppercase', margin: 0, lineHeight: 1 }}>This Week</p>
                        <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: '2px 0 0' }}>Top Ranked Tools</h3>
                      </div>
                    </div>
                    <button onClick={go} style={{ fontSize: '11px', fontWeight: 700, color: '#D97706', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Full Board →</button>
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
                          <p style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tool.category}</p>
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
                    <button onClick={go} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '12px', fontWeight: 700, color: '#D97706', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', transition: 'color 0.12s' }}>
                      View Full Leaderboard <ArrowRight style={{ width: '12px', height: '12px' }} />
                    </button>
                  </div>
                </div>

                {/* Recent Reviews */}
                <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px', boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MessageSquare style={{ width: '13px', height: '13px', color: '#16A34A' }} />
                    </div>
                    <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Recent Reviews</h3>
                  </div>
                  {MOCK_REVIEWS.slice(0, 3).map((review, idx) => (
                    <div key={review.id} style={{ marginBottom: idx < 2 ? '12px' : 0, paddingBottom: idx < 2 ? '12px' : 0, borderBottom: idx < 2 ? '1px solid #F1F5F9' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} style={{ width: '11px', height: '11px', fill: i <= review.rating ? '#FBBF24' : '#E2E8F0', color: i <= review.rating ? '#FBBF24' : '#E2E8F0' }} />
                          ))}
                        </div>
                        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>{review.user?.name}</span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#374151', fontWeight: 500, margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{review.title}</p>
                    </div>
                  ))}
                  <button onClick={go} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '12px', fontSize: '12px', fontWeight: 700, color: '#16A34A', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    Read All Reviews <ArrowRight style={{ width: '11px', height: '11px' }} />
                  </button>
                </div>

                {/* Founder CTA */}
                <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #FDE68A', background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', padding: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(135deg, #F59E0B, #EA580C)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Rocket style={{ width: '15px', height: '15px', color: '#FFFFFF' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: '#92400E', letterSpacing: '0.07em', textTransform: 'uppercase', margin: 0 }}>For Founders</p>
                      <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: '1px 0 0' }}>Are you a founder?</h3>
                    </div>
                  </div>
                  <p style={{ fontSize: '12px', color: '#78350F', fontWeight: 500, margin: '0 0 14px', lineHeight: 1.55 }}>Submit your tool and get discovered by thousands of developers. Free to list.</p>
                  <button
                    onClick={go}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: '#FFFFFF', background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)', border: 'none', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 14px rgba(245,158,11,0.35)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
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
          8. LAUNCHPAD CTA — For Founders
          Last section before footer. User trust is fully built.
          Founders see this after seeing the platform's quality.
      ══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="p-10 lg:p-14">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-wider mb-6">
                  <Rocket className="h-3.5 w-3.5" />
                  For Founders
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Get your tool in front of the right buyers
                </h2>
                <p className="text-slate-600 leading-relaxed mb-8">
                  Submit your AI or SaaS tool via LaunchPad and start building credibility through verified community reviews. Free to list — no credit card required.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={go}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white text-sm transition-all hover:shadow-lg hover:shadow-amber-500/30 hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)' }}
                  >
                    <Rocket className="h-4 w-4" />
                    Submit via LaunchPad
                  </button>
                  <button onClick={go} className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-slate-700 text-sm border border-slate-300 hover:border-slate-400 hover:bg-white transition-all">
                    <Eye className="h-4 w-4" />
                    Learn More
                  </button>
                </div>
              </div>
              <div className="p-10 lg:p-14 border-t lg:border-t-0 lg:border-l border-amber-200/60">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-6">What you get</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: Globe,         label: 'Global Visibility',  desc: 'Reach 12,000+ professionals' },
                    { icon: Shield,        label: 'Verified Reviews',   desc: 'Build authentic social proof' },
                    { icon: BarChart3,     label: 'Founder Analytics',  desc: 'Track visits and conversions' },
                    { icon: MessageSquare, label: 'Review Replies',     desc: 'Engage directly with users' },
                    { icon: Award,         label: 'Editorial Features', desc: 'Get hand-picked by our team' },
                    { icon: TrendingUp,    label: 'Real Rankings',      desc: 'Earn your rank organically' },
                  ].map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{label}</p>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">{desc}</p>
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
