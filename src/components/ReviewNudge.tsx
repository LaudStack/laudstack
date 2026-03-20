"use client";

/**
 * ReviewNudge — LaudStack
 * Non-intrusive slide-in prompt that appears after 30 seconds on a tool detail page.
 * Only shows to authenticated users who haven't reviewed the tool yet.
 * Dismisses on click, after 15 seconds, or if user scrolls past reviews section.
 */

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, X } from "lucide-react";

interface Props {
  toolName: string;
  isAuthenticated: boolean;
  hasReviewed: boolean;
  onWriteReview: () => void;
}

export default function ReviewNudge({
  toolName,
  isAuthenticated,
  hasReviewed,
  onWriteReview,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Show after 30 seconds if conditions met
  useEffect(() => {
    if (!isAuthenticated || hasReviewed || dismissed) return;

    const timer = setTimeout(() => {
      setVisible(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, hasReviewed, dismissed]);

  // Auto-dismiss after 15 seconds of being visible
  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      setVisible(false);
      setDismissed(true);
    }, 15000);

    return () => clearTimeout(timer);
  }, [visible]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setDismissed(true);
  }, []);

  const handleClick = useCallback(() => {
    setVisible(false);
    setDismissed(true);
    onWriteReview();
  }, [onWriteReview]);

  if (!visible || dismissed) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "16px",
        left: "16px",
        right: "16px",
        zIndex: 90,
        maxWidth: "360px",
        width: "auto",
        marginLeft: "auto",
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
        border: "1px solid #E2E8F0",
        overflow: "hidden",
        animation: "slideInUp 0.35s ease-out",
      }}
    >
      {/* Top amber accent line */}
      <div style={{ height: "3px", background: "#F59E0B" }} />

      <div style={{ padding: "16px 18px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
        {/* Icon */}
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "#FFFBEB",
            border: "1px solid #FDE68A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <MessageSquare style={{ width: "16px", height: "16px", color: "#D97706" }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#0C1830",
              margin: "0 0 4px",
              lineHeight: 1.3,
            }}
          >
            Used {toolName}?
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "#64748B",
              margin: "0 0 12px",
              lineHeight: 1.5,
            }}
          >
            Share a quick review to help others decide.
          </p>
          <button
            onClick={handleClick}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              borderRadius: "8px",
              background: "#F59E0B",
              color: "#0C1830",
              fontWeight: 700,
              fontSize: "12px",
              border: "none",
              cursor: "pointer",
              transition: "opacity 0.15s",
            }}
          >
            <MessageSquare style={{ width: "12px", height: "12px" }} />
            Write a Quick Review
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "6px",
            border: "none",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#94A3B8",
            flexShrink: 0,
            transition: "color 0.15s",
          }}
        >
          <X style={{ width: "14px", height: "14px" }} />
        </button>
      </div>

      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
