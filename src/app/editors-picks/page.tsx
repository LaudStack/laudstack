"use client";

/*
 * LaudStack — Editor's Picks
 *
 * Hand-curated selections by the LaudStack editorial team.
 * Organised into themed collections with spotlight hero cards.
 * Design: light, professional — purple editorial accent, slate typography, amber secondary.
 */

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LogoWithFallback from "@/components/LogoWithFallback";
import {
  Shield,
  Star,
  ExternalLink,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Award,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  Zap,
  TrendingUp,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToolsData } from "@/hooks/useToolsData";
import type { Tool } from "@/lib/types";

/* ─── Editorial collections config ──────────────────────────────────────────── */

const EDITORIAL_COLLECTIONS = [
  {
    id: "best_ai_2026",
    label: "Best AI Stacks of 2026",
    icon: Sparkles,
    colorClasses: {
      pill: "bg-purple-50 border-purple-200 text-purple-700",
      pillIcon: "text-purple-600",
      tab: "text-purple-700 border-purple-600",
      tabIcon: "text-purple-600",
      cardBorder: "border-purple-200",
      cardHover: "hover:border-purple-300 hover:shadow-purple-100/60",
      accentBar: "bg-purple-600",
      badge: "bg-purple-50 text-purple-700 border-purple-200",
      iconBox: "bg-purple-50 border-purple-200",
      iconColor: "text-purple-600",
      visitBtn: "bg-purple-600 hover:bg-purple-700",
      countColor: "text-purple-600",
    },
    description:
      "The most impactful AI stacks redefining how professionals work this year — rigorously tested by our editorial team.",
    badgeFilter: "editors_pick" as const,
    limit: 6,
  },
  {
    id: "top_rated",
    label: "Highest Rated by Users",
    icon: Star,
    colorClasses: {
      pill: "bg-amber-50 border-amber-200 text-amber-700",
      pillIcon: "text-amber-600",
      tab: "text-amber-700 border-amber-600",
      tabIcon: "text-amber-600",
      cardBorder: "border-amber-200",
      cardHover: "hover:border-amber-300 hover:shadow-amber-100/60",
      accentBar: "bg-amber-500",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      iconBox: "bg-amber-50 border-amber-200",
      iconColor: "text-amber-600",
      visitBtn: "bg-amber-500 hover:bg-amber-600",
      countColor: "text-amber-600",
    },
    description:
      "Stacks that consistently earn 4.7 stars or above across hundreds of verified reviews.",
    badgeFilter: "top_rated" as const,
    limit: 6,
  },
  {
    id: "best_value",
    label: "Best Value for Money",
    icon: CheckCircle2,
    colorClasses: {
      pill: "bg-emerald-50 border-emerald-200 text-emerald-700",
      pillIcon: "text-emerald-600",
      tab: "text-emerald-700 border-emerald-600",
      tabIcon: "text-emerald-600",
      cardBorder: "border-emerald-200",
      cardHover: "hover:border-emerald-300 hover:shadow-emerald-100/60",
      accentBar: "bg-emerald-500",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconBox: "bg-emerald-50 border-emerald-200",
      iconColor: "text-emerald-600",
      visitBtn: "bg-emerald-600 hover:bg-emerald-700",
      countColor: "text-emerald-600",
    },
    description:
      "Free and Freemium stacks that punch well above their price point — verified by the community.",
    badgeFilter: "best_value" as const,
    limit: 6,
  },
  {
    id: "new_standouts",
    label: "New Standouts",
    icon: Zap,
    colorClasses: {
      pill: "bg-sky-50 border-sky-200 text-sky-700",
      pillIcon: "text-sky-600",
      tab: "text-sky-700 border-sky-600",
      tabIcon: "text-sky-600",
      cardBorder: "border-sky-200",
      cardHover: "hover:border-sky-300 hover:shadow-sky-100/60",
      accentBar: "bg-sky-500",
      badge: "bg-sky-50 text-sky-700 border-sky-200",
      iconBox: "bg-sky-50 border-sky-200",
      iconColor: "text-sky-600",
      visitBtn: "bg-sky-600 hover:bg-sky-700",
      countColor: "text-sky-600",
    },
    description:
      "Recently launched stacks that have already earned editorial recognition for quality and innovation.",
    badgeFilter: "new_launch" as const,
    limit: 6,
  },
];

/* ─── Pricing badge class helper ────────────────────────────────────────────── */

function pricingClasses(model: string): string {
  if (model === "Free")
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (model === "Freemium") return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
}

/* ─── Spotlight Hero Card ───────────────────────────────────────────────────── */

function SpotlightCard({
  tool,
  cc,
}: {
  tool: Tool;
  cc: (typeof EDITORIAL_COLLECTIONS)[0]["colorClasses"];
}) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/tools/${tool.slug}`)}
      className={`group bg-white border-[1.5px] ${cc.cardBorder} rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 ${cc.cardHover} hover:shadow-lg hover:-translate-y-0.5 flex flex-col h-full`}
    >
      {/* Accent top bar */}
      <div className={`h-1 ${cc.accentBar} shrink-0`} />

      <div className="p-5 sm:p-7 flex-1 flex flex-col gap-4">
        {/* Logo + name row */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shrink-0 border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
            <LogoWithFallback
              src={tool.logo_url}
              alt={tool.name}
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              fallbackSize="text-2xl"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {tool.name}
              </span>
              {tool.is_verified && (
                <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
              )}
            </div>
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${cc.badge}`}
            >
              <Shield className="w-2.5 h-2.5" /> Editor&apos;s Pick
            </span>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-[14px] text-slate-600 leading-relaxed">
          {tool.tagline}
        </p>

        {/* Description excerpt */}
        {tool.description && (
          <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-3">
            {tool.description}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 flex-wrap mt-auto pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className="w-3.5 h-3.5"
                fill={
                  i <= Math.round(tool.average_rating) ? "#FBBF24" : "#E2E8F0"
                }
                color={
                  i <= Math.round(tool.average_rating) ? "#FBBF24" : "#E2E8F0"
                }
              />
            ))}
            <span className="text-[13px] font-bold text-slate-900 ml-1">
              {tool.average_rating.toFixed(1)}
            </span>
            <span className="text-[12px] text-slate-400">
              ({tool.review_count})
            </span>
          </div>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${pricingClasses(tool.pricing_model)}`}
          >
            {tool.pricing_model}
          </span>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
            {tool.category}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2.5 mt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(tool.website_url, "_blank");
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-bold text-white ${cc.visitBtn} transition-colors cursor-pointer`}
          >
            <ExternalLink className="w-3.5 h-3.5" /> Visit Site
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-bold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer">
            View Details <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Compact List Card ─────────────────────────────────────────────────────── */

function CompactCard({
  tool,
  rank,
  cc,
}: {
  tool: Tool;
  rank: number;
  cc: (typeof EDITORIAL_COLLECTIONS)[0]["colorClasses"];
}) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/tools/${tool.slug}`)}
      className={`group bg-white border border-slate-200 rounded-xl px-3.5 sm:px-4 py-3 flex items-center gap-3 cursor-pointer transition-all duration-200 hover:shadow-md ${cc.cardHover} hover:-translate-y-0.5 shadow-sm`}
    >
      {/* Rank */}
      <span className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-[11px] font-black text-slate-500 shrink-0">
        {rank}
      </span>

      {/* Logo */}
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shrink-0 border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
        <LogoWithFallback
          src={tool.logo_url}
          alt={tool.name}
          className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
          fallbackSize="text-sm"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[13px] sm:text-[14px] font-extrabold text-slate-900 tracking-tight truncate">
            {tool.name}
          </span>
          {tool.is_verified && (
            <ShieldCheck className="w-3 h-3 text-green-500 shrink-0" />
          )}
        </div>
        <p className="text-[11px] sm:text-[12px] text-slate-500 truncate leading-snug">
          {tool.tagline}
        </p>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 shrink-0">
        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
        <span className="text-[12px] font-bold text-slate-900">
          {tool.average_rating.toFixed(1)}
        </span>
      </div>

      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0 hidden sm:block" />
    </div>
  );
}

/* ─── Collection Summary Card (bottom grid) ─────────────────────────────────── */

function CollectionCard({
  col,
  toolCount,
  onClick,
}: {
  col: (typeof EDITORIAL_COLLECTIONS)[0];
  toolCount: number;
  onClick: () => void;
}) {
  const Icon = col.icon;
  const cc = col.colorClasses;
  return (
    <button
      onClick={onClick}
      className={`group text-left bg-white border-[1.5px] ${cc.cardBorder} rounded-2xl p-5 cursor-pointer transition-all duration-200 ${cc.cardHover} hover:shadow-lg hover:-translate-y-0.5 w-full`}
    >
      <div
        className={`w-10 h-10 rounded-xl ${cc.iconBox} border flex items-center justify-center mb-3.5`}
      >
        <Icon className={`w-[18px] h-[18px] ${cc.iconColor}`} />
      </div>
      <p className="text-[14px] font-extrabold text-slate-900 tracking-tight mb-1.5">
        {col.label}
      </p>
      <p className="text-[12px] text-slate-500 leading-relaxed mb-3 line-clamp-2">
        {col.description}
      </p>
      <div
        className={`flex items-center gap-1.5 text-[12px] font-bold ${cc.countColor}`}
      >
        {toolCount} stacks{" "}
        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </button>
  );
}

/* ─── Loading Skeletons ─────────────────────────────────────────────────────── */

function SpotlightSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-1 bg-slate-200" />
      <div className="p-5 sm:p-7 flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-200" />
          <div className="flex-1">
            <div className="w-32 h-5 bg-slate-200 rounded mb-2" />
            <div className="w-24 h-4 bg-slate-200 rounded" />
          </div>
        </div>
        <div className="w-full h-4 bg-slate-200 rounded" />
        <div className="w-3/4 h-4 bg-slate-200 rounded" />
        <div className="w-full h-3 bg-slate-200 rounded" />
        <div className="w-2/3 h-3 bg-slate-200 rounded" />
        <div className="border-t border-slate-100 pt-4 flex gap-3">
          <div className="w-24 h-4 bg-slate-200 rounded" />
          <div className="w-16 h-4 bg-slate-200 rounded" />
        </div>
        <div className="flex gap-2.5">
          <div className="flex-1 h-10 bg-slate-200 rounded-xl" />
          <div className="w-32 h-10 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function CompactSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3.5 sm:px-4 py-3 flex items-center gap-3 shadow-sm animate-pulse">
      <div className="w-6 h-6 rounded-lg bg-slate-200" />
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-200" />
      <div className="flex-1">
        <div className="w-24 h-4 bg-slate-200 rounded mb-1.5" />
        <div className="w-36 h-3 bg-slate-200 rounded" />
      </div>
      <div className="w-10 h-4 bg-slate-200 rounded" />
    </div>
  );
}

function CollectionCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-slate-200 mb-3.5" />
      <div className="w-28 h-4 bg-slate-200 rounded mb-2" />
      <div className="w-full h-3 bg-slate-200 rounded mb-1.5" />
      <div className="w-2/3 h-3 bg-slate-200 rounded mb-3" />
      <div className="w-16 h-3 bg-slate-200 rounded" />
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────────── */

export default function EditorsPicks() {
  const { tools: allTools, loading } = useToolsData();
  const [activeCollection, setActiveCollection] = useState(
    EDITORIAL_COLLECTIONS[0].id
  );

  const active =
    EDITORIAL_COLLECTIONS.find((c) => c.id === activeCollection) ??
    EDITORIAL_COLLECTIONS[0];

  const collectionTools = useMemo(() => {
    return allTools
      .filter((t) => t.badges?.includes(active.badgeFilter as any))
      .sort((a, b) => b.average_rating - a.average_rating)
      .slice(0, active.limit);
  }, [allTools, active.badgeFilter, active.limit]);

  const spotlightTool = collectionTools[0];
  const listTools = collectionTools.slice(1);

  const totalEditorsPicks = useMemo(
    () => allTools.filter((t) => t.badges?.includes("editors_pick")).length,
    [allTools]
  );

  // Tool counts per collection for the bottom grid
  const collectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    EDITORIAL_COLLECTIONS.forEach((col) => {
      counts[col.id] = allTools.filter((t) =>
        t.badges?.includes(col.badgeFilter as any)
      ).length;
    });
    return counts;
  }, [allTools]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="h-[72px] shrink-0" />

      {/* ══════════════════════════════════════════════════════
          HERO (matches /categories hero pattern)
      ══════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-gray-200 pt-[84px] pb-6">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 mb-5">
            <Link
              href="/"
              className="text-xs text-slate-400 no-underline font-medium hover:text-slate-600 transition-colors"
            >
              Home
            </Link>
            <span className="text-[11px] text-slate-300">/</span>
            <span className="text-xs text-slate-500 font-semibold">
              Editor&apos;s Picks
            </span>
          </nav>

          <div className="flex items-start justify-between gap-6 flex-wrap mb-6">
            {/* Left: Title block */}
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-purple-800 bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  <Shield className="w-3 h-3" />
                  Editor&apos;s Picks
                </span>
              </div>
              <h1 className="font-['Inter',system-ui,sans-serif] text-[clamp(24px,3vw,30px)] font-black text-gray-900 tracking-tight leading-tight m-0">
                Curated by Our Editorial Team
              </h1>
              <p className="text-[15px] text-slate-500 font-normal mt-2 leading-relaxed">
                Every stack here has been individually tested, reviewed, and
                selected by the LaudStack editorial team for outstanding
                quality, innovation, and real-world value.
              </p>
            </div>

            {/* Right: Stats */}
            <div className="flex gap-3 sm:gap-4 flex-wrap lg:flex-nowrap">
              {[
                {
                  icon: Award,
                  value: loading ? "—" : `${totalEditorsPicks}`,
                  label: "Editor's Picks",
                },
                { icon: BookOpen, value: "4", label: "Collections" },
                { icon: TrendingUp, value: "Weekly", label: "Updated" },
              ].map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="text-center bg-slate-50 border border-slate-200 rounded-xl px-4 sm:px-5 py-3.5 min-w-[90px] sm:min-w-[100px]"
                >
                  <Icon className="w-[18px] h-[18px] text-purple-600 mx-auto mb-1.5" />
                  <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    {value}
                  </div>
                  <div className="text-[11px] text-slate-400 font-semibold mt-0.5">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Editorial independence callout */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-3">
            <Shield className="w-[18px] h-[18px] text-purple-600 shrink-0 mt-0.5" />
            <p className="text-[13px] text-purple-800 leading-relaxed">
              <strong>Editorial Independence:</strong> Our picks are never paid
              placements. Every stack is evaluated against our editorial rubric
              covering functionality, UX, support quality, pricing fairness, and
              community reception. Founders cannot purchase an Editor&apos;s
              Pick badge.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          COLLECTION TABS
      ══════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6">
          <div className="flex overflow-x-auto scrollbar-hide">
            {EDITORIAL_COLLECTIONS.map((col) => {
              const Icon = col.icon;
              const isActive = col.id === activeCollection;
              return (
                <button
                  key={col.id}
                  onClick={() => setActiveCollection(col.id)}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-3.5 text-[13px] font-bold whitespace-nowrap shrink-0 border-b-[2.5px] transition-all cursor-pointer ${
                    isActive
                      ? `${col.colorClasses.tab}`
                      : "text-slate-500 border-transparent hover:text-slate-800"
                  }`}
                >
                  <Icon className="w-[15px] h-[15px]" />
                  {col.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          MAIN CONTENT — Spotlight + List
      ══════════════════════════════════════════════════════ */}
      <main className="flex-1 bg-slate-50/60 py-8 sm:py-10">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6">
          {/* Collection description */}
          <div className="mb-7">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${active.colorClasses.pill} mb-3`}
            >
              <active.icon
                className={`w-3 h-3 ${active.colorClasses.pillIcon}`}
              />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {active.label}
              </span>
            </div>
            <p className="text-[14px] sm:text-[15px] text-slate-500 leading-relaxed max-w-xl">
              {active.description}
            </p>
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
              <div className="lg:col-span-2">
                <SpotlightSkeleton />
              </div>
              <div className="flex flex-col gap-2.5">
                <div className="w-32 h-3 bg-slate-200 rounded mb-1 animate-pulse" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <CompactSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : collectionTools.length === 0 ? (
            /* Empty state */
            <div className="text-center py-16 sm:py-20 bg-white rounded-2xl border border-slate-200">
              <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-[16px] font-bold text-slate-600 mb-2">
                No picks in this collection yet
              </h3>
              <p className="text-[13px] text-slate-400 max-w-sm mx-auto">
                Our editors are currently reviewing stacks for this category.
                Check back soon.
              </p>
            </div>
          ) : (
            /* Content grid */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
              {/* Spotlight (left 2/3) */}
              <div className="lg:col-span-2">
                {spotlightTool && (
                  <SpotlightCard
                    tool={spotlightTool}
                    cc={active.colorClasses}
                  />
                )}
              </div>

              {/* List (right 1/3) */}
              <div className="flex flex-col gap-2.5">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Also in this collection
                </p>
                {listTools.map((tool, i) => (
                  <CompactCard
                    key={tool.id}
                    tool={tool}
                    rank={i + 2}
                    cc={active.colorClasses}
                  />
                ))}
                {listTools.length === 0 && (
                  <p className="text-[13px] text-slate-400 italic py-4">
                    More picks coming soon.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════
          ALL COLLECTIONS GRID
      ══════════════════════════════════════════════════════ */}
      <section className="bg-white border-t border-slate-200 py-12 sm:py-14">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="font-['Inter',sans-serif] text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
              Browse All Collections
            </h2>
            <p className="text-[14px] text-slate-500">
              Explore every editorial collection curated by our team.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CollectionCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {EDITORIAL_COLLECTIONS.map((col) => (
                <CollectionCard
                  key={col.id}
                  col={col}
                  toolCount={collectionCounts[col.id] || 0}
                  onClick={() => {
                    setActiveCollection(col.id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
