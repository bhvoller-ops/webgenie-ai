import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/auth/access";
import { PageShell } from "@/components/shell";
import { Eyebrow, Panel, Pill } from "@/components/ui";
import { replySupportTicketAction, updateSupportTicketStatusAction } from "@/app/actions";
import { cn } from "@/lib/format";

export default async function SupportTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase, role, user } = await requireAdminPage();
  const { id } = await params;

  const { data: ticket } = await supabase
    .from("support_tickets")
    .select("id, subject, category, status, priority, organization_id")
    .eq("id", id)
    .maybeSingle();
  if (!ticket) notFound();

  const { data: messages } = await supabase
    .from("support_ticket_messages")
    .select("id, author_type, body, created_at")
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });

  const { data: isStaff } = await supabase.rpc("is_platform_staff", { uid: user.id });
  const closed = ticket.status === "resolved" || ticket.status === "closed";

  return (
    <PageShell role={role}>
      <Eyebrow>{ticket.category}</Eyebrow>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-display-sm font-semibold text-ink">{ticket.subject}</h1>
        <Pill tone={ticket.priority === "guarantee_risk" ? "bad" : "neutral"}>{ticket.status}</Pill>
      </div>

      <div className="mt-8 space-y-3">
        {messages?.map((m) => (
          <Panel
            key={m.id}
            className={cn("max-w-2xl", m.author_type === "staff" ? "border-iris/30 bg-iris/[0.04]" : "")}
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-faint">
              {m.author_type === "staff" ? "WebGenie support" : "You"} &middot;{" "}
              {new Date(m.created_at).toLocaleString()}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{m.body}</p>
          </Panel>
        ))}
      </div>

      {!closed ? (
        <Panel className="mt-6 max-w-2xl">
          <form action={replySupportTicketAction} className="space-y-3">
            <input type="hidden" name="ticketId" value={ticket.id} />
            <textarea
              name="body"
              required
              rows={4}
              placeholder="Write a reply…"
              className="focus-ring w-full rounded-lg border border-hairline bg-raised px-3 py-2.5 text-sm text-ink placeholder:text-faint"
            />
            <div className="flex items-center justify-between gap-3">
              <button
                type="submit"
                className="focus-ring rounded-lg bg-iris px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-iris-soft"
              >
                Send reply
              </button>
              {isStaff ? (
                <div className="flex gap-2">
                  <form action={updateSupportTicketStatusAction}>
                    <input type="hidden" name="ticketId" value={ticket.id} />
                    <input type="hidden" name="status" value="resolved" />
                    <button className="focus-ring rounded-lg border border-hairline px-3 py-2 text-xs text-muted hover:text-ink">
                      Mark resolved
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          </form>
        </Panel>
      ) : (
        <p className="mt-6 text-sm text-faint">This ticket is {ticket.status}.</p>
      )}
    </PageShell>
  );
}
