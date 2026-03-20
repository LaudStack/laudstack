"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  /** Optional className for the outer nav */
  className?: string;
}

/**
 * Unified Breadcrumbs component used across the entire platform.
 *
 * Design:
 * - Home icon (+ "Home" text on desktop) as the first crumb
 * - ChevronRight separator with consistent sizing
 * - Horizontally aligned on mobile with overflow-x-auto (no wrapping)
 * - Well-spaced on desktop with slightly larger gaps
 * - Last item is bold/darker to indicate current page
 * - Truncation on long labels to prevent overflow
 * - Smooth hover transitions with amber accent
 * - Always visible on both mobile and desktop
 */
export default function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      className={`flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide ${className}`}
      aria-label="Breadcrumb"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {/* Home crumb */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 sm:gap-1.5 text-xs sm:text-[13px] text-slate-600 no-underline font-medium hover:text-amber-600 transition-colors shrink-0 py-1"
      >
        <Home className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {/* Crumb items */}
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="inline-flex items-center gap-1.5 sm:gap-2 shrink-0">
            <ChevronRight
              className="w-3 h-3 text-slate-300 shrink-0"
              aria-hidden="true"
            />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-xs sm:text-[13px] text-slate-600 no-underline font-medium hover:text-amber-600 transition-colors whitespace-nowrap max-w-[140px] sm:max-w-[220px] truncate py-1"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`text-xs sm:text-[13px] font-semibold whitespace-nowrap py-1 ${
                  isLast
                    ? "text-slate-700 max-w-[160px] sm:max-w-[260px] truncate"
                    : "text-slate-600 max-w-[140px] sm:max-w-[220px] truncate"
                }`}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
