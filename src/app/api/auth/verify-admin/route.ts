import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { isStaffRole } from "@/lib/permissions";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/verify-admin
 * After client-side Supabase sign-in, verify the user has a staff role.
 * Accepts the Supabase user ID from the client (already authenticated).
 * Returns authorized: true for any staff role.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { supabaseId } = body;

    if (!supabaseId || typeof supabaseId !== "string") {
      return NextResponse.json(
        { authorized: false, error: "Invalid request" },
        { status: 400 }
      );
    }

    const [dbUser] = await db
      .select({ role: users.role, id: users.id })
      .from(users)
      .where(eq(users.supabaseId, supabaseId))
      .limit(1);

    if (!dbUser) {
      return NextResponse.json(
        { authorized: false, error: "Access denied" },
        { status: 403 }
      );
    }

    if (!isStaffRole(dbUser.role)) {
      return NextResponse.json(
        { authorized: false, error: "Insufficient privileges" },
        { status: 403 }
      );
    }

    return NextResponse.json({ authorized: true, role: dbUser.role });
  } catch (err) {
    console.error("[verify-admin] Error:", err);
    return NextResponse.json(
      { authorized: false, error: "Server error" },
      { status: 500 }
    );
  }
}
