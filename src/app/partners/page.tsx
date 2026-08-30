import { Handshake, Users } from "lucide-react";
import { PageShell } from "@/components/shell";
import { Eyebrow, Panel, Pill, SectionHeading, Stat, type PillTone } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { requireAdminPage } from "@/lib/auth/access";
import { addPartnerAction, updatePartnerAction, markCommissionPaidAction, deletePartnerAction, revokeInvitationAction, revokePartnerAccessAction } from "@/app/actions";
import { InvitePartnerButton } from "@/components/invite-partner-button";
import { ConfirmForm } from "@/components/confirm-form";
import { Pagination } from "@/components/pagination";
import { cn } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, PillTone> = {
  active: "good",
  inactive: "neutral",
};

const COMMISSION_LABELS: Record<string, string> = {
  none: "Not yet closed",
  owed: "Owed",
  paid: "Paid",
};

const COMMISSION_TONE: Record<string, PillTone> = {
  none: "neutral",
  owed: "warn",
  paid: "good",
};

interface ReferredDeal {
  id: string;
  business_name: string;
  commission_status: string;
  commission_amount: number | null;
  payment_status?: string;
}

interface PartnerRow {
  id: string;
  name: string;
  contact_email: string | null;
  contact_phone: string | null;
  referral_code: string;
  flat_fee: number;
  status: string;
  notes: string | null;
  user_id: string | null;
  call_log: ReferredDeal[];
}

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

const PAGE_SIZE = 25;

export default async function PartnersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { organizationId } = await requireAdminPage();
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  let partners: PartnerRow[] = [];
  const pendingInviteByPartner = new Map<string, string>(); // partner_id -> invitation id
  {
    const supabase = await createClient();
    const [{ data }, { data: pendingInvites }] = await Promise.all([
      supabase
        .from("partners")
        .select("id,name,contact_email,contact_phone,referral_code,flat_fee,status,notes,user_id,call_log(id,business_name,commission_status,commission_amount,payment_status)")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false }),
      supabase
        .from("team_invitations")
        .select("id,partner_id")
        .eq("organization_id", organizationId)
        .eq("role", "partner")
        .is("accepted_at", null)
        .not("partner_id", "is", null)
    ]);
    partners = (data as unknown as PartnerRow[]) ?? [];
    for (const inv of pendingInvites ?? []) {
      if (inv.partner_id) pendingInviteByPartner.set(inv.partner_id, inv.id);
    }
  }

  const allDeals = partners.flatMap((p) => p.call_log ?? []);
  const totalOwed = allDeals.filter((d) => d.commission_status === "owed").reduce((sum, d) => sum + (d.commission_amount ?? 0), 0);
  const totalPaid = allDeals.filter((d) => d.commission_status === "paid").reduce((sum, d) => sum + (d.commission_amount ?? 0), 0);
  const totalPages = Math.max(1, Math.ceil(partners.length / PAGE_SIZE));
  const pagePartners = partners.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <PageShell role="admin">
      <SectionHeading
        eyebrow="Recurring revenue, one referral at a time"
        title="Partners"
        description="Other agencies and consultants who refer their own clients to WebGenie. Flat fee per closed signup, paid by hand — this just tracks who's owed what."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Partners" value={partners.length} />
        <Stat label="Owed" value={money(totalOwed)} tone={totalOwed > 0 ? "warn" : "ink"} />
        <Stat label="Paid out" value={money(totalPaid)} tone="good" />
      </div>

      <Panel className="mt-10">
        <Eyebrow className="mb-4 text-ink font-bold">Add a partner</Eyebrow>
        <form action={addPartnerAction} className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
          <input name="name" required placeholder="Agency / consultant name" className="rounded-lg border border-hairline bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 lg:col-span-2" />
          <input name="contactEmail" type="email" placeholder="Contact email" className="rounded-lg border border-hairline bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400" />
          <input name="contactPhone" placeholder="Contact phone" className="rounded-lg border border-hairline bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400" />
          <input name="referralCode" placeholder="Referral code (optional)" className="rounded-lg border border-hairline bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400" />
          <input
            name="flatFee"
            type="number"
            step="0.01"
            min="0"
            defaultValue="100"
            placeholder="Flat fee ($)"
            className="rounded-lg border border-hairline bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400"
          />
          <input name="notes" placeholder="Notes (optional)" className="rounded-lg border border-hairline bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 lg:col-span-5" />
          <button className="focus-ring rounded-lg bg-iris px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-iris-soft">
            Add partner
          </button>
        </form>
        <p className="mt-4 text-[12px] text-faint">
          Or send people to <span className="font-mono text-muted">/partner-signup</span> to sign
          themselves up — they land here as <span className="font-medium text-ink">inactive</span> until
          you flip them to Active, so nothing pays out before you've actually seen who signed up.
          No email notifies you when someone does — check back here.
        </p>
      </Panel>

      <div className="mt-10 space-y-4">
        {partners.length === 0 ? (
          <div className="rounded-panel border border-dashed border-hairline p-10 text-center">
            <Handshake className="mx-auto h-6 w-6 text-muted" aria-hidden />
            <p className="mt-3 text-sm text-ink">No partners yet. Add one above, then tag them on a deal in the Call Tracker.</p>
          </div>
        ) : (
          pagePartners.map((partner) => {
            const deals = partner.call_log ?? [];
            const owed = deals.filter((d) => d.commission_status === "owed");
            const paid = deals.filter((d) => d.commission_status === "paid");
            const owedTotal = owed.reduce((sum, d) => sum + (d.commission_amount ?? 0), 0);
            const pendingInviteId = pendingInviteByPartner.get(partner.id);

            return (
              <div key={partner.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-ink">{partner.name}</h3>
                      <Pill tone={STATUS_TONE[partner.status]}>{partner.status}</Pill>
                      {owedTotal > 0 ? <Pill tone="warn">{money(owedTotal)} owed</Pill> : null}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[12px] text-ink">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" aria-hidden />
                        code: <span className="font-mono">{partner.referral_code}</span>
                      </span>
                      {partner.contact_email ? <span>{partner.contact_email}</span> : null}
                      {partner.contact_phone ? <span>{partner.contact_phone}</span> : null}
                      <span>{money(partner.flat_fee)}/signup</span>
                      <span>{deals.length} referred · {paid.length} paid</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {partner.user_id ? (
                      <div className="flex items-center gap-2">
                        <Pill tone="good">Portal access</Pill>
                        <ConfirmForm
                          action={revokePartnerAccessAction}
                          confirmMessage={`Revoke ${partner.name}'s portal login? They'll be signed out and can no longer check their referrals — the partner record itself (referral code, deal history) stays intact and they can be re-invited later.`}
                        >
                          <input type="hidden" name="id" value={partner.id} />
                          <button className="focus-ring rounded-lg border border-hairline bg-raised px-2.5 py-1.5 text-[12px] text-muted transition-colors hover:text-signal-bad">
                            Revoke access
                          </button>
                        </ConfirmForm>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {pendingInviteId ? <Pill tone="warn">Invited — pending</Pill> : null}
                        <InvitePartnerButton partnerId={partner.id} hasEmail={!!partner.contact_email} alreadyInvited={!!pendingInviteId} />
                        {pendingInviteId ? (
                          <form action={revokeInvitationAction}>
                            <input type="hidden" name="invitationId" value={pendingInviteId} />
                            <button className="focus-ring rounded-lg border border-hairline bg-raised px-2.5 py-1.5 text-[12px] text-muted transition-colors hover:text-signal-bad">
                              Revoke
                            </button>
                          </form>
                        ) : null}
                      </div>
                    )}
                    <ConfirmForm action={deletePartnerAction} confirmMessage={`Permanently delete ${partner.name}? Their referred deals stay in Call Tracker but lose the partner attribution.`}>
                      <input type="hidden" name="id" value={partner.id} />
                      <button className="text-[11px] text-faint underline decoration-dotted underline-offset-2 hover:text-signal-bad">
                        Delete partner
                      </button>
                    </ConfirmForm>
                  </div>
                </div>

                <form action={updatePartnerAction} className="mt-4 grid gap-2.5 md:grid-cols-[140px_1fr_140px_auto] md:items-center">
                  <input type="hidden" name="id" value={partner.id} />
                  <input
                    name="flatFee"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={partner.flat_fee}
                    className="rounded-lg border border-hairline bg-white px-3 py-2 text-[13px] text-slate-900"
                  />
                  <input
                    name="notes"
                    defaultValue={partner.notes ?? ""}
                    placeholder="Notes…"
                    className="rounded-lg border border-hairline bg-white px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-400"
                  />
                  <select
                    name="status"
                    defaultValue={partner.status}
                    className="rounded-lg border border-hairline bg-white px-3 py-2 text-[13px] text-slate-900"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <button className="focus-ring rounded-lg border border-hairline bg-raised px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:border-iris/50">
                    Save
                  </button>
                </form>

                {deals.length > 0 ? (
                  <div className="mt-4 space-y-1.5 border-t border-hairline pt-4">
                    {deals.map((deal) => (
                      <div
                        key={deal.id}
                        className={cn(
                          "flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2 text-[12px]",
                          deal.commission_status === "owed" && "bg-signal-warn/[0.06]"
                        )}
                      >
                        <span className="text-ink">{deal.business_name}</span>
                        <div className="flex items-center gap-2">
                          <Pill tone={COMMISSION_TONE[deal.commission_status]}>
                            {deal.commission_amount ? `${money(deal.commission_amount)} · ` : ""}
                            {COMMISSION_LABELS[deal.commission_status]}
                          </Pill>
                          {deal.commission_status === "owed" ? (
                            <form action={markCommissionPaidAction}>
                              <input type="hidden" name="callLogId" value={deal.id} />
                              <button className="focus-ring rounded-md border border-signal-good/35 bg-signal-good/10 px-2.5 py-1 text-[11px] font-medium text-signal-good transition-colors hover:bg-signal-good/20">
                                Mark paid
                              </button>
                            </form>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/partners" />
    </PageShell>
  );
}
