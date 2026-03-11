/*
 * LaudStack Navbar — Premium Enterprise Design
 * Transparent over dark hero → solid white on scroll
 * "LaunchPad" CTA (no pricing shown anywhere)
 * Mega-menu dropdowns, full-screen search modal
 * Competing with G2 / Product Hunt / AppSumo
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Search, Rocket, ChevronDown, Menu, X,
  Zap, BarChart3, Star, Trophy, BookOpen,
  TrendingUp, Users, Shield, Layers, ArrowRight,
  User, Settings, FileText, LogOut, PenSquare, Bookmark,
  Tag, Package, DollarSign, Crown
} from 'lucide-react';
import { toast } from 'sonner';
import { MOCK_TOOLS } from '@/lib/mockData';
import { useAuth, getInitials } from '@/contexts/AuthContext';
import { useSavedTools } from '@/hooks/useSavedTools';

const NAV_ITEMS = [
  {
    label: 'Discover',
    megaMenu: [
      { icon: Layers,     label: 'All Tools',     desc: 'Browse the full directory',   href: '/tools' },
      { icon: TrendingUp, label: 'Trending',       desc: 'What\'s hot right now',       href: '/trending' },
      { icon: Star,       label: 'Top Rated',      desc: 'Highest community scores',     href: '/top-rated' },
      { icon: Zap,        label: 'New Launches',   desc: 'Recently added tools',         href: '/new-launches' },
    ],
  },
  {
    label: 'Leaderboard',
    href: '/launches',
    megaMenu: [
      { icon: Trophy,    label: 'Weekly Rankings', desc: 'This week\'s top performers', href: '/launches' },
      { icon: BarChart3, label: 'All-Time Best',   desc: 'Highest rated of all time', href: '/launches' },
      { icon: Users,     label: 'Community Picks', desc: 'Voted by the community', href: '/launches' },
      { icon: Shield,    label: 'Editor\'s Picks', desc: 'Curated by our team', href: '/launches' },
    ],
  },
  {
    label: 'Tools',
    href: '/tools',
    categoryMenu: true,
    megaMenu: [
      // AI column
      { icon: '⚡', label: 'AI Productivity',    desc: 'Automation & productivity',   href: '/tools?category=AI+Productivity' },
      { icon: '✍️', label: 'AI Writing',          desc: 'Content & copywriting',       href: '/tools?category=AI+Writing' },
      { icon: '🎨', label: 'AI Image',            desc: 'Image generation & editing',  href: '/tools?category=AI+Image' },
      { icon: '🎬', label: 'AI Video',            desc: 'Video creation & editing',    href: '/tools?category=AI+Video' },
      { icon: '💻', label: 'AI Code',             desc: 'Coding assistants & IDEs',    href: '/tools?category=AI+Code' },
      { icon: '📊', label: 'AI Analytics',        desc: 'Data & research tools',       href: '/tools?category=AI+Analytics' },
      // Business column
      { icon: '📣', label: 'Marketing',           desc: 'SEO, ads & growth',           href: '/tools?category=Marketing' },
      { icon: '📋', label: 'Project Management',  desc: 'Tasks & team workflows',      href: '/tools?category=Project+Management' },
      { icon: '🤝', label: 'CRM',                 desc: 'Customer relationships',      href: '/tools?category=CRM' },
      { icon: '💰', label: 'Sales',               desc: 'Outreach & pipeline',         href: '/tools?category=Sales' },
      { icon: '🖌️', label: 'Design',              desc: 'UI, graphics & branding',     href: '/tools?category=Design' },
      { icon: '🔧', label: 'Developer Tools',     desc: 'APIs, infra & DevOps',        href: '/tools?category=Developer+Tools' },
    ],
  },
  { label: 'Templates', href: '/templates' },
  { label: 'Deals', href: '/deals' },
  {
    label: 'Resources',
    megaMenu: [
      { icon: BookOpen,  label: 'Reviews',           desc: 'Community reviews & ratings',          href: '/reviews' },
      { icon: Rocket,    label: 'Claim Your Tool',  desc: 'Verify ownership & get Pro badge',     href: '/claim' },
      { icon: Shield,    label: 'Trust Framework',  desc: 'How we verify reviews',                href: '/trust' },
      { icon: Users,     label: 'About LaudStack',  desc: 'Our mission and team',                 href: '/about' },
      { icon: FileText,  label: 'Contact Us',       desc: 'Get in touch with our team',           href: '/contact' },
    ],
  },
];

const POPULAR_SEARCHES = [
  'AI Writing', 'CRM', 'Design Tools', 'Analytics',
  'Email Marketing', 'Project Management', 'AI Chatbot', 'Video Editing',
];

export default function Navbar() {
  const [scrolled, setScrolled]         = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [activeMega, setActiveMega]     = useState<string | null>(null);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [searchInput, setSearchInput]   = useState('');
  const [avatarOpen, setAvatarOpen]     = useState(false);
  const [, navigate]                    = useLocation();
  const { user, isAuthenticated, signOut } = useAuth();
  const { savedIds } = useSavedTools();
  const avatarRef = useRef<HTMLDivElement>(null);

  // Live search results — top 5 matches
  const liveResults = searchInput.trim().length >= 1
    ? MOCK_TOOLS.filter(t => {
        const q = searchInput.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.tagline.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.tags ?? []).some((tag: string) => tag.toLowerCase().includes(q))
        );
      }).slice(0, 5)
    : [];

  const handleNavSearch = (term?: string) => {
    const q = (term ?? searchInput).trim();
    setSearchOpen(false);
    setSearchInput('');
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
    else navigate('/search');
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
      // Also open on bare '/' key when not in an input
      if (e.key === '/' && !inInput && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Close mobile on resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Close avatar dropdown on outside click
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    if (avatarOpen) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [avatarOpen]);

  const handleSignOut = () => {
    signOut();
    setAvatarOpen(false);
    navigate('/');
    toast.success('Signed out successfully.');
  };

  const go = () => toast.info('Feature coming soon!');

  // Dark header — white text on #171717 background
  const navText    = 'text-white/80 hover:text-white';
  const navHoverBg = 'hover:bg-white/10';

  return (
    <>
      {/* ── HEADER ──────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/10"
        style={{ background: '#0F1629' }}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-center h-[72px] gap-6">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center shrink-0 h-10">
              <img
                src="/logo-dark-transparent.png"
                alt="LaudStack"
                className="h-10 w-auto"
              />
            </Link>

            {/* ── Search pill (after logo) ── */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden lg:flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border text-white/60 hover:text-white bg-white/8 hover:bg-white/12 border-white/15"
              style={{ minWidth: '220px' }}
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">Search tools...</span>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-white/15 text-white/50">⌘K</kbd>
            </button>

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
                    onClick={() => (item as any).href ? navigate((item as any).href) : go()}
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
                        className={(item as any).categoryMenu
                          ? 'absolute top-full left-0 mt-1.5 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100/80 overflow-hidden'
                          : 'absolute top-full left-0 mt-1.5 w-72 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100/80 overflow-hidden'
                        }
                        style={(item as any).categoryMenu ? { width: '560px' } : {}}
                      >
                        {(item as any).categoryMenu ? (
                          /* ── Two-column category menu ── */
                          <div>
                            {/* Header */}
                            <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                              <div>
                                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Browse by Category</p>
                                <p className="text-xs text-slate-500 mt-0.5">Explore {(item.megaMenu as any[]).length} categories</p>
                              </div>
                              <button
                                onClick={() => { setActiveMega(null); navigate('/tools'); }}
                                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
                              >
                                All Tools <ArrowRight className="h-3 w-3" />
                              </button>
                            </div>
                            {/* Grid */}
                            <div className="p-3 grid grid-cols-2 gap-0.5">
                              {(item.megaMenu as Array<{ icon: string; label: string; desc: string; href?: string }>).map((menuItem) => (
                                <button
                                  key={menuItem.label}
                                  onClick={() => { setActiveMega(null); if (menuItem.href) navigate(menuItem.href); else go(); }}
                                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                                >
                                  <span className="text-lg leading-none w-7 text-center shrink-0">{menuItem.icon}</span>
                                  <div className="min-w-0">
                                    <div className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors truncate">{menuItem.label}</div>
                                    <div className="text-xs text-slate-500 mt-0.5 truncate">{menuItem.desc}</div>
                                  </div>
                                </button>
                              ))}
                            </div>
                            {/* Footer CTA */}
                            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60">
                              <button
                                onClick={() => { setActiveMega(null); navigate('/tools'); }}
                                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 transition-colors text-sm font-bold text-slate-900"
                              >
                                <Layers className="h-4 w-4" />
                                Browse All Tools
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* ── Standard icon mega-menu ── */
                          <div className="p-2">
                            {(item.megaMenu as Array<{ icon: React.ElementType; label: string; desc: string; href?: string }>).map((menuItem) => (
                              <button
                                key={menuItem.label}
                                onClick={() => { setActiveMega(null); if (menuItem.href) navigate(menuItem.href); else go(); }}
                                className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                              >
                                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-amber-100 transition-colors">
                                  <menuItem.icon className="h-4 w-4 text-amber-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-slate-900">{menuItem.label}</div>
                                  <div className="text-xs text-slate-600 mt-0.5 font-medium">{menuItem.desc}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* ── Right Actions ── */}
            <div className="hidden lg:flex items-center gap-2 ml-auto">
              {/* Auth — Sign In or Avatar */}
              {isAuthenticated && user ? (
                <div className="relative" ref={avatarRef}>
                  <button
                    onClick={() => setAvatarOpen(o => !o)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all hover:bg-slate-100"
                    aria-label="User menu"
                  >
                    {/* Avatar circle with saved badge */}
                    <div className="relative">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 select-none"
                        style={{ background: '#F59E0B' }}
                      >
                        {getInitials(user.name)}
                      </div>
                      {savedIds.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-slate-900 text-[9px] font-black rounded-full flex items-center justify-center leading-none">
                          {savedIds.length > 9 ? '9+' : savedIds.length}
                        </span>
                      )}
                    </div>
                    <div className="hidden xl:flex flex-col items-start leading-tight">
                      <span className="text-[13px] font-bold text-slate-900 max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                    </div>
                    <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${avatarOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {avatarOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.13 }}
                        className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-100 overflow-hidden z-50"
                      >
                        {/* User info header */}
                        <div className="px-4 py-3.5 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0"
                              style={{ background: '#F59E0B' }}
                            >
                              {getInitials(user.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                              <p className="text-xs text-slate-500 truncate font-medium">{user.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Menu items */}
                        <div className="p-1.5">
                          {[
                            { icon: User,       label: 'My Profile',        action: () => { navigate('/dashboard'); setAvatarOpen(false); } },
                            { icon: BarChart3,  label: 'Founder Dashboard', action: () => { navigate('/dashboard/founder'); setAvatarOpen(false); } },
                            { icon: Bookmark,   label: 'Saved Tools',       action: () => { navigate('/saved'); setAvatarOpen(false); } },
                            { icon: PenSquare,  label: 'My Reviews',        action: () => { navigate('/reviews'); setAvatarOpen(false); } },
                            { icon: FileText,   label: 'My Submissions',    action: () => { navigate('/launchpad'); setAvatarOpen(false); } },
                            { icon: Settings,   label: 'Account Settings',  action: () => { navigate('/dashboard'); setAvatarOpen(false); } },
                          ].map(({ icon: Icon, label, action }) => (
                            <button
                              key={label}
                              onClick={action}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                            >
                              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-amber-50 transition-colors">
                                <Icon className="h-3.5 w-3.5 text-slate-500 group-hover:text-amber-600 transition-colors" />
                              </div>
                              <span className="text-sm font-semibold text-slate-700">{label}</span>
                            </button>
                          ))}
                        </div>

                        {/* Sign out */}
                        <div className="p-1.5 border-t border-slate-100">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors text-left group"
                          >
                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-red-100 transition-colors">
                              <LogOut className="h-3.5 w-3.5 text-slate-500 group-hover:text-red-500 transition-colors" />
                            </div>
                            <span className="text-sm font-semibold text-slate-700 group-hover:text-red-600 transition-colors">Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/signin')}
                  className="text-sm font-semibold px-4 py-2 rounded-xl transition-all text-white/80 hover:text-white hover:bg-white/10"
                >
                  Sign In
                </button>
              )}

              {/* LaunchPad CTA */}
              <Button
                onClick={() => navigate('/launchpad')}
                className="gap-2 font-semibold border-0 px-5 h-10 rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all"
                style={{ background: '#F59E0B', color: '#0A0A0A' }}
              >
                <Rocket className="h-4 w-4" />
                LaunchPad
              </Button>
            </div>

            {/* ── Mobile Search + Toggle ── */}
            <div className="lg:hidden ml-auto flex items-center gap-2">
              {/* Mobile search pill — compact, expands to fill space */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border text-white/60 hover:text-white bg-white/8 hover:bg-white/12 border-white/15"
                style={{ minWidth: '140px' }}
              >
                <Search className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left text-white/50">Search...</span>
              </button>
              {/* Hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2.5 rounded-xl transition-colors text-white/80 hover:bg-white/10"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-white/10 overflow-hidden"
              style={{ background: '#0F1629' }}
            >
              <div className="px-6 py-5 space-y-1">
                {NAV_ITEMS.map(item => (
                  <button
                    key={item.label}
                    onClick={() => (item as any).href ? navigate((item as any).href) : go()}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
                  <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
                  {isAuthenticated && user ? (
                    <>
                      {/* Mobile user info */}
                      <div className="flex items-center gap-3 px-3 py-2.5">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                          style={{ background: '#F59E0B' }}
                        >
                          {getInitials(user.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{user.name}</p>
                          <p className="text-xs text-white/50 truncate">{user.email}</p>
                        </div>
                      </div>
                      <button onClick={() => { navigate('/reviews'); setMobileOpen(false); }} className="text-sm font-medium text-white/80 hover:text-white px-3 py-2.5 text-left hover:bg-white/10 rounded-xl flex items-center gap-2">
                        <PenSquare className="h-4 w-4 text-white/40" /> My Reviews
                      </button>
                      <button onClick={() => { navigate('/saved'); setMobileOpen(false); }} className="text-sm font-medium text-white/80 hover:text-white px-3 py-2.5 text-left hover:bg-white/10 rounded-xl flex items-center gap-2">
                        <Bookmark className="h-4 w-4 text-amber-400" /> Saved Tools
                      </button>
                      <button onClick={() => { navigate('/launchpad'); setMobileOpen(false); }} className="text-sm font-medium text-white/80 hover:text-white px-3 py-2.5 text-left hover:bg-white/10 rounded-xl flex items-center gap-2">
                        <FileText className="h-4 w-4 text-white/40" /> My Submissions
                      </button>
                      <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="text-sm font-medium text-red-400 hover:text-red-300 px-3 py-2.5 text-left hover:bg-red-500/10 rounded-xl flex items-center gap-2">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <button onClick={() => { navigate('/signin'); setMobileOpen(false); }} className="text-sm font-medium text-white/80 hover:text-white px-3 py-2.5 text-left hover:bg-white/10 rounded-xl">
                      Sign In
                    </button>
                  )}
                  <Button
                    onClick={() => { navigate('/launchpad'); setMobileOpen(false); }}
                    className="gap-2 font-semibold border-0 w-full h-11 rounded-xl"
                    style={{ background: '#F59E0B', color: '#0A0A0A' }}
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
            className="fixed inset-0 z-[100] bg-white/70 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
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
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search tools, categories, reviews..."
                  className="flex-1 text-base text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
                  onKeyDown={e => {
                    if (e.key === 'Escape') { setSearchOpen(false); setSearchInput(''); }
                    if (e.key === 'Enter') handleNavSearch();
                  }}
                />
                <kbd className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-400 font-mono shrink-0">ESC</kbd>
              </div>

              {/* Live results */}
              {liveResults.length > 0 && (
                <div className="border-b border-slate-100">
                  <div className="px-5 pt-3 pb-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tools</p>
                  </div>
                  {liveResults.map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => { setSearchOpen(false); setSearchInput(''); navigate(`/tools/${tool.slug}`); }}
                      className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50 transition-colors text-left group"
                    >
                      <div className="w-9 h-9 rounded-xl border border-slate-100 bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                        <img
                          src={tool.logo_url}
                          alt={tool.name}
                          className="w-7 h-7 object-contain"
                          onError={e => {
                            const el = e.currentTarget;
                            el.style.display = 'none';
                            const parent = el.parentElement;
                            if (parent) parent.innerHTML = `<span style="font-size:14px;font-weight:700;color:#F59E0B">${tool.name[0]}</span>`;
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">{tool.name}</div>
                        <div className="text-xs text-slate-500 truncate">{tool.tagline}</div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{tool.category}</span>
                        <div className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold text-slate-700">{tool.average_rating.toFixed(1)}</span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-amber-500 transition-colors" />
                      </div>
                    </button>
                  ))}
                  {searchInput.trim() && (
                    <button
                      onClick={() => handleNavSearch()}
                      className="w-full flex items-center gap-2 px-5 py-3 text-sm font-semibold text-amber-600 hover:bg-amber-50 transition-colors border-t border-slate-100"
                    >
                      <Search className="h-4 w-4" />
                      See all results for &ldquo;{searchInput.trim()}&rdquo;
                    </button>
                  )}
                </div>
              )}

              {/* No results state */}
              {searchInput.trim().length >= 1 && liveResults.length === 0 && (
                <div className="px-5 py-6 text-center border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-500">No tools found for &ldquo;{searchInput.trim()}&rdquo;</p>
                  <p className="text-xs text-slate-400 mt-1">Try a different keyword or browse all categories</p>
                </div>
              )}

              {/* Popular searches — shown when input is empty */}
              {searchInput.trim().length === 0 && (
                <div className="px-5 py-5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Popular Searches</p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleNavSearch(tag)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-amber-700 text-sm font-medium text-slate-700 transition-colors border border-slate-200 hover:border-amber-200"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
