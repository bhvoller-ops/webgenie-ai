import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/access";
import { PageShell } from "@/components/shell";
import { Panel, Pill, SectionHeading, type PillTone } from "@/components/ui";
import { openSupportTicketAction } from "@/app/actions";

const STATUS_TONE: Record<string, PillTone> = {
  open: "warn",
  awaiting_member: "iris",
  awaiting_staff: "warn",
  resolved: "good",
  closed: "neutral"
};

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  awaiting_member: "Awaiting you",
  awaiting_staff: "Awaiting reply",
  resolved: "Resolved",
  closed: "Closed"
};

export default async function SupportPage() {
  const { supabase, role, organizationId } = await requireAdminPage();

  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("id, subject, category, status, priority, created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  return (
    <PageShell role={role}>
      <SectionHeading
        title="Get help"
        description="Ticket-based — open one below and we'll reply here. Real people, not a bot."
      />

      <Panel className="mt-8 max-w-xl">
        <form action={openSupportTicketAction} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted" htmlFor="subject">
              Subject
            </label>
            <input
              id="subject"
              name="subject"
              required
              placeholder="What's going on?"
              className="focus-ring w-full rounded-lg border border-hairline bg-raised px-3 py-2.5 text-sm text-ink placeholder:text-faint"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              name="category"
              defaultValue="general"
              className="focus-ring w-full appearance-none rounded-lg border border-hairline bg-raised px-3 py-2.5 text-sm text-ink"
            >
              <option value="general">General</option>
              <option value="billing">Billing</option>
              <option value="technical">Technical</option>
              <option value="guarantee">Guarantee</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted" htmlFor="body">
              Details
            </label>
            <textarea
              id="body"
              name="body"
              required
              rows={4}
              placeholder="The more detail, the faster we can help."
              className="focus-ring w-full rounded-lg border border-hairline bg-raised px-3 py-2.5 text-sm text-ink placeholder:text-faint"
            />
          </div>
          <button
            type="submit"
            className="focus-ring w-full rounded-lg bg-iris px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-iris-soft"
          >
            Open ticket
          </button>
        </form>
      </Panel>

      <div className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Your tickets</h2>
        <div className="mt-3 space-y-2">
          {tickets?.length ? (
            tickets.map((t) => (
              <Link key={t.id} href={`/support/${t.id}`}>
                <Panel className="flex items-center justify-between transition-colors hover:border-iris/50">
                  <div>
                    <p className="text-sm font-medium text-ink">{t.subject}</p>
                    <p className="mt-0.5 text-[12px] text-faint capitalize">
                      {t.category} &middot; {new Date(t.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Pill tone={STATUS_TONE[t.status] ?? "neutral"}>{STATUS_LABEL[t.status] ?? t.status}</Pill>
                </Panel>
              </Link>
            ))
          ) : (
            <p className="text-sm text-faint">No tickets yet.</p>
          )}
        </div>
      </div>
    </PageShell>
  );
}
