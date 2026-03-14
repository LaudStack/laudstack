"use client";
/*
 * Categories Page — LaudStack
 *
 * Design: Clean white background, uniform 3-column grid, warm professional aesthetic.
 * Each card: left accent stripe, emoji icon, category name, stack count, description,
 * top-3 tool logos, and hover micro-interactions.
 * Layout: Header → Search + Stats → Grid → CTA → Footer
 */

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, Layers, Rocket, Star, LayoutGrid } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CATEGORY_META } from "@/lib/categories";
import { useToolsData } from "@/hooks/useToolsData";
import type { Tool } from "@/lib/types";

// ─── Accent colors per category ─────────────────────────────────────────────
const ACCENTS: Record<string, { color: string; bg: string; iconBg: string }> = {
  "AI Productivity":    { color: "#7C3AED", bg: "#F5F3FF", iconBg: "#EDE9FE" },
  "AI Writing":         { color: "#2563EB", bg: "#EFF6FF", iconBg: "#DBEAFE" },
  "AI Image":           { color: "#DB2777", bg: "#FDF2F8", iconBg: "#FCE7F3" },
  "AI Video":           { color: "#DC2626", bg: "#FEF2F2", iconBg: "#FEE2E2" },
  "AI Audio":           { color: "#0D9488", bg: "#F0FDFA", iconBg: "#CCFBF1" },
  "AI Code":            { color: "#059669", bg: "#ECFDF5", iconBg: "#D1FAE5" },
  "AI Analytics":       { color: "#4F46E5", bg: "#EEF2FF", iconBg: "#E0E7FF" },
  "Design":             { color: "#EC4899", bg: "#FDF2F8", iconBg: "#FCE7F3" },
  "Marketing":          { color: "#EA580C", bg: "#FFF7ED", iconBg: "#FFEDD5" },
  "Developer Tools":    { color: "#475569", bg: "#F8FAFC", iconBg: "#F1F5F9" },
  "Project Management": { color: "#0284C7", bg: "#F0F9FF", iconBg: "#E0F2FE" },
  "Customer Support":   { color: "#16A34A", bg: "#F0FDF4", iconBg: "#DCFCE7" },
  "CRM":                { color: "#D97706", bg: "#FFFBEB", iconBg: "#FEF3C7" },
  "Sales":              { color: "#9333EA", bg: "#FAF5FF", iconBg: "#F3E8FF" },
  "HR & Recruiting":    { color: "#0891B2", bg: "#ECFEFF", iconBg: "#CFFAFE" },
  "Finance":            { color: "#047857", bg: "#ECFDF5", iconBg: "#D1FAE5" },
  "Security":           { color: "#DC2626", bg: "#FEF2F2", iconBg: "#FEE2E2" },
  "E-commerce":         { color: "#7C3AED", bg: "#F5F3FF", iconBg: "#EDE9FE" },
  "Education":          { color: "#2563EB", bg: "#EFF6FF", iconBg: "#DBEAFE" },
  "Other":              { color: "#4B5563", bg: "#F9FAFB", iconBg: "#F3F4F6" },
};
const FALLBACK_ACCENT = { color: "#475569", bg: "#F8FAFC", iconBg: "#F1F5F9" };

// ─── Category Card ──────────────────────────────────────────────────────────
function CategoryCard({
  cat,
  tools,
}: {
  cat: { name: string; icon: string; description: string };
  tools: Tool[];
}) {
  const router = useRouter();
  const a = ACCENTS[cat.name] || FALLBACK_ACCENT;

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
      onClick={() => router.push(`/tools?category=${encodeURIComponent(cat.name)}`)}
      className="group relative flex bg-white rounded-2xl border border-slate-200/80 overflow-hidden text-left w-full transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
      style={{
        boxShadow: "0 1px 3px rgba(15,23,42,0.04), 0 1px 2px rgba(15,23,42,0.02)",
      }}
    >
      {/* Left accent stripe */}
      <div
        className="w-1 shrink-0 self-stretch rounded-l-2xl transition-opacity duration-200 opacity-40 group-hover:opacity-100"
        style={{ background: a.color }}
      />

      <div className="flex-1 p-5 sm:p-6 flex flex-col min-w-0">
        {/* Row 1: Icon + Name + Count */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 transition-shadow duration-200 group-hover:shadow-md"
            style={{
              background: a.iconBg,
              border: `1px solid ${a.color}15`,
            }}
          >
            {cat.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-extrabold text-slate-900 tracking-tight leading-tight truncate">
              {cat.name}
            </h3>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-sm font-extrabold tabular-nums" style={{ color: a.color }}>
                {count}
              </span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                stacks
              </span>
            </div>
          </div>
          {/* Arrow indicator */}
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-slate-50 border border-slate-100 transition-all duration-200 group-hover:bg-amber-50 group-hover:border-amber-200">
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 transition-all duration-200 group-hover:text-amber-600 group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* Description */}
        <p className="text-[13px] text-slate-500 font-medium leading-relaxed line-clamp-2 mb-4">
          {cat.description}
        </p>

        {/* Top tools row */}
        {topTools.length > 0 && (
          <div className="mt-auto flex items-center gap-2.5">
            <div className="flex items-center">
              {topTools.map((tool, i) => (
                <div
                  key={tool.id}
                  className="w-7 h-7 rounded-lg overflow-hidden border-2 border-white bg-slate-100 shrink-0"
                  style={{
                    marginLeft: i === 0 ? 0 : -6,
                    zIndex: topTools.length - i,
                  }}
                >
                  <img
                    src={tool.logo_url}
                    alt={tool.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const el = e.currentTarget;
                      el.style.display = "none";
                      if (el.parentElement) {
                        el.parentElement.style.display = "flex";
                        el.parentElement.style.alignItems = "center";
                        el.parentElement.style.justifyContent = "center";
                        el.parentElement.innerHTML = `<span style="font-size:10px;font-weight:800;color:#64748B">${tool.name.charAt(0)}</span>`;
                      }
                    }}
                  />
                </div>
              ))}
            </div>
            <span className="text-[11px] text-slate-400 font-medium truncate">
              {topTools.map((t) => t.name).join(", ")}
            </span>
          </div>
        )}

        {/* Empty state for categories with no tools yet */}
        {topTools.length === 0 && count === 0 && (
          <div className="mt-auto flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center">
              <LayoutGrid className="w-3 h-3 text-slate-300" />
            </div>
            <span className="text-[11px] text-slate-400 font-medium">No stacks yet</span>
          </div>
        )}
      </div>
    </button>
  );
}

// ─── Skeleton Card ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="flex bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
      <div className="w-1 shrink-0 bg-slate-100 animate-pulse" />
      <div className="flex-1 p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-slate-100 animate-pulse shrink-0" />
          <div className="flex-1">
            <div className="h-4 w-28 bg-slate-100 rounded animate-pulse mb-1.5" />
            <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-50 animate-pulse shrink-0" />
        </div>
        <div className="h-3 w-full bg-slate-50 rounded animate-pulse mb-1.5" />
        <div className="h-3 w-3/4 bg-slate-50 rounded animate-pulse mb-4" />
        <div className="flex items-center gap-2">
          <div className="flex">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-7 h-7 rounded-lg bg-slate-100 animate-pulse border-2 border-white" style={{ marginLeft: i === 0 ? 0 : -6 }} />
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

  const allCats = useMemo(() => CATEGORY_META.filter((c) => c.name !== "All"), []);
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

  const totalStacks = tools.length;
  const avgRating =
    tools.length > 0
      ? (tools.reduce((s, t) => s + (t.average_rating ?? 0), 0) / tools.length).toFixed(1)
      : "—";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="h-[72px] shrink-0" />

      {/* ══════════ PAGE HEADER ══════════ */}
      <section className="border-b border-slate-100 py-14 sm:py-16">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 mb-5">
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">
              Browse Categories
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-slate-900 tracking-tight leading-tight mb-3.5">
            Find Stacks for Every Use Case
          </h1>

          <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed max-w-[560px] mx-auto mb-8">
            Explore {allCats.length} curated categories spanning AI, SaaS, developer tools, and more — each with verified reviews and honest rankings.
          </p>

          {/* Search + Stats row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            {/* Search */}
            <div className="w-full sm:w-auto sm:min-w-[380px] flex items-center bg-white rounded-xl border-[1.5px] border-slate-200 shadow-sm overflow-hidden transition-all focus-within:border-amber-300 focus-within:shadow-md">
              <Search className="w-4 h-4 text-slate-400 ml-4 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories..."
                className="flex-1 px-3 py-3 text-sm text-slate-900 bg-transparent border-none outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Stats pills */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-sm font-extrabold text-slate-900 tabular-nums">{totalStacks}</span>
                <span className="text-[11px] font-semibold text-slate-400">stacks</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-sm font-extrabold text-slate-900 tabular-nums">{allCats.length}</span>
                <span className="text-[11px] font-semibold text-slate-400">categories</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="text-sm font-extrabold text-slate-900 tabular-nums">{avgRating}</span>
                <span className="text-[11px] font-semibold text-slate-400">avg</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ CATEGORY GRID ══════════ */}
      <section className="py-10 sm:py-12 lg:py-14">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10">
          {/* Section label */}
          {filtered.length > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {search.trim() ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}` : "All Categories"}
              </span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Category cards */}
          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filtered.map((cat) => (
                <CategoryCard key={cat.name} cat={cat} tools={tools} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">No categories found</h3>
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
      <section className="border-t border-slate-100 py-12 sm:py-14">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-2.5">
            Don&apos;t see your stack?
          </h2>
          <p className="text-sm text-slate-500 font-medium mb-6 max-w-md mx-auto">
            Launch your AI or SaaS stack on LaudStack. Free to list — reviewed within 48 hours.
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
