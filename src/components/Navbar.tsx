"use client";

/*
 * LaudStack Navbar — Pixel-perfect Capterra-style Double Header
 *
 * Capterra specs:
 *   Top bar: 72px, white bg, logo 40px, search pill 250px/40px, LOG IN text + SIGN UP pill
 *   Nav bar: 56px, warm neutral bg, 14px/600 navy links, chevron dropdowns
 *   Total: 128px
 *   All nav text: 14px, font-weight 600, color navy (#0C1830)
 *   Buttons: uppercase, letter-spacing 2px
 */

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Search, Rocket, ChevronDown, Menu, X,
  Zap, BarChart3, Star, Trophy, BookOpen,
  TrendingUp, Users, Shield, Layers, ArrowRight,
  User, Settings, FileText, LogOut, PenSquare, Bookmark,
  Tag, Package, DollarSign, Crown, Bell, ChevronRight, Archive,
  Clock, Calendar, Flame, Heart, Award, FolderOpen, Sparkles, Compass
} from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/useAuth';
import { useDbUser } from '@/hooks/useDbUser';
import { getInitials } from '@/lib/utils';
import { useSavedTools } from '@/hooks/useSavedTools';
import { getUnreadNotificationCount } from '@/app/actions/notifications';

/* ── Module-level notification count cache ──
 * Prevents re-fetching on every Navbar mount (Next.js re-mounts layout on navigation).
 * Cache expires after 30 seconds to stay fresh. */
let _cachedNotifCount = 0;
let _notifCacheTs = 0;
const NOTIF_CACHE_TTL = 30_000; // 30 seconds
function getCachedNotifCount(): number | null {
  if (Date.now() - _notifCacheTs < NOTIF_CACHE_TTL) return _cachedNotifCount;
  return null;
}
function setCachedNotifCount(n: number) {
  _cachedNotifCount = n;
  _notifCacheTs = Date.now();
}

/* ── Color constants ── */
const NAVY = '#0C1830';           // primary text
const NAVY_LIGHT = '#1E3A5F';     // lighter navy for hover
const NAVY_MUTED = '#334155';     // muted navy for secondary text
const NAV_BG = '#ECF2FF';         // light blue for dropdown hovers & menu headers
const NAV_BAR_BG = '#1E3A5F';     // navy blue nav bar background
const NAV_BAR_TEXT = '#FFFFFF';   // white text on navy bar
const NAV_BAR_HOVER = 'rgba(255, 255, 255, 0.22)'; // hover state on navy bar — strong enough to see
const NAV_BAR_ACTIVE = 'rgba(255, 255, 255, 0.30)'; // active/current section on navy bar — clearly visible
const BORDER = '#E2E8F0';         // borders
const ORANGE = '#D97706';         // primary accent
const ORANGE_HOVER = '#B45309';   // darker orange on hover
const ORANGE_BG = '#FEF3C7';      // light orange background for active states
const ORANGE_LIGHT = '#FFF8EB';   // very light orange tint

const NAV_ITEMS = [
  {
    label: 'Launches',
    megaMenu: [
      { icon: Rocket,   label: 'LaunchPad',         desc: 'Launch your product',              href: '/launchpad' },
      { icon: Zap,      label: "Today's Launches",   desc: 'Launched today',                   href: '/launches' },
      { icon: Calendar, label: 'Upcoming Launches',  desc: 'Coming soon',                      href: '/upcoming-launches' },
      { icon: Clock,    label: 'Recently Launched',  desc: 'Fresh on the platform',            href: '/recently-added' },
      { icon: Archive,  label: 'Launch Archive',     desc: 'Browse all past launches',         href: '/launch-archive' },
    ],
  },
  {
    label: 'Discover',
    megaMenu: [
      { icon: FolderOpen, label: 'Browse Categories',  desc: 'Explore by category',               href: '/categories' },
      { icon: Compass,    label: 'Stack Finder',       desc: 'Find your perfect stack',           href: '/stack-finder' },
      { icon: Sparkles,   label: 'Spotlight Picks',    desc: 'Editor-curated top stacks',         href: '/editors-picks' },
      { icon: BarChart3,  label: 'Comparisons',        desc: 'Stack vs stack side-by-side',       href: '/comparisons' },
      { icon: Layers,     label: 'Alternatives',       desc: 'Find alternatives to any stack',    href: '/alternatives' },
    ],
  },
  {
    label: 'Leaderboard',
    megaMenu: [
      { icon: TrendingUp, label: 'Rising Stacks',    desc: "What's hot & rising right now",     href: '/trending' },
      { icon: Star,       label: 'Top Rated',          desc: 'Highest community scores',          href: '/top-rated' },
      { icon: Heart,      label: 'Most Lauded',        desc: 'Most loved by the community',       href: '/most-lauded' },
      { icon: Award,      label: 'Community Voting',   desc: 'Vote for the best stacks',          href: '/community-voting' },
      { icon: Shield,      label: 'Trust Framework',    desc: 'How we verify and rank stacks',     href: '/trust' },
    ],
  },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Deals', href: '/deals' },
];

const POPULAR_SEARCHES = [
  'AI Writing', 'CRM', 'Design Tools', 'Analytics',
  'Email Marketing', 'Project Management', 'AI Chatbot', 'Video Editing',
];

export default function Navbar() {
  const [scrolled, setScrolled]         = useState(false);
  const [navBarHidden, setNavBarHidden] = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [activeMega, setActiveMega]     = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [searchInput, setSearchInput]   = useState('');
  const [avatarOpen, setAvatarOpen]     = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const currentPath: string = pathname ?? '/';
  const isHomepage = pathname === '/';
  const { user, isAuthenticated, loading: authLoading, signOut } = useAuth();
  const { dbUser } = useDbUser();
  const { savedIds } = useSavedTools();
  const avatarRef = useRef<HTMLDivElement>(null);
  // Initialise from module-level cache to avoid flicker on re-mount
  const [navUnreadCount, setNavUnreadCount] = useState(() => getCachedNotifCount() ?? 0);
  // Poll for unread notification count (with module-level cache to prevent re-fetch on every mount)
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchCount = () => {
      getUnreadNotificationCount().then(n => {
        setCachedNotifCount(n);
        setNavUnreadCount(n);
      }).catch(() => {});
    };
    // Only fetch immediately if cache is stale
    if (getCachedNotifCount() === null) fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const founderStatus = dbUser?.founderStatus ?? 'none';
  const isVerifiedFounder = founderStatus === 'verified';
  // Check if user is staff/admin — they should see admin panel link, not user dashboard
  const userRole = dbUser?.role ?? 'user';
  const isStaffUser = ['customer_rep', 'moderator', 'analyst', 'manager', 'admin', 'super_admin'].includes(userRole);

  // Server-side autocomplete with debounce
  const [liveResults, setLiveResults] = useState<{ id: number; slug: string; name: string; tagline: string; category: string; logoUrl: string | null; averageRating: number }[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = searchInput.trim();
    if (q.length < 1) {
      setLiveResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const timer = setTimeout(() => {
      if (searchAbortRef.current) searchAbortRef.current.abort();
      const controller = new AbortController();
      searchAbortRef.current = controller;
      fetch(`/api/search?q=${encodeURIComponent(q)}&mode=autocomplete&limit=6`, { signal: controller.signal })
        .then(r => r.json())
        .then(data => {
          if (!controller.signal.aborted) {
            setLiveResults(Array.isArray(data) ? data : []);
            setSearchLoading(false);
          }
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            setLiveResults([]);
            setSearchLoading(false);
          }
        });
    }, 250);
    return () => { clearTimeout(timer); };
  }, [searchInput]);

  const handleNavSearch = (term?: string) => {
    const q = (term ?? searchInput).trim();
    setSearchOpen(false);
    setSearchInput('');
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
    else router.push('/search');
  };

  // Scroll: shadow + hide second nav bar on scroll down, show on scroll up
  const lastScrollY = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      // Only hide/show after passing the header height threshold
      if (y > 128) {
        if (y > lastScrollY.current + 5) {
          setNavBarHidden(true);  // scrolling down
        } else if (y < lastScrollY.current - 5) {
          setNavBarHidden(false); // scrolling up
        }
      } else {
        setNavBarHidden(false);
      }
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
      if (e.key === '/' && !inInput && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    if (avatarOpen) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [avatarOpen]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleSignOut = () => {
    signOut();
    setAvatarOpen(false);
    router.push('/');
    toast.success('Signed out successfully.');
  };

  const displayName = (dbUser?.firstName ? [dbUser.firstName, dbUser.lastName].filter(Boolean).join(' ') : null) || dbUser?.name || user?.user_metadata?.full_name || user?.email || 'User';
  const avatarUrl = dbUser?.avatarUrl;

  const megaMenuItems = NAV_ITEMS.filter(item => !!item.megaMenu);
  const directLinkItems = NAV_ITEMS.filter(item => !item.megaMenu);

  return (
    <>
      {/* ═══════════════════════════════════════════════════════
          DOUBLE HEADER — Capterra-exact: 72px top + 56px nav = 128px
      ═══════════════════════════════════════════════════════ */}
      <header
        className="fixed left-0 right-0 z-50"
        style={{
          top: 0,
          background: isHomepage ? '#FFFFFF' : NAV_BAR_BG,
          boxShadow: scrolled ? (isHomepage ? '0 2px 12px rgba(0,0,0,0.08)' : '0 2px 12px rgba(0,0,0,0.2)') : 'none',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        {/* ─── ROW 1: Top Bar — 72px ─── */}
        <div style={{ borderBottom: isHomepage ? `1px solid ${BORDER}` : '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

            {/* ═══ DESKTOP TOP BAR (lg+) ═══ */}
            {isHomepage ? (
              /* ─── HOMEPAGE: Full 72px top bar with logo + tagline + search + auth ─── */
              <div className="hidden lg:flex items-center h-[72px] gap-4 lg:gap-6">

                {/* Logo + tagline */}
                <div className="flex items-center gap-3 shrink-0">
                  <Link href="/" className="shrink-0">
                    <img src="/logo-light-transparent.png" alt="LaudStack" style={{ height: '40px', width: 'auto' }} />
                  </Link>
                  <span className="hidden xl:block leading-tight max-w-[180px] select-none" style={{ fontSize: '12px', fontWeight: 600, color: NAVY_MUTED, cursor: 'default' }}>
                    The launch &amp; discovery<br />platform for AI &amp; SaaS
                  </span>
                </div>

                {/* Search bar */}
                <div className="flex flex-1 justify-center">
                  <div
                    className="flex items-center cursor-text transition-all"
                    style={{ width: '320px', height: '40px', borderRadius: '20px', border: '1px solid #94A3B8', background: '#FFFFFF' }}
                    onClick={() => setSearchOpen(true)}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = ORANGE; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#94A3B8'; }}
                  >
                    <input
                      readOnly
                      placeholder="What can we help you find?"
                      style={{ fontSize: '14px', color: '#64748B', padding: '0 12px', flex: 1, background: 'transparent', border: 'none', outline: 'none', cursor: 'pointer', height: '100%' }}
                      onClick={() => setSearchOpen(true)}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', flexShrink: 0 }}>
                      <Search style={{ width: '16px', height: '16px', color: '#94A3B8' }} />
                    </div>
                  </div>
                </div>

                {/* Right side: Auth buttons */}
                <div className="flex items-center gap-2 shrink-0 ml-auto">
                {authLoading ? (
                  /* Skeleton placeholder while auth is loading — prevents flash */
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse" />
                    <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse" />
                  </div>
                ) : isAuthenticated && user ? (
                  <>
                    {/* Notification bell */}
                    <button
                      onClick={() => router.push('/dashboard?tab=notifications')}
                      className="relative flex items-center justify-center w-10 h-10 rounded-full bg-transparent border-none cursor-pointer transition-colors hover:bg-slate-100"
                      style={{ color: NAVY }}
                    >
                      <Bell style={{ width: '18px', height: '18px' }} />
                      {navUnreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                          {navUnreadCount > 9 ? '9+' : navUnreadCount}
                        </span>
                      )}
                    </button>

                    {/* Avatar dropdown */}
                    <div ref={avatarRef} className="relative">
                      <button
                        onClick={() => setAvatarOpen(!avatarOpen)}
                        className="flex items-center gap-2 px-1.5 py-1 rounded-full bg-transparent border-none cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" style={{ border: `2px solid ${BORDER}` }} />
                        ) : (
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold text-white" style={{ background: NAVY }}>
                            {getInitials(displayName)}
                          </div>
                        )}
                        <ChevronDown style={{ width: '12px', height: '12px', color: NAVY }} />
                      </button>

                      {/* Desktop dropdown */}
                      {avatarOpen && (
                        <div
                          className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl overflow-hidden z-[200]"
                          style={{ border: `1px solid ${BORDER}`, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                        >
                          <div className="px-4 py-3 border-b border-slate-200" style={{ background: NAV_BG }}>
                            <p className="text-[14px] font-semibold text-slate-900 truncate">{displayName}</p>
                            <p className="text-[12px] text-slate-500 truncate">{dbUser?.headline || 'LaudStack Member'}</p>
                          </div>
                          <div className="py-1.5">
                            {isStaffUser ? (
                              <button
                                onClick={() => { router.push('/ops-console/dashboard'); setAvatarOpen(false); }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors bg-transparent border-none cursor-pointer"
                                style={{ fontSize: '14px', color: '#D97706', fontWeight: 600 }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#FFFBEB'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                              >
                                <Shield style={{ width: '16px', height: '16px', color: '#D97706' }} />
                                Admin Panel
                              </button>
                            ) : (
                              <>
                                {[
                                  { icon: User, label: 'My Dashboard', href: '/dashboard' },
                                  { icon: PenSquare, label: 'My Reviews', href: '/dashboard?tab=reviews' },
                                  { icon: Bookmark, label: `Saved Stacks${savedIds.length > 0 ? ` (${savedIds.length})` : ''}`, href: '/dashboard?tab=saved' },
                                  { icon: Bell, label: `Notifications${navUnreadCount > 0 ? ` (${navUnreadCount})` : ''}`, href: '/dashboard?tab=notifications' },
                                  { icon: Settings, label: 'Settings', href: '/dashboard?tab=settings' },
                                ].map(item => (
                                  <button
                                    key={item.label}
                                    onPointerDown={e => e.preventDefault()}
                                    onClick={() => { router.push(item.href); setAvatarOpen(false); }}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors bg-transparent border-none cursor-pointer"
                                    style={{ fontSize: '14px', color: '#334155' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = NAV_BG; e.currentTarget.style.color = ORANGE; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#334155'; }}
                                  >
                                    <item.icon style={{ width: '16px', height: '16px', color: '#94A3B8' }} />
                                    {item.label}
                                  </button>
                                ))}
                                {isVerifiedFounder && (
                                  <button
                                    onPointerDown={e => e.preventDefault()}
                                    onClick={() => { router.push('/dashboard/founder'); setAvatarOpen(false); }}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors bg-transparent border-none cursor-pointer"
                                    style={{ fontSize: '14px', color: '#D97706' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#FFFBEB'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                  >
                                    <Crown style={{ width: '16px', height: '16px' }} />
                                    Founder Dashboard
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                          <div className="border-t border-slate-200 py-1.5">
                            <button
                              onPointerDown={e => e.preventDefault()}
                              onClick={handleSignOut}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors bg-transparent border-none cursor-pointer"
                              style={{ fontSize: '14px', color: '#EF4444' }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                            >
                              <LogOut style={{ width: '16px', height: '16px' }} />
                              Sign Out
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => router.push('/auth/login')}
                      className="flex items-center bg-transparent border-none cursor-pointer transition-colors"
                      style={{ fontSize: '14px', fontWeight: 600, color: NAVY, padding: '0 16px' }}
                      onMouseEnter={e => (e.currentTarget.style.color = NAVY_LIGHT)}
                      onMouseLeave={e => (e.currentTarget.style.color = NAVY)}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => router.push('/launchpad')}
                      className="flex items-center gap-2 border-none cursor-pointer transition-all"
                      style={{ height: '40px', padding: '0 20px', borderRadius: '8px', background: ORANGE, color: '#FFFFFF', fontSize: '14px', fontWeight: 600, boxShadow: '0 1px 4px rgba(217, 119, 6, 0.3)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = ORANGE_HOVER; e.currentTarget.style.boxShadow = '0 2px 8px rgba(180, 83, 9, 0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = ORANGE; e.currentTarget.style.boxShadow = '0 1px 4px rgba(217, 119, 6, 0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      <Rocket style={{ width: '14px', height: '14px' }} />
                      LaunchPad
                    </button>
                  </>
                )}
                </div>
              </div>
            ) : (
              /* ─── INNER PAGES: Single 64px header — logo + inline nav + auth ─── */
              <div className="hidden lg:flex items-center h-[64px] w-full">

                {/* Logo only — white version for navy background */}
                <Link href="/" className="flex items-center shrink-0">
                  <img src="/logo-dark-transparent.png" alt="LaudStack" style={{ height: '36px', width: 'auto' }} />
                </Link>

                {/* Inline nav items — centered */}
                <nav className="flex items-center justify-center gap-1.5 flex-1">
                  {megaMenuItems.map(item => {
                    const isActive = activeMega === item.label;
                    const isCurrentSection = item.megaMenu!.some(sub => pathname === sub.href || (pathname ?? '').startsWith(sub.href + '/'));

                    return (
                      <div
                        key={item.label}
                        className="relative"
                        onMouseEnter={() => setActiveMega(item.label)}
                        onMouseLeave={() => setActiveMega(null)}
                      >
                        <button
                          className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer transition-all rounded-lg"
                          style={{
                            fontSize: '14.5px',
                            fontWeight: 700,
                            color: isActive ? '#FFFFFF' : NAV_BAR_TEXT,
                            letterSpacing: '0.3px',
                            padding: '8px 14px',
                            background: isActive ? 'rgba(255, 255, 255, 0.22)' : isCurrentSection ? NAV_BAR_ACTIVE : 'transparent',
                          }}
                          onMouseEnter={e => {
                            if (!isActive && !isCurrentSection) {
                              e.currentTarget.style.background = NAV_BAR_HOVER;
                            }
                          }}
                          onMouseLeave={e => {
                            if (!isActive && !isCurrentSection) {
                              e.currentTarget.style.background = 'transparent';
                            }
                          }}
                        >
                          {item.label}
                          <ChevronDown
                            style={{
                              width: '13px',
                              height: '13px',
                              color: 'inherit',
                              transition: 'transform 0.2s',
                              transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
                            }}
                          />
                        </button>

                        {/* Mega menu dropdown */}
                        {isActive && item.megaMenu && (
                          <div
                            className="absolute top-full left-0 mt-0 w-[340px] bg-white overflow-hidden z-[150]"
                            style={{
                              border: `1px solid ${BORDER}`,
                              borderTop: `3px solid ${ORANGE}`,
                              boxShadow: '0 12px 32px rgba(12, 24, 48, 0.12), 0 4px 8px rgba(12, 24, 48, 0.06)',
                              borderRadius: '0 0 12px 12px',
                            }}
                          >
                            <div className="py-2">
                              {item.megaMenu.map(sub => {
                                const SubIcon = sub.icon as React.ElementType;
                                const isSubActive = pathname === sub.href || (pathname ?? '').startsWith(sub.href + '/');
                                return (
                                  <button
                                    key={sub.label}
                                    onClick={() => { router.push(sub.href); setActiveMega(null); }}
                                    className="w-full flex items-center gap-3 px-5 py-3 text-left transition-all bg-transparent border-none cursor-pointer"
                                    style={{ background: isSubActive ? ORANGE_BG : 'transparent' }}
                                    onMouseEnter={e => { if (!isSubActive) e.currentTarget.style.background = '#F8FAFC'; }}
                                    onMouseLeave={e => { if (!isSubActive) e.currentTarget.style.background = 'transparent'; }}
                                  >
                                    <div
                                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                      style={{ background: isSubActive ? '#FEF3C7' : '#F1F5F9' }}
                                    >
                                      <SubIcon style={{ width: '16px', height: '16px', color: isSubActive ? ORANGE_HOVER : '#64748B' }} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div style={{ fontSize: '14px', fontWeight: 600, color: isSubActive ? ORANGE_HOVER : NAVY }}>
                                        {sub.label}
                                      </div>
                                      <div style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.4', marginTop: '2px' }}>{sub.desc}</div>
                                    </div>
                                    {isSubActive && (
                                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ORANGE }} />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Direct link items — white text on navy */}
                  {directLinkItems.map(item => {
                    const href = (item as any).href;
                    const isCurrentPage = pathname === href;
                    return (
                      <button
                        key={item.label}
                        onClick={() => router.push(href)}
                        className="bg-transparent border-none cursor-pointer transition-all rounded-lg"
                        style={{
                          fontSize: '14.5px',
                          fontWeight: 700,
                          color: isCurrentPage ? '#FFFFFF' : NAV_BAR_TEXT,
                          letterSpacing: '0.3px',
                          padding: '8px 14px',
                          background: isCurrentPage ? NAV_BAR_ACTIVE : 'transparent',
                        }}
                        onMouseEnter={e => {
                          if (!isCurrentPage) {
                            e.currentTarget.style.background = NAV_BAR_HOVER;
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isCurrentPage) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        {item.label}
                      </button>
                    );
                  })}

                  {/* Write a Review — white text on navy */}
                  <button
                    onClick={() => router.push('/reviews')}
                    className="bg-transparent border-none cursor-pointer transition-all rounded-lg"
                    style={{
                      fontSize: '14.5px',
                      fontWeight: 700,
                      color: pathname === '/reviews' ? '#FFFFFF' : NAV_BAR_TEXT,
                      letterSpacing: '0.3px',
                      padding: '8px 14px',
                      background: pathname === '/reviews' ? NAV_BAR_ACTIVE : 'transparent',
                    }}
                    onMouseEnter={e => {
                      if (pathname !== '/reviews') {
                        e.currentTarget.style.background = NAV_BAR_HOVER;
                      }
                    }}
                    onMouseLeave={e => {
                      if (pathname !== '/reviews') {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    Write a Review
                  </button>
                </nav>

                {/* Right side: Auth buttons */}
                <div className="flex items-center gap-2 shrink-0 ml-auto">
                  {authLoading ? (
                    /* Skeleton placeholder while auth is loading — prevents flash */
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.15)' }} />
                      <div className="w-9 h-9 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.15)' }} />
                    </div>
                  ) : isAuthenticated && user ? (
                    <>
                      {/* Notification bell — white on navy */}
                      <button
                        onClick={() => router.push('/dashboard?tab=notifications')}
                        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-transparent border-none cursor-pointer transition-colors"
                        style={{ color: NAV_BAR_TEXT }}
                        onMouseEnter={e => { e.currentTarget.style.background = NAV_BAR_HOVER; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <Bell style={{ width: '18px', height: '18px' }} />
                        {navUnreadCount > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                            {navUnreadCount > 9 ? '9+' : navUnreadCount}
                          </span>
                        )}
                      </button>

                      {/* Avatar dropdown */}
                      <div ref={avatarRef} className="relative">
                        <button
                          onClick={() => setAvatarOpen(!avatarOpen)}
                          className="flex items-center gap-2 px-1.5 py-1 rounded-full bg-transparent border-none cursor-pointer transition-colors"
                          onMouseEnter={e => { e.currentTarget.style.background = NAV_BAR_HOVER; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" style={{ border: '2px solid rgba(255,255,255,0.3)' }} />
                          ) : (
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold" style={{ background: 'rgba(255,255,255,0.2)', color: NAV_BAR_TEXT }}>
                              {getInitials(displayName)}
                            </div>
                          )}
                          <ChevronDown style={{ width: '12px', height: '12px', color: NAV_BAR_TEXT }} />
                        </button>

                        {/* Desktop dropdown */}
                        {avatarOpen && (
                          <div
                            className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl overflow-hidden z-[200]"
                            style={{ border: `1px solid ${BORDER}`, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                          >
                            <div className="px-4 py-3 border-b border-slate-200" style={{ background: NAV_BG }}>
                              <p className="text-[14px] font-semibold text-slate-900 truncate">{displayName}</p>
                              <p className="text-[12px] text-slate-500 truncate">{dbUser?.headline || 'LaudStack Member'}</p>
                            </div>
                            <div className="py-1.5">
                              {isStaffUser ? (
                                <button
                                  onPointerDown={e => e.preventDefault()}
                                  onClick={() => { router.push('/ops-console/dashboard'); setAvatarOpen(false); }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors bg-transparent border-none cursor-pointer"
                                  style={{ fontSize: '14px', color: '#D97706', fontWeight: 600 }}
                                  onMouseEnter={e => { e.currentTarget.style.background = '#FFFBEB'; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                  <Shield style={{ width: '16px', height: '16px', color: '#D97706' }} />
                                  Admin Panel
                                </button>
                              ) : (
                                <>
                                  {[
                                    { icon: User, label: 'My Dashboard', href: '/dashboard' },
                                    { icon: PenSquare, label: 'My Reviews', href: '/dashboard?tab=reviews' },
                                    { icon: Bookmark, label: `Saved Stacks${savedIds.length > 0 ? ` (${savedIds.length})` : ''}`, href: '/dashboard?tab=saved' },
                                    { icon: Bell, label: `Notifications${navUnreadCount > 0 ? ` (${navUnreadCount})` : ''}`, href: '/dashboard?tab=notifications' },
                                    { icon: Settings, label: 'Settings', href: '/dashboard?tab=settings' },
                                  ].map(item => (
                                    <button
                                      key={item.label}
                                      onPointerDown={e => e.preventDefault()}
                                      onClick={() => { router.push(item.href); setAvatarOpen(false); }}
                                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors bg-transparent border-none cursor-pointer"
                                      style={{ fontSize: '14px', color: '#334155' }}
                                      onMouseEnter={e => { e.currentTarget.style.background = NAV_BG; e.currentTarget.style.color = ORANGE; }}
                                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#334155'; }}
                                    >
                                      <item.icon style={{ width: '16px', height: '16px', color: '#94A3B8' }} />
                                      {item.label}
                                    </button>
                                  ))}
                                  {isVerifiedFounder && (
                                    <button
                                      onPointerDown={e => e.preventDefault()}
                                      onClick={() => { router.push('/dashboard/founder'); setAvatarOpen(false); }}
                                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors bg-transparent border-none cursor-pointer"
                                      style={{ fontSize: '14px', color: '#D97706' }}
                                      onMouseEnter={e => { e.currentTarget.style.background = '#FFFBEB'; }}
                                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                    >
                                      <Crown style={{ width: '16px', height: '16px' }} />
                                      Founder Dashboard
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                            <div className="border-t border-slate-200 py-1.5">
                              <button
                                onPointerDown={e => e.preventDefault()}
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors bg-transparent border-none cursor-pointer"
                                style={{ fontSize: '14px', color: '#EF4444' }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                              >
                                <LogOut style={{ width: '16px', height: '16px' }} />
                                Sign Out
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => router.push('/auth/login')}
                        className="flex items-center bg-transparent border-none cursor-pointer transition-colors"
                        style={{ fontSize: '13px', fontWeight: 600, color: NAV_BAR_TEXT, padding: '0 14px' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => router.push('/launchpad')}
                        className="flex items-center gap-2 border-none cursor-pointer transition-all"
                        style={{ height: '36px', padding: '0 18px', borderRadius: '8px', background: ORANGE, color: '#FFFFFF', fontSize: '13px', fontWeight: 600, boxShadow: '0 1px 4px rgba(217, 119, 6, 0.3)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = ORANGE_HOVER; e.currentTarget.style.boxShadow = '0 2px 8px rgba(180, 83, 9, 0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = ORANGE; e.currentTarget.style.boxShadow = '0 1px 4px rgba(217, 119, 6, 0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        <Rocket style={{ width: '13px', height: '13px' }} />
                        LaunchPad
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ═══ MOBILE TOP BAR (<lg) — 3 items: Hamburger | Logo | Profile ═══ */}
            <div className="flex lg:hidden items-center justify-between h-[60px] px-1">

              {/* LEFT: Hamburger menu */}
              <button
                onClick={() => { setMobileOpen(!mobileOpen); setAvatarOpen(false); }}
                className="flex items-center justify-center bg-transparent border-none cursor-pointer p-1"
                style={{ color: isHomepage ? '#1E293B' : NAV_BAR_TEXT }}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X style={{ width: '28px', height: '28px', strokeWidth: 2.5 }} /> : <Menu style={{ width: '28px', height: '28px', strokeWidth: 2.5 }} />}
              </button>

              {/* CENTER: Logo — absolutely centered */}
              <Link
                href="/"
                className="absolute left-1/2 -translate-x-1/2 flex items-center"
                onClick={() => setMobileOpen(false)}
              >
                <img
                  src={isHomepage ? '/logo-light-transparent.png' : '/logo-dark-transparent.png'}
                  alt="LaudStack"
                  style={{ height: '34px', width: 'auto' }}
                />
              </Link>

              {/* RIGHT: Profile icon / Avatar */}
              <div ref={avatarRef} className="relative">
                {authLoading ? (
                  /* Skeleton placeholder while auth is loading — prevents flash */
                  <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse" />
                ) : isAuthenticated && user ? (
                  <>
                    {/* Single avatar button: opens mobile drawer on mobile, desktop dropdown on desktop */}
                    <button
                      onClick={() => { if (window.innerWidth < 1024) { setMobileProfileOpen(true); } else { setAvatarOpen(!avatarOpen); setMobileOpen(false); } }}
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-transparent border-none cursor-pointer transition-colors hover:bg-slate-100"
                      aria-label="Profile menu"
                    >
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" style={{ border: `3px solid ${NAVY}`, boxShadow: '0 0 0 1px rgba(30,41,59,0.1)' }} />
                      ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-extrabold text-white" style={{ background: NAVY, border: '3px solid #334155', boxShadow: '0 0 0 1px rgba(30,41,59,0.1)' }}>
                          {getInitials(displayName)}
                        </div>
                      )}
                    </button>
                    {/* Desktop avatar dropdown */}
                    {avatarOpen && (
                      <div
                        className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl overflow-hidden z-[200] hidden lg:block"
                        style={{ border: `1px solid ${BORDER}`, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                      >
                        <div className="px-4 py-3 border-b border-slate-200" style={{ background: NAV_BG }}>
                          <p className="text-[14px] font-semibold text-slate-900 truncate">{displayName}</p>
                          <p className="text-[12px] text-slate-500 truncate">{dbUser?.headline || 'LaudStack Member'}</p>
                        </div>
                        <div className="py-1.5">
                          {isStaffUser ? (
                            <button
                              onPointerDown={e => e.preventDefault()}
                              onClick={() => { router.push('/ops-console/dashboard'); setAvatarOpen(false); }}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors bg-transparent border-none cursor-pointer"
                              style={{ fontSize: '14px', color: '#D97706', fontWeight: 600 }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#FFFBEB'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                            >
                              <Shield style={{ width: '16px', height: '16px', color: '#D97706' }} />
                              Admin Panel
                            </button>
                          ) : (
                            <>
                              {[
                                { icon: User, label: 'My Dashboard', href: '/dashboard' },
                                { icon: PenSquare, label: 'My Reviews', href: '/dashboard?tab=reviews' },
                                { icon: Bookmark, label: `Saved Stacks${savedIds.length > 0 ? ` (${savedIds.length})` : ''}`, href: '/dashboard?tab=saved' },
                                { icon: Bell, label: `Notifications${navUnreadCount > 0 ? ` (${navUnreadCount})` : ''}`, href: '/dashboard?tab=notifications' },
                                { icon: Settings, label: 'Settings', href: '/dashboard?tab=settings' },
                              ].map(item => (
                                <button
                                  key={item.label}
                                  onPointerDown={e => e.preventDefault()}
                                  onClick={() => { router.push(item.href); setAvatarOpen(false); setMobileOpen(false); }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors bg-transparent border-none cursor-pointer"
                                  style={{ fontSize: '14px', color: '#334155' }}
                                  onMouseEnter={e => { e.currentTarget.style.background = NAV_BG; e.currentTarget.style.color = ORANGE; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#334155'; }}
                                >
                                  <item.icon style={{ width: '16px', height: '16px', color: '#94A3B8' }} />
                                  {item.label}
                                </button>
                              ))}
                              {isVerifiedFounder && (
                                <button
                                  onPointerDown={e => e.preventDefault()}
                                  onClick={() => { router.push('/dashboard/founder'); setAvatarOpen(false); setMobileOpen(false); }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors bg-transparent border-none cursor-pointer"
                                  style={{ fontSize: '14px', color: '#D97706' }}
                                  onMouseEnter={e => { e.currentTarget.style.background = '#FFFBEB'; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                  <Crown style={{ width: '16px', height: '16px' }} />
                                  Founder Dashboard
                                </button>
                              )}
                            </>
                          )}
                        </div>
                        <div className="border-t border-slate-200 py-1.5">
                          <button
                            onPointerDown={e => e.preventDefault()}
                            onClick={() => { handleSignOut(); setAvatarOpen(false); setMobileOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors bg-transparent border-none cursor-pointer"
                            style={{ fontSize: '14px', color: '#EF4444' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            <LogOut style={{ width: '16px', height: '16px' }} />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                    {/* Mobile profile menu modal drawer */}
                    {mobileProfileOpen && (
                      <div className="fixed inset-0 z-[300] lg:hidden">
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/40" onClick={() => setMobileProfileOpen(false)} />
                        {/* Modal drawer from bottom */}
                        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl overflow-hidden max-h-[80vh] flex flex-col">
                          {/* Header */}
                          <div className="px-4 py-4 border-b border-slate-200 flex items-center justify-between" style={{ background: NAV_BG }}>
                            <div>
                              <p className="text-[16px] font-semibold text-slate-900">{displayName}</p>
                              <p className="text-[13px] text-slate-500">{dbUser?.headline || 'LaudStack Member'}</p>
                            </div>
                            <button onClick={() => setMobileProfileOpen(false)} className="p-2 hover:bg-white/50 rounded-lg transition-colors" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                              <X style={{ width: '20px', height: '20px', color: '#334155' }} />
                            </button>
                          </div>
                          {/* Menu items */}
                          <div className="flex-1 overflow-y-auto py-2">
                            {isStaffUser ? (
                              <button
                                onClick={() => { router.push('/ops-console/dashboard'); setMobileProfileOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                                style={{ fontSize: '15px', color: '#D97706', fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer' }}
                              >
                                <Shield style={{ width: '18px', height: '18px', color: '#D97706' }} />
                                Admin Panel
                              </button>
                            ) : (
                              <>
                                {[
                                  { icon: User, label: 'My Dashboard', href: '/dashboard' },
                                  { icon: PenSquare, label: 'My Reviews', href: '/dashboard?tab=reviews' },
                                  { icon: Bookmark, label: `Saved Stacks${savedIds.length > 0 ? ` (${savedIds.length})` : ''}`, href: '/dashboard?tab=saved' },
                                  { icon: Bell, label: `Notifications${navUnreadCount > 0 ? ` (${navUnreadCount})` : ''}`, href: '/dashboard?tab=notifications' },
                                  { icon: Settings, label: 'Settings', href: '/dashboard?tab=settings' },
                                ].map(item => (
                                  <button
                                    key={item.label}
                                    onClick={() => { router.push(item.href); setMobileProfileOpen(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                                    style={{ fontSize: '15px', color: '#334155', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                  >
                                    <item.icon style={{ width: '18px', height: '18px', color: '#94A3B8' }} />
                                    {item.label}
                                  </button>
                                ))}
                                {isVerifiedFounder && (
                                  <button
                                    onClick={() => { router.push('/dashboard/founder'); setMobileProfileOpen(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                                    style={{ fontSize: '15px', color: '#D97706', fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer' }}
                                  >
                                    <Crown style={{ width: '18px', height: '18px' }} />
                                    Founder Dashboard
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                          {/* Sign out button */}
                          <div className="border-t border-slate-200 p-3">
                            <button
                              onClick={() => { handleSignOut(); setMobileProfileOpen(false); }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors rounded-lg"
                              style={{ fontSize: '15px', color: '#EF4444', fontWeight: 500, background: '#FEF2F2', border: 'none', cursor: 'pointer' }}
                            >
                              <LogOut style={{ width: '18px', height: '18px' }} />
                              Sign Out
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => router.push('/auth/login')}
                    className="flex items-center justify-center w-10 h-10 rounded-full border-none cursor-pointer transition-colors hover:bg-slate-100"
                    style={{ color: NAVY, background: 'rgba(30,41,59,0.06)', border: `2.5px solid ${NAVY}` }}
                    aria-label="Sign in"
                  >
                    <User style={{ width: '22px', height: '22px', strokeWidth: 2.5 }} />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* ROW 2: Navigation Bar - 56px - ONLY ON HOMEPAGE, SLIDES IN/OUT on scroll */}
      {isHomepage && (
      <div
        className="hidden lg:block fixed left-0 right-0 z-40"
        style={{
          top: navBarHidden ? '16px' : '72px',
          opacity: navBarHidden ? 0 : 1,
          pointerEvents: navBarHidden ? 'none' as const : 'auto' as const,
          background: NAV_BAR_BG,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'top 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-[56px] gap-1">

              {/* Left: Mega-menu dropdowns + direct links */}
              <nav className="flex items-center gap-1.5">
                {megaMenuItems.map(item => {
                  const isActive = activeMega === item.label;
                  const isCurrentSection = item.megaMenu!.some(sub => currentPath === sub.href || currentPath.startsWith(sub.href + '/'));

                  return (
                    <div
                      key={item.label}
                      className="relative"
                      onMouseEnter={() => setActiveMega(item.label)}
                      onMouseLeave={() => setActiveMega(null)}
                    >
                      <button
                        className="flex items-center gap-1.5 border-none cursor-pointer transition-all rounded-lg"
                        style={{
                          fontSize: '14.5px',
                          fontWeight: 700,
                          color: isActive ? '#FFFFFF' : NAV_BAR_TEXT,
                          letterSpacing: '0.3px',
                          padding: '8px 14px',
                          background: isActive ? 'rgba(255, 255, 255, 0.22)' : isCurrentSection ? NAV_BAR_ACTIVE : 'transparent',
                        }}
                        onMouseEnter={e => {
                          if (!isActive && !isCurrentSection) {
                            e.currentTarget.style.background = NAV_BAR_HOVER;
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isActive && !isCurrentSection) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        {item.label}
                        <ChevronDown
                          style={{
                            width: '13px',
                            height: '13px',
                            color: 'inherit',
                            transition: 'transform 0.2s',
                            transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}
                        />
                      </button>

                      {/* Mega menu dropdown */}
                      {isActive && item.megaMenu && (
                        <div
                          className="absolute top-full left-0 mt-0 w-[340px] bg-white overflow-hidden z-[150]"
                          style={{
                            border: `1px solid ${BORDER}`,
                            borderTop: `3px solid ${ORANGE}`,
                            boxShadow: '0 12px 32px rgba(12, 24, 48, 0.12), 0 4px 8px rgba(12, 24, 48, 0.06)',
                            borderRadius: '0 0 12px 12px',
                          }}
                        >
                          <div className="py-2">
                            {item.megaMenu.map(sub => {
                              const SubIcon = sub.icon as React.ElementType;
                              const isSubActive = currentPath === sub.href || currentPath.startsWith(sub.href + '/');
                              return (
                                <button
                                  key={sub.label}
                                  onClick={() => { router.push(sub.href); setActiveMega(null); }}
                                  className="w-full flex items-center gap-3 px-5 py-3 text-left transition-all bg-transparent border-none cursor-pointer"
                                  style={{ background: isSubActive ? ORANGE_BG : 'transparent' }}
                                  onMouseEnter={e => { if (!isSubActive) e.currentTarget.style.background = '#F8FAFC'; }}
                                  onMouseLeave={e => { if (!isSubActive) e.currentTarget.style.background = 'transparent'; }}
                                >
                                  <div
                                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ background: isSubActive ? '#FEF3C7' : '#F1F5F9' }}
                                  >
                                    <SubIcon style={{ width: '16px', height: '16px', color: isSubActive ? ORANGE_HOVER : '#64748B' }} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: isSubActive ? ORANGE_HOVER : NAVY }}>
                                      {sub.label}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.4', marginTop: '2px' }}>{sub.desc}</div>
                                  </div>
                                  {isSubActive && (
                                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ORANGE }} />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Direct link items — white text on navy */}
                {directLinkItems.map(item => {
                  const href = (item as any).href;
                  const isCurrentPage = currentPath === href;
                  return (
                    <button
                      key={item.label}
                      onClick={() => router.push(href)}
                      className="border-none cursor-pointer transition-all rounded-lg"
                      style={{
                        fontSize: '14.5px',
                        fontWeight: 700,
                        color: isCurrentPage ? '#FFFFFF' : NAV_BAR_TEXT,
                        letterSpacing: '0.3px',
                        padding: '8px 14px',
                        background: isCurrentPage ? NAV_BAR_ACTIVE : 'transparent',
                      }}
                      onMouseEnter={e => {
                        if (!isCurrentPage) {
                          e.currentTarget.style.background = NAV_BAR_HOVER;
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isCurrentPage) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              {/* Divider */}
              <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.25)', margin: '0 4px' }} />

              {/* Action links — white text on navy */}
              <button
                onClick={() => router.push('/stack-finder')}
                className="border-none cursor-pointer transition-all rounded-lg"
                style={{
                  fontSize: '14.5px',
                  fontWeight: 700,
                  color: currentPath === '/stack-finder' ? '#FFFFFF' : NAV_BAR_TEXT,
                  letterSpacing: '0.3px',
                  padding: '8px 14px',
                  background: currentPath === '/stack-finder' ? NAV_BAR_ACTIVE : 'transparent',
                }}
                onMouseEnter={e => {
                  if (currentPath !== '/stack-finder') {
                    e.currentTarget.style.background = NAV_BAR_HOVER;
                  }
                }}
                onMouseLeave={e => {
                  if (currentPath !== '/stack-finder') {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                Stack Finder
              </button>

              {/* Write a Review — white text on navy */}
              <button
                onClick={() => router.push('/reviews')}
                className="border-none cursor-pointer transition-all rounded-lg"
                style={{
                  fontSize: '14.5px',
                  fontWeight: 700,
                  color: currentPath === '/reviews' ? '#FFFFFF' : NAV_BAR_TEXT,
                  letterSpacing: '0.3px',
                  padding: '8px 14px',
                  background: currentPath === '/reviews' ? NAV_BAR_ACTIVE : 'transparent',
                }}
                onMouseEnter={e => {
                  if (currentPath !== '/reviews') {
                    e.currentTarget.style.background = NAV_BAR_HOVER;
                  }
                }}
                onMouseLeave={e => {
                  if (currentPath !== '/reviews') {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                Write a Review
              </button>
          </div>
        </div>
      </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MOBILE MENU — slides from left, full width
      ═══════════════════════════════════════════════════════ */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[90] lg:hidden"
          style={{ top: '60px' }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20" onClick={() => setMobileOpen(false)} />

          {/* Panel — slides from left */}
          <div
            className="absolute top-0 left-0 w-[85%] max-w-[340px] h-full bg-white overflow-y-auto"
            style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.08)' }}
          >
            <div className="p-5 space-y-1">

              {/* Mobile search */}
              <div className="mb-5">
                <div
                  className="flex items-center gap-3 cursor-pointer transition-colors"
                  style={{
                    padding: '11px 16px',
                    borderRadius: '12px',
                    border: `1px solid ${BORDER}`,
                    background: '#F8FAFC',
                  }}
                  onClick={() => { setMobileOpen(false); setSearchOpen(true); }}
                >
                  <Search style={{ width: '16px', height: '16px', color: '#94A3B8', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: '#94A3B8', fontWeight: 500, flex: 1 }}>Search stacks...</span>
                </div>
              </div>

              {/* Navigation items */}
              <div className="space-y-0.5">
                {NAV_ITEMS.map(item => {
                  const hasSubmenu = !!item.megaMenu;
                  const isExpanded = mobileExpanded === item.label;

                  return (
                    <div key={item.label}>
                      <button
                        onClick={() => {
                          if (hasSubmenu) {
                            setMobileExpanded(isExpanded ? null : item.label);
                          } else if ((item as any).href) {
                            router.push((item as any).href);
                            setMobileOpen(false);
                          }
                        }}
                        className="w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all bg-transparent border-none cursor-pointer text-left"
                        style={{ fontSize: '14px', fontWeight: 600, color: NAVY }}
                        onMouseEnter={e => { e.currentTarget.style.background = NAV_BG; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span>{item.label}</span>
                        {hasSubmenu && (
                          <ChevronDown
                            style={{
                              width: '16px', height: '16px', color: NAVY,
                              transition: 'transform 0.2s',
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            }}
                          />
                        )}
                      </button>

                      {hasSubmenu && isExpanded && (
                        <div className="ml-1 mr-1 mb-1 rounded-lg overflow-hidden" style={{ background: NAV_BG, border: `1px solid ${BORDER}` }}>
                          <div className="p-1.5 space-y-0.5">
                            {item.megaMenu!.map(sub => {
                              const SubIcon = sub.icon as React.ElementType;
                              return (
                                <button
                                  key={sub.label}
                                  onClick={() => { router.push(sub.href); setMobileOpen(false); }}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors bg-transparent border-none cursor-pointer hover:bg-white"
                                >
                                  <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-white" style={{ border: `1px solid ${BORDER}` }}>
                                    <SubIcon style={{ width: '14px', height: '14px', color: NAVY }} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#0C1830' }}>{sub.label}</div>
                                    <div style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>{sub.desc}</div>
                                  </div>
                                  <ChevronRight style={{ width: '12px', height: '12px', color: '#94A3B8', flexShrink: 0 }} />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="my-4" style={{ borderTop: `1px solid ${BORDER}` }} />

              {/* Extra links */}
              <div className="space-y-0.5 mb-4">
                <button
                  onClick={() => { router.push('/stack-finder'); setMobileOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors bg-transparent border-none cursor-pointer text-left"
                  style={{ fontSize: '14px', fontWeight: 600, color: NAVY }}
                  onMouseEnter={e => { e.currentTarget.style.background = NAV_BG; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <Compass style={{ width: '16px', height: '16px', color: NAVY }} />
                  Stack Finder
                </button>
                <button
                  onClick={() => { router.push('/reviews'); setMobileOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors bg-transparent border-none cursor-pointer text-left"
                  style={{ fontSize: '14px', fontWeight: 600, color: NAVY }}
                  onMouseEnter={e => { e.currentTarget.style.background = NAV_BG; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <PenSquare style={{ width: '16px', height: '16px', color: NAVY }} />
                  Write a Review
                </button>
              </div>

              {/* Divider */}
              <div className="my-4" style={{ borderTop: `1px solid ${BORDER}` }} />

              {/* Bottom actions */}
              <div className="space-y-2">
                {isAuthenticated ? (
                  <button
                    onClick={() => { handleSignOut(); setMobileOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 rounded-lg cursor-pointer transition-colors bg-transparent"
                    style={{ padding: '10px 16px', fontSize: '14px', fontWeight: 600, color: '#EF4444', border: '1px solid #FEE2E2' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <LogOut style={{ width: '16px', height: '16px' }} />
                    Sign Out
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => { router.push('/auth/login'); setMobileOpen(false); }}
                      className="w-full flex items-center justify-center cursor-pointer transition-colors bg-transparent border-none"
                      style={{
                        height: '44px',
                        borderRadius: '8px',
                        border: `2px solid ${NAVY}`,
                        fontSize: '14px',
                        fontWeight: 600,
                        color: NAVY,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(12, 24, 48, 0.04)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => { router.push('/launchpad'); setMobileOpen(false); }}
                      className="w-full flex items-center justify-center gap-2 cursor-pointer transition-all border-none"
                      style={{
                        height: '44px',
                        borderRadius: '8px',
                        background: ORANGE,
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: 600,
                        boxShadow: '0 1px 4px rgba(217, 119, 6, 0.3)',
                      }}
                    >
                      <Rocket style={{ width: '14px', height: '14px' }} />
                      LaunchPad
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          SEARCH MODAL
      ═══════════════════════════════════════════════════════ */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-3 sm:px-4"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-xl overflow-hidden"
            style={{
              border: `1px solid ${BORDER}`,
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <Search style={{ width: '18px', height: '18px', color: NAVY, flexShrink: 0 }} />
              <input
                autoFocus
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search stacks, categories, reviews..."
                style={{ flex: 1, fontSize: '16px', color: '#0C1830', background: 'transparent', border: 'none', outline: 'none' }}
                className="placeholder:text-slate-500"
                onKeyDown={e => {
                  if (e.key === 'Escape') { setSearchOpen(false); setSearchInput(''); }
                  if (e.key === 'Enter') handleNavSearch();
                }}
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchInput(''); }}
                className="flex items-center justify-center bg-transparent border cursor-pointer transition-colors hover:bg-slate-100"
                style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, color: '#64748B', borderColor: BORDER }}
              >
                ESC
              </button>
            </div>

            {/* Live results */}
            {searchLoading && searchInput.trim().length >= 1 && liveResults.length === 0 && (
              <div className="px-4 py-5 text-center" style={{ borderBottom: `1px solid ${BORDER}` }}>
                <div className="inline-block w-5 h-5 rounded-full animate-spin" style={{ border: '2px solid #E2E8F0', borderTopColor: ORANGE }} />
                <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '8px' }}>Searching...</p>
              </div>
            )}
            {liveResults.length > 0 && (
              <div style={{ borderBottom: `1px solid ${BORDER}` }}>
                <div className="px-4 pt-3 pb-1">
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Stacks</p>
                </div>
                {liveResults.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => { setSearchOpen(false); setSearchInput(''); router.push(`/tools/${tool.slug}`); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left group bg-transparent border-none cursor-pointer transition-colors"
                    onMouseEnter={e => { e.currentTarget.style.background = NAV_BG; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-white"
                      style={{ border: `1px solid ${BORDER}` }}
                    >
                      {tool.logoUrl ? (
                        <img
                          src={tool.logoUrl}
                          alt={tool.name}
                          className="w-6 h-6 object-contain"
                          onError={e => {
                            const el = e.currentTarget;
                            el.style.display = 'none';
                            const parent = el.parentElement;
                            if (parent) parent.innerHTML = `<span style="font-size:13px;font-weight:700;color:${NAVY}">${tool.name[0]}</span>`;
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: '13px', fontWeight: 700, color: NAVY }}>{tool.name[0]}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#0C1830' }} className="truncate">{tool.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }} className="truncate">{tool.tagline}</div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                      <span style={{ fontSize: '11px', fontWeight: 500, padding: '2px 8px', borderRadius: '4px', background: NAV_BG, color: '#64748B' }}>{tool.category}</span>
                      <div className="flex items-center gap-1">
                        <Star style={{ width: '12px', height: '12px', fill: '#FBBF24', color: '#FBBF24' }} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>{tool.averageRating.toFixed(1)}</span>
                      </div>
                    </div>
                    <ArrowRight style={{ width: '12px', height: '12px', color: '#CBD5E1', flexShrink: 0 }} className="group-hover:text-orange-500" />
                  </button>
                ))}
                {searchInput.trim() && (
                  <button
                    onClick={() => handleNavSearch()}
                    className="w-full flex items-center gap-2 px-4 py-3 transition-colors bg-transparent border-none cursor-pointer"
                    style={{ fontSize: '14px', fontWeight: 600, color: NAVY, borderTop: `1px solid ${BORDER}` }}
                    onMouseEnter={e => { e.currentTarget.style.background = NAV_BG; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Search style={{ width: '14px', height: '14px' }} />
                    See all results for &ldquo;{searchInput.trim()}&rdquo;
                  </button>
                )}
              </div>
            )}

            {/* No results */}
            {searchInput.trim().length >= 1 && liveResults.length === 0 && !searchLoading && (
              <div className="px-4 py-6 text-center" style={{ borderBottom: `1px solid ${BORDER}` }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#64748B', margin: 0 }}>No stacks found for &ldquo;{searchInput.trim()}&rdquo;</p>
                <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>Try a different keyword or browse all categories</p>
              </div>
            )}

            {/* Popular searches */}
            {searchInput.trim().length === 0 && (
              <div className="px-4 py-4">
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px' }}>Popular Searches</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleNavSearch(tag)}
                      className="cursor-pointer transition-colors bg-transparent"
                      style={{
                        padding: '6px 12px',
                        borderRadius: '16px',
                        border: `1px solid ${BORDER}`,
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#334155',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = NAV_BG; e.currentTarget.style.borderColor = ORANGE; e.currentTarget.style.color = ORANGE; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = '#334155'; }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
