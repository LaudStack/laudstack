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
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toggleLaud, getUserLaudedToolIds } from "@/app/actions/laud";

// ── Global event bus for cross-component sync ──────────────────────────────
type LaudListener = (ids: string[]) => void;
const listeners = new Set<LaudListener>();
let globalLaudedIds: string[] = [];

function broadcast(ids: string[]) {
  globalLaudedIds = ids;
  listeners.forEach((fn) => fn(ids));
}

export function useLaudedTools() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [laudedIds, setLaudedIds] = useState<string[]>(globalLaudedIds);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  // ── Subscribe to global broadcasts ──
  useEffect(() => {
    const handler: LaudListener = (ids) => setLaudedIds(ids);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  // ── Fetch lauded tool IDs from DB when authenticated ──
  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated) {
      if (!fetchedRef.current) {
        fetchedRef.current = true;
        setLoading(true);
        getUserLaudedToolIds()
          .then((ids) => {
            const strIds = ids.map(String);
            setLaudedIds(strIds);
            broadcast(strIds);
          })
          .catch((err) => {
            console.error("[useLaudedTools] Failed to fetch lauded tools:", err);
          })
          .finally(() => setLoading(false));
      }
    } else {
      fetchedRef.current = false;
      setLaudedIds([]);
      broadcast([]);
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const isLauded = useCallback(
    (id: string | number) => laudedIds.includes(String(id)),
    [laudedIds]
  );

  /**
   * Toggle laud state. Returns { lauded, requiresAuth?, newCount? }.
   * If user is not authenticated, returns { requiresAuth: true }
   * so the caller can show an auth gate modal.
   */
  const toggle = useCallback(
    async (
      id: string | number
    ): Promise<{ lauded?: boolean; requiresAuth?: boolean; newCount?: number }> => {
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
          // Revert on failure
          broadcast(
            wasLauded
              ? [...optimistic, strId]
              : optimistic.filter((x) => x !== strId)
          );
          console.error("[useLaudedTools] Toggle failed:", result.error);
          return { lauded: wasLauded };
        }
        return { lauded: result.lauded, newCount: result.newCount };
      } catch (err) {
        // Revert on error
        broadcast(
          wasLauded
            ? [...optimistic, strId]
            : optimistic.filter((x) => x !== strId)
        );
        console.error("[useLaudedTools] Toggle error:", err);
        return { lauded: wasLauded };
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
      const ids = await getUserLaudedToolIds();
      const strIds = ids.map(String);
      broadcast(strIds);
    } catch (err) {
      console.error("[useLaudedTools] Refetch error:", err);
    }
  }, [isAuthenticated]);

  return { laudedIds, isLauded, toggle, loading, refetch };
}
