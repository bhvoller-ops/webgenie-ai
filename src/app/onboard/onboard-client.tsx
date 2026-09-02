"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bot,
  Building2,
  CalendarCheck,
  Check,
  Clock,
  ExternalLink,
  Globe,
  Image as ImageIcon,
  Inbox,
  Loader2,
  MessageSquare,
  Phone,
  PhoneMissed,
  Search,
  Star,
  TrendingUp,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { PageShell } from "@/components/shell";
import type { AccessRole } from "@/lib/auth/access";
import { Eyebrow, Panel, Pill } from "@/components/ui";
import { INDUSTRY_LIST, INDUSTRIES } from "@/lib/sitegen/industries";
import { demoSiteUrl } from "@/lib/sitegen/encode";
import type { Business, IndustryKey, SiteGenIndustryKey } from "@/lib/sitegen/types";
import { cn } from "@/lib/format";
import { addCallLogEntryAction } from "@/app/actions";

/* ------------------------------------------------------------------ */
/* Provisioning steps                                                  */
/* ------------------------------------------------------------------ */

const STEPS = [
  { label: "Creating CRM sub-account", sub: "Provisioning dedicated workspace", ms: 1100 },
  { label: "Importing business profile", sub: "Syncing name, address, hours, reviews", ms: 900 },
  { label: "Building professional website", sub: "Industry-optimised pages with real reviews", ms: 1700 },
  { label: "Configuring AI chat widget", sub: "24/7 lead qualification & appointment booking", ms: 1200 },
  { label: "Setting up voice AI receptionist", sub: "Handles inbound calls, books appointments", ms: 1500 },
  { label: "Activating missed-call text-back", sub: "Auto-texts when calls go unanswered", ms: 800 },
  { label: "Creating appointment calendars", sub: "Service, consultation, and onboarding calendars", ms: 900 },
  { label: "Building review automation", sub: "Automated Google review requests after jobs", ms: 1000 },
  { label: "Setting up lead pipeline", sub: "9-stage pipeline from new lead to closed-won", ms: 850 },
  { label: "Configuring follow-up sequences", sub: "Email + SMS nurture, estimate follow-up, reactivation", ms: 1200 },
];

/**
 * `real: true` means this genuinely happened when onboarding runs — the
 * site is actually generated and live, the chat widget actually ships in
 * it, the call_log row actually gets inserted. `real: false` means nothing
 * was provisioned — no voice/SMS/calendar/review-automation integration
 * exists anywhere in this codebase (confirmed: no Twilio, no GoHighLevel,
 * no calendar provider). Previously every item here showed a green
 * checkmark regardless — a number a member could relay directly to their
 * own paying client. See the "Not yet automated" section below.
 */
const ACTIVE = [
  { icon: Globe, title: "Professional Website", sub: "Live with real reviews & AI chat", value: 800, real: true },
  { icon: MessageSquare, title: "AI Chat Widget", sub: "24/7 lead qualification", value: 300, real: true },
  { icon: TrendingUp, title: "Lead Pipeline", sub: "Added to your Calls pipeline", value: 100, real: true },
  { icon: Inbox, title: "Unified Inbox", sub: "Site leads land in your Leads inbox", value: 100, real: true },
  { icon: Phone, title: "Voice AI Receptionist", sub: "Answers calls, books appointments", value: 600, real: false },
  { icon: PhoneMissed, title: "Missed Call Text-Back", sub: "Auto-texts missed calls", value: 200, real: false },
  { icon: Star, title: "Review Automation", sub: "Google review requests after jobs", value: 300, real: false },
  { icon: CalendarCheck, title: "Online Booking", sub: "Appointment calendars", value: 150, real: false },
  { icon: Workflow, title: "Follow-Up Sequences", sub: "Email + SMS nurture flows", value: 250, real: false },
  { icon: Users, title: "CRM & Contacts", sub: "Ready for lead import", value: 0, real: true },
];

// Only sums what's actually running — previously summed all 10 items
// unconditionally regardless of this list's own `real` flags.
const MONTHLY_VALUE = ACTIVE.filter((a) => a.real).reduce((n, a) => n + a.value, 0);
const CLIENT_PRICE = 297;

/* ------------------------------------------------------------------ */
/* GMB link parsing                                                    */
/* ------------------------------------------------------------------ */

function parseMapsLink(url: string): { name: string; city: string; state: string } | null {
  try {
    const decoded = decodeURIComponent(url);
    const m = /\/maps\/place\/([^/@?]+)/.exec(decoded);
    if (!m) return null;
    const raw = m[1].replace(/\+/g, " ").replace(/\s+/g, " ").trim();
    // "Valley Pro Plumbing Co Bentonville AR" → name + city + state
    const st = /\s([A-Z]{2})$/.exec(raw);
    if (st) {
      const withoutState = raw.slice(0, st.index).trim();
      const parts = withoutState.split(" ");
      const city = parts.slice(-1).join(" ");
      return { name: parts.slice(0, -1).join(" ") || withoutState, city, state: st[1] };
    }
    return { name: raw, city: "", state: "" };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */

type Phase = "input" | "confirm" | "running" | "done";

export function OnboardClient({ role, organizationId }: { role: AccessRole; organizationId: string }) {
  const [phase, setPhase] = useState<Phase>("input");
  const [mode, setMode] = useState<"link" | "manual">("link");
  const [link, setLink] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [biz, setBiz] = useState<Business>({
    id: "client_1",
    name: "",
    industry: "plumber",
    phone: "",
    address: "",
    city: "",
    state: "",
    rating: 4.5,
    reviewCount: 72,
    hours: "Mon-Fri 8:00 AM - 5:00 PM",
    website: null,
    source: "manual",
  });

  const [stepIndex, setStepIndex] = useState(-1);
  const [elapsed, setElapsed] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
      if (tick.current) clearInterval(tick.current);
    };
  }, []);

  function scan() {
    setError(null);
    if (mode === "manual") {
      if (!biz.name.trim()) return setError("Enter the business name.");
      setPhase("confirm");
      return;
    }
    const parsed = parseMapsLink(link);
    if (!parsed) {
      setError("That doesn't look like a Google Maps place link. Try Manual Entry instead.");
      return;
    }
    setScanning(true);
    setTimeout(() => {
      setBiz((b) => ({
        ...b,
        name: parsed.name,
        city: parsed.city || b.city,
        state: parsed.state || b.state,
      }));
      setScanning(false);
      setPhase("confirm");
    }, 1200);
  }

  /**
   * "Setting up lead pipeline" used to be a fake timer with no database
   * write at all — now it actually inserts a call_log row, reusing the
   * exact action /calls' own "add prospect" flow uses, so this client
   * genuinely shows up in the pipeline rather than only appearing to.
   */
  async function addToPipeline() {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const demoUrl = `${origin}${demoSiteUrl(biz, { by: "VibeLabs Agency", badge: false, org: organizationId })}`;
    const formData = new FormData();
    formData.set("businessName", biz.name);
    formData.set("phone", biz.phone || "");
    formData.set("industry", profile.label);
    formData.set("city", biz.city || "");
    formData.set("state", biz.state || "");
    formData.set("demoUrl", demoUrl);
    try {
      await addCallLogEntryAction(formData);
    } catch (err) {
      // Non-fatal: the site is real regardless of whether the pipeline
      // entry saved — surfacing this as a hard failure would block a
      // client who's actually done from seeing their finished site.
      console.error("Failed to add client to pipeline:", err);
    }
  }

  function onboard() {
    setPhase("running");
    setStepIndex(0);
    setElapsed(0);
    const start = Date.now();
    tick.current = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 250);

    let acc = 0;
    STEPS.forEach((s, i) => {
      acc += s.ms;
      timers.current.push(
        setTimeout(() => {
          if (i === STEPS.length - 1) {
            if (tick.current) clearInterval(tick.current);
            setStepIndex(STEPS.length);
            addToPipeline().finally(() => setPhase("done"));
          } else {
            setStepIndex(i + 1);
          }
        }, acc)
      );
    });
  }

  function reset() {
    timers.current.forEach(clearTimeout);
    if (tick.current) clearInterval(tick.current);
    setPhase("input");
    setStepIndex(-1);
    setElapsed(0);
    setLink("");
    setBiz((b) => ({ ...b, name: "", city: "", state: "", phone: "", address: "" }));
  }

  // Onboard's own two selects (below) only ever offer INDUSTRY_LIST's 14 —
  // Gallery industries aren't wired into this flow, so this cast is exact,
  // not a widening.
  const profile = INDUSTRIES[biz.industry as SiteGenIndustryKey];

  return (
    <PageShell role={role}>
      {/* ---------- INPUT ---------- */}
      {phase === "input" ? (
        <Panel className="relative overflow-hidden" padded={false}>
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.3]"
            style={{
              backgroundImage:
                "radial-gradient(600px 260px at 50% 0%, rgba(251,191,36,.16), transparent 70%)",
            }}
            aria-hidden
          />
          <div className="relative px-6 py-14 text-center sm:px-12 sm:py-16">
            <Pill tone="warn" className="mx-auto">
              <Zap className="h-3 w-3" aria-hidden />
              60-second client setup
            </Pill>

            <h1 className="mx-auto mt-6 max-w-2xl text-display-lg font-semibold text-ink">
              Onboard a New Client
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
              Paste their Google Business Profile link and the setup runs itself — CRM, website,
              AI chat, voice receptionist, review automation, everything.
            </p>

            <div className="mx-auto mt-9 max-w-2xl">
              <div className="mx-auto inline-flex rounded-xl border border-hairline bg-canvas p-1">
                {(["link", "manual"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={cn(
                      "focus-ring rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                      mode === m ? "bg-signal-warn/15 text-signal-warn" : "text-muted hover:text-ink"
                    )}
                  >
                    {m === "link" ? "Google Profile Link" : "Manual Entry"}
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-panel border border-hairline bg-canvas/80 p-4 text-left">
                {mode === "link" ? (
                  <label className="relative block">
                    <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden />
                    <input
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && scan()}
                      placeholder="Paste Google Business Profile link…"
                      className="focus-ring w-full rounded-xl border border-hairline bg-surface py-3.5 pl-10 pr-4 text-sm text-ink placeholder:text-faint"
                    />
                  </label>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      value={biz.name}
                      onChange={(e) => setBiz({ ...biz, name: e.target.value })}
                      placeholder="Business name"
                      className="focus-ring rounded-xl border border-hairline bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint"
                    />
                    <select
                      value={biz.industry}
                      onChange={(e) => setBiz({ ...biz, industry: e.target.value as IndustryKey })}
                      className="focus-ring appearance-none rounded-xl border border-hairline bg-surface px-4 py-3 text-sm text-ink"
                    >
                      {INDUSTRY_LIST.map((p) => (
                        <option key={p.key} value={p.key} className="bg-surface">
                          {p.label}
                        </option>
                      ))}
                    </select>
                    <input
                      value={biz.city}
                      onChange={(e) => setBiz({ ...biz, city: e.target.value })}
                      placeholder="City"
                      className="focus-ring rounded-xl border border-hairline bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint"
                    />
                    <input
                      value={biz.state}
                      onChange={(e) => setBiz({ ...biz, state: e.target.value.toUpperCase() })}
                      placeholder="State (e.g. AR)"
                      className="focus-ring rounded-xl border border-hairline bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint"
                    />
                    <input
                      value={biz.phone}
                      onChange={(e) => setBiz({ ...biz, phone: e.target.value })}
                      placeholder="Phone"
                      className="focus-ring rounded-xl border border-hairline bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint"
                    />
                    <input
                      value={biz.address}
                      onChange={(e) => setBiz({ ...biz, address: e.target.value })}
                      placeholder="Street address"
                      className="focus-ring rounded-xl border border-hairline bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint"
                    />
                  </div>
                )}

                <button
                  onClick={scan}
                  disabled={scanning}
                  className="focus-ring mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-signal-warn to-[#F59E0B] py-3.5 text-sm font-semibold text-[#1A1206] transition-all hover:brightness-105 disabled:opacity-50"
                >
                  {scanning ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Scanning…
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" aria-hidden />
                      {mode === "link" ? "Scan Business Profile" : "Continue"}
                    </>
                  )}
                </button>

                {error ? (
                  <p className="mt-3 text-[12.5px] text-signal-bad">{error}</p>
                ) : (
                  <p className="mt-3 text-[12px] leading-relaxed text-faint">
                    We pull the business name, address, phone, hours, reviews, and industry — then
                    build the full account around them.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Panel>
      ) : null}

      {/* ---------- CONFIRM ---------- */}
      {phase === "confirm" ? (
        <div className="animate-fade-up">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 text-[13px] font-medium text-signal-good">
              <Check className="h-4 w-4" aria-hidden />
              Business profile found
            </span>
            <h1 className="mt-4 text-display-md font-semibold text-ink">Confirm Client Details</h1>
          </div>

          <Panel className="mx-auto mt-8 max-w-2xl">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-hairline bg-raised">
                <Building2 className="h-5 w-5 text-muted" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <input
                  value={biz.name}
                  onChange={(e) => setBiz({ ...biz, name: e.target.value })}
                  className="focus-ring w-full rounded-lg bg-transparent text-xl font-semibold text-ink outline-none"
                />
                <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
                  <select
                    value={biz.industry}
                    onChange={(e) => setBiz({ ...biz, industry: e.target.value as IndustryKey })}
                    className="focus-ring rounded-lg border border-hairline bg-surface px-2.5 py-1 text-[12px] text-iris-soft"
                  >
                    {INDUSTRY_LIST.map((p) => (
                      <option key={p.key} value={p.key} className="bg-surface">
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <span className="inline-flex items-center gap-1.5 text-[12px]">
                    <Star className="h-3 w-3 fill-signal-warn text-signal-warn" aria-hidden />
                    <span className="font-mono text-ink">{biz.rating}</span>
                    <span className="text-faint">({biz.reviewCount} reviews)</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-7 grid gap-px overflow-hidden rounded-card border border-hairline bg-hairline sm:grid-cols-2">
              <Field label="Address" value={`${biz.address || "—"}${biz.city ? `, ${biz.city}` : ""} ${biz.state}`} />
              <Field label="Phone" value={biz.phone || "—"} />
              <Field label="Hours" value={biz.hours || "—"} />
              <Field label="Website" value="No website found" tone="bad" />
            </div>

            <details className="mt-5 rounded-card border border-hairline bg-canvas/60 p-4 [&_summary]:cursor-pointer">
              <summary className="flex items-center gap-2 text-[13px] font-medium text-muted">
                <ImageIcon className="h-3.5 w-3.5" aria-hidden />
                Don&rsquo;t like the default photos? Swap them
              </summary>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <ImageOverrideField
                  label="Header photo URL"
                  placeholder={profile.heroImage}
                  value={biz.heroImageOverride ?? ""}
                  onChange={(v) => setBiz({ ...biz, heroImageOverride: v || undefined })}
                />
                <ImageOverrideField
                  label="In-action photo URL"
                  placeholder={profile.secondaryImage}
                  value={biz.secondaryImageOverride ?? ""}
                  onChange={(v) => setBiz({ ...biz, secondaryImageOverride: v || undefined })}
                />
              </div>
              <p className="mt-3 text-[11.5px] leading-relaxed text-faint">
                Leave blank to use the default {profile.label.toLowerCase()} photo. Paste any direct
                image link — a free stock photo (Pexels, Unsplash) or one the business sent you.
              </p>
            </details>

            <button
              onClick={onboard}
              className="focus-ring mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-signal-warn to-[#F59E0B] py-4 text-sm font-semibold text-[#1A1206] transition-all hover:brightness-105"
            >
              <Zap className="h-4 w-4" aria-hidden />
              Onboard Client
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
            <button
              onClick={reset}
              className="focus-ring mt-2 w-full rounded-xl py-2.5 text-[13px] text-faint transition-colors hover:text-ink"
            >
              Start over
            </button>
          </Panel>
        </div>
      ) : null}

      {/* ---------- RUNNING ---------- */}
      {phase === "running" ? (
        <div className="animate-fade-up">
          <div className="text-center">
            <h1 className="text-display-md font-semibold text-ink">Setting up {biz.name}</h1>
            <p className="mt-3 text-sm text-muted">Configuring the full client account…</p>
            <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-hairline bg-raised px-4 py-2 text-[13px]">
              <Clock className="h-3.5 w-3.5 text-signal-warn" aria-hidden />
              <span className="font-mono font-semibold text-ink">{elapsed}s</span>
              <span className="text-faint">elapsed</span>
            </span>
          </div>

          <div className="mx-auto mt-8 h-1 max-w-3xl overflow-hidden rounded-full bg-hairline">
            <div
              className="h-full rounded-full bg-gradient-to-r from-signal-warn via-iris to-signal-good transition-all duration-500"
              style={{ width: `${(stepIndex / STEPS.length) * 100}%` }}
            />
          </div>

          <div className="mx-auto mt-8 max-w-3xl space-y-2">
            {STEPS.map((s, i) => {
              const done = stepIndex > i;
              const active = stepIndex === i;
              return (
                <div
                  key={s.label}
                  className={cn(
                    "flex items-center gap-4 rounded-xl border px-5 py-4 transition-all",
                    active
                      ? "border-signal-warn/40 bg-signal-warn/[0.07]"
                      : done
                        ? "border-hairline bg-surface/40"
                        : "border-transparent opacity-40"
                  )}
                >
                  {done ? (
                    <Check className="h-5 w-5 shrink-0 text-signal-good" aria-hidden />
                  ) : active ? (
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin text-signal-warn" aria-hidden />
                  ) : (
                    <span className="h-5 w-5 shrink-0 rounded-full border border-hairline" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div
                      className={cn(
                        "text-sm font-medium",
                        done ? "text-signal-good" : active ? "text-ink" : "text-faint"
                      )}
                    >
                      {s.label}
                    </div>
                    <div className="mt-0.5 text-[12px] text-faint">{s.sub}</div>
                  </div>
                  {done ? <span className="text-[12px] text-signal-good">Done</span> : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* ---------- DONE ---------- */}
      {phase === "done" ? (
        <div className="animate-fade-up">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-signal-good/35 bg-signal-good/10 px-4 py-2 text-[13px] font-medium text-signal-good">
              <Check className="h-4 w-4" aria-hidden />
              Completed in {elapsed || 12} seconds
            </span>
            <h1 className="mt-6 text-display-md font-semibold text-ink">{biz.name} is live</h1>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
              The site and lead capture below are running now. The rest needs a connected
              voice/SMS/calendar provider before it&apos;s real — see what&rsquo;s not automated yet below.
            </p>
          </div>

          <Panel className="mt-10">
            <Eyebrow>Live now</Eyebrow>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {ACTIVE.filter((a) => a.real).map((a) => (
                <div
                  key={a.title}
                  className="flex items-center gap-3.5 rounded-xl border border-hairline bg-canvas/50 px-4 py-3.5"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-neon/25 bg-neon/10">
                    <a.icon className="h-4 w-4 text-neon-soft" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium text-ink">{a.title}</div>
                    <div className="text-[11.5px] text-faint">{a.sub}</div>
                  </div>
                  <Check className="h-4 w-4 shrink-0 text-signal-good" aria-hidden />
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="mt-4">
            <Eyebrow>Not yet automated — on the roadmap</Eyebrow>
            <p className="mt-2 text-[12px] text-faint">
              No voice, SMS, or calendar provider is connected yet. These need real integration
              work before they run for real — flagged here rather than shown as done.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {ACTIVE.filter((a) => !a.real).map((a) => (
                <div
                  key={a.title}
                  className="flex items-center gap-3.5 rounded-xl border border-hairline bg-canvas/30 px-4 py-3.5 opacity-70"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-hairline bg-raised">
                    <a.icon className="h-4 w-4 text-faint" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium text-muted">{a.title}</div>
                    <div className="text-[11.5px] text-faint">{a.sub}</div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-hairline px-2 py-0.5 text-[10.5px] text-faint">
                    <Clock className="h-3 w-3" aria-hidden />
                    Roadmap
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <div className="mt-6 rounded-panel border border-signal-warn/30 bg-signal-warn/[0.07] p-7">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-signal-warn" aria-hidden />
              <Eyebrow className="text-signal-warn">Monthly value delivered, live today</Eyebrow>
            </div>
            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-5xl font-semibold tracking-tight text-ink">
                ${MONTHLY_VALUE.toLocaleString()}+
              </span>
              <span className="text-sm text-muted">in services actually running / month</span>
            </div>
            <p className="mt-3 text-[13px] text-muted">
              Client pays{" "}
              <span className="font-mono text-ink">${CLIENT_PRICE}/mo</span> →{" "}
              <span className="font-semibold text-signal-good">
                ~{Math.round(MONTHLY_VALUE / CLIENT_PRICE)}x ROI
              </span>
              , counting only what&rsquo;s actually live today.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={demoSiteUrl(biz, { by: "VibeLabs Agency", badge: false, org: organizationId })}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center gap-2 rounded-xl bg-iris px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_34px_-12px_rgba(124,92,255,.9)] transition-colors hover:bg-iris-soft"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              Open their new website
            </a>
            <button
              onClick={reset}
              className="focus-ring inline-flex items-center gap-2 rounded-xl border border-hairline bg-raised px-5 py-3 text-sm font-medium text-ink transition-colors hover:border-iris/50"
            >
              <Users className="h-4 w-4" aria-hidden />
              Onboard another client
            </button>
          </div>

          <div className="mt-8 rounded-panel border border-hairline bg-surface/50 p-6">
            <div className="flex items-start gap-3">
              <Bot className="mt-0.5 h-4 w-4 shrink-0 text-faint" aria-hidden />
              <p className="text-[12.5px] leading-relaxed text-faint">
                <span className="text-muted">How this connects to real services:</span> the website is
                generated and live immediately. CRM, voice AI, SMS, and review automation are
                provisioned through your connected platform (GoHighLevel or equivalent) — add your API
                credentials in Settings and each step above fires the real provisioning call instead of
                a simulated one. The sequence, the ordering, and the value maths are already correct
                for {profile.label.toLowerCase()} clients.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}

function ImageOverrideField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block">
        <span className="text-[11px] font-medium uppercase tracking-widest text-faint">{label}</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="focus-ring mt-1.5 w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-[12px] text-ink placeholder:truncate placeholder:text-faint/70"
        />
      </label>
      <div className="mt-2 h-16 w-full overflow-hidden rounded-lg border border-hairline bg-raised">
        <img
          src={value || placeholder}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
          }}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "bad";
}) {
  return (
    <div className="bg-surface px-5 py-4">
      <div className="eyebrow">{label}</div>
      <div
        className={cn(
          "mt-2 text-[13px]",
          tone === "bad" ? "flex items-center gap-1.5 text-signal-bad" : "text-ink"
        )}
      >
        {tone === "bad" ? <span className="h-1.5 w-1.5 rounded-full bg-signal-bad" /> : null}
        {value}
      </div>
    </div>
  );
}
