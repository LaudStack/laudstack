import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { tools } from "@/drizzle/schema";
import { and, lte, isNotNull, eq } from "drizzle-orm";

/**
 * GET /api/cron/transition-launches
 * 
 * Called by Vercel Cron (daily). Finds tools whose scheduled_launch_at
 * has passed and transitions them:
 *   1. Sets launchedAt to now (marks as officially launched)
 *   2. Clears scheduledLaunchAt (removes from upcoming page)
 *   3. Ensures the tool is visible
 * 
 * Protected by CRON_SECRET to prevent unauthorized access.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Find all tools with scheduledLaunchAt in the past
    const toolsToTransition = await db
      .select({
        id: tools.id,
        name: tools.name,
        slug: tools.slug,
        scheduledLaunchAt: tools.scheduledLaunchAt,
      })
      .from(tools)
      .where(
        and(
          isNotNull(tools.scheduledLaunchAt),
          lte(tools.scheduledLaunchAt, now)
        )
      );

    let transitioned = 0;

    for (const tool of toolsToTransition) {
      try {
        await db
          .update(tools)
          .set({
            // L5: Use the scheduled launch time as the official launch timestamp
            launchedAt: tool.scheduledLaunchAt ?? now,
            scheduledLaunchAt: null, // Clear to remove from upcoming page
            isVisible: true,
            updatedAt: now,
          })
          .where(eq(tools.id, tool.id));
        transitioned++;
        console.log(`[cron] Transitioned tool: ${tool.name} (${tool.slug})`);
      } catch (err) {
        console.error(`[cron] Failed to transition tool ${tool.id}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      transitioned,
      total: toolsToTransition.length,
      tools: toolsToTransition.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
      })),
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("[cron/transition-launches] Error:", error);
    return NextResponse.json(
      { error: "Failed to process transitions." },
      { status: 500 }
    );
  }
}
