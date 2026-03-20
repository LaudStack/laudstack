"use client";
/**
 * SEOPageClient — Client-side wrapper for SEO pages that handles
 * data fetching, sort/pagination state, and loading states.
 *
 * Server components pass initial data; this component handles interactivity.
 */
import { useState, useTransition } from "react";
import SEOPageShell from "@/components/SEOPageShell";
import type { Tool } from "@/lib/types";

interface InternalLink {
  label: string;
  href: string;
  description?: string;
}

interface SEOPageClientProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  accent?: "amber" | "blue" | "green" | "rose";
  initialTools: Tool[];
  totalCount: number;
  /** Server action to call when sort/page changes */
  fetchAction?: (sort: string, page: number) => Promise<{ tools: Tool[]; total: number }>;
  sortOptions?: { value: string; label: string }[];
  defaultSort?: string;
  relatedLinks?: InternalLink[];
  relatedLinksTitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  introText?: string;
  pageSize?: number;
  children?: React.ReactNode;
}

export default function SEOPageClient({
  eyebrow,
  title,
  subtitle,
  accent = "amber",
  initialTools,
  totalCount,
  fetchAction,
  sortOptions,
  defaultSort = "rank_score",
  relatedLinks = [],
  relatedLinksTitle,
  breadcrumbs = [],
  introText,
  pageSize = 24,
  children,
}: SEOPageClientProps) {
  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [total, setTotal] = useState(totalCount);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSort, setCurrentSort] = useState(defaultSort);
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.ceil(total / pageSize);

  const handleSortChange = (sort: string) => {
    setCurrentSort(sort);
    if (fetchAction) {
      startTransition(async () => {
        const result = await fetchAction(sort, 1);
        setTools(result.tools);
        setTotal(result.total);
        setCurrentPage(1);
      });
    }
  };

  const handlePageChange = (page: number) => {
    if (fetchAction) {
      startTransition(async () => {
        const result = await fetchAction(currentSort, page);
        setTools(result.tools);
        setTotal(result.total);
        setCurrentPage(page);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  };

  return (
    <div style={{ position: "relative" }}>
      {isPending && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, #F59E0B, #D97706)",
            zIndex: 9999,
            animation: "seo-loading 1.5s ease-in-out infinite",
          }}
        />
      )}
      <SEOPageShell
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        accent={accent}
        tools={tools}
        totalCount={total}
        sortOptions={sortOptions}
        defaultSort={defaultSort}
        onSortChange={handleSortChange}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={fetchAction ? handlePageChange : undefined}
        relatedLinks={relatedLinks}
        relatedLinksTitle={relatedLinksTitle}
        breadcrumbs={breadcrumbs}
        introText={introText}
      >
        {children}
      </SEOPageShell>
    </div>
  );
}
