"use server";

/**
 * Create DB user record immediately after Supabase signup.
 *
 * Previously, the DB user was only created after OTP verification.
 * Now we create it right away so the user can access the platform
 * without email verification. Email verification is deferred to
 * sensitive actions (founder upgrade, submit tool, claim tool, etc.).
 */

import { upsertUser } from "@/server/db";
import { sendWelcomeEmail } from "@/server/email";

export async function createUserAfterSignup({
  supabaseId,
  email,
  firstName,
  lastName,
}: {
  supabaseId: string;
  email: string;
  firstName?: string;
  lastName?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanFirst = firstName?.trim();
    const cleanLast = lastName?.trim();
    const fullName = [cleanFirst, cleanLast].filter(Boolean).join(" ") || undefined;

    const dbUser = await upsertUser({
      supabaseId,
      email: cleanEmail,
      name: fullName,
      firstName: cleanFirst,
      lastName: cleanLast,
      loginMethod: "email",
      emailVerified: false, // Not verified yet — will be verified on-demand
    });

    // Send welcome email (non-blocking)
    if (dbUser?.email && cleanFirst) {
      sendWelcomeEmail(dbUser.email, cleanFirst).catch((err) => {
        console.error("[createUserAfterSignup] Welcome email failed:", err);
      });
    }

    return { success: true };
  } catch (err) {
    console.error("[createUserAfterSignup] Error:", err);
    return { success: false, error: "Failed to create user record." };
  }
}
