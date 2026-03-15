"use client";
/*
 * LaudStack — Alternatives Finder
 *
 * Search for any stack and discover top-rated alternatives in the same category.
 * Shows a search-driven workflow with popular stacks grid as the default view.
 */
import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Star,
  Layers,
  ChevronRight,
  Sparkles,
  X,
  ArrowRight,
  Repeat2,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LogoWithFallback from "@/components/LogoWithFallback";
import { useToolsData } from "@/hooks/useToolsData";
import { CATEGORY_META } from "@/lib/categories";
import type { Tool } from "@/lib/types";

/* ─── Search Result Item ────────────────────────────────────────────────────── */
function SearchResultItem({
  tool,
  onSelect,
}: {
  tool: Tool;
  onSelect: (slug: string) => void;
}) {
  return (
    <button
      onMouseDown={() => onSelect(tool.slug)}
      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
    >
      <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-100 shadow-sm shrink-0 bg-slate-50 flex items-center justify-center">
        <LogoWithFallback
          src={tool.logo_url}
          alt={tool.name}
          className="w-full h-full object-cover"
          fallbackSize="text-[10px]"
        />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[13px] font-bold text-slate-900">
          {tool.name}
        </span>
        <p className="text-[11px] text-slate-400 truncate">{tool.tagline}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Star className="w-[10px] h-[10px] fill-amber-400 text-amber-400" />
        <span className="text-[11px] font-bold text-slate-900">
          {tool.average_rating.toFixed(1)}
        </span>
      </div>
    </button>
  );
}

/* ─── Alternative Row Card ──────────────────────────────────────────────────── */
function AlternativeRow({ tool, rank }: { tool: Tool; rank: number }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(`/tools/${tool.slug}`)}
      className="group w-full bg-white border border-slate-200 rounded-xl px-4 sm:px-5 py-3.5 sm:py-4 flex items-center gap-3 sm:gap-4 text-left transition-all duration-200 hover:border-amber-200 hover:shadow-md hover:-translate-y-0.5"
    >
      {/* Rank */}
      <span
        className={`w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-black shrink-0 ${
          rank <= 3
            ? "bg-amber-50 text-amber-600 border border-amber-200"
            : "bg-slate-50 text-slate-500 border border-slate-200"
        }`}
      >
        {rank}
      </span>

      {/* Logo */}
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-slate-100 shadow-sm shrink-0 bg-slate-50 flex items-center justify-center">
        <LogoWithFallback
          src={tool.logo_url}
          alt={tool.name}
          className="w-full h-full object-cover"
          fallbackSize="text-sm"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[14px] font-extrabold text-slate-900 truncate">
            {tool.name}
          </span>
          {tool.is_verified && (
            <ShieldCheck className="w-3.5 h-3.5 text-green-500 shrink-0" />
          )}
        </div>
        <p className="text-[12px] text-slate-500 truncate mt-0.5">
          {tool.tagline}
        </p>
      </div>

      {/* Rating */}
      <div className="hidden sm:flex items-center gap-1 shrink-0">
        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
        <span className="text-[13px] font-bold text-slate-900">
          {tool.average_rating.toFixed(1)}
        </span>
        <span className="text-[11px] text-slate-400">
          ({tool.review_count})
        </span>
      </div>

      {/* Category badge */}
      <span className="hidden md:inline text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg shrink-0">
        {tool.category}
      </span>

      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors shrink-0" />
    </button>
  );
}

/* ─── Popular Stack Card ────────────────────────────────────────────────────── */
function PopularStackCard({
  tool,
  altCount,
  onSelect,
}: {
  tool: Tool;
  altCount: number;
  onSelect: (slug: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(tool.slug)}
      className="group bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 text-left transition-all duration-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-amber-200 w-full"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-100 shadow-sm shrink-0 bg-slate-50 flex items-center justify-center">
          <LogoWithFallback
            src={tool.logo_url}
            alt={tool.name}
            className="w-full h-full object-cover"
            fallbackSize="text-sm"
          />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[14px] font-extrabold text-slate-900 block truncate">
            {tool.name}
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="w-[11px] h-[11px] fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-bold text-slate-900">
              {tool.average_rating.toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-400">
              ({tool.review_count})
            </span>
          </div>
        </div>
      </div>

      <p className="text-[12px] text-slate-500 line-clamp-2 mb-3 leading-relaxed">
        {tool.tagline}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-[11px] font-bold text-amber-600">
          {altCount} alternative{altCount !== 1 ? "s" : ""}
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </button>
  );
}

/* ─── Loading Skeletons ─────────────────────────────────────────────────────── */
function PopularCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-slate-200" />
        <div className="flex-1">
          <div className="w-24 h-4 bg-slate-200 rounded" />
          <div className="w-14 h-3 bg-slate-200 rounded mt-1.5" />
        </div>
      </div>
      <div className="w-full h-3 bg-slate-200 rounded mb-1.5" />
      <div className="w-2/3 h-3 bg-slate-200 rounded mb-3" />
      <div className="border-t border-slate-100 pt-3 flex justify-between">
        <div className="w-20 h-3 bg-slate-200 rounded" />
        <div className="w-4 h-3 bg-slate-200 rounded" />
      </div>
    </div>
  );
}

function AlternativeRowSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 sm:px-5 py-3.5 sm:py-4 flex items-center gap-3 sm:gap-4 shadow-sm animate-pulse">
      <div className="w-7 h-7 rounded-lg bg-slate-200" />
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-200" />
      <div className="flex-1">
        <div className="w-28 h-4 bg-slate-200 rounded" />
        <div className="w-40 h-3 bg-slate-200 rounded mt-1.5" />
      </div>
      <div className="w-16 h-4 bg-slate-200 rounded hidden sm:block" />
      <div className="w-4 h-4 bg-slate-200 rounded" />
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────────── */
export default function AlternativesPage() {
  const { tools: allTools, loading } = useToolsData();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // Auto-select from URL param
  const urlProduct = searchParams?.get("product") ?? null;
  useEffect(() => {
    if (urlProduct && !selectedSlug) {
      setSelectedSlug(urlProduct);
    }
  }, [urlProduct, selectedSlug]);

  const selectedProduct = useMemo(() => {
    const slug = selectedSlug || urlProduct;
    return slug ? allTools.find((t) => t.slug === slug) : null;
  }, [allTools, selectedSlug, urlProduct]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allTools
      .filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.tagline.toLowerCase().includes(q) ||
          (t.tags ?? []).some(tag => tag.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [allTools, searchQuery]);

  // Alternatives: same category, excluding selected, sorted by rank_score
  const alternatives = useMemo(() => {
    if (!selectedProduct) return [];
    return allTools
      .filter(
        (t) =>
          t.category === selectedProduct.category &&
          t.slug !== selectedProduct.slug
      )
      .sort((a, b) => b.rank_score - a.rank_score);
  }, [allTools, selectedProduct]);

  // Popular stacks (most reviewed) for default view
  const popularStacks = useMemo(() => {
    return [...allTools]
      .sort((a, b) => b.review_count - a.review_count)
      .slice(0, 12);
  }, [allTools]);

  // Category counts — precomputed once so PopularStackCard doesn't recompute per card (A10)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allTools.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, [allTools]);

  // Precompute altCount per tool (category size - 1) so each card doesn't recompute
  const altCountForTool = useMemo(() => {
    return (tool: Tool) => Math.max(0, (categoryCounts[tool.category] || 1) - 1);
  }, [categoryCounts]);

  const categories = CATEGORY_META.filter(
    (c) => c.name !== "All" && (categoryCounts[c.name] || 0) > 1
  );

  const handleSelect = (slug: string) => {
    setSelectedSlug(slug);
    setSearchQuery("");
    setSearchOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

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
              Alternatives
            </span>
          </nav>

          <div className="flex items-start justify-between gap-6 flex-wrap mb-6">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  <Repeat2 className="w-3 h-3" />
                  Alternatives
                </span>
              </div>
              <h1 className="font-['Inter',system-ui,sans-serif] text-[clamp(24px,3vw,30px)] font-black text-gray-900 tracking-tight leading-tight m-0">
                Find the Best Alternatives
              </h1>
              <p className="text-[15px] text-slate-500 font-normal mt-2 leading-relaxed">
                Search for any AI or SaaS stack and discover top-rated
                alternatives. Compare features, pricing, and reviews.
              </p>
            </div>

            {/* Search bar (inside hero, right side) */}
            <div className="relative w-full max-w-[340px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                placeholder="Search stacks..."
                className="w-full bg-slate-50 border border-slate-200 rounded-[10px] py-[11px] pl-10 pr-9 text-[13px] text-slate-900 outline-none transition-colors focus:border-amber-400 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate-400 flex p-0 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Search results dropdown */}
              {searchOpen &&
                searchQuery.trim() &&
                searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1.5 bg-white border-[1.5px] border-slate-200 rounded-xl shadow-xl overflow-hidden">
                    {searchResults.map((tool) => (
                      <SearchResultItem
                        key={tool.slug}
                        tool={tool}
                        onSelect={handleSelect}
                      />
                    ))}
                  </div>
                )}

              {searchOpen &&
                searchQuery.trim() &&
                searchResults.length === 0 &&
                !loading && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1.5 bg-white border-[1.5px] border-slate-200 rounded-xl shadow-lg p-4 text-center">
                    <p className="text-[13px] text-slate-500">
                      No stacks found matching &ldquo;{searchQuery}&rdquo;
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1">

        {/* ── Selected Stack + Alternatives ── */}
        {selectedProduct && (
          <section className="bg-slate-50/50 py-8 sm:py-10 border-b border-slate-100">
            <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
              {/* Selected stack header */}
              <div className="bg-white border-[1.5px] border-amber-200 rounded-2xl p-5 sm:p-6 mb-6 shadow-sm">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-100 shadow-sm shrink-0 bg-slate-50 flex items-center justify-center">
                    <LogoWithFallback
                      src={selectedProduct.logo_url}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                      fallbackSize="text-xl"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg sm:text-xl font-black text-slate-900">
                        Alternatives to {selectedProduct.name}
                      </h2>
                      {selectedProduct.is_verified && (
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-[13px] text-slate-500 mt-1">
                      {alternatives.length} alternative
                      {alternatives.length !== 1 ? "s" : ""} in{" "}
                      {selectedProduct.category}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSlug(null);
                      setSearchQuery("");
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-bold text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> Clear
                  </button>
                </div>
              </div>

              {/* Alternatives list */}
              {alternatives.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {alternatives.map((tool, i) => (
                    <AlternativeRow
                      key={tool.slug}
                      tool={tool}
                      rank={i + 1}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                  <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-[15px] font-bold text-slate-600 mb-1">
                    No alternatives found
                  </h3>
                  <p className="text-[13px] text-slate-400">
                    We don&apos;t have other stacks in the{" "}
                    {selectedProduct.category} category yet.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Popular Stacks (default view when nothing selected) ── */}
        {!selectedProduct && (
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
                  Popular Stacks
                </h2>
                <p className="text-[14px] text-slate-500 max-w-[480px]">
                  Discover alternatives to the most popular AI and SaaS stacks
                  on the platform.
                </p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <PopularCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {popularStacks.map((tool) => (
                    <PopularStackCard
                      key={tool.slug}
                      tool={tool}
                      altCount={altCountForTool(tool)}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Browse by Category ── */}
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
                Find Alternatives by Category
              </h2>
              <p className="text-[14px] text-slate-500 max-w-[480px]">
                Browse categories to discover alternative stacks in your area of
                interest.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() =>
                    router.push(
                      `/tools?category=${encodeURIComponent(cat.name)}`
                    )
                  }
                  className="group bg-white border border-slate-200 rounded-xl px-4 sm:px-5 py-3.5 flex items-center gap-3 text-left transition-all duration-200 hover:border-amber-200 hover:shadow-md w-full"
                >
                  <span className="text-2xl shrink-0">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-extrabold text-slate-900">
                      {cat.name}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {categoryCounts[cat.name] || 0} stacks
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
