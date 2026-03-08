/*
 * LaudStack Homepage — G2-Inspired Light Design
 * Fixes applied:
 * 1. Header nav text always dark (light hero)
 * 2. Hero mockup image removed
 * 3. Headline corrected to "AI & SaaS Tools"
 * 4. Focus: Discovery + Reviews. LaunchPad = 1 section only
 * 5. Pre-footer section is light (not dark) — footer already dark
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Search, Rocket, Star, BarChart3, Shield, ArrowRight,
  TrendingUp, Users, ChevronUp, Trophy, Zap,
  CheckCircle2, Award, MessageSquare, Flame,
  Sparkles, Eye, Filter, Globe
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import { MOCK_TOOLS, MOCK_LEADERBOARD, MOCK_REVIEWS, CATEGORIES } from '@/lib/mockData';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const STATS = [
  { value: '95+',    label: 'AI & SaaS Tools',      icon: Zap },
  { value: '4,200+', label: 'Verified Reviews',     icon: Star },
  { value: '12,000+',label: 'Community Members',    icon: Users },
  { value: '98%',    label: 'Review Authenticity',  icon: Shield },
];

const POPULAR_SEARCHES = [
  'AI Writing', 'Code Editor', 'Project Management', 'Design Tools', 'Analytics', 'CRM'
];

const trendingTools  = MOCK_TOOLS.filter(t => t.badges.includes('trending') || t.badges.includes('top_rated')).slice(0, 4);
const newLaunches    = MOCK_TOOLS.slice(4, 8);
const topRated       = [...MOCK_TOOLS].sort((a, b) => b.average_rating - a.average_rating).slice(0, 4);
const featuredTools  = MOCK_TOOLS.filter(t => t.is_featured).slice(0, 6);

export default function Home() {
  const [searchQuery, setSearchQuery]       = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const go = () => toast.info('Feature coming soon!');

  const allTools = selectedCategory === 'All'
    ? MOCK_TOOLS
    : MOCK_TOOLS.filter(t => t.category === selectedCategory);

  const leaderboard = MOCK_LEADERBOARD.slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* ═══════════════════════════════════════════════════
          HERO — Clean, centered, professional
          Headline · Search · Popular tags · Social proof
      ═══════════════════════════════════════════════════ */}
      <section
        className="relative bg-[#F8F9FA]"
        style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '96px', paddingBottom: '100px', paddingLeft: '24px', paddingRight: '24px' }}
      >
        {/* Subtle radial glow — very light, non-distracting */}
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', width: '700px', height: '500px', background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 1 }}>

          {/* Badge */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#fff', border: '1px solid #E2E8F0', color: '#475569', fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '100px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '36px', letterSpacing: '0.01em' }}
          >
            <Sparkles style={{ width: '13px', height: '13px', color: '#F59E0B' }} />
            Trusted by 12,000+ professionals
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(36px, 5vw, 58px)', fontWeight: 900, lineHeight: 1.06, letterSpacing: '-0.025em', color: '#0F172A', margin: 0 }}
          >
            The Trusted Source for{' '}
            <span style={{ background: 'linear-gradient(90deg, #D97706 0%, #EA580C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              AI & SaaS Tools.
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
            style={{ marginTop: '20px', fontSize: '17px', color: '#334155', lineHeight: 1.65, maxWidth: '520px' }}
          >
            Real reviews. Honest rankings. The smartest way to discover, compare, and choose the tools your business actually needs.
          </motion.p>

          {/* Search bar */}
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
              <button
                onClick={go}
                style={{ height: '56px', padding: '0 28px', fontWeight: 700, color: '#fff', fontSize: '14px', background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)', border: 'none', cursor: 'pointer', flexShrink: 0, letterSpacing: '0.01em' }}
              >
                Search
              </button>
            </div>

            {/* Popular tags */}
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

          {/* Social proof */}
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

        {/* Curved SVG wave at bottom — hero flows into white content */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0, zIndex: 2 }}>
          <svg viewBox="0 0 1440 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }} preserveAspectRatio="none">
            <path d="M0,72 C360,0 1080,0 1440,72 L1440,72 L0,72 Z" fill="#ffffff"/>
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          DISCOVER — TRENDING THIS WEEK
      ═══════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <p className="text-xs font-semibold text-orange-500 uppercase tracking-widest">Trending This Week</p>
              </div>
              <h2 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                What the community is loving right now
              </h2>
              <p className="text-slate-600 mt-1.5 text-sm font-medium">Ranked by community votes, reviews, and engagement over the last 7 days.</p>
            </div>
            <button onClick={go} className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors group">
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

      {/* ═══════════════════════════════════════════════════
          DISCOVER — NEW LAUNCHES
      ═══════════════════════════════════════════════════ */}
      <section className="py-20" style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)' }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100">
                  <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Fresh Launches</p>
                </div>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em' }}>
                Newly Launched Tools
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
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                  boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(15,23,42,0.10)', borderColor: '#CBD5E1' }}
              >
                {/* Top accent bar — unique per card using index */}
                <div style={{
                  height: '3px',
                  background: [
                    'linear-gradient(90deg, #3B82F6, #6366F1)',
                    'linear-gradient(90deg, #10B981, #06B6D4)',
                    'linear-gradient(90deg, #F59E0B, #EF4444)',
                    'linear-gradient(90deg, #8B5CF6, #EC4899)',
                  ][i % 4],
                }} />

                <div style={{ padding: '18px 18px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0', flexShrink: 0, background: '#F8FAFC' }}>
                      <img src={tool.logo_url} alt={tool.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    {/* Upvote button */}
                    <button
                      onClick={e => { e.stopPropagation(); go(); }}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: '1px', padding: '6px 10px', borderRadius: '10px',
                        border: '1.5px solid #E2E8F0', background: '#F8FAFC',
                        cursor: 'pointer', transition: 'all 0.15s ease', minWidth: '44px',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = '#F59E0B';
                        (e.currentTarget as HTMLButtonElement).style.background = '#FFFBEB';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0';
                        (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC';
                      }}
                    >
                      <ChevronUp style={{ width: '14px', height: '14px', color: '#64748B' }} />
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', lineHeight: 1 }}>{tool.upvote_count}</span>
                    </button>
                  </div>

                  {/* Tool info */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 800, fontSize: '15px', color: '#0F172A', margin: '0 0 4px', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.2 }}>{tool.name}</h3>
                    <p style={{ fontSize: '13px', color: '#475569', fontWeight: 500, margin: 0, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{tool.tagline}</p>
                  </div>

                  {/* Footer row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star style={{ width: '13px', height: '13px', fill: '#FBBF24', color: '#FBBF24' }} />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>{tool.average_rating.toFixed(1)}</span>
                      <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>({tool.review_count})</span>
                    </div>
                    <span style={{
                      fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px',
                      background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>New</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CATEGORIES + TOOLS GRID + LEADERBOARD SIDEBAR
      ═══════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">

          {/* Category pills */}
          <div className="mb-8">
            <div className="flex items-end justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Browse by Category</p>
                </div>
                <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Find tools for every use case
                </h2>
              </div>
              <button onClick={go} className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors">
                All Categories <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(({ name, icon, count }) => (
                <button
                  key={name}
                  onClick={() => setSelectedCategory(name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                    selectedCategory === name
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  <span>{icon}</span>
                  <span>{name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-md font-semibold ${
                    selectedCategory === name ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>{count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tools Grid (2/3) */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm font-semibold text-slate-500">
                  {selectedCategory === 'All' ? 'All Tools' : selectedCategory} · <span className="text-slate-900">{allTools.length} results</span>
                </p>
                <select className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 outline-none focus:border-amber-400 transition-colors" onChange={go}>
                  <option>Sort: Top Rated</option>
                  <option>Sort: Trending</option>
                  <option>Sort: Newest</option>
                  <option>Sort: Most Reviewed</option>
                </select>
              </div>

              <div className="flex flex-col gap-4">
                {allTools.map((tool, i) => (
                  <motion.div key={tool.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.1}>
                    <ToolCard tool={tool} />
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <button onClick={go} className="inline-flex items-center gap-2 px-7 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50 transition-all">
                  Load More Tools <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Sidebar (1/3) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-5">

                {/* Weekly Leaderboard */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      <div>
                        <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest leading-none mb-0.5">This Week</p>
                        <h3 className="font-bold text-slate-900 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Top Ranked Tools</h3>
                      </div>
                    </div>
                    <button onClick={go} className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors">Full Board →</button>
                  </div>

                  <div className="divide-y divide-slate-50">
                    {leaderboard.map(({ rank, tool, rank_change }) => (
                      <div key={tool.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer" onClick={go}>
                        <div className="w-7 shrink-0 text-center">
                          {rank <= 3 ? <span className="text-base">{['🥇','🥈','🥉'][rank-1]}</span> : <span className="text-sm font-bold text-slate-400">{rank}</span>}
                        </div>
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                          <img src={tool.logo_url} alt={tool.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{tool.name}</p>
                          <p className="text-xs text-slate-500 font-medium truncate">{tool.category}</p>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <div className="flex items-center gap-0.5 text-xs font-bold text-slate-700">
                            <ChevronUp className="h-3 w-3 text-amber-500" />
                            {tool.upvote_count >= 1000 ? `${(tool.upvote_count/1000).toFixed(1)}k` : tool.upvote_count}
                          </div>
                          {rank_change !== 0 && (
                            <span className={`text-[10px] font-semibold ${rank_change > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              {rank_change > 0 ? `▲${rank_change}` : `▼${Math.abs(rank_change)}`}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                    <button onClick={go} className="w-full text-sm text-amber-600 font-semibold hover:text-amber-700 flex items-center justify-center gap-1.5 transition-colors">
                      View Full Leaderboard <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Recent Reviews */}
                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="h-4 w-4 text-slate-500" />
                    <h3 className="font-bold text-slate-900 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Recent Reviews</h3>
                  </div>
                  {MOCK_REVIEWS.slice(0, 3).map(review => (
                    <div key={review.id} className="mb-3 pb-3 border-b border-slate-100 last:border-0 last:mb-0 last:pb-0">
                      <div className="flex items-center gap-1 mb-1">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className={`h-3 w-3 ${i <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                        ))}
                        <span className="text-xs text-slate-600 font-semibold ml-1">{review.user?.name}</span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium line-clamp-2 leading-relaxed">{review.title}</p>
                    </div>
                  ))}
                  <button onClick={go} className="w-full text-xs text-amber-600 font-semibold hover:text-amber-700 flex items-center justify-center gap-1 mt-2 transition-colors">
                    Read All Reviews <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                {/* LaunchPad CTA Card — compact, sidebar only */}
                <div className="rounded-2xl overflow-hidden border border-amber-200 bg-amber-50">
                  <div className="px-5 py-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                        <Rocket className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Are you a founder?</h3>
                    </div>
                    <p className="text-xs text-slate-700 font-medium mb-4 leading-relaxed">Submit your tool and get discovered by thousands of buyers. Free to list.</p>
                    <button onClick={go} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-md hover:shadow-amber-500/30" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)' }}>
                      <Rocket className="h-3.5 w-3.5" />
                      Go to LaunchPad
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          REVIEW — TOP RATED TOOLS
      ═══════════════════════════════════════════════════ */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest">Highest Rated</p>
              </div>
              <h2 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Top rated by the community
              </h2>
              <p className="text-slate-600 mt-1.5 text-sm font-medium">Tools with the highest verified review scores across all categories.</p>
            </div>
            <button onClick={go} className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors group">
              View All Ratings <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {topRated.map((tool, i) => (
              <motion.div
                key={tool.id}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.1}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-amber-200 transition-all cursor-pointer group"
                onClick={go}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <img src={tool.logo_url} alt={tool.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{tool.name}</h3>
                    <p className="text-xs text-slate-400 truncate">{tool.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i <= Math.round(tool.average_rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-900">{tool.average_rating.toFixed(1)}</span>
                </div>
                <p className="text-xs text-slate-600 font-medium mb-3">{tool.review_count.toLocaleString()} verified reviews</p>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">{tool.pricing_model}</span>
                      <span className="text-xs text-amber-700 font-bold group-hover:underline">View →</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FEATURED TOOLS — Editor's Pick
      ═══════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-purple-500" />
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-widest">Editor's Selection</p>
              </div>
              <h2 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Featured Tools
              </h2>
              <p className="text-slate-600 mt-1.5 text-sm font-medium">Hand-picked by the LaudStack team for exceptional quality and user satisfaction.</p>
            </div>
            <button onClick={go} className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors group">
              View All Featured <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {featuredTools.map((tool, i) => (
              <motion.div key={tool.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.1}>
                <ToolCard tool={tool} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          LAUNCHPAD — ONE SECTION (light background, not dark)
          Founders CTA — subtle, not the main focus
      ═══════════════════════════════════════════════════ */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Left copy */}
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

              {/* Right — feature list */}
              <div className="p-10 lg:p-14 border-t lg:border-t-0 lg:border-l border-amber-200/60">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-6">What you get</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: Globe, label: 'Global Visibility', desc: 'Reach 12,000+ professionals' },
                    { icon: Shield, label: 'Verified Reviews', desc: 'Build authentic social proof' },
                    { icon: BarChart3, label: 'Founder Analytics', desc: 'Track visits and conversions' },
                    { icon: MessageSquare, label: 'Review Replies', desc: 'Engage directly with users' },
                    { icon: Award, label: 'Editorial Features', desc: 'Get hand-picked by our team' },
                    { icon: TrendingUp, label: 'Real Rankings', desc: 'Earn your rank organically' },
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
