"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import LogoWithFallback from '@/components/LogoWithFallback';
import { CATEGORY_META } from "@/lib/categories";
import {
  Clock, CalendarClock, Star, Shield, Flame, Rocket,
  Bell, BellOff, ChevronRight, ArrowRight, ExternalLink,
  Tag, Sparkles, TrendingUp, Filter
} from "lucide-react";
import { toast } from "sonner";

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface UpcomingTool {
  id: string;
  name: string;
  tagline: string;
  description: string;
  logo: string;
  category: string;
  pricing: string;
  launchDate: string;
  slug: string | null;
  isVerified: boolean;
  isFeatured: boolean;
  averageRating: number;
  reviewCount: number;
  upvoteCount: number;
  tags: string[];
  source: "tool" | "submission";
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */

function getCountdown(dateStr: string) {
  const diff = Math.max(0, new Date(dateStr).getTime() - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, total: diff };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function daysUntil(dateStr: string): number {
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

/* ─── Countdown Unit ────────────────────────────────────────────────────── */

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "6px",
          background: "#F8FAFC",
          border: "1px solid #E8ECF0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
          fontWeight: 700,
          color: "#171717",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {String(value).padStart(2, "0")}
      </div>
      <span style={{ fontSize: "9px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </span>
    </div>
  );
}

/* ─── Upcoming Card ─────────────────────────────────────────────────────── */

function UpcomingCard({ tool, onNotify }: { tool: UpcomingTool; onNotify: (id: string) => void }) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(getCountdown(tool.launchDate));
  const [notified, setNotified] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setCountdown(getCountdown(tool.launchDate)), 1000);
    return () => clearInterval(interval);
  }, [tool.launchDate]);

  const isLive = countdown.total === 0;
  const days = daysUntil(tool.launchDate);

  const handleClick = () => {
    if (tool.slug) router.push(`/tools/${tool.slug}`);
  };

  const handleNotify = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (submitting) return;

    // If already notified, unsubscribe
    if (notified) {
      setNotified(false);
      onNotify(tool.id);
      toast.success("Notification removed");
      return;
    }

    // Prompt for email
    const email = window.prompt("Enter your email to get notified when this launches:");
    if (!email || !email.includes("@")) {
      if (email !== null) toast.error("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      // Extract numeric toolId from the id string (e.g., "tool-11" -> 11)
      const numericId = parseInt(tool.id.replace(/^(tool|sub)-/, ""), 10);
      const payload: Record<string, unknown> = { email };
      if (tool.source === "tool") payload.toolId = numericId;
      else payload.submissionId = numericId;

      const res = await fetch("/api/launches/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setNotified(true);
        onNotify(tool.id);
        toast.success(data.message || "You'll be notified when this launches!");
      } else {
        toast.error(data.error || "Failed to subscribe.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        background: "#FFFFFF",
        borderRadius: "14px",
        border: isLive ? "1.5px solid #F59E0B" : "1px solid #E8ECF0",
        overflow: "hidden",
        cursor: tool.slug ? "pointer" : "default",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Header row */}
      <div style={{ padding: "16px 16px 12px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
        {/* Logo */}
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            flexShrink: 0,
            border: "1px solid #E8ECF0",
            background: "#F8FAFC",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LogoWithFallback src={tool.logo} alt={tool.name} className="w-9 h-9 object-contain" fallbackSize="text-lg" />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <span
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#171717",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {tool.name}
            </span>
            {tool.isVerified && <Shield style={{ width: "13px", height: "13px", color: "#22C55E", flexShrink: 0 }} />}
            {tool.isFeatured && <Sparkles style={{ width: "13px", height: "13px", color: "#F59E0B", flexShrink: 0 }} />}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#6B7280",
                background: "#F3F4F6",
                padding: "2px 8px",
                borderRadius: "6px",
              }}
            >
              {tool.category}
            </span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#9CA3AF",
              }}
            >
              {tool.pricing}
            </span>
          </div>
        </div>

        {/* Status badge */}
        {isLive ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "3px 8px",
              borderRadius: "6px",
              background: "#FEF3C7",
              border: "1px solid #FDE68A",
              fontSize: "10px",
              fontWeight: 700,
              color: "#B45309",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              flexShrink: 0,
            }}
          >
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#F59E0B", animation: "pulse 2s infinite" }} />
            LIVE
          </span>
        ) : (
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#3B82F6",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`}
          </span>
        )}
      </div>

      {/* Tagline */}
      <div style={{ padding: "0 16px 12px" }}>
        <p
          style={{
            fontSize: "13px",
            color: "#6B7280",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            margin: 0,
          }}
        >
          {tool.tagline}
        </p>
      </div>

      {/* Countdown */}
      {!isLive && (
        <div style={{ padding: "0 16px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "center" }}>
            <CountdownUnit value={countdown.days} label="day" />
            <span style={{ fontSize: "12px", color: "#D1D5DB", fontWeight: 600, paddingBottom: "14px" }}>:</span>
            <CountdownUnit value={countdown.hours} label="hr" />
            <span style={{ fontSize: "12px", color: "#D1D5DB", fontWeight: 600, paddingBottom: "14px" }}>:</span>
            <CountdownUnit value={countdown.minutes} label="min" />
            <span style={{ fontSize: "12px", color: "#D1D5DB", fontWeight: 600, paddingBottom: "14px" }}>:</span>
            <CountdownUnit value={countdown.seconds} label="sec" />
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          marginTop: "auto",
          padding: "10px 16px",
          borderTop: "1px solid #F1F5F9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <CalendarClock style={{ width: "13px", height: "13px", color: "#9CA3AF" }} />
          <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 500 }}>{formatDate(tool.launchDate)}</span>
        </div>
        <button
          onClick={handleNotify}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "6px 14px",
            borderRadius: "8px",
            border: notified ? "1.5px solid #FDE68A" : "1.5px solid #F59E0B",
            background: notified ? "#FFFBEB" : "#F59E0B",
            fontSize: "12px",
            fontWeight: 700,
            color: notified ? "#B45309" : "#FFFFFF",
            cursor: "pointer",
            transition: "all 0.15s ease",
            boxShadow: notified ? "none" : "0 1px 3px rgba(245,158,11,0.3)",
          }}
          onMouseEnter={(e) => {
            if (!notified) {
              e.currentTarget.style.background = "#D97706";
              e.currentTarget.style.borderColor = "#D97706";
            }
          }}
          onMouseLeave={(e) => {
            if (!notified) {
              e.currentTarget.style.background = "#F59E0B";
              e.currentTarget.style.borderColor = "#F59E0B";
            }
          }}
        >
          {notified ? <BellOff style={{ width: "13px", height: "13px" }} /> : <Bell style={{ width: "13px", height: "13px" }} />}
          {submitting ? "..." : notified ? "Notified" : "Notify Me"}
        </button>
      </div>
    </div>
  );
}

/* ─── Recently Launched Card ────────────────────────────────────────────── */

function RecentCard({ tool }: { tool: UpcomingTool }) {
  const router = useRouter();

  return (
    <div
      onClick={() => tool.slug && router.push(`/tools/${tool.slug}`)}
      style={{
        background: "#FFFFFF",
        borderRadius: "12px",
        border: "1px solid #E8ECF0",
        padding: "14px",
        cursor: tool.slug ? "pointer" : "default",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          flexShrink: 0,
          border: "1px solid #E8ECF0",
          background: "#F8FAFC",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LogoWithFallback src={tool.logo} alt={tool.name} className="w-[30px] h-[30px] object-contain" fallbackSize="text-sm" />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#171717", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {tool.name}
          </span>
          {tool.isVerified && <Shield style={{ width: "12px", height: "12px", color: "#22C55E", flexShrink: 0 }} />}
        </div>
        <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 500 }}>{tool.category}</span>
      </div>

      {/* Rating + date */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px", flexShrink: 0 }}>
        {tool.averageRating > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            <Star style={{ width: "11px", height: "11px", fill: "#FBBF24", color: "#FBBF24" }} />
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#171717" }}>{tool.averageRating.toFixed(1)}</span>
          </div>
        )}
        <span style={{ fontSize: "11px", color: "#9CA3AF" }}>{formatDate(tool.launchDate)}</span>
      </div>
    </div>
  );
}

/* ─── Loading Skeleton ──────────────────────────────────────────────────── */

function PageSkeleton() {
  return (
    <div className="max-w-[1300px] mx-auto w-full px-3 sm:px-6 lg:px-10" style={{ paddingTop: "24px", paddingBottom: "48px" }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: "20px" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse" style={{ background: "#F3F4F6", borderRadius: "14px", height: "220px" }} />
        ))}
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */

export default function UpcomingLaunches() {
  const router = useRouter();
  const [upcoming, setUpcoming] = useState<UpcomingTool[]>([]);
  const [recent, setRecent] = useState<UpcomingTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set());

  const allCategories = ["All", ...CATEGORY_META.map((c) => c.name).filter((n) => n !== "All")];

  useEffect(() => {
    fetch("/api/launches/upcoming")
      .then((r) => r.json())
      .then((data) => {
        setUpcoming(data.upcoming ?? []);
        setRecent(data.recent ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleNotify = useCallback((id: string) => {
    setNotifiedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filteredUpcoming = category === "All" ? upcoming : upcoming.filter((t) => t.category === category);
  const filteredRecent = category === "All" ? recent : recent.filter((t) => t.category === category);

  const hasUpcoming = filteredUpcoming.length > 0;
  const hasRecent = filteredRecent.length > 0;

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <PageHero
        eyebrow="Upcoming"
        title="Upcoming Launches"
        subtitle="Stacks scheduled to launch soon — be the first to discover and laud them."
        accent="blue"
        layout="default"
        size="sm"
      />

      {/* Filter bar */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid #E8ECF0", position: "sticky", top: 64, zIndex: 20 }}>
        <div
          className="max-w-[1300px] mx-auto w-full px-3 sm:px-6 lg:px-10"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "48px", gap: "12px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "auto", flex: 1 }}>
            <Filter style={{ width: "14px", height: "14px", color: "#9CA3AF", flexShrink: 0 }} />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                padding: "5px 10px",
                borderRadius: "8px",
                border: "1.5px solid #E8ECF0",
                fontSize: "12px",
                fontWeight: 600,
                color: "#374151",
                background: "#F9FAFB",
                cursor: "pointer",
                fontFamily: "inherit",
                outline: "none",
              }}
            >
              {allCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 500, whiteSpace: "nowrap" }}>
              <span style={{ color: "#171717", fontWeight: 700 }}>{filteredUpcoming.length}</span> upcoming
              {hasRecent && (
                <>
                  {" · "}
                  <span style={{ color: "#171717", fontWeight: 700 }}>{filteredRecent.length}</span> recently launched
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1300px] mx-auto w-full px-3 sm:px-6 lg:px-10" style={{ paddingTop: "28px", paddingBottom: "56px", flex: 1 }}>
        {loading ? (
          <PageSkeleton />
        ) : (
          <>
            {/* Upcoming Section */}
            {hasUpcoming && (
              <section style={{ marginBottom: "48px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                  <Rocket style={{ width: "16px", height: "16px", color: "#3B82F6" }} />
                  <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#171717", margin: 0 }}>Launching Soon</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: "20px" }}>
                  {filteredUpcoming.map((tool) => (
                    <UpcomingCard key={tool.id} tool={tool} onNotify={handleNotify} />
                  ))}
                </div>
              </section>
            )}

            {/* Recently Launched Section (always shown as fallback) */}
            {hasRecent && (
              <section>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Flame style={{ width: "16px", height: "16px", color: "#F59E0B" }} />
                    <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#171717", margin: 0 }}>
                      {hasUpcoming ? "Recently Launched" : "Recently Launched Stacks"}
                    </h2>
                  </div>
                  <button
                    onClick={() => router.push("/recently-added")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#F59E0B",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    View all <ArrowRight style={{ width: "13px", height: "13px" }} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: "12px" }}>
                  {filteredRecent.map((tool) => (
                    <RecentCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {!hasUpcoming && !hasRecent && (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <Rocket style={{ width: "24px", height: "24px", color: "#3B82F6" }} />
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#171717", marginBottom: "8px" }}>No launches scheduled yet</h3>
                <p style={{ fontSize: "15px", color: "#6B7280", lineHeight: 1.6, maxWidth: "400px", margin: "0 auto 24px" }}>
                  Founders are preparing their stacks. Check back soon or launch your own stack on LaudStack.
                </p>
                <button
                  onClick={() => router.push("/launchpad")}
                  style={{
                    padding: "10px 24px",
                    borderRadius: "10px",
                    background: "#F59E0B",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Launch Your Stack
                </button>
              </div>
            )}

            {/* Bottom CTA */}
            {(hasUpcoming || hasRecent) && (
              <div
                style={{
                  marginTop: "48px",
                  padding: "32px",
                  borderRadius: "16px",
                  border: "1px solid #E8ECF0",
                  background: "#FFFFFF",
                  textAlign: "center",
                }}
              >
                <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#171717", marginBottom: "8px" }}>
                  Want your stack featured here?
                </h3>
                <p style={{ fontSize: "15px", color: "#6B7280", lineHeight: 1.6, maxWidth: "480px", margin: "0 auto 20px" }}>
                  Submit your stack on LaunchPad and schedule your launch date. Get discovered by professionals before you even go live.
                </p>
                <button
                  onClick={() => router.push("/launchpad")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 24px",
                    borderRadius: "10px",
                    background: "#F59E0B",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  <Rocket style={{ width: "15px", height: "15px" }} />
                  Go to LaunchPad
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
