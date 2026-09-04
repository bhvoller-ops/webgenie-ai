import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/format";

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("eyebrow", className)}>{children}</div>;
}

export function Panel({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return <section className={cn("panel", padded && "p-6 sm:p-8", className)}>{children}</section>;
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("card p-5", className)}>{children}</div>;
}

const pillTones = {
  neutral: "border-hairline bg-raised text-muted",
  iris: "border-iris/30 bg-iris/10 text-iris-soft",
  neon: "border-neon/30 bg-neon/10 text-neon-soft",
  good: "border-signal-good/30 bg-signal-good/10 text-signal-good",
  warn: "border-signal-warn/30 bg-signal-warn/10 text-signal-warn",
  bad: "border-signal-bad/30 bg-signal-bad/10 text-signal-bad",
  info: "border-signal-info/30 bg-signal-info/10 text-signal-info",
} as const;

export type PillTone = keyof typeof pillTones;

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: PillTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none",
        pillTones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

const buttonVariants = {
  primary:
    "bg-iris-deep text-white hover:brightness-90 shadow-[0_8px_28px_-12px_rgba(124,92,255,0.9)]",
  secondary: "border border-hairline bg-raised text-ink hover:border-iris/50 hover:bg-raised/70",
  ghost: "text-muted hover:text-ink hover:bg-raised",
} as const;

export function Button({
  children,
  href,
  variant = "primary",
  className,
  type = "button",
}: {
  children: ReactNode;
  href?: string;
  variant?: keyof typeof buttonVariants;
  className?: string;
  type?: "button" | "submit";
}) {
  const classes = cn(
    "focus-ring inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
    buttonVariants[variant],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={classes}>
      {children}
    </button>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "ink",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "ink" | "good" | "warn" | "bad";
}) {
  const toneClass = {
    ink: "text-ink",
    good: "text-signal-good",
    warn: "text-signal-warn",
    bad: "text-signal-bad",
  }[tone];

  return (
    <div className="card p-5">
      <div className="eyebrow">{label}</div>
      <div className={cn("mt-3 font-mono text-3xl font-semibold tabular-nums tracking-tight", toneClass)}>
        {value}
      </div>
      {hint ? <div className="mt-1.5 text-xs text-faint">{hint}</div> : null}
    </div>
  );
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h2 className="text-display-md font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-2.5 text-sm leading-relaxed text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("hairline-x h-px w-full", className)} />;
}

export function MetaRow({ items }: { items: Array<{ label: string; value: ReactNode }> }) {
  return (
    <dl className="grid gap-px overflow-hidden rounded-card border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="bg-surface px-5 py-4">
          <dt className="eyebrow">{item.label}</dt>
          <dd className="mt-2 font-mono text-sm text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
