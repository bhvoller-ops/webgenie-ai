import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/access";

/**
 * Snooze/skip/complete a single Daily Queue item (master prompt section
 * 12). Deliberately does not delete the underlying prospect or recompute
 * anything else here — completing/skipping/snoozing is purely about this
 * one queue-item row's own lifecycle; the *next* recommended action (if
 * any) gets (re)synced the next time regenerateProspectIntelligence()
 * runs for this prospect (e.g. after a real action like logging a
 * contact outcome), not invented speculatively by this route.
 */
const snoozeOptionSchema = z.enum(["tomorrow", "three_days", "one_week"]);
const schema = z.discriminatedUnion("op", [
  z.object({ op: z.literal("complete") }),
  z.object({ op: z.literal("skip") }),
  z.object({ op: z.literal("snooze"), option: snoozeOptionSchema.optional(), until: z.string().datetime().optional() })
]);

const SNOOZE_DAYS: Record<z.infer<typeof snoozeOptionSchema>, number> = {
  tomorrow: 1,
  three_days: 3,
  one_week: 7
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: actionId } = await params;
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId } = ctx;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const { data: actionRow } = await supabase
    .from("prospect_actions")
    .select("id, status")
    .eq("id", actionId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (!actionRow) return NextResponse.json({ error: "Action not found." }, { status: 404 });

  const now = new Date().toISOString();

  if (parsed.data.op === "complete") {
    await supabase.from("prospect_actions").update({ status: "COMPLETED", completed_at: now, updated_at: now }).eq("id", actionId);
  } else if (parsed.data.op === "skip") {
    await supabase.from("prospect_actions").update({ status: "SKIPPED", updated_at: now }).eq("id", actionId);
  } else {
    let dueAt: string;
    if (parsed.data.until) {
      dueAt = parsed.data.until;
    } else if (parsed.data.option) {
      dueAt = new Date(Date.now() + SNOOZE_DAYS[parsed.data.option] * 86400000).toISOString();
    } else {
      return NextResponse.json({ error: "Snooze requires an option or an explicit date." }, { status: 400 });
    }
    await supabase.from("prospect_actions").update({ status: "SNOOZED", due_at: dueAt, updated_at: now }).eq("id", actionId);
  }

  return NextResponse.json({ ok: true });
}
