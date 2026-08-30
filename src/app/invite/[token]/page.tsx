import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { AcceptInviteForm } from "./accept-invite-form";

export const dynamic = "force-dynamic";

// Public — the invitee has no account yet. Validated with the admin
// (service-role) client since RLS on team_invitations only allows
// org admins to read it (011) — an anonymous visitor can't.
export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const admin = createAdminClient();
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const { data: invitation } = await admin
    .from("team_invitations")
    .select("email,role,expires_at,accepted_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  const valid = invitation && !invitation.accepted_at && new Date(invitation.expires_at).getTime() > Date.now();

  if (!valid) {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">WebGenie AI</p>
          <h1 className="mt-3 text-2xl font-semibold">Invite not valid</h1>
          <p className="mt-2 text-sm text-slate-400">
            This invite link is invalid, already used, or has expired. Ask whoever invited you for a new one.
          </p>
          <a href="/login" className="mt-6 inline-block text-sm text-indigo-300 underline decoration-dotted underline-offset-4">
            Go to sign in
          </a>
        </section>
      </main>
    );
  }

  return <AcceptInviteForm token={token} email={invitation.email} role={invitation.role} />;
}
