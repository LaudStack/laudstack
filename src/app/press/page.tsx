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


const MEDIA_COVERAGE: { outlet: string; headline: string; date: string; url: string }[] = [];

const BRAND_ASSETS = [
  { name: 'Logo Pack (SVG + PNG)', desc: 'Light, dark, and icon-only variants', icon: <Image className="w-5 h-5 text-amber-500" /> },
  { name: 'Brand Guidelines PDF', desc: 'Colors, typography, usage rules', icon: <FileText className="w-5 h-5 text-amber-500" /> },
  { name: 'Product Screenshots', desc: 'High-res UI screenshots for editorial use', icon: <Image className="w-5 h-5 text-amber-500" /> },
  { name: 'Founder Headshots', desc: 'Press-ready photos of the founding team', icon: <Users className="w-5 h-5 text-amber-500" /> },
];

const COLORS = [
  { name: 'Amber 400', hex: '#FBBF24', usage: 'Primary accent' },
  { name: 'Slate 900', hex: '#0C1830', usage: 'Primary text / dark bg' },
  { name: 'Slate 500', hex: '#64748B', usage: 'Secondary text' },
  { name: 'White',     hex: '#FFFFFF', usage: 'Background / light surfaces' },
];

export default function Press() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <PageHero
        breadcrumbs={[{ label: 'Press' }]}
          eyebrow="Press & Media"
          title="LaudStack Press Kit"
          subtitle="Brand assets, company facts, and press contact in one place."
          accent="amber"
          layout="centered"
          size="md"
        />


        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-16">

          {/* Company boilerplate */}
          <section>
            <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-4">
              <FileText className="w-4 h-4" />
              Company Boilerplate
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-7">
              <h2 className="text-lg font-black text-slate-900 mb-3">About LaudStack</h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                LaudStack is the trusted discovery and review platform for SaaS and AI stacks. Founded in 2024, LaudStack helps professionals — including founders, product managers, engineers, and marketers — discover, compare, and choose the software that powers their work.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Unlike generic software directories, LaudStack combines verified community reviews, a transparent algorithmic ranking system, and an editorial curation layer to surface the products that genuinely perform. Every product on the platform is manually reviewed before listing, and every review is verified against real usage.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                For founders, LaudStack's LaunchPad gives indie and bootstrapped teams a fair shot at visibility alongside enterprise software — ranked on merit, not marketing budget. LaudStack is headquartered remotely, with team members across North America and Europe.
              </p>
              <div className="mt-5 pt-5 border-t border-slate-200">
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
                <div key={asset.name} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center gap-4 hover:border-amber-300 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                    {asset.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 text-sm">{asset.name}</div>
                    <div className="text-slate-500 text-xs">{asset.desc}</div>
                  </div>
                  <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-500 transition-colors flex-shrink-0">
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
              ))}
            </div>

            {/* Brand colors */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-slate-900 mb-4 text-sm">Brand Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {COLORS.map(c => (
                  <div key={c.name}>
                    <div
                      className="w-full h-14 rounded-xl border border-slate-200 mb-2"
                      style={{ background: c.hex }}
                    />
                    <div className="text-xs font-bold text-slate-900">{c.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{c.hex}</div>
                    <div className="text-xs text-slate-500">{c.usage}</div>
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
              {MEDIA_COVERAGE.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
                  <p className="text-sm text-slate-600">No media coverage yet. Press inquiries welcome at the contact below.</p>
                </div>
              ) : (
                MEDIA_COVERAGE.map(item => (
                  <a
                    key={item.headline}
                    href={item.url}
                    className="block bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-amber-300 transition-colors group"
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

          {/* Key facts */}
          <section>
            <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-4">
              <CheckCircle className="w-4 h-4" />
              Key Facts
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { label: 'Founded', value: '2024' },
                  { label: 'Headquarters', value: 'Remote (Global)' },
                  { label: 'Stage', value: 'Seed' },
                  { label: 'Team Size', value: '8 full-time' },
                  { label: 'Stacks Listed', value: '42+ verified' },
                  { label: 'Categories', value: '15 stack categories' },
                  { label: 'Reviews', value: 'All verified' },
                  { label: 'Listing', value: 'Free for founders' },
                ].map(fact => (
                  <div key={fact.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-sm text-slate-600">{fact.label}</span>
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
              <p className="text-slate-600 text-sm mb-5 max-w-sm mx-auto">
                For media enquiries, interview requests, or editorial partnerships, reach out to our communications team.
              </p>
              <a
                href="mailto:press@laudstack.com"
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors"
              >
                <Mail className="w-4 h-4" />
                press@laudstack.com
              </a>
              <p className="text-slate-500 text-xs mt-4">We aim to respond to all press enquiries within 24 hours.</p>
            </div>
          </section>

        </div>
      </div>
      <Footer />
    </div>
  );
}
