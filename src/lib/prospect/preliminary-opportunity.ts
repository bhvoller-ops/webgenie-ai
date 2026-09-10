import type { Business } from "@/lib/sitegen/types";

/**
 * Preliminary Opportunity — P0.5. Computed directly on a raw Finder result
 * (a `Business`, before any Prospect row exists), answering a narrower
 * question than the deeper P0 Opportunity Brief: not "how bad is this
 * business's website" but "how worthwhile is this business for an agency
 * owner to investigate?" See the P0.5 master prompt, section 12.
 *
 * Deterministic only — no LLM anywhere in this file, matching the same
 * "deterministic first" principle already established for
 * lib/prospect/opportunity-level.ts and lib/prospect/next-best-action.ts.
 * Uses only data Finder/Google Places actually returns (rating, review
 * count, phone/website presence) — never infers revenue, ad budget, SEO
 * quality, or any other unverifiable signal. See section 13.
 */

export type PreliminaryOpportunityLevel = "high" | "medium" | "low" | "insufficient_data";
export type PreliminaryConfidence = "high" | "medium" | "low";
export type WebsiteStatus = "present" | "absent" | "unknown";

export type PreliminaryNextStep =
  | "OPEN_OPPORTUNITY"
  | "IMPORT_GMB_DATA"
  | "RUN_AUDIT"
  | "BUILD_NEW_SITE_DEMO"
  | "CREATE_REDESIGN_DEMO"
  | "REVIEW"
  | "SKIP";

/** Evidence provenance — never generated prose, always traceable to a real source. See section 14. */
export interface PreliminaryEvidence {
  type: string;
  value: string | number | boolean;
  source: "finder" | "google_places" | "website_audit";
  label: string;
}

export interface PreliminaryReason {
  text: string;
}

export interface PreliminaryOpportunity {
  level: PreliminaryOpportunityLevel;
  score: number;
  confidence: PreliminaryConfidence;
  reasons: PreliminaryReason[];
  evidence: PreliminaryEvidence[];
  websiteStatus: WebsiteStatus;
  recommendedNextStep: PreliminaryNextStep;
  generatedAt: string;
}

export const PRELIMINARY_LEVEL_LABELS: Record<PreliminaryOpportunityLevel, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  insufficient_data: "Needs Data"
};

export const NEXT_STEP_LABELS: Record<PreliminaryNextStep, string> = {
  OPEN_OPPORTUNITY: "View Opportunity",
  IMPORT_GMB_DATA: "Import GMB Data",
  RUN_AUDIT: "Run Audit",
  BUILD_NEW_SITE_DEMO: "Build New Site Demo",
  CREATE_REDESIGN_DEMO: "Create Redesign Demo",
  REVIEW: "Review Prospect",
  SKIP: "Skip"
};

/** Only the fields this scoring actually reads — deliberately narrow so callers can pass a Business, a Prospect, or a hand-built object interchangeably. */
export type PreliminarySignals = Pick<Business, "website" | "rating" | "reviewCount" | "phone" | "isLikelyChain">;

/** Present only once a real audit exists for this business (it will have become a Prospect by then). Reuses the same deterministic scale lib/prospect/opportunity-level.ts already established, so a Finder row and its opened Prospect never disagree about what "audited" means. */
export interface ExistingAuditContext {
  hasCompletedAudit: boolean;
  auditOverallScore?: number | null;
}

function websiteStatusOf(website: Business["website"]): WebsiteStatus {
  if (website === undefined) return "unknown";
  return website ? "present" : "absent";
}

export function computePreliminaryOpportunity(
  business: PreliminarySignals,
  existingAudit?: ExistingAuditContext | null
): PreliminaryOpportunity {
  const websiteStatus = websiteStatusOf(business.website);
  const hasWebsite = websiteStatus === "present";
  const hasPhone = Boolean(business.phone && business.phone.trim());
  const rating = typeof business.rating === "number" ? business.rating : undefined;
  const reviewCount = typeof business.reviewCount === "number" ? business.reviewCount : undefined;
  const generatedAt = new Date().toISOString();

  const evidence: PreliminaryEvidence[] = [];
  if (rating !== undefined) {
    evidence.push({ type: "google_rating", value: rating, source: "google_places", label: `${rating.toFixed(1)}★ rating` });
  }
  if (reviewCount !== undefined) {
    evidence.push({ type: "google_review_count", value: reviewCount, source: "google_places", label: `${reviewCount} reviews` });
  }
  evidence.push({
    type: "website_status",
    value: websiteStatus,
    source: "finder",
    label: websiteStatus === "present" ? "Website present" : websiteStatus === "absent" ? "No website listed" : "Website status unknown"
  });
  evidence.push({
    type: "phone_availability",
    value: hasPhone,
    source: "google_places",
    label: hasPhone ? "Phone available" : "No phone on file"
  });
  if (business.isLikelyChain) {
    evidence.push({ type: "multi_location_signal", value: true, source: "finder", label: "Possible multi-location brand" });
  }
  if (existingAudit?.hasCompletedAudit && typeof existingAudit.auditOverallScore === "number") {
    evidence.push({
      type: "audit_score",
      value: existingAudit.auditOverallScore,
      source: "website_audit",
      label: `Audited: ${existingAudit.auditOverallScore}/100`
    });
  }

  // Once a real audit exists, defer to it entirely — one canonical
  // audited-opportunity definition (opportunity-level.ts), not a second
  // one that could quietly disagree. Section 34: "AUDIT COMPLETE + existing
  // P0 NBA available -> use deeper P0 NBA."
  if (existingAudit?.hasCompletedAudit) {
    const auditScore = existingAudit.auditOverallScore;
    let level: PreliminaryOpportunityLevel = "insufficient_data";
    if (typeof auditScore === "number") {
      level = auditScore < 45 ? "high" : auditScore < 65 ? "medium" : "low";
    }
    return {
      level,
      score: typeof auditScore === "number" ? Math.max(0, 100 - auditScore) : 0,
      confidence: "high",
      reasons: [
        {
          text:
            typeof auditScore === "number"
              ? `Real audit complete — scored ${auditScore}/100. Deeper prospect workspace has the full brief.`
              : "Real audit complete — open the full prospect workspace for the evidence-backed brief."
        }
      ],
      evidence,
      websiteStatus,
      recommendedNextStep: level === "low" ? "REVIEW" : "CREATE_REDESIGN_DEMO",
      generatedAt
    };
  }

  const dataPointCount = [rating !== undefined, reviewCount !== undefined, hasPhone].filter(Boolean).length;

  if (dataPointCount === 0) {
    return {
      level: "insufficient_data",
      score: 0,
      confidence: "low",
      reasons: [{ text: "No rating, review count, or phone on file yet — not enough public data to judge." }],
      evidence,
      websiteStatus,
      recommendedNextStep: hasWebsite ? "REVIEW" : "IMPORT_GMB_DATA",
      generatedAt
    };
  }

  // Deterministic 0-100 score from real public signals only. Weighted so a
  // strong, well-reviewed business (with or without a website) scores high
  // — no website alone is never sufficient for "high" (section 12).
  let score = 0;
  if (reviewCount !== undefined) {
    if (reviewCount >= 250) score += 45;
    else if (reviewCount >= 100) score += 38;
    else if (reviewCount >= 50) score += 30;
    else if (reviewCount >= 20) score += 22;
    else if (reviewCount >= 5) score += 12;
    else score += 4;
  }
  if (rating !== undefined) {
    if (rating >= 4.5) score += 25;
    else if (rating >= 4.0) score += 16;
    else if (rating >= 3.5) score += 8;
    else score -= 8;
  }
  if (hasPhone) score += 15;
  if (business.isLikelyChain) score -= 15;
  score = Math.max(0, Math.min(100, score));

  const reasons: PreliminaryReason[] = [];
  if (reviewCount !== undefined && reviewCount >= 50) {
    reasons.push({ text: `${reviewCount} Google reviews — an established, findable business.` });
  }
  if (rating !== undefined && rating >= 4.5) {
    reasons.push({ text: `${rating.toFixed(1)}★ rating — strong reputation to build a pitch around.` });
  }
  if (hasPhone) reasons.push({ text: "Real phone number on file — reachable for a call." });
  if (!hasWebsite) reasons.push({ text: "No website listed — the $297/mo package is a clean, direct pitch." });
  if (business.isLikelyChain) {
    reasons.push({ text: "Looks like a multi-location brand — often a harder cold-outreach target." });
  }
  if (reasons.length === 0) {
    reasons.push({ text: "Limited public data available — worth a closer look before deciding." });
  }

  const confidence: PreliminaryConfidence = dataPointCount >= 3 ? "high" : dataPointCount === 2 ? "medium" : "low";

  let level: PreliminaryOpportunityLevel;
  if (score >= 60) level = "high";
  else if (score >= 30) level = "medium";
  else level = "low";
  // A single weak signal isn't enough to call it "low" with confidence — be
  // honest that there isn't enough data instead of implying a real judgment.
  if (confidence === "low" && dataPointCount <= 1) level = "insufficient_data";

  let recommendedNextStep: PreliminaryNextStep;
  if (level === "insufficient_data") {
    recommendedNextStep = hasWebsite ? "REVIEW" : "IMPORT_GMB_DATA";
  } else if (hasWebsite) {
    recommendedNextStep = "RUN_AUDIT";
  } else {
    recommendedNextStep = "BUILD_NEW_SITE_DEMO";
  }

  return { level, score, confidence, reasons, evidence, websiteStatus, recommendedNextStep, generatedAt };
}
