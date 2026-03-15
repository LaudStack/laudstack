"use client";

/**
 * CommentsSection — LaudStack
 *
 * Product-level commenting system for stack detail pages.
 * Features:
 * - Cursor-based pagination (load more)
 * - Supabase Realtime subscriptions for live updates
 * - Soft-delete with "[deleted]" placeholder UI
 * - Auth-gated comment creation
 * - Single-level replies (no deeper nesting)
 * - Founder badge for stack owner/claimer
 * - Edit/delete own comments
 * - 30-second rate limiting feedback
 * - Loading skeleton & empty state
 * - Mobile responsive
 * - Error boundary wrapper for resilience
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Send,
  CornerDownRight,
  Edit2,
  Trash2,
  Loader2,
  Shield,
  ChevronDown,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  getCommentsByToolId,
  createComment,
  editComment,
  deleteComment,
  type CommentWithUser,
  type PaginatedComments,
} from "@/app/actions/comments";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  toolId: number;
  isAuthenticated: boolean;
  currentUserId: number | null;
  onAuthRequired: () => void;
  /** Optional callback to report comment count changes to parent */
  onCountChange?: (count: number) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  if (isNaN(then)) return "";
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
      // eslint-disable-next-line @next/next/no-img-element
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
        background: user.name === "[deleted]" ? "#CBD5E1" : avatarColor(user.name),
      }}
    >
      <span
        className="text-white font-bold"
        style={{ fontSize: size * 0.38 }}
      >
        {user.name === "[deleted]" ? "?" : getInitials(user.name)}
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
    if (!trimmed || trimmed.length < 2 || submitting) return;
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

  const trimmedLen = content.trim().length;
  const hasContent = trimmedLen >= 2;

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
          {content.length > 0 && (
            <>
              {content.length}/2000
              {trimmedLen > 0 && trimmedLen < 2 && (
                <span className="ml-1 text-red-400">min 2 chars</span>
              )}
            </>
          )}
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
            disabled={submitting || !hasContent}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed border-none cursor-pointer"
            style={{
              background:
                hasContent && !submitting ? "#F59E0B" : "#E2E8F0",
              color: hasContent && !submitting ? "#0A0A0A" : "#94A3B8",
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

  // Sync editContent when comment.content changes
  useEffect(() => {
    if (!editing) {
      setEditContent(comment.content);
    }
  }, [comment.content, editing]);

  const isOwner = currentUserId === comment.userId;

  const handleSaveEdit = async () => {
    const trimmed = editContent.trim();
    if (!trimmed || trimmed.length < 2 || saving) return;
    setSaving(true);
    try {
      await onEdit(comment.id, trimmed);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await onDelete(comment.id);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  // ─── Soft-deleted comment placeholder ─────────────────────────────────────
  if (comment.isDeleted) {
    return (
      <div className={`flex gap-3 ${isReply ? "ml-0" : ""} opacity-60`}>
        <UserAvatar user={comment.user} size={isReply ? 30 : 36} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[13px] font-medium text-slate-400 italic">
              [deleted]
            </span>
            <span className="text-[11px] text-slate-300">
              {timeAgo(comment.createdAt)}
            </span>
          </div>
          <p className="text-[13px] text-slate-400 italic leading-relaxed m-0">
            [This comment has been deleted]
          </p>
        </div>
      </div>
    );
  }

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
                if (e.key === "Escape") {
                  setEditing(false);
                  setEditContent(comment.content);
                }
              }}
            />
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-slate-400 mr-auto">
                {editContent.length}/2000
                {editContent.trim().length > 0 && editContent.trim().length < 2 && (
                  <span className="ml-1 text-red-400">min 2 chars</span>
                )}
              </span>
              <button
                onClick={handleSaveEdit}
                disabled={saving || editContent.trim().length < 2}
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

// ─── Error Boundary Wrapper ──────────────────────────────────────────────────

function CommentsFallback() {
  return (
    <section
      id="section-comments"
      className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7"
      style={{ boxShadow: "0 1px 4px rgba(15,23,42,0.04)" }}
    >
      <div className="text-center py-10">
        <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-sm font-semibold text-slate-500 mb-1">
          Unable to load comments
        </p>
        <p className="text-xs text-slate-400">
          Please refresh the page to try again.
        </p>
      </div>
    </section>
  );
}

// ─── New Comments Banner ─────────────────────────────────────────────────────

function NewCommentsBanner({ count, onRefresh }: { count: number; onRefresh: () => void }) {
  if (count <= 0) return null;
  return (
    <button
      onClick={onRefresh}
      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 cursor-pointer transition-all hover:bg-amber-100 mb-4"
    >
      <RefreshCw className="w-3.5 h-3.5" />
      {count === 1 ? "1 new comment" : `${count} new comments`} — click to refresh
    </button>
  );
}

// ─── Main CommentsSection ─────────────────────────────────────────────────────

function CommentsSectionInner({
  toolId,
  isAuthenticated,
  currentUserId,
  onAuthRequired,
  onCountChange,
}: Props) {
  const [commentsList, setCommentsList] = useState<CommentWithUser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [newRealtimeCount, setNewRealtimeCount] = useState(0);

  // Track known comment IDs to detect new ones from Realtime
  const knownIdsRef = useRef(new Set<number>());

  // Notify parent of count changes
  useEffect(() => {
    onCountChange?.(totalCount);
  }, [totalCount, onCountChange]);

  // ─── Fetch comments (initial or refresh) ──────────────────────────────────
  const fetchComments = useCallback(async (cursorVal?: string | null) => {
    try {
      setLoadError(false);
      const data: PaginatedComments = await getCommentsByToolId(toolId, cursorVal ?? undefined);

      if (!cursorVal) {
        // Initial load or refresh — replace everything
        setCommentsList(data.comments);
        knownIdsRef.current = new Set(
          data.comments.flatMap(c => [c.id, ...c.replies.map(r => r.id)])
        );
      } else {
        // Load more — append
        setCommentsList((prev) => {
          const existingIds = new Set(prev.map(c => c.id));
          const newComments = data.comments.filter(c => !existingIds.has(c.id));
          const combined = [...prev, ...newComments];
          knownIdsRef.current = new Set(
            combined.flatMap(c => [c.id, ...c.replies.map(r => r.id)])
          );
          return combined;
        });
      }

      setTotalCount(data.totalCount);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch {
      setLoadError(true);
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [toolId]);

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    setCommentsList([]);
    setNextCursor(null);
    setHasMore(false);
    setNewRealtimeCount(0);
    knownIdsRef.current = new Set();
    fetchComments(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolId]);

  // ─── Supabase Realtime subscription ───────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`comments-tool-${toolId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `tool_id=eq.${toolId}`,
        },
        (payload) => {
          const newRecord = payload.new as { id?: number; is_deleted?: boolean } | undefined;
          const oldRecord = payload.old as { id?: number } | undefined;

          if (payload.eventType === "INSERT" && newRecord?.id) {
            // Only show banner if this is a comment we don't already know about
            if (!knownIdsRef.current.has(newRecord.id)) {
              setNewRealtimeCount((c) => c + 1);
            }
          } else if (payload.eventType === "UPDATE") {
            // If a comment was soft-deleted or edited, bump the refresh counter
            if (newRecord?.id && knownIdsRef.current.has(newRecord.id)) {
              // If it was soft-deleted, update local state immediately
              if (newRecord.is_deleted) {
                setCommentsList((prev) =>
                  prev.map((c) => {
                    if (c.id === newRecord.id) {
                      return {
                        ...c,
                        isDeleted: true,
                        content: "[This comment has been deleted]",
                        user: { id: 0, name: "[deleted]", avatarUrl: null, firstName: null, lastName: null },
                      };
                    }
                    return {
                      ...c,
                      replies: c.replies.map((r) =>
                        r.id === newRecord.id
                          ? {
                              ...r,
                              isDeleted: true,
                              content: "[This comment has been deleted]",
                              user: { id: 0, name: "[deleted]", avatarUrl: null, firstName: null, lastName: null },
                            }
                          : r
                      ),
                    };
                  })
                );
              }
            }
          } else if (payload.eventType === "DELETE" && oldRecord?.id) {
            // Hard delete (shouldn't happen with soft-delete, but handle gracefully)
            setCommentsList((prev) => {
              const filtered = prev.filter((c) => c.id !== oldRecord.id);
              return filtered.map((c) => ({
                ...c,
                replies: c.replies.filter((r) => r.id !== oldRecord.id),
              }));
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toolId]);

  // ─── Handle refresh from Realtime banner ──────────────────────────────────
  const handleRealtimeRefresh = useCallback(() => {
    setNewRealtimeCount(0);
    setLoading(true);
    setCommentsList([]);
    setNextCursor(null);
    setHasMore(false);
    fetchComments(null);
  }, [fetchComments]);

  // ─── Load more (pagination) ───────────────────────────────────────────────
  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore || !nextCursor) return;
    setLoadingMore(true);
    fetchComments(nextCursor);
  }, [loadingMore, hasMore, nextCursor, fetchComments]);

  // ─── Create top-level comment ─────────────────────────────────────────────
  const handleCreateComment = async (content: string) => {
    try {
      const result = await createComment({ toolId, content });
      if (result.success && result.comment) {
        setCommentsList((prev) => [result.comment!, ...prev]);
        knownIdsRef.current.add(result.comment.id);
        setTotalCount((c) => c + 1);
        toast.success("Comment posted");
      } else {
        toast.error(result.error ?? "Failed to post comment");
      }
    } catch {
      toast.error("Failed to post comment. Please try again.");
    }
  };

  // ─── Create reply ─────────────────────────────────────────────────────────
  const handleReply = async (parentId: number, content: string) => {
    try {
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
        knownIdsRef.current.add(result.comment.id);
        setTotalCount((c) => c + 1);
        setReplyingTo(null);
        toast.success("Reply posted");
      } else {
        toast.error(result.error ?? "Failed to post reply");
      }
    } catch {
      toast.error("Failed to post reply. Please try again.");
    }
  };

  // ─── Edit comment ─────────────────────────────────────────────────────────
  const handleEdit = async (commentId: number, content: string) => {
    try {
      const result = await editComment({ commentId, content });
      if (result.success) {
        const updatedAt = result.updatedAt ?? new Date().toISOString();
        setCommentsList((prev) =>
          prev.map((c) => {
            if (c.id === commentId) {
              return { ...c, content, isEdited: true, updatedAt };
            }
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.id === commentId ? { ...r, content, isEdited: true, updatedAt } : r
              ),
            };
          })
        );
        toast.success("Comment updated");
      } else {
        toast.error(result.error ?? "Failed to update comment");
      }
    } catch {
      toast.error("Failed to update comment. Please try again.");
    }
  };

  // ─── Delete comment ───────────────────────────────────────────────────────
  const handleDelete = async (commentId: number) => {
    try {
      const result = await deleteComment(commentId);
      if (result.success) {
        // With soft-delete, the comment becomes a placeholder
        // Update local state to show [deleted] immediately
        setCommentsList((prev) => {
          return prev.map((c) => {
            if (c.id === commentId) {
              // Top-level comment deleted
              if (c.replies.length > 0) {
                // Has replies — show as placeholder
                return {
                  ...c,
                  isDeleted: true,
                  content: "[This comment has been deleted]",
                  user: { id: 0, name: "[deleted]", avatarUrl: null, firstName: null, lastName: null },
                  isFounder: false,
                  isEdited: false,
                };
              } else {
                // No replies — remove entirely
                return null as unknown as CommentWithUser;
              }
            }
            // Check if it's a reply being deleted
            const updatedReplies = c.replies.filter((r) => r.id !== commentId);
            // If parent was [deleted] and now has no more replies, remove parent too
            if (c.isDeleted && updatedReplies.length === 0) {
              return null as unknown as CommentWithUser;
            }
            return { ...c, replies: updatedReplies };
          }).filter(Boolean);
        });
        setTotalCount((c) => Math.max(0, c - (result.deletedCount ?? 1)));
        toast.success("Comment deleted");
      } else {
        toast.error(result.error ?? "Failed to delete comment");
      }
    } catch {
      toast.error("Failed to delete comment. Please try again.");
    }
  };

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

      {/* Realtime new comments banner */}
      <NewCommentsBanner count={newRealtimeCount} onRefresh={handleRealtimeRefresh} />

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col gap-5">
          <CommentSkeleton />
          <CommentSkeleton />
          <CommentSkeleton />
        </div>
      )}

      {/* Error state */}
      {!loading && loadError && (
        <div className="text-center py-10 sm:py-12">
          <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-sm font-semibold text-slate-500 mb-2">
            Failed to load comments
          </p>
          <button
            onClick={() => {
              setLoading(true);
              fetchComments(null);
            }}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 bg-transparent border-none cursor-pointer"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !loadError && commentsList.length === 0 && (
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
      {!loading && !loadError && commentsList.length > 0 && (
        <div className="flex flex-col gap-5">
          {commentsList.map((comment) => (
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
                      onReply={() => setReplyingTo(comment.id)}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isReply
                    />
                  ))}
                </div>
              )}

              {/* Reply composer */}
              {replyingTo === comment.id && !comment.isDeleted && (
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

          {/* Load more (cursor pagination) */}
          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 cursor-pointer transition-all hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  Load more comments
                </>
              )}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

// ─── Error Boundary ─────────────────────────────────────────────────────────

class CommentsErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <CommentsFallback />;
    }
    return this.props.children;
  }
}

// ─── Exported wrapper ───────────────────────────────────────────────────────

export default function CommentsSection(props: Props) {
  return (
    <CommentsErrorBoundary>
      <CommentsSectionInner {...props} />
    </CommentsErrorBoundary>
  );
}
