"use server";

import { db } from "@/server/db";
import { requireAdmin } from "@/lib/admin-auth";
import { comments, users, tools } from "@/drizzle/schema";
import { eq, desc, ilike, sql, and, count, isNull, gte } from "drizzle-orm";

// ─── Get Admin Comments (paginated, filtered, searchable) ────────────────────

export async function getAdminComments(opts: {
  search?: string;
  page?: number;
  filter?: "all" | "active" | "deleted" | "replies" | "top_level";
} = {}) {
  await requireAdmin();
  const { search, page = 1, filter = "all" } = opts;
  const limit = 20;
  const offset = (page - 1) * limit;
  const conditions: any[] = [];

  if (search) {
    conditions.push(ilike(comments.content, `%${search}%`));
  }

  if (filter === "active") {
    conditions.push(eq(comments.isDeleted, false));
  } else if (filter === "deleted") {
    conditions.push(eq(comments.isDeleted, true));
  } else if (filter === "replies") {
    conditions.push(sql`${comments.parentCommentId} IS NOT NULL`);
    conditions.push(eq(comments.isDeleted, false));
  } else if (filter === "top_level") {
    conditions.push(isNull(comments.parentCommentId));
    conditions.push(eq(comments.isDeleted, false));
  }

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const [rows, totalResult] = await Promise.all([
    db
      .select({
        id: comments.id,
        toolId: comments.toolId,
        userId: comments.userId,
        parentCommentId: comments.parentCommentId,
        content: comments.content,
        isDeleted: comments.isDeleted,
        deletedAt: comments.deletedAt,
        isEdited: comments.isEdited,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        userName: users.name,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userEmail: users.email,
        userAvatar: users.avatarUrl,
        toolName: tools.name,
        toolSlug: tools.slug,
        toolLogo: tools.logoUrl,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .leftJoin(tools, eq(comments.toolId, tools.id))
      .where(whereClause)
      .orderBy(desc(comments.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(comments).where(whereClause),
  ]);

  // Get counts for each filter tab
  const [allCount, activeCount, deletedCount, repliesCount, topLevelCount] = await Promise.all([
    db.select({ count: count() }).from(comments),
    db.select({ count: count() }).from(comments).where(eq(comments.isDeleted, false)),
    db.select({ count: count() }).from(comments).where(eq(comments.isDeleted, true)),
    db.select({ count: count() }).from(comments).where(
      and(sql`${comments.parentCommentId} IS NOT NULL`, eq(comments.isDeleted, false))
    ),
    db.select({ count: count() }).from(comments).where(
      and(isNull(comments.parentCommentId), eq(comments.isDeleted, false))
    ),
  ]);

  const enrichedRows = rows.map((r) => ({
    ...r,
    displayName:
      (r.userFirstName ? [r.userFirstName, r.userLastName].filter(Boolean).join(" ") : null) ??
      r.userName ??
      "Anonymous",
  }));

  return {
    comments: enrichedRows,
    total: totalResult[0].count,
    page,
    limit,
    counts: {
      all: allCount[0].count,
      active: activeCount[0].count,
      deleted: deletedCount[0].count,
      replies: repliesCount[0].count,
      top_level: topLevelCount[0].count,
    },
  };
}

// ─── Admin Delete Comment (soft delete) ──────────────────────────────────────

export async function adminDeleteComment(commentId: number) {
  const admin = await requireAdmin();
  const comment = await db.query.comments.findFirst({
    where: eq(comments.id, commentId),
  });
  if (!comment) return { success: false, error: "Comment not found" };

  const now = new Date();
  await db
    .update(comments)
    .set({
      isDeleted: true,
      deletedAt: now,
      updatedAt: now,
    })
    .where(eq(comments.id, commentId));

  return { success: true };
}

// ─── Admin Restore Comment ───────────────────────────────────────────────────

export async function adminRestoreComment(commentId: number) {
  const admin = await requireAdmin();
  const comment = await db.query.comments.findFirst({
    where: eq(comments.id, commentId),
  });
  if (!comment) return { success: false, error: "Comment not found" };

  const now = new Date();
  await db
    .update(comments)
    .set({
      isDeleted: false,
      deletedAt: null,
      updatedAt: now,
    })
    .where(eq(comments.id, commentId));

  return { success: true };
}

// ─── Admin Permanently Delete Comment ────────────────────────────────────────

export async function adminPermanentDeleteComment(commentId: number) {
  const admin = await requireAdmin();
  const comment = await db.query.comments.findFirst({
    where: eq(comments.id, commentId),
  });
  if (!comment) return { success: false, error: "Comment not found" };

  // Also delete any replies to this comment
  await db.delete(comments).where(eq(comments.parentCommentId, commentId));
  await db.delete(comments).where(eq(comments.id, commentId));

  return { success: true };
}

// ─── Admin Get Comment Stats ─────────────────────────────────────────────────

export async function getAdminCommentStats() {
  await requireAdmin();

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [totalResult, todayResult, weekResult, deletedResult] = await Promise.all([
    db.select({ count: count() }).from(comments),
    db.select({ count: count() }).from(comments).where(gte(comments.createdAt, today)),
    db.select({ count: count() }).from(comments).where(gte(comments.createdAt, weekAgo)),
    db.select({ count: count() }).from(comments).where(eq(comments.isDeleted, true)),
  ]);

  return {
    totalComments: totalResult[0].count,
    commentsToday: todayResult[0].count,
    commentsThisWeek: weekResult[0].count,
    deletedComments: deletedResult[0].count,
  };
}
