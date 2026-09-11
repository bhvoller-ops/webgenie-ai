import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/access";
import { resolvePlaybookContext, type PlaybookBlockReason } from "@/lib/playbook/resolve-context";

/**
 * Read-only. Resolves everything a live playbook session needs -- prospect
 * intelligence, channel-activation status, and the applicable Home
 * Services / Roofing config -- entirely server-side, scoped to the active
 * organization. See lib/playbook/resolve-context.ts for the actual
 * authorization logic; this route only adapts its result to HTTP.
 *
 * No internal database id is echoed back beyond what the client already
 * holds (prospectId from the URL, plus actionId/enrollmentId it must
 * already have to have linked here) -- the response never includes a
 * sequenceId/organizationId/etc. label rendered as visible UI text
 * anywhere in the client code that consumes this.
 */
const STATUS_BY_REASON: Record<PlaybookBlockReason, number> = {
  PROSPECT_NOT_FOUND: 404,
  ACTION_NOT_FOUND: 404,
  ACTION_NOT_ACTIVE: 409,
  ACTION_PROSPECT_MISMATCH: 409,
  ENROLLMENT_NOT_FOUND: 404,
  ENROLLMENT_NOT_ACTIVE: 409
};

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: prospectId } = await params;
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId } = ctx;

  const url = new URL(request.url);
  const actionId = url.searchParams.get("actionId");
  const enrollmentId = url.searchParams.get("enrollmentId");

  const result = await resolvePlaybookContext(supabase, organizationId, { prospectId, actionId, enrollmentId });
  if (!result.ok) {
    return NextResponse.json({ error: result.message, reason: result.reason }, { status: STATUS_BY_REASON[result.reason] });
  }
  return NextResponse.json(result);
}
