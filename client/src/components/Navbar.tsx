/*
 * LaudStack Navbar — "Warm Professional" design
 * Light sticky header, logo left, nav center, auth right
 * Amber accent on active/hover states
 */

import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search, Menu, X, ChevronDown, Zap, Star, BarChart3,
  BookOpen, LogIn, UserPlus
} from 'lucide-react';
import { toast } from 'sonner';

const NAV_LINKS = [
  { label: 'Discover', href: '/discover', icon: Zap },
  { label: 'Leaderboard', href: '/leaderboard', icon: BarChart3 },
  { label: 'Categories', href: '/categories', icon: BookOpen },
  { label: 'Reviews', href: '/reviews', icon: Star },
];

export default function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleComingSoon = () => toast.info('Feature coming soon!');

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="container">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo-light.png" alt="LaudStack" className="h-8 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={handleComingSoon}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location === href
                    ? 'text-amber-600 bg-amber-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Search toggle */}
            {searchOpen ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    autoFocus
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search tools..."
                    className="pl-9 w-64 h-9 text-sm"
                    onKeyDown={e => {
                      if (e.key === 'Escape') setSearchOpen(false);
                      if (e.key === 'Enter') handleComingSoon();
                    }}
                  />
                </div>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-slate-50 text-sm text-muted-foreground hover:bg-slate-100 transition-colors"
              >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Search tools...</span>
                <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-border bg-white px-1.5 text-[10px] font-medium text-muted-foreground">
                  ⌘K
                </kbd>
              </button>
            )}

            {/* Submit tool CTA */}
            <Button
              onClick={handleComingSoon}
              className="hidden sm:flex ls-btn-primary border-0 h-9"
              style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)' }}
            >
              <Zap className="h-3.5 w-3.5 mr-1.5" />
              Submit Tool
            </Button>

            {/* Auth */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleComingSoon}
              className="hidden sm:flex text-slate-600 hover:text-slate-900"
            >
              <LogIn className="h-4 w-4 mr-1.5" />
              Sign In
            </Button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white">
          <div className="container py-4 flex flex-col gap-1">
            {/* Mobile search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tools..."
                className="pl-9 h-10"
                onKeyDown={e => e.key === 'Enter' && handleComingSoon()}
              />
            </div>

            {NAV_LINKS.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => { setMobileOpen(false); handleComingSoon(); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Icon className="h-4 w-4 text-amber-500" />
                {label}
              </Link>
            ))}

            <div className="mt-3 pt-3 border-t border-border flex flex-col gap-2">
              <Button
                onClick={handleComingSoon}
                className="w-full ls-btn-primary border-0"
                style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)' }}
              >
                <Zap className="h-4 w-4 mr-2" />
                Submit Your Tool
              </Button>
              <Button variant="outline" className="w-full" onClick={handleComingSoon}>
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
