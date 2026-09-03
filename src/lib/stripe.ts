import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";

/**
 * The $297/mo client package has no catalog — one business, one recurring
 * price.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

export const WEBGENIE_CLIENT_PRICE_ID = process.env.STRIPE_CLIENT_PRICE_ID ?? "";

function randomLetters(n: number) {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  return Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

/**
 * Shared by both the "Collect payment" action (redirects the agency's own
 * browser to Checkout) and the "Copy payment link" API route (returns the
 * URL so it can be copied/texted without navigating away). Same session, same
 * per-prospect tracking — the two entry points only differ in what they do
 * with the resulting URL.
 */
export async function createClientCheckoutSession({
  supabase,
  callLogId,
  organizationId,
  baseUrl,
  successPath = "/calls?payment=success",
  cancelPath = "/calls?payment=cancelled"
}: {
  supabase: SupabaseClient;
  callLogId: string;
  organizationId: string;
  baseUrl: string;
  /** Override for callers whose visitor isn't a logged-in WebGenie user — the
   * default lands back on /calls, which is fine for the agency's own device
   * but would dead-end an external client at a login screen. */
  successPath?: string;
  cancelPath?: string;
}): Promise<string> {
  if (!WEBGENIE_CLIENT_PRICE_ID) {
    throw new Error("Billing isn't configured yet — STRIPE_CLIENT_PRICE_ID is missing.");
  }

  const { data: call } = await supabase
    .from("call_log")
    .select("id")
    .eq("id", callLogId)
    .eq("organization_id", organizationId)
    .single();
  if (!call) throw new Error("Prospect not found.");

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: WEBGENIE_CLIENT_PRICE_ID, quantity: 1 }],
    client_reference_id: callLogId,
    metadata: { call_log_id: callLogId, organization_id: organizationId },
    success_url: `${baseUrl}${successPath}`,
    cancel_url: `${baseUrl}${cancelPath}`,
    integration_identifier: `webgenie_${randomLetters(8)}`
  });

  const { error } = await supabase
    .from("call_log")
    .update({ stripe_checkout_session_id: session.id, payment_status: "pending" })
    .eq("id", callLogId)
    .eq("organization_id", organizationId);
  if (error) {
    // Non-fatal: the checkout still works, it just won't show as "pending"
    // in the tracker until the webhook confirms payment.
    console.error("Failed to record checkout session on call_log:", error.message);
  }

  if (!session.url) throw new Error("Stripe did not return a checkout URL.");
  return session.url;
}

/**
 * Self-serve Stripe Customer Portal — payment method + cancel + invoice
 * history only. No plan-switching offered: every org on a paid plan here
 * (WebGenie $297/mo, VibeLabs $97/mo) has exactly one price, so there is
 * nothing to switch between. Requires a portal Configuration to already
 * exist on the account (see scripts/stripe-setup-billing-portal.ts) — the
 * Stripe API rejects billingPortal.sessions.create with no configuration
 * present, live mode especially.
 */
export async function createBillingPortalSession({
  customerId,
  returnUrl
}: {
  customerId: string;
  returnUrl: string;
}): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl
  });
  return session.url;
}
