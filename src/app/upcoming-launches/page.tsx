"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import LogoWithFallback from "@/components/LogoWithFallback";
import { CATEGORY_META } from "@/lib/categories";
import {
  Clock, CalendarClock, Star, Shield, Flame, Rocket,
  Bell, BellOff, ArrowRight,
  Sparkles, Filter,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

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
  laudCount: number;
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
    <div className="flex flex-col items-center gap-0.5">
      <div className="w-8 h-8 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-[13px] font-bold text-slate-900 tabular-nums">
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

/* ─── Notify Dialog ────────────────────────────────────────────────────── */

function NotifyDialog({
  open,
  onClose,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
  submitting: boolean;
}) {
  const [email, setEmail] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
            <Bell className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Get Launch Notification</h3>
            <p className="text-xs text-slate-500">We&apos;ll email you when this stack goes live.</p>
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!email.trim() || !email.includes("@")) {
              toast.error("Please enter a valid email address.");
              return;
            }
            onSubmit(email.trim());
          }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-amber-400 transition-colors mb-3"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 text-sm font-bold text-white hover:bg-amber-600 transition-colors disabled:opacity-60"
            >
              {submitting ? "Subscribing..." : "Notify Me"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Upcoming Card ─────────────────────────────────────────────────────── */

function UpcomingCard({
  tool,
  onNotify,
  isNotified,
}: {
  tool: UpcomingTool;
  onNotify: (id: string) => void;
  isNotified: boolean;
}) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(getCountdown(tool.launchDate));

  useEffect(() => {
    const interval = setInterval(() => setCountdown(getCountdown(tool.launchDate)), 1000);
    return () => clearInterval(interval);
  }, [tool.launchDate]);

  const isLive = countdown.total === 0;
  const days = daysUntil(tool.launchDate);

  const handleClick = () => {
    if (tool.slug) router.push(`/tools/${tool.slug}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-[14px] overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        isLive ? "border-[1.5px] border-amber-400" : "border border-slate-200"
      } ${tool.slug ? "cursor-pointer" : "cursor-default"}`}
    >
      {/* Header row */}
      <div className="p-4 pb-3 flex items-start gap-3">
        {/* Logo */}
        <div className="w-12 h-12 rounded-xl shrink-0 border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
          <LogoWithFallback src={tool.logo} alt={tool.name} className="w-9 h-9 object-contain" fallbackSize="text-lg" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[15px] font-bold text-slate-900 truncate">
              {tool.name}
            </span>
            {tool.isVerified && <Shield className="w-[13px] h-[13px] text-green-500 shrink-0" />}
            {tool.isFeatured && <Sparkles className="w-[13px] h-[13px] text-amber-500 shrink-0" />}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
              {tool.category}
            </span>
            <span className="text-[11px] font-semibold text-gray-400">
              {tool.pricing}
            </span>
          </div>
        </div>

        {/* Status badge */}
        {isLive ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-700 uppercase tracking-wide shrink-0">
            <span className="w-[5px] h-[5px] rounded-full bg-amber-500 animate-pulse" />
            LIVE
          </span>
        ) : (
          <span className="text-[11px] font-semibold text-blue-500 shrink-0 whitespace-nowrap">
            {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`}
          </span>
        )}
      </div>

      {/* Tagline */}
      <div className="px-4 pb-3">
        <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2 m-0">
          {tool.tagline}
        </p>
      </div>

      {/* Countdown */}
      {!isLive && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-1 justify-center">
            <CountdownUnit value={countdown.days} label="day" />
            <span className="text-xs text-gray-300 font-semibold pb-3.5">:</span>
            <CountdownUnit value={countdown.hours} label="hr" />
            <span className="text-xs text-gray-300 font-semibold pb-3.5">:</span>
            <CountdownUnit value={countdown.minutes} label="min" />
            <span className="text-xs text-gray-300 font-semibold pb-3.5">:</span>
            <CountdownUnit value={countdown.seconds} label="sec" />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto px-4 py-2.5 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CalendarClock className="w-[13px] h-[13px] text-gray-400" />
          <span className="text-xs text-gray-400 font-medium">{formatDate(tool.launchDate)}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNotify(tool.id);
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            isNotified
              ? "border-[1.5px] border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
              : "border-[1.5px] border-amber-500 bg-amber-500 text-white shadow-sm shadow-amber-500/30 hover:bg-amber-600 hover:border-amber-600"
          }`}
        >
          {isNotified ? <BellOff className="w-[13px] h-[13px]" /> : <Bell className="w-[13px] h-[13px]" />}
          {isNotified ? "Notified" : "Notify Me"}
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
      className={`bg-white rounded-xl border border-slate-200 p-3.5 flex items-center gap-3 transition-all duration-150 hover:-translate-y-px hover:shadow-md ${
        tool.slug ? "cursor-pointer" : "cursor-default"
      }`}
    >
      {/* Logo */}
      <div className="w-10 h-10 rounded-[10px] shrink-0 border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
        <LogoWithFallback src={tool.logo} alt={tool.name} className="w-[30px] h-[30px] object-contain" fallbackSize="text-sm" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-sm font-bold text-slate-900 truncate">{tool.name}</span>
          {tool.isVerified && <Shield className="w-3 h-3 text-green-500 shrink-0" />}
        </div>
        <span className="text-xs text-gray-400 font-medium">{tool.category}</span>
      </div>

      {/* Rating + date */}
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        {tool.averageRating > 0 && (
          <div className="flex items-center gap-1">
            <Star className="w-[11px] h-[11px] fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-slate-900">{tool.averageRating.toFixed(1)}</span>
          </div>
        )}
        <span className="text-[11px] text-gray-400">{formatDate(tool.launchDate)}</span>
      </div>
    </div>
  );
}

/* ─── Loading Skeleton ──────────────────────────────────────────────────── */

function PageSkeleton() {
  return (
    <div className="max-w-[1300px] mx-auto w-full px-3 sm:px-6 lg:px-10 pt-6 pb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-[14px] h-[220px]" />
        ))}
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */

export default function UpcomingLaunches() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [upcoming, setUpcoming] = useState<UpcomingTool[]>([]);
  const [recent, setRecent] = useState<UpcomingTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set());

  // Dialog state for email input
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogToolId, setDialogToolId] = useState<string | null>(null);
  const [dialogSubmitting, setDialogSubmitting] = useState(false);

  const allCategories = ["All", ...CATEGORY_META.map((c) => c.name).filter((n) => n !== "All")];

  useEffect(() => {
    fetch("/api/launches/upcoming")
      .then((r) => r.json())
      .then((data) => {
        // Normalize field names: API may return upvoteCount, we use laudCount
        const normalize = (items: any[]) =>
          items.map((t: any) => ({
            ...t,
            laudCount: t.laudCount ?? t.upvoteCount ?? 0,
          }));
        setUpcoming(normalize(data.upcoming ?? []));
        setRecent(normalize(data.recent ?? []));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleNotify = useCallback(
    async (id: string) => {
      // If already notified, unsubscribe
      if (notifiedIds.has(id)) {
        setNotifiedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        toast.success("Notification removed");
        return;
      }

      // If authenticated, subscribe directly using session email
      if (isAuthenticated) {
        const tool = [...upcoming, ...recent].find((t) => t.id === id);
        if (!tool) return;
        try {
          const numericId = parseInt(tool.id.replace(/^(tool|sub)-/, ""), 10);
          const payload: Record<string, unknown> = { email: user?.email ?? '' };
          if (tool.source === "tool") payload.toolId = numericId;
          else payload.submissionId = numericId;

          const res = await fetch("/api/launches/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (res.ok) {
            setNotifiedIds((prev) => new Set(prev).add(id));
            toast.success(data.message || "You'll be notified when this launches!");
          } else {
            toast.error(data.error || "Failed to subscribe.");
          }
        } catch {
          toast.error("Network error. Please try again.");
        }
        return;
      }

      // Not authenticated — show email dialog
      setDialogToolId(id);
      setDialogOpen(true);
    },
    [notifiedIds, isAuthenticated, upcoming, recent]
  );

  const handleDialogSubmit = async (email: string) => {
    if (!dialogToolId) return;
    setDialogSubmitting(true);
    try {
      const tool = [...upcoming, ...recent].find((t) => t.id === dialogToolId);
      if (!tool) return;
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
        setNotifiedIds((prev) => new Set(prev).add(dialogToolId));
        toast.success(data.message || "You'll be notified when this launches!");
        setDialogOpen(false);
        setDialogToolId(null);
      } else {
        toast.error(data.error || "Failed to subscribe.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setDialogSubmitting(false);
    }
  };

  const filteredUpcoming = category === "All" ? upcoming : upcoming.filter((t) => t.category === category);
  const filteredRecent = category === "All" ? recent : recent.filter((t) => t.category === category);

  const hasUpcoming = filteredUpcoming.length > 0;
  const hasRecent = filteredRecent.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
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
      <div className="bg-white border-b border-slate-200 sticky top-16 z-20">
        <div className="max-w-[1300px] mx-auto w-full px-3 sm:px-6 lg:px-10 flex items-center justify-between h-12 gap-3">
          <div className="flex items-center gap-2.5 overflow-auto flex-1">
            <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-2.5 py-1 rounded-lg border-[1.5px] border-slate-200 text-xs font-semibold text-gray-700 bg-gray-50 cursor-pointer outline-none focus:border-amber-400 transition-colors"
            >
              {allCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
              <span className="text-slate-900 font-bold">{filteredUpcoming.length}</span> upcoming
              {hasRecent && (
                <>
                  {" · "}
                  <span className="text-slate-900 font-bold">{filteredRecent.length}</span> recently launched
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1300px] mx-auto w-full px-3 sm:px-6 lg:px-10 pt-7 pb-14 flex-1">
        {loading ? (
          <PageSkeleton />
        ) : (
          <>
            {/* Upcoming Section */}
            {hasUpcoming && (
              <section className="mb-12">
                <div className="flex items-center gap-2 mb-5">
                  <Rocket className="w-4 h-4 text-blue-500" />
                  <h2 className="text-lg font-extrabold text-slate-900">Launching Soon</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredUpcoming.map((tool) => (
                    <UpcomingCard
                      key={tool.id}
                      tool={tool}
                      onNotify={handleNotify}
                      isNotified={notifiedIds.has(tool.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Recently Launched Section */}
            {hasRecent && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <h2 className="text-lg font-extrabold text-slate-900">
                      {hasUpcoming ? "Recently Launched" : "Recently Launched Stacks"}
                    </h2>
                  </div>
                  <button
                    onClick={() => router.push("/recently-added")}
                    className="flex items-center gap-1 text-[13px] font-semibold text-amber-500 hover:text-amber-600 transition-colors"
                  >
                    View all <ArrowRight className="w-[13px] h-[13px]" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRecent.map((tool) => (
                    <RecentCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {!hasUpcoming && !hasRecent && (
              <div className="text-center py-20">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">No launches scheduled yet</h3>
                <p className="text-[15px] text-gray-500 leading-relaxed max-w-[400px] mx-auto mb-6">
                  Founders are preparing their stacks. Check back soon or launch your own stack on LaudStack.
                </p>
                <button
                  onClick={() => router.push("/launchpad")}
                  className="px-6 py-2.5 rounded-[10px] bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-colors"
                >
                  Launch Your Stack
                </button>
              </div>
            )}

            {/* Bottom CTA */}
            {(hasUpcoming || hasRecent) && (
              <div className="mt-12 p-8 rounded-2xl border border-slate-200 bg-white text-center">
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                  Want your stack featured here?
                </h3>
                <p className="text-[15px] text-gray-500 leading-relaxed max-w-[480px] mx-auto mb-5">
                  Submit your stack on LaunchPad and schedule your launch date. Get discovered by professionals before you even go live.
                </p>
                <button
                  onClick={() => router.push("/launchpad")}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-[10px] bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-colors"
                >
                  <Rocket className="w-[15px] h-[15px]" />
                  Go to LaunchPad
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />

      {/* Notify email dialog */}
      <NotifyDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setDialogToolId(null);
        }}
        onSubmit={handleDialogSubmit}
        submitting={dialogSubmitting}
      />
    </div>
  );
}
