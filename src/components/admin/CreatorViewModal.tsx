"use client";
/**
 * CreatorViewModal — Full-featured admin creator management modal
 *
 * Slide-in panel with 5 tabs:
 *  1. Overview   — Profile, creator status, Stripe Connect, activation date
 *  2. Listings   — All marketplace products with status & revenue
 *  3. Revenue    — Orders, total revenue, platform fees, payouts
 *  4. Activity   — Recent offers, reviews received
 *  5. Moderation — Suspend / Reactivate / Revoke actions
 */
import { useState, useEffect, useCallback } from "react";
import {
  X, User, Store, DollarSign, Activity, Shield,
  ExternalLink, Calendar, Hash, Globe, Mail, Loader2,
  CheckCircle, XCircle, AlertTriangle, RefreshCw, Ban,
  Package, Star, TrendingUp, Clock, CreditCard, Zap,
  Eye, Pause, Play, Trash2, ShoppingCart, BarChart3,
  Link2,
} from "lucide-react";
import {
  getAdminCreatorDetails,
  adminSuspendCreator,
  adminReactivateCreator,
  adminRevokeCreator,
} from "@/app/actions/admin-creators";
import { toast } from "sonner";

type CreatorSummary = {
  id: number;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  avatarUrl: string | null;
  creatorActivatedAt: Date | null;
  stripeConnectAccountId: string | null;
  stripeConnectOnboarded: boolean;
  createdAt: Date;
  lastSignedIn: Date;
  productCount: number;
  totalRevenue: number;
  totalOrders: number;
  isSuspended: boolean;
};

type TabId = "overview" | "listings" | "revenue" | "activity" | "moderation";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <User className="w-4 h-4" /> },
  { id: "listings", label: "Listings", icon: <Package className="w-4 h-4" /> },
  { id: "revenue", label: "Revenue", icon: <DollarSign className="w-4 h-4" /> },
  { id: "activity", label: "Activity", icon: <Activity className="w-4 h-4" /> },
  { id: "moderation", label: "Moderation", icon: <Shield className="w-4 h-4" /> },
];

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(d: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function formatDateTime(d: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-green-100 text-green-700 border-green-200",
    published: "bg-green-100 text-green-700 border-green-200",
    suspended: "bg-red-100 text-red-700 border-red-200",
    draft: "bg-slate-100 text-slate-600 border-slate-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    pending_review: "bg-amber-100 text-amber-700 border-amber-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
    completed: "bg-green-100 text-green-700 border-green-200",
    refunded: "bg-orange-100 text-orange-700 border-orange-200",
  };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border capitalize ${map[status] ?? "bg-slate-100 text-slate-500 border-slate-200"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ─── Stat Mini Card ───────────────────────────────────────────────────────────
function MiniStat({ icon, label, value, accent }: {
  icon: React.ReactNode; label: string; value: string | number;
  accent: "green" | "blue" | "amber" | "purple" | "red" | "slate";
}) {
  const bg: Record<string, string> = {
    green: "bg-green-50 border-green-200", blue: "bg-blue-50 border-blue-200",
    amber: "bg-amber-50 border-amber-200", purple: "bg-purple-50 border-purple-200",
    red: "bg-red-50 border-red-200", slate: "bg-slate-50 border-slate-200",
  };
  const iconBg: Record<string, string> = {
    green: "bg-green-100 text-green-600", blue: "bg-blue-100 text-blue-600",
    amber: "bg-amber-100 text-amber-600", purple: "bg-purple-100 text-purple-600",
    red: "bg-red-100 text-red-600", slate: "bg-slate-100 text-slate-600",
  };
  return (
    <div className={`border rounded-xl p-3 ${bg[accent]}`}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${iconBg[accent]}`}>
        {icon}
      </div>
      <div className="text-lg font-black text-slate-900">{value}</div>
      <div className="text-xs text-slate-500 font-medium">{label}</div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function CreatorViewModal({
  creator: creatorSummary,
  onClose,
  onRefresh,
}: {
  creator: CreatorSummary;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"suspend" | "reactivate" | "revoke" | null>(null);

  const displayName = creatorSummary.name
    || `${creatorSummary.firstName ?? ""} ${creatorSummary.lastName ?? ""}`.trim()
    || "Anonymous";

  const loadDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminCreatorDetails(creatorSummary.id);
      if ("error" in res) {
        toast.error(res.error as string);
      } else {
        setDetails(res);
      }
    } catch {
      toast.error("Failed to load creator details");
    }
    setLoading(false);
  }, [creatorSummary.id]);

  useEffect(() => { loadDetails(); }, [loadDetails]);

  // ─── Moderation Actions ───────────────────────────────────────────────
  const handleSuspend = async () => {
    setActionLoading(true);
    try {
      const res = await adminSuspendCreator(creatorSummary.id);
      if (res.success) {
        toast.success("Creator suspended. All listings set to draft.");
        onRefresh();
        loadDetails();
      } else {
        toast.error(res.error || "Failed to suspend creator");
      }
    } catch { toast.error("Failed to suspend creator"); }
    setActionLoading(false);
    setConfirmAction(null);
  };

  const handleReactivate = async () => {
    setActionLoading(true);
    try {
      const res = await adminReactivateCreator(creatorSummary.id);
      if (res.success) {
        toast.success("Creator reactivated.");
        onRefresh();
        loadDetails();
      } else {
        toast.error(res.error || "Failed to reactivate creator");
      }
    } catch { toast.error("Failed to reactivate creator"); }
    setActionLoading(false);
    setConfirmAction(null);
  };

  const handleRevoke = async () => {
    setActionLoading(true);
    try {
      const res = await adminRevokeCreator(creatorSummary.id);
      if (res.success) {
        toast.success("Creator status permanently revoked.");
        onRefresh();
        onClose();
      } else {
        toast.error(res.error || "Failed to revoke creator");
      }
    } catch { toast.error("Failed to revoke creator"); }
    setActionLoading(false);
    setConfirmAction(null);
  };

  const isSuspended = creatorSummary.isSuspended;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-4xl h-full bg-white shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              {creatorSummary.avatarUrl ? (
                <img src={creatorSummary.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-slate-200" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-lg font-black">
                  {displayName[0]?.toUpperCase() || "C"}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{displayName}</h2>
                  {isSuspended ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full border bg-red-100 text-red-700 border-red-200">Suspended</span>
                  ) : creatorSummary.stripeConnectOnboarded ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full border bg-green-100 text-green-700 border-green-200">Active</span>
                  ) : (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full border bg-amber-100 text-amber-700 border-amber-200">Pending Stripe</span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{creatorSummary.email} &middot; Creator ID #{creatorSummary.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 bg-slate-100 p-1 rounded-xl w-fit">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
              <p className="text-sm text-slate-600">Loading creator details...</p>
            </div>
          ) : (
            <>
              {/* ═══ OVERVIEW TAB ═══ */}
              {activeTab === "overview" && details && (
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <MiniStat icon={<Package className="w-3.5 h-3.5" />} label="Total Listings" value={details.products?.length || 0} accent="blue" />
                    <MiniStat icon={<ShoppingCart className="w-3.5 h-3.5" />} label="Total Sales" value={details.revenueSummary?.completedOrders || 0} accent="green" />
                    <MiniStat icon={<DollarSign className="w-3.5 h-3.5" />} label="Creator Revenue" value={formatCents(details.revenueSummary?.totalRevenue || 0)} accent="amber" />
                    <MiniStat icon={<Star className="w-3.5 h-3.5" />} label="Reviews Received" value={details.reviews?.length || 0} accent="purple" />
                  </div>

                  {/* Profile Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Creator Profile</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 text-xs font-semibold mb-0.5 flex items-center gap-1"><User className="w-3 h-3" /> Full Name</p>
                        <p className="text-slate-800 font-medium">{displayName}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs font-semibold mb-0.5 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</p>
                        <p className="text-slate-800 font-medium">{details.creator.email || "—"}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs font-semibold mb-0.5 flex items-center gap-1"><Globe className="w-3 h-3" /> Website</p>
                        <p className="text-slate-800 font-medium">{details.creator.website || details.creator.founderWebsite || "—"}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs font-semibold mb-0.5 flex items-center gap-1"><Hash className="w-3 h-3" /> User ID</p>
                        <p className="text-slate-800 font-mono font-medium">#{details.creator.id}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs font-semibold mb-0.5 flex items-center gap-1"><Calendar className="w-3 h-3" /> Account Created</p>
                        <p className="text-slate-800 font-medium">{formatDate(details.creator.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs font-semibold mb-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Last Sign In</p>
                        <p className="text-slate-800 font-medium">{formatDateTime(details.creator.lastSignedIn)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Creator Status Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Creator Status</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 text-xs font-semibold mb-0.5 flex items-center gap-1"><Zap className="w-3 h-3" /> Creator Status</p>
                        <div className="flex items-center gap-2 mt-1">
                          {details.creator.isMarketplaceCreator ? (
                            <span className="flex items-center gap-1 text-green-600 font-semibold text-sm">
                              <CheckCircle className="w-4 h-4" /> Active Creator
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-slate-500 font-semibold text-sm">
                              <XCircle className="w-4 h-4" /> Not a Creator
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs font-semibold mb-0.5 flex items-center gap-1"><Calendar className="w-3 h-3" /> Activated On</p>
                        <p className="text-slate-800 font-medium">{formatDate(details.creator.creatorActivatedAt)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs font-semibold mb-0.5 flex items-center gap-1"><CreditCard className="w-3 h-3" /> Stripe Connect</p>
                        <div className="flex items-center gap-2 mt-1">
                          {details.creator.stripeConnectOnboarded ? (
                            <span className="flex items-center gap-1 text-green-600 font-semibold text-sm">
                              <CheckCircle className="w-4 h-4" /> Onboarded
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-600 font-semibold text-sm">
                              <Clock className="w-4 h-4" /> Pending
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs font-semibold mb-0.5 flex items-center gap-1"><Hash className="w-3 h-3" /> Stripe Account ID</p>
                        <p className="text-slate-800 font-mono text-xs">{details.creator.stripeConnectAccountId || "—"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Founder Status (if applicable) */}
                  {details.creator.founderStatus !== "none" && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Founder Status</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500 text-xs font-semibold mb-0.5">Founder Verification</p>
                          <StatusBadge status={details.creator.founderStatus} />
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs font-semibold mb-0.5">Verified At</p>
                          <p className="text-slate-800 font-medium">{formatDate(details.creator.founderVerifiedAt)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ═══ LISTINGS TAB ═══ */}
              {activeTab === "listings" && details && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-slate-900">Marketplace Listings ({details.products?.length || 0})</h3>
                  </div>

                  {details.products?.length === 0 ? (
                    <div className="text-center py-12 text-sm text-slate-600">
                      <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      This creator has no listings yet.
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50">
                            <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">Product</th>
                            <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">Category</th>
                            <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">Price</th>
                            <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">Status</th>
                            <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">Sales</th>
                            <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">Revenue</th>
                            <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {details.products.map((p: any) => (
                            <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  {p.previewImageUrl ? (
                                    <img src={p.previewImageUrl} alt="" className="w-9 h-9 rounded-lg border border-slate-200 object-cover" />
                                  ) : (
                                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                      {p.name?.[0]}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate">{p.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{p.tagline}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-xs text-slate-600 capitalize">{p.category?.replace(/_/g, " ")}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm font-bold text-slate-900">{p.price === 0 ? "Free" : formatCents(p.price)}</span>
                              </td>
                              <td className="py-3 px-4"><StatusBadge status={p.status} /></td>
                              <td className="py-3 px-4 text-right">
                                <span className="text-sm font-bold text-slate-900">{p.salesCount || 0}</span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className="text-sm font-bold text-green-600">{formatCents(p.totalRevenue || 0)}</span>
                              </td>
                              <td className="py-3 px-4 text-xs text-slate-500">{formatDate(p.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ═══ REVENUE TAB ═══ */}
              {activeTab === "revenue" && details && (
                <div className="space-y-6">
                  {/* Revenue Summary Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    <MiniStat icon={<DollarSign className="w-3.5 h-3.5" />} label="Gross Revenue" value={formatCents(details.revenueSummary?.totalGross || 0)} accent="green" />
                    <MiniStat icon={<TrendingUp className="w-3.5 h-3.5" />} label="Creator Payout" value={formatCents(details.revenueSummary?.totalRevenue || 0)} accent="amber" />
                    <MiniStat icon={<BarChart3 className="w-3.5 h-3.5" />} label="Platform Fees" value={formatCents(details.revenueSummary?.totalPlatformFees || 0)} accent="blue" />
                    <MiniStat icon={<CheckCircle className="w-3.5 h-3.5" />} label="Completed Orders" value={details.revenueSummary?.completedOrders || 0} accent="green" />
                    <MiniStat icon={<Clock className="w-3.5 h-3.5" />} label="Pending Orders" value={details.revenueSummary?.pendingOrders || 0} accent="slate" />
                    <MiniStat icon={<RefreshCw className="w-3.5 h-3.5" />} label="Refunded Orders" value={details.revenueSummary?.refundedOrders || 0} accent="red" />
                  </div>

                  {/* Orders Table */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-3">Recent Orders</h3>
                    {details.orders?.length === 0 ? (
                      <div className="text-center py-12 text-sm text-slate-600">
                        <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        No orders yet.
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                              <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">Order ID</th>
                              <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">Product</th>
                              <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">Amount</th>
                              <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">Fee</th>
                              <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">Payout</th>
                              <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">Status</th>
                              <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {details.orders.map((o: any) => {
                              const product = details.products?.find((p: any) => p.id === o.productId);
                              return (
                                <tr key={o.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                                  <td className="py-3 px-4 text-xs font-mono text-slate-600">#{o.id}</td>
                                  <td className="py-3 px-4 text-sm font-semibold text-slate-900 truncate max-w-[200px]">
                                    {product?.name || `Product #${o.productId}`}
                                  </td>
                                  <td className="py-3 px-4 text-right text-sm font-bold text-slate-900">{formatCents(o.amount)}</td>
                                  <td className="py-3 px-4 text-right text-xs text-slate-500">{formatCents(o.platformFee)}</td>
                                  <td className="py-3 px-4 text-right text-sm font-bold text-green-600">{formatCents(o.creatorPayout)}</td>
                                  <td className="py-3 px-4"><StatusBadge status={o.status} /></td>
                                  <td className="py-3 px-4 text-xs text-slate-500">{formatDate(o.createdAt)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ═══ ACTIVITY TAB ═══ */}
              {activeTab === "activity" && details && (
                <div className="space-y-6">
                  {/* Reviews Received */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-3">Reviews Received ({details.reviews?.length || 0})</h3>
                    {details.reviews?.length === 0 ? (
                      <div className="text-center py-8 text-sm text-slate-600">
                        <Star className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        No reviews received yet.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {details.reviews.map((r: any) => {
                          const product = details.products?.find((p: any) => p.id === r.productId);
                          return (
                            <div key={r.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="flex items-center gap-0.5">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />
                                      ))}
                                    </div>
                                    <StatusBadge status={r.status} />
                                  </div>
                                  <p className="text-sm font-bold text-slate-900">{r.title}</p>
                                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{r.body}</p>
                                  <p className="text-xs text-slate-500 mt-1">
                                    On: <span className="font-semibold">{product?.name || `Product #${r.productId}`}</span> &middot; {formatDate(r.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Recent Offers */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-3">Recent Offers ({details.offers?.length || 0})</h3>
                    {details.offers?.length === 0 ? (
                      <div className="text-center py-8 text-sm text-slate-600">
                        <DollarSign className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        No offers received yet.
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                              <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">Offer ID</th>
                              <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">Product</th>
                              <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">Amount</th>
                              <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">Status</th>
                              <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {details.offers.map((o: any) => {
                              const product = details.products?.find((p: any) => p.id === o.productId);
                              return (
                                <tr key={o.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                                  <td className="py-3 px-4 text-xs font-mono text-slate-600">#{o.id}</td>
                                  <td className="py-3 px-4 text-sm font-semibold text-slate-900">{product?.name || `Product #${o.productId}`}</td>
                                  <td className="py-3 px-4 text-right text-sm font-bold text-slate-900">{formatCents(o.offerAmountCents)}</td>
                                  <td className="py-3 px-4"><StatusBadge status={o.status} /></td>
                                  <td className="py-3 px-4 text-xs text-slate-500">{formatDate(o.createdAt)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ═══ MODERATION TAB ═══ */}
              {activeTab === "moderation" && (
                <div className="space-y-6">
                  {/* Current Status */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Current Creator Status</p>
                    <div className="flex items-center gap-3">
                      {isSuspended ? (
                        <>
                          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                            <Ban className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-red-700">Suspended</p>
                            <p className="text-xs text-slate-500">This creator&apos;s account is suspended. All listings are set to draft.</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-green-700">Active</p>
                            <p className="text-xs text-slate-500">This creator can list products and receive payments.</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Confirmation Panel */}
                  {confirmAction && (
                    <div className={`border rounded-2xl p-5 ${
                      confirmAction === "revoke" ? "bg-red-50 border-red-200" :
                      confirmAction === "suspend" ? "bg-amber-50 border-amber-200" :
                      "bg-green-50 border-green-200"
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className={`w-5 h-5 ${
                          confirmAction === "revoke" ? "text-red-600" :
                          confirmAction === "suspend" ? "text-amber-600" :
                          "text-green-600"
                        }`} />
                        <p className="text-sm font-bold text-slate-800">
                          {confirmAction === "suspend" && "Suspend this creator?"}
                          {confirmAction === "reactivate" && "Reactivate this creator?"}
                          {confirmAction === "revoke" && "Permanently revoke creator status?"}
                        </p>
                      </div>
                      <p className="text-xs text-slate-600 mb-4">
                        {confirmAction === "suspend" && "This will deactivate the creator account and set all their marketplace listings to draft. The creator will not be able to sell products until reactivated."}
                        {confirmAction === "reactivate" && "This will restore the creator's ability to list and sell products on the marketplace. Their existing listings will remain as drafts — they will need to re-publish them."}
                        {confirmAction === "revoke" && "This is a PERMANENT action. The creator status will be completely removed from this user. All their listings will be set to draft. They would need to pay the $39 creator fee again to become a creator. This cannot be undone."}
                      </p>
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setConfirmAction(null)}
                          className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (confirmAction === "suspend") handleSuspend();
                            if (confirmAction === "reactivate") handleReactivate();
                            if (confirmAction === "revoke") handleRevoke();
                          }}
                          disabled={actionLoading}
                          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all disabled:opacity-60 text-white ${
                            confirmAction === "revoke" ? "bg-red-600 hover:bg-red-700" :
                            confirmAction === "suspend" ? "bg-amber-600 hover:bg-amber-700" :
                            "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {actionLoading ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...</>
                          ) : (
                            <>
                              {confirmAction === "suspend" && "Confirm Suspend"}
                              {confirmAction === "reactivate" && "Confirm Reactivate"}
                              {confirmAction === "revoke" && "Confirm Revoke"}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</p>

                    {/* Suspend / Reactivate */}
                    {isSuspended ? (
                      <button
                        onClick={() => setConfirmAction("reactivate")}
                        disabled={actionLoading}
                        className="w-full flex items-center gap-3 p-4 bg-slate-50 border border-green-200 rounded-xl hover:bg-green-50 transition-all text-left disabled:opacity-60"
                      >
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                          <Play className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-green-700">Reactivate Creator</p>
                          <p className="text-xs text-slate-500">Restore creator privileges and allow them to sell again.</p>
                        </div>
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirmAction("suspend")}
                        disabled={actionLoading}
                        className="w-full flex items-center gap-3 p-4 bg-slate-50 border border-amber-200 rounded-xl hover:bg-amber-50 transition-all text-left disabled:opacity-60"
                      >
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                          <Pause className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-amber-700">Suspend Creator</p>
                          <p className="text-xs text-slate-500">Temporarily disable this creator. All listings will be set to draft.</p>
                        </div>
                      </button>
                    )}

                    {/* Revoke */}
                    <button
                      onClick={() => setConfirmAction("revoke")}
                      disabled={actionLoading}
                      className="w-full flex items-center gap-3 p-4 bg-slate-50 border border-red-200 rounded-xl hover:bg-red-50 transition-all text-left disabled:opacity-60"
                    >
                      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-red-700">Revoke Creator Status</p>
                        <p className="text-xs text-slate-500">Permanently remove creator privileges. They must pay the $39 fee again to re-apply.</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
