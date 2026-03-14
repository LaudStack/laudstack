"use client";
export const dynamic = "force-dynamic";

/*
 * LaunchPad — LaudStack
 *
 * Enterprise-grade landing page for founders.
 * Design: Clean white, professional, no gradients, amber accent.
 * Light theme, consistent with platform design language.
 *
 * Sections:
 *   1. Hero           — Clear value prop, dual CTAs, trust signals
 *   2. Trusted By     — Brand logo bar
 *   3. How It Works   — 3-step numbered process
 *   4. What You Get   — Feature comparison (Free vs Verified)
 *   5. Benefits       — 6 founder benefits in a 3×2 grid
 *   6. Testimonials   — 3 founder quotes
 *   7. FAQ            — Accordion
 *   8. Final CTA      — Clean conversion block
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Rocket, Shield, BarChart3, MessageSquare, Crown,
  Star, CheckCircle2, ArrowRight, ChevronDown,
  ChevronUp, BadgeCheck, TrendingUp, Clock,
  Building2, Target, Megaphone,
  HeartHandshake, Lock, Check, Minus
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";

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

// ─── Trusted-by brand logos (text-based wordmarks for clean rendering) ───────

const TRUSTED_BRANDS = [
  "Notion",
  "Linear",
  "Vercel",
  "Stripe",
  "Figma",
  "Supabase",
];

// ─── FAQ Item ─────────────────────────────────────────────────────────────────

function FAQItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className={`border rounded-xl transition-colors ${isOpen ? "border-amber-200 bg-amber-50/30" : "border-slate-200 bg-white"}`}>
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LaunchPad() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleLaunch = () =>
    router.push(isAuthenticated ? "/launch" : "/auth/login?next=/launch");
  const handleClaim = () =>
    router.push(isAuthenticated ? "/claim" : "/auth/login?next=/claim");

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════
          1. HERO
      ═══════════════════════════════════════════════════════ */}
      <section className="pt-[72px]">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10 pt-16 pb-14 lg:pt-20 lg:pb-16">
          <div className="max-w-[720px] mx-auto text-center">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 mb-7">
              <Rocket className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">LaunchPad for Founders</span>
            </div>

            {/* Headline */}
            <h1 className="text-[42px] lg:text-[52px] font-black text-slate-900 leading-[1.1] tracking-tight mb-5">
              Get your stack in front of<br />
              <span className="text-amber-500">the right audience.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-[18px] text-slate-600 leading-relaxed mb-10 max-w-[560px] mx-auto">
              List your SaaS or AI tool on LaudStack. Reach professionals actively searching for solutions. Free to start, verified in 24 hours.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
              <button
                onClick={handleLaunch}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-[15px] text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-sm"
              >
                <Rocket className="w-[18px] h-[18px]" />
                Launch Your Stack
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleClaim}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-[15px] text-slate-700 bg-white border border-slate-200 hover:border-amber-300 hover:text-amber-700 transition-colors"
              >
                <BadgeCheck className="w-[18px] h-[18px]" />
                Claim Existing Listing
              </button>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
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
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          2. TRUSTED BY — Logo bar
      ═══════════════════════════════════════════════════════ */}
      <section className="border-y border-slate-100 bg-slate-50/40">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10 py-7">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-12">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap shrink-0">
              Trusted by teams at
            </span>
            <div className="flex items-center gap-10 sm:gap-14 flex-wrap justify-center">
              {TRUSTED_BRANDS.map((name) => (
                <span
                  key={name}
                  className="text-[17px] font-bold text-slate-300 tracking-tight select-none"
                  style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                >
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
            {HOW_IT_WORKS.map((step) => (
              <div
                key={step.step}
                className="relative bg-white border border-slate-200 rounded-2xl p-7 hover:border-amber-200 transition-colors"
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          4. WHAT YOU GET — Free vs Verified comparison
      ═══════════════════════════════════════════════════════ */}
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

          {/* Comparison table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_100px_100px] sm:grid-cols-[1fr_120px_120px] border-b border-slate-200 bg-slate-50">
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
                className={`grid grid-cols-[1fr_100px_100px] sm:grid-cols-[1fr_120px_120px] ${idx < COMPARISON_FEATURES.length - 1 ? "border-b border-slate-100" : ""}`}
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

            {/* Table footer CTAs */}
            <div className="grid grid-cols-[1fr_100px_100px] sm:grid-cols-[1fr_120px_120px] border-t border-slate-200 bg-slate-50">
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

          <p className="text-center text-[13px] text-slate-400 mt-5">
            Both tiers are completely free. Verification simply requires proving domain ownership.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          5. BENEFITS
      ═══════════════════════════════════════════════════════ */}
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
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-300 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-slate-500" />
                </div>
                <h3 className="text-[16px] font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-[15px] text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          6. TESTIMONIALS
      ═══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
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
            {TESTIMONIALS.map(({ name, role, initials, color, quote, metric }) => (
              <div
                key={name}
                className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col"
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          7. FAQ
      ═══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
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

      {/* ═══════════════════════════════════════════════════════
          8. FINAL CTA
      ═══════════════════════════════════════════════════════ */}
      <section className="py-16 bg-slate-50 border-t border-slate-100">
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
                className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-[15px] text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-sm"
              >
                <Rocket className="w-[18px] h-[18px]" />
                Launch Your Stack Free
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleClaim}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-[15px] text-slate-700 bg-white border border-slate-200 hover:border-amber-300 hover:text-amber-700 transition-colors"
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

      <Footer />
    </div>
  );
}
