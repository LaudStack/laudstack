"use client";
export const dynamic = "force-dynamic";
/**
 * Admin Promotions — Tabbed Hub
 * Tabs: Overview | All Promotions | Stacks | Deals | Marketplace
 * Pricing & Plans and Deal of the Day remain as separate sidebar pages.
 */
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Megaphone, TrendingUp, DollarSign, Clock, CheckCircle,
  Zap, Star, Target, ArrowRight, RefreshCw,
  Calendar, ShoppingBag, Tag, Layers, Crown,
  Timer, Eye, Plus, ChevronLeft, ChevronRight, Search,
  Shield, Rocket, UserPlus,
} from "lucide-react";
import {
  getAdminPromotions,
  getAdminPromotionStatsByTarget,
  adminCreateManualPromotion,
} from "@/app/actions/promotions";
import { ALLOWED_DURATIONS } from "@/lib/promotion-constants";
import type { PromotionType, PromotionTarget } from "@/lib/promotion-constants";
import PromotionViewModal from "@/components/admin/PromotionViewModal";
import { toast } from "sonner";

/* ─── Shared Types ─────────────────────────────────────────── */

type PromoRow = Awaited<ReturnType<typeof getAdminPromotions>>["promotions"][number];
type PromoStats = Awaited<ReturnType<typeof getAdminPromotions>>["stats"];
type TargetStats = Awaited<ReturnType<typeof getAdminPromotionStatsByTarget>>;

/* ─── Shared Constants ─────────────────────────────────────── */

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  pending_payment: { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-400" },
  paid:            { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-400" },
  scheduled:       { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-400" },
  active:          { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-400" },
  expired:         { bg: "bg-slate-50",  text: "text-slate-500",  dot: "bg-slate-400" },
  cancelled:       { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-400" },
  failed:          { bg: "bg-red-50",    text: "text-red-600",    dot: "bg-red-400" },
  paused:          { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400" },
};

const TYPE_LABELS: Record<string, string> = {
  stack_featured:       "Stack Featured",
  stack_spotlight:      "Stack Spotlight",
  stack_category_boost: "Category Boost",
  deal_pinned:          "Deal Pinned",
  deal_featured:        "Deal Featured",
  deal_of_day:          "Deal of the Day",
  marketplace_boost:    "Marketplace Boost",
  marketplace_spotlight:"Marketplace Spotlight",
};

const TARGET_ICONS: Record<string, React.ElementType> = {
  stack: Layers,
  deal: Tag,
  marketplace: ShoppingBag,
};

const ALL_PROMO_TYPES: { value: PromotionType; label: string; target: PromotionTarget }[] = [
  { value: "stack_featured", label: "Stack Featured", target: "stack" },
  { value: "stack_spotlight", label: "Stack Spotlight", target: "stack" },
  { value: "stack_category_boost", label: "Stack Category Boost", target: "stack" },
  { value: "deal_pinned", label: "Deal Pinned", target: "deal" },
  { value: "deal_featured", label: "Deal Featured", target: "deal" },
  { value: "deal_of_day", label: "Deal of the Day", target: "deal" },
  { value: "marketplace_boost", label: "Marketplace Boost", target: "marketplace" },
  { value: "marketplace_spotlight", label: "Marketplace Spotlight", target: "marketplace" },
];

const STACK_TYPE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  stack_featured:       { label: "Featured", icon: Star, color: "text-amber-600" },
  stack_spotlight:      { label: "Spotlight", icon: Crown, color: "text-purple-600" },
  stack_category_boost: { label: "Category Boost", icon: TrendingUp, color: "text-blue-600" },
};

const DEAL_TYPE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  deal_pinned:   { label: "Pinned", icon: Target, color: "text-emerald-600" },
  deal_featured: { label: "Featured", icon: Star, color: "text-amber-600" },
  deal_of_day:   { label: "Deal of the Day", icon: Zap, color: "text-red-600" },
};

const MARKETPLACE_TYPE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  marketplace_boost:     { label: "Boost", icon: TrendingUp, color: "text-blue-600" },
  marketplace_spotlight: { label: "Spotlight", icon: Crown, color: "text-purple-600" },
};

function fmtCurrency(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function fmtDate(d: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.expired;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
}

/* ─── Tabs ─────────────────────────────────────────────────── */

type TabId = "overview" | "all" | "stacks" | "deals" | "marketplace";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: Megaphone },
  { id: "all", label: "All Promotions", icon: Megaphone },
  { id: "stacks", label: "Stacks", icon: Layers },
  { id: "deals", label: "Deals", icon: Tag },
  { id: "marketplace", label: "Marketplace", icon: ShoppingBag },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function AdminPromotionsHub() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-amber-500" />
            Promotions Center
          </h1>
          <p className="text-sm text-slate-600 mt-1">Manage all promotions, pricing, and Deal of the Day slots.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/ops-console/promotions/pricing"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <DollarSign className="w-4 h-4" /> Pricing
          </Link>
          <Link
            href="/ops-console/promotions/dotd"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <Calendar className="w-4 h-4" /> DOTD Calendar
          </Link>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-0 -mb-px">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${isActive
                    ? "border-amber-500 text-amber-700"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "all" && <AllPromotionsTab />}
      {activeTab === "stacks" && <TargetTab target="stack" typeLabels={STACK_TYPE_LABELS} accentColor="blue" entityLabel="Stack" />}
      {activeTab === "deals" && <TargetTab target="deal" typeLabels={DEAL_TYPE_LABELS} accentColor="emerald" entityLabel="Deal" />}
      {activeTab === "marketplace" && <TargetTab target="marketplace" typeLabels={MARKETPLACE_TYPE_LABELS} accentColor="purple" entityLabel="Product" />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 1: OVERVIEW
   ═══════════════════════════════════════════════════════════════ */

function OverviewTab() {
  const [stats, setStats] = useState<PromoStats | null>(null);
  const [targetStats, setTargetStats] = useState<TargetStats | null>(null);
  const [recentPromos, setRecentPromos] = useState<PromoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPromoId, setSelectedPromoId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [promoData, tStats] = await Promise.all([
        getAdminPromotions({ page: 1, status: "all", target: "all" }),
        getAdminPromotionStatsByTarget(),
      ]);
      setStats(promoData.stats);
      setRecentPromos(promoData.promotions);
      setTargetStats(tStats);
    } catch {
      toast.error("Failed to load promotion data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={CheckCircle} label="Active" value={String(stats.activeCount)} color="text-green-600" bg="bg-green-50" />
          <StatCard icon={DollarSign} label="Total Revenue" value={fmtCurrency(stats.totalRevenue)} color="text-blue-600" bg="bg-blue-50" />
          <StatCard icon={Clock} label="Pending" value={String(stats.pendingCount)} color="text-yellow-600" bg="bg-yellow-50" />
          <StatCard icon={Timer} label="Expired" value={String(stats.expiredCount)} color="text-slate-500" bg="bg-slate-50" />
        </div>
      )}

      {/* Per-Target Breakdown */}
      {targetStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TargetCard icon={Layers} label="Stacks" stats={targetStats.stack} color="text-blue-600" bg="bg-blue-50" />
          <TargetCard icon={Tag} label="Deals" stats={targetStats.deal} color="text-emerald-600" bg="bg-emerald-50" />
          <TargetCard icon={ShoppingBag} label="Marketplace" stats={targetStats.marketplace} color="text-purple-600" bg="bg-purple-50" />
        </div>
      )}

      {/* Recent Promotions */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Promotions</h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Entity</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Expires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPromos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No promotions yet</p>
                  </td>
                </tr>
              ) : (
                recentPromos.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => setSelectedPromoId(p.id)}>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">#{p.id}</td>
                    <td className="px-4 py-3"><span className="text-xs font-medium text-slate-700">{TYPE_LABELS[p.type] ?? p.type}</span></td>
                    <td className="px-4 py-3"><span className="text-xs text-slate-600">{p.entityName ?? `ID ${p.targetEntityId}`}</span></td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-700">{fmtCurrency(p.amountPaid)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(p.expiresAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPromoId && (
        <PromotionViewModal promotionId={selectedPromoId} onClose={() => setSelectedPromoId(null)} onRefresh={loadData} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 2: ALL PROMOTIONS
   ═══════════════════════════════════════════════════════════════ */

function AllPromotionsTab() {
  const [data, setData] = useState<{ promotions: PromoRow[]; total: number; stats: PromoStats } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [targetFilter, setTargetFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPromoId, setSelectedPromoId] = useState<number | null>(null);
  const [showManualAssign, setShowManualAssign] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminPromotions({ status: statusFilter, target: targetFilter, page, search: searchQuery || undefined });
      setData(res);
    } catch {
      toast.error("Failed to load promotions");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, targetFilter, page, searchQuery]);

  useEffect(() => { load(); }, [load]);

  const totalPages = data ? Math.ceil(data.total / 20) : 0;

  return (
    <div className="space-y-5">
      {/* Stats Row */}
      {data?.stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <MiniStat label="Total" value={data.stats.total} icon={Megaphone} />
          <MiniStat label="Active" value={data.stats.activeCount} icon={CheckCircle} color="text-green-600" />
          <MiniStat label="Pending" value={data.stats.pendingCount} icon={Clock} color="text-yellow-600" />
          <MiniStat label="Expired" value={data.stats.expiredCount} icon={Timer} color="text-slate-500" />
          <MiniStat label="Revenue" value={fmtCurrency(data.stats.totalRevenue)} icon={DollarSign} color="text-blue-600" />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="Search by entity name..."
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/30 w-64"
          />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/30">
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="scheduled">Scheduled</option>
          <option value="pending_payment">Pending Payment</option>
          <option value="paused">Paused</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
          <option value="failed">Failed</option>
        </select>
        <select value={targetFilter} onChange={e => { setTargetFilter(e.target.value); setPage(1); }} className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/30">
          <option value="all">All Targets</option>
          <option value="stack">Stacks</option>
          <option value="deal">Deals</option>
          <option value="marketplace">Marketplace</option>
        </select>
        <button onClick={load} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
        <div className="flex-1" />
        <button onClick={() => setShowManualAssign(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Manual Assign
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400"><RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2" />Loading promotions...</div>
      ) : !data?.promotions.length ? (
        <div className="text-center py-12 text-slate-400"><Megaphone className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No promotions found</p></div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Entity</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Duration</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Expires</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.promotions.map(row => {
                const TargetIcon = TARGET_ICONS[row.target] ?? Megaphone;
                return (
                  <tr key={row.id} className="hover:bg-slate-50/50 cursor-pointer transition-colors" onClick={() => setSelectedPromoId(row.id)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <TargetIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900 truncate max-w-[180px]">{row.entityName ?? `ID ${row.targetEntityId}`}</p>
                          <p className="text-[11px] text-slate-400 capitalize">{row.target}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs font-medium text-slate-600">{TYPE_LABELS[row.type] ?? row.type}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {row.userAvatar ? (
                          <img src={row.userAvatar} alt="" className="w-6 h-6 rounded-full" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            {(row.userName ?? "?")[0]?.toUpperCase()}
                          </div>
                        )}
                        <span className="text-slate-700 truncate max-w-[100px]">{row.userName ?? "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {row.amountPaid > 0 ? fmtCurrency(row.amountPaid) : <span className="text-xs text-purple-600 font-semibold">FREE</span>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                    <td className="px-4 py-3 text-slate-600">{row.durationDays}d</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{fmtDate(row.expiresAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-slate-400 hover:text-slate-600" onClick={e => { e.stopPropagation(); setSelectedPromoId(row.id); }}>
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
              <span className="text-xs text-slate-500">Page {page} of {totalPages} ({data.total} total)</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedPromoId && <PromotionViewModal promotionId={selectedPromoId} onClose={() => setSelectedPromoId(null)} onRefresh={load} />}
      {showManualAssign && <ManualAssignModal onClose={() => setShowManualAssign(false)} onSuccess={load} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TABS 3-5: TARGET-SPECIFIC (Stacks / Deals / Marketplace)
   ═══════════════════════════════════════════════════════════════ */

function TargetTab({
  target,
  typeLabels,
  accentColor,
  entityLabel,
}: {
  target: "stack" | "deal" | "marketplace";
  typeLabels: Record<string, { label: string; icon: any; color: string }>;
  accentColor: string;
  entityLabel: string;
}) {
  const [data, setData] = useState<{ promotions: PromoRow[]; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedPromoId, setSelectedPromoId] = useState<number | null>(null);
  const [showManual, setShowManual] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminPromotions({ status: statusFilter, target, page, type: typeFilter !== "all" ? typeFilter : undefined });
      setData(res);
    } catch {
      toast.error(`Failed to load ${target} promotions`);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, page, target]);

  useEffect(() => { load(); }, [load]);

  const totalPages = data ? Math.ceil(data.total / 20) : 0;

  const activeByType: Record<string, number> = {};
  if (data) {
    data.promotions.filter(p => p.status === "active").forEach(p => {
      activeByType[p.type] = (activeByType[p.type] ?? 0) + 1;
    });
  }

  const typeEntries = Object.entries(typeLabels);

  return (
    <div className="space-y-5">
      {/* Type Quick Stats */}
      <div className={`grid gap-4 ${typeEntries.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
        {typeEntries.map(([key, info]) => {
          const Icon = info.icon;
          return (
            <div key={key} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-slate-50 ${info.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{info.label}</p>
                <p className="text-lg font-bold text-slate-900">{activeByType[key] ?? 0} active</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className={`text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-${accentColor}-400/30`}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="scheduled">Scheduled</option>
          <option value="pending_payment">Pending</option>
          <option value="paused">Paused</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} className={`text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-${accentColor}-400/30`}>
          <option value="all">All Types</option>
          {typeEntries.map(([key, info]) => (
            <option key={key} value={key}>{info.label}</option>
          ))}
        </select>
        <button onClick={load} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
        <div className="flex-1" />
        <button onClick={() => setShowManual(true)} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-${accentColor}-500 hover:bg-${accentColor}-600 rounded-lg transition-colors`}>
          <Plus className="w-4 h-4" /> Assign
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400"><RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2" />Loading...</div>
      ) : !data?.promotions.length ? (
        <div className="text-center py-12 text-slate-400">
          {target === "stack" && <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />}
          {target === "deal" && <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />}
          {target === "marketplace" && <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />}
          <p>No {target} promotions found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{entityLabel}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Duration</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Expires</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.promotions.map(row => {
                const tInfo = typeLabels[row.type];
                const TIcon = tInfo?.icon ?? Star;
                return (
                  <tr key={row.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => setSelectedPromoId(row.id)}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 truncate max-w-[200px]">{row.entityName ?? `${entityLabel} #${row.targetEntityId}`}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <TIcon className={`w-3.5 h-3.5 ${tInfo?.color ?? "text-slate-500"}`} />
                        <span className="text-xs font-medium text-slate-600">{tInfo?.label ?? row.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {row.amountPaid > 0 ? fmtCurrency(row.amountPaid) : <span className="text-xs text-purple-600 font-semibold">FREE</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.durationDays}d</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(row.expiresAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-slate-400 hover:text-slate-600" onClick={e => { e.stopPropagation(); setSelectedPromoId(row.id); }}>
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
              <span className="text-xs text-slate-500">Page {page} of {totalPages} ({data.total} total)</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedPromoId && <PromotionViewModal promotionId={selectedPromoId} onClose={() => setSelectedPromoId(null)} onRefresh={load} />}
      {showManual && <TargetManualAssignModal target={target} typeLabels={typeLabels} accentColor={accentColor} entityLabel={entityLabel} onClose={() => setShowManual(false)} onSuccess={load} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MODALS
   ═══════════════════════════════════════════════════════════════ */

function ManualAssignModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    type: "stack_featured" as PromotionType,
    target: "stack" as PromotionTarget,
    targetEntityId: "",
    durationDays: "7",
    notes: "",
    slotDate: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const allowedDurations = ALLOWED_DURATIONS[form.type] ?? [3, 7, 14, 30];

  const handleTypeChange = (type: PromotionType) => {
    const info = ALL_PROMO_TYPES.find(t => t.value === type);
    const newAllowed = ALLOWED_DURATIONS[type] ?? [3, 7, 14, 30];
    const currentDays = parseInt(form.durationDays);
    const newDuration = newAllowed.includes(currentDays) ? String(currentDays) : String(newAllowed[0]);
    setForm(f => ({ ...f, type, target: info?.target ?? f.target, durationDays: newDuration }));
  };

  const handleSubmit = async () => {
    if (!form.targetEntityId) { toast.error("Entity ID is required"); return; }
    const days = parseInt(form.durationDays);
    if (isNaN(days) || !allowedDurations.includes(days)) { toast.error(`Duration must be one of: ${allowedDurations.join(", ")} days`); return; }
    setSubmitting(true);
    try {
      await adminCreateManualPromotion({
        type: form.type,
        target: form.target,
        targetEntityId: parseInt(form.targetEntityId),
        durationDays: days,
        notes: form.notes || undefined,
        slotDate: form.type === "deal_of_day" && form.slotDate ? form.slotDate : undefined,
      });
      toast.success("Manual promotion created and activated");
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Failed to create promotion");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              Manual Promotion Assignment
            </h3>
            <p className="text-xs text-slate-500 mt-1">Grant a free promotion to any entity. No payment required.</p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Promotion Type</label>
              <select value={form.type} onChange={e => handleTypeChange(e.target.value as PromotionType)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/30">
                {ALL_PROMO_TYPES.map(t => (<option key={t.value} value={t.value}>{t.label} ({t.target})</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Entity ID ({form.target})</label>
              <input type="number" value={form.targetEntityId} onChange={e => setForm(f => ({ ...f, targetEntityId: e.target.value }))} placeholder={`Enter ${form.target} ID`} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400/30" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Duration</label>
              <select value={form.durationDays} onChange={e => setForm(f => ({ ...f, durationDays: e.target.value }))} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/30">
                {allowedDurations.map(d => (<option key={d} value={String(d)}>{d} {d === 1 ? "day" : "days"}</option>))}
              </select>
            </div>
            {form.type === "deal_of_day" && (
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Slot Date (YYYY-MM-DD)</label>
                <input type="date" value={form.slotDate} onChange={e => setForm(f => ({ ...f, slotDate: e.target.value }))} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400/30" />
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Admin Notes (optional)</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Reason for manual assignment..." className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400/30 resize-none" />
            </div>
          </div>
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
            <button onClick={handleSubmit} disabled={submitting} className="px-5 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors disabled:opacity-50">
              {submitting ? "Creating..." : "Create Promotion"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function TargetManualAssignModal({
  target,
  typeLabels,
  accentColor,
  entityLabel,
  onClose,
  onSuccess,
}: {
  target: "stack" | "deal" | "marketplace";
  typeLabels: Record<string, { label: string; icon: any; color: string }>;
  accentColor: string;
  entityLabel: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const typeKeys = Object.keys(typeLabels);
  const [form, setForm] = useState({
    type: typeKeys[0] as PromotionType,
    targetEntityId: "",
    durationDays: "7",
    notes: "",
    slotDate: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const allowedDurations = ALLOWED_DURATIONS[form.type] ?? [3, 7, 14, 30];

  const handleTypeChange = (type: PromotionType) => {
    const newAllowed = ALLOWED_DURATIONS[type] ?? [3, 7, 14, 30];
    const currentDays = parseInt(form.durationDays);
    const newDuration = newAllowed.includes(currentDays) ? String(currentDays) : String(newAllowed[0]);
    setForm(f => ({ ...f, type, durationDays: newDuration }));
  };

  const handleSubmit = async () => {
    if (!form.targetEntityId) { toast.error(`${entityLabel} ID is required`); return; }
    const days = parseInt(form.durationDays);
    if (isNaN(days) || !allowedDurations.includes(days)) { toast.error(`Duration must be one of: ${allowedDurations.join(", ")} days`); return; }
    setSubmitting(true);
    try {
      await adminCreateManualPromotion({
        type: form.type,
        target,
        targetEntityId: parseInt(form.targetEntityId),
        durationDays: days,
        notes: form.notes || undefined,
        slotDate: form.type === "deal_of_day" && form.slotDate ? form.slotDate : undefined,
      });
      toast.success(`${entityLabel} promotion created`);
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Failed to create promotion");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shield className={`w-5 h-5 text-${accentColor}-500`} />
              Assign {entityLabel} Promotion
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Type</label>
              <select value={form.type} onChange={e => handleTypeChange(e.target.value as PromotionType)} className={`w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-${accentColor}-400/30`}>
                {typeKeys.map(key => (<option key={key} value={key}>{typeLabels[key].label}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">{entityLabel} ID</label>
              <input type="number" value={form.targetEntityId} onChange={e => setForm(f => ({ ...f, targetEntityId: e.target.value }))} placeholder={`Enter ${entityLabel.toLowerCase()} ID`} className={`w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-${accentColor}-400/30`} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Duration</label>
              <select value={form.durationDays} onChange={e => setForm(f => ({ ...f, durationDays: e.target.value }))} className={`w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-${accentColor}-400/30`}>
                {allowedDurations.map(d => (<option key={d} value={String(d)}>{d} {d === 1 ? "day" : "days"}</option>))}
              </select>
            </div>
            {form.type === "deal_of_day" && (
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Slot Date</label>
                <input type="date" value={form.slotDate} onChange={e => setForm(f => ({ ...f, slotDate: e.target.value }))} className={`w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-${accentColor}-400/30`} />
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Notes (optional)</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className={`w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-${accentColor}-400/30 resize-none`} />
            </div>
          </div>
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
            <button onClick={handleSubmit} disabled={submitting} className={`px-5 py-2 text-sm font-semibold text-white bg-${accentColor}-500 hover:bg-${accentColor}-600 rounded-lg transition-colors disabled:opacity-50`}>
              {submitting ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function StatCard({ icon: Icon, label, value, color, bg }: { icon: any; label: string; value: string; color: string; bg: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${bg} ${color}`}><Icon className="w-5 h-5" /></div>
        <div>
          <p className="text-xs text-slate-600 font-medium">{label}</p>
          <p className="text-xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function TargetCard({ icon: Icon, label, stats, color, bg }: { icon: any; label: string; stats: { active: number; total: number; revenue: number }; color: string; bg: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-2 rounded-lg ${bg} ${color}`}><Icon className="w-5 h-5" /></div>
        <h3 className="text-sm font-bold text-slate-800">{label}</h3>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-[11px] text-slate-400 font-medium">Active</p>
          <p className="text-lg font-bold text-green-600">{stats.active}</p>
        </div>
        <div>
          <p className="text-[11px] text-slate-400 font-medium">Total</p>
          <p className="text-lg font-bold text-slate-700">{stats.total}</p>
        </div>
        <div>
          <p className="text-[11px] text-slate-400 font-medium">Revenue</p>
          <p className="text-lg font-bold text-blue-600">{fmtCurrency(stats.revenue)}</p>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, icon: Icon, color = "text-slate-700" }: { label: string; value: string | number; icon: any; color?: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 px-4 py-3 flex items-center gap-3">
      <Icon className={`w-4 h-4 ${color}`} />
      <div>
        <p className="text-[11px] text-slate-400 font-medium">{label}</p>
        <p className={`text-lg font-bold ${color}`}>{value}</p>
      </div>
    </div>
  );
}
