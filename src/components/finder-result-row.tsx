"use client";

import { useState } from "react";
import {
  Star,
  Globe,
  Phone,
  MessageSquare,
  CalendarClock,
  FileText,
  PhoneCall,
  Mail,
  Lock,
  Smartphone,
  Clock,
  Megaphone,
  ClipboardCheck,
  Loader2,
  ExternalLink,
  RefreshCw,
  Check,
  X,
  HelpCircle,
  ImageOff,
  Info,
} from "lucide-react";
import { Pill, type PillTone } from "@/components/ui";
import { industryLabel } from "@/lib/sitegen/industry-lookup";
import { PRELIMINARY_LEVEL_LABELS, NEXT_STEP_LABELS, type PreliminaryNextStep } from "@/lib/prospect/preliminary-opportunity";
import { SIGNAL_LABELS, signalStateLabel, type FinderSignal, type SignalKey, type SignalSource } from "@/lib/prospect/finder-preview-signals";
import type { PreviewState } from "@/lib/prospect/finder-preview-capture";
import type { FinderResultRow as FinderResultRowData } from "@/app/api/prospects/route";
import { normalizeWebsiteUrl } from "@/lib/prospect/finder-preview-url";

/**
 * Finder website-preview result row (master prompt Phase 2/3/4/8) -- one
 * grouped surface per result with three compact zones (identity / preview /
 * signals + primary action) instead of a wide multi-column table row.
 * Desktop: three columns side by side. Mobile: stacked in the same order
 * (identity -> preview -> signals -> primary action -> secondary actions),
 * per Phase 2's explicit layout spec.
 */

const SIGNAL_ICONS: Record<SignalKey, React.ComponentType<{ className?: string }>> = {
  chat_widget: MessageSquare,
  online_booking: CalendarClock,
  contact_form: FileText,
  click_to_call: PhoneCall,
  email_link: Mail,
  https: Lock,
  mobile_viewport: Smartphone,
  google_open_24_hours: Clock,
  website_24_7_claim: Megaphone,
  full_audit: ClipboardCheck,
};

const SOURCE_LABEL: Record<SignalSource, string> = {
  google_business_listing: "Source: Google business listing",
  website_capture: "Source: website capture",
  existing_audit: "Source: existing audit",
  unknown: "Not yet inspected",
};

const STATE_TONE: Record<FinderSignal["state"], PillTone> = { present: "good", not_detected: "neutral", unknown: "info" };

function SignalChip({ signal }: { signal: FinderSignal }) {
  const Icon = SIGNAL_ICONS[signal.key];
  const StateIcon = signal.state === "present" ? Check : signal.state === "not_detected" ? X : HelpCircle;
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-hairline bg-raised/40 px-2.5 py-1.5">
      <span className="flex min-w-0 items-center gap-1.5 text-[11.5px] text-ink/85">
        <Icon className="h-3.5 w-3.5 shrink-0 text-faint" aria-hidden />
        <span className="truncate">{SIGNAL_LABELS[signal.key]}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1">
        <Pill tone={STATE_TONE[signal.state]} className="text-[10px]">
          <StateIcon className="h-2.5 w-2.5" aria-hidden />
          {signalStateLabel(signal.key, signal.state)}
        </Pill>
        <button
          type="button"
          className="focus-ring rounded p-0.5 text-faint transition-colors hover:text-ink"
          title={SOURCE_LABEL[signal.source]}
          aria-label={`${SIGNAL_LABELS[signal.key]}: ${signalStateLabel(signal.key, signal.state)}. ${SOURCE_LABEL[signal.source]}.`}
        >
          <Info className="h-3 w-3" aria-hidden />
        </button>
      </span>
    </div>
  );
}

type LocalPreviewState = { kind: PreviewState | "idle"; signedImageUrl: string | null; capturedAt: string | null; isStale: boolean; signals: FinderSignal[]; failureReason?: string };

function PreviewPane({
  state,
  onGenerate,
  websiteUrl,
}: {
  state: LocalPreviewState;
  onGenerate: (forceRefresh: boolean) => void;
  websiteUrl: string | null;
}) {
  if (!websiteUrl) {
    return (
      <div className="flex h-full min-h-[110px] flex-col items-center justify-center gap-1.5 rounded-lg border border-hairline bg-canvas/60 p-3 text-center">
        <Globe className="h-5 w-5 text-faint" aria-hidden />
        <p className="text-[11px] text-faint">Website unavailable</p>
      </div>
    );
  }

  if (state.kind === "capturing") {
    return (
      <div className="flex h-full min-h-[110px] flex-col items-center justify-center gap-1.5 rounded-lg border border-hairline bg-canvas/60 p-3 text-center" aria-live="polite">
        <Loader2 className="h-5 w-5 animate-spin text-iris-soft" aria-hidden />
        <p className="text-[11px] text-muted">Generating preview…</p>
      </div>
    );
  }

  if (state.kind === "failed") {
    return (
      <div className="flex h-full min-h-[110px] flex-col items-center justify-center gap-1.5 rounded-lg border border-hairline bg-canvas/60 p-3 text-center">
        <ImageOff className="h-5 w-5 text-faint" aria-hidden />
        <p className="text-[11px] text-faint">Capture failed</p>
        <button type="button" onClick={() => onGenerate(true)} className="focus-ring inline-flex items-center gap-1 text-[11px] font-medium text-iris-soft hover:text-iris">
          <RefreshCw className="h-3 w-3" aria-hidden />
          Retry
        </button>
      </div>
    );
  }

  if (state.kind === "available" && state.signedImageUrl) {
    return (
      <div className="flex flex-col gap-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-faint">Current website preview</p>
        <div className="overflow-hidden rounded-lg border border-hairline bg-canvas">
          {/* Real, already-cropped/optimized capture -- plain img, not next/image, since the source is a short-lived signed URL, not a static asset. */}
          <img src={state.signedImageUrl} alt="Screenshot of the business's current website homepage, as last captured" className="aspect-[4/3] w-full object-cover object-top" />
        </div>
        <p className="text-[10px] text-faint">
          Captured {state.capturedAt ? new Date(state.capturedAt).toLocaleString() : "recently"}
          {state.isStale ? " — may be out of date" : ""}
        </p>
        <p className="text-[10px] text-faint">Preview only. Run an audit for evidence-backed findings.</p>
        <button type="button" onClick={() => onGenerate(true)} className="focus-ring inline-flex items-center gap-1 self-start text-[11px] font-medium text-muted hover:text-ink">
          <RefreshCw className="h-3 w-3" aria-hidden />
          Refresh preview
        </button>
      </div>
    );
  }

  // "not_generated" (default) and "unavailable" (normalization/validation failed) both land here.
  return (
    <div className="flex h-full min-h-[110px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-hairline bg-canvas/40 p-3 text-center">
      <ImageOff className="h-5 w-5 text-faint" aria-hidden />
      <p className="text-[11px] text-faint">{state.kind === "unavailable" ? "Preview unavailable" : "Preview not generated"}</p>
      <button
        type="button"
        onClick={() => onGenerate(false)}
        className="focus-ring rounded-lg border border-hairline bg-raised px-2.5 py-1 text-[11px] font-medium text-ink transition-colors hover:border-iris/50"
      >
        Generate preview
      </button>
    </div>
  );
}

export function FinderResultRow({
  business,
  selected,
  onToggleSelect,
  onViewOpportunity,
  secondaryActions,
}: {
  business: FinderResultRowData;
  selected: boolean;
  onToggleSelect: () => void;
  onViewOpportunity: () => void;
  secondaryActions: React.ReactNode;
}) {
  const opp = business.preliminaryOpportunity;
  const [preview, setPreview] = useState<LocalPreviewState>({ kind: "idle", signedImageUrl: null, capturedAt: null, isStale: false, signals: [] });

  async function runGenerate(forceRefresh: boolean) {
    setPreview((p) => ({ ...p, kind: "capturing" }));
    try {
      const res = await fetch("/api/finder/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: business.website, open24Hours: business.open24Hours, hasCompletedAudit: business.hasCompletedAudit, forceRefresh })
      });
      const json = await res.json();
      setPreview({ kind: json.state, signedImageUrl: json.signedImageUrl, capturedAt: json.capturedAt, isStale: json.isStale, signals: json.signals ?? [], failureReason: json.failureReason });
    } catch {
      setPreview((p) => ({ ...p, kind: "failed" }));
    }
  }

  // Signals shown before any capture: listing + audit signals are real
  // immediately (no capture needed); website-capture signals default to
  // "unknown" until a preview is actually generated -- never "not detected."
  const displaySignals: FinderSignal[] =
    preview.signals.length > 0
      ? preview.signals
      : [
          ...(["chat_widget", "online_booking", "contact_form", "click_to_call", "email_link", "https", "mobile_viewport", "website_24_7_claim"] as SignalKey[]).map(
            (key): FinderSignal => ({ key, label: SIGNAL_LABELS[key], state: "unknown", source: "unknown" })
          ),
          { key: "google_open_24_hours", label: SIGNAL_LABELS.google_open_24_hours, state: business.open24Hours === undefined ? "unknown" : business.open24Hours ? "present" : "not_detected", source: "google_business_listing" },
          { key: "full_audit", label: SIGNAL_LABELS.full_audit, state: business.hasCompletedAudit ? "present" : "not_detected", source: "existing_audit" }
        ];

  const primaryLabel = business.hasCompletedAudit ? "Review Audit" : business.website ? "Run Audit" : NEXT_STEP_LABELS[opp.recommendedNextStep as PreliminaryNextStep];
  const normalizedWebsite = business.website ? normalizeWebsiteUrl(business.website) : null;
  const websiteHref = normalizedWebsite && "url" in normalizedWebsite ? normalizedWebsite.url : business.website ?? null;

  return (
    <li className="grid grid-cols-1 gap-4 border-t border-hairline p-4 first:border-t-0 lg:grid-cols-[1.1fr_1fr_1.3fr] lg:items-start lg:gap-5">
      {/* Zone 1: identity */}
      <div className="flex gap-3">
        <input type="checkbox" checked={selected} onChange={onToggleSelect} className="mt-1 h-3.5 w-3.5 shrink-0 rounded border-hairline" aria-label={`Select ${business.name}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-iris/30 bg-iris/10 text-[13px] font-semibold text-iris-soft">{business.name.charAt(0)}</span>
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-medium text-ink">{business.name}</p>
              <p className="truncate text-[11.5px] text-faint">
                {industryLabel(business.industry)} · {business.city}
                {business.state ? `, ${business.state}` : ""}
              </p>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {typeof business.rating === "number" ? (
              <span className="inline-flex items-center gap-1 text-[11.5px] text-ink/85">
                <Star className="h-3 w-3 fill-signal-warn text-signal-warn" aria-hidden />
                {business.rating} <span className="text-faint">({business.reviewCount ?? 0})</span>
              </span>
            ) : null}
            <Pill tone={opp.websiteStatus === "present" ? "good" : opp.websiteStatus === "absent" ? "neutral" : "info"} className="text-[10px]">
              {opp.websiteStatus === "present" ? "Website found" : opp.websiteStatus === "absent" ? "No website" : "Website unknown"}
            </Pill>
            <Pill tone={business.phone ? "neutral" : "info"} className="text-[10px]">
              <Phone className="h-2.5 w-2.5" aria-hidden />
              {business.phone ? "Phone on file" : "No phone on file"}
            </Pill>
            <Pill tone={LEVEL_TONE[opp.level]} className="text-[10px]">
              {PRELIMINARY_LEVEL_LABELS[opp.level]}
            </Pill>
          </div>
        </div>
      </div>

      {/* Zone 2: current-website preview */}
      <div>
        <PreviewPane state={preview} onGenerate={runGenerate} websiteUrl={business.website ?? null} />
      </div>

      {/* Zone 3: signals + primary/secondary actions */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {displaySignals.map((s) => (
            <SignalChip key={s.key} signal={s} />
          ))}
        </div>
        <p className="text-[10.5px] leading-relaxed text-faint">Preliminary signals help you screen this business. Run an audit before making broader claims.</p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onViewOpportunity}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-iris to-iris-deep px-3 py-2 text-[12px] font-semibold text-white shadow-[0_6px_20px_-10px_rgba(124,92,255,.9)] transition-all hover:brightness-110"
          >
            {primaryLabel}
          </button>
          {websiteHref ? (
            <a
              href={websiteHref}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center gap-1 rounded-lg border border-hairline bg-raised px-2.5 py-2 text-[11.5px] text-muted transition-colors hover:text-ink"
            >
              <ExternalLink className="h-3 w-3" aria-hidden />
              Open current website
            </a>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-1">{secondaryActions}</div>
      </div>
    </li>
  );
}

const LEVEL_TONE: Record<string, PillTone> = { high: "good", medium: "warn", low: "neutral", insufficient_data: "info" };
