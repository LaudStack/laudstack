"use client";
/*
 * Categories Page — LaudStack (Next.js)
 *
 * Design: Clean white background, sleek card grid, warm professional aesthetic.
 * Each card: accent top-bar, emoji icon, category name, tool count, description,
 * top-3 tool logos, and hover micro-interactions.
 * Layout: Header → Search → Featured (2-col) → All (3-col) → CTA → Footer
 */

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Search, Layers, Rocket, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CATEGORY_META } from "@/lib/categories";
import { useToolsData } from "@/hooks/useToolsData";
import type { Tool } from "@/lib/types";

// ─── Accent colors per category ─────────────────────────────────────────────
const ACCENTS: Record<string, { from: string; to: string; bg: string; iconBg: string }> = {
  "AI Productivity":    { from: "#8B5CF6", to: "#7C3AED", bg: "#F5F3FF", iconBg: "#EDE9FE" },
  "AI Writing":         { from: "#3B82F6", to: "#2563EB", bg: "#EFF6FF", iconBg: "#DBEAFE" },
  "AI Image":           { from: "#EC4899", to: "#DB2777", bg: "#FDF2F8", iconBg: "#FCE7F3" },
  "AI Video":           { from: "#EF4444", to: "#DC2626", bg: "#FEF2F2", iconBg: "#FEE2E2" },
  "AI Audio":           { from: "#14B8A6", to: "#0D9488", bg: "#F0FDFA", iconBg: "#CCFBF1" },
  "AI Code":            { from: "#10B981", to: "#059669", bg: "#ECFDF5", iconBg: "#D1FAE5" },
  "AI Analytics":       { from: "#6366F1", to: "#4F46E5", bg: "#EEF2FF", iconBg: "#E0E7FF" },
  "Design":             { from: "#F472B6", to: "#EC4899", bg: "#FDF2F8", iconBg: "#FCE7F3" },
  "Marketing":          { from: "#F97316", to: "#EA580C", bg: "#FFF7ED", iconBg: "#FFEDD5" },
  "Developer Tools":    { from: "#64748B", to: "#475569", bg: "#F8FAFC", iconBg: "#F1F5F9" },
  "Project Management": { from: "#0EA5E9", to: "#0284C7", bg: "#F0F9FF", iconBg: "#E0F2FE" },
  "Customer Support":   { from: "#22C55E", to: "#16A34A", bg: "#F0FDF4", iconBg: "#DCFCE7" },
  "CRM":                { from: "#F59E0B", to: "#D97706", bg: "#FFFBEB", iconBg: "#FEF3C7" },
  "Sales":              { from: "#A855F7", to: "#9333EA", bg: "#FAF5FF", iconBg: "#F3E8FF" },
  "HR & Recruiting":    { from: "#06B6D4", to: "#0891B2", bg: "#ECFEFF", iconBg: "#CFFAFE" },
  "Finance":            { from: "#059669", to: "#047857", bg: "#ECFDF5", iconBg: "#D1FAE5" },
  "Security":           { from: "#EF4444", to: "#DC2626", bg: "#FEF2F2", iconBg: "#FEE2E2" },
  "E-commerce":         { from: "#8B5CF6", to: "#7C3AED", bg: "#F5F3FF", iconBg: "#EDE9FE" },
  "Education":          { from: "#3B82F6", to: "#2563EB", bg: "#EFF6FF", iconBg: "#DBEAFE" },
  "Other":              { from: "#6B7280", to: "#4B5563", bg: "#F9FAFB", iconBg: "#F3F4F6" },
};
const FALLBACK = { from: "#64748B", to: "#475569", bg: "#F8FAFC", iconBg: "#F1F5F9" };

const FEATURED = ["AI Productivity", "AI Writing", "AI Code", "AI Image"];

// ─── Animation ──────────────────────────────────────────────────────────────
const stagger = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.035, duration: 0.32 },
  }),
};

// ─── Category Card ──────────────────────────────────────────────────────────
function CategoryCard({
  cat,
  tools,
  index,
  large = false,
}: {
  cat: { name: string; icon: string; description: string };
  tools: Tool[];
  index: number;
  large?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const router = useRouter();
  const a = ACCENTS[cat.name] || FALLBACK;

  const topTools = useMemo(
    () =>
      tools
        .filter((t) => t.category === cat.name)
        .sort((x, y) => (y.average_rating ?? 0) - (x.average_rating ?? 0))
        .slice(0, 3),
    [tools, cat.name]
  );

  const count = tools.filter((t) => t.category === cat.name).length;

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={stagger}
      onClick={() => router.push(`/tools?category=${encodeURIComponent(cat.name)}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: "#FFFFFF",
        borderRadius: 16,
        border: "1.5px solid",
        borderColor: hovered ? `${a.from}50` : "#E8EDF2",
        cursor: "pointer",
        overflow: "hidden",
        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: hovered
          ? `0 12px 32px ${a.from}12, 0 2px 8px rgba(15,23,42,0.04)`
          : "0 1px 4px rgba(15,23,42,0.04)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          height: 4,
          background: `linear-gradient(90deg, ${a.from}, ${a.to})`,
          opacity: hovered ? 1 : 0.5,
          transition: "opacity 0.25s",
        }}
      />

      <div style={{ padding: large ? "24px 26px 22px" : "20px 22px 18px" }}>
        {/* Row 1: Icon + Name + Count */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: large ? 14 : 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: large ? 50 : 42,
                height: large ? 50 : 42,
                borderRadius: 12,
                background: a.iconBg,
                border: `1px solid ${a.from}18`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: large ? 24 : 20,
                flexShrink: 0,
                transition: "box-shadow 0.25s",
                boxShadow: hovered ? `0 4px 14px ${a.from}18` : "none",
              }}
            >
              {cat.icon}
            </div>
            <h3
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 800,
                fontSize: large ? 18 : 15,
                color: "#0F172A",
                margin: 0,
                letterSpacing: "-0.015em",
                lineHeight: 1.25,
              }}
            >
              {cat.name}
            </h3>
          </div>
          <div
            style={{
              padding: "3px 10px",
              borderRadius: 8,
              background: a.iconBg,
              border: `1px solid ${a.from}15`,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span style={{ fontSize: large ? 15 : 13, fontWeight: 800, color: a.from, lineHeight: 1 }}>
              {count}
            </span>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              tools
            </span>
          </div>
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: 13,
            color: "#64748B",
            fontWeight: 500,
            lineHeight: 1.55,
            margin: "0 0 16px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const,
            overflow: "hidden",
          }}
        >
          {cat.description}
        </p>

        {/* Top tools row */}
        {topTools.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                {topTools.map((tool, i) => (
                  <div
                    key={tool.id}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      overflow: "hidden",
                      border: "2px solid #fff",
                      marginLeft: i === 0 ? 0 : -7,
                      background: "#F1F5F9",
                      flexShrink: 0,
                      zIndex: topTools.length - i,
                    }}
                  >
                    <img
                      src={tool.logo_url}
                      alt={tool.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        const el = e.currentTarget;
                        el.style.display = "none";
                        if (el.parentElement) {
                          el.parentElement.style.display = "flex";
                          el.parentElement.style.alignItems = "center";
                          el.parentElement.style.justifyContent = "center";
                          el.parentElement.innerHTML = `<span style="font-size:10px;font-weight:800;color:#64748B">${tool.name.charAt(0)}</span>`;
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
              <span style={{ fontSize: 11.5, color: "#94A3B8", fontWeight: 500 }}>
                {topTools.map((t) => t.name).join(", ")}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                fontSize: 12,
                fontWeight: 700,
                color: a.from,
                opacity: hovered ? 1 : 0,
                transform: hovered ? "translateX(0)" : "translateX(-6px)",
                transition: "all 0.25s",
                flexShrink: 0,
              }}
            >
              Explore <ArrowRight style={{ width: 12, height: 12 }} />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORIES PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { tools } = useToolsData();

  const allCats = useMemo(() => CATEGORY_META.filter((c) => c.name !== "All"), []);
  const filtered = useMemo(
    () =>
      search.trim()
        ? allCats.filter(
            (c) =>
              c.name.toLowerCase().includes(search.toLowerCase()) ||
              c.description.toLowerCase().includes(search.toLowerCase())
          )
        : allCats,
    [allCats, search]
  );

  const featured = filtered.filter((c) => FEATURED.includes(c.name));
  const rest = filtered.filter((c) => !FEATURED.includes(c.name));

  const totalTools = tools.length;
  const avgRating =
    tools.length > 0
      ? (tools.reduce((s, t) => s + (t.average_rating ?? 0), 0) / tools.length).toFixed(1)
      : "0.0";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FFFFFF" }}>
      <Navbar />
      <div style={{ height: 72, flexShrink: 0 }} />

      {/* ══════════ PAGE HEADER ══════════ */}
      <section style={{ background: "#FAFBFC", borderBottom: "1px solid #E8EDF2", padding: "56px 0 48px" }}>
        <div className="max-w-[1300px] mx-auto px-6 lg:px-10" style={{ textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 14px",
              borderRadius: 100,
              background: "#FFFBEB",
              border: "1px solid #FDE68A",
              marginBottom: 20,
            }}
          >
            <Layers style={{ width: 13, height: 13, color: "#D97706" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#D97706", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Browse Categories
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(28px, 3.5vw, 42px)",
              fontWeight: 900,
              color: "#0F172A",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              margin: "0 0 14px",
            }}
          >
            Find Tools for Every Use Case
          </h1>

          <p
            style={{
              fontSize: 16,
              color: "#64748B",
              fontWeight: 500,
              lineHeight: 1.6,
              maxWidth: 540,
              margin: "0 auto 28px",
            }}
          >
            Explore {allCats.length} curated categories spanning AI, SaaS, developer tools, and more — each with verified reviews and honest rankings.
          </p>

          <div
            style={{
              maxWidth: 460,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              background: "#fff",
              borderRadius: 12,
              border: "1.5px solid #E2E8F0",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              overflow: "hidden",
            }}
          >
            <Search style={{ width: 16, height: 16, color: "#94A3B8", marginLeft: 16, flexShrink: 0 }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
              style={{
                flex: 1,
                padding: "13px 16px",
                fontSize: 14,
                color: "#0F172A",
                background: "transparent",
                border: "none",
                outline: "none",
              }}
            />
          </div>
        </div>
      </section>

      {/* ══════════ STATS ROW ══════════ */}
      <div className="max-w-[1300px] mx-auto px-6 lg:px-10" style={{ paddingTop: 36, paddingBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 28, flexWrap: "wrap" }}>
          {[
            { label: "Total Tools", value: `${totalTools}+` },
            { label: "Categories", value: allCats.length.toString() },
            { label: "Avg Rating", value: avgRating },
            { label: "Verified", value: "98%" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center", minWidth: 80 }}>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#0F172A",
                  letterSpacing: "-0.02em",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                }}
              >
                {s.value}
                {s.label === "Avg Rating" && <Star style={{ width: 14, height: 14, fill: "#F59E0B", color: "#F59E0B" }} />}
              </div>
              <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════ FEATURED CATEGORIES (2-col) ══════════ */}
      {featured.length > 0 && (
        <section className="max-w-[1300px] mx-auto px-6 lg:px-10" style={{ paddingTop: 32, paddingBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#D97706", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Popular Categories
            </span>
            <div style={{ flex: 1, height: 1, background: "#E8EDF2" }} />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 380px), 1fr))",
              gap: 16,
            }}
          >
            {featured.map((cat, i) => (
              <CategoryCard key={cat.name} cat={cat} tools={tools} index={i} large />
            ))}
          </div>
        </section>
      )}

      {/* ══════════ ALL CATEGORIES (3-col) ══════════ */}
      {rest.length > 0 && (
        <section className="max-w-[1300px] mx-auto px-6 lg:px-10" style={{ paddingTop: 32, paddingBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#475569", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              All Categories
            </span>
            <div style={{ flex: 1, height: 1, background: "#E8EDF2" }} />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
              gap: 14,
            }}
          >
            {rest.map((cat, i) => (
              <CategoryCard key={cat.name} cat={cat} tools={tools} index={i + featured.length} />
            ))}
          </div>
        </section>
      )}

      {/* ══════════ EMPTY STATE ══════════ */}
      {filtered.length === 0 && (
        <section className="max-w-[1300px] mx-auto px-6 lg:px-10" style={{ padding: "72px 0", textAlign: "center" }}>
          <Search style={{ width: 40, height: 40, color: "#CBD5E1", margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#374151", margin: "0 0 8px" }}>No categories found</h3>
          <p style={{ fontSize: 14, color: "#94A3B8", margin: "0 0 20px" }}>Try a different search term or browse all categories.</p>
          <button
            onClick={() => setSearch("")}
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#D97706",
              background: "#FFFBEB",
              border: "1px solid #FDE68A",
              borderRadius: 8,
              padding: "8px 20px",
              cursor: "pointer",
            }}
          >
            Clear Search
          </button>
        </section>
      )}

      {/* ══════════ CTA ══════════ */}
      <section style={{ background: "#FAFBFC", borderTop: "1px solid #E8EDF2", padding: "48px 0" }}>
        <div className="max-w-[1300px] mx-auto px-6 lg:px-10" style={{ textAlign: "center" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "#F59E0B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 4px 16px rgba(245,158,11,0.3)",
            }}
          >
            <Rocket style={{ width: 20, height: 20, color: "#fff" }} />
          </div>
          <h2
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 22,
              fontWeight: 800,
              color: "#0F172A",
              letterSpacing: "-0.02em",
              margin: "0 0 10px",
            }}
          >
            Don&apos;t see your tool?
          </h2>
          <p style={{ fontSize: 14, color: "#64748B", fontWeight: 500, margin: "0 0 24px" }}>
            Launch your AI or SaaS tool on LaudStack. Free to list — reviewed within 48 hours.
          </p>
          <button
            onClick={() => router.push("/launchpad")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              background: "#F59E0B",
              border: "none",
              borderRadius: 10,
              padding: "12px 28px",
              cursor: "pointer",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Go to LaunchPad <ArrowRight style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
