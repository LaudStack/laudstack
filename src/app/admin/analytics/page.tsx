"use client";
/*
 * LaudStack Admin — Analytics Overview
 * Platform-wide metrics from real database data
 */

import { useState, useEffect } from "react";
import {
  BarChart3, TrendingUp, Users, Eye, Star, Wrench,
  ArrowUpRight, ArrowDownRight, Globe, Clock, RefreshCw, Loader2,
} from "lucide-react";
import { getPlatformAnalytics } from "@/app/actions/admin";
import { toast } from "sonner";

type Analytics = {
  totalUsers: number;
  totalTools: number;
  totalReviews: number;
  newUsersThisWeek: number;
  newToolsThisWeek: number;
  newReviewsThisWeek: number;
  avgRating: string;
};

function MetricCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; color: string;
}) {
  const colorMap: Record<string, { bg: string; icon: string }> = {
    blue:   { bg: "bg-blue-50",   icon: "text-blue-600" },
    amber:  { bg: "bg-amber-50",  icon: "text-amber-600" },
    green:  { bg: "bg-green-50",  icon: "text-green-600" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600" },
    red:    { bg: "bg-red-50",    icon: "text-red-600" },
    slate:  { bg: "bg-slate-50",  icon: "text-slate-600" },
  };
  const c = colorMap[color] ?? colorMap.blue;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-green-600 font-semibold mt-1 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" />{sub}</p>}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
      <div className="w-10 h-10 rounded-lg bg-slate-100 mb-3" />
      <div className="h-7 w-20 bg-slate-100 rounded mb-1" />
      <div className="h-4 w-28 bg-slate-100 rounded" />
    </div>
  );
}

export default function AdminAnalytics() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const result = await getPlatformAnalytics();
      setData(result);
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Platform performance overview — live data</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Refresh
        </button>
      </div>

      {/* Metric cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Total Users"   value={data.totalUsers.toLocaleString()}   sub={`+${data.newUsersThisWeek} this week`}   icon={Users}      color="blue"   />
            <MetricCard label="Total Tools"   value={data.totalTools.toLocaleString()}   sub={`+${data.newToolsThisWeek} this week`}   icon={Wrench}     color="amber"  />
            <MetricCard label="Total Reviews" value={data.totalReviews.toLocaleString()} sub={`+${data.newReviewsThisWeek} this week`} icon={Star}       color="purple" />
            <MetricCard label="Avg. Rating"   value={data.avgRating}                     sub="across all tools"                        icon={TrendingUp} color="green"  />
          </div>

          {/* Growth Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-4">This Week at a Glance</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-3xl font-black text-blue-700">{data.newUsersThisWeek}</p>
                <p className="text-sm text-blue-600 font-medium mt-1">New Users</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-3xl font-black text-amber-700">{data.newToolsThisWeek}</p>
                <p className="text-sm text-amber-600 font-medium mt-1">New Products</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                <p className="text-3xl font-black text-purple-700">{data.newReviewsThisWeek}</p>
                <p className="text-sm text-purple-600 font-medium mt-1">New Reviews</p>
              </div>
            </div>
          </div>

          {/* Platform Health */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Platform Health</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-600">User Growth Rate</span>
                  <span className="text-sm font-bold text-green-600">
                    {data.totalUsers > 0 ? ((data.newUsersThisWeek / data.totalUsers) * 100).toFixed(1) : "0.0"}% weekly
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-400 rounded-full transition-all"
                    style={{ width: `${Math.min(100, data.totalUsers > 0 ? (data.newUsersThisWeek / data.totalUsers) * 100 * 10 : 0)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-600">Review Engagement</span>
                  <span className="text-sm font-bold text-purple-600">
                    {data.totalTools > 0 ? (data.totalReviews / data.totalTools).toFixed(1) : "0"} reviews/tool
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-400 rounded-full transition-all"
                    style={{ width: `${Math.min(100, data.totalTools > 0 ? (data.totalReviews / data.totalTools) * 10 : 0)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-600">Average Rating</span>
                  <span className="text-sm font-bold text-amber-600">
                    {data.avgRating} / 5.0
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${(parseFloat(data.avgRating) / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-16 text-slate-400">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No analytics data available</p>
        </div>
      )}
    </div>
  );
}
