"use client";

/**
 * useSavedTools — LaudStack
 * Persists bookmarked tool IDs to localStorage so they survive page reloads.
 * Exposes toggle, isSaved, savedIds, and clear helpers.
 */

import { useState, useCallback, useEffect } from 'react';

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
  const [savedIds, setSavedIds] = useState<string[]>(() => readFromStorage());

  // Keep state in sync if another tab changes localStorage
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setSavedIds(readFromStorage());
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  const toggle = useCallback((id: string) => {
    setSavedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      writeToStorage(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setSavedIds([]);
    writeToStorage([]);
  }, []);

  return { savedIds, isSaved, toggle, clear };
}
