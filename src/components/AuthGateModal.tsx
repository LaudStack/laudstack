"use client";

/**
 * AuthGateModal — LaudStack
 * Shows a polished sign-in prompt when unauthenticated users try to
 * vote, review, save, or claim deals.
 */

import { X, LogIn, Star, ChevronUp, Bookmark, Tag } from "lucide-react";
import Link from "next/link";

interface Props {
  open: boolean;
  onClose: () => void;
  action?: "upvote" | "review" | "save" | "claim" | "general";
}

const ACTION_CONFIG: Record<
  string,
  { icon: typeof LogIn; title: string; description: string }
> = {
  upvote: {
    icon: ChevronUp,
    title: "Sign in to Laud",
    description:
      "Join the LaudStack community to laud your favorite stacks and help others discover the best software.",
  },
  review: {
    icon: Star,
    title: "Sign in to Write a Review",
    description:
      "Share your experience with the community. Sign in to write verified reviews that help others make better decisions.",
  },
  save: {
    icon: Bookmark,
    title: "Sign in to Save Tools",
    description:
      "Create your personal collection of tools. Sign in to bookmark and organize your favorites.",
  },
  claim: {
    icon: Tag,
    title: "Sign in to Claim This Deal",
    description:
      "Get exclusive discounts and offers. Sign in to claim deals and save on the products you love.",
  },
  general: {
    icon: LogIn,
    title: "Sign in to Continue",
    description:
      "Join LaudStack to access all features — laud stacks, write reviews, save favorites, and claim exclusive deals.",
  },
};

export default function AuthGateModal({ open, onClose, action = "general" }: Props) {
  if (!open) return null;

  const config = ACTION_CONFIG[action] || ACTION_CONFIG.general;
  const Icon = config.icon;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(15,23,42,0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#fff",
          borderRadius: "20px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 24px 0",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: "1px solid #E2E8F0",
              background: "#F8FAFC",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#64748B",
              transition: "all 0.15s",
            }}
          >
            <X style={{ width: "15px", height: "15px" }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "8px 20px 28px", textAlign: "center" }}>
          {/* Icon */}
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "#FFFBEB",
              border: "2px solid #FDE68A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <Icon style={{ width: "28px", height: "28px", color: "#D97706" }} />
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: "#171717",
              marginBottom: "10px",
              fontFamily: "'Inter', sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            {config.title}
          </h3>

          {/* Description */}
          <p
            style={{
              fontSize: "14px",
              color: "#64748B",
              lineHeight: 1.65,
              marginBottom: "28px",
              maxWidth: "340px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {config.description}
          </p>

          {/* CTA Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link
              href="/auth/login"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px 24px",
                borderRadius: "12px",
                background: "#F59E0B",
                color: "#0A0A0A",
                fontWeight: 700,
                fontSize: "14px",
                textDecoration: "none",
                transition: "opacity 0.15s",
                border: "none",
              }}
            >
              <LogIn style={{ width: "16px", height: "16px" }} />
              Sign In
            </Link>

            <Link
              href="/auth/signup"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px 24px",
                borderRadius: "12px",
                background: "#F8FAFC",
                color: "#374151",
                fontWeight: 600,
                fontSize: "14px",
                textDecoration: "none",
                border: "1.5px solid #E2E8F0",
                transition: "all 0.15s",
              }}
            >
              Create Free Account
            </Link>
          </div>

          {/* Footer note */}
          <p
            style={{
              fontSize: "12px",
              color: "#94A3B8",
              marginTop: "16px",
              lineHeight: 1.5,
            }}
          >
            Free forever. No credit card required.
          </p>
        </div>
      </div>
    </div>
  );
}
