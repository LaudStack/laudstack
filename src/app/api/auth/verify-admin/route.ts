import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { isStaffRole } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/verify-admin
 * Verifies the user has a staff role using the server-side Supabase session.
 * Ignores any client-provided IDs for security.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { authorized: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const [dbUser] = await db
      .select({ role: users.role, id: users.id })
      .from(users)
      .where(eq(users.supabaseId, user.id))
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
