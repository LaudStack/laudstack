"use server";

/**
 * Action-Based Email Verification
 *
 * This module handles on-demand email verification for sensitive actions.
 * It reuses the same emailVerifications table and Resend email infrastructure
 * but is triggered from the frontend when a user attempts a sensitive action
 * without having verified their email.
 *
 * Flow:
 *   1. User attempts sensitive action → backend throws EMAIL_NOT_VERIFIED
 *   2. Frontend shows EmailVerificationModal
 *   3. User clicks "Send Code" → sendActionVerificationCode()
 *   4. User enters code → verifyActionCode()
 *   5. On success, user.emailVerified = true, modal closes, action retries
 */

import { db } from "@/server/db";
import { emailVerifications, users } from "@/drizzle/schema";
import { eq, and, gt, gte, lt, sql } from "drizzle-orm";
import { sendVerificationEmail } from "@/server/email";
import { requireAuth } from "@/lib/admin-auth";
import { randomInt } from "crypto";

const MAX_CODES_PER_HOUR = 5;
const MAX_VERIFY_ATTEMPTS = 5;
const CODE_EXPIRY_MINUTES = 15;

function generateCode(): string {
  return randomInt(100000, 999999).toString();
}

async function cleanupExpiredCodes(): Promise<void> {
  try {
    const now = new Date();
    await db
      .delete(emailVerifications)
      .where(lt(emailVerifications.expiresAt, now));
  } catch (err) {
    console.error("[actionVerification] cleanup error:", err);
  }
}

/**
 * Send a verification code to the current authenticated user's email.
 * Called from the EmailVerificationModal when a user needs to verify
 * their email for a sensitive action.
 */
export async function sendActionVerificationCode(): Promise<{
  success: boolean;
  error?: string;
  email?: string;
}> {
  try {
    const user = await requireAuth();

    if (!user.email) {
      return { success: false, error: "No email address associated with your account." };
    }

    if (user.emailVerified) {
      return { success: true, email: user.email };
    }

    const cleanEmail = user.email.trim().toLowerCase();

    await cleanupExpiredCodes();

    // Rate limit
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCodes = await db
      .select({ count: sql<number>`count(*)` })
      .from(emailVerifications)
      .where(
        and(
          eq(emailVerifications.email, cleanEmail),
          gte(emailVerifications.createdAt, oneHourAgo)
        )
      );

    const recentCount = Number(recentCodes[0]?.count ?? 0);
    if (recentCount >= MAX_CODES_PER_HOUR) {
      return {
        success: false,
        error: "Too many verification attempts. Please wait before requesting a new code.",
      };
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

    // Invalidate existing unused codes
    await db
      .delete(emailVerifications)
      .where(
        and(
          eq(emailVerifications.email, cleanEmail),
          eq(emailVerifications.supabaseId, user.supabaseId),
          sql`${emailVerifications.usedAt} IS NULL`
        )
      );

    // Store the new code
    await db.insert(emailVerifications).values({
      email: cleanEmail,
      supabaseId: user.supabaseId,
      code,
      expiresAt,
      attempts: 0,
    });

    // Send via Resend
    const sent = await sendVerificationEmail(cleanEmail, code);
    if (!sent) {
      return { success: false, error: "Failed to send verification email. Please try again." };
    }

    return { success: true, email: maskEmail(cleanEmail) };
  } catch (err) {
    console.error("[actionVerification] sendActionVerificationCode error:", err);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Verify the code entered by the user. On success, marks the user's
 * emailVerified field as true in the database.
 */
export async function verifyActionCode(code: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const user = await requireAuth();

    if (user.emailVerified) {
      return { success: true };
    }

    if (!user.email) {
      return { success: false, error: "No email address associated with your account." };
    }

    const cleanEmail = user.email.trim().toLowerCase();
    const cleanCode = code.replace(/\D/g, "").trim();

    if (cleanCode.length !== 6) {
      return { success: false, error: "Invalid verification code." };
    }

    const now = new Date();

    // Find the most recent non-expired, unused code
    const [record] = await db
      .select()
      .from(emailVerifications)
      .where(
        and(
          eq(emailVerifications.email, cleanEmail),
          eq(emailVerifications.supabaseId, user.supabaseId),
          gt(emailVerifications.expiresAt, now),
          sql`${emailVerifications.usedAt} IS NULL`
        )
      )
      .orderBy(sql`${emailVerifications.createdAt} DESC`)
      .limit(1);

    if (!record) {
      return { success: false, error: "No active verification code found. Please request a new one." };
    }

    // Brute-force protection
    if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
      return {
        success: false,
        error: "Too many failed attempts. Please request a new verification code.",
      };
    }

    // Constant-time comparison
    const codeMatches = timingSafeEqual(record.code, cleanCode);

    if (!codeMatches) {
      const newAttempts = record.attempts + 1;
      await db
        .update(emailVerifications)
        .set({ attempts: newAttempts })
        .where(eq(emailVerifications.id, record.id));

      const remaining = MAX_VERIFY_ATTEMPTS - newAttempts;
      if (remaining <= 0) {
        return {
          success: false,
          error: "Too many failed attempts. Please request a new verification code.",
        };
      }
      return {
        success: false,
        error: `Invalid code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
      };
    }

    // Code matches — mark as used
    await db
      .update(emailVerifications)
      .set({ usedAt: now })
      .where(eq(emailVerifications.id, record.id));

    // Mark user's email as verified
    await db
      .update(users)
      .set({ emailVerified: true, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    return { success: true };
  } catch (err) {
    console.error("[actionVerification] verifyActionCode error:", err);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}${local[1]}${"*".repeat(Math.min(local.length - 2, 6))}@${domain}`;
}
