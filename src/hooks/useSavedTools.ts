"use client";
/**
 * useSavedTools — LaudStack
 *
 * DB-backed saved tools hook. Uses server actions (toggleSaveTool,
 * getUserSavedToolIds, clearAllSavedTools) for authenticated users.
 *
 * Unauthenticated users are NOT allowed to save — the toggle returns
 * { requiresAuth: true } so the caller can show an auth gate modal.
 *
 * Exposes toggle, isSaved, savedIds, clear, loading, and refetch helpers.
 * Uses a global event emitter so all mounted instances stay in sync
 * (e.g. ToolCard save button ↔ Navbar count ↔ Dashboard saved tab).
 *
 * MODULE-LEVEL FETCH GUARD:
 *   The `_fetchedForSession` flag is module-level (not per-component-instance),
 *   so the initial DB fetch only happens ONCE per authenticated session, not
 *   on every navigation/remount. This prevents the Navbar saved-count from
 *   flickering or making redundant API calls on every page change.
 */
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { registerCacheInvalidator } from "@/hooks/authCacheInvalidators";
import {
  toggleSaveTool,
  getUserSavedToolIds,
  clearAllSavedTools,
} from "@/app/actions/public";

// ── Global event bus for cross-component sync ──────────────────────────────
type SaveListener = (ids: string[]) => void;
const listeners = new Set<SaveListener>();
let globalSavedIds: string[] = [];
let _fetchedForSession = false;  // module-level guard — survives remounts
let _loading = true;

function broadcast(ids: string[]) {
  globalSavedIds = ids;
  listeners.forEach((fn) => fn(ids));
}

/** Reset module-level state on sign-out so next login fetches fresh data */
function invalidateSavedToolsCache() {
  globalSavedIds = [];
  _fetchedForSession = false;
  _loading = true;
  broadcast([]);
}

// Register with the global sign-out invalidator registry
registerCacheInvalidator(invalidateSavedToolsCache);

export function useSavedTools() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [savedIds, setSavedIds] = useState<string[]>(globalSavedIds);
  const [loading, setLoading] = useState(_loading);

  // ── Subscribe to global broadcasts ──
  useEffect(() => {
    const handler: SaveListener = (ids) => setSavedIds(ids);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  // ── Fetch saved tool IDs from DB when authenticated ──
  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) {
      if (!_fetchedForSession) {
        _fetchedForSession = true;
        setLoading(true);
        getUserSavedToolIds()
          .then((ids) => {
            const strIds = ids.map(String);
            broadcast(strIds);
            _loading = false;
          })
          .catch((err) => {
            console.error("[useSavedTools] Failed to fetch saved tools:", err);
            _loading = false;
          })
          .finally(() => setLoading(false));
      } else {
        // Already fetched this session — sync local state from global
        setSavedIds(globalSavedIds);
        setLoading(false);
      }
    } else {
      // Not authenticated — reset
      _fetchedForSession = false;
      _loading = false;
      broadcast([]);
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const isSaved = useCallback(
    (id: string | number) => savedIds.includes(String(id)),
    [savedIds]
  );

  /**
   * Toggle save state. Returns { saved, requiresAuth? }.
   * If user is not authenticated, returns { requiresAuth: true }
   * so the caller can show an auth gate modal.
   */
  const toggle = useCallback(
    async (id: string | number): Promise<{ saved?: boolean; requiresAuth?: boolean }> => {
      const strId = String(id);
      const numId = Number(id);
      if (!isAuthenticated || isNaN(numId)) {
        return { requiresAuth: true };
      }
      // Optimistic update
      const wasSaved = globalSavedIds.includes(strId);
      const optimistic = wasSaved
        ? globalSavedIds.filter((x) => x !== strId)
        : [...globalSavedIds, strId];
      broadcast(optimistic);
      try {
        const result = await toggleSaveTool(numId);
        if (!result.success) {
          // Revert on failure
          broadcast(wasSaved ? [...optimistic, strId] : optimistic.filter((x) => x !== strId));
          console.error("[useSavedTools] Toggle failed:", result.error);
          return { saved: wasSaved };
        }
        return { saved: result.saved };
      } catch (err) {
        // Revert on error
        broadcast(wasSaved ? [...optimistic, strId] : optimistic.filter((x) => x !== strId));
        console.error("[useSavedTools] Toggle error:", err);
        return { saved: wasSaved };
      }
    },
    [isAuthenticated]
  );

  /**
   * Re-fetch saved IDs from the database.
   * Useful after login or when navigating to a page that needs fresh data.
   */
  const refetch = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const ids = await getUserSavedToolIds();
      const strIds = ids.map(String);
      broadcast(strIds);
    } catch (err) {
      console.error("[useSavedTools] Refetch error:", err);
    }
  }, [isAuthenticated]);

  /**
   * Clear all saved tools. For authenticated users, this also
   * deletes all saved_tools rows from the database.
   */
  const clear = useCallback(async () => {
    if (isAuthenticated) {
      // Optimistic clear
      broadcast([]);
      try {
        const result = await clearAllSavedTools();
        if (!result.success) {
          // Refetch to restore correct state
          refetch();
          console.error("[useSavedTools] Clear failed:", result.error);
        }
      } catch (err) {
        refetch();
        console.error("[useSavedTools] Clear error:", err);
      }
    } else {
      broadcast([]);
    }
  }, [isAuthenticated, refetch]);

  return { savedIds, isSaved, toggle, clear, loading, refetch };
}
