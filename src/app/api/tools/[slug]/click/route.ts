import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { tools, outboundClicks } from "@/drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { getUserBySupabaseId } from "@/server/db";

export const runtime = "nodejs";

/**
 * POST /api/tools/[slug]/click
 * Track an outbound click (website or affiliate link).
 * Body: { linkType: "website" | "affiliate" }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json().catch(() => ({}));
    const linkType = body.linkType || "website";

    // Find the tool
    const tool = await db.query.tools.findFirst({
      where: eq(tools.slug, slug),
      columns: { id: true },
    });

    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    // Get user if authenticated
    let userId: number | null = null;
    try {
      const supabase = await createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const dbUser = await getUserBySupabaseId(authUser.id);
        if (dbUser) userId = dbUser.id;
      }
    } catch {
      // Not authenticated — that's fine
    }

    // Insert click record
    await db.insert(outboundClicks).values({
      toolId: tool.id,
      userId,
      linkType,
    });

    // Increment outbound click count on the tool
    await db.update(tools).set({
      outboundClickCount: sql`${tools.outboundClickCount} + 1`,
    }).where(eq(tools.id, tool.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Click tracking error:", error);
    return NextResponse.json({ error: "Failed to track click" }, { status: 500 });
  }
}
