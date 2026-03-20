import { createClient } from "@/lib/supabase/server";
import { getUserBySupabaseId } from "@/server/db";
import {
  ROLE_HIERARCHY,
  STAFF_ROLES,
  isStaffRole,
  isRoleAtLeast,
  hasPermission,
  type UserRole,
  type Permission,
} from "@/lib/permissions";

// Re-export for backward compatibility
export { ROLE_HIERARCHY, STAFF_ROLES, isStaffRole, isRoleAtLeast, hasPermission };
export type StaffRole = (typeof STAFF_ROLES)[number];

// ─── User auth helpers ────────────────────────────────────────────────────────

/**
 * Returns the current authenticated user or null if not logged in.
 * Does NOT throw — use for optional auth checks.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();
  if (!supabaseUser) return null;
  const dbUser = await getUserBySupabaseId(supabaseUser.id);
  return dbUser ?? null;
}

/**
 * Returns the current authenticated user from Supabase + DB.
 * Throws "UNAUTHORIZED" if not logged in or user not found in DB.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

// ─── Staff / admin auth helpers ───────────────────────────────────────────────

/**
 * Requires any staff role (customer_rep, moderator, analyst, manager, admin, super_admin).
 * Used for basic access to admin panel.
 */
export async function requireStaff() {
  const dbUser = await requireAuth();
  if (!isStaffRole(dbUser.role)) {
    throw new Error("FORBIDDEN");
  }
  return dbUser;
}

/**
 * Requires at least moderator role.
 * Used for content moderation actions.
 */
export async function requireModerator() {
  const dbUser = await requireAuth();
  if (!isRoleAtLeast(dbUser.role, "moderator")) {
    throw new Error("FORBIDDEN");
  }
  return dbUser;
}

/**
 * Requires at least manager role.
 * Used for content management, tool management, etc.
 */
export async function requireManager() {
  const dbUser = await requireAuth();
  if (!isRoleAtLeast(dbUser.role, "manager")) {
    throw new Error("FORBIDDEN");
  }
  return dbUser;
}

/**
 * Requires admin or super_admin role.
 * Used for write operations and most admin features.
 */
export async function requireAdmin() {
  const dbUser = await requireAuth();
  if (!isRoleAtLeast(dbUser.role, "admin")) {
    throw new Error("FORBIDDEN");
  }
  return dbUser;
}

/**
 * Requires super_admin role only.
 * Used for staff management, critical settings, etc.
 */
export async function requireSuperAdmin() {
  const dbUser = await requireAuth();
  if (dbUser.role !== "super_admin") {
    throw new Error("FORBIDDEN");
  }
  return dbUser;
}

/**
 * Requires a specific permission.
 * Checks the user's role against the permission matrix.
 */
export async function requirePermission(permission: Permission) {
  const dbUser = await requireAuth();
  if (!hasPermission(dbUser.role, permission)) {
    throw new Error("FORBIDDEN");
  }
  return dbUser;
}
