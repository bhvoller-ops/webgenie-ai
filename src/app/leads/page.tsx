import { MessageSquare, Phone } from "lucide-react";
import { PageShell } from "@/components/shell";
import { Eyebrow, Pill, SectionHeading, type PillTone } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { updateChatLeadStatusAction } from "@/app/actions";
import { cn } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
  spam: "Spam"
};

const STATUS_TONE: Record<string, PillTone> = {
  new: "warn",
  contacted: "info",
  closed: "good",
  spam: "bad"
};

interface ChatLeadRow {
  id: string;
  business_name: string;
  business_industry: string | null;
  business_phone: string | null;
  visitor_name: string | null;
  visitor_phone: string | null;
  visitor_email: string | null;
  city: string | null;
  service_requested: string | null;
  reason: string | null;
  status: string;
  source: string;
  created_at: string;
}

const SOURCE_LABELS: Record<string, string> = {
  chat: "Chat widget",
  form: "Quote form"
};

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

export default async function LeadsPage() {
  const organizationId = await getOrganizationId();

  let rows: ChatLeadRow[] = [];
  if (organizationId) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("chat_leads")
      .select(
        "id,business_name,business_industry,business_phone,visitor_name,visitor_phone,visitor_email,city,service_requested,reason,status,source,created_at"
      )
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });
    if (error) {
      // Migration 018 (source/visitor_email/city/service_requested) may not
      // be applied yet — fall back so the page still works without it.
      const fallback = await supabase
        .from("chat_leads")
        .select("id,business_name,business_industry,business_phone,visitor_name,visitor_phone,reason,status,created_at")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });
      rows = (fallback.data ?? []).map((r) => ({ ...r, visitor_email: null, city: null, service_requested: null, source: "chat" }));
    } else {
      rows = data ?? [];
    }
  }

  const newCount = rows.filter((r) => r.status === "new").length;

  return (
    <PageShell>
      <SectionHeading
        eyebrow="Generated sites"
        title="Leads"
        description="Every generated site has both a live AI intake chat and a hero quote-request form. Anyone who leaves contact info through either one lands here."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="eyebrow text-ink font-bold">Total leads</div>
          <div className="mt-3 font-mono text-3xl font-semibold tabular-nums text-ink">{rows.length}</div>
        </div>
        <div className="card p-5">
          <div className="eyebrow text-ink font-bold">New</div>
          <div className={cn("mt-3 font-mono text-3xl font-semibold tabular-nums", newCount > 0 ? "text-signal-warn" : "text-ink")}>
            {newCount}
          </div>
        </div>
        <div className="card p-5">
          <div className="eyebrow text-ink font-bold">Closed</div>
          <div className="mt-3 font-mono text-3xl font-semibold tabular-nums text-signal-good">
            {rows.filter((r) => r.status === "closed").length}
          </div>
        </div>
      </div>

      <div className="mt-10 space-y-3">
        {rows.length === 0 ? (
          <div className="rounded-panel border border-dashed border-hairline p-10 text-center">
            <MessageSquare className="mx-auto h-6 w-6 text-muted" aria-hidden />
            <p className="mt-3 text-sm text-ink">
              No leads yet. They'll show up here as soon as a visitor uses the chat widget or submits the quote form
              on a generated site.
            </p>
          </div>
        ) : (
          rows.map((row) => (
            <div key={row.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-ink">{row.visitor_name ?? "Unnamed visitor"}</h3>
                    <Pill tone={STATUS_TONE[row.status]}>{STATUS_LABELS[row.status]}</Pill>
                    <Pill tone={row.source === "form" ? "neon" : "iris"}>{SOURCE_LABELS[row.source] ?? row.source}</Pill>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[12px] text-ink">
                    {row.visitor_phone ? (
                      <a href={`tel:${row.visitor_phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1 hover:text-iris-soft">
                        <Phone className="h-3 w-3" aria-hidden />
                        {row.visitor_phone}
                      </a>
                    ) : null}
                    {row.visitor_email ? <span>{row.visitor_email}</span> : null}
                    {row.city ? <span>{row.city}</span> : null}
                    <span>via {row.business_name}</span>
                    {row.business_industry ? <span>{row.business_industry}</span> : null}
                  </div>
                  {row.service_requested ? (
                    <p className="mt-2 text-[13px] font-medium text-ink">Wants: {row.service_requested}</p>
                  ) : null}
                  {row.reason ? <p className="mt-2 text-[13px] text-muted">{row.reason}</p> : null}
                </div>
                <span className="shrink-0 text-[11px] text-faint">
                  {new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>

              <form action={updateChatLeadStatusAction} className="mt-4 flex flex-wrap items-center gap-2.5">
                <input type="hidden" name="id" value={row.id} />
                <select
                  name="status"
                  defaultValue={row.status}
                  className="rounded-lg border border-hairline bg-white px-3 py-2 text-[13px] text-slate-900"
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <button className="focus-ring rounded-lg border border-hairline bg-raised px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:border-iris/50">
                  Save
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </PageShell>
  );
}
