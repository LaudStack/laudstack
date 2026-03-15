"use client";

/*
 * LaudStack — FAQ
 *
 * Comprehensive FAQ page covering all platform topics.
 * Accordion layout with category tabs for easy navigation.
 * Design: light, professional, consistent with platform theme.
 */

import { useState } from 'react';
import {
  ChevronDown, Search, HelpCircle, Users, Rocket,
  Shield, Star, CreditCard, BookOpen, Zap, Mail,
  ArrowRight, CheckCircle2,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';

// ─── Data ─────────────────────────────────────────────────────────────────────

const FAQ_CATEGORIES = [
  {
    id: 'general',
    label: 'General',
    icon: HelpCircle,
    twColor: 'text-slate-600',
    twBg: 'bg-slate-50',
    twBorder: 'border-slate-200',
    questions: [
      {
        q: 'What is LaudStack?',
        a: 'LaudStack is a professional discovery and review platform for SaaS and AI stacks. We help businesses and professionals find, compare, and evaluate the best software tools through verified community reviews, editorial curation, and data-driven rankings. Think of us as the trusted source for software intelligence — combining the depth of G2 with the discovery energy of ProductHunt.',
      },
      {
        q: 'Is LaudStack free to use?',
        a: 'Yes — browsing tools, reading reviews, and using the comparison features are completely free for all users. We offer optional Pro plans for founders and power users who need advanced analytics, priority listings, and enhanced profile features. See our Pricing page for details.',
      },
      {
        q: 'How is LaudStack different from G2 or Capterra?',
        a: 'LaudStack combines the verified review depth of G2 with the community-driven discovery energy of ProductHunt. We focus specifically on SaaS and AI stacks, maintain stricter review verification standards, and provide real-time trend data alongside editorial curation. Our Community Picks and Editor\'s Picks systems give you both crowd wisdom and expert guidance in one place.',
      },
      {
        q: 'How often is the platform updated?',
        a: 'New tools are added daily as founders launch via LaunchPad. Rankings are recalculated weekly based on fresh review data and community votes. Our editorial team publishes new picks and collections every week. The Changelog page documents all significant platform updates.',
      },
      {
        q: 'What categories of tools does LaudStack cover?',
        a: 'We cover 12 categories: AI Productivity, AI Writing, AI Image, AI Video, AI Code, AI Analytics, Marketing, Project Management, CRM, Sales, Design, and Developer Tools. We continuously expand our category coverage as the market evolves.',
      },
    ],
  },
  {
    id: 'reviews',
    label: 'Reviews & Ratings',
    icon: Star,
    twColor: 'text-amber-600',
    twBg: 'bg-amber-50',
    twBorder: 'border-amber-200',
    questions: [
      {
        q: 'How does LaudStack verify reviews?',
        a: 'We use a multi-layer verification system. Reviewers must have an active LaudStack account. We cross-reference usage signals, check for duplicate submissions, and apply algorithmic fraud detection. Reviews that fail verification are flagged and removed. Our Trust Framework page explains the full process in detail.',
      },
      {
        q: 'Can I write a review for any tool?',
        a: 'Yes, any registered user can write a review for any tool listed on LaudStack. We encourage honest, detailed reviews based on real usage. Reviews must comply with our Review Guidelines — they should be factual, constructive, and free from conflicts of interest.',
      },
      {
        q: 'How is the star rating calculated?',
        a: 'The displayed star rating is a weighted average of all verified reviews. We apply a Bayesian smoothing algorithm that prevents tools with very few reviews from dominating the rankings. This means a product needs a meaningful volume of reviews before its rating stabilises — protecting users from manipulation by a small number of reviews.',
      },
      {
        q: 'Can founders respond to reviews?',
        a: 'Yes. Verified tool owners and founders can post official responses to any review on their tool\'s profile. This creates a transparent dialogue between users and makers. Responses are clearly labelled as "Founder Reply" and cannot edit or remove the original review.',
      },
      {
        q: 'What happens if I suspect a review is fake?',
        a: 'Use the "Report Review" flag on any review card. Our moderation team investigates all reports within 48 hours. If a review is found to violate our guidelines, it is removed and the account may be suspended. We take review integrity extremely seriously.',
      },
      {
        q: 'Can I edit or delete my review after posting?',
        a: 'Yes, you can edit your review at any time from your dashboard. Edits are logged and the review will be re-verified. You can also delete your review, though we encourage updating rather than deleting as it preserves the historical record for the community.',
      },
    ],
  },
  {
    id: 'founders',
    label: 'For Founders',
    icon: Rocket,
    twColor: 'text-amber-600',
    twBg: 'bg-amber-50',
    twBorder: 'border-amber-200',
    questions: [
      {
        q: 'How do I launch my tool to LaudStack?',
        a: 'Go to the LaunchPad page and complete the submission form. You\'ll need to provide your tool\'s name, tagline, description, logo, website URL, category, and pricing model. Submissions are reviewed by our team within 2–3 business days. There is no fee to list a product.',
      },
      {
        q: 'What is the LaunchPad?',
        a: 'LaunchPad is LaudStack\'s dedicated launch hub for founders. When you launch via LaunchPad, your tool gets a dedicated launch day feature, appears in the "Fresh Launches" section on the homepage, and is eligible for community lauds and editorial review. It\'s the fastest path to getting discovered.',
      },
      {
        q: 'How do I claim my tool\'s profile?',
        a: 'Visit the Claim Your Product page and verify ownership by confirming access to the product\'s registered email domain or by adding a DNS TXT record. Once verified, you\'ll receive a "Verified Founder" badge and unlock the Founder Dashboard with analytics and review management tools.',
      },
      {
        q: 'Can I pay to get a better ranking or Editor\'s Pick badge?',
        a: 'No. Rankings are determined entirely by review scores, community votes, and engagement data. Editor\'s Pick badges are awarded solely at the editorial team\'s discretion based on quality criteria — they are never sold or sponsored. This is a core principle of our Trust Framework.',
      },
      {
        q: 'What analytics does the Founder Dashboard provide?',
        a: 'The Founder Dashboard shows profile views, click-throughs to your website, review trends over time, rating breakdowns, laud history, and comparison appearances. Pro plan subscribers get additional data including visitor demographics, referral sources, and conversion benchmarks.',
      },
      {
        q: 'What is the Affiliate Program?',
        a: 'LaudStack\'s Affiliate Program lets you earn commission by referring new tool submissions and Pro plan subscribers. Affiliates receive a unique referral link, a real-time dashboard, and monthly payouts. Visit the Affiliates page to apply.',
      },
    ],
  },
  {
    id: 'trust',
    label: 'Trust & Safety',
    icon: Shield,
    twColor: 'text-emerald-700',
    twBg: 'bg-emerald-50',
    twBorder: 'border-emerald-200',
    questions: [
      {
        q: 'What is the LaudStack Trust Framework?',
        a: 'The Trust Framework is our published set of standards governing how reviews are verified, how rankings are calculated, how editorial picks are selected, and how disputes are resolved. It is designed to ensure that every piece of information on LaudStack is accurate, unbiased, and useful. You can read the full framework on the Trust page.',
      },
      {
        q: 'How does LaudStack prevent manipulation of rankings?',
        a: 'We use several safeguards: Bayesian rating smoothing, IP-based duplicate detection, account age requirements for reviews, algorithmic anomaly detection for sudden rating spikes, and manual audits for tools showing suspicious patterns. Founders found manipulating reviews are permanently banned.',
      },
      {
        q: 'Are sponsored listings clearly disclosed?',
        a: 'Yes. Any paid promotional placement — such as a "Sponsored" banner or featured position — is always clearly labelled. Sponsored content never influences organic rankings, review scores, or editorial picks. Our advertising policy is published in full on the Trust page.',
      },
      {
        q: 'How do I report a product or review that violates guidelines?',
        a: 'Every product profile and review has a "Report" option. You can also contact our Trust & Safety team directly at trust@laudstack.com. We aim to respond to all reports within 48 hours and resolve serious violations within 5 business days.',
      },
    ],
  },
  {
    id: 'account',
    label: 'Account & Privacy',
    icon: Users,
    twColor: 'text-blue-700',
    twBg: 'bg-blue-50',
    twBorder: 'border-blue-200',
    questions: [
      {
        q: 'How do I create a LaudStack account?',
        a: 'Click "Sign In" in the top navigation and choose to sign up with your Manus account or email. Account creation is free and takes less than a minute. You\'ll need an account to write reviews, laud stacks, save tools to your collection, and access personalised recommendations.',
      },
      {
        q: 'What data does LaudStack collect about me?',
        a: 'We collect the information you provide during registration (name, email), your activity on the platform (tools viewed, reviews written, lauds given), and standard analytics data (browser type, general pathname). We never sell your personal data to third parties. See our Privacy Policy for full details.',
      },
      {
        q: 'Can I delete my account?',
        a: 'Yes. Go to your Account Settings and select "Delete Account". This will permanently remove your profile and personal data within 30 days, in compliance with GDPR. Your reviews will be anonymised rather than deleted to preserve the integrity of the review record.',
      },
      {
        q: 'How do I manage my newsletter subscription?',
        a: 'You can subscribe or unsubscribe from the LaudStack newsletter at any time via your Account Settings or by clicking the unsubscribe link at the bottom of any newsletter email. We send a weekly digest of top tools, rising picks, and platform updates — no spam.',
      },
      {
        q: 'Is LaudStack GDPR compliant?',
        a: 'Yes. LaudStack is fully GDPR compliant. We provide data access, portability, and deletion rights to all EU users. Our Privacy Policy details how we handle personal data, and you can submit a data request at any time via your account settings or by emailing privacy@laudstack.com.',
      },
    ],
  },
  {
    id: 'billing',
    label: 'Billing & Plans',
    icon: CreditCard,
    twColor: 'text-purple-700',
    twBg: 'bg-purple-50',
    twBorder: 'border-purple-200',
    questions: [
      {
        q: 'What plans does LaudStack offer?',
        a: 'LaudStack offers a free tier for all users and a Pro plan for founders and power users. The Pro plan includes advanced analytics, priority listing placement, enhanced founder profiles, and dedicated support. Visit the Pricing page for current plan details and pricing.',
      },
      {
        q: 'How do I upgrade to a Pro plan?',
        a: 'Visit the Pricing page and click "Get Started" on the Pro plan. You\'ll be guided through a secure checkout. Pro features are activated immediately upon successful payment.',
      },
      {
        q: 'Can I cancel my Pro subscription at any time?',
        a: 'Yes. You can cancel your Pro subscription at any time from your Account Settings. Your Pro features will remain active until the end of your current billing period. We do not offer refunds for partial billing periods, but you will not be charged again after cancellation.',
      },
      {
        q: 'Do you offer discounts for startups or non-profits?',
        a: 'Yes. We offer a 50% discount for early-stage startups (pre-seed or seed stage) and registered non-profit organisations. Contact us at billing@laudstack.com with proof of eligibility to apply.',
      },
    ],
  },
];

// ─── Accordion item ───────────────────────────────────────────────────────────

function AccordionItem({ q, a, isOpen, onToggle, twColor }: {
  q: string;
  a: string;
  isOpen: boolean;
  onToggle: () => void;
  twColor: string;
}) {
  return (
    <div className={`bg-white border-[1.5px] rounded-xl overflow-hidden transition-colors ${
      isOpen ? 'border-amber-200 shadow-md' : 'border-slate-200 shadow-sm'
    }`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 bg-transparent cursor-pointer text-left"
      >
        <span className="text-[15px] font-bold text-slate-900 leading-snug flex-1">{q}</span>
        <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center transition-colors ${
          isOpen ? 'bg-amber-500' : 'bg-slate-100'
        }`}>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isOpen ? 'text-white rotate-180' : 'text-slate-500'
          }`} />
        </div>
      </button>
      {isOpen && (
        <div className="px-5 pb-5">
          <div className="h-px bg-slate-100 mb-4" />
          <p className="text-sm text-slate-500 leading-7">{a}</p>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState('general');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const activeData = FAQ_CATEGORIES.find(c => c.id === activeCategory) ?? FAQ_CATEGORIES[0];

  const toggleItem = (key: string) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Search across all categories
  const searchResults = searchQuery.trim()
    ? FAQ_CATEGORIES.flatMap(cat =>
        cat.questions
          .filter(item =>
            item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.a.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map(item => ({ ...item, categoryLabel: cat.label, twColor: cat.twColor }))
      )
    : [];

  const totalQuestions = FAQ_CATEGORIES.reduce((s, c) => s + c.questions.length, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <PageHero
        eyebrow="Help Centre"
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about LaudStack — from how reviews work to launching your tool."
        accent="amber"
        layout="center"
        size="md"
      />

      {/* Search bar */}
      <div className="max-w-[1300px] mx-auto w-full px-4 sm:px-6 lg:px-10 -mt-6 mb-4 relative z-10">
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Search ${totalQuestions} questions...`}
            className="w-full pl-12 pr-4 h-13 text-[15px] text-slate-900 bg-white border-[1.5px] border-slate-200 rounded-2xl outline-none shadow-md focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
          />
        </div>

        {/* Quick stats */}
        <div className="flex items-center justify-center gap-6 mt-5 flex-wrap">
          {[
            { icon: BookOpen, text: `${totalQuestions} questions answered` },
            { icon: Zap, text: '6 topic categories' },
            { icon: CheckCircle2, text: 'Updated weekly' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm text-slate-500 font-semibold">
              <Icon className="w-3.5 h-3.5 text-amber-500" />
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* ── Search results ── */}
      {searchQuery.trim() && (
        <section className="py-10 flex-1">
          <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10">
            <p className="text-sm text-slate-500 font-semibold mb-5">
              {searchResults.length === 0
                ? `No results for "${searchQuery}"`
                : `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchQuery}"`}
            </p>
            {searchResults.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {searchResults.map((item, i) => (
                  <div key={i}>
                    <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
                      {item.categoryLabel}
                    </p>
                    <AccordionItem
                      q={item.q} a={item.a}
                      isOpen={!!openItems[`search-${i}`]}
                      onToggle={() => toggleItem(`search-${i}`)}
                      twColor={item.twColor}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-[15px] font-semibold">No questions match your search.</p>
                <p className="text-sm mt-2">Try a different term or browse the categories below.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-sm font-bold text-amber-600 hover:text-amber-500 underline underline-offset-2 bg-transparent border-none cursor-pointer"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Category tabs + accordion ── */}
      {!searchQuery.trim() && (
        <main className="flex-1 py-10 pb-16">
          <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

              {/* Sidebar nav */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-3">
                    Topics
                  </p>
                  <div className="flex flex-col gap-1">
                    {FAQ_CATEGORIES.map(cat => {
                      const Icon = cat.icon;
                      const isActive = cat.id === activeCategory;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setActiveCategory(cat.id)}
                          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg cursor-pointer text-sm font-bold text-left transition-all border-[1.5px] ${
                            isActive
                              ? `${cat.twBg} ${cat.twBorder} ${cat.twColor}`
                              : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="flex-1">{cat.label}</span>
                          <span className={`text-[11px] font-bold ${isActive ? cat.twColor : 'text-slate-400'}`}>
                            {cat.questions.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Still need help? */}
                  <div className="mt-7 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-sm font-extrabold text-slate-900 mb-1.5">Still have questions?</p>
                    <p className="text-xs text-amber-900 mb-3.5 leading-relaxed">Our support team typically responds within 4 hours.</p>
                    <a
                      href="/contact"
                      className="flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-500 no-underline"
                    >
                      <Mail className="w-3.5 h-3.5" /> Contact Support <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Accordion */}
              <div className="lg:col-span-3">
                <div className="mb-6">
                  <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full ${activeData.twBg} border ${activeData.twBorder} mb-3`}>
                    <activeData.icon className={`w-3 h-3 ${activeData.twColor}`} />
                    <span className={`text-[11px] font-bold ${activeData.twColor} tracking-wider uppercase`}>{activeData.label}</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {activeData.questions.length} questions in this section
                  </h2>
                </div>

                <div className="flex flex-col gap-2.5">
                  {activeData.questions.map((item, i) => {
                    const key = `${activeCategory}-${i}`;
                    return (
                      <AccordionItem
                        key={key}
                        q={item.q} a={item.a}
                        isOpen={!!openItems[key]}
                        onToggle={() => toggleItem(key)}
                        twColor={activeData.twColor}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ── Bottom CTA ── */}
      <section className="bg-white border-t border-slate-200 py-14">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: Mail, title: 'Contact Support', desc: 'Get personalised help from our team within 4 hours.',
                cta: 'Send a Message', href: '/contact',
                cls: 'bg-blue-50 border-blue-200 hover:shadow-blue-200/40',
                iconCls: 'text-blue-600 bg-white border-blue-200',
                ctaCls: 'text-blue-600',
              },
              {
                icon: BookOpen, title: 'Trust Framework', desc: 'Understand exactly how our reviews and rankings work.',
                cta: 'Read the Framework', href: '/trust',
                cls: 'bg-emerald-50 border-emerald-200 hover:shadow-emerald-200/40',
                iconCls: 'text-emerald-600 bg-white border-emerald-200',
                ctaCls: 'text-emerald-600',
              },
              {
                icon: Rocket, title: 'Launch Your Tool', desc: 'Founders can launch their tool for free via LaunchPad.',
                cta: 'Go to LaunchPad', href: '/launchpad',
                cls: 'bg-amber-50 border-amber-200 hover:shadow-amber-200/40',
                iconCls: 'text-amber-600 bg-white border-amber-200',
                ctaCls: 'text-amber-600',
              },
            ].map(({ icon: Icon, title, desc, cta, href, cls, iconCls, ctaCls }) => (
              <a
                key={title}
                href={href}
                className={`flex flex-col gap-3 p-6 rounded-2xl border-[1.5px] no-underline transition-all duration-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 ${cls}`}
              >
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${iconCls}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[15px] font-extrabold text-slate-900 mb-1">{title}</p>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
                <div className={`flex items-center gap-1.5 text-sm font-bold mt-auto ${ctaCls}`}>
                  {cta} <ArrowRight className="w-3 h-3" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
