"use client";
export const dynamic = "force-dynamic";
/*
 * LaudStack Admin — Deals Management
 * Create, activate, deactivate, delete deals — wired to real DB
 */

import { useState, useEffect, useCallback } from "react";
import {
  Tag, Plus, Trash2, CheckCircle, XCircle,
  Calendar, Percent, AlertTriangle, ExternalLink, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAdminDeals, createAdminDeal, toggleAdminDealStatus, deleteAdminDeal,
} from "@/app/actions/admin";

type Deal = {
  id: number;
  title: string;
  description: string | null;
  discountPercent: number | null;
  couponCode: string | null;
  dealUrl: string | null;
  isActive: boolean;
  expiresAt: Date | null;
  claimCount: number;
  createdAt: Date;
  toolId: number;
  toolName: string | null;
  toolSlug: string | null;
};

function DealTypeBadge({ percent }: { percent: number | null }) {
  if (!percent) return null;
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
      {percent}% Off
    </span>
  );
}

function AddDealModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    title: "", toolSlug: "", discountPercent: "",
    couponCode: "", dealUrl: "", description: "", expiresAt: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.toolSlug || !form.discountPercent) {
      toast.error("Title, tool slug, and discount are required");
      return;
    }
    setSubmitting(true);
    try {
      const result = await createAdminDeal({
        title: form.title,
        toolSlug: form.toolSlug,
        discountPercent: parseInt(form.discountPercent),
        couponCode: form.couponCode || undefined,
        dealUrl: form.dealUrl || undefined,
        description: form.description || undefined,
        expiresAt: form.expiresAt || undefined,
      });
      if (result.success) {
        toast.success("Deal created successfully");
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
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
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tool Slug *</label>
            <input value={form.toolSlug} onChange={e => setForm(f => ({ ...f, toolSlug: e.target.value }))}
              className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
              placeholder="e.g. ai-writer-pro" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Discount Percent *</label>
              <input type="number" value={form.discountPercent} onChange={e => setForm(f => ({ ...f, discountPercent: e.target.value }))}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                placeholder="50" min="1" max="100" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Coupon Code (optional)</label>
              <input value={form.couponCode} onChange={e => setForm(f => ({ ...f, couponCode: e.target.value }))}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                placeholder="LAUDSTACK50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Deal URL (optional)</label>
              <input value={form.dealUrl} onChange={e => setForm(f => ({ ...f, dealUrl: e.target.value }))}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                placeholder="https://tool.com/deal" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Expires At (optional)</label>
              <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400" />
            </div>
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

export default function AdminDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const fetchDeals = useCallback(async () => {
    try {
      const data = await getAdminDeals();
      setDeals(data as Deal[]);
    } catch {
      toast.error("Failed to load deals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Deals</h1>
          <p className="text-sm text-slate-500 mt-0.5">{deals.length} deals — {activeDeals} active</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 h-9 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg text-sm font-bold transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Deal
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Tag className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          Deals are exclusive discounts negotiated with tool founders. They appear on tool pages and the dedicated Deals page.
        </p>
      </div>

      {/* Deals grid */}
      <div className="grid gap-4">
        {deals.map(deal => (
          <div key={deal.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${deal.isActive ? "bg-amber-50" : "bg-slate-100"}`}>
                <Tag className={`w-5 h-5 ${deal.isActive ? "text-amber-500" : "text-slate-400"}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-900">{deal.title}</h3>
                  <DealTypeBadge percent={deal.discountPercent} />
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${deal.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                    {deal.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{deal.toolName || "Unknown tool"}</p>
                {deal.description && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{deal.description}</p>}

                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  {deal.discountPercent && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      <Percent className="w-3 h-3" /> {deal.discountPercent}% off
                    </span>
                  )}
                  {deal.couponCode && (
                    <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {deal.couponCode}
                    </span>
                  )}
                  {deal.expiresAt && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="w-3 h-3" /> Expires {new Date(deal.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                  <span className="text-xs text-slate-400">{deal.claimCount} claims</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {deal.toolSlug && (
                  <a href={`/tools/${deal.toolSlug}`} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => toggleActive(deal.id)}
                  className={`p-1.5 rounded-lg transition-colors ${deal.isActive ? "text-green-600 hover:bg-green-50" : "text-slate-400 hover:bg-slate-100"}`}
                  title={deal.isActive ? "Deactivate" : "Activate"}
                >
                  {deal.isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setDeleteConfirm(deal.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
            <p className="text-slate-500 font-medium">No deals yet</p>
            <p className="text-sm text-slate-400 mt-1">Create your first deal to get started</p>
          </div>
        )}
      </div>

      {showAddModal && <AddDealModal onClose={() => setShowAddModal(false)} onCreated={fetchDeals} />}

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
            <p className="text-sm text-slate-600 mb-5">Are you sure you want to delete this deal?</p>
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
