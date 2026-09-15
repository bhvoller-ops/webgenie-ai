import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/access";
import { peekPreview, generatePreview } from "@/lib/prospect/finder-preview-capture";

/**
 * Finder website-preview delivery (master prompt Phase 6/7). Tenant-scoped:
 * organizationId comes only from requireAdminApi()'s own session-derived
 * context, never from the request body -- the same pattern every other
 * Finder/prospect route in this codebase already uses. A caller cannot
 * request or receive another organization's cached preview by any input it
 * controls, since the cache key and the signed URL are both built from this
 * server-resolved organizationId, not a client-supplied one.
 *
 * GET is a cache-only read (never triggers a capture -- Phase 9: no eager
 * capture). POST generates on demand, once, with the storage-lock guard in
 * finder-preview-capture.ts preventing a concurrent duplicate for the same
 * (organization, url).
 */
const bodySchema = z.object({
  url: z.string().min(1).max(2048),
  open24Hours: z.boolean().optional(),
  hasCompletedAudit: z.boolean().optional(),
  forceRefresh: z.boolean().optional()
});

export async function GET(request: Request) {
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId } = ctx;

  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  if (!url) return NextResponse.json({ error: "A url is required." }, { status: 400 });

  const open24HoursParam = searchParams.get("open24Hours");
  const hasCompletedAuditParam = searchParams.get("hasCompletedAudit");

  const result = await peekPreview(supabase, {
    organizationId,
    rawUrl: url,
    open24Hours: open24HoursParam === "true" ? true : open24HoursParam === "false" ? false : undefined,
    hasCompletedAudit: hasCompletedAuditParam === "true"
  });
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId } = ctx;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const result = await generatePreview(supabase, {
    organizationId,
    rawUrl: parsed.data.url,
    open24Hours: parsed.data.open24Hours,
    hasCompletedAudit: parsed.data.hasCompletedAudit ?? false,
    forceRefresh: parsed.data.forceRefresh
  });
  return NextResponse.json(result);
}
