"use client";

import { useState } from "react";
import { Building2, ChevronDown, ChevronUp, MapPin, Phone, Shield, Sparkles } from "lucide-react";
import { cn } from "@/lib/format";
import { Pill, type PillTone } from "@/components/ui";
import { getOverallReadinessBadge, OUTREACH_READY_NOTE } from "@/lib/prospect/evidence-readiness";
import type { PlaybookIntelligence, PlaybookChannelStatus } from "@/lib/playbook/resolve-context";

const CHANNEL_STATUS_LABEL: Record<string, string> = {
  no_verification: "Not verified — channel disabled",
  conflicting_sources: "Conflicting sources — channel disabled"
};

/**
 * Displays only tenant-authorized information already resolved server-side
 * (see lib/playbook/resolve-context.ts) — no internal database id is ever
 * rendered here, only business-facing facts. Evidence-state labels are
 * kept distinct on purpose: VERIFIED / SINGLE SOURCE / CONFLICTING /
 * INCONCLUSIVE / CAPTURE BLOCKED / EXTRACTION FAILED / SUPPRESSED must
 * never blur into one generic "verified" badge.
 */
export function IntelligenceCard({
  intelligence,
  channels,
  collapsible = false
}: {
  intelligence: PlaybookIntelligence;
  channels: PlaybookChannelStatus;
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState(!collapsible);

  // OWNER-REVIEW CORRECTION (evidence contradiction): the SAME shared
  // getOverallReadinessBadge() Prospect Detail and the Daily Queue use --
  // this card must never say "Insufficient evidence" alongside a verified
  // observation, and "Ready for verified-observation outreach" only
  // appears when a channel is REALLY activatable (channels.call/email,
  // the exact same evaluateChannelActivation() result this card's own
  // ChannelRow rows already render below).
  const hasVerifiedObservation = intelligence.verifiedObservations.length > 0;
  const overallBadge = intelligence.opportunityLevel ? getOverallReadinessBadge(intelligence.opportunityLevel, hasVerifiedObservation) : null;
  const showOutreachReady = hasVerifiedObservation && (channels.call.activatable || channels.email.activatable);

  return (
    <div className="card p-5">
      <button
        type="button"
        onClick={() => collapsible && setOpen((v) => !v)}
        className={cn("eyebrow flex w-full items-center justify-between text-left", collapsible ? "focus-ring" : "")}
      >
        Prospect Intelligence
        {collapsible ? open ? <ChevronUp className="h-3.5 w-3.5" aria-hidden /> : <ChevronDown className="h-3.5 w-3.5" aria-hidden /> : <Sparkles className="h-3.5 w-3.5 text-iris-soft" aria-hidden />}
      </button>

      {open ? (
        <div className="mt-3 space-y-3">
          <div>
            <div className="text-sm font-semibold text-ink">{intelligence.businessName}</div>
            {intelligence.contactName ? <p className="text-[12px] text-muted">{intelligence.contactName}</p> : null}
            {overallBadge || showOutreachReady ? (
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {overallBadge ? <Pill tone={overallBadge.tone as PillTone} className="text-[10.5px]">{overallBadge.label}</Pill> : null}
                {showOutreachReady ? <Pill tone="good" className="text-[10.5px]">{OUTREACH_READY_NOTE}</Pill> : null}
              </div>
            ) : null}
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[12px] text-faint">
              {intelligence.industry ? (
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-3 w-3" aria-hidden />
                  {intelligence.industry}
                </span>
              ) : null}
              {intelligence.city ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" aria-hidden />
                  {intelligence.city}
                  {intelligence.state ? `, ${intelligence.state}` : ""}
                </span>
              ) : null}
            </div>
          </div>

          {intelligence.suppressed ? (
            <div className="flex items-start gap-2 rounded-lg border border-signal-bad/30 bg-signal-bad/10 p-3 text-[12px] leading-relaxed text-signal-bad">
              <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>
                SUPPRESSED{intelligence.suppressionReason ? ` (${intelligence.suppressionReason})` : ""} — no new outreach may be initiated. This session is read-only.
              </span>
            </div>
          ) : null}

          <div className="grid gap-2">
            <ChannelRow label="CALL" value={intelligence.phone} result={channels.call} />
            <ChannelRow label="EMAIL" value={intelligence.email} result={channels.email} />
          </div>

          {intelligence.verifiedObservations.length > 0 ? (
            <div>
              <p className="text-[13px] font-medium uppercase tracking-wide text-faint">Verified observation</p>
              <ul className="mt-1.5 space-y-1.5">
                {intelligence.verifiedObservations.map((o) => (
                  <li key={o} className="text-[12.5px] leading-relaxed text-ink/85">
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {intelligence.opportunitySummary ? (
            <div>
              <p className="text-[13px] font-medium uppercase tracking-wide text-faint">Opportunity summary</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink/85">{intelligence.opportunitySummary}</p>
            </div>
          ) : null}

          {intelligence.priorContactCount > 0 ? (
            <p className="text-[13px] text-faint">
              {intelligence.priorContactCount} prior contact attempt{intelligence.priorContactCount === 1 ? "" : "s"}
              {intelligence.lastContactOutcome ? ` · last outcome: ${intelligence.lastContactOutcome.replace(/_/g, " ")}` : ""}
            </p>
          ) : (
            <p className="text-[13px] text-faint">No prior contact recorded.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function ChannelRow({ label, value, result }: { label: string; value: string | null; result: PlaybookChannelStatus["call"] }) {
  const tone = result.activatable ? "text-signal-good" : "text-faint";
  return (
    <div className="flex items-center justify-between rounded-lg border border-hairline bg-raised/50 px-3 py-2">
      <div className="flex items-center gap-2 text-[12px] text-ink">
        {label === "CALL" ? <Phone className="h-3 w-3 text-faint" aria-hidden /> : null}
        <span className="font-medium">{label}</span>
        {value ? <span className="text-faint">{value}</span> : null}
      </div>
      <span className={cn("text-[13px] font-medium", tone)}>
        {result.activatable
          ? result.corroboration === "single_source"
            ? "SINGLE SOURCE"
            : "VERIFIED"
          : CHANNEL_STATUS_LABEL[result.reason] ?? "Not verified"}
      </span>
    </div>
  );
}
