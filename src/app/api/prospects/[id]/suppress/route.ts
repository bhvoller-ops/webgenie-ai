import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/access";
import { rowToProspect } from "@/lib/prospect/row";
import { suppressProspect, unsuppressProspect } from "@/lib/prospect/suppression";
import { regenerateProspectIntelligence } from "@/lib/prospect/regenerate";

/**
 * Both directions are always deliberate, explicit user actions -- nothing
 * in the codebase calls either of these from a regeneration/reconciliation
 * path (master prompt Architecture Decision 4: "Provide explicit manual
 * unsuppress only if deliberate and safe... OPTED_OUT / DO_NOT_CONTACT
 * reversals must require deliberate user action").
 */
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("suppress"), reason: z.enum(["OPTED_OUT", "DO_NOT_CONTACT", "INVALID_CONTACT", "MANUAL"]) }),
  z.object({ action: z.literal("unsuppress") })
]);

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: prospectId } = await params;
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId, user } = ctx;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const { error } =
    parsed.data.action === "suppress"
      ? await suppressProspect(supabase, { organizationId, prospectId, reason: parsed.data.reason, createdBy: user.id })
      : await unsuppressProspect(supabase, { organizationId, prospectId, createdBy: user.id });
  if (error) return NextResponse.json({ error }, { status: 500 });

  // Suppression must immediately stop any active sequence and clear any
  // active Queue action -- reconcile right away, not on the next
  // unrelated event.
  const { data: prospectRow } = await supabase.from("prospects").select("*").eq("id", prospectId).eq("organization_id", organizationId).maybeSingle();
  if (prospectRow) await regenerateProspectIntelligence(supabase, rowToProspect(prospectRow), { force: true });

  return NextResponse.json({ ok: true });
}
