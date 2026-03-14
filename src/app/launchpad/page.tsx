"use client";
export const dynamic = "force-dynamic";

/*
 * LaunchPad — LaudStack
 *
 * Enterprise-grade landing page for founders.
 * Design: Clean white, professional, no gradients, amber accent.
 * Light theme, consistent with platform design language.
 *
 * Enhancements:
 *   - Real SVG brand logos in Trusted By section
 *   - Micro-interactions (hover scale, shadow lift, scroll fade-in)
 *   - Recently Launched showcase strip (real DB data)
 *   - Mobile-friendly comparison table (stacked cards on small screens)
 *   - FAQ structured data JSON-LD
 *   - Headline A/B test analytics tracking
 */

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Rocket, Shield, BarChart3, MessageSquare, Crown,
  Star, CheckCircle2, ArrowRight, ChevronDown,
  ChevronUp, BadgeCheck, TrendingUp, Clock,
  Building2, Target, Megaphone,
  HeartHandshake, Lock, Check, Minus, ExternalLink,
  ThumbsUp
} from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { fetchRecentlyLaunched } from "@/app/actions/seo-fetchers";
import type { Tool } from "@/lib/types";

// ─── A/B Headline Test ──────────────────────────────────────────────────────

const HEADLINES = [
  { id: "a", text: "Get your stack in front of", highlight: "the right audience." },
  { id: "b", text: "Launch where professionals", highlight: "discover tools." },
];

function getHeadlineVariant(): typeof HEADLINES[0] {
  if (typeof window === "undefined") return HEADLINES[0];
  const stored = sessionStorage.getItem("lp_headline_variant");
  if (stored === "a" || stored === "b") {
    return HEADLINES.find((h) => h.id === stored) ?? HEADLINES[0];
  }
  const variant = Math.random() < 0.5 ? HEADLINES[0] : HEADLINES[1];
  sessionStorage.setItem("lp_headline_variant", variant.id);
  return variant;
}

function trackHeadlineView(variantId: string) {
  // Fire-and-forget analytics event
  if (typeof window !== "undefined" && typeof navigator.sendBeacon === "function") {
    try {
      navigator.sendBeacon(
        "/api/analytics/event",
        JSON.stringify({ event: "launchpad_headline_view", variant: variantId, ts: Date.now() })
      );
    } catch {
      // silently fail
    }
  }
}

function trackHeadlineCTA(variantId: string, cta: string) {
  if (typeof window !== "undefined" && typeof navigator.sendBeacon === "function") {
    try {
      navigator.sendBeacon(
        "/api/analytics/event",
        JSON.stringify({ event: "launchpad_cta_click", variant: variantId, cta, ts: Date.now() })
      );
    } catch {
      // silently fail
    }
  }
}

// ─── Scroll fade-in hook ────────────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    step: 1,
    icon: Building2,
    title: "Submit Your Stack",
    desc: "Create a free account and submit your SaaS or AI tool. Add your description, screenshots, pricing, and category. Takes under 5 minutes.",
    detail: "No credit card required",
  },
  {
    step: 2,
    icon: Shield,
    title: "Get Verified",
    desc: "Prove ownership via DNS record, HTML meta tag, or domain email. Our team reviews and verifies within 24 hours.",
    detail: "Verified badge on your listing",
  },
  {
    step: 3,
    icon: Crown,
    title: "Grow & Engage",
    desc: "Access your Founder Dashboard to reply to reviews, track analytics, run deals, and manage your listing. Your audience finds you.",
    detail: "Full analytics & engagement tools",
  },
];

const COMPARISON_FEATURES = [
  { feature: "Listed in directory", free: true, verified: true },
  { feature: "Appear in search results", free: true, verified: true },
  { feature: "Collect user reviews", free: true, verified: true },
  { feature: "Basic listing page", free: true, verified: true },
  { feature: "Verified founder badge", free: false, verified: true },
  { feature: "Reply to reviews", free: false, verified: true },
  { feature: "Founder Dashboard", free: false, verified: true },
  { feature: "Analytics & insights", free: false, verified: true },
  { feature: "Run deals & promotions", free: false, verified: true },
  { feature: "Eligible for Spotlight picks", free: false, verified: true },
  { feature: "Rising placement boost", free: false, verified: true },
  { feature: "Priority support", free: false, verified: true },
];

const BENEFITS = [
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Track page views, click-throughs, review sentiment, laud trends, and conversion data. Understand exactly how your listing performs.",
  },
  {
    icon: MessageSquare,
    title: "Review Management",
    desc: "Reply to reviews directly. Thank supporters, address concerns, and show prospects you actively listen to feedback.",
  },
  {
    icon: TrendingUp,
    title: "Rising Placement",
    desc: "Verified stacks are eligible for weekly rising spots, Spotlight picks, and category leaderboard features.",
  },
  {
    icon: Target,
    title: "Targeted Discovery",
    desc: "Reach professionals actively searching for tools in your category. Zero cold outreach — they come to you.",
  },
  {
    icon: Megaphone,
    title: "Deals & Promotions",
    desc: "Run exclusive deals for LaudStack users. Drive conversions and build a loyal early-adopter community around your stack.",
  },
  {
    icon: HeartHandshake,
    title: "Community Trust",
    desc: "A verified founder badge signals legitimacy. Users trust stacks with active, responsive founders behind them.",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Founder, Writr.ai",
    initials: "SC",
    color: "#F59E0B",
    quote: "LaudStack drove 400 signups in our first month. The verified badge alone increased our trial conversion by 28%. Best ROI from any discovery platform.",
    metric: "+400 signups in month 1",
  },
  {
    name: "Marcus Webb",
    role: "CEO, Stackly",
    initials: "MW",
    color: "#2563EB",
    quote: "The analytics dashboard is genuinely useful. I can see which reviews drive clicks, which categories convert, and where to focus messaging.",
    metric: "3× click-through rate",
  },
  {
    name: "Priya Nair",
    role: "Co-founder, Loopkit",
    initials: "PN",
    color: "#059669",
    quote: "We claimed our listing in 20 minutes. Within a week we had 12 new reviews and jumped from page 3 to top 10 in our category.",
    metric: "Top 10 in 7 days",
  },
];

const FAQ_ITEMS = [
  {
    q: "Is it free to list my stack on LaudStack?",
    a: "Yes. Creating a listing is completely free — no credit card required. Your stack appears in search results and can collect reviews at no cost. Verification is also free.",
  },
  {
    q: "How does founder verification work?",
    a: "You can verify ownership by adding a DNS TXT record, placing an HTML meta tag on your site, or emailing us from your domain. Our team reviews and approves within 24 hours.",
  },
  {
    q: "What happens after I'm verified?",
    a: "You unlock the full Founder Dashboard: reply to reviews, manage deals, track analytics, run promotions, and access priority support. Your listing also gets a verified badge.",
  },
  {
    q: "Can I claim a stack that's already listed?",
    a: "Absolutely. If your stack is already on LaudStack, click 'Claim Existing Listing' and complete the verification process to take ownership.",
  },
  {
    q: "How long does it take to get listed?",
    a: "New stack submissions are reviewed within 48 hours. Verified founders get priority review and typically go live within 24 hours.",
  },
  {
    q: "Do I need to be the founder to claim a listing?",
    a: "You need to prove ownership of the domain associated with the stack. This can be a founder, co-founder, or an authorized team member with domain access.",
  },
  {
    q: "What types of tools can be listed?",
    a: "LaudStack is for SaaS products and AI tools. If your stack is a software product used by professionals or businesses, it belongs here — regardless of stage or size.",
  },
];

// ─── SVG Brand Logos ────────────────────────────────────────────────────────

function NotionLogo() {
  return (
    <svg width="90" height="24" viewBox="0 0 90 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.3 2.4C4.6 3.4 5.1 3.3 7.2 3.2L19.5 2.4C19.8 2.4 19.5 2.1 19.4 2.1L17.5 0.7C17 0.3 16.3 0 15.5 0.1L3.7 0.9C3.1 1 3 1.3 3.3 1.5V2.4ZM4.7 5.9V21.3C4.7 22.1 5.1 22.4 6 22.3L19.7 21.5C20.6 21.4 20.7 20.9 20.7 20.2V5C20.7 4.3 20.4 3.9 19.8 4L5.7 4.8C5 4.9 4.7 5.2 4.7 5.9ZM18.5 6.3C18.6 6.7 18.5 7.1 18.1 7.1L17.5 7.2V19.6C17 19.9 16.5 20 16.1 20C15.4 20 15.2 19.8 14.7 19.2L10.2 12.3V18.9L11.5 19.2C11.5 19.2 11.5 20 10.5 20L7.6 20.2C7.5 20 7.6 19.5 7.9 19.4L8.7 19.2V10.5L7.6 10.4C7.5 10 7.7 9.4 8.3 9.4L11.4 9.2L16 16.2V10.1L14.9 10C14.8 9.5 15.2 9.1 15.7 9.1L18.5 6.3ZM1.5 0.2L13.9 -0.7C16.3 -0.9 16.9 -0.8 18.4 0.3L22 2.8C23 3.5 23.3 3.7 23.3 4.5V21.3C23.3 22.7 22.8 23.5 21 23.6L6.2 24.5C4.8 24.6 4.2 24.4 3.4 23.4L0.8 20.1C0 19 -0.3 18.2 -0.3 17.2V3C-0.3 1.7 0.3 0.4 1.5 0.2Z" fill="currentColor"/>
      <path d="M30.2 7.5H33.8L38.5 16.2V7.5H41.8V20H38.4L33.5 11V20H30.2V7.5Z" fill="currentColor"/>
      <path d="M49.5 20.3C46.5 20.3 44.5 18.1 44.5 15.2C44.5 12.3 46.5 10.1 49.5 10.1C52.5 10.1 54.5 12.3 54.5 15.2C54.5 18.1 52.5 20.3 49.5 20.3ZM49.5 12.5C48.1 12.5 47.3 13.6 47.3 15.2C47.3 16.8 48.1 17.9 49.5 17.9C50.9 17.9 51.7 16.8 51.7 15.2C51.7 13.6 50.9 12.5 49.5 12.5Z" fill="currentColor"/>
      <path d="M60.1 12.8V17.2C60.1 17.9 60.5 18.1 61.1 18.1C61.5 18.1 61.9 18 62.2 17.8L62.8 19.8C62.1 20.2 61.2 20.3 60.3 20.3C58.3 20.3 57.4 19.2 57.4 17.3V12.8H56V10.4H57.4V7.5H60.1V10.4H62.3V12.8H60.1Z" fill="currentColor"/>
      <path d="M64.2 7.5H66.9V9.5H64.2V7.5ZM64.2 10.4H66.9V20H64.2V10.4Z" fill="currentColor"/>
      <path d="M74 20.3C71 20.3 69 18.1 69 15.2C69 12.3 71 10.1 74 10.1C77 10.1 79 12.3 79 15.2C79 18.1 77 20.3 74 20.3ZM74 12.5C72.6 12.5 71.8 13.6 71.8 15.2C71.8 16.8 72.6 17.9 74 17.9C75.4 17.9 76.2 16.8 76.2 15.2C76.2 13.6 75.4 12.5 74 12.5Z" fill="currentColor"/>
      <path d="M81 10.4H83.7V11.8C84.4 10.8 85.5 10.1 87 10.1C89.2 10.1 90.5 11.5 90.5 14V20H87.8V14.5C87.8 13.2 87.2 12.5 86 12.5C84.8 12.5 83.8 13.3 83.8 14.7V20H81V10.4Z" fill="currentColor"/>
    </svg>
  );
}

function LinearLogo() {
  return (
    <svg width="76" height="22" viewBox="0 0 76 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0.5 1.1C0.5 0.5 1 0 1.6 0H3.3C3.9 0 4.4 0.5 4.4 1.1V17.5H12.5C13.1 17.5 13.6 18 13.6 18.6V20.1C13.6 20.7 13.1 21.2 12.5 21.2H1.6C1 21.2 0.5 20.7 0.5 20.1V1.1Z" fill="currentColor"/>
      <path d="M16 6.8C16 6.2 16.5 5.7 17.1 5.7H18.6C19.2 5.7 19.7 6.2 19.7 6.8V20.1C19.7 20.7 19.2 21.2 18.6 21.2H17.1C16.5 21.2 16 20.7 16 20.1V6.8ZM16 1.1C16 0.5 16.5 0 17.1 0H18.6C19.2 0 19.7 0.5 19.7 1.1V3.2C19.7 3.8 19.2 4.3 18.6 4.3H17.1C16.5 4.3 16 3.8 16 3.2V1.1Z" fill="currentColor"/>
      <path d="M23.5 6.8C23.5 6.2 24 5.7 24.6 5.7H26.1C26.7 5.7 27.2 6.2 27.2 6.8V7.8C28.2 6.3 29.8 5.4 31.8 5.4C34.8 5.4 36.6 7.3 36.6 10.5V20.1C36.6 20.7 36.1 21.2 35.5 21.2H34C33.4 21.2 32.9 20.7 32.9 20.1V11.2C32.9 9.4 31.9 8.4 30.2 8.4C28.4 8.4 27.2 9.6 27.2 11.5V20.1C27.2 20.7 26.7 21.2 26.1 21.2H24.6C24 21.2 23.5 20.7 23.5 20.1V6.8Z" fill="currentColor"/>
      <path d="M51.5 13.5C51.5 13.9 51.5 14.3 51.4 14.6H42.2C42.5 16.7 44 18 46 18C47.4 18 48.5 17.4 49.2 16.4C49.5 16 50 15.8 50.5 15.8H51.2C51.7 15.8 52 16.3 51.7 16.7C50.6 18.7 48.5 21.5 45.9 21.5C42.2 21.5 39.5 18.7 39.5 13.5C39.5 8.3 42.2 5.4 45.5 5.4C48.8 5.4 51.5 8.3 51.5 13.5ZM42.3 12H48.7C48.4 9.8 47.2 8.4 45.5 8.4C43.8 8.4 42.6 9.8 42.3 12Z" fill="currentColor"/>
      <path d="M60.2 5.4C62.5 5.4 64.2 6.5 65.1 8.3V6.8C65.1 6.2 65.6 5.7 66.2 5.7H67.5C68.1 5.7 68.6 6.2 68.6 6.8V20.1C68.6 20.7 68.1 21.2 67.5 21.2H66.2C65.6 21.2 65.1 20.7 65.1 20.1V18.5C64.2 20.4 62.5 21.5 60.2 21.5C56.8 21.5 54.5 18.5 54.5 13.5C54.5 8.4 56.8 5.4 60.2 5.4ZM61 8.6C58.9 8.6 57.5 10.5 57.5 13.5C57.5 16.4 58.9 18.3 61 18.3C63.1 18.3 64.5 16.4 64.5 13.5C64.5 10.5 63.1 8.6 61 8.6Z" fill="currentColor"/>
      <path d="M72.5 6.8C72.5 6.2 73 5.7 73.6 5.7H74.4C75 5.7 75.5 6.2 75.5 6.8V8.5C75.5 8.5 75.5 5.7 75.5 6.8V20.1C75.5 20.7 75 21.2 74.4 21.2H73.6C73 21.2 72.5 20.7 72.5 20.1V6.8ZM72.5 6.8C73.2 5.9 74.2 5.4 75.5 5.4" fill="currentColor"/>
    </svg>
  );
}

function VercelLogo() {
  return (
    <svg width="82" height="20" viewBox="0 0 82 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0L24 20H0L12 0Z" fill="currentColor"/>
      <path d="M36.8 15.4L31 4H34.2L38 12L41.8 4H45L39.2 15.4H36.8Z" fill="currentColor"/>
      <path d="M52.5 15.7C49.5 15.7 47.2 13.5 47.2 10C47.2 6.5 49.5 4.3 52.3 4.3C55.1 4.3 57.2 6.3 57.2 9.7C57.2 10.1 57.2 10.5 57.1 10.8H50C50.3 12.5 51.3 13.5 52.6 13.5C53.7 13.5 54.5 12.9 55 12.1L57 13.1C56.1 14.7 54.5 15.7 52.5 15.7ZM50.1 9H54.3C54.1 7.4 53.3 6.5 52.2 6.5C51.1 6.5 50.3 7.4 50.1 9Z" fill="currentColor"/>
      <path d="M59.5 4.5H62.2V6.2C62.8 5 63.8 4.3 65.2 4.3V7.2H64.8C63.2 7.2 62.2 8 62.2 10.2V15.4H59.5V4.5Z" fill="currentColor"/>
      <path d="M72.5 15.7C69.5 15.7 67.5 13.4 67.5 10C67.5 6.6 69.5 4.3 72.2 4.3C73.5 4.3 74.5 4.9 75.2 5.8V4.5H77.9V15.4H75.2V14.1C74.5 15.1 73.5 15.7 72.2 15.7ZM72.8 6.7C71.2 6.7 70.2 8 70.2 10C70.2 12 71.2 13.3 72.8 13.3C74.4 13.3 75.4 12 75.4 10C75.4 8 74.4 6.7 72.8 6.7Z" fill="currentColor"/>
      <path d="M81 0H83.7V15.4H81V0Z" fill="currentColor" transform="translate(-1.7 0)"/>
    </svg>
  );
}

function StripeLogo() {
  return (
    <svg width="58" height="24" viewBox="0 0 58 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M58 12.4C58 8.3 56 5.5 52.5 5.5C49 5.5 46.6 8.3 46.6 12.3C46.6 17 49.3 19.2 53.1 19.2C55 19.2 56.4 18.7 57.5 18.1V15.1C56.4 15.7 55.2 16 53.7 16C52.2 16 50.9 15.5 50.7 13.6H57.9C57.9 13.4 58 12.7 58 12.4ZM50.6 11C50.6 9.2 51.7 8.3 52.5 8.3C53.3 8.3 54.3 9.2 54.3 11H50.6Z" fill="currentColor"/>
      <path d="M39.2 5.5C37.7 5.5 36.7 6.2 36.2 6.7L36 5.8H32.7V24L36.3 23.3L36.4 18.2C36.9 18.6 37.6 19.2 39.1 19.2C42.1 19.2 44.8 16.8 44.8 12.2C44.8 8 42.1 5.5 39.2 5.5ZM38.3 16C37.3 16 36.7 15.6 36.4 15.2L36.3 9.5C36.7 9 37.3 8.6 38.3 8.6C40 8.6 41.2 10.3 41.2 12.3C41.2 14.3 40.1 16 38.3 16Z" fill="currentColor"/>
      <path d="M27.3 4.7L30.9 4V1L27.3 1.7V4.7Z" fill="currentColor"/>
      <path d="M30.9 5.8H27.3V19H30.9V5.8Z" fill="currentColor"/>
      <path d="M23.2 7L23 5.8H19.8V19H23.4V10.2C24.2 9.2 25.6 9.4 26 9.5V5.8C25.5 5.6 23.9 5.3 23.2 7Z" fill="currentColor"/>
      <path d="M16 2.5L12.5 3.2L12.4 15.4C12.4 17.5 14 19.2 16.1 19.2C17.2 19.2 18 19 18.5 18.7V15.7C18 15.9 16 16.5 16 14.4V8.9H18.5V5.8H16V2.5Z" fill="currentColor"/>
      <path d="M4.5 9.5C4.5 8.8 5.1 8.5 6 8.5C7.3 8.5 8.9 8.9 10.2 9.6V6.1C8.8 5.6 7.4 5.3 6 5.3C2.5 5.3 0.5 7.1 0.5 10C0.5 14.4 6.5 13.7 6.5 15.6C6.5 16.4 5.8 16.7 4.8 16.7C3.4 16.7 1.6 16.1 0.2 15.3V18.9C1.7 19.5 3.3 19.8 4.8 19.8C8.4 19.8 10.5 18 10.5 15.1C10.5 10.3 4.5 11.2 4.5 9.5Z" fill="currentColor"/>
    </svg>
  );
}

function FigmaLogo() {
  return (
    <svg width="60" height="22" viewBox="0 0 60 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Figma icon */}
      <path d="M5.5 22C7.7 22 9.5 20.2 9.5 18V14H5.5C3.3 14 1.5 15.8 1.5 18C1.5 20.2 3.3 22 5.5 22Z" fill="currentColor" opacity="0.8"/>
      <path d="M1.5 11C1.5 8.8 3.3 7 5.5 7H9.5V15H5.5C3.3 15 1.5 13.2 1.5 11Z" fill="currentColor" opacity="0.6"/>
      <path d="M1.5 4C1.5 1.8 3.3 0 5.5 0H9.5V8H5.5C3.3 8 1.5 6.2 1.5 4Z" fill="currentColor" opacity="0.8"/>
      <path d="M9.5 0H13.5C15.7 0 17.5 1.8 17.5 4C17.5 6.2 15.7 8 13.5 8H9.5V0Z" fill="currentColor" opacity="0.6"/>
      <path d="M17.5 11C17.5 13.2 15.7 15 13.5 15C11.3 15 9.5 13.2 9.5 11C9.5 8.8 11.3 7 13.5 7C15.7 7 17.5 8.8 17.5 11Z" fill="currentColor"/>
      {/* Figma text */}
      <path d="M24 1H34V4H27.5V9H33V12H27.5V19H24V1Z" fill="currentColor"/>
      <path d="M36.5 1H40V3.2H36.5V1ZM36.5 5.5H40V19H36.5V5.5Z" fill="currentColor"/>
      <path d="M49.5 5.5H53V18C53 21.5 50.5 22.5 47.5 22.5C46 22.5 44.3 22 43.5 21.5L44.5 18.8C45.1 19.2 46 19.5 47 19.5C48.5 19.5 49.5 18.8 49.5 17.2V16.5C48.8 17.3 47.8 17.8 46.5 17.8C43.8 17.8 42 15.5 42 11.5C42 7.5 43.8 5.2 46.5 5.2C47.8 5.2 48.8 5.8 49.5 6.7V5.5ZM47.5 8C46 8 45 9.3 45 11.5C45 13.7 46 15 47.5 15C49 15 50 13.7 50 11.5C50 9.3 49 8 47.5 8Z" fill="currentColor"/>
      <path d="M55.5 5.5H59V7C59.5 6 60.5 5.2 60 5.5V8.5C59.5 8.3 59 8.2 58.5 8.2C57.5 8.2 56.8 8.8 56.5 9.8V19H53V5.5H55.5Z" fill="currentColor" transform="translate(-2 0)"/>
    </svg>
  );
}

function SupabaseLogo() {
  return (
    <svg width="100" height="22" viewBox="0 0 100 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Supabase icon (lightning bolt) */}
      <path d="M11.8 14.2H5.2C4.4 14.2 3.9 13.3 4.4 12.7L12.5 1.3C13.1 0.5 14.3 1.1 14.1 2.1L12.8 9.8H19.3C20.1 9.8 20.6 10.7 20.1 11.3L12 22.7C11.4 23.5 10.2 22.9 10.4 21.9L11.8 14.2Z" fill="currentColor"/>
      {/* Supabase text */}
      <path d="M28.5 15.5C28.5 13.5 30 12.5 32.5 12.2L35 11.9V11.5C35 10.3 34.3 9.7 33 9.7C31.8 9.7 31 10.2 30.7 11.1L28.2 10.5C28.7 8.5 30.5 7.2 33.1 7.2C36 7.2 37.8 8.8 37.8 11.5V18H35.2V16.5C34.5 17.5 33.3 18.3 31.8 18.3C29.8 18.3 28.5 17.1 28.5 15.5ZM35 14.2V13.5L32.8 13.8C31.5 14 31.1 14.5 31.1 15.2C31.1 15.9 31.7 16.3 32.6 16.3C34 16.3 35 15.4 35 14.2Z" fill="currentColor"/>
      <path d="M40.5 17.5V15C41.2 15.5 42.2 15.8 43.2 15.8C44.2 15.8 44.8 15.5 44.8 14.9C44.8 14.3 44.2 14.1 43 13.8C41 13.3 39.8 12.5 39.8 10.8C39.8 8.8 41.5 7.2 44 7.2C45.2 7.2 46.2 7.5 47 7.9V10.3C46.3 9.9 45.3 9.6 44.3 9.6C43.3 9.6 42.8 9.9 42.8 10.4C42.8 10.9 43.3 11.1 44.5 11.4C46.5 11.9 47.8 12.7 47.8 14.5C47.8 16.5 46 18.3 43.2 18.3C41.8 18.3 40.8 18 40.5 17.5Z" fill="currentColor"/>
      <path d="M56.5 15.7C53.5 15.7 51.2 13.5 51.2 11C51.2 8.5 53.5 6.2 56.3 6.2C59.1 6.2 61.2 8.3 61.2 10.7C61.2 11.1 61.2 11.5 61.1 11.8H54C54.3 13.2 55.3 14 56.6 14C57.7 14 58.5 13.5 59 12.8L61 13.8C60.1 15.2 58.5 15.7 56.5 15.7ZM54.1 10H58.3C58.1 8.7 57.3 7.9 56.2 7.9C55.1 7.9 54.3 8.7 54.1 10Z" fill="currentColor" transform="translate(-2.5 2)"/>
      <path d="M26 7.5H28.7V18H26V7.5Z" fill="currentColor" transform="translate(-1 0)"/>
      <path d="M26 3.5H28.7V5.8H26V3.5Z" fill="currentColor" transform="translate(-1 0)"/>
    </svg>
  );
}

const BRAND_LOGOS = [
  { name: "Notion", Component: NotionLogo },
  { name: "Linear", Component: LinearLogo },
  { name: "Vercel", Component: VercelLogo },
  { name: "Stripe", Component: StripeLogo },
  { name: "Figma", Component: FigmaLogo },
  { name: "Supabase", Component: SupabaseLogo },
];

// ─── FAQ Item ─────────────────────────────────────────────────────────────────

function FAQItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className={`border rounded-xl transition-all duration-200 ${isOpen ? "border-amber-200 bg-amber-50/30 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="text-[15px] font-semibold text-slate-800 leading-snug">{q}</span>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isOpen ? "bg-amber-100" : "bg-slate-100"}`}>
          {isOpen
            ? <ChevronUp className="w-4 h-4 text-amber-600" />
            : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>
      <div
        className="overflow-hidden transition-all duration-200"
        style={{ maxHeight: isOpen ? "200px" : "0px", opacity: isOpen ? 1 : 0 }}
      >
        <div className="px-6 pb-5">
          <p className="text-[15px] text-slate-600 leading-relaxed">{a}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Check/X cell ─────────────────────────────────────────────────────────────

function FeatureCell({ available }: { available: boolean }) {
  return available ? (
    <Check className="w-4.5 h-4.5 text-emerald-500 mx-auto" />
  ) : (
    <Minus className="w-4 h-4 text-slate-300 mx-auto" />
  );
}

// ─── Fade-in section wrapper ────────────────────────────────────────────────

function FadeInSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, inView } = useInView(0.1);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── FAQ JSON-LD ────────────────────────────────────────────────────────────

function FAQJsonLd() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LaunchPad() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [headline, setHeadline] = useState(HEADLINES[0]);
  const [recentTools, setRecentTools] = useState<Tool[]>([]);

  useEffect(() => {
    const variant = getHeadlineVariant();
    setHeadline(variant);
    trackHeadlineView(variant.id);
  }, []);

  useEffect(() => {
    fetchRecentlyLaunched(6).then(setRecentTools).catch(() => {});
  }, []);

  const handleLaunch = () => {
    trackHeadlineCTA(headline.id, "launch");
    router.push(isAuthenticated ? "/launch" : "/auth/login?next=/launch");
  };
  const handleClaim = () => {
    trackHeadlineCTA(headline.id, "claim");
    router.push(isAuthenticated ? "/claim" : "/auth/login?next=/claim");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <FAQJsonLd />

      {/* ═══════════════════════════════════════════════════════
          1. HERO
      ═══════════════════════════════════════════════════════ */}
      <section className="pt-[72px]">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10 pt-16 pb-14 lg:pt-20 lg:pb-16">
          <div className="max-w-[720px] mx-auto text-center">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 mb-7"
            >
              <Rocket className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">LaunchPad for Founders</span>
            </motion.div>

            {/* Headline (A/B tested) */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-[42px] lg:text-[52px] font-black text-slate-900 leading-[1.1] tracking-tight mb-5"
            >
              {headline.text}<br />
              <span className="text-amber-500">{headline.highlight}</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="text-[18px] text-slate-600 leading-relaxed mb-10 max-w-[560px] mx-auto"
            >
              List your SaaS or AI tool on LaudStack. Reach professionals actively searching for solutions. Free to start, verified in 24 hours.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-3 justify-center mb-10"
            >
              <button
                onClick={handleLaunch}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-[15px] text-white bg-amber-500 hover:bg-amber-600 active:scale-[0.98] transition-all shadow-sm"
              >
                <Rocket className="w-[18px] h-[18px]" />
                Launch Your Stack
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleClaim}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-[15px] text-slate-700 bg-white border border-slate-200 hover:border-amber-300 hover:text-amber-700 active:scale-[0.98] transition-all"
              >
                <BadgeCheck className="w-[18px] h-[18px]" />
                Claim Existing Listing
              </button>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.55 }}
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
            >
              {[
                "Free to list",
                "No credit card",
                "Verified in 24h",
                "Real audience",
              ].map((label) => (
                <div key={label} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-[14px] font-medium text-slate-500">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          2. TRUSTED BY — Real SVG Logo bar
      ═══════════════════════════════════════════════════════ */}
      <section className="border-y border-slate-100 bg-slate-50/40">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
          <div className="flex flex-col items-center gap-6">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">
              Trusted by teams at
            </span>
            <div className="flex items-center gap-12 sm:gap-16 flex-wrap justify-center text-slate-300">
              {BRAND_LOGOS.map(({ name, Component }) => (
                <div key={name} className="opacity-40 hover:opacity-60 transition-opacity duration-200">
                  <Component />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          3. HOW IT WORKS
      ═══════════════════════════════════════════════════════ */}
      <FadeInSection>
        <section className="py-20 bg-white">
          <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10">
            {/* Section header */}
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">How It Works</p>
              <h2 className="text-3xl lg:text-[36px] font-black text-slate-900 tracking-tight mb-4">
                Three steps to launch
              </h2>
              <p className="text-slate-600 text-[16px] leading-relaxed max-w-lg mx-auto">
                No gatekeeping. No lengthy approvals. Get your stack live and in front of buyers fast.
              </p>
            </div>

            {/* Steps */}
            <div className="grid lg:grid-cols-3 gap-6 max-w-[1000px] mx-auto">
              {HOW_IT_WORKS.map((step, idx) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="relative bg-white border border-slate-200 rounded-2xl p-7 hover:border-amber-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  {/* Step number */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center">
                      <span className="text-sm font-black text-white">{step.step}</span>
                    </div>
                    <step.icon className="w-5 h-5 text-slate-400" />
                  </div>

                  <h3 className="text-[16px] font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-[15px] text-slate-600 leading-relaxed mb-4">{step.desc}</p>

                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-[13px] font-semibold text-slate-500">{step.detail}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* ═══════════════════════════════════════════════════════
          4. WHAT YOU GET — Free vs Verified comparison
          Desktop: table | Mobile: stacked cards
      ═══════════════════════════════════════════════════════ */}
      <FadeInSection>
        <section className="py-20 bg-slate-50 border-y border-slate-100">
          <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-10">
            {/* Section header */}
            <div className="text-center mb-12">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">What You Get</p>
              <h2 className="text-3xl lg:text-[36px] font-black text-slate-900 tracking-tight mb-4">
                Free listing vs. verified founder
              </h2>
              <p className="text-slate-600 text-[16px] leading-relaxed max-w-lg mx-auto">
                Every stack starts free. Verify ownership to unlock the full founder toolkit.
              </p>
            </div>

            {/* Desktop comparison table */}
            <div className="hidden sm:block bg-white border border-slate-200 rounded-2xl overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_120px_120px] border-b border-slate-200 bg-slate-50">
                <div className="px-6 py-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Feature</span>
                </div>
                <div className="px-4 py-4 text-center border-l border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Free</span>
                </div>
                <div className="px-4 py-4 text-center border-l border-slate-200 bg-amber-50">
                  <div className="flex items-center justify-center gap-1.5">
                    <BadgeCheck className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Verified</span>
                  </div>
                </div>
              </div>

              {/* Table rows */}
              {COMPARISON_FEATURES.map(({ feature, free, verified }, idx) => (
                <div
                  key={feature}
                  className={`grid grid-cols-[1fr_120px_120px] ${idx < COMPARISON_FEATURES.length - 1 ? "border-b border-slate-100" : ""}`}
                >
                  <div className="px-6 py-3.5">
                    <span className="text-[15px] text-slate-700">{feature}</span>
                  </div>
                  <div className="px-4 py-3.5 border-l border-slate-100 flex items-center justify-center">
                    <FeatureCell available={free} />
                  </div>
                  <div className="px-4 py-3.5 border-l border-slate-100 bg-amber-50/30 flex items-center justify-center">
                    <FeatureCell available={verified} />
                  </div>
                </div>
              ))}

              {/* Table footer */}
              <div className="grid grid-cols-[1fr_120px_120px] border-t border-slate-200 bg-slate-50">
                <div className="px-6 py-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price</span>
                </div>
                <div className="px-4 py-4 text-center border-l border-slate-200">
                  <span className="text-[15px] font-black text-slate-900">Free</span>
                </div>
                <div className="px-4 py-4 text-center border-l border-slate-200 bg-amber-50">
                  <span className="text-[15px] font-black text-amber-700">Free</span>
                </div>
              </div>
            </div>

            {/* Mobile stacked cards */}
            <div className="sm:hidden space-y-4">
              {/* Free tier card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Rocket className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900">Free Listing</h3>
                    <span className="text-xs text-slate-400">No cost</span>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {COMPARISON_FEATURES.filter((f) => f.free).map(({ feature }) => (
                    <div key={feature} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-[14px] text-slate-600">{feature}</span>
                    </div>
                  ))}
                  {COMPARISON_FEATURES.filter((f) => !f.free).map(({ feature }) => (
                    <div key={feature} className="flex items-center gap-2.5 opacity-40">
                      <Minus className="w-4 h-4 text-slate-300 shrink-0" />
                      <span className="text-[14px] text-slate-400">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified tier card */}
              <div className="bg-white border-2 border-amber-200 rounded-2xl p-5 relative">
                <div className="absolute -top-3 left-5 bg-amber-500 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                  Recommended
                </div>
                <div className="flex items-center gap-2 mb-4 mt-1">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <BadgeCheck className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900">Verified Founder</h3>
                    <span className="text-xs text-amber-600 font-semibold">Free — verify domain</span>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {COMPARISON_FEATURES.map(({ feature }) => (
                    <div key={feature} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-[14px] text-slate-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-center text-[13px] text-slate-400 mt-5">
              Both tiers are completely free. Verification simply requires proving domain ownership.
            </p>
          </div>
        </section>
      </FadeInSection>

      {/* ═══════════════════════════════════════════════════════
          5. BENEFITS
      ═══════════════════════════════════════════════════════ */}
      <FadeInSection>
        <section className="py-20 bg-white">
          <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10">
            {/* Section header */}
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">Why LaudStack</p>
              <h2 className="text-3xl lg:text-[36px] font-black text-slate-900 tracking-tight mb-4">
                Built for founders who ship
              </h2>
              <p className="text-slate-600 text-[16px] leading-relaxed max-w-lg mx-auto">
                Everything you need to get discovered, build trust, and grow your user base.
              </p>
            </div>

            {/* Benefits grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-[1000px] mx-auto">
              {BENEFITS.map(({ icon: Icon, title, desc }, idx) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.06 }}
                  className="bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-slate-500" />
                  </div>
                  <h3 className="text-[16px] font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-[15px] text-slate-600 leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* ═══════════════════════════════════════════════════════
          6. RECENTLY LAUNCHED — Showcase strip (real DB data)
      ═══════════════════════════════════════════════════════ */}
      {recentTools.length > 0 && (
        <FadeInSection>
          <section className="py-16 bg-slate-50 border-y border-slate-100">
            <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10">
              <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">Recently Launched</p>
                  <h2 className="text-2xl lg:text-[28px] font-black text-slate-900 tracking-tight">
                    Stacks launched this week
                  </h2>
                </div>
                <button
                  onClick={() => router.push("/recently-added")}
                  className="text-[13px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
                >
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {recentTools.map((tool) => (
                  <div
                    key={tool.id}
                    onClick={() => router.push(`/tools/${tool.slug}`)}
                    className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-amber-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-center text-center"
                  >
                    <div className="w-12 h-12 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden flex items-center justify-center mb-3">
                      <img
                        src={tool.logo_url}
                        alt={tool.name}
                        className="w-9 h-9 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          if (e.currentTarget.parentElement)
                            e.currentTarget.parentElement.innerHTML = `<span class="text-lg font-black text-slate-400">${tool.name.charAt(0)}</span>`;
                        }}
                      />
                    </div>
                    <h4 className="text-[13px] font-bold text-slate-900 mb-0.5 truncate w-full">{tool.name}</h4>
                    <span className="text-[11px] text-slate-400 font-medium truncate w-full">{tool.category}</span>
                    <div className="flex items-center gap-2 mt-2">
                      {tool.average_rating > 0 && (
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-[11px] font-bold text-slate-600">{tool.average_rating.toFixed(1)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-0.5">
                        <ThumbsUp className="w-3 h-3 text-amber-500" />
                        <span className="text-[11px] font-bold text-slate-600">{tool.upvote_count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </FadeInSection>
      )}

      {/* ═══════════════════════════════════════════════════════
          7. TESTIMONIALS
      ═══════════════════════════════════════════════════════ */}
      <FadeInSection>
        <section className="py-20 bg-white">
          <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10">
            {/* Section header */}
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">Founder Stories</p>
              <h2 className="text-3xl lg:text-[36px] font-black text-slate-900 tracking-tight mb-4">
                Founders who launched here
              </h2>
              <p className="text-slate-600 text-[16px] leading-relaxed max-w-lg mx-auto">
                Real results from founders who used LaudStack to grow their stacks.
              </p>
            </div>

            {/* Testimonial cards */}
            <div className="grid lg:grid-cols-3 gap-5 max-w-[1000px] mx-auto">
              {TESTIMONIALS.map(({ name, role, initials, color, quote, metric }, idx) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.08 }}
                  className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-[15px] text-slate-600 leading-relaxed flex-1 mb-5">
                    &ldquo;{quote}&rdquo;
                  </p>

                  {/* Metric badge */}
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 mb-5 self-start">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-700">{metric}</span>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                      style={{ background: color }}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold text-slate-900">{name}</div>
                      <div className="text-[13px] text-slate-400">{role}</div>
                    </div>
                    <BadgeCheck className="w-4 h-4 text-amber-400 ml-auto shrink-0" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* ═══════════════════════════════════════════════════════
          8. FAQ
      ═══════════════════════════════════════════════════════ */}
      <FadeInSection>
        <section className="py-20 bg-slate-50 border-t border-slate-100">
          <div className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-10">
            {/* Section header */}
            <div className="text-center mb-12">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">FAQ</p>
              <h2 className="text-3xl lg:text-[36px] font-black text-slate-900 tracking-tight mb-4">
                Common questions
              </h2>
              <p className="text-slate-600 text-[16px] leading-relaxed">
                Everything founders ask before getting started.
              </p>
            </div>

            {/* FAQ items */}
            <div className="space-y-2.5">
              {FAQ_ITEMS.map((item, idx) => (
                <FAQItem
                  key={item.q}
                  q={item.q}
                  a={item.a}
                  isOpen={openFaq === idx}
                  onToggle={() => setOpenFaq(openFaq === idx ? null : idx)}
                />
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-[15px] text-slate-500">
                Have another question?{" "}
                <a href="/contact" className="text-amber-600 font-semibold hover:underline">
                  Contact us
                </a>
              </p>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* ═══════════════════════════════════════════════════════
          9. FINAL CTA
      ═══════════════════════════════════════════════════════ */}
      <FadeInSection>
        <section className="py-16 bg-white border-t border-slate-100">
          <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="max-w-[640px] mx-auto text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center mx-auto mb-6">
                <Rocket className="w-6 h-6 text-white" />
              </div>

              <h2 className="text-3xl lg:text-[36px] font-black text-slate-900 tracking-tight mb-4">
                Ready to launch your stack?
              </h2>
              <p className="text-slate-600 text-[16px] leading-relaxed mb-8 max-w-md mx-auto">
                Join the growing community of SaaS and AI tools on LaudStack. Free to start. Verified in 24 hours.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                <button
                  onClick={handleLaunch}
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-[15px] text-white bg-amber-500 hover:bg-amber-600 active:scale-[0.98] transition-all shadow-sm"
                >
                  <Rocket className="w-[18px] h-[18px]" />
                  Launch Your Stack Free
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClaim}
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-[15px] text-slate-700 bg-white border border-slate-200 hover:border-amber-300 hover:text-amber-700 active:scale-[0.98] transition-all"
                >
                  <BadgeCheck className="w-[18px] h-[18px]" />
                  Claim Your Listing
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {[
                  { icon: Lock, label: "No credit card required" },
                  { icon: Clock, label: "Verified in 24 hours" },
                  { icon: Shield, label: "Trusted platform" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[14px] text-slate-500 font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      <Footer />
    </div>
  );
}
