"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ShieldCheck, Sparkles } from "lucide-react";
import { Panel, Eyebrow } from "@/components/ui";
import { INDUSTRY_LIST } from "@/lib/sitegen/industries";
import { updateOrgBrandingAction, completeVibelabsOnboardingAction } from "@/app/actions";

type Phase = "welcome" | "setup" | "done";

const SUPPORT_PHONE = "(470) 376-9804";

export function WelcomeClient({
  guaranteeDeadlineAt,
  initialBrandName,
  initialNiche,
}: {
  guaranteeDeadlineAt: string | null;
  initialBrandName: string;
  initialNiche: string;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("welcome");
  const [brandName, setBrandName] = useState(initialBrandName);
  const [niche, setNiche] = useState(initialNiche || "plumber");
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState("");

  async function finish(destination: string) {
    setFinishing(true);
    try {
      await completeVibelabsOnboardingAction();
    } catch (err) {
      console.error("Failed to mark onboarding complete:", err);
    } finally {
      router.push(destination);
    }
  }

  const deadline = guaranteeDeadlineAt
    ? new Date(guaranteeDeadlineAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
    : null;

  async function saveSetupAndContinue() {
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      formData.set("brandName", brandName);
      formData.set("primaryNiche", niche);
      // Everything else stays unset (org has no branding yet, nothing to
      // clobber) — see updateOrgBrandingAction: a blank field clears it.
      formData.set("logoUrl", "");
      formData.set("faviconUrl", "");
      formData.set("primaryColor", "");
      formData.set("accentColor", "");
      formData.set("supportEmail", "");
      formData.set("supportPhone", "");
      await updateOrgBrandingAction(formData);
      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save — try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      {phase === "welcome" && (
        <div className="animate-fade-up text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-signal-good/35 bg-signal-good/10 px-4 py-2 text-[13px] font-medium text-signal-good">
            <Check className="h-4 w-4" aria-hidden />
            You&rsquo;re a founding VibeLabs member
          </span>
          <h1 className="mt-6 text-display-md font-semibold text-ink">Welcome to VibeLabs Agency</h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted">
            A fully branded, white-label AI agency in your name — with the exact tools to find,
            qualify, and close your first client.
          </p>

          <Panel className="mt-8 text-left">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-signal-good" aria-hidden />
              <div>
                <Eyebrow>Your guarantee</Eyebrow>
                <p className="mt-2 text-sm leading-relaxed text-ink">
                  If you haven&rsquo;t landed a paying client within 60 days, we don&rsquo;t walk
                  away — you get free, extended 1:1 support until you do.
                </p>
                {deadline && (
                  <p className="mt-2 text-[12.5px] text-faint">
                    Your 60-day window runs through <span className="text-muted">{deadline}</span>.
                    This is a standing support commitment, not a refund.
                  </p>
                )}
              </div>
            </div>
          </Panel>

          <button
            onClick={() => setPhase("setup")}
            className="focus-ring mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-iris px-5 py-3 text-sm font-medium text-white shadow-[0_8px_28px_-12px_rgba(124,92,255,0.9)] transition-all duration-200 hover:bg-iris-soft"
          >
            Get set up <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}

      {phase === "setup" && (
        <div className="animate-fade-up">
          <div className="text-center">
            <Sparkles className="mx-auto h-6 w-6 text-iris" aria-hidden />
            <h1 className="mt-4 text-display-sm font-semibold text-ink">A couple of quick things</h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted">
              Both take a minute now, both fully editable later in Settings.
            </p>
          </div>

          <Panel className="mt-8">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
                Your agency&rsquo;s name
              </span>
              <input
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Summit Digital Agency"
                className="focus-ring w-full rounded-lg border border-hairline bg-raised px-3 py-2.5 text-sm text-ink placeholder:text-faint"
              />
              <span className="mt-1.5 block text-[12px] text-faint">
                Shows up on every site you generate and every lead-capture form your clients see.
              </span>
            </label>

            <label className="mt-6 block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
                What you&rsquo;ll focus on first
              </span>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="focus-ring w-full appearance-none rounded-lg border border-hairline bg-raised px-3 py-2.5 text-sm text-ink"
              >
                {INDUSTRY_LIST.map((p) => (
                  <option key={p.key} value={p.key} className="bg-raised">
                    {p.label}
                  </option>
                ))}
              </select>
              <span className="mt-1.5 block text-[12px] text-faint">
                Just pre-fills Lead Finder for you — not an exclusive territory, and easy to change
                any time.
              </span>
            </label>

            {error && <p className="mt-4 text-sm text-signal-bad">{error}</p>}

            <button
              onClick={saveSetupAndContinue}
              disabled={saving}
              className="focus-ring mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-iris px-5 py-3 text-sm font-medium text-white shadow-[0_8px_28px_-12px_rgba(124,92,255,0.9)] transition-all duration-200 hover:bg-iris-soft disabled:opacity-60"
            >
              {saving ? "Saving…" : "Continue"} {!saving && <ArrowRight className="h-4 w-4" aria-hidden />}
            </button>
            <button
              onClick={() => setPhase("done")}
              className="focus-ring mt-2 w-full rounded-xl py-2.5 text-[13px] text-faint transition-colors hover:text-ink"
            >
              Skip for now
            </button>
          </Panel>
        </div>
      )}

      {phase === "done" && (
        <div className="animate-fade-up text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-signal-good/35 bg-signal-good/10 px-4 py-2 text-[13px] font-medium text-signal-good">
            <Check className="h-4 w-4" aria-hidden />
            You&rsquo;re set up
          </span>
          <h1 className="mt-6 text-display-sm font-semibold text-ink">
            Time to find your first client
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted">
            Lead Finder is prefilled with your focus — real businesses, sorted so you always call
            the easiest yes first.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              onClick={() => finish(`/finder?industry=${encodeURIComponent(niche)}`)}
              disabled={finishing}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-iris px-5 py-3 text-sm font-medium text-white shadow-[0_8px_28px_-12px_rgba(124,92,255,0.9)] transition-all duration-200 hover:bg-iris-soft disabled:opacity-60"
            >
              Open Lead Finder <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
            <button
              onClick={() => finish("/projects/new")}
              disabled={finishing}
              className="focus-ring text-[13px] text-faint underline decoration-dotted underline-offset-4 hover:text-ink disabled:opacity-60"
            >
              Skip to dashboard
            </button>
          </div>

          <Panel className="mt-10 text-left">
            <Eyebrow>Need help?</Eyebrow>
            <p className="mt-2 text-sm text-muted">
              Call <span className="text-ink">{SUPPORT_PHONE}</span> any time. A full playbooks
              library is on the way — for now, reach out directly and we&rsquo;ll walk you through
              it.
            </p>
          </Panel>
        </div>
      )}
    </div>
  );
}
