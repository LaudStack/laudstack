"use server";

import { db, getUserBySupabaseId } from "@/server/db";
import { comments, users, tools } from "@/drizzle/schema";
import { eq, and, desc, count, gte, lt, isNull, sql, inArray } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;
  return getUserBySupabaseId(authUser.id);
}

async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

// ─── Input validation helpers ────────────────────────────────────────────────

function isValidId(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 && Number.isInteger(value);
}

const MIN_CONTENT_LENGTH = 2;
const MAX_CONTENT_LENGTH = 2000;

function validateContent(content: string): { valid: boolean; trimmed: string; error?: string } {
  const trimmed = content.trim();
  if (!trimmed) {
    return { valid: false, trimmed, error: "Comment cannot be empty" };
  }
  if (trimmed.length < MIN_CONTENT_LENGTH) {
    return { valid: false, trimmed, error: `Comment must be at least ${MIN_CONTENT_LENGTH} characters` };
  }
  if (trimmed.length > MAX_CONTENT_LENGTH) {
    return { valid: false, trimmed, error: `Comment must be ${MAX_CONTENT_LENGTH} characters or less` };
  }
  return { valid: true, trimmed };
}

// ─── Constants ───────────────────────────────────────────────────────────────

/** Number of top-level comments per page */
const PAGE_SIZE = 20;

/** Cooldown between comments from the same user (seconds) */
const RATE_LIMIT_COOLDOWN_SECONDS = 30;

/** Max comments per user per tool per hour */
const RATE_LIMIT_HOURLY_MAX = 10;

/** Max total comments per user per tool */
const RATE_LIMIT_TOTAL_MAX = 50;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CommentWithUser {
  id: number;
  toolId: number;
  userId: number;
  parentCommentId: number | null;
  content: string;
  isDeleted: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    avatarUrl: string | null;
    firstName: string | null;
    lastName: string | null;
  };
  /** Whether this commenter is the founder/owner of this specific stack */
  isFounder: boolean;
  /** Nested replies (single level only) */
  replies: CommentWithUser[];
}

export interface PaginatedComments {
  comments: CommentWithUser[];
  totalCount: number;
  /** Cursor for next page — null means no more pages */
  nextCursor: string | null;
  /** Whether there are more pages */
  hasMore: boolean;
}

// ─── Shared: verify tool is visible and approved ─────────────────────────────

async function getVisibleTool(toolId: number) {
  const tool = await db.query.tools.findFirst({
    where: and(
      eq(tools.id, toolId),
      eq(tools.isVisible, true),
      inArray(tools.status, ["approved", "featured"])
    ),
  });
  return tool ?? null;
}

// ─── Deleted comment placeholder ─────────────────────────────────────────────

const DELETED_PLACEHOLDER: CommentWithUser["user"] = {
  id: 0,
  name: "[deleted]",
  avatarUrl: null,
  firstName: null,
  lastName: null,
};

// ─── Get comments for a tool (cursor-paginated) ─────────────────────────────

export async function getCommentsByToolId(
  toolId: number,
  cursor?: string | null,
): Promise<PaginatedComments> {
  if (!isValidId(toolId)) {
    return { comments: [], totalCount: 0, nextCursor: null, hasMore: false };
  }

  // Only return comments for visible, approved tools
  const tool = await getVisibleTool(toolId);
  if (!tool) {
    return { comments: [], totalCount: 0, nextCursor: null, hasMore: false };
  }

  // Parse cursor (ISO timestamp of the last top-level comment seen)
  let cursorDate: Date | null = null;
  if (cursor) {
    const parsed = new Date(cursor);
    if (!isNaN(parsed.getTime())) {
      cursorDate = parsed;
    }
  }

  // ─── Fetch top-level comments (paginated) ─────────────────────────────────
  const topLevelConditions = [
    eq(comments.toolId, toolId),
    isNull(comments.parentCommentId),
  ];
  if (cursorDate) {
    topLevelConditions.push(lt(comments.createdAt, cursorDate));
  }

  // Fetch PAGE_SIZE + 1 to detect hasMore
  const topLevelRows = await db
    .select({
      id: comments.id,
      toolId: comments.toolId,
      userId: comments.userId,
      parentCommentId: comments.parentCommentId,
      content: comments.content,
      isDeleted: comments.isDeleted,
      isEdited: comments.isEdited,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      userName: users.name,
      userAvatarUrl: users.avatarUrl,
      userFirstName: users.firstName,
      userLastName: users.lastName,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(and(...topLevelConditions))
    .orderBy(desc(comments.createdAt))
    .limit(PAGE_SIZE + 1);

  const hasMore = topLevelRows.length > PAGE_SIZE;
  const pageRows = hasMore ? topLevelRows.slice(0, PAGE_SIZE) : topLevelRows;

  // Compute next cursor from the last item on this page
  const nextCursor = hasMore && pageRows.length > 0
    ? pageRows[pageRows.length - 1].createdAt.toISOString()
    : null;

  // ─── Fetch all replies for the top-level comments on this page ────────────
  const topLevelIds = pageRows.map(r => r.id);
  let replyRows: typeof topLevelRows = [];
  if (topLevelIds.length > 0) {
    replyRows = await db
      .select({
        id: comments.id,
        toolId: comments.toolId,
        userId: comments.userId,
        parentCommentId: comments.parentCommentId,
        content: comments.content,
        isDeleted: comments.isDeleted,
        isEdited: comments.isEdited,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        userName: users.name,
        userAvatarUrl: users.avatarUrl,
        userFirstName: users.firstName,
        userLastName: users.lastName,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(
        and(
          eq(comments.toolId, toolId),
          sql`${comments.parentCommentId} IN (${sql.join(topLevelIds.map(id => sql`${id}`), sql`, `)})`
        )
      )
      .orderBy(comments.createdAt);
  }

  // ─── Determine founder user IDs ───────────────────────────────────────────
  const founderUserIds = new Set<number>();
  if (tool.submittedBy) founderUserIds.add(tool.submittedBy);
  if (tool.claimedBy) founderUserIds.add(tool.claimedBy);

  // ─── Build display name helper ────────────────────────────────────────────
  function displayName(row: {
    userFirstName: string | null;
    userLastName: string | null;
    userName: string | null;
  }): string {
    if (row.userFirstName) {
      return [row.userFirstName, row.userLastName].filter(Boolean).join(" ");
    }
    return row.userName ?? "Anonymous";
  }

  // ─── Convert to CommentWithUser (with soft-delete placeholder) ────────────
  function toComment(row: (typeof topLevelRows)[number]): CommentWithUser {
    // Soft-deleted comments show placeholder content but keep structure
    if (row.isDeleted) {
      return {
        id: row.id,
        toolId: row.toolId,
        userId: row.userId,
        parentCommentId: row.parentCommentId,
        content: "[This comment has been deleted]",
        isDeleted: true,
        isEdited: false,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        user: DELETED_PLACEHOLDER,
        isFounder: false,
        replies: [],
      };
    }

    return {
      id: row.id,
      toolId: row.toolId,
      userId: row.userId,
      parentCommentId: row.parentCommentId,
      content: row.content,
      isDeleted: false,
      isEdited: row.isEdited,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      user: {
        id: row.userId,
        name: displayName(row),
        avatarUrl: row.userAvatarUrl,
        firstName: row.userFirstName,
        lastName: row.userLastName,
      },
      isFounder: founderUserIds.has(row.userId),
      replies: [],
    };
  }

  // ─── Build reply map ──────────────────────────────────────────────────────
  const repliesMap = new Map<number, CommentWithUser[]>();
  for (const row of replyRows) {
    const reply = toComment(row);
    const parentId = row.parentCommentId!;
    const existing = repliesMap.get(parentId) ?? [];
    existing.push(reply);
    repliesMap.set(parentId, existing);
  }

  // ─── Assemble top-level with replies ──────────────────────────────────────
  const topLevel: CommentWithUser[] = [];
  for (const row of pageRows) {
    const comment = toComment(row);
    const replies = repliesMap.get(row.id) ?? [];

    // For soft-deleted top-level comments: only include if they have non-deleted replies
    if (row.isDeleted) {
      const hasActiveReplies = replies.some(r => !r.isDeleted);
      if (!hasActiveReplies) continue; // Skip entirely if no active replies
    }

    // Filter out deleted replies that have no reason to show
    comment.replies = replies.filter(r => !r.isDeleted);
    topLevel.push(comment);
  }

  // ─── Total count (non-deleted only) ───────────────────────────────────────
  const countResult = await db
    .select({ count: count() })
    .from(comments)
    .where(and(eq(comments.toolId, toolId), eq(comments.isDeleted, false)));
  const totalCount = countResult[0]?.count ?? 0;

  return { comments: topLevel, totalCount, nextCursor, hasMore };
}

// ─── Create a comment ─────────────────────────────────────────────────────────

export async function createComment(input: {
  toolId: number;
  content: string;
  parentCommentId?: number | null;
}): Promise<{ success: boolean; comment?: CommentWithUser; error?: string }> {
  const user = await requireAuth();

  // Validate IDs
  if (!isValidId(input.toolId)) {
    return { success: false, error: "Invalid tool ID" };
  }
  if (input.parentCommentId != null && !isValidId(input.parentCommentId)) {
    return { success: false, error: "Invalid parent comment ID" };
  }

  // Validate content
  const { valid, trimmed, error } = validateContent(input.content);
  if (!valid) {
    return { success: false, error };
  }

  // Verify the tool exists AND is visible + approved
  const tool = await getVisibleTool(input.toolId);
  if (!tool) {
    return { success: false, error: "Stack not found" };
  }

  // If this is a reply, verify the parent comment exists and belongs to the same tool
  if (input.parentCommentId) {
    const parent = await db.query.comments.findFirst({
      where: and(
        eq(comments.id, input.parentCommentId),
        eq(comments.toolId, input.toolId),
        eq(comments.isDeleted, false)
      ),
    });
    if (!parent) {
      return { success: false, error: "Parent comment not found" };
    }
    // Prevent nested replies (only 1 level deep)
    if (parent.parentCommentId !== null) {
      return {
        success: false,
        error: "Replies can only be one level deep",
      };
    }
  }

  // ─── Rate limiting ────────────────────────────────────────────────────────

  // 1. Per-user cooldown: 30 seconds between any comments
  const cooldownCutoff = new Date(Date.now() - RATE_LIMIT_COOLDOWN_SECONDS * 1000);
  const recentAny = await db
    .select({ count: count() })
    .from(comments)
    .where(
      and(
        eq(comments.userId, user.id),
        gte(comments.createdAt, cooldownCutoff)
      )
    );

  if (recentAny[0]?.count && recentAny[0].count > 0) {
    return {
      success: false,
      error: "Please wait 30 seconds between comments.",
    };
  }

  // 2. Hourly limit: max 10 comments per user per tool per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await db
    .select({ count: count() })
    .from(comments)
    .where(
      and(
        eq(comments.userId, user.id),
        eq(comments.toolId, input.toolId),
        eq(comments.isDeleted, false),
        gte(comments.createdAt, oneHourAgo)
      )
    );

  if (recentCount[0]?.count && recentCount[0].count >= RATE_LIMIT_HOURLY_MAX) {
    return {
      success: false,
      error: "Too many comments. Please wait before posting again.",
    };
  }

  // 3. Total cap: max 50 comments per tool per user
  const totalUserComments = await db
    .select({ count: count() })
    .from(comments)
    .where(
      and(
        eq(comments.userId, user.id),
        eq(comments.toolId, input.toolId),
        eq(comments.isDeleted, false)
      )
    );

  if (totalUserComments[0]?.count && totalUserComments[0].count >= RATE_LIMIT_TOTAL_MAX) {
    return {
      success: false,
      error: "You have reached the maximum number of comments for this stack",
    };
  }

  // Insert the comment
  const [newComment] = await db
    .insert(comments)
    .values({
      toolId: input.toolId,
      userId: user.id,
      parentCommentId: input.parentCommentId ?? null,
      content: trimmed,
    })
    .returning();

  // Determine founder status
  const founderUserIds = new Set<number>();
  if (tool.submittedBy) founderUserIds.add(tool.submittedBy);
  if (tool.claimedBy) founderUserIds.add(tool.claimedBy);

  const name = user.firstName
    ? [user.firstName, user.lastName].filter(Boolean).join(" ")
    : user.name ?? "Anonymous";

  return {
    success: true,
    comment: {
      id: newComment.id,
      toolId: newComment.toolId,
      userId: newComment.userId,
      parentCommentId: newComment.parentCommentId,
      content: newComment.content,
      isDeleted: newComment.isDeleted,
      isEdited: newComment.isEdited,
      createdAt: newComment.createdAt.toISOString(),
      updatedAt: newComment.updatedAt.toISOString(),
      user: {
        id: user.id,
        name,
        avatarUrl: user.avatarUrl,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      isFounder: founderUserIds.has(user.id),
      replies: [],
    },
  };
}

// ─── Edit a comment ───────────────────────────────────────────────────────────

export async function editComment(input: {
  commentId: number;
  content: string;
}): Promise<{ success: boolean; updatedAt?: string; error?: string }> {
  const user = await requireAuth();

  // Validate ID
  if (!isValidId(input.commentId)) {
    return { success: false, error: "Invalid comment ID" };
  }

  // Validate content
  const { valid, trimmed, error } = validateContent(input.content);
  if (!valid) {
    return { success: false, error };
  }

  // Find the comment and verify ownership
  const comment = await db.query.comments.findFirst({
    where: and(
      eq(comments.id, input.commentId),
      eq(comments.isDeleted, false)
    ),
  });

  if (!comment) {
    return { success: false, error: "Comment not found" };
  }

  if (comment.userId !== user.id) {
    return {
      success: false,
      error: "You can only edit your own comments",
    };
  }

  const now = new Date();
  await db
    .update(comments)
    .set({
      content: trimmed,
      isEdited: true,
      updatedAt: now,
    })
    .where(eq(comments.id, input.commentId));

  return { success: true, updatedAt: now.toISOString() };
}

// ─── Delete a comment (soft delete with placeholder) ─────────────────────────

export async function deleteComment(
  commentId: number
): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
  const user = await requireAuth();

  // Validate ID
  if (!isValidId(commentId)) {
    return { success: false, error: "Invalid comment ID" };
  }

  const comment = await db.query.comments.findFirst({
    where: and(eq(comments.id, commentId), eq(comments.isDeleted, false)),
  });

  if (!comment) {
    return { success: false, error: "Comment not found" };
  }

  // Allow deletion by comment author or admin
  if (comment.userId !== user.id && user.role !== "admin" && user.role !== "super_admin") {
    return {
      success: false,
      error: "You can only delete your own comments",
    };
  }

  const now = new Date();

  // Soft-delete the comment (works for both top-level and replies).
  // Top-level comments with active replies will show as "[deleted]" placeholder in the UI.
  // Top-level comments without replies and all replies are hidden entirely.
  await db
    .update(comments)
    .set({
      isDeleted: true,
      deletedAt: now,
      updatedAt: now,
    })
    .where(eq(comments.id, commentId));

  // If this was a reply, check if the parent is soft-deleted with no remaining active replies.
  // If so, the parent is now an orphaned placeholder — the client will hide it automatically.
  // We don't need to do anything server-side; the getCommentsByToolId query already filters these.

  return { success: true, deletedCount: 1 };
}

// ─── Get comment count for a tool ─────────────────────────────────────────────

export async function getCommentCount(
  toolId: number
): Promise<number> {
  if (!isValidId(toolId)) return 0;

  const result = await db
    .select({ count: count() })
    .from(comments)
    .where(
      and(eq(comments.toolId, toolId), eq(comments.isDeleted, false))
    );
  return result[0]?.count ?? 0;
}
