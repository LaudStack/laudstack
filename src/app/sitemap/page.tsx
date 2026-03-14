"use client";

// LaudStack — Sitemap Page
// Organized sitemap of all platform pages grouped by section

import Link from 'next/link';
import {
  Search, Rocket, Star, TrendingUp, Users, BookOpen,
  Shield, Briefcase, FileText, Globe, ChevronRight
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';

interface SitemapLink {
  label: string;
  href: string;
  desc?: string;
}

interface SitemapSection {
  title: string;
  icon: React.ReactNode;
  links: SitemapLink[];
}

const SECTIONS: SitemapSection[] = [
  {
    title: 'Discover',
    icon: <Search className="w-5 h-5 text-amber-500" />,
    links: [
      { label: 'Browse All Products', href: '/tools', desc: 'Full catalog of 95+ verified SaaS & AI stacks' },
      { label: 'Rising Stacks', href: '/trending', desc: 'Fastest-rising tools ranked by community momentum' },
      { label: 'Top Rated', href: '/top-rated', desc: 'Highest-rated tools by verified community reviews' },
      { label: 'New Launches', href: '/new-launches', desc: 'Recently launched tools from founders' },
      { label: 'SaaS Deals', href: '/deals', desc: 'Exclusive discounts and lifetime deals' },
      { label: 'Compare Products', href: '/compare', desc: 'Side-by-side tool comparison' },
      { label: 'Saved Products', href: '/saved', desc: 'Your personal tool shortlist' },
      { label: 'Search', href: '/search', desc: 'Search across all tools, reviews, and categories' },
    ],
  },
  {
    title: 'Community',
    icon: <Users className="w-5 h-5 text-amber-500" />,
    links: [
      { label: 'Community Picks', href: '/community-picks', desc: 'Tools voted best by the LaudStack community' },
      { label: "Editor's Picks", href: '/editors-picks', desc: 'Hand-curated selections from the LaudStack editorial team' },
      { label: 'All Reviews', href: '/reviews', desc: 'Browse verified reviews across all tools' },
      { label: 'Newsletter', href: '/newsletter', desc: 'Subscribe to the LaudStack Weekly digest' },
      { label: 'Events', href: '/events', desc: 'Webinars, workshops, and community events' },
    ],
  },
  {
    title: 'For Founders',
    icon: <Rocket className="w-5 h-5 text-amber-500" />,
    links: [
      { label: 'LaunchPad', href: '/launchpad', desc: 'Launch your tool and get discovered' },
      { label: 'Claim Your Product', href: '/claim', desc: 'Claim an existing listing and manage your profile' },
      { label: 'Founder Dashboard', href: '/dashboard/founder', desc: 'Analytics, reviews, and listing management' },
      { label: 'Pricing', href: '/pricing', desc: 'LaunchPad plans and featured placement options' },
      { label: 'Advertise', href: '/advertise', desc: 'Reach 12,000+ professionals with sponsored placements' },
      { label: 'Affiliate Program', href: '/affiliates', desc: 'Earn commissions by referring founders to LaudStack' },
    ],
  },
  {
    title: 'Resources',
    icon: <BookOpen className="w-5 h-5 text-amber-500" />,
    links: [
      { label: 'Blog', href: '/blog', desc: 'Insights, guides, and tool roundups' },
      { label: 'Changelog', href: '/changelog', desc: 'What\'s new on LaudStack' },
      { label: 'FAQ', href: '/faq', desc: 'Answers to common questions about the platform' },
      { label: 'Tool Templates', href: '/templates', desc: 'Curated tool stacks for common workflows' },
      { label: 'Trust & Safety', href: '/trust', desc: 'How LaudStack verifies reviews and maintains quality' },
    ],
  },
  {
    title: 'Company',
    icon: <Briefcase className="w-5 h-5 text-amber-500" />,
    links: [
      { label: 'About LaudStack', href: '/about', desc: 'Our story, mission, and team' },
      { label: 'Press Kit', href: '/press', desc: 'Brand assets, media coverage, and press contact' },
      { label: 'Contact Us', href: '/contact', desc: 'Get in touch with the LaudStack team' },
    ],
  },
  {
    title: 'Legal',
    icon: <Shield className="w-5 h-5 text-amber-500" />,
    links: [
      { label: 'Terms of Service', href: '/terms', desc: 'Platform terms and conditions' },
      { label: 'Privacy Policy', href: '/privacy', desc: 'How we collect and use your data' },
      { label: 'Cookie Policy', href: '/cookies', desc: 'Our use of cookies and tracking technologies' },
    ],
  },
];

export default function Sitemap() {
  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <PageHero
          eyebrow="Sitemap"
          title="All pages on LaudStack"
          subtitle="A complete map of every section and page on the platform — organized for easy navigation."
          accent="amber"
          layout="centered"
          size="md"
        />

        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 gap-8">
            {SECTIONS.map(section => (
              <div key={section.title} className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                    {section.icon}
                  </div>
                  <h2 className="text-base font-black text-slate-900">{section.title}</h2>
                </div>
                <ul className="space-y-2">
                  {section.links.map(link => (
                    <li key={link.href}>
                      <Link href={link.href}>
                        <div className="flex items-start gap-2 group cursor-pointer rounded-xl px-3 py-2 hover:bg-amber-50 transition-colors">
                          <ChevronRight className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                          <div>
                            <div className="text-sm font-semibold text-slate-800 group-hover:text-amber-600 transition-colors">
                              {link.label}
                            </div>
                            {link.desc && (
                              <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{link.desc}</div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Last updated */}
          <div className="mt-10 text-center text-xs text-slate-400">
            Sitemap last updated: March 2025 · <a href="/rss" className="text-amber-500 hover:text-amber-400 transition-colors">RSS Feed</a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
