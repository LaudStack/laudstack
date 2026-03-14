"use client";
/**
 * useLauds — LaudStack
 *
 * DB-backed laud (upvote) hook. Uses the laud engine server actions
 * for authenticated users. Provides optimistic UI updates, rate limit
 * error handling, and auth gating.
 *
 * Exposes: toggle, isLauded, laudedIds, getLaudCount, loading
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toggleLaud, getUserLaudedToolIds } from "@/app/actions/laud";
import { toast } from "sonner";

export function useLauds() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [laudedIds, setLaudedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  // Fetch lauded tool IDs from DB when authenticated
  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) {
      if (!fetchedRef.current) {
        fetchedRef.current = true;
        setLoading(true);
        getUserLaudedToolIds()
          .then((ids) => {
            setLaudedIds(new Set(ids));
          })
          .catch((err) => {
            console.error("[useLauds] Failed to fetch lauded tools:", err);
          })
          .finally(() => setLoading(false));
      }
    } else {
      fetchedRef.current = false;
      setLaudedIds(new Set());
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const isLauded = useCallback(
    (toolId: number | string) => laudedIds.has(Number(toolId)),
    [laudedIds]
  );

  const toggle = useCallback(
    async (
      toolId: number | string,
      toolName?: string
    ): Promise<{
      success: boolean;
      lauded?: boolean;
      newCount?: number;
      error?: string;
      requiresAuth?: boolean;
    }> => {
      const numId = Number(toolId);

      if (!isAuthenticated) {
        return { success: false, requiresAuth: true };
      }

      // Optimistic update
      const wasLauded = laudedIds.has(numId);
      setLaudedIds((prev) => {
        const next = new Set(prev);
        if (wasLauded) {
          next.delete(numId);
        } else {
          next.add(numId);
        }
        return next;
      });

      if (!wasLauded && toolName) {
        toast.success(`Lauded ${toolName}!`);
      }

      try {
        const result = await toggleLaud(numId);

        if (!result.success) {
          // Revert optimistic update
          setLaudedIds((prev) => {
            const next = new Set(prev);
            if (wasLauded) {
              next.add(numId);
            } else {
              next.delete(numId);
            }
            return next;
          });
          toast.error(result.error || "Failed to laud");
          return { success: false, error: result.error };
        }

        return {
          success: true,
          lauded: result.lauded,
          newCount: result.newCount,
        };
      } catch (err) {
        // Revert on error
        setLaudedIds((prev) => {
          const next = new Set(prev);
          if (wasLauded) {
            next.add(numId);
          } else {
            next.delete(numId);
          }
          return next;
        });
        toast.error("Failed to laud. Please try again.");
        return { success: false, error: String(err) };
      }
    },
    [isAuthenticated, laudedIds]
  );

  const getLaudCount = useCallback(() => laudedIds.size, [laudedIds]);

  // Force refresh lauded IDs (e.g., after login)
  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const ids = await getUserLaudedToolIds();
      setLaudedIds(new Set(ids));
    } catch (err) {
      console.error("[useLauds] Refresh failed:", err);
    }
  }, [isAuthenticated]);

  return {
    laudedIds,
    isLauded,
    toggle,
    getLaudCount,
    loading,
    refresh,
  };
}
