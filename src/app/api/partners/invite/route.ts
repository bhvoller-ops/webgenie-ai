import { NextResponse } from "next/server";
import { z } from "zod";
import { createHash, randomBytes } from "node:crypto";
import { requireAdminApi } from "@/lib/auth/access";

/**
 * Admin-only. Generates a portal-login invite for one existing partner row,
 * reusing team_invitations (the same table + accept flow as agency-staff
 * invites — see migration 022) but with role: "partner" and partner_id set,
 * so /invite/[token]/accept knows to link the new login to this partner
 * instead of creating an organization_members row.
 *
 * Returns the raw invite link once — only the hash is stored, same pattern
 * as inviteTeamMemberAction in app/actions.ts.
 */
const bodySchema = z.object({
  partnerId: z.string().uuid(),
  email: z.string().email().optional()
});

export async function POST(request: Request) {
  const { ctx, response } = await requireAdminApi();
  if (response) return response;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid partner is required." }, { status: 400 });
  }

  const { supabase, organizationId } = ctx;
  const { data: partner, error: partnerError } = await supabase
    .from("partners")
    .select("id,name,contact_email,user_id")
    .eq("id", parsed.data.partnerId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (partnerError) return NextResponse.json({ error: partnerError.message }, { status: 400 });
  if (!partner) return NextResponse.json({ error: "Partner not found." }, { status: 404 });
  if (partner.user_id) {
    return NextResponse.json({ error: `${partner.name} already has portal access.` }, { status: 400 });
  }

  const email = (parsed.data.email || partner.contact_email || "").toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ error: "This partner has no contact email on file — add one first." }, { status: 400 });
  }

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");

  const { error: inviteError } = await supabase.from("team_invitations").upsert(
    {
      organization_id: organizationId,
      email,
      role: "partner",
      partner_id: partner.id,
      token_hash: tokenHash,
      invited_by: ctx.user!.id,
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      accepted_at: null
    },
    { onConflict: "organization_id,email" }
  );

  if (inviteError) return NextResponse.json({ error: inviteError.message }, { status: 400 });

  const origin = new URL(request.url).origin;
  return NextResponse.json({ ok: true, url: `${origin}/invite/${rawToken}`, email });
}
