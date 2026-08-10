import "server-only";

import Stripe from "stripe";

/**
 * The $297/mo client package has no catalog — one business, one recurring
 * price.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

export const WEBGENIE_CLIENT_PRICE_ID = process.env.STRIPE_CLIENT_PRICE_ID ?? "";
