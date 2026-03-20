"use client";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console for debugging — do NOT expose to users in production
    console.error("[Global Error Boundary]", error);
  }, [error]);

  const isDev = process.env.NODE_ENV === "development";

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#F8FAFC" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
          <div style={{ maxWidth: "480px", width: "100%", background: "#fff", borderRadius: "16px", border: "1px solid #E2E8F0", padding: "2.5rem", textAlign: "center" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", marginBottom: "0.75rem" }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: "0.875rem", color: "#64748B", marginBottom: "1.5rem" }}>
              A critical error occurred. Please refresh the page or contact support if the issue persists.
            </p>
            {isDev && (
              <pre style={{ textAlign: "left", fontSize: "0.75rem", background: "#F1F5F9", borderRadius: "8px", padding: "1rem", marginBottom: "1.5rem", overflow: "auto", maxHeight: "200px", color: "#334155" }}>
                {error.message}
                {error.stack ? `\n\n${error.stack}` : ""}
              </pre>
            )}
            {error.digest && (
              <p style={{ fontSize: "0.75rem", color: "#94A3B8", marginBottom: "1rem" }}>
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{ padding: "0.625rem 1.5rem", background: "#F59E0B", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
