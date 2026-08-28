import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Stripe requires the raw request body to verify the signature — anything
 * that touches request.json() first invalidates it. See
 * https://docs.stripe.com/webhooks#verify-events
 */
export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!webhookSecret || !signature) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 401 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { error: logError } = await supabase.from("billing_events").insert({
    provider: "stripe",
    provider_event_id: event.id,
    event_type: event.type,
    payload: event as unknown as Record<string, unknown>,
    processed_at: new Date().toISOString(),
  });
  // A duplicate event_id means Stripe retried a webhook we already handled —
  // safe to no-op rather than fail, since Stripe expects a 200 either way.
  if (logError && !logError.message.toLowerCase().includes("duplicate")) {
    return NextResponse.json({ error: logError.message }, { status: 500 });
  }
  if (logError) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const callLogId = session.metadata?.call_log_id;
      if (callLogId) {
        await supabase
          .from("call_log")
          .update({
            payment_status: "active",
            stripe_customer_id: typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
            stripe_subscription_id:
              typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null,
          })
          .eq("id", callLogId);

        // Partner program: a deal referred by a partner earns them a flat
        // fee the moment it converts to a real paying customer. Only fires
        // on the initial checkout (commission_status still "none") — a
        // later renewal/subscription-update webhook must never re-trigger
        // this, since the commission is per-signup, not per-billing-cycle.
        const { data: deal } = await supabase
          .from("call_log")
          .select("partner_id, commission_status")
          .eq("id", callLogId)
          .maybeSingle();
        if (deal?.partner_id && deal.commission_status === "none") {
          const { data: partner } = await supabase
            .from("partners")
            .select("flat_fee")
            .eq("id", deal.partner_id)
            .maybeSingle();
          if (partner) {
            await supabase
              .from("call_log")
              .update({ commission_status: "owed", commission_amount: partner.flat_fee })
              .eq("id", callLogId)
              .eq("commission_status", "none");
          }
        }
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const paymentStatus =
        event.type === "customer.subscription.deleted"
          ? "canceled"
          : subscription.status === "past_due"
            ? "past_due"
            : subscription.status === "active"
              ? "active"
              : "pending";
      await supabase
        .from("call_log")
        .update({ payment_status: paymentStatus })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
