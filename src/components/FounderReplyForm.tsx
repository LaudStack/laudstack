"use client";

/**
 * FounderReplyForm — LaudStack
 * Inline form that lets verified founders reply to reviews directly
 * on the tool detail page. Shows only if the current user is the tool's founder
 * and the review doesn't already have a founder reply.
 */

import { useState, useTransition } from "react";
import { Building2, Send, X } from "lucide-react";
import { toast } from "sonner";
import { replyToReview } from "@/app/actions/founder";

interface Props {
  reviewId: number;
  isFounder: boolean;
  hasExistingReply: boolean;
  onReplySuccess?: () => void;
}

export default function FounderReplyForm({
  reviewId,
  isFounder,
  hasExistingReply,
  onReplySuccess,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isPending, startTransition] = useTransition();

  // Don't render if not the founder or if reply already exists
  if (!isFounder || hasExistingReply) return null;

  const handleSubmit = () => {
    if (!replyText.trim()) {
      toast.error("Please write a reply");
      return;
    }
    if (replyText.trim().length < 10) {
      toast.error("Reply must be at least 10 characters");
      return;
    }

    startTransition(async () => {
      const result = await replyToReview(reviewId, replyText.trim());
      if (result.success) {
        toast.success("Reply posted successfully!");
        setReplyText("");
        setShowForm(false);
        onReplySuccess?.();
      } else {
        toast.error(result.error || "Failed to post reply");
      }
    });
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg transition-all"
        style={{
          color: "#D97706",
          background: "#FFFBEB",
          border: "1px solid #FDE68A",
          cursor: "pointer",
        }}
      >
        <Building2 style={{ width: "12px", height: "12px" }} />
        Reply as Founder
      </button>
    );
  }

  return (
    <div
      style={{
        marginTop: "12px",
        padding: "14px",
        borderRadius: "12px",
        background: "#FFFBEB",
        border: "1px solid #FDE68A",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Building2 style={{ width: "13px", height: "13px", color: "#D97706" }} />
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#92400E" }}>
            Reply as Founder
          </span>
        </div>
        <button
          onClick={() => { setShowForm(false); setReplyText(""); }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#94A3B8",
            padding: "2px",
          }}
        >
          <X style={{ width: "14px", height: "14px" }} />
        </button>
      </div>

      <textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Thank the reviewer, address their feedback, or share an update..."
        rows={3}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: "8px",
          border: "1px solid #FDE68A",
          fontSize: "13px",
          color: "#0C1830",
          outline: "none",
          resize: "vertical",
          lineHeight: 1.6,
          fontFamily: "inherit",
          boxSizing: "border-box",
          background: "#fff",
          minHeight: "70px",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#F59E0B")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#FDE68A")}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "8px",
          marginTop: "10px",
        }}
      >
        <button
          onClick={() => { setShowForm(false); setReplyText(""); }}
          style={{
            padding: "7px 14px",
            borderRadius: "8px",
            background: "#fff",
            border: "1px solid #E2E8F0",
            color: "#64748B",
            fontWeight: 600,
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isPending}
          style={{
            padding: "7px 14px",
            borderRadius: "8px",
            background: isPending ? "#FBBF24" : "#F59E0B",
            color: "#0C1830",
            fontWeight: 700,
            fontSize: "12px",
            border: "none",
            cursor: isPending ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            opacity: isPending ? 0.7 : 1,
          }}
        >
          {isPending ? (
            <>
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  border: "2px solid rgba(0,0,0,0.2)",
                  borderTopColor: "#0C1830",
                  borderRadius: "50%",
                  animation: "spin 0.6s linear infinite",
                }}
              />
              Posting...
            </>
          ) : (
            <>
              <Send style={{ width: "12px", height: "12px" }} />
              Post Reply
            </>
          )}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
