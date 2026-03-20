"use client";
/**
 * authCacheInvalidators — LaudStack
 *
 * A registry of cache-invalidation callbacks that need to run on sign-out.
 * This breaks the circular import that would occur if useAuth directly
 * imported from useSavedTools (which itself imports useAuth).
 *
 * Usage:
 *   - Each hook that maintains a session-scoped cache registers its
 *     invalidator via `registerCacheInvalidator()` at module load time.
 *   - useAuth calls `runAllCacheInvalidators()` on sign-out.
 */

type Invalidator = () => void;
const _invalidators: Invalidator[] = [];

export function registerCacheInvalidator(fn: Invalidator) {
  if (!_invalidators.includes(fn)) {
    _invalidators.push(fn);
  }
}

export function runAllCacheInvalidators() {
  _invalidators.forEach((fn) => fn());
}
