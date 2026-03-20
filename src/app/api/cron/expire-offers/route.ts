// Force dynamic rendering — prevents static analysis at build time
export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { marketplaceOffers } from "@/drizzle/schema";
import { and, inArray, lt } from "drizzle-orm";

/**
 * Cron job: Expire marketplace offers that have passed their expiresAt date.
 * Should be called periodically (e.g., every hour via Vercel Cron).
 */
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const result = await db.update(marketplaceOffers)
      .set({ status: "expired" })
      .where(
        and(
          inArray(marketplaceOffers.status, ["pending", "countered"]),
          lt(marketplaceOffers.expiresAt, now),
        )
      )
      .returning({ id: marketplaceOffers.id });

    console.log(`[Cron] Expired ${result.length} marketplace offers`);

    return NextResponse.json({ expired: result.length });
  } catch (error) {
    console.error("[Cron Expire Offers] Error:", error);
    return NextResponse.json({ error: "Failed to expire offers" }, { status: 500 });
  }
}
