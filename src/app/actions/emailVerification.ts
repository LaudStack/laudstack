"use server";

/*
 * Email Verification — 6-digit OTP via Resend
 *
 * Flow:
 *   1. User signs up → signUpWithEmail creates Supabase user (no email confirmation)
 *   2. sendVerificationCode() generates a 6-digit code, stores in DB, sends via Resend
 *   3. User enters code → verifyCode() validates, marks user.emailVerified = true
 */

import { db } from "@/server/db";
import { emailVerifications, users } from "@/drizzle/schema";
import { eq, and, gt } from "drizzle-orm";
import { sendVerificationEmail } from "@/server/email";

// ─── Generate a 6-digit numeric code ─────────────────────────────────────────

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Send verification code ───────────────────────────────────────────────────

export async function sendVerificationCode({
  email,
  supabaseId,
}: {
  email: string;
  supabaseId: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Invalidate any existing unused codes for this email
    await db
      .delete(emailVerifications)
      .where(eq(emailVerifications.email, email));

    // Store the new code
    await db.insert(emailVerifications).values({
      email,
      supabaseId,
      code,
      expiresAt,
    });

    // Send via Resend
    const sent = await sendVerificationEmail(email, code);
    if (!sent) {
      return { success: false, error: "Failed to send verification email. Please try again." };
    }

    return { success: true };
  } catch (err) {
    console.error("[emailVerification] sendVerificationCode error:", err);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

// ─── Verify code ─────────────────────────────────────────────────────────────

export async function verifyCode({
  email,
  supabaseId,
  code,
}: {
  email: string;
  supabaseId: string;
  code: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date();

    // Find a valid, unused, non-expired code
    const [record] = await db
      .select()
      .from(emailVerifications)
      .where(
        and(
          eq(emailVerifications.email, email),
          eq(emailVerifications.code, code),
          eq(emailVerifications.supabaseId, supabaseId),
          gt(emailVerifications.expiresAt, now)
        )
      )
      .limit(1);

    if (!record) {
      return { success: false, error: "Invalid or expired code. Please request a new one." };
    }

    if (record.usedAt) {
      return { success: false, error: "This code has already been used. Please request a new one." };
    }

    // Mark code as used
    await db
      .update(emailVerifications)
      .set({ usedAt: now })
      .where(eq(emailVerifications.id, record.id));

    // Mark user as email verified
    await db
      .update(users)
      .set({ emailVerified: true })
      .where(eq(users.supabaseId, supabaseId));

    return { success: true };
  } catch (err) {
    console.error("[emailVerification] verifyCode error:", err);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}
