"use client";

/*
 * LaunchPad — LaudStack
 *
 * Landing page for founders to submit and verify their stacks.
 * Design: Clean white, professional, amber accent, light theme.
 */

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Rocket, Shield, BarChart3, MessageSquare, Crown,
  Star, CheckCircle2, ArrowRight, ChevronDown,
  ChevronUp, BadgeCheck, TrendingUp, Clock,
  Building2, Target, Megaphone,
  HeartHandshake, Lock, Check, Minus,
  ThumbsUp
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

// ─── Logo bar brands ─────────────────────────────────────────────────────────
// These represent the types of tools listed on LaudStack, not endorsements.

const PLATFORM_BRANDS = [
  "Notion", "Linear", "Vercel", "Stripe", "Figma", "Supabase",
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

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-[36px] sm:text-[42px] lg:text-[52px] font-black text-slate-900 leading-[1.1] tracking-tight mb-5"
            >
              Get your stack in front of<br />
              <span className="text-amber-500">the right audience.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="text-[16px] sm:text-[18px] text-slate-600 leading-relaxed mb-10 max-w-[560px] mx-auto"
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
                  <span className="text-[13px] sm:text-[14px] font-medium text-slate-500">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          2. BRANDS BAR — Types of tools on LaudStack
      ═══════════════════════════════════════════════════════ */}
      <section className="border-y border-slate-100 bg-slate-50/40">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
          <div className="flex flex-col items-center gap-6">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">
              Built for tools like
            </span>
            <div className="flex items-center gap-8 sm:gap-14 flex-wrap justify-center">
              {PLATFORM_BRANDS.map((name) => (
                <span key={name} className="text-[15px] sm:text-[16px] font-bold text-slate-300 tracking-tight select-none">
                  {name}
                </span>
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
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">How It Works</p>
              <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-black text-slate-900 tracking-tight mb-4">
                Three steps to launch
              </h2>
              <p className="text-slate-600 text-[15px] sm:text-[16px] leading-relaxed max-w-lg mx-auto">
                No gatekeeping. No lengthy approvals. Get your stack live and in front of buyers fast.
              </p>
            </div>

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
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center">
                      <span className="text-sm font-black text-white">{step.step}</span>
                    </div>
                    <step.icon className="w-5 h-5 text-slate-400" />
                  </div>
                  <h3 className="text-[16px] font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mb-4">{step.desc}</p>
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
      ═══════════════════════════════════════════════════════ */}
      <FadeInSection>
        <section className="py-20 bg-slate-50 border-y border-slate-100">
          <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="text-center mb-12">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">What You Get</p>
              <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-black text-slate-900 tracking-tight mb-4">
                Free listing vs. verified founder
              </h2>
              <p className="text-slate-600 text-[15px] sm:text-[16px] leading-relaxed max-w-lg mx-auto">
                Every stack starts free. Verify ownership to unlock the full founder toolkit.
              </p>
            </div>

            {/* Desktop comparison table */}
            <div className="hidden sm:block bg-white border border-slate-200 rounded-2xl overflow-hidden">
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
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">Why LaudStack</p>
              <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-black text-slate-900 tracking-tight mb-4">
                Built for founders who ship
              </h2>
              <p className="text-slate-600 text-[15px] sm:text-[16px] leading-relaxed max-w-lg mx-auto">
                Everything you need to get discovered, build trust, and grow your user base.
              </p>
            </div>

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
                  <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* ═══════════════════════════════════════════════════════
          6. RECENTLY LAUNCHED — Real DB data showcase
      ═══════════════════════════════════════════════════════ */}
      <FadeInSection>
        <section className="py-16 bg-slate-50 border-y border-slate-100">
          <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">Recently Launched</p>
                <h2 className="text-xl sm:text-2xl lg:text-[28px] font-black text-slate-900 tracking-tight">
                  Stacks launched recently
                </h2>
              </div>
              <button
                onClick={() => router.push("/recently-added")}
                className="text-[13px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse">
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
                    className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-amber-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-center text-center"
                  >
                    <div className="w-12 h-12 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden flex items-center justify-center mb-3">
                      {tool.logo_url ? (
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
                      ) : (
                        <span className="text-lg font-black text-slate-400">{tool.name.charAt(0)}</span>
                      )}
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
            ) : (
              <div className="text-center py-10">
                <p className="text-[15px] text-slate-400">No recently launched stacks yet. Be the first to launch!</p>
                <button
                  onClick={handleLaunch}
                  className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-[14px] text-white bg-amber-500 hover:bg-amber-600 transition-colors"
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
          7. FAQ
      ═══════════════════════════════════════════════════════ */}
      <FadeInSection>
        <section className="py-20 bg-white">
          <div className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="text-center mb-12">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">FAQ</p>
              <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-black text-slate-900 tracking-tight mb-4">
                Common questions
              </h2>
              <p className="text-slate-600 text-[15px] sm:text-[16px] leading-relaxed">
                Everything founders ask before getting started.
              </p>
            </div>

            <div className="space-y-2.5">
              {FAQ_ITEMS.map((item, idx) => (
                <FAQItem
                  key={idx}
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
          8. FINAL CTA
      ═══════════════════════════════════════════════════════ */}
      <FadeInSection>
        <section className="py-16 bg-slate-50 border-t border-slate-100">
          <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="max-w-[640px] mx-auto text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center mx-auto mb-6">
                <Rocket className="w-6 h-6 text-white" />
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-black text-slate-900 tracking-tight mb-4">
                Ready to launch your stack?
              </h2>
              <p className="text-slate-600 text-[15px] sm:text-[16px] leading-relaxed mb-8 max-w-md mx-auto">
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
                    <span className="text-[13px] sm:text-[14px] text-slate-500 font-medium">{label}</span>
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
