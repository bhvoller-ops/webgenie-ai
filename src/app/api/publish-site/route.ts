import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { publishBusinessSite } from "@/lib/publish/vercel";
import { INDUSTRIES } from "@/lib/sitegen/industries";
import type { Business } from "@/lib/sitegen/types";

/**
 * Agency-only — requires a logged-in session, unlike the public site-chat/
 * site-lead routes. Publishing costs a real Vercel deployment + domain, so
 * this shouldn't be reachable by an anonymous site visitor.
 */
const businessSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  industry: z.string().min(1),
  phone: z.string().min(1).max(40),
  address: z.string().max(300).optional().default(""),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(20),
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
  hours: z.string().max(200).optional(),
  website: z.string().nullable().optional(),
  placeUrl: z.string().optional(),
  source: z.enum(["places", "manual", "sample"]),
  heroImageOverride: z.string().optional(),
  secondaryImageOverride: z.string().optional()
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const parsed = businessSchema.safeParse((await request.json().catch(() => null))?.business);
  if (!parsed.success || !(parsed.data.industry in INDUSTRIES)) {
    return NextResponse.json({ error: "Invalid business data." }, { status: 400 });
  }

  try {
    const result = await publishBusinessSite(parsed.data as Business);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Publish to Vercel failed:", error);
    const message = error instanceof Error ? error.message : "Publishing failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
