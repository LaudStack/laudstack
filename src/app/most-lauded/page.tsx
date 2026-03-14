"use client";

export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { useToolsData } from "@/hooks/useToolsData";
import { CATEGORY_META } from "@/lib/categories";
import type { Tool } from "@/lib/types";
import { Heart, Star, Shield, Crown, ThumbsUp, MessageSquare, ChevronRight } from "lucide-react";

function PodiumCard({ tool, rank }: { tool: Tool; rank: number }) {
  const router = useRouter();
  const colors: Record<number, { border: string; bg: string; text: string; crown: string }> = {
    1: { border: "#F59E0B", bg: "#FFFBEB", text: "#D97706", crown: "#F59E0B" },
    2: { border: "#94A3B8", bg: "#F8FAFC", text: "#64748B", crown: "#94A3B8" },
    3: { border: "#EA580C", bg: "#FFF7ED", text: "#C2410C", crown: "#EA580C" },
  };
  const c = colors[rank] || colors[3];

  return (
    <div
      onClick={() => router.push(`/tools/${tool.slug}`)}
      style={{ background: c.bg, borderRadius: "16px", border: `2px solid ${c.border}`, padding: "24px 20px", textAlign: "center", cursor: "pointer", position: "relative", transition: "transform 0.2s" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {rank === 1 && <Crown style={{ width: "24px", height: "24px", color: c.crown, position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)" }} />}
      <div style={{ fontSize: "32px", fontWeight: 900, color: c.text, marginBottom: "12px" }}>#{rank}</div>
      <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "#FFFFFF", border: "1px solid #E8ECF0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", overflow: "hidden" }}>
        {tool.logo_url ? (
          <img src={tool.logo_url} alt={tool.name} style={{ width: "40px", height: "40px", objectFit: "contain" }} />
        ) : (
          <span style={{ fontSize: "24px", fontWeight: 900, color: c.text }}>{tool.name[0]}</span>
        )}
      </div>
      <div style={{ fontSize: "16px", fontWeight: 800, color: "#171717", marginBottom: "4px" }}>{tool.name}</div>
      <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{tool.tagline}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Heart style={{ width: "14px", height: "14px", color: "#F59E0B", fill: "#F59E0B" }} />
          <span style={{ fontSize: "14px", fontWeight: 800, color: "#374151" }}>{tool.upvote_count}</span>
        </div>
        {tool.average_rating > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Star style={{ width: "14px", height: "14px", color: "#F59E0B", fill: "#F59E0B" }} />
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#374151" }}>{tool.average_rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MostLauded() {
  const { tools: allTools, loading } = useToolsData();
  const router = useRouter();
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
    <div style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <PageHero
        eyebrow="Most Lauded"
        title="Most Lauded Tools"
        subtitle="The tools the community loves most — ranked by total Lauds from verified users."
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
            <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 500, whiteSpace: "nowrap" }}>
              <span style={{ color: "#171717", fontWeight: 800 }}>{laudedTools.length}</span> lauded tools
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1280px] mx-auto w-full px-3 sm:px-6 lg:px-10" style={{ paddingTop: "24px", paddingBottom: "48px", flex: 1 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div className="animate-spin" style={{ width: 32, height: 32, border: "3px solid #E5E7EB", borderTopColor: "#F59E0B", borderRadius: "50%", margin: "0 auto 16px" }} />
            <p style={{ fontSize: "14px", color: "#9CA3AF" }}>Loading most lauded tools...</p>
          </div>
        ) : laudedTools.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>❤️</div>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#171717", marginBottom: "8px" }}>No lauded tools yet</h3>
            <p style={{ fontSize: "14px", color: "#9CA3AF" }}>Be the first to laud a tool you love!</p>
          </div>
        ) : (
          <>
            {/* Podium */}
            {top3.length >= 3 && (
              <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: "16px", marginBottom: "32px" }}>
                {/* Reorder: 2nd, 1st, 3rd on desktop */}
                <div className="hidden md:block order-1"><PodiumCard tool={top3[1]} rank={2} /></div>
                <div className="order-0 md:order-0"><PodiumCard tool={top3[0]} rank={1} /></div>
                <div className="hidden md:block order-2"><PodiumCard tool={top3[2]} rank={3} /></div>
                {/* Show 2nd and 3rd on mobile too */}
                <div className="md:hidden"><PodiumCard tool={top3[1]} rank={2} /></div>
                <div className="md:hidden"><PodiumCard tool={top3[2]} rank={3} /></div>
              </div>
            )}

            {/* Ranked list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {rest.map((tool, i) => (
                <div
                  key={tool.id}
                  onClick={() => router.push(`/tools/${tool.slug}`)}
                  style={{ background: "#FFFFFF", borderRadius: "12px", border: "1px solid #E8ECF0", padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "14px", transition: "background 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#FAFBFC"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#FFFFFF"; }}
                >
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "#9CA3AF", width: "32px", textAlign: "center", flexShrink: 0 }}>#{i + 4}</span>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", border: "1px solid #E8ECF0", background: "#F8FAFC", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <img src={tool.logo_url} alt={tool.name} style={{ width: "28px", height: "28px", objectFit: "contain" }} onError={(e) => { e.currentTarget.style.display = "none"; if (e.currentTarget.parentElement) e.currentTarget.parentElement.innerHTML = `<span style="font-size:14px;font-weight:800;color:#64748B">${tool.name.charAt(0)}</span>`; }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#171717" }}>{tool.name}</span>
                      {tool.is_verified && <Shield style={{ width: "12px", height: "12px", color: "#22C55E" }} />}
                    </div>
                    <p style={{ fontSize: "12px", color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{tool.tagline}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Heart style={{ width: "14px", height: "14px", color: "#F59E0B", fill: "#F59E0B" }} />
                      <span style={{ fontSize: "13px", fontWeight: 800, color: "#374151" }}>{tool.upvote_count}</span>
                    </div>
                    {tool.average_rating > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Star style={{ width: "13px", height: "13px", color: "#F59E0B", fill: "#F59E0B" }} />
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>{tool.average_rating.toFixed(1)}</span>
                      </div>
                    )}
                    <ChevronRight style={{ width: "16px", height: "16px", color: "#CBD5E1" }} />
                  </div>
                </div>
              ))}
            </div>

            {visible < laudedTools.length && (
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
