"use client";

export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { useToolsData } from "@/hooks/useToolsData";
import { CATEGORY_META } from "@/lib/categories";
import { Rocket, Star, Shield, ThumbsUp, Clock } from "lucide-react";

function timeAgo(dateStr: string): string {
  const diffDays = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "most_lauded", label: "Most Lauded" },
  { value: "top_rated", label: "Top Rated" },
];

export default function RecentlyLaunched() {
  const { tools: allTools, loading } = useToolsData();
  const router = useRouter();
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [visible, setVisible] = useState(20);

  const allCategories = ["All", ...CATEGORY_META.map((c) => c.name).filter((n) => n !== "All")];

  // Recently launched = launched within last 30 days
  const recentTools = useMemo(() => {
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    let tools = allTools.filter((t) => {
      const launchTime = new Date(t.launched_at).getTime();
      return launchTime <= now && launchTime >= thirtyDaysAgo;
    });
    if (category !== "All") tools = tools.filter((t) => t.category === category);
    if (sort === "newest") tools.sort((a, b) => new Date(b.launched_at).getTime() - new Date(a.launched_at).getTime());
    else if (sort === "most_lauded") tools.sort((a, b) => b.upvote_count - a.upvote_count);
    else if (sort === "top_rated") tools.sort((a, b) => b.average_rating - a.average_rating);
    return tools;
  }, [allTools, category, sort]);

  const visibleTools = recentTools.slice(0, visible);

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <PageHero
        eyebrow="Recently Launched"
        title="Recently Launched Tools"
        subtitle="Tools launched in the last 30 days — discover the freshest additions to the platform."
        accent="green"
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
              <span style={{ color: "#171717", fontWeight: 800 }}>{recentTools.length}</span> launched recently
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1280px] mx-auto w-full px-3 sm:px-6 lg:px-10" style={{ paddingTop: "24px", paddingBottom: "48px", flex: 1 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div className="animate-spin" style={{ width: 32, height: 32, border: "3px solid #E5E7EB", borderTopColor: "#22C55E", borderRadius: "50%", margin: "0 auto 16px" }} />
            <p style={{ fontSize: "14px", color: "#9CA3AF" }}>Loading recently launched tools...</p>
          </div>
        ) : recentTools.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚀</div>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#171717", marginBottom: "8px" }}>No recent launches</h3>
            <p style={{ fontSize: "14px", color: "#9CA3AF" }}>No tools have been launched in the last 30 days. Check back soon!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ gap: "20px" }}>
              {visibleTools.map((tool) => (
                <div
                  key={tool.id}
                  onClick={() => router.push(`/tools/${tool.slug}`)}
                  style={{ background: "#FFFFFF", borderRadius: "16px", border: "1px solid #E8ECF0", overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}
                >
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
                        <ThumbsUp style={{ width: "12px", height: "12px", color: "#F59E0B" }} />
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
                      <Clock style={{ width: "12px", height: "12px", color: "#22C55E" }} />
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "#22C55E" }}>{timeAgo(tool.launched_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {visible < recentTools.length && (
              <div style={{ textAlign: "center", marginTop: "32px" }}>
                <button onClick={() => setVisible((v) => v + 20)} style={{ padding: "10px 32px", borderRadius: "10px", border: "1.5px solid #E8ECF0", background: "#FFFFFF", fontSize: "13px", fontWeight: 700, color: "#374151", cursor: "pointer" }}>
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
