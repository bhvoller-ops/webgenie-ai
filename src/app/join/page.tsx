import { Suspense } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { JoinForm } from "./join-form";

const FOUNDING_SEATS = 25;

/**
 * The page VibeLabs-v2's marketing site CTAs point at (Phase 9 of the
 * VibeLabs membership plan) — restates the $97/mo offer, collects an
 * email, and hands off to /api/vibelabs/start-trial for real Stripe
 * Checkout. Public, no auth — this is the actual front door for a founding
 * member, not a page that assumes anyone is signed in yet.
 */
export const dynamic = "force-dynamic";

export default async function JoinPage() {
  const admin = createAdminClient();
  const { count } = await admin
    .from("organizations")
    .select("id", { count: "exact", head: true })
    .eq("offer_key", "vibelabs");
  const remaining = Math.max(0, FOUNDING_SEATS - (count ?? 0));

  return (
    <Suspense>
      <JoinForm remaining={remaining} total={FOUNDING_SEATS} />
    </Suspense>
  );
}
