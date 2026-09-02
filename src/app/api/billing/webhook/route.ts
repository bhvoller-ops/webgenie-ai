import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyPartnerCommission } from "@/lib/partners/notify";
import { sendVibelabsWelcomeEmail } from "@/lib/vibelabs/welcome-email";
import { VIBELABS_TRIAL_DAYS } from "@/lib/vibelabs/constants";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Provisions a new VibeLabs organization once Checkout actually completes
 * (payment method collected, trial started — see api/vibelabs/start-trial).
 * Never runs at Checkout-session-creation time, since a visitor can abandon
 * Checkout without ever converting.
 *
 * Ordering matters here: the org insert (and its seat-cap trigger, see
 * migration 028) happens BEFORE creating any auth user, so a 26th signup
 * fails fast without leaving an orphaned unconfirmed user behind.
 */
async function handleVibelabsCheckoutCompleted(supabase: SupabaseClient, session: Stripe.Checkout.Session) {
  const email = session.metadata?.signup_email ?? session.customer_details?.email ?? null;
  const customerId = typeof session.customer === "string" ? session.customer : (session.customer?.id ?? null);
  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : (session.subscription?.id ?? null);

  if (!email || !customerId || !subscriptionId) {
    console.error("vibelabs checkout.session.completed missing email/customer/subscription:", session.id);
    return;
  }

  // Belt and suspenders beyond the generic billing_events dedup above — a
  // manual Stripe Dashboard retry could in principle bypass that log.
  const { data: existingOrg } = await supabase
    .from("organizations")
    .select("id")
    .eq("billing_customer_id", customerId)
    .maybeSingle();
  if (existingOrg) return;

  // Computed directly rather than fetched via stripe.subscriptions.retrieve()
  // — this key has no Subscriptions Read permission, and there's no need to
  // round-trip to Stripe for a trial length we set ourselves moments earlier
  // at Checkout (see api/vibelabs/start-trial). Same VIBELABS_TRIAL_DAYS
  // constant both places, so they can't drift out of sync.
  const trialEndsAt = new Date(Date.now() + VIBELABS_TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // guarantee_deadline_at is a plain column, not DB-generated (timestamptz +
  // interval isn't immutable in Postgres — see migration 028's comment) —
  // set explicitly here, alongside guarantee_started_at, every time.
  const guaranteeStartedAt = new Date();
  const guaranteeDeadlineAt = new Date(guaranteeStartedAt.getTime() + 60 * 24 * 60 * 60 * 1000);

  const { data: newOrg, error: insertError } = await supabase
    .from("organizations")
    .insert({
      name: `${email}'s Agency`,
      offer_key: "vibelabs",
      plan_key: "vibelabs",
      subscription_status: "trialing",
      trial_ends_at: trialEndsAt,
      billing_email: email,
      billing_customer_id: customerId,
      billing_subscription_id: subscriptionId,
      guarantee_started_at: guaranteeStartedAt.toISOString(),
      guarantee_deadline_at: guaranteeDeadlineAt.toISOString(),
    })
    .select("id")
    .single();

  if (insertError || !newOrg) {
    if (insertError?.message?.includes("VIBELABS_SEATS_FULL")) {
      console.error(
        `vibelabs signup for ${email} arrived after all 25 seats were taken — cancelling subscription ${subscriptionId}. ` +
          "No mechanism exists yet to email the visitor about this — a real gap, flagged not silently accepted."
      );
      await stripe.subscriptions.cancel(subscriptionId).catch((cancelErr) => {
        console.error("Failed to cancel over-cap vibelabs subscription:", cancelErr);
      });
    } else {
      console.error("Failed to provision vibelabs organization:", insertError);
    }
    return;
  }

  // Creates the auth user (unconfirmed) if this email hasn't signed up
  // before. Known, accepted gap: if this email already has a WebGenie
  // free-trial account, generateLink({type:"invite"}) errors instead of
  // reusing it — rare given founding-member volume, not handled here.
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: "invite",
    email,
  });
  if (linkError || !linkData?.user) {
    console.error(`Organization ${newOrg.id} provisioned but inviting ${email} failed:`, linkError);
    return;
  }

  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({ organization_id: newOrg.id, user_id: linkData.user.id, role: "owner" });
  if (memberError) {
    console.error(`Organization ${newOrg.id} provisioned, user invited, but membership insert failed:`, memberError);
    return;
  }

  await sendVibelabsWelcomeEmail({
    email,
    signInLink: linkData.properties.action_link,
    organizationId: newOrg.id,
  });
}

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
          .select("partner_id, commission_status, business_name")
          .eq("id", callLogId)
          .maybeSingle();
        if (deal?.partner_id && deal.commission_status === "none") {
          const { data: partner } = await supabase
            .from("partners")
            .select("flat_fee, name, contact_email")
            .eq("id", deal.partner_id)
            .maybeSingle();
          if (partner) {
            const { data: updated } = await supabase
              .from("call_log")
              .update({ commission_status: "owed", commission_amount: partner.flat_fee })
              .eq("id", callLogId)
              .eq("commission_status", "none")
              .select("id")
              .maybeSingle();
            // Only notify if this request actually made the transition (the
            // .eq("commission_status","none") guard means a webhook retry
            // that finds it already "owed" updates zero rows) — otherwise a
            // Stripe redelivery would email the partner a second time.
            if (updated && partner.contact_email) {
              await notifyPartnerCommission({
                email: partner.contact_email,
                partnerName: partner.name,
                businessName: deal.business_name,
                amount: partner.flat_fee,
                status: "owed",
                callLogId
              });
            }
          }
        }
      } else if (session.metadata?.offer === "vibelabs") {
        await handleVibelabsCheckoutCompleted(supabase, session);
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

      // VibeLabs org-level subscription — a different column with a
      // different meaning than call_log.payment_status above:
      // organizations.subscription_status is what
      // lib/auth/access.ts's trial-expiry lockout reads. Enum values are
      // trialing/active/past_due/cancelled/incomplete (British spelling,
      // unlike Stripe's own "canceled" — see the mapping below).
      const orgSubscriptionStatus =
        event.type === "customer.subscription.deleted"
          ? "cancelled"
          : subscription.status === "past_due"
            ? "past_due"
            : subscription.status === "active"
              ? "active"
              : subscription.status === "trialing"
                ? "trialing"
                : subscription.status === "canceled"
                  ? "cancelled"
                  : "incomplete";
      await supabase
        .from("organizations")
        .update({ subscription_status: orgSubscriptionStatus })
        .eq("billing_subscription_id", subscription.id);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
