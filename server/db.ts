import { and, desc, eq, gte, like, or, sql, asc, inArray, SQL } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  newsletterSubscribers,
  InsertNewsletterSubscriber,
  stacks,
  InsertStack,
  Stack,
  reviews,
  InsertReview,
  lauds,
  saves,
  clicks,
  views,
  stackScreenshots,
  verificationRequests,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── User helpers ───────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset);
}

// ─── Stack helpers ──────────────────────────────────────────────────────────

export async function createStack(data: InsertStack) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(stacks).values(data);
  const id = result[0].insertId;
  return getStackById(id);
}

export async function updateStack(id: number, data: Partial<InsertStack>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(stacks).set(data).where(eq(stacks.id, id));
  return getStackById(id);
}

export async function getStackById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(stacks).where(eq(stacks.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStackBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(stacks).where(eq(stacks.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listStacks(opts: {
  status?: string;
  category?: string;
  pricingModel?: string;
  search?: string;
  sort?: "rank" | "newest" | "top_rated" | "most_reviewed" | "most_lauded" | "trending";
  isFeatured?: boolean;
  isTrending?: boolean;
  isVerified?: boolean;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const conditions: SQL[] = [];
  if (opts.status) conditions.push(eq(stacks.status, opts.status as any));
  if (opts.category) conditions.push(eq(stacks.category, opts.category));
  if (opts.pricingModel) conditions.push(eq(stacks.pricingModel, opts.pricingModel));
  if (opts.isFeatured !== undefined) conditions.push(eq(stacks.isFeatured, opts.isFeatured));
  if (opts.isTrending !== undefined) conditions.push(eq(stacks.isTrending, opts.isTrending));
  if (opts.isVerified !== undefined) conditions.push(eq(stacks.isVerified, opts.isVerified));
  if (opts.search) {
    conditions.push(
      or(
        like(stacks.name, `%${opts.search}%`),
        like(stacks.tagline, `%${opts.search}%`),
        like(stacks.description, `%${opts.search}%`)
      )!
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  let orderBy;
  switch (opts.sort) {
    case "newest": orderBy = desc(stacks.createdAt); break;
    case "top_rated": orderBy = desc(stacks.averageRating); break;
    case "most_reviewed": orderBy = desc(stacks.reviewCount); break;
    case "most_lauded": orderBy = desc(stacks.laudCount); break;
    case "trending": orderBy = desc(stacks.weeklyRankChange); break;
    default: orderBy = desc(stacks.rankScore); break;
  }

  const limit = opts.limit ?? 20;
  const offset = opts.offset ?? 0;

  const [items, countResult] = await Promise.all([
    db.select().from(stacks).where(where).orderBy(orderBy).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(stacks).where(where),
  ]);

  return { items, total: Number(countResult[0]?.count ?? 0) };
}

export async function deleteStack(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete related data first
  await db.delete(reviews).where(eq(reviews.stackId, id));
  await db.delete(lauds).where(eq(lauds.stackId, id));
  await db.delete(saves).where(eq(saves.stackId, id));
  await db.delete(clicks).where(eq(clicks.stackId, id));
  await db.delete(views).where(eq(views.stackId, id));
  await db.delete(stackScreenshots).where(eq(stackScreenshots.stackId, id));
  await db.delete(verificationRequests).where(eq(verificationRequests.stackId, id));
  await db.delete(stacks).where(eq(stacks.id, id));
}

export async function getStacksByFounder(founderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(stacks).where(eq(stacks.founderId, founderId)).orderBy(desc(stacks.createdAt));
}

// ─── Review helpers ─────────────────────────────────────────────────────────

export async function createReview(data: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(reviews).values(data);
  // Update denormalized counters
  await recalcStackReviewStats(data.stackId);
}

export async function getReviewsByStack(stackId: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).where(eq(reviews.stackId, stackId)).orderBy(desc(reviews.createdAt)).limit(limit).offset(offset);
}

export async function getReviewWithUser(reviewId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select({ review: reviews, user: { id: users.id, name: users.name, avatarUrl: users.avatarUrl } })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.id, reviewId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getReviewsByStackWithUsers(stackId: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ review: reviews, user: { id: users.id, name: users.name, avatarUrl: users.avatarUrl } })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.stackId, stackId))
    .orderBy(desc(reviews.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getUserReviewForStack(userId: number, stackId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(reviews).where(and(eq(reviews.userId, userId), eq(reviews.stackId, stackId))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateFounderReply(reviewId: number, reply: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(reviews).set({ founderReply: reply, founderReplyAt: new Date() }).where(eq(reviews.id, reviewId));
}

export async function incrementHelpful(reviewId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(reviews).set({ helpfulCount: sql`${reviews.helpfulCount} + 1` }).where(eq(reviews.id, reviewId));
}

async function recalcStackReviewStats(stackId: number) {
  const db = await getDb();
  if (!db) return;
  const stats = await db
    .select({
      count: sql<number>`count(*)`,
      avg: sql<string>`COALESCE(AVG(${reviews.rating}), 0)`,
    })
    .from(reviews)
    .where(eq(reviews.stackId, stackId));
  const count = Number(stats[0]?.count ?? 0);
  const avg = parseFloat(stats[0]?.avg ?? "0").toFixed(2);
  await db.update(stacks).set({ reviewCount: count, averageRating: avg }).where(eq(stacks.id, stackId));
}

// ─── Laud helpers ───────────────────────────────────────────────────────────

export async function toggleLaud(stackId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(lauds).where(and(eq(lauds.stackId, stackId), eq(lauds.userId, userId))).limit(1);
  if (existing.length > 0) {
    await db.delete(lauds).where(eq(lauds.id, existing[0].id));
    await db.update(stacks).set({ laudCount: sql`GREATEST(${stacks.laudCount} - 1, 0)` }).where(eq(stacks.id, stackId));
    return false; // un-lauded
  } else {
    await db.insert(lauds).values({ stackId, userId });
    await db.update(stacks).set({ laudCount: sql`${stacks.laudCount} + 1` }).where(eq(stacks.id, stackId));
    return true; // lauded
  }
}

export async function hasUserLauded(stackId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(lauds).where(and(eq(lauds.stackId, stackId), eq(lauds.userId, userId))).limit(1);
  return result.length > 0;
}

export async function getUserLauds(userId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({ stackId: lauds.stackId }).from(lauds).where(eq(lauds.userId, userId));
  return result.map((r) => r.stackId);
}

// ─── Save helpers ───────────────────────────────────────────────────────────

export async function toggleSave(stackId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(saves).where(and(eq(saves.stackId, stackId), eq(saves.userId, userId))).limit(1);
  if (existing.length > 0) {
    await db.delete(saves).where(eq(saves.id, existing[0].id));
    await db.update(stacks).set({ saveCount: sql`GREATEST(${stacks.saveCount} - 1, 0)` }).where(eq(stacks.id, stackId));
    return false; // un-saved
  } else {
    await db.insert(saves).values({ stackId, userId });
    await db.update(stacks).set({ saveCount: sql`${stacks.saveCount} + 1` }).where(eq(stacks.id, stackId));
    return true; // saved
  }
}

export async function hasUserSaved(stackId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(saves).where(and(eq(saves.stackId, stackId), eq(saves.userId, userId))).limit(1);
  return result.length > 0;
}

export async function getUserSaves(userId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({ stackId: saves.stackId }).from(saves).where(eq(saves.userId, userId));
  return result.map((r) => r.stackId);
}

export async function getSavedStacks(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const savedIds = await getUserSaves(userId);
  if (savedIds.length === 0) return [];
  return db.select().from(stacks).where(inArray(stacks.id, savedIds)).orderBy(desc(stacks.rankScore));
}

// ─── Click & View tracking ─────────────────────────────────────────────────

export async function recordClick(stackId: number, type: "website" | "affiliate", userId?: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(clicks).values({ stackId, type, userId: userId ?? null });
  await db.update(stacks).set({ clickCount: sql`${stacks.clickCount} + 1` }).where(eq(stacks.id, stackId));
}

export async function recordView(stackId: number, userId?: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(views).values({ stackId, userId: userId ?? null });
  await db.update(stacks).set({ viewCount: sql`${stacks.viewCount} + 1` }).where(eq(stacks.id, stackId));
}

export async function getClickStats(stackId: number) {
  const db = await getDb();
  if (!db) return { website: 0, affiliate: 0, total: 0 };
  const result = await db
    .select({ type: clicks.type, count: sql<number>`count(*)` })
    .from(clicks)
    .where(eq(clicks.stackId, stackId))
    .groupBy(clicks.type);
  const stats = { website: 0, affiliate: 0, total: 0 };
  result.forEach((r) => {
    const count = Number(r.count);
    if (r.type === "website") stats.website = count;
    if (r.type === "affiliate") stats.affiliate = count;
    stats.total += count;
  });
  return stats;
}

// ─── Verification helpers ───────────────────────────────────────────────────

export async function createVerificationRequest(stackId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Check for existing pending request
  const existing = await db
    .select()
    .from(verificationRequests)
    .where(and(eq(verificationRequests.stackId, stackId), eq(verificationRequests.status, "pending")))
    .limit(1);
  if (existing.length > 0) return existing[0];
  const result = await db.insert(verificationRequests).values({ stackId, userId });
  return { id: result[0].insertId, stackId, userId, status: "pending" as const };
}

export async function updateVerificationRequest(id: number, status: "approved" | "rejected", notes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(verificationRequests).set({ status, notes: notes ?? null }).where(eq(verificationRequests.id, id));
  if (status === "approved") {
    const req = await db.select().from(verificationRequests).where(eq(verificationRequests.id, id)).limit(1);
    if (req.length > 0) {
      await db.update(stacks).set({ isVerified: true }).where(eq(stacks.id, req[0].stackId));
    }
  }
}

export async function getVerificationRequests(status?: string) {
  const db = await getDb();
  if (!db) return [];
  const where = status ? eq(verificationRequests.status, status as any) : undefined;
  return db.select().from(verificationRequests).where(where).orderBy(desc(verificationRequests.createdAt));
}

// ─── Screenshot helpers ─────────────────────────────────────────────────────

export async function addScreenshot(stackId: number, url: string, caption?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const maxOrder = await db
    .select({ max: sql<number>`COALESCE(MAX(${stackScreenshots.sortOrder}), 0)` })
    .from(stackScreenshots)
    .where(eq(stackScreenshots.stackId, stackId));
  const sortOrder = Number(maxOrder[0]?.max ?? 0) + 1;
  await db.insert(stackScreenshots).values({ stackId, url, caption: caption ?? null, sortOrder });
}

export async function getScreenshots(stackId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(stackScreenshots).where(eq(stackScreenshots.stackId, stackId)).orderBy(asc(stackScreenshots.sortOrder));
}

export async function deleteScreenshot(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(stackScreenshots).where(eq(stackScreenshots.id, id));
}

// ─── Ranking algorithm ──────────────────────────────────────────────────────

export async function recalcRankScores() {
  const db = await getDb();
  if (!db) return;
  // Rank score = weighted combination of lauds, reviews, rating, views, recency
  // Formula: laudCount*10 + reviewCount*20 + averageRating*100 + viewCount*0.1 + recencyBonus
  await db.execute(sql`
    UPDATE stacks SET rankScore = (
      laudCount * 10 +
      reviewCount * 20 +
      CAST(averageRating AS SIGNED) * 100 +
      CAST(viewCount * 0.1 AS SIGNED) +
      CASE
        WHEN launchedAt IS NOT NULL AND launchedAt > DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 500
        WHEN launchedAt IS NOT NULL AND launchedAt > DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 200
        ELSE 0
      END
    )
    WHERE status = 'published'
  `);
}

// ─── Newsletter helpers ─────────────────────────────────────────────────────

export async function subscribeToNewsletter(
  data: Pick<InsertNewsletterSubscriber, "email" | "firstName" | "source">
): Promise<{ isNew: boolean; alreadyUnsubscribed: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const email = data.email.toLowerCase().trim();
  const existing = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, email)).limit(1);
  if (existing.length > 0) {
    const sub = existing[0];
    if (sub.unsubscribed) {
      await db.update(newsletterSubscribers).set({ unsubscribed: false, welcomeEmailSent: false }).where(eq(newsletterSubscribers.email, email));
      return { isNew: true, alreadyUnsubscribed: true };
    }
    return { isNew: false, alreadyUnsubscribed: false };
  }
  await db.insert(newsletterSubscribers).values({ email, firstName: data.firstName ?? null, source: data.source ?? "footer", welcomeEmailSent: false, unsubscribed: false });
  return { isNew: true, alreadyUnsubscribed: false };
}

export async function markWelcomeEmailSent(email: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(newsletterSubscribers).set({ welcomeEmailSent: true }).where(eq(newsletterSubscribers.email, email.toLowerCase().trim()));
}

export async function getActiveSubscribers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.unsubscribed, false));
}

// ─── Admin stats ────────────────────────────────────────────────────────────

export async function getAdminDashboardStats() {
  const db = await getDb();
  if (!db) return { totalStacks: 0, totalUsers: 0, totalReviews: 0, totalLauds: 0, pendingVerifications: 0 };
  const [stackCount, userCount, reviewCount, laudCount, pendingCount] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(stacks),
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(reviews),
    db.select({ count: sql<number>`count(*)` }).from(lauds),
    db.select({ count: sql<number>`count(*)` }).from(verificationRequests).where(eq(verificationRequests.status, "pending")),
  ]);
  return {
    totalStacks: Number(stackCount[0]?.count ?? 0),
    totalUsers: Number(userCount[0]?.count ?? 0),
    totalReviews: Number(reviewCount[0]?.count ?? 0),
    totalLauds: Number(laudCount[0]?.count ?? 0),
    pendingVerifications: Number(pendingCount[0]?.count ?? 0),
  };
}

// ─── Category counts ───────────────────────────────────────────────────────

export async function getCategoryCounts(): Promise<{ category: string; count: number }[]> {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({ category: stacks.category, count: sql<number>`count(*)` })
    .from(stacks)
    .where(eq(stacks.status, "published"))
    .groupBy(stacks.category);
  return result.map((r) => ({ category: r.category, count: Number(r.count) }));
}
