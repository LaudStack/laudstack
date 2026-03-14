"use client";
/*
 * LaudStack Admin — Reviews Moderation Panel
 * Full moderation: approve, hide, remove, reject flags, view details
 * Filters: all / published / flagged / hidden / pending / removed
 */

import { useState, useEffect, useCallback } from "react";
import {
  Search, Star, Trash2, RefreshCw, AlertTriangle, Eye, EyeOff,
  ThumbsUp, Flag, CheckCircle, XCircle, Shield, Globe, Monitor,
  MessageSquare, ChevronDown, ChevronUp, MoreHorizontal,
} from "lucide-react";
import {
  getAdminReviews,
  deleteReview,
  approveReview,
  hideReview,
  removeReview,
  rejectFlag,
} from "@/app/actions/admin";
import { toast } from "sonner";

type FilterTab = "all" | "published" | "flagged" | "hidden" | "pending" | "removed";

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  published: { bg: "bg-green-100", text: "text-green-700", label: "Published" },
  hidden: { bg: "bg-slate-100", text: "text-slate-600", label: "Hidden" },
  removed: { bg: "bg-red-100", text: "text-red-700", label: "Removed" },
  pending: { bg: "bg-amber-100", text: "text-amber-700", label: "Pending" },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />
      ))}
    </div>
  );
}

function ReviewCard({
  review,
  onApprove,
  onHide,
  onRemove,
  onDelete,
  onRejectFlag,
}: {
  review: any;
  onApprove: (id: number) => void;
  onHide: (id: number, note: string) => void;
  onRemove: (id: number, note: string) => void;
  onDelete: (id: number) => void;
  onRejectFlag: (id: number, note: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [actionNote, setActionNote] = useState("");
  const [activeAction, setActiveAction] = useState<"hide" | "remove" | "delete" | "reject_flag" | null>(null);
  const [processing, setProcessing] = useState(false);

  const statusInfo = STATUS_BADGE[review.status] || STATUS_BADGE.pending;
  const displayName = review.userName || [review.userFirstName, review.userLastName].filter(Boolean).join(" ") || "Anonymous";

  const handleAction = async () => {
    setProcessing(true);
    try {
      if (activeAction === "hide") await onHide(review.id, actionNote);
      else if (activeAction === "remove") await onRemove(review.id, actionNote);
      else if (activeAction === "delete") await onDelete(review.id);
      else if (activeAction === "reject_flag") await onRejectFlag(review.id, actionNote);
    } finally {
      setProcessing(false);
      setActiveAction(null);
      setActionNote("");
    }
  };

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden transition-all ${
      review.isFlagged ? "border-red-300 shadow-red-50 shadow-sm" : "border-slate-200 hover:border-slate-300"
    }`}>
      {/* Main row */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* User avatar */}
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-black text-slate-600 flex-shrink-0">
            {review.userAvatar ? (
              <img src={review.userAvatar} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              displayName[0]?.toUpperCase() || "U"
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-sm font-bold text-slate-900">{displayName}</span>
              <StarRating rating={review.rating} />
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                {statusInfo.label}
              </span>
              {review.isFlagged && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                  <Flag className="w-2.5 h-2.5" /> Flagged
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
              {review.toolLogo && (
                <img src={review.toolLogo} alt="" className="w-4 h-4 rounded" />
              )}
              <span>on <strong className="text-slate-600">{review.toolName || `Tool #${review.toolId}`}</strong></span>
              <span>·</span>
              <span>{new Date(review.createdAt).toLocaleDateString()}</span>
              {review.userEmail && (
                <>
                  <span>·</span>
                  <span>{review.userEmail}</span>
                </>
              )}
            </div>

            {review.title && <h4 className="text-sm font-semibold text-slate-800 mb-1">{review.title}</h4>}
            <p className="text-sm text-slate-600 leading-relaxed">{review.body}</p>

            {review.pros && (
              <div className="mt-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                <strong>Pros:</strong> {review.pros}
              </div>
            )}
            {review.cons && (
              <div className="mt-1 text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2">
                <strong>Cons:</strong> {review.cons}
              </div>
            )}

            {/* Founder reply */}
            {review.founderReply && (
              <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
                <p className="text-xs font-bold text-blue-700 mb-1 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> Founder Response
                </p>
                <p className="text-xs text-blue-800 leading-relaxed">{review.founderReply}</p>
              </div>
            )}

            {/* Flag details */}
            {review.isFlagged && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-xs font-bold text-red-700 mb-1 flex items-center gap-1">
                  <Flag className="w-3 h-3" /> Flag Reason
                </p>
                <p className="text-xs text-red-800 leading-relaxed">{review.flagReason || "No reason provided"}</p>
                {review.flaggedAt && (
                  <p className="text-xs text-red-400 mt-1">Flagged on {new Date(review.flaggedAt).toLocaleDateString()}</p>
                )}
              </div>
            )}

            {/* Moderation history */}
            {review.moderatedAt && (
              <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Moderated on {new Date(review.moderatedAt).toLocaleDateString()}
                {review.moderationNote && <span>— {review.moderationNote}</span>}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Show details"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Action buttons row */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
          {review.status !== "published" && (
            <button
              onClick={() => onApprove(review.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-all"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Approve
            </button>
          )}
          {review.status !== "hidden" && (
            <button
              onClick={() => setActiveAction("hide")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
            >
              <EyeOff className="w-3.5 h-3.5" /> Hide
            </button>
          )}
          {review.status !== "removed" && (
            <button
              onClick={() => setActiveAction("remove")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition-all"
            >
              <XCircle className="w-3.5 h-3.5" /> Remove
            </button>
          )}
          {review.isFlagged && (
            <button
              onClick={() => setActiveAction("reject_flag")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all"
            >
              <Flag className="w-3.5 h-3.5" /> Reject Flag
            </button>
          )}
          <button
            onClick={() => setActiveAction("delete")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-4 pt-0 border-t border-slate-100 bg-slate-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 text-xs">
            <div>
              <p className="text-slate-400 font-semibold mb-0.5">Review ID</p>
              <p className="text-slate-700 font-mono">#{review.id}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold mb-0.5">User ID</p>
              <p className="text-slate-700 font-mono">#{review.userId}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold mb-0.5 flex items-center gap-1"><Globe className="w-3 h-3" /> IP Address</p>
              <p className="text-slate-700 font-mono">{review.ipAddress || "Not captured"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold mb-0.5 flex items-center gap-1"><Monitor className="w-3 h-3" /> User Agent</p>
              <p className="text-slate-700 font-mono truncate max-w-[200px]" title={review.userAgent || ""}>
                {review.userAgent ? review.userAgent.substring(0, 60) + "..." : "Not captured"}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold mb-0.5">Helpful Count</p>
              <p className="text-slate-700">{review.helpfulCount || 0}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold mb-0.5">Verified</p>
              <p className="text-slate-700">{review.isVerified ? "Yes" : "No"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold mb-0.5">Created</p>
              <p className="text-slate-700">{new Date(review.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold mb-0.5">Updated</p>
              <p className="text-slate-700">{review.updatedAt ? new Date(review.updatedAt).toLocaleString() : "Never"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action confirmation panel */}
      {activeAction && (
        <div className="px-5 pb-5 pt-3 border-t border-slate-100 bg-amber-50/50">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <p className="text-sm font-bold text-slate-800">
              {activeAction === "hide" && "Hide this review?"}
              {activeAction === "remove" && "Remove this review?"}
              {activeAction === "delete" && "Permanently delete this review?"}
              {activeAction === "reject_flag" && "Reject the flag on this review?"}
            </p>
          </div>
          {activeAction !== "delete" && (
            <textarea
              value={actionNote}
              onChange={e => setActionNote(e.target.value)}
              placeholder="Add a moderation note (optional)..."
              rows={2}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all resize-none bg-white mb-3"
            />
          )}
          {activeAction === "delete" && (
            <p className="text-xs text-red-600 mb-3">This action is permanent and cannot be undone. The review will be completely removed from the database.</p>
          )}
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => { setActiveAction(null); setActionNote(""); }}
              className="px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl transition-all hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAction}
              disabled={processing}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all disabled:opacity-60 ${
                activeAction === "delete" || activeAction === "remove"
                  ? "text-white bg-red-500 hover:bg-red-600"
                  : activeAction === "reject_flag"
                  ? "text-white bg-blue-500 hover:bg-blue-600"
                  : "text-slate-900 bg-amber-400 hover:bg-amber-300"
              }`}
            >
              {processing ? (
                <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing...</>
              ) : (
                <>
                  {activeAction === "hide" && <><EyeOff className="w-3.5 h-3.5" /> Confirm Hide</>}
                  {activeAction === "remove" && <><XCircle className="w-3.5 h-3.5" /> Confirm Remove</>}
                  {activeAction === "delete" && <><Trash2 className="w-3.5 h-3.5" /> Confirm Delete</>}
                  {activeAction === "reject_flag" && <><Flag className="w-3.5 h-3.5" /> Reject Flag</>}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminReviews({ search, page, filter });
      setReviews(res.reviews);
      setTotal(res.total);
      setCounts(res.counts);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [search, page, filter]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: number) => {
    const res = await approveReview(id);
    if (res.success) { toast.success("Review approved"); load(); }
    else toast.error(res.error || "Failed to approve");
  };

  const handleHide = async (id: number, note: string) => {
    const res = await hideReview(id, note || undefined);
    if (res.success) { toast.success("Review hidden"); load(); }
    else toast.error(res.error || "Failed to hide");
  };

  const handleRemove = async (id: number, note: string) => {
    const res = await removeReview(id, note || undefined);
    if (res.success) { toast.success("Review removed"); load(); }
    else toast.error(res.error || "Failed to remove");
  };

  const handleDelete = async (id: number) => {
    const res = await deleteReview(id);
    if (res.success) { toast.success("Review permanently deleted"); load(); }
    else toast.error(res.error || "Failed to delete");
  };

  const handleRejectFlag = async (id: number, note: string) => {
    const res = await rejectFlag(id, note || undefined);
    if (res.success) { toast.success("Flag rejected"); load(); }
    else toast.error(res.error || "Failed to reject flag");
  };

  const totalPages = Math.ceil(total / 20);

  const FILTER_TABS: { id: FilterTab; label: string; icon: React.ReactNode; color: string }[] = [
    { id: "all", label: "All", icon: <Eye className="w-3.5 h-3.5" />, color: "text-slate-600" },
    { id: "published", label: "Published", icon: <CheckCircle className="w-3.5 h-3.5" />, color: "text-green-600" },
    { id: "flagged", label: "Flagged", icon: <Flag className="w-3.5 h-3.5" />, color: "text-red-600" },
    { id: "pending", label: "Pending", icon: <AlertTriangle className="w-3.5 h-3.5" />, color: "text-amber-600" },
    { id: "hidden", label: "Hidden", icon: <EyeOff className="w-3.5 h-3.5" />, color: "text-slate-500" },
    { id: "removed", label: "Removed", icon: <XCircle className="w-3.5 h-3.5" />, color: "text-red-500" },
  ];

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-500" /> Review Moderation
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {(counts.all || 0).toLocaleString()} total reviews · {(counts.flagged || 0)} flagged · {(counts.pending || 0)} pending
          </p>
        </div>
        <button onClick={load} className="h-9 px-3 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

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
              <span className={`ml-1 text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                tab.id === "flagged" ? "bg-red-100 text-red-700" :
                tab.id === "pending" ? "bg-amber-100 text-amber-700" :
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
          placeholder="Search review content, titles..."
          className="w-full pl-9 pr-4 h-10 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
        />
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded animate-pulse w-1/3" />
                  <div className="h-3 bg-slate-100 rounded animate-pulse w-2/3" />
                  <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2" />
                </div>
              </div>
            </div>
          ))
        ) : reviews.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <Star className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-600 font-semibold">No reviews found</p>
            <p className="text-slate-400 text-sm mt-1">
              {filter !== "all" ? `No ${filter} reviews to show.` : "No reviews match your search."}
            </p>
          </div>
        ) : (
          reviews.map(review => (
            <ReviewCard
              key={review.id}
              review={review}
              onApprove={handleApprove}
              onHide={handleHide}
              onRemove={handleRemove}
              onDelete={handleDelete}
              onRejectFlag={handleRejectFlag}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-xs text-slate-500">
            Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 h-7 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-100 transition-colors">
              Prev
            </button>
            <span className="px-3 h-7 flex items-center text-xs text-slate-600 font-medium">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 h-7 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-100 transition-colors">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
