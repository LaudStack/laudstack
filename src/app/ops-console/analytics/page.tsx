"use client";
/*
 * LaudStack Admin — Comprehensive Analytics Dashboard
 * Enterprise-grade analytics with real data, interactive charts, geographic maps,
 * and deep platform insights across multiple dimensions.
 *
 * Design: Clean white cards, amber accent (#F59E0B), Inter font, soft shadows
 * Tabs: Overview | Traffic & Engagement | Users & Geography | Stacks & Content | Activity
 */
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  BarChart3, TrendingUp, Users, Eye, Star, Wrench, Globe, Clock,
  RefreshCw, Loader2, ArrowUpRight, ArrowDownRight, Minus,
  MousePointerClick, Bookmark, MessageSquare, Heart, Award,
  UserCheck, Store, Newspaper, MapPin, Layers, Zap,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { getComprehensiveAnalytics, type AnalyticsData, type TopStack } from "@/app/actions/admin-analytics";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Constants ──────────────────────────────────────────────────────────────

const PERIODS = [
  { label: "24h", value: 1 },
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
  { label: "All", value: 365 },
] as const;

const CHART_COLORS = {
  amber: "#F59E0B",
  amberLight: "#FDE68A",
  blue: "#3B82F6",
  blueLight: "#93C5FD",
  green: "#22C55E",
  greenLight: "#86EFAC",
  red: "#EF4444",
  redLight: "#FCA5A5",
  purple: "#8B5CF6",
  purpleLight: "#C4B5FD",
  cyan: "#06B6D4",
  slate: "#64748B",
  orange: "#F97316",
  pink: "#EC4899",
};

const PIE_COLORS = [
  CHART_COLORS.amber, CHART_COLORS.blue, CHART_COLORS.green,
  CHART_COLORS.purple, CHART_COLORS.red, CHART_COLORS.cyan,
  CHART_COLORS.orange, CHART_COLORS.pink, CHART_COLORS.slate,
  "#14B8A6", "#A855F7", "#F43F5E",
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function DeltaBadge({ value }: { value: number }) {
  if (value === 0) return (
    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-400">
      <Minus className="w-3 h-3" /> 0%
    </span>
  );
  const isPositive = value > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
      {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(value)}%
    </span>
  );
}

// ─── Metric Card ────────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon, label, value, delta, color = "amber", subtitle,
}: {
  icon: React.ElementType; label: string; value: string | number;
  delta?: number; color?: string; subtitle?: string;
}) {
  const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
    amber: { bg: "bg-amber-50", icon: "text-amber-600", border: "border-amber-100" },
    blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-100" },
    green: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-100" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-100" },
    red: { bg: "bg-red-50", icon: "text-red-600", border: "border-red-100" },
    cyan: { bg: "bg-cyan-50", icon: "text-cyan-600", border: "border-cyan-100" },
    slate: { bg: "bg-slate-50", icon: "text-slate-600", border: "border-slate-100" },
  };
  const c = colorMap[color] || colorMap.amber;

  return (
    <div className={`bg-white rounded-xl border ${c.border} p-5 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        {delta !== undefined && <DeltaBadge value={delta} />}
      </div>
      <div className="text-2xl font-bold text-slate-900 tracking-tight">{typeof value === "number" ? formatNumber(value) : value}</div>
      <div className="text-sm text-slate-600 font-medium mt-0.5">{label}</div>
      {subtitle && <div className="text-xs text-slate-500 mt-1">{subtitle}</div>}
    </div>
  );
}

// ─── Chart Card Wrapper ─────────────────────────────────────────────────────

function ChartCard({
  title, subtitle, children, className = "",
}: {
  title: string; subtitle?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`bg-white rounded-xl border border-slate-100 p-6 hover:shadow-md transition-shadow ${className}`}>
      <div className="mb-5">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-sm text-slate-600 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── Custom Tooltip ─────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-lg px-4 py-3">
      <p className="text-xs font-semibold text-slate-500 mb-1.5">{formatDate(label)}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-600">{entry.name}:</span>
          <span className="font-bold text-slate-900">{formatNumber(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Top Stacks Table ───────────────────────────────────────────────────────

function TopStacksTable({ stacks, title, subtitle }: { stacks: TopStack[]; title: string; subtitle?: string }) {
  if (!stacks.length) {
    return (
      <ChartCard title={title} subtitle={subtitle}>
        <div className="text-center py-8 text-slate-500 text-sm">No data yet</div>
      </ChartCard>
    );
  }
  return (
    <ChartCard title={title} subtitle={subtitle}>
      <div className="space-y-2.5">
        {stacks.map((s, i) => (
          <div key={s.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
            <span className="text-xs font-bold text-slate-400 w-5 text-center">#{i + 1}</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {s.logoUrl ? (
                <img src={s.logoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <Wrench className="w-4 h-4 text-slate-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">{s.name}</div>
              <div className="text-xs text-slate-500">{s.category}</div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-bold text-slate-900">{formatNumber(s.metric)}</div>
              <div className="text-xs text-slate-500">{s.metricLabel}</div>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

// ─── Geographic Bar Chart ───────────────────────────────────────────────────

function GeoBarChart({ data }: { data: { country: string; count: number; iso: string }[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  if (!data.length) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm">
        <Globe className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        No geographic data available yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.slice(0, 10).map((item, i) => {
        const pct = (item.count / maxCount) * 100;
        return (
          <div key={item.country} className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 w-5 text-right">#{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-slate-700 truncate">{item.country}</span>
                <span className="text-sm font-bold text-slate-900 ml-2">{formatNumber(item.count)}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${CHART_COLORS.amber}, ${CHART_COLORS.orange})`,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Loading Skeleton ───────────────────────────────────────────────────────

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 p-5">
            <Skeleton className="w-10 h-10 rounded-lg mb-3" />
            <Skeleton className="w-20 h-7 mb-1" />
            <Skeleton className="w-28 h-4" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 p-6">
            <Skeleton className="w-40 h-5 mb-2" />
            <Skeleton className="w-60 h-4 mb-6" />
            <Skeleton className="w-full h-64 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState(30);

  const loadData = useCallback(async (days: number, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const result = await getComprehensiveAnalytics(days);
      setData(result);
    } catch (err) {
      toast.error("Failed to load analytics data");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(period);
  }, [period, loadData]);

  const handleRefresh = () => loadData(period, true);

  const chartData = useMemo(() => {
    if (!data) return null;

    const combinedEngagement = data.viewsTrend.map((v, i) => ({
      date: v.date,
      views: v.value,
      clicks: data.clicksTrend[i]?.value || 0,
    }));

    const categoryPieRaw = [...data.categoryBreakdown].sort((a, b) => b.count - a.count);
    const topCats = categoryPieRaw.slice(0, 8);
    const otherCount = categoryPieRaw.slice(8).reduce((s, c) => s + c.count, 0);
    const categoryPie = [
      ...topCats.map(c => ({ name: c.category, value: c.count })),
      ...(otherCount > 0 ? [{ name: "Other", value: otherCount }] : []),
    ];

    const pricingPie = data.pricingBreakdown.map(p => ({
      name: p.category,
      value: p.count,
    }));

    return { combinedEngagement, categoryPie, pricingPie };
  }, [data]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics</h1>
            <p className="text-sm text-slate-600 mt-1">Comprehensive platform insights and performance metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
              {PERIODS.map(p => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    period === p.value
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <AnalyticsSkeleton />
      ) : data && chartData ? (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="overview" className="text-xs font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
            <TabsTrigger value="traffic" className="text-xs font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Traffic</TabsTrigger>
            <TabsTrigger value="users" className="text-xs font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Users</TabsTrigger>
            <TabsTrigger value="stacks" className="text-xs font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Stacks</TabsTrigger>
            <TabsTrigger value="activity" className="text-xs font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Activity</TabsTrigger>
          </TabsList>

          {/* ═══ TAB: OVERVIEW ═══ */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard icon={Users} label="Total Users" value={data.overview.totalUsers} delta={data.overview.userGrowthPct} color="blue" subtitle={`+${data.overview.newUsersThisPeriod} this period`} />
              <MetricCard icon={Layers} label="Total Stacks" value={data.overview.totalStacks} color="amber" subtitle={`${data.overview.totalLaunches} launched`} />
              <MetricCard icon={Star} label="Total Reviews" value={data.overview.totalReviews} delta={data.overview.reviewsDelta} color="green" subtitle={`Avg ${data.overview.avgRating.toFixed(1)} rating`} />
              <MetricCard icon={Eye} label="Total Views" value={data.overview.totalViews} delta={data.overview.viewsDelta} color="purple" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard icon={Heart} label="Total Upvotes" value={data.overview.totalUpvotes} delta={data.overview.upvotesDelta} color="red" />
              <MetricCard icon={MousePointerClick} label="Outbound Clicks" value={data.overview.totalClicks} delta={data.overview.clicksDelta} color="cyan" />
              <MetricCard icon={UserCheck} label="Verified Founders" value={data.overview.totalFounders} color="green" subtitle={`+${data.overview.newFoundersThisPeriod} this period`} />
              <MetricCard icon={Newspaper} label="Newsletter Subs" value={data.overview.totalSubscribers} color="slate" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="User Growth" subtitle={`New signups over the last ${period} days`}>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={data.userGrowth}>
                    <defs>
                      <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.blue} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={CHART_COLORS.blue} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" name="New Users" stroke={CHART_COLORS.blue} fill="url(#userGrad)" strokeWidth={2.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Traffic Overview" subtitle="Page views and outbound clicks">
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={chartData.combinedEngagement}>
                    <defs>
                      <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.amber} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={CHART_COLORS.amber} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="views" name="Views" stroke={CHART_COLORS.amber} fill="url(#viewsGrad)" strokeWidth={2} dot={false} />
                    <Bar dataKey="clicks" name="Clicks" fill={CHART_COLORS.blue} radius={[3, 3, 0, 0]} barSize={12} opacity={0.8} />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Category Distribution" subtitle="Stacks by category">
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="50%" height={240}>
                    <PieChart>
                      <Pie data={chartData.categoryPie} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value">
                        {chartData.categoryPie.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatNumber(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-1.5">
                    {chartData.categoryPie.slice(0, 8).map((item, i) => (
                      <div key={item.name} className="flex items-center gap-2 text-sm">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-slate-600 truncate flex-1">{item.name}</span>
                        <span className="font-semibold text-slate-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ChartCard>

              <ChartCard title="Rating Distribution" subtitle="How users rate stacks">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.ratingDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="rating" tick={{ fontSize: 12, fill: "#64748B", fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v} ★`} width={50} />
                    <Tooltip formatter={(value: number) => formatNumber(value)} />
                    <Bar dataKey="count" name="Reviews" radius={[0, 6, 6, 0]} barSize={20}>
                      {data.ratingDistribution.map((_, i) => {
                        const colors = [CHART_COLORS.red, CHART_COLORS.orange, CHART_COLORS.amber, CHART_COLORS.green, "#16A34A"];
                        return <Cell key={i} fill={colors[i] || CHART_COLORS.amber} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl border border-slate-100 p-4 text-center">
                <div className="text-2xl font-bold text-slate-900">{data.overview.totalDeals}</div>
                <div className="text-xs text-slate-600 font-medium mt-1">Active Deals</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-4 text-center">
                <div className="text-2xl font-bold text-slate-900">{data.overview.totalMarketplaceProducts}</div>
                <div className="text-xs text-slate-600 font-medium mt-1">Marketplace Products</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-4 text-center">
                <div className="text-2xl font-bold text-slate-900">{data.overview.totalCreators}</div>
                <div className="text-xs text-slate-600 font-medium mt-1">Creators</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-4 text-center">
                <div className="text-2xl font-bold text-slate-900">{formatNumber(data.overview.totalSaves)}</div>
                <div className="text-xs text-slate-600 font-medium mt-1">Saved Tools</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-4 text-center">
                <div className="text-2xl font-bold text-slate-900">{formatNumber(data.overview.totalComments)}</div>
                <div className="text-xs text-slate-600 font-medium mt-1">Comments</div>
              </div>
            </div>
          </TabsContent>

          {/* ═══ TAB: TRAFFIC ═══ */}
          <TabsContent value="traffic" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard icon={Eye} label="Page Views" value={data.overview.totalViews} delta={data.overview.viewsDelta} color="amber" />
              <MetricCard icon={MousePointerClick} label="Outbound Clicks" value={data.overview.totalClicks} delta={data.overview.clicksDelta} color="blue" />
              <MetricCard icon={Bookmark} label="Total Saves" value={data.overview.totalSaves} color="green" />
              <MetricCard icon={Users} label="Active Users (30d)" value={data.overview.activeUsers} color="purple" subtitle={`${data.overview.totalUsers} total`} />
            </div>

            <ChartCard title="Daily Page Views" subtitle={`Page view trend over ${period} days`}>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={data.viewsTrend}>
                  <defs>
                    <linearGradient id="viewsTrendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.amber} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={CHART_COLORS.amber} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" name="Views" stroke={CHART_COLORS.amber} fill="url(#viewsTrendGrad)" strokeWidth={2.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Outbound Clicks" subtitle="Daily click-through trend">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.clicksTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Clicks" fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Top Viewed Stacks" subtitle="Most visited tool pages">
                <div className="space-y-2.5">
                  {data.topViewedTools.map((tool, i) => {
                    const maxViews = data.topViewedTools[0]?.views || 1;
                    const pct = (tool.views / maxViews) * 100;
                    return (
                      <div key={tool.slug} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 w-5 text-right">#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-slate-700 truncate">{tool.name}</span>
                            <span className="text-sm font-bold text-slate-900 ml-2">{formatNumber(tool.views)}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${CHART_COLORS.amber}, ${CHART_COLORS.orange})` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {!data.topViewedTools.length && (
                    <div className="text-center py-8 text-slate-500 text-sm">No view data yet</div>
                  )}
                </div>
              </ChartCard>
            </div>
          </TabsContent>

          {/* ═══ TAB: USERS ═══ */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard icon={Users} label="Total Users" value={data.overview.totalUsers} delta={data.overview.userGrowthPct} color="blue" subtitle={`+${data.overview.newUsersThisPeriod} this period`} />
              <MetricCard icon={Users} label="Active Users (30d)" value={data.overview.activeUsers} color="green" subtitle={`${((data.overview.activeUsers / Math.max(data.overview.totalUsers, 1)) * 100).toFixed(0)}% active rate`} />
              <MetricCard icon={UserCheck} label="Verified Founders" value={data.overview.totalFounders} color="amber" subtitle={`+${data.overview.newFoundersThisPeriod} this period`} />
              <MetricCard icon={Store} label="Creators" value={data.overview.totalCreators} color="purple" subtitle={`+${data.overview.newCreatorsThisPeriod} this period`} />
            </div>

            <ChartCard title="User Signups Over Time" subtitle={`Daily new registrations (${period}d)`}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.userGrowth}>
                  <defs>
                    <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.blue} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={CHART_COLORS.blue} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" name="New Users" stroke={CHART_COLORS.blue} fill="url(#userGrowthGrad)" strokeWidth={2.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Users by Country" subtitle="Geographic distribution of all users">
                <GeoBarChart data={data.usersByCountry} />
              </ChartCard>
              <ChartCard title="Founders by Country" subtitle="Where verified founders are located">
                <GeoBarChart data={data.foundersByCountry} />
              </ChartCard>
              <ChartCard title="Top Cities" subtitle="Most popular user locations" className="lg:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {data.topCities.slice(0, 12).map((city) => (
                    <div key={`${city.city}-${city.country}`} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-slate-50">
                      <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-700 truncate">{city.city}</div>
                        <div className="text-xs text-slate-500">{city.country}</div>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{city.count}</span>
                    </div>
                  ))}
                  {!data.topCities.length && (
                    <div className="col-span-full text-center py-8 text-slate-500 text-sm">No city data yet</div>
                  )}
                </div>
              </ChartCard>
            </div>
          </TabsContent>

          {/* ═══ TAB: STACKS ═══ */}
          <TabsContent value="stacks" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard icon={Layers} label="Total Stacks" value={data.overview.totalStacks} color="amber" />
              <MetricCard icon={Star} label="Avg Rating" value={data.overview.avgRating.toFixed(1)} color="green" />
              <MetricCard icon={Store} label="Marketplace Products" value={data.overview.totalMarketplaceProducts} color="purple" />
              <MetricCard icon={Zap} label="Active Deals" value={data.overview.totalDeals} color="cyan" />
            </div>

            <ChartCard title="Stack Submissions Over Time" subtitle={`New stacks added (${period}d)`}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.stackGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="New Stacks" fill={CHART_COLORS.amber} radius={[4, 4, 0, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Category Distribution" subtitle="Stacks by category">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.categoryBreakdown.slice(0, 12)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} width={100} />
                    <Tooltip formatter={(value: number) => formatNumber(value)} />
                    <Bar dataKey="count" name="Stacks" fill={CHART_COLORS.amber} radius={[0, 6, 6, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Pricing Models" subtitle="How stacks are priced">
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="50%" height={240}>
                    <PieChart>
                      <Pie data={chartData.pricingPie} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value">
                        {chartData.pricingPie.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatNumber(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {chartData.pricingPie.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-2 text-sm">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-slate-600 truncate flex-1">{item.name}</span>
                        <span className="font-semibold text-slate-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopStacksTable stacks={data.topRated} title="Top Rated" subtitle="Highest average rating" />
              <TopStacksTable stacks={data.mostReviewed} title="Most Reviewed" subtitle="Most community feedback" />
              <TopStacksTable stacks={data.mostViewed} title="Most Viewed" subtitle="Highest page views" />
              <TopStacksTable stacks={data.mostSaved} title="Most Saved" subtitle="Most bookmarked by users" />
            </div>
          </TabsContent>

          {/* ═══ TAB: ACTIVITY ═══ */}
          <TabsContent value="activity" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard icon={Star} label="Reviews" value={data.overview.totalReviews} delta={data.overview.reviewsDelta} color="amber" />
              <MetricCard icon={MessageSquare} label="Comments" value={data.overview.totalComments} color="blue" />
              <MetricCard icon={Heart} label="Upvotes" value={data.overview.totalUpvotes} delta={data.overview.upvotesDelta} color="red" />
              <MetricCard icon={Bookmark} label="Saves" value={data.overview.totalSaves} color="green" />
            </div>

            <ChartCard title="Platform Activity" subtitle={`Reviews, comments, upvotes, and deal claims over ${period} days`}>
              <ResponsiveContainer width="100%" height={360}>
                <AreaChart data={data.platformActivity}>
                  <defs>
                    <linearGradient id="reviewActGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.amber} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.amber} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="commentActGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.blue} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.blue} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="upvoteActGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.green} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.green} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="dealClaimActGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.purple} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.purple} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="reviews" name="Reviews" stroke={CHART_COLORS.amber} fill="url(#reviewActGrad)" strokeWidth={2} dot={false} stackId="1" />
                  <Area type="monotone" dataKey="comments" name="Comments" stroke={CHART_COLORS.blue} fill="url(#commentActGrad)" strokeWidth={2} dot={false} stackId="1" />
                  <Area type="monotone" dataKey="upvotes" name="Upvotes" stroke={CHART_COLORS.green} fill="url(#upvoteActGrad)" strokeWidth={2} dot={false} stackId="1" />
                  <Area type="monotone" dataKey="dealClaims" name="Deal Claims" stroke={CHART_COLORS.purple} fill="url(#dealClaimActGrad)" strokeWidth={2} dot={false} stackId="1" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Review Submissions" subtitle={`Daily reviews over ${period} days`}>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.reviewGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Reviews" fill={CHART_COLORS.amber} radius={[4, 4, 0, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Rating Breakdown" subtitle="Distribution of review ratings">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.ratingDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="rating" tick={{ fontSize: 12, fill: "#64748B", fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}★`} />
                    <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value: number) => formatNumber(value)} />
                    <Bar dataKey="count" name="Reviews" radius={[6, 6, 0, 0]} barSize={40}>
                      {data.ratingDistribution.map((_, i) => {
                        const colors = [CHART_COLORS.red, CHART_COLORS.orange, CHART_COLORS.amber, CHART_COLORS.green, "#16A34A"];
                        return <Cell key={i} fill={colors[i] || CHART_COLORS.amber} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-20">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Analytics Data</h3>
          <p className="text-sm text-slate-500">Analytics will appear once the platform has activity.</p>
        </div>
      )}
    </div>
  );
}
