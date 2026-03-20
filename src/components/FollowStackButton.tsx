"use client";

import { useState, useTransition, useEffect, useCallback } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { toggleFollowStack } from '@/app/actions/follows';
import { updateFollowedStackId } from '@/hooks/useFollowedStacks';

interface FollowStackButtonProps {
  toolId: number;
  toolName: string;
  initialFollowing?: boolean;
  /** "default" = full button, "compact" = icon-only for mobile */
  variant?: 'default' | 'compact';
  /** Called when auth is required */
  onAuthRequired?: () => void;
  /** Called when follow state changes */
  onToggle?: (following: boolean) => void;
}

export default function FollowStackButton({
  toolId,
  toolName,
  initialFollowing = false,
  variant = 'default',
  onAuthRequired,
  onToggle,
}: FollowStackButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  // Sync with prop changes (e.g. when global hook loads)
  useEffect(() => {
    setFollowing(initialFollowing);
  }, [initialFollowing]);

  const handleToggle = useCallback(() => {
    if (isPending) return; // Prevent double-click

    const wasFollowing = following;
    // Optimistic update
    setFollowing(!wasFollowing);

    startTransition(async () => {
      try {
        const result = await toggleFollowStack(toolId);
        if (!result.success) {
          // Revert
          setFollowing(wasFollowing);
          if (result.error?.includes('sign in')) {
            onAuthRequired?.();
          } else {
            toast.error(result.error || 'Failed to update follow');
          }
          return;
        }
        const newState = result.following ?? !wasFollowing;
        setFollowing(newState);
        updateFollowedStackId(toolId, newState);
        onToggle?.(newState);
        if (newState) {
          toast.success(`Following ${toolName}! You'll be notified about new deals.`);
        } else {
          toast.success(`Unfollowed ${toolName}`);
        }
      } catch {
        // Network error or unexpected failure — revert
        setFollowing(wasFollowing);
        toast.error('Something went wrong. Please try again.');
      }
    });
  }, [isPending, following, toolId, toolName, onAuthRequired, onToggle, startTransition]);

  if (variant === 'compact') {
    return (
      <button
        onClick={handleToggle}
        disabled={isPending}
        className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl text-[11px] font-bold cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          border: following ? '1.5px solid #7C3AED' : '1.5px solid #E2E8F0',
          background: following ? '#F5F3FF' : '#FFFFFF',
          color: following ? '#7C3AED' : '#475569',
        }}
        title={following ? `Unfollow ${toolName}` : `Follow ${toolName}`}
      >
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : following ? (
          <BellOff className="w-3.5 h-3.5" />
        ) : (
          <Bell className="w-3.5 h-3.5" />
        )}
        {following ? 'Following' : 'Follow'}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      style={{
        border: following ? '1.5px solid #7C3AED' : '1.5px solid #E2E8F0',
        background: following ? '#F5F3FF' : '#FFFFFF',
        color: following ? '#7C3AED' : '#475569',
      }}
      title={following ? `Unfollow ${toolName}` : `Follow ${toolName}`}
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : following ? (
        <BellOff className="w-3.5 h-3.5" />
      ) : (
        <Bell className="w-3.5 h-3.5" />
      )}
      {following ? 'Following' : 'Follow'}
    </button>
  );
}
