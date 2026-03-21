"use client";
export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { useToolsData } from "@/hooks/useToolsData";
import { CATEGORY_META } from "@/lib/categories";
import type { Tool } from "@/lib/types";
import { Heart, Star, Shield, Crown, ChevronRight } from "lucide-react";
import LogoWithFallback from "@/components/LogoWithFallback";
import FeaturedStacksSidebar from "@/components/FeaturedStacksSidebar";

/* ── Podium color config ─────────────────────────────────────────────── */
const PODIUM_STYLES: Record<number, { border: string; bg: string; text: string; crown: string }> = {
  1: { border: "border-amber-400", bg: "bg-amber-50", text: "text-amber-600", crown: "text-amber-400" },
  2: { border: "border-slate-300", bg: "bg-slate-50", text: "text-slate-500", crown: "text-slate-400" },
  3: { border: "border-orange-400", bg: "bg-orange-50", text: "text-orange-600", crown: "text-orange-400" },
};

/* ── Podium Card ─────────────────────────────────────────────────────── */
function PodiumCard({ tool, rank }: { tool: Tool; rank: number }) {
  const s = PODIUM_STYLES[rank] || PODIUM_STYLES[3];

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className={`block relative rounded-2xl border-2 ${s.border} ${s.bg} p-5 sm:p-6 text-center cursor-pointer transition-transform duration-200 hover:-translate-y-1`}
    >
      {rank === 1 && (
        <Crown className={`w-6 h-6 ${s.crown} absolute -top-3 left-1/2 -translate-x-1/2`} />
      )}
      <div className={`text-3xl sm:text-4xl font-black ${s.text} mb-3`}>#{rank}</div>
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-3 overflow-hidden">
        <LogoWithFallback src={tool.logo_url} alt={tool.name} className="w-9 h-9 sm:w-10 sm:h-10 object-contain" fallbackSize="text-xl" />
      </div>
      <div className="text-sm sm:text-base font-extrabold text-slate-900 mb-1 truncate">{tool.name}</div>
      <p className="text-xs text-slate-500 mb-3 line-clamp-2">{tool.tagline}</p>
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-1">
          <Heart className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span className="text-sm font-extrabold text-slate-700">{tool.upvote_count}</span>
        </div>
        {tool.average_rating > 0 && (
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-sm font-bold text-slate-700">{tool.average_rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

/* ── Podium Skeleton ─────────────────────────────────────────────────── */
function PodiumSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-8">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6 text-center animate-pulse ${i === 1 ? "md:order-first" : ""}`}
        >
          <div className="w-10 h-6 bg-slate-200 rounded mx-auto mb-3" />
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 mx-auto mb-3" />
          <div className="w-24 h-4 bg-slate-200 rounded mx-auto mb-2" />
          <div className="w-32 h-3 bg-slate-100 rounded mx-auto mb-3" />
          <div className="w-16 h-4 bg-slate-100 rounded mx-auto" />
        </div>
      ))}
    </div>
  );
}

/* ── Row Skeleton ────────────────────────────────────────────────────── */
function RowSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-slate-50 rounded-xl border border-slate-200 px-3 sm:px-4 py-3 sm:py-3.5 flex items-center gap-3 sm:gap-3.5 animate-pulse">
          <div className="w-6 sm:w-8 h-4 bg-slate-200 rounded shrink-0" />
          <div className="w-10 h-10 rounded-[10px] bg-slate-100 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="w-28 h-4 bg-slate-200 rounded mb-1.5" />
            <div className="w-48 h-3 bg-slate-100 rounded" />
          </div>
          <div className="hidden sm:flex items-center gap-4 shrink-0">
            <div className="w-12 h-4 bg-slate-100 rounded" />
            <div className="w-12 h-4 bg-slate-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────── */
export default function MostLauded() {
  const { tools: allTools, loading } = useToolsData();
  const [category, setCategory] = useState("All");
  const [visible, setVisible] = useState(20);

  const allCategories = ["All", ...CATEGORY_META.map((c) => c.name).filter((n) => n !== "All")];

  const laudedTools = useMemo(() => {
    let tools = [...allTools].filter((t) => t.upvote_count > 0);
    if (category !== "All") tools = tools.filter((t) => t.category === category);
    tools.sort((a, b) => b.upvote_count - a.upvote_count);
    return tools;
  }, [allTools, category]);

  const top3 = laudedTools.slice(0, 3);
  const rest = laudedTools.slice(3, visible);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <PageHero
        breadcrumbs={[{ label: 'Most Lauded' }]}
        eyebrow="Most Lauded"
        title="Most Lauded Tools"
        subtitle="Community favorites, ranked by total Lauds."
        accent="amber"
        layout="centered"
        size="md"
      />

      {/* ── Filter Bar ────────────────────────────────────────────── */}
      <div
        className="sticky top-[56px] sm:top-[64px] z-20"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6">
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
            <span className="text-[12px] text-slate-500 font-medium ml-auto whitespace-nowrap">
              {loading ? (
                "Loading\u2026"
              ) : (
                <><span className="text-slate-900 font-extrabold">{laudedTools.length}</span> lauded stacks</>
              )}
            </span>
          </div>
        </div>
      </div>

        {/* ── Content + Sidebar split ────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8">
      <div className="flex gap-8">
      <div className="flex-1 min-w-0 pt-6 pb-12">
        {loading ? (
          <>
            <PodiumSkeleton />
            <RowSkeleton />
          </>
        ) : laudedTools.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-3xl sm:text-5xl mb-4">❤️</div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No lauded tools yet</h3>
            <p className="text-sm text-slate-500 mb-4">Be the first to laud a tool you love!</p>
            {category !== "All" && (
              <button
                onClick={() => { setCategory("All"); setVisible(20); }}
                className="text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors"
              >
                Clear category filter
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ── Podium ──────────────────────────────────────────── */}
            {top3.length >= 3 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-8">
                <div className="md:order-1"><PodiumCard tool={top3[1]} rank={2} /></div>
                <div className="md:order-0"><PodiumCard tool={top3[0]} rank={1} /></div>
                <div className="md:order-2"><PodiumCard tool={top3[2]} rank={3} /></div>
              </div>
            )}

            {/* ── Ranked list ─────────────────────────────────────── */}
            <div className="flex flex-col gap-2">
              {rest.map((tool, i) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.slug}`}
                  className="group bg-slate-50 rounded-xl border border-slate-200 px-3 sm:px-4 py-3 sm:py-3.5 flex items-center gap-3 sm:gap-3.5 transition-colors hover:bg-slate-50/80 hover:border-slate-300"
                >
                  <span className="text-xs sm:text-sm font-extrabold text-slate-500 w-6 sm:w-8 text-center shrink-0">
                    #{i + 4}
                  </span>
                  <div className="w-10 h-10 rounded-[10px] border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
                    <LogoWithFallback src={tool.logo_url} alt={tool.name} className="w-7 h-7 object-contain" fallbackSize="text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-900 truncate">{tool.name}</span>
                      {tool.is_verified && <Shield className="w-3 h-3 text-green-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{tool.tagline}</p>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-[13px] font-extrabold text-slate-700">{tool.upvote_count}</span>
                    </div>
                    {tool.average_rating > 0 && (
                      <div className="hidden sm:flex items-center gap-1">
                        <Star className="w-[13px] h-[13px] text-amber-500 fill-amber-500" />
                        <span className="text-[13px] font-bold text-slate-700">{tool.average_rating.toFixed(1)}</span>
                      </div>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>

            {/* ── Load More ───────────────────────────────────────── */}
            {visible < laudedTools.length && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setVisible((v) => v + 20)}
                  className="px-8 py-2.5 rounded-[10px] border-[1.5px] border-slate-200 bg-slate-50 text-[13px] font-bold text-slate-700 cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  Load More ({Math.max(0, laudedTools.length - visible)} remaining)
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
