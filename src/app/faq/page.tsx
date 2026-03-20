"use client";

/*
 * LaudStack — FAQ
 *
 * Comprehensive FAQ page covering all platform topics:
 * General, Reviews & Ratings, Launching Products, Community Voting & Lauds,
 * Deals & Promotions, Advertising, Trust & Safety, Account & Privacy, Billing & Plans
 *
 * Accordion layout with category sidebar for easy navigation.
 */

import { useState } from 'react';
import {
  ChevronDown, Search, HelpCircle, Users, Rocket,
  Shield, Star, CreditCard, BookOpen, Mail,
  ArrowRight, Tag, Megaphone, ThumbsUp, BarChart3,
  Globe, PenLine, Award
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
        a: 'LaudStack is the launch, discovery, and growth platform for AI and SaaS software. It brings together product launches, verified community reviews, community voting (lauds), software deals, advertising, and curated collections — all in one place. Think of it as a combination of Product Hunt (launches and voting), G2 (reviews and ratings), and AppSumo (deals and promotions), purpose-built for the modern software ecosystem.',
      },
      {
        q: 'Who is LaudStack for?',
        a: 'LaudStack serves three main audiences. First, builders and professionals who need to discover, compare, and evaluate SaaS and AI products for their workflows. Second, founders and product teams who want to launch their products, collect verified reviews, and grow their visibility. Third, the broader tech community that wants to vote on, discuss, and recommend the best software tools available.',
      },
      {
        q: 'Is LaudStack free to use?',
        a: 'Yes — browsing products, reading reviews, voting (lauding), comparing tools, and accessing deals are completely free for all users. Founders can also list their products for free via LaunchPad. We offer optional paid promotion tiers (Boost, Spotlight, Dominate) for founders who want enhanced visibility, and a Pro plan for power users who need advanced analytics.',
      },
      {
        q: 'How is LaudStack different from G2, Capterra, or Product Hunt?',
        a: 'LaudStack combines the best elements of multiple platforms into one. Unlike G2 or Capterra, we include community voting (lauds) and product launch features. Unlike Product Hunt, we provide deep verified reviews, star ratings, and long-term ranking data — not just launch-day hype. We also offer software deals and promotions (similar to AppSumo) and curated editorial collections. The result is a single platform where you can launch, discover, review, compare, and buy software.',
      },
      {
        q: 'What categories of products does LaudStack cover?',
        a: 'We cover a wide range of categories including AI Productivity, AI Writing, AI Image, AI Video, AI Code, AI Analytics, Marketing, Project Management, CRM, Sales, Design, Developer Tools, and more. Categories are continuously expanded as the software landscape evolves. Each category has its own dedicated page with filtered listings, rankings, and curated picks.',
      },
      {
        q: 'How often is the platform updated?',
        a: 'New products are added daily as founders launch via LaunchPad. Rankings are recalculated regularly based on fresh review data, community lauds, and engagement metrics. Our editorial team publishes new collections and picks weekly. Deals and promotions are updated as founders create new offers.',
      },
      {
        q: 'What does "Laud" mean on LaudStack?',
        a: 'A "Laud" is our version of an upvote or endorsement. When you laud a product, you are publicly signaling that you recommend it. Lauds contribute to a product\'s community ranking and help surface the best tools. The term reflects our belief that great software deserves recognition — and the community should decide what rises to the top.',
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
        a: 'We use a multi-layer verification system. Reviewers must have an active LaudStack account. We cross-reference usage signals, check for duplicate submissions, and apply algorithmic fraud detection. Reviews that fail verification are flagged and removed. This ensures that every review on the platform reflects genuine user experience.',
      },
      {
        q: 'Can I write a review for any product?',
        a: 'Yes, any registered user can write a review for any product listed on LaudStack. We encourage honest, detailed reviews based on real usage. Reviews should cover what you liked, what could be improved, and who the product is best suited for. All reviews must comply with our Review Guidelines — they should be factual, constructive, and free from conflicts of interest.',
      },
      {
        q: 'How is the star rating calculated?',
        a: 'The displayed star rating is a weighted average of all verified reviews. We apply a Bayesian smoothing algorithm that prevents products with very few reviews from dominating the rankings. This means a product needs a meaningful volume of reviews before its rating stabilises — protecting users from manipulation by a small number of reviews.',
      },
      {
        q: 'Can founders respond to reviews?',
        a: 'Yes. Verified product owners and founders can post official responses to any review on their product\'s profile. This creates a transparent dialogue between users and makers. Responses are clearly labelled as "Founder Reply" and cannot edit or remove the original review. This feature helps founders address feedback publicly and build trust.',
      },
      {
        q: 'What happens if I suspect a review is fake?',
        a: 'Use the "Report Review" flag on any review card. Our moderation team investigates all reports within 48 hours. If a review is found to violate our guidelines, it is removed and the account may be suspended. We take review integrity extremely seriously — it is the foundation of the platform.',
      },
      {
        q: 'Can I edit or delete my review after posting?',
        a: 'Yes, you can edit your review at any time from your dashboard. Edits are logged and the review will be re-verified. You can also delete your review, though we encourage updating rather than deleting as it preserves the historical record for the community.',
      },
      {
        q: 'What are "Editor\'s Picks" and "Community Picks"?',
        a: 'Editor\'s Picks are products hand-selected by our editorial team based on quality, innovation, and user value — they are never sold or sponsored. Community Picks are products that have received the most lauds and positive reviews from the community over a given period. Together, they give you both expert curation and crowd wisdom.',
      },
      {
        q: 'How do product comparisons work?',
        a: 'You can compare any two or more products side by side on their respective product pages. Comparisons show ratings, review counts, pricing, features, and community sentiment. We also generate dedicated "Product A vs Product B" pages for popular matchups, making it easy to evaluate alternatives.',
      },
    ],
  },
  {
    id: 'founders',
    label: 'Launching Products',
    icon: Rocket,
    twColor: 'text-amber-600',
    twBg: 'bg-amber-50',
    twBorder: 'border-amber-200',
    questions: [
      {
        q: 'How do I launch my product on LaudStack?',
        a: 'Go to the LaunchPad page and complete the submission form. You\'ll need to provide your product\'s name, tagline, description, logo, website URL, category, pricing model, and optional media (screenshots, videos). Submissions are reviewed by our team within 2–3 business days. There is no fee to list a product.',
      },
      {
        q: 'What is the LaunchPad?',
        a: 'LaunchPad is LaudStack\'s dedicated launch hub for founders. When you launch via LaunchPad, your product gets a dedicated launch day feature, appears in the "Latest Stacks" section on the homepage, and is eligible for community lauds and editorial review. It\'s the fastest path to getting discovered by the LaudStack community.',
      },
      {
        q: 'How do I claim my product\'s profile?',
        a: 'Visit the Claim Your Product page and verify ownership by confirming access to the product\'s registered email domain or by adding a DNS TXT record. Once verified, you\'ll receive a "Verified Founder" badge and unlock the Founder Dashboard with analytics, review management, and promotion tools.',
      },
      {
        q: 'Can I pay to get a better ranking or Editor\'s Pick badge?',
        a: 'No. Organic rankings are determined entirely by review scores, community lauds, and engagement data. Editor\'s Pick badges are awarded solely at the editorial team\'s discretion based on quality criteria — they are never sold or sponsored. Paid promotions (Boost, Spotlight, Dominate) are always clearly labelled as "Sponsored" and do not affect organic rankings.',
      },
      {
        q: 'What analytics does the Founder Dashboard provide?',
        a: 'The Founder Dashboard shows profile views, click-throughs to your website, review trends over time, rating breakdowns, laud history, comparison appearances, and referral sources. You can also manage your product listing, respond to reviews, create deals, and run promotions — all from one place.',
      },
      {
        q: 'Can I update my product listing after launch?',
        a: 'Yes. Verified founders can update their product\'s description, screenshots, media, pricing, and category at any time from the Founder Dashboard. Major changes (like renaming or recategorising) may trigger a brief re-review by our team to ensure listing quality.',
      },
      {
        q: 'What is the Affiliate Program?',
        a: 'LaudStack\'s Affiliate Program lets you earn commission by referring new product submissions and Pro plan subscribers. Affiliates receive a unique referral link, a real-time dashboard, and monthly payouts. Visit the Affiliates page to learn about commission tiers and apply.',
      },
      {
        q: 'How do I get featured in curated collections?',
        a: 'Our editorial team curates collections based on quality, relevance, and community reception. You cannot pay to be included. The best way to get featured is to maintain a high-quality listing, collect genuine reviews, and engage with the community. Products with strong ratings and active founder engagement are more likely to be selected.',
      },
    ],
  },
  {
    id: 'voting',
    label: 'Community Voting & Lauds',
    icon: ThumbsUp,
    twColor: 'text-orange-600',
    twBg: 'bg-orange-50',
    twBorder: 'border-orange-200',
    questions: [
      {
        q: 'How does community voting work?',
        a: 'Any registered user can "laud" (upvote) products they recommend. Each user gets one laud per product. Lauds contribute to a product\'s community ranking and help surface the best tools. The Community Voting page shows real-time rankings based on laud counts, and you can filter by category, time period, and more.',
      },
      {
        q: 'Can I remove my laud after voting?',
        a: 'Yes. Lauds can be toggled on and off at any time. Simply click the laud button again on any product to remove your vote. Your voting history is visible in your profile dashboard.',
      },
      {
        q: 'How are community rankings calculated?',
        a: 'Community rankings combine laud counts with engagement signals like review activity, profile views, and click-through rates. We apply time-decay weighting so that recent activity matters more than historical votes. This keeps rankings fresh and rewards products that are actively delivering value.',
      },
      {
        q: 'What is the difference between lauds and reviews?',
        a: 'A laud is a quick endorsement — a single click to say "I recommend this." A review is a detailed written evaluation with a star rating, pros, cons, and use-case context. Both contribute to a product\'s overall ranking, but reviews carry more weight because they provide substantive information for other users.',
      },
      {
        q: 'Can founders laud their own products?',
        a: 'No. Self-lauding is detected and blocked by our system. Founders found attempting to manipulate laud counts — including through coordinated voting — risk having their product delisted. We take community integrity seriously.',
      },
      {
        q: 'Are there leaderboards or awards based on lauds?',
        a: 'Yes. The Community Voting page features real-time leaderboards showing the most lauded products overall and by category. We also highlight "Rising" products — those gaining the most lauds in a recent period. Top-ranked products may be featured in our newsletter and editorial collections.',
      },
    ],
  },
  {
    id: 'deals',
    label: 'Deals & Promotions',
    icon: Tag,
    twColor: 'text-green-700',
    twBg: 'bg-green-50',
    twBorder: 'border-green-200',
    questions: [
      {
        q: 'What are LaudStack Deals?',
        a: 'LaudStack Deals are exclusive discounts, lifetime offers, and promotional pricing offered by software founders directly to the LaudStack community. Deals can include percentage discounts, extended free trials, lifetime access offers, and bundle pricing. They are created and managed by verified founders through the Founder Dashboard.',
      },
      {
        q: 'How do I find active deals?',
        a: 'Visit the Deals page to browse all currently active offers. You can filter by category, discount type, and expiration date. Active deals are also highlighted on individual product pages and may appear in our newsletter and homepage featured sections.',
      },
      {
        q: 'How do founders create deals?',
        a: 'Verified founders can create deals from the Founder Dashboard under the "Promotions" tab. You set the deal type (percentage off, lifetime offer, extended trial, etc.), the discount amount, start and end dates, and any redemption limits. Deals go live immediately after creation and appear on the Deals page.',
      },
      {
        q: 'Are deals verified or guaranteed by LaudStack?',
        a: 'LaudStack verifies that the founder offering the deal is the legitimate owner of the product. However, the deal terms (pricing, features included, refund policy) are set by the founder. We recommend reading the deal details carefully and checking the product\'s reviews before purchasing. If you encounter issues with a deal, contact our support team.',
      },
      {
        q: 'Can I get notified about new deals?',
        a: 'Yes. Subscribe to the LaudStack newsletter to receive weekly deal roundups. You can also follow specific categories or products to get notified when new deals are posted. Notification preferences can be managed in your Account Settings.',
      },
    ],
  },
  {
    id: 'advertising',
    label: 'Advertising',
    icon: Megaphone,
    twColor: 'text-indigo-700',
    twBg: 'bg-indigo-50',
    twBorder: 'border-indigo-200',
    questions: [
      {
        q: 'What advertising options does LaudStack offer?',
        a: 'We offer three promotion tiers: Boost ($149/30 days) gives your product a Featured badge and priority placement in featured sections. Spotlight ($349/90 days) adds homepage carousel placement and newsletter features. Dominate ($599/180 days) includes all Spotlight benefits plus category page takeover and dedicated editorial coverage. All placements are clearly labelled as "Sponsored."',
      },
      {
        q: 'Do sponsored placements affect organic rankings?',
        a: 'No. Paid promotions are always displayed separately from organic rankings and are clearly labelled as "Sponsored." Your organic ranking is determined entirely by review scores, community lauds, and engagement data. Advertising gives you additional visibility but never manipulates the ranking algorithm.',
      },
      {
        q: 'How do I purchase a promotion?',
        a: 'Verified founders can purchase promotions directly from the Founder Dashboard under the "Promote" tab. Select your tier, review the placement details, and complete the secure checkout. Promotions are activated immediately upon payment. You can also visit the Advertise page for full details on each tier.',
      },
      {
        q: 'Can I target specific categories or audiences?',
        a: 'Yes. Higher-tier promotions (Spotlight and Dominate) include category-specific placement options. Your product will be featured prominently within its primary category pages, reaching users who are actively evaluating tools in that space. Contact our advertising team for custom placement requests.',
      },
      {
        q: 'What metrics do I get for my promotion?',
        a: 'All promotion tiers include a performance dashboard showing impressions, clicks, click-through rate, and profile views generated by the promotion. Spotlight and Dominate tiers include additional metrics like comparison appearances and referral source breakdowns.',
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
        a: 'We use several safeguards: Bayesian rating smoothing, IP-based duplicate detection, account age requirements for reviews, algorithmic anomaly detection for sudden rating spikes, self-laud blocking, and manual audits for products showing suspicious patterns. Founders found manipulating reviews or lauds are permanently banned and their products delisted.',
      },
      {
        q: 'Are sponsored listings clearly disclosed?',
        a: 'Yes. Any paid promotional placement — such as a "Sponsored" banner or featured position — is always clearly labelled. Sponsored content never influences organic rankings, review scores, or editorial picks. Our advertising policy is published in full on the Trust page.',
      },
      {
        q: 'How do I report a product or review that violates guidelines?',
        a: 'Every product profile and review has a "Report" option. You can also contact our Trust & Safety team directly at trust@laudstack.com. We aim to respond to all reports within 48 hours and resolve serious violations within 5 business days.',
      },
      {
        q: 'What happens to products that violate platform rules?',
        a: 'Products that violate our guidelines may receive warnings, temporary suspensions, or permanent delisting depending on the severity. Review manipulation, fake reviews, and misleading product information are treated as serious violations. Founders are notified of any actions taken and can appeal through our dispute resolution process.',
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
        a: 'Click "Sign In" in the top navigation and choose to sign up with LinkedIn or email. Account creation is free and takes less than a minute. You\'ll need an account to write reviews, laud products, save tools to your collection, access deals, and manage your profile.',
      },
      {
        q: 'What data does LaudStack collect about me?',
        a: 'We collect the information you provide during registration (name, email), your activity on the platform (products viewed, reviews written, lauds given), and standard analytics data (browser type, general location). We never sell your personal data to third parties. See our Privacy Policy for full details.',
      },
      {
        q: 'Can I delete my account?',
        a: 'Yes. Go to your Account Settings and select "Delete Account." This will permanently remove your profile and personal data within 30 days, in compliance with GDPR. Your reviews will be anonymised rather than deleted to preserve the integrity of the review record.',
      },
      {
        q: 'How do I manage my newsletter subscription?',
        a: 'You can subscribe or unsubscribe from the LaudStack newsletter at any time via your Account Settings or by clicking the unsubscribe link at the bottom of any newsletter email. We send a weekly digest of top products, rising picks, new deals, and platform updates.',
      },
      {
        q: 'Is LaudStack GDPR compliant?',
        a: 'Yes. LaudStack is fully GDPR compliant. We provide data access, portability, and deletion rights to all EU users. Our Privacy Policy details how we handle personal data, and you can submit a data request at any time via your account settings or by emailing privacy@laudstack.com.',
      },
      {
        q: 'Can I have both a user account and a founder account?',
        a: 'Yes. Every LaudStack account can function as both a user and a founder. Once you verify ownership of a product, your account gains access to the Founder Dashboard alongside your regular user features. You can write reviews, laud products, and manage your own listings — all from the same account.',
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
        a: 'LaudStack offers a free tier for all users and a Pro plan for founders and power users. The free tier includes full access to browsing, reviews, voting, deals, and comparisons. The Pro plan adds advanced analytics, priority listing placement, enhanced founder profiles, and dedicated support. Visit the Pricing page for current plan details.',
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
      {
        q: 'How are promotion payments handled?',
        a: 'Promotion tiers (Boost, Spotlight, Dominate) are one-time payments with fixed durations — no recurring charges. Payment is processed securely at checkout. Promotions are activated immediately and run for their full duration regardless of when you purchase.',
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
    <div className={`bg-slate-50 border-[1.5px] rounded-xl overflow-hidden transition-colors ${
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
          <p className="text-sm text-slate-600 leading-7">{a}</p>
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
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <PageHero
        breadcrumbs={[{ label: 'FAQ' }]}
        eyebrow="Help Centre"
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about LaudStack — from launching products and writing reviews to deals, voting, and advertising."
        accent="amber"
        layout="centered"
        size="md"
      />

      {/* Search bar */}
      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-6 mb-4 relative z-10">
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Search ${totalQuestions} questions...`}
            className="w-full pl-12 pr-4 h-13 text-[15px] text-slate-900 bg-white border-[1.5px] border-slate-200 rounded-2xl outline-none shadow-md focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
          />
        </div>
      </div>

      {/* ── Search results ── */}
      {searchQuery.trim() && (
        <section className="py-10 flex-1">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-sm text-slate-500 font-semibold mb-5">
              {searchResults.length === 0
                ? `No results for "${searchQuery}"`
                : `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchQuery}"`}
            </p>
            {searchResults.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {searchResults.map((item, i) => (
                  <div key={i}>
                    <p className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-1.5">
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
              <div className="text-center py-12 text-slate-500">
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
        <main className="flex-1 py-6 sm:py-10 pb-10 sm:pb-16">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

              {/* Sidebar nav */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-20">
                  <p className="text-[11px] font-bold text-slate-500 tracking-widest uppercase mb-3 hidden lg:block">
                    Topics
                  </p>
                  <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0" style={{ scrollbarWidth: 'none' }}>
                    {FAQ_CATEGORIES.map(cat => {
                      const Icon = cat.icon;
                      const isActive = cat.id === activeCategory;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setActiveCategory(cat.id)}
                          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg cursor-pointer text-sm font-bold text-left transition-all border-[1.5px] whitespace-nowrap lg:whitespace-normal ${
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
                  <div className="mt-5 lg:mt-7 p-4 bg-amber-50 border border-amber-200 rounded-xl hidden lg:block">
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
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
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
      <section className="bg-slate-50 border-t border-slate-200 py-8 sm:py-14">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
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
                icon: Rocket, title: 'Launch Your Product', desc: 'Founders can launch their product for free via LaunchPad.',
                cta: 'Go to LaunchPad', href: '/launchpad',
                cls: 'bg-amber-50 border-amber-200 hover:shadow-amber-200/40',
                iconCls: 'text-amber-600 bg-white border-amber-200',
                ctaCls: 'text-amber-600',
              },
            ].map(({ icon: Icon, title, desc, cta, href, cls, iconCls, ctaCls }) => (
              <a
                key={title}
                href={href}
                className={`flex flex-col gap-3 p-4 sm:p-6 rounded-2xl border-[1.5px] no-underline transition-all duration-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 ${cls}`}
              >
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${iconCls}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[15px] font-extrabold text-slate-900 mb-1">{title}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
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
