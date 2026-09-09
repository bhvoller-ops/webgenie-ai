/**
 * The persisted prospect domain — new in the P0 build (9 Sep 2026). Distinct
 * from finder.ts's `Business` (an ephemeral Google Places / sample result):
 * a `Prospect` is what a `Business` becomes once an agency user actually
 * opens it, so it can have an id, a status, an Opportunity Brief, and a
 * Next Best Action. See docs/history.md's P0 entry and
 * supabase/migrations/034_opportunity_brief_and_next_best_action.sql.
 */

export type ProspectStatus =
  | "new"
  | "audited"
  | "demo_ready"
  | "contacted"
  | "follow_up"
  | "won"
  | "lost"
  | "deprioritized";

export interface Prospect {
  id: string;
  organizationId: string;
  source: "finder" | "manual" | "import";
  googlePlaceId?: string;
  businessName: string;
  industry?: string;
  phone?: string;
  email?: string;
  websiteUrl?: string;
  hasWebsite: boolean;
  address?: string;
  city?: string;
  state?: string;
  rating?: number;
  reviewCount?: number;
  open24Hours: boolean;
  demoUrl?: string;
  projectId?: string;
  status: ProspectStatus;
  createdAt: string;
  updatedAt: string;
}

export type OpportunityLevel = "high" | "medium" | "low" | "insufficient_evidence";

/** WebGenie's own two real offer categories — never anything an LLM invents. See PRODUCT.md. */
export type RecommendedOffer =
  | "website_package" // Motion A — $297/mo: hosting, AI chat, voice receptionist, review automation, CRM
  | "audit_led_rebuild" // Motion B — $497 blueprint -> $2,500-6,000 build -> $497-997/mo retainer
  | null; // not enough evidence yet to recommend either

export interface EvidenceReference {
  type: string;
  sourceUrl: string;
  detail: string;
  weight: number;
}

export interface OpportunityBrief {
  id: string;
  prospectId: string;
  version: number;
  opportunityLevel: OpportunityLevel;
  summary: string;
  reasonsToContact: string[];
  topFindings: string[];
  recommendedOffer: RecommendedOffer;
  recommendedOfferReason: string | null;
  secondaryOpportunities: string[];
  salesAngle: string | null;
  suggestedOpener: string | null;
  confidence: number;
  evidenceReferences: EvidenceReference[];
  inputFingerprint: string;
  generatedAt: string;
}

export type NextBestActionKey =
  | "REVIEW_PROSPECT"
  | "RUN_AUDIT"
  | "GENERATE_DEMO"
  | "GENERATE_BLUEPRINT"
  | "CONTACT"
  | "SEND_AUDIT"
  | "SEND_DEMO"
  | "FOLLOW_UP"
  | "BOOK_MEETING"
  | "DEPRIORITIZE";

export type ActionPriority = "high" | "medium" | "low";

export interface NextBestAction {
  id: string;
  prospectId: string;
  action: NextBestActionKey;
  reason: string;
  priority: ActionPriority;
  dueAt: string | null;
  computedAt: string;
}

export const NEXT_BEST_ACTION_LABELS: Record<NextBestActionKey, string> = {
  REVIEW_PROSPECT: "Review prospect",
  RUN_AUDIT: "Run audit",
  GENERATE_DEMO: "Generate demo",
  GENERATE_BLUEPRINT: "Generate blueprint",
  CONTACT: "Contact prospect",
  SEND_AUDIT: "Send audit",
  SEND_DEMO: "Send demo",
  FOLLOW_UP: "Follow up",
  BOOK_MEETING: "Book meeting",
  DEPRIORITIZE: "Deprioritize"
};

export const RECOMMENDED_OFFER_LABELS: Record<Exclude<RecommendedOffer, null>, string> = {
  website_package: "$297/mo website package",
  audit_led_rebuild: "Audit-led rebuild ($497 blueprint → $2,500–6,000 build → $497–997/mo retainer)"
};
