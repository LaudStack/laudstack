/**
 * useSavedTools — real tRPC-backed saved tools hook
 * Replaces the old localStorage version with real database saves.
 * Falls back to localStorage for unauthenticated users.
 */

import { useState, useCallback, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';

const STORAGE_KEY = 'laudstack_saved_tools';

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
  const { isAuthenticated } = useAuth();

  // Real DB-backed saves for authenticated users
  const { data: savedData } = trpc.saves.mySavedStacks.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const saveMutation = trpc.saves.toggle.useMutation();
  const utils = trpc.useUtils();

  // localStorage fallback for unauthenticated users
  const [localIds, setLocalIds] = useState<string[]>(() => readFromStorage());

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setLocalIds(readFromStorage());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const savedIds = isAuthenticated
    ? (savedData ?? []).map((s: any) => String(s.id))
    : localIds;

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  const toggle = useCallback(async (id: string) => {
    if (isAuthenticated) {
      await saveMutation.mutateAsync({ stackId: Number(id) });
      utils.saves.mySavedStacks.invalidate();
    } else {
      setLocalIds(prev => {
        const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
        writeToStorage(next);
        return next;
      });
    }
  }, [isAuthenticated, saveMutation, utils]);

  const clear = useCallback(() => {
    setLocalIds([]);
    writeToStorage([]);
  }, []);

  return { savedIds, isSaved, toggle, clear };
}
