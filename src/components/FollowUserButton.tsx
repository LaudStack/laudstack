"use client";

import { useState, useTransition, useEffect, useCallback } from 'react';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { toggleFollowUser } from '@/app/actions/follows';

interface FollowUserButtonProps {
  targetUserId: number;
  targetUserName: string;
  initialFollowing?: boolean;
  /** "default" = full button, "compact" = smaller for cards */
  variant?: 'default' | 'compact';
  /** Called when auth is required */
  onAuthRequired?: () => void;
  /** Called when follow state changes */
  onToggle?: (following: boolean) => void;
}

export default function FollowUserButton({
  targetUserId,
  targetUserName,
  initialFollowing = false,
  variant = 'default',
  onAuthRequired,
  onToggle,
}: FollowUserButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

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
        const result = await toggleFollowUser(targetUserId);
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
        onToggle?.(newState);
        if (newState) {
          toast.success(`Following ${targetUserName}`);
        } else {
          toast.success(`Unfollowed ${targetUserName}`);
        }
      } catch {
        // Network error or unexpected failure — revert
        setFollowing(wasFollowing);
        toast.error('Something went wrong. Please try again.');
      }
    });
  }, [isPending, following, targetUserId, targetUserName, onAuthRequired, onToggle, startTransition]);

  if (variant === 'compact') {
    return (
      <button
        onClick={handleToggle}
        disabled={isPending}
        className="inline-flex items-center gap-1 text-[11px] font-bold py-1 px-2.5 rounded-lg cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          border: following ? '1px solid #7C3AED' : '1px solid #E2E8F0',
          background: following ? '#F5F3FF' : '#FFFFFF',
          color: following ? '#7C3AED' : '#475569',
        }}
        title={following ? `Unfollow ${targetUserName}` : `Follow ${targetUserName}`}
      >
        {isPending ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : following ? (
          <UserMinus className="w-3 h-3" />
        ) : (
          <UserPlus className="w-3 h-3" />
        )}
        {following ? 'Following' : 'Follow'}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 text-xs font-bold py-2 px-4 rounded-xl cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      style={{
        border: following ? '1.5px solid #7C3AED' : '1.5px solid #E2E8F0',
        background: following ? '#F5F3FF' : '#FFFFFF',
        color: following ? '#7C3AED' : '#475569',
      }}
      title={following ? `Unfollow ${targetUserName}` : `Follow ${targetUserName}`}
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : following ? (
        <UserMinus className="w-3.5 h-3.5" />
      ) : (
        <UserPlus className="w-3.5 h-3.5" />
      )}
      {following ? 'Following' : 'Follow'}
    </button>
  );
}
