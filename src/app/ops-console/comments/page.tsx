"use client";
export const dynamic = "force-dynamic";
/**
 * Admin Comments — Moderation Panel
 * View all comments, filter by status, search, soft-delete, restore, permanently delete.
 * Click any comment row to open CommentViewModal for full details.
 */
import { useState, useEffect, useCallback } from "react";
import {
  Search, MessageSquare, Trash2, RefreshCw, Eye, EyeOff,
  CornerDownRight, RotateCcw, Shield, Loader2,
  ChevronLeft, ChevronRight, BarChart3, Clock, Edit3,
  AlertTriangle,
} from "lucide-react";
import {
  getAdminComments,
  getAdminCommentStats,
  adminDeleteComment,
  adminRestoreComment,
  adminPermanentDeleteComment,
} from "@/app/actions/admin-comments";
import { toast } from "sonner";
import CommentViewModal from "@/components/admin/CommentViewModal";

type FilterTab = "all" | "active" | "deleted" | "replies" | "top_level";

// ─── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, accent }: {
  icon: React.ReactNode; label: string; value: string | number;
  accent: "blue" | "green" | "amber" | "red";
}) {
  const colors = {
    blue: "bg-blue-50 border-blue-200 text-blue-600",
    green: "bg-green-50 border-green-200 text-green-600",
    amber: "bg-amber-50 border-amber-200 text-amber-600",
    red: "bg-red-50 border-red-200 text-red-600",
  };
  return (
    <div className={`border rounded-2xl p-4 ${colors[accent]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</span>
      </div>
      <p className="text-2xl font-black">{typeof value === "number" ? value.toLocaleString() : value}</p>
    </div>
  );
}

// ─── Comment Row ────────────────────────────────────────────────────────────
function CommentRow({
  comment,
  onDelete,
  onRestore,
  onPermanentDelete,
  onViewDetails,
}: {
  comment: any;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
  onPermanentDelete: (id: number) => void;
  onViewDetails: (comment: any) => void;
}) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAction = async (action: string, fn: (id: number) => void) => {
    setActionLoading(action);
    try {
      await fn(comment.id);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div
      className={`bg-white border rounded-2xl overflow-hidden transition-all cursor-pointer hover:border-slate-300 ${
        comment.isDeleted ? "border-red-200 bg-red-50/30" : "border-slate-200"
      }`}
      onClick={() => onViewDetails(comment)}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* User avatar */}
          <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black text-slate-600 flex-shrink-0 overflow-hidden">
            {comment.userAvatar ? (
              <img src={comment.userAvatar} alt="" className="w-full h-full object-cover" />
            ) : (
              comment.displayName?.[0]?.toUpperCase() || "U"
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-sm font-bold text-slate-900">{comment.displayName}</span>
              {comment.isDeleted ? (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                  <Trash2 className="w-2.5 h-2.5" /> Deleted
                </span>
              ) : (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                  <Eye className="w-2.5 h-2.5" /> Active
                </span>
              )}
              {comment.parentCommentId && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                  <CornerDownRight className="w-2.5 h-2.5" /> Reply
                </span>
              )}
              {comment.isEdited && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                  <Edit3 className="w-2.5 h-2.5" /> Edited
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              {comment.toolLogo && (
                <img src={comment.toolLogo} alt="" className="w-4 h-4 rounded" />
              )}
              <span>on <strong className="text-slate-600">{comment.toolName || `Tool #${comment.toolId}`}</strong></span>
              <span>&middot;</span>
              <span>{new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
              {comment.userEmail && (
                <>
                  <span>&middot;</span>
                  <span className="truncate max-w-[160px]">{comment.userEmail}</span>
                </>
              )}
            </div>

            <p className={`text-sm leading-relaxed line-clamp-2 ${comment.isDeleted ? "text-red-600 line-through" : "text-slate-700"}`}>
              {comment.content}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100" onClick={e => e.stopPropagation()}>
          {!comment.isDeleted && (
            <button
              onClick={() => handleAction("delete", onDelete)}
              disabled={!!actionLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition-all disabled:opacity-60"
            >
              {actionLoading === "delete" ? <Loader2 className="w-3 h-3 animate-spin" /> : <EyeOff className="w-3 h-3" />}
              Soft Delete
            </button>
          )}
          {comment.isDeleted && (
            <button
              onClick={() => handleAction("restore", onRestore)}
              disabled={!!actionLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-all disabled:opacity-60"
            >
              {actionLoading === "restore" ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
              Restore
            </button>
          )}
          <button
            onClick={() => handleAction("permanent_delete", onPermanentDelete)}
            disabled={!!actionLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all ml-auto disabled:opacity-60"
          >
            {actionLoading === "permanent_delete" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            Delete
          </button>
          <button
            onClick={() => onViewDetails(comment)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all"
          >
            <Eye className="w-3 h-3" /> View
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function AdminComments() {
  const [comments, setComments] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [stats, setStats] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [selectedComment, setSelectedComment] = useState<any | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [commentsRes, statsRes] = await Promise.all([
        getAdminComments({ search, page, filter }),
        getAdminCommentStats(),
      ]);
      setComments(commentsRes.comments);
      setTotal(commentsRes.total);
      setCounts(commentsRes.counts);
      setStats(statsRes);
    } catch {
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [search, page, filter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number) => {
    const res = await adminDeleteComment(id);
    if (res.success) { toast.success("Comment soft-deleted"); load(); }
    else toast.error(res.error || "Failed to delete");
  };

  const handleRestore = async (id: number) => {
    const res = await adminRestoreComment(id);
    if (res.success) { toast.success("Comment restored"); load(); }
    else toast.error(res.error || "Failed to restore");
  };

  const handlePermanentDelete = async (id: number) => {
    if (!confirm("Permanently delete this comment and all its replies? This cannot be undone.")) return;
    const res = await adminPermanentDeleteComment(id);
    if (res.success) { toast.success("Comment permanently deleted"); load(); }
    else toast.error(res.error || "Failed to delete");
  };

  const totalPages = Math.ceil(total / 20);

  const FILTER_TABS: { id: FilterTab; label: string; icon: React.ReactNode; color: string }[] = [
    { id: "all", label: "All", icon: <MessageSquare className="w-3.5 h-3.5" />, color: "text-slate-600" },
    { id: "active", label: "Active", icon: <Eye className="w-3.5 h-3.5" />, color: "text-green-600" },
    { id: "deleted", label: "Deleted", icon: <Trash2 className="w-3.5 h-3.5" />, color: "text-red-600" },
    { id: "top_level", label: "Top-level", icon: <MessageSquare className="w-3.5 h-3.5" />, color: "text-blue-600" },
    { id: "replies", label: "Replies", icon: <CornerDownRight className="w-3.5 h-3.5" />, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-500" /> Comment Moderation
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            {(counts.all || 0).toLocaleString()} total comments &middot; {(counts.active || 0)} active &middot; {(counts.deleted || 0)} deleted
          </p>
        </div>
        <button onClick={load} className="h-9 px-3 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={<MessageSquare className="w-4 h-4" />}
            label="Total Comments"
            value={stats.totalComments}
            accent="blue"
          />
          <StatCard
            icon={<Clock className="w-4 h-4" />}
            label="Today"
            value={stats.commentsToday}
            accent="green"
          />
          <StatCard
            icon={<BarChart3 className="w-4 h-4" />}
            label="This Week"
            value={stats.commentsThisWeek}
            accent="amber"
          />
          <StatCard
            icon={<Trash2 className="w-4 h-4" />}
            label="Deleted"
            value={stats.deletedComments}
            accent="red"
          />
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 overflow-x-auto">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setFilter(tab.id); setPage(1); }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              filter === tab.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span className={filter === tab.id ? tab.color : ""}>{tab.icon}</span>
            {tab.label}
            {(counts[tab.id] ?? 0) > 0 && (
              <span className={`ml-1 text-xs font-black px-1.5 py-0.5 rounded-full ${
                tab.id === "deleted" ? "bg-red-100 text-red-700" :
                tab.id === "active" ? "bg-green-100 text-green-700" :
                "bg-slate-200 text-slate-600"
              }`}>
                {counts[tab.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search comment content..."
          className="w-full pl-9 pr-4 h-10 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
        />
      </div>

      {/* Comments list */}
      <div className="space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded animate-pulse w-1/3" />
                  <div className="h-3 bg-slate-100 rounded animate-pulse w-2/3" />
                  <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2" />
                </div>
              </div>
            </div>
          ))
        ) : comments.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-600 font-semibold">No comments found</p>
            <p className="text-slate-400 text-sm mt-1">
              {filter !== "all" ? `No ${filter} comments to show.` : "No comments match your search."}
            </p>
          </div>
        ) : (
          comments.map(comment => (
            <CommentRow
              key={comment.id}
              comment={comment}
              onDelete={handleDelete}
              onRestore={handleRestore}
              onPermanentDelete={handlePermanentDelete}
              onViewDetails={setSelectedComment}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-xs text-slate-500">
            Page {page} of {totalPages} ({total} total)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-3 h-3" /> Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Next <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Comment View Modal */}
      {selectedComment && (
        <CommentViewModal
          comment={selectedComment}
          onClose={() => setSelectedComment(null)}
          onRefresh={() => { load(); setSelectedComment(null); }}
        />
      )}
    </div>
  );
}
