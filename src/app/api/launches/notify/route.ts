import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db, getUserBySupabaseId } from "@/server/db";
import { launchNotifications } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Helper: create a Supabase server client from the request cookies.
 */
async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );
}

/**
 * POST /api/launches/notify
 * One-click subscribe — authenticated users only.
 * Body: { toolId?: number, submissionId?: number }
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const supabase = await getSupabaseServerClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401 }
      );
    }

    // Get DB user to capture userId and email
    const dbUser = await getUserBySupabaseId(authUser.id);
    if (!dbUser) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    const email = dbUser.email ?? authUser.email ?? "";
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "No email associated with your account." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { toolId, submissionId } = body;

    // Must have either toolId or submissionId
    if (!toolId && !submissionId) {
      return NextResponse.json(
        { error: "Either toolId or submissionId is required." },
        { status: 400 }
      );
    }

    // Check if already subscribed (tool-based)
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
        return NextResponse.json({
          success: true,
          message: "You're already subscribed!",
        });
      }
    }

    // Check if already subscribed (submission-based)
    if (submissionId) {
      const [existing] = await db
        .select({ id: launchNotifications.id })
        .from(launchNotifications)
        .where(
          and(
            eq(launchNotifications.email, email.toLowerCase()),
            eq(launchNotifications.submissionId, submissionId)
          )
        )
        .limit(1);
      if (existing) {
        return NextResponse.json({
          success: true,
          message: "You're already subscribed!",
        });
      }
    }

    // Insert the notification subscription
    await db.insert(launchNotifications).values({
      email: email.toLowerCase(),
      toolId: toolId ?? null,
      submissionId: submissionId ?? null,
      userId: dbUser.id,
      notified: false,
    });

    return NextResponse.json({
      success: true,
      message: "You'll be notified when this launches!",
    });
  } catch (error: any) {
    // Handle unique constraint violation (duplicate subscription)
    if (error?.code === "23505") {
      return NextResponse.json({
        success: true,
        message: "You're already subscribed!",
      });
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
 * Unsubscribe from a launch notification — authenticated users only.
 * Body: { toolId?: number, submissionId?: number }
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const dbUser = await getUserBySupabaseId(authUser.id);
    if (!dbUser) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    const email = dbUser.email ?? authUser.email ?? "";
    const body = await request.json();
    const { toolId, submissionId } = body;

    if (!toolId && !submissionId) {
      return NextResponse.json(
        { error: "Either toolId or submissionId is required." },
        { status: 400 }
      );
    }

    if (toolId) {
      await db
        .delete(launchNotifications)
        .where(
          and(
            eq(launchNotifications.email, email.toLowerCase()),
            eq(launchNotifications.toolId, toolId)
          )
        );
    }

    if (submissionId) {
      await db
        .delete(launchNotifications)
        .where(
          and(
            eq(launchNotifications.email, email.toLowerCase()),
            eq(launchNotifications.submissionId, submissionId)
          )
        );
    }

    return NextResponse.json({ success: true, message: "Unsubscribed." });
  } catch (error) {
    console.error("[notify DELETE] Error:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe." },
      { status: 500 }
    );
  }
}
