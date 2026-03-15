"use client";



// Design: LaudStack dark-slate + amber accent. Affiliate program with commission tiers.
import { useState } from 'react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { DollarSign, Users, TrendingUp, Star, Check, ArrowRight, Zap, Shield, BarChart3, Gift } from 'lucide-react';

const TIERS = [
  {
    name: 'Starter',
    commission: '20%',
    recurring: true,
    minPayouts: '$50',
    cookieDays: 30,
    features: [
      'Unique referral link',
      '20% recurring commission',
      '30-day cookie window',
      'Real-time dashboard',
      'Monthly payouts',
    ],
    color: 'border-gray-300',
    badge: null,
  },
  {
    name: 'Partner',
    commission: '30%',
    recurring: true,
    minPayouts: '$50',
    cookieDays: 60,
    features: [
      'Everything in Starter',
      '30% recurring commission',
      '60-day cookie window',
      'Priority support',
      'Co-marketing opportunities',
      'Custom landing page',
    ],
    color: 'border-amber-500/60',
    badge: 'Most Popular',
    badgeColor: 'bg-amber-500 text-white',
  },
  {
    name: 'Elite',
    commission: '40%',
    recurring: true,
    minPayouts: '$100',
    cookieDays: 90,
    features: [
      'Everything in Partner',
      '40% recurring commission',
      '90-day cookie window',
      'Dedicated account manager',
      'Early access to new features',
      'Revenue share on tool listings',
      'White-label options',
    ],
    color: 'border-purple-500/60',
    badge: 'By Invitation',
    badgeColor: 'bg-purple-500/20 border border-purple-500/40 text-purple-400',
  },
];

const STATS = [
  { value: '$2.4M', label: 'Paid to affiliates', icon: DollarSign },
  { value: '1,200+', label: 'Active affiliates', icon: Users },
  { value: '38%', label: 'Avg. conversion rate', icon: TrendingUp },
  { value: '4.9★', label: 'Affiliate satisfaction', icon: Star },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Sign Up Free', desc: 'Create your affiliate account in under 2 minutes. No approval wait time.' },
  { step: '02', title: 'Share Your Link', desc: 'Get your unique referral link and share it in content, emails, or social media.' },
  { step: '03', title: 'Earn Commissions', desc: 'Earn 20–40% recurring commission on every paid subscription your referrals make.' },
  { step: '04', title: 'Get Paid Monthly', desc: 'Receive payouts via PayPal or bank transfer on the 1st of every month.' },
];

export default function Affiliates() {
  const [form, setForm] = useState({ name: '', email: '', website: '', audience: '', tier: 'Starter' });
  const [submitted, setSubmitted] = useState(false);

  const contactMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Application submitted! We\'ll review and get back to you within 24 hours.');
    },
    onError: () => {
      toast.error('Something went wrong. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error('Please fill in your name and email.');
      return;
    }
    contactMutation.mutate({
      name: form.name,
      email: form.email,
      topic: 'Affiliate Application',
      message: `Affiliate Application\n\nName: ${form.name}\nEmail: ${form.email}\nWebsite: ${form.website || 'N/A'}\nAudience: ${form.audience || 'N/A'}\nTier: ${form.tier}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <PageHero
        eyebrow="Affiliate Program"
        title="Earn Up to 40% Recurring Commission"
        subtitle="Join 1,200+ affiliates earning passive income by recommending LaudStack to their audience of founders, marketers, and developers."
        accent="amber"
        layout="centered"
        size="md"
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a href="#apply" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[10px] bg-amber-500 text-slate-900 font-bold text-sm no-underline hover:bg-amber-400 transition-colors">
            Apply Now — It's Free <ArrowRight className="w-3.5 h-3.5" />
          </a>
          <a href="#tiers" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[10px] bg-slate-50 border-[1.5px] border-gray-200 text-slate-700 font-semibold text-sm no-underline hover:border-gray-300 transition-colors">
            View Commission Tiers
          </a>
        </div>
      </PageHero>

      <div className="max-w-[1300px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-2xl p-5 text-center">
              <Icon className="h-6 w-6 text-amber-400 mx-auto mb-2" />
              <div className="text-2xl font-black text-slate-900">{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="text-3xl font-black text-amber-500/30 mb-3">{step}</div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Commission Tiers */}
        <div id="tiers" className="mb-16 scroll-mt-24">
          <h2 className="text-2xl font-black text-slate-900 mb-2 text-center">Commission Tiers</h2>
          <p className="text-slate-500 text-sm text-center mb-8">All commissions are recurring — you earn every month your referral stays subscribed.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map((tier) => (
              <div key={tier.name} className={`relative bg-white border-2 rounded-2xl p-6 ${tier.color}`}>
                {tier.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${tier.badgeColor}`}>
                    {tier.badge}
                  </div>
                )}
                <h3 className="text-lg font-black text-slate-900 mb-1">{tier.name}</h3>
                <div className="text-4xl font-black text-amber-400 mb-1">{tier.commission}</div>
                <p className="text-xs text-slate-500 mb-4">recurring commission · {tier.cookieDays}-day cookie</p>
                <ul className="space-y-2 mb-6">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="text-xs text-slate-500">Min. payout: {tier.minPayouts}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Why LaudStack */}
        <div className="mb-16 bg-white border border-gray-200 rounded-2xl p-8">
          <h2 className="text-xl font-black text-slate-900 mb-6">Why Promote LaudStack?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: TrendingUp, title: 'High Conversion', desc: 'Our landing pages convert at 38% — one of the highest in the SaaS review space.' },
              { icon: Shield, title: 'Trusted Brand', desc: 'LaudStack is trusted by 12,000+ professionals. Your audience will recognize the quality.' },
              { icon: BarChart3, title: 'Real-Time Analytics', desc: 'Track clicks, conversions, and earnings in your affiliate dashboard with daily updates.' },
              { icon: Zap, title: 'Fast Payouts', desc: 'Monthly payouts via PayPal or bank transfer, with no hidden fees or delays.' },
              { icon: Users, title: 'Dedicated Support', desc: 'Partner and Elite affiliates get a dedicated account manager for co-marketing support.' },
              { icon: Gift, title: 'Bonus Incentives', desc: 'Top performers earn quarterly bonuses, exclusive perks, and early product access.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{title}</h4>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Form */}
        <div id="apply" className="scroll-mt-24">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-black text-slate-900 mb-2 text-center">Apply to Join</h2>
            <p className="text-slate-500 text-sm text-center mb-8">Free to join. Approved within 24 hours. No minimum traffic required.</p>

            {submitted ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-10 text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Application Received!</h3>
                <p className="text-slate-500 text-sm">We'll review your application and send your affiliate link to <strong className="text-slate-900">{form.email}</strong> within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Jane Smith"
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-100 border border-gray-300 text-slate-900 text-sm placeholder-gray-400 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="jane@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-100 border border-gray-300 text-slate-900 text-sm placeholder-gray-400 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Website / Social Profile</label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                    placeholder="https://yoursite.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-100 border border-gray-300 text-slate-900 text-sm placeholder-gray-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Tell us about your audience</label>
                  <textarea
                    value={form.audience}
                    onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}
                    placeholder="e.g. I run a newsletter for 5,000 SaaS founders..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-100 border border-gray-300 text-slate-900 text-sm placeholder-gray-400 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Preferred Tier</label>
                  <select
                    value={form.tier}
                    onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-100 border border-gray-300 text-slate-900 text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="Starter">Starter — 20% commission</option>
                    <option value="Partner">Partner — 30% commission</option>
                    <option value="Elite">Elite — 40% commission (by invitation)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
                >
                  Launch Application <ArrowRight className="h-4 w-4" />
                </button>
                <p className="text-xs text-slate-500 text-center">
                  By applying you agree to our <button onClick={() => {}} className="text-amber-400 hover:underline">Affiliate Terms</button>.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
