"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db, getUserBySupabaseId } from "@/server/db";
import { users, tools, reviews, upvotes, deals, dealClaims, savedTools } from "@/drizzle/schema";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import type { User } from "@/drizzle/schema";
import { eq, and, sql, count } from "drizzle-orm";
import { sendWelcomeEmail, sendAdminNewUserAlert } from "@/server/email";
import { requireAuth, getCurrentUser } from "@/lib/admin-auth";

/**
 * Server action: get the current authenticated user's database record.
 * Returns null if not authenticated or user not found in DB.
 */
export async function getCurrentDbUser(): Promise<User | null> {
  try {
    return await getCurrentUser();
  } catch (err) {
    console.error("[getCurrentDbUser] Error:", err);
    return null;
  }
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

  // Progressive verification: require email verification to leave a review
  if (!user.emailVerified) {
    return { success: false, error: "EMAIL_NOT_VERIFIED", message: "Please verify your email to leave a review." };
  }
  
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
  const rows = await db
    .select({
      id: reviews.id,
      toolId: reviews.toolId,
      rating: reviews.rating,
      title: reviews.title,
      body: reviews.body,
      pros: reviews.pros,
      cons: reviews.cons,
      isVerified: reviews.isVerified,
      helpfulCount: reviews.helpfulCount,
      status: reviews.status,
      founderReply: reviews.founderReply,
      founderReplyAt: reviews.founderReplyAt,
      createdAt: reviews.createdAt,
      updatedAt: reviews.updatedAt,
      toolName: tools.name,
      toolSlug: tools.slug,
      toolLogo: tools.logoUrl,
      toolCategory: tools.category,
    })
    .from(reviews)
    .leftJoin(tools, eq(reviews.toolId, tools.id))
    .where(eq(reviews.userId, user.id))
    .orderBy(sql`${reviews.createdAt} DESC`);
  return rows;
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
  publicProfile?: boolean;
  showReviewsPublicly?: boolean;
  emailNotifications?: boolean;
  reviewAlerts?: boolean;
  weeklyReport?: boolean;
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
  // Check welcomeEmailSent flag to prevent duplicate sends
  if (user.email && !user.welcomeEmailSent) {
    sendWelcomeEmail(user.email, data.firstName).then(sent => {
      if (sent) {
        // Mark as sent to prevent duplicates
        db.update(users).set({ welcomeEmailSent: true }).where(eq(users.id, user.id)).catch(() => {});
      }
    }).catch((err) => {
      console.error("[completeOnboarding] Failed to send welcome email:", err);
    });
  }

  // Notify admins about the new user signup
  sendAdminNewUserAlert({
    userName: name,
    userEmail: user.email || "",
    loginMethod: user.loginMethod || "email",
    userId: user.id,
  }).catch((err) => {
    console.error("[completeOnboarding] Failed to send admin new user alert:", err);
  });

  return { success: true };
}

export async function getProfile() {
  const user = await requireAuth();
  return user;
}

// ─── Deals ────────────────────────────────────────────────────────────────────

export async function claimDeal(dealId: number) {
  const user = await requireAuth();

  // Check deal exists and is active
  const deal = await db.query.deals.findFirst({
    where: eq(deals.id, dealId),
  });
  if (!deal) return { success: false, error: "Deal not found" };
  if (!deal.isActive) return { success: false, error: "This deal is no longer active" };
  if (deal.expiresAt && new Date(deal.expiresAt) < new Date()) {
    return { success: false, error: "This deal has expired" };
  }
  if (deal.maxClaims && deal.claimCount >= deal.maxClaims) {
    return { success: false, error: "This deal has reached its maximum number of claims" };
  }

  // Check if user already claimed this deal
  const existingClaim = await db.query.dealClaims.findFirst({
    where: and(eq(dealClaims.dealId, dealId), eq(dealClaims.userId, user.id)),
  });
  if (existingClaim) {
    return { success: false, error: "You have already claimed this deal", alreadyClaimed: true };
  }

  // Insert claim record and increment claim count
  await db.insert(dealClaims).values({
    dealId,
    userId: user.id,
  });
  await db.update(deals).set({
    claimCount: sql`${deals.claimCount} + 1`,
    updatedAt: new Date(),
  }).where(eq(deals.id, dealId));

  return { success: true, couponCode: deal.couponCode, dealUrl: deal.dealUrl };
}

export async function getUserClaimedDealIds() {
  const user = await requireAuth();
  const claims = await db
    .select({ dealId: dealClaims.dealId })
    .from(dealClaims)
    .where(eq(dealClaims.userId, user.id));
  return claims.map((c) => c.dealId);
}

// ─── Delete Account ──────────────────────────────────────────────────────────

export async function deleteAccount() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(list: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Non-critical: cookies already set client-side
          }
        },
      },
    }
  );
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (!supabaseUser) return { success: false, error: "Not authenticated" };
  const dbUser = await getUserBySupabaseId(supabaseUser.id);
  if (!dbUser) return { success: false, error: "User not found" };

  try {
    // Delete user-related data (tables without ON DELETE CASCADE)
    await db.delete(savedTools).where(eq(savedTools.userId, dbUser.id));
    await db.delete(reviews).where(eq(reviews.userId, dbUser.id));
    await db.delete(upvotes).where(eq(upvotes.userId, dbUser.id));
    // Delete the user record (cascading deletes handle notifications, deal_claims, etc.)
    await db.delete(users).where(eq(users.id, dbUser.id));

    // Delete from Supabase Auth using service role
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await serviceClient.auth.admin.deleteUser(supabaseUser.id);

    // Sign out the current session
    await supabase.auth.signOut();

    return { success: true };
  } catch (e: unknown) {
    console.error("[deleteAccount] Error:", e);
    return { success: false, error: "Failed to delete account. Please contact support." };
  }
}
