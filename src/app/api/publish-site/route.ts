import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/access";
import { publishBusinessSite } from "@/lib/publish/vercel";
import { INDUSTRIES } from "@/lib/sitegen/industries";
import { publishSiteBusinessSchema as businessSchema } from "@/lib/prospect/business-schema";
import type { Business } from "@/lib/sitegen/types";

/**
 * Agency-only — requires a logged-in session, unlike the public site-chat/
 * site-lead routes. Publishing costs a real Vercel deployment + domain, so
 * this shouldn't be reachable by an anonymous site visitor.
 *
 * Uses the canonical `publishSiteBusinessSchema` (lib/prospect/
 * business-schema.ts, introduced by the Open Opportunity phone-validation
 * fix and extended there rather than inline here so a regression test can
 * import it) — this route had the exact same `phone: z.string().min(1)`
 * bug, confirmed live 10 Sep 2026 against a real phone-less business
 * (docs/history.md): "Invalid business data." before any Vercel API call
 * was ever made. Importing the shared, already-extended schema means it
 * can never drift from that fix again.
 */
export async function POST(request: Request) {
  const { ctx, response } = await requireAdminApi();
  if (response) return response;

  const parsed = businessSchema.safeParse((await request.json().catch(() => null))?.business);
  if (!parsed.success || !(parsed.data.industry in INDUSTRIES)) {
    return NextResponse.json({ error: "Invalid business data." }, { status: 400 });
  }

  try {
    const result = await publishBusinessSite(parsed.data as Business, ctx.organizationId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Publish to Vercel failed:", error);
    const message = error instanceof Error ? error.message : "Publishing failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
