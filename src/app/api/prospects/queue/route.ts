import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/access";
import { sortQueueActions, isActionDueNow } from "@/lib/prospect/queue";
import { PROSPECT_ACTION_LABELS, type OpportunityLevel, type ProspectActionType, type ActionPriority } from "@/lib/prospect/types";

/**
 * The P1 Daily Prospecting Queue's data source — GET only, read-only.
 * Joins the persisted prospect_actions (this org's active queue items)
 * with each prospect's own summary fields and current Opportunity Brief,
 * then orders with the same deterministic scoring the queue always uses
 * (lib/prospect/queue.ts) — never a second, inconsistent sort here.
 */
export interface QueueItem {
  actionId: string;
  prospectId: string;
  businessName: string;
  industry: string | null;
  city: string | null;
  state: string | null;
  opportunityLevel: OpportunityLevel | null;
  actionType: ProspectActionType;
  actionLabel: string;
  priority: ActionPriority;
  reason: string;
  dueAt: string | null;
  status: "PENDING" | "SNOOZED";
  evidenceSummary: string | null;
}

export interface QueueSummary {
  newToReview: number;
  readyToContact: number;
  followUpsDue: number;
  demosReady: number;
  meetingsScheduled: number;
}

export async function GET() {
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId } = ctx;

  const { data: actionRows } = await supabase
    .from("prospect_actions")
    .select("id, prospect_id, action_type, priority, reason, due_at, status, prospects(business_name, industry, city, state)")
    .eq("organization_id", organizationId)
    .in("status", ["PENDING", "SNOOZED"]);

  const prospectIds = (actionRows ?? []).map((r) => r.prospect_id);
  const briefByProspectId = new Map<string, { opportunity_level: OpportunityLevel; summary: string }>();
  if (prospectIds.length > 0) {
    const { data: briefs } = await supabase
      .from("opportunity_briefs")
      .select("prospect_id, opportunity_level, summary")
      .in("prospect_id", prospectIds);
    for (const b of briefs ?? []) {
      briefByProspectId.set(b.prospect_id as string, { opportunity_level: b.opportunity_level as OpportunityLevel, summary: b.summary as string });
    }
  }

  const now = new Date();
  const allItems: QueueItem[] = (actionRows ?? []).map((r) => {
    const prospectJoin = r.prospects as unknown as { business_name: string; industry: string | null; city: string | null; state: string | null } | null;
    const brief = briefByProspectId.get(r.prospect_id as string);
    return {
      actionId: r.id as string,
      prospectId: r.prospect_id as string,
      businessName: prospectJoin?.business_name ?? "Unknown business",
      industry: prospectJoin?.industry ?? null,
      city: prospectJoin?.city ?? null,
      state: prospectJoin?.state ?? null,
      opportunityLevel: brief?.opportunity_level ?? null,
      actionType: r.action_type as ProspectActionType,
      actionLabel: PROSPECT_ACTION_LABELS[r.action_type as ProspectActionType],
      priority: r.priority as ActionPriority,
      reason: r.reason as string,
      dueAt: r.due_at as string | null,
      status: r.status as "PENDING" | "SNOOZED",
      evidenceSummary: brief?.summary ?? null
    };
  });

  // Only items that are actually actionable today drive the queue itself
  // (a SNOOZED item not yet due stays hidden until it is) — matches
  // section 12: "Snoozed action disappears until due."
  const dueItems = allItems.filter((item) => item.status === "PENDING" || isActionDueNow({ dueAt: item.dueAt }, now));
  const sorted = sortQueueActions(
    dueItems.map((item) => ({ ...item, createdAt: now.toISOString() })),
    now
  );

  const { count: meetingsScheduled } = await supabase
    .from("prospects")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("status", "meeting");

  const summary: QueueSummary = {
    newToReview: dueItems.filter((i) => i.actionType === "REVIEW_PROSPECT" || i.actionType === "IMPORT_GMB_DATA").length,
    readyToContact: dueItems.filter((i) => i.actionType === "CONTACT").length,
    followUpsDue: dueItems.filter((i) => i.actionType === "FOLLOW_UP").length,
    demosReady: dueItems.filter((i) => i.actionType === "SEND_DEMO").length,
    meetingsScheduled: meetingsScheduled ?? 0
  };

  return NextResponse.json({ items: sorted, summary });
}
