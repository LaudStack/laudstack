/*
 * LaudStack Footer — Sitewide
 * Design: Dark slate background, amber accents, 4-column layout
 * All links point to real routes; coming-soon items show toast
 */

import { useState } from 'react';
import { Link } from 'wouter';
import { toast } from 'sonner';
import {
  Twitter, Linkedin, Github, Mail, ArrowRight,
  Shield, Zap, Star, BookOpen
} from 'lucide-react';

const FOOTER_LINKS = {
  Discover: [
    { label: 'Browse All Tools', href: '/', live: true },
    { label: 'Categories', href: '/categories', live: true },
    { label: 'Launches & Leaderboard', href: '/launches', live: true },
    { label: 'Compare Tools', href: '/compare', live: true },
    { label: 'SaaS Deals', href: '/deals', live: true },
    { label: 'Templates', href: '/templates', live: true },
  ],
  Founders: [
    { label: 'Submit Your Tool', href: '/launchpad', live: true },
    { label: 'Claim Your Tool', href: '/claim', live: true },
    { label: 'Founder Dashboard', href: '/dashboard/founder', live: true },
    { label: 'Pricing', href: '/pricing', live: true },
    { label: 'Affiliate Program', href: '/affiliates', live: true },
  ],
  Company: [
    { label: 'About LaudStack', href: '/about', live: true },
    { label: 'Trust Framework', href: '/trust', live: true },
    { label: 'Contact Us', href: '/contact', live: true },
    { label: 'Blog', href: '/blog', live: true },
    { label: 'Changelog', href: '/changelog', live: true },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy', live: true },
    { label: 'Terms of Service', href: '/terms', live: true },
    { label: 'Cookie Policy', href: '/cookies', live: true },
    { label: 'Review Guidelines', href: '/trust', live: true },
  ],
};

const TRUST_BADGES = [
  { icon: Shield, text: 'Verified Reviews' },
  { icon: Star, text: '4.7 Avg Rating' },
  { icon: Zap, text: '100+ Tools Listed' },
  { icon: BookOpen, text: 'Editorial Standards' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setSubscribed(true);
    toast.success('You\'re subscribed! Expect your first digest next Monday.');
  };

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800">

      {/* ── Trust badges strip ── */}
      <div className="border-b border-slate-800">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-4">
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {TRUST_BADGES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                <Icon className="w-3.5 h-3.5 text-amber-500/70" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/">
              <img
                src="/logo-dark-transparent.png"
                alt="LaudStack"
                className="h-10 w-auto cursor-pointer"
              />
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mt-3 mb-6 max-w-xs font-medium">
              The trusted community platform where founders launch their AI and SaaS tools, users discover the best software, and the community curates quality.
            </p>

            {/* Newsletter */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Weekly Tool Digest
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 text-green-500 text-sm font-semibold">
                  <span className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center text-xs">✓</span>
                  You're subscribed!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 min-w-0 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
                  />
                  <button
                    type="submit"
                    className="flex-shrink-0 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold p-2 rounded-lg transition-colors"
                    aria-label="Subscribe"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
              <p className="text-slate-500 text-xs mt-2">No spam. Unsubscribe anytime.</p>
            </div>

            {/* Social links */}
            <div className="flex gap-2.5 mt-6">
              {[
                { icon: Twitter, label: 'Twitter / X', href: 'https://twitter.com' },
                { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com' },
                { icon: Github, label: 'GitHub', href: 'https://github.com' },
                { icon: Mail, label: 'Email', href: '/contact' },
              ].map(({ icon: Icon, label, href }) => (
                href.startsWith('http') ? (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500/40 flex items-center justify-center transition-all group"
                    aria-label={label}
                  >
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
                  </a>
                ) : (
                  <Link key={label} href={href}>
                    <div
                      className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500/40 flex items-center justify-center transition-all group cursor-pointer"
                      aria-label={label}
                    >
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
                    </div>
                  </Link>
                )
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-slate-200 font-bold text-sm mb-4 tracking-wide">{heading}</h4>
              <ul className="space-y-2.5">
                {links.map(({ label, href, live }) => (
                  <li key={label}>
                    {live ? (
                      <Link href={href}>
                        <span className="text-slate-400 hover:text-amber-400 text-sm font-medium transition-colors cursor-pointer leading-relaxed">
                          {label}
                        </span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => toast.info(`${label} — coming soon!`)}
                        className="text-slate-500 hover:text-slate-400 text-sm font-medium transition-colors text-left leading-relaxed"
                      >
                        {label}
                        <span className="ml-1.5 text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-1 py-0.5 rounded font-semibold align-middle">Soon</span>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-slate-800 bg-slate-900">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-400 text-sm font-medium">
            © {new Date().getFullYear()} LaudStack, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy"><span className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">Privacy</span></Link>
            <span className="text-slate-700">·</span>
            <Link href="/terms"><span className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">Terms</span></Link>
            <span className="text-slate-700">·</span>
            <Link href="/cookies"><span className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">Cookies</span></Link>
            <span className="text-slate-700 hidden sm:block">·</span>
            <span className="hidden sm:flex items-center gap-1 text-slate-500 text-xs font-medium">
              Built for founders, by founders
              <span className="text-amber-500">✦</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
