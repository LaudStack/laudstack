"use server";

import { db, getUserBySupabaseId } from "@/server/db";
import { comments, users, tools } from "@/drizzle/schema";
import { eq, and, desc, asc, isNull, count } from "drizzle-orm";
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

// ─── Get comments for a tool ──────────────────────────────────────────────────

export async function getCommentsByToolId(
  toolId: number
): Promise<{ comments: CommentWithUser[]; totalCount: number }> {
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

  // Get the tool to determine founder (submittedBy or claimedBy)
  const tool = await db.query.tools.findFirst({
    where: eq(tools.id, toolId),
  });

  const founderUserIds = new Set<number>();
  if (tool?.submittedBy) founderUserIds.add(tool.submittedBy);
  if (tool?.claimedBy) founderUserIds.add(tool.claimedBy);

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

  // Validate content
  const trimmed = input.content.trim();
  if (!trimmed) {
    return { success: false, error: "Comment cannot be empty" };
  }
  if (trimmed.length > 2000) {
    return {
      success: false,
      error: "Comment must be 2000 characters or less",
    };
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

  // Rate limit: max 10 comments per user per tool per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await db
    .select({ count: count() })
    .from(comments)
    .where(
      and(
        eq(comments.userId, user.id),
        eq(comments.toolId, input.toolId),
        eq(comments.isDeleted, false)
      )
    );

  // Simple rate limit: max 50 comments per tool per user total
  if (recentCount[0]?.count && recentCount[0].count >= 50) {
    return {
      success: false,
      error: "You have reached the maximum number of comments for this tool",
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

  // Get the tool to determine founder status
  const tool = await db.query.tools.findFirst({
    where: eq(tools.id, input.toolId),
  });

  const founderUserIds = new Set<number>();
  if (tool?.submittedBy) founderUserIds.add(tool.submittedBy);
  if (tool?.claimedBy) founderUserIds.add(tool.claimedBy);

  const displayName = user.firstName
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
        name: displayName,
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
}): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();

  const trimmed = input.content.trim();
  if (!trimmed) {
    return { success: false, error: "Comment cannot be empty" };
  }
  if (trimmed.length > 2000) {
    return {
      success: false,
      error: "Comment must be 2000 characters or less",
    };
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

  await db
    .update(comments)
    .set({
      content: trimmed,
      isEdited: true,
      updatedAt: new Date(),
    })
    .where(eq(comments.id, input.commentId));

  return { success: true };
}

// ─── Delete a comment (soft delete) ───────────────────────────────────────────

export async function deleteComment(
  commentId: number
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();

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

  await db
    .update(comments)
    .set({
      isDeleted: true,
      updatedAt: new Date(),
    })
    .where(eq(comments.id, commentId));

  // Also soft-delete all replies to this comment
  if (comment.parentCommentId === null) {
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

  return { success: true };
}

// ─── Get comment count for a tool ─────────────────────────────────────────────

export async function getCommentCount(
  toolId: number
): Promise<number> {
  const result = await db
    .select({ count: count() })
    .from(comments)
    .where(
      and(eq(comments.toolId, toolId), eq(comments.isDeleted, false))
    );
  return result[0]?.count ?? 0;
}
