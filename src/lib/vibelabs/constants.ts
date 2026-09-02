/**
 * Shared between api/vibelabs/start-trial (sets this on the real Stripe
 * subscription) and api/billing/webhook (computes trial_ends_at directly
 * from this rather than calling stripe.subscriptions.retrieve() — this key
 * has no Subscriptions Read permission, and there's no need to round-trip
 * to Stripe for a number we set ourselves moments earlier at Checkout).
 */
export const VIBELABS_TRIAL_DAYS = 14;
