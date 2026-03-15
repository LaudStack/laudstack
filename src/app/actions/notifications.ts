"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db, getUserBySupabaseId } from "@/server/db";
import { notifications, users } from "@/drizzle/schema";
import { eq, and, desc, count, inArray } from "drizzle-orm";

// ─── Auth helper (returns DB user or null) ───────────────────────────────────

async function getCurrentUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(list: { name: string; value: string; options?: Record<string, unknown> }[]) {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    }
  );
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (!supabaseUser) return null;
  return getUserBySupabaseId(supabaseUser.id);
}

// ─── Types ────────────────────────────────────────────────────────────────────

type NotificationType =
  | "new_review"
  | "founder_reply"
  | "comment_reply"
  | "claim_approved"
  | "claim_rejected"
  | "submission_approved"
  | "submission_rejected"
  | "tool_verified"
  | "tool_featured"
  | "new_submission"
  | "new_claim"
  | "system";

// ─── Create Notification (internal helper) ────────────────────────────────────

export async function createNotification(data: {
  recipientId: number;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  actorId?: number;
  toolId?: number;
}) {
  try {
    await db.insert(notifications).values({
      recipientId: data.recipientId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link ?? null,
      actorId: data.actorId ?? null,
      toolId: data.toolId ?? null,
    });
    return { success: true };
  } catch (error) {
    console.error("[createNotification] Error:", error);
    return { success: false };
  }
}

// ─── Notify all admins ────────────────────────────────────────────────────────

export async function notifyAdmins(data: {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  actorId?: number;
  toolId?: number;
}) {
  try {
    const admins = await db
      .select({ id: users.id })
      .from(users)
      .where(
        inArray(users.role, ["admin", "super_admin"])
      );

    if (admins.length === 0) return { success: true };

    await db.insert(notifications).values(
      admins.map((admin) => ({
        recipientId: admin.id,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link ?? null,
        actorId: data.actorId ?? null,
        toolId: data.toolId ?? null,
      }))
    );
    return { success: true };
  } catch (error) {
    console.error("[notifyAdmins] Error:", error);
    return { success: false };
  }
}

// ─── Get Notifications for Current User ───────────────────────────────────────

export async function getNotifications(options?: { limit?: number; offset?: number }) {
  const user = await getCurrentUser();
  if (!user) return { notifications: [], total: 0, unreadCount: 0 };

  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  const [notifRows, totalRows, unreadRows] = await Promise.all([
    db
      .select()
      .from(notifications)
      .where(eq(notifications.recipientId, user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(notifications)
      .where(eq(notifications.recipientId, user.id)),
    db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.recipientId, user.id),
          eq(notifications.isRead, false)
        )
      ),
  ]);

  return {
    notifications: notifRows,
    total: totalRows[0]?.count ?? 0,
    unreadCount: unreadRows[0]?.count ?? 0,
  };
}

// ─── Get Unread Count Only ────────────────────────────────────────────────────

export async function getUnreadNotificationCount() {
  const user = await getCurrentUser();
  if (!user) return 0;

  const rows = await db
    .select({ count: count() })
    .from(notifications)
    .where(
      and(
        eq(notifications.recipientId, user.id),
        eq(notifications.isRead, false)
      )
    );

  return rows[0]?.count ?? 0;
}

// ─── Mark Single Notification as Read ─────────────────────────────────────────

export async function markNotificationAsRead(notificationId: number) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Not authenticated" };

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.recipientId, user.id)
      )
    );

  return { success: true };
}

// ─── Mark All Notifications as Read ───────────────────────────────────────────

export async function markAllNotificationsAsRead() {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Not authenticated" };

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.recipientId, user.id),
        eq(notifications.isRead, false)
      )
    );

  return { success: true };
}
