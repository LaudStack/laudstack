/**
 * Progressive Email Verification Guard
 *
 * This module provides helpers to enforce email verification ONLY for
 * sensitive / high-trust actions. Normal signup and login do NOT require
 * email verification.
 *
 * Sensitive actions that require verified email:
 *   - Founder upgrade / founder-only actions
 *   - Launching a stack (submitTool)
 *   - Claiming a stack
 *   - Becoming a marketplace creator
 *   - Leaving a review (stack or marketplace)
 *   - Creating / publishing deals
 *   - Verified badge on profile (tied to emailVerified)
 *   - Admin/staff invite acceptance
 *
 * Usage in server actions:
 *   const user = await requireAuth();
 *   requireEmailVerified(user, "launch a stack");
 */

import type { User } from "@/drizzle/schema";

/**
 * List of action identifiers that require email verification.
 * Used for consistent messaging and tracking.
 */
export const SENSITIVE_ACTIONS = [
  "founder_upgrade",
  "submit_tool",
  "claim_tool",
  "become_marketplace_creator",
  "leave_review",
  "create_deal",
  "publish_deal",
  "admin_invite",
] as const;

export type SensitiveAction = (typeof SENSITIVE_ACTIONS)[number];

/**
 * Human-readable labels for sensitive actions (used in UI prompts).
 */
export const ACTION_LABELS: Record<SensitiveAction, string> = {
  founder_upgrade: "apply for founder status",
  submit_tool: "launch a stack",
  claim_tool: "claim a stack",
  become_marketplace_creator: "become a marketplace creator",
  leave_review: "leave a review",
  create_deal: "create a deal",
  publish_deal: "publish a deal",
  admin_invite: "accept an admin invite",
};

/**
 * Checks if a user has verified their email.
 * Throws a structured error if not verified, which the frontend can catch
 * and display the verification prompt.
 */
export function requireEmailVerified(
  user: User,
  actionLabel?: string
): void {
  if (user.emailVerified) return;

  const message = actionLabel
    ? `Please verify your email to ${actionLabel}. This is a one-time step to secure your account.`
    : "Please verify your email to perform this action.";

  const error = new Error(message);
  (error as any).code = "EMAIL_NOT_VERIFIED";
  (error as any).actionLabel = actionLabel;
  throw error;
}

/**
 * Returns whether the user's email is verified.
 * Non-throwing version for conditional UI rendering.
 */
export function isEmailVerified(user: User | null): boolean {
  return user?.emailVerified === true;
}
