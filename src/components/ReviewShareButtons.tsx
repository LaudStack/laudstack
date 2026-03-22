"use client";

/**
 * ReviewShareButtons — LaudStack
 * Compact share buttons for individual reviews: Twitter/X, LinkedIn, Copy Link.
 * Appears inline next to the Helpful button in each review.
 */

import { useState, useCallback } from "react";
import { Share2, Check, Copy } from "lucide-react";
import { toast } from "sonner";

interface Props {
  toolName: string;
  toolSlug: string;
  reviewId: string;
  reviewSnippet: string; // first ~100 chars of review body
  rating: number;
}

export default function ReviewShareButtons({
  toolName,
  toolSlug,
  reviewId,
  reviewSnippet,
  rating,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const siteUrl = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SITE_URL) || 'https://laudstack.com';
  const reviewUrl = `${siteUrl}/tools/${toolSlug}#review-${reviewId}`;
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
  const shareText = `${stars} "${reviewSnippet.slice(0, 120)}${reviewSnippet.length > 120 ? "…" : ""}" — Review of ${toolName} on @LaudStack`;

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(reviewUrl);
      setCopied(true);
      toast.success("Review link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  }, [reviewUrl]);

  const handleTwitter = useCallback(() => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(reviewUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
    setOpen(false);
  }, [shareText, reviewUrl]);

  const handleLinkedIn = useCallback(() => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(reviewUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=600");
    setOpen(false);
  }, [reviewUrl]);

  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg transition-all"
        style={{
          color: open ? "#D97706" : "#64748B",
          background: open ? "#FFFBEB" : "transparent",
          border: open ? "1px solid #FDE68A" : "1px solid #E2E8F0",
          cursor: "pointer",
        }}
      >
        <Share2 style={{ width: "12px", height: "12px" }} />
        Share
      </button>

      {open && (
        <>
          {/* Backdrop to close */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
            onClick={() => setOpen(false)}
          />
          {/* Dropdown */}
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 6px)",
              left: 0,
              zIndex: 50,
              background: "#fff",
              borderRadius: "10px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              border: "1px solid #E2E8F0",
              padding: "6px",
              minWidth: "160px",
              animation: "fadeIn 0.15s ease-out",
            }}
          >
            <button
              onClick={handleTwitter}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                color: "#334155",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share on X
            </button>
            <button
              onClick={handleLinkedIn}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                color: "#334155",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#5178FF">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Share on LinkedIn
            </button>
            <button
              onClick={() => { handleCopyLink(); setOpen(false); }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                color: "#334155",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {copied ? (
                <Check style={{ width: "14px", height: "14px", color: "#16A34A" }} />
              ) : (
                <Copy style={{ width: "14px", height: "14px" }} />
              )}
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
