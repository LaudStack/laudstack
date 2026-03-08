/*
 * LaudStack Homepage — "Warm Professional"
 * Sections: Hero, Stats, Categories, Featured Tools, Leaderboard, How It Works, Pro CTA
 * Dark text on light background, amber accents throughout
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search, Zap, Star, BarChart3, Shield, ArrowRight,
  TrendingUp, Users, ChevronUp, CheckCircle2, Trophy
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import { MOCK_TOOLS, MOCK_LEADERBOARD, CATEGORIES } from '@/lib/mockData';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.45 } }),
};

const STATS = [
  { value: '95+', label: 'Tools Listed', icon: Zap },
  { value: '4,200+', label: 'Reviews', icon: Star },
  { value: '12,000+', label: 'Community Members', icon: Users },
  { value: '98%', label: 'Verified Reviews', icon: Shield },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Discover',
    desc: 'Browse our curated directory of AI and SaaS tools, filtered by category, pricing, and community rating.',
    icon: Search,
  },
  {
    step: '02',
    title: 'Review',
    desc: 'Read honest, verified reviews from real users. Leave your own review to help the community.',
    icon: Star,
  },
  {
    step: '03',
    title: 'Launch',
    desc: 'Founders submit their tools and claim their page to engage with users and track growth analytics.',
    icon: Zap,
  },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const handleComingSoon = () => toast.info('Feature coming soon!');

  const featuredTools = MOCK_TOOLS.filter(t => t.is_featured).slice(0, 6);
  const allTools = selectedCategory === 'All'
    ? MOCK_TOOLS
    : MOCK_TOOLS.filter(t => t.category === selectedCategory);
  const leaderboard = MOCK_LEADERBOARD.slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden pt-20 pb-24"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663413324407/3XGasP8CcX57JRU5Ai2Hv7/hero-bg-Nk7J2FcQkyeHt2Vy3EcaPk.webp)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay for text contrast */}
        <div className="absolute inset-0 bg-white/60" />

        <div className="container relative">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <motion.div
              initial="hidden" animate="visible" variants={fadeUp} custom={0}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-semibold text-amber-700">95+ Tools · Growing Daily</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial="hidden" animate="visible" variants={fadeUp} custom={1}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.05] tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Discover the{' '}
              <span className="ls-gradient-text">Best AI & SaaS</span>
              <br />Tools, Ranked by{' '}
              <span className="ls-gradient-text">Real Users</span>
            </motion.h1>

            <motion.p
              initial="hidden" animate="visible" variants={fadeUp} custom={2}
              className="mt-6 text-lg text-slate-600 max-w-xl leading-relaxed"
            >
              LaudStack is the trusted community platform where founders launch their tools, users discover the best software, and the community curates quality through honest reviews and voting.
            </motion.p>

            {/* Search bar */}
            <motion.div
              initial="hidden" animate="visible" variants={fadeUp} custom={3}
              className="mt-8 flex gap-3 max-w-xl"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search AI writing tools, CRMs, design tools..."
                  className="pl-12 h-13 text-base border-border shadow-sm"
                  onKeyDown={e => e.key === 'Enter' && handleComingSoon()}
                />
              </div>
              <Button
                onClick={handleComingSoon}
                className="h-13 px-6 border-0 font-semibold"
                style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)', color: 'white' }}
              >
                Search
              </Button>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial="hidden" animate="visible" variants={fadeUp} custom={4}
              className="mt-6 flex flex-wrap items-center gap-4"
            >
              <Button
                onClick={handleComingSoon}
                size="lg"
                className="border-0 font-semibold gap-2"
                style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)', color: 'white' }}
              >
                <Zap className="h-4 w-4" />
                Submit Your Tool
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleComingSoon}
                className="gap-2 font-semibold border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <BarChart3 className="h-4 w-4" />
                View Leaderboard
              </Button>
              <p className="text-sm text-muted-foreground">
                Free to list · No credit card required
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────── */}
      <section className="border-y border-border bg-white">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{value}</div>
                  <div className="text-sm text-muted-foreground">{label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ─────────────────────────────────── */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="ls-section-label mb-2">Browse by Category</div>
              <h2 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Find tools for every use case
              </h2>
            </div>
            <Button variant="ghost" onClick={handleComingSoon} className="hidden md:flex gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50">
              All Categories <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map(({ name, icon, count }, i) => (
              <motion.button
                key={name}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.5}
                onClick={() => setSelectedCategory(name)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  selectedCategory === name
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-200'
                    : 'bg-white text-slate-700 border-border hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50'
                }`}
              >
                <span>{icon}</span>
                <span>{name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  selectedCategory === name ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>{count}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOOLS GRID + LEADERBOARD ────────────────────── */}
      <section className="py-4 pb-20 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Tools Grid (2/3 width) */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="ls-section-label mb-1">
                    {selectedCategory === 'All' ? 'All Tools' : selectedCategory}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {allTools.length} tools found
                  </h2>
                </div>
                <select
                  className="text-sm border border-border rounded-lg px-3 py-2 bg-white text-slate-700"
                  onChange={handleComingSoon}
                >
                  <option>Sort: Top Rated</option>
                  <option>Sort: Trending</option>
                  <option>Sort: Newest</option>
                  <option>Sort: Most Reviewed</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {allTools.map((tool, i) => (
                  <motion.div
                    key={tool.id}
                    initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.3}
                  >
                    <ToolCard tool={tool} />
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <Button variant="outline" onClick={handleComingSoon} className="gap-2 border-border">
                  Load More Tools <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Leaderboard Sidebar (1/3 width) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {/* Weekly Leaderboard */}
                <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <div>
                      <div className="ls-section-label mb-0.5">This Week</div>
                      <h3 className="font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        🏆 Top Ranked Tools
                      </h3>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleComingSoon} className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 text-xs">
                      Full Board →
                    </Button>
                  </div>

                  <div className="divide-y divide-border">
                    {leaderboard.map(({ rank, tool, rank_change }) => (
                      <div
                        key={tool.id}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={handleComingSoon}
                      >
                        {/* Rank */}
                        <div className="w-7 shrink-0 text-center">
                          {rank <= 3 ? (
                            <span className="text-lg">{['🥇', '🥈', '🥉'][rank - 1]}</span>
                          ) : (
                            <span className="text-sm font-bold text-slate-400">{rank}</span>
                          )}
                        </div>

                        {/* Logo */}
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                          <img src={tool.logo_url} alt={tool.name} className="w-full h-full object-cover" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{tool.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{tool.category}</p>
                        </div>

                        {/* Upvotes + change */}
                        <div className="flex flex-col items-end shrink-0">
                          <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                            <ChevronUp className="h-3 w-3 text-amber-500" />
                            {tool.upvote_count >= 1000 ? `${(tool.upvote_count / 1000).toFixed(1)}k` : tool.upvote_count}
                          </div>
                          {rank_change !== 0 && (
                            <span className={`text-[10px] font-medium ${rank_change > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              {rank_change > 0 ? `▲ ${rank_change}` : `▼ ${Math.abs(rank_change)}`}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="px-5 py-3 bg-slate-50 border-t border-border">
                    <button
                      onClick={handleComingSoon}
                      className="w-full text-sm text-amber-600 font-semibold hover:text-amber-700 flex items-center justify-center gap-1"
                    >
                      View Full Leaderboard <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Pro CTA Card */}
                <div className="mt-6 rounded-2xl overflow-hidden border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                  <div className="px-5 py-6">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center mb-4">
                      <Trophy className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Are you a founder?
                    </h3>
                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                      Claim your tool page, respond to reviews, and access analytics. Go Pro for $97/month.
                    </p>
                    <ul className="space-y-2 mb-5">
                      {['Claim your tool page', 'Respond to reviews', 'Promotional banner', 'Analytics dashboard'].map(f => (
                        <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                          <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={handleComingSoon}
                      className="w-full border-0 font-semibold"
                      style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)', color: 'white' }}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Go Pro — $97/mo
                    </Button>
                  </div>
                </div>

                {/* Submit Tool Card */}
                <div className="mt-4 rounded-2xl border border-border bg-white px-5 py-5">
                  <h3 className="font-bold text-slate-900 mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Built something great?
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">Submit your tool and get discovered by thousands of users.</p>
                  <Button
                    variant="outline"
                    onClick={handleComingSoon}
                    className="w-full gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                  >
                    <Zap className="h-4 w-4" />
                    Submit a Tool — Free
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────── */}
      <section className="py-20 bg-slate-50 border-y border-border">
        <div className="container">
          <div className="text-center mb-14">
            <div className="ls-section-label mb-3">How It Works</div>
            <h2 className="text-4xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Built for the community, by the community
            </h2>
            <p className="mt-4 text-slate-500 max-w-xl mx-auto">
              LaudStack is powered by real users and verified founders. Every review, vote, and ranking is earned — never paid for.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }, i) => (
              <motion.div
                key={step}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="bg-white rounded-2xl p-8 border border-border shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 text-7xl font-black text-slate-50 select-none leading-none"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {step}
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-5 relative z-10">
                  <Icon className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 relative z-10" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {title}
                </h3>
                <p className="text-slate-500 leading-relaxed relative z-10">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED TOOLS ─────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="ls-section-label mb-2">Editor's Selection</div>
              <h2 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Featured Tools
              </h2>
              <p className="text-slate-500 mt-1">Hand-picked by the LaudStack team for exceptional quality.</p>
            </div>
            <Button variant="ghost" onClick={handleComingSoon} className="hidden md:flex gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {featuredTools.map((tool, i) => (
              <motion.div
                key={tool.id}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.2}
              >
                <ToolCard tool={tool} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────── */}
      <section className="py-20 bg-[#0F172A]">
        <div className="container text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6">
              <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-amber-300">Join 12,000+ community members</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-5 leading-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              The discovery platform<br />
              <span className="ls-gradient-text">your tool deserves</span>
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto mb-10 leading-relaxed">
              Whether you're a founder ready to launch or a user searching for the perfect tool — LaudStack is where the best software gets found.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleComingSoon}
                className="border-0 font-semibold px-8 gap-2"
                style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)', color: 'white' }}
              >
                <Zap className="h-5 w-5" />
                Submit Your Tool — Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleComingSoon}
                className="border-white/20 text-white hover:bg-white/10 hover:text-white px-8 gap-2"
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
