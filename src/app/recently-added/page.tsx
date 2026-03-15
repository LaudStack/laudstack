"use client";

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
import { Rocket, Star, Shield, ChevronUp, PackageOpen, Sparkles } from "lucide-react";

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
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
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
      <div className="mt-auto px-3.5 py-2.5 border-t border-slate-100 flex justify-between">
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
        eyebrow="Recently Launched"
        title="Recently Launched on LaudStack"
        subtitle="The latest stacks launched by founders and added to the platform — discover what's new."
        accent="amber"
        layout="default"
        size="md"
      />

      {/* Filter bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-20">
        <div className="max-w-[1280px] mx-auto w-full px-3 sm:px-6 lg:px-10 flex items-center justify-between h-13 gap-3">
          <div className="flex items-center gap-2.5 overflow-auto flex-1">
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setVisible(20); }}
              className="px-2.5 py-1.5 rounded-lg border-[1.5px] border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 cursor-pointer outline-none"
            >
              {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setVisible(20); }}
              className="px-2.5 py-1.5 rounded-lg border-[1.5px] border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 cursor-pointer outline-none"
            >
              {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
              <span className="text-slate-900 font-extrabold">{recentTools.length}</span> stacks
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1280px] mx-auto w-full px-3 sm:px-6 lg:px-10 pt-6 pb-12 flex-1">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : recentTools.length === 0 ? (
          <div className="text-center py-20">
            <PackageOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">No stacks found</h3>
            <p className="text-sm text-slate-400">Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {visibleTools.map((tool) => {
                const recentDate = getRecentDate(tool);
                const isNew = isNewLaunch(recentDate);
                return (
                  <div
                    key={tool.id}
                    onClick={() => router.push(`/tools/${tool.slug}`)}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer flex flex-col shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-amber-200 relative"
                  >
                    {/* New badge */}
                    {isNew && (
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-0.5 z-[1]">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">New</span>
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
                      <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2">{tool.tagline}</p>
                    </div>

                    <div className="mt-auto px-3.5 py-2.5 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <ChevronUp className="w-3 h-3 text-amber-500" />
                          <span className="text-xs font-bold text-slate-700">{tool.upvote_count}</span>
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
                        <span className="text-[11px] font-semibold text-slate-400">{timeAgo(recentDate)}</span>
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
                  className="px-8 py-2.5 rounded-lg border-[1.5px] border-slate-200 bg-white text-sm font-bold text-slate-700 cursor-pointer transition-all hover:border-amber-400 hover:bg-amber-50"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
