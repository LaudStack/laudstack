/**
 * AuthGateModal — Soft login prompt for guest users
 *
 * Shows a polished modal when unauthenticated users try to:
 * - Write a review
 * - Save a stack
 * - Laud (upvote) a stack
 *
 * Design: Clean white modal with amber accents, matching LaudStack brand.
 * Non-intrusive: only triggered by specific actions, not page load.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Bookmark, ChevronUp, LogIn, Shield } from 'lucide-react';
import { useLocation } from 'wouter';

export type AuthGateAction = 'review' | 'save' | 'laud';

interface Props {
  open: boolean;
  onClose: () => void;
  action: AuthGateAction;
  toolName?: string;
  returnPath?: string;
}

const ACTION_CONFIG: Record<AuthGateAction, {
  icon: typeof Star;
  title: string;
  description: string;
  iconColor: string;
  iconBg: string;
}> = {
  review: {
    icon: Star,
    title: 'Sign up to leave a review',
    description: 'Share your experience and help others make informed decisions. Your review matters to the community.',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB',
  },
  save: {
    icon: Bookmark,
    title: 'Sign up to save this stack',
    description: 'Create a free account to save stacks and build your personal collection of favorite tools.',
    iconColor: '#3B82F6',
    iconBg: '#EFF6FF',
  },
  laud: {
    icon: ChevronUp,
    title: 'Sign up to laud this stack',
    description: 'Join the community and laud the stacks you love. Your vote helps surface the best tools.',
    iconColor: '#22C55E',
    iconBg: '#F0FDF4',
  },
};

export default function AuthGateModal({ open, onClose, action, toolName, returnPath }: Props) {
  const [, navigate] = useLocation();
  const config = ACTION_CONFIG[action];
  const Icon = config.icon;

  const handleSignIn = () => {
    onClose();
    const returnTo = returnPath || window.location.pathname;
    navigate(`/signin?return=${encodeURIComponent(returnTo)}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.22 }}
            style={{
              width: '100%', maxWidth: '420px',
              background: '#fff', borderRadius: '20px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 16px 0' }}>
              <button
                onClick={onClose}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  border: '1px solid #E2E8F0', background: '#F8FAFC',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#64748B', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F1F5F9'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC'; }}
              >
                <X style={{ width: '15px', height: '15px' }} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '8px 32px 32px', textAlign: 'center' }}>
              {/* Icon */}
              <div style={{
                width: '64px', height: '64px', borderRadius: '16px',
                background: config.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: `0 4px 16px ${config.iconColor}20`,
              }}>
                <Icon style={{ width: '28px', height: '28px', color: config.iconColor }} />
              </div>

              {/* Title */}
              <h2 style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '20px', fontWeight: 800, color: '#171717',
                letterSpacing: '-0.02em', margin: '0 0 8px', lineHeight: 1.3,
              }}>
                {config.title}
              </h2>

              {/* Tool name context */}
              {toolName && (
                <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 8px', fontWeight: 500 }}>
                  for <strong style={{ color: '#475569' }}>{toolName}</strong>
                </p>
              )}

              {/* Description */}
              <p style={{
                fontSize: '14px', color: '#64748B', lineHeight: 1.7,
                margin: '0 0 28px', maxWidth: '340px', marginLeft: 'auto', marginRight: 'auto',
              }}>
                {config.description}
              </p>

              {/* CTA buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={handleSignIn}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    width: '100%', padding: '13px 20px', borderRadius: '12px',
                    background: '#F59E0B', color: '#0A0A0A', fontWeight: 700, fontSize: '14px',
                    border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
                    transition: 'all 0.15s', fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(245,158,11,0.4)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(245,158,11,0.3)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
                >
                  <LogIn style={{ width: '16px', height: '16px' }} />
                  Sign In / Create Account
                </button>

                <button
                  onClick={onClose}
                  style={{
                    width: '100%', padding: '11px 20px', borderRadius: '12px',
                    background: 'transparent', color: '#64748B', fontWeight: 600, fontSize: '13px',
                    border: '1.5px solid #E2E8F0', cursor: 'pointer',
                    transition: 'all 0.15s', fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#CBD5E1'; (e.currentTarget as HTMLButtonElement).style.color = '#475569'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLButtonElement).style.color = '#64748B'; }}
                >
                  Maybe later
                </button>
              </div>

              {/* Trust line */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                marginTop: '20px', fontSize: '11px', color: '#94A3B8', fontWeight: 500,
              }}>
                <Shield style={{ width: '12px', height: '12px', color: '#22C55E' }} />
                Free to join. No credit card required.
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
