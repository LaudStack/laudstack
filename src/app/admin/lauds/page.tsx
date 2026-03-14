"use client";
export const dynamic = "force-dynamic";

/**
 * Admin Lauds — Moderation & Analytics
 * View all laud activity, detect suspicious patterns, remove fraudulent lauds
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart, Shield, AlertTriangle, Trash2, Users, TrendingUp,
  ChevronLeft, ChevronRight, Loader2, Search, Globe,
  User, Wrench, Clock, Ban, RefreshCw, BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAdminLaudStats,
  getAdminLaudActivity,
  getAdminSuspiciousLauds,
  adminRemoveLauds,
} from "@/app/actions/laud";

// ─── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, accent }: {
  icon: React.ReactNode; label: string; value: string | number;
  accent: "purple" | "blue" | "green" | "amber" | "red";
}) {
  const colors = {
    purple: "bg-purple-50 border-purple-200 text-purple-600",
    blue: "bg-blue-50 border-blue-200 text-blue-600",
    green: "bg-green-50 border-green-200 text-green-600",
    amber: "bg-amber-50 border-amber-200 text-amber-600",
    red: "bg-red-50 border-red-200 text-red-600",
  };
  const iconColors = {
    purple: "bg-purple-100 text-purple-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    amber: "bg-amber-100 text-amber-600",
    red: "bg-red-100 text-red-600",
  };
  return (
    <div className={`bg-white border rounded-2xl p-5 ${colors[accent].split(" ").slice(1).join(" ")}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconColors[accent]}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-black text-slate-900">{value}</div>
      <div className="text-xs text-slate-500 font-medium mt-0.5">{label}</div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function AdminLaudsPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "activity" | "suspicious">("overview");
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);
  const [suspicious, setSuspicious] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activityPage, setActivityPage] = useState(1);
  const [removing, setRemoving] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === "activity") {
      loadActivity(activityPage);
    }
  }, [activityPage, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, suspiciousRes] = await Promise.all([
        getAdminLaudStats(),
        getAdminSuspiciousLauds(),
      ]);
      setStats(statsRes);
      setSuspicious(suspiciousRes);
    } catch (err) {
      toast.error("Failed to load laud data");
    }
    setLoading(false);
  };

  const loadActivity = async (page: number) => {
    try {
      const res = await getAdminLaudActivity({ page, limit: 30 });
      setActivity(res);
    } catch (err) {
      toast.error("Failed to load activity");
    }
  };

  const handleRemoveLauds = async (opts: Parameters<typeof adminRemoveLauds>[0], label: string) => {
    const key = JSON.stringify(opts);
    setRemoving(key);
    try {
      const result = await adminRemoveLauds(opts);
      if (result.success) {
        toast.success(`Removed ${result.removedCount} laud(s) from ${label}`);
        // Refresh data
        loadData();
        if (activeTab === "activity") loadActivity(activityPage);
      } else {
        toast.error(result.error || "Failed to remove lauds");
      }
    } catch (err) {
      toast.error("Failed to remove lauds");
    }
    setRemoving(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
        <p className="text-slate-500 text-sm">Loading laud analytics...</p>
      </div>
    );
  }

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "activity" as const, label: "Activity Log", icon: <Clock className="w-4 h-4" /> },
    { id: "suspicious" as const, label: "Suspicious", icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Laud Moderation</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor laud activity, detect fraud, and maintain integrity.</p>
        </div>
        <button
          onClick={() => { loadData(); if (activeTab === "activity") loadActivity(activityPage); }}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:border-slate-300 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && stats && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<Heart className="w-4 h-4" />} label="Total Lauds" value={stats.totalLauds?.toLocaleString() || 0} accent="purple" />
            <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Lauds Today" value={stats.laudsToday?.toLocaleString() || 0} accent="green" />
            <StatCard icon={<Clock className="w-4 h-4" />} label="Lauds This Week" value={stats.laudsThisWeek?.toLocaleString() || 0} accent="blue" />
            <StatCard icon={<Users className="w-4 h-4" />} label="Unique Lauders" value={stats.uniqueUsers?.toLocaleString() || 0} accent="amber" />
          </div>

          {/* Most Lauded Tools */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-slate-900 font-bold text-base mb-4">Most Lauded Stacks</h3>
            {stats.mostLauded?.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No lauds recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {stats.mostLauded?.map((tool: any, i: number) => (
                  <div key={tool.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black bg-slate-100 text-slate-600 shrink-0">
                      {i + 1}
                    </span>
                    <div className="w-8 h-8 rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0">
                      {tool.logoUrl ? (
                        <img src={tool.logoUrl} alt={tool.name} className="w-full h-full object-contain p-0.5" />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center text-xs font-black text-slate-600">{tool.name?.[0]}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/tools/${tool.slug}`} className="text-sm font-bold text-slate-900 hover:text-amber-600 truncate block no-underline">
                        {tool.name}
                      </Link>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Heart className="w-4 h-4 text-purple-500" fill="#A855F7" />
                      <span className="text-sm font-black text-slate-900">{tool.upvoteCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Activity Log Tab */}
      {activeTab === "activity" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">User</th>
                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">Tool</th>
                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">IP</th>
                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">Date</th>
                    <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activity?.lauds?.map((laud: any) => (
                    <tr key={laud.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-sm font-semibold text-slate-900 truncate block">{laud.userName}</span>
                            <span className="text-xs text-slate-400 truncate block">{laud.userEmail}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/tools/${laud.toolSlug}`} className="text-sm font-semibold text-slate-900 hover:text-amber-600 no-underline">
                          {laud.toolName}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {laud.ipAddress || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {new Date(laud.createdAt).toLocaleString("en-US", {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleRemoveLauds({ laudIds: [laud.id] }, laud.userName)}
                          disabled={removing === JSON.stringify({ laudIds: [laud.id] })}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg transition-all disabled:opacity-50"
                        >
                          {removing === JSON.stringify({ laudIds: [laud.id] }) ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!activity?.lauds || activity.lauds.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-sm text-slate-500">
                        No laud activity found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {activity && activity.total > 30 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Page {activityPage} of {Math.ceil(activity.total / 30)} ({activity.total} total)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActivityPage(p => Math.max(1, p - 1))}
                    disabled={activityPage <= 1}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg disabled:opacity-40"
                  >
                    <ChevronLeft className="w-3 h-3" /> Prev
                  </button>
                  <button
                    onClick={() => setActivityPage(p => p + 1)}
                    disabled={activityPage >= Math.ceil(activity.total / 30)}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg disabled:opacity-40"
                  >
                    Next <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Suspicious Tab */}
      {activeTab === "suspicious" && suspicious && (
        <div className="space-y-6">
          {/* Suspicious IPs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4 text-red-500" />
              <h3 className="text-slate-900 font-bold text-base">Suspicious IPs (24h)</h3>
            </div>
            {suspicious.suspiciousIps?.length === 0 ? (
              <div className="flex items-center gap-2 py-4 text-sm text-green-600">
                <Shield className="w-4 h-4" />
                No suspicious IP activity detected.
              </div>
            ) : (
              <div className="space-y-2">
                {suspicious.suspiciousIps?.map((ip: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="text-sm font-mono font-semibold text-slate-900">{ip.ipAddress}</span>
                      <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                        {ip.laudCount} lauds
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveLauds({ ipAddress: ip.ipAddress }, ip.ipAddress)}
                      disabled={removing === JSON.stringify({ ipAddress: ip.ipAddress })}
                      className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 border border-red-300 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                    >
                      {removing === JSON.stringify({ ipAddress: ip.ipAddress }) ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Ban className="w-3 h-3" />
                      )}
                      Remove All
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suspicious Users */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-red-500" />
              <h3 className="text-slate-900 font-bold text-base">Suspicious Users (24h)</h3>
            </div>
            {suspicious.suspiciousUsers?.length === 0 ? (
              <div className="flex items-center gap-2 py-4 text-sm text-green-600">
                <Shield className="w-4 h-4" />
                No suspicious user activity detected.
              </div>
            ) : (
              <div className="space-y-2">
                {suspicious.suspiciousUsers?.map((u: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                      <div>
                        <span className="text-sm font-semibold text-slate-900">{u.userName || "Unknown"}</span>
                        <span className="text-xs text-slate-500 ml-2">{u.userEmail}</span>
                      </div>
                      <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                        {u.laudCount} lauds
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveLauds({ userId: u.userId }, u.userName || "user")}
                      disabled={removing === JSON.stringify({ userId: u.userId })}
                      className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 border border-red-300 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                    >
                      {removing === JSON.stringify({ userId: u.userId }) ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Ban className="w-3 h-3" />
                      )}
                      Remove All
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suspicious Tools */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-4 h-4 text-red-500" />
              <h3 className="text-slate-900 font-bold text-base">Tools with Laud Spikes (24h)</h3>
            </div>
            {suspicious.suspiciousTools?.length === 0 ? (
              <div className="flex items-center gap-2 py-4 text-sm text-green-600">
                <Shield className="w-4 h-4" />
                No suspicious tool activity detected.
              </div>
            ) : (
              <div className="space-y-2">
                {suspicious.suspiciousTools?.map((t: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                      <Link href={`/tools/${t.toolSlug}`} className="text-sm font-semibold text-slate-900 hover:text-amber-600 no-underline">
                        {t.toolName}
                      </Link>
                      <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                        {t.laudCount} lauds in 24h
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Remove ALL lauds from "${t.toolName}"? This cannot be undone.`)) {
                          handleRemoveLauds({ toolId: t.toolId }, t.toolName);
                        }
                      }}
                      disabled={removing === JSON.stringify({ toolId: t.toolId })}
                      className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 border border-red-300 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                    >
                      {removing === JSON.stringify({ toolId: t.toolId }) ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Ban className="w-3 h-3" />
                      )}
                      Reset Lauds
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
