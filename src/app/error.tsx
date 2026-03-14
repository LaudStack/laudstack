"use client";
import { useEffect } from "react";
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("CAUGHT ERROR:", error);
  }, [error]);
  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>Something went wrong!</h2>
      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", background: "#f0f0f0", padding: "1rem", borderRadius: "8px" }}>
        {error.message}
        {"\n\n"}
        {error.stack}
      </pre>
      <button onClick={reset} style={{ marginTop: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}>
        Try again
      </button>
    </div>
  );
}
