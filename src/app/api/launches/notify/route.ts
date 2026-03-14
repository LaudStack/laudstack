import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { launchNotifications } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/launches/notify
 * Subscribe an email to be notified when a tool launches.
 * Body: { email: string, toolId?: number, submissionId?: number, userId?: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, toolId, submissionId, userId } = body;

    // Validate email
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    // Must have either toolId or submissionId
    if (!toolId && !submissionId) {
      return NextResponse.json(
        { error: "Either toolId or submissionId is required." },
        { status: 400 }
      );
    }

    // Check if already subscribed (for tool-based notifications)
    if (toolId) {
      const [existing] = await db
        .select({ id: launchNotifications.id })
        .from(launchNotifications)
        .where(
          and(
            eq(launchNotifications.email, email.toLowerCase()),
            eq(launchNotifications.toolId, toolId)
          )
        )
        .limit(1);

      if (existing) {
        return NextResponse.json({ success: true, message: "Already subscribed." });
      }
    }

    // Insert the notification subscription
    await db.insert(launchNotifications).values({
      email: email.toLowerCase(),
      toolId: toolId ?? null,
      submissionId: submissionId ?? null,
      userId: userId ?? null,
      notified: false,
    });

    return NextResponse.json({
      success: true,
      message: "You'll be notified when this tool launches!",
    });
  } catch (error: any) {
    // Handle unique constraint violation (duplicate subscription)
    if (error?.code === "23505") {
      return NextResponse.json({ success: true, message: "Already subscribed." });
    }
    console.error("[notify API] Error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/launches/notify
 * Unsubscribe from a launch notification.
 * Body: { email: string, toolId?: number }
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, toolId } = body;

    if (!email || !toolId) {
      return NextResponse.json(
        { error: "Email and toolId are required." },
        { status: 400 }
      );
    }

    await db
      .delete(launchNotifications)
      .where(
        and(
          eq(launchNotifications.email, email.toLowerCase()),
          eq(launchNotifications.toolId, toolId)
        )
      );

    return NextResponse.json({ success: true, message: "Unsubscribed." });
  } catch (error) {
    console.error("[notify DELETE] Error:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe." },
      { status: 500 }
    );
  }
}
