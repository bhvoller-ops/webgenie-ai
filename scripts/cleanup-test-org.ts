/**
 * Deletes a sandbox organization created by seed-sandbox-org.ts, and every
 * auth user whose only membership is that org. Refuses to touch anything
 * whose name doesn't start with the exact "[SANDBOX] " prefix that script
 * uses — this is the only safety guard standing between this script and a
 * real customer org, so it is deliberately not configurable.
 *
 * Run with: npx tsx scripts/cleanup-test-org.ts <organization_id>
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const SANDBOX_PREFIX = "[SANDBOX] ";

async function main() {
  const orgId = process.argv[2];
  if (!orgId) {
    console.error("Usage: npx tsx scripts/cleanup-test-org.ts <organization_id>");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }
  const admin = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: org, error: orgErr } = await admin
    .from("organizations")
    .select("id, name")
    .eq("id", orgId)
    .single();
  if (orgErr || !org) {
    console.error("Organization not found:", orgErr ?? orgId);
    process.exit(1);
  }
  if (!org.name?.startsWith(SANDBOX_PREFIX)) {
    console.error(
      `Refusing to delete "${org.name}" — its name doesn't start with "${SANDBOX_PREFIX}", ` +
        "so this doesn't look like a sandbox org this script created. Not touching it."
    );
    process.exit(1);
  }

  const { data: members } = await admin
    .from("organization_members")
    .select("user_id")
    .eq("organization_id", orgId);
  const memberUserIds = (members ?? []).map((m) => m.user_id);

  // Delete the org first — every org-scoped table cascades from
  // organizations(id) per this repo's migration convention (see
  // 001_foundation.sql), so this also clears organization_members,
  // call_log, chat_leads, etc. for this org.
  const { error: deleteOrgErr } = await admin.from("organizations").delete().eq("id", orgId);
  if (deleteOrgErr) {
    console.error("Failed to delete organization:", deleteOrgErr);
    process.exit(1);
  }
  console.log(`Deleted organization ${orgId} ("${org.name}").`);

  for (const userId of memberUserIds) {
    // Only delete a user if this was their only org — a real staff account
    // testing from their own login should never be deleted here.
    const { data: otherMemberships } = await admin
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", userId);
    if (otherMemberships && otherMemberships.length > 0) {
      console.log(`  Leaving user ${userId} — still belongs to another org.`);
      continue;
    }
    const { error: delUserErr } = await admin.auth.admin.deleteUser(userId);
    if (delUserErr) {
      console.error(`  Failed to delete user ${userId}:`, delUserErr);
    } else {
      console.log(`  Deleted user ${userId}.`);
    }
  }

  console.log("Cleanup complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
