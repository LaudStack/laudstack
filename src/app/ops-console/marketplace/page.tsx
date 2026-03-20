"use client";
export const dynamic = "force-dynamic";
/*
 * LaudStack Admin — Marketplace Management
 * Moderation queue, product management, orders/revenue dashboard, creator oversight
 * Design: Matches existing admin panel patterns (deals, submissions)
 */
import { useState, useEffect, useCallback } from "react";
import {
  Store, Package, CheckCircle, XCircle, Eye, Edit3,
  Loader2, Filter, ChevronDown, DollarSign, Users,
  Star, AlertTriangle, Clock, TrendingUp, BarChart3,
  ExternalLink, Shield, Sparkles, Tag, Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  adminGetProducts,
  adminApproveProduct,
  adminRejectProduct,
  adminToggleFeatured,
  adminGetOrders,
  adminGetCreators,
  adminGetRevenueSummary,
} from "@/app/actions/marketplace";

// ─── Types ─────────────────────────────────────────────────────────────────
type Product = {
  id: number;
  name: string;
  slug: string;
  category: string;
  status: string;
  priceCents: number;
  isFeatured: boolean;
  createdAt: Date;
  reviewNotes: string | null;
  reviewedAt: Date | null;
  creatorId: number;
  creatorName: string | null;
  creatorEmail: string | null;
  thumbnailUrl: string | null;
  totalSales: number;
  totalRevenue: number;
};

type Order = {
  order: {
    id: number;
    amount: number;
    platformFee: number;
    creatorPayout: number;
    status: string;
    createdAt: Date;
    stripeSessionId: string | null;
  };
  product: { id: number; name: string; slug: string };
  buyer: { id: number; name: string | null; email: string | null };
};

type Creator = {
  id: number;
  name: string | null;
  email: string | null;
  isMarketplaceCreator: boolean;
  stripeConnectAccountId: string | null;
  creatorActivatedAt: Date | null;
};

type Revenue = {
  totalRevenue: number;
  totalFees: number;
  totalPayouts: number;
  orderCount: number;
  totalProducts: number;
  totalCreators: number;
};

type Tab = "moderation" | "products" | "orders" | "creators";

// ─── Status badge ──────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    pending: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", icon: <Clock className="w-3 h-3" /> },
    approved: { bg: "bg-green-50 border-green-200", text: "text-green-700", icon: <CheckCircle className="w-3 h-3" /> },
    rejected: { bg: "bg-red-50 border-red-200", text: "text-red-700", icon: <XCircle className="w-3 h-3" /> },
    paused: { bg: "bg-gray-50 border-gray-200", text: "text-gray-600", icon: <AlertTriangle className="w-3 h-3" /> },
    draft: { bg: "bg-slate-50 border-slate-200", text: "text-slate-600", icon: <Edit3 className="w-3 h-3" /> },
    completed: { bg: "bg-green-50 border-green-200", text: "text-green-700", icon: <CheckCircle className="w-3 h-3" /> },
    refunded: { bg: "bg-red-50 border-red-200", text: "text-red-700", icon: <XCircle className="w-3 h-3" /> },
  };
  const s = map[status] || map.draft;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${s.bg} ${s.text}`}>
      {s.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Stat card ─────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string | number; icon: React.ElementType; accent: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[13px] text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

// ─── Moderation Tab ────────────────────────────────────────────────────────
function ModerationTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");

  const fetchPending = useCallback(async () => {
    setLoading(true);
    const res = await adminGetProducts({ status: "pending" });
    if (res.success && "products" in res) {
      setProducts(res.products as Product[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    const res = await adminApproveProduct(id);
    if (res.success) {
      toast.success("Product approved");
      setProducts(prev => prev.filter(p => p.id !== id));
    } else {
      toast.error(res.error || "Failed to approve");
    }
    setActionLoading(null);
  };

  const handleReject = async () => {
    if (!rejectId || !rejectNotes.trim()) {
      toast.error("Please provide rejection notes");
      return;
    }
    setActionLoading(rejectId);
    const res = await adminRejectProduct(rejectId, rejectNotes.trim());
    if (res.success) {
      toast.success("Product rejected");
      setProducts(prev => prev.filter(p => p.id !== rejectId));
      setRejectId(null);
      setRejectNotes("");
    } else {
      toast.error(res.error || "Failed to reject");
    }
    setActionLoading(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900">All caught up!</h3>
        <p className="text-sm text-gray-500 mt-1">No products pending review</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 font-medium">{products.length} product{products.length !== 1 ? "s" : ""} pending review</p>
      {products.map(p => (
        <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
          {/* Thumbnail */}
          <div className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {p.thumbnailUrl ? (
              <img src={p.thumbnailUrl} alt={p.name} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-6 h-6 text-gray-400" />
            )}
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900 truncate">{p.name}</h4>
              <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                {p.category.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              by {p.creatorName || p.creatorEmail || "Unknown"} · ${(p.priceCents / 100).toFixed(2)}
            </p>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => handleApprove(p.id)}
              disabled={actionLoading === p.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
            >
              {actionLoading === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              Approve
            </button>
            <button
              onClick={() => setRejectId(p.id)}
              disabled={actionLoading === p.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" /> Reject
            </button>
          </div>
        </div>
      ))}

      {/* Reject modal */}
      {rejectId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reject Product</h3>
            <p className="text-sm text-gray-500 mb-4">Provide a reason for rejection. This will be visible to the creator.</p>
            <textarea
              value={rejectNotes}
              onChange={e => setRejectNotes(e.target.value)}
              placeholder="Reason for rejection..."
              rows={4}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => { setRejectId(null); setRejectNotes(""); }}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectNotes.trim() || actionLoading === rejectId}
                className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {actionLoading === rejectId ? "Rejecting..." : "Reject Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Products Tab ──────────────────────────────────────────────────────────
function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const limit = 20;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const res = await adminGetProducts({ status: statusFilter, page, limit });
    if (res.success && "products" in res) {
      setProducts(res.products as Product[]);
      setTotal(res.total);
    }
    setLoading(false);
  }, [statusFilter, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleToggleFeatured = async (id: number) => {
    setActionLoading(id);
    const res = await adminToggleFeatured(id);
    if (res.success) {
      toast.success(res.isFeatured ? "Product featured" : "Feature removed");
      setProducts(prev => prev.map(p => p.id === id ? { ...p, isFeatured: !p.isFeatured } : p));
    } else {
      toast.error(res.error || "Failed to update");
    }
    setActionLoading(null);
  };

  const statuses = ["all", "draft", "pending", "approved", "rejected", "paused"];
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
              statusFilter === s
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No products found</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Creator</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Price</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Sales</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {p.thumbnailUrl ? (
                            <img src={p.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{p.name}</p>
                          {p.isFeatured && (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">FEATURED</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 truncate max-w-[140px]">{p.creatorName || p.creatorEmail || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                        {p.category.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">${(p.priceCents / 100).toFixed(2)}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-gray-600">{p.totalSales}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleFeatured(p.id)}
                          disabled={actionLoading === p.id}
                          title={p.isFeatured ? "Remove feature" : "Feature product"}
                          className={`p-1.5 rounded-lg transition ${
                            p.isFeatured
                              ? "text-amber-600 bg-amber-50 hover:bg-amber-100"
                              : "text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                          } disabled:opacity-50`}
                        >
                          {actionLoading === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        </button>
                        <a
                          href={`/marketplace/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                          title="View product"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">{total} product{total !== 1 ? "s" : ""} total</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Orders Tab ────────────────────────────────────────────────────────────
function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [revenue, setRevenue] = useState<Revenue | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const [ordersRes, revenueRes] = await Promise.all([
      adminGetOrders(page, limit),
      adminGetRevenueSummary(),
    ]);
    if (ordersRes.success && "orders" in ordersRes) {
      setOrders(ordersRes.orders as Order[]);
      setTotal(ordersRes.total);
    }
    if (revenueRes.success && "revenue" in revenueRes) {
      setRevenue(revenueRes.revenue as Revenue);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const totalPages = Math.ceil(total / limit);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      {/* Revenue stats */}
      {revenue && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Revenue" value={`$${(revenue.totalRevenue / 100).toFixed(2)}`} icon={DollarSign} accent="bg-green-50 text-green-600" />
          <StatCard label="Platform Fees (12%)" value={`$${(revenue.totalFees / 100).toFixed(2)}`} icon={TrendingUp} accent="bg-amber-50 text-amber-600" />
          <StatCard label="Creator Payouts" value={`$${(revenue.totalPayouts / 100).toFixed(2)}`} icon={Users} accent="bg-blue-50 text-blue-600" />
          <StatCard label="Total Orders" value={revenue.orderCount} icon={Package} accent="bg-purple-50 text-purple-600" />
        </div>
      )}

      {/* Orders table */}
      {orders.length === 0 ? (
        <div className="text-center py-20">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No orders yet</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Order #</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Buyer</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Fee</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Payout</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.order.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono text-gray-500">#{o.order.id}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 truncate max-w-[180px]">{o.product.name}</td>
                    <td className="px-4 py-3 text-gray-600 truncate max-w-[140px]">{o.buyer.name || o.buyer.email || "—"}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">${(o.order.amount / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-amber-600 font-medium">${(o.order.platformFee / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">${(o.order.creatorPayout / 100).toFixed(2)}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.order.status} /></td>
                    <td className="px-4 py-3 text-gray-500 text-[13px]">
                      {new Date(o.order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">{total} order{total !== 1 ? "s" : ""} total</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Creators Tab ──────────────────────────────────────────────────────────
function CreatorsTab() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchCreators = useCallback(async () => {
    setLoading(true);
    const res = await adminGetCreators(page, limit);
    if (res.success) {
      setCreators(res.creators as Creator[]);
      setTotal(res.total);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchCreators(); }, [fetchCreators]);

  const totalPages = Math.ceil(total / limit);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      {creators.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No marketplace creators yet</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Creator</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Stripe Connect</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Activated</th>
                </tr>
              </thead>
              <tbody>
                {creators.map(c => (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-semibold text-gray-900">{c.name || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{c.email || "—"}</td>
                    <td className="px-4 py-3">
                      {c.stripeConnectAccountId ? (
                        <span className="inline-flex items-center gap-1 text-green-600 text-[12px] font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" /> Connected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-400 text-[12px] font-semibold">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-[13px]">
                      {c.creatorActivatedAt
                        ? new Date(c.creatorActivatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">{total} creator{total !== 1 ? "s" : ""} total</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "moderation", label: "Moderation Queue", icon: Shield },
  { id: "products", label: "All Products", icon: Package },
  { id: "orders", label: "Orders & Revenue", icon: DollarSign },
  { id: "creators", label: "Creators", icon: Users },
];

export default function AdminMarketplacePage() {
  const [activeTab, setActiveTab] = useState<Tab>("moderation");

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Store className="w-6 h-6 text-amber-600" />
          <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
        </div>
        <p className="text-sm text-gray-500">Manage products, orders, creators, and revenue</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
                active
                  ? "border-amber-500 text-amber-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "moderation" && <ModerationTab />}
      {activeTab === "products" && <ProductsTab />}
      {activeTab === "orders" && <OrdersTab />}
      {activeTab === "creators" && <CreatorsTab />}
    </div>
  );
}
