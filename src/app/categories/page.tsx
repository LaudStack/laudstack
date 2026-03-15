"use client";
/*
 * Categories Page — LaudStack
 *
 * Design: Matches /tools hero pattern (left-aligned, breadcrumb, same font scale).
 * Cards: Modern glass-style with icon, count, description, top tools, and hover lift.
 * Layout: Hero → Grid → CTA → Footer
 */

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LogoWithFallback from "@/components/LogoWithFallback";
import {
  ArrowRight,
  Search,
  Layers,
  Rocket,
  LayoutGrid,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CATEGORY_META } from "@/lib/categories";
import { useToolsData } from "@/hooks/useToolsData";
import type { Tool } from "@/lib/types";

// ─── Accent colors per category ─────────────────────────────────────────────
const ACCENTS: Record<string, { color: string; light: string; border: string }> = {
  "AI Productivity":    { color: "#7C3AED", light: "#F5F3FF", border: "#DDD6FE" },
  "AI Writing":         { color: "#2563EB", light: "#EFF6FF", border: "#BFDBFE" },
  "AI Image":           { color: "#DB2777", light: "#FDF2F8", border: "#FBCFE8" },
  "AI Video":           { color: "#DC2626", light: "#FEF2F2", border: "#FECACA" },
  "AI Audio":           { color: "#0D9488", light: "#F0FDFA", border: "#99F6E4" },
  "AI Code":            { color: "#059669", light: "#ECFDF5", border: "#A7F3D0" },
  "AI Analytics":       { color: "#4F46E5", light: "#EEF2FF", border: "#C7D2FE" },
  "Design":             { color: "#EC4899", light: "#FDF2F8", border: "#FBCFE8" },
  "Marketing":          { color: "#EA580C", light: "#FFF7ED", border: "#FED7AA" },
  "Developer Tools":    { color: "#475569", light: "#F8FAFC", border: "#CBD5E1" },
  "Project Management": { color: "#0284C7", light: "#F0F9FF", border: "#BAE6FD" },
  "Customer Support":   { color: "#16A34A", light: "#F0FDF4", border: "#BBF7D0" },
  "CRM":                { color: "#D97706", light: "#FFFBEB", border: "#FDE68A" },
  "Sales":              { color: "#9333EA", light: "#FAF5FF", border: "#D8B4FE" },
  "HR & Recruiting":    { color: "#0891B2", light: "#ECFEFF", border: "#A5F3FC" },
  "Finance":            { color: "#047857", light: "#ECFDF5", border: "#A7F3D0" },
  "Security":           { color: "#DC2626", light: "#FEF2F2", border: "#FECACA" },
  "E-commerce":         { color: "#7C3AED", light: "#F5F3FF", border: "#DDD6FE" },
  "Education":          { color: "#2563EB", light: "#EFF6FF", border: "#BFDBFE" },
  "Other":              { color: "#4B5563", light: "#F9FAFB", border: "#D1D5DB" },
};
const FALLBACK = { color: "#475569", light: "#F8FAFC", border: "#CBD5E1" };

// ─── Category Card ──────────────────────────────────────────────────────────
function CategoryCard({
  cat,
  tools,
}: {
  cat: { name: string; icon: string; description: string };
  tools: Tool[];
}) {
  const router = useRouter();
  const a = ACCENTS[cat.name] || FALLBACK;

  const topTools = useMemo(
    () =>
      tools
        .filter((t) => t.category === cat.name)
        .sort((x, y) => (y.average_rating ?? 0) - (x.average_rating ?? 0))
        .slice(0, 3),
    [tools, cat.name]
  );

  const count = tools.filter((t) => t.category === cat.name).length;

  return (
    <button
      onClick={() =>
        router.push(`/tools?category=${encodeURIComponent(cat.name)}`)
      }
      className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm text-left w-full transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-slate-300/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 overflow-hidden"
    >
      {/* Top accent bar */}
      <div
        className="h-[3px] w-full transition-opacity duration-200 opacity-30 group-hover:opacity-100"
        style={{ background: a.color }}
      />

      <div className="flex-1 p-5 sm:p-6 flex flex-col min-w-0">
        {/* Row 1: Icon + Name + Arrow */}
        <div className="flex items-start gap-3.5 mb-3.5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-[22px] shrink-0 transition-all duration-200 group-hover:shadow-lg group-hover:scale-105"
            style={{
              background: a.light,
              border: `1.5px solid ${a.border}`,
            }}
          >
            {cat.icon}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-[15px] font-extrabold text-slate-900 tracking-tight leading-snug truncate group-hover:text-slate-800">
              {cat.name}
            </h3>
            <span
              className="text-[13px] font-bold tabular-nums"
              style={{ color: a.color }}
            >
              {count}{" "}
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                {count === 1 ? "stack" : "stacks"}
              </span>
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-slate-50 border border-slate-100 transition-all duration-200 group-hover:bg-amber-50 group-hover:border-amber-200 mt-0.5">
            <ArrowRight className="w-3.5 h-3.5 text-slate-300 transition-all duration-200 group-hover:text-amber-600 group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* Description */}
        <p className="text-[13px] text-slate-500 font-medium leading-relaxed line-clamp-2 mb-5">
          {cat.description}
        </p>

        {/* Top tools row */}
        <div className="mt-auto">
          {topTools.length > 0 ? (
            <div className="flex items-center gap-2.5 pt-4 border-t border-slate-100">
              <div className="flex items-center">
                {topTools.map((tool, i) => (
                  <div
                    key={tool.id}
                    className="w-7 h-7 rounded-lg overflow-hidden border-2 border-white bg-slate-100 shrink-0 shadow-sm"
                    style={{
                      marginLeft: i === 0 ? 0 : -6,
                      zIndex: topTools.length - i,
                    }}
                  >
                    <LogoWithFallback
                      src={tool.logo_url}
                      alt={tool.name}
                      className="w-full h-full object-cover"
                      fallbackSize="text-[10px]"
                    />
                  </div>
                ))}
              </div>
              <span className="text-[11px] text-slate-400 font-medium truncate">
                {topTools.map((t) => t.name).join(", ")}
              </span>
            </div>
          ) : (
            count === 0 && (
              <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center">
                  <LayoutGrid className="w-3 h-3 text-slate-300" />
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  No stacks yet
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Skeleton Card ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
      <div className="h-[3px] w-full bg-slate-100 animate-pulse" />
      <div className="flex-1 p-5 sm:p-6">
        <div className="flex items-start gap-3.5 mb-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-100 animate-pulse shrink-0" />
          <div className="flex-1 pt-0.5">
            <div className="h-4 w-28 bg-slate-100 rounded-md animate-pulse mb-2" />
            <div className="h-3 w-16 bg-slate-100 rounded-md animate-pulse" />
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-50 animate-pulse shrink-0" />
        </div>
        <div className="h-3 w-full bg-slate-50 rounded animate-pulse mb-1.5" />
        <div className="h-3 w-3/4 bg-slate-50 rounded animate-pulse mb-5" />
        <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
          <div className="flex">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-lg bg-slate-100 animate-pulse border-2 border-white shadow-sm"
                style={{ marginLeft: i === 0 ? 0 : -6 }}
              />
            ))}
          </div>
          <div className="h-3 w-24 bg-slate-50 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORIES PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { tools, loading } = useToolsData();

  const allCats = useMemo(
    () => CATEGORY_META.filter((c) => c.name !== "All"),
    []
  );
  const filtered = useMemo(
    () =>
      search.trim()
        ? allCats.filter(
            (c) =>
              c.name.toLowerCase().includes(search.toLowerCase()) ||
              c.description.toLowerCase().includes(search.toLowerCase())
          )
        : allCats,
    [allCats, search]
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* ══════════ HERO — matches /tools hero pattern ══════════ */}
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
              Categories
            </span>
          </nav>

          {/* Title row */}
          <div className="flex items-start justify-between gap-6 flex-wrap mb-6">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  <Layers className="w-3 h-3" />
                  Browse Categories
                </span>
              </div>
              <h1 className="font-['Inter',system-ui,sans-serif] text-[clamp(24px,3vw,30px)] font-black text-gray-900 tracking-tight leading-tight m-0">
                All Categories
              </h1>
              <p className="text-[15px] text-slate-500 font-normal mt-2 leading-relaxed">
                Explore {allCats.length} curated categories spanning AI, SaaS,
                developer tools, and more.
              </p>
            </div>

            {/* Search bar */}
            <div className="relative w-full max-w-[340px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-[10px] py-[11px] pl-10 pr-9 text-[13px] text-slate-900 outline-none transition-colors focus:border-amber-400 placeholder:text-slate-400"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate-400 flex p-0 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ CATEGORY GRID ══════════ */}
      <section className="py-8 sm:py-10 lg:py-12">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6">
          {/* Section label */}
          {filtered.length > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {search.trim()
                  ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`
                  : `${allCats.length} Categories`}
              </span>
              <div className="flex-1 h-px bg-slate-200/60" />
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Category cards */}
          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((cat) => (
                <CategoryCard key={cat.name} cat={cat} tools={tools} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Search className="w-6 h-6 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">
                No categories found
              </h3>
              <p className="text-sm text-slate-400 mb-5">
                Try a different search term or browse all categories.
              </p>
              <button
                onClick={() => setSearch("")}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-5 py-2.5 cursor-pointer transition-all hover:bg-amber-100"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="border-t border-slate-200/60 py-12 sm:py-14 bg-white">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-2.5">
            Don&apos;t see your stack?
          </h2>
          <p className="text-sm text-slate-500 font-medium mb-6 max-w-md mx-auto">
            Launch your AI or SaaS stack on LaudStack. Free to list — reviewed
            within 48 hours.
          </p>
          <button
            onClick={() => router.push("/launchpad")}
            className="inline-flex items-center gap-2 text-sm font-bold text-white bg-amber-500 rounded-xl px-7 py-3 cursor-pointer transition-all hover:bg-amber-600 shadow-sm hover:shadow-md"
          >
            Go to LaunchPad <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
