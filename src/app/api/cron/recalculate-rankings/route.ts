import { NextRequest, NextResponse } from "next/server";
/**
 * GET /api/cron/recalculate-rankings
 *
 * Called by Vercel Cron daily at 03:00 UTC.
 * Delegates to the admin recalculate-rankings POST endpoint with the CRON_SECRET header.
 * This separation keeps the cron handler thin and the ranking logic in one place.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/admin/recalculate-rankings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Pass the cron secret so the admin endpoint's auth guard accepts it
        "x-admin-key": cronSecret ?? "",
      },
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[Cron] Ranking recalculation failed:", res.status, body);
      return NextResponse.json(
        { error: "Ranking recalculation failed", status: res.status },
        { status: 500 },
      );
    }

    const data = await res.json();
    console.log("[Cron] Rankings recalculated:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Cron] Ranking recalculation error:", error);
    return NextResponse.json(
      { error: "Internal error during ranking recalculation" },
      { status: 500 },
    );
  }
}
