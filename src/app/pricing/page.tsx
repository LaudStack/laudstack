"use client";

// LaudStack — Pricing Page
// Users: 100% free. Founders: 100% free. Monetization via paid promotions.

import { useState } from 'react';
import Link from 'next/link';
import {
  Check, X, Zap, Star, Crown,
  ArrowRight, Rocket, ChevronDown, Shield, Users, BarChart3,
  Megaphone, TrendingUp, Eye, Tag, Sparkles
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';

const FAQ_ITEMS = [
  {
    q: 'Is LaudStack really free for users?',
    a: 'Yes — LaudStack is 100% free for users. Browse products, write reviews, save favorites, compare products, and access all features at no cost. No hidden fees, no premium tiers.',
  },
  {
    q: 'Is it free for founders too?',
    a: 'Yes — founders can launch tools, claim listings, manage deals, reply to reviews, and access the full Founder Dashboard completely free. We want to help you grow your product\'s presence without any barriers.',
  },
  {
    q: 'How does LaudStack make money?',
    a: 'We offer optional paid promotions — Boost, Spotlight, and Dominate plans — that give your tool premium visibility through featured badges, homepage placement, newsletter features, and more. These are completely optional and your free listing works great on its own.',
  },
  {
    q: 'What are Deal Placements?',
    a: 'Deal Placements let you promote your deals to the top of the Deals page. Choose from Deal of the Day ($99/day), Featured ($49/7 days or $79/14 days), or Pinned ($19/7 days or $29/14 days) to maximize visibility for your offers.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards (Visa, Mastercard, Amex) through Stripe. All payments are secure and PCI-compliant.',
  },
  {
    q: 'Can I cancel or change my promotion?',
    a: 'Promotions are one-time payments for a fixed duration. They cannot be cancelled once purchased, but you can always upgrade to a higher tier during an active promotion.',
  },
];

const USER_FEATURES = [
  'Browse all tools — no limits',
  'Write unlimited reviews',
  'Save unlimited tools',
  'Compare up to 5 tools side-by-side',
  'Shareable comparison links',
  'Advanced search & filters',
  'Personalized recommendations',
  'Deal alerts & notifications',
  'Public profile page',
  'Full access to all categories',
];

const FOUNDER_FEATURES = [
  'Launch unlimited tools',
  'Claim existing tool listings',
  'Full analytics dashboard (views, clicks, conversions)',
  'Reply to all reviews',
  'Create & manage deals for your products',
  'Verified Founder badge',
  'Founder profile with social links',
  'Access to Founder Dashboard',
  'Manage product screenshots & details',
  'Review response notifications',
];

const PROMOTION_TIERS = [
  {
    name: 'Boost',
    price: '$149',
    duration: '30 days',
    icon: Zap,
    color: 'blue',
    popular: false,
    features: [
      'Featured badge on your listing',
      'Amber highlight border',
      'Priority placement in category pages',
      'Priority in search results',
    ],
  },
  {
    name: 'Spotlight',
    price: '$349',
    duration: '90 days',
    icon: Star,
    color: 'amber',
    popular: true,
    features: [
      'Everything in Boost',
      'Homepage featured carousel',
      'Dedicated newsletter feature',
      'Priority in trending rankings',
    ],
  },
  {
    name: 'Dominate',
    price: '$699',
    duration: '180 days',
    icon: Crown,
    color: 'purple',
    popular: false,
    features: [
      'Everything in Spotlight',
      'Category page takeover banner',
      'Competitor comparison placement',
      'Dedicated editorial review',
    ],
  },
];

const DEAL_PLACEMENT_TIERS = [
  { name: 'Deal of the Day', price: '$99', duration: '1 day', placement: 'Top spotlight with countdown timer' },
  { name: 'Featured Deal', price: '$49', duration: '7 days', placement: 'Featured section with amber highlight' },
  { name: 'Featured Deal', price: '$79', duration: '14 days', placement: 'Featured section with amber highlight' },
  { name: 'Pinned Deal', price: '$19', duration: '7 days', placement: 'Pinned position with Promoted badge' },
  { name: 'Pinned Deal', price: '$29', duration: '14 days', placement: 'Pinned position with Promoted badge' },
];

export default function Pricing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <PageHero
        breadcrumbs={[{ label: 'Pricing' }]}
          eyebrow="Simple, Transparent Pricing"
          title="100% free for everyone."
          subtitle="Free for users and founders. Paid promotions help you stand out."
          accent="amber"
          layout="centered"
          size="md"
        />

        <div className="max-w-[1400px] mx-auto px-4 pt-6 sm:pt-10">

          {/* ── Free Plans Section ── */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-900">Free for Everyone</h2>
            <p className="text-slate-500 text-sm mt-2">No subscriptions. No hidden fees. Full access from day one.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 mb-12 sm:mb-20">
            {/* User Plan — Free */}
            <div className="relative rounded-2xl border bg-slate-50/80 border-slate-200 flex flex-col">
              <div className="p-5 sm:p-8 border-b border-slate-200">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-500 mb-5">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-1">For Users</h3>
                <p className="text-slate-600 text-sm mb-5">Discover, review, and compare the best SaaS & AI stacks.</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl sm:text-5xl font-black text-slate-900">$0</span>
                  <span className="text-slate-600 text-sm mb-2 font-semibold">forever free</span>
                </div>
              </div>
              <div className="p-5 sm:p-8 flex-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Everything included</p>
                <ul className="space-y-3.5">
                  {USER_FEATURES.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-600">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-5 sm:p-8 pt-0">
                <Link href="/auth/login">
                  <button className="w-full py-3.5 rounded-xl font-bold text-sm transition-all bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200">
                    Get Started Free
                  </button>
                </Link>
                <p className="text-center text-xs text-slate-500 mt-2">No credit card required</p>
              </div>
            </div>

            {/* Founder Plan — Free */}
            <div className="relative rounded-2xl border flex flex-col bg-amber-400/5 border-amber-400/40 shadow-xl shadow-amber-500/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-amber-400 text-slate-900 text-xs font-black px-4 py-1 rounded-full shadow">For Founders</span>
              </div>
              <div className="p-5 sm:p-8 border-b border-amber-200/40">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100 text-amber-600 mb-5">
                  <Rocket className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-1">For Founders</h3>
                <p className="text-slate-600 text-sm mb-5">Launch, manage, and grow your products on LaudStack.</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl sm:text-5xl font-black text-slate-900">$0</span>
                  <span className="text-slate-600 text-sm mb-2 font-semibold">forever free</span>
                </div>
              </div>
              <div className="p-5 sm:p-8 flex-1">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-4">Full founder access</p>
                <ul className="space-y-3.5">
                  {FOUNDER_FEATURES.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-600">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-5 sm:p-8 pt-0">
                <Link href="/launchpad">
                  <button className="w-full py-3.5 rounded-xl font-bold text-sm transition-all bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-lg shadow-amber-500/20">
                    Launch Your Tool — Free
                  </button>
                </Link>
                <p className="text-center text-xs text-slate-500 mt-2">No credit card required</p>
              </div>
            </div>
          </div>

          {/* ── Paid Promotions Section ── */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 mb-4">
              <Megaphone className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Optional Promotions</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">Amplify Your Visibility</h2>
            <p className="text-slate-500 text-sm mt-2 max-w-lg mx-auto">Your free listing works great on its own. These optional promotions help your tool stand out even more.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-16">
            {PROMOTION_TIERS.map((tier) => {
              const Icon = tier.icon;
              const colorMap: Record<string, { bg: string; iconBg: string; iconText: string; border: string; badge: string; check: string }> = {
                blue: { bg: 'bg-white', iconBg: 'bg-blue-50', iconText: 'text-blue-500', border: 'border-slate-200', badge: '', check: 'text-blue-500' },
                amber: { bg: 'bg-amber-400/5', iconBg: 'bg-amber-100', iconText: 'text-amber-600', border: 'border-amber-400/40', badge: 'bg-amber-400 text-slate-900', check: 'text-amber-500' },
                purple: { bg: 'bg-purple-50/50', iconBg: 'bg-purple-100', iconText: 'text-purple-600', border: 'border-purple-200', badge: '', check: 'text-purple-500' },
              };
              const c = colorMap[tier.color];
              return (
                <div key={tier.name} className={`relative rounded-2xl border ${c.bg} ${c.border} flex flex-col ${tier.popular ? 'shadow-xl shadow-amber-500/10' : ''}`}>
                  {tier.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className={`${c.badge} text-xs font-black px-4 py-1 rounded-full shadow`}>Most Popular</span>
                    </div>
                  )}
                  <div className="p-6 border-b border-slate-200">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${c.iconBg} ${c.iconText} mb-4`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-1">{tier.name}</h3>
                    <div className="flex items-end gap-2 mt-3">
                      <span className="text-2xl sm:text-4xl font-black text-slate-900">{tier.price}</span>
                      <span className="text-slate-600 text-sm mb-1.5 font-semibold">/ {tier.duration}</span>
                    </div>
                  </div>
                  <div className="p-6 flex-1">
                    <ul className="space-y-3">
                      {tier.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className={`w-4 h-4 ${c.check} flex-shrink-0 mt-0.5`} />
                          <span className="text-sm text-slate-600">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 pt-0">
                    <Link href="/advertise">
                      <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                        tier.popular
                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-lg shadow-amber-500/20'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}>
                        Get {tier.name}
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Deal Placements Section ── */}
          <div className="mb-12 sm:mb-20">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 mb-4">
                <Tag className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Deal Promotions</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">Promote Your Deals</h2>
              <p className="text-slate-500 text-sm mt-2 max-w-lg mx-auto">Boost your deals to the top of the Deals page for maximum visibility and conversions.</p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left p-4 text-slate-500 font-semibold">Plan</th>
                    <th className="p-4 text-slate-500 font-semibold text-center">Price</th>
                    <th className="p-4 text-slate-500 font-semibold text-center">Duration</th>
                    <th className="text-left p-4 text-slate-500 font-semibold">Placement</th>
                  </tr>
                </thead>
                <tbody>
                  {DEAL_PLACEMENT_TIERS.map((tier, i) => (
                    <tr key={i} className={`border-b border-slate-200 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <td className="p-4 text-slate-900 font-bold">{tier.name}</td>
                      <td className="p-4 text-center font-black text-slate-900">{tier.price}</td>
                      <td className="p-4 text-center text-slate-600">{tier.duration}</td>
                      <td className="p-4 text-slate-600">{tier.placement}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center text-xs text-slate-500 mt-3">Deal placements can be purchased from your Founder Dashboard when creating or managing deals.</p>
          </div>

          {/* Feature comparison table */}
          <div className="mb-12 sm:mb-20">
            <h2 className="text-2xl font-black text-slate-900 text-center mb-6 sm:mb-8">Feature Comparison</h2>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left p-3 sm:p-4 text-slate-500 font-semibold w-1/2 text-xs sm:text-sm">Feature</th>
                    <th className="p-3 sm:p-4 font-black text-center text-blue-600 text-xs sm:text-sm">Users</th>
                    <th className="p-3 sm:p-4 font-black text-center text-amber-600 text-xs sm:text-sm">Founders</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Browse all tools', true, true],
                    ['Write reviews', true, true],
                    ['Save tools', true, true],
                    ['Compare tools', true, true],
                    ['Advanced search & filters', true, true],
                    ['Public profile', true, true],
                    ['Launch / list tools', false, true],
                    ['Claim tool listings', false, true],
                    ['Analytics dashboard', false, true],
                    ['Reply to reviews', false, true],
                    ['Create & manage deals', false, true],
                    ['Verified Founder badge', false, true],
                    ['Manage product details', false, true],
                    ['Founder profile with links', false, true],
                  ].map(([feature, free, founder], i) => (
                    <tr key={i} className={`border-b border-slate-200 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <td className="p-3 sm:p-4 text-slate-600 font-medium text-xs sm:text-sm">{feature as string}</td>
                      {[free, founder].map((val, j) => (
                        <td key={j} className="p-3 sm:p-4 text-center">
                          {val === true
                            ? <Check className="w-4 h-4 text-green-500 mx-auto" />
                            : <X className="w-4 h-4 text-slate-300 mx-auto" />
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-2xl font-black text-slate-900 text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {FAQ_ITEMS.map((item, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-slate-900 font-semibold text-sm pr-4">{item.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5">
                      <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-8 text-center mb-10 sm:mb-16">
            <Rocket className="w-10 h-10 text-amber-400 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">Ready to get started?</h3>
            <p className="text-slate-600 text-sm mb-6 max-w-md mx-auto">Everything is free. Users discover great tools. Founders grow their products. Everyone wins.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/login">
                <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors">
                  Sign Up Free
                </button>
              </Link>
              <Link href="/launchpad">
                <button className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3 rounded-xl text-sm transition-colors">
                  Launch Your Tool — Free
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
