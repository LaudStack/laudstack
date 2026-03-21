"use client";
export const dynamic = "force-dynamic";
/**
 * Pricing & Plans — Configure pricing tiers for all promotion types
 * Full CRUD: create, edit, toggle active, delete pricing rows
 */
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  DollarSign, ArrowLeft, RefreshCw, Plus, Edit2, Save, X,
  Trash2, CheckCircle, XCircle, Star, Crown, TrendingUp,
  Target, Zap, ShoppingBag, Layers, Tag, AlertTriangle,
  ToggleLeft, ToggleRight,
} from "lucide-react";
import {
  getPromotionPricing,
  upsertPromotionPricing,
  deletePromotionPricing,
} from "@/app/actions/promotions";
import type { PromotionTarget, PromotionType } from "@/lib/promotion-constants";
import { toast } from "sonner";

type PricingRow = Awaited<ReturnType<typeof getPromotionPricing>>[number];

const TYPE_INFO: Record<string, { label: string; icon: any; color: string; target: PromotionTarget }> = {
  stack_featured:       { label: "Stack Featured", icon: Star, color: "text-amber-600", target: "stack" },
  stack_spotlight:      { label: "Stack Spotlight", icon: Crown, color: "text-purple-600", target: "stack" },
  stack_category_boost: { label: "Stack Category Boost", icon: TrendingUp, color: "text-blue-600", target: "stack" },
  deal_pinned:          { label: "Deal Pinned", icon: Target, color: "text-emerald-600", target: "deal" },
  deal_featured:        { label: "Deal Featured", icon: Star, color: "text-amber-600", target: "deal" },
  deal_of_day:          { label: "Deal of the Day", icon: Zap, color: "text-red-600", target: "deal" },
  marketplace_boost:    { label: "Marketplace Boost", icon: TrendingUp, color: "text-blue-600", target: "marketplace" },
  marketplace_spotlight:{ label: "Marketplace Spotlight", icon: Crown, color: "text-purple-600", target: "marketplace" },
};

const TARGET_SECTIONS: { target: PromotionTarget; label: string; icon: any; color: string; bg: string }[] = [
  { target: "stack", label: "Stack Promotions", icon: Layers, color: "text-blue-600", bg: "bg-blue-50" },
  { target: "deal", label: "Deal Promotions", icon: Tag, color: "text-emerald-600", bg: "bg-emerald-50" },
  { target: "marketplace", label: "Marketplace Promotions", icon: ShoppingBag, color: "text-purple-600", bg: "bg-purple-50" },
];

function fmtCurrency(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

/* ─── Edit/Create Modal ─────────────────────────────────── */

function PricingFormModal({
  existing,
  onClose,
  onSuccess,
}: {
  existing?: PricingRow;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    type: existing?.promotionType ?? "stack_featured",
    target: (existing?.promotionType?.startsWith("stack_") ? "stack" : existing?.promotionType?.startsWith("deal_") ? "deal" : existing?.promotionType?.startsWith("marketplace_") ? "marketplace" : "stack") as string,
    durationDays: String(existing?.durationDays ?? 7),
    priceInCents: String(existing?.priceInCents ?? 2999),
    label: existing?.displayName ?? "",
    description: existing?.description ?? "",
    isActive: existing?.isActive ?? true,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleTypeChange = (type: string) => {
    const info = TYPE_INFO[type];
    setForm(f => ({ ...f, type: type as typeof f.type, target: info?.target ?? f.target }));
  };

  const handleSubmit = async () => {
    const days = parseInt(form.durationDays);
    const price = parseInt(form.priceInCents);
    if (isNaN(days) || days < 1) { toast.error("Duration must be at least 1 day"); return; }
    if (isNaN(price) || price < 0) { toast.error("Price must be 0 or more"); return; }
    if (!form.label.trim()) { toast.error("Label is required"); return; }

    setSubmitting(true);
    try {
      await upsertPromotionPricing({
        id: existing?.id,
        promotionType: form.type as PromotionType,
        durationDays: days,
        priceInCents: price,
        displayName: form.label.trim(),
        description: form.description.trim() || undefined,
        isActive: form.isActive,
      });
      toast.success(existing ? "Pricing updated" : "Pricing created");
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Failed to save pricing");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              {existing ? "Edit Pricing Tier" : "Create Pricing Tier"}
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Promotion Type</label>
                <select
                  value={form.type}
                  onChange={e => handleTypeChange(e.target.value)}
                  disabled={!!existing}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-400/30 disabled:opacity-50"
                >
                  {Object.entries(TYPE_INFO).map(([key, info]) => (
                    <option key={key} value={key}>{info.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Target</label>
                <input
                  type="text"
                  value={form.target}
                  readOnly
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Duration (days)</label>
                <input
                  type="number"
                  value={form.durationDays}
                  onChange={e => setForm(f => ({ ...f, durationDays: e.target.value }))}
                  min={1}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Price (cents)</label>
                <input
                  type="number"
                  value={form.priceInCents}
                  onChange={e => setForm(f => ({ ...f, priceInCents: e.target.value }))}
                  min={0}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400/30"
                />
                <p className="text-[11px] text-slate-400 mt-1">= {fmtCurrency(parseInt(form.priceInCents) || 0)}</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Label</label>
              <input
                type="text"
                value={form.label}
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                placeholder="e.g. 7-Day Featured"
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Description (optional)</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                placeholder="Brief description shown to purchasers..."
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400/30 resize-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                className="flex items-center gap-2"
              >
                {form.isActive ? (
                  <ToggleRight className="w-6 h-6 text-green-500" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-slate-400" />
                )}
                <span className={`text-sm font-medium ${form.isActive ? "text-green-700" : "text-slate-500"}`}>
                  {form.isActive ? "Active" : "Inactive"}
                </span>
              </button>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Delete Confirm Modal ──────────────────────────────── */

function DeleteConfirmModal({
  pricing,
  onClose,
  onSuccess,
}: {
  pricing: PricingRow;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePromotionPricing(pricing.id);
      toast.success("Pricing tier deleted");
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">Delete Pricing Tier?</h3>
          <p className="text-sm text-slate-500 mb-6">
            This will permanently delete the &quot;{pricing.displayName}&quot; pricing tier. Existing promotions will not be affected.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-5 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Main ──────────────────────────────────────────────── */

export default function PricingConfigPage() {
  const [pricing, setPricing] = useState<PricingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRow, setEditingRow] = useState<PricingRow | undefined>(undefined);
  const [showCreate, setShowCreate] = useState(false);
  const [deletingRow, setDeletingRow] = useState<PricingRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await getPromotionPricing();
      setPricing(rows);
    } catch {
      toast.error("Failed to load pricing");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (row: PricingRow) => {
    try {
      await upsertPromotionPricing({
        id: row.id,
        promotionType: row.promotionType,
        durationDays: row.durationDays,
        priceInCents: row.priceInCents,
        displayName: row.displayName,
        description: row.description ?? undefined,
        isActive: !row.isActive,
      });
      toast.success(row.isActive ? "Pricing deactivated" : "Pricing activated");
      load();
    } catch {
      toast.error("Failed to toggle");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/ops-console/promotions" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Pricing & Plans
            </h1>
            <p className="text-sm text-slate-500">Configure pricing tiers for all promotion types.</p>
          </div>
        </div>
        <button
          onClick={() => { setEditingRow(undefined); setShowCreate(true); }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Tier
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">
          <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2" />
          Loading pricing...
        </div>
      ) : (
        <>
          {TARGET_SECTIONS.map(section => {
            const sectionPricing = pricing.filter(p => {
              const target = p.promotionType.startsWith("stack_") ? "stack" : p.promotionType.startsWith("deal_") ? "deal" : p.promotionType.startsWith("marketplace_") ? "marketplace" : "stack";
              return target === section.target;
            });
            return (
              <div key={section.target}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1.5 rounded-lg ${section.bg} ${section.color}`}>
                    <section.icon className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-800">{section.label}</h2>
                  <span className="text-xs text-slate-400 ml-1">({sectionPricing.length} tier{sectionPricing.length !== 1 ? "s" : ""})</span>
                </div>

                {sectionPricing.length === 0 ? (
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 text-center text-slate-400 text-sm mb-6">
                    No pricing tiers configured for {section.label.toLowerCase()}.
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">Type</th>
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">Label</th>
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">Duration</th>
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">Price</th>
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">Status</th>
                          <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sectionPricing.map(row => {
                          const tInfo = TYPE_INFO[row.promotionType];
                          const TIcon = tInfo?.icon ?? DollarSign;
                          return (
                            <tr key={row.id} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  <TIcon className={`w-3.5 h-3.5 ${tInfo?.color ?? "text-slate-500"}`} />
                                  <span className="text-xs font-medium text-slate-600">{tInfo?.label ?? row.promotionType}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <p className="font-medium text-slate-800">{row.displayName}</p>
                                {row.description && <p className="text-[11px] text-slate-400 mt-0.5">{row.description}</p>}
                              </td>
                              <td className="px-4 py-3 text-slate-600">{row.durationDays} day{row.durationDays !== 1 ? "s" : ""}</td>
                              <td className="px-4 py-3 font-semibold text-slate-900">{fmtCurrency(row.priceInCents)}</td>
                              <td className="px-4 py-3">
                                <button onClick={() => toggleActive(row)} className="flex items-center gap-1.5">
                                  {row.isActive ? (
                                    <>
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                      <span className="text-xs font-medium text-green-700">Active</span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-4 h-4 text-slate-400" />
                                      <span className="text-xs font-medium text-slate-500">Inactive</span>
                                    </>
                                  )}
                                </button>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => { setEditingRow(row); setShowCreate(true); }}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setDeletingRow(row)}
                                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* Modals */}
      {showCreate && (
        <PricingFormModal
          existing={editingRow}
          onClose={() => { setShowCreate(false); setEditingRow(undefined); }}
          onSuccess={load}
        />
      )}
      {deletingRow && (
        <DeleteConfirmModal
          pricing={deletingRow}
          onClose={() => setDeletingRow(null)}
          onSuccess={load}
        />
      )}
    </div>
  );
}
