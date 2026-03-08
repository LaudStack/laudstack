/*
 * LaudStack Homepage — Final Polish
 * Design Philosophy: "Warm Professional" — G2-grade enterprise trust
 * Three Pillars: Discover · Review · Launch
 * Target: Senior developers & technical founders who judge quality instantly
 *
 * Section order:
 *  1. Hero — bold headline, search, social proof
 *  2. Platform Stats Bar — trust signals
 *  3. Three Pillars — Discover / Review / Launch value props
 *  4. Trending This Week — community-ranked tools
 *  5. Fresh Launches — newest tools from founders
 *  6. Browse + Tools Grid + Leaderboard Sidebar
 *  7. Top Rated — highest verified review scores
 *  8. Recent Reviews — real community voices
 *  9. LaunchPad CTA — founder section (subtle, not dominant)
 * 10. Footer
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Rocket, Star, BarChart3, Shield, ArrowRight,
  TrendingUp, Users, ChevronUp, Trophy, Zap,
  CheckCircle2, Award, MessageSquare, Flame,
  Sparkles, Eye, Filter, Globe, BookOpen,
  ShieldCheck, Quote
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import { MOCK_TOOLS, MOCK_LEADERBOARD, MOCK_REVIEWS, CATEGORIES } from '@/lib/mockData';

// ─── Animation variants ────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.45 },
  }),
};

// ─── Static data ───────────────────────────────────────────────────────────
const POPULAR_SEARCHES = ['AI Writing', 'Code Editor', 'Project Management', 'Design Tools', 'Analytics', 'CRM'];

const PLATFORM_STATS = [
  { value: '95+',     label: 'AI & SaaS Tools',     icon: Zap,         color: '#F59E0B' },
  { value: '4,200+',  label: 'Verified Reviews',    icon: Star,        color: '#10B981' },
  { value: '12,000+', label: 'Community Members',   icon: Users,       color: '#3B82F6' },
  { value: '98%',     label: 'Review Authenticity', icon: ShieldCheck, color: '#8B5CF6' },
];

const THREE_PILLARS = [
  {
    icon: Search,
    accent: '#3B82F6',
    accentBg: '#EFF6FF',
    accentBorder: '#BFDBFE',
    label: 'Discover',
    headline: 'Find the right tool, fast',
    body: 'Browse 95+ AI and SaaS tools across 12 categories. Filter by pricing, rating, and use case. No noise — just the tools that matter.',
    cta: 'Browse Tools',
  },
  {
    icon: Star,
    accent: '#F59E0B',
    accentBg: '#FFFBEB',
    accentBorder: '#FDE68A',
    label: 'Review',
    headline: 'Trust built on real evidence',
    body: 'Every review is verified. Star breakdowns, written feedback, and founder replies give you the full picture before you commit.',
    cta: 'Read Reviews',
  },
  {
    icon: Rocket,
    accent: '#EA580C',
    accentBg: '#FFF7ED',
    accentBorder: '#FED7AA',
    label: 'Launch',
    headline: 'Get your tool discovered',
    body: 'Founders submit via LaunchPad and build credibility through community reviews, editorial features, and organic rankings.',
    cta: 'Go to LaunchPad',
  },
];

const trendingTools = MOCK_TOOLS.filter(t => t.badges.includes('trending') || t.badges.includes('top_rated')).slice(0, 4);
const newLaunches   = MOCK_TOOLS.slice(4, 8);
const topRated      = [...MOCK_TOOLS].sort((a, b) => b.average_rating - a.average_rating).slice(0, 4);
const featuredTools = MOCK_TOOLS.filter(t => t.is_featured).slice(0, 6);

const LAUNCH_ACCENTS = [
  'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
  'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
  'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
  'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
];

// ─── Component ─────────────────────────────────────────────────────────────
export default function Home() {
  const [searchQuery, setSearchQuery]           = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const go = () => toast.info('Feature coming soon!');

  const allTools = selectedCategory === 'All'
    ? MOCK_TOOLS
    : MOCK_TOOLS.filter(t => t.category === selectedCategory);

  const leaderboard = MOCK_LEADERBOARD.slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {/* ════════════════════════════════════════════════════════════
          1. HERO
          Clean, centered, professional. Headline → Search → Proof.
      ════════════════════════════════════════════════════════════ */}
      <section
        style={{
          background: '#F8F9FA',
          minHeight: 'calc(100vh - 72px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '96px 24px 120px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Very subtle background grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.25,
        }} />
        {/* Amber glow */}
        <div style={{
          position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '800px', height: '600px',
          background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.07) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div style={{ width: '100%', maxWidth: '680px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 1 }}>

          {/* Eyebrow badge */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              background: '#FFFFFF', border: '1px solid #E2E8F0',
              padding: '6px 16px', borderRadius: '100px',
              boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
              fontSize: '12px', fontWeight: 600, color: '#475569',
              letterSpacing: '0.01em', marginBottom: '32px',
            }}>
              <ShieldCheck style={{ width: '13px', height: '13px', color: '#10B981' }} />
              Trusted by 12,000+ developers and founders
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(38px, 5.5vw, 62px)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: '#0F172A',
              margin: 0,
            }}
          >
            Where developers go to{' '}
            <span style={{
              background: 'linear-gradient(90deg, #D97706 0%, #EA580C 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              find & review
            </span>{' '}
            AI tools.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
            style={{
              marginTop: '22px',
              fontSize: '17px',
              color: '#334155',
              lineHeight: 1.7,
              maxWidth: '520px',
              fontWeight: 400,
            }}
          >
            Honest rankings. Verified reviews. The most trusted directory for AI & SaaS tools — built for technical teams who demand signal over noise.
          </motion.p>

          {/* Search bar */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} style={{ marginTop: '36px', width: '100%' }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              background: '#FFFFFF',
              borderRadius: '14px',
              boxShadow: '0 4px 24px rgba(15,23,42,0.09), 0 1px 3px rgba(15,23,42,0.06)',
              border: '1.5px solid #E2E8F0',
              overflow: 'hidden',
              transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
            }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#94A3B8' }} />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && go()}
                  placeholder="Search 95+ AI & SaaS tools..."
                  style={{
                    width: '100%', paddingLeft: '50px', paddingRight: '16px',
                    height: '58px', fontSize: '15px', color: '#1E293B',
                    background: 'transparent', border: 'none', outline: 'none',
                    fontFamily: "'Inter', sans-serif",
                  }}
                />
              </div>
              <button
                onClick={go}
                style={{
                  height: '58px', padding: '0 28px',
                  fontWeight: 700, color: '#FFFFFF', fontSize: '14px',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)',
                  border: 'none', cursor: 'pointer', flexShrink: 0,
                  letterSpacing: '0.02em', fontFamily: "'Inter', sans-serif",
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.92'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
              >
                Search
              </button>
            </div>

            {/* Popular tags */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Popular:</span>
              {POPULAR_SEARCHES.map(term => (
                <button
                  key={term}
                  onClick={go}
                  style={{
                    fontSize: '12px', color: '#475569', background: '#FFFFFF',
                    border: '1px solid #CBD5E1', borderRadius: '6px',
                    padding: '4px 11px', cursor: 'pointer', fontWeight: 600,
                    transition: 'all 0.15s', fontFamily: "'Inter', sans-serif",
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.borderColor = '#F59E0B';
                    el.style.color = '#B45309';
                    el.style.background = '#FFFBEB';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.borderColor = '#CBD5E1';
                    el.style.color = '#475569';
                    el.style.background = '#FFFFFF';
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Social proof row */}
          <motion.div
            initial="hidden" animate="visible" variants={fadeUp} custom={4}
            style={{ marginTop: '36px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}
          >
            {/* Avatars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex' }}>
                {[11, 12, 13, 14, 15].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/28?img=${i}`} alt=""
                    style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #F8F9FA', marginLeft: i === 11 ? 0 : '-7px', objectFit: 'cover' }} />
                ))}
              </div>
              <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                <strong style={{ color: '#0F172A', fontWeight: 700 }}>12,000+</strong> professionals
              </span>
            </div>

            <div style={{ width: '1px', height: '18px', background: '#CBD5E1' }} />

            {/* Stars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} style={{ width: '14px', height: '14px', fill: '#FBBF24', color: '#FBBF24' }} />
                ))}
              </div>
              <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                <strong style={{ color: '#0F172A', fontWeight: 700 }}>4.9</strong> avg rating
              </span>
            </div>

            <div style={{ width: '1px', height: '18px', background: '#CBD5E1' }} />

            {/* Verified */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 style={{ width: '15px', height: '15px', color: '#10B981' }} />
              <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                <strong style={{ color: '#0F172A', fontWeight: 700 }}>98%</strong> verified reviews
              </span>
            </div>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0, zIndex: 2 }}>
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }} preserveAspectRatio="none">
            <path d="M0,60 C480,0 960,0 1440,60 L1440,60 L0,60 Z" fill="#FFFFFF" />
          </svg>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          2. PLATFORM STATS BAR
          Four trust metrics in a clean horizontal band
      ════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid #F1F5F9', padding: '0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
          <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: '0' }}>
            {PLATFORM_STATS.map(({ value, label, icon: Icon, color }, i) => (
              <motion.div
                key={label}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.08}
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '28px 24px',
                  borderRight: i % 2 === 0 ? '1px solid #F1F5F9' : 'none',
                  borderBottom: i < 2 ? '1px solid #F1F5F9' : 'none',
                }}
                className="lg:[border-right:1px_solid_#F1F5F9] lg:[border-bottom:none]"
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                  background: `${color}14`, border: `1px solid ${color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon style={{ width: '20px', height: '20px', color }} />
                </div>
                <div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', lineHeight: 1, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' }}>
                    {value}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500, marginTop: '3px' }}>
                    {label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          3. THREE PILLARS — Discover · Review · Launch
          The core value proposition of the platform
      ════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#FFFFFF', padding: '80px 0 72px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
          {/* Section header */}
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <motion.p
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
              style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}
            >
              Everything in one place
            </motion.p>
            <motion.h2
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(28px, 3vw, 38px)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', margin: 0 }}
            >
              Built for how developers actually choose tools
            </motion.h2>
            <motion.p
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
              style={{ fontSize: '16px', color: '#475569', marginTop: '14px', maxWidth: '520px', margin: '14px auto 0', lineHeight: 1.65 }}
            >
              LaudStack is where the technical community discovers, evaluates, and launches AI & SaaS tools.
            </motion.p>
          </div>

          {/* Three pillars grid */}
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '24px' }}>
            {THREE_PILLARS.map(({ icon: Icon, accent, accentBg, accentBorder, label, headline, body, cta }, i) => (
              <motion.div
                key={label}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.1}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '20px',
                  padding: '36px 32px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                  boxShadow: '0 1px 4px rgba(15,23,42,0.05)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(15,23,42,0.10)', borderColor: accentBorder }}
                onClick={go}
              >
                {/* Top accent line */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: accent }} />

                {/* Icon */}
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px',
                  background: accentBg, border: `1px solid ${accentBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '24px',
                }}>
                  <Icon style={{ width: '24px', height: '24px', color: accent }} />
                </div>

                {/* Label pill */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center',
                  fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: accent,
                  background: accentBg, border: `1px solid ${accentBorder}`,
                  padding: '3px 10px', borderRadius: '100px',
                  marginBottom: '14px',
                }}>
                  {label}
                </div>

                <h3 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '20px', fontWeight: 800, color: '#0F172A',
                  margin: '0 0 12px', lineHeight: 1.25, letterSpacing: '-0.02em',
                }}>
                  {headline}
                </h3>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.65, margin: '0 0 24px', fontWeight: 400 }}>
                  {body}
                </p>

                {/* CTA link */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: accent }}>
                  {cta}
                  <ArrowRight style={{ width: '14px', height: '14px' }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          4. TRENDING THIS WEEK
          Community-ranked tools — votes + reviews + engagement
      ════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#F8FAFC', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9', padding: '80px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '100px', padding: '4px 12px' }}>
                  <Flame style={{ width: '13px', height: '13px', color: '#EA580C' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#C2410C', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Trending This Week</span>
                </div>
              </div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(24px, 2.5vw, 32px)', fontWeight: 800, color: '#0F172A', margin: '0 0 8px', letterSpacing: '-0.025em' }}>
                What the community is loving right now
              </h2>
              <p style={{ fontSize: '14px', color: '#64748B', fontWeight: 400, margin: 0 }}>
                Ranked by community votes, reviews, and engagement over the last 7 days.
              </p>
            </div>
            <button
              onClick={go}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#EA580C', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'opacity 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.75'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
            >
              View All Trending <ArrowRight style={{ width: '14px', height: '14px' }} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '16px' }}>
            {trendingTools.map((tool, i) => (
              <motion.div key={tool.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.1}>
                <ToolCard tool={tool} rank={i + 1} rankChange={[2, -1, 0, 3][i]} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          5. FRESH LAUNCHES
          Newest tools submitted by founders
      ════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#FFFFFF', padding: '80px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '100px', padding: '4px 12px' }}>
                  <Sparkles style={{ width: '13px', height: '13px', color: '#2563EB' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#1D4ED8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Fresh Launches</span>
                </div>
              </div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(24px, 2.5vw, 32px)', fontWeight: 800, color: '#0F172A', margin: '0 0 8px', letterSpacing: '-0.025em' }}>
                Newly launched tools
              </h2>
              <p style={{ fontSize: '14px', color: '#64748B', fontWeight: 400, margin: 0 }}>
                The latest AI and SaaS tools submitted by founders this week.
              </p>
            </div>
            <button
              onClick={go}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'opacity 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.75'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
            >
              View All Launches <ArrowRight style={{ width: '14px', height: '14px' }} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4" style={{ gap: '16px' }}>
            {newLaunches.map((tool, i) => (
              <motion.div
                key={tool.id}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.08}
                onClick={go}
                style={{
                  background: '#FFFFFF', borderRadius: '16px',
                  border: '1px solid #E2E8F0', overflow: 'hidden',
                  cursor: 'pointer', display: 'flex', flexDirection: 'column',
                  boxShadow: '0 1px 4px rgba(15,23,42,0.05)',
                  transition: 'box-shadow 0.2s ease',
                }}
                whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(15,23,42,0.10)' }}
              >
                {/* Gradient accent bar */}
                <div style={{ height: '3px', background: LAUNCH_ACCENTS[i % 4], flexShrink: 0 }} />

                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Logo + upvote */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0', background: '#F8FAFC', flexShrink: 0 }}>
                      <img src={tool.logo_url} alt={tool.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); go(); }}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                        padding: '7px 10px', borderRadius: '10px',
                        border: '1.5px solid #E2E8F0', background: '#F8FAFC',
                        cursor: 'pointer', transition: 'all 0.15s', minWidth: '44px',
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLButtonElement;
                        el.style.borderColor = '#F59E0B';
                        el.style.background = '#FFFBEB';
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLButtonElement;
                        el.style.borderColor = '#E2E8F0';
                        el.style.background = '#F8FAFC';
                      }}
                    >
                      <ChevronUp style={{ width: '14px', height: '14px', color: '#64748B' }} />
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', lineHeight: 1 }}>{tool.upvote_count}</span>
                    </button>
                  </div>

                  {/* Tool info */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '15px', color: '#0F172A', margin: '0 0 5px', lineHeight: 1.2 }}>
                      {tool.name}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#475569', fontWeight: 400, margin: 0, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {tool.tagline}
                    </p>
                  </div>

                  {/* Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star style={{ width: '13px', height: '13px', fill: '#FBBF24', color: '#FBBF24' }} />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>{tool.average_rating.toFixed(1)}</span>
                      <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>({tool.review_count})</span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      New
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          6. BROWSE + TOOLS GRID + LEADERBOARD SIDEBAR
          Full directory with category filter + ranked sidebar
      ════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#F8FAFC', borderTop: '1px solid #F1F5F9', padding: '80px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>

          {/* Category filter header */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Filter style={{ width: '14px', height: '14px', color: '#64748B' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Browse by Category</span>
                </div>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(22px, 2.5vw, 28px)', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                  Find tools for every use case
                </h2>
              </div>
              <button
                onClick={go}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#F59E0B', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                All Categories <ArrowRight style={{ width: '14px', height: '14px' }} />
              </button>
            </div>

            {/* Category pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {CATEGORIES.map(({ name, icon, count }) => (
                <button
                  key={name}
                  onClick={() => setSelectedCategory(name)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    padding: '8px 16px', borderRadius: '10px', border: '1.5px solid',
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                    borderColor: selectedCategory === name ? '#0F172A' : '#E2E8F0',
                    background: selectedCategory === name ? '#0F172A' : '#FFFFFF',
                    color: selectedCategory === name ? '#FFFFFF' : '#374151',
                    boxShadow: selectedCategory === name ? '0 2px 8px rgba(15,23,42,0.15)' : 'none',
                  }}
                >
                  <span style={{ fontSize: '15px' }}>{icon}</span>
                  <span>{name}</span>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, padding: '1px 6px', borderRadius: '5px',
                    background: selectedCategory === name ? 'rgba(255,255,255,0.15)' : '#F1F5F9',
                    color: selectedCategory === name ? '#FFFFFF' : '#64748B',
                  }}>
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Two-column layout: tools grid + sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]" style={{ gap: '32px', alignItems: 'start' }}>

            {/* Tools grid */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', margin: 0 }}>
                  {selectedCategory === 'All' ? 'All Tools' : selectedCategory}
                  {' · '}
                  <span style={{ color: '#0F172A', fontWeight: 700 }}>{allTools.length} results</span>
                </p>
                <select
                  style={{
                    fontSize: '13px', border: '1.5px solid #E2E8F0', borderRadius: '10px',
                    padding: '8px 14px', background: '#FFFFFF', color: '#374151',
                    outline: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: 600,
                  }}
                  onChange={go}
                >
                  <option>Sort: Top Rated</option>
                  <option>Sort: Trending</option>
                  <option>Sort: Newest</option>
                  <option>Sort: Most Reviewed</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {allTools.map((tool, i) => (
                  <motion.div key={tool.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.06}>
                    <ToolCard tool={tool} />
                  </motion.div>
                ))}
              </div>

              <div style={{ marginTop: '28px', textAlign: 'center' }}>
                <button
                  onClick={go}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '12px 28px', borderRadius: '12px',
                    border: '1.5px solid #E2E8F0', background: '#FFFFFF',
                    fontSize: '13px', fontWeight: 700, color: '#374151',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.borderColor = '#F59E0B';
                    el.style.color = '#B45309';
                    el.style.background = '#FFFBEB';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.borderColor = '#E2E8F0';
                    el.style.color = '#374151';
                    el.style.background = '#FFFFFF';
                  }}
                >
                  Load More Tools <ArrowRight style={{ width: '14px', height: '14px' }} />
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ position: 'sticky', top: '88px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Weekly Leaderboard */}
              <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Trophy style={{ width: '16px', height: '16px', color: '#F59E0B' }} />
                    <div>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>This Week</p>
                      <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '14px', color: '#0F172A', margin: 0 }}>Top Ranked Tools</h3>
                    </div>
                  </div>
                  <button onClick={go} style={{ fontSize: '12px', fontWeight: 700, color: '#F59E0B', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Full Board →
                  </button>
                </div>

                <div>
                  {leaderboard.map(({ rank, tool, rank_change }) => (
                    <div
                      key={tool.id}
                      onClick={go}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 20px', borderBottom: '1px solid #F8FAFC',
                        cursor: 'pointer', transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#FAFAFA'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                    >
                      <div style={{ width: '24px', textAlign: 'center', flexShrink: 0 }}>
                        {rank <= 3
                          ? <span style={{ fontSize: '16px' }}>{['🥇', '🥈', '🥉'][rank - 1]}</span>
                          : <span style={{ fontSize: '13px', fontWeight: 800, color: '#94A3B8' }}>{rank}</span>}
                      </div>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', overflow: 'hidden', background: '#F8FAFC', border: '1px solid #E2E8F0', flexShrink: 0 }}>
                        <img src={tool.logo_url} alt={tool.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tool.name}</p>
                        <p style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tool.category}</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', fontWeight: 700, color: '#374151' }}>
                          <ChevronUp style={{ width: '12px', height: '12px', color: '#F59E0B' }} />
                          {tool.upvote_count >= 1000 ? `${(tool.upvote_count / 1000).toFixed(1)}k` : tool.upvote_count}
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

                <div style={{ padding: '12px 20px', background: '#FAFAFA', borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
                  <button onClick={go} style={{ fontSize: '13px', fontWeight: 700, color: '#F59E0B', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    View Full Leaderboard <ArrowRight style={{ width: '13px', height: '13px' }} />
                  </button>
                </div>
              </div>

              {/* Recent Reviews */}
              <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <MessageSquare style={{ width: '15px', height: '15px', color: '#64748B' }} />
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '14px', color: '#0F172A', margin: 0 }}>Recent Reviews</h3>
                </div>
                {MOCK_REVIEWS.slice(0, 3).map(review => (
                  <div key={review.id} style={{ marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '5px' }}>
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} style={{ width: '11px', height: '11px', fill: i <= review.rating ? '#FBBF24' : '#E2E8F0', color: i <= review.rating ? '#FBBF24' : '#E2E8F0' }} />
                      ))}
                      <span style={{ fontSize: '12px', color: '#374151', fontWeight: 700, marginLeft: '4px' }}>{review.user?.name}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#475569', fontWeight: 400, margin: 0, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {review.title}
                    </p>
                  </div>
                ))}
                <button onClick={go} style={{ fontSize: '12px', fontWeight: 700, color: '#F59E0B', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', margin: '4px 0 0' }}>
                  Read All Reviews <ArrowRight style={{ width: '12px', height: '12px' }} />
                </button>
              </div>

              {/* Founder CTA card */}
              <div style={{ background: '#0F172A', borderRadius: '16px', padding: '24px', overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #F59E0B, #EA580C)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Rocket style={{ width: '17px', height: '17px', color: '#FFFFFF' }} />
                  </div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '14px', color: '#FFFFFF', margin: 0 }}>Are you a founder?</h3>
                </div>
                <p style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 400, margin: '0 0 18px', lineHeight: 1.6 }}>
                  Submit your tool and get discovered by 12,000+ technical buyers. Free to list.
                </p>
                <button
                  onClick={go}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '11px 16px', borderRadius: '10px', border: 'none',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)',
                    fontSize: '13px', fontWeight: 700, color: '#FFFFFF', cursor: 'pointer',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                >
                  <Rocket style={{ width: '14px', height: '14px' }} />
                  Go to LaunchPad
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          7. TOP RATED — Highest verified review scores
      ════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#FFFFFF', borderTop: '1px solid #F1F5F9', padding: '80px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '100px', padding: '4px 12px' }}>
                  <Star style={{ width: '13px', height: '13px', fill: '#F59E0B', color: '#F59E0B' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#B45309', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Highest Rated</span>
                </div>
              </div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(24px, 2.5vw, 32px)', fontWeight: 800, color: '#0F172A', margin: '0 0 8px', letterSpacing: '-0.025em' }}>
                Top rated by the community
              </h2>
              <p style={{ fontSize: '14px', color: '#64748B', fontWeight: 400, margin: 0 }}>
                Tools with the highest verified review scores across all categories.
              </p>
            </div>
            <button
              onClick={go}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#B45309', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              View All Ratings <ArrowRight style={{ width: '14px', height: '14px' }} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4" style={{ gap: '16px' }}>
            {topRated.map((tool, i) => (
              <motion.div
                key={tool.id}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.1}
                onClick={go}
                style={{
                  background: '#FFFFFF', borderRadius: '16px',
                  border: '1px solid #E2E8F0', padding: '24px',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  boxShadow: '0 1px 4px rgba(15,23,42,0.05)',
                }}
                whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(15,23,42,0.10)', borderColor: '#FDE68A' }}
              >
                {/* Logo + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0', background: '#F8FAFC', flexShrink: 0 }}>
                    <img src={tool.logo_url} alt={tool.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '14px', color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tool.name}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tool.category}
                    </p>
                  </div>
                </div>

                {/* Star rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map(j => (
                      <Star key={j} style={{ width: '14px', height: '14px', fill: j <= Math.round(tool.average_rating) ? '#FBBF24' : '#E2E8F0', color: j <= Math.round(tool.average_rating) ? '#FBBF24' : '#E2E8F0' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>{tool.average_rating.toFixed(1)}</span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 500, margin: '0 0 16px' }}>
                  {tool.review_count.toLocaleString()} verified reviews
                </p>

                {/* Footer */}
                <div style={{ paddingTop: '14px', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151', background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '3px 8px', borderRadius: '6px' }}>
                    {tool.pricing_model}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#B45309' }}>View →</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          8. RECENT REVIEWS — Real community voices
          Social proof through authentic review excerpts
      ════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#F8FAFC', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9', padding: '80px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '100px', padding: '4px 12px' }}>
                  <BookOpen style={{ width: '13px', height: '13px', color: '#16A34A' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803D', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Community Reviews</span>
                </div>
              </div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(24px, 2.5vw, 32px)', fontWeight: 800, color: '#0F172A', margin: '0 0 8px', letterSpacing: '-0.025em' }}>
                What real users are saying
              </h2>
              <p style={{ fontSize: '14px', color: '#64748B', fontWeight: 400, margin: 0 }}>
                Every review is verified. No fake ratings. No pay-to-play.
              </p>
            </div>
            <button
              onClick={go}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#16A34A', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Browse All Reviews <ArrowRight style={{ width: '14px', height: '14px' }} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '16px' }}>
            {MOCK_REVIEWS.slice(0, 3).map((review, i) => (
              <motion.div
                key={review.id}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.1}
                style={{
                  background: '#FFFFFF', borderRadius: '16px',
                  border: '1px solid #E2E8F0', padding: '28px',
                  boxShadow: '0 1px 4px rgba(15,23,42,0.05)',
                  display: 'flex', flexDirection: 'column', gap: '16px',
                }}
              >
                {/* Quote icon */}
                <Quote style={{ width: '28px', height: '28px', color: '#E2E8F0', flexShrink: 0 }} />

                {/* Stars */}
                <div style={{ display: 'flex', gap: '3px' }}>
                  {[1, 2, 3, 4, 5].map(j => (
                    <Star key={j} style={{ width: '14px', height: '14px', fill: j <= review.rating ? '#FBBF24' : '#E2E8F0', color: j <= review.rating ? '#FBBF24' : '#E2E8F0' }} />
                  ))}
                </div>

                {/* Review title */}
                <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '15px', color: '#0F172A', margin: 0, lineHeight: 1.4 }}>
                  {review.title}
                </h4>

                {/* Review body */}
                <p style={{ fontSize: '13px', color: '#475569', fontWeight: 400, margin: 0, lineHeight: 1.65, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {review.body}
                </p>

                {/* Reviewer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '14px', borderTop: '1px solid #F1F5F9' }}>
                  <img
                    src={`https://i.pravatar.cc/32?img=${20 + i}`}
                    alt={review.user?.name}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #F1F5F9', objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: 0 }}>{review.user?.name}</p>
                    <p style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, margin: 0 }}>Verified Reviewer</p>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 style={{ width: '13px', height: '13px', color: '#10B981' }} />
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#10B981' }}>Verified</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          9. LAUNCHPAD CTA — For Founders
          Prominent but not dominant. Two-column layout.
      ════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#0F172A', padding: '80px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: '64px', alignItems: 'center' }}>

            {/* Left copy */}
            <div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '100px', padding: '5px 14px', marginBottom: '24px' }}>
                  <Rocket style={{ width: '13px', height: '13px', color: '#F59E0B' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#F59E0B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>For Founders</span>
                </div>
              </motion.div>

              <motion.h2
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 900, color: '#FFFFFF', margin: '0 0 20px', lineHeight: 1.1, letterSpacing: '-0.03em' }}
              >
                Get your tool in front of{' '}
                <span style={{ color: '#F59E0B' }}>the right buyers</span>
              </motion.h2>

              <motion.p
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
                style={{ fontSize: '16px', color: '#94A3B8', lineHeight: 1.7, margin: '0 0 32px', fontWeight: 400 }}
              >
                Submit your AI or SaaS tool via LaunchPad and start building credibility through verified community reviews. Free to list — no credit card required.
              </motion.p>

              <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={3}
                style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}
              >
                <button
                  onClick={go}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '14px 28px', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)',
                    fontSize: '14px', fontWeight: 700, color: '#FFFFFF', cursor: 'pointer',
                    transition: 'opacity 0.15s, transform 0.15s',
                    boxShadow: '0 4px 20px rgba(245,158,11,0.3)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                >
                  <Rocket style={{ width: '16px', height: '16px' }} />
                  Submit via LaunchPad
                </button>
                <button
                  onClick={go}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '14px 28px', borderRadius: '12px',
                    border: '1.5px solid rgba(255,255,255,0.15)',
                    background: 'transparent',
                    fontSize: '14px', fontWeight: 700, color: '#CBD5E1', cursor: 'pointer',
                    transition: 'border-color 0.15s, color 0.15s',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.borderColor = 'rgba(255,255,255,0.35)';
                    el.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.borderColor = 'rgba(255,255,255,0.15)';
                    el.style.color = '#CBD5E1';
                  }}
                >
                  <Eye style={{ width: '16px', height: '16px' }} />
                  Learn More
                </button>
              </motion.div>
            </div>

            {/* Right — feature grid */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
              className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '16px' }}
            >
              {[
                { icon: Globe,          label: 'Global Visibility',   desc: 'Reach 12,000+ professionals',    color: '#3B82F6' },
                { icon: Shield,         label: 'Verified Reviews',    desc: 'Build authentic social proof',   color: '#10B981' },
                { icon: BarChart3,      label: 'Founder Analytics',   desc: 'Track visits and conversions',   color: '#F59E0B' },
                { icon: MessageSquare,  label: 'Review Replies',      desc: 'Engage directly with users',     color: '#8B5CF6' },
                { icon: Award,          label: 'Editorial Features',  desc: 'Get hand-picked by our team',    color: '#EC4899' },
                { icon: TrendingUp,     label: 'Real Rankings',       desc: 'Earn your rank organically',     color: '#EA580C' },
              ].map(({ icon: Icon, label, desc, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}20`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon style={{ width: '16px', height: '16px', color }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#F1F5F9', margin: '0 0 3px' }}>{label}</p>
                    <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 400, margin: 0 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
