"use client";

import { useState, useEffect } from "react";
import { getCurrentDbUser } from "@/app/actions/user";
import type { User } from "@/drizzle/schema";

/**
 * Hook that fetches the current user's database record.
 * Includes founderStatus, firstName, lastName, city, state, country, etc.
 * Returns null while loading or if not authenticated.
 */
export function useDbUser(): {
  dbUser: User | null;
  loading: boolean;
  refetch: () => void;
} {
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCurrentDbUser()
      .then((user) => {
        if (!cancelled) {
          setDbUser(user);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDbUser(null);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const refetch = () => setTick((t) => t + 1);

  return { dbUser, loading, refetch };
}
