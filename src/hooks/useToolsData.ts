"use client";

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
}

let cachedData: HomepageData | null = null;
let fetchPromise: Promise<HomepageData> | null = null;

/**
 * Normalize leaderboard entries from the API.
 * The API returns nested { rank, tool: {...}, rank_change, period } objects,
 * but the homepage expects flat { tool_id, name, slug, ... } objects.
 */
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

function fetchData(): Promise<HomepageData> {
  if (cachedData) return Promise.resolve(cachedData);
  if (fetchPromise) return fetchPromise;
  fetchPromise = fetch("/api/homepage")
    .then((r) => r.json())
    .then((data) => {
      const normalized: HomepageData = {
        tools: data.tools ?? [],
        reviews: data.reviews ?? [],
        leaderboard: normalizeLeaderboard(data.leaderboard ?? []),
      };
      cachedData = normalized;
      return normalized;
    })
    .catch(() => ({ tools: [], reviews: [], leaderboard: [] }));
  return fetchPromise;
}

export function useToolsData() {
  const [tools, setTools] = useState<Tool[]>(cachedData?.tools ?? []);
  const [reviews, setReviews] = useState<Review[]>(cachedData?.reviews ?? []);
  const [leaderboard, setLeaderboard] = useState<FlatLeaderboardEntry[]>(cachedData?.leaderboard ?? []);
  const [loading, setLoading] = useState(!cachedData);

  useEffect(() => {
    fetchData().then((data) => {
      setTools(data.tools);
      setReviews(data.reviews);
      setLeaderboard(data.leaderboard);
      setLoading(false);
    });
  }, []);

  return { tools, reviews, leaderboard, loading };
}

// Invalidate cache (call after mutations like upvote)
export function invalidateToolsCache() {
  cachedData = null;
  fetchPromise = null;
}
