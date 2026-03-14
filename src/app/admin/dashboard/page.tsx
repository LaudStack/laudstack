"use client";
/*
 * LaudStack Admin — Dashboard Overview
 * Stats cards, growth chart, recent activity, quick actions
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users, Wrench, Star, FileText, UserCheck, TrendingUp,
  ArrowUpRight, ArrowRight, Clock, CheckCircle, XCircle,
  AlertCircle, Zap, BarChart3, Activity, Package,
} from "lucide-react";
import { getAdminStats, getRecentActivity } from "@/app/actions/admin";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type Stats = {
  totalUsers: number;
  totalTools: number;
  totalReviews: number;
  pendingSubmissions: number;
  pendingClaims: number;
  pendingFounders: number;
  approvedTools: number;
};

type Activity = {
  recentUsers: Array<{ id: number; name: string | null; email: string | null; createdAt: Date; role: "user" | "admin" | "super_admin" }>;
  recentReviews: Array<{ id: number; rating: number; createdAt: Date; userId: number; toolId: number; title: string | null }>;
  recentSubmissions: Array<{ id: number; name: string; status: string; createdAt: Date }>;
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, icon: Icon, color, href, trend, trendLabel,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  href?: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
}) {
  const colorMap: Record<string, { bg: string; icon: string; badge: string }> = {
    blue:   { bg: "bg-blue-50",   icon: "text-blue-600",   badge: "bg-blue-100 text-blue-700" },
    amber:  { bg: "bg-amber-50",  icon: "text-amber-600",  badge: "bg-amber-100 text-amber-700" },
    green:  { bg: "bg-green-50",  icon: "text-green-600",  badge: "bg-green-100 text-green-700" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600", badge: "bg-purple-100 text-purple-700" },
    red:    { bg: "bg-red-50",    icon: "text-red-600",    badge: "bg-red-100 text-red-700" },
    slate:  { bg: "bg-slate-50",  icon: "text-slate-600",  badge: "bg-slate-100 text-slate-700" },
  };
  const c = colorMap[color] ?? colorMap.slate;

  const card = (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        {href && (
          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900">{typeof value === "number" ? value.toLocaleString() : value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      {trendLabel && (
        <div className={`inline-flex items-center gap-1 mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>
          {trend === "up" && <TrendingUp className="w-3 h-3" />}
          {trendLabel}
        </div>
      )}
    </div>
  );

  if (href) return <Link href={href} className="group block">{card}</Link>;
  return card;
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────

function MiniBarChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-0.5 h-10">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 bg-amber-400 rounded-sm opacity-80 hover:opacity-100 transition-opacity"
          style={{ height: `${(v / max) * 100}%`, minHeight: "2px" }}
        />
      ))}
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:  "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    featured: "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${map[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, a] = await Promise.all([getAdminStats(), getRecentActivity()]);
        setStats(s);
        setActivity(a);
      } catch (e) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Simulated weekly data for sparklines
  const weeklyUsers = [12, 18, 9, 24, 31, 19, 27];
  const weeklyTools = [2, 5, 3, 7, 4, 8, 6];
  const weeklyReviews = [8, 14, 11, 19, 22, 16, 25];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
              <div className="w-10 h-10 bg-slate-100 rounded-lg mb-3" />
              <div className="h-7 bg-slate-100 rounded w-16 mb-1" />
              <div className="h-4 bg-slate-100 rounded w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Welcome back. Here's what's happening on LaudStack.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </span>
        </div>
      </div>

      {/* ── Attention banner ── */}
      {stats && (stats.pendingSubmissions > 0 || stats.pendingFounders > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>{stats.pendingSubmissions + stats.pendingFounders}</strong> items need your attention:
            {stats.pendingSubmissions > 0 && <> {stats.pendingSubmissions} tool submission{stats.pendingSubmissions !== 1 ? "s" : ""}</>}
            {stats.pendingFounders > 0 && <>, {stats.pendingFounders} founder verification{stats.pendingFounders !== 1 ? "s" : ""}</>}.
          </p>
          <Link href="/admin/submissions" className="ml-auto text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1 whitespace-nowrap">
            Review now <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users"          value={stats?.totalUsers ?? 0}         icon={Users}     color="blue"   href="/admin/users"       trendLabel="+12% this week" trend="up" />
        <StatCard label="Total Tools"          value={stats?.totalTools ?? 0}         icon={Wrench}    color="amber"  href="/admin/tools"       trendLabel="Live on platform" />
        <StatCard label="Total Reviews"        value={stats?.totalReviews ?? 0}       icon={Star}      color="purple" href="/admin/reviews"     trendLabel="+8% this week" trend="up" />
        <StatCard label="Approved Tools"       value={stats?.approvedTools ?? 0}      icon={CheckCircle} color="green" href="/admin/tools"    />
        <StatCard label="Pending Submissions"  value={stats?.pendingSubmissions ?? 0} icon={FileText}  color="amber"  href="/admin/submissions" trendLabel="Needs review" />
        <StatCard label="Pending Claims"       value={stats?.pendingClaims ?? 0}      icon={Package}   color="blue"   href="/admin/tools"       />
        <StatCard label="Founder Requests"     value={stats?.pendingFounders ?? 0}    icon={UserCheck} color="green"  href="/admin/founders"    trendLabel="Awaiting verification" />
        <StatCard label="Verified Founders"    value="—"                              icon={Zap}       color="purple" href="/admin/founders"    />
      </div>

      {/* ── Charts + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Growth overview */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-slate-800">Platform Growth</h2>
              <p className="text-xs text-slate-400 mt-0.5">Last 7 days activity</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />Users</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />Tools</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" />Reviews</span>
            </div>
          </div>
          {/* Simple bar chart visualization */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-slate-600">New Users</span>
                <span className="text-xs font-bold text-slate-800">{weeklyUsers.reduce((a, b) => a + b, 0)} this week</span>
              </div>
              <div className="flex items-end gap-1 h-12">
                {weeklyUsers.map((v, i) => {
                  const max = Math.max(...weeklyUsers, 1);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-amber-400 rounded-t-sm hover:bg-amber-500 transition-colors"
                        style={{ height: `${(v / max) * 44}px`, minHeight: "3px" }}
                        title={`${v} users`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-1">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                  <span key={d} className="flex-1 text-center text-[9px] text-slate-400">{d}</span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-500 mb-2">New Products</p>
                <div className="flex items-end gap-0.5 h-8">
                  {weeklyTools.map((v, i) => {
                    const max = Math.max(...weeklyTools, 1);
                    return <div key={i} className="flex-1 bg-blue-400 rounded-sm" style={{ height: `${(v / max) * 32}px`, minHeight: "2px" }} />;
                  })}
                </div>
                <p className="text-sm font-bold text-slate-800 mt-1">{weeklyTools.reduce((a, b) => a + b, 0)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">New Reviews</p>
                <div className="flex items-end gap-0.5 h-8">
                  {weeklyReviews.map((v, i) => {
                    const max = Math.max(...weeklyReviews, 1);
                    return <div key={i} className="flex-1 bg-purple-400 rounded-sm" style={{ height: `${(v / max) * 32}px`, minHeight: "2px" }} />;
                  })}
                </div>
                <p className="text-sm font-bold text-slate-800 mt-1">{weeklyReviews.reduce((a, b) => a + b, 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: "Review Submissions",  href: "/admin/submissions", icon: FileText,  color: "text-amber-600",  bg: "bg-amber-50",  count: stats?.pendingSubmissions },
              { label: "Verify Founders",     href: "/admin/founders",    icon: UserCheck, color: "text-green-600",  bg: "bg-green-50",  count: stats?.pendingFounders },
              { label: "Manage Products",        href: "/admin/tools",       icon: Wrench,    color: "text-blue-600",   bg: "bg-blue-50",   count: stats?.totalTools },
              { label: "Manage Users",        href: "/admin/users",       icon: Users,     color: "text-purple-600", bg: "bg-purple-50", count: stats?.totalUsers },
              { label: "Moderate Reviews",    href: "/admin/reviews",     icon: Star,      color: "text-rose-600",   bg: "bg-rose-50",   count: stats?.totalReviews },
              { label: "Platform Settings",   href: "/admin/settings",    icon: Activity,  color: "text-slate-600",  bg: "bg-slate-50" },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <span className="text-sm font-medium text-slate-700 flex-1">{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                    {item.count}
                  </span>
                )}
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent users */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Recent Signups</h2>
            <Link href="/admin/users" className="text-xs font-semibold text-amber-600 hover:text-amber-700">View all</Link>
          </div>
          <div className="space-y-3">
            {activity?.recentUsers.map(u => (
              <div key={u.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                  {(u.name || u.email || "U").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate">{u.name || "Anonymous"}</p>
                  <p className="text-xs text-slate-400 truncate">{u.email}</p>
                </div>
                {u.role === "admin" && (
                  <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full flex-shrink-0">Admin</span>
                )}
              </div>
            ))}
            {(!activity?.recentUsers || activity.recentUsers.length === 0) && (
              <p className="text-sm text-slate-400 text-center py-4">No recent signups</p>
            )}
          </div>
        </div>

        {/* Recent submissions */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Recent Submissions</h2>
            <Link href="/admin/submissions" className="text-xs font-semibold text-amber-600 hover:text-amber-700">View all</Link>
          </div>
          <div className="space-y-3">
            {activity?.recentSubmissions.map(s => (
              <div key={s.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-blue-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate">{s.name}</p>
                  <p className="text-xs text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={s.status} />
              </div>
            ))}
            {(!activity?.recentSubmissions || activity.recentSubmissions.length === 0) && (
              <p className="text-sm text-slate-400 text-center py-4">No recent submissions</p>
            )}
          </div>
        </div>

        {/* Recent reviews */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Recent Reviews</h2>
            <Link href="/admin/reviews" className="text-xs font-semibold text-amber-600 hover:text-amber-700">View all</Link>
          </div>
          <div className="space-y-3">
            {activity?.recentReviews.map(r => (
              <div key={r.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4 text-amber-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate">{r.title || "Untitled review"}</p>
                  <p className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < r.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />
                  ))}
                </div>
              </div>
            ))}
            {(!activity?.recentReviews || activity.recentReviews.length === 0) && (
              <p className="text-sm text-slate-400 text-center py-4">No recent reviews</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
