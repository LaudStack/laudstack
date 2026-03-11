/*
 * LaudStack Footer — Sitewide
 *
 * Design: Dark slate background (#0F172A), amber accents, 7-column multi-section layout.
 * Sections: Brand+Newsletter | Discover | Community | For Founders | Resources | Company
 */

import { useState } from 'react';
import { Link } from 'wouter';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import {
  Twitter, Linkedin, Github, Mail, ArrowRight,
  Shield, Star, Zap, CheckCircle2,
  Users, Rocket, BookOpen, TrendingUp, Rss,
  ExternalLink,
} from 'lucide-react';

const FOOTER_SECTIONS = [
  {
    heading: 'Discover',
    links: [
      { label: 'Browse All Tools', href: '/tools', live: true },
      { label: 'Trending This Week', href: '/trending', live: true },
      { label: 'Top Rated', href: '/top-rated', live: true },
      { label: 'Fresh Launches', href: '/launches', live: true },
      { label: 'Community Picks', href: '/community-picks', live: true },
      { label: "Editor's Picks", href: '/editors-picks', live: true },
      { label: 'Compare Tools', href: '/compare', live: false },
      { label: 'SaaS Deals', href: '/deals', live: false },
    ],
  },
  {
    heading: 'Community',
    links: [
      { label: 'Leaderboard', href: '/trending', live: true },
      { label: 'Write a Review', href: '/tools', live: true },
      { label: 'Top Reviewers', href: '/community-picks', live: true },
      { label: 'Saved Tools', href: '/saved', live: true },
      { label: 'Newsletter', href: '/newsletter', live: false },
      { label: 'Events', href: '/events', live: false },
    ],
  },
  {
    heading: 'For Founders',
    links: [
      { label: 'LaunchPad', href: '/launchpad', live: true },
      { label: 'Claim Your Tool', href: '/claim', live: true },
      { label: 'Founder Dashboard', href: '/dashboard/founder', live: true },
      { label: 'Pricing', href: '/pricing', live: true },
      { label: 'Affiliate Program', href: '/affiliates', live: true },
      { label: 'Advertise', href: '/advertise', live: false },
      { label: 'Sponsored Listings', href: '/advertise', live: false },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Blog', href: '/blog', live: true },
      { label: 'Help Centre / FAQ', href: '/faq', live: true },
      { label: 'Trust Framework', href: '/trust', live: true },
      { label: 'Review Guidelines', href: '/trust', live: true },
      { label: 'Changelog', href: '/changelog', live: true },
      { label: 'Tool Templates', href: '/templates', live: true },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About LaudStack', href: '/about', live: true },
      { label: 'Contact Us', href: '/contact', live: true },
      { label: 'Careers', href: '/careers', live: false },
      { label: 'Press Kit', href: '/press', live: false },
      { label: 'Privacy Policy', href: '/privacy', live: true },
      { label: 'Terms of Service', href: '/terms', live: true },
      { label: 'Cookie Policy', href: '/cookies', live: true },
    ],
  },
];

const TRUST_STATS = [
  { icon: Users, value: '12,000+', label: 'Professionals' },
  { icon: Star, value: '4.9', label: 'Avg Rating' },
  { icon: CheckCircle2, value: '98%', label: 'Verified Reviews' },
  { icon: TrendingUp, value: '100+', label: 'Tools Listed' },
  { icon: Rocket, value: '50+', label: 'New This Month' },
];



export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      if (data.alreadySubscribed) {
        toast.info('You are already subscribed to our newsletter!');
      } else {
        setSubscribed(true);
        toast.success('You\'re subscribed! Check your inbox for a welcome email.');
      }
      setEmail('');
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong. Please try again.');
    },
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    subscribeMutation.mutate({ email: trimmed, source: 'footer' });
  };

  return (
    <footer style={{ background: '#0F172A', color: '#94A3B8', borderTop: '1px solid #1E293B' }}>

      {/* Stats strip */}
      <div style={{ borderBottom: '1px solid #1E293B' }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10" style={{ paddingTop: 14, paddingBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
            {TRUST_STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon style={{ width: 14, height: 14, color: '#F59E0B', flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0' }}>{value}</span>
                <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10" style={{ paddingTop: 56, paddingBottom: 56 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7" style={{ gap: 40 }}>

          {/* Brand + Newsletter column (2 cols) */}
          <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Link href="/">
              <img
                src="/logo-dark-transparent.png"
                alt="LaudStack"
                style={{ height: 40, width: 'auto', cursor: 'pointer', display: 'block' }}
              />
            </Link>

            <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.7, maxWidth: 280, fontWeight: 500, margin: 0 }}>
              The professional platform for discovering, reviewing, and launching AI &amp; SaaS tools. Built for teams that care about quality.
            </p>

            {/* Social links */}
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { icon: Twitter, label: 'Twitter / X', href: 'https://twitter.com' },
                { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com' },
                { icon: Github, label: 'GitHub', href: 'https://github.com' },
                { icon: Rss, label: 'RSS Feed', href: '/rss' },
                { icon: Mail, label: 'Email', href: '/contact' },
              ].map(({ icon: Icon, label, href }) => (
                href.startsWith('http') ? (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    style={{
                      width: 36, height: 36, borderRadius: 9,
                      background: '#1E293B', border: '1px solid #334155',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s', color: '#64748B', textDecoration: 'none',
                    }}
                    onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = '#293548'; a.style.borderColor = 'rgba(245,158,11,0.4)'; a.style.color = '#F59E0B'; }}
                    onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = '#1E293B'; a.style.borderColor = '#334155'; a.style.color = '#64748B'; }}
                  >
                    <Icon style={{ width: 15, height: 15 }} />
                  </a>
                ) : (
                  <Link key={label} href={href}>
                    <div
                      aria-label={label}
                      style={{
                        width: 36, height: 36, borderRadius: 9,
                        background: '#1E293B', border: '1px solid #334155',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s', color: '#64748B', cursor: 'pointer',
                      }}
                      onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.background = '#293548'; d.style.borderColor = 'rgba(245,158,11,0.4)'; d.style.color = '#F59E0B'; }}
                      onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.background = '#1E293B'; d.style.borderColor = '#334155'; d.style.color = '#64748B'; }}
                    >
                      <Icon style={{ width: 15, height: 15 }} />
                    </div>
                  </Link>
                )
              ))}
            </div>

            {/* Newsletter */}
            <div style={{ padding: '18px', background: '#1E293B', border: '1px solid #334155', borderRadius: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                <Zap style={{ width: 13, height: 13, color: '#F59E0B' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#CBD5E1', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Weekly Tool Digest
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 12px', lineHeight: 1.5 }}>
                Top tools, trending picks, and founder stories — every Monday.
              </p>
              {subscribed ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 700, color: '#4ADE80' }}>
                  <CheckCircle2 style={{ width: 15, height: 15 }} />
                  You're subscribed!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    style={{
                      flex: 1, minWidth: 0, background: '#0F172A', border: '1px solid #334155',
                      color: '#E2E8F0', fontSize: 13, padding: '8px 12px', borderRadius: 8,
                      outline: 'none', transition: 'border-color 0.15s',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#F59E0B')}
                    onBlur={e => (e.target.style.borderColor = '#334155')}
                  />
                  <button
                    type="submit"
                    disabled={subscribeMutation.isPending}
                    style={{
                      flexShrink: 0, background: '#F59E0B', border: 'none', borderRadius: 8,
                      padding: '8px 12px', cursor: subscribeMutation.isPending ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', transition: 'opacity 0.15s',
                      opacity: subscribeMutation.isPending ? 0.6 : 1,
                    }}
                    aria-label="Subscribe"
                  >
                    <ArrowRight style={{ width: 15, height: 15, color: '#0F172A' }} />
                  </button>
                </form>
              )}
              <p style={{ fontSize: 11, color: '#475569', marginTop: 8, marginBottom: 0 }}>No spam. Unsubscribe anytime.</p>
            </div>
          </div>

          {/* Link columns (5 cols) */}
          {FOOTER_SECTIONS.map(section => (
            <div key={section.heading} className="lg:col-span-1">
              <h4 style={{ fontSize: 11, fontWeight: 800, color: '#E2E8F0', letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 18, marginTop: 0 }}>
                {section.heading}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {section.links.map(({ label, href, live }) => (
                  <li key={label}>
                    {live ? (
                      <Link href={href}>
                        <span
                          style={{ fontSize: 13, fontWeight: 500, color: '#64748B', cursor: 'pointer', transition: 'color 0.14s', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#F59E0B')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}
                        >
                          {label}
                          {href.startsWith('http') && <ExternalLink style={{ width: 10, height: 10, opacity: 0.5 }} />}
                        </span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => toast.info(`${label} — coming soon!`)}
                        style={{
                          background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                          fontSize: 13, fontWeight: 500, color: '#475569', textAlign: 'left',
                          fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6,
                          transition: 'color 0.14s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#64748B')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
                      >
                        {label}
                        <span style={{
                          fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4,
                          background: '#1E293B', color: '#475569', border: '1px solid #334155',
                          letterSpacing: '0.04em', textTransform: 'uppercase',
                        }}>
                          Soon
                        </span>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Trust badges divider */}
      <div style={{ borderTop: '1px solid #1E293B' }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10" style={{ paddingTop: 18, paddingBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              {[
                { icon: Shield, text: 'Verified Reviews' },
                { icon: BookOpen, text: 'Editorial Standards' },
                { icon: CheckCircle2, text: 'No Paid Rankings' },
                { icon: Star, text: 'Community Driven' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569', fontWeight: 600 }}>
                  <Icon style={{ width: 13, height: 13, color: '#F59E0B' }} />
                  {text}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#334155' }}>
              <span>🇺🇸 San Francisco, CA</span>
              <span style={{ color: '#1E293B', margin: '0 2px' }}>·</span>
              <span>Built for founders, by founders</span>
              <span style={{ color: '#F59E0B', fontSize: 14, marginLeft: 4 }}>✦</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid #1E293B', background: '#0A1120' }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10" style={{ paddingTop: 16, paddingBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <p style={{ fontSize: 13, color: '#334155', fontWeight: 500, margin: 0 }}>
            © {new Date().getFullYear()} LaudStack, Inc. All rights reserved.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
            {[
              { label: 'Privacy', href: '/privacy' },
              { label: 'Terms', href: '/terms' },
              { label: 'Cookies', href: '/cookies' },
              { label: 'Sitemap', href: '/sitemap' },
            ].map(({ label, href }, i) => (
              <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {i > 0 && <span style={{ color: '#1E293B', padding: '0 4px' }}>·</span>}
                <Link href={href}>
                  <span
                    style={{ fontSize: 12, color: '#334155', cursor: 'pointer', transition: 'color 0.14s', fontWeight: 500 }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#64748B')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#334155')}
                  >
                    {label}
                  </span>
                </Link>
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
