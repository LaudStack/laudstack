"use client";

/**
 * EmailVerificationModal — On-Demand Email Verification
 *
 * This modal is shown when a user attempts a sensitive action (founder upgrade,
 * submit tool, claim tool, become marketplace creator) without having verified
 * their email. It provides a 6-digit OTP flow powered by the actionVerification
 * server actions.
 *
 * Usage:
 *   <EmailVerificationModal
 *     open={showVerifyModal}
 *     onClose={() => setShowVerifyModal(false)}
 *     onVerified={() => { setShowVerifyModal(false); retryAction(); }}
 *     actionLabel="launch a stack"
 *   />
 */

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X, Mail, ShieldCheck, Loader2, RefreshCw, CheckCircle2, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  sendActionVerificationCode,
  verifyActionCode,
} from "@/app/actions/actionVerification";

interface Props {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
  actionLabel?: string;
}

export default function EmailVerificationModal({
  open,
  onClose,
  onVerified,
  actionLabel = "perform this action",
}: Props) {
  const [step, setStep] = useState<"prompt" | "code" | "success">("prompt");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStep("prompt");
      setCode(["", "", "", "", "", ""]);
      setError(null);
      setCooldown(0);
    }
  }, [open]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendCode = useCallback(async () => {
    setSending(true);
    setError(null);
    try {
      const result = await sendActionVerificationCode();
      if (result.success) {
        setMaskedEmail(result.email || "your email");
        setStep("code");
        setCooldown(60);
        toast.success("Verification code sent!");
        // Focus first input
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        setError(result.error || "Failed to send code.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }, []);

  const handleResend = useCallback(async () => {
    if (cooldown > 0) return;
    setCode(["", "", "", "", "", ""]);
    setError(null);
    await handleSendCode();
  }, [cooldown, handleSendCode]);

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError(null);

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (digit && index === 5) {
      const fullCode = newCode.join("");
      if (fullCode.length === 6) {
        handleVerify(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 0) return;
    const newCode = [...code];
    for (let i = 0; i < 6; i++) {
      newCode[i] = pasted[i] || "";
    }
    setCode(newCode);
    if (pasted.length === 6) {
      handleVerify(pasted);
    } else {
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleVerify = async (codeStr?: string) => {
    const fullCode = codeStr || code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    setVerifying(true);
    setError(null);
    try {
      const result = await verifyActionCode(fullCode);
      if (result.success) {
        setStep("success");
        toast.success("Email verified!");
        // Delay then close and trigger callback
        setTimeout(() => {
          onVerified();
        }, 1200);
      } else {
        setError(result.error || "Invalid code.");
        // Clear code on failure
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
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
          maxWidth: "440px",
          background: "#fff",
          borderRadius: "20px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <div style={{ padding: "16px 16px 0", display: "flex", justifyContent: "flex-end" }}>
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
            }}
          >
            <X style={{ width: "15px", height: "15px" }} />
          </button>
        </div>

        <div style={{ padding: "0 24px 28px", textAlign: "center" }}>
          {step === "prompt" && (
            <>
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
                <Mail style={{ width: "28px", height: "28px", color: "#D97706" }} />
              </div>

              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "#0C1830",
                  marginBottom: "10px",
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: "-0.02em",
                }}
              >
                Verify Your Email
              </h3>

              <p
                style={{
                  fontSize: "14px",
                  color: "#64748B",
                  lineHeight: 1.65,
                  marginBottom: "24px",
                  maxWidth: "360px",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                To <strong style={{ color: "#0C1830" }}>{actionLabel}</strong>, we need to verify
                your email address. This is a one-time step to secure your account.
              </p>

              {error && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    marginBottom: "16px",
                    textAlign: "left",
                  }}
                >
                  <AlertCircle style={{ width: "16px", height: "16px", color: "#EF4444", flexShrink: 0 }} />
                  <span style={{ fontSize: "13px", color: "#DC2626" }}>{error}</span>
                </div>
              )}

              <button
                onClick={handleSendCode}
                disabled={sending}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background: "#F59E0B",
                  color: "#0C1830",
                  fontWeight: 700,
                  fontSize: "14px",
                  border: "none",
                  cursor: sending ? "not-allowed" : "pointer",
                  opacity: sending ? 0.7 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                {sending ? (
                  <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
                ) : (
                  <Mail style={{ width: "16px", height: "16px" }} />
                )}
                {sending ? "Sending..." : "Send Verification Code"}
              </button>

              <p style={{ fontSize: "12px", color: "#94A3B8", marginTop: "12px" }}>
                A 6-digit code will be sent to your registered email.
              </p>
            </>
          )}

          {step === "code" && (
            <>
              {/* Icon */}
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "#EFF6FF",
                  border: "2px solid #BFDBFE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <ShieldCheck style={{ width: "28px", height: "28px", color: "#2563EB" }} />
              </div>

              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "#0C1830",
                  marginBottom: "8px",
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: "-0.02em",
                }}
              >
                Enter Verification Code
              </h3>

              <p
                style={{
                  fontSize: "14px",
                  color: "#64748B",
                  lineHeight: 1.65,
                  marginBottom: "24px",
                }}
              >
                We sent a 6-digit code to <strong style={{ color: "#0C1830" }}>{maskedEmail}</strong>
              </p>

              {/* 6-digit code inputs */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "8px",
                  marginBottom: "16px",
                }}
                onPaste={handlePaste}
              >
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    style={{
                      width: "48px",
                      height: "56px",
                      textAlign: "center",
                      fontSize: "24px",
                      fontWeight: 800,
                      fontFamily: "'Courier New', monospace",
                      color: "#0C1830",
                      border: `2px solid ${error ? "#FECACA" : digit ? "#F59E0B" : "#E2E8F0"}`,
                      borderRadius: "12px",
                      background: digit ? "#FFFBEB" : "#F8FAFC",
                      outline: "none",
                      transition: "all 0.15s",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#F59E0B";
                      e.target.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.15)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = digit ? "#F59E0B" : "#E2E8F0";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                ))}
              </div>

              {error && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    marginBottom: "16px",
                    textAlign: "left",
                  }}
                >
                  <AlertCircle style={{ width: "16px", height: "16px", color: "#EF4444", flexShrink: 0 }} />
                  <span style={{ fontSize: "13px", color: "#DC2626" }}>{error}</span>
                </div>
              )}

              <button
                onClick={() => handleVerify()}
                disabled={verifying || code.join("").length !== 6}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background: "#F59E0B",
                  color: "#0C1830",
                  fontWeight: 700,
                  fontSize: "14px",
                  border: "none",
                  cursor: verifying || code.join("").length !== 6 ? "not-allowed" : "pointer",
                  opacity: verifying || code.join("").length !== 6 ? 0.6 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                {verifying ? (
                  <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
                ) : (
                  <ShieldCheck style={{ width: "16px", height: "16px" }} />
                )}
                {verifying ? "Verifying..." : "Verify Code"}
              </button>

              {/* Resend */}
              <div style={{ marginTop: "16px" }}>
                {cooldown > 0 ? (
                  <p style={{ fontSize: "13px", color: "#94A3B8" }}>
                    Resend code in <strong>{cooldown}s</strong>
                  </p>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={sending}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#D97706",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <RefreshCw style={{ width: "13px", height: "13px" }} />
                    Resend code
                  </button>
                )}
              </div>

              <p style={{ fontSize: "11px", color: "#94A3B8", marginTop: "12px" }}>
                Code expires in 15 minutes. Check your spam folder if you don&apos;t see it.
              </p>
            </>
          )}

          {step === "success" && (
            <>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "#DCFCE7",
                  border: "2px solid #BBF7D0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <CheckCircle2 style={{ width: "28px", height: "28px", color: "#16A34A" }} />
              </div>

              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "#0C1830",
                  marginBottom: "10px",
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: "-0.02em",
                }}
              >
                Email Verified!
              </h3>

              <p
                style={{
                  fontSize: "14px",
                  color: "#64748B",
                  lineHeight: 1.65,
                }}
              >
                Your email has been verified. Continuing...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
