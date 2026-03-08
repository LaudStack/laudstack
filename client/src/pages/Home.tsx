/*
 * LaudStack Homepage — G2-Inspired Light Design
 * Design: Clean white/off-white hero, search as focal point (like G2.com)
 * Three pillars clearly shown: DISCOVER · REVIEW · LAUNCH
 * NO pricing anywhere on this page
 * "LaunchPad" replaces "Submit Tool"
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Search, Rocket, Star, BarChart3, Shield, ArrowRight,
  TrendingUp, Users, ChevronUp, Trophy, Zap,
  CheckCircle2, Globe, Award, MessageSquare, Flame,
  Sparkles, Clock, ChevronRight, ThumbsUp, Eye
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
  { value: '95+',    label: 'Tools Listed',        icon: Zap },
  { value: '4,200+', label: 'Verified Reviews',    icon: Star },
  { value: '12,000+',label: 'Community Members',   icon: Users },
  { value: '98%',    label: 'Review Accuracy',     icon: Shield },
];

const TRUST_BRANDS = [
  'Notion', 'Figma', 'Linear', 'Loom', 'Webflow',
  'Airtable', 'Framer', 'Pitch', 'Coda', 'Retool',
];

// Popular search terms shown under the search bar
const POPULAR_SEARCHES = [
  'AI Writing', 'Code Editor', 'Project Management', 'Design Tools', 'Analytics', 'CRM'
];

// Trending tools this week (subset of mock data)
const trendingTools = MOCK_TOOLS.filter(t => t.badges.includes('trending') || t.badges.includes('top_rated')).slice(0, 4);
const newLaunches = MOCK_TOOLS.slice(4, 8);
const topRated = [...MOCK_TOOLS].sort((a, b) => b.average_rating - a.average_rating).slice(0, 4);
const featuredTools = MOCK_TOOLS.filter(t => t.is_featured).slice(0, 6);

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
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
          HERO — G2-Style Light, Search-Focused
      ═══════════════════════════════════════════════════ */}
      <section
        className="relative pt-20 pb-0 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #FFFBF5 0%, #FFF7ED 40%, #FAFAFA 100%)',
        }}
      >
        {/* Subtle background texture */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663413324407/3XGasP8CcX57JRU5Ai2Hv7/hero-light-bg-RrVCZckHFj5HTyRQjoT8p7.webp)`,
            backgroundSize: 'cover',
            backgroundPosition: 'top center',
          }}
        />

        {/* Decorative amber glow top-right */}
        <div className="absolute -top-20 right-0 w-[600px] h-[400px] rounded-full bg-amber-200/30 blur-[100px] pointer-events-none" />
        <div className="absolute top-40 right-20 w-[300px] h-[300px] rounded-full bg-orange-100/40 blur-[80px] pointer-events-none" />

        <div className="max-w-[1200px] mx-auto px-6 lg:px-10 relative">
          {/* Eyebrow */}
          <motion.div
            initial="hidden" animate="visible" variants={fadeUp} custom={0}
            className="flex justify-center mb-6 pt-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              The #1 Platform for AI & SaaS Discovery
            </div>
          </motion.div>

          {/* Headline — centered like G2 */}
          <motion.h1
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-center text-5xl md:text-6xl xl:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight max-w-4xl mx-auto"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Find the Best Software.{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #D97706 0%, #EA580C 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Trusted by Thousands.
            </span>
          </motion.h1>

          <motion.p
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-center mt-5 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed"
          >
            LaudStack combines verified community reviews, real-time rankings, and expert curation — so you can discover the right tools faster and founders can build credibility that converts.
          </motion.p>

          {/* ── SEARCH BAR — Primary CTA like G2 ── */}
          <motion.div
            initial="hidden" animate="visible" variants={fadeUp} custom={3}
            className="mt-10 max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-0 bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-200 overflow-hidden p-1.5">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && go()}
                  placeholder="Search tools, categories, or features..."
                  className="w-full pl-12 pr-4 h-12 text-slate-800 placeholder:text-slate-400 text-sm outline-none bg-transparent"
                />
              </div>
              <button
                onClick={go}
                className="h-12 px-7 rounded-xl font-semibold text-white text-sm transition-all hover:shadow-lg hover:shadow-amber-500/30 shrink-0"
                style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)' }}
              >
                Search
              </button>
            </div>

            {/* Popular searches */}
            <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
              <span className="text-xs text-slate-400 font-medium">Popular:</span>
              {POPULAR_SEARCHES.map(term => (
                <button
                  key={term}
                  onClick={go}
                  className="text-xs text-slate-600 hover:text-amber-700 hover:bg-amber-50 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-amber-200 transition-all font-medium"
                >
                  {term}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Social proof row */}
          <motion.div
            initial="hidden" animate="visible" variants={fadeUp} custom={4}
            className="mt-8 flex items-center justify-center gap-8 pb-10"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {[1,2,3,4,5].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/28?img=${i+10}`} alt="" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                ))}
              </div>
              <span className="text-sm text-slate-500"><span className="font-semibold text-slate-800">12,000+</span> professionals</span>
            </div>
            <div className="w-px h-5 bg-slate-200" />
            <div className="flex items-center gap-1.5">
              {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
              <span className="text-sm text-slate-500"><span className="font-semibold text-slate-800">4.9</span> avg rating</span>
            </div>
            <div className="w-px h-5 bg-slate-200 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-slate-500"><span className="font-semibold text-slate-800">98%</span> verified reviews</span>
            </div>
          </motion.div>

          {/* Hero UI Mockup — floats up from bottom */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="relative max-w-4xl mx-auto"
          >
            <div className="relative rounded-t-2xl overflow-hidden shadow-2xl shadow-slate-300/60 border border-slate-200 border-b-0">
              {/* Browser chrome bar */}
              <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-slate-400 border border-slate-200 max-w-xs mx-auto text-center">
                  laudstack.com
                </div>
              </div>
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663413324407/3XGasP8CcX57JRU5Ai2Hv7/hero-search-preview-CvQe68sNNMJ5GfaGt3A3Ta.webp"
                alt="LaudStack Platform Preview"
                className="w-full"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          TRUST BAR
      ═══════════════════════════════════════════════════ */}
      <section className="border-y border-slate-100 bg-white py-5">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-8 overflow-x-auto">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap shrink-0">
              Trusted by teams at
            </p>
            <div className="flex items-center gap-10 flex-1">
              {TRUST_BRANDS.map(brand => (
                <span key={brand} className="text-sm font-bold text-slate-300 whitespace-nowrap hover:text-slate-500 transition-colors cursor-default select-none">
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          THREE PILLARS — Discover · Review · Launch
      ═══════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-3">How LaudStack Works</p>
            <h2 className="text-4xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              One platform. Three powerful pillars.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* DISCOVER */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
              className="group relative rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-8 hover:shadow-lg hover:shadow-slate-100 hover:border-slate-200 transition-all cursor-pointer"
              onClick={go}
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-6">
                <Search className="h-7 w-7 text-amber-600" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider mb-3">
                01 · Discover
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Find the right tool, fast
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Browse 95+ AI and SaaS tools curated across 12 categories. Filter by rating, pricing model, and use case to find exactly what your team needs.
              </p>
              <div className="space-y-2">
                {['Trending tools updated daily', 'New launches every week', 'Category-based discovery', 'Side-by-side comparison'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-amber-600 group-hover:gap-2.5 transition-all">
                Start Discovering <ArrowRight className="h-4 w-4" />
              </div>
            </motion.div>

            {/* REVIEW */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
              className="group relative rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-8 hover:shadow-lg hover:shadow-slate-100 hover:border-slate-200 transition-all cursor-pointer"
              onClick={go}
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6">
                <Star className="h-7 w-7 text-emerald-600" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
                02 · Review
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Honest reviews, verified users
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Every review on LaudStack is authenticated. No fake ratings, no paid placements. Read real feedback from real users, and leave your own to help the community.
              </p>
              <div className="space-y-2">
                {['Verified purchase badges', 'Pros & cons breakdown', 'Founder reply threads', 'Helpful vote system'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-emerald-600 group-hover:gap-2.5 transition-all">
                Read Reviews <ArrowRight className="h-4 w-4" />
              </div>
            </motion.div>

            {/* LAUNCH */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
              className="group relative rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-900 to-slate-800 p-8 hover:shadow-xl hover:shadow-slate-900/20 transition-all cursor-pointer"
              onClick={go}
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center mb-6">
                <Rocket className="h-7 w-7 text-white" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
                03 · Launch
              </div>
              <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Get your tool discovered
              </h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Submit your tool via LaunchPad and get in front of thousands of qualified buyers. Claim your page, engage with reviews, and track your growth.
              </p>
              <div className="space-y-2">
                {['Free to list your tool', 'Claim your tool page', 'Respond to reviews', 'Founder analytics'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-white/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-amber-400 group-hover:gap-2.5 transition-all">
                Go to LaunchPad <ArrowRight className="h-4 w-4" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          STATS BAR
      ═══════════════════════════════════════════════════ */}
      <section className="py-12 bg-slate-50 border-y border-slate-100">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
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
          DISCOVER — TRENDING THIS WEEK
      ═══════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">

          {/* Section header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <p className="text-xs font-semibold text-orange-500 uppercase tracking-widest">Trending This Week</p>
              </div>
              <h2 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                What the community is loving right now
              </h2>
            </div>
            <button onClick={go} className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors group">
              View All Trending <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trendingTools.map((tool, i) => (
              <motion.div
                key={tool.id}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.1}
              >
                <ToolCard tool={tool} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          DISCOVER — NEW LAUNCHES
      ═══════════════════════════════════════════════════ */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest">Fresh Launches</p>
              </div>
              <h2 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Newly launched tools
              </h2>
              <p className="text-slate-500 mt-1.5 text-sm">Discover the latest AI and SaaS tools submitted by founders this week.</p>
            </div>
            <button onClick={go} className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors group">
              All New Launches <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {newLaunches.map((tool, i) => (
              <motion.div
                key={tool.id}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.1}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group"
                onClick={go}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img src={tool.logo_url} alt={tool.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wider">
                    New
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{tool.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">{tool.tagline}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-semibold text-slate-700">{tool.average_rating.toFixed(1)}</span>
                    <span className="text-xs text-slate-400">({tool.review_count})</span>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); go(); }}
                    className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-amber-600 transition-colors"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                    {tool.upvote_count}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CATEGORIES + FULL TOOLS GRID + LEADERBOARD
      ═══════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">

          {/* Category pills */}
          <div className="mb-8">
            <div className="flex items-end justify-between mb-5">
              <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Browse by Category
              </h2>
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
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    {selectedCategory === 'All' ? 'All Tools' : selectedCategory} · <span className="text-slate-900">{allTools.length} results</span>
                  </p>
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
                    initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.1}
                  >
                    <ToolCard tool={tool} />
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={go}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50 transition-all"
                >
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
                        <h3 className="font-bold text-slate-900 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          Top Ranked Tools
                        </h3>
                      </div>
                    </div>
                    <button onClick={go} className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors">
                      Full Board →
                    </button>
                  </div>

                  <div className="divide-y divide-slate-50">
                    {leaderboard.map(({ rank, tool, rank_change }) => (
                      <div
                        key={tool.id}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={go}
                      >
                        <div className="w-7 shrink-0 text-center">
                          {rank <= 3
                            ? <span className="text-base">{['🥇','🥈','🥉'][rank-1]}</span>
                            : <span className="text-sm font-bold text-slate-400">{rank}</span>
                          }
                        </div>
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                          <img src={tool.logo_url} alt={tool.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{tool.name}</p>
                          <p className="text-xs text-slate-400 truncate">{tool.category}</p>
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

                {/* LaunchPad CTA Card */}
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                  <div className="px-5 py-6">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center mb-4">
                      <Rocket className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-bold text-white mb-2 text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Are you a founder?
                    </h3>
                    <p className="text-sm text-white/60 mb-4 leading-relaxed">
                      Get your tool in front of thousands of qualified buyers. Submit via LaunchPad and start growing.
                    </p>
                    <ul className="space-y-1.5 mb-5">
                      {['Free to list', 'Claim your page', 'Respond to reviews', 'Founder analytics'].map(f => (
                        <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                          <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={go}
                      className="w-full border-0 font-semibold gap-2 h-10 rounded-xl text-sm"
                      style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)', color: 'white' }}
                    >
                      <Rocket className="h-4 w-4" />
                      Go to LaunchPad
                    </Button>
                  </div>
                </div>

                {/* Recent Reviews Snippet */}
                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="h-4 w-4 text-slate-500" />
                    <h3 className="font-bold text-slate-900 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Recent Reviews
                    </h3>
                  </div>
                  {MOCK_REVIEWS.slice(0, 2).map(review => (
                    <div key={review.id} className="mb-3 pb-3 border-b border-slate-100 last:border-0 last:mb-0 last:pb-0">
                      <div className="flex items-center gap-1 mb-1">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className={`h-3 w-3 ${i <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                        ))}
                        <span className="text-xs text-slate-400 ml-1">{review.user?.name}</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{review.title}</p>
                    </div>
                  ))}
                  <button onClick={go} className="w-full text-xs text-amber-600 font-semibold hover:text-amber-700 flex items-center justify-center gap-1 mt-2 transition-colors">
                    Read All Reviews <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          REVIEW SECTION — Top Rated Tools
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
              <p className="text-slate-500 mt-1.5 text-sm">Tools with the highest verified review scores across all categories.</p>
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
                <p className="text-xs text-slate-500">{tool.review_count.toLocaleString()} verified reviews</p>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{tool.pricing_model}</span>
                  <span className="text-xs text-amber-600 font-semibold group-hover:underline">View →</span>
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
              <p className="text-slate-500 mt-1.5 text-sm">Hand-picked by the LaudStack team for exceptional quality and user satisfaction.</p>
            </div>
            <button onClick={go} className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors group">
              View All Featured <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {featuredTools.map((tool, i) => (
              <motion.div
                key={tool.id}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.1}
              >
                <ToolCard tool={tool} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          LAUNCH CTA — For Founders
      ═══════════════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-orange-500/8 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-[1200px] mx-auto px-6 lg:px-10 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left copy */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/20 text-amber-400 text-sm font-semibold mb-6">
                <Rocket className="h-3.5 w-3.5" />
                For Founders
              </div>
              <h2
                className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Your tool deserves to be discovered
              </h2>
              <p className="text-white/60 leading-relaxed mb-8 text-lg">
                Submit your tool via LaunchPad and get in front of thousands of qualified buyers. Build credibility through verified reviews and grow your user base.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={go}
                  className="border-0 font-semibold px-8 gap-2 rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all"
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
                  <Eye className="h-5 w-5" />
                  Explore All Tools
                </Button>
              </div>
            </motion.div>

            {/* Right — feature checklist */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {[
                { icon: Globe, title: 'Global Reach', desc: 'Get discovered by 12,000+ professionals worldwide' },
                { icon: Shield, title: 'Verified Reviews', desc: 'Build trust with authenticated user feedback' },
                { icon: BarChart3, title: 'Growth Analytics', desc: 'Track visits, clicks, and review trends' },
                { icon: MessageSquare, title: 'Engage Users', desc: 'Respond to reviews and build relationships' },
                { icon: Award, title: 'Editorial Features', desc: 'Get hand-picked by the LaudStack team' },
                { icon: TrendingUp, title: 'Real Rankings', desc: 'Earn your rank through genuine community votes' },
              ].map(({ icon: Icon, title, desc }, i) => (
                <div key={title} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/8 transition-colors">
                  <Icon className="h-5 w-5 text-amber-400 mb-2" />
                  <h4 className="text-white font-semibold text-sm mb-1">{title}</h4>
                  <p className="text-white/50 text-xs leading-relaxed">{desc}</p>
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
