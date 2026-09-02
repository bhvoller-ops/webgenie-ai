import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The VibeLabs 60-day client guarantee: land one client within 60 days of
 * joining, or get free, extended 1:1 support until you do (never a refund —
 * see PRODUCT.md's exact wording in the VibeLabs-v2 project).
 *
 * Read-time computation, not event-driven — matches this codebase's
 * existing "deterministic, derived view" pattern rather than adding new
 * trigger/event plumbing. A member's first "closed" call_log deal after
 * their guarantee_started_at satisfies it; call_log.organization_id is
 * already the correct, proven owner chain (see migration 012), no new join
 * model needed.
 */

export type GuaranteeStatus = "pending" | "met" | "extended_support";

export interface GuaranteeState {
  status: GuaranteeStatus;
  startedAt: string | null;
  deadlineAt: string | null;
  firstClientWonAt: string | null;
  /** Negative once past the deadline while still pending. Null if the
   * guarantee clock hasn't started (not a VibeLabs org, or not yet
   * activated). */
  daysRemaining: number | null;
}

const PENDING_NO_CLOCK: GuaranteeState = {
  status: "pending",
  startedAt: null,
  deadlineAt: null,
  firstClientWonAt: null,
  daysRemaining: null,
};

/**
 * Computes the current guarantee state for an organization and, if it has
 * newly resolved (a client just won, or the deadline just passed with none
 * won), persists that onto organizations.guarantee_status /
 * first_client_won_at so it stays a fast, indexable read next time (e.g.
 * for the guarantee_risk support-ticket flag in Phase 7) rather than
 * requiring this recomputation on every read.
 */
export async function getGuaranteeState(
  supabase: SupabaseClient,
  organizationId: string
): Promise<GuaranteeState> {
  const { data: org, error } = await supabase
    .from("organizations")
    .select("guarantee_started_at, guarantee_deadline_at, guarantee_status, first_client_won_at")
    .eq("id", organizationId)
    .single();

  if (error || !org || !org.guarantee_started_at) {
    return PENDING_NO_CLOCK;
  }

  const base = {
    startedAt: org.guarantee_started_at as string,
    deadlineAt: org.guarantee_deadline_at as string,
  };
  const daysRemaining = Math.ceil(
    (new Date(base.deadlineAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  // Already resolved and recorded — trust the stored value rather than
  // recomputing. A member who won a client and later goes quiet shouldn't
  // "lose" guarantee-met status on a later read.
  if (org.guarantee_status === "met" && org.first_client_won_at) {
    return { status: "met", ...base, firstClientWonAt: org.first_client_won_at as string, daysRemaining };
  }
  if (org.guarantee_status === "extended_support") {
    return { status: "extended_support", ...base, firstClientWonAt: null, daysRemaining };
  }

  const { data: won } = await supabase
    .from("call_log")
    .select("id, created_at")
    .eq("organization_id", organizationId)
    .eq("status", "closed")
    .gte("created_at", base.startedAt)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (won) {
    await supabase
      .from("organizations")
      .update({ guarantee_status: "met", first_client_won_at: won.created_at })
      .eq("id", organizationId)
      .eq("guarantee_status", "pending"); // don't clobber a status set concurrently
    return { status: "met", ...base, firstClientWonAt: won.created_at as string, daysRemaining };
  }

  if (daysRemaining < 0) {
    await supabase
      .from("organizations")
      .update({ guarantee_status: "extended_support" })
      .eq("id", organizationId)
      .eq("guarantee_status", "pending");
    return { status: "extended_support", ...base, firstClientWonAt: null, daysRemaining };
  }

  return { status: "pending", ...base, firstClientWonAt: null, daysRemaining };
}
