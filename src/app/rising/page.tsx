"use client";

export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { useToolsData } from "@/hooks/useToolsData";
import { CATEGORY_META } from "@/lib/categories";
import { TrendingUp, Star, Shield, ThumbsUp, ArrowUp, ArrowDown, Minus, ChevronRight } from "lucide-react";

function RankBadge({ change }: { change: number }) {
  if (change > 0) return (
    <div style={{ display: "flex", alignItems: "center", gap: "2px", color: "#16A34A", fontSize: "12px", fontWeight: 700 }}>
      <ArrowUp style={{ width: "12px", height: "12px" }} />+{change}
    </div>
  );
  if (change < 0) return (
    <div style={{ display: "flex", alignItems: "center", gap: "2px", color: "#DC2626", fontSize: "12px", fontWeight: 700 }}>
      <ArrowDown style={{ width: "12px", height: "12px" }} />{change}
    </div>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2px", color: "#9CA3AF", fontSize: "12px", fontWeight: 700 }}>
      <Minus style={{ width: "12px", height: "12px" }} />0
    </div>
  );
}

export default function Rising() {
  const { tools: allTools, loading } = useToolsData();
  const router = useRouter();
  const [category, setCategory] = useState("All");
  const [visible, setVisible] = useState(20);

  const allCategories = ["All", ...CATEGORY_META.map((c) => c.name).filter((n) => n !== "All")];

  const risingTools = useMemo(() => {
    let tools = [...allTools].filter((t) => (t.weekly_rank_change ?? 0) > 0);
    if (category !== "All") tools = tools.filter((t) => t.category === category);
    tools.sort((a, b) => (b.weekly_rank_change ?? 0) - (a.weekly_rank_change ?? 0));
    return tools;
  }, [allTools, category]);

  const visibleTools = risingTools.slice(0, visible);

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <PageHero
        eyebrow="Rising"
        title="Rising Tools"
        subtitle="Tools climbing the ranks this week — gaining momentum through lauds, reviews, and community engagement."
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
            <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 500, whiteSpace: "nowrap" }}>
              <span style={{ color: "#171717", fontWeight: 800 }}>{risingTools.length}</span> rising tools
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1280px] mx-auto w-full px-3 sm:px-6 lg:px-10" style={{ paddingTop: "24px", paddingBottom: "48px", flex: 1 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div className="animate-spin" style={{ width: 32, height: 32, border: "3px solid #E5E7EB", borderTopColor: "#22C55E", borderRadius: "50%", margin: "0 auto 16px" }} />
            <p style={{ fontSize: "14px", color: "#9CA3AF" }}>Loading rising tools...</p>
          </div>
        ) : risingTools.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📈</div>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#171717", marginBottom: "8px" }}>No rising tools this week</h3>
            <p style={{ fontSize: "14px", color: "#9CA3AF" }}>Rankings update weekly — check back soon!</p>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {visibleTools.map((tool, i) => (
                <div
                  key={tool.id}
                  onClick={() => router.push(`/tools/${tool.slug}`)}
                  style={{ background: "#FFFFFF", borderRadius: "12px", border: "1px solid #E8ECF0", padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "14px", transition: "background 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#FAFBFC"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#FFFFFF"; }}
                >
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "#9CA3AF", width: "32px", textAlign: "center", flexShrink: 0 }}>#{i + 1}</span>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", border: "1px solid #E8ECF0", background: "#F8FAFC", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <img src={tool.logo_url} alt={tool.name} style={{ width: "28px", height: "28px", objectFit: "contain" }} onError={(e) => { e.currentTarget.style.display = "none"; if (e.currentTarget.parentElement) e.currentTarget.parentElement.innerHTML = `<span style="font-size:14px;font-weight:800;color:#64748B">${tool.name.charAt(0)}</span>`; }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#171717" }}>{tool.name}</span>
                      {tool.is_verified && <Shield style={{ width: "12px", height: "12px", color: "#22C55E" }} />}
                      <span style={{ fontSize: "11px", color: "#6B7280", fontWeight: 600, background: "#F3F4F6", padding: "2px 8px", borderRadius: "6px" }}>{tool.category}</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{tool.tagline}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
                    <RankBadge change={tool.weekly_rank_change ?? 0} />
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <ThumbsUp style={{ width: "13px", height: "13px", color: "#F59E0B" }} />
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>{tool.upvote_count}</span>
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

            {visible < risingTools.length && (
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
