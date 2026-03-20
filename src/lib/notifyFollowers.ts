/**
 * notifyFollowers — Notify users who follow a stack about new deals.
 *
 * This is the ONLY follow-triggered notification. Following a stack
 * should only trigger deal-related updates to avoid the platform
 * becoming a nuisance to users.
 */

import { db } from "@/server/db";
import { stackFollows, notifications } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Send in-app notifications to all followers of a stack when a new deal is created/approved.
 */
export async function notifyStackFollowersAboutDeal({
  toolId,
  toolName,
  toolSlug,
  dealTitle,
}: {
  toolId: number;
  toolName: string;
  toolSlug: string;
  dealTitle: string;
}) {
  try {
    // Get all followers of this stack
    const followers = await db
      .select({ userId: stackFollows.userId })
      .from(stackFollows)
      .where(eq(stackFollows.toolId, toolId));

    if (followers.length === 0) return;

    // Batch insert notifications for all followers
    const notificationValues = followers.map((f) => ({
      recipientId: f.userId,
      type: "system" as const,
      title: `New deal on ${toolName}`,
      message: `${dealTitle} — Check out this new deal on a stack you follow.`,
      link: `/tools/${toolSlug}?tab=deals`,
      toolId,
    }));

    // Insert in batches of 100 to avoid overwhelming the DB
    const BATCH_SIZE = 100;
    for (let i = 0; i < notificationValues.length; i += BATCH_SIZE) {
      const batch = notificationValues.slice(i, i + BATCH_SIZE);
      await db.insert(notifications).values(batch);
    }

    console.log(
      `[notifyStackFollowers] Notified ${followers.length} followers about deal "${dealTitle}" on ${toolName}`
    );
  } catch (error) {
    console.error("[notifyStackFollowers] Error:", error);
    // Non-blocking — don't throw
  }
}
