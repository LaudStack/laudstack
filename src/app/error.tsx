"use client";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console for debugging — do NOT expose to users in production
    console.error("[Error Boundary]", error);
  }, [error]);

  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
        <p className="text-slate-500 text-sm mb-6">
          An unexpected error occurred. Please try again, or contact support if the issue persists.
        </p>
        {isDev && (
          <pre className="text-left text-xs bg-slate-100 rounded-lg p-4 mb-6 overflow-auto max-h-48 text-slate-700">
            {error.message}
            {error.stack ? `\n\n${error.stack}` : ""}
          </pre>
        )}
        {error.digest && (
          <p className="text-xs text-slate-400 mb-4">Error ID: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
