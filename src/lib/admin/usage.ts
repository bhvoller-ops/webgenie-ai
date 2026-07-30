import type { SupabaseClient } from "@supabase/supabase-js";
import { defaultPlans, type PlanKey, type UsageMetric } from "./plans";
export async function recordUsage(supabase: SupabaseClient, organizationId: string, metric: UsageMetric, actorUserId?: string, resourceId?: string) {
  const { error } = await supabase.from("usage_events").insert({ organization_id: organizationId, actor_user_id: actorUserId ?? null, metric, quantity: 1, resource_id: resourceId ?? null });
  if (error) throw new Error(error.message);
}
export async function assertWithinLimit(supabase: SupabaseClient, organizationId: string, planKey: string, metric: UsageMetric) {
  const plan = defaultPlans[(planKey in defaultPlans ? planKey : "starter") as PlanKey];
  const { data, error } = await supabase.rpc("current_period_usage", { org_id: organizationId, metric_name: metric });
  if (error) throw new Error(error.message);
  const used = Number(data ?? 0); const limit = plan.limits[metric];
  if (used >= limit) throw new Error(`${plan.name} plan limit reached for ${metric.replaceAll("_", " ")}.`);
  return { used, limit };
}
