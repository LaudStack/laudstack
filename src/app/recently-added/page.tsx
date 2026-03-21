"use client";
export const dynamic = "force-dynamic";

/**
 * /recently-added — Recently Launched Stacks
 *
 * Read-only page showing the newest stacks on LaudStack.
 * Data comes from useToolsData() which fetches real DB data via /api/homepage.
 * Sorting is client-side on real data — no mock or fake data.
 */

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import LogoWithFallback from "@/components/LogoWithFallback";
import { useToolsData } from "@/hooks/useToolsData";
import { CATEGORY_META } from "@/lib/categories";
import { Rocket, Star, Shield, PackageOpen, Sparkles } from "lucide-react";
import FeaturedStacksSidebar from "@/components/FeaturedStacksSidebar";

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

function getRecentDate(tool: { launched_at: string; created_at: string }): string {
  const launched = new Date(tool.launched_at).getTime();
  const created = new Date(tool.created_at).getTime();
  return launched > created ? tool.launched_at : tool.created_at;
}

function isNewLaunch(dateStr: string): boolean {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  return diffMs < 7 * 24 * 60 * 60 * 1000;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "most_lauded", label: "Most Lauded" },
  { value: "top_rated", label: "Top Rated" },
];

function CardSkeleton() {
  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-3.5 pb-2.5 flex items-start gap-3">
        <div className="animate-pulse w-12 h-12 rounded-xl bg-slate-100 shrink-0" />
        <div className="flex-1">
          <div className="animate-pulse w-3/5 h-4 bg-slate-100 rounded-md mb-2" />
          <div className="animate-pulse w-2/5 h-3 bg-slate-50 rounded-md" />
        </div>
      </div>
      <div className="px-3.5 pb-2.5">
        <div className="animate-pulse w-full h-3 bg-slate-50 rounded mb-1.5" />
        <div className="animate-pulse w-3/4 h-3 bg-slate-50 rounded" />
      </div>
      <div className="mt-auto px-3.5 py-2.5 border-t border-slate-200 flex justify-between">
        <div className="animate-pulse w-15 h-3.5 bg-slate-50 rounded" />
        <div className="animate-pulse w-12 h-3.5 bg-slate-50 rounded" />
      </div>
    </div>
  );
}

export default function RecentlyLaunched() {
  const { tools: allTools, loading } = useToolsData();
  const router = useRouter();
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [visible, setVisible] = useState(20);

  const allCategories = ["All", ...CATEGORY_META.map((c) => c.name).filter((n) => n !== "All")];

  const recentTools = useMemo(() => {
    let tools = [...allTools];
    if (category !== "All") tools = tools.filter((t) => t.category === category);
    if (sort === "newest") {
      tools.sort((a, b) => {
        const dateA = Math.max(new Date(a.launched_at).getTime(), new Date(a.created_at).getTime());
        const dateB = Math.max(new Date(b.launched_at).getTime(), new Date(b.created_at).getTime());
        return dateB - dateA;
      });
    } else if (sort === "most_lauded") {
      tools.sort((a, b) => b.upvote_count - a.upvote_count);
    } else if (sort === "top_rated") {
      tools.sort((a, b) => b.average_rating - a.average_rating);
    }
    return tools;
  }, [allTools, category, sort]);

  const visibleTools = recentTools.slice(0, visible);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <PageHero
        breadcrumbs={[{ label: 'Recently Added' }]}
        eyebrow="Recently Launched"
        title="Recently Launched on LaudStack"
        subtitle="Fresh stacks from founders. Discover what's new."
        accent="amber"
        layout="centered"
        size="md"
      />

      {/* ── Filter Bar ──────────────────────────────────────────── */}
      <div
        className="sticky top-[56px] sm:top-[64px] z-20"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5 py-3 sm:py-3.5 flex-wrap">
            <div className="flex items-center bg-white rounded-xl overflow-hidden" style={{ border: "1.5px solid #E2E8F0" }}>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setVisible(20); }}
                className="px-3 py-[8px] text-[13px] font-semibold text-slate-700 bg-transparent border-none outline-none cursor-pointer"
              >
                {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-center bg-white rounded-xl overflow-hidden" style={{ border: "1.5px solid #E2E8F0" }}>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setVisible(20); }}
                className="px-3 py-[8px] text-[13px] font-semibold text-slate-700 bg-transparent border-none outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <span className="text-[12px] text-slate-500 font-medium ml-auto whitespace-nowrap">
              <span className="text-slate-900 font-extrabold">{recentTools.length}</span> stacks
            </span>
          </div>
        </div>
      </div>

      {/* Content + Sidebar split */}
      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8">
      <div className="flex gap-8">
      <div className="flex-1 min-w-0 pt-6 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : recentTools.length === 0 ? (
          <div className="text-center py-20">
            <PackageOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-900 mb-2">No stacks found</h3>
            <p className="text-sm text-slate-600">Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {visibleTools.map((tool) => {
                const recentDate = getRecentDate(tool);
                const isNew = isNewLaunch(recentDate);
                return (
                  <div
                    key={tool.id}
                    onClick={() => router.push(`/tools/${tool.slug}`)}
                    className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden cursor-pointer flex flex-col shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-amber-200 relative"
                  >
                    {/* New badge */}
                    {isNew && (
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-0.5 z-[1]">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">New</span>
                      </div>
                    )}

                    <div className="p-3.5 pb-2.5 flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl shrink-0 border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                        <LogoWithFallback src={tool.logo_url} alt={tool.name} className="w-9 h-9 object-contain" fallbackSize="text-lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-sm font-extrabold text-slate-900 truncate">{tool.name}</span>
                          {tool.is_verified && <Shield className="w-3 h-3 text-emerald-500 shrink-0" />}
                        </div>
                        <span className="text-[11px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">{tool.category}</span>
                      </div>
                    </div>

                    <div className="px-3.5 pb-2.5">
                      <p className="text-[13px] text-slate-600 leading-relaxed line-clamp-2">{tool.tagline}</p>
                    </div>

                    <div className="mt-auto px-3.5 py-2.5 border-t border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex items-center gap-1 transition-all"
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
                        {tool.average_rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span className="text-xs font-bold text-slate-700">{tool.average_rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Rocket className="w-3 h-3 text-amber-500" />
                        <span className="text-[11px] font-semibold text-slate-500">{timeAgo(recentDate)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {visible < recentTools.length && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setVisible((v) => v + 20)}
                  className="px-8 py-2.5 rounded-lg border-[1.5px] border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 cursor-pointer transition-all hover:border-amber-400 hover:bg-amber-50"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Promoted stacks sidebar */}
      <aside className="hidden lg:block w-[280px] shrink-0 sticky top-[116px] self-start">
        <FeaturedStacksSidebar limit={5} title="Featured" variant="panel" />
      </aside>
      </div>
      </div>

      <Footer />
    </div>
  );
}
