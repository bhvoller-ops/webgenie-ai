import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/access";
import { openProspect } from "@/lib/prospect/open";
import { businessSchema } from "@/lib/prospect/business-schema";

/**
 * Admin-only. Turns a Finder result (an ephemeral `Business`) into a real,
 * addressable `Prospect` row the moment an agency user actually opens it —
 * Finder itself stays read-only/ephemeral, matching its existing behavior.
 * Idempotent: re-opening the same business (by Google Place id, or by
 * name+phone for manual/sample entries) returns the same prospect rather
 * than duplicating it — see the two partial unique indexes in migration
 * 034. Generates the Opportunity Brief + Next Best Action on first open.
 *
 * Validation schema lives in lib/prospect/business-schema.ts, not inline
 * here — Next.js's typed-routes checker rejects any named export from an
 * app/api route.ts other than the recognized HTTP-method/config set, and
 * that's also the correct home for "one canonical shape between Finder
 * and this route" after the 10 Sep 2026 phone-validation defect
 * (docs/history.md) showed the schema and the real shape had drifted.
 *
 * The find-or-create logic itself lives in lib/prospect/open.ts (P0.5) —
 * the new GMB-import route reuses it too, rather than a second copy.
 */
export async function POST(request: Request) {
  const { ctx, response } = await requireAdminApi();
  if (response) return response;
  const { supabase, organizationId, user } = ctx;

  const parsed = businessSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid business data.", fields: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const prospect = await openProspect(supabase, organizationId, user.id, parsed.data);
    return NextResponse.json({ prospectId: prospect.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create prospect." }, { status: 500 });
  }
}
