"use server";

import { db } from "@/server/db";
import { userFollows, stackFollows, users, tools } from "@/drizzle/schema";
import { eq, and, count, desc, inArray } from "drizzle-orm";
import { getCurrentUser } from "@/lib/admin-auth";

// ─── Shared result type ──────────────────────────────────────────────────────

type ActionResult = { success: boolean; error?: string };
type ToggleResult = { success: boolean; following?: boolean; error?: string };

// ─── Helper: is a DB error a unique constraint violation? ────────────────────
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "23505"
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// USER FOLLOWS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Follow a user. Idempotent — returns success if already following.
 */
export async function followUser(targetUserId: number): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Please sign in to follow users" };
    if (user.id === targetUserId) return { success: false, error: "You cannot follow yourself" };

    // Check target user exists
    const target = await db.query.users.findFirst({
      where: eq(users.id, targetUserId),
      columns: { id: true },
    });
    if (!target) return { success: false, error: "User not found" };

    // Check if already following
    const existing = await db.select({ id: userFollows.id })
      .from(userFollows)
      .where(and(
        eq(userFollows.followerId, user.id),
        eq(userFollows.followingId, targetUserId),
      ))
      .limit(1);

    if (existing.length > 0) {
      return { success: true }; // Already following, idempotent
    }

    try {
      await db.insert(userFollows).values({
        followerId: user.id,
        followingId: targetUserId,
      });
    } catch (insertError) {
      // Unique constraint violation = already following (race condition)
      if (isUniqueViolation(insertError)) return { success: true };
      throw insertError;
    }

    return { success: true };
  } catch (error) {
    console.error("[followUser] Error:", error);
    return { success: false, error: "Failed to follow user. Please try again." };
  }
}

/**
 * Unfollow a user. Idempotent — returns success even if not following.
 */
export async function unfollowUser(targetUserId: number): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Please sign in" };

    await db.delete(userFollows).where(and(
      eq(userFollows.followerId, user.id),
      eq(userFollows.followingId, targetUserId),
    ));

    return { success: true };
  } catch (error) {
    console.error("[unfollowUser] Error:", error);
    return { success: false, error: "Failed to unfollow user. Please try again." };
  }
}

/**
 * Toggle follow on a user. Returns the new follow state.
 */
export async function toggleFollowUser(targetUserId: number): Promise<ToggleResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Please sign in to follow users" };
    if (user.id === targetUserId) return { success: false, error: "You cannot follow yourself" };

    // Check target user exists
    const target = await db.query.users.findFirst({
      where: eq(users.id, targetUserId),
      columns: { id: true },
    });
    if (!target) return { success: false, error: "User not found" };

    // Check if already following
    const existing = await db.select({ id: userFollows.id })
      .from(userFollows)
      .where(and(
        eq(userFollows.followerId, user.id),
        eq(userFollows.followingId, targetUserId),
      ))
      .limit(1);

    if (existing.length > 0) {
      // Unfollow
      await db.delete(userFollows).where(eq(userFollows.id, existing[0].id));
      return { success: true, following: false };
    } else {
      // Follow — handle race condition gracefully
      try {
        await db.insert(userFollows).values({
          followerId: user.id,
          followingId: targetUserId,
        });
      } catch (insertError) {
        // Unique constraint violation = already following (concurrent request)
        if (isUniqueViolation(insertError)) return { success: true, following: true };
        throw insertError;
      }
      return { success: true, following: true };
    }
  } catch (error) {
    console.error("[toggleFollowUser] Error:", error);
    return { success: false, error: "Failed to update follow. Please try again." };
  }
}

/**
 * Check if the current user is following a specific user.
 */
export async function isFollowingUser(targetUserId: number): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const existing = await db.select({ id: userFollows.id })
      .from(userFollows)
      .where(and(
        eq(userFollows.followerId, user.id),
        eq(userFollows.followingId, targetUserId),
      ))
      .limit(1);

    return existing.length > 0;
  } catch (error) {
    console.error("[isFollowingUser] Error:", error);
    return false;
  }
}

/**
 * Get follower count and following count for a user.
 */
export async function getUserFollowCounts(userId: number): Promise<{
  followers: number;
  following: number;
}> {
  try {
    const [followerResult, followingResult] = await Promise.all([
      db.select({ count: count() })
        .from(userFollows)
        .where(eq(userFollows.followingId, userId)),
      db.select({ count: count() })
        .from(userFollows)
        .where(eq(userFollows.followerId, userId)),
    ]);

    return {
      followers: followerResult[0]?.count ?? 0,
      following: followingResult[0]?.count ?? 0,
    };
  } catch (error) {
    console.error("[getUserFollowCounts] Error:", error);
    return { followers: 0, following: 0 };
  }
}

/**
 * Get the list of users who follow a given user (followers).
 */
export async function getFollowers(userId: number, limit = 50, offset = 0): Promise<{
  users: { id: number; name: string | null; avatarUrl: string | null; followedAt: Date }[];
  total: number;
}> {
  try {
    const currentUser = await getCurrentUser();
    
    // Privacy check: only allow viewing followers list if it's the current user,
    // or if the target user has a public profile
    if (!currentUser || currentUser.id !== userId) {
      const targetUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { publicProfile: true }
      });
      if (!targetUser || !targetUser.publicProfile) {
        return { users: [], total: 0 };
      }
    }
    const [rows, totalResult] = await Promise.all([
      db.select({
        id: users.id,
        name: users.name,
        firstName: users.firstName,
        lastName: users.lastName,
        avatarUrl: users.avatarUrl,
        followedAt: userFollows.createdAt,
      })
        .from(userFollows)
        .innerJoin(users, eq(userFollows.followerId, users.id))
        .where(eq(userFollows.followingId, userId))
        .orderBy(desc(userFollows.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() })
        .from(userFollows)
        .where(eq(userFollows.followingId, userId)),
    ]);

    return {
      users: rows.map(r => ({
        id: r.id,
        name: (r.firstName ? [r.firstName, r.lastName].filter(Boolean).join(" ") : null) || r.name,
        avatarUrl: r.avatarUrl,
        followedAt: r.followedAt,
      })),
      total: totalResult[0]?.count ?? 0,
    };
  } catch (error) {
    console.error("[getFollowers] Error:", error);
    return { users: [], total: 0 };
  }
}

/**
 * Get the list of users that a given user is following.
 */
export async function getFollowing(userId: number, limit = 50, offset = 0): Promise<{
  users: { id: number; name: string | null; avatarUrl: string | null; followedAt: Date }[];
  total: number;
}> {
  try {
    const currentUser = await getCurrentUser();
    
    // Privacy check: only allow viewing following list if it's the current user,
    // or if the target user has a public profile
    if (!currentUser || currentUser.id !== userId) {
      const targetUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { publicProfile: true }
      });
      if (!targetUser || !targetUser.publicProfile) {
        return { users: [], total: 0 };
      }
    }
    const [rows, totalResult] = await Promise.all([
      db.select({
        id: users.id,
        name: users.name,
        firstName: users.firstName,
        lastName: users.lastName,
        avatarUrl: users.avatarUrl,
        followedAt: userFollows.createdAt,
      })
        .from(userFollows)
        .innerJoin(users, eq(userFollows.followingId, users.id))
        .where(eq(userFollows.followerId, userId))
        .orderBy(desc(userFollows.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() })
        .from(userFollows)
        .where(eq(userFollows.followerId, userId)),
    ]);

    return {
      users: rows.map(r => ({
        id: r.id,
        name: (r.firstName ? [r.firstName, r.lastName].filter(Boolean).join(" ") : null) || r.name,
        avatarUrl: r.avatarUrl,
        followedAt: r.followedAt,
      })),
      total: totalResult[0]?.count ?? 0,
    };
  } catch (error) {
    console.error("[getFollowing] Error:", error);
    return { users: [], total: 0 };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// STACK FOLLOWS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Follow a stack/tool. Idempotent — returns success if already following.
 */
export async function followStack(toolId: number): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Please sign in to follow stacks" };

    // Check tool exists
    const tool = await db.query.tools.findFirst({
      where: eq(tools.id, toolId),
      columns: { id: true },
    });
    if (!tool) return { success: false, error: "Stack not found" };

    // Check if already following
    const existing = await db.select({ id: stackFollows.id })
      .from(stackFollows)
      .where(and(
        eq(stackFollows.userId, user.id),
        eq(stackFollows.toolId, toolId),
      ))
      .limit(1);

    if (existing.length > 0) {
      return { success: true }; // Already following, idempotent
    }

    try {
      await db.insert(stackFollows).values({
        userId: user.id,
        toolId,
      });
    } catch (insertError) {
      // Unique constraint violation = already following (race condition)
      if (isUniqueViolation(insertError)) return { success: true };
      throw insertError;
    }

    return { success: true };
  } catch (error) {
    console.error("[followStack] Error:", error);
    return { success: false, error: "Failed to follow stack. Please try again." };
  }
}

/**
 * Unfollow a stack/tool. Idempotent — returns success even if not following.
 */
export async function unfollowStack(toolId: number): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Please sign in" };

    await db.delete(stackFollows).where(and(
      eq(stackFollows.userId, user.id),
      eq(stackFollows.toolId, toolId),
    ));

    return { success: true };
  } catch (error) {
    console.error("[unfollowStack] Error:", error);
    return { success: false, error: "Failed to unfollow stack. Please try again." };
  }
}

/**
 * Toggle follow on a stack/tool. Returns the new follow state.
 */
export async function toggleFollowStack(toolId: number): Promise<ToggleResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Please sign in to follow stacks" };

    // Check tool exists
    const tool = await db.query.tools.findFirst({
      where: eq(tools.id, toolId),
      columns: { id: true },
    });
    if (!tool) return { success: false, error: "Stack not found" };

    // Check if already following
    const existing = await db.select({ id: stackFollows.id })
      .from(stackFollows)
      .where(and(
        eq(stackFollows.userId, user.id),
        eq(stackFollows.toolId, toolId),
      ))
      .limit(1);

    if (existing.length > 0) {
      // Unfollow
      await db.delete(stackFollows).where(eq(stackFollows.id, existing[0].id));
      return { success: true, following: false };
    } else {
      // Follow — handle race condition gracefully
      try {
        await db.insert(stackFollows).values({
          userId: user.id,
          toolId,
        });
      } catch (insertError) {
        // Unique constraint violation = already following (concurrent request)
        if (isUniqueViolation(insertError)) return { success: true, following: true };
        throw insertError;
      }
      return { success: true, following: true };
    }
  } catch (error) {
    console.error("[toggleFollowStack] Error:", error);
    return { success: false, error: "Failed to update follow. Please try again." };
  }
}

/**
 * Check if the current user is following a specific stack/tool.
 */
export async function isFollowingStack(toolId: number): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const existing = await db.select({ id: stackFollows.id })
      .from(stackFollows)
      .where(and(
        eq(stackFollows.userId, user.id),
        eq(stackFollows.toolId, toolId),
      ))
      .limit(1);

    return existing.length > 0;
  } catch (error) {
    console.error("[isFollowingStack] Error:", error);
    return false;
  }
}

/**
 * Get the stacks/tools that a user is following.
 */
export async function getFollowedStacks(userId: number, limit = 50, offset = 0): Promise<{
  stacks: {
    id: number;
    name: string;
    slug: string;
    logoUrl: string | null;
    tagline: string | null;
    category: string | null;
    averageRating: number;
    followedAt: Date;
  }[];
  total: number;
}> {
  try {
    const currentUser = await getCurrentUser();
    
    // Privacy check: only allow viewing followed stacks if it's the current user,
    // or if the target user has a public profile
    if (!currentUser || currentUser.id !== userId) {
      const targetUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { publicProfile: true }
      });
      if (!targetUser || !targetUser.publicProfile) {
        return { stacks: [], total: 0 };
      }
    }
    const [rows, totalResult] = await Promise.all([
      db.select({
        id: tools.id,
        name: tools.name,
        slug: tools.slug,
        logoUrl: tools.logoUrl,
        tagline: tools.tagline,
        category: tools.category,
        averageRating: tools.averageRating,
        followedAt: stackFollows.createdAt,
      })
        .from(stackFollows)
        .innerJoin(tools, eq(stackFollows.toolId, tools.id))
        .where(and(
          eq(stackFollows.userId, userId),
          inArray(tools.status, ["approved", "featured"]),
        ))
        .orderBy(desc(stackFollows.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() })
        .from(stackFollows)
        .innerJoin(tools, eq(stackFollows.toolId, tools.id))
        .where(and(
          eq(stackFollows.userId, userId),
          inArray(tools.status, ["approved", "featured"]),
        )),
    ]);

    return {
      stacks: rows,
      total: totalResult[0]?.count ?? 0,
    };
  } catch (error) {
    console.error("[getFollowedStacks] Error:", error);
    return { stacks: [], total: 0 };
  }
}

/**
 * Get the follower count for a stack/tool.
 */
export async function getStackFollowerCount(toolId: number): Promise<number> {
  try {
    const result = await db.select({ count: count() })
      .from(stackFollows)
      .where(eq(stackFollows.toolId, toolId));
    return result[0]?.count ?? 0;
  } catch (error) {
    console.error("[getStackFollowerCount] Error:", error);
    return 0;
  }
}

/**
 * Get the IDs of all stacks the current user follows (for bulk UI checks).
 */
export async function getCurrentUserFollowedStackIds(): Promise<number[]> {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const rows = await db.select({ toolId: stackFollows.toolId })
      .from(stackFollows)
      .where(eq(stackFollows.userId, user.id));

    return rows.map(r => r.toolId);
  } catch (error) {
    console.error("[getCurrentUserFollowedStackIds] Error:", error);
    return [];
  }
}

/**
 * Get the IDs of all users the current user follows (for bulk UI checks).
 */
export async function getCurrentUserFollowedUserIds(): Promise<number[]> {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const rows = await db.select({ followingId: userFollows.followingId })
      .from(userFollows)
      .where(eq(userFollows.followerId, user.id));

    return rows.map(r => r.followingId);
  } catch (error) {
    console.error("[getCurrentUserFollowedUserIds] Error:", error);
    return [];
  }
}
