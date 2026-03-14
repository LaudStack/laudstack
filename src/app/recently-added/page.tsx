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
  return diffMs < 7 * 24 * 60 * 60 * 1000; // 7 days
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "most_lauded", label: "Most Lauded" },
  { value: "top_rated", label: "Top Rated" },
];

function CardSkeleton() {
  return (
    <div style={{ background: "#FFFFFF", borderRadius: "16px", border: "1px solid #E8ECF0", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "14px 14px 10px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <div className="animate-pulse" style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#F1F5F9", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="animate-pulse" style={{ width: "60%", height: "16px", background: "#F1F5F9", borderRadius: "6px", marginBottom: "8px" }} />
          <div className="animate-pulse" style={{ width: "40%", height: "12px", background: "#F8FAFC", borderRadius: "6px" }} />
        </div>
      </div>
      <div style={{ padding: "0 14px 10px" }}>
        <div className="animate-pulse" style={{ width: "100%", height: "12px", background: "#F8FAFC", borderRadius: "4px", marginBottom: "6px" }} />
        <div className="animate-pulse" style={{ width: "75%", height: "12px", background: "#F8FAFC", borderRadius: "4px" }} />
      </div>
      <div style={{ marginTop: "auto", padding: "10px 14px", borderTop: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between" }}>
        <div className="animate-pulse" style={{ width: "60px", height: "14px", background: "#F8FAFC", borderRadius: "4px" }} />
        <div className="animate-pulse" style={{ width: "50px", height: "14px", background: "#F8FAFC", borderRadius: "4px" }} />
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

  // Recently launched = all stacks sorted by most recent activity (launched or added)
  const recentTools = useMemo(() => {
    let tools = [...allTools];
    if (category !== "All") tools = tools.filter((t) => t.category === category);
    if (sort === "newest") {
      tools.sort((a, b) => {
        const dateA = Math.max(new Date(a.launched_at).getTime(), new Date(a.created_at).getTime());
        const dateB = Math.max(new Date(b.launched_at).getTime(), new Date(b.created_at).getTime());
        return dateB - dateA;
      });
    }
    else if (sort === "most_lauded") tools.sort((a, b) => b.upvote_count - a.upvote_count);
    else if (sort === "top_rated") tools.sort((a, b) => b.average_rating - a.average_rating);
    return tools;
  }, [allTools, category, sort]);

  const visibleTools = recentTools.slice(0, visible);

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", display: "flex", flexDirection: "column" }}>
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
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #E8ECF0", position: "sticky", top: 64, zIndex: 20 }}>
        <div className="max-w-[1280px] mx-auto w-full px-3 sm:px-6 lg:px-10" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "52px", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "auto", flex: 1 }}>
            <select value={category} onChange={(e) => { setCategory(e.target.value); setVisible(20); }} style={{ padding: "5px 10px", borderRadius: "8px", border: "1.5px solid #E8ECF0", fontSize: "12px", fontWeight: 600, color: "#374151", background: "#F9FAFB", cursor: "pointer", fontFamily: "inherit", outline: "none" }}>
              {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={sort} onChange={(e) => { setSort(e.target.value); setVisible(20); }} style={{ padding: "5px 10px", borderRadius: "8px", border: "1.5px solid #E8ECF0", fontSize: "12px", fontWeight: 600, color: "#374151", background: "#F9FAFB", cursor: "pointer", fontFamily: "inherit", outline: "none" }}>
              {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 500, whiteSpace: "nowrap" }}>
              <span style={{ color: "#171717", fontWeight: 800 }}>{recentTools.length}</span> stacks
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1280px] mx-auto w-full px-3 sm:px-6 lg:px-10" style={{ paddingTop: "24px", paddingBottom: "48px", flex: 1 }}>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ gap: "20px" }}>
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : recentTools.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <PackageOpen style={{ width: "48px", height: "48px", color: "#D1D5DB", margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#171717", marginBottom: "8px" }}>No stacks found</h3>
            <p style={{ fontSize: "14px", color: "#9CA3AF" }}>Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ gap: "20px" }}>
              {visibleTools.map((tool) => {
                const recentDate = getRecentDate(tool);
                const isNew = isNewLaunch(recentDate);
                return (
                  <div
                    key={tool.id}
                    onClick={() => router.push(`/tools/${tool.slug}`)}
                    style={{ background: "#FFFFFF", borderRadius: "16px", border: "1px solid #E8ECF0", overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transition: "transform 0.2s ease, box-shadow 0.2s ease", position: "relative" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}
                  >
                    {/* New badge for stacks launched in the last 7 days */}
                    {isNew && (
                      <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", alignItems: "center", gap: "3px", background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: "6px", padding: "2px 8px", zIndex: 1 }}>
                        <Sparkles style={{ width: "10px", height: "10px", color: "#059669" }} />
                        <span style={{ fontSize: "10px", fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.05em" }}>New</span>
                      </div>
                    )}

                    <div style={{ padding: "14px 14px 10px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "12px", flexShrink: 0, border: "1px solid #E8ECF0", background: "#F8FAFC", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img src={tool.logo_url} alt={tool.name} style={{ width: "36px", height: "36px", objectFit: "contain" }} onError={(e) => { e.currentTarget.style.display = "none"; if (e.currentTarget.parentElement) e.currentTarget.parentElement.innerHTML = `<span style="font-size:18px;font-weight:800;color:#64748B">${tool.name.charAt(0)}</span>`; }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "3px" }}>
                          <span style={{ fontSize: "14px", fontWeight: 800, color: "#171717", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tool.name}</span>
                          {tool.is_verified && <Shield style={{ width: "12px", height: "12px", color: "#22C55E" }} />}
                        </div>
                        <span style={{ fontSize: "11px", color: "#6B7280", fontWeight: 600, background: "#F3F4F6", padding: "2px 8px", borderRadius: "6px" }}>{tool.category}</span>
                      </div>
                    </div>
                    <div style={{ padding: "0 14px 10px" }}>
                      <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{tool.tagline}</p>
                    </div>
                    <div style={{ marginTop: "auto", padding: "10px 14px", borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <ChevronUp style={{ width: "12px", height: "12px", color: "#F59E0B" }} />
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}>{tool.upvote_count}</span>
                        </div>
                        {tool.average_rating > 0 && (
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Star style={{ width: "12px", height: "12px", color: "#F59E0B", fill: "#F59E0B" }} />
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}>{tool.average_rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Rocket style={{ width: "12px", height: "12px", color: "#F59E0B" }} />
                        <span style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF" }}>{timeAgo(recentDate)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {visible < recentTools.length && (
              <div style={{ textAlign: "center", marginTop: "32px" }}>
                <button onClick={() => setVisible((v) => v + 20)} style={{ padding: "10px 32px", borderRadius: "10px", border: "1.5px solid #E8ECF0", background: "#FFFFFF", fontSize: "13px", fontWeight: 700, color: "#374151", cursor: "pointer", transition: "border-color 0.15s, background 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#F59E0B"; e.currentTarget.style.background = "#FFFBEB"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E8ECF0"; e.currentTarget.style.background = "#FFFFFF"; }}
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
