"use client";

/*
 * LaudStack Footer — Mobile-optimized with grid layout
 * Dark theme (#0F172A) — responsive grid for menu items
 */

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import {
  Twitter, Linkedin, Github, Mail, ArrowRight,
  Zap, CheckCircle2, Rss,
} from "lucide-react";

const FOOTER_SECTIONS = [
  {
    heading: "Discover",
    links: [
      { label: "All Stacks", href: "/tools" },
      { label: "Trending This Week", href: "/trending" },
      { label: "Top Rated", href: "/top-rated" },
      { label: "Fresh Launches", href: "/new-launches" },
      { label: "Community Picks", href: "/community-picks" },
      { label: "SaaS Deals", href: "/deals" },
    ],
  },
  {
    heading: "Community",
    links: [
      { label: "Leaderboard", href: "/trending" },
      { label: "Write a Review", href: "/tools" },
      { label: "Top Reviewers", href: "/community-picks" },
      { label: "Saved Products", href: "/saved" },
      { label: "Newsletter", href: "/newsletter" },
    ],
  },
  {
    heading: "For Founders",
    links: [
      { label: "LaunchPad", href: "/launchpad" },
      { label: "Claim Your Product", href: "/claim" },
      { label: "Founder Dashboard", href: "/dashboard/founder" },
      { label: "Pricing", href: "/pricing" },
      { label: "Success Stories", href: "/blog" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Help Centre / FAQ", href: "/faq" },
      { label: "Trust Framework", href: "/trust" },
      { label: "Changelog", href: "/changelog" },
      { label: "Templates", href: "/templates" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About LaudStack", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Careers", href: "/careers" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

const SOCIAL_LINKS = [
  { icon: Twitter, label: "Twitter / X", href: "https://twitter.com" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
  { icon: Github, label: "GitHub", href: "https://github.com" },
  { icon: Rss, label: "RSS Feed", href: "/rss" },
  { icon: Mail, label: "Email", href: "/contact" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      if (data.alreadySubscribed) {
        toast.info("You are already subscribed to our newsletter!");
      } else {
        setSubscribed(true);
        toast.success("You're subscribed! Check your inbox for a welcome email.");
      }
      setEmail("");
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong. Please try again.");
    },
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    subscribeMutation.mutate({ email: trimmed, source: "footer" });
  };

  return (
    <footer style={{ background: "#0F172A", color: "#94A3B8", borderTop: "1px solid #1E293B" }}>

      {/* Main content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-10 lg:gap-8">

          {/* Brand + Newsletter column */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <Link href="/">
              <img
                src="/logo-dark-transparent.png"
                alt="LaudStack"
                className="h-9 sm:h-10 w-auto block"
                onError={(e) => {
                  const t = e.currentTarget;
                  t.style.display = "none";
                  const p = t.parentElement;
                  if (p) {
                    p.innerHTML = '<span style="font-size:22px;font-weight:900;color:#F59E0B;letter-spacing:-0.03em;font-family:Inter,sans-serif">LaudStack</span>';
                  }
                }}
              />
            </Link>

            <p className="text-[13px] text-slate-500 leading-relaxed max-w-[280px] font-medium">
              The professional platform for discovering, reviewing, and launching SaaS &amp; AI stacks. Built for teams that care about quality.
            </p>

            {/* Social links */}
            <div className="flex gap-2">
              {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => {
                const isExternal = href.startsWith("http");
                const Comp = isExternal ? "a" : Link;
                const extraProps = isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};
                return (
                  <Comp
                    key={label}
                    href={href}
                    aria-label={label}
                    {...extraProps}
                    className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-700 hover:border-amber-500/40 hover:text-amber-500 transition-all"
                  >
                    <Icon className="w-[15px] h-[15px]" />
                  </Comp>
                );
              })}
            </div>

            {/* Newsletter */}
            <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl">
              <div className="flex items-center gap-1.5 mb-2">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Weekly Tool Digest</span>
              </div>
              <p className="text-xs text-slate-500 mb-3 leading-snug">
                Top products, trending picks, and founder stories — every Monday.
              </p>
              {subscribed ? (
                <div className="flex items-center gap-1.5 text-[13px] font-bold text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  You&apos;re subscribed!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 min-w-0 bg-slate-900 border border-slate-700 text-slate-200 text-[13px] px-3 py-2 rounded-lg outline-none focus:border-amber-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={subscribeMutation.isPending}
                    className="shrink-0 bg-amber-500 rounded-lg px-3 py-2 flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                    aria-label="Subscribe"
                  >
                    <ArrowRight className="w-4 h-4 text-slate-900" />
                  </button>
                </form>
              )}
              <p className="text-[11px] text-slate-600 mt-2">No spam. Unsubscribe anytime.</p>
            </div>
          </div>

          {/* Link columns — 2-col grid on mobile, 5-col on desktop */}
          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-6">
            {FOOTER_SECTIONS.map((section) => (
              <div key={section.heading} className="flex flex-col gap-3">
                <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-widest">
                  {section.heading}
                </h4>
                <ul className="list-none m-0 p-0 flex flex-col gap-2">
                  {section.links.map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-[13px] text-slate-500 no-underline font-medium hover:text-slate-300 transition-colors"
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
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-600 m-0">
              &copy; {new Date().getFullYear()} LaudStack. All rights reserved.
            </p>
            <div className="flex gap-4 sm:gap-5 flex-wrap justify-center">
              {[
                { label: "Privacy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
                { label: "Cookies", href: "/cookies" },
                { label: "Sitemap", href: "/sitemap.xml" },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-xs text-slate-600 no-underline hover:text-slate-400 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
