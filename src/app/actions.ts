"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generatePromptsForBlueprint } from "@/lib/jobs/generate-prompts";
import { promptPlatforms } from "@/lib/prompts/types";
import { generateContentForBlueprint } from "@/lib/jobs/generate-content";
import { copyTones } from "@/lib/copy/types";
import { runProjectOrchestration } from "@/lib/jobs/run-orchestration";
import { createProjectDelivery } from "@/lib/jobs/create-delivery";
import { deliveryTargets } from "@/lib/delivery/types";
import { assertWithinLimit, recordUsage } from "@/lib/admin/usage";

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

  if (!user) throw new Error("Authentication required.");

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

  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .insert({ name: "My WebGenie Workspace" })
    .select("id")
    .single();

  if (organizationError || !organization) {
    throw new Error(organizationError?.message ?? "Unable to create workspace.");
  }

  const { error: membershipError } = await supabase
    .from("organization_members")
    .insert({
      organization_id: organization.id,
      user_id: user.id,
      role: "owner"
    });

  if (membershipError) throw new Error(membershipError.message);

  return { supabase, user, organizationId: organization.id, planKey: "starter" };
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

export async function inviteTeamMemberAction(formData: FormData) {
  const email = z.string().email().parse(formData.get("email"));
  const role = z.enum(["admin", "editor", "viewer"]).parse(formData.get("role"));
  const { supabase, user, organizationId } = await getUserAndOrganization();
  const { data: membership } = await supabase.from("organization_members").select("role").eq("organization_id", organizationId).eq("user_id", user.id).single();
  if (!membership || !["owner", "admin"].includes(membership.role)) throw new Error("Team administration permission required.");
  const tokenHash = (await import("node:crypto")).createHash("sha256").update((await import("node:crypto")).randomBytes(32)).digest("hex");
  const { error } = await supabase.from("team_invitations").upsert({ organization_id: organizationId, email: email.toLowerCase(), role, token_hash: tokenHash, invited_by: user.id, expires_at: new Date(Date.now() + 7 * 86400000).toISOString(), accepted_at: null }, { onConflict: "organization_id,email" });
  if (error) throw new Error(error.message);
  await supabase.from("audit_logs").insert({ organization_id: organizationId, actor_user_id: user.id, action: "team.invited", target_type: "email", target_id: email.toLowerCase(), metadata: { role } });
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

export async function addCallLogEntryAction(formData: FormData) {
  const businessName = z.string().min(1).max(160).parse(formData.get("businessName"));
  const phone = z.string().min(1).max(40).parse(formData.get("phone"));
  const industry = z.string().max(80).optional().parse(formData.get("industry")?.toString() || undefined);
  const city = z.string().max(80).optional().parse(formData.get("city")?.toString() || undefined);
  const state = z.string().max(20).optional().parse(formData.get("state")?.toString() || undefined);
  const demoUrl = z.string().url().optional().parse(formData.get("demoUrl")?.toString() || undefined);

  const { supabase, user, organizationId } = await getUserAndOrganization();
  const { error } = await supabase.from("call_log").insert({
    organization_id: organizationId,
    business_name: businessName,
    phone,
    industry: industry ?? null,
    city: city ?? null,
    state: state ?? null,
    demo_url: demoUrl ?? null,
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

  const { error } = await supabase.from("call_log").update(update).eq("id", id).eq("organization_id", organizationId);
  if (error) throw new Error(error.message);
  revalidatePath("/calls");
}
