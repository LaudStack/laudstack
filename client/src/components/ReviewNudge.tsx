/**
 * ReviewNudge — Non-intrusive review prompt
 *
 * After a user views a tool detail page for 30+ seconds, shows a subtle
 * slide-in prompt: "Used this tool? Leave a quick review"
 *
 * Rules:
 * - Only shows to authenticated users
 * - Only shows if the user hasn't already reviewed this tool
 * - Dismisses on click or after 8 seconds
 * - Remembers dismissal in sessionStorage so it doesn't re-show
 * - Non-intrusive: slides in from bottom-right, doesn't block content
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Star } from 'lucide-react';

interface Props {
  toolSlug: string;
  toolName: string;
  isAuthenticated: boolean;
  hasReviewed?: boolean;
  onWriteReview: () => void;
  delayMs?: number;
}

const DISMISS_KEY_PREFIX = 'laudstack_review_nudge_dismissed_';

export default function ReviewNudge({
  toolSlug,
  toolName,
  isAuthenticated,
  hasReviewed = false,
  onWriteReview,
  delayMs = 30000,
}: Props) {
  const [visible, setVisible] = useState(false);

  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      sessionStorage.setItem(`${DISMISS_KEY_PREFIX}${toolSlug}`, '1');
    } catch { /* ignore */ }
  }, [toolSlug]);

  useEffect(() => {
    // Don't show if not authenticated, already reviewed, or already dismissed
    if (!isAuthenticated || hasReviewed) return;

    try {
      if (sessionStorage.getItem(`${DISMISS_KEY_PREFIX}${toolSlug}`)) return;
    } catch { /* ignore */ }

    const showTimer = setTimeout(() => {
      setVisible(true);
    }, delayMs);

    return () => clearTimeout(showTimer);
  }, [isAuthenticated, hasReviewed, toolSlug, delayMs]);

  // Auto-dismiss after 8 seconds of being visible
  useEffect(() => {
    if (!visible) return;
    const autoDismiss = setTimeout(dismiss, 8000);
    return () => clearTimeout(autoDismiss);
  }, [visible, dismiss]);

  const handleClick = () => {
    dismiss();
    onWriteReview();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, x: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 100,
            maxWidth: '360px',
            width: 'calc(100vw - 48px)',
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}
        >
          {/* Amber top accent */}
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #F59E0B, #D97706)' }} />

          <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            {/* Icon */}
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: '#FFFBEB', border: '1px solid #FDE68A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Star style={{ width: '18px', height: '18px', color: '#F59E0B' }} />
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: '14px', fontWeight: 700, color: '#171717',
                margin: '0 0 4px', lineHeight: 1.3,
              }}>
                Used {toolName}?
              </p>
              <p style={{
                fontSize: '13px', color: '#64748B', margin: '0 0 12px',
                lineHeight: 1.5,
              }}>
                Leave a quick review and help others decide.
              </p>
              <button
                onClick={handleClick}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px', borderRadius: '8px',
                  background: '#F59E0B', color: '#0A0A0A',
                  fontWeight: 700, fontSize: '12px',
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(245,158,11,0.25)',
                  transition: 'all 0.15s', fontFamily: 'inherit',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(245,158,11,0.35)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(245,158,11,0.25)'; }}
              >
                <MessageSquare style={{ width: '12px', height: '12px' }} />
                Write a Review
              </button>
            </div>

            {/* Close */}
            <button
              onClick={dismiss}
              style={{
                width: '24px', height: '24px', borderRadius: '6px',
                background: 'transparent', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#94A3B8', flexShrink: 0,
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#64748B'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8'; }}
            >
              <X style={{ width: '14px', height: '14px' }} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
