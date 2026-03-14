"use client";

/**
 * useSavedTools — LaudStack
 * 
 * DB-backed saved tools hook. Uses server actions (toggleSaveTool,
 * getUserSavedToolIds) for authenticated users, with localStorage
 * as a fallback for unauthenticated visitors.
 * 
 * Exposes toggle, isSaved, savedIds, clear, and loading helpers.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toggleSaveTool, getUserSavedToolIds } from '@/app/actions/public';

const STORAGE_KEY = 'laudstack_saved_tools';

// ── localStorage helpers (fallback for unauthenticated users) ────────────────
function readFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeToStorage(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore quota errors
  }
}

export function useSavedTools() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  // ── Fetch saved tool IDs from DB when authenticated ──
  useEffect(() => {
    if (authLoading) return; // Wait for auth to resolve

    if (isAuthenticated) {
      // Fetch from DB
      if (!fetchedRef.current) {
        fetchedRef.current = true;
        setLoading(true);
        getUserSavedToolIds()
          .then(ids => {
            setSavedIds(ids.map(String));
          })
          .catch(err => {
            console.error('[useSavedTools] Failed to fetch saved tools:', err);
            // Fallback to localStorage
            setSavedIds(readFromStorage());
          })
          .finally(() => setLoading(false));
      }
    } else {
      // Not authenticated — use localStorage
      fetchedRef.current = false;
      setSavedIds(readFromStorage());
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  // ── Keep localStorage in sync for unauthenticated users ──
  useEffect(() => {
    if (!isAuthenticated) {
      const handler = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY) {
          setSavedIds(readFromStorage());
        }
      };
      window.addEventListener('storage', handler);
      return () => window.removeEventListener('storage', handler);
    }
  }, [isAuthenticated]);

  const isSaved = useCallback(
    (id: string) => savedIds.includes(String(id)),
    [savedIds]
  );

  const toggle = useCallback(async (id: string) => {
    const strId = String(id);
    const numId = Number(id);

    if (isAuthenticated && !isNaN(numId)) {
      // Optimistic update
      setSavedIds(prev => {
        if (prev.includes(strId)) {
          return prev.filter(x => x !== strId);
        }
        return [...prev, strId];
      });

      try {
        const result = await toggleSaveTool(numId);
        if (!result.success) {
          // Revert on failure
          setSavedIds(prev => {
            if (prev.includes(strId)) {
              return prev.filter(x => x !== strId);
            }
            return [...prev, strId];
          });
          console.error('[useSavedTools] Toggle failed:', result.error);
        }
      } catch (err) {
        // Revert on error
        setSavedIds(prev => {
          if (prev.includes(strId)) {
            return prev.filter(x => x !== strId);
          }
          return [...prev, strId];
        });
        console.error('[useSavedTools] Toggle error:', err);
      }
    } else {
      // Unauthenticated — localStorage only
      setSavedIds(prev => {
        const next = prev.includes(strId)
          ? prev.filter(x => x !== strId)
          : [...prev, strId];
        writeToStorage(next);
        return next;
      });
    }
  }, [isAuthenticated]);

  const clear = useCallback(() => {
    setSavedIds([]);
    if (!isAuthenticated) {
      writeToStorage([]);
    }
  }, [isAuthenticated]);

  return { savedIds, isSaved, toggle, clear, loading };
}
