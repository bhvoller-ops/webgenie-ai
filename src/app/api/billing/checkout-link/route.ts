import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createClientCheckoutSession } from "@/lib/stripe";

const schema = z.object({ callLogId: z.string().uuid() });

async function getBaseUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * Same checkout session as the "Collect payment" button — this just returns
 * the URL as JSON instead of redirecting, so the browser can copy/text it
 * instead of navigating the agency's own device to Stripe.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!membership) return NextResponse.json({ error: "No workspace found." }, { status: 400 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid prospect." }, { status: 400 });

  try {
    const baseUrl = await getBaseUrl();
    const url = await createClientCheckoutSession({
      supabase,
      callLogId: parsed.data.callLogId,
      organizationId: membership.organization_id,
      baseUrl
    });
    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create payment link.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
