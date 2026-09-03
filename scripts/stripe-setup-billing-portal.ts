/**
 * One-off setup: creates the Stripe Customer Portal Configuration this
 * account needs before billingPortal.sessions.create (lib/stripe.ts's
 * createBillingPortalSession, wired to the "Manage billing" button on
 * /settings) will work at all — Stripe rejects portal session creation
 * with no configuration present on the account, live mode especially.
 *
 * Scoped deliberately narrow: payment method update, invoice history, and
 * cancel only. No subscription_update (plan switching) — every org this
 * app bills (WebGenie $297/mo, VibeLabs $97/mo) is on exactly one price,
 * so there is nothing to switch between.
 *
 * Deliberately NOT run automatically as part of this change — creates a
 * real object in whichever Stripe account STRIPE_SECRET_KEY points at
 * (live, as of this writing), and this account's restricted key has a
 * documented history of narrower permissions than expected (see CLAUDE.md
 * §2s) — Billing Portal configuration write may need its own scope enabled
 * in the Dashboard first. Run it yourself when ready:
 *
 *   npx tsx scripts/stripe-setup-billing-portal.ts
 */
import { config } from "dotenv";
import Stripe from "stripe";

config({ path: ".env.local" });

async function main() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("STRIPE_SECRET_KEY is not set in .env.local");
    process.exit(1);
  }
  const stripe = new Stripe(secretKey);

  const existing = await stripe.billingPortal.configurations.list({ is_default: true, limit: 1 });
  if (existing.data.length > 0) {
    console.log("A default portal configuration already exists — leaving it alone:", existing.data[0].id);
    return;
  }

  const configuration = await stripe.billingPortal.configurations.create({
    business_profile: {
      headline: "Manage your subscription"
    },
    features: {
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      customer_update: { enabled: true, allowed_updates: ["email", "address"] },
      subscription_cancel: {
        enabled: true,
        mode: "at_period_end",
        cancellation_reason: {
          enabled: true,
          options: ["too_expensive", "missing_features", "switched_service", "unused", "other"]
        }
      }
    },
    default_return_url: process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/settings`
      : "https://app.vibelabsagency.com/settings"
  });

  console.log("Created portal configuration:", configuration.id);
  console.log("Set it as this account's default in the Stripe Dashboard");
  console.log("(Settings -> Billing -> Customer portal) if it isn't already,");
  console.log("or pass { configuration: \"" + configuration.id + "\" } explicitly to sessions.create.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
