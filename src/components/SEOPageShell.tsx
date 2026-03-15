"use client";
/**
 * SEOPageShell — Shared layout for all programmatic SEO pages.
 *
 * Provides: Navbar + unified hero (breadcrumb inside) + filter bar + tool grid
 *           + pagination + internal links + Footer
 *
 * All SEO pages compose this shell with their specific data.
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  Shield,
  ChevronUp,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LogoWithFallback from "@/components/LogoWithFallback";
import type { Tool } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InternalLink {
  label: string;
  href: string;
  description?: string;
}

interface SEOPageShellProps {
  /** Hero props */
  eyebrow: string;
  title: string;
  subtitle: string;
  accent?: "amber" | "blue" | "green" | "rose";
  /** Tool data */
  tools: Tool[];
  totalCount: number;
  /** Sort options */
  sortOptions?: { value: string; label: string }[];
  defaultSort?: string;
  onSortChange?: (sort: string) => void;
  /** Pagination */
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  /** Internal linking section */
  relatedLinks?: InternalLink[];
  relatedLinksTitle?: string;
  /** Breadcrumbs */
  breadcrumbs?: { label: string; href?: string }[];
  /** Optional intro text for SEO (rendered as subtitle, not a separate section) */
  introText?: string;
  /** Optional children below the tool grid */
  children?: React.ReactNode;
}

const DEFAULT_SORT_OPTIONS = [
  { value: "rank_score", label: "Best Match" },
  { value: "top_rated", label: "Top Rated" },
  { value: "trending", label: "Trending" },
  { value: "newest", label: "Newest" },
  { value: "most_lauded", label: "Most Lauded" },
];

// ─── Tool Grid Card ───────────────────────────────────────────────────────────

function SEOToolCard({ tool }: { tool: Tool }) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/tools/${tool.slug}`)}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer flex flex-col shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* Header */}
      <div className="p-3.5 pb-2.5 flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl shrink-0 border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
          <LogoWithFallback
            src={tool.logo_url}
            alt={tool.name}
            className="w-9 h-9 object-contain"
            fallbackSize="text-lg"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm font-extrabold text-gray-900 truncate">
              {tool.name}
            </span>
            {tool.is_verified && (
              <Shield className="w-3 h-3 text-green-500 shrink-0" />
            )}
          </div>
          <span className="text-[11px] text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded-md">
            {tool.category}
          </span>
        </div>
      </div>

      {/* Tagline */}
      <div className="px-3.5 pb-2.5">
        <p className="text-[13px] text-gray-500 leading-snug line-clamp-2">
          {tool.tagline}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-auto px-3.5 py-2.5 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-gray-900">
              {tool.average_rating > 0
                ? tool.average_rating.toFixed(1)
                : "N/A"}
            </span>
            {tool.review_count > 0 && (
              <span className="text-[11px] text-gray-400 font-medium">
                ({tool.review_count})
              </span>
            )}
          </div>
          {/* Pricing */}
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
              tool.pricing_model === "Free"
                ? "text-green-700 bg-green-50 border-green-200"
                : "text-slate-600 bg-slate-50 border-slate-200"
            }`}
          >
            {tool.pricing_model}
          </span>
        </div>
        {/* Lauds */}
        <div className="flex items-center gap-0.5 text-gray-500">
          <ChevronUp className="w-3.5 h-3.5" />
          <span className="text-xs font-bold">{tool.upvote_count}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 py-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-2.5 py-1.5 rounded-lg border text-[13px] font-semibold flex items-center gap-1 transition-colors ${
          currentPage === 1
            ? "border-slate-200 bg-slate-50 text-slate-300 cursor-default"
            : "border-slate-200 bg-white text-slate-700 cursor-pointer hover:border-slate-300"
        }`}
      >
        <ChevronLeft className="w-3.5 h-3.5" /> Prev
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`dots-${i}`}
            className="px-1 text-gray-400 text-[13px]"
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-[34px] h-[34px] rounded-lg text-[13px] flex items-center justify-center cursor-pointer transition-colors ${
              p === currentPage
                ? "border-[1.5px] border-amber-400 bg-amber-50 text-amber-800 font-extrabold"
                : "border border-slate-200 bg-white text-slate-700 font-semibold hover:border-slate-300"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-2.5 py-1.5 rounded-lg border text-[13px] font-semibold flex items-center gap-1 transition-colors ${
          currentPage === totalPages
            ? "border-slate-200 bg-slate-50 text-slate-300 cursor-default"
            : "border-slate-200 bg-white text-slate-700 cursor-pointer hover:border-slate-300"
        }`}
      >
        Next <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Related Links Section ────────────────────────────────────────────────────

function RelatedLinksSection({
  title,
  links,
}: {
  title: string;
  links: InternalLink[];
}) {
  if (links.length === 0) return null;
  return (
    <section className="bg-slate-50 border-t border-slate-200 py-10">
      <div className="max-w-[1300px] mx-auto w-full px-4 sm:px-6">
        <h2 className="text-xl font-extrabold text-gray-900 mb-5 tracking-tight">
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-xl border border-slate-200 no-underline transition-colors hover:border-amber-300 group"
            >
              <div>
                <span className="text-[13px] font-bold text-gray-900 group-hover:text-amber-700 transition-colors">
                  {link.label}
                </span>
                {link.description && (
                  <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                    {link.description}
                  </p>
                )}
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0 group-hover:text-amber-500 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Main Shell ───────────────────────────────────────────────────────────────

export default function SEOPageShell({
  eyebrow,
  title,
  subtitle,
  accent = "amber",
  tools,
  totalCount,
  sortOptions = DEFAULT_SORT_OPTIONS,
  defaultSort = "rank_score",
  onSortChange,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  relatedLinks = [],
  relatedLinksTitle = "Related Pages",
  breadcrumbs = [],
  introText,
  children,
}: SEOPageShellProps) {
  const [sort, setSort] = useState(defaultSort);

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    onSortChange?.(newSort);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* ══════════ UNIFIED HERO — breadcrumb inside, matches /categories pattern ══════════ */}
      <section className="bg-white border-b border-gray-200 pt-[84px] pb-6">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          {breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1.5 mb-5" aria-label="Breadcrumb">
              <Link
                href="/"
                className="text-xs text-slate-400 no-underline font-medium hover:text-slate-600 transition-colors"
              >
                Home
              </Link>
              {breadcrumbs.map((item, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-300">/</span>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="text-xs text-slate-400 no-underline font-medium hover:text-slate-600 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-500 font-semibold">
                      {item.label}
                    </span>
                  )}
                </span>
              ))}
            </nav>
          )}

          {/* Title row */}
          <div className="flex items-start justify-between gap-6 flex-wrap mb-2">
            <div>
              {/* Eyebrow badge */}
              {eyebrow && (
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    {eyebrow}
                  </span>
                </div>
              )}
              <h1 className="font-['Inter',system-ui,sans-serif] text-[clamp(24px,3vw,30px)] font-black text-gray-900 tracking-tight leading-tight m-0">
                {title}
              </h1>
              <p className="text-[15px] text-slate-500 font-normal mt-2 leading-relaxed max-w-xl">
                {subtitle}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FILTER BAR ══════════ */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-20">
        <div className="max-w-[1300px] mx-auto w-full px-4 sm:px-6 flex items-center justify-between h-[52px] gap-3">
          <div className="flex items-center gap-2.5 overflow-auto flex-1">
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg border-[1.5px] border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 cursor-pointer font-[inherit] outline-none hover:border-slate-300 transition-colors"
            >
              {sortOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
              <span className="text-gray-900 font-extrabold">
                {totalCount}
              </span>{" "}
              tools
            </span>
          </div>
        </div>
      </div>

      {/* ══════════ TOOL GRID ══════════ */}
      <div className="max-w-[1300px] mx-auto w-full px-4 sm:px-6 pt-6 pb-4 flex-1">
        {tools.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">
              No tools found
            </h3>
            <p className="text-sm text-gray-400">
              Check back soon as new tools are added regularly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {tools.map((tool) => (
              <SEOToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {onPageChange && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </div>

      {/* Optional children */}
      {children}

      {/* Related Links */}
      {relatedLinks.length > 0 && (
        <RelatedLinksSection
          title={relatedLinksTitle}
          links={relatedLinks}
        />
      )}

      <Footer />
    </div>
  );
}
