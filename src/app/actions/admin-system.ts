"use server";

import { db } from "@/server/db";
import { requireStaff, requireAdmin, requireSuperAdmin, STAFF_ROLES } from "@/lib/admin-auth";
import type { StaffRole } from "@/lib/admin-auth";
import { ROLE_LABELS } from "@/lib/role-constants";
import {
  users,
  tools,
  reviews,
  adminAuditLog,
  cronJobRuns,
  rankingWeights,
} from "@/drizzle/schema";
import { eq, desc, asc, ilike, or, and, count, inArray, gte, lte, isNotNull } from "drizzle-orm";

// ROLE_LABELS, ROLE_DESCRIPTIONS, STAFF_ROLES, and StaffRole are now in @/lib/role-constants.ts
// ("use server" files can only export async functions)

// ═══════════════════════════════════════════════════════════════════════════════
// RANKINGS
// ═══════════════════════════════════════════════════════════════════════════════

export async function getRankings(opts: {
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
} = {}) {
  await requireStaff();
  const { search, sort = "rankScore", order = "desc", page = 1, limit = 50 } = opts;
  const offset = (page - 1) * limit;

  const conditions = [eq(tools.status, "approved")];
  if (search) {
    conditions.push(
      or(
        ilike(tools.name, `%${search}%`),
        ilike(tools.slug, `%${search}%`)
      )!
    );
  }

  const where = and(...conditions);

  // Determine sort column
  let orderBy;
  const dir = order === "asc" ? asc : desc;
  switch (sort) {
    case "name": orderBy = dir(tools.name); break;
    case "averageRating": orderBy = dir(tools.averageRating); break;
    case "reviewCount": orderBy = dir(tools.reviewCount); break;
    case "upvoteCount": orderBy = dir(tools.upvoteCount); break;
    case "saveCount": orderBy = dir(tools.saveCount); break;
    case "viewCount": orderBy = dir(tools.viewCount); break;
    case "outboundClickCount": orderBy = dir(tools.outboundClickCount); break;
    case "weeklyRankChange": orderBy = dir(tools.weeklyRankChange); break;
    default: orderBy = dir(tools.rankScore);
  }

  const [totalResult] = await db.select({ count: count() }).from(tools).where(where);
  const total = totalResult?.count ?? 0;

  const rows = await db
    .select({
      id: tools.id,
      name: tools.name,
      slug: tools.slug,
      logoUrl: tools.logoUrl,
      category: tools.category,
      rankScore: tools.rankScore,
      averageRating: tools.averageRating,
      reviewCount: tools.reviewCount,
      upvoteCount: tools.upvoteCount,
      saveCount: tools.saveCount,
      viewCount: tools.viewCount,
      outboundClickCount: tools.outboundClickCount,
      weeklyRankChange: tools.weeklyRankChange,
      isFeatured: tools.isFeatured,
      isSpotlighted: tools.isSpotlighted,
      launchedAt: tools.launchedAt,
    })
    .from(tools)
    .where(where)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  return { tools: rows, total, page, limit };
}

export async function getAlgorithmWeights() {
  await requireStaff();

  // Return the hardcoded weights (these match the computeRankScore function)
  const defaultWeights = [
    { name: "avg_rating", label: "Average Rating", value: 25, description: "Multiplier for the tool's average star rating (0-5)" },
    { name: "review_count", label: "Review Count", value: 15, description: "Multiplier for total number of published reviews" },
    { name: "upvote_count", label: "Upvote Count", value: 10, description: "Multiplier for total upvotes (lauds)" },
    { name: "save_count", label: "Save Count", value: 8, description: "Multiplier for times users saved the tool" },
    { name: "view_count", label: "View Count", value: 0.1, description: "Multiplier for page views (low weight to prevent gaming)" },
    { name: "click_count", label: "Outbound Clicks", value: 5, description: "Multiplier for clicks to the tool's website" },
    { name: "recency_boost_30d", label: "Recency Boost (30 days)", value: 50, description: "Flat bonus for tools launched within the last 30 days" },
    { name: "recency_boost_90d", label: "Recency Boost (90 days)", value: 25, description: "Flat bonus for tools launched within the last 90 days" },
    { name: "weekly_momentum", label: "Weekly Momentum", value: 20, description: "Multiplier for week-over-week engagement change (upvotes + reviews)" },
  ];

  // Check if we have DB-stored overrides
  try {
    const dbWeights = await db.select().from(rankingWeights);
    if (dbWeights.length > 0) {
      const dbMap = new Map(dbWeights.map(w => [w.weightName, w.weightValue]));
      return defaultWeights.map(w => ({
        ...w,
        value: dbMap.get(w.name) ?? w.value,
        hasOverride: dbMap.has(w.name),
      }));
    }
  } catch {
    // Table may not exist yet — return defaults
  }

  return defaultWeights.map(w => ({ ...w, hasOverride: false }));
}

export async function triggerRankingRecalculation() {
  const admin = await requireAdmin();

  // Log the action
  await logAuditAction({
    adminId: admin.id,
    action: "ranking_recalc",
    description: `Manual ranking recalculation triggered by ${admin.name || admin.email}`,
    entityType: "system",
  });

  // Call the internal API route
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  try {
    const res = await fetch(`${baseUrl}/api/admin/recalculate-rankings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    return { success: data.success, message: data.message, updatedCount: data.updatedCount };
  } catch (_error) {
    return { success: false, message: "Failed to trigger recalculation", updatedCount: 0 };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// STAFF MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export async function getStaffMembers(opts: { search?: string; role?: string; page?: number } = {}) {
  await requireSuperAdmin();
  const { search, role, page = 1 } = opts;
  const limit = 50;
  const offset = (page - 1) * limit;

  const conditions = [
    inArray(users.role, ["customer_rep", "manager", "admin", "super_admin"]),
  ];

  if (search) {
    conditions.push(
      or(
        ilike(users.name, `%${search}%`),
        ilike(users.email, `%${search}%`)
      )!
    );
  }
  if (role && role !== "all") {
    conditions.push(eq(users.role, role as any));
  }

  const where = and(...conditions);
  const [totalResult] = await db.select({ count: count() }).from(users).where(where);

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl,
      role: users.role,
      createdAt: users.createdAt,
      lastSignedIn: users.lastSignedIn,
    })
    .from(users)
    .where(where)
    .orderBy(desc(users.lastSignedIn))
    .limit(limit)
    .offset(offset);

  return { staff: rows, total: totalResult?.count ?? 0, page, limit };
}

export async function updateStaffRole(targetUserId: number, newRole: StaffRole) {
  const admin = await requireSuperAdmin();

  // Validate role
  if (!STAFF_ROLES.includes(newRole)) throw new Error("Invalid role");

  // Prevent assigning super_admin role via this function
  if (newRole === "super_admin") {
    throw new Error("FORBIDDEN: Cannot assign Super Admin role. This role is reserved.");
  }

  // Only super_admin can manage other super_admins
  const target = await db.query.users.findFirst({ where: eq(users.id, targetUserId) });
  if (!target) throw new Error("User not found");
  if (target.role === "super_admin" && admin.role !== "super_admin") {
    throw new Error("FORBIDDEN: Cannot modify super admin");
  }

  // Prevent demoting yourself
  if (target.id === admin.id) {
    throw new Error("Cannot change your own role");
  }

  const oldRole = target.role;
  await db.update(users).set({ role: newRole, updatedAt: new Date() }).where(eq(users.id, targetUserId));

  await logAuditAction({
    adminId: admin.id,
    action: "role_change",
    description: `Changed ${target.name || target.email} role from ${ROLE_LABELS[oldRole]} to ${ROLE_LABELS[newRole]}`,
    entityType: "user",
    entityId: targetUserId,
    metadata: { oldRole, newRole, targetName: target.name, targetEmail: target.email },
  });

  return { success: true };
}

export async function promoteToStaff(userId: number, role: StaffRole) {
  const admin = await requireSuperAdmin();

  if (!STAFF_ROLES.includes(role)) throw new Error("Invalid role");
  // Prevent assigning super_admin role
  if (role === "super_admin") {
    throw new Error("FORBIDDEN: Cannot assign Super Admin role. This role is reserved.");
  }

  const target = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!target) throw new Error("User not found");

  await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, userId));

  await logAuditAction({
    adminId: admin.id,
    action: "staff_invite",
    description: `Promoted ${target.name || target.email} to ${ROLE_LABELS[role]}`,
    entityType: "user",
    entityId: userId,
    metadata: { oldRole: target.role, newRole: role },
  });

  return { success: true };
}

export async function removeFromStaff(userId: number) {
  const admin = await requireSuperAdmin();

  const target = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!target) throw new Error("User not found");
  if (target.id === admin.id) throw new Error("Cannot remove yourself from staff");
  if (target.role === "super_admin") {
    throw new Error("FORBIDDEN: Cannot remove a Super Admin from staff.");
  }

  await db.update(users).set({ role: "user", updatedAt: new Date() }).where(eq(users.id, userId));

  await logAuditAction({
    adminId: admin.id,
    action: "role_change",
    description: `Removed ${target.name || target.email} from staff (was ${ROLE_LABELS[target.role]})`,
    entityType: "user",
    entityId: userId,
    metadata: { oldRole: target.role, newRole: "user" },
  });

  return { success: true };
}

export async function searchUsersForStaff(query: string) {
  await requireSuperAdmin();
  if (!query || query.length < 2) return [];

  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl,
      role: users.role,
    })
    .from(users)
    .where(
      and(
        eq(users.role, "user"),
        or(
          ilike(users.name, `%${query}%`),
          ilike(users.email, `%${query}%`)
        )
      )
    )
    .limit(10);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN PROFILE
// ═══════════════════════════════════════════════════════════════════════════════

export async function getAdminProfile() {
  const admin = await requireStaff();
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    avatarUrl: admin.avatarUrl,
    role: admin.role,
    firstName: admin.firstName,
    lastName: admin.lastName,
    createdAt: admin.createdAt,
    lastSignedIn: admin.lastSignedIn,
  };
}

export async function updateAdminProfile(data: {
  name?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}) {
  const admin = await requireStaff();
  await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, admin.id));
  return { success: true };
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIT LOG
// ═══════════════════════════════════════════════════════════════════════════════

export async function logAuditAction(data: {
  adminId: number;
  action: string;
  description: string;
  entityType?: string;
  entityId?: number;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}) {
  try {
    await db.insert(adminAuditLog).values({
      adminId: data.adminId,
      action: data.action as any,
      description: data.description,
      entityType: data.entityType,
      entityId: data.entityId,
      metadata: data.metadata,
      ipAddress: data.ipAddress,
    });
  } catch (error) {
    console.error("[AuditLog] Failed to log action:", error);
    // Don't throw — audit logging should never block the main action
  }
}

export async function getAuditLog(opts: {
  adminId?: number;
  action?: string;
  entityType?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
} = {}) {
  await requireAdmin();
  const { adminId, action, entityType, search, startDate, endDate, page = 1, limit = 50 } = opts;
  const offset = (page - 1) * limit;

  const conditions: any[] = [];
  if (adminId) conditions.push(eq(adminAuditLog.adminId, adminId));
  if (action && action !== "all") conditions.push(eq(adminAuditLog.action, action as any));
  if (entityType && entityType !== "all") conditions.push(eq(adminAuditLog.entityType, entityType));
  if (search) conditions.push(ilike(adminAuditLog.description, `%${search}%`));
  if (startDate) conditions.push(gte(adminAuditLog.createdAt, new Date(startDate)));
  if (endDate) conditions.push(lte(adminAuditLog.createdAt, new Date(endDate)));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db.select({ count: count() }).from(adminAuditLog).where(where);

  const rows = await db
    .select({
      id: adminAuditLog.id,
      adminId: adminAuditLog.adminId,
      action: adminAuditLog.action,
      description: adminAuditLog.description,
      entityType: adminAuditLog.entityType,
      entityId: adminAuditLog.entityId,
      metadata: adminAuditLog.metadata,
      createdAt: adminAuditLog.createdAt,
    })
    .from(adminAuditLog)
    .where(where)
    .orderBy(desc(adminAuditLog.createdAt))
    .limit(limit)
    .offset(offset);

  // Enrich with admin names
  const adminIds = [...new Set(rows.map(r => r.adminId))];
  const admins = adminIds.length > 0
    ? await db.select({ id: users.id, name: users.name, email: users.email, avatarUrl: users.avatarUrl })
        .from(users).where(inArray(users.id, adminIds))
    : [];
  const adminMap = new Map(admins.map(a => [a.id, a]));

  const enriched = rows.map(row => ({
    ...row,
    adminName: adminMap.get(row.adminId)?.name || adminMap.get(row.adminId)?.email || "Unknown",
    adminAvatar: adminMap.get(row.adminId)?.avatarUrl,
  }));

  return { logs: enriched, total: totalResult?.count ?? 0, page, limit };
}

export async function getAuditLogStaffList() {
  await requireAdmin();
  return db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(inArray(users.role, ["customer_rep", "manager", "admin", "super_admin"]))
    .orderBy(asc(users.name));
}

// ═══════════════════════════════════════════════════════════════════════════════
// CRON JOBS MONITOR
// ═══════════════════════════════════════════════════════════════════════════════

const CRON_JOBS = [
  {
    name: "recalculate-rankings",
    label: "Recalculate Rankings",
    schedule: "0 3 * * *",
    description: "Recalculates rank scores for all approved tools based on engagement metrics",
    path: "/api/cron/recalculate-rankings",
  },
  {
    name: "expire-placements",
    label: "Expire Placements",
    schedule: "0 4 * * *",
    description: "Expires completed promotions and activates pending ones",
    path: "/api/cron/expire-placements",
  },
  {
    name: "transition-launches",
    label: "Transition Launches",
    schedule: "0 6 * * *",
    description: "Transitions tools from launch phase to regular listing after 7 days",
    path: "/api/cron/transition-launches",
  },
  {
    name: "launch-notifications",
    label: "Launch Notifications",
    schedule: "0 7 * * *",
    description: "Sends notification emails for newly launched tools",
    path: "/api/cron/launch-notifications",
  },
  {
    name: "daily-digest",
    label: "Daily Digest",
    schedule: "0 8 * * *",
    description: "Sends daily digest emails to subscribers",
    path: "/api/cron/daily-digest",
  },
  {
    name: "expire-offers",
    label: "Expire Marketplace Offers",
    schedule: "0 */6 * * *",
    description: "Expires marketplace offers that have passed their deadline",
    path: "/api/cron/expire-offers",
  },
];

export async function getCronJobStatus() {
  await requireStaff();

  // Get the latest run for each job
  const latestRuns: Record<string, any> = {};

  try {
    for (const job of CRON_JOBS) {
      const [latest] = await db
        .select()
        .from(cronJobRuns)
        .where(eq(cronJobRuns.jobName, job.name))
        .orderBy(desc(cronJobRuns.startedAt))
        .limit(1);
      latestRuns[job.name] = latest || null;
    }
  } catch {
    // Table may not exist yet
  }

  return CRON_JOBS.map(job => ({
    ...job,
    lastRun: latestRuns[job.name],
  }));
}

export async function getCronJobHistory(jobName: string, page = 1) {
  await requireStaff();
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    const [totalResult] = await db
      .select({ count: count() })
      .from(cronJobRuns)
      .where(eq(cronJobRuns.jobName, jobName));

    const rows = await db
      .select()
      .from(cronJobRuns)
      .where(eq(cronJobRuns.jobName, jobName))
      .orderBy(desc(cronJobRuns.startedAt))
      .limit(limit)
      .offset(offset);

    return { runs: rows, total: totalResult?.count ?? 0, page, limit };
  } catch {
    return { runs: [], total: 0, page, limit };
  }
}

export async function triggerCronJob(jobName: string) {
  const admin = await requireAdmin();

  const job = CRON_JOBS.find(j => j.name === jobName);
  if (!job) throw new Error("Unknown cron job");

  await logAuditAction({
    adminId: admin.id,
    action: "other",
    description: `Manually triggered cron job: ${job.label}`,
    entityType: "cron",
    metadata: { jobName },
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

  try {
    const res = await fetch(`${baseUrl}${job.path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    return { success: true, data };
  } catch (_error) {
    return { success: false, error: "Failed to trigger cron job" };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTS / FLAGGED CONTENT
// ═══════════════════════════════════════════════════════════════════════════════

export async function getFlaggedContent(opts: {
  type?: string;
  page?: number;
} = {}) {
  await requireStaff();
  const { type, page = 1 } = opts;
  const limit = 50;
  const offset = (page - 1) * limit;

  const results: {
    flaggedReviews: any[];
    flaggedComments: any[];
    totalReviews: number;
    totalComments: number;
  } = {
    flaggedReviews: [],
    flaggedComments: [],
    totalReviews: 0,
    totalComments: 0,
  };

  // Flagged reviews
  if (!type || type === "all" || type === "reviews") {
    const [reviewTotal] = await db
      .select({ count: count() })
      .from(reviews)
      .where(and(isNotNull(reviews.flagReason), eq(reviews.status, "published")));
    results.totalReviews = reviewTotal?.count ?? 0;

    results.flaggedReviews = await db
      .select({
        id: reviews.id,
        toolId: reviews.toolId,
        userId: reviews.userId,
        title: reviews.title,
        content: reviews.body,
        rating: reviews.rating,
        flagReason: reviews.flagReason,
        flaggedAt: reviews.flaggedAt,
        flaggedBy: reviews.flaggedBy,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .where(and(isNotNull(reviews.flagReason), eq(reviews.status, "published")))
      .orderBy(desc(reviews.flaggedAt))
      .limit(limit)
      .offset(offset);

    // Enrich with tool names and user names
    if (results.flaggedReviews.length > 0) {
      const toolIds = [...new Set(results.flaggedReviews.map(r => r.toolId))];
      const userIds = [...new Set(results.flaggedReviews.map(r => r.userId))];

      const toolNames = await db.select({ id: tools.id, name: tools.name }).from(tools).where(inArray(tools.id, toolIds));
      const userNames = await db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(inArray(users.id, userIds));

      const toolMap = new Map(toolNames.map(t => [t.id, t.name]));
      const userMap = new Map(userNames.map(u => [u.id, u.name || u.email]));

      results.flaggedReviews = results.flaggedReviews.map(r => ({
        ...r,
        toolName: toolMap.get(r.toolId) || "Unknown Tool",
        userName: userMap.get(r.userId) || "Unknown User",
        contentType: "review",
      }));
    }
  }

  // Note: Comments table doesn't have flagReason column yet.
  // Flagged comments will be supported once the column is added to the schema.
  results.totalComments = 0;
  results.flaggedComments = [];

  return results;
}

export async function getReportsSummary() {
  await requireStaff();

  let flaggedReviews = 0;
  let flaggedComments = 0;

  try {
    const [reviewCount] = await db
      .select({ count: count() })
      .from(reviews)
      .where(and(isNotNull(reviews.flagReason), eq(reviews.status, "published")));
    flaggedReviews = reviewCount?.count ?? 0;
  } catch {}

  // Comments don't have flagReason column yet
  flaggedComments = 0;

  return {
    flaggedReviews,
    flaggedComments,
    total: flaggedReviews + flaggedComments,
  };
}
