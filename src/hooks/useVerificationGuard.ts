"use client";

/**
 * useVerificationGuard — Hook for handling EMAIL_NOT_VERIFIED errors
 *
 * Wraps any server action call and intercepts EMAIL_NOT_VERIFIED errors
 * to show the EmailVerificationModal. After verification, the action
 * can be retried.
 *
 * Usage:
 *   const { showVerifyModal, verifyProps, guardAction } = useVerificationGuard();
 *
 *   const handleSubmit = async () => {
 *     const result = await guardAction(
 *       () => submitTool(formData),
 *       "launch a stack"
 *     );
 *     if (result?.success) { ... }
 *   };
 *
 *   return (
 *     <>
 *       <EmailVerificationModal {...verifyProps} />
 *       ...
 *     </>
 *   );
 */

import { useState, useCallback, useRef } from "react";

interface VerifyProps {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
  actionLabel: string;
}

export function useVerificationGuard() {
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [actionLabel, setActionLabel] = useState("");
  const pendingRetry = useRef<(() => void) | null>(null);

  /**
   * Wraps a server action call. If the result contains EMAIL_NOT_VERIFIED,
   * shows the verification modal. After verification, calls onRetry.
   */
  const guardAction = useCallback(
    async <T extends { success?: boolean; error?: string }>(
      action: () => Promise<T>,
      label: string,
      onRetry?: () => void
    ): Promise<T | null> => {
      const result = await action();

      if (result?.error === "EMAIL_NOT_VERIFIED") {
        setActionLabel(label);
        pendingRetry.current = onRetry || null;
        setShowVerifyModal(true);
        return null; // Signal that verification is needed
      }

      return result;
    },
    []
  );

  const verifyProps: VerifyProps = {
    open: showVerifyModal,
    onClose: () => {
      setShowVerifyModal(false);
      pendingRetry.current = null;
    },
    onVerified: () => {
      setShowVerifyModal(false);
      // Retry the pending action after verification
      if (pendingRetry.current) {
        pendingRetry.current();
        pendingRetry.current = null;
      }
    },
    actionLabel,
  };

  return {
    showVerifyModal,
    setShowVerifyModal,
    verifyProps,
    guardAction,
  };
}
