"use client";
/**
 * useDbUser — LaudStack
 *
 * Fetches the current user's database record (firstName, lastName, avatarUrl,
 * founderStatus, role, headline, etc.) and caches it at module level so that
 * all consumers share the same snapshot.
 *
 * WHY MODULE-LEVEL CACHE:
 *   Next.js App Router re-renders the root layout on every client-side
 *   navigation. Without a cache, useDbUser would reset to `null` on every
 *   page change, causing the Navbar avatar to flicker (disappear → reappear)
 *   on every navigation. The module-level cache means the hook initialises
 *   from the last-known value, so the avatar renders immediately without
 *   waiting for the server action to return.
 *
 * CACHE INVALIDATION:
 *   Call `invalidateDbUserCache()` on sign-out so the next mount fetches
 *   fresh data instead of serving a stale logged-out user's record.
 */
import { useSyncExternalStore, useEffect, useCallback } from "react";
import { getCurrentDbUser } from "@/app/actions/user";
import { registerCacheInvalidator } from "@/hooks/authCacheInvalidators";
import type { User } from "@/drizzle/schema";

/* ── Module-level cache ────────────────────────────────────────────────────
 * Shared across ALL mounted instances of useDbUser.
 * Populated after the first successful fetch; served immediately on
 * subsequent mounts so there is no null → value flash.
 * ────────────────────────────────────────────────────────────────────────── */
interface DbUserCache {
  user: User | null;
  resolved: boolean;
}

let _cache: DbUserCache = { user: null, resolved: false };
const _listeners = new Set<() => void>();
let _fetching = false;

function _notify() {
  _listeners.forEach((l) => l());
}

function _setCache(user: User | null, resolved: boolean) {
  _cache = { user, resolved };
  _notify();
}

function _subscribe(cb: () => void) {
  _listeners.add(cb);
  return () => { _listeners.delete(cb); };
}

function _getSnapshot(): DbUserCache {
  return _cache;
}

const _serverSnapshot: DbUserCache = { user: null, resolved: false };
function _getServerSnapshot(): DbUserCache {
  return _serverSnapshot;
}

async function _fetchDbUser() {
  if (_fetching) return;
  _fetching = true;
  try {
    const user = await getCurrentDbUser();
    _setCache(user, true);
  } catch {
    _setCache(null, true);
  } finally {
    _fetching = false;
  }
}

/**
 * Invalidate the cache. Called automatically on sign-out via the
 * authCacheInvalidators registry.
 */
export function invalidateDbUserCache() {
  _cache = { user: null, resolved: false };
  _fetching = false;
  _notify();
}

// Register with the global sign-out invalidator registry
registerCacheInvalidator(invalidateDbUserCache);

export function useDbUser(): {
  dbUser: User | null;
  loading: boolean;
  refetch: () => void;
} {
  const cached = useSyncExternalStore(_subscribe, _getSnapshot, _getServerSnapshot);

  useEffect(() => {
    if (!_cache.resolved) {
      _fetchDbUser();
    }
  }, []);

  const refetch = useCallback(() => {
    _fetching = false;
    _setCache(_cache.user, false);
    _fetchDbUser();
  }, []);

  return {
    dbUser: cached.user,
    loading: !cached.resolved,
    refetch,
  };
}
