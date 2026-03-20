"use client";

/*
 * LaudStack Footer — Restructured three-tier layout
 * Tier 1: Logo + social + newsletter + 4 primary menu columns
 * Tier 2: 6 SEO-driven discovery columns (categories, best-for, comparisons, alternatives, launches, founder resources)
 * Bottom bar: copyright + legal links
 *
 * Design: Dark navy (#0C1830) with high-contrast text for legibility
 */

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import LogoWithFallback from "@/components/LogoWithFallback";
import {
  Linkedin, Facebook, Instagram, Mail, ArrowRight,
  Zap, CheckCircle2, MessageCircle,
} from "lucide-react";

/* ─── Tier 1: Primary Navigation — 4 columns ────────────────────────────────── */

const PRIMARY_SECTIONS = [
  {
    heading: "Discover",
    links: [
      { label: "Browse Categories", href: "/categories" },
      { label: "Rising Stacks", href: "/trending" },
      { label: "Top Rated", href: "/top-rated" },
      { label: "Most Lauded", href: "/most-lauded" },
      { label: "Deals", href: "/deals" },
      { label: "Marketplace", href: "/marketplace" },
    ],
  },
  {
    heading: "For Founders",
    links: [
      { label: "LaunchPad", href: "/launchpad" },
      { label: "Launch Guide", href: "/resources/launch-guide" },
      { label: "Listing Optimization", href: "/resources/listing-optimization" },
      { label: "Grow Visibility", href: "/resources/grow-visibility" },
      { label: "Advertise", href: "/advertise" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Help Centre / FAQ", href: "/faq" },
      { label: "Trust Framework", href: "/trust" },
      { label: "Changelog", href: "/changelog" },
      { label: "Newsletter", href: "/newsletter" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About LaudStack", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

/* ─── Tier 2: SEO Discovery Sections — 6 columns ────────────────────────────── */

const SEO_SECTIONS = [
  {
    heading: "Top Categories",
    links: [
      { label: "AI Productivity", href: "/c/ai-productivity-tools" },
      { label: "AI Writing", href: "/c/ai-writing-tools" },
      { label: "AI Code", href: "/c/ai-code-tools" },
      { label: "Project Management", href: "/c/project-management-tools" },
      { label: "CRM", href: "/c/crm-tools" },
      { label: "Marketing", href: "/c/marketing-tools" },
      { label: "Developer Tools", href: "/c/developer-tools" },
      { label: "See All Categories", href: "/categories" },
    ],
  },
  {
    heading: "Best SaaS Tools",
    links: [
      { label: "Best for Startups", href: "/best/saas-tools-for-startups" },
      { label: "Best CRM Tools", href: "/best/crm-tools" },
      { label: "Best for Marketing", href: "/best/ai-tools-for-marketing" },
      { label: "Best for Project Mgmt", href: "/best/project-management-tools" },
      { label: "Best for Support", href: "/best/ai-tools-for-customer-support" },
      { label: "Best for E-commerce", href: "/best/ai-tools-for-ecommerce" },
      { label: "See All Collections", href: "/best" },
    ],
  },
  {
    heading: "Best AI Tools",
    links: [
      { label: "Best AI for Writing", href: "/best/ai-tools-for-writing" },
      { label: "Best AI for Coding", href: "/best/ai-tools-for-coding" },
      { label: "Best AI for Design", href: "/best/ai-tools-for-design" },
      { label: "Best AI for Analytics", href: "/best/ai-tools-for-analytics" },
      { label: "Best AI for Sales", href: "/best/ai-tools-for-sales" },
      { label: "Best AI for Support", href: "/best/ai-tools-for-customer-support" },
      { label: "Best AI for Finance", href: "/best/ai-tools-for-finance" },
    ],
  },
  {
    heading: "Compare & Explore",
    links: [
      { label: "Popular Comparisons", href: "/comparisons" },
      { label: "Alternatives Finder", href: "/alternatives" },
      { label: "Stack Finder Quiz", href: "/stack-finder" },
      { label: "Rising SaaS & AI", href: "/trending-ai-tools" },
      { label: "Top Rated Stacks", href: "/top-rated-ai-tools" },
      { label: "Most Popular SaaS", href: "/most-popular-saas-tools" },
    ],
  },
  {
    heading: "Launches",
    links: [
      { label: "Today's Launches", href: "/launches" },
      { label: "Recently Launched", href: "/recently-added" },
      { label: "Upcoming Launches", href: "/upcoming-launches" },
      { label: "Spotlight Picks", href: "/editors-picks" },
      { label: "Launch Archive", href: "/launch-archive" },
      { label: "Community Voting", href: "/community-voting" },
    ],
  },
  {
    heading: "Community",
    links: [
      { label: "Reviews", href: "/reviews" },
      { label: "Discussions", href: "/discussions" },
      { label: "Events", href: "/events" },
      { label: "Community Picks", href: "/community-picks" },
      { label: "Affiliates", href: "/affiliates" },
    ],
  },
];

/* Custom X (Twitter) icon — lucide doesn't have the new X logo */
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/* Custom Reddit icon */
function RedditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { icon: XIcon, label: "X (Twitter)", href: "https://x.com/laudstack" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/company/laudstack" },
  { icon: Facebook, label: "Facebook", href: "https://facebook.com/laudstack" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com/laudstack" },
  { icon: RedditIcon, label: "Reddit", href: "https://reddit.com/r/laudstack" },
  { icon: MessageCircle, label: "Contact", href: "/contact" },
];

/* ─── Reusable link column renderer ───────────────────────────────────────── */

function LinkColumn({ heading, links }: { heading: string; links: { label: string; href: string }[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-[13px] font-extrabold text-white uppercase tracking-wider mb-1">
        {heading}
      </h4>
      <ul className="list-none m-0 p-0 flex flex-col gap-[10px]">
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="text-[13px] text-slate-300 no-underline font-medium hover:text-amber-400 transition-colors leading-tight"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Footer Component ────────────────────────────────────────────────────── */

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
    <footer className="bg-[#0C1830] text-slate-300 border-t border-slate-700/60">

      {/* ═══════════════════════════════════════════════════════
          TIER 1 — Logo + Social + Newsletter + 4 Primary Columns
      ═══════════════════════════════════════════════════════ */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-8 sm:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">

          {/* Brand + Newsletter column — spans 3 of 12 */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            <Link href="/">
              <LogoWithFallback
                src="/logo-dark-transparent.png"
                alt="LaudStack"
                className="h-9 sm:h-10 w-auto block"
                fallbackElement={
                  <span className="text-[22px] font-black text-amber-500 tracking-tight font-[Inter,sans-serif]">LaudStack</span>
                }
              />
            </Link>

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
                    className="w-9 h-9 rounded-lg bg-slate-800/80 border border-slate-600/60 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:border-amber-500/50 hover:text-amber-400 transition-all"
                  >
                    <Icon className="w-[15px] h-[15px]" />
                  </Comp>
                );
              })}
            </div>

            {/* Newsletter */}
            <div className="p-4 bg-slate-800/50 border border-slate-600/50 rounded-xl">
              <div className="flex items-center gap-1.5 mb-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[12px] font-extrabold text-white uppercase tracking-wider">Weekly Digest</span>
              </div>
              <p className="text-[13px] text-slate-200 mb-3 leading-snug">
                Top stacks, rising picks, and founder stories — every Monday.
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
                    className="flex-1 min-w-0 bg-slate-900/80 border border-slate-600 text-slate-200 text-[13px] px-3 py-2 rounded-lg outline-none placeholder:text-slate-400 focus:border-amber-500 transition-colors"
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
              <p className="text-xs text-slate-400 mt-2">No spam. Unsubscribe anytime.</p>
            </div>
          </div>

          {/* 4 Primary Link columns — spans 9 of 12 */}
          <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 lg:pl-6">
            {PRIMARY_SECTIONS.map((section) => (
              <LinkColumn key={section.heading} heading={section.heading} links={section.links} />
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          TIER 2 — SEO Discovery Sections (6 columns)
      ═══════════════════════════════════════════════════════ */}
      <div className="border-t border-slate-700/50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8 lg:gap-8">
            {SEO_SECTIONS.map((section) => (
              <LinkColumn key={section.heading} heading={section.heading} links={section.links} />
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          BOTTOM BAR — Copyright + Legal
      ═══════════════════════════════════════════════════════ */}
      <div className="border-t border-slate-700/50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-400 m-0">
              &copy; {new Date().getFullYear()} LaudStack. All rights reserved.
            </p>
            <div className="flex gap-5 flex-wrap justify-center">
              {[
                { label: "Privacy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
                { label: "Cookies", href: "/cookies" },
                { label: "Sitemap", href: "/sitemap.xml" },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-xs text-slate-400 no-underline hover:text-amber-400 transition-colors"
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
