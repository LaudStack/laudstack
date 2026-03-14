"use client";
/*
 * LaudStack Admin — Monetization & Revenue
 * Revenue tracking, upgrade stats, tier breakdown
 */

import { useState, useEffect } from "react";
import {
  DollarSign, TrendingUp, CreditCard, Zap,
  RefreshCw, BarChart3, PieChart, ArrowUpRight,
  Package, Clock, CheckCircle,
} from "lucide-react";
import { getRevenueStats } from "@/app/actions/admin";
import { toast } from "sonner";

type RevenueData = Awaited<ReturnType<typeof getRevenueStats>>;

function formatCurrency(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function MetricCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; color: string;
}) {
  const colorMap: Record<string, { bg: string; icon: string }> = {
    green:  { bg: "bg-green-50",  icon: "text-green-600" },
    amber:  { bg: "bg-amber-50",  icon: "text-amber-600" },
    blue:   { bg: "bg-blue-50",   icon: "text-blue-600" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600" },
  };
  const c = colorMap[color] ?? colorMap.green;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-green-600 font-medium mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminRevenue() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getRevenueStats();
      setData(res);
    } catch {
      setError(true);
      toast.error("Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Monetization & Revenue</h1>
          <p className="text-sm text-slate-500 mt-0.5">Loading revenue data...</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="h-10 w-10 bg-slate-100 rounded-lg animate-pulse mb-3" />
              <div className="h-7 w-20 bg-slate-100 rounded animate-pulse mb-1" />
              <div className="h-4 w-28 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6 max-w-7xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Monetization & Revenue</h1>
            <p className="text-sm text-slate-500 mt-0.5">Track platform earnings and upgrade activity</p>
          </div>
          <button onClick={load} className="inline-flex items-center gap-2 h-9 px-4 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
          <CreditCard className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h3 className="font-semibold text-amber-900">Revenue Data Unavailable</h3>
          <p className="text-sm text-amber-700 mt-1">Could not load revenue data. This may be due to a session issue — try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const tierColors: Record<string, string> = {
    free: "bg-slate-200",
    basic: "bg-blue-400",
    pro: "bg-amber-400",
    featured: "bg-purple-400",
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Monetization & Revenue</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track platform earnings and upgrade activity</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 h-9 px-4 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Revenue"
          value={formatCurrency(data.totalRevenue)}
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          label="Active Upgrades"
          value={data.activeUpgrades.toString()}
          sub="Currently active"
          icon={Zap}
          color="amber"
        />
        <MetricCard
          label="Monthly Revenue"
          value={data.monthlyRevenue.length > 0
            ? formatCurrency(data.monthlyRevenue[data.monthlyRevenue.length - 1]?.revenue ?? 0)
            : "$0.00"
          }
          sub="Current month"
          icon={TrendingUp}
          color="blue"
        />
        <MetricCard
          label="Revenue Tiers"
          value={data.revenueByTier.length.toString()}
          sub="Active pricing tiers"
          icon={Package}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly revenue chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-slate-800">Monthly Revenue</h2>
              <p className="text-xs text-slate-400 mt-0.5">Revenue by month</p>
            </div>
          </div>
          {data.monthlyRevenue.length > 0 ? (
            <div className="flex items-end gap-2 h-40">
              {data.monthlyRevenue.map((m, i) => {
                const max = Math.max(...data.monthlyRevenue.map(r => r.revenue), 1);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] text-slate-500 font-medium">{formatCurrency(m.revenue)}</span>
                    <div
                      className="w-full bg-green-400 rounded-t-sm hover:bg-green-500 transition-colors cursor-pointer"
                      style={{ height: `${(m.revenue / max) * 120}px`, minHeight: "4px" }}
                      title={`${m.month}: ${formatCurrency(m.revenue)}`}
                    />
                    <span className="text-[9px] text-slate-400">{m.month}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-slate-400">
              <BarChart3 className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">No revenue data yet</p>
              <p className="text-xs mt-1">Revenue will appear once Stripe is connected and upgrades are processed</p>
            </div>
          )}
        </div>

        {/* Revenue by tier */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-slate-800">Revenue by Tier</h2>
              <p className="text-xs text-slate-400 mt-0.5">Breakdown by subscription tier</p>
            </div>
          </div>
          {data.revenueByTier.length > 0 ? (
            <div className="space-y-4">
              {data.revenueByTier.map(tier => {
                const pct = data.totalRevenue > 0 ? Math.round((tier.revenue / data.totalRevenue) * 100) : 0;
                return (
                  <div key={tier.tier}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-sm ${tierColors[tier.tier] ?? "bg-slate-300"}`} />
                        <span className="text-sm font-medium text-slate-700 capitalize">{tier.tier}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">{tier.count} upgrades</span>
                        <span className="text-sm font-bold text-slate-800">{formatCurrency(tier.revenue)}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${tierColors[tier.tier] ?? "bg-slate-300"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-slate-400">
              <PieChart className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">No tier data yet</p>
              <p className="text-xs mt-1">Tier breakdown will appear after first upgrade</p>
            </div>
          )}
        </div>
      </div>

      {/* Stripe integration notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <CreditCard className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900 text-sm">Stripe Integration</h3>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              Revenue tracking is powered by the product_upgrades table. Once Stripe is fully connected,
              all payment events (successful charges, refunds, subscription changes) will be automatically
              recorded and reflected here in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
