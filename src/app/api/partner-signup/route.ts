import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildReferralCode } from "@/lib/partners";
import { notifySignup } from "@/lib/notify";

/**
 * Public self-serve partner signup. Same-origin only, no CORS needed — see
 * /api/get-started for why (this isn't embedded on a third-party site).
 *
 * Lands as status:"inactive" deliberately — payouts here are manual/trust-
 * based (flat fee per signup, paid by hand, see migration 020), so a
 * self-serve signup shouldn't be able to start earning commissions before
 * Cassey has actually seen who signed up. She flips it to "active" in
 * /partners, which is also where the referral_code becomes usable — see
 * /api/get-started's `.eq("status", "active")` check.
 *
 * No email notification fires when someone signs up — this app doesn't send
 * transactional email (see CLAUDE.md). Check /partners for new "inactive"
 * rows.
 */
const schema = z.object({
  name: z.string().min(1).max(160),
  contactEmail: z.string().email().max(200),
  contactPhone: z.string().max(40).optional().or(z.literal("")),
  message: z.string().max(1000).optional().or(z.literal(""))
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill in your name and a valid email." }, { status: 400 });
  }
  const { name, contactEmail, contactPhone, message } = parsed.data;

  try {
    const supabase = createAdminClient();
    const { data: org } = await supabase.from("organizations").select("id").limit(1).single();
    if (!org) {
      return NextResponse.json({ error: "We're not accepting signups right now — please email us directly instead." }, { status: 503 });
    }

    const referralCode = buildReferralCode(name);
    const { data: row, error } = await supabase
      .from("partners")
      .insert({
        organization_id: org.id,
        name,
        contact_email: contactEmail,
        contact_phone: contactPhone || null,
        referral_code: referralCode,
        notes: message || null,
        status: "inactive"
      })
      .select("id")
      .single();
    if (error) {
      // Extremely unlikely (two different signups slugifying to the same
      // code), but retry once with a suffix rather than fail the signup.
      if (error.message.toLowerCase().includes("duplicate")) {
        const retryCode = `${referralCode}-${Math.floor(Math.random() * 1000)}`;
        const retry = await supabase
          .from("partners")
          .insert({
            organization_id: org.id,
            name,
            contact_email: contactEmail,
            contact_phone: contactPhone || null,
            referral_code: retryCode,
            notes: message || null,
            status: "inactive"
          })
          .select("id")
          .single();
        if (retry.error) throw retry.error;
        await notifySignup({
          kind: "partner",
          name,
          contactEmail,
          contactPhone: contactPhone || null,
          detailPath: "/partners",
          idempotencyKey: `partner-signup/${retry.data.id}`
        });
        return NextResponse.json({ ok: true, referralCode: retryCode });
      }
      throw error;
    }

    // See /api/get-started for why this is awaited rather than fire-and-forget.
    await notifySignup({
      kind: "partner",
      name,
      contactEmail,
      contactPhone: contactPhone || null,
      detailPath: "/partners",
      idempotencyKey: `partner-signup/${row.id}`
    });

    return NextResponse.json({ ok: true, referralCode });
  } catch (err) {
    console.error("Failed to store partner signup:", err);
    return NextResponse.json({ error: "Something went wrong — please try again or email us directly." }, { status: 500 });
  }
}
