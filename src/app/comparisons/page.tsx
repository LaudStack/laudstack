"use client";
/*
 * LaudStack — Comparisons Hub
 *
 * Browse popular stack matchups and build custom comparisons.
 * Shows popular head-to-head matchups, category-based comparisons,
 * and a stack picker to build custom comparisons.
 */
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  GitCompareArrows,
  Search,
  Star,
  Layers,
  ChevronRight,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LogoWithFallback from "@/components/LogoWithFallback";
import { useToolsData } from "@/hooks/useToolsData";
import { CATEGORY_META } from "@/lib/categories";
import type { Tool } from "@/lib/types";

/* ─── Matchup Card ──────────────────────────────────────────────────────────── */
function MatchupCard({ toolA, toolB }: { toolA: Tool; toolB: Tool }) {
  const router = useRouter();
  return (
    <button
      onClick={() =>
        router.push(`/compare?tools=${toolA.slug},${toolB.slug}`)
      }
      className="group bg-white border border-slate-200 rounded-2xl p-5 text-left cursor-pointer transition-all duration-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-amber-200 w-full"
    >
      {/* Two logos with VS badge */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100 shadow-sm mx-auto bg-slate-50 flex items-center justify-center">
            <LogoWithFallback
              src={toolA.logo_url}
              alt={toolA.name}
              className="w-full h-full object-cover"
              fallbackSize="text-lg"
            />
          </div>
          <p className="text-[12px] font-bold text-slate-900 mt-1.5 truncate max-w-[80px]">
            {toolA.name}
          </p>
        </div>

        <div className="w-9 h-9 rounded-full bg-amber-50 border-[1.5px] border-amber-200 flex items-center justify-center text-[11px] font-black text-amber-600 shrink-0">
          VS
        </div>

        <div className="text-center">
          <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100 shadow-sm mx-auto bg-slate-50 flex items-center justify-center">
            <LogoWithFallback
              src={toolB.logo_url}
              alt={toolB.name}
              className="w-full h-full object-cover"
              fallbackSize="text-lg"
            />
          </div>
          <p className="text-[12px] font-bold text-slate-900 mt-1.5 truncate max-w-[80px]">
            {toolB.name}
          </p>
        </div>
      </div>

      {/* Rating comparison */}
      <div className="flex justify-between items-center pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-[12px] font-bold text-slate-900">
            {toolA.average_rating.toFixed(1)}
          </span>
          <span className="text-[10px] text-slate-400">
            ({toolA.review_count})
          </span>
        </div>
        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider group-hover:text-amber-700 transition-colors">
          Compare
        </span>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-[12px] font-bold text-slate-900">
            {toolB.average_rating.toFixed(1)}
          </span>
          <span className="text-[10px] text-slate-400">
            ({toolB.review_count})
          </span>
        </div>
      </div>

      {/* Category */}
      <p className="text-center mt-2">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
          {toolA.category}
        </span>
      </p>
    </button>
  );
}

/* ─── Stack Picker ──────────────────────────────────────────────────────────── */
function StackPicker({
  label,
  selected,
  onSelect,
  onClear,
  allTools,
}: {
  label: string;
  selected: Tool | null;
  onSelect: (tool: Tool) => void;
  onClear: () => void;
  allTools: Tool[];
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allTools
      .filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.tagline.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [allTools, query]);

  if (selected) {
    return (
      <div className="flex-1 min-w-[200px] sm:min-w-[240px] bg-white border-[1.5px] border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 shadow-sm shrink-0 bg-slate-50 flex items-center justify-center">
          <LogoWithFallback
            src={selected.logo_url}
            alt={selected.name}
            className="w-full h-full object-cover"
            fallbackSize="text-sm"
          />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[14px] font-extrabold text-slate-900 truncate block">
            {selected.name}
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="w-[11px] h-[11px] fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-bold text-slate-900">
              {selected.average_rating.toFixed(1)}
            </span>
          </div>
        </div>
        <button
          onClick={onClear}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-[200px] sm:min-w-[240px] relative">
      <label className="text-[11px] font-bold text-slate-500 mb-1.5 block uppercase tracking-wide">
        {label}
      </label>
      <div className="flex items-center bg-white rounded-xl border-[1.5px] border-slate-200 overflow-hidden focus-within:border-amber-300 focus-within:ring-1 focus-within:ring-amber-200 transition-all">
        <Search className="ml-3.5 w-[14px] h-[14px] text-slate-400 shrink-0" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder="Search stacks..."
          className="flex-1 px-3 py-3 text-[14px] text-slate-900 bg-transparent border-none outline-none placeholder:text-slate-400"
        />
      </div>
      {open && query.trim() && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border-[1.5px] border-slate-200 rounded-xl shadow-xl overflow-hidden">
          {results.map((tool) => (
            <button
              key={tool.slug}
              onMouseDown={() => {
                onSelect(tool);
                setQuery("");
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-slate-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-md overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center shrink-0">
                <LogoWithFallback
                  src={tool.logo_url}
                  alt={tool.name}
                  className="w-full h-full object-cover"
                  fallbackSize="text-[10px]"
                />
              </div>
              <span className="text-[13px] font-bold text-slate-900 truncate">
                {tool.name}
              </span>
              <span className="text-[11px] text-slate-400 ml-auto shrink-0">
                {tool.category}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Loading Skeleton ──────────────────────────────────────────────────────── */
function MatchupSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm animate-pulse">
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-200 mx-auto" />
          <div className="w-14 h-3 bg-slate-200 rounded mt-2 mx-auto" />
        </div>
        <div className="w-9 h-9 rounded-full bg-slate-100" />
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-200 mx-auto" />
          <div className="w-14 h-3 bg-slate-200 rounded mt-2 mx-auto" />
        </div>
      </div>
      <div className="border-t border-slate-100 pt-3">
        <div className="flex justify-between">
          <div className="w-12 h-3 bg-slate-200 rounded" />
          <div className="w-14 h-3 bg-slate-200 rounded" />
          <div className="w-12 h-3 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  );
}

function CategoryRowSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 sm:px-5 py-3.5 sm:py-4 flex items-center gap-3 sm:gap-4 animate-pulse">
      <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0" />
      <div className="flex-1">
        <div className="w-28 h-4 bg-slate-200 rounded" />
        <div className="w-16 h-3 bg-slate-200 rounded mt-1.5" />
      </div>
      <div className="hidden sm:flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-slate-200" />
        <div className="w-8 h-8 rounded-lg bg-slate-200" />
      </div>
      <div className="w-4 h-4 rounded bg-slate-200 shrink-0" />
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────────── */
export default function ComparisonsPage() {
  const { tools: allTools, loading } = useToolsData();
  const router = useRouter();
  const [stackA, setStackA] = useState<Tool | null>(null);
  const [stackB, setStackB] = useState<Tool | null>(null);

  // Generate popular matchups from top-rated stacks in each category
  const matchups = useMemo(() => {
    const pairs: { a: Tool; b: Tool }[] = [];
    const categories = [...new Set(allTools.map((t) => t.category))];

    for (const cat of categories) {
      const catTools = allTools
        .filter((t) => t.category === cat)
        .sort((a, b) => b.average_rating - a.average_rating);
      if (catTools.length >= 2) {
        pairs.push({ a: catTools[0], b: catTools[1] });
        if (catTools.length >= 4) {
          pairs.push({ a: catTools[2], b: catTools[3] });
        }
      }
    }
    return pairs.slice(0, 12);
  }, [allTools]);

  // Category matchups — top 2 stacks per category
  const categoryMatchups = useMemo(() => {
    const cats = CATEGORY_META.filter((c) => c.name !== "All");
    return cats
      .map((cat) => {
        const catTools = allTools
          .filter((t) => t.category === cat.name)
          .sort((a, b) => b.average_rating - a.average_rating);
        return { ...cat, tools: catTools.slice(0, 2), count: catTools.length };
      })
      .filter((c) => c.tools.length >= 2);
  }, [allTools]);

  const canCompare = stackA && stackB && stackA.slug !== stackB.slug;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="h-[72px] shrink-0" />

      {/* ── Hero (matches /categories hero pattern) ── */}
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
              Comparisons
            </span>
          </nav>

          <div className="flex items-start justify-between gap-6 flex-wrap mb-6">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  <GitCompareArrows className="w-3 h-3" />
                  Side by Side
                </span>
              </div>
              <h1 className="font-['Inter',system-ui,sans-serif] text-[clamp(24px,3vw,30px)] font-black text-gray-900 tracking-tight leading-tight m-0">
                Compare Stacks Head to Head
              </h1>
              <p className="text-[15px] text-slate-500 font-normal mt-2 leading-relaxed">
                Put any two AI or SaaS stacks side by side. Compare features,
                ratings, and reviews to make the right choice.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1">
        {/* ── Custom Comparison Builder ── */}
        <section className="bg-white py-8 sm:py-10 border-b border-slate-100">
          <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 sm:p-7">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                  <GitCompareArrows className="w-4 h-4 text-amber-600" />
                </div>
                <h2 className="text-[16px] sm:text-[18px] font-black text-slate-900">
                  Build Your Comparison
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:gap-4">
                <StackPicker
                  label="Stack A"
                  selected={stackA}
                  onSelect={setStackA}
                  onClear={() => setStackA(null)}
                  allTools={allTools}
                />

                <div className="w-10 h-10 rounded-full bg-amber-50 border-[1.5px] border-amber-200 flex items-center justify-center text-[12px] font-black text-amber-600 shrink-0 self-center sm:mb-0.5">
                  VS
                </div>

                <StackPicker
                  label="Stack B"
                  selected={stackB}
                  onSelect={setStackB}
                  onClear={() => setStackB(null)}
                  allTools={allTools}
                />

                <button
                  onClick={() => {
                    if (canCompare)
                      router.push(
                        `/compare?tools=${stackA!.slug},${stackB!.slug}`
                      );
                  }}
                  disabled={!canCompare}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[14px] font-extrabold text-white shrink-0 whitespace-nowrap transition-all duration-200 ${
                    canCompare
                      ? "bg-amber-500 hover:bg-amber-600 shadow-sm hover:shadow-md cursor-pointer"
                      : "bg-slate-300 cursor-not-allowed"
                  }`}
                >
                  <GitCompareArrows className="w-4 h-4" /> Compare Now
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Popular Matchups ── */}
        <section className="bg-slate-50/50 py-10 sm:py-12 border-b border-slate-100">
          <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 mb-3">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                  Popular
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1.5">
                Rising Matchups
              </h2>
              <p className="text-[14px] text-slate-500 max-w-[480px]">
                The most popular head-to-head comparisons on the platform right
                now.
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <MatchupSkeleton key={i} />
                ))}
              </div>
            ) : matchups.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {matchups.map((m, i) => (
                  <MatchupCard
                    key={`${m.a.slug}-${m.b.slug}-${i}`}
                    toolA={m.a}
                    toolB={m.b}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                <GitCompareArrows className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-[15px] font-bold text-slate-600 mb-1">
                  No matchups yet
                </h3>
                <p className="text-[13px] text-slate-400">
                  Use the builder above to create the first comparison.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── Compare by Category ── */}
        <section className="bg-white py-10 sm:py-12">
          <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 mb-3">
                <Layers className="w-3 h-3 text-blue-600" />
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  By Category
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1.5">
                Compare by Category
              </h2>
              <p className="text-[14px] text-slate-500 max-w-[480px]">
                See how the top stacks stack up in each category.
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CategoryRowSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {categoryMatchups.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() =>
                      router.push(
                        `/compare?tools=${cat.tools[0].slug},${cat.tools[1].slug}`
                      )
                    }
                    className="group bg-white border border-slate-200 rounded-xl px-4 sm:px-5 py-3.5 sm:py-4 flex items-center gap-3 sm:gap-4 text-left transition-all duration-200 hover:border-amber-200 hover:shadow-md w-full"
                  >
                    <span className="text-2xl shrink-0">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[14px] font-extrabold text-slate-900">
                        {cat.name}
                      </span>
                      <p className="text-[12px] text-slate-400 mt-0.5">
                        {cat.count} stacks
                      </p>
                    </div>

                    {/* Top 2 logos */}
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-100 shadow-sm bg-slate-50 flex items-center justify-center">
                        <LogoWithFallback
                          src={cat.tools[0].logo_url}
                          alt={cat.tools[0].name}
                          className="w-full h-full object-cover"
                          fallbackSize="text-[10px]"
                        />
                      </div>
                      <span className="text-[11px] font-black text-amber-600">
                        vs
                      </span>
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-100 shadow-sm bg-slate-50 flex items-center justify-center">
                        <LogoWithFallback
                          src={cat.tools[1].logo_url}
                          alt={cat.tools[1].name}
                          className="w-full h-full object-cover"
                          fallbackSize="text-[10px]"
                        />
                      </div>
                    </div>

                    <span className="hidden md:inline text-[12px] font-bold text-amber-600 shrink-0">
                      {cat.tools[0].name} vs {cat.tools[1].name}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
