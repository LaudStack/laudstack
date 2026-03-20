/**
 * LaudStack — Permissions Module
 *
 * Defines the complete RBAC permission matrix for the platform.
 * Every admin panel feature is gated by a permission key.
 * Each role has an explicit set of allowed permissions.
 *
 * Role hierarchy (ascending privilege):
 *   user < customer_rep < moderator < analyst < manager < admin < super_admin
 *
 * Usage:
 *   import { hasPermission, getNavItemsForRole } from "@/lib/permissions";
 *   if (hasPermission(user.role, "tools.edit")) { ... }
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type UserRole =
  | "user"
  | "customer_rep"
  | "moderator"
  | "analyst"
  | "manager"
  | "admin"
  | "super_admin";

export type Permission =
  // Dashboard
  | "dashboard.view"
  // Analytics
  | "analytics.view"
  // Stacks (tools)
  | "stacks.view"
  | "stacks.edit"
  | "stacks.delete"
  | "stacks.approve"
  // Deals
  | "deals.view"
  | "deals.edit"
  | "deals.delete"
  // Marketplace
  | "marketplace.view"
  | "marketplace.edit"
  | "marketplace.delete"
  // Rankings
  | "rankings.view"
  | "rankings.recalculate"
  // People
  | "users.view"
  | "users.edit"
  | "users.delete"
  | "founders.view"
  | "founders.edit"
  | "creators.view"
  | "creators.edit"
  | "staff.view"
  | "staff.manage"
  // Moderation
  | "reviews.view"
  | "reviews.moderate"
  | "lauds.view"
  | "lauds.moderate"
  | "comments.view"
  | "comments.moderate"
  | "reports.view"
  | "reports.resolve"
  // Promotions
  | "promotions.view"
  | "promotions.edit"
  | "promotions.pricing"
  | "promotions.dotd"
  // Revenue
  | "revenue.view"
  // Marketing
  | "templates.view"
  | "templates.edit"
  | "subscribers.view"
  | "subscribers.manage"
  | "messages.view"
  | "messages.send"
  // System
  | "settings.view"
  | "settings.edit"
  | "activity_log.view"
  | "cron_jobs.view"
  | "cron_jobs.manage";

// ─── Role → Permission Matrix ───────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<UserRole, Set<Permission>> = {
  user: new Set(),

  customer_rep: new Set([
    "dashboard.view",
    "stacks.view",
    "deals.view",
    "marketplace.view",
    "users.view",
    "founders.view",
    "reviews.view",
    "comments.view",
    "reports.view",
    "messages.view",
  ]),

  moderator: new Set([
    "dashboard.view",
    "stacks.view",
    "stacks.edit",
    "stacks.approve",
    "deals.view",
    "deals.edit",
    "marketplace.view",
    "marketplace.edit",
    "rankings.view",
    "users.view",
    "founders.view",
    "founders.edit",
    "creators.view",
    "reviews.view",
    "reviews.moderate",
    "lauds.view",
    "lauds.moderate",
    "comments.view",
    "comments.moderate",
    "reports.view",
    "reports.resolve",
    "messages.view",
    "messages.send",
  ]),

  analyst: new Set([
    "dashboard.view",
    "analytics.view",
    "stacks.view",
    "deals.view",
    "marketplace.view",
    "rankings.view",
    "users.view",
    "founders.view",
    "creators.view",
    "reviews.view",
    "lauds.view",
    "comments.view",
    "reports.view",
    "revenue.view",
    "subscribers.view",
    "activity_log.view",
  ]),

  manager: new Set([
    "dashboard.view",
    "analytics.view",
    "stacks.view",
    "stacks.edit",
    "stacks.approve",
    "deals.view",
    "deals.edit",
    "marketplace.view",
    "marketplace.edit",
    "rankings.view",
    "rankings.recalculate",
    "users.view",
    "users.edit",
    "founders.view",
    "founders.edit",
    "creators.view",
    "creators.edit",
    "reviews.view",
    "reviews.moderate",
    "lauds.view",
    "lauds.moderate",
    "comments.view",
    "comments.moderate",
    "reports.view",
    "reports.resolve",
    "promotions.view",
    "promotions.edit",
    "revenue.view",
    "templates.view",
    "templates.edit",
    "subscribers.view",
    "messages.view",
    "messages.send",
    "settings.view",
    "activity_log.view",
    "cron_jobs.view",
  ]),

  admin: new Set([
    "dashboard.view",
    "analytics.view",
    "stacks.view",
    "stacks.edit",
    "stacks.delete",
    "stacks.approve",
    "deals.view",
    "deals.edit",
    "deals.delete",
    "marketplace.view",
    "marketplace.edit",
    "marketplace.delete",
    "rankings.view",
    "rankings.recalculate",
    "users.view",
    "users.edit",
    "users.delete",
    "founders.view",
    "founders.edit",
    "creators.view",
    "creators.edit",
    "staff.view",
    "reviews.view",
    "reviews.moderate",
    "lauds.view",
    "lauds.moderate",
    "comments.view",
    "comments.moderate",
    "reports.view",
    "reports.resolve",
    "promotions.view",
    "promotions.edit",
    "promotions.pricing",
    "promotions.dotd",
    "revenue.view",
    "templates.view",
    "templates.edit",
    "subscribers.view",
    "subscribers.manage",
    "messages.view",
    "messages.send",
    "settings.view",
    "settings.edit",
    "activity_log.view",
    "cron_jobs.view",
    "cron_jobs.manage",
  ]),

  super_admin: new Set([
    "dashboard.view",
    "analytics.view",
    "stacks.view",
    "stacks.edit",
    "stacks.delete",
    "stacks.approve",
    "deals.view",
    "deals.edit",
    "deals.delete",
    "marketplace.view",
    "marketplace.edit",
    "marketplace.delete",
    "rankings.view",
    "rankings.recalculate",
    "users.view",
    "users.edit",
    "users.delete",
    "founders.view",
    "founders.edit",
    "creators.view",
    "creators.edit",
    "staff.view",
    "staff.manage",
    "reviews.view",
    "reviews.moderate",
    "lauds.view",
    "lauds.moderate",
    "comments.view",
    "comments.moderate",
    "reports.view",
    "reports.resolve",
    "promotions.view",
    "promotions.edit",
    "promotions.pricing",
    "promotions.dotd",
    "revenue.view",
    "templates.view",
    "templates.edit",
    "subscribers.view",
    "subscribers.manage",
    "messages.view",
    "messages.send",
    "settings.view",
    "settings.edit",
    "activity_log.view",
    "cron_jobs.view",
    "cron_jobs.manage",
  ]),
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Check if a role has a specific permission */
export function hasPermission(role: string, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role as UserRole];
  if (!perms) return false;
  return perms.has(permission);
}

/** Check if a role has ANY of the given permissions */
export function hasAnyPermission(role: string, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/** Check if a role has ALL of the given permissions */
export function hasAllPermissions(role: string, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/** Get all permissions for a role */
export function getPermissions(role: string): Permission[] {
  const perms = ROLE_PERMISSIONS[role as UserRole];
  if (!perms) return [];
  return Array.from(perms);
}

// ─── Role hierarchy ─────────────────────────────────────────────────────────

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 0,
  customer_rep: 1,
  moderator: 2,
  analyst: 3,
  manager: 4,
  admin: 5,
  super_admin: 6,
};

export const STAFF_ROLES: UserRole[] = [
  "customer_rep",
  "moderator",
  "analyst",
  "manager",
  "admin",
  "super_admin",
];

export const ALL_ROLES: UserRole[] = [
  "user",
  "customer_rep",
  "moderator",
  "analyst",
  "manager",
  "admin",
  "super_admin",
];

/** Check if a role is a staff role (any role above "user") */
export function isStaffRole(role: string): boolean {
  return (ROLE_HIERARCHY[role as UserRole] ?? 0) >= ROLE_HIERARCHY.customer_rep;
}

/** Check if role A has equal or higher privilege than role B */
export function isRoleAtLeast(role: string, minimumRole: UserRole): boolean {
  return (ROLE_HIERARCHY[role as UserRole] ?? 0) >= ROLE_HIERARCHY[minimumRole];
}

// ─── Admin sidebar nav filtering ────────────────────────────────────────────

export interface AdminNavLink {
  type: "link";
  href: string;
  icon: string; // icon name for dynamic lookup
  label: string;
  badge?: string;
  requiredPermission: Permission;
}

export interface AdminNavDropdown {
  type: "dropdown";
  id: string;
  icon: string;
  label: string;
  children: Omit<AdminNavLink, "type">[];
}

export interface AdminNavSection {
  type: "section";
  label: string;
}

export type AdminNavItem = AdminNavLink | AdminNavDropdown | AdminNavSection;

/**
 * Filter nav items based on user's role permissions.
 * Removes items the user doesn't have permission to see.
 * Removes dropdowns where all children are filtered out.
 */
export function filterNavItemsByRole(
  items: AdminNavItem[],
  role: string
): AdminNavItem[] {
  return items
    .map((item) => {
      if (item.type === "section") return item;
      if (item.type === "link") {
        return hasPermission(role, item.requiredPermission) ? item : null;
      }
      if (item.type === "dropdown") {
        const visibleChildren = item.children.filter((child) =>
          hasPermission(role, child.requiredPermission)
        );
        if (visibleChildren.length === 0) return null;
        return { ...item, children: visibleChildren };
      }
      return null;
    })
    .filter(Boolean) as AdminNavItem[];
}

// ─── Route → Permission mapping ─────────────────────────────────────────────

/**
 * Maps admin panel routes to the permission required to access them.
 * Used by middleware for server-side route protection.
 */
export const ROUTE_PERMISSIONS: Record<string, Permission> = {
  "/ops-console/dashboard": "dashboard.view",
  "/ops-console/analytics": "analytics.view",
  "/ops-console/stacks/listed": "stacks.view",
  "/ops-console/stacks/launches": "stacks.view",
  "/ops-console/stacks/claimed": "stacks.view",
  "/ops-console/deals": "deals.view",
  "/ops-console/marketplace": "marketplace.view",
  "/ops-console/rankings": "rankings.view",
  "/ops-console/users": "users.view",
  "/ops-console/founders": "founders.view",
  "/ops-console/creators": "creators.view",
  "/ops-console/staff": "staff.view",
  "/ops-console/reviews": "reviews.view",
  "/ops-console/lauds": "lauds.view",
  "/ops-console/comments": "comments.view",
  "/ops-console/reports": "reports.view",
  "/ops-console/promotions": "promotions.view",
  "/ops-console/promotions/pricing": "promotions.pricing",
  "/ops-console/promotions/dotd": "promotions.dotd",
  "/ops-console/revenue": "revenue.view",
  "/ops-console/templates": "templates.view",
  "/ops-console/subscribers": "subscribers.view",
  "/ops-console/messages": "messages.view",
  "/ops-console/settings": "settings.view",
  "/ops-console/system/activity-log": "activity_log.view",
  "/ops-console/system/cron-jobs": "cron_jobs.view",
};
