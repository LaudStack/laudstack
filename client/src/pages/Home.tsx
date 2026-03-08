/*
 * LaudStack Homepage — Premium Enterprise Rebuild
 * Competing with G2 + Product Hunt + AppSumo
 * Dark cinematic hero → light body
 * NO pricing shown anywhere on this page
 * "LaunchPad" replaces "Submit Tool"
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Search, Rocket, Star, BarChart3, Shield, ArrowRight,
  TrendingUp, Users, ChevronUp, Trophy, Zap,
  CheckCircle2, Globe, Award, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import { MOCK_TOOLS, MOCK_LEADERBOARD, CATEGORIES } from '@/lib/mockData';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

// ── Stats ──────────────────────────────────────────────────
const STATS = [
  { value: '95+',    label: 'Tools Listed',        icon: Zap },
  { value: '4,200+', label: 'Verified Reviews',    icon: Star },
  { value: '12,000+',label: 'Community Members',   icon: Users },
  { value: '98%',    label: 'Review Accuracy',     icon: Shield },
];

// ── Trust logos (placeholder brand names) ─────────────────
const TRUST_BRANDS = [
  'Notion', 'Figma', 'Linear', 'Loom', 'Webflow',
  'Airtable', 'Framer', 'Pitch', 'Coda', 'Retool',
];

// ── How it works ──────────────────────────────────────────
const HOW_IT_WORKS = [
  {
    step: '01', icon: Search,
    title: 'Discover',
    desc: 'Browse our curated directory of AI and SaaS tools. Filter by category, pricing model, and community rating to find exactly what you need.',
  },
  {
    step: '02', icon: Star,
    title: 'Review & Compare',
    desc: 'Read honest, verified reviews from real users. Compare tools side-by-side and leave your own review to help the community make better decisions.',
  },
  {
    step: '03', icon: Rocket,
    title: 'Launch & Grow',
    desc: 'Founders submit their tools via LaunchPad to get discovered by thousands of qualified buyers. Engage with users and track your growth.',
  },
];

// ── Platform value props ──────────────────────────────────
const VALUE_PROPS = [
  { icon: Shield,       title: 'Verified Reviews',     desc: 'Every review is authenticated. No fake ratings, no paid placements. Just honest community feedback.' },
  { icon: BarChart3,    title: 'Real-Time Rankings',   desc: 'Our momentum algorithm surfaces the best tools based on genuine user activity and engagement.' },
  { icon: Globe,        title: 'Global Community',     desc: 'Join thousands of founders, marketers, and operators discovering and reviewing the tools that matter.' },
  { icon: Award,        title: 'Editor\'s Curation',   desc: 'Our team hand-picks exceptional tools for featured placement, ensuring quality across every category.' },
  { icon: MessageSquare,title: 'Founder Engagement',   desc: 'Founders can claim their page, respond to reviews, and build a direct relationship with their users.' },
  { icon: TrendingUp,   title: 'Growth Intelligence',  desc: 'Track trends, monitor competitors, and understand what the market is adopting in real time.' },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const go = () => toast.info('Feature coming soon!');

  const allTools = selectedCategory === 'All'
    ? MOCK_TOOLS
    : MOCK_TOOLS.filter(t => t.category === selectedCategory);
  const featuredTools = MOCK_TOOLS.filter(t => t.is_featured).slice(0, 6);
  const leaderboard   = MOCK_LEADERBOARD.slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* ═══════════════════════════════════════════════════
          HERO — Full-bleed dark cinematic
      ═══════════════════════════════════════════════════ */}
      <section
        className="relative min-h-[92vh] flex items-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #060D1F 0%, #0F172A 45%, #1A1F35 100%)',
        }}
      >
        {/* Background image overlay */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663413324407/3XGasP8CcX57JRU5Ai2Hv7/hero-dark-bg_2901e4c7.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center right',
          }}
        />

        {/* Gradient fade on left for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#060D1F] via-[#060D1F]/80 to-transparent" />

        {/* Amber glow accent */}
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-amber-500/8 blur-[120px] pointer-events-none" />

        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 relative w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-32">

            {/* Left — Copy */}
            <div>
              {/* Eyebrow badge */}
              <motion.div
                initial="hidden" animate="visible" variants={fadeUp} custom={0}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/8 border border-white/15 mb-8 backdrop-blur-sm"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-sm font-medium text-white/80">The #1 Platform for AI & SaaS Discovery</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial="hidden" animate="visible" variants={fadeUp} custom={1}
                className="text-5xl md:text-6xl xl:text-7xl font-black text-white leading-[1.02] tracking-tight"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Where the Best
                <br />
                <span
                  className="inline-block"
                  style={{
                    background: 'linear-gradient(90deg, #F59E0B 0%, #FB923C 50%, #F97316 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Software Gets Found
                </span>
              </motion.h1>

              <motion.p
                initial="hidden" animate="visible" variants={fadeUp} custom={2}
                className="mt-6 text-lg text-white/60 max-w-lg leading-relaxed"
              >
                LaudStack is the trusted community platform where verified user reviews, real-time rankings, and expert curation help buyers find the right tools — and founders build credibility.
              </motion.p>

              {/* Search bar */}
              <motion.div
                initial="hidden" animate="visible" variants={fadeUp} custom={3}
                className="mt-10 flex gap-3 max-w-lg"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                  <input
                    placeholder="Search 95+ tools across 12 categories..."
                    className="w-full pl-12 pr-4 h-14 rounded-2xl bg-white/10 border border-white/15 text-white placeholder:text-white/40 text-sm outline-none focus:border-amber-400/50 focus:bg-white/15 transition-all backdrop-blur-sm"
                    onKeyDown={e => e.key === 'Enter' && go()}
                  />
                </div>
                <button
                  onClick={go}
                  className="h-14 px-6 rounded-2xl font-semibold text-white text-sm transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/30 shrink-0"
                  style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)' }}
                >
                  Search
                </button>
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial="hidden" animate="visible" variants={fadeUp} custom={4}
                className="mt-6 flex flex-wrap items-center gap-4"
              >
                <Button
                  onClick={go}
                  size="lg"
                  className="border-0 font-semibold gap-2 h-12 px-7 rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all"
                  style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)', color: 'white' }}
                >
                  <Rocket className="h-5 w-5" />
                  Launch on LaunchPad
                </Button>
                <button
                  onClick={go}
                  className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors group"
                >
                  <span>Explore All Tools</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>

              {/* Social proof micro-stats */}
              <motion.div
                initial="hidden" animate="visible" variants={fadeUp} custom={5}
                className="mt-10 flex items-center gap-6"
              >
                <div className="flex -space-x-2">
                  {['https://i.pravatar.cc/32?img=1','https://i.pravatar.cc/32?img=2','https://i.pravatar.cc/32?img=3','https://i.pravatar.cc/32?img=4','https://i.pravatar.cc/32?img=5'].map((src, i) => (
                    <img key={i} src={src} alt="" className="w-8 h-8 rounded-full border-2 border-[#0F172A] object-cover" />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-xs text-white/50">Trusted by <span className="text-white/80 font-semibold">12,000+</span> professionals</p>
                </div>
              </motion.div>
            </div>

            {/* Right — UI Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="hidden lg:block relative"
            >
              <div className="relative">
                {/* Glow behind mockup */}
                <div className="absolute -inset-8 bg-amber-500/10 rounded-3xl blur-2xl" />
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663413324407/3XGasP8CcX57JRU5Ai2Hv7/hero-ui-mockup_47f00978.png"
                  alt="LaudStack Platform Preview"
                  className="relative rounded-2xl shadow-2xl shadow-black/50 border border-white/10 w-full"
                />
                {/* Floating badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="absolute -bottom-5 -left-5 bg-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">This week</p>
                    <p className="text-sm font-bold text-slate-900">+2,400 new reviews</p>
                  </div>
                </motion.div>
                {/* Floating badge 2 */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.5 }}
                  className="absolute -top-5 -right-5 bg-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Verified</p>
                    <p className="text-sm font-bold text-slate-900">98% authentic reviews</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom fade to white */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ═══════════════════════════════════════════════════
          TRUST BAR
      ═══════════════════════════════════════════════════ */}
      <section className="border-y border-border bg-white py-5">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-8 overflow-x-auto scrollbar-hide">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap shrink-0">
              Trusted by teams at
            </p>
            <div className="flex items-center gap-8 flex-1">
              {TRUST_BRANDS.map(brand => (
                <span key={brand} className="text-sm font-bold text-slate-300 whitespace-nowrap hover:text-slate-500 transition-colors cursor-default">
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          STATS BAR
      ═══════════════════════════════════════════════════ */}
      <section className="py-14 bg-background">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                  <Icon className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-900 leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{value}</div>
                  <div className="text-sm text-slate-500 mt-1">{label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CATEGORIES
      ═══════════════════════════════════════════════════ */}
      <section className="py-4 pb-10 bg-background">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-2">Browse by Category</p>
              <h2 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Find tools for every use case
              </h2>
            </div>
            <button onClick={go} className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors group">
              All Categories <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {CATEGORIES.map(({ name, icon, count }, i) => (
              <motion.button
                key={name}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.3}
                onClick={() => setSelectedCategory(name)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  selectedCategory === name
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:text-slate-900 hover:shadow-sm'
                }`}
              >
                <span>{icon}</span>
                <span>{name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-md font-semibold ${
                  selectedCategory === name ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'
                }`}>{count}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          TOOLS GRID + LEADERBOARD SIDEBAR
      ═══════════════════════════════════════════════════ */}
      <section className="pb-24 bg-background">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Tools Grid (2/3) */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-1">
                    {selectedCategory === 'All' ? 'All Tools' : selectedCategory}
                  </p>
                  <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {allTools.length} tools found
                  </h2>
                </div>
                <select
                  className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 outline-none focus:border-amber-400 transition-colors"
                  onChange={go}
                >
                  <option>Sort: Top Rated</option>
                  <option>Sort: Trending</option>
                  <option>Sort: Newest</option>
                  <option>Sort: Most Reviewed</option>
                </select>
              </div>

              <div className="flex flex-col gap-4">
                {allTools.map((tool, i) => (
                  <motion.div
                    key={tool.id}
                    initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.15}
                  >
                    <ToolCard tool={tool} />
                  </motion.div>
                ))}
              </div>

              <div className="mt-10 text-center">
                <button
                  onClick={go}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:text-slate-900 transition-all hover:shadow-sm"
                >
                  Load More Tools <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Leaderboard Sidebar (1/3) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-5">

                {/* Weekly Leaderboard */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-0.5">This Week</p>
                      <h3 className="font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        🏆 Top Ranked Tools
                      </h3>
                    </div>
                    <button onClick={go} className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors">
                      Full Board →
                    </button>
                  </div>

                  <div className="divide-y divide-slate-50">
                    {leaderboard.map(({ rank, tool, rank_change }) => (
                      <div
                        key={tool.id}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/80 transition-colors cursor-pointer"
                        onClick={go}
                      >
                        <div className="w-7 shrink-0 text-center">
                          {rank <= 3
                            ? <span className="text-lg">{['🥇','🥈','🥉'][rank-1]}</span>
                            : <span className="text-sm font-bold text-slate-400">{rank}</span>
                          }
                        </div>
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                          <img src={tool.logo_url} alt={tool.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{tool.name}</p>
                          <p className="text-xs text-slate-500 truncate">{tool.category}</p>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
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

                  <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100">
                    <button
                      onClick={go}
                      className="w-full text-sm text-amber-600 font-semibold hover:text-amber-700 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      View Full Leaderboard <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* LaunchPad CTA Card (no pricing) */}
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 text-white">
                  <div className="px-5 py-6">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center mb-4">
                      <Rocket className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-bold text-white mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Are you a founder?
                    </h3>
                    <p className="text-sm text-white/60 mb-5 leading-relaxed">
                      Get your tool in front of thousands of qualified buyers. Claim your page, engage with reviews, and grow your user base.
                    </p>
                    <ul className="space-y-2 mb-5">
                      {['Claim your tool page', 'Respond to reviews', 'Promotional banner', 'Analytics dashboard', 'Priority support'].map(f => (
                        <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                          <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={go}
                      className="w-full border-0 font-semibold gap-2 h-11 rounded-xl"
                      style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)', color: 'white' }}
                    >
                      <Rocket className="h-4 w-4" />
                      Go to LaunchPad
                    </Button>
                  </div>
                </div>

                {/* Submit Tool Card */}
                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
                  <h3 className="font-bold text-slate-900 mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Built something great?
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">Submit your tool and get discovered by thousands of users. Free to list.</p>
                  <button
                    onClick={go}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-amber-300 text-amber-700 text-sm font-semibold hover:bg-amber-50 transition-colors"
                  >
                    <Rocket className="h-4 w-4" />
                    Submit via LaunchPad
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════════ */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-4xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Built for the community, by the community
            </h2>
            <p className="mt-4 text-slate-500 max-w-xl mx-auto leading-relaxed">
              Every review, vote, and ranking on LaudStack is earned — never paid for. We combine the best of G2, Product Hunt, and AppSumo into one trusted platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }, i) => (
              <motion.div
                key={step}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow"
              >
                <div className="absolute top-5 right-5 text-8xl font-black text-slate-50 select-none leading-none"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {step}
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-6 relative z-10 group-hover:bg-amber-100 transition-colors">
                  <Icon className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 relative z-10" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {title}
                </h3>
                <p className="text-slate-500 leading-relaxed relative z-10 text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          VALUE PROPS
      ═══════════════════════════════════════════════════ */}
      <section className="py-24 bg-background">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-3">Why LaudStack</p>
              <h2 className="text-4xl font-bold text-slate-900 mb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                The platform that takes software discovery seriously
              </h2>
              <p className="text-slate-500 leading-relaxed mb-8">
                We combine verified reviews from G2, community-driven discovery from Product Hunt, and curated deals from AppSumo — into one unified, trustworthy platform built for the modern software buyer.
              </p>
              <div className="flex flex-wrap gap-3">
                {['Verified Reviews', 'No Paid Rankings', 'Real-Time Data', 'Founder Verified'].map(tag => (
                  <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-sm font-medium border border-amber-100">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {VALUE_PROPS.map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.15}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
                    <Icon className="h-4.5 w-4.5 text-amber-600" style={{ width: '18px', height: '18px' }} />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FEATURED TOOLS
      ═══════════════════════════════════════════════════ */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-2">Editor's Selection</p>
              <h2 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Featured Tools
              </h2>
              <p className="text-slate-500 mt-1.5">Hand-picked by the LaudStack team for exceptional quality and user satisfaction.</p>
            </div>
            <button onClick={go} className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors group">
              View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {featuredTools.map((tool, i) => (
              <motion.div
                key={tool.id}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.15}
              >
                <ToolCard tool={tool} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FINAL CTA — Dark
      ═══════════════════════════════════════════════════ */}
      <section className="py-28 bg-[#060D1F] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 text-center relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 border border-white/15 mb-8">
              <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-sm font-medium text-white/70">Join 12,000+ community members</span>
            </div>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              The discovery platform<br />
              <span style={{
                background: 'linear-gradient(90deg, #F59E0B 0%, #FB923C 50%, #F97316 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                your tool deserves
              </span>
            </h2>
            <p className="text-white/50 max-w-lg mx-auto mb-12 leading-relaxed">
              Whether you're a founder ready to launch or a buyer searching for the perfect tool — LaudStack is where the best software gets found.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={go}
                className="border-0 font-semibold px-8 h-13 gap-2 rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all"
                style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)', color: 'white', height: '52px' }}
              >
                <Rocket className="h-5 w-5" />
                Launch on LaunchPad
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={go}
                className="border-white/20 text-white hover:bg-white/10 hover:text-white px-8 gap-2 rounded-xl"
                style={{ height: '52px' }}
              >
                <Search className="h-5 w-5" />
                Explore All Tools
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
