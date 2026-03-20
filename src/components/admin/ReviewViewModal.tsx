"use client";
/**
 * ReviewViewModal — Full-detail admin review moderation modal
 * 
 * Design: Slide-in overlay panel with comprehensive review data,
 * moderation actions, metadata, and flag details.
 */
import { useState } from "react";
import {
  X, Star, Eye, EyeOff, CheckCircle, XCircle, Flag, Shield,
  Globe, Monitor, ThumbsUp, MessageSquare, Trash2, AlertTriangle,
  RefreshCw, User, Calendar, Hash, ExternalLink, Clock,
} from "lucide-react";
import {
  approveReview,
  hideReview,
  removeReview,
  deleteReview,
  rejectFlag,
} from "@/app/actions/admin";
import { toast } from "sonner";

/* ─── Types ─────────────────────────────────────────────── */
type ReviewData = {
  id: number;
  toolId: number;
  userId: number;
  rating: number;
  title: string | null;
  body: string | null;
  pros: string | null;
  cons: string | null;
  isVerified: boolean;
  helpfulCount: number;
  founderReply: string | null;
  founderReplyAt: Date | null;
  status: string;
  ipAddress: string | null;
  userAgent: string | null;
  isFlagged: boolean;
  flagReason: string | null;
  flaggedBy: number | null;
  flaggedAt: Date | null;
  moderationNote: string | null;
  moderatedBy: number | null;
  moderatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  userName: string | null;
  userFirstName: string | null;
  userLastName: string | null;
  userEmail: string | null;
  userAvatar: string | null;
  toolName: string | null;
  toolSlug: string | null;
  toolLogo: string | null;
};

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  published: { bg: "bg-green-100", text: "text-green-700", label: "Published", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  hidden: { bg: "bg-slate-100", text: "text-slate-600", label: "Hidden", icon: <EyeOff className="w-3.5 h-3.5" /> },
  removed: { bg: "bg-red-100", text: "text-red-700", label: "Removed", icon: <XCircle className="w-3.5 h-3.5" /> },
  pending: { bg: "bg-amber-100", text: "text-amber-700", label: "Pending", icon: <Clock className="w-3.5 h-3.5" /> },
};

function StarRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`${cls} ${i <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />
      ))}
    </div>
  );
}

export default function ReviewViewModal({
  review,
  onClose,
  onRefresh,
}: {
  review: ReviewData;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [moderationNote, setModerationNote] = useState("");
  const [confirmAction, setConfirmAction] = useState<"hide" | "remove" | "delete" | "reject_flag" | null>(null);

  const displayName =
    (review.userFirstName ? [review.userFirstName, review.userLastName].filter(Boolean).join(" ") : null) ??
    review.userName ??
    "Anonymous";

  const statusInfo = STATUS_CONFIG[review.status] || STATUS_CONFIG.pending;

  const handleAction = async (action: string) => {
    setActionLoading(action);
    try {
      let res: any;
      switch (action) {
        case "approve":
          res = await approveReview(review.id);
          if (res.success) toast.success("Review approved");
          break;
        case "hide":
          res = await hideReview(review.id, moderationNote || undefined);
          if (res.success) toast.success("Review hidden");
          break;
        case "remove":
          res = await removeReview(review.id, moderationNote || undefined);
          if (res.success) toast.success("Review removed");
          break;
        case "delete":
          res = await deleteReview(review.id);
          if (res.success) toast.success("Review permanently deleted");
          break;
        case "reject_flag":
          res = await rejectFlag(review.id, moderationNote || undefined);
          if (res.success) toast.success("Flag rejected");
          break;
      }
      if (res?.success) {
        onRefresh();
        if (action === "delete") onClose();
      } else {
        toast.error(res?.error || `Failed to ${action}`);
      }
    } catch {
      toast.error(`Failed to ${action} review`);
    } finally {
      setActionLoading(null);
      setConfirmAction(null);
      setModerationNote("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Review Details</h2>
                <p className="text-xs text-slate-500">ID #{review.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status + Rating */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
              {statusInfo.icon} {statusInfo.label}
            </span>
            <StarRating rating={review.rating} />
            <span className="text-sm font-bold text-slate-700">{review.rating}/5</span>
            {review.isVerified && (
              <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                <CheckCircle className="w-3 h-3" /> Verified
              </span>
            )}
            {review.isFlagged && (
              <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-700">
                <Flag className="w-3 h-3" /> Flagged
              </span>
            )}
          </div>

          {/* User Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-lg font-black text-slate-600 flex-shrink-0 overflow-hidden">
                {review.userAvatar ? (
                  <img src={review.userAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  displayName[0]?.toUpperCase() || "U"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900">{displayName}</p>
                {review.userEmail && (
                  <p className="text-xs text-slate-500">{review.userEmail}</p>
                )}
                <p className="text-xs text-slate-500 mt-0.5">User ID: #{review.userId}</p>
              </div>
            </div>
          </div>

          {/* Tool Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Reviewed Product</p>
            <div className="flex items-center gap-3">
              {review.toolLogo ? (
                <img src={review.toolLogo} alt="" className="w-10 h-10 rounded-xl border border-slate-200" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-500">
                  {review.toolName?.[0] || "?"}
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-slate-900">{review.toolName || `Tool #${review.toolId}`}</p>
                {review.toolSlug && (
                  <a href={`/tools/${review.toolSlug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1">
                    View product page <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Review Content */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Review Content</p>
            {review.title && (
              <h3 className="text-base font-bold text-slate-900">{review.title}</h3>
            )}
            {review.body && (
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{review.body}</p>
            )}
            {review.pros && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <p className="text-xs font-bold text-green-700 mb-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Pros
                </p>
                <p className="text-sm text-green-800 leading-relaxed">{review.pros}</p>
              </div>
            )}
            {review.cons && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-xs font-bold text-red-700 mb-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Cons
                </p>
                <p className="text-sm text-red-800 leading-relaxed">{review.cons}</p>
              </div>
            )}
          </div>

          {/* Founder Reply */}
          {review.founderReply && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-blue-700 mb-2 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" /> Founder Response
              </p>
              <p className="text-sm text-blue-800 leading-relaxed">{review.founderReply}</p>
              {review.founderReplyAt && (
                <p className="text-xs text-blue-400 mt-2">
                  Replied on {new Date(review.founderReplyAt).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Flag Details */}
          {review.isFlagged && (
            <div className="bg-red-50 border border-red-300 rounded-2xl p-4">
              <p className="text-xs font-bold text-red-700 mb-2 flex items-center gap-1">
                <Flag className="w-3.5 h-3.5" /> Flag Details
              </p>
              <p className="text-sm text-red-800 leading-relaxed">{review.flagReason || "No reason provided"}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-red-500">
                {review.flaggedAt && <span>Flagged: {new Date(review.flaggedAt).toLocaleString()}</span>}
                {review.flaggedBy && <span>By user #{review.flaggedBy}</span>}
              </div>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Metadata</p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-500 font-semibold mb-0.5 flex items-center gap-1">
                  <Hash className="w-3 h-3" /> Review ID
                </p>
                <p className="text-slate-700 font-mono">#{review.id}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold mb-0.5 flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" /> Helpful Votes
                </p>
                <p className="text-slate-700">{review.helpfulCount || 0}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold mb-0.5 flex items-center gap-1">
                  <Globe className="w-3 h-3" /> IP Address
                </p>
                <p className="text-slate-700 font-mono">{review.ipAddress || "Not captured"}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold mb-0.5 flex items-center gap-1">
                  <Monitor className="w-3 h-3" /> User Agent
                </p>
                <p className="text-slate-700 font-mono truncate" title={review.userAgent || ""}>
                  {review.userAgent ? review.userAgent.substring(0, 50) + "..." : "Not captured"}
                </p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold mb-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Created
                </p>
                <p className="text-slate-700">{new Date(review.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold mb-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Updated
                </p>
                <p className="text-slate-700">{review.updatedAt ? new Date(review.updatedAt).toLocaleString() : "Never"}</p>
              </div>
            </div>
          </div>

          {/* Moderation History */}
          {review.moderatedAt && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Moderation History
              </p>
              <div className="text-xs text-slate-600">
                <p>Moderated on: {new Date(review.moderatedAt).toLocaleString()}</p>
                {review.moderatedBy && <p>By admin #{review.moderatedBy}</p>}
                {review.moderationNote && <p className="mt-1 italic">Note: {review.moderationNote}</p>}
              </div>
            </div>
          )}

          {/* Moderation Actions */}
          <div className="border-t border-slate-200 pt-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Moderation Actions</p>

            {/* Confirmation panel */}
            {confirmAction && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <p className="text-sm font-bold text-slate-800">
                    {confirmAction === "hide" && "Hide this review?"}
                    {confirmAction === "remove" && "Remove this review?"}
                    {confirmAction === "delete" && "Permanently delete this review?"}
                    {confirmAction === "reject_flag" && "Reject the flag on this review?"}
                  </p>
                </div>
                {confirmAction !== "delete" && (
                  <textarea
                    value={moderationNote}
                    onChange={e => setModerationNote(e.target.value)}
                    placeholder="Add a moderation note (optional)..."
                    rows={2}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none bg-slate-50 mb-3"
                  />
                )}
                {confirmAction === "delete" && (
                  <p className="text-xs text-red-600 mb-3">This action is permanent and cannot be undone.</p>
                )}
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => { setConfirmAction(null); setModerationNote(""); }}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAction(confirmAction)}
                    disabled={!!actionLoading}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all disabled:opacity-60 ${
                      confirmAction === "delete" || confirmAction === "remove"
                        ? "text-white bg-red-500 hover:bg-red-600"
                        : confirmAction === "reject_flag"
                        ? "text-white bg-blue-500 hover:bg-blue-600"
                        : "text-slate-900 bg-amber-400 hover:bg-amber-300"
                    }`}
                  >
                    {actionLoading ? (
                      <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing...</>
                    ) : (
                      "Confirm"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {review.status !== "published" && (
                <button
                  onClick={() => handleAction("approve")}
                  disabled={!!actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-all disabled:opacity-60"
                >
                  {actionLoading === "approve" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  Approve
                </button>
              )}
              {review.status !== "hidden" && (
                <button
                  onClick={() => setConfirmAction("hide")}
                  disabled={!!actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all disabled:opacity-60"
                >
                  <EyeOff className="w-3.5 h-3.5" /> Hide
                </button>
              )}
              {review.status !== "removed" && (
                <button
                  onClick={() => setConfirmAction("remove")}
                  disabled={!!actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition-all disabled:opacity-60"
                >
                  <XCircle className="w-3.5 h-3.5" /> Remove
                </button>
              )}
              {review.isFlagged && (
                <button
                  onClick={() => setConfirmAction("reject_flag")}
                  disabled={!!actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all disabled:opacity-60"
                >
                  <Flag className="w-3.5 h-3.5" /> Reject Flag
                </button>
              )}
              <button
                onClick={() => setConfirmAction("delete")}
                disabled={!!actionLoading}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all ml-auto disabled:opacity-60"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Permanently
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
