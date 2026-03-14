"use client";
export const dynamic = "force-dynamic";

/*
 * LaunchPad — LaudStack
 *
 * Premium redesign: No pricing. Rich graphics. Well-aligned.
 * Design: Clean white, professional, G2-inspired, amber accent
 *
 * Sections:
 *   1. Hero           — Bold value prop + dual CTAs + animated graphic
 *   2. Stats bar      — Social proof numbers
 *   3. How It Works   — 4-step visual process
 *   4. Benefits       — 6 founder benefits with icons
 *   5. Testimonials   — Founder quotes
 *   6. FAQ            — Common questions
 *   7. Final CTA      — Launch / Claim
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Rocket, Shield, BarChart3, MessageSquare, Crown, Zap,
  Star, Users, Globe, CheckCircle2, ArrowRight, ChevronDown,
  ChevronUp, BadgeCheck, TrendingUp, Eye, Award, Clock,
  Building2, Search, Sparkles, Target, Megaphone,
  HeartHandshake, Lock
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { getPlatformStats } from "@/app/actions/public";

// ─── Data ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_STATS = [
  { value: "—", label: "Professionals on LaudStack" },
  { value: "—", label: "Verified stacks listed" },
  { value: "—", label: "Average product rating" },
  { value: "—", label: "Verified reviews" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Building2,
    title: "Create Your Account",
    desc: "Sign up free in under 2 minutes. No credit card required. Every founder starts with a standard listing.",
  },
  {
    step: "02",
    icon: Rocket,
    title: "Launch or Claim Your Stack",
    desc: "Launch a new listing or claim an existing one. Add your stack's details, screenshots, and description.",
  },
  {
    step: "03",
    icon: Shield,
    title: "Founder Verification",
    desc: "Prove ownership via DNS record, HTML meta tag, or domain email. Our team reviews within 24 hours.",
  },
  {
    step: "04",
    icon: Crown,
    title: "Unlock Your Dashboard",
    desc: "Reply to reviews, manage deals, run promotions, and track analytics — all from your Founder Dashboard.",
  },
];

const BENEFITS = [
  {
    icon: BarChart3,
    color: "#2563EB",
    bg: "#EFF6FF",
    title: "Full Analytics Suite",
    desc: "Track page views, click-throughs, review sentiment, laud trends, and conversion data. Know exactly how your listing performs.",
  },
  {
    icon: MessageSquare,
    color: "#D97706",
    bg: "#FFFBEB",
    title: "Reply to Reviews",
    desc: "Engage directly with users. Thank reviewers, address concerns, and show prospects that you listen.",
  },
  {
    icon: TrendingUp,
    color: "#059669",
    bg: "#ECFDF5",
    title: "Rising Placement",
    desc: "Verified stacks are eligible for weekly rising spots, editor picks, and category leaderboards.",
  },
  {
    icon: Target,
    color: "#DC2626",
    bg: "#FFF1F2",
    title: "Targeted Exposure",
    desc: "Reach thousands of professionals actively searching for products in your exact category. Zero cold outreach needed.",
  },
  {
    icon: Megaphone,
    color: "#7C3AED",
    bg: "#F5F3FF",
    title: "Deals & Promotions",
    desc: "Run exclusive deals for LaudStack users. Boost conversions and build a loyal early-adopter community.",
  },
  {
    icon: HeartHandshake,
    color: "#0891B2",
    bg: "#ECFEFF",
    title: "Community Trust",
    desc: "A verified founder badge signals legitimacy. Users trust products with active, responsive founders.",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Founder, Writr.ai",
    avatar: "SC",
    avatarBg: "#F59E0B",
    quote: "LaudStack drove 400 signups in our first month. The verified badge alone increased our trial conversion by 28%. It's the best ROI we've seen from any discovery platform.",
    stars: 5,
    metric: "+400 signups in month 1",
  },
  {
    name: "Marcus Webb",
    role: "CEO, Stackly",
    avatar: "MW",
    avatarBg: "#2563EB",
    quote: "The analytics dashboard is genuinely useful. I can see exactly which reviews are driving clicks, which categories are converting, and where to focus my messaging.",
    stars: 5,
    metric: "3× click-through rate",
  },
  {
    name: "Priya Nair",
    role: "Co-founder, Loopkit",
    avatar: "PN",
    avatarBg: "#059669",
    quote: "We claimed our listing in 20 minutes. Within a week we had 12 new reviews and our ranking jumped from page 3 to the top 10 in our category. Incredible.",
    stars: 5,
    metric: "Top 10 in category",
  },
];

const FAQ_ITEMS = [
  {
    q: "Is it free to list my product on LaudStack?",
    a: "Yes. Creating a basic listing is completely free — no credit card required. You can collect reviews and appear in search results at no cost.",
  },
  {
    q: "How does founder verification work?",
    a: "You can verify ownership by adding a DNS TXT record, placing an HTML meta tag on your site, or emailing us from your domain. Our team reviews and approves within 24 hours.",
  },
  {
    q: "What happens after I'm verified?",
    a: "You unlock the full Founder Dashboard: reply to reviews, manage deals, track analytics, run promotions, and access priority support.",
  },
  {
    q: "Can I claim a product that's already listed?",
    a: "Absolutely. If your stack is already on LaudStack, click 'Claim Your Stack' and complete the verification process to take ownership of the listing.",
  },
  {
    q: "How long does it take to get listed?",
    a: "New stack launches are reviewed within 48 hours. Verified founders get priority review and typically go live within 24 hours.",
  },
  {
    q: "Do I need to be the founder to claim a listing?",
    a: "You need to prove ownership of the domain associated with the product. This can be a founder, co-founder, or an authorized team member with domain access.",
  },
];

// ─── Hero Graphic ─────────────────────────────────────────────────────────────

function HeroGraphic() {
  return (
    <div className="relative w-full max-w-[500px] mx-auto select-none">
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(245,158,11,0.10) 0%, transparent 70%)" }}
      />

      {/* Main card */}
      <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/60 overflow-hidden">
        {/* Card header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center shadow-md shadow-amber-200">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-900">YourTool.io</div>
              <div className="text-xs text-slate-400 font-medium">AI Productivity · Just launched</div>
            </div>
            <div className="ml-auto flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-emerald-700">Verified</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
          {[
            { label: "Views",   value: "2,847", icon: Eye,      color: "#2563EB" },
            { label: "Reviews", value: "34",    icon: Star,     color: "#D97706" },
            { label: "Lauds", value: "218",   icon: ChevronUp,color: "#059669" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="px-4 py-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Icon className="w-3.5 h-3.5" style={{ color }} />
                <span className="text-xs font-semibold text-slate-400">{label}</span>
              </div>
              <div className="text-lg font-black text-slate-900">{value}</div>
            </div>
          ))}
        </div>

        {/* Review preview */}
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-black text-blue-600 shrink-0">
              JL
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700">Best product in its category</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                Transformed how our team works. The onboarding is smooth and the results speak for themselves.
              </p>
            </div>
          </div>
        </div>

        {/* Founder reply */}
        <div className="px-6 py-4 bg-amber-50/50">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center text-xs font-black text-white shrink-0">
              F
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-bold text-slate-900">Founder Reply</span>
                <BadgeCheck className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Thank you so much! We&apos;re thrilled it&apos;s making a difference. More features coming next week 🚀
              </p>
            </div>
          </div>
        </div>

        {/* Badges row */}
        <div className="px-6 py-3 flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-3 py-1">
            <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-xs font-bold text-orange-700">#3 Rising This Week</span>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
            <Award className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-xs font-bold text-blue-700">Editor&apos;s Pick</span>
          </div>
        </div>
      </div>

      {/* Floating — new review */}
      <div className="absolute -top-4 -right-4 bg-white rounded-2xl border border-slate-200 shadow-xl px-4 py-2.5 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>
        <div>
          <div className="text-xs font-black text-slate-900">New Review!</div>
          <div className="text-[10px] text-slate-400 font-medium">5 stars · just now</div>
        </div>
      </div>

      {/* Floating — views */}
      <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl border border-slate-200 shadow-xl px-4 py-2.5 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
          <Users className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <div className="text-xs font-black text-slate-900">+127 views today</div>
          <div className="text-[10px] text-slate-400 font-medium">↑ 34% vs yesterday</div>
        </div>
      </div>
    </div>
  );
}

// ─── FAQ Item ─────────────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="text-sm font-bold text-slate-900">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-amber-500 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-6 pb-5 border-t border-slate-100">
          <p className="text-sm text-slate-600 leading-relaxed pt-4">{a}</p>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LaunchPad() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [STATS, setStats] = useState(DEFAULT_STATS);

  useEffect(() => {
    getPlatformStats().then(s => {
      setStats([
        { value: `${(s.totalUsers).toLocaleString()}+`, label: 'Professionals on LaudStack' },
        { value: `${s.totalTools}+`, label: 'Verified stacks listed' },
        { value: `${s.averageRating}\u2605`, label: 'Average product rating' },
        { value: s.verifiedPct, label: 'Verified reviews' },
      ]);
    }).catch(() => {});
  }, []);

  const handleLaunch = () =>
    router.push(isAuthenticated ? "/launch" : "/auth/login?next=/launch");
  const handleClaim = () =>
    router.push(isAuthenticated ? "/claim" : "/auth/login?next=/claim");

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* ══════════════════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════════════════ */}
      <section className="pt-[72px]">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 mb-8">
                <Rocket className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">For Founders</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-[1.06] tracking-tight mb-6">
                Get Your Tool
                <br />
                <span className="text-amber-500">Discovered.</span>
              </h1>

              <p className="text-lg text-slate-500 leading-relaxed mb-10 max-w-[480px]">
                List your AI or SaaS tool on LaudStack and reach professionals actively searching for solutions. Verified founders get a dashboard, analytics, and direct access to their audience.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button
                  onClick={handleLaunch}
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl font-bold text-base text-slate-900 transition-all hover:scale-[1.02] shadow-lg shadow-amber-400/30 hover:shadow-amber-400/50"
                  style={{ background: "#F59E0B" }}
                >
                  <Rocket className="w-5 h-5" />
                  Launch Your Tool
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClaim}
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl font-bold text-base text-slate-700 bg-white border-2 border-slate-200 hover:border-amber-300 hover:text-amber-700 transition-all"
                >
                  <BadgeCheck className="w-5 h-5" />
                  Claim Existing Listing
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                {["Free to list", "No credit card", "Verified in 24h", "Real audience"].map(label => (
                  <div key={label} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-semibold text-slate-600">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — graphic */}
            <div className="flex justify-center lg:justify-end">
              <HeroGraphic />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          2. STATS BAR
      ══════════════════════════════════════════════════════ */}
      <section className="border-y border-slate-100 bg-slate-50">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-black text-slate-900 mb-1">{value}</div>
                <div className="text-sm font-medium text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          3. HOW IT WORKS
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 mb-5">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Simple Process</span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">
              From signup to verified in 4 steps
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              No gatekeeping. No lengthy approval process. Get your stack in front of buyers fast.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, idx) => (
              <div key={step.step} className="relative">
                {idx < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-[26px] left-[calc(100%-8px)] w-8 h-px border-t-2 border-dashed border-amber-200 z-10" />
                )}
                <div className="bg-white border border-slate-200 rounded-2xl p-7 h-full hover:border-amber-200 hover:shadow-lg hover:shadow-amber-50 transition-all">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                      <step.icon className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className="text-xs font-black text-amber-400 tracking-widest">{step.step}</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={handleLaunch}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base text-slate-900 transition-all hover:scale-[1.02] shadow-lg shadow-amber-400/25"
              style={{ background: "#F59E0B" }}
            >
              <Rocket className="w-5 h-5" />
              Start Your Launch
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          4. BENEFITS
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Founder Benefits</span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">
              Everything you need to grow
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Verified founders get a full suite of tools to manage their listing, engage their audience, and track performance.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map(({ icon: Icon, color, bg, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-slate-200 p-7 hover:border-slate-300 hover:shadow-md transition-all"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: bg }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          5. TESTIMONIALS
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 mb-5">
              <Star className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Founder Stories</span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">
              Founders who launched here
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Real results from real founders who used LaudStack to grow their tools.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, avatar, avatarBg, quote, stars, metric }) => (
              <div
                key={name}
                className="bg-white border border-slate-200 rounded-2xl p-7 flex flex-col hover:shadow-lg hover:border-slate-300 transition-all"
              >
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-sm text-slate-700 leading-relaxed flex-1 mb-6">
                  &ldquo;{quote}&rdquo;
                </p>

                <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5 mb-6 self-start">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700">{metric}</span>
                </div>

                <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0"
                    style={{ background: avatarBg }}
                  >
                    {avatar}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{name}</div>
                    <div className="text-xs text-slate-400 font-medium">{role}</div>
                  </div>
                  <BadgeCheck className="w-4 h-4 text-amber-400 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          6. FAQ
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-[860px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-full px-4 py-1.5 mb-5">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">FAQ</span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">
              Common questions
            </h2>
            <p className="text-slate-500 text-lg">
              Everything founders ask before getting started.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map(item => (
              <FAQItem key={item.q} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          7. FINAL CTA
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="bg-slate-900 rounded-3xl overflow-hidden relative">
            {/* Dot pattern */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(245,158,11,0.4) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            {/* Amber glow */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ background: "#F59E0B" }}
            />

            <div className="relative z-10 px-10 py-16 lg:py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-400 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-amber-400/30">
                <Rocket className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-5">
                Ready to launch?
              </h2>
              <p className="text-slate-400 text-lg max-w-lg mx-auto mb-10">
                Join the growing community of tools listed on LaudStack. Free to start. Verified in 24 hours. Real audience from day one.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleLaunch}
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base text-slate-900 transition-all hover:scale-[1.02] shadow-xl shadow-amber-400/30"
                  style={{ background: "#F59E0B" }}
                >
                  <Rocket className="w-5 h-5" />
                  Launch Your Tool Free
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClaim}
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base text-white border-2 border-white/20 hover:border-white/40 hover:bg-white/5 transition-all"
                >
                  <BadgeCheck className="w-5 h-5" />
                  Claim Your Listing
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-8 mt-10 pt-10 border-t border-white/10">
                {[
                  { icon: Lock,   label: "No credit card required" },
                  { icon: Clock,  label: "Verified in 24 hours" },
                  { icon: Globe,  label: "12,400+ professionals" },
                  { icon: Shield, label: "Trusted platform" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-semibold text-slate-400">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
