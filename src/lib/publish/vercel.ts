import "server-only";

import { generateSite } from "@/lib/sitegen/generate";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Business } from "@/lib/sitegen/types";

/**
 * Publishes a generated site as a real, permanent, live-hosted Vercel
 * deployment on a subdomain of VERCEL_PUBLISH_DOMAIN — not the ephemeral
 * /api/demo-site link every other generated site uses.
 *
 * Idempotent by design: the Vercel *project* is keyed off the business's own
 * stable id (Google Place ID, or "sample_..."/"manual_..." for non-Places
 * sources), so publishing the same business again — after swapping a photo,
 * say — deploys a new version into the same project instead of creating a
 * duplicate. The *subdomain* is derived from the business name and only
 * changes if it collides with a different business's project.
 */
const VERCEL_API = "https://api.vercel.com";

export interface PublishResult {
  url: string;
  subdomain: string;
  projectName: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Publishing isn't configured yet — ${name} is missing.`);
  return value;
}

function vercelHeaders() {
  return {
    Authorization: `Bearer ${requireEnv("VERCEL_API_TOKEN")}`,
    "Content-Type": "application/json"
  };
}

function teamQuery(): string {
  const teamId = process.env.VERCEL_TEAM_ID;
  return teamId ? `?teamId=${teamId}` : "";
}

/** Lowercase, hyphenated, ASCII-only — safe for both Vercel project names and subdomains. */
function slugify(input: string, maxLength: number): string {
  // NFKD splits accented characters into a base letter + a combining mark
  // (é -> e + ´); the non-alphanumeric replace below strips the mark along
  // with everything else, leaving the plain ASCII base letter.
  const slug = input
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.slice(0, maxLength).replace(/-+$/g, "");
}

export async function publishBusinessSite(business: Business, organizationId?: string): Promise<PublishResult> {
  const domain = requireEnv("VERCEL_PUBLISH_DOMAIN");

  let builtBy: string | undefined;
  if (organizationId) {
    const { data: branding } = await createAdminClient()
      .from("org_branding")
      .select("brand_name")
      .eq("organization_id", organizationId)
      .maybeSingle();
    builtBy = branding?.brand_name ?? undefined;
  }

  const site = generateSite(business, { demoBadge: false, builtBy, organizationId });
  const projectName = `wg-${slugify(business.id, 50) || "site"}`;

  const deployRes = await fetch(`${VERCEL_API}/v13/deployments${teamQuery()}`, {
    method: "POST",
    headers: vercelHeaders(),
    body: JSON.stringify({
      name: projectName,
      project: projectName,
      target: "production",
      files: [{ file: "index.html", data: site.html }],
      projectSettings: { framework: null }
    })
  });
  if (!deployRes.ok) {
    throw new Error(`Vercel deployment failed: ${await deployRes.text()}`);
  }
  const deployment = await deployRes.json();
  const projectId: string | undefined = deployment.project?.id;

  const baseSlug = slugify(business.name, 40) || "client";
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const domainRes = await fetch(`${VERCEL_API}/v10/projects/${projectName}/domains${teamQuery()}`, {
      method: "POST",
      headers: vercelHeaders(),
      body: JSON.stringify({ name: `${candidate}.${domain}` })
    });
    if (domainRes.ok) {
      return { url: `https://${candidate}.${domain}`, subdomain: candidate, projectName };
    }

    const errBody = await domainRes.json().catch(() => null);
    const isConflict = domainRes.status === 409 && errBody?.error?.code === "domain_already_in_use";
    if (isConflict && errBody?.error?.projectId === projectId) {
      // Already attached to this same project from a previous publish of this business.
      return { url: `https://${candidate}.${domain}`, subdomain: candidate, projectName };
    }
    if (isConflict) continue; // taken by a different business — try the next suffix

    throw new Error(`Vercel domain assignment failed: ${errBody?.error?.message ?? domainRes.statusText}`);
  }
  throw new Error("Couldn't find an available subdomain after several attempts.");
}
