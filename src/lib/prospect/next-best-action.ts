import type { ActionPriority, NextBestActionKey, OpportunityLevel, Prospect } from "@/lib/prospect/types";

/**
 * Pure, deterministic rules — "Next Best Action should primarily be
 * STATE/RULE DRIVEN. Do not let the LLM randomly decide workflow state"
 * (P0 brief). No AI call anywhere in this file. Evaluated top to bottom;
 * first matching rule wins. Reuses the existing call_log status vocabulary
 * (migration 012) rather than inventing a parallel one.
 */

export type CallLogSnapshot = {
  status: "not_called" | "no_answer" | "not_interested" | "agreed_to_see_site" | "viewed_site" | "closed" | "lost";
  followUpDueAt: string | null;
} | null;

export interface NextBestActionInput {
  prospect: Pick<Prospect, "hasWebsite" | "demoUrl">;
  hasCompletedAudit: boolean;
  opportunityLevel: OpportunityLevel;
  callLog: CallLogSnapshot;
}

export interface NextBestActionResult {
  action: NextBestActionKey;
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

export function computeNextBestAction({
  prospect,
  hasCompletedAudit,
  opportunityLevel,
  callLog
}: NextBestActionInput): NextBestActionResult {
  // A call_log row can exist in "not_called" state just because it was
  // added to the tracker — that's not a real contact attempt yet, so it's
  // treated the same as no row at all for "has this prospect been
  // contacted" purposes below.
  const hasBeenContacted = callLog !== null && callLog.status !== "not_called";

  // Terminal / near-terminal call outcomes short-circuit everything else.
  if (callLog?.status === "closed") {
    return { action: "REVIEW_PROSPECT", reason: "Deal already closed — nothing further needed.", priority: "low", dueAt: null };
  }
  if (callLog?.status === "not_interested" || callLog?.status === "lost") {
    return { action: "DEPRIORITIZE", reason: "Already contacted and declined — not worth continued effort.", priority: "low", dueAt: null };
  }

  if (callLog?.followUpDueAt) {
    const overdue = new Date(callLog.followUpDueAt).getTime() <= Date.now();
    return {
      action: "FOLLOW_UP",
      reason: overdue ? "A follow-up is due (or overdue) on this prospect." : "A follow-up is scheduled for this prospect.",
      priority: overdue ? "high" : "medium",
      dueAt: callLog.followUpDueAt
    };
  }

  // No website: the demo itself is the offer.
  if (!prospect.hasWebsite) {
    if (!prospect.demoUrl) {
      return {
        action: "GENERATE_DEMO",
        reason: "No website exists and no demo has been built yet — build the thing you'll show them.",
        priority: LEVEL_PRIORITY[opportunityLevel],
        dueAt: null
      };
    }
    if (!hasBeenContacted) {
      return {
        action: "CONTACT",
        reason: "Demo is built and nobody has called yet — the pitch is ready.",
        priority: LEVEL_PRIORITY[opportunityLevel],
        dueAt: null
      };
    }
    // A call attempt exists (no_answer / agreed_to_see_site / viewed_site) with no explicit follow-up set yet.
    return {
      action: "FOLLOW_UP",
      reason: "Already in contact — keep the conversation moving.",
      priority: "medium",
      dueAt: null
    };
  }

  // Has a website: needs a real audit before anything else can be recommended.
  if (!hasCompletedAudit) {
    return {
      action: "RUN_AUDIT",
      reason: "Website exists but hasn't been audited yet — no evidence to pitch from until it is.",
      priority: "medium",
      dueAt: null
    };
  }

  if (!hasBeenContacted) {
    if (opportunityLevel === "low") {
      return {
        action: "DEPRIORITIZE",
        reason: "Audit is complete but found only minor gaps — low upside for the outreach effort.",
        priority: "low",
        dueAt: null
      };
    }
    return {
      action: "CONTACT",
      reason: "Audit is complete and found real, evidence-backed gaps — ready to pitch.",
      priority: LEVEL_PRIORITY[opportunityLevel],
      dueAt: null
    };
  }

  return {
    action: "FOLLOW_UP",
    reason: "Already in contact — keep the conversation moving.",
    priority: "medium",
    dueAt: null
  };
}
