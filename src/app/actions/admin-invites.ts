"use server";

import { db } from "@/server/db";
import * as schema from "@/drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireSuperAdmin } from "@/lib/admin-auth";
import { STAFF_ROLES, isStaffRole, type UserRole } from "@/lib/permissions";
import { randomBytes } from "crypto";
import { sendAdminInviteEmail } from "@/server/email";
import { logAuditAction } from "@/app/actions/admin-system";

// ─── Token generation ─────────────────────────────────────────────────────────

function generateSecureToken(): string {
  return randomBytes(48).toString("base64url");
}

// ─── Create invite ────────────────────────────────────────────────────────────

export async function createAdminInvite(data: {
  email: string;
  role: string;
  message?: string;
}) {
  const admin = await requireSuperAdmin();

  // Validate role
  if (!isStaffRole(data.role)) {
    throw new Error("Invalid role. Must be a staff role.");
  }

  // Cannot create super_admin invites
  if (data.role === "super_admin") {
    throw new Error("Cannot create invites for Super Admin role.");
  }

  const email = data.email.trim().toLowerCase();

  // Check if email is already a staff member
  const existingUser = await db.query.users.findFirst({
    where: and(
      eq(schema.users.email, email),
      sql`${schema.users.role} != 'user'`
    ),
  });

  if (existingUser) {
    throw new Error(
      `${email} is already a staff member with role: ${existingUser.role}`
    );
  }

  // Check for existing pending invite for this email
  const existingInvite = await db.query.adminInvites.findFirst({
    where: and(
      eq(schema.adminInvites.email, email),
      eq(schema.adminInvites.status, "pending")
    ),
  });

  if (existingInvite) {
    throw new Error(
      `A pending invite already exists for ${email}. Revoke it first or resend.`
    );
  }

  // Generate secure token
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create invite record
  const [invite] = await db
    .insert(schema.adminInvites)
    .values({
      email,
      role: data.role as UserRole,
      token,
      expiresAt,
      invitedBy: admin.id,
      message: data.message || null,
    })
    .returning();

  // Send invite email
  const emailSent = await sendAdminInviteEmail({
    recipientEmail: email,
    inviterName: admin.name || admin.email || "Super Admin",
    role: data.role,
    token,
    message: data.message,
    expiresAt,
  });

  // Log audit action
  await logAuditAction({
    adminId: admin.id,
    action: "admin_invite_created",
    description: `Invited ${email} as ${data.role}. Email ${emailSent ? "sent" : "failed"}.`,
    entityType: "admin_invite",
    entityId: invite.id,
  });

  return { invite, emailSent };
}

// ─── Resend invite ────────────────────────────────────────────────────────────

export async function resendAdminInvite(inviteId: number) {
  const admin = await requireSuperAdmin();

  const invite = await db.query.adminInvites.findFirst({
    where: eq(schema.adminInvites.id, inviteId),
  });

  if (!invite) throw new Error("Invite not found.");
  if (invite.status !== "pending") throw new Error("Can only resend pending invites.");

  // Generate new token and extend expiration
  const newToken = generateSecureToken();
  const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db
    .update(schema.adminInvites)
    .set({ token: newToken, expiresAt: newExpiresAt })
    .where(eq(schema.adminInvites.id, inviteId));

  // Send new email
  const emailSent = await sendAdminInviteEmail({
    recipientEmail: invite.email,
    inviterName: admin.name || admin.email || "Super Admin",
    role: invite.role,
    token: newToken,
    message: invite.message ?? undefined,
    expiresAt: newExpiresAt,
  });

  await logAuditAction({
    adminId: admin.id,
    action: "admin_invite_resent",
    description: `Resent invite to ${invite.email}. Email ${emailSent ? "sent" : "failed"}.`,
    entityType: "admin_invite",
    entityId: inviteId,
  });

  return { emailSent };
}

// ─── Revoke invite ────────────────────────────────────────────────────────────

export async function revokeAdminInvite(inviteId: number) {
  const admin = await requireSuperAdmin();

  const invite = await db.query.adminInvites.findFirst({
    where: eq(schema.adminInvites.id, inviteId),
  });

  if (!invite) throw new Error("Invite not found.");
  if (invite.status !== "pending") throw new Error("Can only revoke pending invites.");

  await db
    .update(schema.adminInvites)
    .set({ status: "revoked" })
    .where(eq(schema.adminInvites.id, inviteId));

  await logAuditAction({
    adminId: admin.id,
    action: "admin_invite_revoked",
    description: `Revoked invite for ${invite.email}.`,
    entityType: "admin_invite",
    entityId: inviteId,
  });

  return { success: true };
}

// ─── List invites ─────────────────────────────────────────────────────────────

export async function getAdminInvites(opts: {
  status?: string;
  page?: number;
} = {}) {
  const admin = await requireSuperAdmin();

  const conditions = [];
  if (opts.status && opts.status !== "all") {
    conditions.push(eq(schema.adminInvites.status, opts.status as any));
  }

  const limit = 20;
  const offset = ((opts.page || 1) - 1) * limit;

  const invites = await db.query.adminInvites.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: desc(schema.adminInvites.createdAt),
    limit,
    offset,
  });

  // Get total count
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.adminInvites)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  // Get inviter names
  const inviterIds = [...new Set(invites.map((i) => i.invitedBy))];
  const inviters =
    inviterIds.length > 0
      ? await db.query.users.findMany({
          where: sql`${schema.users.id} IN (${sql.join(
            inviterIds.map((id) => sql`${id}`),
            sql`, `
          )})`,
        })
      : [];
  const inviterMap = Object.fromEntries(inviters.map((u) => [u.id, u]));

  return {
    invites: invites.map((inv) => ({
      ...inv,
      inviterName: inviterMap[inv.invitedBy]?.name || inviterMap[inv.invitedBy]?.email || "Unknown",
    })),
    total: Number(countResult?.count || 0),
  };
}

// ─── Validate invite token (public — no auth required) ───────────────────────

export async function validateInviteToken(token: string) {
  const invite = await db.query.adminInvites.findFirst({
    where: eq(schema.adminInvites.token, token),
  });

  if (!invite) {
    return { valid: false, error: "Invalid invite link." };
  }

  if (invite.status !== "pending") {
    return { valid: false, error: `This invite has been ${invite.status}.` };
  }

  if (new Date() > invite.expiresAt) {
    // Mark as expired
    await db
      .update(schema.adminInvites)
      .set({ status: "expired" })
      .where(eq(schema.adminInvites.id, invite.id));
    return { valid: false, error: "This invite has expired. Please ask the admin to send a new one." };
  }

  // Get inviter info
  const inviter = await db.query.users.findFirst({
    where: eq(schema.users.id, invite.invitedBy),
  });

  return {
    valid: true,
    invite: {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      message: invite.message,
      expiresAt: invite.expiresAt,
      inviterName: inviter?.name || inviter?.email || "Admin",
    },
  };
}

// ─── Accept invite (called after user creates account) ────────────────────────

export async function acceptAdminInvite(token: string, supabaseId: string) {
  const invite = await db.query.adminInvites.findFirst({
    where: and(
      eq(schema.adminInvites.token, token),
      eq(schema.adminInvites.status, "pending")
    ),
  });

  if (!invite) {
    throw new Error("Invalid or expired invite.");
  }

  if (new Date() > invite.expiresAt) {
    await db
      .update(schema.adminInvites)
      .set({ status: "expired" })
      .where(eq(schema.adminInvites.id, invite.id));
    throw new Error("This invite has expired.");
  }

  // Find or create the user in our DB
  let dbUser = await db.query.users.findFirst({
    where: eq(schema.users.supabaseId, supabaseId),
  });

  if (!dbUser) {
    // Create user record
    const [newUser] = await db
      .insert(schema.users)
      .values({
        supabaseId,
        email: invite.email,
        role: invite.role as UserRole,
      })
      .returning();
    dbUser = newUser;
  } else {
    // Update existing user's role
    await db
      .update(schema.users)
      .set({
        role: invite.role as UserRole,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, dbUser.id));
  }

  // Mark invite as accepted
  await db
    .update(schema.adminInvites)
    .set({
      status: "accepted",
      acceptedAt: new Date(),
      acceptedUserId: dbUser.id,
    })
    .where(eq(schema.adminInvites.id, invite.id));

  return { success: true, role: invite.role };
}
