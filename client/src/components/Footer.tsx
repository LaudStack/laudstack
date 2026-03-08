/*
 * LaudStack Footer — "Warm Professional"
 * Dark navy background, amber accents, 4-column layout
 */

import { Link } from 'wouter';
import { toast } from 'sonner';
import { Zap, Twitter, Linkedin, Github, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const FOOTER_LINKS = {
  Platform: [
    { label: 'Discover Tools', href: '/discover' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'Categories', href: '/categories' },
    { label: 'LaunchPad', href: '/launchpad' },
    { label: 'Compare Tools', href: '/compare' },
  ],
  Founders: [
    { label: 'Claim Your Page', href: '/launchpad' },
    { label: 'LaunchPad', href: '/launchpad' },
    { label: 'Founder Dashboard', href: '/dashboard' },
    { label: 'Analytics', href: '/dashboard/analytics' },
    { label: 'Affiliate Program', href: '/affiliates' },
  ],
  Company: [
    { label: 'About LaudStack', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Changelog', href: '/changelog' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Advertise', href: '/advertise' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Review Guidelines', href: '/guidelines' },
  ],
};

export default function Footer() {
  const handleComingSoon = () => toast.info('Feature coming soon!');

  return (
    <footer className="bg-[#0F172A] text-slate-300">
      {/* Main footer grid */}
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/">
              <img src="/logo-dark-transparent.png" alt="LaudStack" className="h-8 w-auto mb-4 opacity-90" />
            </Link>
            <p className="text-slate-300 text-sm leading-relaxed mb-6 max-w-xs font-medium">
              The trusted community platform where founders launch their AI and SaaS tools, users discover the best software, and the community curates quality.
            </p>

            {/* Newsletter */}
            <div>
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                Weekly Tool Digest
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="your@email.com"
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 h-9 text-sm"
                />
                <Button
                  size="sm"
                  onClick={handleComingSoon}
                  className="border-0 shrink-0"
                  style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)', color: 'white' }}
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Social links */}
            <div className="flex gap-3 mt-6">
              {[
                { icon: Twitter, label: 'Twitter' },
                { icon: Linkedin, label: 'LinkedIn' },
                { icon: Github, label: 'GitHub' },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  onClick={handleComingSoon}
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4 text-slate-300" />
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-white font-semibold text-sm mb-4">{heading}</h4>
              <ul className="space-y-3">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      onClick={handleComingSoon}
                      className="text-slate-300 hover:text-amber-400 text-sm font-medium transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-sm font-medium">
            © {new Date().getFullYear()} LaudStack. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-slate-400 text-sm font-medium">
            <span>Built for founders, by founders.</span>
            <span className="text-amber-500 ml-1">✦</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
