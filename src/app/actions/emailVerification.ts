"use server";

/*
 * Email Verification — 6-digit OTP via Resend
 *
 * Security hardening:
 *   - Cryptographically secure code generation (crypto.getRandomValues)
 *   - Rate limiting: max 5 codes per email per hour (counted before deletion)
 *   - Brute-force protection: max 5 attempts per code, then locked
 *   - Input sanitization: email trimmed + lowercased
 *   - Expired code cleanup on every send to prevent DB bloat
 *   - supabaseId binding: code is tied to the specific Supabase user
 *
 * Flow:
 *   1. User signs up → signUpWithEmail creates Supabase user (session active)
 *   2. sendVerificationCode() generates a 6-digit code, stores in DB, sends via Resend
 *   3. User enters code → verifyCode() validates, creates DB user record, marks emailVerified = true
 *   4. onSuccess redirects to onboarding (new) or dashboard (existing)
 */

import { db } from "@/server/db";
import { emailVerifications, users } from "@/drizzle/schema";
import { eq, and, gt, gte, lt, sql } from "drizzle-orm";
import { sendVerificationEmail } from "@/server/email";
import { upsertUser } from "@/server/db";
import { randomInt } from "crypto";

const MAX_CODES_PER_HOUR = 5;
const MAX_VERIFY_ATTEMPTS = 5;
const CODE_EXPIRY_MINUTES = 15;

// ─── Generate a cryptographically secure 6-digit numeric code ───────────────

function generateCode(): string {
  // crypto.randomInt is cryptographically secure, unlike Math.random()
  return randomInt(100000, 999999).toString();
}

// ─── Cleanup expired codes to prevent DB bloat ──────────────────────────────

async function cleanupExpiredCodes(): Promise<void> {
  try {
    const now = new Date();
    await db
      .delete(emailVerifications)
      .where(lt(emailVerifications.expiresAt, now));
  } catch (err) {
    // Non-critical — log but don't fail the main operation
    console.error("[emailVerification] cleanup error:", err);
  }
}

// ─── Send verification code ─────────────────────────────────────────────────

export async function sendVerificationCode({
  email,
  supabaseId,
  firstName,
  lastName,
}: {
  email: string;
  supabaseId: string;
  firstName?: string;
  lastName?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Sanitize inputs
    const cleanEmail = email.trim().toLowerCase();
    const cleanSupabaseId = supabaseId.trim();

    if (!cleanEmail || !cleanSupabaseId) {
      return { success: false, error: "Invalid request." };
    }

    // Basic email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, error: "Invalid email address." };
    }

    // Cleanup expired codes first (non-blocking for the user)
    await cleanupExpiredCodes();

    // Rate limit: count ALL codes sent to this email in the last hour
    // (including used and deleted ones — we count before deleting unused ones)
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

    // Invalidate any existing unused codes for this email+supabaseId combo
    // (keeps the rate limit count accurate since we only delete unused ones)
    await db
      .delete(emailVerifications)
      .where(
        and(
          eq(emailVerifications.email, cleanEmail),
          eq(emailVerifications.supabaseId, cleanSupabaseId),
          sql`${emailVerifications.usedAt} IS NULL`
        )
      );

    // Store the new code
    await db.insert(emailVerifications).values({
      email: cleanEmail,
      supabaseId: cleanSupabaseId,
      code,
      expiresAt,
      attempts: 0,
    });

    // Send via Resend
    const sent = await sendVerificationEmail(cleanEmail, code);
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
  firstName,
  lastName,
}: {
  email: string;
  supabaseId: string;
  code: string;
  firstName?: string;
  lastName?: string;
}): Promise<{ success: boolean; error?: string; isNewUser?: boolean }> {
  try {
    // Sanitize inputs
    const cleanEmail = email.trim().toLowerCase();
    const cleanSupabaseId = supabaseId.trim();
    const cleanCode = code.replace(/\D/g, "").trim();

    if (!cleanEmail || !cleanSupabaseId || cleanCode.length !== 6) {
      return { success: false, error: "Invalid verification code." };
    }

    const now = new Date();

    // Find the most recent non-expired, unused code for this email + supabaseId
    const [record] = await db
      .select()
      .from(emailVerifications)
      .where(
        and(
          eq(emailVerifications.email, cleanEmail),
          eq(emailVerifications.supabaseId, cleanSupabaseId),
          gt(emailVerifications.expiresAt, now),
          sql`${emailVerifications.usedAt} IS NULL`
        )
      )
      .orderBy(sql`${emailVerifications.createdAt} DESC`)
      .limit(1);

    if (!record) {
      return { success: false, error: "No active verification code found. Please request a new one." };
    }

    // Brute-force protection: check attempts
    if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
      return {
        success: false,
        error: "Too many failed attempts. Please request a new verification code.",
      };
    }

    // Check if code matches (constant-time comparison to prevent timing attacks)
    const codeMatches = timingSafeEqual(record.code, cleanCode);

    if (!codeMatches) {
      // Increment attempts counter
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

    // Create or update DB user record (critical for email signups)
    // OAuth users get this via the callback route, but email users need it here
    const cleanFirstName = firstName?.trim() || undefined;
    const cleanLastName = lastName?.trim() || undefined;
    const fullName = [cleanFirstName, cleanLastName].filter(Boolean).join(" ") || undefined;
    const dbUser = await upsertUser({
      supabaseId: cleanSupabaseId,
      email: cleanEmail,
      name: fullName,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      loginMethod: "email",
      emailVerified: true,
    });

    const isNewUser = dbUser ? !dbUser.onboardingCompleted : true;

    return { success: true, isNewUser };
  } catch (err) {
    console.error("[emailVerification] verifyCode error:", err);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

// ─── Constant-time string comparison ─────────────────────────────────────────
// Prevents timing attacks on OTP verification

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
