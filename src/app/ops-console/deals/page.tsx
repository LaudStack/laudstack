"use client";
export const dynamic = "force-dynamic";
/*
 * LaudStack Admin — Deals Management
 * Full approval workflow, placement management, deal types, claim analytics
 */

import { useState, useEffect, useCallback } from "react";
import {
  Tag, Plus, Trash2, CheckCircle, XCircle, Edit3,
  Calendar, Percent, AlertTriangle, ExternalLink, Loader2,
  Pin, Star, Flame, Eye, Users, Filter, ChevronDown,
  DollarSign, Clock, Shield, BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAdminDeals, createAdminDeal, toggleAdminDealStatus, deleteAdminDeal,
  approveDeal, rejectDeal, updateDealPlacement, editDeal, getDealClaimAnalytics,
} from "@/app/actions/admin";

type Deal = {
  id: number;
  title: string;
  description: string | null;
  dealType: string;
  discountPercent: number | null;
  originalPrice: string | null;
  dealPrice: string | null;
  couponCode: string | null;
  dealUrl: string | null;
  placement: string;
  approvalStatus: string;
  isActive: boolean;
  expiresAt: Date | null;
  startsAt: Date | null;
  claimCount: number;
  maxClaims: number | null;
  createdAt: Date;
  createdBy: number | null;
  toolId: number;
  placementExpiresAt: Date | null;
  placementPlan: string | null;
  placementPaidAmount: number | null;
  placementStripeSessionId: string | null;
  toolName: string | null;
  toolSlug: string | null;
  toolLogo: string | null;
  founderName: string | null;
  founderEmail: string | null;
};

type ClaimData = {
  id: number;
  userId: number;
  claimedAt: Date;
  userName: string | null;
  userEmail: string | null;
};

// ─── Badge components ──────────────────────────────────────────────────────

function ApprovalBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    approved: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${styles[status] || styles.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function PlacementBadge({ placement }: { placement: string }) {
  if (placement === "none") return null;
  const config: Record<string, { icon: typeof Pin; color: string; label: string }> = {
    pinned: { icon: Pin, color: "text-blue-600 bg-blue-50 border-blue-200", label: "Pinned" },
    featured: { icon: Star, color: "text-amber-600 bg-amber-50 border-amber-200", label: "Featured" },
    deal_of_day: { icon: Flame, color: "text-red-600 bg-red-50 border-red-200", label: "Deal of Day" },
  };
  const c = config[placement];
  if (!c) return null;
  const Icon = c.icon;
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${c.color}`}>
      <Icon className="w-3 h-3" /> {c.label}
    </span>
  );
}

function DealTypeBadge({ type }: { type: string }) {
  const config: Record<string, { color: string; label: string }> = {
    discount: { color: "bg-blue-100 text-blue-700", label: "Discount" },
    lifetime: { color: "bg-purple-100 text-purple-700", label: "Lifetime" },
    free_trial: { color: "bg-green-100 text-green-700", label: "Free Trial" },
    exclusive: { color: "bg-amber-100 text-amber-700", label: "Exclusive" },
  };
  const c = config[type] || config.discount;
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.color}`}>
      {c.label}
    </span>
  );
}

// ─── Reject Modal ──────────────────────────────────────────────────────────

function RejectModal({ dealTitle, onClose, onReject }: {
  dealTitle: string;
  onClose: () => void;
  onReject: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="font-bold text-slate-900 mb-1">Reject Deal</h3>
        <p className="text-sm text-slate-500 mb-4">Rejecting &ldquo;{dealTitle}&rdquo;</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 resize-none"
          rows={3}
          placeholder="Reason for rejection (optional, will be sent to founder)..."
        />
        <div className="flex gap-3 mt-4">
          <button onClick={onClose}
            className="flex-1 h-9 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={() => onReject(reason)}
            className="flex-1 h-9 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-colors">
            Reject Deal
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Claims Analytics Modal ────────────────────────────────────────────────

function ClaimsModal({ dealId, onClose }: { dealId: number; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ deal: { title: string; claimCount: number; maxClaims: number | null }; claims: ClaimData[] } | null>(null);

  useEffect(() => {
    getDealClaimAnalytics(dealId).then((result) => {
      if (result.success && "claims" in result) {
        setData({ deal: result.deal!, claims: result.claims as ClaimData[] });
      }
      setLoading(false);
    });
  }, [dealId]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Claim Analytics</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>
          ) : data ? (
            <>
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-amber-50 rounded-xl p-4 flex-1 text-center">
                  <p className="text-2xl font-bold text-amber-700">{data.deal.claimCount}</p>
                  <p className="text-xs text-slate-500 mt-1">Total Claims</p>
                </div>
                {data.deal.maxClaims && (
                  <div className="bg-slate-50 rounded-xl p-4 flex-1 text-center">
                    <p className="text-2xl font-bold text-slate-700">{data.deal.maxClaims}</p>
                    <p className="text-xs text-slate-500 mt-1">Max Claims</p>
                  </div>
                )}
              </div>
              {data.claims.length > 0 ? (
                <div className="space-y-2">
                  {data.claims.map((claim) => (
                    <div key={claim.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{claim.userName || "Anonymous"}</p>
                        <p className="text-xs text-slate-500">{claim.userEmail || "No email"}</p>
                      </div>
                      <p className="text-xs text-slate-500">{new Date(claim.claimedAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-slate-400 py-4">No claims yet</p>
              )}
            </>
          ) : (
            <p className="text-center text-sm text-red-500 py-4">Failed to load claim data</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Edit Deal Modal ───────────────────────────────────────────────────────

function EditDealModal({ deal, onClose, onSaved }: { deal: Deal; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    title: deal.title,
    description: deal.description || "",
    dealType: deal.dealType || "discount",
    discountPercent: deal.discountPercent?.toString() || "",
    originalPrice: deal.originalPrice || "",
    dealPrice: deal.dealPrice || "",
    couponCode: deal.couponCode || "",
    dealUrl: deal.dealUrl || "",
    expiresAt: deal.expiresAt ? new Date(deal.expiresAt).toISOString().split("T")[0] : "",
    maxClaims: deal.maxClaims?.toString() || "",
    placement: deal.placement || "none",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await editDeal(deal.id, {
        title: form.title || undefined,
        description: form.description || undefined,
        dealType: form.dealType as "discount" | "lifetime" | "free_trial" | "exclusive",
        discountPercent: form.discountPercent ? parseInt(form.discountPercent) : null,
        originalPrice: form.originalPrice || null,
        dealPrice: form.dealPrice || null,
        couponCode: form.couponCode || null,
        dealUrl: form.dealUrl || null,
        expiresAt: form.expiresAt || null,
        maxClaims: form.maxClaims ? parseInt(form.maxClaims) : null,
        placement: form.placement as "none" | "pinned" | "featured" | "deal_of_day",
      });
      if (result.success) {
        toast.success("Deal updated");
        onSaved();
        onClose();
      } else {
        toast.error(result.error || "Failed to update deal");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Edit Deal</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Deal Title</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Deal Type</label>
              <select value={form.dealType} onChange={e => setForm(f => ({ ...f, dealType: e.target.value }))}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 bg-white">
                <option value="discount">Discount</option>
                <option value="lifetime">Lifetime Deal</option>
                <option value="free_trial">Free Trial</option>
                <option value="exclusive">Exclusive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Placement</label>
              <select value={form.placement} onChange={e => setForm(f => ({ ...f, placement: e.target.value }))}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 bg-white">
                <option value="none">None</option>
                <option value="pinned">Pinned</option>
                <option value="featured">Featured</option>
                <option value="deal_of_day">Deal of the Day</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Discount %</label>
              <input type="number" value={form.discountPercent} onChange={e => setForm(f => ({ ...f, discountPercent: e.target.value }))}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                placeholder="50" min="0" max="100" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Original Price</label>
              <input value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                placeholder="$99/mo" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Deal Price</label>
              <input value={form.dealPrice} onChange={e => setForm(f => ({ ...f, dealPrice: e.target.value }))}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                placeholder="$49/mo" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Coupon Code</label>
              <input value={form.couponCode} onChange={e => setForm(f => ({ ...f, couponCode: e.target.value }))}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                placeholder="LAUDSTACK50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Max Claims</label>
              <input type="number" value={form.maxClaims} onChange={e => setForm(f => ({ ...f, maxClaims: e.target.value }))}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                placeholder="Unlimited" min="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Deal URL</label>
              <input value={form.dealUrl} onChange={e => setForm(f => ({ ...f, dealUrl: e.target.value }))}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                placeholder="https://tool.com/deal" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Expires At</label>
              <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 resize-none"
              rows={3} placeholder="Describe the deal..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 h-9 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 h-9 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Add Deal Modal ────────────────────────────────────────────────────────

function AddDealModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    title: "", toolSlug: "", dealType: "discount",
    discountPercent: "", originalPrice: "", dealPrice: "",
    couponCode: "", dealUrl: "", description: "", expiresAt: "",
    maxClaims: "", placement: "none",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.toolSlug) {
      toast.error("Title and tool slug are required");
      return;
    }
    setSubmitting(true);
    try {
      const result = await createAdminDeal({
        title: form.title,
        toolSlug: form.toolSlug,
        dealType: form.dealType as "discount" | "lifetime" | "free_trial" | "exclusive",
        discountPercent: form.discountPercent ? parseInt(form.discountPercent) : undefined,
        originalPrice: form.originalPrice || undefined,
        dealPrice: form.dealPrice || undefined,
        couponCode: form.couponCode || undefined,
        dealUrl: form.dealUrl || undefined,
        description: form.description || undefined,
        expiresAt: form.expiresAt || undefined,
        maxClaims: form.maxClaims ? parseInt(form.maxClaims) : undefined,
        placement: form.placement as "none" | "pinned" | "featured" | "deal_of_day",
      });
      if (result.success) {
        toast.success("Deal created (auto-approved)");
        onCreated();
        onClose();
      } else {
        toast.error(result.error || "Failed to create deal");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Create Deal</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Deal Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
              placeholder="e.g. 50% off Pro Plan" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tool Slug *</label>
              <input value={form.toolSlug} onChange={e => setForm(f => ({ ...f, toolSlug: e.target.value }))}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                placeholder="e.g. ai-writer-pro" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Deal Type</label>
              <select value={form.dealType} onChange={e => setForm(f => ({ ...f, dealType: e.target.value }))}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 bg-white">
                <option value="discount">Discount</option>
                <option value="lifetime">Lifetime Deal</option>
                <option value="free_trial">Free Trial</option>
                <option value="exclusive">Exclusive</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Discount %</label>
              <input type="number" value={form.discountPercent} onChange={e => setForm(f => ({ ...f, discountPercent: e.target.value }))}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                placeholder="50" min="0" max="100" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Original Price</label>
              <input value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                placeholder="$99/mo" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Deal Price</label>
              <input value={form.dealPrice} onChange={e => setForm(f => ({ ...f, dealPrice: e.target.value }))}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                placeholder="$49/mo" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Coupon Code</label>
              <input value={form.couponCode} onChange={e => setForm(f => ({ ...f, couponCode: e.target.value }))}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                placeholder="LAUDSTACK50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Max Claims</label>
              <input type="number" value={form.maxClaims} onChange={e => setForm(f => ({ ...f, maxClaims: e.target.value }))}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                placeholder="Unlimited" min="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Deal URL</label>
              <input value={form.dealUrl} onChange={e => setForm(f => ({ ...f, dealUrl: e.target.value }))}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                placeholder="https://tool.com/deal" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Expires At</label>
              <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Placement</label>
            <select value={form.placement} onChange={e => setForm(f => ({ ...f, placement: e.target.value }))}
              className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 bg-white">
              <option value="none">None</option>
              <option value="pinned">Pinned</option>
              <option value="featured">Featured</option>
              <option value="deal_of_day">Deal of the Day</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 resize-none"
              rows={3} placeholder="Describe the deal for users..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 h-9 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 h-9 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "Create Deal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function AdminDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [rejectingDeal, setRejectingDeal] = useState<Deal | null>(null);
  const [claimsViewDealId, setClaimsViewDealId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlacement, setFilterPlacement] = useState("all");

  const fetchDeals = useCallback(async () => {
    try {
      const data = await getAdminDeals({
        approvalStatus: filterStatus !== "all" ? filterStatus : undefined,
        placement: filterPlacement !== "all" ? filterPlacement : undefined,
      });
      setDeals(data.deals as Deal[]);
      setPendingCount(data.pendingCount);
    } catch {
      toast.error("Failed to load deals");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPlacement]);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  const handleApprove = async (dealId: number) => {
    const result = await approveDeal(dealId);
    if (result.success) {
      toast.success("Deal approved and activated");
      fetchDeals();
    } else {
      toast.error(result.error || "Failed to approve deal");
    }
  };

  const handleReject = async (dealId: number, reason: string) => {
    const result = await rejectDeal(dealId, reason);
    if (result.success) {
      toast.success("Deal rejected");
      setRejectingDeal(null);
      fetchDeals();
    } else {
      toast.error(result.error || "Failed to reject deal");
    }
  };

  const handlePlacementChange = async (dealId: number, placement: string) => {
    const result = await updateDealPlacement(dealId, placement as "none" | "pinned" | "featured" | "deal_of_day");
    if (result.success) {
      toast.success("Placement updated");
      fetchDeals();
    } else {
      toast.error(result.error || "Failed to update placement");
    }
  };

  const toggleActive = async (id: number) => {
    const result = await toggleAdminDealStatus(id);
    if (result.success) {
      setDeals(prev => prev.map(d => d.id === id ? { ...d, isActive: !d.isActive } : d));
      toast.success("Deal status updated");
    } else {
      toast.error(result.error || "Failed to update deal");
    }
  };

  const handleDelete = async (id: number) => {
    const result = await deleteAdminDeal(id);
    if (result.success) {
      setDeals(prev => prev.filter(d => d.id !== id));
      setDeleteConfirm(null);
      toast.success("Deal deleted");
    } else {
      toast.error("Failed to delete deal");
    }
  };

  const activeDeals = deals.filter(d => d.isActive).length;
  const approvedDeals = deals.filter(d => d.approvalStatus === "approved").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Deals Management</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            {deals.length} total &middot; {approvedDeals} approved &middot; {activeDeals} active
            {pendingCount > 0 && (
              <span className="ml-2 text-amber-600 font-semibold">&middot; {pendingCount} pending review</span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 h-9 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg text-sm font-bold transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Deal
        </button>
      </div>

      {/* Pending alert */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">{pendingCount} deal{pendingCount > 1 ? "s" : ""} awaiting approval</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Founder-submitted deals require admin approval before they go live.
              <button onClick={() => setFilterStatus("pending")} className="ml-1 underline font-semibold">View pending</button>
            </p>
          </div>
        </div>
      )}

      {/* Revenue Summary */}
      {(() => {
        const paidDeals = deals.filter(d => d.placementPaidAmount && d.placementPaidAmount > 0);
        const totalRevenue = paidDeals.reduce((sum, d) => sum + (d.placementPaidAmount || 0), 0);
        const activePlacements = deals.filter(d => d.placement !== 'none' && d.placementExpiresAt && new Date(d.placementExpiresAt) > new Date());
        const totalClaims = deals.reduce((sum, d) => sum + (d.claimCount || 0), 0);
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-xs font-semibold text-slate-500">Placement Revenue</span>
              </div>
              <p className="text-xl font-black text-slate-900">${(totalRevenue / 100).toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-0.5">{paidDeals.length} paid placement{paidDeals.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-slate-500">Active Placements</span>
              </div>
              <p className="text-xl font-black text-slate-900">{activePlacements.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">{deals.filter(d => d.placement === 'deal_of_day').length} deal of day &middot; {deals.filter(d => d.placement === 'featured').length} featured &middot; {deals.filter(d => d.placement === 'pinned').length} pinned</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-semibold text-slate-500">Total Claims</span>
              </div>
              <p className="text-xl font-black text-slate-900">{totalClaims}</p>
              <p className="text-xs text-slate-500 mt-0.5">across {deals.filter(d => d.claimCount > 0).length} deals</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-semibold text-slate-500">Conversion Rate</span>
              </div>
              <p className="text-xl font-black text-slate-900">{deals.length > 0 ? Math.round((deals.filter(d => d.claimCount > 0).length / deals.length) * 100) : 0}%</p>
              <p className="text-xs text-slate-500 mt-0.5">deals with at least 1 claim</p>
            </div>
          </div>
        );
      })()}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500">Filters:</span>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setLoading(true); }}
          className="h-8 px-3 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/30"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={filterPlacement}
          onChange={(e) => { setFilterPlacement(e.target.value); setLoading(true); }}
          className="h-8 px-3 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/30"
        >
          <option value="all">All Placements</option>
          <option value="none">No Placement</option>
          <option value="pinned">Pinned</option>
          <option value="featured">Featured</option>
          <option value="deal_of_day">Deal of Day</option>
        </select>
      </div>

      {/* Deals list */}
      <div className="grid gap-4">
        {deals.map(deal => (
          <div key={deal.id} className={`bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow ${
            deal.approvalStatus === "pending" ? "border-amber-200 bg-amber-50/30" :
            deal.approvalStatus === "rejected" ? "border-red-200 bg-red-50/20" :
            "border-slate-200"
          }`}>
            <div className="flex items-start gap-4">
              {/* Tool logo or icon */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-50 border border-slate-100 overflow-hidden">
                {deal.toolLogo ? (
                  <img src={deal.toolLogo} alt="" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <Tag className={`w-5 h-5 ${deal.isActive ? "text-amber-500" : "text-slate-400"}`} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                {/* Title row with badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-900">{deal.title}</h3>
                  <ApprovalBadge status={deal.approvalStatus} />
                  <DealTypeBadge type={deal.dealType} />
                  <PlacementBadge placement={deal.placement} />
                  {deal.isActive && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                      Live
                    </span>
                  )}
                </div>

                {/* Tool name */}
                <p className="text-sm text-slate-600 mt-0.5">{deal.toolName || "Unknown tool"}</p>
                {deal.description && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{deal.description}</p>}

                {/* Meta row */}
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  {deal.discountPercent && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      <Percent className="w-3 h-3" /> {deal.discountPercent}% off
                    </span>
                  )}
                  {deal.originalPrice && deal.dealPrice && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      <DollarSign className="w-3 h-3" />
                      <span className="line-through text-slate-400">{deal.originalPrice}</span>
                      <span className="ml-1">{deal.dealPrice}</span>
                    </span>
                  )}
                  {deal.couponCode && (
                    <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {deal.couponCode}
                    </span>
                  )}
                  {deal.expiresAt && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" /> Expires {new Date(deal.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                  <button
                    onClick={() => setClaimsViewDealId(deal.id)}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-amber-600 transition-colors"
                  >
                    <Users className="w-3 h-3" /> {deal.claimCount}{deal.maxClaims ? `/${deal.maxClaims}` : ""} claims
                  </button>
                </div>
              </div>

              {/* Placement payment info */}
              {deal.placementPaidAmount && deal.placementPaidAmount > 0 && (
                <div className="flex items-center gap-3 mt-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs font-semibold text-green-700">
                    Paid ${(deal.placementPaidAmount / 100).toFixed(2)} for {deal.placementPlan || 'placement'}
                  </span>
                  {deal.placementExpiresAt && (
                    <span className="text-xs text-green-600">
                      {new Date(deal.placementExpiresAt) > new Date() ? (
                        <>Active until {new Date(deal.placementExpiresAt).toLocaleDateString()}</>
                      ) : (
                        <span className="text-red-500">Expired {new Date(deal.placementExpiresAt).toLocaleDateString()}</span>
                      )}
                    </span>
                  )}
                  {deal.founderName && (
                    <span className="text-xs text-slate-500 ml-auto">by {deal.founderName}</span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Approval actions for pending deals */}
                {deal.approvalStatus === "pending" && (
                  <>
                    <button
                      onClick={() => handleApprove(deal.id)}
                      className="px-3 h-8 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => setRejectingDeal(deal)}
                      className="px-3 h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </>
                )}

                {/* Placement dropdown for approved deals */}
                {deal.approvalStatus === "approved" && (
                  <select
                    value={deal.placement}
                    onChange={(e) => handlePlacementChange(deal.id, e.target.value)}
                    className="h-8 px-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                    title="Set placement"
                  >
                    <option value="none">No Placement</option>
                    <option value="pinned">Pinned</option>
                    <option value="featured">Featured</option>
                    <option value="deal_of_day">Deal of Day</option>
                  </select>
                )}

                {deal.toolSlug && (
                  <a href={`/tools/${deal.toolSlug}`} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="View tool">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => setEditingDeal(deal)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                  title="Edit deal"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleActive(deal.id)}
                  className={`p-1.5 rounded-lg transition-colors ${deal.isActive ? "text-green-600 hover:bg-green-50" : "text-slate-400 hover:bg-slate-100"}`}
                  title={deal.isActive ? "Deactivate" : "Activate"}
                >
                  {deal.isActive ? <Eye className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setDeleteConfirm(deal.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete deal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {deals.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Tag className="w-10 h-10 mx-auto mb-3 text-slate-200" />
            <p className="text-slate-500 font-medium">No deals found</p>
            <p className="text-sm text-slate-600 mt-1">
              {filterStatus !== "all" || filterPlacement !== "all"
                ? "Try adjusting your filters"
                : "Create your first deal to get started"}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && <AddDealModal onClose={() => setShowAddModal(false)} onCreated={fetchDeals} />}
      {editingDeal && <EditDealModal deal={editingDeal} onClose={() => setEditingDeal(null)} onSaved={fetchDeals} />}
      {rejectingDeal && (
        <RejectModal
          dealTitle={rejectingDeal.title}
          onClose={() => setRejectingDeal(null)}
          onReject={(reason) => handleReject(rejectingDeal.id, reason)}
        />
      )}
      {claimsViewDealId !== null && (
        <ClaimsModal dealId={claimsViewDealId} onClose={() => setClaimsViewDealId(null)} />
      )}

      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Delete Deal</h3>
                <p className="text-sm text-slate-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-5">Are you sure you want to delete this deal and all associated claims?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 h-9 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 h-9 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
