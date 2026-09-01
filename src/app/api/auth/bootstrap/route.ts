import { NextResponse } from "next/server";
import { getAccessContext } from "@/lib/auth/access";

/**
 * Called once, right after a brand-new signup's first successful sign-in
 * (both /signup's email/password path and /auth/callback's Google OAuth
 * path) — creates the new organization + owner membership via the same
 * bootstrap_organization RPC actions.ts's getUserAndOrganization() already
 * uses for any signed-in stranger with no membership (migration 013).
 *
 * Doing this explicitly at signup, rather than waiting for it to happen
 * incidentally the first time some other server action runs, means a fresh
 * signup lands on /projects/new immediately instead of hitting /'s "no
 * access yet" screen — getAccessContext() (used by every page redirect,
 * including /) is deliberately read-only and never bootstraps on its own.
 *
 * Only fires for role "guest" — genuinely no organization_members,
 * partners, or beta_testers row at all. This matters because /login's new
 * "Continue with Google" button reaches this same OAuth callback for EVERY
 * sign-in, not just a first one: without this guard, a partner or beta
 * tester signing in with Google would silently get handed a brand-new
 * admin organization alongside their existing role — exactly the
 * "never add a partner login to organization_members" boundary CLAUDE.md's
 * known-traps section warns about, just reached by a different door.
 */
export async function POST() {
  const { user, role, supabase } = await getAccessContext();

  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  if (role !== "guest") {
    // Already an admin (existing org), a partner, or a beta tester —
    // nothing to bootstrap, and definitely nothing to overwrite.
    return NextResponse.json({ ok: true, skipped: true });
  }

  const { data: organizationId, error } = await supabase.rpc("bootstrap_organization");
  if (error || !organizationId) {
    return NextResponse.json({ error: error?.message ?? "Unable to create workspace." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, organizationId });
}
