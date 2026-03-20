import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { tools, toolViews } from "@/drizzle/schema";
import { eq, sql } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * POST /api/tools/[slug]/view
 * Track a page view for a tool. Called from the tool detail page.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Find the tool
    const tool = await db.query.tools.findFirst({
      where: eq(tools.slug, slug),
      columns: { id: true },
    });

    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    // Get visitor info from headers
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const userAgent = request.headers.get("user-agent") || null;
    const referrer = request.headers.get("referer") || null;

    // Insert view record
    await db.insert(toolViews).values({
      toolId: tool.id,
      visitorIp: ip,
      userAgent,
      referrer,
    });

    // Increment view count on the tool
    await db.update(tools).set({
      viewCount: sql`${tools.viewCount} + 1`,
    }).where(eq(tools.id, tool.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("View tracking error:", error);
    return NextResponse.json({ error: "Failed to track view" }, { status: 500 });
  }
}
