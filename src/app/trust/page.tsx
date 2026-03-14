"use client";

// LaudStack — Trust Framework Page
// Design: Dark editorial, amber accents, policy-focused layout

import Link from 'next/link';
import {
  Shield, CheckCircle, AlertTriangle, Eye, BarChart3, Star,
  Users, Lock, FileText, ArrowRight, Zap, XCircle, Info
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';

const TRUST_PILLARS = [
  {
    icon: <CheckCircle className="w-7 h-7 text-green-500" />,
    title: 'Verified Listings',
    description: 'Every product launched on LaudStack is manually reviewed by our team before going live. We verify that the product exists, is actively maintained, and meets our quality bar. We reject listings that are vaporware, clones, or spam.',
    items: [
      'Manual review of every new submission',
      'Website and product functionality check',
      'Founder identity verification for Pro listings',
      'Ongoing monitoring for abandoned or defunct tools',
    ],
  },
  {
    icon: <Star className="w-7 h-7 text-amber-400" />,
    title: 'Authentic Reviews',
    description: 'Our review system is designed to surface genuine user experiences. We use multiple signals to detect and remove fake or incentivized reviews, and we clearly label verified purchasers.',
    items: [
      'Email verification required for all reviewers',
      'Verified Purchase badge for confirmed users',
      'AI-assisted detection of low-quality or fake reviews',
      'Founders can flag suspicious reviews for investigation',
      'No anonymous reviews — all reviewers have profiles',
    ],
  },
  {
    icon: <BarChart3 className="w-7 h-7 text-sky-400" />,
    title: 'Transparent Rankings',
    description: 'Our ranking algorithm is public. We don\'t sell placements, and we don\'t accept payment to boost a product\'s position. Rankings are based entirely on community signals.',
    items: [
      'Algorithm weights published in our docs',
      'No paid placements in search or browse results',
      'Featured tools are editorially selected, clearly labeled',
      'Rank history is publicly visible on every product page',
    ],
  },
  {
    icon: <Lock className="w-7 h-7 text-purple-400" />,
    title: 'Data Privacy',
    description: 'We take user privacy seriously. We collect only what we need to run the platform, we never sell your data, and we give you full control over your account and contributions.',
    items: [
      'No sale of user data to third parties',
      'GDPR-compliant data handling',
      'Full account deletion on request',
      'Transparent cookie and tracking policy',
    ],
  },
];

const RANKING_FACTORS = [
  { factor: 'Average Rating', weight: '30%', description: 'Weighted average of all verified reviews, with recency bias.' },
  { factor: 'Review Volume', weight: '20%', description: 'More reviews = more signal. Minimum 3 reviews required to rank.' },
  { factor: 'Laud Count', weight: '20%', description: 'Community lauds from verified users, with velocity weighting.' },
  { factor: 'Review Quality', weight: '15%', description: 'Reviews with pros/cons, use cases, and detailed body score higher.' },
  { factor: 'Recency', weight: '10%', description: 'Tools with recent activity (reviews, updates) rank higher.' },
  { factor: 'Verification Status', weight: '5%', description: 'Verified and Pro listings receive a small trust bonus.' },
];

const PROHIBITED = [
  'Paying for reviews or lauds',
  'Posting fake or incentivized reviews',
  'Creating multiple accounts to game rankings',
  'Impersonating other products or founders',
  'Launching tools that don\'t exist or aren\'t functional',
  'Using LaudStack data for spam or unsolicited outreach',
];

export default function Trust() {
  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 flex flex-col">
      <Navbar />
      <div className="flex-1">
      <PageHero
        eyebrow="Trust & Quality"
        title="The LaudStack Trust Framework"
        subtitle="LaudStack only works if you can trust what you read here. This page explains exactly how we ensure the quality and authenticity of every listing, review, and ranking on the platform."
        accent="green"
        layout="centered"
        size="md"
      />

      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Four pillars */}
        <div className="mb-16">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-8">
            <Info className="w-4 h-4" />
            Four pillars of trust
          </div>
          <div className="space-y-6">
            {TRUST_PILLARS.map((pillar) => (
              <div key={pillar.title} className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-gray-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">{pillar.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-slate-900 font-bold text-xl mb-3">{pillar.title}</h3>
                    <p className="text-slate-500 leading-relaxed mb-4">{pillar.description}</p>
                    <ul className="space-y-2">
                      {pillar.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ranking algorithm */}
        <div className="mb-16">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-4">
            <BarChart3 className="w-4 h-4" />
            Ranking Algorithm
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3">How rankings are calculated</h2>
          <p className="text-slate-500 mb-8">
            Our ranking score is a weighted composite of the following signals. The formula is applied identically to every product — no exceptions.
          </p>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 px-6 py-3 border-b border-gray-200 bg-gray-100/50 text-slate-500 text-xs font-medium uppercase tracking-wide">
              <span>Signal</span>
              <span className="text-center">Weight</span>
              <span className="text-right">Description</span>
            </div>
            {RANKING_FACTORS.map((factor, i) => (
              <div key={factor.factor} className={`grid grid-cols-3 px-6 py-4 gap-4 items-center ${i < RANKING_FACTORS.length - 1 ? 'border-b border-gray-200/50' : ''}`}>
                <span className="text-slate-900 font-medium text-sm">{factor.factor}</span>
                <div className="text-center">
                  <span className="bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs font-bold px-2 py-1 rounded-full">{factor.weight}</span>
                </div>
                <span className="text-slate-500 text-sm text-right">{factor.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prohibited */}
        <div className="mb-16">
          <div className="flex items-center gap-2 text-rose-400 text-sm font-medium mb-4">
            <AlertTriangle className="w-4 h-4" />
            Prohibited Behaviour
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3">What we don't allow</h2>
          <p className="text-slate-500 mb-6">
            Violations of these rules result in immediate removal of the listing, review, or account — and may be reported to relevant authorities.
          </p>
          <div className="bg-white border border-rose-500/20 rounded-2xl p-6">
            <ul className="space-y-3">
              {PROHIBITED.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                  <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Report */}
        <div className="mb-16 bg-white border border-gray-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Eye className="w-7 h-7 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-slate-900 font-bold text-xl mb-2">See something suspicious?</h3>
              <p className="text-slate-500 leading-relaxed mb-4">
                If you spot a fake review, a misleading listing, or any other violation of our Trust Framework, please report it. Our team reviews every report within 48 hours.
              </p>
              <Link href="/contact">
                <button className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
                  Report an Issue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Founder section */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-10 text-center">
          <FileText className="w-10 h-10 text-amber-400 mx-auto mb-4" />
          <h3 className="text-slate-900 font-black text-2xl mb-3">Founder Guidelines</h3>
          <p className="text-slate-500 mb-6 max-w-lg mx-auto">
            If you're a founder listing your product on LaudStack, read our full founder guidelines to understand what's expected and how to make the most of your listing.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/launchpad">
              <button className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors">
                Launch Your Tool
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/contact">
              <button className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-slate-900 font-semibold px-6 py-3 rounded-xl transition-colors">
                Contact Us
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
