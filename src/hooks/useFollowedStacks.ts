"use client";

/**
 * useFollowedStacks — LaudStack
 *
 * DB-backed followed stacks hook. Uses server actions for authenticated users.
 * Follows the same global event bus pattern as useSavedTools.
 *
 * Exposes isFollowing, followedIds, loading, and refetch helpers.
 * The actual toggle is handled by the FollowStackButton component.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getCurrentUserFollowedStackIds } from "@/app/actions/follows";

// ── Global event bus for cross-component sync ──────────────────────────────
type FollowListener = (ids: number[]) => void;
const listeners = new Set<FollowListener>();
let globalFollowedIds: number[] = [];
let globalFetched = false;

function broadcast(ids: number[]) {
  globalFollowedIds = ids;
  listeners.forEach((fn) => fn(ids));
}

/** Imperatively add/remove an ID from the global set (used by FollowStackButton) */
export function updateFollowedStackId(toolId: number, following: boolean) {
  if (following && !globalFollowedIds.includes(toolId)) {
    broadcast([...globalFollowedIds, toolId]);
  } else if (!following) {
    broadcast(globalFollowedIds.filter((id) => id !== toolId));
  }
}

export function useFollowedStacks() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [followedIds, setFollowedIds] = useState<number[]>(globalFollowedIds);
  const [loading, setLoading] = useState(!globalFetched);
  const mountedRef = useRef(true);

  // Track component mount state
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ── Subscribe to global broadcasts ──
  useEffect(() => {
    const handler: FollowListener = (ids) => {
      if (mountedRef.current) setFollowedIds(ids);
    };
    listeners.add(handler);
    // Sync with current global state on mount
    if (globalFollowedIds.length > 0) {
      setFollowedIds(globalFollowedIds);
    }
    return () => {
      listeners.delete(handler);
    };
  }, []);

  // ── Fetch followed stack IDs from DB when authenticated ──
  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated) {
      if (!globalFetched) {
        globalFetched = true;
        setLoading(true);
        getCurrentUserFollowedStackIds()
          .then((ids) => {
            if (mountedRef.current) {
              broadcast(ids);
              setLoading(false);
            }
          })
          .catch((err) => {
            console.error("[useFollowedStacks] Failed to fetch:", err);
            if (mountedRef.current) {
              globalFetched = false; // Allow retry
              setLoading(false);
            }
          });
      } else {
        // Already fetched globally, just sync local state
        setFollowedIds(globalFollowedIds);
        setLoading(false);
      }
    } else {
      // User logged out — clear everything
      globalFetched = false;
      broadcast([]);
      if (mountedRef.current) setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const isFollowing = useCallback(
    (id: string | number) => followedIds.includes(Number(id)),
    [followedIds]
  );

  const refetch = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const ids = await getCurrentUserFollowedStackIds();
      broadcast(ids);
    } catch (err) {
      console.error("[useFollowedStacks] Refetch error:", err);
    }
  }, [isAuthenticated]);

  return { followedIds, isFollowing, loading, refetch };
}
