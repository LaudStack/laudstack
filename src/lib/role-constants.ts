/**
 * Role labels and descriptions — shared between server actions and client components.
 * 
 * IMPORTANT: This file must NOT import from admin-auth.ts or any server-only module.
 * It is imported by "use client" components and must remain free of server dependencies.
 */

export type StaffRole =
  | "customer_rep"
  | "moderator"
  | "analyst"
  | "manager"
  | "admin"
  | "super_admin";

export const STAFF_ROLES: StaffRole[] = [
  "customer_rep",
  "moderator",
  "analyst",
  "manager",
  "admin",
  "super_admin",
];

export const ROLE_LABELS: Record<string, string> = {
  user: "User",
  customer_rep: "Customer Rep",
  moderator: "Moderator",
  analyst: "Analyst",
  manager: "Manager",
  admin: "Admin",
  super_admin: "Super Admin",
};

export const ROLE_DESCRIPTIONS: Record<string, string> = {
  customer_rep: "Can view content and respond to user inquiries. Read-only access to most admin features.",
  moderator: "Can moderate content, reviews, and comments. Can edit and approve stacks.",
  analyst: "Read-only access to analytics, revenue data, and activity logs.",
  manager: "Can moderate content, manage tools, deals, and users. Cannot change settings or manage staff.",
  admin: "Full access to all features except staff management and critical settings.",
  super_admin: "Full unrestricted access to all platform features including staff and settings.",
};
