/**
 * Creates a disposable, clearly-labeled test organization + owner user for
 * manual verification of Stripe/webhook/RLS flows (Phase 0 of the VibeLabs
 * membership plan — see the "sandbox/test-org discipline" item). Every org
 * this script creates is named with a "[SANDBOX] " prefix; cleanup-test-org.ts
 * refuses to delete anything without that exact prefix, so this is the only
 * supported way to create an org meant to be torn down later.
 *
 * Run with: npx tsx scripts/seed-sandbox-org.ts [label]
 *   label defaults to a timestamp, e.g. "2026-09-02T18-40-00"
 *
 * Prints the org id, the test user's email, and a real magic-link sign-in
 * URL so you can actually click through the app as this sandbox user.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const SANDBOX_PREFIX = "[SANDBOX] ";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }
  const admin = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const label = process.argv[2] || new Date().toISOString().replace(/[:.]/g, "-");
  const email = `sandbox+${label}@webgenie.test`;

  const { data: userRes, error: userErr } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { sandbox: true },
  });
  if (userErr || !userRes.user) {
    console.error("Failed to create sandbox user:", userErr);
    process.exit(1);
  }
  const userId = userRes.user.id;

  const orgName = `${SANDBOX_PREFIX}${label}`;
  const { data: org, error: orgErr } = await admin
    .from("organizations")
    .insert({ name: orgName })
    .select("id")
    .single();
  if (orgErr || !org) {
    console.error("Failed to create sandbox organization:", orgErr);
    // Best-effort: don't leave an orphaned auth user behind on failure.
    await admin.auth.admin.deleteUser(userId).catch(() => {});
    process.exit(1);
  }

  const { error: memberErr } = await admin
    .from("organization_members")
    .insert({ organization_id: org.id, user_id: userId, role: "owner" });
  if (memberErr) {
    console.error("Failed to create owner membership:", memberErr);
    process.exit(1);
  }

  const { data: linkRes, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (linkErr) {
    console.error("Org and user created, but generating a sign-in link failed:", linkErr);
  }

  console.log("Sandbox organization ready.");
  console.log("  organization_id:", org.id);
  console.log("  organization_name:", orgName);
  console.log("  user_id:", userId);
  console.log("  email:", email);
  if (linkRes?.properties?.action_link) {
    console.log("  sign-in link (single use):", linkRes.properties.action_link);
  }
  console.log(`\nWhen done: npx tsx scripts/cleanup-test-org.ts ${org.id}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
