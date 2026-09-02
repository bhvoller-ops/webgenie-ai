export const planKeys = ["starter", "pro", "agency", "vibelabs"] as const;
export type PlanKey = (typeof planKeys)[number];
export type UsageMetric = "projects" | "analyses" | "content_packages" | "prompt_packages" | "deliveries" | "members" | "api_requests";

// "vibelabs" limits are placeholders (single small operator framing, not a
// confirmed number) — matches migration 028's plan_catalog row, which is
// the one to keep in sync if these change. Confirm real numbers before
// treating either as final.
export const defaultPlans: Record<PlanKey, { name: string; monthlyCents: number; limits: Record<UsageMetric, number> }> = {
  starter: { name: "Starter", monthlyCents: 2900, limits: { projects: 5, analyses: 20, content_packages: 20, prompt_packages: 20, deliveries: 10, members: 2, api_requests: 1000 } },
  pro: { name: "Pro", monthlyCents: 9900, limits: { projects: 50, analyses: 250, content_packages: 250, prompt_packages: 250, deliveries: 100, members: 10, api_requests: 25000 } },
  agency: { name: "Agency", monthlyCents: 24900, limits: { projects: 500, analyses: 2000, content_packages: 2000, prompt_packages: 2000, deliveries: 1000, members: 50, api_requests: 250000 } },
  vibelabs: { name: "VibeLabs Agency", monthlyCents: 9700, limits: { projects: 25, analyses: 100, content_packages: 100, prompt_packages: 100, deliveries: 50, members: 3, api_requests: 10000 } }
};
