import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifySignup } from "@/lib/notify";

/**
 * Public self-serve intake for word-of-mouth / webinar leads — someone who
 * wants a site but wasn't found via a Google Places search. Same-origin only
 * (this is WebGenie's own page, not embedded on a client's site the way the
 * chat widget/lead form are), so no CORS handling needed here — see
 * lib/sitegen/cors.ts for why those routes need it and this one doesn't.
 *
 * Writes into call_log (the same pipeline /calls uses) rather than a
 * parallel table — this is the same kind of prospect as anything Cassey adds
 * manually, just sourced differently. Tagged source:"self_serve" so it's
 * distinguishable in the tracker. An optional `ref` (a partner's referral
 * code) auto-attributes the commission the same way tagging a partner
 * manually on /calls does — see migration 020.
 *
 * Same single-tenant limitation as /api/site-lead and /api/site-chat:
 * attributes to whichever organization comes back first. Harmless with one
 * agency using WebGenie.
 */
const schema = z.object({
  businessName: z.string().min(1).max(160),
  contactName: z.string().max(160).optional().or(z.literal("")),
  phone: z.string().min(1).max(40),
  email: z.string().email().max(200).optional().or(z.literal("")),
  industry: z.string().max(80).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  state: z.string().max(20).optional().or(z.literal("")),
  message: z.string().max(1000).optional().or(z.literal("")),
  ref: z.string().max(60).optional().or(z.literal(""))
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill in your business name and phone number." }, { status: 400 });
  }
  const { businessName, contactName, phone, email, industry, city, state, message, ref } = parsed.data;

  try {
    const supabase = createAdminClient();
    const { data: org } = await supabase.from("organizations").select("id").limit(1).single();
    if (!org) {
      return NextResponse.json({ error: "We're not accepting requests right now — please call us directly instead." }, { status: 503 });
    }

    let partnerId: string | null = null;
    if (ref) {
      const { data: partner } = await supabase
        .from("partners")
        .select("id")
        .eq("organization_id", org.id)
        .eq("referral_code", ref)
        .eq("status", "active")
        .maybeSingle();
      partnerId = partner?.id ?? null;
    }

    const { data: row, error } = await supabase
      .from("call_log")
      .insert({
        organization_id: org.id,
        business_name: businessName,
        contact_name: contactName || null,
        phone,
        email: email || null,
        industry: industry || null,
        city: city || null,
        state: state || null,
        notes: message || null,
        source: "self_serve",
        partner_id: partnerId
      })
      .select("id")
      .single();
    if (error) throw error;

    // Awaited deliberately, not fire-and-forget: a serverless function can
    // freeze the instant the response is returned, which would kill an
    // in-flight Resend request before it completes. notifySignup never
    // throws (it logs and swallows its own errors), so this can't turn an
    // email failure into a failed signup — it only adds one API round trip.
    await notifySignup({
      kind: "lead",
      name: businessName,
      contactEmail: email || null,
      contactPhone: phone,
      detailPath: "/calls",
      idempotencyKey: `lead-signup/${row.id}`
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to store self-serve lead:", err);
    return NextResponse.json({ error: "Something went wrong — please call us directly instead." }, { status: 500 });
  }
}
