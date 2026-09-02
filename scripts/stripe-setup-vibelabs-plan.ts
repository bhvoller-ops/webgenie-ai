/**
 * One-off setup: creates the Stripe Product + recurring Price for the
 * $97/mo VibeLabs Agency founding membership (see PRODUCT.md in
 * C:\Projects\VibeLabs-v2 for the offer's exact terms) if they don't
 * already exist, and prints the Price ID to put in
 * STRIPE_VIBELABS_PRICE_ID.
 *
 * Distinct from scripts/stripe-setup-client-plan.ts's $297 price — that one
 * bills a WebGenie agency's own end-client; this one bills the VibeLabs
 * member's own $97/mo membership.
 *
 * Deliberately NOT run automatically as part of this change — creates a
 * real object in whichever Stripe account STRIPE_SECRET_KEY points at
 * (live, as of this writing). Run it yourself when ready:
 *
 *   npx tsx scripts/stripe-setup-vibelabs-plan.ts
 */
import { config } from "dotenv";
import Stripe from "stripe";

config({ path: ".env.local" });

const METADATA_KEY = "vibelabs_membership_plan";

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
      name: "VibeLabs Agency Membership",
      description:
        "Founding membership: a fully branded, white-label AI-powered agency — lead finder, qualification & audit tool, prebuilt AI-integrated websites, and upsell path.",
      metadata: { [METADATA_KEY]: "true" },
    });
    console.log("Created product:", product.id);
  } else {
    console.log("Reusing existing product:", product.id);
  }

  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 10 });
  let price = prices.data.find(
    (p) => p.unit_amount === 9700 && p.currency === "usd" && p.recurring?.interval === "month"
  );

  if (!price) {
    price = await stripe.prices.create({
      product: product.id,
      currency: "usd",
      unit_amount: 9700,
      recurring: { interval: "month" },
      metadata: { [METADATA_KEY]: "true" },
    });
    console.log("Created price:", price.id);
  } else {
    console.log("Reusing existing price:", price.id);
  }

  console.log("\nSet this in .env.local and on Vercel:");
  console.log(`STRIPE_VIBELABS_PRICE_ID=${price.id}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
