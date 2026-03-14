"use client";

// LaudStack — Press Kit Page
// Brand assets, media coverage, company boilerplate, and press contact

import {
  Download, Mail, ExternalLink, Award, Users, Globe,
  Star, CheckCircle, FileText, Image, Newspaper
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';

const STATS = [
  { value: '12,000+', label: 'Monthly Active Users' },
  { value: '95+',     label: 'Verified Tools' },
  { value: '15',      label: 'Tool Categories' },
  { value: '4.7',     label: 'Avg Tool Rating' },
];

const MEDIA_COVERAGE = [
  {
    outlet: 'TechCrunch',
    headline: '"LaudStack is building the G2 for the AI-native era"',
    date: 'February 2025',
    url: '#',
  },
  {
    outlet: 'Product Hunt',
    headline: '#1 Product of the Day — LaudStack launches to 2,400 lauds',
    date: 'January 2025',
    url: '#',
  },
  {
    outlet: 'The Bootstrapper',
    headline: '"How LaudStack is giving indie founders a fair shot at discovery"',
    date: 'December 2024',
    url: '#',
  },
  {
    outlet: 'SaaS Weekly',
    headline: '"The trust problem in software reviews — and how LaudStack solves it"',
    date: 'November 2024',
    url: '#',
  },
];

const BRAND_ASSETS = [
  { name: 'Logo Pack (SVG + PNG)', desc: 'Light, dark, and icon-only variants', icon: <Image className="w-5 h-5 text-amber-500" /> },
  { name: 'Brand Guidelines PDF', desc: 'Colors, typography, usage rules', icon: <FileText className="w-5 h-5 text-amber-500" /> },
  { name: 'Product Screenshots', desc: 'High-res UI screenshots for editorial use', icon: <Image className="w-5 h-5 text-amber-500" /> },
  { name: 'Founder Headshots', desc: 'Press-ready photos of the founding team', icon: <Users className="w-5 h-5 text-amber-500" /> },
];

const COLORS = [
  { name: 'Amber 400', hex: '#FBBF24', usage: 'Primary accent' },
  { name: 'Slate 900', hex: '#0F172A', usage: 'Primary text / dark bg' },
  { name: 'Slate 500', hex: '#64748B', usage: 'Secondary text' },
  { name: 'White',     hex: '#FFFFFF', usage: 'Background / light surfaces' },
];

export default function Press() {
  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <PageHero
          eyebrow="Press & Media"
          title="LaudStack Press Kit"
          subtitle="Everything you need to cover LaudStack — brand assets, company facts, media coverage, and press contact. All in one place."
          accent="amber"
          layout="centered"
          size="lg"
        />

        {/* Stats bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {STATS.map(s => (
                <div key={s.label}>
                  <div className="text-3xl font-black text-slate-900 mb-1">{s.value}</div>
                  <div className="text-slate-500 text-sm">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">

          {/* Company boilerplate */}
          <section>
            <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-4">
              <FileText className="w-4 h-4" />
              Company Boilerplate
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-7">
              <h2 className="text-lg font-black text-slate-900 mb-3">About LaudStack</h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                LaudStack is the trusted discovery and review platform for SaaS and AI stacks. Founded in 2024, LaudStack helps over 12,000 professionals — including founders, product managers, engineers, and marketers — discover, compare, and choose the software that powers their work.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Unlike generic software directories, LaudStack combines verified community reviews, a transparent algorithmic ranking system, and an editorial curation layer to surface the products that genuinely perform. Every product on the platform is manually reviewed before listing, and every review is verified against real usage.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                For founders, LaudStack's LaunchPad gives indie and bootstrapped teams a fair shot at visibility alongside enterprise software — ranked on merit, not marketing budget. LaudStack is headquartered remotely, with team members across North America and Europe.
              </p>
              <div className="mt-5 pt-5 border-t border-gray-100">
                <button className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-500 transition-colors">
                  <Download className="w-4 h-4" />
                  Copy boilerplate as plain text
                </button>
              </div>
            </div>
          </section>

          {/* Brand assets */}
          <section>
            <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-4">
              <Image className="w-4 h-4" />
              Brand Assets
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {BRAND_ASSETS.map(asset => (
                <div key={asset.name} className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 hover:border-amber-300 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                    {asset.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 text-sm">{asset.name}</div>
                    <div className="text-slate-400 text-xs">{asset.desc}</div>
                  </div>
                  <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-500 transition-colors flex-shrink-0">
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
              ))}
            </div>

            {/* Brand colors */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-slate-900 mb-4 text-sm">Brand Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {COLORS.map(c => (
                  <div key={c.name}>
                    <div
                      className="w-full h-14 rounded-xl border border-gray-200 mb-2"
                      style={{ background: c.hex }}
                    />
                    <div className="text-xs font-bold text-slate-900">{c.name}</div>
                    <div className="text-xs text-slate-400 font-mono">{c.hex}</div>
                    <div className="text-xs text-slate-400">{c.usage}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Media coverage */}
          <section>
            <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-4">
              <Newspaper className="w-4 h-4" />
              Media Coverage
            </div>
            <div className="space-y-3">
              {MEDIA_COVERAGE.map(item => (
                <a
                  key={item.headline}
                  href={item.url}
                  className="block bg-white border border-gray-200 rounded-2xl p-5 hover:border-amber-300 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-amber-600 mb-1 uppercase tracking-wide">{item.outlet}</div>
                      <div className="font-semibold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">
                        {item.headline}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{item.date}</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-amber-400 flex-shrink-0 mt-0.5 transition-colors" />
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* Key facts */}
          <section>
            <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-4">
              <CheckCircle className="w-4 h-4" />
              Key Facts
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { label: 'Founded', value: '2024' },
                  { label: 'Headquarters', value: 'Remote (Global)' },
                  { label: 'Stage', value: 'Seed' },
                  { label: 'Team Size', value: '8 full-time' },
                  { label: 'Monthly Active Users', value: '12,000+' },
                  { label: 'Tools Listed', value: '95+ verified' },
                  { label: 'Categories', value: '15 tool categories' },
                  { label: 'Reviews', value: '3,200+ verified reviews' },
                ].map(fact => (
                  <div key={fact.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-slate-500">{fact.label}</span>
                    <span className="text-sm font-bold text-slate-900">{fact.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Press contact */}
          <section>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
              <Mail className="w-10 h-10 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-black text-slate-900 mb-2">Press Contact</h3>
              <p className="text-slate-500 text-sm mb-5 max-w-sm mx-auto">
                For media enquiries, interview requests, or editorial partnerships, reach out to our communications team.
              </p>
              <a
                href="mailto:press@laudstack.com"
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors"
              >
                <Mail className="w-4 h-4" />
                press@laudstack.com
              </a>
              <p className="text-slate-400 text-xs mt-4">We aim to respond to all press enquiries within 24 hours.</p>
            </div>
          </section>

        </div>
      </div>
      <Footer />
    </div>
  );
}
