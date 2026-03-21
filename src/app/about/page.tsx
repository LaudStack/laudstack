"use client";
export const dynamic = "force-dynamic";

// LaudStack — About Page
// Rebuilt: Founder-centric storytelling with Chiedu Kabakwu's photo and mission narrative

import Link from 'next/link';
import Image from 'next/image';
import {
  Shield, Star, Users, ArrowRight,
  CheckCircle, TrendingUp, Award, BookOpen, Lightbulb,
  Target, Heart, Rocket, Globe
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';

const FOUNDER_PHOTO = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663413324407/3XGasP8CcX57JRU5Ai2Hv7/founder-chiedu-kabakwu_3f3ac9d1.webp';

const VALUES = [
  {
    icon: <Shield className="w-6 h-6 text-amber-500" />,
    title: 'Radical Transparency',
    description: 'Every rating, review, and ranking on LaudStack is earned — never bought. Our ranking algorithm is transparent so founders and users can trust the results.',
  },
  {
    icon: <Users className="w-6 h-6 text-amber-500" />,
    title: 'Community First',
    description: 'LaudStack is built for the people who use software every day, not for the companies that sell it. The community drives everything — from reviews to rankings.',
  },
  {
    icon: <Star className="w-6 h-6 text-amber-500" />,
    title: 'Quality Over Quantity',
    description: 'We manually review every product before it goes live. We prioritize well-vetted, quality listings over sheer volume — because trust matters more than numbers.',
  },
  {
    icon: <Lightbulb className="w-6 h-6 text-amber-500" />,
    title: 'Founder Empathy',
    description: 'We know how hard it is to build a product and get it discovered. LaudStack gives indie founders and bootstrapped teams a fair shot at visibility — ranked on merit, not budget.',
  },
];

const WHAT_WE_OFFER = [
  {
    icon: <Rocket className="w-5 h-5 text-amber-500" />,
    title: 'Product Launches',
    description: 'Founders launch their SaaS and AI products through our LaunchPad, gaining visibility from day one with the community.',
  },
  {
    icon: <Star className="w-5 h-5 text-amber-500" />,
    title: 'Verified Reviews',
    description: 'Real practitioners write honest reviews. Every review is verified against actual usage — no fake testimonials, no pay-to-play.',
  },
  {
    icon: <TrendingUp className="w-5 h-5 text-amber-500" />,
    title: 'Community Voting',
    description: 'The community votes on the best stacks. Rankings are driven by real engagement, not marketing spend.',
  },
  {
    icon: <Target className="w-5 h-5 text-amber-500" />,
    title: 'Deals & Promotions',
    description: 'Exclusive software deals and lifetime offers help builders save money on the tools they need to grow.',
  },
  {
    icon: <Globe className="w-5 h-5 text-amber-500" />,
    title: 'Discovery & Comparison',
    description: 'Browse, filter, and compare products across categories. Find the right stack for your use case in minutes.',
  },
  {
    icon: <Heart className="w-5 h-5 text-amber-500" />,
    title: 'Founder Support',
    description: 'Founders can respond to reviews, run promotions, access analytics, and build credibility through the platform.',
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <PageHero
          breadcrumbs={[{ label: 'About' }]}
          eyebrow="Our Story"
          title="Built by a founder, for founders and builders."
          subtitle="LaudStack is the launch, discovery, and growth platform for AI and SaaS software — where honest reviews and community rankings help everyone make better decisions."
          accent="amber"
          layout="centered"
          size="md"
        />

        {/* ── Founder Section ── */}
        <section className="bg-white border-b border-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
            <div className="grid md:grid-cols-5 gap-8 sm:gap-12 items-start">
              {/* Photo column */}
              <div className="md:col-span-2 flex flex-col items-center md:items-start">
                <div className="relative w-[220px] h-[280px] sm:w-[260px] sm:h-[330px] rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                  <Image
                    src={FOUNDER_PHOTO}
                    alt="Chiedu Kabakwu — Founder of LaudStack"
                    fill
                    className="object-cover object-top"
                    priority
                  />
                </div>
                <div className="mt-5 text-center md:text-left">
                  <h3 className="text-xl font-black text-slate-900">Chiedu Kabakwu</h3>
                  <p className="text-amber-600 font-semibold text-sm mt-1">Founder &amp; CEO</p>
                </div>
              </div>

              {/* Story column */}
              <div className="md:col-span-3">
                <div className="flex items-center gap-2 text-amber-500 text-sm font-semibold mb-4">
                  <BookOpen className="w-4 h-4" />
                  The Origin Story
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-5 leading-tight">
                  &ldquo;I kept asking the same question — which tools actually work?&rdquo;
                </h2>
                <div className="space-y-4 text-slate-600 leading-relaxed text-[15px]">
                  <p>
                    As a builder and entrepreneur, Chiedu Kabakwu spent years navigating the overwhelming SaaS and AI tool landscape. Every time he needed a new tool — whether for project management, analytics, design, or development — the process was the same: hours of Googling, reading biased listicles, and hoping the tool he picked would actually deliver.
                  </p>
                  <p>
                    The existing review platforms felt stale. Rankings were influenced by advertising budgets. Reviews were often unverified. And indie founders with great products had almost no way to get discovered alongside well-funded competitors.
                  </p>
                  <p>
                    That frustration became the spark for LaudStack — a platform where the community decides what rises to the top. Where reviews are verified against real usage. Where founders can launch products and earn visibility through merit, not marketing spend. And where builders can discover, compare, and choose the right software with confidence.
                  </p>
                  <p>
                    LaudStack combines the best ideas from product launch platforms, review sites, deal marketplaces, and community voting — all in one place. It&apos;s built for the people who build things.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Mission Section ── */}
        <section className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div>
                <div className="flex items-center gap-2 text-amber-500 text-sm font-semibold mb-4">
                  <Target className="w-4 h-4" />
                  Our Mission
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 leading-tight">
                  Helping builders find the right software — faster.
                </h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  The SaaS and AI landscape is growing at an unprecedented rate. Thousands of tools compete for your attention, your budget, and your workflow. The signal-to-noise ratio is terrible.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  LaudStack exists to fix that. We combine verified reviews from real practitioners, a transparent ranking algorithm, and a community of builders who share what actually works — so you can make confident decisions in minutes, not days.
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 shadow-sm">
                <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">What makes us different</h4>
                <div className="space-y-4">
                  {[
                    'Every product is manually reviewed before listing',
                    'Reviews are verified against real usage',
                    'Rankings are algorithmic, never paid',
                    'Founders can respond to reviews publicly',
                    'No sponsored placements in organic search results',
                    'Community voting drives product rankings',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── What We Offer ── */}
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
            <div className="text-center mb-8 sm:mb-12">
              <div className="flex items-center justify-center gap-2 text-amber-500 text-sm font-semibold mb-3">
                <Rocket className="w-4 h-4" />
                The Platform
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">More than a directory</h2>
              <p className="text-slate-600 max-w-xl mx-auto">
                LaudStack is a full ecosystem for software discovery, launches, reviews, deals, and community-driven rankings.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {WHAT_WE_OFFER.map((item) => (
                <div key={item.title} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-amber-300/50 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <h3 className="text-slate-900 font-bold text-[15px]">{item.title}</h3>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Values ── */}
        <section className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
            <div className="text-center mb-8 sm:mb-12">
              <div className="flex items-center justify-center gap-2 text-amber-500 text-sm font-semibold mb-3">
                <Award className="w-4 h-4" />
                Our Values
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">What we stand for</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              {VALUES.map((value) => (
                <div key={value.title} className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 hover:border-amber-300/40 transition-colors shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    {value.icon}
                    <h3 className="text-slate-900 font-bold">{value.title}</h3>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8 sm:p-12 text-center">
              <TrendingUp className="w-10 h-10 text-amber-500 mx-auto mb-4" />
              <h3 className="text-slate-900 font-black text-xl sm:text-2xl mb-3">Join the LaudStack community</h3>
              <p className="text-slate-600 mb-8 max-w-lg mx-auto">
                Whether you&apos;re a founder looking to launch and grow, or a builder searching for the right software — LaudStack is for you.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Link href="/launchpad">
                  <button className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-sm">
                    Launch Your Product
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link href="/">
                  <button className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 font-semibold px-6 py-3 rounded-xl transition-colors border border-slate-200">
                    Browse Products
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
