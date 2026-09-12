import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/format";
import { Breadcrumbs } from "@/components/shell";

/**
 * WEBGENIE AUTHENTICATED UI/UX REBUILD -- shared workspace-page primitives.
 *
 * These exist because the authenticated app's operational pages (Daily
 * Queue, Prospect Detail, Finder, Projects, Sequences, Launch, Insights)
 * previously each hand-rolled their own hero header, metric-card grid,
 * loading spinner, and empty state -- see docs/history.md and the
 * "WEBGENIE AUTHENTICATED UI/UX REBUILD" session for the audit. Nothing
 * here changes what data a page fetches, what an action does, or any
 * stored value -- purely presentation, reused across pages instead of
 * duplicated.
 *
 * Deliberately NOT a giant abstract component framework (explicit
 * instruction) -- eight small, composable pieces, each used by 2+ pages:
 * PageHeader, SummaryStrip, StatusBadge (thin Pill wrapper for readiness/
 * status semantics), DisclosurePanel, EmptyState, LoadingSkeleton,
 * ErrorState, ActionToolbar.
 */

// ---------------------------------------------------------------------
// PageHeader -- replaces the oversized `Panel`+gradient-headline hero
// every operational page opened with (a 270-350px block before any real
// work was visible). Target height ~96-160px depending on content.
// ---------------------------------------------------------------------
export function PageHeader({
  breadcrumbs,
  title,
  description,
  primaryAction,
  secondaryAction,
  context,
}: {
  breadcrumbs?: Array<{ label: string; href?: string }>;
  title: string;
  description?: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  /** Compact status/context row -- a Pill, a date, a short fact. Never a paragraph. */
  context?: ReactNode;
}) {
  return (
    <div className="border-b border-hairline pb-5">
      {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
      <div className={cn("flex flex-wrap items-start justify-between gap-4", breadcrumbs && "mt-2")}>
        <div className="min-w-0">
          <h1 className="text-page-title font-semibold text-ink">{title}</h1>
          {description ? <p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-muted">{description}</p> : null}
          {context ? <div className="mt-2.5 flex flex-wrap items-center gap-2">{context}</div> : null}
        </div>
        {primaryAction || secondaryAction ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2.5">
            {secondaryAction}
            {primaryAction}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// SummaryStrip -- a compact single-row status strip replacing 4-5 large
// `.card` metric tiles. Zero-value entries are visually de-emphasized
// (per "De-emphasize zero-value metrics" / "without hiding them") rather
// than hidden outright -- a real zero is still a real, checkable fact.
// ---------------------------------------------------------------------
export interface SummaryStripItem {
  label: string;
  value: ReactNode;
  tone?: "ink" | "good" | "warn" | "bad" | "neon" | "iris";
  icon?: ReactNode;
}

const SUMMARY_TONE_CLASS: Record<NonNullable<SummaryStripItem["tone"]>, string> = {
  ink: "text-ink",
  good: "text-signal-good",
  warn: "text-signal-warn",
  bad: "text-signal-bad",
  neon: "text-neon",
  iris: "text-iris-soft",
};

export function SummaryStrip({ items }: { items: SummaryStripItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-hairline bg-hairline sm:grid-cols-3 lg:flex lg:grid-cols-none">
      {items.map((item) => {
        const isZero = typeof item.value === "number" && item.value === 0;
        return (
          <div key={item.label} className="flex min-w-0 flex-1 items-center gap-2.5 bg-surface px-4 py-3">
            {item.icon ? <span className={cn("shrink-0", isZero ? "text-faint" : SUMMARY_TONE_CLASS[item.tone ?? "ink"])}>{item.icon}</span> : null}
            <div className="min-w-0">
              <div className={cn("font-mono text-lg font-semibold tabular-nums leading-none", isZero ? "text-faint" : SUMMARY_TONE_CLASS[item.tone ?? "ink"])}>
                {item.value}
              </div>
              <div className="mt-1 truncate text-[12px] text-muted">{item.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------
// ActionToolbar -- a filter/action row meant to sit directly beside a
// section title, replacing filters that floated disconnected from what
// they filtered.
// ---------------------------------------------------------------------
export function ActionToolbar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap items-center gap-1.5", className)}>{children}</div>;
}

// ---------------------------------------------------------------------
// DisclosurePanel -- a native <details> used for "why this action?" /
// "how WebGenie calculates these numbers" / long technical descriptions
// that shouldn't be the dominant paragraph on a scannable row.
// ---------------------------------------------------------------------
export function DisclosurePanel({
  summary,
  children,
  className,
  defaultOpen = false,
}: {
  summary: ReactNode;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
}) {
  return (
    <details className={cn("group", className)} {...(defaultOpen ? { open: true } : {})}>
      <summary className="focus-ring flex cursor-pointer list-none items-center gap-1.5 rounded-md text-[13px] font-medium text-iris-soft hover:underline [&::-webkit-details-marker]:hidden">
        <span aria-hidden className="inline-block transition-transform group-open:rotate-90">
          ▸
        </span>
        {summary}
      </summary>
      <div className="mt-2 text-[13px] leading-relaxed text-muted">{children}</div>
    </details>
  );
}

// ---------------------------------------------------------------------
// EmptyState -- every empty state answers "what does this mean?" and
// "what should I do next?" (explicit Phase 7 requirement), never just a
// muted sentence with nothing to do about it.
// ---------------------------------------------------------------------
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-panel border border-dashed border-hairline bg-canvas/50 px-8 py-14 text-center">
      {icon ? <span className="text-faint">{icon}</span> : null}
      <h3 className={cn("text-[15px] font-semibold text-ink", icon ? "mt-4" : null)}>{title}</h3>
      <p className="mt-2 max-w-sm text-[13.5px] leading-relaxed text-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

// ---------------------------------------------------------------------
// ErrorState -- a real error, with retry where safe (Phase 7).
// ---------------------------------------------------------------------
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-signal-bad/30 bg-signal-bad/10 px-4 py-3.5">
      <div className="flex items-center gap-2.5">
        <AlertTriangle className="h-4 w-4 shrink-0 text-signal-bad" aria-hidden />
        <p className="text-[13.5px] text-signal-bad">{message}</p>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="focus-ring shrink-0 rounded-lg border border-signal-bad/40 px-3 py-1.5 text-[12.5px] font-medium text-signal-bad hover:bg-signal-bad/10"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------
// LoadingSkeleton -- layout-preserving placeholders, replacing an
// isolated centered spinner on an otherwise blank page (explicit Phase 7
// finding: "The Daily Queue currently shows a mostly empty screen with a
// small spinner during loading").
// ---------------------------------------------------------------------
export function LoadingSkeleton({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)} role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-panel border border-hairline bg-canvas/60 p-4">
          <div className="h-3.5 w-1/3 rounded bg-raised" />
          <div className="mt-3 h-2.5 w-2/3 rounded bg-raised" />
          <div className="mt-2 h-2.5 w-1/2 rounded bg-raised" />
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function SummaryStripSkeleton() {
  return (
    <div className="grid animate-pulse grid-cols-2 gap-px overflow-hidden rounded-card border border-hairline bg-hairline sm:grid-cols-3 lg:flex lg:grid-cols-none" role="status" aria-label="Loading summary">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="min-w-0 flex-1 bg-surface px-4 py-3">
          <div className="h-5 w-10 rounded bg-raised" />
          <div className="mt-2 h-2.5 w-16 rounded bg-raised" />
        </div>
      ))}
    </div>
  );
}

export function InlineSpinner({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[13px] text-muted">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------
// PrimaryAction / DangerAction -- one visually dominant primary action
// per page, destructive actions visibly separated (Phase 2 BUTTONS).
// ---------------------------------------------------------------------
export function PrimaryAction({
  children,
  href,
  onClick,
  disabled,
  type = "button",
  className,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  const classes = cn(
    "focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-iris to-iris-deep px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-12px_rgba(124,92,255,.9)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50",
    className
  );
  if (href) {
    return (
      <Link href={href} className={classes} aria-disabled={disabled}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}

export function DangerAction({
  children,
  onClick,
  disabled,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "focus-ring inline-flex items-center justify-center gap-1.5 rounded-lg border border-signal-bad/30 bg-signal-bad/[0.06] px-3 py-1.5 text-[12.5px] font-medium text-signal-bad transition-colors hover:bg-signal-bad/10 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  );
}
