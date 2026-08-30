import { NextResponse } from "next/server";
import { z } from "zod";
import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Public — the invitee has no account yet, so this can't go through
 * requireAdminApi. The token itself is the only credential; everything
 * this route does runs through the admin (service-role) client, since an
 * anonymous caller can't read team_invitations under RLS ("admins manage
 * invitations", 011) and can't insert into organization_members or update
 * partners.user_id either.
 *
 * Mirrors /api/auth/create-account's pattern (pre-confirmed account, no
 * email sent) but gated by a real invite token instead of being wide open.
 */
const bodySchema = z.object({
  token: z.string().min(32),
  password: z.string().min(8).max(72)
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter an 8+ character password." }, { status: 400 });
  }

  const admin = createAdminClient();
  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");

  const { data: invitation, error: lookupError } = await admin
    .from("team_invitations")
    .select("id,organization_id,email,role,partner_id,expires_at,accepted_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (lookupError) return NextResponse.json({ error: lookupError.message }, { status: 400 });
  if (!invitation) return NextResponse.json({ error: "This invite link is invalid." }, { status: 404 });
  if (invitation.accepted_at) return NextResponse.json({ error: "This invite has already been used — sign in instead." }, { status: 400 });
  if (new Date(invitation.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "This invite link has expired — ask for a new one." }, { status: 400 });
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: invitation.email,
    password: parsed.data.password,
    email_confirm: true
  });

  if (createError || !created.user) {
    const message = (createError?.message ?? "").toLowerCase().includes("already been registered")
      ? "An account with this email already exists — sign in instead, then ask the workspace owner to grant access."
      : createError?.message ?? "Unable to create account.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (invitation.role === "partner") {
    // Deliberately NOT an organization_members row — see migration 022.
    const { error: linkError } = await admin.from("partners").update({ user_id: created.user.id }).eq("id", invitation.partner_id);
    if (linkError) return NextResponse.json({ error: linkError.message }, { status: 400 });
  } else {
    const { error: memberError } = await admin
      .from("organization_members")
      .insert({ organization_id: invitation.organization_id, user_id: created.user.id, role: invitation.role });
    if (memberError) return NextResponse.json({ error: memberError.message }, { status: 400 });
  }

  await admin.from("team_invitations").update({ accepted_at: new Date().toISOString() }).eq("id", invitation.id);

  return NextResponse.json({ ok: true, role: invitation.role, email: invitation.email });
}
