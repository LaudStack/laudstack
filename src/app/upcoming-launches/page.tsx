"use client";

export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { useToolsData } from "@/hooks/useToolsData";
import { CATEGORY_META } from "@/lib/categories";
import { Clock, CalendarClock, Star, ChevronRight, Shield, Flame } from "lucide-react";

function daysUntilLaunch(dateStr: string): number {
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

function formatLaunchDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function UpcomingLaunches() {
  const { tools: allTools, loading } = useToolsData();
  const router = useRouter();
  const [category, setCategory] = useState("All");
  const [visible, setVisible] = useState(20);

  const allCategories = ["All", ...CATEGORY_META.map((c) => c.name).filter((n) => n !== "All")];

  const upcomingTools = useMemo(() => {
    const now = Date.now();
    let tools = allTools.filter((t) => new Date(t.launched_at).getTime() > now);
    if (category !== "All") tools = tools.filter((t) => t.category === category);
    tools.sort((a, b) => new Date(a.launched_at).getTime() - new Date(b.launched_at).getTime());
    return tools;
  }, [allTools, category]);

  const visibleTools = upcomingTools.slice(0, visible);

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <PageHero
        eyebrow="Upcoming"
        title="Upcoming Launches"
        subtitle="Tools scheduled to launch soon — be the first to discover and laud them."
        accent="blue"
        layout="default"
        size="md"
      />

      {/* Filter bar */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #E8ECF0", position: "sticky", top: 64, zIndex: 20 }}>
        <div className="max-w-[1280px] mx-auto w-full px-3 sm:px-6 lg:px-10" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "52px", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "auto", flex: 1 }}>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setVisible(20); }}
              style={{ padding: "5px 10px", borderRadius: "8px", border: "1.5px solid #E8ECF0", fontSize: "12px", fontWeight: 600, color: "#374151", background: "#F9FAFB", cursor: "pointer", fontFamily: "inherit", outline: "none" }}
            >
              {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 500, whiteSpace: "nowrap" }}>
              <span style={{ color: "#171717", fontWeight: 800 }}>{upcomingTools.length}</span> upcoming
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1280px] mx-auto w-full px-3 sm:px-6 lg:px-10" style={{ paddingTop: "24px", paddingBottom: "48px", flex: 1 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div className="animate-spin" style={{ width: 32, height: 32, border: "3px solid #E5E7EB", borderTopColor: "#F59E0B", borderRadius: "50%", margin: "0 auto 16px" }} />
            <p style={{ fontSize: "14px", color: "#9CA3AF" }}>Loading upcoming launches...</p>
          </div>
        ) : upcomingTools.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚀</div>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#171717", marginBottom: "8px" }}>No upcoming launches yet</h3>
            <p style={{ fontSize: "14px", color: "#9CA3AF" }}>Check back soon — founders are always preparing new tools.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ gap: "20px" }}>
              {visibleTools.map((tool) => {
                const days = daysUntilLaunch(tool.launched_at);
                return (
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
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <CalendarClock style={{ width: "14px", height: "14px", color: "#3B82F6" }} />
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#3B82F6" }}>{days === 0 ? "Launching today!" : `In ${days} day${days > 1 ? "s" : ""}`}</span>
                      </div>
                      <span style={{ fontSize: "11px", color: "#9CA3AF" }}>{formatLaunchDate(tool.launched_at)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {visible < upcomingTools.length && (
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
