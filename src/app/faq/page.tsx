"use client";

export const dynamic = 'force-dynamic';


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

// ─── Data ─────────────────────────────────────────────────────────────────────

const FAQ_CATEGORIES = [
  {
    id: 'general',
    label: 'General',
    icon: HelpCircle,
    color: '#475569',
    bg: '#F8FAFC',
    border: '#E2E8F0',
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
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
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
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
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
    color: '#15803D',
    bg: '#F0FDF4',
    border: '#BBF7D0',
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
    color: '#1D4ED8',
    bg: '#EFF6FF',
    border: '#BFDBFE',
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
    color: '#7E22CE',
    bg: '#FAF5FF',
    border: '#E9D5FF',
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

function AccordionItem({ q, a, isOpen, onToggle, accentColor }: {
  q: string;
  a: string;
  isOpen: boolean;
  onToggle: () => void;
  accentColor: string;
}) {
  return (
    <div style={{
      background: '#FFFFFF', border: `1.5px solid ${isOpen ? accentColor + '40' : '#E2E8F0'}`,
      borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.2s',
      boxShadow: isOpen ? `0 4px 16px ${accentColor}12` : '0 1px 3px rgba(15,23,42,0.04)',
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, padding: '18px 22px', background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 700, color: '#171717', lineHeight: 1.4, flex: 1 }}>{q}</span>
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: isOpen ? accentColor : '#F1F5F9',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
        }}>
          <ChevronDown style={{
            width: 14, height: 14,
            color: isOpen ? '#FFFFFF' : '#64748B',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s',
          }} />
        </div>
      </button>
      {isOpen && (
        <div style={{ padding: '0 22px 20px' }}>
          <div style={{ height: 1, background: '#F1F5F9', marginBottom: 16 }} />
          <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.75, margin: 0 }}>{a}</p>
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
          .map(item => ({ ...item, categoryLabel: cat.label, accentColor: cat.color }))
      )
    : [];

  const totalQuestions = FAQ_CATEGORIES.reduce((s, c) => s + c.questions.length, 0);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFC' }}>
      <Navbar />
      <div style={{ height: 72, flexShrink: 0 }} />

      {/* ── Hero ── */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '56px 0 48px' }}>
        <div className="max-w-[1300px] mx-auto px-6 lg:px-10" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderRadius: 100, background: '#EFF6FF', border: '1px solid #BFDBFE', marginBottom: 20 }}>
            <HelpCircle style={{ width: 12, height: 12, color: '#1D4ED8' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#1D4ED8', letterSpacing: '0.09em', textTransform: 'uppercase' }}>Help Centre</span>
          </div>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 900, color: '#171717', letterSpacing: '-0.03em', margin: '0 0 14px', lineHeight: 1.1 }}>
            Frequently Asked Questions
          </h1>
          <p style={{ fontSize: 17, color: '#64748B', maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.65 }}>
            Everything you need to know about LaudStack — from how reviews work to launching your tool.
          </p>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 540, margin: '0 auto' }}>
            <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#94A3B8' }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Search ${totalQuestions} questions...`}
              style={{
                width: '100%', paddingLeft: 48, paddingRight: 16, height: 52,
                fontSize: 15, color: '#171717', background: '#FFFFFF',
                border: '1.5px solid #E2E8F0', borderRadius: 14, outline: 'none',
                boxShadow: '0 2px 8px rgba(15,23,42,0.06)', transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = '#F59E0B')}
              onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
            />
          </div>

          {/* Quick stats */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 28, flexWrap: 'wrap' }}>
            {[
              { icon: BookOpen, text: `${totalQuestions} questions answered` },
              { icon: Zap, text: '6 topic categories' },
              { icon: CheckCircle2, text: 'Updated weekly' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#64748B', fontWeight: 600 }}>
                <Icon style={{ width: 14, height: 14, color: '#F59E0B' }} />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Search results ── */}
      {searchQuery.trim() && (
        <section style={{ padding: '40px 0', flex: 1 }}>
          <div className="max-w-[1300px] mx-auto px-6 lg:px-10">
            <p style={{ fontSize: 13, color: '#64748B', fontWeight: 600, marginBottom: 20 }}>
              {searchResults.length === 0
                ? `No results for "${searchQuery}"`
                : `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchQuery}"`}
            </p>
            {searchResults.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {searchResults.map((item, i) => (
                  <div key={i}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                      {item.categoryLabel}
                    </p>
                    <AccordionItem
                      q={item.q} a={item.a}
                      isOpen={!!openItems[`search-${i}`]}
                      onToggle={() => toggleItem(`search-${i}`)}
                      accentColor={item.accentColor}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8' }}>
                <HelpCircle style={{ width: 48, height: 48, margin: '0 auto 16px', opacity: 0.3 }} />
                <p style={{ fontSize: 15, fontWeight: 600 }}>No questions match your search.</p>
                <p style={{ fontSize: 13, marginTop: 8 }}>Try a different term or browse the categories below.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ marginTop: 16, fontSize: 13, fontWeight: 700, color: '#F59E0B', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}
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
        <main style={{ flex: 1, padding: '40px 0 64px' }}>
          <div className="max-w-[1300px] mx-auto px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-4" style={{ gap: 32 }}>

              {/* Sidebar nav */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                    Topics
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {FAQ_CATEGORIES.map(cat => {
                      const Icon = cat.icon;
                      const isActive = cat.id === activeCategory;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setActiveCategory(cat.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '11px 14px', borderRadius: 10, cursor: 'pointer',
                            fontSize: 13, fontWeight: 700, textAlign: 'left',
                            border: isActive ? `1.5px solid ${cat.border}` : '1.5px solid transparent',
                            background: isActive ? cat.bg : 'transparent',
                            color: isActive ? cat.color : '#475569',
                            transition: 'all 0.15s', fontFamily: 'inherit',
                          }}
                          onMouseEnter={e => { if (!isActive) { const b = e.currentTarget as HTMLButtonElement; b.style.background = '#F8FAFC'; b.style.color = '#171717'; } }}
                          onMouseLeave={e => { if (!isActive) { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'transparent'; b.style.color = '#475569'; } }}
                        >
                          <Icon style={{ width: 15, height: 15, flexShrink: 0 }} />
                          <span style={{ flex: 1 }}>{cat.label}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? cat.color : '#94A3B8' }}>
                            {cat.questions.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Still need help? */}
                  <div style={{ marginTop: 28, padding: '18px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12 }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: '#171717', margin: '0 0 6px' }}>Still have questions?</p>
                    <p style={{ fontSize: 12, color: '#78350F', margin: '0 0 14px', lineHeight: 1.5 }}>Our support team typically responds within 4 hours.</p>
                    <a
                      href="/contact"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontSize: 12, fontWeight: 700, color: '#D97706', textDecoration: 'none',
                      }}
                    >
                      <Mail style={{ width: 13, height: 13 }} /> Contact Support <ArrowRight style={{ width: 11, height: 11 }} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Accordion */}
              <div className="lg:col-span-3">
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 100, background: activeData.bg, border: `1px solid ${activeData.border}`, marginBottom: 12 }}>
                    <activeData.icon style={{ width: 12, height: 12, color: activeData.color }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: activeData.color, letterSpacing: '0.09em', textTransform: 'uppercase' }}>{activeData.label}</span>
                  </div>
                  <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 800, color: '#171717', margin: 0, letterSpacing: '-0.02em' }}>
                    {activeData.questions.length} questions in this section
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {activeData.questions.map((item, i) => {
                    const key = `${activeCategory}-${i}`;
                    return (
                      <AccordionItem
                        key={key}
                        q={item.q} a={item.a}
                        isOpen={!!openItems[key]}
                        onToggle={() => toggleItem(key)}
                        accentColor={activeData.color}
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
      <section style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '56px 0' }}>
        <div className="max-w-[1300px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 20 }}>
            {[
              {
                icon: Mail, title: 'Contact Support', desc: 'Get personalised help from our team within 4 hours.',
                cta: 'Send a Message', href: '/contact', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE',
              },
              {
                icon: BookOpen, title: 'Trust Framework', desc: 'Understand exactly how our reviews and rankings work.',
                cta: 'Read the Framework', href: '/trust', color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0',
              },
              {
                icon: Rocket, title: 'Launch Your Tool', desc: 'Founders can launch their tool for free via LaunchPad.',
                cta: 'Go to LaunchPad', href: '/launchpad', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A',
              },
            ].map(({ icon: Icon, title, desc, cta, href, color, bg, border }) => (
              <a
                key={title}
                href={href}
                style={{
                  display: 'flex', flexDirection: 'column', gap: 12,
                  padding: '24px', borderRadius: 16, border: `1.5px solid ${border}`,
                  background: bg, textDecoration: 'none',
                  transition: 'box-shadow 0.18s, transform 0.18s',
                  boxShadow: `0 1px 4px ${color}12`,
                }}
                onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.boxShadow = `0 8px 24px ${color}22`; a.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.boxShadow = `0 1px 4px ${color}12`; a.style.transform = 'translateY(0)'; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFFFFF', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon style={{ width: 20, height: 20, color }} />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#171717', margin: '0 0 5px' }}>{title}</p>
                  <p style={{ fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.55 }}>{desc}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 700, color, marginTop: 'auto' }}>
                  {cta} <ArrowRight style={{ width: 12, height: 12 }} />
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
