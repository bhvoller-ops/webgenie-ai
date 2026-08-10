/**
 * One-off setup: registers the production webhook endpoint with Stripe and
 * prints the signing secret to put in STRIPE_WEBHOOK_SECRET.
 *
 * Run with: npx tsx scripts/stripe-setup-webhook.ts
 */
import { config } from "dotenv";
import Stripe from "stripe";

config({ path: ".env.local" });

const WEBHOOK_URL = "https://webgenie-ai-sooty.vercel.app/api/billing/webhook";
const EVENTS: Stripe.WebhookEndpointCreateParams.EnabledEvent[] = [
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
];

async function main() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("STRIPE_SECRET_KEY is not set in .env.local");
    process.exit(1);
  }
  const stripe = new Stripe(secretKey);

  const existing = await stripe.webhookEndpoints.list({ limit: 100 });
  const already = existing.data.find((e) => e.url === WEBHOOK_URL);
  if (already) {
    console.log(
      `A webhook endpoint for ${WEBHOOK_URL} already exists (${already.id}).\n` +
        "Its signing secret can only be viewed once, at creation. If it's " +
        "not already in STRIPE_WEBHOOK_SECRET, delete it in the Stripe " +
        "dashboard and re-run this script to get a fresh one."
    );
    return;
  }

  const endpoint = await stripe.webhookEndpoints.create({
    url: WEBHOOK_URL,
    enabled_events: EVENTS,
    description: "WebGenie call tracker — client subscription status",
  });

  console.log("Created webhook endpoint:", endpoint.id);
  console.log("\nSet this in .env.local and on Vercel:");
  console.log(`STRIPE_WEBHOOK_SECRET=${endpoint.secret}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
