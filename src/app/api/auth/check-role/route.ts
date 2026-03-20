import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { isStaffRole } from "@/lib/permissions";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/check-role
 * Returns the user's role from the app database given their Supabase ID.
 * Used by the login flow to determine where to redirect after authentication.
 */
export async function POST(request: NextRequest) {
  try {
    const { supabaseId } = await request.json();

    if (!supabaseId) {
      return NextResponse.json({ role: "user", isStaff: false }, { status: 200 });
    }

    const [dbUser] = await db
      .select({ role: users.role, id: users.id })
      .from(users)
      .where(eq(users.supabaseId, supabaseId))
      .limit(1);

    if (!dbUser) {
      return NextResponse.json({ role: "user", isStaff: false }, { status: 200 });
    }

    return NextResponse.json({
      role: dbUser.role,
      isStaff: isStaffRole(dbUser.role),
    });
  } catch (err) {
    console.error("[check-role] Error:", err);
    return NextResponse.json({ role: "user", isStaff: false }, { status: 200 });
  }
}
