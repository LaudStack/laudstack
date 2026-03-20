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
import Breadcrumbs from '@/components/Breadcrumbs';
import { useRouter } from "next/navigation";
import {
  Star,
  Shield,
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
      className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden cursor-pointer flex flex-col shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
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
            <span className="text-sm font-extrabold text-slate-900 truncate">
              {tool.name}
            </span>
            {tool.is_verified && (
              <Shield className="w-3 h-3 text-green-500 shrink-0" />
            )}
          </div>
          <span className="text-[11px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
            {tool.category}
          </span>
        </div>
      </div>

      {/* Tagline */}
      <div className="px-3.5 pb-2.5">
        <p className="text-[13px] text-slate-600 leading-snug line-clamp-2">
          {tool.tagline}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-auto px-3.5 py-2.5 border-t border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-slate-900">
              {tool.average_rating > 0
                ? tool.average_rating.toFixed(1)
                : "N/A"}
            </span>
            {tool.review_count > 0 && (
              <span className="text-[11px] text-slate-500 font-medium">
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
        <div
          className="flex items-center gap-1"
          style={{
            padding: '3px 8px',
            borderRadius: 6,
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
            className="px-1 text-slate-500 text-[13px]"
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
    <section className="bg-slate-50 border-t border-slate-200 py-6 sm:py-10">
      <div className="max-w-[1300px] mx-auto w-full px-4 sm:px-6">
        <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-4 sm:mb-5 tracking-tight">
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200 no-underline transition-colors hover:border-amber-300 group"
            >
              <div>
                <span className="text-[13px] font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                  {link.label}
                </span>
                {link.description && (
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">
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
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* ══════════ UNIFIED HERO — premium background treatment ══════════ */}
      <section className="relative border-b border-slate-200 pt-[60px] lg:pt-[64px] overflow-hidden" style={{ background: '#F8FAFC' }}>
        {/* Decorative dot grid */}
        <div aria-hidden className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #CBD5E1 0.8px, transparent 0.8px)', backgroundSize: '24px 24px', opacity: 0.35, pointerEvents: 'none' }} />
        {/* Accent glow */}
        <div aria-hidden className="absolute" style={{ top: '-20%', right: '-5%', width: '500px', height: '400px', background: 'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        {/* Left accent bar */}
        <div aria-hidden className="absolute left-0 top-0 bottom-0" style={{ width: '3px', background: '#D97706' }} />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-[30px] pb-[26px] relative z-[1]">
          {/* Breadcrumb */}
          {breadcrumbs.length > 0 && (
            <Breadcrumbs items={breadcrumbs} className="mb-3 sm:mb-4" />
          )}

          {/* Title row — centered */}
          <div className="flex flex-col items-center text-center mb-2">
              {/* Eyebrow badge */}
              {eyebrow && (
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    {eyebrow}
                  </span>
                </div>
              )}
              <h1 className="font-['Inter',system-ui,sans-serif] text-xl sm:text-[clamp(24px,3vw,30px)] font-black text-slate-900 tracking-tight leading-tight m-0">
                {title}
              </h1>
              <p className="text-[13px] sm:text-[15px] text-slate-600 font-normal mt-1.5 sm:mt-2 leading-relaxed max-w-[560px]">
                {subtitle}
              </p>
          </div>
        </div>
      </section>

      {/* ══════════ FILTER BAR ══════════ */}
      <div
        className="sticky top-[56px] sm:top-[64px] z-20"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <div className="max-w-[1300px] mx-auto w-full px-4 sm:px-6">
          <div className="flex items-center gap-2.5 py-3 sm:py-3.5 flex-wrap">
            <div className="flex items-center bg-white rounded-xl overflow-hidden" style={{ border: "1.5px solid #E2E8F0" }}>
              <select
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-[8px] text-[13px] font-semibold text-slate-700 bg-transparent border-none outline-none cursor-pointer"
              >
                {sortOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-[12px] text-slate-500 font-medium ml-auto whitespace-nowrap">
              <span className="text-slate-900 font-extrabold">
                {totalCount}
              </span>{" "}
              stacks
            </span>
          </div>
        </div>
      </div>

      {/* ══════════ TOOL GRID ══════════ */}
      <div className="max-w-[1300px] mx-auto w-full px-4 sm:px-6 pt-6 pb-4 flex-1">
        {tools.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-xl font-black text-slate-900 mb-2">
              No tools found
            </h3>
            <p className="text-sm text-slate-600">
              Check back soon as new tools are added regularly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
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

      {/* Optional children (e.g. ComparisonTable) */}
      {children && (
        <div className="max-w-[1300px] mx-auto w-full px-4 sm:px-6">
          {children}
        </div>
      )}

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
