import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { launchNotifications, tools } from "@/drizzle/schema";
import { eq, and, lte, isNotNull } from "drizzle-orm";
import { sendLaunchNotificationEmail } from "@/server/email";

/**
 * GET /api/cron/send-launch-notifications
 * 
 * Called by Vercel Cron (daily). Finds tools whose scheduled_launch_at
 * has passed, then sends notification emails to all subscribers who
 * haven't been notified yet.
 * 
 * Protected by CRON_SECRET to prevent unauthorized access.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sets this automatically for cron jobs)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    let emailsSent = 0;
    let errors = 0;

    // Find tools that have launched (scheduled_launch_at <= now)
    // and have pending notifications
    const pendingNotifications = await db
      .select({
        notificationId: launchNotifications.id,
        email: launchNotifications.email,
        toolId: launchNotifications.toolId,
        toolName: tools.name,
        toolSlug: tools.slug,
        toolTagline: tools.tagline,
        toolLogo: tools.logoUrl,
        scheduledLaunchAt: tools.scheduledLaunchAt,
      })
      .from(launchNotifications)
      .innerJoin(tools, eq(launchNotifications.toolId, tools.id))
      .where(
        and(
          eq(launchNotifications.notified, false),
          isNotNull(tools.scheduledLaunchAt),
          lte(tools.scheduledLaunchAt, now)
        )
      )
      .limit(100); // Process in batches to avoid timeout

    for (const notification of pendingNotifications) {
      try {
        const success = await sendLaunchNotificationEmail(
          notification.email,
          notification.toolName,
          notification.toolSlug,
          notification.toolTagline,
          notification.toolLogo
        );

        if (success) {
          // Mark as notified
          await db
            .update(launchNotifications)
            .set({ notified: true, notifiedAt: new Date() })
            .where(eq(launchNotifications.id, notification.notificationId));
          emailsSent++;
        } else {
          errors++;
        }
      } catch (err) {
        console.error(`[cron] Failed to notify ${notification.email}:`, err);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: pendingNotifications.length,
      emailsSent,
      errors,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("[cron/send-launch-notifications] Error:", error);
    return NextResponse.json(
      { error: "Failed to process notifications." },
      { status: 500 }
    );
  }
}
