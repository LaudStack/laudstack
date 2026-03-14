"use client";

export const dynamic = 'force-dynamic';


// LaudStack — Advertise Page
// Placement tiers, audience stats, and enquiry form for founders & marketers

import { useState } from 'react';
import {
  Sparkles, BarChart3, Users, Star, Zap, Globe, CheckCircle,
  ArrowRight, Mail, TrendingUp, Eye, Award, Target, Megaphone
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { toast } from 'sonner';

const AUDIENCE_STATS = [
  { value: '12,000+', label: 'Monthly Active Users', icon: <Users className="w-5 h-5 text-amber-500" /> },
  { value: '95+',     label: 'Verified Tools Listed', icon: <CheckCircle className="w-5 h-5 text-amber-500" /> },
  { value: '4.7',     label: 'Average Tool Rating', icon: <Star className="w-5 h-5 text-amber-500" /> },
  { value: '68%',     label: 'Decision-Maker Audience', icon: <Target className="w-5 h-5 text-amber-500" /> },
];

const AUDIENCE_BREAKDOWN = [
  { segment: 'Founders & Co-founders', pct: 34 },
  { segment: 'Product Managers', pct: 22 },
  { segment: 'Engineers & Developers', pct: 19 },
  { segment: 'Marketers & Growth', pct: 14 },
  { segment: 'Other Professionals', pct: 11 },
];

const TIERS = [
  {
    name: 'Featured Listing',
    price: '$149',
    period: '/month',
    highlight: false,
    badge: null,
    description: 'Get your tool highlighted across all browsing surfaces with the amber Featured badge.',
    features: [
      'Featured badge on all tool cards',
      'Priority placement in "Featured First" sort',
      'Featured filter toggle visibility',
      'Amber border & elevated card styling',
      'Included in Featured section on homepage',
    ],
    cta: 'Get Featured',
    ctaHref: '/launchpad',
  },
  {
    name: 'Sponsored Spotlight',
    price: '$349',
    period: '/month',
    highlight: true,
    badge: 'Most Popular',
    description: 'A dedicated spotlight placement in the Editor\'s Picks section plus all Featured benefits.',
    features: [
      'Everything in Featured Listing',
      'Editorial card in Editor\'s Picks section',
      'Homepage rising section priority slot',
      'Newsletter mention (weekly digest)',
      'Founder analytics dashboard access',
      'Review response priority support',
    ],
    cta: 'Start Spotlight',
    ctaHref: '/contact',
  },
  {
    name: 'Category Leader',
    price: '$699',
    period: '/month',
    highlight: false,
    badge: 'Best Value',
    description: 'Own your category. Top placement in your category page plus full platform visibility.',
    features: [
      'Everything in Sponsored Spotlight',
      '#1 placement in your category',
      'Category page banner placement',
      'Dedicated landing page on LaudStack',
      'Co-branded content opportunity',
      'Monthly performance report',
      'Dedicated account manager',
    ],
    cta: 'Enquire Now',
    ctaHref: '/contact',
  },
];

const WHY_ITEMS = [
  {
    icon: <Eye className="w-6 h-6 text-amber-500" />,
    title: 'High-Intent Audience',
    desc: 'Our users are actively evaluating tools — not passively scrolling. They arrive with budget and a problem to solve.',
  },
  {
    icon: <Award className="w-6 h-6 text-amber-500" />,
    title: 'Trust-First Platform',
    desc: 'LaudStack\'s verified review system means your tool is seen in a credible context, not alongside unvetted noise.',
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-amber-500" />,
    title: 'Organic + Paid Synergy',
    desc: 'Paid placements amplify your organic ranking. The more visible you are, the more reviews you collect.',
  },
  {
    icon: <Globe className="w-6 h-6 text-amber-500" />,
    title: 'Global Reach',
    desc: 'Reach professionals across 40+ countries. Our audience skews heavily toward English-speaking tech markets.',
  },
];

export default function Advertise() {
  const [form, setForm] = useState({ name: '', email: '', company: '', tool: '', tier: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.company) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 900));
    setSubmitting(false);
    toast.success('Enquiry sent! We\'ll be in touch within 1 business day.');
    setForm({ name: '', email: '', company: '', tool: '', tier: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <PageHero
          eyebrow="Advertise on LaudStack"
          title="Reach 12,000+ professionals actively evaluating tools."
          subtitle="LaudStack is where decision-makers come to discover, compare, and choose SaaS & AI stacks. Put your product in front of buyers who are ready to act."
          accent="amber"
          layout="centered"
          size="lg"
        />

        {/* Audience stats bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-6 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {AUDIENCE_STATS.map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="flex justify-center mb-2">{stat.icon}</div>
                  <div className="text-3xl font-black text-slate-900 mb-1">{stat.value}</div>
                  <div className="text-slate-500 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-16 space-y-20">

          {/* Why advertise */}
          <section>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 text-amber-600 text-sm font-semibold mb-3">
                <Megaphone className="w-4 h-4" />
                Why LaudStack
              </div>
              <h2 className="text-3xl font-black text-slate-900">Advertising that converts</h2>
              <p className="text-slate-500 mt-3 max-w-xl mx-auto">
                Unlike generic ad networks, LaudStack placements reach professionals who are already in evaluation mode.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {WHY_ITEMS.map(item => (
                <div key={item.title} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-amber-300 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    {item.icon}
                    <h3 className="font-bold text-slate-900">{item.title}</h3>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Audience breakdown */}
          <section>
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-6">
                <BarChart3 className="w-4 h-4" />
                Audience Breakdown
              </div>
              <div className="space-y-4">
                {AUDIENCE_BREAKDOWN.map(item => (
                  <div key={item.segment}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-slate-700">{item.segment}</span>
                      <span className="font-bold text-slate-900">{item.pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing tiers */}
          <section>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 text-amber-600 text-sm font-semibold mb-3">
                <Zap className="w-4 h-4" />
                Placement Options
              </div>
              <h2 className="text-3xl font-black text-slate-900">Choose your visibility tier</h2>
              <p className="text-slate-500 mt-3 max-w-xl mx-auto">
                All placements are month-to-month with no long-term contracts. Cancel any time.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {TIERS.map(tier => (
                <div
                  key={tier.name}
                  className={`relative bg-white rounded-2xl p-7 flex flex-col transition-all ${
                    tier.highlight
                      ? 'border-2 border-amber-400 shadow-lg shadow-amber-100'
                      : 'border border-gray-200 hover:border-amber-300'
                  }`}
                >
                  {tier.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-amber-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">
                        {tier.badge}
                      </span>
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="text-lg font-black text-slate-900 mb-1">{tier.name}</h3>
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-3xl font-black text-slate-900">{tier.price}</span>
                      <span className="text-slate-400 text-sm">{tier.period}</span>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed">{tier.description}</p>
                  </div>
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {tier.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={tier.ctaHref}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                      tier.highlight
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-900'
                        : 'bg-gray-100 hover:bg-gray-200 text-slate-900'
                    }`}
                  >
                    {tier.cta}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Enquiry form */}
          <section>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-10">
              <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-2">
                <Mail className="w-4 h-4" />
                Get in Touch
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">Ready to get started?</h2>
              <p className="text-slate-500 text-sm mb-8">
                Fill in the form and we'll get back to you within 1 business day with a custom proposal.
              </p>
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Alex Rivera"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Work Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="alex@company.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Company Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    placeholder="Acme Inc."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tool / Product Name</label>
                  <input
                    type="text"
                    value={form.tool}
                    onChange={e => setForm(f => ({ ...f, tool: e.target.value }))}
                    placeholder="My SaaS Tool"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Interested Tier</label>
                  <select
                    value={form.tier}
                    onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-400 transition-colors bg-white"
                  >
                    <option value="">Select a tier…</option>
                    <option value="featured">Featured Listing — $149/mo</option>
                    <option value="spotlight">Sponsored Spotlight — $349/mo</option>
                    <option value="leader">Category Leader — $699/mo</option>
                    <option value="custom">Custom / Enterprise</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Message</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    rows={4}
                    placeholder="Tell us about your tool, goals, and any specific requirements…"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors resize-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-900 font-bold px-8 py-3 rounded-xl transition-colors"
                  >
                    {submitting ? 'Sending…' : 'Send Enquiry'}
                    {!submitting && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            </div>
          </section>

        </div>
      </div>
      <Footer />
    </div>
  );
}
