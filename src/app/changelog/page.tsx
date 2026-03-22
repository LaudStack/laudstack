"use client";
export const dynamic = "force-dynamic";

// Design: LaudStack dark-slate + amber accent. Changelog with timeline layout.
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { Zap, Shield, Star, Bug, TrendingUp, Package, Users, ArrowRight, Rocket, Loader2, CheckCircle2 } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';

const RELEASES = [
  {
    version: 'v2.1.0',
    date: '2026-03-05',
    label: 'Latest',
    labelColor: 'bg-green-500/20 border-green-500/40 text-green-500',
    summary: 'Compare Products, Shareable URLs & Saved Products',
    changes: [
      { type: 'feature', icon: TrendingUp, text: 'Compare up to 3 tools side-by-side with a full feature matrix' },
      { type: 'feature', icon: Zap, text: 'Shareable comparison URLs — encode tools in query string and share with teammates' },
      { type: 'feature', icon: Star, text: 'Saved Products with bookmark icon on every card, persisted to localStorage' },
      { type: 'feature', icon: Users, text: 'User avatar dropdown in navbar with profile, saved products, and sign-out' },
      { type: 'improvement', icon: Shield, text: 'Improved text contrast and legibility across all pages' },
      { type: 'improvement', icon: Zap, text: 'Scroll-to-top on all page and step navigations' },
    ],
  },
  {
    version: 'v2.0.0',
    date: '2026-02-20',
    label: 'Major',
    labelColor: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
    summary: 'Phase 2: Launch System, Email Flows & 100 Tools',
    changes: [
      { type: 'feature', icon: Rocket, text: 'Launch System — schedule tool launches with countdown timers and LIVE status' },
      { type: 'feature', icon: Zap, text: 'Email verification, password reset, and welcome onboarding pages' },
      { type: 'feature', icon: Package, text: 'Expanded tool database to 100 tools across 15 categories' },
      { type: 'feature', icon: TrendingUp, text: 'Rising section on homepage with weekly rank-change momentum indicators' },
      { type: 'feature', icon: Users, text: 'User Dashboard with profile, reviews, saved products, and settings tabs' },
      { type: 'feature', icon: Shield, text: 'Founder Dashboard with Recharts analytics — views, traffic, sentiment' },
    ],
  },
  {
    version: 'v1.5.0',
    date: '2026-02-05',
    label: 'Feature',
    labelColor: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
    summary: 'Pricing, Marketplace, Deals & Claim Product',
    changes: [
      { type: 'feature', icon: Star, text: 'Pricing page with Free/Pro/Enterprise tiers and annual billing toggle' },
      { type: 'feature', icon: Package, text: 'Marketplace for SaaS products, templates, and digital tools' },
      { type: 'feature', icon: Zap, text: 'SaaS Deals page with lifetime deals, coupon codes, and claim progress bars' },
      { type: 'feature', icon: Shield, text: 'Company Claim flow — 3-step founder verification with DNS/email/file methods' },
      { type: 'improvement', icon: TrendingUp, text: 'Resources dropdown in navbar with 7 linked pages' },
      { type: 'improvement', icon: Users, text: 'Sitewide footer with 4 navigation columns and newsletter signup' },
    ],
  },
  {
    version: 'v1.2.0',
    date: '2026-01-22',
    label: 'Feature',
    labelColor: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
    summary: 'Authentication, Reviews & Launch Leaderboard',
    changes: [
      { type: 'feature', icon: Shield, text: 'Sign In / Sign Up page with Google/GitHub social auth and email/password' },
      { type: 'feature', icon: Star, text: 'Write a Review modal with star rating, pros/cons, and auth gate' },
      { type: 'feature', icon: TrendingUp, text: 'Launch Leaderboard with Today/Week/Month/All-Time period tabs' },
      { type: 'feature', icon: Zap, text: 'Recently Viewed section on homepage for signed-in users' },
      { type: 'improvement', icon: Users, text: 'Pricing filter toggle (Free/Freemium/Paid) in browse section' },
    ],
  },
  {
    version: 'v1.0.0',
    date: '2026-01-08',
    label: 'Launch',
    labelColor: 'bg-purple-500/20 border-purple-500/40 text-purple-400',
    summary: 'Initial Public Launch',
    changes: [
      { type: 'feature', icon: Rocket, text: 'Homepage with hero search, spotlight stacks, and category browser' },
      { type: 'feature', icon: Package, text: 'Tool detail pages with ratings, reviews, and laud system' },
      { type: 'feature', icon: TrendingUp, text: 'LaunchPad — 5-step tool submission form for founders' },
      { type: 'feature', icon: Users, text: 'Categories page with all 15 tool categories' },
      { type: 'feature', icon: Star, text: 'Search with live results and ⌘K keyboard shortcut' },
      { type: 'feature', icon: Shield, text: 'Trust Framework — review verification and ranking algorithm' },
    ],
  },
];

const TYPE_STYLES: Record<string, string> = {
  feature: 'bg-green-500/10 text-green-500 border-green-500/30',
  improvement: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  fix: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const TYPE_LABELS: Record<string, string> = {
  feature: 'New',
  improvement: 'Improved',
  fix: 'Fixed',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function Changelog() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data: { alreadySubscribed?: boolean }) => {
      if (data.alreadySubscribed) {
        toast.info("You're already subscribed — thanks for being part of the community!");
      } else {
        toast.success("You're subscribed! Check your inbox for a welcome email.");
        setSubscribed(true);
        setEmail('');
      }
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message || 'Something went wrong. Please try again.');
    },
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    subscribe.mutate({ email: trimmed, source: 'changelog_page' });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <PageHero
        breadcrumbs={[{ label: 'Changelog' }]}
        eyebrow="Changelog"
        title="What's New in LaudStack"
        subtitle="New features, improvements, and fixes with every release."
        accent="amber"
        layout="centered"
        size="md"
      />

      {/* Timeline */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-100 hidden md:block" />

          <div className="space-y-6 sm:space-y-12">
            {RELEASES.map((release) => (
              <div key={release.version} className="relative md:pl-16">
                {/* Timeline dot */}
                <div className="absolute left-4 top-1.5 w-4 h-4 rounded-full bg-amber-500 border-4 border-slate-950 hidden md:block" style={{ zIndex: 1 }} />

                {/* Release card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6">
                  {/* Header */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-2xl font-black text-slate-900">{release.version}</span>
                        <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${release.labelColor}`}>
                          {release.label}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm">{release.summary}</p>
                    </div>
                    <div className="text-sm text-slate-500 whitespace-nowrap">
                      {formatDate(release.date)}
                    </div>
                  </div>

                  {/* Changes */}
                  <div className="space-y-2.5">
                    {release.changes.map((change, i) => {
                      const Icon = change.icon;
                      return (
                        <div key={i} className="flex items-start gap-3">
                          <span className={`shrink-0 mt-0.5 px-1.5 py-0.5 rounded border text-xs font-bold ${TYPE_STYLES[change.type]}`}>
                            {TYPE_LABELS[change.type]}
                          </span>
                          <div className="flex items-start gap-2 flex-1">
                            <Icon className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                            <span className="text-sm text-slate-600">{change.text}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscribe CTA */}
        <div className="mt-10 sm:mt-16 bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-8 text-center">
          <Zap className="h-10 w-10 text-amber-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Stay Up to Date</h3>
          <p className="text-slate-600 text-sm mb-6 max-w-md mx-auto">
            Get notified about new features and improvements as soon as they ship.
          </p>
          {subscribed ? (
            <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              You&apos;re subscribed!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-3 max-w-sm mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500"
                disabled={subscribe.isPending}
              />
              <button
                type="submit"
                disabled={subscribe.isPending}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-400 transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {subscribe.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Subscribing…</>
                ) : (
                  <><ArrowRight className="w-4 h-4" /> Subscribe</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
