import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/access";
import type { LaunchSettings } from "@/lib/prospect/types";

/** P2 Agency Launch Mode -- one settings row per org (master prompt Architecture Decision 11). Pure orchestration input; Launch Mode's actual progress is always derived live from real prospects/prospect_actions, never stored here. */
function rowToLaunchSettings(row: Record<string, unknown>): LaunchSettings {
  return {
    organizationId: row.organization_id as string,
    targetIndustry: (row.target_industry as string | null) ?? null,
    targetLocation: (row.target_location as string | null) ?? null,
    agencyOffer: (row.agency_offer as string | null) ?? null,
    preferredChannels: (row.preferred_channels as string[] | null) ?? [],
    dailyProspectingTarget: (row.daily_prospecting_target as number | null) ?? null,
    startedAt: (row.started_at as string | null) ?? null,
    completedAt: (row.completed_at as string | null) ?? null,
    updatedAt: row.updated_at as string
  };
}

const patchSchema = z.object({
  targetIndustry: z.string().trim().max(200).nullable().optional(),
  targetLocation: z.string().trim().max(200).nullable().optional(),
  agencyOffer: z.string().trim().max(500).nullable().optional(),
  preferredChannels: z.array(z.string()).optional(),
  dailyProspectingTarget: z.number().int().min(1).nullable().optional(),
  start: z.boolean().optional(),
  complete: z.boolean().optional()
});

export async function GET() {
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId } = ctx;

  const { data } = await supabase.from("organization_launch_settings").select("*").eq("organization_id", organizationId).maybeSingle();
  return NextResponse.json({ settings: data ? rowToLaunchSettings(data) : null });
}

export async function PATCH(request: Request) {
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId } = ctx;

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid update." }, { status: 400 });

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { updated_at: now };
  if (parsed.data.targetIndustry !== undefined) patch.target_industry = parsed.data.targetIndustry;
  if (parsed.data.targetLocation !== undefined) patch.target_location = parsed.data.targetLocation;
  if (parsed.data.agencyOffer !== undefined) patch.agency_offer = parsed.data.agencyOffer;
  if (parsed.data.preferredChannels !== undefined) patch.preferred_channels = parsed.data.preferredChannels;
  if (parsed.data.dailyProspectingTarget !== undefined) patch.daily_prospecting_target = parsed.data.dailyProspectingTarget;
  if (parsed.data.start) patch.started_at = now;
  if (parsed.data.complete) patch.completed_at = now;

  const { data: updated, error } = await supabase
    .from("organization_launch_settings")
    .upsert({ organization_id: organizationId, ...patch }, { onConflict: "organization_id" })
    .select("*")
    .single();
  if (error || !updated) return NextResponse.json({ error: error?.message ?? "Unable to save launch settings." }, { status: 500 });

  return NextResponse.json({ settings: rowToLaunchSettings(updated) });
}
