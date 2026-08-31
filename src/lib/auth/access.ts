import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AccessRole = "admin" | "partner" | "beta" | "guest";

export interface AccessContext {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: { id: string; email?: string } | null;
  role: AccessRole;
  organizationId: string | null; // set when role === "admin"
  membershipRole: string | null; // the raw organization_members.role, e.g. "owner"
  partnerId: string | null; // set when role === "partner"
  betaTesterId: string | null; // set when role === "beta"
}

const ADMIN_ROLES = ["owner", "admin"];

/**
 * Read-only role detection for every gated page/route in the app.
 *
 * Deliberately separate from getUserAndOrganization() in app/actions.ts,
 * which auto-bootstraps a brand-new organization (and makes the caller its
 * owner) the moment any signed-in user with no membership hits it. That
 * behavior is right for a future paying WebGenie agency signing up — wrong
 * here, where a partner or a stray public sign-up must never silently
 * acquire their own workspace just by loading a page. This function only
 * ever reads.
 */
export async function getAccessContext(): Promise<AccessContext> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, role: "guest", organizationId: null, membershipRole: null, partnerId: null, betaTesterId: null };
  }

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membership && ADMIN_ROLES.includes(membership.role)) {
    return {
      supabase,
      user,
      role: "admin",
      organizationId: membership.organization_id,
      membershipRole: membership.role,
      partnerId: null,
      betaTesterId: null
    };
  }

  // Not an admin-tier org member (or not a member at all) — check whether
  // this login is linked to a partner record. Partners are deliberately
  // NOT organization_members rows — see migration 022 for why.
  const { data: partner } = await supabase.from("partners").select("id").eq("user_id", user.id).maybeSingle();

  if (partner) {
    return { supabase, user, role: "partner", organizationId: null, membershipRole: membership?.role ?? null, partnerId: partner.id, betaTesterId: null };
  }

  // beta_testers carries no RLS policies of its own (migration 024) — every
  // read goes through the admin client, scoped by this exact filter, never
  // through the caller's own session.
  const admin = createAdminClient();
  const { data: betaTester } = await admin.from("beta_testers").select("id").eq("user_id", user.id).maybeSingle();

  if (betaTester) {
    return { supabase, user, role: "beta", organizationId: null, membershipRole: membership?.role ?? null, partnerId: null, betaTesterId: betaTester.id };
  }

  return { supabase, user, role: "guest", organizationId: null, membershipRole: membership?.role ?? null, partnerId: null, betaTesterId: null };
}

/**
 * Page guard for Prospector + Dashboard — everything meant for the agency
 * operator only. Redirects unauthenticated visitors to /login and anyone
 * signed in without admin-tier access to "/", which handles every other
 * role gracefully (never call this from "/" itself — that would loop).
 */
export async function requireAdminPage(): Promise<AccessContext & { user: NonNullable<AccessContext["user"]>; organizationId: string }> {
  const ctx = await getAccessContext();
  if (!ctx.user) redirect("/login");
  if (ctx.role !== "admin" || !ctx.organizationId) redirect("/");
  return ctx as AccessContext & { user: NonNullable<AccessContext["user"]>; organizationId: string };
}

/** Page guard for the partner self-service portal. */
export async function requirePartnerPage(): Promise<AccessContext & { user: NonNullable<AccessContext["user"]>; partnerId: string }> {
  const ctx = await getAccessContext();
  if (!ctx.user) redirect("/login");
  if (ctx.role !== "partner" || !ctx.partnerId) redirect("/");
  return ctx as AccessContext & { user: NonNullable<AccessContext["user"]>; partnerId: string };
}

/** Page guard for the beta-tester trial portal. */
export async function requireBetaPage(): Promise<AccessContext & { user: NonNullable<AccessContext["user"]>; betaTesterId: string }> {
  const ctx = await getAccessContext();
  if (!ctx.user) redirect("/login");
  if (ctx.role !== "beta" || !ctx.betaTesterId) redirect("/");
  return ctx as AccessContext & { user: NonNullable<AccessContext["user"]>; betaTesterId: string };
}

/**
 * API-route guard. Returns { response: null } when the caller is an admin;
 * otherwise an already-built NextResponse to return immediately:
 *   const { ctx, response } = await requireAdminApi();
 *   if (response) return response;
 */
type AdminApiContext = AccessContext & { user: NonNullable<AccessContext["user"]>; organizationId: string };

export async function requireAdminApi(): Promise<{ ctx: AdminApiContext; response: NextResponse | null }> {
  const ctx = await getAccessContext();
  if (!ctx.user) {
    return { ctx: ctx as AdminApiContext, response: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  }
  if (ctx.role !== "admin" || !ctx.organizationId) {
    return { ctx: ctx as AdminApiContext, response: NextResponse.json({ error: "Admin access required." }, { status: 403 }) };
  }
  return { ctx: ctx as AdminApiContext, response: null };
}

type BetaApiContext = AccessContext & { user: NonNullable<AccessContext["user"]>; betaTesterId: string };

/** Same shape as requireAdminApi(), for routes only a logged-in beta tester should reach. */
export async function requireBetaApi(): Promise<{ ctx: BetaApiContext; response: NextResponse | null }> {
  const ctx = await getAccessContext();
  if (!ctx.user) {
    return { ctx: ctx as BetaApiContext, response: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  }
  if (ctx.role !== "beta" || !ctx.betaTesterId) {
    return { ctx: ctx as BetaApiContext, response: NextResponse.json({ error: "Beta access required." }, { status: 403 }) };
  }
  return { ctx: ctx as BetaApiContext, response: null };
}
