"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db, getUserBySupabaseId } from "@/server/db";
import { users, tools, reviews, upvotes, savedTools, deals } from "@/drizzle/schema";
import type { User } from "@/drizzle/schema";
import { eq, and, sql, count } from "drizzle-orm";
import { sendWelcomeEmail } from "@/server/email";

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function requireAuth() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(list: { name: string; value: string; options?: Record<string, unknown> }[]) {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    }
  );
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (!supabaseUser) throw new Error("UNAUTHORIZED");
  const dbUser = await getUserBySupabaseId(supabaseUser.id);
  if (!dbUser) throw new Error("USER_NOT_FOUND");
  return dbUser;
}

/**
 * Server action: get the current authenticated user's database record.
 * Returns null if not authenticated or user not found in DB.
 */
export async function getCurrentDbUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const dbUser = await getUserBySupabaseId(user.id);
  return dbUser ?? null;
}

/**
 * Server action: update the current user's founder profile fields.
 */
export async function updateFounderProfile(data: {
  founderBio?: string;
  founderWebsite?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();
    await db.update(users).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(users.id, user.id));
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ─── Upvote ───────────────────────────────────────────────────────────────────

export async function toggleUpvote(toolId: number) {
  const user = await requireAuth();
  
  const existing = await db.select().from(upvotes)
    .where(and(eq(upvotes.toolId, toolId), eq(upvotes.userId, user.id)))
    .limit(1);
  
  if (existing.length > 0) {
    await db.delete(upvotes).where(eq(upvotes.id, existing[0].id));
    await db.update(tools).set({
      upvoteCount: sql`GREATEST(${tools.upvoteCount} - 1, 0)`,
    }).where(eq(tools.id, toolId));
    return { upvoted: false };
  } else {
    await db.insert(upvotes).values({ toolId, userId: user.id });
    await db.update(tools).set({
      upvoteCount: sql`${tools.upvoteCount} + 1`,
    }).where(eq(tools.id, toolId));
    return { upvoted: true };
  }
}

export async function getUserUpvotes() {
  const user = await requireAuth();
  const rows = await db.select({ toolId: upvotes.toolId }).from(upvotes)
    .where(eq(upvotes.userId, user.id));
  return rows.map(r => r.toolId);
}

// ─── Save Tool ────────────────────────────────────────────────────────────────

export async function toggleSaveTool(toolId: number) {
  const user = await requireAuth();
  
  const existing = await db.select().from(savedTools)
    .where(and(eq(savedTools.toolId, toolId), eq(savedTools.userId, user.id)))
    .limit(1);
  
  if (existing.length > 0) {
    await db.delete(savedTools).where(eq(savedTools.id, existing[0].id));
    return { saved: false };
  } else {
    await db.insert(savedTools).values({ toolId, userId: user.id });
    return { saved: true };
  }
}

export async function getUserSavedTools() {
  const user = await requireAuth();
  const rows = await db.select({ toolId: savedTools.toolId }).from(savedTools)
    .where(eq(savedTools.userId, user.id));
  return rows.map(r => r.toolId);
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function submitReview(data: {
  toolId: number;
  rating: number;
  title?: string;
  body?: string;
  pros?: string;
  cons?: string;
}) {
  const user = await requireAuth();
  
  const existing = await db.select().from(reviews)
    .where(and(eq(reviews.toolId, data.toolId), eq(reviews.userId, user.id)))
    .limit(1);
  
  if (existing.length > 0) {
    throw new Error("You have already reviewed this product");
  }
  
  const [review] = await db.insert(reviews).values({
    toolId: data.toolId,
    userId: user.id,
    rating: data.rating,
    title: data.title ?? null,
    body: data.body ?? null,
    pros: data.pros ?? null,
    cons: data.cons ?? null,
  }).returning({ id: reviews.id });
  
  // Update tool's review count and average rating
  const [stats] = await db.select({
    count: count(),
    avg: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
  }).from(reviews).where(eq(reviews.toolId, data.toolId));
  
  await db.update(tools).set({
    reviewCount: stats.count,
    averageRating: Number(stats.avg),
    updatedAt: new Date(),
  }).where(eq(tools.id, data.toolId));
  
  return { success: true, reviewId: review.id };
}

export async function getUserReviews() {
  const user = await requireAuth();
  return db.select().from(reviews)
    .where(eq(reviews.userId, user.id))
    .orderBy(sql`${reviews.createdAt} DESC`);
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function updateProfile(data: {
  name?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  country?: string;
  avatarUrl?: string;
  bio?: string;
  headline?: string;
  website?: string;
  twitterHandle?: string;
  jobTitle?: string;
  company?: string;
  useCase?: string;
  referralSource?: string;
}) {
  const user = await requireAuth();
  await db.update(users).set({
    ...data,
    updatedAt: new Date(),
  }).where(eq(users.id, user.id));
  return { success: true };
}

export async function completeOnboarding(data: {
  firstName: string;
  lastName: string;
  headline?: string;
  jobTitle?: string;
  company?: string;
  useCase?: string;
  referralSource?: string;
}) {
  const user = await requireAuth();
  const name = `${data.firstName} ${data.lastName}`.trim();
  await db.update(users).set({
    firstName: data.firstName,
    lastName: data.lastName,
    name,
    headline: data.headline || undefined,
    jobTitle: data.jobTitle || undefined,
    company: data.company || undefined,
    useCase: data.useCase || undefined,
    referralSource: data.referralSource || undefined,
    onboardingCompleted: true,
    updatedAt: new Date(),
  }).where(eq(users.id, user.id));

  // Send welcome email asynchronously (don't block the response)
  if (user.email) {
    sendWelcomeEmail(user.email, data.firstName).catch((err) => {
      console.error("[completeOnboarding] Failed to send welcome email:", err);
    });
  }

  return { success: true };
}

export async function getProfile() {
  const user = await requireAuth();
  return user;
}

// ─── Deals ────────────────────────────────────────────────────────────────────

export async function claimDeal(dealId: number) {
  const user = await requireAuth();
  await db.update(deals).set({
    claimCount: sql`${deals.claimCount} + 1`,
    updatedAt: new Date(),
  }).where(eq(deals.id, dealId));
  return { success: true };
}

export async function getActiveDeals() {
  return db.select().from(deals)
    .where(eq(deals.isActive, true))
    .orderBy(sql`${deals.createdAt} DESC`);
}
