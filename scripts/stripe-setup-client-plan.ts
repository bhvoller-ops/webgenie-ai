/**
 * One-off setup: creates the Stripe Product + recurring Price for the
 * $297/mo client package (CLAUDE.md's locked Motion A pricing) if they
 * don't already exist, and prints the Price ID to put in
 * STRIPE_CLIENT_PRICE_ID.
 *
 * Run with: npx tsx scripts/stripe-setup-client-plan.ts
 */
import { config } from "dotenv";
import Stripe from "stripe";

config({ path: ".env.local" });

const METADATA_KEY = "webgenie_client_plan";

async function main() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("STRIPE_SECRET_KEY is not set in .env.local");
    process.exit(1);
  }
  const stripe = new Stripe(secretKey);

  const existing = await stripe.products.search({
    query: `metadata['${METADATA_KEY}']:'true' AND active:'true'`,
  });

  let product = existing.data[0];
  if (!product) {
    product = await stripe.products.create({
      name: "WebGenie Website + AI Package",
      description:
        "Website, AI chat, voice receptionist, missed-call text-back, review automation, and CRM.",
      metadata: { [METADATA_KEY]: "true" },
    });
    console.log("Created product:", product.id);
  } else {
    console.log("Reusing existing product:", product.id);
  }

  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 10 });
  let price = prices.data.find(
    (p) => p.unit_amount === 29700 && p.currency === "usd" && p.recurring?.interval === "month"
  );

  if (!price) {
    price = await stripe.prices.create({
      product: product.id,
      currency: "usd",
      unit_amount: 29700,
      recurring: { interval: "month" },
      metadata: { [METADATA_KEY]: "true" },
    });
    console.log("Created price:", price.id);
  } else {
    console.log("Reusing existing price:", price.id);
  }

  console.log("\nSet this in .env.local and on Vercel:");
  console.log(`STRIPE_CLIENT_PRICE_ID=${price.id}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
