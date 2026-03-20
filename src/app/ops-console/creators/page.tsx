"use client";
export const dynamic = "force-dynamic";

/**
 * Admin Creators — Marketplace Creator Management
 * View all creators, filter by status, search, manage via modal
 */

import { useState, useEffect, useCallback } from "react";
import {
  Search, Users, Store, DollarSign, CreditCard,
  ChevronLeft, ChevronRight, Loader2, RefreshCw,
  CheckCircle, Clock, Ban, Package, ShoppingCart,
  AlertTriangle, Eye,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAdminCreators,
  getAdminCreatorStats,
} from "@/app/actions/admin-creators";
import CreatorViewModal from "@/components/admin/CreatorViewModal";

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
      <div className="text-xs text-slate-600 font-medium mt-0.5">{label}</div>
    </div>
  );
}

// ─── Status Badge ───────────────────────────────────────────────────────────
function CreatorStatusBadge({ creator }: { creator: any }) {
  if (creator.isSuspended) {
    return (
      <span className="text-xs font-bold px-2 py-0.5 rounded-full border bg-red-100 text-red-700 border-red-200 flex items-center gap-1">
        <Ban className="w-3 h-3" /> Suspended
      </span>
    );
  }
  if (!creator.stripeConnectOnboarded) {
    return (
      <span className="text-xs font-bold px-2 py-0.5 rounded-full border bg-amber-100 text-amber-700 border-amber-200 flex items-center gap-1">
        <Clock className="w-3 h-3" /> Pending Stripe
      </span>
    );
  }
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full border bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
      <CheckCircle className="w-3 h-3" /> Active
    </span>
  );
}

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

// ─── Filter Tabs ────────────────────────────────────────────────────────────
const STATUS_TABS = [
  { value: "all", label: "All Creators" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "pending_stripe", label: "Pending Stripe" },
];

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function AdminCreatorsPage() {
  const [creators, setCreators] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedCreator, setSelectedCreator] = useState<any | null>(null);
  const limit = 20;

  const loadCreators = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminCreators({
        search: search || undefined,
        status: statusFilter as any,
        page,
        limit,
      });
      setCreators(res.creators);
      setTotal(res.total);
    } catch {
      toast.error("Failed to load creators");
    }
    setLoading(false);
  }, [search, statusFilter, page]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await getAdminCreatorStats();
      setStats(res);
    } catch {
      toast.error("Failed to load creator stats");
    }
    setStatsLoading(false);
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadCreators(); }, [loadCreators]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadCreators();
  };

  const handleRefresh = () => {
    loadCreators();
    loadStats();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Creators</h1>
          <p className="text-sm text-slate-600 mt-1">Manage marketplace creators, view listings, revenue, and moderation actions.</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:border-slate-300 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={<Users className="w-4 h-4" />} label="Total Creators" value={stats.totalCreators} accent="purple" />
          <StatCard icon={<CheckCircle className="w-4 h-4" />} label="Active" value={stats.activeCreators} accent="green" />
          <StatCard icon={<Ban className="w-4 h-4" />} label="Suspended" value={stats.suspendedCreators} accent="red" />
          <StatCard icon={<CreditCard className="w-4 h-4" />} label="Pending Stripe" value={stats.pendingStripeCreators} accent="amber" />
          <StatCard icon={<DollarSign className="w-4 h-4" />} label="Total Creator Revenue" value={formatCents(stats.totalCreatorRevenue)} accent="blue" />
        </div>
      )}

      {/* Filter Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => { setStatusFilter(tab.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === tab.value
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
          />
        </form>
      </div>

      {/* Creators Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
            <p className="text-sm text-slate-500">Loading creators...</p>
          </div>
        ) : creators.length === 0 ? (
          <div className="text-center py-20">
            <Store className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600 font-medium">No creators found.</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">Creator</th>
                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">Status</th>
                    <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">Listings</th>
                    <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">Sales</th>
                    <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">Revenue</th>
                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">Stripe</th>
                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">Activated</th>
                    <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {creators.map((c) => {
                    const displayName = c.name || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "Anonymous";
                    return (
                      <tr
                        key={c.id}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer"
                        onClick={() => setSelectedCreator(c)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {c.avatarUrl ? (
                              <img src={c.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-black flex-shrink-0">
                                {displayName[0]?.toUpperCase() || "C"}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                              <p className="text-xs text-slate-400 truncate">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <CreatorStatusBadge creator={c} />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Package className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-sm font-bold text-slate-900">{c.productCount}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <ShoppingCart className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-sm font-bold text-slate-900">{c.totalOrders}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-bold text-green-600">{formatCents(c.totalRevenue)}</span>
                        </td>
                        <td className="py-3 px-4">
                          {c.stripeConnectOnboarded ? (
                            <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                              <CheckCircle className="w-3.5 h-3.5" /> Connected
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                              <Clock className="w-3.5 h-3.5" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500">
                          {c.creatorActivatedAt
                            ? new Date(c.creatorActivatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : "—"
                          }
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedCreator(c); }}
                            className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition-all mx-auto"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Page {page} of {totalPages} ({total} total)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg disabled:opacity-40"
                  >
                    <ChevronLeft className="w-3 h-3" /> Prev
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg disabled:opacity-40"
                  >
                    Next <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Creator View Modal */}
      {selectedCreator && (
        <CreatorViewModal
          creator={selectedCreator}
          onClose={() => setSelectedCreator(null)}
          onRefresh={() => { loadCreators(); loadStats(); }}
        />
      )}
    </div>
  );
}
