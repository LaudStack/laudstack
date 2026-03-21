"use client";

/**
 * useLaudedTools — LaudStack
 *
 * DB-backed lauded tools hook. Uses server actions (toggleLaud,
 * getUserLaudedToolIds) for authenticated users.
 *
 * Unauthenticated users are NOT allowed to laud — the toggle returns
 * { requiresAuth: true } so the caller can show an auth gate modal.
 *
 * Exposes toggle, isLauded, laudedIds, loading, and refetch helpers.
 * Uses a global event emitter so all mounted instances stay in sync
 * (e.g. ToolCard laud button ↔ Launches page ↔ Tool detail page).
 *
 * Key design decisions (mirrors useSavedTools pattern):
 *  - `_fetchedForSession` is MODULE-LEVEL so it survives component
 *    unmount/remount (page navigation). Without this, every navigation
 *    triggers a fresh DB fetch and the lauded state flickers to empty
 *    before the fetch completes — causing lauds to "disappear".
 *  - `_loading` is MODULE-LEVEL so new instances get the correct
 *    loading state immediately without waiting for their own effect.
 *  - Registers a cache invalidator so sign-out clears the module cache.
 */
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toggleLaud, getUserLaudedToolIds } from "@/app/actions/laud";
import { registerCacheInvalidator } from "@/hooks/authCacheInvalidators";

// ── Module-level state (survives component remounts / page navigation) ────────
type LaudListener = (ids: string[]) => void;
const listeners = new Set<LaudListener>();
let globalLaudedIds: string[] = [];
let _fetchedForSession = false; // module-level guard — survives remounts
let _loading = true;            // module-level loading flag

function broadcast(ids: string[]) {
  globalLaudedIds = ids;
  listeners.forEach((fn) => fn(ids));
}

function clearLaudCache() {
  globalLaudedIds = [];
  _fetchedForSession = false;
  _loading = true;
  listeners.forEach((fn) => fn([]));
}

// Register with the auth invalidator so sign-out clears the cache
registerCacheInvalidator(clearLaudCache);

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useLaudedTools() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [laudedIds, setLaudedIds] = useState<string[]>(globalLaudedIds);
  const [loading, setLoading] = useState(_loading);

  // ── Subscribe to global broadcasts ──
  useEffect(() => {
    const handler: LaudListener = (ids) => {
      setLaudedIds(ids);
    };
    listeners.add(handler);
    // Sync with current global state immediately (handles late-mounting components)
    setLaudedIds(globalLaudedIds);
    setLoading(_loading);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  // ── Fetch lauded tool IDs from DB when authenticated ──
  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated) {
      // Already fetched for this session — serve from cache immediately
      if (_fetchedForSession) {
        setLaudedIds(globalLaudedIds);
        setLoading(false);
        return;
      }
      // First fetch for this session
      _fetchedForSession = true;
      _loading = true;
      setLoading(true);
      getUserLaudedToolIds()
        .then((ids) => {
          const strIds = ids.map(String);
          _loading = false;
          broadcast(strIds);
          setLoading(false);
        })
        .catch((err) => {
          console.error("[useLaudedTools] Failed to fetch lauded tools:", err);
          _loading = false;
          setLoading(false);
        });
    } else {
      // Not authenticated — clear everything
      _fetchedForSession = false;
      _loading = false;
      setLoading(false);
      broadcast([]);
    }
  }, [isAuthenticated, authLoading]);

  const isLauded = useCallback(
    (id: string | number) => laudedIds.includes(String(id)),
    [laudedIds]
  );

  /**
   * Toggle laud state. Returns { lauded, requiresAuth?, newCount?, error? }.
   * If user is not authenticated, returns { requiresAuth: true }
   * so the caller can show an auth gate modal.
   */
  const toggle = useCallback(
    async (
      id: string | number
    ): Promise<{ lauded?: boolean; requiresAuth?: boolean; newCount?: number; error?: string }> => {
      const strId = String(id);
      const numId = Number(id);

      if (!isAuthenticated || isNaN(numId)) {
        return { requiresAuth: true };
      }

      // Optimistic update
      const wasLauded = globalLaudedIds.includes(strId);
      const optimistic = wasLauded
        ? globalLaudedIds.filter((x) => x !== strId)
        : [...globalLaudedIds, strId];
      broadcast(optimistic);

      try {
        const result = await toggleLaud(numId);
        if (!result.success) {
          // Revert on failure — re-read globalLaudedIds in case another toggle ran concurrently
          const reverted = wasLauded
            ? [...globalLaudedIds, strId]
            : globalLaudedIds.filter((x) => x !== strId);
          broadcast(reverted);
          console.error("[useLaudedTools] Toggle failed:", result.error);
          return { lauded: wasLauded, error: result.error };
        }
        // Confirm the optimistic update (already applied)
        return { lauded: result.lauded, newCount: result.newCount };
      } catch (err) {
        // Revert on error
        const reverted = wasLauded
          ? [...globalLaudedIds, strId]
          : globalLaudedIds.filter((x) => x !== strId);
        broadcast(reverted);
        console.error("[useLaudedTools] Toggle error:", err);
        return { lauded: wasLauded, error: "Network error" };
      }
    },
    [isAuthenticated]
  );

  /**
   * Re-fetch lauded IDs from the database.
   * Useful after login or when navigating to a page that needs fresh data.
   */
  const refetch = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      _fetchedForSession = false; // force re-fetch
      const ids = await getUserLaudedToolIds();
      const strIds = ids.map(String);
      _fetchedForSession = true;
      broadcast(strIds);
    } catch (err) {
      console.error("[useLaudedTools] Refetch error:", err);
    }
  }, [isAuthenticated]);

  return { laudedIds, isLauded, toggle, loading, refetch };
}
