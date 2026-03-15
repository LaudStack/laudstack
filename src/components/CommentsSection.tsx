"use client";

/**
 * CommentsSection — LaudStack
 *
 * Product-level commenting system for stack detail pages.
 * Features:
 * - Auth-gated comment creation
 * - Single-level replies
 * - Founder badge for stack owner/claimer
 * - Edit/delete own comments
 * - Loading skeleton & empty state
 * - Mobile responsive
 */

import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  Send,
  CornerDownRight,
  Edit2,
  Trash2,
  Loader2,
  X,
  Shield,
  ChevronDown,
  ChevronUp,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  getCommentsByToolId,
  createComment,
  editComment,
  deleteComment,
  type CommentWithUser,
} from "@/app/actions/comments";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  toolId: number;
  isAuthenticated: boolean;
  currentUserId: number | null;
  onAuthRequired: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years}y ago`;
  if (months > 0) return `${months}mo ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function avatarColor(name: string): string {
  const hue = (name.charCodeAt(0) * 7 + (name.charCodeAt(1) || 0) * 13) % 360;
  return `hsl(${hue}, 45%, 52%)`;
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function CommentSkeleton() {
  return (
    <div className="flex gap-3 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-24 bg-slate-200 rounded" />
          <div className="h-3 w-12 bg-slate-100 rounded" />
        </div>
        <div className="h-3.5 w-full bg-slate-100 rounded" />
        <div className="h-3.5 w-3/4 bg-slate-100 rounded" />
      </div>
    </div>
  );
}

// ─── Avatar Component ─────────────────────────────────────────────────────────

function UserAvatar({
  user,
  size = 36,
}: {
  user: CommentWithUser["user"];
  size?: number;
}) {
  const [imgErr, setImgErr] = useState(false);

  if (user.avatarUrl && !imgErr) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
        onError={() => setImgErr(true)}
      />
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        background: avatarColor(user.name),
      }}
    >
      <span
        className="text-white font-bold"
        style={{ fontSize: size * 0.38 }}
      >
        {getInitials(user.name)}
      </span>
    </div>
  );
}

// ─── Comment Composer ─────────────────────────────────────────────────────────

function CommentComposer({
  onSubmit,
  isAuthenticated,
  onAuthRequired,
  placeholder = "Share your thoughts...",
  autoFocus = false,
  onCancel,
  isReply = false,
}: {
  onSubmit: (content: string) => Promise<void>;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
  isReply?: boolean;
}) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    const trimmed = content.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
      setContent("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape" && onCancel) {
      onCancel();
    }
  };

  return (
    <div
      className={`bg-white border rounded-xl transition-all ${
        isReply
          ? "border-slate-200"
          : "border-slate-200 shadow-sm"
      }`}
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          isAuthenticated ? placeholder : "Sign in to leave a comment..."
        }
        autoFocus={autoFocus}
        onClick={() => {
          if (!isAuthenticated) onAuthRequired();
        }}
        readOnly={!isAuthenticated}
        className="w-full resize-none border-none bg-transparent text-sm text-gray-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
        style={{
          padding: isReply ? "10px 14px" : "14px 16px",
          minHeight: isReply ? "60px" : "80px",
          cursor: isAuthenticated ? "text" : "pointer",
        }}
        maxLength={2000}
      />
      <div
        className="flex items-center justify-between gap-2 px-3 pb-3"
        style={{ paddingTop: 0 }}
      >
        <span className="text-[11px] text-slate-400">
          {content.length > 0 && `${content.length}/2000`}
        </span>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-md bg-transparent border-none cursor-pointer transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={submitting || (!isAuthenticated && false) || !content.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed border-none cursor-pointer"
            style={{
              background:
                content.trim() && !submitting ? "#F59E0B" : "#E2E8F0",
              color: content.trim() && !submitting ? "#0A0A0A" : "#94A3B8",
            }}
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            {isReply ? "Reply" : "Comment"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Single Comment ───────────────────────────────────────────────────────────

function CommentItem({
  comment,
  currentUserId,
  isAuthenticated,
  onAuthRequired,
  onReply,
  onEdit,
  onDelete,
  isReply = false,
}: {
  comment: CommentWithUser;
  currentUserId: number | null;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
  onReply: (parentId: number) => void;
  onEdit: (commentId: number, content: string) => Promise<void>;
  onDelete: (commentId: number) => Promise<void>;
  isReply?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isOwner = currentUserId === comment.userId;

  const handleSaveEdit = async () => {
    const trimmed = editContent.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await onEdit(comment.id, trimmed);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(comment.id);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className={`flex gap-3 ${isReply ? "ml-0" : ""}`}>
      <UserAvatar user={comment.user} size={isReply ? 30 : 36} />
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span
            className="text-[13px] font-bold text-gray-900 truncate"
            style={{ maxWidth: "160px" }}
          >
            {comment.user.name}
          </span>
          {comment.isFounder && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <Shield className="w-2.5 h-2.5" />
              Founder
            </span>
          )}
          <span className="text-[11px] text-slate-400">
            {timeAgo(comment.createdAt)}
          </span>
          {comment.isEdited && (
            <span className="text-[10px] text-slate-400 italic">edited</span>
          )}
        </div>

        {/* Content */}
        {editing ? (
          <div className="mt-1">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full resize-none border border-slate-200 rounded-lg bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all"
              style={{ padding: "10px 12px", minHeight: "60px" }}
              maxLength={2000}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleSaveEdit();
                }
                if (e.key === "Escape") setEditing(false);
              }}
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleSaveEdit}
                disabled={saving || !editContent.trim()}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold bg-amber-400 text-gray-900 border-none cursor-pointer transition-all disabled:opacity-40 hover:bg-amber-500"
              >
                {saving ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : null}
                Save
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setEditContent(comment.content);
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-md bg-transparent border-none cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-[13px] text-slate-700 leading-relaxed m-0 whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        )}

        {/* Actions */}
        {!editing && (
          <div className="flex items-center gap-3 mt-2">
            {/* Reply button — only on top-level comments */}
            {!isReply && (
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    onAuthRequired();
                    return;
                  }
                  onReply(comment.id);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-amber-600 bg-transparent border-none cursor-pointer transition-colors px-0"
              >
                <CornerDownRight className="w-3 h-3" />
                Reply
              </button>
            )}
            {/* Edit / Delete — only for comment owner */}
            {isOwner && !confirmDelete && (
              <>
                <button
                  onClick={() => {
                    setEditContent(comment.content);
                    setEditing(true);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-blue-600 bg-transparent border-none cursor-pointer transition-colors px-0"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-red-600 bg-transparent border-none cursor-pointer transition-colors px-0"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </>
            )}
            {/* Delete confirmation */}
            {isOwner && confirmDelete && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-red-500 font-semibold">
                  Delete this comment?
                </span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-[11px] font-bold text-red-600 hover:text-red-700 bg-transparent border-none cursor-pointer px-0"
                >
                  {deleting ? "Deleting..." : "Yes, delete"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 bg-transparent border-none cursor-pointer px-0"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main CommentsSection ─────────────────────────────────────────────────────

export default function CommentsSection({
  toolId,
  isAuthenticated,
  currentUserId,
  onAuthRequired,
}: Props) {
  const [commentsList, setCommentsList] = useState<CommentWithUser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [showAllComments, setShowAllComments] = useState(false);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      const data = await getCommentsByToolId(toolId);
      setCommentsList(data.comments);
      setTotalCount(data.totalCount);
    } catch {
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [toolId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Create top-level comment
  const handleCreateComment = async (content: string) => {
    const result = await createComment({ toolId, content });
    if (result.success && result.comment) {
      setCommentsList((prev) => [result.comment!, ...prev]);
      setTotalCount((c) => c + 1);
      toast.success("Comment posted");
    } else {
      toast.error(result.error ?? "Failed to post comment");
    }
  };

  // Create reply
  const handleReply = async (parentId: number, content: string) => {
    const result = await createComment({
      toolId,
      content,
      parentCommentId: parentId,
    });
    if (result.success && result.comment) {
      setCommentsList((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...c.replies, result.comment!] }
            : c
        )
      );
      setTotalCount((c) => c + 1);
      setReplyingTo(null);
      toast.success("Reply posted");
    } else {
      toast.error(result.error ?? "Failed to post reply");
    }
  };

  // Edit comment
  const handleEdit = async (commentId: number, content: string) => {
    const result = await editComment({ commentId, content });
    if (result.success) {
      // Update in top-level
      setCommentsList((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            return { ...c, content, isEdited: true };
          }
          // Check replies
          return {
            ...c,
            replies: c.replies.map((r) =>
              r.id === commentId ? { ...r, content, isEdited: true } : r
            ),
          };
        })
      );
      toast.success("Comment updated");
    } else {
      toast.error(result.error ?? "Failed to update comment");
    }
  };

  // Delete comment
  const handleDelete = async (commentId: number) => {
    const result = await deleteComment(commentId);
    if (result.success) {
      // Remove from top-level or replies
      setCommentsList((prev) => {
        // If it's a top-level comment, remove it and its replies
        const filtered = prev.filter((c) => c.id !== commentId);
        // If it's a reply, remove from parent's replies
        return filtered.map((c) => ({
          ...c,
          replies: c.replies.filter((r) => r.id !== commentId),
        }));
      });
      setTotalCount((c) => Math.max(0, c - 1));
      toast.success("Comment deleted");
    } else {
      toast.error(result.error ?? "Failed to delete comment");
    }
  };

  // Display logic — show first 5 top-level comments by default
  const INITIAL_DISPLAY = 5;
  const displayedComments = showAllComments
    ? commentsList
    : commentsList.slice(0, INITIAL_DISPLAY);
  const hasMore = commentsList.length > INITIAL_DISPLAY;

  return (
    <section
      id="section-comments"
      className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7"
      style={{ boxShadow: "0 1px 4px rgba(15,23,42,0.04)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6 flex-wrap">
        <div className="flex items-center gap-2.5">
          <h2
            className="text-base sm:text-lg font-extrabold text-gray-900 m-0"
            style={{ letterSpacing: "-0.02em" }}
          >
            Discussion
          </h2>
          {totalCount > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
              {totalCount}
            </span>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="mb-6">
        <CommentComposer
          onSubmit={handleCreateComment}
          isAuthenticated={isAuthenticated}
          onAuthRequired={onAuthRequired}
          placeholder="Share your thoughts, ask a question, or give feedback..."
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col gap-5">
          <CommentSkeleton />
          <CommentSkeleton />
          <CommentSkeleton />
        </div>
      )}

      {/* Empty state */}
      {!loading && commentsList.length === 0 && (
        <div className="text-center py-10 sm:py-12">
          <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-500 mb-1">
            No comments yet
          </p>
          <p className="text-xs text-slate-400">
            Be the first to share your thoughts about this stack.
          </p>
        </div>
      )}

      {/* Comments list */}
      {!loading && commentsList.length > 0 && (
        <div className="flex flex-col gap-5">
          {displayedComments.map((comment) => (
            <div key={comment.id}>
              {/* Top-level comment */}
              <CommentItem
                comment={comment}
                currentUserId={currentUserId}
                isAuthenticated={isAuthenticated}
                onAuthRequired={onAuthRequired}
                onReply={(parentId) => setReplyingTo(parentId)}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />

              {/* Replies */}
              {comment.replies.length > 0 && (
                <div className="ml-8 sm:ml-12 mt-3 flex flex-col gap-3 pl-4 border-l-2 border-slate-100">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      currentUserId={currentUserId}
                      isAuthenticated={isAuthenticated}
                      onAuthRequired={onAuthRequired}
                      onReply={(parentId) =>
                        setReplyingTo(comment.id)
                      }
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isReply
                    />
                  ))}
                </div>
              )}

              {/* Reply composer */}
              {replyingTo === comment.id && (
                <div className="ml-8 sm:ml-12 mt-3 pl-4 border-l-2 border-amber-200">
                  <CommentComposer
                    onSubmit={(content) =>
                      handleReply(comment.id, content)
                    }
                    isAuthenticated={isAuthenticated}
                    onAuthRequired={onAuthRequired}
                    placeholder={`Reply to ${comment.user.name}...`}
                    autoFocus
                    onCancel={() => setReplyingTo(null)}
                    isReply
                  />
                </div>
              )}
            </div>
          ))}

          {/* Show more / less */}
          {hasMore && (
            <button
              onClick={() => setShowAllComments(!showAllComments)}
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 cursor-pointer transition-all hover:bg-slate-100 hover:text-slate-700"
            >
              {showAllComments ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  Show all {commentsList.length} comments
                </>
              )}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
