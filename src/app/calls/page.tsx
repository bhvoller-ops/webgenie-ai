import { AlertTriangle, Phone, PhoneCall } from "lucide-react";
import { PageShell } from "@/components/shell";
import { Eyebrow, Panel, Pill, SectionHeading, type PillTone } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { addCallLogEntryAction, updateCallLogEntryAction } from "@/app/actions";
import { cn } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  not_called: "Not called",
  no_answer: "No answer",
  not_interested: "Not interested",
  agreed_to_see_site: "Agreed to see site",
  viewed_site: "Viewed site",
  closed: "Closed",
  lost: "Lost"
};

const STATUS_TONE: Record<string, PillTone> = {
  not_called: "neutral",
  no_answer: "neutral",
  not_interested: "bad",
  agreed_to_see_site: "info",
  viewed_site: "iris",
  closed: "good",
  lost: "bad"
};

interface CallLogRow {
  id: string;
  business_name: string;
  phone: string;
  industry: string | null;
  city: string | null;
  state: string | null;
  demo_url: string | null;
  status: string;
  last_contacted_at: string | null;
  follow_up_due_at: string | null;
  notes: string | null;
}

async function getOrganizationId() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  return membership?.organization_id ?? null;
}

function smsHref(phone: string, businessName: string, demoUrl: string | null) {
  const body = demoUrl
    ? `Hi, this is Cassey — here's the site I mentioned for ${businessName}: ${demoUrl}`
    : `Hi, this is Cassey, following up about ${businessName}.`;
  return `sms:${phone.replace(/[^\d+]/g, "")}?body=${encodeURIComponent(body)}`;
}

function followUpTone(dueAt: string | null): { label: string; tone: PillTone; urgent: boolean } {
  if (!dueAt) return { label: "—", tone: "neutral", urgent: false };
  const due = new Date(dueAt);
  const now = new Date();
  const days = Math.ceil((due.getTime() - now.getTime()) / 86400000);
  if (days < 0) return { label: `Overdue ${Math.abs(days)}d`, tone: "bad", urgent: true };
  if (days === 0) return { label: "Due today", tone: "warn", urgent: true };
  return { label: `In ${days}d`, tone: "neutral", urgent: false };
}

export default async function CallsPage() {
  const organizationId = await getOrganizationId();

  let rows: CallLogRow[] = [];
  if (organizationId) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("call_log")
      .select("id,business_name,phone,industry,city,state,demo_url,status,last_contacted_at,follow_up_due_at,notes")
      .eq("organization_id", organizationId)
      .order("follow_up_due_at", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
    rows = data ?? [];
  }

  const dueCount = rows.filter((r) => {
    if (!r.follow_up_due_at) return false;
    return new Date(r.follow_up_due_at).getTime() <= Date.now();
  }).length;

  return (
    <PageShell>
      <SectionHeading
        eyebrow="Motion A pipeline"
        title="Call Tracker"
        description="Log dial outcomes and never lose a day-3 or day-7 follow-up. This is the only thing standing between a call and knowing whether the opener works."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="eyebrow">Total tracked</div>
          <div className="mt-3 font-mono text-3xl font-semibold tabular-nums text-ink">{rows.length}</div>
        </div>
        <div className="card p-5">
          <div className="eyebrow">Follow-ups due</div>
          <div className={cn("mt-3 font-mono text-3xl font-semibold tabular-nums", dueCount > 0 ? "text-signal-warn" : "text-ink")}>
            {dueCount}
          </div>
        </div>
        <div className="card p-5">
          <div className="eyebrow">Closed</div>
          <div className="mt-3 font-mono text-3xl font-semibold tabular-nums text-signal-good">
            {rows.filter((r) => r.status === "closed").length}
          </div>
        </div>
      </div>

      <Panel className="mt-10">
        <Eyebrow className="mb-4">Add a prospect</Eyebrow>
        <form action={addCallLogEntryAction} className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
          <input name="businessName" required placeholder="Business name" className="rounded-lg border border-hairline bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-faint lg:col-span-2" />
          <input name="phone" required placeholder="Phone" className="rounded-lg border border-hairline bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-faint" />
          <input name="industry" placeholder="Industry" className="rounded-lg border border-hairline bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-faint" />
          <input name="city" placeholder="City" className="rounded-lg border border-hairline bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-faint" />
          <input name="state" placeholder="State" className="rounded-lg border border-hairline bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-faint" />
          <input name="demoUrl" placeholder="Demo site URL (optional)" className="rounded-lg border border-hairline bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-faint lg:col-span-4" />
          <button className="focus-ring rounded-lg bg-iris px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-iris-soft lg:col-span-2">
            Add to tracker
          </button>
        </form>
      </Panel>

      <div className="mt-10 space-y-3">
        {rows.length === 0 ? (
          <div className="rounded-panel border border-dashed border-hairline p-10 text-center">
            <PhoneCall className="mx-auto h-6 w-6 text-faint" aria-hidden />
            <p className="mt-3 text-sm text-muted">No prospects tracked yet. Add one above to get started.</p>
          </div>
        ) : (
          rows.map((row) => {
            const follow = followUpTone(row.follow_up_due_at);
            return (
              <div
                key={row.id}
                className={cn(
                  "card p-5",
                  follow.urgent && "border-signal-warn/40 bg-signal-warn/[0.04]"
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-ink">{row.business_name}</h3>
                      <Pill tone={STATUS_TONE[row.status]}>{STATUS_LABELS[row.status]}</Pill>
                      {follow.urgent ? (
                        <Pill tone={follow.tone}>
                          <AlertTriangle className="h-3 w-3" aria-hidden />
                          {follow.label}
                        </Pill>
                      ) : row.follow_up_due_at ? (
                        <Pill tone="neutral">{follow.label}</Pill>
                      ) : null}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[12px] text-muted">
                      <a href={`tel:${row.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1 hover:text-ink">
                        <Phone className="h-3 w-3" aria-hidden />
                        {row.phone}
                      </a>
                      <a href={smsHref(row.phone, row.business_name, row.demo_url)} className="text-iris-soft hover:underline">
                        Text link
                      </a>
                      {row.demo_url ? (
                        <a href={row.demo_url} target="_blank" rel="noopener noreferrer" className="text-neon-soft hover:underline">
                          View site
                        </a>
                      ) : null}
                      {row.industry ? <span>{row.industry}</span> : null}
                      {row.city ? <span>{row.city}{row.state ? `, ${row.state}` : ""}</span> : null}
                    </div>
                  </div>
                </div>

                <form action={updateCallLogEntryAction} className="mt-4 grid gap-2.5 md:grid-cols-[160px_1fr_140px_auto] md:items-center">
                  <input type="hidden" name="id" value={row.id} />
                  <select
                    name="status"
                    defaultValue={row.status}
                    className="rounded-lg border border-hairline bg-surface px-3 py-2 text-[13px] text-ink"
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <input
                    name="notes"
                    defaultValue={row.notes ?? ""}
                    placeholder="Notes…"
                    className="rounded-lg border border-hairline bg-surface px-3 py-2 text-[13px] text-ink placeholder:text-faint"
                  />
                  <select
                    name="followUpDays"
                    defaultValue=""
                    className="rounded-lg border border-hairline bg-surface px-3 py-2 text-[13px] text-ink"
                  >
                    <option value="">No follow-up change</option>
                    <option value="3">Follow up in 3 days</option>
                    <option value="7">Follow up in 7 days</option>
                    <option value="clear">Clear follow-up</option>
                  </select>
                  <button className="focus-ring rounded-lg border border-hairline bg-raised px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:border-iris/50">
                    Save
                  </button>
                </form>
                {row.last_contacted_at ? (
                  <p className="mt-2 text-[11px] text-faint">
                    Last contacted {new Date(row.last_contacted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </PageShell>
  );
}
