"use client";

/**
 * useFollowedUsers — LaudStack
 *
 * DB-backed followed users hook. Uses server actions for authenticated users.
 * Mirrors the same global event bus pattern as useFollowedStacks.
 *
 * Exposes isFollowingUser, followedUserIds, loading, and refetch helpers.
 * The actual toggle is handled by the FollowUserButton component.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getCurrentUserFollowedUserIds } from "@/app/actions/follows";
import { registerCacheInvalidator } from "@/hooks/authCacheInvalidators";

// ── Global event bus for cross-component sync ──────────────────────────────
type FollowUserListener = (ids: number[]) => void;
const listeners = new Set<FollowUserListener>();
let globalFollowedUserIds: number[] = [];
let globalFetched = false;

function broadcast(ids: number[]) {
  globalFollowedUserIds = ids;
  listeners.forEach((fn) => fn(ids));
}

/** Clear the global cache on sign-out so the next user starts fresh */
function clearFollowedUsersCache() {
  globalFetched = false;
  broadcast([]);
}

// Register the invalidator once at module load time
registerCacheInvalidator(clearFollowedUsersCache);

/** Imperatively add/remove a user ID from the global set (used by FollowUserButton and dashboard) */
export function updateFollowedUserId(userId: number, following: boolean) {
  if (following && !globalFollowedUserIds.includes(userId)) {
    broadcast([...globalFollowedUserIds, userId]);
  } else if (!following) {
    broadcast(globalFollowedUserIds.filter((id) => id !== userId));
  }
}

export function useFollowedUsers() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [followedUserIds, setFollowedUserIds] = useState<number[]>(globalFollowedUserIds);
  const [loading, setLoading] = useState(!globalFetched);
  const mountedRef = useRef(true);

  // Track component mount state
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ── Subscribe to global broadcasts ──
  useEffect(() => {
    const handler: FollowUserListener = (ids) => {
      if (mountedRef.current) setFollowedUserIds(ids);
    };
    listeners.add(handler);
    // Sync with current global state on mount
    if (globalFollowedUserIds.length > 0 || globalFetched) {
      setFollowedUserIds(globalFollowedUserIds);
    }
    return () => {
      listeners.delete(handler);
    };
  }, []);

  // ── Fetch followed user IDs from DB when authenticated ──
  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated) {
      if (!globalFetched) {
        // NOTE: Do NOT set globalFetched = true here.
        // It is only set to true AFTER a successful fetch so that a failed
        // or interrupted fetch is always retried on the next render cycle.
        setLoading(true);
        getCurrentUserFollowedUserIds()
          .then((ids) => {
            if (mountedRef.current) {
              globalFetched = true; // mark success AFTER the fetch completes
              broadcast(ids);
              setLoading(false);
            }
          })
          .catch((err) => {
            console.error("[useFollowedUsers] Failed to fetch:", err);
            if (mountedRef.current) {
              globalFetched = false; // Allow retry
              setLoading(false);
            }
          });
      } else {
        // Already fetched globally, just sync local state
        setFollowedUserIds(globalFollowedUserIds);
        setLoading(false);
      }
    } else {
      // Not authenticated — clear everything
      clearFollowedUsersCache();
      if (mountedRef.current) setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const isFollowingUser = useCallback(
    (id: string | number) => followedUserIds.includes(Number(id)),
    [followedUserIds]
  );

  const refetch = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const ids = await getCurrentUserFollowedUserIds();
      broadcast(ids);
    } catch (err) {
      console.error("[useFollowedUsers] Refetch error:", err);
    }
  }, [isAuthenticated]);

  return { followedUserIds, isFollowingUser, loading, refetch };
}
