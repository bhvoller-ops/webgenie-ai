import { NextResponse } from "next/server";
import { z } from "zod";
import { createHash, randomBytes } from "node:crypto";
import { requireAdminApi } from "@/lib/auth/access";

/**
 * Admin-only. Replaces the old inviteTeamMemberAction, which had a real
 * bug: it hashed random bytes directly and never captured/returned the raw
 * pre-image, so team_invitations rows it created could never actually be
 * turned into a working /invite/[token] link. This mirrors
 * /api/partners/invite's (correct) pattern instead.
 */
const bodySchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "editor", "viewer"])
});

export async function POST(request: Request) {
  const { ctx, response } = await requireAdminApi();
  if (response) return response;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid email and role are required." }, { status: 400 });
  }

  const { supabase, organizationId } = ctx;
  const email = parsed.data.email.toLowerCase().trim();
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");

  const { error } = await supabase.from("team_invitations").upsert(
    {
      organization_id: organizationId,
      email,
      role: parsed.data.role,
      partner_id: null,
      token_hash: tokenHash,
      invited_by: ctx.user.id,
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      accepted_at: null
    },
    { onConflict: "organization_id,email" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("audit_logs").insert({
    organization_id: organizationId,
    actor_user_id: ctx.user.id,
    action: "team.invited",
    target_type: "email",
    target_id: email,
    metadata: { role: parsed.data.role }
  });

  const origin = new URL(request.url).origin;
  return NextResponse.json({ ok: true, url: `${origin}/invite/${rawToken}`, email });
}
