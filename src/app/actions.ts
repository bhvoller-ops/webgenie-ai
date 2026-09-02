"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createClientCheckoutSession } from "@/lib/stripe";
import { generatePromptsForBlueprint } from "@/lib/jobs/generate-prompts";
import { promptPlatforms } from "@/lib/prompts/types";
import { generateContentForBlueprint } from "@/lib/jobs/generate-content";
import { copyTones } from "@/lib/copy/types";
import { runProjectOrchestration } from "@/lib/jobs/run-orchestration";
import { createProjectDelivery } from "@/lib/jobs/create-delivery";
import { deliveryTargets } from "@/lib/delivery/types";
import { assertWithinLimit, recordUsage } from "@/lib/admin/usage";
import { buildReferralCode } from "@/lib/partners";
import { notifyPartnerCommission } from "@/lib/partners/notify";
import { requirePartnerPage } from "@/lib/auth/access";

const projectSchema = z.object({
  name: z.string().min(2).max(120),
  industry: z.string().min(2).max(120),
  primaryGoal: z.string().min(2).max(120),
  primaryCta: z.string().min(2).max(160)
});

const referenceSchema = z.object({
  projectId: z.string().uuid(),
  url: z.string().url(),
  role: z.enum(["current_site", "competitor", "inspiration", "benchmark"])
});

async function getUserAndOrganization() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  // A thrown Error here crashes to Next's generic "server-side exception"
  // page — there's no error boundary anywhere in the app to catch it. This
  // fires whenever a Supabase session has expired (tokens last ~1hr) while a
  // tab sat open, which is routine, not exceptional. Redirect instead: every
  // action in this file goes through here, so this one change covers all of
  // them rather than patching each call site's crash individually.
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membership) {
    const { data: organization } = await supabase.from("organizations").select("plan_key").eq("id", membership.organization_id).single();
    return { supabase, user, organizationId: membership.organization_id, planKey: organization?.plan_key ?? "starter" };
  }

  // Direct authenticated-role inserts into organizations hit an unresolved RLS
  // rejection despite a correct with-check(true) policy; bootstrap goes
  // through a SECURITY DEFINER RPC instead. See migration 013.
  const { data: organizationId, error: bootstrapError } = await supabase.rpc("bootstrap_organization");
  if (bootstrapError || !organizationId) {
    throw new Error(bootstrapError?.message ?? "Unable to create workspace.");
  }

  return { supabase, user, organizationId, planKey: "starter" };
}

export async function createProject(formData: FormData) {
  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    industry: formData.get("industry"),
    primaryGoal: formData.get("primaryGoal"),
    primaryCta: formData.get("primaryCta")
  });

  if (!parsed.success) throw new Error("Invalid project details.");

  const { supabase, user, organizationId, planKey } = await getUserAndOrganization();
  await assertWithinLimit(supabase, organizationId, planKey, "projects");

  const { data, error } = await supabase
    .from("projects")
    .insert({
      organization_id: organizationId,
      created_by: user.id,
      name: parsed.data.name,
      industry: parsed.data.industry,
      primary_goal: parsed.data.primaryGoal,
      primary_cta: parsed.data.primaryCta,
      status: "draft"
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Unable to create project.");
  await recordUsage(supabase, organizationId, "projects", user.id, data.id);
  redirect(`/projects/${data.id}`);
}

export async function addReference(formData: FormData) {
  const parsed = referenceSchema.safeParse({
    projectId: formData.get("projectId"),
    url: formData.get("url"),
    role: formData.get("role")
  });

  if (!parsed.success) throw new Error("Invalid reference.");

  const { supabase } = await getUserAndOrganization();
  const normalizedUrl = new URL(parsed.data.url);
  normalizedUrl.hash = "";

  const { error } = await supabase.from("website_references").insert({
    project_id: parsed.data.projectId,
    url: normalizedUrl.toString(),
    role: parsed.data.role,
    priority: 3,
    validation_status: "pending"
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${parsed.data.projectId}`);
}

export async function startAnalysis(formData: FormData) {
  const projectId = z.string().uuid().parse(formData.get("projectId"));
  const { supabase, user, organizationId, planKey } = await getUserAndOrganization();
  await assertWithinLimit(supabase, organizationId, planKey, "analyses");

  const { data, error } = await supabase.from("analysis_jobs").insert({
    project_id: projectId,
    status: "queued",
    progress: 0,
    current_stage: "queued"
  }).select("id").single();

  if (error || !data) throw new Error(error?.message ?? "Unable to queue analysis.");
  await recordUsage(supabase, organizationId, "analyses", user.id, data.id);
  revalidatePath(`/projects/${projectId}`);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}


export async function generatePromptPackageAction(formData: FormData) {
  const blueprintId = z.string().uuid().parse(formData.get("blueprintId"));
  const projectId = z.string().uuid().parse(formData.get("projectId"));
  const platform = z.enum(promptPlatforms).parse(formData.get("platform"));
  const { supabase, user, organizationId, planKey } = await getUserAndOrganization();
  await assertWithinLimit(supabase, organizationId, planKey, "prompt_packages");
  const packageId = await generatePromptsForBlueprint(blueprintId, platform);
  await recordUsage(supabase, organizationId, "prompt_packages", user.id, packageId);
  revalidatePath(`/projects/${projectId}`);
}


export async function generateContentPackageAction(formData: FormData) {
  const blueprintId = z.string().uuid().parse(formData.get("blueprintId"));
  const projectId = z.string().uuid().parse(formData.get("projectId"));
  const tone = z.enum(copyTones).parse(formData.get("tone"));
  const { supabase, user, organizationId, planKey } = await getUserAndOrganization();
  await assertWithinLimit(supabase, organizationId, planKey, "content_packages");
  const packageId = await generateContentForBlueprint(blueprintId, {
    tone,
    readingLevel: "general",
    includeSeo: true,
    includeFaqs: true,
    avoidClaims: []
  });
  await recordUsage(supabase, organizationId, "content_packages", user.id, packageId);
  revalidatePath(`/projects/${projectId}`);
}


export async function runOrchestrationAction(formData: FormData) {
  const projectId = z.string().uuid().parse(formData.get("projectId"));
  const blueprintId = z.string().uuid().parse(formData.get("blueprintId"));
  const contentPackageValue = formData.get("contentPackageId");
  const promptPackageValue = formData.get("promptPackageId");
  const contentPackageId = contentPackageValue ? z.string().uuid().parse(contentPackageValue) : undefined;
  const promptPackageId = promptPackageValue ? z.string().uuid().parse(promptPackageValue) : undefined;
  const { user } = await getUserAndOrganization();
  const runId = await runProjectOrchestration({ projectId, blueprintId, contentPackageId, promptPackageId, createdBy: user.id });
  redirect(`/projects/${projectId}/orchestration/${runId}`);
}

export async function approveOrchestrationAction(formData: FormData) {
  const projectId = z.string().uuid().parse(formData.get("projectId"));
  const runId = z.string().uuid().parse(formData.get("runId"));
  const note = z.string().max(1000).optional().parse(formData.get("note")?.toString() || undefined);
  const { supabase, user } = await getUserAndOrganization();
  const { error } = await supabase.from("orchestration_runs").update({ status: "approved", approval_note: note ?? null, approved_by: user.id, approved_at: new Date().toISOString() }).eq("id", runId).eq("project_id", projectId);
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}/orchestration/${runId}`);
  revalidatePath(`/projects/${projectId}`);
}

export async function rejectOrchestrationAction(formData: FormData) {
  const projectId = z.string().uuid().parse(formData.get("projectId"));
  const runId = z.string().uuid().parse(formData.get("runId"));
  const note = z.string().min(3).max(1000).parse(formData.get("note"));
  const { supabase } = await getUserAndOrganization();
  const { error } = await supabase.from("orchestration_runs").update({ status: "rejected", approval_note: note }).eq("id", runId).eq("project_id", projectId);
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}/orchestration/${runId}`);
  revalidatePath(`/projects/${projectId}`);
}


export async function createDeliveryAction(formData: FormData) {
  const projectId = z.string().uuid().parse(formData.get("projectId"));
  const blueprintId = z.string().uuid().parse(formData.get("blueprintId"));
  const target = z.enum(deliveryTargets).parse(formData.get("target"));
  const contentValue = formData.get("contentPackageId");
  const promptValue = formData.get("promptPackageId");
  const reviewValue = formData.get("orchestrationRunId");
  const { supabase, user, organizationId, planKey } = await getUserAndOrganization();
  await assertWithinLimit(supabase, organizationId, planKey, "deliveries");
  const deliveryId = await createProjectDelivery({
    projectId,
    blueprintId,
    target,
    createdBy: user.id,
    contentPackageId: contentValue ? z.string().uuid().parse(contentValue) : undefined,
    promptPackageId: promptValue ? z.string().uuid().parse(promptValue) : undefined,
    orchestrationRunId: reviewValue ? z.string().uuid().parse(reviewValue) : undefined
  });
  await recordUsage(supabase, organizationId, "deliveries", user.id, deliveryId);
  redirect(`/projects/${projectId}/delivery/${deliveryId}`);
}

// inviteTeamMemberAction used to live here. Removed 30 Aug 2026 — it hashed
// random bytes directly and never captured/returned the raw pre-image, so
// the team_invitations row it created could never actually be turned into
// a working /invite/[token] link. Replaced by POST /api/team/invite (same
// correct pattern as /api/partners/invite), called from the new
// InviteTeamMemberForm client component on /settings.

export async function revokeInvitationAction(formData: FormData) {
  const invitationId = z.string().uuid().parse(formData.get("invitationId"));
  const { supabase, user, organizationId } = await getUserAndOrganization();
  await requireAdminMembership(supabase, organizationId, user.id);
  // Works for both agency-staff and partner invites — same table, no
  // role filter needed since it's scoped to this org and this specific row.
  const { error } = await supabase.from("team_invitations").delete().eq("id", invitationId).eq("organization_id", organizationId);
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
  revalidatePath("/partners");
}

export async function removeMemberAction(formData: FormData) {
  const memberUserId = z.string().uuid().parse(formData.get("memberUserId"));
  const { supabase, user, organizationId } = await getUserAndOrganization();
  const { data: membership } = await supabase.from("organization_members").select("role").eq("organization_id", organizationId).eq("user_id", user.id).single();
  if (membership?.role !== "owner") throw new Error("Only an owner can remove members.");
  if (memberUserId === user.id) throw new Error("You can't remove yourself. Have another owner do it.");
  const { error } = await supabase.from("organization_members").delete().eq("organization_id", organizationId).eq("user_id", memberUserId).neq("role", "owner");
  if (error) throw new Error(error.message);
  await supabase.from("audit_logs").insert({ organization_id: organizationId, actor_user_id: user.id, action: "team.member_removed", target_type: "user", target_id: memberUserId, metadata: {} });
  revalidatePath("/settings");
}

export async function updateMemberRoleAction(formData: FormData) {
  const memberUserId = z.string().uuid().parse(formData.get("memberUserId"));
  const role = z.enum(["admin", "editor", "viewer"]).parse(formData.get("role"));
  const { supabase, user, organizationId } = await getUserAndOrganization();
  const { data: membership } = await supabase.from("organization_members").select("role").eq("organization_id", organizationId).eq("user_id", user.id).single();
  if (membership?.role !== "owner") throw new Error("Only an owner can change member roles.");
  const { error } = await supabase.from("organization_members").update({ role }).eq("organization_id", organizationId).eq("user_id", memberUserId).neq("role", "owner");
  if (error) throw new Error(error.message);
  await supabase.from("audit_logs").insert({ organization_id: organizationId, actor_user_id: user.id, action: "team.role_updated", target_type: "user", target_id: memberUserId, metadata: { role } });
  revalidatePath("/settings");
}

const brandingSchema = z.object({
  brandName: z.string().max(160).optional().or(z.literal("")),
  logoUrl: z.string().url().max(2000).optional().or(z.literal("")),
  faviconUrl: z.string().url().max(2000).optional().or(z.literal("")),
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional()
    .or(z.literal("")),
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional()
    .or(z.literal("")),
  supportEmail: z.string().email().max(200).optional().or(z.literal("")),
  supportPhone: z.string().max(40).optional().or(z.literal("")),
  primaryNiche: z.string().max(120).optional().or(z.literal(""))
});

/**
 * Any field left blank clears that field (null), not "leave unchanged" —
 * the form always submits the full current state, unlike a PATCH. Logo/
 * favicon URLs arrive already-uploaded (branding-form.tsx uploads directly
 * to the org-branding storage bucket client-side, under this org's own
 * RLS-scoped prefix, before submitting this action with the resulting
 * public URL) — this action never touches file bytes.
 */
export async function updateOrgBrandingAction(formData: FormData) {
  const { supabase, user, organizationId } = await getUserAndOrganization();
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", user.id)
    .single();
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    throw new Error("Only an owner or admin can change branding.");
  }

  const parsed = brandingSchema.parse({
    brandName: formData.get("brandName") ?? "",
    logoUrl: formData.get("logoUrl") ?? "",
    faviconUrl: formData.get("faviconUrl") ?? "",
    primaryColor: formData.get("primaryColor") ?? "",
    accentColor: formData.get("accentColor") ?? "",
    supportEmail: formData.get("supportEmail") ?? "",
    supportPhone: formData.get("supportPhone") ?? "",
    primaryNiche: formData.get("primaryNiche") ?? ""
  });

  const { error } = await supabase.from("org_branding").upsert(
    {
      organization_id: organizationId,
      brand_name: parsed.brandName || null,
      logo_url: parsed.logoUrl || null,
      favicon_url: parsed.faviconUrl || null,
      primary_color: parsed.primaryColor || null,
      accent_color: parsed.accentColor || null,
      support_email: parsed.supportEmail || null,
      support_phone: parsed.supportPhone || null,
      primary_niche: parsed.primaryNiche || null,
      updated_at: new Date().toISOString()
    },
    { onConflict: "organization_id" }
  );
  if (error) throw new Error(error.message);

  await supabase.from("audit_logs").insert({
    organization_id: organizationId,
    actor_user_id: user.id,
    action: "branding.updated",
    target_type: "organization",
    target_id: organizationId,
    metadata: {}
  });

  revalidatePath("/settings/branding");
}

/**
 * Marks the one-time VibeLabs welcome sequence (/vibelabs/welcome) done —
 * never re-shown after. Does not redirect itself: welcome-client.tsx calls
 * this before navigating on EVERY exit path (both "Open Lead Finder" and
 * "Skip to dashboard"), not just the skip path, so the flag reliably
 * reflects "did they get through this page" regardless of which way they
 * left it.
 *
 * Goes through the mark_vibelabs_onboarding_complete() RPC (migration
 * 030), not a direct .update() — organizations has never had an UPDATE
 * RLS policy, so a direct client update here silently affects zero rows
 * (confirmed live) rather than throwing, which is worse than an error.
 */
export async function completeVibelabsOnboardingAction() {
  const { supabase } = await getUserAndOrganization();
  const { error } = await supabase.rpc("mark_vibelabs_onboarding_complete");
  if (error) throw new Error(error.message);
}

export async function deleteMyAccountAction() {
  const { user } = await getUserAndOrganization();
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  // Organization rows, memberships, etc. cascade or are left as orphaned
  // history depending on each table's FK — this only removes the auth
  // identity itself, which is what "delete my account" means to the person
  // clicking it. Sign-out happens implicitly once the session's user is gone.
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) throw new Error(error.message);
  redirect("/login");
}

export async function revokeApiKeyAction(formData: FormData) {
  const apiKeyId = z.string().uuid().parse(formData.get("apiKeyId"));
  const { supabase, user, organizationId } = await getUserAndOrganization();
  const { data: membership } = await supabase.from("organization_members").select("role").eq("organization_id", organizationId).eq("user_id", user.id).single();
  if (!membership || !["owner", "admin"].includes(membership.role)) throw new Error("API-key administration permission required.");
  const { error } = await supabase.from("api_keys").update({ status: "revoked", revoked_at: new Date().toISOString() }).eq("id", apiKeyId).eq("organization_id", organizationId);
  if (error) throw new Error(error.message);
  await supabase.from("audit_logs").insert({ organization_id: organizationId, actor_user_id: user.id, action: "api_key.revoked", target_type: "api_key", target_id: apiKeyId });
  revalidatePath("/settings");
}

const callLogStatuses = ["not_called", "no_answer", "not_interested", "agreed_to_see_site", "viewed_site", "closed", "lost"] as const;

/**
 * A prospect's demo URL is convenience metadata, not something worth crashing
 * the whole call tracker over. Accept a bare domain (add https://), and if
 * it's still not a usable URL after that, drop it silently rather than throw —
 * closing a sale should never block on a formatting nitpick in an optional field.
 */
function normalizeOptionalUrl(raw: string | undefined): string | undefined {
  const trimmed = raw?.trim();
  if (!trimmed) return undefined;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const result = z.string().url().safeParse(withScheme);
  return result.success ? result.data : undefined;
}

export async function addCallLogEntryAction(formData: FormData) {
  const businessName = z.string().min(1).max(160).parse(formData.get("businessName"));
  const phone = z.string().min(1).max(40).parse(formData.get("phone"));
  const industry = z.string().max(80).optional().parse(formData.get("industry")?.toString() || undefined);
  const city = z.string().max(80).optional().parse(formData.get("city")?.toString() || undefined);
  const state = z.string().max(20).optional().parse(formData.get("state")?.toString() || undefined);
  const demoUrl = normalizeOptionalUrl(formData.get("demoUrl")?.toString());
  const partnerId = z.string().uuid().optional().parse(formData.get("partnerId")?.toString() || undefined);

  const { supabase, user, organizationId } = await getUserAndOrganization();
  const { error } = await supabase.from("call_log").insert({
    organization_id: organizationId,
    business_name: businessName,
    phone,
    industry: industry ?? null,
    city: city ?? null,
    state: state ?? null,
    demo_url: demoUrl ?? null,
    partner_id: partnerId ?? null,
    created_by: user.id
  });
  if (error) throw new Error(error.message);
  revalidatePath("/calls");
}

export async function updateCallLogEntryAction(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const status = z.enum(callLogStatuses).parse(formData.get("status"));
  const followUpDays = formData.get("followUpDays")?.toString();
  const notes = formData.get("notes")?.toString();
  const partnerIdRaw = formData.get("partnerId")?.toString();

  const { supabase, organizationId } = await getUserAndOrganization();

  const update: Record<string, unknown> = {
    status,
    last_contacted_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  if (notes !== undefined) update.notes = notes || null;
  if (followUpDays === "clear") {
    update.follow_up_due_at = null;
  } else if (followUpDays) {
    const days = z.coerce.number().int().min(1).max(30).parse(followUpDays);
    update.follow_up_due_at = new Date(Date.now() + days * 86400000).toISOString();
  }
  // "" from the "No change" option leaves the existing partner alone; only a
  // real uuid or the explicit "none" sentinel touches partner_id.
  if (partnerIdRaw === "none") {
    update.partner_id = null;
  } else if (partnerIdRaw) {
    update.partner_id = z.string().uuid().parse(partnerIdRaw);
  }

  const { error } = await supabase.from("call_log").update(update).eq("id", id).eq("organization_id", organizationId);
  if (error) throw new Error(error.message);
  revalidatePath("/calls");
  revalidatePath("/partners");
}

const partnerStatuses = ["active", "inactive"] as const;

// Defense in depth on top of migration 022's "admins manage partners" RLS
// policy, which already rejects these at the database layer for anyone
// who isn't owner/admin (including a partner's own portal login, which
// deliberately has no organization_members row at all — see that
// migration). This just turns a raw RLS 42501 into a clear message.
async function requireAdminMembership(supabase: Awaited<ReturnType<typeof createClient>>, organizationId: string, userId: string) {
  const { data: membership } = await supabase.from("organization_members").select("role").eq("organization_id", organizationId).eq("user_id", userId).single();
  if (!membership || !["owner", "admin"].includes(membership.role)) throw new Error("Admin access required.");
}

export async function addPartnerAction(formData: FormData) {
  const name = z.string().min(1).max(160).parse(formData.get("name"));
  const contactEmail = z.string().email().or(z.literal("")).parse(formData.get("contactEmail")?.toString() ?? "");
  const contactPhone = z.string().max(40).optional().parse(formData.get("contactPhone")?.toString() || undefined);
  const flatFee = z.coerce.number().min(0).max(100000).parse(formData.get("flatFee") || 100);
  const notes = z.string().max(2000).optional().parse(formData.get("notes")?.toString() || undefined);
  const referralCode = buildReferralCode(name, formData.get("referralCode")?.toString());

  const { supabase, user, organizationId } = await getUserAndOrganization();
  await requireAdminMembership(supabase, organizationId, user.id);
  const { error } = await supabase.from("partners").insert({
    organization_id: organizationId,
    name,
    contact_email: contactEmail || null,
    contact_phone: contactPhone ?? null,
    referral_code: referralCode,
    flat_fee: flatFee,
    notes: notes ?? null
  });
  if (error) {
    // Unique (organization_id, referral_code) violation — the auto-slugified
    // code collided with an existing partner. Surface something actionable
    // rather than a raw Postgres constraint message.
    if (error.message.toLowerCase().includes("duplicate")) {
      throw new Error(`Referral code "${referralCode}" is already in use by another partner — pick a different one.`);
    }
    throw new Error(error.message);
  }
  revalidatePath("/partners");
}

export async function updatePartnerAction(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const flatFee = z.coerce.number().min(0).max(100000).parse(formData.get("flatFee"));
  const status = z.enum(partnerStatuses).parse(formData.get("status"));
  const notes = formData.get("notes")?.toString();

  const { supabase, user, organizationId } = await getUserAndOrganization();
  await requireAdminMembership(supabase, organizationId, user.id);
  const update: Record<string, unknown> = { flat_fee: flatFee, status };
  if (notes !== undefined) update.notes = notes || null;

  const { error } = await supabase.from("partners").update(update).eq("id", id).eq("organization_id", organizationId);
  if (error) throw new Error(error.message);
  revalidatePath("/partners");
}

export async function markCommissionPaidAction(formData: FormData) {
  const callLogId = z.string().uuid().parse(formData.get("callLogId"));
  const { supabase, user, organizationId } = await getUserAndOrganization();
  await requireAdminMembership(supabase, organizationId, user.id);
  const { data: deal, error } = await supabase
    .from("call_log")
    .update({ commission_status: "paid" })
    .eq("id", callLogId)
    .eq("organization_id", organizationId)
    .eq("commission_status", "owed") // only a real owed commission can be marked paid
    .select("business_name, commission_amount, partner_id")
    .maybeSingle();
  if (error) throw new Error(error.message);

  if (deal?.partner_id) {
    const { data: partner } = await supabase.from("partners").select("name, contact_email").eq("id", deal.partner_id).maybeSingle();
    if (partner?.contact_email) {
      await notifyPartnerCommission({
        email: partner.contact_email,
        partnerName: partner.name,
        businessName: deal.business_name,
        amount: deal.commission_amount ?? 0,
        status: "paid",
        callLogId
      });
    }
  }

  revalidatePath("/partners");
}

export async function deletePartnerAction(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const { supabase, user, organizationId } = await getUserAndOrganization();
  await requireAdminMembership(supabase, organizationId, user.id);

  // call_log.partner_id is ON DELETE SET NULL (migration 020) — referred
  // deals survive, just lose their partner attribution, rather than being
  // deleted themselves.
  const { data: partner } = await supabase.from("partners").select("user_id").eq("id", id).eq("organization_id", organizationId).maybeSingle();

  const { error } = await supabase.from("partners").delete().eq("id", id).eq("organization_id", organizationId);
  if (error) throw new Error(error.message);

  // Also revoke their portal login, if they had one — otherwise a dangling
  // auth account remains that can sign in but (correctly) can no longer
  // see anything, which is confusing even though it's not a security gap.
  if (partner?.user_id) {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    await admin.auth.admin.deleteUser(partner.user_id);
  }

  revalidatePath("/partners");
}

export async function revokePartnerAccessAction(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const { supabase, user, organizationId } = await getUserAndOrganization();
  await requireAdminMembership(supabase, organizationId, user.id);

  const { data: partner } = await supabase.from("partners").select("user_id").eq("id", id).eq("organization_id", organizationId).maybeSingle();
  if (!partner?.user_id) throw new Error("This partner doesn't have portal access.");

  // Deletes the login only — the partners row (name, referral code, flat
  // fee, referred-deal history) is untouched. partners.user_id is
  // ON DELETE SET NULL (migration 022), so it clears automatically; no
  // separate update needed. They can be re-invited later from the same row.
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(partner.user_id);
  if (error) throw new Error(error.message);

  revalidatePath("/partners");
}

// Partner self-service — updates only their own contact phone, never any
// other column (flat_fee, status, name, referral_code stay admin-only).
// Uses the admin client scoped by MY code to exactly one column and one
// row (their own partnerId from requirePartnerPage()), rather than a new
// RLS UPDATE policy — a row-level policy can't restrict which columns a
// partner could change via a raw request, and this table shares the
// `authenticated` role with admin writes, so a column-level GRANT would
// have to apply to both alike. This way nothing but this action can move
// that column, and it can't touch any other row.
export async function updatePartnerContactAction(formData: FormData) {
  const { partnerId } = await requirePartnerPage();
  const contactPhone = z.string().max(40).optional().parse(formData.get("contactPhone")?.toString() || undefined);

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  const { error } = await admin.from("partners").update({ contact_phone: contactPhone || null }).eq("id", partnerId);
  if (error) throw new Error(error.message);

  revalidatePath("/partners/portal");
}

async function getBaseUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function startClientCheckoutAction(formData: FormData) {
  const callLogId = z.string().uuid().parse(formData.get("callLogId"));
  const { supabase, organizationId } = await getUserAndOrganization();
  const baseUrl = await getBaseUrl();
  const url = await createClientCheckoutSession({ supabase, callLogId, organizationId, baseUrl });
  redirect(url);
}

const chatLeadStatuses = ["new", "contacted", "closed", "spam"] as const;

export async function updateChatLeadStatusAction(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const status = z.enum(chatLeadStatuses).parse(formData.get("status"));

  const { supabase, organizationId } = await getUserAndOrganization();
  const { error } = await supabase.from("chat_leads").update({ status }).eq("id", id).eq("organization_id", organizationId);
  if (error) throw new Error(error.message);
  revalidatePath("/leads");
}
