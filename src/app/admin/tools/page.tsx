"use client";
/*
 * LaudStack Admin — Tools Management
 * List, filter, add manually, change status, feature/unfeature, delete
 */

import { useState, useEffect, useCallback } from "react";
import {
  Search, Plus, Wrench, ExternalLink, Trash2, CheckCircle,
  XCircle, Star, Filter, ChevronDown, RefreshCw, Globe,
  MoreHorizontal, Sparkles, Eye, Edit2, AlertTriangle,
} from "lucide-react";
import {
  getAdminTools, updateToolStatus, updateToolFeatured,
  deleteTool, createToolManually,
} from "@/app/actions/admin";
import { toast } from "sonner";
import type { Tool } from "@/drizzle/schema";

const STATUS_OPTIONS = [
  { value: "all",      label: "All Status" },
  { value: "pending",  label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "featured", label: "Featured" },
];

const CATEGORIES = [
  "all", "AI Writing", "AI Coding", "AI Design", "AI Analytics",
  "AI Marketing", "AI Sales", "AI Productivity", "AI Research",
  "AI Customer Support", "AI Finance", "AI HR", "AI Legal",
  "Project Management", "CRM", "Design", "Development", "Analytics",
  "Marketing", "Sales", "Productivity", "Communication", "Finance",
];

const PRICING_MODELS = ["Free", "Freemium", "Paid", "Free Trial", "Open Source"] as const;

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:  "bg-amber-100 text-amber-700 border-amber-200",
    approved: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
    featured: "bg-purple-100 text-purple-700 border-purple-200",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {status}
    </span>
  );
}

function ToolRow({
  tool, onStatusChange, onFeatureToggle, onDelete,
}: {
  tool: Tool;
  onStatusChange: (id: number, status: "pending" | "approved" | "rejected" | "featured") => void;
  onFeatureToggle: (id: number, featured: boolean) => void;
  onDelete: (id: number, name: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {tool.logoUrl ? (
            <img src={tool.logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover border border-slate-200" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-slate-400" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-slate-800 truncate max-w-[160px]">{tool.name}</p>
              {tool.isFeatured && <Sparkles className="w-3 h-3 text-amber-500 flex-shrink-0" />}
            </div>
            <p className="text-xs text-slate-400 truncate max-w-[160px]">{tool.tagline}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">{tool.category}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-slate-500">{tool.pricingModel}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-xs font-medium text-slate-700">{tool.averageRating.toFixed(1)}</span>
          <span className="text-xs text-slate-400">({tool.reviewCount})</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={tool.status} />
      </td>
      <td className="px-4 py-3">
        <p className="text-xs text-slate-400">{new Date(tool.createdAt).toLocaleDateString()}</p>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          {/* Quick approve/reject */}
          {tool.status === "pending" && (
            <>
              <button
                onClick={() => onStatusChange(tool.id, "approved")}
                className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                title="Approve"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => onStatusChange(tool.id, "rejected")}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                title="Reject"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          {/* Edit tool */}
          <a
            href={`/admin/tools/${tool.id}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
            title="Edit tool"
          >
            <Edit2 className="w-4 h-4" />
          </a>
          {/* View on site */}
          <a
            href={`/tools/${tool.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="View on site"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          {/* More menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-slate-200 z-10 overflow-hidden">
                {tool.status !== "approved" && (
                  <button onClick={() => { onStatusChange(tool.id, "approved"); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-green-700 hover:bg-green-50 transition-colors">
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </button>
                )}
                {tool.status !== "featured" && (
                  <button onClick={() => { onStatusChange(tool.id, "featured"); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-purple-700 hover:bg-purple-50 transition-colors">
                    <Sparkles className="w-3.5 h-3.5" /> Set Featured
                  </button>
                )}
                {tool.status !== "pending" && (
                  <button onClick={() => { onStatusChange(tool.id, "pending"); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-amber-700 hover:bg-amber-50 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" /> Set Pending
                  </button>
                )}
                {tool.status !== "rejected" && (
                  <button onClick={() => { onStatusChange(tool.id, "rejected"); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                )}
                <button onClick={() => { onFeatureToggle(tool.id, !tool.isFeatured); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-amber-700 hover:bg-amber-50 transition-colors border-t border-slate-100">
                  <Star className="w-3.5 h-3.5" /> {tool.isFeatured ? "Remove Featured" : "Mark Featured"}
                </button>
                <button onClick={() => { onDelete(tool.id, tool.name); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100">
                  <Trash2 className="w-3.5 h-3.5" /> Delete Product
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Add Product Modal ───────────────────────────────────────────────────────────

function AddToolModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: "", slug: "", tagline: "", websiteUrl: "",
    description: "", logoUrl: "", category: "AI Writing",
    pricingModel: "Freemium" as "Free" | "Freemium" | "Paid" | "Free Trial" | "Open Source",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug || !form.tagline || !form.websiteUrl || !form.description) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      await createToolManually(form);
      toast.success("Tool created successfully");
      onSuccess();
      onClose();
    } catch (e) {
      toast.error("Failed to create tool");
    } finally {
      setSaving(false);
    }
  };

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Add Product Manually</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tool Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: autoSlug(e.target.value) }))}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                placeholder="e.g. AI Writer Pro"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Slug *</label>
              <input
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                placeholder="ai-writer-pro"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tagline *</label>
            <input
              value={form.tagline}
              onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
              className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
              placeholder="One-line description"
              maxLength={200}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Website URL *</label>
            <input
              value={form.websiteUrl}
              onChange={e => setForm(f => ({ ...f, websiteUrl: e.target.value }))}
              className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
              placeholder="https://example.com"
              type="url"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description *</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 resize-none"
              rows={3}
              placeholder="Detailed description of the product..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Category *</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 bg-white"
              >
                {CATEGORIES.filter(c => c !== "all").map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Pricing Model</label>
              <select
                value={form.pricingModel}
                onChange={e => setForm(f => ({ ...f, pricingModel: e.target.value as typeof form.pricingModel }))}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 bg-white"
              >
                {PRICING_MODELS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Logo URL (optional)</label>
            <input
              value={form.logoUrl}
              onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))}
              className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
              placeholder="https://example.com/logo.png"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 h-9 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 h-9 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
              {saving ? "Creating..." : "Create Tool"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminTools({ search, status, category, page });
      setTools(res.tools);
      setTotal(res.total);
    } catch {
      toast.error("Failed to load tools");
    } finally {
      setLoading(false);
    }
  }, [search, status, category, page]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id: number, newStatus: "pending" | "approved" | "rejected" | "featured") => {
    try {
      await updateToolStatus(id, newStatus);
      toast.success(`Tool ${newStatus}`);
      load();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleFeatureToggle = async (id: number, featured: boolean) => {
    try {
      await updateToolFeatured(id, featured);
      toast.success(featured ? "Tool marked as featured" : "Featured removed");
      load();
    } catch {
      toast.error("Failed to update featured status");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTool(id);
      toast.success("Tool deleted");
      setDeleteConfirm(null);
      load();
    } catch {
      toast.error("Failed to delete tool");
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tools</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total.toLocaleString()} products on the platform</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 h-9 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg text-sm font-bold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 h-9 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
          />
        </div>
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="h-9 px-3 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400/30 bg-white"
        >
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={category}
          onChange={e => { setCategory(e.target.value); setPage(1); }}
          className="h-9 px-3 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400/30 bg-white"
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>)}
        </select>
        <button onClick={load} className="h-9 px-3 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tool</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Pricing</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Rating</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Added</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : tools.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <Wrench className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No tools found</p>
                  </td>
                </tr>
              ) : (
                tools.map(tool => (
                  <ToolRow
                    key={tool.id}
                    tool={tool}
                    onStatusChange={handleStatusChange}
                    onFeatureToggle={handleFeatureToggle}
                    onDelete={(id, name) => setDeleteConfirm({ id, name })}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-500">
              Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 h-7 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-100 transition-colors"
              >
                Prev
              </button>
              <span className="px-3 h-7 flex items-center text-xs text-slate-600 font-medium">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 h-7 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-100 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <AddToolModal onClose={() => setShowAddModal(false)} onSuccess={load} />
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Delete Product</h3>
                <p className="text-sm text-slate-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-5">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? All associated reviews and data will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 h-9 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 h-9 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
