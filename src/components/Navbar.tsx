"use client";

/*
 * LaudStack Navbar — Dark Navy (#0F1629)
 * Original dark navy header with white text
 * Professional mobile hamburger with super-menu dropdowns
 * LaunchPad CTA hidden when logged in
 * Polished avatar with subtle container
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
  Clock, Calendar, Flame, Heart, Award, FolderOpen, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { useToolsData } from '@/hooks/useToolsData';
import { useAuth } from '@/hooks/useAuth';
import { useDbUser } from '@/hooks/useDbUser';
import { getInitials } from '@/lib/utils';
import { useSavedTools } from '@/hooks/useSavedTools';

const NAV_ITEMS = [
  {
    label: 'Launches',
    megaMenu: [
      { icon: Rocket,   label: 'LaunchPad',         desc: 'Launch your product',              href: '/launchpad' },
      { icon: Zap,      label: "Today's Launches",   desc: 'Launched today',                   href: '/new-launches' },
      { icon: Calendar, label: 'Upcoming Launches',  desc: 'Coming soon',                      href: '/upcoming-launches' },
      { icon: Clock,    label: 'Recently Launched',  desc: 'Fresh on the platform',            href: '/recently-added' },
      { icon: Archive,  label: 'Launch Archive',     desc: 'Browse all past launches',         href: '/launch-archive' },
    ],
  },
  {
    label: 'Discover',
    megaMenu: [
      { icon: Layers,     label: 'All Stacks',        desc: 'Browse the full catalog',           href: '/tools' },
      { icon: FolderOpen, label: 'Browse Categories',  desc: 'Explore by category',               href: '/categories' },
      { icon: BarChart3,  label: 'Comparisons',        desc: 'Product vs product side-by-side',   href: '/comparisons' },
      { icon: Layers,     label: 'Alternatives',       desc: 'Find alternatives to any product',  href: '/alternatives' },
      { icon: Sparkles,   label: 'Spotlight Picks',    desc: 'Editor-curated top stacks',         href: '/editors-picks' },
    ],
  },
  {
    label: 'Leaderboard',
    megaMenu: [
      { icon: TrendingUp, label: 'Trending Stacks',    desc: "What's hot & rising right now",     href: '/trending' },
      { icon: Star,       label: 'Top Rated',          desc: 'Highest community scores',          href: '/top-rated' },
      { icon: Heart,      label: 'Most Lauded',        desc: 'Most loved by the community',       href: '/most-lauded' },
      { icon: Award,      label: 'Community Voting',   desc: 'Vote for the best stacks',          href: '/community-voting' },
      { icon: BookOpen,   label: 'Changelog',          desc: 'Platform updates & news',           href: '/changelog' },
    ],
  },
  { label: 'SaaS Deals', href: '/deals' },
  { label: 'Templates', href: '/templates' },
];

const POPULAR_SEARCHES = [
  'AI Writing', 'CRM', 'Design Tools', 'Analytics',
  'Email Marketing', 'Project Management', 'AI Chatbot', 'Video Editing',
];

export default function Navbar() {
  const [scrolled, setScrolled]         = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [activeMega, setActiveMega]     = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [searchInput, setSearchInput]   = useState('');
  const [avatarOpen, setAvatarOpen]     = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, loading: authLoading, signOut } = useAuth();
  const { dbUser } = useDbUser();
  const { savedIds } = useSavedTools();
  const avatarRef = useRef<HTMLDivElement>(null);

  const founderStatus = dbUser?.founderStatus ?? 'none';
  const isVerifiedFounder = founderStatus === 'verified';

  const { tools: allNavTools } = useToolsData();

  const liveResults = searchInput.trim().length >= 1
    ? allNavTools.filter(t => {
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
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
    else router.push('/search');
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
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

  // Lock body scroll when mobile menu is open
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

  // Dark navy header — white text
  const navText    = 'text-white/85 hover:text-white';
  const navHoverBg = 'hover:bg-white/10';

  const displayName = (dbUser?.firstName ? [dbUser.firstName, dbUser.lastName].filter(Boolean).join(' ') : null) || dbUser?.name || user?.user_metadata?.full_name || user?.email || 'User';
  const avatarUrl = dbUser?.avatarUrl;

  return (
    <>
      {/* HEADER */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled
            ? 'shadow-md backdrop-blur-md'
            : ''
        }`}
        style={{
          background: scrolled ? 'rgba(15, 22, 41, 0.97)' : '#0F1629',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center h-[64px] sm:h-[72px] gap-3 sm:gap-6">

            {/* Logo — white text version for navy bg */}
            <Link href="/" className="flex items-center shrink-0 h-9 sm:h-10">
              <img
                src="/logo.png"
                alt="LaudStack"
                className="h-9 sm:h-10 w-auto"
              />
            </Link>

            {/* Desktop search pill */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden lg:flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border text-white/70 hover:text-white bg-white/15 hover:bg-white/20 border-white/25"
              style={{ minWidth: '220px' }}
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">Search stacks...</span>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-white/20 text-white/50">&#8984;K</kbd>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5 flex-1">
              {NAV_ITEMS.map(item => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.megaMenu && setActiveMega(item.label)}
                  onMouseLeave={() => setActiveMega(null)}
                >
                  <button
                    onClick={() => (item as any).href ? router.push((item as any).href) : (item.megaMenu ? setActiveMega(activeMega === item.label ? null : item.label) : null)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${navText} ${navHoverBg}`}
                  >
                    {item.label}
                    {item.megaMenu && <ChevronDown className="h-3.5 w-3.5 opacity-50" />}
                  </button>

                  {/* Desktop Mega Menu — unchanged white dropdown */}
                  {item.megaMenu && activeMega === item.label && (
                    <div
                      className="absolute top-full left-0 pt-2 z-50"
                      style={{ minWidth: '320px' }}
                    >
                      <div className="bg-white rounded-2xl shadow-2xl shadow-slate-900/15 border border-slate-100 overflow-hidden p-2">
                        {
                          <div className="space-y-0.5">
                            {item.megaMenu.map(sub => {
                              const SubIcon = sub.icon as React.ElementType;
                              return (
                                <button
                                  key={sub.label}
                                  onClick={() => { router.push(sub.href); setActiveMega(null); }}
                                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                                >
                                  <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-amber-50 transition-colors">
                                    <SubIcon className="h-4 w-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-sm font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">{sub.label}</div>
                                    <div className="text-xs text-slate-500">{sub.desc}</div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        }
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Desktop right side */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              {authLoading ? (
                <div className="w-8 h-8 rounded-full bg-white/15 animate-pulse" />
              ) : isAuthenticated && user ? (
                <>
                  {/* Notifications */}
                  <button
                    onClick={() => router.push('/dashboard?tab=notifications')}
                    className="relative p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Bell className="h-[18px] w-[18px]" />
                  </button>

                  {/* Avatar with subtle container */}
                  <div ref={avatarRef} className="relative">
                    <button
                      onClick={() => setAvatarOpen(!avatarOpen)}
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-all hover:bg-white/12"
                      style={{ border: '1.5px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)' }}
                    >
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={displayName}
                          className="w-8 h-8 rounded-full object-cover border-2 border-white/25"
                          onError={e => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                          style={{ background: '#F59E0B' }}
                        >
                          {getInitials(displayName)}
                        </div>
                      )}
                      <span className="text-sm font-semibold text-white/90 max-w-[100px] truncate hidden xl:block">{displayName.split(' ')[0]}</span>
                      <ChevronDown className="h-3.5 w-3.5 text-white/50" />
                    </button>

                    {/* Avatar dropdown — unchanged white */}
                    {avatarOpen && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl shadow-slate-900/15 border border-slate-100 overflow-hidden z-50">
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          {isVerifiedFounder && (
                            <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              <Crown className="h-3 w-3" /> Verified Founder
                            </span>
                          )}
                        </div>
                        <div className="py-1.5">
                          {[
                            { icon: User, label: 'My Dashboard', href: '/dashboard' },
                            { icon: PenSquare, label: 'My Reviews', href: '/dashboard?tab=reviews' },
                            { icon: Bookmark, label: `Saved Products${savedIds.length > 0 ? ` (${savedIds.length})` : ''}`, href: '/dashboard?tab=saved' },
                            { icon: Settings, label: 'Settings', href: '/dashboard?tab=settings' },
                          ].map(item => (
                            <button
                              key={item.label}
                              onClick={() => { router.push(item.href); setAvatarOpen(false); }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                            >
                              <item.icon className="h-4 w-4 text-slate-400" />
                              {item.label}
                            </button>
                          ))}
                          {isVerifiedFounder && (
                            <button
                              onClick={() => { router.push('/dashboard/founder'); setAvatarOpen(false); }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors text-left"
                            >
                              <Crown className="h-4 w-4" />
                              Founder Dashboard
                            </button>
                          )}
                        </div>
                        <div className="border-t border-slate-100 py-1.5">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <button
                  onClick={() => router.push('/auth/login')}
                  className="text-sm font-semibold px-4 py-2 rounded-xl transition-all text-white/85 hover:text-white hover:bg-white/10"
                >
                  Sign In
                </button>
              )}

              {/* LaunchPad CTA — hidden when logged in */}
              {!authLoading && !isAuthenticated && (
                <Button
                  onClick={() => router.push('/launchpad')}
                  className="gap-2 font-semibold border-0 px-5 h-10 rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-[1.02] transition-all"
                  style={{ background: '#F59E0B', color: '#0A0A0A' }}
                >
                  <Rocket className="h-4 w-4" />
                  LaunchPad
                </Button>
              )}
            </div>

            {/* Mobile right side — Logo | spacer | search/login | hamburger */}
            <div className="lg:hidden ml-auto flex items-center gap-2">
              {authLoading ? (
                <div className="w-5 h-5 rounded bg-white/15 animate-pulse" />
              ) : isAuthenticated ? (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Search className="h-5 w-5" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="p-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => router.push('/auth/login')}
                    className="text-sm font-bold px-3.5 py-2 rounded-xl transition-all text-amber-400 hover:text-amber-300 hover:bg-white/8"
                  >
                    Login
                  </button>
                </>
              )}
              {/* Hamburger — large and visible */}
              <button
                onClick={() => { setMobileOpen(!mobileOpen); setMobileExpanded(null); }}
                className="p-2 rounded-xl transition-colors text-white hover:bg-white/10"
              >
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE MENU — Full-screen overlay, keep dark for contrast and immersion */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 overflow-y-auto"
          style={{ background: '#0F172A', paddingTop: '64px' }}
        >
          <div className="px-4 py-4">
            {/* User info card (if authenticated) */}
            {isAuthenticated && user && (
              <div className="mb-4 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-11 h-11 rounded-full object-cover border-2 border-white/20" />
                  ) : (
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0" style={{ background: '#F59E0B' }}>
                      {getInitials(displayName)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{displayName}</p>
                    <p className="text-xs text-white/50 truncate">{dbUser?.headline || 'LaudStack Member'}</p>
                  </div>
                  <button
                    onClick={() => { router.push('/dashboard'); setMobileOpen(false); }}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
                  >
                    <User className="h-4 w-4 text-white/70" />
                  </button>
                </div>
              </div>
            )}

            {/* Mobile search bar */}
            <div className="mb-3">
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/25 bg-white/15"
                onClick={() => { setMobileOpen(false); setSearchOpen(true); }}
                style={{ cursor: 'pointer' }}
              >
                <Search className="h-4 w-4 text-white/70 shrink-0" />
                <span className="text-[14px] text-white/70 font-medium flex-1">Search stacks...</span>
                <kbd className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-white/20 text-white/50">&#8984;K</kbd>
              </div>
            </div>

            {/* Navigation items with expandable sub-menus */}
            <div className="space-y-1">
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
                      className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-[15px] font-semibold text-white/90 hover:text-white hover:bg-white/8 transition-all"
                    >
                      <span>{item.label}</span>
                      {hasSubmenu && (
                        <ChevronDown className={`h-4 w-4 text-white/40 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      )}
                    </button>

                    {/* Expandable sub-menu */}
                    {hasSubmenu && isExpanded && (
                      <div className="ml-2 mr-2 mb-2 rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        {
                          <div className="p-2 space-y-0.5">
                            {item.megaMenu!.map(sub => {
                              const SubIcon = sub.icon as React.ElementType;
                              return (
                                <button
                                  key={sub.label}
                                  onClick={() => { router.push(sub.href); setMobileOpen(false); }}
                                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left hover:bg-white/8 transition-colors"
                                >
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                    <SubIcon className="h-4 w-4 text-white/50" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-[13px] font-semibold text-white/85">{sub.label}</div>
                                    <div className="text-[11px] text-white/40">{sub.desc}</div>
                                  </div>
                                  <ChevronRight className="h-3.5 w-3.5 text-white/20 shrink-0" />
                                </button>
                              );
                            })}
                          </div>
                        }
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Divider */}
            <div className="my-4 border-t border-white/10" />

            {/* Quick actions for authenticated users */}
            {isAuthenticated && user && (
              <div className="space-y-1 mb-4">
                {[
                  { icon: User, label: 'My Dashboard', href: '/dashboard' },
                  { icon: PenSquare, label: 'My Reviews', href: '/dashboard?tab=reviews' },
                  { icon: Bookmark, label: `Saved Products${savedIds.length > 0 ? ` (${savedIds.length})` : ''}`, href: '/dashboard?tab=saved' },
                  { icon: Bell, label: 'Notifications', href: '/dashboard?tab=notifications' },
                  { icon: Settings, label: 'Settings', href: '/dashboard?tab=settings' },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => { router.push(item.href); setMobileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium text-white/70 hover:text-white hover:bg-white/8 transition-colors text-left"
                  >
                    <item.icon className="h-4 w-4 text-white/40" />
                    {item.label}
                  </button>
                ))}
                {isVerifiedFounder && (
                  <button
                    onClick={() => { router.push('/dashboard/founder'); setMobileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors text-left"
                  >
                    <Crown className="h-4 w-4" />
                    Founder Dashboard
                  </button>
                )}
              </div>
            )}

            {/* Bottom actions */}
            <div className="space-y-2.5">
              {isAuthenticated ? (
                <button
                  onClick={() => { handleSignOut(); setMobileOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[14px] font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              ) : (
                <>
                  <Button
                    onClick={() => { router.push('/auth/login'); setMobileOpen(false); }}
                    className="w-full h-12 rounded-xl text-[15px] font-bold"
                    variant="outline"
                    style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff', background: 'rgba(255,255,255,0.06)' }}
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => { router.push('/launchpad'); setMobileOpen(false); }}
                    className="w-full h-12 rounded-xl text-[15px] font-bold gap-2"
                    style={{ background: '#F59E0B', color: '#0A0A0A' }}
                  >
                    <Rocket className="h-4.5 w-4.5" />
                    LaunchPad
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SEARCH MODAL — unchanged */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-3 sm:px-4"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl shadow-slate-900/20 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-100">
              <Search className="h-5 w-5 text-slate-400 shrink-0" />
              <input
                autoFocus
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search products, categories, reviews..."
                className="flex-1 text-base text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
                onKeyDown={e => {
                  if (e.key === 'Escape') { setSearchOpen(false); setSearchInput(''); }
                  if (e.key === 'Enter') handleNavSearch();
                }}
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchInput(''); }}
                className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-400 font-mono shrink-0 hover:bg-slate-200 transition-colors"
              >
                ESC
              </button>
            </div>

            {/* Live results */}
            {liveResults.length > 0 && (
              <div className="border-b border-slate-100">
                <div className="px-4 sm:px-5 pt-3 pb-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tools</p>
                </div>
                {liveResults.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => { setSearchOpen(false); setSearchInput(''); router.push(`/tools/${tool.slug}`); }}
                    className="w-full flex items-center gap-3 px-4 sm:px-5 py-2.5 hover:bg-slate-50 transition-colors text-left group"
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
                    <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{tool.category}</span>
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-slate-700">{tool.average_rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-amber-500 transition-colors shrink-0" />
                  </button>
                ))}
                {searchInput.trim() && (
                  <button
                    onClick={() => handleNavSearch()}
                    className="w-full flex items-center gap-2 px-4 sm:px-5 py-3 text-sm font-semibold text-amber-600 hover:bg-amber-50 transition-colors border-t border-slate-100"
                  >
                    <Search className="h-4 w-4" />
                    See all results for &ldquo;{searchInput.trim()}&rdquo;
                  </button>
                )}
              </div>
            )}

            {/* No results state */}
            {searchInput.trim().length >= 1 && liveResults.length === 0 && (
              <div className="px-4 sm:px-5 py-6 text-center border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-500">No tools found for &ldquo;{searchInput.trim()}&rdquo;</p>
                <p className="text-xs text-slate-400 mt-1">Try a different keyword or browse all categories</p>
              </div>
            )}

            {/* Popular searches */}
            {searchInput.trim().length === 0 && (
              <div className="px-4 sm:px-5 py-4 sm:py-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Popular Searches</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleNavSearch(tag)}
                      className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-amber-700 text-sm font-medium text-slate-700 transition-colors border border-slate-200 hover:border-amber-200"
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
