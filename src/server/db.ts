import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/drizzle/schema";
import { eq, and, desc, asc, sql, ilike, or } from "drizzle-orm";

// ─── Connection ────────────────────────────────────────────────────────────────

// Lazy singleton — only instantiated at runtime, not during build
let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    const client = postgres(connectionString, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 30,
      ssl: 'require',
      prepare: false, // Required for Supabase transaction-mode pooler (port 5432)
    });
    _db = drizzle(client, { schema });
  }
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// ─── Newsletter helpers ────────────────────────────────────────────────────────

export async function subscribeToNewsletter({
  email,
  firstName,
  source,
}: {
  email: string;
  firstName: string | null;
  source: string;
}): Promise<{ isNew: boolean; alreadyUnsubscribed: boolean }> {
  const existing = await db.query.newsletterSubscribers.findFirst({
    where: eq(schema.newsletterSubscribers.email, email.toLowerCase()),
  });

  if (existing) {
    if (existing.unsubscribed) {
      // Re-subscribe
      await db
        .update(schema.newsletterSubscribers)
        .set({ unsubscribed: false, updatedAt: new Date() })
        .where(eq(schema.newsletterSubscribers.email, email.toLowerCase()));
      return { isNew: false, alreadyUnsubscribed: true };
    }
    return { isNew: false, alreadyUnsubscribed: false };
  }

  await db.insert(schema.newsletterSubscribers).values({
    email: email.toLowerCase(),
    firstName: firstName ?? null,
    source: source ?? "website",
  });

  return { isNew: true, alreadyUnsubscribed: false };
}

export async function markWelcomeEmailSent(email: string): Promise<void> {
  await db
    .update(schema.newsletterSubscribers)
    .set({ welcomeEmailSent: true, updatedAt: new Date() })
    .where(eq(schema.newsletterSubscribers.email, email.toLowerCase()));
}

// ─── Tool helpers ──────────────────────────────────────────────────────────────

export async function getToolBySlug(slug: string) {
  return db.query.tools.findFirst({
    where: eq(schema.tools.slug, slug),
  });
}

export async function getTools({
  category,
  pricingModel,
  isFeatured,
  sort = "rank_score",
  limit = 20,
  offset = 0,
}: {
  category?: string;
  pricingModel?: string;
  isFeatured?: boolean;
  sort?: string;
  limit?: number;
  offset?: number;
}) {
  const conditions = [eq(schema.tools.status, "approved"), eq(schema.tools.isVisible, true)];

  if (category && category !== "All") {
    conditions.push(eq(schema.tools.category, category));
  }
  if (pricingModel && pricingModel !== "All") {
    conditions.push(
      eq(
        schema.tools.pricingModel,
        pricingModel as schema.Tool["pricingModel"]
      )
    );
  }
  if (isFeatured) {
    conditions.push(eq(schema.tools.isFeatured, true));
  }

  let orderBy;
  switch (sort) {
    case "newest":
      orderBy = desc(schema.tools.launchedAt);
      break;
    case "trending":
      orderBy = desc(schema.tools.weeklyRankChange);
      break;
    case "most_reviewed":
      orderBy = desc(schema.tools.reviewCount);
      break;
    case "top_rated":
      orderBy = desc(schema.tools.averageRating);
      break;
    case "featured_first":
      orderBy = desc(schema.tools.isFeatured);
      break;
    default:
      orderBy = desc(schema.tools.rankScore);
  }

  return db.query.tools.findMany({
    where: and(...conditions),
    orderBy,
    limit,
    offset,
  });
}

export async function searchTools(query: string, limit = 20) {
  return db.query.tools.findMany({
    where: and(
      eq(schema.tools.status, "approved"),
      eq(schema.tools.isVisible, true),
      or(
        ilike(schema.tools.name, `%${query}%`),
        ilike(schema.tools.tagline, `%${query}%`),
        ilike(schema.tools.description, `%${query}%`)
      )
    ),
    orderBy: desc(schema.tools.rankScore),
    limit,
  });
}

export async function getTrendingTools(limit = 4) {
  return db.query.tools.findMany({
    where: and(
      eq(schema.tools.status, "approved"),
      eq(schema.tools.isVisible, true),
      sql`${schema.tools.weeklyRankChange} > 0`
    ),
    orderBy: desc(schema.tools.weeklyRankChange),
    limit,
  });
}

export async function getRecentLaunches(limit = 4) {
  return db.query.tools.findMany({
    where: and(eq(schema.tools.status, "approved"), eq(schema.tools.isVisible, true)),
    orderBy: desc(schema.tools.launchedAt),
    limit,
  });
}

// ─── User helpers ──────────────────────────────────────────────────────────────

export async function getUserBySupabaseId(supabaseId: string) {
  return db.query.users.findFirst({
    where: eq(schema.users.supabaseId, supabaseId),
  });
}

export async function upsertUser({
  supabaseId,
  email,
  name,
  avatarUrl,
  firstName,
  lastName,
  city,
  state,
  country,
  linkedinId,
  linkedinUrl,
  loginMethod,
  emailVerified,
}: {
  supabaseId: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  country?: string;
  linkedinId?: string;
  linkedinUrl?: string;
  loginMethod?: string;
  emailVerified?: boolean;
}) {
  const existing = await getUserBySupabaseId(supabaseId);

  if (existing) {
    await db
      .update(schema.users)
      .set({
        email: email ?? existing.email,
        name: name ?? existing.name,
        avatarUrl: avatarUrl ?? existing.avatarUrl,
        // Only update profile fields if they are provided (don't overwrite user edits)
        firstName: firstName ?? existing.firstName,
        lastName: lastName ?? existing.lastName,
        city: city ?? existing.city,
        state: state ?? existing.state,
        country: country ?? existing.country,
        // LinkedIn-specific — always update if provided
        ...(linkedinId ? { linkedinId } : {}),
        ...(linkedinUrl ? { linkedinUrl } : {}),
        ...(loginMethod ? { loginMethod } : {}),
        ...(emailVerified !== undefined ? { emailVerified } : {}),
        lastSignedIn: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.users.supabaseId, supabaseId));
    return getUserBySupabaseId(supabaseId);
  }

  const [newUser] = await db
    .insert(schema.users)
    .values({
      supabaseId,
      email,
      name,
      avatarUrl,
      firstName,
      lastName,
      city,
      state,
      country,
      linkedinId,
      linkedinUrl,
      loginMethod: loginMethod ?? "email",
      emailVerified: emailVerified ?? false,
    })
    .returning();

  return newUser;
}
