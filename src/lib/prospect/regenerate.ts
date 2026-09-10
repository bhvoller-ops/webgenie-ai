import type { SupabaseClient } from "@supabase/supabase-js";
import type { WebsiteIntelligenceOutput } from "@/lib/intelligence/types";
import { generateOpportunityBrief } from "@/lib/prospect/opportunity-brief";
import { computeNextBestAction, type CallLogSnapshot } from "@/lib/prospect/next-best-action";
import { computeOpportunityLevel } from "@/lib/prospect/opportunity-level";
import { syncProspectAction } from "@/lib/prospect/action-sync";
import type { CallLogSnapshot as P1CallLogSnapshot } from "@/lib/prospect/action-generation";
import { logActivity } from "@/lib/prospect/activity";
import type { Prospect } from "@/lib/prospect/types";

/**
 * The one place a prospect's Opportunity Brief + Next Best Action get
 * (re)computed. Called after any state change that could matter (audit
 * completes, demo generated, prospect contacted) and on an explicit
 * "Refresh" click — never on every page read (see getOpportunityBrief in
 * lib/data/provider.ts, which just reads the persisted row).
 *
 * Brief regeneration is skipped when nothing material changed since last
 * time (same input_fingerprint) unless `force` is set — "do not regenerate
 * on every page load" from the P0 brief. Next Best Action is cheap and
 * purely rule-based, so it's always recomputed; it has its own real state
 * inputs (call_log) that can change independently of the audit/demo state
 * the Brief cares about.
 */
export async function regenerateProspectIntelligence(
  supabase: SupabaseClient,
  prospect: Prospect,
  opts: { force?: boolean } = {}
): Promise<void> {
  let intelligence: WebsiteIntelligenceOutput | null = null;
  let hasCompletedAudit = false;

  if (prospect.projectId) {
    const { data: job } = await supabase
      .from("analysis_jobs")
      .select("id, analysis_outputs(output)")
      .eq("project_id", prospect.projectId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (job) {
      hasCompletedAudit = true;
      const output = Array.isArray(job.analysis_outputs) ? job.analysis_outputs[0] : job.analysis_outputs;
      intelligence = (output as { output?: WebsiteIntelligenceOutput } | undefined)?.output ?? null;
    }
  }

  const { data: callLogRow } = await supabase
    .from("call_log")
    .select("status, follow_up_due_at")
    .eq("prospect_id", prospect.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const callLog: CallLogSnapshot = callLogRow
    ? { status: callLogRow.status as NonNullable<CallLogSnapshot>["status"], followUpDueAt: callLogRow.follow_up_due_at }
    : null;

  const { data: existingBrief } = await supabase
    .from("opportunity_briefs")
    .select("version, input_fingerprint")
    .eq("prospect_id", prospect.id)
    .maybeSingle();

  const draft = generateOpportunityBrief(prospect, intelligence, existingBrief?.version ?? 0);
  const materiallyChanged = !existingBrief || existingBrief.input_fingerprint !== draft.inputFingerprint;

  if (opts.force || materiallyChanged) {
    await supabase.from("opportunity_briefs").upsert(
      {
        prospect_id: prospect.id,
        version: draft.version,
        opportunity_level: draft.opportunityLevel,
        summary: draft.summary,
        reasons_to_contact: draft.reasonsToContact,
        top_findings: draft.topFindings,
        recommended_offer: draft.recommendedOffer,
        recommended_offer_reason: draft.recommendedOfferReason,
        secondary_opportunities: draft.secondaryOpportunities,
        sales_angle: draft.salesAngle,
        suggested_opener: draft.suggestedOpener,
        confidence: draft.confidence,
        evidence_references: draft.evidenceReferences,
        input_fingerprint: draft.inputFingerprint,
        generated_at: draft.generatedAt,
        updated_at: new Date().toISOString()
      },
      { onConflict: "prospect_id" }
    );
  }

  const opportunityLevel = computeOpportunityLevel(prospect, intelligence);
  const nba = computeNextBestAction({ prospect, hasCompletedAudit, opportunityLevel, callLog });
  await supabase.from("next_best_actions").upsert(
    {
      prospect_id: prospect.id,
      action: nba.action,
      reason: nba.reason,
      priority: nba.priority,
      due_at: nba.dueAt,
      computed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    { onConflict: "prospect_id" }
  );

  // `status` is a derived reflection of real state, computed in this one
  // place rather than each action route remembering to set it correctly.
  const status = deriveStatus({ prospect, hasCompletedAudit, callLog });
  if (status !== prospect.status) {
    await supabase.from("prospects").update({ status, updated_at: new Date().toISOString() }).eq("id", prospect.id);

    // Log the transitions that matter as real history (P1 section 13) —
    // only on the actual transition, not on every regenerate call while
    // already in that state.
    if (status === "won") {
      await logActivity(supabase, { organizationId: prospect.organizationId, prospectId: prospect.id, activityType: "PROSPECT_WON", summary: "Marked as won." });
    } else if (status === "lost") {
      await logActivity(supabase, { organizationId: prospect.organizationId, prospectId: prospect.id, activityType: "PROSPECT_LOST", summary: "Marked as lost." });
    } else if (status === "meeting") {
      await logActivity(supabase, { organizationId: prospect.organizationId, prospectId: prospect.id, activityType: "MEETING_LOGGED", summary: "Meeting booked." });
    }
  }

  // Audit completion happens asynchronously (the Railway worker, outside
  // this app's request cycle) — detected here, the first time this
  // function runs after it finished, by checking whether it's already
  // been logged for this project rather than assuming "just happened."
  if (hasCompletedAudit && prospect.projectId) {
    const { data: alreadyLogged } = await supabase
      .from("prospect_activities")
      .select("id")
      .eq("prospect_id", prospect.id)
      .eq("activity_type", "AUDIT_COMPLETED")
      .contains("metadata", { projectId: prospect.projectId })
      .maybeSingle();
    if (!alreadyLogged) {
      await logActivity(supabase, {
        organizationId: prospect.organizationId,
        prospectId: prospect.id,
        activityType: "AUDIT_COMPLETED",
        summary: typeof intelligence?.overallScore === "number" ? `Audit completed — scored ${intelligence.overallScore}/100.` : "Audit completed.",
        metadata: { projectId: prospect.projectId }
      });
    }
  }

  // P1: reconcile the Daily Queue's own persisted action item. Uses the
  // freshly-derived `status` (not the stale `prospect.status` param) so a
  // won/lost/meeting transition that just happened this same call
  // correctly suppresses the queue item immediately, not one page load
  // later.
  const p1CallLog: P1CallLogSnapshot = callLog
    ? { status: callLog.status, followUpDueAt: callLog.followUpDueAt }
    : null;
  await syncProspectAction(supabase, prospect.organizationId, prospect.id, {
    prospect: { hasWebsite: prospect.hasWebsite, demoUrl: prospect.demoUrl, status, projectId: prospect.projectId },
    hasCompletedAudit,
    opportunityLevel,
    hasPublicProfile: Boolean(prospect.publicProfile),
    isSparseData: !prospect.rating && !prospect.reviewCount && !prospect.publicProfile,
    callLog: p1CallLog
  });
}

function deriveStatus(input: {
  prospect: Pick<Prospect, "demoUrl" | "status">;
  hasCompletedAudit: boolean;
  callLog: CallLogSnapshot;
}): Prospect["status"] {
  // A manual "deprioritize" is a deliberate override — sticky until a real
  // contact event (a call logged, a deal closed/lost) supersedes it.
  if (input.prospect.status === "deprioritized" && !input.callLog) return "deprioritized";
  if (input.callLog?.status === "closed") return "won";
  if (input.callLog?.status === "lost" || input.callLog?.status === "not_interested") return "lost";
  // A booked meeting takes precedence over a merely-scheduled follow-up —
  // there's nothing to prospect until the meeting happens.
  if (input.callLog?.status === "meeting_booked") return "meeting";
  if (input.callLog?.followUpDueAt) return "follow_up";
  if (input.callLog && input.callLog.status !== "not_called") return "contacted";
  if (input.prospect.demoUrl) return "demo_ready";
  if (input.hasCompletedAudit) return "audited";
  return "new";
}
