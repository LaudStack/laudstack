"use client";
/**
 * CommentViewModal — Full-detail admin comment moderation modal
 * 
 * Design: Slide-in overlay panel with comprehensive comment data,
 * moderation actions, metadata, and parent/reply context.
 */
import { useState } from "react";
import {
  X, MessageSquare, Trash2, AlertTriangle, RefreshCw,
  User, Calendar, Hash, ExternalLink, Clock, CornerDownRight,
  RotateCcw, Eye, EyeOff, Edit3,
} from "lucide-react";
import {
  adminDeleteComment,
  adminRestoreComment,
  adminPermanentDeleteComment,
} from "@/app/actions/admin-comments";
import { toast } from "sonner";

type CommentData = {
  id: number;
  toolId: number;
  userId: number;
  parentCommentId: number | null;
  content: string;
  isDeleted: boolean;
  deletedAt: Date | null;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  displayName: string;
  userName: string | null;
  userFirstName: string | null;
  userLastName: string | null;
  userEmail: string | null;
  userAvatar: string | null;
  toolName: string | null;
  toolSlug: string | null;
  toolLogo: string | null;
};

export default function CommentViewModal({
  comment,
  onClose,
  onRefresh,
}: {
  comment: CommentData;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<"delete" | "restore" | "permanent_delete" | null>(null);

  const handleAction = async (action: string) => {
    setActionLoading(action);
    try {
      let res: any;
      switch (action) {
        case "delete":
          res = await adminDeleteComment(comment.id);
          if (res.success) toast.success("Comment soft-deleted");
          break;
        case "restore":
          res = await adminRestoreComment(comment.id);
          if (res.success) toast.success("Comment restored");
          break;
        case "permanent_delete":
          res = await adminPermanentDeleteComment(comment.id);
          if (res.success) toast.success("Comment permanently deleted");
          break;
      }
      if (res?.success) {
        onRefresh();
        if (action === "permanent_delete") onClose();
      } else {
        toast.error(res?.error || `Failed to ${action}`);
      }
    } catch {
      toast.error(`Failed to ${action} comment`);
    } finally {
      setActionLoading(null);
      setConfirmAction(null);
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
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Comment Details</h2>
                <p className="text-xs text-slate-500">ID #{comment.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status badges */}
          <div className="flex items-center gap-3 flex-wrap">
            {comment.isDeleted ? (
              <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-red-100 text-red-700">
                <Trash2 className="w-3.5 h-3.5" /> Deleted
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-green-100 text-green-700">
                <Eye className="w-3.5 h-3.5" /> Active
              </span>
            )}
            {comment.parentCommentId && (
              <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-blue-100 text-blue-700">
                <CornerDownRight className="w-3.5 h-3.5" /> Reply to #{comment.parentCommentId}
              </span>
            )}
            {!comment.parentCommentId && (
              <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600">
                <MessageSquare className="w-3.5 h-3.5" /> Top-level
              </span>
            )}
            {comment.isEdited && (
              <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-100 text-amber-700">
                <Edit3 className="w-3.5 h-3.5" /> Edited
              </span>
            )}
          </div>

          {/* User Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-lg font-black text-slate-600 flex-shrink-0 overflow-hidden">
                {comment.userAvatar ? (
                  <img src={comment.userAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  comment.displayName[0]?.toUpperCase() || "U"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900">{comment.displayName}</p>
                {comment.userEmail && (
                  <p className="text-xs text-slate-500">{comment.userEmail}</p>
                )}
                <p className="text-xs text-slate-500 mt-0.5">User ID: #{comment.userId}</p>
              </div>
            </div>
          </div>

          {/* Tool Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Commented On</p>
            <div className="flex items-center gap-3">
              {comment.toolLogo ? (
                <img src={comment.toolLogo} alt="" className="w-10 h-10 rounded-xl border border-slate-200" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-500">
                  {comment.toolName?.[0] || "?"}
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-slate-900">{comment.toolName || `Tool #${comment.toolId}`}</p>
                {comment.toolSlug && (
                  <a href={`/tools/${comment.toolSlug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1">
                    View product page <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Comment Content */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Comment Content</p>
            <div className={`rounded-2xl p-4 ${comment.isDeleted ? "bg-red-50 border border-red-200" : "bg-slate-50 border border-slate-200"}`}>
              <p className={`text-sm leading-relaxed whitespace-pre-wrap ${comment.isDeleted ? "text-red-700 line-through" : "text-slate-700"}`}>
                {comment.content}
              </p>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Metadata</p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-500 font-semibold mb-0.5 flex items-center gap-1">
                  <Hash className="w-3 h-3" /> Comment ID
                </p>
                <p className="text-slate-700 font-mono">#{comment.id}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold mb-0.5 flex items-center gap-1">
                  <CornerDownRight className="w-3 h-3" /> Parent ID
                </p>
                <p className="text-slate-700 font-mono">{comment.parentCommentId ? `#${comment.parentCommentId}` : "None (top-level)"}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold mb-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Created
                </p>
                <p className="text-slate-700">{new Date(comment.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold mb-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Updated
                </p>
                <p className="text-slate-700">{new Date(comment.updatedAt).toLocaleString()}</p>
              </div>
              {comment.deletedAt && (
                <div className="col-span-2">
                  <p className="text-slate-500 font-semibold mb-0.5 flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Deleted At
                  </p>
                  <p className="text-red-600 font-mono">{new Date(comment.deletedAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Moderation Actions */}
          <div className="border-t border-slate-200 pt-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Moderation Actions</p>

            {/* Confirmation panel */}
            {confirmAction && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <p className="text-sm font-bold text-slate-800">
                    {confirmAction === "delete" && "Soft-delete this comment?"}
                    {confirmAction === "restore" && "Restore this comment?"}
                    {confirmAction === "permanent_delete" && "Permanently delete this comment and all its replies?"}
                  </p>
                </div>
                {confirmAction === "permanent_delete" && (
                  <p className="text-xs text-red-600 mb-3">This action is permanent and cannot be undone. The comment and all replies will be removed from the database.</p>
                )}
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => setConfirmAction(null)}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAction(confirmAction)}
                    disabled={!!actionLoading}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all disabled:opacity-60 ${
                      confirmAction === "permanent_delete"
                        ? "text-white bg-red-500 hover:bg-red-600"
                        : confirmAction === "restore"
                        ? "text-white bg-green-500 hover:bg-green-600"
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
              {!comment.isDeleted && (
                <button
                  onClick={() => setConfirmAction("delete")}
                  disabled={!!actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition-all disabled:opacity-60"
                >
                  <EyeOff className="w-3.5 h-3.5" /> Soft Delete
                </button>
              )}
              {comment.isDeleted && (
                <button
                  onClick={() => setConfirmAction("restore")}
                  disabled={!!actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-all disabled:opacity-60"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restore
                </button>
              )}
              <button
                onClick={() => setConfirmAction("permanent_delete")}
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
