"use client";

export const dynamic = 'force-dynamic';

// LaudStack — Pricing Page
// Users: 100% free. Founders: $49/month.

import { useState } from 'react';
import Link from 'next/link';
import {
  Check, X, Zap, Star, Crown,
  ArrowRight, Rocket, ChevronDown, Shield, Users, BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';

const FAQ_ITEMS = [
  {
    q: 'Is LaudStack really free for users?',
    a: 'Yes — LaudStack is 100% free for users. Browse products, write reviews, save favorites, compare products, and access all features at no cost. No hidden fees, no premium tiers.',
  },
  {
    q: 'What does the Founder Plan include?',
    a: 'The Founder Plan ($49/month) gives you full access to the Founder Dashboard: list unlimited tools, manage deals, reply to reviews, access analytics, and get a verified founder badge. It\'s everything you need to grow your tool\'s presence on LaudStack.',
  },
  {
    q: 'When do I need to pay as a founder?',
    a: 'Payment is required when you launch or claim a product on LaudStack. The $49/month subscription activates your Founder Dashboard and all founder features.',
  },
  {
    q: 'Can I cancel my Founder Plan?',
    a: 'Yes — you can cancel anytime. Your tools will remain listed but you\'ll lose access to the Founder Dashboard, analytics, deal management, and the ability to reply to reviews.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards (Visa, Mastercard, Amex) through Stripe. All payments are secure and PCI-compliant.',
  },
  {
    q: 'Do you offer discounts for annual billing?',
    a: 'Annual billing is coming soon. Stay tuned for savings on the Founder Plan.',
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
  'Featured listing eligibility',
  'Priority review queue',
  'Founder profile with social links',
  'Access to Founder Dashboard',
];

export default function Pricing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <PageHero
          eyebrow="Simple, Transparent Pricing"
          title="Free for users. One plan for founders."
          subtitle="LaudStack is 100% free for users. Founders pay $49/month to launch, manage, and grow their tools."
          accent="amber"
          layout="centered"
          size="sm"
        />

        <div className="max-w-[1100px] mx-auto px-4 pt-10">
          {/* Two-column pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {/* User Plan — Free */}
            <div className="relative rounded-2xl border bg-white/80 border-gray-200 flex flex-col">
              <div className="p-8 border-b border-gray-200">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-500 mb-5">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-1">For Users</h3>
                <p className="text-slate-500 text-sm mb-5">Discover, review, and compare the best SaaS & AI stacks.</p>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black text-slate-900">$0</span>
                  <span className="text-slate-400 text-sm mb-2 font-semibold">forever free</span>
                </div>
              </div>
              <div className="p-8 flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Everything included</p>
                <ul className="space-y-3.5">
                  {USER_FEATURES.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-600">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-8 pt-0">
                <Link href="/auth/login">
                  <button className="w-full py-3.5 rounded-xl font-bold text-sm transition-all bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200">
                    Get Started Free
                  </button>
                </Link>
                <p className="text-center text-xs text-slate-400 mt-2">No credit card required</p>
              </div>
            </div>

            {/* Founder Plan — $49/mo */}
            <div className="relative rounded-2xl border flex flex-col bg-amber-400/5 border-amber-400/40 shadow-xl shadow-amber-500/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-amber-400 text-slate-900 text-xs font-black px-4 py-1 rounded-full shadow">For Founders</span>
              </div>
              <div className="p-8 border-b border-amber-200/40">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100 text-amber-600 mb-5">
                  <Rocket className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-1">Founder Plan</h3>
                <p className="text-slate-500 text-sm mb-5">Launch, manage, and grow your products on LaudStack.</p>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black text-slate-900">$49</span>
                  <span className="text-slate-500 text-sm mb-2 font-semibold">/month</span>
                </div>
              </div>
              <div className="p-8 flex-1">
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
              <div className="p-8 pt-0">
                <Link href="/launchpad">
                  <button className="w-full py-3.5 rounded-xl font-bold text-sm transition-all bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-lg shadow-amber-500/20">
                    Get Started as Founder
                  </button>
                </Link>
                <p className="text-center text-xs text-slate-400 mt-2">Payment required when launching or claiming a product</p>
              </div>
            </div>
          </div>

          {/* Feature comparison table */}
          <div className="mb-20">
            <h2 className="text-2xl font-black text-slate-900 text-center mb-8">Feature Comparison</h2>
            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left p-4 text-slate-500 font-semibold w-1/2">Feature</th>
                    <th className="p-4 font-black text-center text-blue-600">Users (Free)</th>
                    <th className="p-4 font-black text-center text-amber-600">Founders ($49/mo)</th>
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
                    ['Featured listing eligibility', false, true],
                    ['Priority review queue', false, true],
                  ].map(([feature, free, founder], i) => (
                    <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="p-4 text-slate-600 font-medium">{feature as string}</td>
                      {[free, founder].map((val, j) => (
                        <td key={j} className="p-4 text-center">
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
          <div className="max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl font-black text-slate-900 text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {FAQ_ITEMS.map((item, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-slate-900 font-semibold text-sm pr-4">{item.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5">
                      <p className="text-slate-500 text-sm leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center mb-16">
            <Rocket className="w-10 h-10 text-amber-400 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">Ready to get started?</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">Users get full access for free. Founders can launch their tools for $49/month.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/login">
                <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors">
                  Sign Up Free
                </button>
              </Link>
              <Link href="/launchpad">
                <button className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3 rounded-xl text-sm transition-colors">
                  Launch Your Tool — $49/mo
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
