import { Handshake, Users } from "lucide-react";
import { PageShell } from "@/components/shell";
import { Eyebrow, Panel, Pill, SectionHeading, Stat, type PillTone } from "@/components/ui";
import { CopyButton } from "@/components/copy-button";
import { ChangePasswordForm } from "@/components/change-password-form";
import { requirePartnerPage } from "@/lib/auth/access";
import { updatePartnerContactAction } from "@/app/actions";
import { SITE_ORIGIN } from "@/lib/site-url";
import { cn } from "@/lib/format";

export const dynamic = "force-dynamic";

const COMMISSION_LABELS: Record<string, string> = {
  none: "Not yet closed",
  owed: "Owed",
  paid: "Paid"
};

const COMMISSION_TONE: Record<string, PillTone> = {
  none: "neutral",
  owed: "warn",
  paid: "good"
};

interface ReferredDeal {
  id: string;
  business_name: string;
  commission_status: string;
  commission_amount: number | null;
  created_at: string;
}

interface PartnerSelf {
  id: string;
  name: string;
  referral_code: string;
  flat_fee: number;
  status: string;
  contact_phone: string | null;
}

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

// Partner-role-only self-service view — a partner's login is deliberately
// NOT an organization_members row (see migration 022), so this reads
// directly off the partner's own row + their own referred deals rather
// than through getUserAndOrganization()/any org-scoped query.
export default async function PartnerPortalPage() {
  const { supabase, partnerId } = await requirePartnerPage();

  const { data: partner } = await supabase
    .from("partners")
    .select("id,name,referral_code,flat_fee,status,contact_phone")
    .eq("id", partnerId)
    .single<PartnerSelf>();

  const { data: dealsData } = await supabase
    .from("call_log")
    .select("id,business_name,commission_status,commission_amount,created_at")
    .eq("partner_id", partnerId)
    .order("created_at", { ascending: false });

  const deals: ReferredDeal[] = dealsData ?? [];
  const owed = deals.filter((d) => d.commission_status === "owed");
  const paid = deals.filter((d) => d.commission_status === "paid");
  const owedTotal = owed.reduce((sum, d) => sum + (d.commission_amount ?? 0), 0);
  const paidTotal = paid.reduce((sum, d) => sum + (d.commission_amount ?? 0), 0);

  if (!partner) {
    return (
      <PageShell role="partner">
        <Panel className="mt-10">
          <p className="text-sm text-ink">Your partner record couldn&apos;t be found. Contact the workspace owner.</p>
        </Panel>
      </PageShell>
    );
  }

  const referralLink = `${SITE_ORIGIN}/get-started?ref=${partner.referral_code}`;

  return (
    <PageShell role="partner">
      <SectionHeading
        title={`Welcome, ${partner.name}`}
        description="Every client you refer that closes shows up here, along with what you're owed and what's already been paid."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Referred" value={deals.length} />
        <Stat label="Owed to you" value={money(owedTotal)} tone={owedTotal > 0 ? "warn" : "ink"} />
        <Stat label="Paid out to you" value={money(paidTotal)} tone="good" />
      </div>

      <Panel className="mt-10">
        <Eyebrow className="mb-4 text-ink font-bold">Your referral link</Eyebrow>
        <div className="flex flex-wrap items-center gap-3">
          <code className="rounded-lg border border-hairline bg-raised px-3 py-2 text-[13px] text-ink">{referralLink}</code>
          <CopyButton text={referralLink} label="Copy link" />
        </div>
        <p className="mt-3 text-[12px] text-faint">
          {money(partner.flat_fee)} per closed signup · Status: <span className="font-medium text-ink">{partner.status}</span>
        </p>
      </Panel>

      <div className="mt-10 space-y-4">
        {deals.length === 0 ? (
          <div className="rounded-panel border border-dashed border-hairline p-10 text-center">
            <Handshake className="mx-auto h-6 w-6 text-muted" aria-hidden />
            <p className="mt-3 text-sm text-ink">No referrals yet. Share your link above to get started.</p>
          </div>
        ) : (
          <div className="card p-5">
            <div className="flex items-center gap-2 text-[12px] text-ink">
              <Users className="h-3.5 w-3.5" aria-hidden />
              {deals.length} referred · {paid.length} paid
            </div>
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
                  <Pill tone={COMMISSION_TONE[deal.commission_status]}>
                    {deal.commission_amount ? `${money(deal.commission_amount)} · ` : ""}
                    {COMMISSION_LABELS[deal.commission_status]}
                  </Pill>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Panel className="mt-10">
        <Eyebrow className="mb-4 text-ink font-bold">Account</Eyebrow>
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-[12px] text-muted">Contact phone (shown to the WebGenie team)</p>
            <form action={updatePartnerContactAction} className="flex flex-wrap items-end gap-3">
              <input
                name="contactPhone"
                defaultValue={partner.contact_phone ?? ""}
                placeholder="(555) 555-5555"
                className="rounded-lg border border-hairline bg-white px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-400"
              />
              <button className="focus-ring rounded-lg border border-hairline bg-raised px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:border-iris/50">
                Save
              </button>
            </form>
          </div>
          <div className="border-t border-hairline pt-5">
            <p className="mb-2 text-[12px] text-muted">Password</p>
            <ChangePasswordForm />
          </div>
        </div>
      </Panel>
    </PageShell>
  );
}
