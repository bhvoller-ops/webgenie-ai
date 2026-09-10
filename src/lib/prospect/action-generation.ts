import type { ActionPriority, OpportunityLevel, Prospect, ProspectActionType } from "@/lib/prospect/types";
import { canCreateRedesignDemo } from "@/lib/prospect/demo-eligibility";

/**
 * P1 Daily Prospecting Queue — deterministic action generation (master
 * prompt section 10). Builds on, but does not modify, the existing P0
 * `computeNextBestAction()` (lib/prospect/next-best-action.ts) — that
 * function's own vocabulary (NextBestActionKey) doesn't distinguish
 * "build a new site" from "redesign an existing one," or know about GMB
 * import/reply review at all, and the master prompt's own P1 vocabulary
 * (section 7) is deliberately richer. Rather than widen NBA's output
 * shape (used today by /prospects/[id], unrelated to the queue, and out
 * of scope — "Do NOT reopen P0.5 unless you discover a real blocking
 * defect"), this is P1's own decision tree, built from the identical
 * underlying signals (opportunity level, completed-audit state, the
 * call_log snapshot) and consistent with NBA's rules in spirit, just
 * expressed in the P1 action vocabulary the queue actually needs.
 */

export type CallLogSnapshot = {
  status:
    | "not_called" | "no_answer" | "not_interested" | "agreed_to_see_site" | "viewed_site"
    | "closed" | "lost" | "left_voicemail" | "sent" | "interested" | "replied" | "meeting_booked";
  followUpDueAt: string | null;
} | null;

export interface ProspectActionInput {
  prospect: Pick<Prospect, "hasWebsite" | "demoUrl" | "status" | "projectId">;
  hasCompletedAudit: boolean;
  opportunityLevel: OpportunityLevel;
  hasPublicProfile: boolean;
  /** True when rating/reviewCount are both missing and no public profile has been imported yet — genuinely too little to act on. */
  isSparseData: boolean;
  callLog: CallLogSnapshot;
}

export interface ProspectActionResult {
  actionType: ProspectActionType;
  reason: string;
  priority: ActionPriority;
  dueAt: string | null;
}

const LEVEL_PRIORITY: Record<OpportunityLevel, ActionPriority> = {
  high: "high",
  medium: "medium",
  low: "low",
  insufficient_evidence: "low"
};

/**
 * Returns null when no active prospecting action should exist — a won,
 * lost, deprioritized, or in-a-scheduled-meeting prospect (section 39:
 * "Won: remove from prospecting queue... Lost: remove active actions").
 * The caller is responsible for completing/clearing any existing PENDING
 * prospect_actions row when this returns null.
 */
export function computeProspectAction(input: ProspectActionInput): ProspectActionResult | null {
  const { prospect, hasCompletedAudit, opportunityLevel, hasPublicProfile, isSparseData, callLog } = input;

  if (prospect.status === "won" || prospect.status === "lost" || prospect.status === "deprioritized" || prospect.status === "meeting") {
    return null;
  }

  // A positive reply needs a human to read it and decide what's next —
  // never auto-advance past it.
  if (callLog?.status === "interested" || callLog?.status === "replied") {
    return { actionType: "REVIEW_REPLY", reason: "This prospect replied — review what they said and decide the next step.", priority: "high", dueAt: null };
  }

  if (callLog?.status === "not_interested" || callLog?.status === "lost") {
    return { actionType: "DEPRIORITIZE", reason: "Already contacted and declined — not worth continued effort.", priority: "low", dueAt: null };
  }
  if (callLog?.status === "closed") {
    return null; // won -- see deriveStatus(), status should already be "won" by this point
  }

  if (callLog?.followUpDueAt) {
    const overdue = new Date(callLog.followUpDueAt).getTime() <= Date.now();
    return {
      actionType: "FOLLOW_UP",
      reason: overdue ? "A follow-up is due (or overdue) on this prospect." : "A follow-up is scheduled for this prospect.",
      priority: overdue ? "high" : "medium",
      dueAt: callLog.followUpDueAt
    };
  }

  const hasBeenContacted = callLog !== null && callLog.status !== "not_called";

  if (!prospect.hasWebsite) {
    if (isSparseData && !hasPublicProfile) {
      return { actionType: "IMPORT_GMB_DATA", reason: "Too little public data yet to know if this is worth pursuing.", priority: "low", dueAt: null };
    }
    if (!prospect.demoUrl) {
      return { actionType: "BUILD_NEW_SITE_DEMO", reason: "No website exists and no demo has been built yet — build the thing you'll show them.", priority: LEVEL_PRIORITY[opportunityLevel], dueAt: null };
    }
    if (!hasBeenContacted) {
      return { actionType: "SEND_DEMO", reason: "The demo is built and ready — share it and make the ask.", priority: LEVEL_PRIORITY[opportunityLevel], dueAt: null };
    }
    return { actionType: "FOLLOW_UP", reason: "Already in contact — keep the conversation moving.", priority: "medium", dueAt: null };
  }

  // Has a website.
  if (!hasCompletedAudit) {
    return { actionType: "RUN_AUDIT", reason: "Website exists but hasn't been audited yet — no evidence to pitch from until it is.", priority: "medium", dueAt: null };
  }

  const redesignEligible = canCreateRedesignDemo(prospect, hasCompletedAudit, opportunityLevel);

  if (redesignEligible && !prospect.demoUrl) {
    return { actionType: "CREATE_REDESIGN_DEMO", reason: "Audit shows real, evidence-backed opportunity — build the redesign demo before pitching.", priority: LEVEL_PRIORITY[opportunityLevel], dueAt: null };
  }
  if (redesignEligible && prospect.demoUrl && !hasBeenContacted) {
    return { actionType: "SEND_DEMO", reason: "The redesign demo is built and ready — share it and make the ask.", priority: LEVEL_PRIORITY[opportunityLevel], dueAt: null };
  }
  if (opportunityLevel === "low" || opportunityLevel === "insufficient_evidence") {
    return { actionType: "DEPRIORITIZE", reason: "Audit is complete but found only minor gaps — low upside for the outreach effort.", priority: "low", dueAt: null };
  }
  if (!hasBeenContacted) {
    return { actionType: "CONTACT", reason: "Audit is complete and found real, evidence-backed gaps — ready to pitch.", priority: LEVEL_PRIORITY[opportunityLevel], dueAt: null };
  }
  return { actionType: "FOLLOW_UP", reason: "Already in contact — keep the conversation moving.", priority: "medium", dueAt: null };
}
