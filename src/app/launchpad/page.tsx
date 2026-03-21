"use client";
export const dynamic = "force-dynamic";

/*
 * LaunchPad — LaudStack
 *
 * Landing page for founders to submit and verify their stacks.
 * Design: Capterra/G2-inspired — clean, professional, enterprise-grade.
 * Light theme, generous whitespace, alternating feature layout.
 *
 * Removed: Stats Row, Compare Plans, FAQ
 * Added: Scrolling logo marquee with original colored logos
 */

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import LogoWithFallback from "@/components/LogoWithFallback";
import {
  Rocket, Shield, BarChart3, MessageSquare, Crown,
  Star, CheckCircle2, ArrowRight,
  BadgeCheck, TrendingUp, Clock,
  Building2,
  Lock, ThumbsUp, Quote,
} from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { fetchRecentlyLaunched } from "@/app/actions/seo-fetchers";
import type { Tool } from "@/lib/types";

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
    desc: "Create a free account and submit your SaaS or AI tool. Add your description, screenshots, pricing, and category.",
    detail: "Takes under 5 minutes",
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
    desc: "Access your Founder Dashboard to reply to reviews, track analytics, run deals, and manage your listing.",
    detail: "Full analytics & engagement tools",
  },
];

const BENEFITS_ALTERNATING = [
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    headline: "Know exactly how your listing performs",
    desc: "Track page views, click-throughs, review sentiment, laud trends, and conversion data. Make data-driven decisions about your product positioning.",
    features: ["Real-time page views", "Click-through tracking", "Review sentiment analysis", "Conversion metrics"],
  },
  {
    icon: MessageSquare,
    title: "Review Management",
    headline: "Build trust through authentic engagement",
    desc: "Reply to reviews directly. Thank supporters, address concerns, and show prospects you actively listen to feedback. Every response builds credibility.",
    features: ["Direct reply to reviews", "Sentiment monitoring", "Response templates", "Review notifications"],
  },
  {
    icon: TrendingUp,
    title: "Discovery & Growth",
    headline: "Get found by the right audience",
    desc: "Verified stacks are eligible for weekly rising spots, Spotlight picks, and category leaderboard features. Your audience finds you organically.",
    features: ["Rising placement boost", "Spotlight eligibility", "Category rankings", "Organic discovery"],
  },
];

// ─── Scrolling Logo Marquee Data ─────────────────────────────────────────────

const TRUST_LOGOS: { name: string; color: string; icon: React.ReactNode }[] = [
  {
    name: "Notion",
    color: "#000000",
    icon: (
      <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
        <path d="M6.017 4.313l55.333-4.087c6.797-.583 8.543-.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277-1.553 6.807-6.99 7.193L24.467 99.967c-4.08.193-6.023-.39-8.16-3.113L3.3 79.94c-2.333-3.113-3.3-5.443-3.3-8.167V11.113c0-3.497 1.553-6.413 6.017-6.8z" fill="#fff"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M61.35.227l-55.333 4.087C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723.967 5.053 3.3 8.167l12.993 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257-3.89c5.433-.387 6.99-2.917 6.99-7.193V20.64c0-2.21-.873-2.847-3.443-4.733L75.24 3.463l-.103-.07C71.557.727 69.857.16 63.74.16l-2.39.067zM25.92 19.523c-5.247.353-6.437.433-9.417-1.99L8.927 11.507c-.77-.78-.383-1.753 1.557-1.947l53.193-3.887c4.467-.39 6.793 1.167 8.543 2.527l9.123 6.61c.39.197 1.36 1.36.193 1.36l-54.933 3.307-.683.047zM19.803 88.3V30.367c0-2.53.777-3.697 3.103-3.893L86 22.78c2.14-.193 3.107 1.167 3.107 3.693v57.547c0 2.53-.39 4.67-3.883 4.863l-60.377 3.5c-3.493.193-5.043-.973-5.043-4.083zm59.6-54.827c.387 1.75 0 3.5-1.75 3.7l-2.91.58v42.77c-2.527 1.36-4.853 2.133-6.797 2.133-3.11 0-3.883-.973-6.21-3.887l-19.03-29.94v28.967l6.077 1.36s0 3.5-4.853 3.5l-13.39.78c-.39-.78 0-2.723 1.357-3.11l3.497-.973V34.607l-4.857-.39c-.39-1.75.58-4.277 3.3-4.473l14.367-.967 19.8 30.327V32.47l-5.063-.583c-.39-2.143 1.163-3.7 3.103-3.89l13.36-.523z" fill="#000"/>
      </svg>
    ),
  },
  {
    name: "Linear",
    color: "#5E6AD2",
    icon: (
      <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
        <path d="M1.22541 61.5228c-.18784-.9578.05756-2.4356.49339-3.3965l32.1813-32.1813C44.5765 16.3165 58.2 15.6578 69.2721 24.7279c11.072 9.0701 13.2106 25.6317 4.8073 37.0179L41.8978 93.9274c-.9609.4358-2.4387.6812-3.3965.4934L1.22541 61.5228z" fill="#5E6AD2"/>
        <path d="M3.89595 69.7932c-.31647-.7906-.36527-1.6429-.14759-2.4517l24.50394-24.504c8.0299-8.0299 21.0521-8.0299 29.0821 0 8.0299 8.03 8.0299 21.0522 0 29.0821L32.8302 96.4239c-.8088.2177-1.6611.1689-2.4517-.1475L3.89595 69.7932z" fill="#5E6AD2"/>
      </svg>
    ),
  },
  {
    name: "Vercel",
    color: "#000000",
    icon: (
      <svg width="22" height="20" viewBox="0 0 76 65" fill="none">
        <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="#000"/>
      </svg>
    ),
  },
  {
    name: "Stripe",
    color: "#635BFF",
    icon: (
      <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M14 28C21.732 28 28 21.732 28 14S21.732 0 14 0 0 6.268 0 14s6.268 14 14 14z" fill="#635BFF"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M12.875 10.168c0-.876.72-1.213 1.912-1.213 1.71 0 3.87.519 5.58 1.443V6.043c-1.868-.742-3.714-1.034-5.58-1.034-4.565 0-7.6 2.384-7.6 6.365 0 6.207 8.543 5.217 8.543 7.893 0 1.034-.9 1.37-2.16 1.37-1.868 0-4.255-.769-6.146-1.803v4.422c2.093.899 4.21 1.28 6.146 1.28 4.678 0 7.894-2.316 7.894-6.342-.023-6.702-8.59-5.51-8.59-8.026z" fill="#fff"/>
      </svg>
    ),
  },
  {
    name: "Figma",
    color: "#F24E1E",
    icon: (
      <svg width="16" height="22" viewBox="0 0 38 57" fill="none">
        <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" fill="#1ABCFE"/>
        <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" fill="#0ACF83"/>
        <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" fill="#FF7262"/>
        <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#F24E1E"/>
        <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#A259FF"/>
      </svg>
    ),
  },
  {
    name: "Supabase",
    color: "#3ECF8E",
    icon: (
      <svg width="20" height="22" viewBox="0 0 109 113" fill="none">
        <path d="M63.708 110.284c-2.86 3.601-8.658 1.628-8.727-2.97l-1.007-67.251h45.22c8.19 0 12.758 9.46 7.665 15.874L63.708 110.284z" fill="url(#a)"/>
        <path d="M63.708 110.284c-2.86 3.601-8.658 1.628-8.727-2.97l-1.007-67.251h45.22c8.19 0 12.758 9.46 7.665 15.874L63.708 110.284z" fill="url(#b)" fillOpacity=".2"/>
        <path d="M45.317 2.071c2.86-3.601 8.657-1.628 8.726 2.97l.442 67.251H9.83c-8.19 0-12.759-9.46-7.665-15.875L45.317 2.072z" fill="#3ECF8E"/>
        <defs>
          <linearGradient id="a" x1="53.974" y1="54.974" x2="94.163" y2="71.829" gradientUnits="userSpaceOnUse">
            <stop stopColor="#249361"/><stop offset="1" stopColor="#3ECF8E"/>
          </linearGradient>
          <linearGradient id="b" x1="36.156" y1="30.578" x2="54.484" y2="79.837" gradientUnits="userSpaceOnUse">
            <stop/><stop offset="1" stopOpacity="0"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    name: "Slack",
    color: "#4A154B",
    icon: (
      <svg width="22" height="22" viewBox="0 0 54 54" fill="none">
        <path d="M19.712.133a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386h5.376V5.52A5.381 5.381 0 0 0 19.712.133m0 14.365H5.376A5.381 5.381 0 0 0 0 19.884a5.381 5.381 0 0 0 5.376 5.387h14.336a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386" fill="#36C5F0"/>
        <path d="M53.76 19.884a5.381 5.381 0 0 0-5.376-5.386 5.381 5.381 0 0 0-5.376 5.386v5.387h5.376a5.381 5.381 0 0 0 5.376-5.387m-14.336 0V5.52A5.381 5.381 0 0 0 34.048.133a5.381 5.381 0 0 0-5.376 5.387v14.364a5.381 5.381 0 0 0 5.376 5.387 5.381 5.381 0 0 0 5.376-5.387" fill="#2EB67D"/>
        <path d="M34.048 54a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386h-5.376v5.386A5.381 5.381 0 0 0 34.048 54m0-14.365h14.336a5.381 5.381 0 0 0 5.376-5.386 5.381 5.381 0 0 0-5.376-5.387H34.048a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386" fill="#ECB22E"/>
        <path d="M0 34.249a5.381 5.381 0 0 0 5.376 5.386 5.381 5.381 0 0 0 5.376-5.386v-5.387H5.376A5.381 5.381 0 0 0 0 34.25m14.336 0v14.364A5.381 5.381 0 0 0 19.712 54a5.381 5.381 0 0 0 5.376-5.387V34.25a5.381 5.381 0 0 0-5.376-5.387 5.381 5.381 0 0 0-5.376 5.387" fill="#E01E5A"/>
      </svg>
    ),
  },
  {
    name: "GitHub",
    color: "#181717",
    icon: (
      <svg width="22" height="22" viewBox="0 0 98 96" fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="#181717"/>
      </svg>
    ),
  },
  {
    name: "LivingTrail",
    color: "#2D6A4F",
    icon: (
      <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663413324407/3XGasP8CcX57JRU5Ai2Hv7/livingtrail-logo_ac49f795.png" alt="LivingTrail" width={22} height={22} className="object-contain" />
    ),
  },
  {
    name: "RehabLookup",
    color: "#16A34A",
    icon: (
      <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663413324407/3XGasP8CcX57JRU5Ai2Hv7/rehablookup-logo_ac4ae656.png" alt="RehabLookup" width={22} height={22} className="object-contain" />
    ),
  },
  {
    name: "Shopify",
    color: "#96BF48",
    icon: (
      <svg width="20" height="22" viewBox="0 0 256 292" fill="none">
        <path d="M223.774 57.34c-.201-1.46-1.48-2.268-2.537-2.357-1.055-.088-23.383-1.743-23.383-1.743s-15.507-15.395-17.209-17.099c-1.703-1.703-5.029-1.185-6.32-.828-.19.053-3.386 1.046-8.678 2.683-5.18-14.906-14.322-28.604-30.405-28.604-.444 0-.901.018-1.358.044C129.31 3.407 123.644.779 118.85.779c-37.54 0-55.53 46.95-61.148 70.812-14.62 4.528-25.019 7.752-26.36 8.146-8.186 2.567-8.442 2.823-9.51 10.567C20.895 97.3 0 261.344 0 261.344l177.707 30.55 76.259-19.137S223.975 58.8 223.774 57.34" fill="#95BF47"/>
        <path d="M202.654 54.983c-1.055-.088-23.383-1.743-23.383-1.743s-15.507-15.395-17.209-17.099c-.637-.637-1.496-.946-2.422-1.073l-10.533 214.826 76.259-19.137S223.975 58.8 223.774 57.34c-.201-1.46-1.48-2.268-2.537-2.357" fill="#5E8E3E"/>
        <path d="M135.106 104.585l-11.162 33.163s-9.81-5.227-21.774-5.227c-17.6 0-18.49 11.038-18.49 13.822 0 15.186 39.573 21.005 39.573 56.558 0 27.97-17.74 45.97-41.672 45.97-28.7 0-43.38-17.857-43.38-17.857l7.68-25.362s15.1 12.955 27.84 12.955c8.318 0 11.697-6.546 11.697-11.33 0-19.78-32.467-20.67-32.467-53.26 0-27.397 19.67-53.888 59.39-53.888 15.318 0 22.765 4.456 22.765 4.456" fill="#fff"/>
      </svg>
    ),
  },
  {
    name: "Intercom",
    color: "#1F8DED",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#1F8DED"/>
        <path d="M17 15.5c0 0-2.5 2-5 2s-5-2-5-2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M7 7v5M10 6v7M12 5.5v8M14 6v7M17 7v5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

// ─── Colors ──────────────────────────────────────────────────────────────────

const ACCENT = "#D97706";
const ACCENT_LIGHT = "#FFFBEB";
const ACCENT_BORDER = "#FDE68A";
const DARK = "#0C1830";

// ─── Fade-in section wrapper ────────────────────────────────────────────────

function FadeInSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView(0.1);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="text-center mb-14">
      <div
        className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5"
        style={{ background: ACCENT_LIGHT, border: `1px solid ${ACCENT_BORDER}` }}
      >
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: ACCENT }}>{eyebrow}</span>
      </div>
      <h2
        className="text-2xl sm:text-3xl lg:text-[36px] font-extrabold tracking-tight mb-4"
        style={{ color: DARK, letterSpacing: "-0.02em" }}
      >
        {title}
      </h2>
      <p className="text-slate-600 text-[15px] sm:text-[16px] leading-relaxed max-w-lg mx-auto">
        {subtitle}
      </p>
    </div>
  );
}

// ─── Scrolling Logo Marquee ──────────────────────────────────────────────────

function LogoMarquee() {
  // Double the logos for seamless infinite scroll
  const doubled = [...TRUST_LOGOS, ...TRUST_LOGOS];

  return (
    <section className="py-10 sm:py-12 overflow-hidden" style={{ borderBottom: "1px solid #F1F5F9" }}>
      <p className="text-center text-[12px] font-semibold text-slate-500 uppercase tracking-[0.15em] mb-8">
        Built with technologies like
      </p>
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-10" style={{ background: "linear-gradient(to right, #fff, transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-10" style={{ background: "linear-gradient(to left, #fff, transparent)" }} />

        {/* Scrolling track */}
        <div
          className="flex items-center gap-12 sm:gap-16"
          style={{
            animation: "marquee-scroll 40s linear infinite",
            width: "max-content",
          }}
        >
          {doubled.map((brand, idx) => (
            <div
              key={`${brand.name}-${idx}`}
              className="flex items-center gap-3 shrink-0 select-none"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-slate-50" style={{ border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                {brand.icon}
              </div>
              <span
                className="text-base sm:text-lg font-bold tracking-tight whitespace-nowrap"
                style={{ color: brand.color, letterSpacing: "-0.01em" }}
              >
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Keyframes */}
      <style jsx>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LaunchPad() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [recentTools, setRecentTools] = useState<Tool[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);

  useEffect(() => {
    setRecentLoading(true);
    fetchRecentlyLaunched(6)
      .then(setRecentTools)
      .catch(() => {})
      .finally(() => setRecentLoading(false));
  }, []);

  const handleLaunch = () => {
    router.push(isAuthenticated ? "/launch" : "/auth/login?next=/launch");
  };
  const handleClaim = () => {
    router.push(isAuthenticated ? "/claim" : "/auth/login?next=/claim");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════
          1. HERO — Clean, focused, no decorative noise
      ═══════════════════════════════════════════════════════ */}
      <section className="pt-[60px] lg:pt-[64px]">
        <div style={{ maxWidth: "1268px", margin: "0 auto", padding: "32px 24px 0" }}>
          <div
            className="relative overflow-hidden"
            style={{
              background: "#F8FAFC",
              borderRadius: "24px",
              padding: "56px 32px 48px",
              border: "1px solid #E2E8F0",
            }}
          >
            {/* Subtle dot pattern */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "radial-gradient(circle, #CBD5E1 0.8px, transparent 0.8px)",
                backgroundSize: "24px 24px",
                opacity: 0.35,
                pointerEvents: "none",
              }}
            />
            {/* Accent glow top-right */}
            <div
              className="absolute"
              aria-hidden
              style={{
                top: "-20%",
                right: "-5%",
                width: "500px",
                height: "400px",
                background: "radial-gradient(ellipse at center, rgba(245, 158, 11, 0.06) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            {/* Accent glow bottom-left */}
            <div
              className="absolute"
              aria-hidden
              style={{
                bottom: "-30%",
                left: "-5%",
                width: "400px",
                height: "300px",
                background: "radial-gradient(ellipse at center, rgba(30, 58, 95, 0.03) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            {/* Content */}
            <div className="relative z-10 text-center max-w-[680px] mx-auto">
              {/* Eyebrow */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7"
                style={{ background: ACCENT_LIGHT, border: `1px solid ${ACCENT_BORDER}` }}
              >
                <Rocket className="w-3.5 h-3.5" style={{ color: ACCENT }} />
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: ACCENT }}>LaunchPad for Founders</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-[32px] sm:text-[40px] lg:text-[48px] font-extrabold leading-[1.1] tracking-tight mb-5"
                style={{ color: DARK, letterSpacing: "-0.02em" }}
              >
                <span className="hidden sm:inline">Get Your Stack in Front of</span>
                <span className="sm:hidden">Launch to</span>
                <br />
                <span style={{ color: ACCENT }}>the Right Audience</span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
                className="text-[15px] sm:text-[16px] leading-relaxed mb-10 max-w-[520px] mx-auto"
                style={{ color: "#475569" }}
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
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-[15px] text-white active:scale-[0.98] transition-all"
                  style={{ background: ACCENT, boxShadow: "0 2px 12px rgba(217,119,6,0.25)" }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(217,119,6,0.35)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(217,119,6,0.25)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <Rocket className="w-[18px] h-[18px]" />
                  Launch Your Stack
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClaim}
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-[15px] bg-white active:scale-[0.98] transition-all"
                  style={{ color: DARK, border: "1px solid #E2E8F0" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.color = DARK; }}
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
                    <CheckCircle2 className="w-4 h-4" style={{ color: "#22C55E" }} />
                    <span className="text-[13px] sm:text-[14px] font-medium" style={{ color: "#475569" }}>{label}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          2. TRUSTED BY — Scrolling logo marquee
      ═══════════════════════════════════════════════════════ */}
      <LogoMarquee />

      {/* ═══════════════════════════════════════════════════════
          3. HOW IT WORKS — Clean step cards
      ═══════════════════════════════════════════════════════ */}
      <FadeInSection>
        <section className="py-20 bg-slate-50">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="How It Works"
              title="Three steps to launch"
              subtitle="No gatekeeping. Get your stack live fast."
            />

            <div className="grid lg:grid-cols-3 gap-6 max-w-[1000px] mx-auto">
              {HOW_IT_WORKS.map((step, idx) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="relative bg-white rounded-2xl p-7 transition-all duration-200 group"
                  style={{ border: "1px solid #E2E8F0" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT_BORDER; e.currentTarget.style.boxShadow = "0 4px 16px rgba(217,119,6,0.06)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  {/* Step connector line */}
                  {idx < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden lg:block absolute top-12 -right-3 w-6 h-[2px]" style={{ background: "#E2E8F0" }} />
                  )}
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: ACCENT }}
                    >
                      <span className="text-sm font-black text-white">{step.step}</span>
                    </div>
                    <step.icon className="w-5 h-5 text-slate-400" />
                  </div>
                  <h3 className="text-[16px] font-bold mb-2" style={{ color: DARK }}>{step.title}</h3>
                  <p className="text-[14px] text-slate-600 leading-relaxed mb-3">{step.desc}</p>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#22C55E" }} />
                    <span className="text-[12px] font-semibold text-slate-500">{step.detail}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* ═══════════════════════════════════════════════════════
          4. ALTERNATING FEATURE SECTIONS — G2-style
      ═══════════════════════════════════════════════════════ */}
      <FadeInSection>
        <section className="py-16 sm:py-20 bg-slate-50" style={{ borderTop: "1px solid #F1F5F9" }}>
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Why LaudStack"
              title="Built for founders who ship"
              subtitle="Get discovered, build trust, and grow."
            />

            <div className="space-y-16 sm:space-y-20">
              {BENEFITS_ALTERNATING.map(({ icon: Icon, title, headline, desc, features }, idx) => {
                const isReversed = idx % 2 === 1;
                return (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"} gap-10 lg:gap-16 items-center`}
                  >
                    {/* Text side */}
                    <div className="flex-1">
                      <div
                        className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4"
                        style={{ background: ACCENT_LIGHT, border: `1px solid ${ACCENT_BORDER}` }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: ACCENT }} />
                        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: ACCENT }}>{title}</span>
                      </div>
                      <h3
                        className="text-xl sm:text-2xl lg:text-[28px] font-extrabold tracking-tight mb-4"
                        style={{ color: DARK, letterSpacing: "-0.02em" }}
                      >
                        {headline}
                      </h3>
                      <p className="text-[15px] text-slate-600 leading-relaxed mb-6">{desc}</p>
                      <div className="grid grid-cols-2 gap-3">
                        {features.map((f) => (
                          <div key={f} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#22C55E" }} />
                            <span className="text-[13px] sm:text-[14px] font-medium text-slate-600">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Visual side — styled card mockup */}
                    <div className="flex-1 w-full max-w-[480px]">
                      <div
                        className="rounded-2xl p-6 sm:p-8"
                        style={{
                          background: "linear-gradient(135deg, #FAFBFC 0%, #F5F8FF 100%)",
                          border: "1px solid #E2E8F0",
                        }}
                      >
                        {/* Mock dashboard card */}
                        <div className="bg-slate-50 rounded-xl p-5 mb-4" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: ACCENT_LIGHT }}>
                                <Icon className="w-4 h-4" style={{ color: ACCENT }} />
                              </div>
                              <span className="text-[13px] font-bold" style={{ color: DARK }}>{title}</span>
                            </div>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#ECFDF5", color: "#059669" }}>Active</span>
                          </div>
                          {/* Metric placeholders — illustrative only */}
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { label: idx === 0 ? "Page views" : idx === 1 ? "Reviews" : "Impressions" },
                              { label: idx === 0 ? "Clicks" : idx === 1 ? "Avg rating" : "Rank change" },
                            ].map(({ label }) => (
                              <div key={label} className="bg-slate-50 rounded-lg p-3">
                                <div className="h-5 bg-slate-200 rounded w-16 mb-1" />
                                <div className="text-[11px] text-slate-500 font-medium">{label}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Mock activity items */}
                        <div className="space-y-2">
                          {[1, 2].map((i) => (
                            <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-2.5" style={{ border: "1px solid #F1F5F9" }}>
                              <div className="w-6 h-6 rounded-full bg-slate-100" />
                              <div className="flex-1">
                                <div className="h-2.5 bg-slate-100 rounded w-3/4 mb-1" />
                                <div className="h-2 bg-slate-50 rounded w-1/2" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* ═══════════════════════════════════════════════════════
          5. TESTIMONIAL — Professional quote section
      ═══════════════════════════════════════════════════════ */}
      <FadeInSection>
        <section className="py-16 sm:py-20 bg-slate-50">
          <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-6"
              style={{ background: ACCENT_LIGHT, border: `1px solid ${ACCENT_BORDER}` }}
            >
              <Quote className="w-6 h-6" style={{ color: ACCENT }} />
            </div>
            <blockquote
              className="text-lg sm:text-xl lg:text-[22px] font-semibold leading-relaxed mb-8"
              style={{ color: DARK }}
            >
              &ldquo;The LaunchPad made it simple to get our tool listed and start collecting real feedback from the community. The Founder Dashboard gives us everything we need to engage and grow.&rdquo;
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: ACCENT_LIGHT }}>
                <Rocket className="w-5 h-5" style={{ color: ACCENT }} />
              </div>
              <div className="text-left">
                <p className="text-[14px] font-bold" style={{ color: DARK }}>LaudStack Founders</p>
                <p className="text-[13px] text-slate-600">Join the community</p>
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* ═══════════════════════════════════════════════════════
          6. RECENTLY LAUNCHED
      ═══════════════════════════════════════════════════════ */}
      <FadeInSection>
        <section className="py-16" style={{ background: "#FAFBFC", borderTop: "1px solid #E2E8F0", borderBottom: "1px solid #E2E8F0" }}>
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
              <div>
                <div
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3"
                  style={{ background: ACCENT_LIGHT, border: `1px solid ${ACCENT_BORDER}` }}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: ACCENT }}>Recently Launched</span>
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-[28px] font-extrabold tracking-tight" style={{ color: DARK }}>
                  Stacks launched recently
                </h2>
              </div>
              <button
                onClick={() => router.push("/recently-added")}
                className="text-[13px] font-bold flex items-center gap-1 transition-colors"
                style={{ color: ACCENT }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.75"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-4 animate-pulse" style={{ border: "1px solid #E2E8F0" }}>
                    <div className="w-12 h-12 rounded-xl bg-slate-100 mx-auto mb-3" />
                    <div className="h-3 bg-slate-100 rounded w-3/4 mx-auto mb-2" />
                    <div className="h-2.5 bg-slate-100 rounded w-1/2 mx-auto" />
                  </div>
                ))}
              </div>
            ) : recentTools.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {recentTools.map((tool) => (
                  <div
                    key={tool.id}
                    onClick={() => router.push(`/tools/${tool.slug}`)}
                    className="bg-white rounded-xl p-4 cursor-pointer flex flex-col items-center text-center transition-all duration-200"
                    style={{ border: "1px solid #E2E8F0" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT_BORDER; e.currentTarget.style.boxShadow = "0 4px 16px rgba(217,119,6,0.06)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center mb-3" style={{ border: "1px solid #F1F5F9", background: "#FAFBFC" }}>
                      <LogoWithFallback src={tool.logo_url} alt={tool.name} className="w-9 h-9 object-contain" fallbackSize="text-lg" />
                    </div>
                    <h4 className="text-[13px] font-bold mb-0.5 truncate w-full" style={{ color: DARK }}>{tool.name}</h4>
                    <span className="text-[11px] text-slate-500 font-medium truncate w-full">{tool.category}</span>
                    <div className="flex items-center gap-2 mt-2">
                      {tool.average_rating > 0 && (
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-[11px] font-bold text-slate-600">{tool.average_rating.toFixed(1)}</span>
                        </div>
                      )}
                      <div
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded"
                        style={{
                          border: '1.5px solid #E2E8F0',
                          background: '#F8FAFC',
                          color: '#64748B',
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
                          <path fill="#FFFFFF" stroke="currentColor" strokeWidth="1.5" d="M6.579 3.467c.71-1.067 2.132-1.067 2.842 0L12.975 8.8c.878 1.318.043 3.2-1.422 3.2H4.447c-1.464 0-2.3-1.882-1.422-3.2z" />
                        </svg>
                        {tool.upvote_count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-[15px] text-slate-600">No recently launched stacks yet. Be the first to launch!</p>
                <button
                  onClick={handleLaunch}
                  className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-[14px] text-white transition-colors"
                  style={{ background: ACCENT }}
                >
                  <Rocket className="w-4 h-4" />
                  Launch Your Stack
                </button>
              </div>
            )}
          </div>
        </section>
      </FadeInSection>

      {/* ═══════════════════════════════════════════════════════
          7. FINAL CTA
      ═══════════════════════════════════════════════════════ */}
      <FadeInSection>
        <section className="py-16" style={{ background: "#FAFBFC", borderTop: "1px solid #E2E8F0" }}>
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-[640px] mx-auto text-center">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-6"
                style={{ background: ACCENT }}
              >
                <Rocket className="w-6 h-6 text-white" />
              </div>

              <h2
                className="text-2xl sm:text-3xl lg:text-[36px] font-extrabold tracking-tight mb-4"
                style={{ color: DARK, letterSpacing: "-0.02em" }}
              >
                Ready to launch your stack?
              </h2>
              <p className="text-slate-600 text-[15px] sm:text-[16px] leading-relaxed mb-8 max-w-md mx-auto">
                Join the growing community of SaaS and AI tools on LaudStack. Free to start. Verified in 24 hours.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                <button
                  onClick={handleLaunch}
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-[15px] text-white active:scale-[0.98] transition-all"
                  style={{ background: ACCENT, boxShadow: "0 2px 12px rgba(217,119,6,0.25)" }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(217,119,6,0.35)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(217,119,6,0.25)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <Rocket className="w-[18px] h-[18px]" />
                  Launch Your Stack Free
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClaim}
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-[15px] bg-white active:scale-[0.98] transition-all"
                  style={{ color: DARK, border: "1px solid #E2E8F0" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.color = DARK; }}
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
                    <span className="text-[13px] sm:text-[14px] text-slate-600 font-medium">{label}</span>
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
