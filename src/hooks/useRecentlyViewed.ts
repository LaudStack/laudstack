"use client";

/**
 * useRecentlyViewed — LaudStack
 * Tracks the last N tool slugs the user has visited.
 * Persists to sessionStorage so it survives HMR but resets on tab close.
 */

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'laudstack_recently_viewed';
const MAX_ITEMS   = 5;

function loadSlugs(): string[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveSlugs(slugs: string[]): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // sessionStorage may be unavailable in some environments
  }
}

/**
 * Returns the current list of recently viewed slugs and a function to record a new visit.
 */
export function useRecentlyViewed() {
  const [slugs, setSlugs] = useState<string[]>(loadSlugs);

  // Keep state in sync if another tab/component updates sessionStorage
  useEffect(() => {
    const onStorage = () => setSlugs(loadSlugs());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const recordVisit = useCallback((slug: string) => {
    setSlugs(prev => {
      // Remove existing occurrence then prepend; cap at MAX_ITEMS
      const updated = [slug, ...prev.filter(s => s !== slug)].slice(0, MAX_ITEMS);
      saveSlugs(updated);
      return updated;
    });
  }, []);

  return { slugs, recordVisit };
}
