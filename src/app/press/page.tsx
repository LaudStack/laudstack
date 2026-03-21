"use client";
export const dynamic = "force-dynamic";

// LaudStack — Press Kit Page
// Fully rebuilt: comprehensive boilerplate, brand assets, founder bio, key facts, press contact

import { useState } from 'react';
import Image from 'next/image';
import {
  Download, Mail, ExternalLink, Award, Globe,
  Star, CheckCircle, FileText, Newspaper, Copy,
  Rocket, Users, Shield, TrendingUp, Tag, ThumbsUp,
  ArrowRight, Quote
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { toast } from 'sonner';

const FOUNDER_PHOTO = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663413324407/3XGasP8CcX57JRU5Ai2Hv7/founder-chiedu-kabakwu_3f3ac9d1.webp';

// ─── Boilerplate text (for copy function) ────────────────────────────────

const BOILERPLATE_SHORT = `LaudStack is the launch, discovery, and growth platform for AI and SaaS software. Founded in 2024 by Chiedu Kabakwu, LaudStack combines verified community reviews, transparent algorithmic rankings, community voting (lauds), software deals, and editorial curation — giving professionals the most honest way to discover, compare, and choose the software they need.`;

const BOILERPLATE_LONG = `LaudStack is the launch, discovery, and growth platform for AI and SaaS software. Founded in 2024 by Chiedu Kabakwu, LaudStack helps professionals — including founders, product managers, engineers, and marketers — discover, compare, and choose the software that powers their work.

Unlike generic software directories, LaudStack combines multiple platform concepts into one: product launches (similar to Product Hunt), verified community reviews and ratings (similar to G2), software deals and promotions (similar to AppSumo), and community voting — all driven by a transparent ranking algorithm where merit beats marketing budget.

For founders, LaudStack's LaunchPad gives indie and bootstrapped teams a fair shot at visibility alongside enterprise software. Products are ranked on community lauds, verified reviews, and engagement data — never on ad spend. Founders can also run deals, respond to reviews, and access analytics through the Founder Dashboard.

LaudStack is headquartered remotely, with a fully distributed team. The platform is free to use for all users, and free to list for all founders.`;

// ─── Brand colors ────────────────────────────────────────────────────────

const COLORS = [
  { name: 'Amber 500', hex: '#F59E0B', usage: 'Primary accent', textColor: 'text-slate-900' },
  { name: 'Slate 900', hex: '#0F172A', usage: 'Primary text / dark surfaces', textColor: 'text-white' },
  { name: 'Slate 600', hex: '#475569', usage: 'Secondary text', textColor: 'text-white' },
  { name: 'White', hex: '#FFFFFF', usage: 'Background / light surfaces', textColor: 'text-slate-900' },
  { name: 'Amber 50', hex: '#FFFBEB', usage: 'Accent background', textColor: 'text-slate-900' },
  { name: 'Slate 50', hex: '#F8FAFC', usage: 'Section background', textColor: 'text-slate-900' },
];

// ─── Brand assets ────────────────────────────────────────────────────────

const BRAND_ASSETS = [
  { name: 'Logo Pack (SVG + PNG)', desc: 'Light, dark, and icon-only variants in all sizes', icon: <FileText className="w-5 h-5 text-amber-500" /> },
  { name: 'Brand Guidelines PDF', desc: 'Colors, typography, spacing, and usage rules', icon: <FileText className="w-5 h-5 text-amber-500" /> },
  { name: 'Product Screenshots', desc: 'High-res UI screenshots for editorial use', icon: <FileText className="w-5 h-5 text-amber-500" /> },
  { name: 'Founder Headshot', desc: 'Press-ready photo of Chiedu Kabakwu', icon: <Users className="w-5 h-5 text-amber-500" /> },
];

// ─── Media coverage ──────────────────────────────────────────────────────

const MEDIA_COVERAGE: { outlet: string; headline: string; date: string; url: string }[] = [];

// ─── Platform highlights for press ───────────────────────────────────────

const PLATFORM_HIGHLIGHTS = [
  {
    icon: <Rocket className="w-5 h-5 text-amber-500" />,
    title: 'Product Launches',
    desc: 'Founders launch their SaaS and AI products through LaunchPad, gaining visibility from day one.',
  },
  {
    icon: <Star className="w-5 h-5 text-amber-500" />,
    title: 'Verified Reviews',
    desc: 'Every review is verified against real usage — no fake testimonials, no pay-to-play.',
  },
  {
    icon: <ThumbsUp className="w-5 h-5 text-amber-500" />,
    title: 'Community Voting (Lauds)',
    desc: 'The community votes on the best products. Rankings are driven by real engagement, not ad spend.',
  },
  {
    icon: <Tag className="w-5 h-5 text-amber-500" />,
    title: 'Deals & Promotions',
    desc: 'Exclusive software deals and lifetime offers help builders save on the tools they need.',
  },
  {
    icon: <Shield className="w-5 h-5 text-amber-500" />,
    title: 'Trust Framework',
    desc: 'A published set of standards governing reviews, rankings, editorial picks, and dispute resolution.',
  },
  {
    icon: <TrendingUp className="w-5 h-5 text-amber-500" />,
    title: 'Transparent Rankings',
    desc: 'Rankings are algorithmic and transparent — never influenced by advertising or sponsorship.',
  },
];

// ─── Component ───────────────────────────────────────────────────────────

export default function Press() {
  const [copiedShort, setCopiedShort] = useState(false);
  const [copiedLong, setCopiedLong] = useState(false);

  const copyText = (text: string, type: 'short' | 'long') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'short') {
        setCopiedShort(true);
        setTimeout(() => setCopiedShort(false), 2000);
      } else {
        setCopiedLong(true);
        setTimeout(() => setCopiedLong(false), 2000);
      }
      toast.success('Copied to clipboard');
    });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <PageHero
          breadcrumbs={[{ label: 'Press' }]}
          eyebrow="Press & Media"
          title="LaudStack Press Kit"
          subtitle="Everything journalists, bloggers, and partners need — company background, brand assets, founder bio, and press contact."
          accent="amber"
          layout="centered"
          size="md"
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-14 sm:space-y-20">

          {/* ── Company Boilerplate ── */}
          <section>
            <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-4">
              <FileText className="w-4 h-4" />
              Company Boilerplate
            </div>

            {/* Short version */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-7 mb-4">
              <div className="flex items-center justify-between gap-4 mb-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Short Version</h3>
                <button
                  onClick={() => copyText(BOILERPLATE_SHORT, 'short')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-500 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedShort ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                {BOILERPLATE_SHORT}
              </p>
            </div>

            {/* Long version */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-7">
              <div className="flex items-center justify-between gap-4 mb-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Full Version</h3>
                <button
                  onClick={() => copyText(BOILERPLATE_LONG, 'long')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-500 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedLong ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="text-slate-600 text-sm leading-relaxed space-y-4">
                {BOILERPLATE_LONG.split('\n\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
          </section>

          {/* ── Founder Bio ── */}
          <section>
            <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-4">
              <Users className="w-4 h-4" />
              Founder
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                <div className="flex-shrink-0">
                  <div className="relative w-[140px] h-[175px] rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <Image
                      src={FOUNDER_PHOTO}
                      alt="Chiedu Kabakwu — Founder of LaudStack"
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-slate-900 mb-0.5">Chiedu Kabakwu</h3>
                  <p className="text-amber-600 font-semibold text-sm mb-4">Founder &amp; CEO</p>
                  <p className="text-slate-600 text-sm leading-relaxed mb-3">
                    Chiedu Kabakwu is the founder and CEO of LaudStack. As a builder and entrepreneur, he experienced firsthand the frustration of navigating the overwhelming SaaS and AI tool landscape — where rankings were influenced by ad budgets, reviews were unverified, and great indie products were buried under enterprise marketing.
                  </p>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    He founded LaudStack in 2024 to create the platform he always wished existed: one where community votes, verified reviews, and editorial curation — not marketing spend — determine what rises to the top. Under his leadership, LaudStack has grown into a comprehensive launch, discovery, and growth platform for AI and SaaS software.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <Quote className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-slate-700 text-sm italic leading-relaxed">
                        &ldquo;I kept asking the same question — which tools actually work? LaudStack is the answer I built for everyone who&apos;s tired of biased rankings and fake reviews.&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Platform Highlights ── */}
          <section>
            <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-4">
              <Rocket className="w-4 h-4" />
              Platform Highlights
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">What LaudStack does</h2>
            <p className="text-slate-600 text-sm mb-6 max-w-2xl">
              LaudStack is a multi-purpose platform combining product launches, verified reviews, community voting, software deals, and editorial curation.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PLATFORM_HIGHLIGHTS.map(item => (
                <div key={item.title} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-amber-300/40 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <h3 className="text-slate-900 font-bold text-sm">{item.title}</h3>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Key Facts ── */}
          <section>
            <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-4">
              <CheckCircle className="w-4 h-4" />
              Key Facts
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-1">
                {[
                  { label: 'Founded', value: '2024' },
                  { label: 'Founder', value: 'Chiedu Kabakwu' },
                  { label: 'Headquarters', value: 'Remote (Global)' },
                  { label: 'Stage', value: 'Seed' },
                  { label: 'Business Model', value: 'Freemium + Advertising' },
                  { label: 'Listing Cost', value: 'Free for all founders' },
                  { label: 'Reviews', value: 'All verified against real usage' },
                  { label: 'Rankings', value: 'Algorithmic, never paid' },
                  { label: 'Core Features', value: 'Launches, Reviews, Voting, Deals' },
                  { label: 'Website', value: 'laudstack.com' },
                ].map(fact => (
                  <div key={fact.label} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                    <span className="text-sm text-slate-500">{fact.label}</span>
                    <span className="text-sm font-bold text-slate-900">{fact.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Brand Assets ── */}
          <section>
            <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-4">
              <Award className="w-4 h-4" />
              Brand Assets
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">Download brand materials</h2>
            <p className="text-slate-600 text-sm mb-6 max-w-2xl">
              All assets are available for editorial and press use. Please follow the brand guidelines for proper usage.
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {BRAND_ASSETS.map(asset => (
                <div key={asset.name} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center gap-4 hover:border-amber-300/40 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                    {asset.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 text-sm">{asset.name}</div>
                    <div className="text-slate-500 text-xs">{asset.desc}</div>
                  </div>
                  <button
                    onClick={() => toast.info('Brand assets will be available for download soon.')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-500 transition-colors flex-shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
              ))}
            </div>

            {/* Brand colors */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Brand Colors</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {COLORS.map(c => (
                  <div key={c.name}>
                    <div
                      className="w-full h-14 rounded-xl border border-slate-200 mb-2 flex items-end justify-start p-2"
                      style={{ background: c.hex }}
                    >
                      <span className={`text-[10px] font-mono font-bold ${c.textColor} opacity-70`}>{c.hex}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900">{c.name}</div>
                    <div className="text-[11px] text-slate-500">{c.usage}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Media Coverage ── */}
          <section>
            <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-4">
              <Newspaper className="w-4 h-4" />
              Media Coverage
            </div>
            <div className="space-y-3">
              {MEDIA_COVERAGE.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
                  <Newspaper className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700 mb-1">No media coverage yet</p>
                  <p className="text-xs text-slate-500">We&apos;d love to be featured. Press inquiries are welcome at the contact below.</p>
                </div>
              ) : (
                MEDIA_COVERAGE.map(item => (
                  <a
                    key={item.headline}
                    href={item.url}
                    className="block bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-amber-300 transition-colors group no-underline"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold text-amber-600 mb-1 uppercase tracking-wide">{item.outlet}</div>
                        <div className="font-semibold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">
                          {item.headline}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{item.date}</div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-amber-400 flex-shrink-0 mt-0.5 transition-colors" />
                    </div>
                  </a>
                ))
              )}
            </div>
          </section>

          {/* ── Press Contact CTA ── */}
          <section className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8 sm:p-10 text-center">
            <Mail className="w-10 h-10 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-900 mb-2">Press Contact</h3>
            <p className="text-slate-600 text-sm mb-6 max-w-sm mx-auto">
              For media enquiries, interview requests, editorial partnerships, or speaking opportunities, reach out to our communications team.
            </p>
            <a
              href="mailto:press@laudstack.com"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 py-3 rounded-xl transition-colors no-underline"
            >
              <Mail className="w-4 h-4" />
              press@laudstack.com
            </a>
            <p className="text-slate-500 text-xs mt-4">We aim to respond to all press enquiries within 24 hours.</p>
          </section>

        </div>
      </div>
      <Footer />
    </div>
  );
}
