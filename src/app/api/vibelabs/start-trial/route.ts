import { NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_ORIGIN } from "@/lib/site-url";
import { VIBELABS_TRIAL_DAYS } from "@/lib/vibelabs/constants";

/**
 * Public, unauthenticated — this is what the VibeLabs marketing site's
 * "Start Your 14-Day Free Trial" CTA calls (see /join, Phase 9). Creates a
 * real Stripe Checkout Session for the $97/mo VibeLabs membership;
 * provisioning the organization itself happens in the webhook once payment
 * setup actually completes (api/billing/webhook, checkout.session.completed
 * branch gated on metadata.offer === "vibelabs") — never here, since a
 * visitor can abandon Checkout without ever converting.
 *
 * payment_method_collection: "always" is what makes the marketing site's
 * "card required, not charged for 14 days" claim literally true rather than
 * aspirational — Stripe collects and validates a real payment method before
 * the trial starts, it just doesn't charge it until the trial ends.
 *
 * The 25-seat cap's real enforcement is the assign_founding_seat trigger
 * (migration 028) at organization-insert time in the webhook. The count
 * below is only a fast, best-effort pre-check so an obviously-sold-out
 * visitor doesn't get sent to Checkout at all — it can race and be stale by
 * the time the webhook fires, which is exactly why the trigger, not this,
 * is the real guard.
 */
const schema = z.object({
  email: z.string().email().max(200),
});

const FOUNDING_SEATS = 25;

export async function POST(request: Request) {
  const priceId = process.env.STRIPE_VIBELABS_PRICE_ID;
  if (!priceId) {
    return NextResponse.json({ error: "Signups aren't configured yet — please try again shortly." }, { status: 503 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  const { email } = parsed.data;

  const supabase = createAdminClient();
  const { count } = await supabase
    .from("organizations")
    .select("id", { count: "exact", head: true })
    .eq("offer_key", "vibelabs");
  if ((count ?? 0) >= FOUNDING_SEATS) {
    return NextResponse.json(
      { error: "All 25 founding spots are claimed. Check back for the next opening." },
      { status: 409 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { trial_period_days: VIBELABS_TRIAL_DAYS },
      payment_method_collection: "always",
      metadata: { offer: "vibelabs", signup_email: email },
      success_url: `${SITE_ORIGIN}/vibelabs/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_ORIGIN}/join?cancelled=1`,
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Failed to create VibeLabs checkout session:", error);
    const message = error instanceof Error ? error.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
