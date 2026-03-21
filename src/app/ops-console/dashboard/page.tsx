"use client";
/*
 * LaudStack Admin — Dashboard Overview (Rebuilt)
 * Professional analytics dashboard with compact KPIs, recharts graphs,
 * revenue tracking, growth metrics, category breakdown, top stacks,
 * activity feed, engagement stats, and platform health indicators.
 */

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users, Layers, Star, DollarSign, Heart, Tag,
  ArrowUpRight, ArrowDownRight, ArrowRight, Clock,
  AlertCircle, BarChart3, Eye, MousePointerClick,
  Bookmark, MessageSquare, TrendingUp, Trophy,
  FileText, UserCheck, Zap, Package, Activity,
  Megaphone, ShoppingBag, Mail, RefreshCw, UserPlus,
} from "lucide-react";
import {
  getDashboardKPIs,
  getRevenueTimeSeries,
  getGrowthTimeSeries,
  getCategoryBreakdown,
  getTopStacks,
  getDashboardActivity,
  getPlatformHealth,
  getEngagementStats,
  type DashboardKPIs,
  type TimeSeriesPoint,
  type RevenueBreakdown,
  type CategoryBreakdown,
  type TopStack,
  type RecentActivityItem,
  type PlatformHealth,
} from "@/app/actions/admin-dashboard";
import { toast } from "sonner";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ─── Constants ──────────────────────────────────────────────────────────────

const CHART_COLORS = [
  "#F59E0B", "#3B82F6", "#8B5CF6", "#10B981", "#EF4444",
  "#EC4899", "#06B6D4", "#F97316", "#6366F1", "#14B8A6",
  "#A855F7", "#D946EF", "#84CC16", "#64748B", "#0EA5E9",
];

const PERIOD_OPTIONS = [
  { label: "7D", value: 7 },
  { label: "30D", value: 30 },
  { label: "90D", value: 90 },
];

// ─── Formatters ─────────────────────────────────────────────────────────────

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function timeAgo(date: Date) {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─── KPI Card ───────────────────────────────────────────────────────────────

function KPICard({
  label, value, icon: Icon, color, delta, href, prefix,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  delta?: number;
  href?: string;
  prefix?: string;
}) {
  const colorMap: Record<string, { bg: string; icon: string; ring: string }> = {
    blue:   { bg: "bg-blue-50",   icon: "text-blue-600",   ring: "ring-blue-100" },
    amber:  { bg: "bg-amber-50",  icon: "text-amber-600",  ring: "ring-amber-100" },
    green:  { bg: "bg-emerald-50", icon: "text-emerald-600", ring: "ring-emerald-100" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600", ring: "ring-purple-100" },
    red:    { bg: "bg-red-50",    icon: "text-red-600",    ring: "ring-red-100" },
    rose:   { bg: "bg-rose-50",   icon: "text-rose-600",   ring: "ring-rose-100" },
    cyan:   { bg: "bg-cyan-50",   icon: "text-cyan-600",   ring: "ring-cyan-100" },
    slate:  { bg: "bg-slate-50",  icon: "text-slate-600",  ring: "ring-slate-100" },
  };
  const c = colorMap[color] ?? colorMap.slate;

  const inner = (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 hover:shadow-md hover:border-slate-300 transition-all duration-200 group h-full">
      <div className="flex items-center justify-between mb-2.5">
        <div className={`w-9 h-9 rounded-lg ${c.bg} ring-1 ${c.ring} flex items-center justify-center`}>
          <Icon className={`w-[18px] h-[18px] ${c.icon}`} />
        </div>
        {delta !== undefined && delta !== 0 && (
          <div className={`flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
            delta > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
          }`}>
            {delta > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(delta)}%
          </div>
        )}
        {href && (
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
        )}
      </div>
      <p className="text-xl font-bold text-slate-900 leading-tight">{prefix}{value}</p>
      <p className="text-[12px] text-slate-500 mt-0.5 font-medium">{label}</p>
    </div>
  );

  if (href) return <Link href={href} className="block">{inner}</Link>;
  return inner;
}

// ─── Section Wrapper ────────────────────────────────────────────────────────

function Section({ title, subtitle, action, children, className = "" }: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200/80 overflow-hidden ${className}`}>
      <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
          {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="px-5 pb-5">{children}</div>
    </div>
  );
}

// ─── Period Selector ────────────────────────────────────────────────────────

function PeriodSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
      {PERIOD_OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
            value === opt.value
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Custom Tooltip ─────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, isCurrency }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-xl text-xs">
      <p className="text-slate-500 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-semibold" style={{ color: p.color }}>
          {p.name}: {isCurrency ? formatCurrency(p.value) : formatNumber(p.value)}
        </p>
      ))}
    </div>
  );
}

// ─── Activity Icon ──────────────────────────────────────────────────────────

function ActivityIcon({ type }: { type: string }) {
  const map: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
    signup:     { icon: UserCheck, bg: "bg-blue-50",   color: "text-blue-600" },
    review:     { icon: Star,      bg: "bg-amber-50",  color: "text-amber-600" },
    submission: { icon: FileText,  bg: "bg-purple-50", color: "text-purple-600" },
    deal_claim: { icon: Tag,       bg: "bg-green-50",  color: "text-green-600" },
    upvote:     { icon: Heart,     bg: "bg-rose-50",   color: "text-rose-600" },
  };
  const m = map[type] ?? map.signup;
  return (
    <div className={`w-8 h-8 rounded-lg ${m.bg} flex items-center justify-center flex-shrink-0`}>
      <m.icon className={`w-4 h-4 ${m.color}`} />
    </div>
  );
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-5 max-w-[1400px] animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 bg-slate-200 rounded w-40 mb-2" />
          <div className="h-4 bg-slate-100 rounded w-64" />
        </div>
        <div className="h-8 bg-slate-100 rounded w-32" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="w-9 h-9 bg-slate-100 rounded-lg mb-2.5" />
            <div className="h-6 bg-slate-100 rounded w-16 mb-1" />
            <div className="h-3 bg-slate-100 rounded w-24" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 h-80" />
        <div className="bg-white rounded-xl border border-slate-200 p-5 h-80" />
      </div>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [period, setPeriod] = useState(30);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [revenueSeries, setRevenueSeries] = useState<TimeSeriesPoint[]>([]);
  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown>({ promotions: 0, marketplace: 0, upgrades: 0 });
  const [growthUsers, setGrowthUsers] = useState<TimeSeriesPoint[]>([]);
  const [growthStacks, setGrowthStacks] = useState<TimeSeriesPoint[]>([]);
  const [growthReviews, setGrowthReviews] = useState<TimeSeriesPoint[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [topStacks, setTopStacks] = useState<TopStack[]>([]);
  const [activity, setActivity] = useState<RecentActivityItem[]>([]);
  const [health, setHealth] = useState<PlatformHealth | null>(null);
  const [engagement, setEngagement] = useState<{ totalViews: number; totalClicks: number; totalSaves: number; totalComments: number; viewsSeries: TimeSeriesPoint[] } | null>(null);

  const loadData = async (p: number, isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    const errors: string[] = [];

    try {
      const [kpiData, revenueData, growthData, catData, topData, actData, healthData, engData] = await Promise.all([
        getDashboardKPIs(p).catch(e => { errors.push("KPIs"); console.error(e); return null; }),
        getRevenueTimeSeries(p).catch(e => { errors.push("revenue"); console.error(e); return null; }),
        getGrowthTimeSeries(p).catch(e => { errors.push("growth"); console.error(e); return null; }),
        getCategoryBreakdown().catch(e => { errors.push("categories"); console.error(e); return null; }),
        getTopStacks(10).catch(e => { errors.push("top stacks"); console.error(e); return null; }),
        getDashboardActivity(15).catch(e => { errors.push("activity"); console.error(e); return null; }),
        getPlatformHealth().catch(e => { errors.push("health"); console.error(e); return null; }),
        getEngagementStats(p).catch(e => { errors.push("engagement"); console.error(e); return null; }),
      ]);

      if (kpiData) setKpis(kpiData);
      if (revenueData) { setRevenueSeries(revenueData.series); setRevenueBreakdown(revenueData.breakdown); }
      if (growthData) { setGrowthUsers(growthData.users); setGrowthStacks(growthData.stacks); setGrowthReviews(growthData.reviews); }
      if (catData) setCategories(catData);
      if (topData) setTopStacks(topData);
      if (actData) setActivity(actData);
      if (healthData) setHealth(healthData);
      if (engData) setEngagement(engData);

      if (errors.length > 0) toast.error(`Failed to load: ${errors.join(", ")}`);
    } catch (e) {
      toast.error("Failed to load dashboard data");
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { loadData(period); }, [period]);

  // Memoized chart data
  const revenueChartData = useMemo(() =>
    revenueSeries.map(p => ({ date: formatShortDate(p.date), Revenue: p.value })),
    [revenueSeries]
  );

  const growthChartData = useMemo(() =>
    growthUsers.map((u, i) => ({
      date: formatShortDate(u.date),
      Users: u.value,
      Stacks: growthStacks[i]?.value ?? 0,
      Reviews: growthReviews[i]?.value ?? 0,
    })),
    [growthUsers, growthStacks, growthReviews]
  );

  const categoryChartData = useMemo(() =>
    categories.slice(0, 10).map(c => ({ name: c.category, value: c.count })),
    [categories]
  );

  const revenueBreakdownData = useMemo(() => [
    { name: "Promotions", value: revenueBreakdown.promotions },
    { name: "Marketplace", value: revenueBreakdown.marketplace },
    { name: "Upgrades", value: revenueBreakdown.upgrades },
  ].filter(d => d.value > 0), [revenueBreakdown]);

  const totalPeriodRevenue = revenueBreakdown.promotions + revenueBreakdown.marketplace + revenueBreakdown.upgrades;

  const engagementChartData = useMemo(() =>
    (engagement?.viewsSeries ?? []).map(p => ({ date: formatShortDate(p.date), Views: p.value })),
    [engagement]
  );

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Platform overview &middot; {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PeriodSelector value={period} onChange={setPeriod} />
          <button
            onClick={() => loadData(period, true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Attention Banner ── */}
      {kpis && (kpis.pendingSubmissions > 0 || kpis.pendingClaims > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertCircle className="w-4.5 h-4.5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800 flex-1">
            <strong>{kpis.pendingSubmissions + kpis.pendingClaims}</strong> items need review:
            {kpis.pendingSubmissions > 0 && <> {kpis.pendingSubmissions} submission{kpis.pendingSubmissions !== 1 ? "s" : ""}</>}
            {kpis.pendingClaims > 0 && <>{kpis.pendingSubmissions > 0 ? "," : ""} {kpis.pendingClaims} claim{kpis.pendingClaims !== 1 ? "s" : ""}</>}
          </p>
          <Link href="/ops-console/stacks/launches" className="text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1 whitespace-nowrap">
            Review <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* ── KPI Cards (2 rows of 4) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Total Users"     value={formatNumber(kpis?.totalUsers ?? 0)}     icon={Users}      color="blue"   delta={kpis?.usersDelta}   href="/ops-console/users" />
        <KPICard label="Total Stacks"    value={formatNumber(kpis?.totalStacks ?? 0)}    icon={Layers}     color="amber"  delta={kpis?.stacksDelta}  href="/ops-console/stacks/listed" />
        <KPICard label="Total Reviews"   value={formatNumber(kpis?.totalReviews ?? 0)}   icon={Star}       color="purple" delta={kpis?.reviewsDelta} href="/ops-console/reviews" />
        <KPICard label="Total Revenue"   value={formatCurrency(kpis?.totalRevenue ?? 0)} icon={DollarSign}  color="green"  delta={kpis?.revenueDelta} />
        <KPICard label="Total Upvotes"   value={formatNumber(kpis?.totalUpvotes ?? 0)}   icon={Heart}      color="rose" />
        <KPICard label="Active Deals"    value={formatNumber(kpis?.totalDeals ?? 0)}     icon={Tag}        color="cyan"   href="/ops-console/deals" />
        <KPICard label="Pending Launches" value={formatNumber(kpis?.pendingSubmissions ?? 0)} icon={FileText} color="amber" href="/ops-console/stacks/launches" />
        <KPICard label="Pending Claims"  value={formatNumber(kpis?.pendingClaims ?? 0)}  icon={Package}    color="slate"  href="/ops-console/stacks/claimed" />
        <KPICard label="User Follows"    value={formatNumber(kpis?.totalUserFollows ?? 0)}  icon={UserPlus}   color="blue" />
        <KPICard label="Stack Follows"   value={formatNumber(kpis?.totalStackFollows ?? 0)} icon={Bookmark}   color="purple" />
      </div>

      {/* ── Revenue + Growth Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Revenue Area Chart */}
        <Section
          title="Revenue Overview"
          subtitle={`${formatCurrency(totalPeriodRevenue)} in the last ${period} days`}
          className="lg:col-span-3"
        >
          <div className="h-[260px] -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94A3B8" }} tickLine={false} axisLine={false} interval={Math.max(0, Math.floor(revenueChartData.length / 7) - 1)} />
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v)} width={60} />
                <Tooltip content={<ChartTooltip isCurrency />} />
                <Area type="monotone" dataKey="Revenue" stroke="#10B981" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Section>

        {/* Revenue Breakdown Donut */}
        <Section title="Revenue Sources" subtitle="Breakdown by type" className="lg:col-span-2">
          {revenueBreakdownData.length > 0 ? (
            <div className="flex flex-col items-center">
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueBreakdownData}
                      cx="50%" cy="50%"
                      innerRadius={50} outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {revenueBreakdownData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip isCurrency />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {revenueBreakdownData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                    <span className="text-slate-600 font-medium">{d.name}</span>
                    <span className="text-slate-800 font-bold">{formatCurrency(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[220px] text-slate-400">
              <DollarSign className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm font-medium">No revenue data yet</p>
              <p className="text-[11px] mt-0.5">Revenue will appear once transactions occur</p>
            </div>
          )}
        </Section>
      </div>

      {/* ── Growth + Category Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Growth Line Chart */}
        <Section
          title="Platform Growth"
          subtitle={`New signups, stacks & reviews — last ${period} days`}
          className="lg:col-span-3"
        >
          <div className="h-[260px] -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94A3B8" }} tickLine={false} axisLine={false} interval={Math.max(0, Math.floor(growthChartData.length / 7) - 1)} />
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} tickLine={false} axisLine={false} width={35} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Line type="monotone" dataKey="Users" stroke="#3B82F6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Stacks" stroke="#F59E0B" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Reviews" stroke="#8B5CF6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>

        {/* Category Breakdown */}
        <Section title="Stacks by Category" subtitle={`${categories.length} categories`} className="lg:col-span-2">
          {categoryChartData.length > 0 ? (
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {categories.slice(0, 12).map((cat, i) => {
                const maxCount = categories[0]?.count ?? 1;
                const pct = Math.round((cat.count / maxCount) * 100);
                return (
                  <div key={cat.category} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium text-slate-700 truncate max-w-[140px]">{cat.category}</span>
                      <span className="text-[11px] font-bold text-slate-800">{cat.count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[220px] text-slate-400">
              <Layers className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm font-medium">No stacks yet</p>
            </div>
          )}
        </Section>
      </div>

      {/* ── Engagement + Top Stacks Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Engagement Metrics */}
        <Section
          title="Engagement Overview"
          subtitle={`Page views trend — last ${period} days`}
          className="lg:col-span-3"
        >
          {/* Engagement KPI strip */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: "Views", value: engagement?.totalViews ?? 0, icon: Eye, color: "text-blue-600" },
              { label: "Clicks", value: engagement?.totalClicks ?? 0, icon: MousePointerClick, color: "text-amber-600" },
              { label: "Saves", value: engagement?.totalSaves ?? 0, icon: Bookmark, color: "text-purple-600" },
              { label: "Comments", value: engagement?.totalComments ?? 0, icon: MessageSquare, color: "text-green-600" },
            ].map(m => (
              <div key={m.label} className="text-center">
                <m.icon className={`w-4 h-4 mx-auto mb-1 ${m.color}`} />
                <p className="text-lg font-bold text-slate-900">{formatNumber(m.value)}</p>
                <p className="text-[10px] text-slate-500 font-medium">{m.label}</p>
              </div>
            ))}
          </div>
          <div className="h-[180px] -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94A3B8" }} tickLine={false} axisLine={false} interval={Math.max(0, Math.floor(engagementChartData.length / 7) - 1)} />
                <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} tickLine={false} axisLine={false} width={35} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="Views" fill="#3B82F6" radius={[3, 3, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        {/* Top Performing Stacks */}
        <Section
          title="Top Performing Stacks"
          subtitle="Ranked by score"
          action={<Link href="/ops-console/rankings" className="text-[11px] font-semibold text-amber-600 hover:text-amber-700">View all</Link>}
          className="lg:col-span-2"
        >
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {topStacks.map((stack, i) => (
              <Link
                key={stack.id}
                href={`/ops-console/stacks/${stack.id}`}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                  i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-slate-200 text-slate-700" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-500"
                }`}>
                  {i + 1}
                </span>
                {stack.logoUrl ? (
                  <img src={stack.logoUrl} alt="" className="w-7 h-7 rounded-md object-cover flex-shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-slate-800 truncate group-hover:text-amber-700 transition-colors">{stack.name}</p>
                  <p className="text-[10px] text-slate-500">{stack.category}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-[11px] font-bold text-slate-800">{stack.averageRating.toFixed(1)}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">{stack.reviewCount} reviews</p>
                </div>
              </Link>
            ))}
            {topStacks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <Trophy className="w-6 h-6 mb-2 opacity-40" />
                <p className="text-xs font-medium">No stacks ranked yet</p>
              </div>
            )}
          </div>
        </Section>
      </div>

      {/* ── Activity Feed + Platform Health + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Activity */}
        <Section title="Recent Activity" subtitle="Latest platform events" className="lg:col-span-1">
          <div className="space-y-1 max-h-[340px] overflow-y-auto pr-1">
            {activity.map((item, i) => (
              <div key={`${item.type}-${item.id}-${i}`} className="flex items-start gap-2.5 py-2 border-b border-slate-50 last:border-0">
                <ActivityIcon type={item.type} />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium text-slate-800 truncate">{item.title}</p>
                  <p className="text-[11px] text-slate-500">{item.subtitle}</p>
                </div>
                <span className="text-[10px] text-slate-500 whitespace-nowrap flex-shrink-0">{timeAgo(item.timestamp)}</span>
              </div>
            ))}
            {activity.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <Activity className="w-6 h-6 mb-2 opacity-40" />
                <p className="text-xs font-medium">No recent activity</p>
              </div>
            )}
          </div>
        </Section>

        {/* Platform Health */}
        <Section title="Platform Health" subtitle="Key operational metrics">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Verified Founders", value: health?.verifiedFounders ?? 0, icon: UserCheck, color: "text-green-600", bg: "bg-green-50" },
              { label: "Active Deals", value: health?.activeDeals ?? 0, icon: Tag, color: "text-cyan-600", bg: "bg-cyan-50" },
              { label: "Active Promotions", value: health?.activePromotions ?? 0, icon: Megaphone, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "Marketplace Products", value: health?.marketplaceProducts ?? 0, icon: ShoppingBag, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Newsletter Subs", value: health?.newsletterSubs ?? 0, icon: Mail, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Avg Stack Rating", value: (health?.avgRating ?? 0).toFixed(1), icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
            ].map(m => (
              <div key={m.label} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50/50">
                <div className={`w-8 h-8 rounded-lg ${m.bg} flex items-center justify-center flex-shrink-0`}>
                  <m.icon className={`w-4 h-4 ${m.color}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{typeof m.value === "number" ? formatNumber(m.value) : m.value}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{m.label}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Quick Actions */}
        <Section title="Quick Actions" subtitle="Common admin tasks">
          <div className="space-y-1.5">
            {[
              { label: "Review Launches", href: "/ops-console/stacks/launches", icon: FileText, color: "text-amber-600", bg: "bg-amber-50", count: kpis?.pendingSubmissions },
              { label: "Verify Founders", href: "/ops-console/founders", icon: UserCheck, color: "text-green-600", bg: "bg-green-50" },
              { label: "Manage Stacks", href: "/ops-console/stacks/listed", icon: Layers, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Manage Users", href: "/ops-console/users", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "View Analytics", href: "/ops-console/analytics", icon: BarChart3, color: "text-cyan-600", bg: "bg-cyan-50" },
              { label: "Platform Settings", href: "/ops-console/settings", icon: Zap, color: "text-slate-600", bg: "bg-slate-50" },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <span className="text-[12px] font-medium text-slate-700 flex-1">{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">{item.count}</span>
                )}
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </Link>
            ))}
          </div>
          {/* Ranking Engine */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={async () => {
                toast.loading("Recalculating rankings...");
                try {
                  const res = await fetch("/api/admin/recalculate-rankings", { method: "POST" });
                  const data = await res.json();
                  toast.dismiss();
                  if (data.success) toast.success(`Rankings updated for ${data.updatedCount} tools`);
                  else toast.error(data.error || "Failed to recalculate");
                } catch {
                  toast.dismiss();
                  toast.error("Failed to recalculate rankings");
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Recalculate Rankings
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}
