"use client";

/**
 * useToolsData — LaudStack
 *
 * Shared module-level cache for homepage tool data (tools, reviews,
 * leaderboard, stats). All mounted instances share the same data and
 * invalidation signal so a single laud/save/review mutation refreshes
 * every consumer simultaneously.
 *
 * Fix (2026-03-21): invalidateToolsCache() now broadcasts a version
 * bump to all mounted instances via a listener set, causing them to
 * re-fetch immediately. Previously, the useEffect had an empty
 * dependency array so it never re-ran after invalidation — leaving
 * every consumer with stale upvote_count values after a laud.
 */

import { useState, useEffect } from "react";
import type { Tool, Review } from "@/lib/types";

interface FlatLeaderboardEntry {
  tool_id: string;
  name: string;
  slug: string;
  logo_url: string;
  average_rating: number;
  review_count: number;
  upvote_count: number;
  weekly_rank_change: number;
  rank_score: number;
}

interface HomepageData {
  tools: Tool[];
  reviews: Review[];
  leaderboard: FlatLeaderboardEntry[];
  totalReviews: number;
  totalUsers: number;
}

// ── Module-level cache ──────────────────────────────────────────────────────
let cachedData: HomepageData | null = null;
let cacheTimestamp: number | null = null;
let fetchPromise: Promise<HomepageData> | null = null;

/** Cache TTL: 5 minutes. Prevents serving stale rankings after a recalculation. */
const CACHE_TTL_MS = 5 * 60 * 1000;

// ── Invalidation broadcast ──────────────────────────────────────────────────
// Every mounted useToolsData instance registers a listener here.
// invalidateToolsCache() increments the version counter and notifies all
// listeners so they re-fetch immediately.
type InvalidationListener = () => void;
const invalidationListeners = new Set<InvalidationListener>();
let cacheVersion = 0;

// ── Leaderboard normalizer ──────────────────────────────────────────────────
function normalizeLeaderboard(raw: unknown[]): FlatLeaderboardEntry[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  const first = raw[0] as Record<string, unknown>;
  // Already flat format
  if (first && typeof first.tool_id !== "undefined" && typeof first.name === "string") {
    return raw as FlatLeaderboardEntry[];
  }
  // Nested format: { rank, tool: { id, name, ... }, rank_change, period }
  return raw
    .map((entry: unknown) => {
      const e = entry as { rank?: number; tool?: Tool; rank_change?: number };
      const tool = e.tool;
      if (!tool) return null;
      return {
        tool_id: tool.id,
        name: tool.name,
        slug: tool.slug,
        logo_url: tool.logo_url,
        average_rating: tool.average_rating ?? 0,
        review_count: tool.review_count ?? 0,
        upvote_count: tool.upvote_count ?? 0,
        weekly_rank_change: e.rank_change ?? tool.weekly_rank_change ?? 0,
        rank_score: tool.rank_score ?? 0,
      };
    })
    .filter((e): e is FlatLeaderboardEntry => e !== null);
}

// ── Fetch helper ────────────────────────────────────────────────────────────
function fetchData(): Promise<HomepageData> {
  // Serve from cache if still fresh
  if (cachedData && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return Promise.resolve(cachedData);
  }
  // De-duplicate concurrent fetches
  if (fetchPromise) return fetchPromise;
  fetchPromise = fetch("/api/homepage")
    .then((r) => r.json())
    .then((data) => {
      const normalized: HomepageData = {
        tools: data.tools ?? [],
        reviews: data.reviews ?? [],
        leaderboard: normalizeLeaderboard(data.leaderboard ?? []),
        totalReviews: data.totalReviews ?? 0,
        totalUsers: data.totalUsers ?? 0,
      };
      cachedData = normalized;
      cacheTimestamp = Date.now();
      fetchPromise = null;
      return normalized;
    })
    .catch(() => {
      fetchPromise = null;
      return { tools: [], reviews: [], leaderboard: [], totalReviews: 0, totalUsers: 0 };
    });
  return fetchPromise;
}

// ── Hook ────────────────────────────────────────────────────────────────────
export function useToolsData() {
  const [tools, setTools] = useState<Tool[]>(cachedData?.tools ?? []);
  const [reviews, setReviews] = useState<Review[]>(cachedData?.reviews ?? []);
  const [leaderboard, setLeaderboard] = useState<FlatLeaderboardEntry[]>(cachedData?.leaderboard ?? []);
  const [totalReviews, setTotalReviews] = useState<number>(cachedData?.totalReviews ?? 0);
  const [totalUsers, setTotalUsers] = useState<number>(cachedData?.totalUsers ?? 0);
  const [loading, setLoading] = useState(!cachedData);
  // Local version counter — incremented when invalidation is broadcast
  const [localVersion, setLocalVersion] = useState(cacheVersion);

  // Subscribe to invalidation broadcasts
  useEffect(() => {
    const handler: InvalidationListener = () => {
      setLocalVersion((v) => v + 1);
    };
    invalidationListeners.add(handler);
    return () => {
      invalidationListeners.delete(handler);
    };
  }, []);

  // Fetch (or re-fetch) whenever localVersion changes
  useEffect(() => {
    setLoading(true);
    fetchData().then((data) => {
      setTools(data.tools);
      setReviews(data.reviews);
      setLeaderboard(data.leaderboard);
      setTotalReviews(data.totalReviews);
      setTotalUsers(data.totalUsers);
      setLoading(false);
    });
  }, [localVersion]);

  return { tools, reviews, leaderboard, totalReviews, totalUsers, loading };
}

// ── Cache invalidation ──────────────────────────────────────────────────────
/**
 * Invalidate the tools cache and immediately trigger a re-fetch in all
 * mounted useToolsData consumers.
 *
 * Call this after any mutation that changes tool data (laud, review, save).
 */
export function invalidateToolsCache() {
  cachedData = null;
  cacheTimestamp = null;
  fetchPromise = null;
  cacheVersion += 1;
  // Notify all mounted instances to re-fetch
  invalidationListeners.forEach((fn) => fn());
}
