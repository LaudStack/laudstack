"use server";

import { db } from "@/server/db";
import { tools, upvotes, users, laudRateLimits } from "@/drizzle/schema";
import { eq, and, desc, sql, count, gte, inArray } from "drizzle-orm";
import { recalcAndPersistToolScore } from "@/lib/ranking";
import { createClient } from "@/lib/supabase/server";
import { getUserBySupabaseId } from "@/server/db";
import { headers } from "next/headers";

// ─── Auth helpers ───────────────────────────────────────────────────────────

async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;
  return getUserBySupabaseId(authUser.id);
}

async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

async function requireFounder() {
  const user = await requireAuth();
  if (user.founderStatus !== "verified" && user.founderStatus !== "pending") {
    throw new Error("NOT_A_FOUNDER");
  }
  return user;
}

async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "admin" && user.role !== "super_admin") {
    throw new Error("NOT_ADMIN");
  }
  return user;
}

// ─── Client info helpers ────────────────────────────────────────────────────

async function getClientIp(): Promise<string> {
  try {
    const hdrs = await headers();
    return hdrs.get("x-forwarded-for")?.split(",")[0]?.trim()
      || hdrs.get("x-real-ip")
      || "unknown";
  } catch {
    return "unknown";
  }
}

async function getClientUserAgent(): Promise<string> {
  try {
    const hdrs = await headers();
    return hdrs.get("user-agent") || "unknown";
  } catch {
    return "unknown";
  }
}

// ─── Anti-fraud: Rate Limiting ──────────────────────────────────────────────

const LAUD_RATE_LIMITS = {
  perUser24h: 30,   // Max 30 lauds per user per 24 hours
  perIp24h: 50,     // Max 50 lauds per IP per 24 hours
  perUser1h: 15,    // Max 15 lauds per user per hour (burst protection)
};

async function checkLaudRateLimit(userId: number, ip: string): Promise<{ allowed: boolean; reason?: string }> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  // Check user 24h limit
  const recentByUser24h = await db.select({ count: count() })
    .from(laudRateLimits)
    .where(and(
      eq(laudRateLimits.userId, userId),
      gte(laudRateLimits.createdAt, oneDayAgo)
    ));
  if ((recentByUser24h[0]?.count ?? 0) >= LAUD_RATE_LIMITS.perUser24h) {
    return { allowed: false, reason: "You've reached the daily laud limit. Please try again tomorrow." };
  }

  // Check user 1h burst limit
  const recentByUser1h = await db.select({ count: count() })
    .from(laudRateLimits)
    .where(and(
      eq(laudRateLimits.userId, userId),
      gte(laudRateLimits.createdAt, oneHourAgo)
    ));
  if ((recentByUser1h[0]?.count ?? 0) >= LAUD_RATE_LIMITS.perUser1h) {
    return { allowed: false, reason: "Too many lauds in a short time. Please wait a bit." };
  }

  // Check IP 24h limit
  if (ip !== "unknown") {
    const recentByIp = await db.select({ count: count() })
      .from(laudRateLimits)
      .where(and(
        eq(laudRateLimits.ipAddress, ip),
        gte(laudRateLimits.createdAt, oneDayAgo)
      ));
    if ((recentByIp[0]?.count ?? 0) >= LAUD_RATE_LIMITS.perIp24h) {
      return { allowed: false, reason: "Too many lauds from this network. Please try again later." };
    }
  }

  return { allowed: true };
}

// ─── Bot detection ──────────────────────────────────────────────────────────

function isSuspiciousUserAgent(ua: string): boolean {
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i,
    /python-requests/i, /httpie/i, /postman/i, /insomnia/i,
    /headless/i, /phantom/i, /selenium/i, /puppeteer/i, /playwright/i,
  ];
  if (!ua || ua === "unknown") return true;
  return botPatterns.some(p => p.test(ua));
}

// ─── Toggle Laud (upvote/un-upvote) ────────────────────────────────────────

export async function toggleLaud(toolId: number): Promise<{
  success: boolean;
  lauded?: boolean;
  newCount?: number;
  error?: string;
}> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Please sign in to laud a stack" };

  // Validate tool exists and is approved or featured
  const tool = await db.query.tools.findFirst({
    where: and(eq(tools.id, toolId), inArray(tools.status, ["approved", "featured"])),
    columns: { id: true, upvoteCount: true },
  });
  if (!tool) return { success: false, error: "Stack not found" };

  // Get client info
  const ip = await getClientIp();
  const userAgent = await getClientUserAgent();

  // Bot detection
  if (isSuspiciousUserAgent(userAgent)) {
    return { success: false, error: "Request blocked" };
  }

  // Check if already lauded
  const existing = await db.select({ id: upvotes.id })
    .from(upvotes)
    .where(and(eq(upvotes.toolId, toolId), eq(upvotes.userId, user.id)))
    .limit(1);

  if (existing.length > 0) {
    // UN-LAUD: remove the upvote
    await db.delete(upvotes).where(eq(upvotes.id, existing[0].id));
    await db.update(tools).set({
      upvoteCount: sql`GREATEST(${tools.upvoteCount} - 1, 0)`,
      updatedAt: new Date(),
    }).where(eq(tools.id, toolId));

    // Get updated count
    const updated = await db.select({ upvoteCount: tools.upvoteCount })
      .from(tools).where(eq(tools.id, toolId));

    // Refresh rank score (fire-and-forget — don't block the response)
    recalcAndPersistToolScore(toolId).catch((err) =>
      console.error(`[Laud] recalc failed for tool ${toolId}:`, err),
    );
    return { success: true, lauded: false, newCount: updated[0]?.upvoteCount ?? 0 };
  } else {
    // LAUD: check rate limits first
    const rateCheck = await checkLaudRateLimit(user.id, ip);
    if (!rateCheck.allowed) {
      return { success: false, error: rateCheck.reason };
    }

    // Insert upvote with IP and user agent tracking
    await db.insert(upvotes).values({
      toolId,
      userId: user.id,
      ipAddress: ip,
      userAgent: userAgent,
    });

    // Update tool count
    await db.update(tools).set({
      upvoteCount: sql`${tools.upvoteCount} + 1`,
      updatedAt: new Date(),
    }).where(eq(tools.id, toolId));

    // Record rate limit entry
    await db.insert(laudRateLimits).values({
      userId: user.id,
      ipAddress: ip,
      actionType: "laud",
    });

    // Get updated count
    const updated = await db.select({ upvoteCount: tools.upvoteCount })
      .from(tools).where(eq(tools.id, toolId));

    // Refresh rank score (fire-and-forget — don't block the response)
    recalcAndPersistToolScore(toolId).catch((err) =>
      console.error(`[Laud] recalc failed for tool ${toolId}:`, err),
    );
    return { success: true, lauded: true, newCount: updated[0]?.upvoteCount ?? 0 };
  }
}

// ─── Get User's Lauded Tool IDs ─────────────────────────────────────────────

export async function getUserLaudedToolIds(): Promise<number[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const rows = await db.select({ toolId: upvotes.toolId })
    .from(upvotes)
    .where(eq(upvotes.userId, user.id));

  return rows.map(r => r.toolId);
}

// ─── Get User's Lauded Tools (with details for dashboard) ──────────────────

export async function getUserLaudedTools() {
  const user = await getCurrentUser();
  if (!user) return [];

  return db
    .select({
      id: tools.id,
      slug: tools.slug,
      name: tools.name,
      tagline: tools.tagline,
      logoUrl: tools.logoUrl,
      category: tools.category,
      pricingModel: tools.pricingModel,
      averageRating: tools.averageRating,
      reviewCount: tools.reviewCount,
      upvoteCount: tools.upvoteCount,
      laudedAt: upvotes.createdAt,
    })
    .from(upvotes)
    .innerJoin(tools, eq(upvotes.toolId, tools.id))
    .where(eq(upvotes.userId, user.id))
    .orderBy(desc(upvotes.createdAt));
}

// ─── Get User Laud Count ────────────────────────────────────────────────────

export async function getUserLaudCount(): Promise<number> {
  const user = await getCurrentUser();
  if (!user) return 0;

  const result = await db.select({ count: count() })
    .from(upvotes)
    .where(eq(upvotes.userId, user.id));

  return result[0]?.count ?? 0;
}

// ─── Founder: Get Lauds on Their Tools ──────────────────────────────────────

export async function getFounderLauds() {
  try {
    const user = await requireFounder();

    // Get founder's tools
    const founderTools = await db
      .select({ id: tools.id, name: tools.name, slug: tools.slug, logoUrl: tools.logoUrl, upvoteCount: tools.upvoteCount })
      .from(tools)
      .where(eq(tools.submittedBy, user.id));

    if (founderTools.length === 0) {
      return { success: true, tools: [], totalLauds: 0, recentLauds: [] };
    }

    const toolIds = founderTools.map(t => t.id);
    const toolMap = Object.fromEntries(founderTools.map(t => [t.id, t]));

    // Total lauds across all founder tools
    const totalLauds = founderTools.reduce((sum, t) => sum + t.upvoteCount, 0);

    // Recent lauds with user info (last 50)
    const recentLauds = await db
      .select({
        id: upvotes.id,
        toolId: upvotes.toolId,
        userId: upvotes.userId,
        createdAt: upvotes.createdAt,
        userName: users.name,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userAvatar: users.avatarUrl,
        userEmail: users.email,
      })
      .from(upvotes)
      .leftJoin(users, eq(upvotes.userId, users.id))
      .where(inArray(upvotes.toolId, toolIds))
      .orderBy(desc(upvotes.createdAt))
      .limit(50);

    // Enrich with tool info and display names
    const enrichedLauds = recentLauds.map(l => ({
      ...l,
      userName: (l.userFirstName ? [l.userFirstName, l.userLastName].filter(Boolean).join(" ") : null) ?? l.userName ?? "Anonymous",
      toolName: toolMap[l.toolId]?.name || "Unknown",
      toolSlug: toolMap[l.toolId]?.slug || "",
      toolLogoUrl: toolMap[l.toolId]?.logoUrl || "",
    }));

    // Per-tool laud breakdown
    const toolBreakdown = founderTools.map(t => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      logoUrl: t.logoUrl,
      laudCount: t.upvoteCount,
    }));

    return {
      success: true,
      totalLauds,
      tools: toolBreakdown,
      recentLauds: enrichedLauds,
    };
  } catch (e: unknown) {
    return { success: false, tools: [], totalLauds: 0, recentLauds: [], error: (e as Error).message };
  }
}

// ─── Admin: Get All Laud Activity ───────────────────────────────────────────

export async function getAdminLaudActivity(opts: {
  page?: number;
  limit?: number;
  toolId?: number;
  userId?: number;
} = {}) {
  try {
    await requireAdmin();

    const { page = 1, limit = 50, toolId, userId } = opts;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (toolId) conditions.push(eq(upvotes.toolId, toolId));
    if (userId) conditions.push(eq(upvotes.userId, userId));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, totalResult] = await Promise.all([
      db
        .select({
          id: upvotes.id,
          toolId: upvotes.toolId,
          userId: upvotes.userId,
          ipAddress: upvotes.ipAddress,
          userAgent: upvotes.userAgent,
          createdAt: upvotes.createdAt,
          userName: users.name,
          userFirstName: users.firstName,
          userLastName: users.lastName,
          userEmail: users.email,
          toolName: tools.name,
          toolSlug: tools.slug,
        })
        .from(upvotes)
        .leftJoin(users, eq(upvotes.userId, users.id))
        .leftJoin(tools, eq(upvotes.toolId, tools.id))
        .where(whereClause)
        .orderBy(desc(upvotes.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(upvotes).where(whereClause),
    ]);

    const enrichedRows = rows.map(r => ({
      ...r,
      userName: (r.userFirstName ? [r.userFirstName, r.userLastName].filter(Boolean).join(" ") : null) ?? r.userName ?? "Anonymous",
    }));

    return {
      success: true,
      lauds: enrichedRows,
      total: totalResult[0]?.count ?? 0,
      page,
      limit,
    };
  } catch (e: unknown) {
    return { success: false, lauds: [], total: 0, page: 1, limit: 50, error: (e as Error).message };
  }
}

// ─── Admin: Get Suspicious Laud Patterns ────────────────────────────────────

export async function getAdminSuspiciousLauds() {
  try {
    await requireAdmin();

    // Find IPs with unusually high laud counts in last 24h
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const suspiciousIps = await db
      .select({
        ipAddress: upvotes.ipAddress,
        laudCount: count(),
      })
      .from(upvotes)
      .where(gte(upvotes.createdAt, oneDayAgo))
      .groupBy(upvotes.ipAddress)
      .having(sql`count(*) > 10`);

    // Find users with unusually high laud counts in last 24h
    const suspiciousUsersRaw = await db
      .select({
        userId: upvotes.userId,
        laudCount: count(),
        userName: users.name,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userEmail: users.email,
      })
      .from(upvotes)
      .leftJoin(users, eq(upvotes.userId, users.id))
      .where(gte(upvotes.createdAt, oneDayAgo))
      .groupBy(upvotes.userId, users.name, users.firstName, users.lastName, users.email)
      .having(sql`count(*) > 15`);

    const suspiciousUsers = suspiciousUsersRaw.map(u => ({
      userId: u.userId,
      laudCount: u.laudCount,
      userName: (u.userFirstName ? [u.userFirstName, u.userLastName].filter(Boolean).join(' ') : null) ?? u.userName ?? 'Unknown',
      userEmail: u.userEmail,
    }));

    // Find tools with sudden laud spikes (more than 20 lauds in 24h)
    const suspiciousTools = await db
      .select({
        toolId: upvotes.toolId,
        laudCount: count(),
        toolName: tools.name,
        toolSlug: tools.slug,
      })
      .from(upvotes)
      .leftJoin(tools, eq(upvotes.toolId, tools.id))
      .where(gte(upvotes.createdAt, oneDayAgo))
      .groupBy(upvotes.toolId, tools.name, tools.slug)
      .having(sql`count(*) > 20`);

    return {
      success: true,
      suspiciousIps,
      suspiciousUsers,
      suspiciousTools,
    };
  } catch (e: unknown) {
    return { success: false, suspiciousIps: [], suspiciousUsers: [], suspiciousTools: [], error: (e as Error).message };
  }
}

// ─── Admin: Remove Fraudulent Lauds ─────────────────────────────────────────

export async function adminRemoveLauds(opts: {
  laudIds?: number[];
  userId?: number;
  ipAddress?: string;
  toolId?: number;
}): Promise<{ success: boolean; removedCount?: number; error?: string }> {
  try {
    await requireAdmin();

    let removedCount = 0;

    if (opts.laudIds && opts.laudIds.length > 0) {
      // Remove specific lauds by ID
      for (const laudId of opts.laudIds) {
        const laud = await db.select({ toolId: upvotes.toolId }).from(upvotes).where(eq(upvotes.id, laudId)).limit(1);
        if (laud.length > 0) {
          await db.delete(upvotes).where(eq(upvotes.id, laudId));
          await db.update(tools).set({
            upvoteCount: sql`GREATEST(${tools.upvoteCount} - 1, 0)`,
            updatedAt: new Date(),
          }).where(eq(tools.id, laud[0].toolId));
          removedCount++;
        }
      }
    } else if (opts.userId) {
      // Remove all lauds from a specific user
      const userLauds = await db.select({ id: upvotes.id, toolId: upvotes.toolId })
        .from(upvotes).where(eq(upvotes.userId, opts.userId));

      for (const laud of userLauds) {
        await db.delete(upvotes).where(eq(upvotes.id, laud.id));
        await db.update(tools).set({
          upvoteCount: sql`GREATEST(${tools.upvoteCount} - 1, 0)`,
          updatedAt: new Date(),
        }).where(eq(tools.id, laud.toolId));
        removedCount++;
      }
    } else if (opts.ipAddress) {
      // Remove all lauds from a specific IP
      const ipLauds = await db.select({ id: upvotes.id, toolId: upvotes.toolId })
        .from(upvotes).where(eq(upvotes.ipAddress, opts.ipAddress));

      for (const laud of ipLauds) {
        await db.delete(upvotes).where(eq(upvotes.id, laud.id));
        await db.update(tools).set({
          upvoteCount: sql`GREATEST(${tools.upvoteCount} - 1, 0)`,
          updatedAt: new Date(),
        }).where(eq(tools.id, laud.toolId));
        removedCount++;
      }
    } else if (opts.toolId) {
      // Remove all lauds from a specific tool (nuclear option)
      const toolLauds = await db.select({ id: upvotes.id })
        .from(upvotes).where(eq(upvotes.toolId, opts.toolId));

      await db.delete(upvotes).where(eq(upvotes.toolId, opts.toolId));
      await db.update(tools).set({
        upvoteCount: 0,
        updatedAt: new Date(),
      }).where(eq(tools.id, opts.toolId));
      removedCount = toolLauds.length;
    }

    return { success: true, removedCount };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Admin: Get Laud Stats Overview ─────────────────────────────────────────

export async function getAdminLaudStats() {
  try {
    await requireAdmin();

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalLauds, laudsToday, laudsThisWeek, uniqueUsers] = await Promise.all([
      db.select({ count: count() }).from(upvotes),
      db.select({ count: count() }).from(upvotes).where(gte(upvotes.createdAt, oneDayAgo)),
      db.select({ count: count() }).from(upvotes).where(gte(upvotes.createdAt, oneWeekAgo)),
      db.select({ count: sql<number>`COUNT(DISTINCT ${upvotes.userId})` }).from(upvotes),
    ]);

    // Most lauded tools
    const mostLauded = await db
      .select({
        id: tools.id,
        name: tools.name,
        slug: tools.slug,
        logoUrl: tools.logoUrl,
        upvoteCount: tools.upvoteCount,
      })
      .from(tools)
      .where(inArray(tools.status, ["approved", "featured"]))
      .orderBy(desc(tools.upvoteCount))
      .limit(10);

    return {
      success: true,
      totalLauds: totalLauds[0]?.count ?? 0,
      laudsToday: laudsToday[0]?.count ?? 0,
      laudsThisWeek: laudsThisWeek[0]?.count ?? 0,
      uniqueUsers: uniqueUsers[0]?.count ?? 0,
      mostLauded,
    };
  } catch (e: unknown) {
    return {
      success: false,
      totalLauds: 0,
      laudsToday: 0,
      laudsThisWeek: 0,
      uniqueUsers: 0,
      mostLauded: [],
      error: (e as Error).message,
    };
  }
}

// ─── Most Lauded Stacks (public) ────────────────────────────────────────────

export async function getMostLaudedStacks(limit = 20) {
  return db.select().from(tools)
    .where(and(inArray(tools.status, ["approved", "featured"]), sql`${tools.upvoteCount} > 0`))
    .orderBy(desc(tools.upvoteCount))
    .limit(limit);
}

// ─── Recently Lauded Stacks (public) ────────────────────────────────────────

export async function getRecentlyLaudedStacks(limit = 20) {
  // Get tools that received lauds recently, ordered by most recent laud
  const recentLaudedToolIds = await db
    .select({ toolId: upvotes.toolId })
    .from(upvotes)
    .orderBy(desc(upvotes.createdAt))
    .limit(100);

  // Deduplicate and preserve order
  const seen = new Set<number>();
  const uniqueToolIds: number[] = [];
  for (const row of recentLaudedToolIds) {
    if (!seen.has(row.toolId)) {
      seen.add(row.toolId);
      uniqueToolIds.push(row.toolId);
    }
    if (uniqueToolIds.length >= limit) break;
  }

  if (uniqueToolIds.length === 0) return [];

  const toolRows = await db.select().from(tools)
    .where(and(inArray(tools.status, ["approved", "featured"]), inArray(tools.id, uniqueToolIds)));

  // Preserve the order from the recent lauds
  const toolMap = new Map(toolRows.map(t => [t.id, t]));
  return uniqueToolIds
    .map(id => toolMap.get(id))
    .filter((t): t is NonNullable<typeof t> => t !== undefined);
}
