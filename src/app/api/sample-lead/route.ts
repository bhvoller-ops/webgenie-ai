import { z } from "zod";
import { corsJson, corsPreflight } from "@/lib/sitegen/cors";

/**
 * Dedicated, non-persisting counterpart to /api/site-lead -- the quote
 * form on an ILLUSTRATIVE sample site (/samples, the homepage preview)
 * posts here instead, per SiteOptions.isSample -- see
 * lib/sitegen/lead-form.ts for the endpoint-selection logic and
 * lib/sitegen/generate.ts for where isSample is set.
 *
 * This file imports no database client and contains no write of any
 * kind, on purpose: the safety property here is architectural, not a
 * runtime flag or an allowlist check on caller-supplied data (an earlier
 * version of this fix tried exactly that, twice, and both were unsound --
 * see /api/site-lead/route.ts's header comment for the full history). No
 * request body, however constructed, can make this route write anything,
 * because the code to do so does not exist here.
 */
const schema = z.object({
  business: z.object({
    name: z.string().max(200),
    industryLabel: z.string().max(100),
    phone: z.string().max(40)
  }),
  name: z.string().min(1).max(160),
  email: z.string().email().max(200).optional().or(z.literal("")),
  phone: z.string().min(1).max(40),
  city: z.string().max(100).optional().or(z.literal("")),
  service: z.string().max(120).optional().or(z.literal("")),
  message: z.string().max(600).optional().or(z.literal(""))
});

export function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return corsJson({ error: "Please fill in your name and phone number." }, { status: 400 });
  }
  // Nothing below this line persists anything, by construction.
  return corsJson({ ok: true, demo: true });
}
