"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Package, ShoppingCart, MessageSquare, BarChart3, Settings, Plus,
  Loader2, Eye, Edit3, Pause, Play, Trash2, ExternalLink, DollarSign,
  TrendingUp, Users, Star, Clock, CheckCircle, XCircle, AlertCircle,
  ArrowRight, ChevronDown, ChevronUp, Send, Store, Zap, ArrowLeft,
  MoreHorizontal, Copy, RefreshCw, Tag, Layers, Shield,
  Megaphone, Sparkles, Crown, Target, Calendar, Mail, Share2
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useDbUser } from "@/hooks/useDbUser";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  getCreatorProducts,
  getCreatorOrders,
  getCreatorOffers,
  getCreatorAnalytics,
  submitProductForReview,
  toggleProductPause,
  acceptOffer,
  rejectOffer,
  counterOffer,
} from "@/app/actions/marketplace";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "products" | "orders" | "offers" | "analytics" | "promote";
const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders & Sales", icon: ShoppingCart },
  { id: "offers", label: "Offers", icon: MessageSquare },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "promote", label: "Promote", icon: Megaphone },
];

const STATUS_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "text-slate-600", bg: "bg-slate-100" },
  pending_review: { label: "Pending Review", color: "text-amber-600", bg: "bg-amber-50" },
  approved: { label: "Live", color: "text-green-600", bg: "bg-green-50" },
  rejected: { label: "Rejected", color: "text-red-600", bg: "bg-red-50" },
  paused: { label: "Paused", color: "text-orange-600", bg: "bg-orange-50" },
  suspended: { label: "Suspended", color: "text-red-700", bg: "bg-red-100" },
};

const OFFER_STATUS_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "text-amber-600", bg: "bg-amber-50" },
  accepted: { label: "Accepted", color: "text-green-600", bg: "bg-green-50" },
  rejected: { label: "Rejected", color: "text-red-600", bg: "bg-red-50" },
  countered: { label: "Countered", color: "text-blue-600", bg: "bg-blue-50" },
  expired: { label: "Expired", color: "text-slate-500", bg: "bg-slate-100" },
  cancelled: { label: "Cancelled", color: "text-slate-500", bg: "bg-slate-100" },
  paid: { label: "Paid", color: "text-green-700", bg: "bg-green-100" },
};

const CATEGORY_LABELS: Record<string, string> = {
  templates: "Templates",
  saas_boilerplates: "SaaS Boilerplates",
  micro_saas: "Micro-SaaS",
  full_apps: "Full Apps",
  automation_tools: "Automation Tools",
  startup_assets: "Startup Assets",
};

function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
      <p className="text-slate-600 text-sm">{message}</p>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, action }: {
  icon: React.ElementType; title: string; description: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}

// ─── Products Tab ─────────────────────────────────────────────────────────────
function ProductsTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    getCreatorProducts().then(res => {
      if (res.success) setProducts(res.products || []);
      setLoading(false);
    });
  }, []);

  const handleSubmitForReview = async (id: number) => {
    setActionLoading(id);
    const res = await submitProductForReview(id);
    if (res.success) {
      toast.success("Product submitted for review");
      setProducts(prev => prev.map(p => p.id === id ? { ...p, status: "pending_review" } : p));
    } else {
      toast.error(res.error || "Failed to submit");
    }
    setActionLoading(null);
  };

  const handleTogglePause = async (id: number) => {
    setActionLoading(id);
    const res = await toggleProductPause(id);
    if (res.success) {
      const newStatus = res.newStatus || (res.success ? "approved" : undefined);
      toast.success(newStatus === "paused" ? "Product paused" : "Product resumed");
      setProducts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus || p.status } : p));
    } else {
      toast.error(res.error || "Failed to update");
    }
    setActionLoading(null);
  };

  if (loading) return <LoadingState message="Loading products..." />;

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No products yet"
        description="List your first product and start selling to thousands of builders."
        action={
          <Link href="/marketplace/submit" className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors text-sm">
            <Plus className="w-4 h-4" /> List Your First Product
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Your Products ({products.length})</h2>
        <Link href="/marketplace/submit" className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors text-sm">
          <Plus className="w-4 h-4" /> New Product
        </Link>
      </div>

      <div className="space-y-3">
        {products.map((p: any) => {
          const badge = STATUS_BADGES[p.status] || STATUS_BADGES.draft;
          return (
            <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:border-slate-300 transition-colors">
              {p.previewImageUrl ? (
                <img src={p.previewImageUrl} alt={p.name} className="w-16 h-16 rounded-lg object-cover border border-slate-100 flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-slate-400" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-900 text-sm truncate">{p.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.color}`}>{badge.label}</span>
                </div>
                <p className="text-xs text-slate-500 truncate">{p.tagline}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                  <span className="font-medium text-slate-600">${(p.price / 100).toFixed(2)}</span>
                  <span>{CATEGORY_LABELS[p.category] || p.category}</span>
                  <span>{p.totalSales || 0} sales</span>
                  <span>${((p.totalRevenue || 0) / 100).toFixed(2)} revenue</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {p.status === "draft" && (
                  <button
                    onClick={() => handleSubmitForReview(p.id)}
                    disabled={actionLoading === p.id}
                    className="px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center gap-1"
                  >
                    {actionLoading === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    Submit
                  </button>
                )}
                {(p.status === "approved" || p.status === "paused") && (
                  <button
                    onClick={() => handleTogglePause(p.id)}
                    disabled={actionLoading === p.id}
                    className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-200 disabled:opacity-50 flex items-center gap-1"
                  >
                    {actionLoading === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : p.status === "paused" ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                    {p.status === "paused" ? "Resume" : "Pause"}
                  </button>
                )}
                {p.status === "approved" && (
                  <Link href={`/marketplace/${p.slug}`} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-200 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> View
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────
function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    getCreatorOrders(page).then(res => {
      if (res.success) {
        setOrders(res.orders || []);
        setTotal(res.total || 0);
      }
      setLoading(false);
    });
  }, [page]);

  if (loading) return <LoadingState message="Loading orders..." />;

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="No orders yet"
        description="When buyers purchase your products, orders will appear here."
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Orders ({total})</h2>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Product</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Buyer</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Amount</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Your Payout</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o: any) => (
              <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="px-4 py-3 font-medium text-slate-700">{o.productName || "Product"}</td>
                <td className="px-4 py-3 text-slate-500">{o.buyerName || o.buyerEmail || "Buyer"}</td>
                <td className="px-4 py-3 text-right text-slate-700">${(o.amountPaid / 100).toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-green-600 font-medium">${(o.creatorPayout / 100).toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-slate-400 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > 20 && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm disabled:opacity-50">Previous</button>
          <span className="px-3 py-1.5 text-sm text-slate-600">Page {page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={orders.length < 20} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}

// ─── Offers Tab ───────────────────────────────────────────────────────────────
function OffersTab() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [counterModal, setCounterModal] = useState<{ offerId: number; currentAmount: number; listingPrice: number } | null>(null);
  const [counterAmount, setCounterAmount] = useState("");
  const [counterMessage, setCounterMessage] = useState("");

  useEffect(() => {
    getCreatorOffers().then(res => {
      if (res.success) setOffers(res.offers || []);
      setLoading(false);
    });
  }, []);

  const handleAccept = async (id: number) => {
    setActionLoading(id);
    const res = await acceptOffer(id);
    if (res.success) {
      toast.success("Offer accepted! Buyer will be notified to complete payment.");
      setOffers(prev => prev.map(o => o.id === id ? { ...o, status: "accepted" } : o));
    } else {
      toast.error(res.error || "Failed to accept offer");
    }
    setActionLoading(null);
  };

  const handleReject = async (id: number) => {
    setActionLoading(id);
    const res = await rejectOffer(id);
    if (res.success) {
      toast.success("Offer rejected");
      setOffers(prev => prev.map(o => o.id === id ? { ...o, status: "rejected" } : o));
    } else {
      toast.error(res.error || "Failed to reject offer");
    }
    setActionLoading(null);
  };

  const handleCounter = async () => {
    if (!counterModal) return;
    const amountCents = Math.round(parseFloat(counterAmount) * 100);
    if (!amountCents || amountCents <= 0) {
      toast.error("Enter a valid counter amount");
      return;
    }
    setActionLoading(counterModal.offerId);
    const res = await counterOffer(counterModal.offerId, amountCents, counterMessage || undefined);
    if (res.success) {
      toast.success("Counter offer sent!");
      setOffers(prev => prev.map(o => o.id === counterModal.offerId ? { ...o, status: "countered", counterAmount: amountCents } : o));
      setCounterModal(null);
      setCounterAmount("");
      setCounterMessage("");
    } else {
      toast.error(res.error || "Failed to send counter offer");
    }
    setActionLoading(null);
  };

  if (loading) return <LoadingState message="Loading offers..." />;

  if (offers.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No offers yet"
        description="When buyers make offers on your products, they'll appear here."
      />
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-6">Incoming Offers ({offers.length})</h2>

      <div className="space-y-3">
        {offers.map((o: any) => {
          const badge = OFFER_STATUS_BADGES[o.status] || OFFER_STATUS_BADGES.pending;
          return (
            <div key={o.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 text-sm">{o.productName || "Product"}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.color}`}>{badge.label}</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">From: {o.buyerName || "Buyer"}</p>

                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-slate-500 text-xs">Listing Price</span>
                      <p className="font-medium text-slate-600">${((o.listingPrice || 0) / 100).toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs">Offered</span>
                      <p className="font-bold text-amber-600">${(o.offerAmount / 100).toFixed(2)}</p>
                    </div>
                    {o.counterAmount && (
                      <div>
                        <span className="text-slate-500 text-xs">Your Counter</span>
                        <p className="font-bold text-blue-600">${(o.counterAmount / 100).toFixed(2)}</p>
                      </div>
                    )}
                  </div>

                  {o.message && (
                    <p className="text-xs text-slate-600 mt-2 italic">&quot;{o.message}&quot;</p>
                  )}
                </div>

                {o.status === "pending" && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleAccept(o.id)}
                      disabled={actionLoading === o.id}
                      className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-1"
                    >
                      {actionLoading === o.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                      Accept
                    </button>
                    <button
                      onClick={() => setCounterModal({ offerId: o.id, currentAmount: o.offerAmount, listingPrice: o.listingPrice || 0 })}
                      disabled={actionLoading === o.id}
                      className="px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1"
                    >
                      Counter
                    </button>
                    <button
                      onClick={() => handleReject(o.id)}
                      disabled={actionLoading === o.id}
                      className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-medium rounded-lg hover:bg-red-200 disabled:opacity-50 flex items-center gap-1"
                    >
                      <XCircle className="w-3 h-3" /> Reject
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-500 mt-2">
                <Clock className="w-3 h-3 inline mr-1" />
                {new Date(o.createdAt).toLocaleString()}
                {o.expiresAt && o.status === "pending" && (
                  <> · Expires {new Date(o.expiresAt).toLocaleString()}</>
                )}
              </p>
            </div>
          );
        })}
      </div>

      {/* Counter Offer Modal */}
      {counterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6" onClick={() => setCounterModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Counter Offer</h3>
            <p className="text-sm text-slate-600 mb-4">
              Buyer offered <strong className="text-amber-600">${(counterModal.currentAmount / 100).toFixed(2)}</strong> for a product listed at <strong>${(counterModal.listingPrice / 100).toFixed(2)}</strong>.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Your Counter Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input
                    type="number" value={counterAmount} onChange={e => setCounterAmount(e.target.value)}
                    placeholder="35.00" min="0" step="0.01"
                    className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message (optional)</label>
                <textarea
                  value={counterMessage} onChange={e => setCounterMessage(e.target.value)}
                  placeholder="Explain your counter..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => setCounterModal(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 text-sm">Cancel</button>
              <button
                onClick={handleCounter}
                disabled={actionLoading !== null}
                className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 text-sm disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {actionLoading !== null ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Counter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCreatorAnalytics().then(res => {
      if (res.success) setAnalytics(res);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState message="Loading analytics..." />;

  if (!analytics) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No analytics yet"
        description="Analytics will appear once you have products and sales."
      />
    );
  }

  const stats = [
    { label: "Total Products", value: analytics.totalProducts || 0, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Sales", value: analytics.totalSales || 0, icon: ShoppingCart, color: "text-green-600", bg: "bg-green-50" },
    { label: "Total Revenue", value: `$${((analytics.totalRevenue || 0) / 100).toFixed(2)}`, icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Avg Rating", value: analytics.avgRating ? analytics.avgRating.toFixed(1) : "N/A", icon: Star, color: "text-yellow-600", bg: "bg-yellow-50" },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-6">Creator Analytics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Creator Promote Tab ──────────────────────────────────────────────────────
const PROMO_TYPE_ICONS: Record<string, React.ElementType> = {
  stack_featured: Sparkles,
  stack_spotlight: Crown,
  stack_category_boost: TrendingUp,
  deal_pinned: Target,
  deal_featured: Star,
  deal_of_day: Calendar,
  marketplace_boost: Zap,
  marketplace_spotlight: Crown,
};
const PROMO_STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  active:          { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  scheduled:       { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500' },
  paid:            { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500' },
  pending_payment: { bg: 'bg-slate-50',   text: 'text-slate-600',   dot: 'bg-slate-400' },
  expired:         { bg: 'bg-slate-50',   text: 'text-slate-500',   dot: 'bg-slate-300' },
  cancelled:       { bg: 'bg-red-50',     text: 'text-red-600',     dot: 'bg-red-400' },
  paused:          { bg: 'bg-orange-50',  text: 'text-orange-600',  dot: 'bg-orange-400' },
  failed:          { bg: 'bg-red-50',     text: 'text-red-500',     dot: 'bg-red-400' },
};

function CreatorPromoteTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);
  const [myPromotions, setMyPromotions] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { dbUser } = useDbUser();
  const searchParams = useSearchParams();
  const paymentStatus = searchParams?.get('payment') ?? null;

  useEffect(() => {
    if (paymentStatus === 'success') {
      toast.success('Payment successful! Your promotion is now being activated.');
    } else if (paymentStatus === 'cancelled') {
      toast.info('Payment was cancelled. You can try again anytime.');
    }
  }, [paymentStatus]);

  // Load creator products
  useEffect(() => {
    getCreatorProducts().then(res => {
      if (res.success && res.products) {
        setProducts(res.products);
        if (res.products.length > 0) setSelectedProduct(res.products[0].id);
      }
    }).catch(err => {
      console.error('Failed to load products:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  // Load dynamic pricing from DB for marketplace target
  useEffect(() => {
    import('@/app/actions/promotions').then(mod => {
      mod.getActivePricingForTarget('marketplace').then(plans => {
        setPricingPlans(plans);
      }).catch(err => console.error('Failed to load pricing:', err));
    });
  }, []);

  // Load user's promotions
  useEffect(() => {
    if (dbUser?.id) {
      import('@/app/actions/promotions').then(mod => {
        mod.getMyPromotions(dbUser.id).then(promos => {
          setMyPromotions(promos);
        }).catch(err => console.error('Failed to load promotions:', err));
      });
    }
  }, [dbUser?.id, paymentStatus]);

  const handlePurchasePromotion = async (pricingId: number) => {
    if (!selectedProduct) { toast.error('Please select a product first'); return; }
    setPurchasing(pricingId);
    try {
      const res = await fetch('/api/stripe/promotion-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pricingId, entityId: selectedProduct }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Failed to create checkout session');
      }
    } catch {
      toast.error('Failed to initiate payment');
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) return <LoadingState message="Loading..." />;
  if (products.length === 0) {
    return (
      <EmptyState
        icon={Megaphone}
        title="No products to promote yet"
        description="List a product first, then come back to boost its visibility."
        action={
          <Link href="/marketplace/submit" className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors text-sm">
            <Plus className="w-4 h-4" /> List Your First Product
          </Link>
        }
      />
    );
  }

  const selectedProductObj = products.find((p: any) => p.id === selectedProduct);
  const activePromos = myPromotions.filter(p => ['active', 'scheduled', 'paid'].includes(p.status));
  const pastPromos = myPromotions.filter(p => ['expired', 'cancelled', 'failed'].includes(p.status));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-slate-900 font-bold text-base">Promote Your Products</h3>
        <p className="text-slate-500 text-sm mt-0.5">Boost visibility of your marketplace products with self-serve promotions</p>
      </div>

      {/* Active Promotions */}
      {activePromos.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <h4 className="text-slate-900 font-bold text-sm">Active Promotions</h4>
            <span className="ml-auto text-xs text-slate-500">{activePromos.length} active</span>
          </div>
          <div className="space-y-3">
            {activePromos.map(promo => {
              const statusStyle = PROMO_STATUS_COLORS[promo.status] || PROMO_STATUS_COLORS.pending_payment;
              const Icon = PROMO_TYPE_ICONS[promo.type] || Sparkles;
              return (
                <div key={promo.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{promo.entityName}</p>
                    <p className="text-xs text-slate-500">
                      {promo.type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} · {promo.durationDays}d
                    </p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                    {promo.status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </div>
                  {promo.expiresAt && (
                    <span className="text-xs text-slate-500 hidden sm:block">
                      Expires {new Date(promo.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Product selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <label className="text-xs font-semibold text-slate-600 mb-2 block">Select a product to promote</label>
        <select
          value={selectedProduct ?? ''}
          onChange={(e) => setSelectedProduct(Number(e.target.value))}
          className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 bg-white"
        >
          {products.map((p: any) => (
            <option key={p.id} value={p.id}>{p.name} — {STATUS_BADGES[p.status]?.label || p.status}</option>
          ))}
        </select>
        {selectedProductObj && selectedProductObj.status !== 'approved' && (
          <div className="mt-2 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5" />
            Only live (approved) products can be promoted. This product is currently {selectedProductObj.status}.
          </div>
        )}
      </div>

      {/* Dynamic Pricing Plans from DB */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h4 className="text-slate-900 font-bold text-sm">Marketplace Promotion Plans</h4>
        </div>
        {pricingPlans.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-600 font-medium">Promotion plans coming soon</p>
            <p className="text-xs text-slate-500 mt-1">Our team is setting up marketplace promotion pricing. Check back shortly.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pricingPlans.map((plan, idx) => {
                const Icon = PROMO_TYPE_ICONS[plan.promotionType] || Sparkles;
                const isPopular = plan.isPopular || idx === 1;
                const isDisabled = selectedProductObj && selectedProductObj.status !== 'approved';
                return (
                  <div
                    key={plan.id}
                    className={`relative bg-white rounded-2xl p-5 flex flex-col transition-all ${
                      isPopular
                        ? 'border-2 border-amber-400 shadow-lg shadow-amber-100'
                        : 'border border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-amber-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-5 h-5 text-amber-500" />
                      <h5 className="text-slate-900 font-black text-base">{plan.displayName}</h5>
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-2xl font-black text-slate-900">${(plan.priceInCents / 100).toFixed(0)}</span>
                      <span className="text-slate-500 text-xs">one-time</span>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed mb-3">{plan.durationDays} days of {plan.promotionType.replace(/_/g, ' ')} visibility</p>
                    <p className="text-slate-600 text-xs leading-relaxed mb-4 flex-1">{plan.description || `Boost your product with ${plan.displayName} promotion`}</p>
                    <button
                      onClick={() => handlePurchasePromotion(plan.id)}
                      disabled={purchasing !== null || !!isDisabled}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                        isPopular
                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-900'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                      } disabled:opacity-50`}
                    >
                      {purchasing === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                      {purchasing === plan.id ? 'Redirecting...' : `Get ${plan.displayName}`}
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-600 mt-3 text-center">Secure payment via Stripe. One-time payment, no recurring charges.</p>
          </>
        )}
      </div>

      {/* Promotion History */}
      {pastPromos.length > 0 && (
        <div className="border-t border-slate-200 pt-6">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <Clock className="w-4 h-4" />
            Promotion History ({pastPromos.length})
            {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showHistory && (
            <div className="mt-3 space-y-2">
              {pastPromos.map(promo => {
                const statusStyle = PROMO_STATUS_COLORS[promo.status] || PROMO_STATUS_COLORS.expired;
                const Icon = PROMO_TYPE_ICONS[promo.type] || Sparkles;
                return (
                  <div key={promo.id} className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-xl opacity-70">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{promo.entityName}</p>
                      <p className="text-xs text-slate-500">
                        {promo.type.replace(/_/g, ' ')} · ${(promo.amountPaid / 100).toFixed(0)} · {promo.durationDays}d
                      </p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                      {promo.status}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
function CreatorDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { dbUser, loading: dbLoading } = useDbUser();

  const tabParam = searchParams?.get("tab") as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(tabParam && TABS.some(t => t.id === tabParam) ? tabParam : "products");

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    router.replace(`/dashboard/creator?tab=${tab}`, { scroll: false });
  };

  if (authLoading || dbLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!user || !dbUser) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <Store className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in required</h2>
            <p className="text-slate-600 mb-6">Sign in to access your Creator Dashboard.</p>
            <Link href="/auth/login" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors">
              Sign In <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!dbUser.isMarketplaceCreator) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <Zap className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Become a Creator</h2>
            <p className="text-slate-600 mb-6">Complete the onboarding process to start selling on the marketplace.</p>
            <Link href="/marketplace/creator/onboarding" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors">
              Start Onboarding <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div style={{ height: "72px", flexShrink: 0 }} />

      <div className="flex-1 py-8 px-6 lg:px-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Creator Dashboard</h1>
              <p className="text-sm text-slate-600 mt-1">Manage your marketplace products, orders, and offers.</p>
            </div>
            <Link href="/marketplace/submit" className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors text-sm">
              <Plus className="w-4 h-4" /> New Product
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-white rounded-xl border border-slate-200 p-1 overflow-x-auto">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "bg-amber-500 text-white"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "products" && <ProductsTab />}
            {activeTab === "orders" && <OrdersTab />}
            {activeTab === "offers" && <OffersTab />}
            {activeTab === "analytics" && <AnalyticsTab />}
            {activeTab === "promote" && <CreatorPromoteTab />}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// ─── Suspense wrapper required for useSearchParams ────────────────────────────
export default function CreatorDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CreatorDashboardContent />
    </Suspense>
  );
}
