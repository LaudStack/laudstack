// LaudStack — Pricing Page
// Design: Dark editorial, amber accents, clear tier comparison

import { useState } from 'react';
import { Link } from 'wouter';
import {
  Check, X, Zap, Shield, Star, Users, BarChart3, Crown,
  ArrowRight, HelpCircle, Building2, Rocket, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const BILLING_TOGGLE = ['monthly', 'annual'] as const;

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    icon: <Star className="w-5 h-5" />,
    tagline: 'For individuals discovering tools',
    price: { monthly: 0, annual: 0 },
    cta: 'Get Started Free',
    ctaHref: '/signin',
    highlight: false,
    badge: null,
    color: 'slate',
    features: [
      { label: 'Browse all 100+ tools', included: true },
      { label: 'Read all reviews', included: true },
      { label: 'Basic search & filters', included: true },
      { label: 'Save up to 10 tools', included: true },
      { label: 'Write reviews (3/month)', included: true },
      { label: 'Compare up to 2 tools', included: true },
      { label: 'Shareable comparison links', included: false },
      { label: 'Advanced filters & sorting', included: false },
      { label: 'Unlimited saved tools', included: false },
      { label: 'Early access to new tools', included: false },
      { label: 'Priority support', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: <Zap className="w-5 h-5" />,
    tagline: 'For power users and teams',
    price: { monthly: 19, annual: 15 },
    cta: 'Start Pro Trial',
    ctaHref: '/signin?plan=pro',
    highlight: true,
    badge: 'Most Popular',
    color: 'amber',
    features: [
      { label: 'Everything in Free', included: true },
      { label: 'Unlimited saved tools', included: true },
      { label: 'Write unlimited reviews', included: true },
      { label: 'Compare up to 5 tools', included: true },
      { label: 'Shareable comparison links', included: true },
      { label: 'Advanced filters & sorting', included: true },
      { label: 'Early access to new tools', included: true },
      { label: 'Exclusive Pro deals & discounts', included: true },
      { label: 'Priority support', included: true },
      { label: 'Team workspace (up to 5)', included: false },
      { label: 'API access', included: false },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: <Building2 className="w-5 h-5" />,
    tagline: 'For teams and organizations',
    price: { monthly: 79, annual: 59 },
    cta: 'Contact Sales',
    ctaHref: '/contact',
    highlight: false,
    badge: null,
    color: 'blue',
    features: [
      { label: 'Everything in Pro', included: true },
      { label: 'Team workspace (unlimited)', included: true },
      { label: 'API access (10k req/month)', included: true },
      { label: 'Custom tool collections', included: true },
      { label: 'SSO / SAML authentication', included: true },
      { label: 'Audit logs', included: true },
      { label: 'Dedicated account manager', included: true },
      { label: 'Custom integrations', included: true },
      { label: 'SLA guarantee (99.9% uptime)', included: true },
      { label: 'White-label option', included: true },
      { label: 'Quarterly business reviews', included: true },
    ],
  },
];

const FOUNDER_PLANS = [
  {
    id: 'founder-free',
    name: 'Starter',
    price: { monthly: 0, annual: 0 },
    features: [
      'List 1 tool',
      'Basic analytics (views, clicks)',
      'Respond to reviews',
      'Standard listing placement',
    ],
    cta: 'Submit Your Tool',
    ctaHref: '/launchpad',
    highlight: false,
  },
  {
    id: 'founder-pro',
    name: 'Pro Listing',
    price: { monthly: 49, annual: 39 },
    features: [
      'List up to 5 tools',
      'Full analytics dashboard',
      'Priority review queue (24h)',
      'Featured badge on listing',
      'Promotional banner (1/month)',
      'Founder verified badge',
      'Respond to reviews with rich text',
    ],
    cta: 'Upgrade Listing',
    ctaHref: '/signin?plan=founder-pro',
    highlight: true,
  },
  {
    id: 'founder-enterprise',
    name: 'Agency',
    price: { monthly: 199, annual: 149 },
    features: [
      'Unlimited tool listings',
      'White-glove onboarding',
      'Dedicated success manager',
      'Custom category placement',
      'API access for bulk updates',
      'Co-marketing opportunities',
    ],
    cta: 'Contact Sales',
    ctaHref: '/contact',
    highlight: false,
  },
];

const FAQ_ITEMS = [
  {
    q: 'Is there a free trial for Pro?',
    a: 'Yes — Pro comes with a 14-day free trial, no credit card required. You can cancel at any time during the trial.',
  },
  {
    q: 'Can I switch plans at any time?',
    a: 'Absolutely. You can upgrade or downgrade at any time. Upgrades take effect immediately; downgrades take effect at the end of your current billing period.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and bank transfers for annual Enterprise plans.',
  },
  {
    q: 'Do you offer discounts for nonprofits or students?',
    a: 'Yes — we offer 50% off Pro for verified nonprofits and students. Contact us with proof of eligibility.',
  },
  {
    q: 'What happens to my data if I cancel?',
    a: 'Your saved tools, reviews, and profile data are retained for 90 days after cancellation. You can export your data at any time from your dashboard.',
  },
  {
    q: 'Is the Founder Pro listing a one-time fee?',
    a: 'No — it\'s a monthly or annual subscription. This covers ongoing analytics, priority support, and featured placement for as long as you\'re subscribed.',
  },
];

export default function Pricing() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [tab, setTab] = useState<'users' | 'founders'>('users');

  const handleCheckout = (planId: string) => {
    toast.info('Stripe checkout coming soon — sign up to be notified when Pro launches!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />
      <div className="mt-[72px] flex-1">

        {/* Hero */}
        <div className="relative overflow-hidden border-b border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-slate-900/50" />
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="max-w-4xl mx-auto px-4 py-16 relative text-center">
            <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-sm font-medium px-4 py-2 rounded-full mb-6">
              <Crown className="w-4 h-4" />
              Simple, Transparent Pricing
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Find the right plan for<br />
              <span className="text-amber-400">your workflow</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
              Start free. Upgrade when you need more. No hidden fees, no lock-in.
            </p>
          </div>
        </div>

        {/* Tab: Users / Founders */}
        <div className="max-w-5xl mx-auto px-4 pt-10">
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-slate-800/60 border border-slate-700/60 rounded-xl p-1 gap-1">
              {(['users', 'founders'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    tab === t
                      ? 'bg-amber-400 text-slate-900 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t === 'users' ? '👤 For Users' : '🚀 For Founders'}
                </button>
              ))}
            </div>
          </div>

          {/* Billing toggle */}
          <div className="flex justify-center items-center gap-3 mb-10">
            <span className={`text-sm font-semibold ${billing === 'monthly' ? 'text-white' : 'text-slate-500'}`}>Monthly</span>
            <button
              onClick={() => setBilling(b => b === 'monthly' ? 'annual' : 'monthly')}
              className={`relative w-12 h-6 rounded-full transition-colors ${billing === 'annual' ? 'bg-amber-400' : 'bg-slate-700'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${billing === 'annual' ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm font-semibold ${billing === 'annual' ? 'text-white' : 'text-slate-500'}`}>
              Annual
              <span className="ml-2 bg-emerald-400/15 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">Save 20%</span>
            </span>
          </div>

          {/* User Plans */}
          {tab === 'users' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border flex flex-col ${
                    plan.highlight
                      ? 'bg-amber-400/5 border-amber-400/40 shadow-xl shadow-amber-500/10'
                      : 'bg-slate-900/60 border-slate-700/60'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-amber-400 text-slate-900 text-xs font-black px-4 py-1 rounded-full shadow">{plan.badge}</span>
                    </div>
                  )}
                  <div className="p-6 border-b border-slate-700/40">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4 ${
                      plan.highlight ? 'bg-amber-400/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {plan.icon}
                    </div>
                    <h3 className="text-xl font-black text-white mb-1">{plan.name}</h3>
                    <p className="text-slate-500 text-sm mb-4">{plan.tagline}</p>
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-black text-white">
                        ${plan.price[billing]}
                      </span>
                      {plan.price[billing] > 0 && (
                        <span className="text-slate-500 text-sm mb-1.5">/{billing === 'monthly' ? 'mo' : 'mo, billed annually'}</span>
                      )}
                    </div>
                    {billing === 'annual' && plan.price.annual > 0 && (
                      <p className="text-emerald-400 text-xs font-semibold mt-1">
                        Save ${(plan.price.monthly - plan.price.annual) * 12}/year
                      </p>
                    )}
                  </div>
                  <div className="p-6 flex-1">
                    <ul className="space-y-3">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-3">
                          {f.included
                            ? <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            : <X className="w-4 h-4 text-slate-700 flex-shrink-0 mt-0.5" />
                          }
                          <span className={`text-sm ${f.included ? 'text-slate-300' : 'text-slate-600'}`}>{f.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 pt-0">
                    {plan.ctaHref === '/contact' ? (
                      <Link href={plan.ctaHref}>
                        <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                          plan.highlight
                            ? 'bg-amber-400 hover:bg-amber-300 text-slate-900'
                            : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                        }`}>
                          {plan.cta}
                        </button>
                      </Link>
                    ) : (
                      <button
                        onClick={() => plan.id === 'free' ? window.location.href = plan.ctaHref : handleCheckout(plan.id)}
                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                          plan.highlight
                            ? 'bg-amber-400 hover:bg-amber-300 text-slate-900'
                            : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                        }`}
                      >
                        {plan.cta}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Founder Plans */}
          {tab === 'founders' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {FOUNDER_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border flex flex-col ${
                    plan.highlight
                      ? 'bg-amber-400/5 border-amber-400/40 shadow-xl shadow-amber-500/10'
                      : 'bg-slate-900/60 border-slate-700/60'
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-amber-400 text-slate-900 text-xs font-black px-4 py-1 rounded-full shadow">Recommended</span>
                    </div>
                  )}
                  <div className="p-6 border-b border-slate-700/40">
                    <h3 className="text-xl font-black text-white mb-4">{plan.name}</h3>
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-black text-white">${plan.price[billing]}</span>
                      {plan.price[billing] > 0 && (
                        <span className="text-slate-500 text-sm mb-1.5">/{billing === 'monthly' ? 'mo' : 'mo, billed annually'}</span>
                      )}
                    </div>
                    {billing === 'annual' && plan.price.annual > 0 && (
                      <p className="text-emerald-400 text-xs font-semibold mt-1">
                        Save ${(plan.price.monthly - plan.price.annual) * 12}/year
                      </p>
                    )}
                  </div>
                  <div className="p-6 flex-1">
                    <ul className="space-y-3">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-300 text-sm">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 pt-0">
                    <Link href={plan.ctaHref}>
                      <button
                        onClick={() => plan.id !== 'founder-free' && plan.ctaHref !== '/contact' ? handleCheckout(plan.id) : undefined}
                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                          plan.highlight
                            ? 'bg-amber-400 hover:bg-amber-300 text-slate-900'
                            : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                        }`}
                      >
                        {plan.cta}
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Feature comparison table */}
          {tab === 'users' && (
            <div className="mb-16">
              <h2 className="text-2xl font-black text-white text-center mb-8">Full Feature Comparison</h2>
              <div className="overflow-x-auto rounded-2xl border border-slate-700/60">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/60">
                      <th className="text-left p-4 text-slate-400 font-semibold w-1/2">Feature</th>
                      {PLANS.map(p => (
                        <th key={p.id} className={`p-4 font-black text-center ${p.highlight ? 'text-amber-400' : 'text-white'}`}>{p.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Browse tools', true, true, true],
                      ['Write reviews', '3/month', 'Unlimited', 'Unlimited'],
                      ['Save tools', '10 tools', 'Unlimited', 'Unlimited'],
                      ['Compare tools', '2 tools', '5 tools', 'Unlimited'],
                      ['Shareable comparisons', false, true, true],
                      ['Advanced filters', false, true, true],
                      ['Early access', false, true, true],
                      ['Pro deals', false, true, true],
                      ['Team workspace', false, false, 'Unlimited'],
                      ['API access', false, false, '10k req/mo'],
                      ['SSO / SAML', false, false, true],
                      ['SLA guarantee', false, false, true],
                    ].map(([feature, free, pro, ent], i) => (
                      <tr key={i} className={`border-b border-slate-800/60 ${i % 2 === 0 ? 'bg-slate-900/20' : ''}`}>
                        <td className="p-4 text-slate-300 font-medium">{feature as string}</td>
                        {[free, pro, ent].map((val, j) => (
                          <td key={j} className="p-4 text-center">
                            {val === true ? <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                              : val === false ? <X className="w-4 h-4 text-slate-700 mx-auto" />
                              : <span className="text-slate-300 text-xs font-semibold">{val as string}</span>
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FAQ */}
          <div className="max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl font-black text-white text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {FAQ_ITEMS.map((item, i) => (
                <div key={i} className="bg-slate-900/60 border border-slate-700/60 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-800/40 transition-colors"
                  >
                    <span className="text-white font-semibold text-sm pr-4">{item.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5">
                      <p className="text-slate-400 text-sm leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-400/20 rounded-2xl p-8 text-center mb-16">
            <Rocket className="w-10 h-10 text-amber-400 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-white mb-2">Still not sure?</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">Start with the free plan — no credit card required. Upgrade when you're ready.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/signin">
                <button className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3 rounded-xl text-sm transition-colors">
                  Get Started Free
                </button>
              </Link>
              <Link href="/contact">
                <button className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors border border-slate-700">
                  Talk to Sales
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
