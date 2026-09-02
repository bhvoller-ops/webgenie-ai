"use client";

import { useEffect } from "react";
import { Button, Panel } from "@/components/ui";

/**
 * Global error boundary — flagged twice in CLAUDE.md §10 as a real gap and
 * never fixed. Matters more now: this project adds public-facing checkout,
 * welcome, and support flows where a raw Next.js error-digest page in front
 * of someone mid-signup is a worse look than in an internal-tool-only app.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <Panel className="max-w-md text-center">
        <h1 className="text-lg font-semibold text-ink">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted">
          That&apos;s on us, not you. Try again, or come back in a moment.
        </p>
        {error.digest && (
          <p className="mt-4 font-mono text-xs text-muted">Reference: {error.digest}</p>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-iris px-4 py-2.5 text-sm font-medium text-white shadow-[0_8px_28px_-12px_rgba(124,92,255,0.9)] transition-all duration-200 hover:bg-iris-soft"
          >
            Try again
          </button>
          <Button href="/" variant="secondary">
            Go home
          </Button>
        </div>
      </Panel>
    </div>
  );
}
