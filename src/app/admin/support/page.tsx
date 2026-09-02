import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/access";
import { PageShell } from "@/components/shell";
import { Panel, Pill, SectionHeading, type PillTone } from "@/components/ui";

const STATUS_TONE: Record<string, PillTone> = {
  open: "warn",
  awaiting_member: "iris",
  awaiting_staff: "warn",
  resolved: "good",
  closed: "neutral"
};

/**
 * Cross-org staff queue — is_platform_staff() (migration 031) both gates
 * this page and scopes the underlying RLS, so the query below only ever
 * returns every org's tickets when the signed-in user really is staff;
 * for anyone else it silently returns just their own org's (same as
 * /support), which is why this page still explicitly redirects non-staff
 * away rather than relying on RLS alone to make it feel gated.
 */
export default async function AdminSupportPage() {
  const { supabase, role, user } = await requireAdminPage();

  const { data: isStaff } = await supabase.rpc("is_platform_staff", { uid: user.id });
  if (!isStaff) redirect("/support");

  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("id, subject, category, status, priority, created_at, organization_id, organizations(name)")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <PageShell role={role}>
      <SectionHeading
        eyebrow="Admin"
        title="Support queue"
        description="Every member's tickets, guarantee-risk ones first."
      />
      <div className="mt-8 space-y-2">
        {tickets?.length ? (
          tickets.map((t) => (
            <Link key={t.id} href={`/support/${t.id}`}>
              <Panel className="flex items-center justify-between gap-4 transition-colors hover:border-iris/50">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{t.subject}</p>
                  <p className="mt-0.5 text-[12px] text-faint">
                    {(t.organizations as unknown as { name: string } | null)?.name ?? "Unknown org"} &middot;{" "}
                    {t.category} &middot; {new Date(t.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {t.priority === "guarantee_risk" ? <Pill tone="bad">Guarantee risk</Pill> : null}
                  <Pill tone={STATUS_TONE[t.status] ?? "neutral"}>{t.status}</Pill>
                </div>
              </Panel>
            </Link>
          ))
        ) : (
          <p className="text-sm text-faint">No tickets.</p>
        )}
      </div>
    </PageShell>
  );
}
