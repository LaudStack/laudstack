"use server";

import { db, getUserBySupabaseId } from "@/server/db";
import { comments, users, tools } from "@/drizzle/schema";
import { eq, and, desc, count, gte } from "drizzle-orm";
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

// ─── Shared: verify tool is visible and approved ─────────────────────────────

async function getVisibleTool(toolId: number) {
  const tool = await db.query.tools.findFirst({
    where: and(
      eq(tools.id, toolId),
      eq(tools.isVisible, true),
      eq(tools.status, "approved")
    ),
  });
  return tool ?? null;
}

// ─── Get comments for a tool ──────────────────────────────────────────────────

export async function getCommentsByToolId(
  toolId: number
): Promise<{ comments: CommentWithUser[]; totalCount: number }> {
  if (!isValidId(toolId)) {
    return { comments: [], totalCount: 0 };
  }

  // Only return comments for visible, approved tools
  const tool = await getVisibleTool(toolId);
  if (!tool) {
    return { comments: [], totalCount: 0 };
  }

  // Fetch all non-deleted comments for this tool with user info
  const allComments = await db
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
    .where(and(eq(comments.toolId, toolId), eq(comments.isDeleted, false)))
    .orderBy(desc(comments.createdAt));

  // Determine founder user IDs (submittedBy or claimedBy)
  const founderUserIds = new Set<number>();
  if (tool.submittedBy) founderUserIds.add(tool.submittedBy);
  if (tool.claimedBy) founderUserIds.add(tool.claimedBy);

  // Build display name helper
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

  // Convert to CommentWithUser
  function toComment(row: (typeof allComments)[number]): CommentWithUser {
    return {
      id: row.id,
      toolId: row.toolId,
      userId: row.userId,
      parentCommentId: row.parentCommentId,
      content: row.content,
      isDeleted: row.isDeleted,
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

  // Separate top-level comments and replies
  const topLevel: CommentWithUser[] = [];
  const repliesMap = new Map<number, CommentWithUser[]>();

  for (const row of allComments) {
    const comment = toComment(row);
    if (row.parentCommentId === null) {
      topLevel.push(comment);
    } else {
      const existing = repliesMap.get(row.parentCommentId) ?? [];
      existing.push(comment);
      repliesMap.set(row.parentCommentId, existing);
    }
  }

  // Attach replies to their parent comments (sorted oldest first for readability)
  for (const parent of topLevel) {
    const replies = repliesMap.get(parent.id) ?? [];
    parent.replies = replies.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  // Total count includes both top-level and replies
  const totalCount = allComments.length;

  return { comments: topLevel, totalCount };
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

  // Time-based rate limit: max 10 comments per user per tool per hour
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

  if (recentCount[0]?.count && recentCount[0].count >= 10) {
    return {
      success: false,
      error: "Too many comments. Please wait before posting again.",
    };
  }

  // Total cap: max 50 comments per tool per user
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

  if (totalUserComments[0]?.count && totalUserComments[0].count >= 50) {
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

// ─── Delete a comment (soft delete) ───────────────────────────────────────────

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

  // Count replies BEFORE deleting (to get accurate count)
  let replyCount = 0;
  if (comment.parentCommentId === null) {
    const replyResult = await db
      .select({ count: count() })
      .from(comments)
      .where(
        and(
          eq(comments.parentCommentId, commentId),
          eq(comments.isDeleted, false)
        )
      );
    replyCount = replyResult[0]?.count ?? 0;
  }

  // Soft-delete the comment
  await db
    .update(comments)
    .set({
      isDeleted: true,
      updatedAt: new Date(),
    })
    .where(eq(comments.id, commentId));

  // Also soft-delete all replies to this comment if it's a top-level comment
  if (comment.parentCommentId === null && replyCount > 0) {
    await db
      .update(comments)
      .set({
        isDeleted: true,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(comments.parentCommentId, commentId),
          eq(comments.isDeleted, false)
        )
      );
  }

  return { success: true, deletedCount: 1 + replyCount };
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
