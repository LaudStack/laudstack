import { eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, newsletterSubscribers, InsertNewsletterSubscriber } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = [
      "name", "firstName", "lastName", "email", "avatarUrl",
      "city", "state", "country", "linkedinUrl", "linkedinId",
      "loginMethod", "passwordHash", "emailVerifyToken", "passwordResetToken",
    ] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      (values as Record<string, unknown>)[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    // Boolean fields
    if (user.emailVerified !== undefined) {
      values.emailVerified = user.emailVerified;
      updateSet.emailVerified = user.emailVerified;
    }

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.passwordResetExpires !== undefined) {
      values.passwordResetExpires = user.passwordResetExpires;
      updateSet.passwordResetExpires = user.passwordResetExpires;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByLinkedInId(linkedinId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users)
    .where(eq(users.linkedinId, linkedinId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmailOrLinkedIn(email: string, linkedinId?: string) {
  const db = await getDb();
  if (!db) return undefined;
  const conditions = linkedinId
    ? or(eq(users.email, email.toLowerCase().trim()), eq(users.linkedinId, linkedinId))
    : eq(users.email, email.toLowerCase().trim());
  const result = await db.select().from(users).where(conditions).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Newsletter helpers ────────────────────────────────────────────────────

/**
 * Subscribe an email to the newsletter.
 * Returns the subscriber record (new or existing) and a flag indicating
 * whether the record was freshly created (vs already existed).
 */
export async function subscribeToNewsletter(
  data: Pick<InsertNewsletterSubscriber, "email" | "firstName" | "source">
): Promise<{ isNew: boolean; alreadyUnsubscribed: boolean }> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const email = data.email.toLowerCase().trim();

  // Check for existing subscriber
  const existing = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, email))
    .limit(1);

  if (existing.length > 0) {
    const sub = existing[0];
    if (sub.unsubscribed) {
      // Re-subscribe: clear unsubscribed flag
      await db
        .update(newsletterSubscribers)
        .set({ unsubscribed: false, welcomeEmailSent: false })
        .where(eq(newsletterSubscribers.email, email));
      return { isNew: true, alreadyUnsubscribed: true };
    }
    return { isNew: false, alreadyUnsubscribed: false };
  }

  // Insert new subscriber
  await db.insert(newsletterSubscribers).values({
    email,
    firstName: data.firstName ?? null,
    source: data.source ?? "footer",
    welcomeEmailSent: false,
    unsubscribed: false,
  });

  return { isNew: true, alreadyUnsubscribed: false };
}

/**
 * Mark the welcome email as sent for a given subscriber email.
 */
export async function markWelcomeEmailSent(email: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(newsletterSubscribers)
    .set({ welcomeEmailSent: true })
    .where(eq(newsletterSubscribers.email, email.toLowerCase().trim()));
}

/**
 * Retrieve all active (non-unsubscribed) newsletter subscribers.
 */
export async function getActiveSubscribers() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.unsubscribed, false));
}
