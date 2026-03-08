/*
 * LaudStack Navbar — Premium Enterprise Design
 * Transparent over dark hero → solid white on scroll
 * "LaunchPad" CTA (no pricing shown anywhere)
 * Mega-menu dropdowns, full-screen search modal
 * Competing with G2 / Product Hunt / AppSumo
 */

import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Search, Rocket, ChevronDown, Menu, X,
  Zap, BarChart3, Star, Trophy, BookOpen,
  TrendingUp, Users, Shield, Layers
} from 'lucide-react';
import { toast } from 'sonner';

const NAV_ITEMS = [
  {
    label: 'Discover',
    megaMenu: [
      { icon: Layers,     label: 'All Tools',     desc: 'Browse the full directory' },
      { icon: TrendingUp, label: 'Trending',       desc: 'What\'s hot right now' },
      { icon: Star,       label: 'Top Rated',      desc: 'Highest community scores' },
      { icon: Zap,        label: 'New Launches',   desc: 'Recently added tools' },
    ],
  },
  {
    label: 'Leaderboard',
    megaMenu: [
      { icon: Trophy,    label: 'Weekly Rankings', desc: 'This week\'s top performers' },
      { icon: BarChart3, label: 'All-Time Best',   desc: 'Highest rated of all time' },
      { icon: Users,     label: 'Community Picks', desc: 'Voted by the community' },
      { icon: Shield,    label: 'Editor\'s Picks', desc: 'Curated by our team' },
    ],
  },
  { label: 'Categories' },
  { label: 'Reviews' },
  {
    label: 'Resources',
    megaMenu: [
      { icon: BookOpen,  label: 'Blog',      desc: 'SaaS insights and guides' },
      { icon: BarChart3, label: 'Reports',   desc: 'Industry research & data' },
      { icon: Users,     label: 'Community', desc: 'Join the conversation' },
    ],
  },
];

const POPULAR_SEARCHES = [
  'AI Writing', 'CRM', 'Design Tools', 'Analytics',
  'Email Marketing', 'Project Management', 'AI Chatbot', 'Video Editing',
];

export default function Navbar() {
  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [activeMega, setActiveMega]   = useState<string | null>(null);
  const [searchOpen, setSearchOpen]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile on resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const go = () => toast.info('Feature coming soon!');

  // Hero is now light (G2-style), so nav text is always dark
  const navText   = 'text-slate-800 hover:text-slate-950';
  const navHoverBg = 'hover:bg-slate-100';

  return (
    <>
      {/* ── HEADER ──────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/97 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,0,0,0.06)]'
            : 'bg-white/80 backdrop-blur-md border-b border-slate-100/60'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-center h-[72px] gap-6">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center shrink-0 h-8">
              {/* Always use light-background logo since hero is now light */}
              <img
                src="/logo-light-transparent.png"
                alt="LaudStack"
                className="h-8 w-auto"
              />
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden lg:flex items-center gap-0.5 flex-1">
              {NAV_ITEMS.map(item => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.megaMenu && setActiveMega(item.label)}
                  onMouseLeave={() => setActiveMega(null)}
                >
                  <button
                    onClick={go}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${navText} ${navHoverBg}`}
                  >
                    {item.label}
                    {item.megaMenu && (
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${activeMega === item.label ? 'rotate-180' : ''}`}
                      />
                    )}
                  </button>

                  {/* Mega-menu dropdown */}
                  <AnimatePresence>
                    {item.megaMenu && activeMega === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.13 }}
                        className="absolute top-full left-0 mt-1.5 w-72 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100/80 overflow-hidden"
                      >
                        <div className="p-2">
                          {item.megaMenu.map(({ icon: Icon, label, desc }) => (
                            <button
                              key={label}
                              onClick={go}
                              className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-amber-100 transition-colors">
                                <Icon className="h-4 w-4 text-amber-600" />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-slate-900">{label}</div>
                                <div className="text-xs text-slate-600 mt-0.5 font-medium">{desc}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* ── Right Actions ── */}
            <div className="hidden lg:flex items-center gap-2 ml-auto">
              {/* Search pill */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border-slate-200"
              >
                <Search className="h-4 w-4" />
                <span className="hidden xl:inline">Search tools...</span>
                <kbd className="hidden xl:inline text-[10px] px-1.5 py-0.5 rounded font-mono bg-slate-200 text-slate-400">⌘K</kbd>
              </button>

              {/* Sign In */}
              <button
                onClick={go}
                className="text-sm font-semibold px-4 py-2 rounded-xl transition-all text-slate-800 hover:text-slate-950 hover:bg-slate-100"
              >
                Sign In
              </button>

              {/* LaunchPad CTA */}
              <Button
                onClick={go}
                className="gap-2 font-semibold border-0 px-5 h-10 rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all"
                style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)', color: 'white' }}
              >
                <Rocket className="h-4 w-4" />
                LaunchPad
              </Button>
            </div>

            {/* ── Mobile Toggle ── */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden ml-auto p-2.5 rounded-xl transition-colors text-slate-700 hover:bg-slate-100"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-slate-100 overflow-hidden"
            >
              <div className="px-6 py-5 space-y-1">
                {NAV_ITEMS.map(item => (
                  <button
                    key={item.label}
                    onClick={go}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
                <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
                  <button onClick={go} className="text-sm font-medium text-slate-700 px-3 py-2.5 text-left hover:bg-slate-50 rounded-xl">
                    Sign In
                  </button>
                  <Button
                    onClick={go}
                    className="gap-2 font-semibold border-0 w-full h-11 rounded-xl"
                    style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)', color: 'white' }}
                  >
                    <Rocket className="h-4 w-4" />
                    LaunchPad
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── SEARCH MODAL ─────────────────────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -12 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl shadow-slate-900/20 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                <Search className="h-5 w-5 text-slate-400 shrink-0" />
                <input
                  autoFocus
                  placeholder="Search tools, categories, reviews..."
                  className="flex-1 text-base text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
                  onKeyDown={e => {
                    if (e.key === 'Escape') setSearchOpen(false);
                    if (e.key === 'Enter') { setSearchOpen(false); go(); }
                  }}
                />
                <kbd className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-400 font-mono shrink-0">ESC</kbd>
              </div>

              {/* Popular searches */}
              <div className="px-5 py-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Popular Searches</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map(tag => (
                    <button
                      key={tag}
                      onClick={() => { setSearchOpen(false); go(); }}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-amber-700 text-sm font-medium text-slate-700 transition-colors border border-slate-200 hover:border-amber-200"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
