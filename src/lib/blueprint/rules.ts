import type { WebsiteIntelligenceOutput } from "@/lib/intelligence/types";

export function findModuleScore(
  intelligence: WebsiteIntelligenceOutput,
  module: string
): number {
  return (
    intelligence.moduleScores.find((item) => item.module === module)?.score ?? 50
  );
}

export function hasRecommendation(
  intelligence: WebsiteIntelligenceOutput,
  titlePattern: RegExp
): boolean {
  return intelligence.topRecommendations.some((item) =>
    titlePattern.test(item.title)
  );
}

export function inferSiteSize(industry: string, goal: string): "small" | "medium" | "large" {
  const text = `${industry} ${goal}`.toLowerCase();

  if (/ecommerce|marketplace|directory|multi-location|franchise/.test(text)) {
    return "large";
  }

  if (/agency|contractor|clinic|dental|legal|consulting|saas|school/.test(text)) {
    return "medium";
  }

  return "small";
}
