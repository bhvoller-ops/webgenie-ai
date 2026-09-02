import { redirect } from "next/navigation";
import { requireAdminPage } from "@/lib/auth/access";
import { WelcomeClient } from "./welcome-client";

/**
 * The VibeLabs member's own welcome sequence — distinct from /onboard,
 * which is the tool a member uses to onboard THEIR OWN client. This page
 * is what a founding member sees once, right after Checkout completes
 * (see api/vibelabs/start-trial's success_url and the webhook that
 * provisions the org). Gated to real VibeLabs orgs that haven't finished
 * it yet; anyone else lands on their real dashboard instead — this page is
 * a one-time front door, not a permanent nav destination.
 */
export default async function VibelabsWelcomePage() {
  const { supabase, organizationId } = await requireAdminPage();

  const { data: org } = await supabase
    .from("organizations")
    .select("offer_key, onboarding_completed_at, guarantee_started_at, guarantee_deadline_at")
    .eq("id", organizationId)
    .single();

  if (!org || org.offer_key !== "vibelabs") {
    redirect("/projects/new");
  }
  if (org.onboarding_completed_at) {
    redirect("/projects/new");
  }

  const { data: branding } = await supabase
    .from("org_branding")
    .select("brand_name, primary_niche")
    .eq("organization_id", organizationId)
    .maybeSingle();

  return (
    <WelcomeClient
      guaranteeDeadlineAt={org.guarantee_deadline_at}
      initialBrandName={branding?.brand_name ?? ""}
      initialNiche={branding?.primary_niche ?? ""}
    />
  );
}
