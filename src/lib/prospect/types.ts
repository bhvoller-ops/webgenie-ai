/**
 * The persisted prospect domain — new in the P0 build (9 Sep 2026). Distinct
 * from finder.ts's `Business` (an ephemeral Google Places / sample result):
 * a `Prospect` is what a `Business` becomes once an agency user actually
 * opens it, so it can have an id, a status, an Opportunity Brief, and a
 * Next Best Action. See docs/history.md's P0 entry and
 * supabase/migrations/034_opportunity_brief_and_next_best_action.sql.
 */

/** P2 hard suppression reason vocabulary (migration 037) -- fixed, not user-extensible. */
export type SuppressionReason = "OPTED_OUT" | "DO_NOT_CONTACT" | "INVALID_CONTACT" | "MANUAL";

export type ProspectStatus =
  | "new"
  | "audited"
  | "demo_ready"
  | "contacted"
  | "follow_up"
  | "meeting"
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
  /**
   * "Import GMB Data" (P0.5, migration 035). Undefined/null before that
   * migration is applied or before an import has ever run for this
   * prospect — read defensively everywhere, never assumed present.
   */
  publicProfile?: Record<string, unknown> | null;
  publicProfileSource?: string | null;
  publicProfileFetchedAt?: string | null;
  /** P2 hard suppression (migration 037) -- see lib/prospect/suppression.ts. Undefined/null before that migration applies, same defensive-read convention as publicProfile above. */
  suppressedAt?: string | null;
  suppressionReason?: SuppressionReason | null;
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

/**
 * P1: the Daily Prospecting Queue, Pitch Generator, and Demo Room. See
 * supabase/migrations/036_p1_action_pitch_demo_room.sql for the full
 * reasoning on why these are genuinely new tables vs. reused ones.
 */

/**
 * The P1 Daily Queue's own action vocabulary (master prompt section 7) —
 * deliberately richer than NextBestActionKey (which doesn't distinguish
 * a new-site demo from a redesign demo, or know about GMB import/reply
 * review at all). Reuses NextBestActionKey's shared terms verbatim
 * (REVIEW_PROSPECT, RUN_AUDIT, CONTACT, SEND_DEMO, FOLLOW_UP,
 * BOOK_MEETING, DEPRIORITIZE) rather than renaming them, so the two
 * vocabularies stay recognizably related, not competing.
 */
export type ProspectActionType =
  | "REVIEW_PROSPECT"
  | "IMPORT_GMB_DATA"
  | "RUN_AUDIT"
  | "BUILD_NEW_SITE_DEMO"
  | "CREATE_REDESIGN_DEMO"
  | "CONTACT"
  | "SEND_DEMO"
  | "FOLLOW_UP"
  | "BOOK_MEETING"
  | "REVIEW_REPLY"
  | "DEPRIORITIZE"
  // P2 (migration 037, Architecture Decision 2/3): a due Assisted Outreach
  // Sequence step reconciled into the SAME Queue every other action lives
  // in -- never a second queue. Which sequence/step/channel it is lives in
  // this row's own `metadata` jsonb (already existed since migration 036),
  // not a new column or a per-channel action type.
  | "SEQUENCE_STEP";

export const PROSPECT_ACTION_LABELS: Record<ProspectActionType, string> = {
  REVIEW_PROSPECT: "Review prospect",
  IMPORT_GMB_DATA: "Import GMB Data",
  RUN_AUDIT: "Run audit",
  BUILD_NEW_SITE_DEMO: "Build new site demo",
  CREATE_REDESIGN_DEMO: "Create redesign demo",
  CONTACT: "Contact",
  SEND_DEMO: "Send demo",
  FOLLOW_UP: "Follow up",
  BOOK_MEETING: "Book meeting",
  REVIEW_REPLY: "Review reply",
  DEPRIORITIZE: "Deprioritize",
  SEQUENCE_STEP: "Sequence step due"
};

/** The shape written into a SEQUENCE_STEP prospect_action's existing `metadata` jsonb column -- not a new column, see migration 037. */
export interface SequenceStepActionMetadata {
  sequenceId: string;
  sequenceStepId: string;
  enrollmentId: string;
  channel: SequenceStepChannel;
  sequenceName: string;
}

export type ProspectActionStatus = "PENDING" | "COMPLETED" | "SKIPPED" | "SNOOZED";
export type ProspectActionSource = "SYSTEM" | "USER";

export interface ProspectAction {
  id: string;
  organizationId: string;
  prospectId: string;
  actionType: ProspectActionType;
  priority: ActionPriority;
  reason: string;
  dueAt: string | null;
  status: ProspectActionStatus;
  source: ProspectActionSource;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export type ProspectActivityType =
  | "PROSPECT_OPENED"
  | "GMB_DATA_IMPORTED"
  | "AUDIT_COMPLETED"
  | "DEMO_GENERATED"
  | "PITCH_GENERATED"
  | "CONTACT_ATTEMPTED"
  | "FOLLOW_UP_SCHEDULED"
  | "MEETING_LOGGED"
  | "DEMO_ROOM_SHARED"
  | "PROSPECT_WON"
  | "PROSPECT_LOST"
  // P2 (migration 037). Each means exactly what it says -- SEQUENCE_ENROLLED
  // never implies contact occurred; SEQUENCE_STEP_DUE never implies the user
  // performed it. Performing a step reuses CONTACT_ATTEMPTED (tagged with
  // sequenceId/sequenceStepId in metadata) rather than a new "OUTREACH_
  // PERFORMED" type competing with it -- see the master prompt's own
  // "EVENT SEMANTICS" section, which names both as acceptable and CONTACT_
  // ATTEMPTED already exists with the exact right meaning.
  | "PROSPECT_SUPPRESSED"
  | "PROSPECT_UNSUPPRESSED"
  | "SEQUENCE_ENROLLED"
  | "SEQUENCE_STEP_DUE"
  | "SEQUENCE_PAUSED"
  | "SEQUENCE_RESUMED"
  | "SEQUENCE_STOPPED"
  | "SEQUENCE_COMPLETED";

export interface ProspectActivity {
  id: string;
  organizationId: string;
  prospectId: string;
  activityType: ProspectActivityType;
  channel: string | null;
  summary: string;
  metadata: Record<string, unknown>;
  occurredAt: string;
  createdBy: string | null;
}

export type PitchChannel = "call_opener" | "cold_email" | "sms" | "linkedin" | "voicemail" | "loom_intro";

export const PITCH_CHANNEL_LABELS: Record<PitchChannel, string> = {
  call_opener: "Call Opener",
  cold_email: "Cold Email",
  sms: "SMS",
  linkedin: "LinkedIn",
  voicemail: "Voicemail",
  loom_intro: "Loom Intro"
};

export interface Pitch {
  id: string;
  organizationId: string;
  prospectId: string;
  channel: PitchChannel;
  subject: string | null;
  body: string;
  sourceFingerprint: string;
  version: number;
  status: "draft" | "used";
  usedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type DemoRoomStatus = "draft" | "ready" | "shared" | "archived";

export interface DemoRoomFinding {
  label: string;
  detail: string;
}

export interface DemoRoom {
  id: string;
  organizationId: string;
  prospectId: string;
  projectId: string | null;
  publicToken: string;
  status: DemoRoomStatus;
  title: string;
  clientSafeFindings: DemoRoomFinding[];
  ctaLabel: string;
  ctaUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * P2: Assisted Outreach Sequences -- human-executed (migration 037,
 * Architecture Decisions 1/3/7). WebGenie never sends any of these itself;
 * a step's channel means "WebGenie can prepare/orchestrate this," never
 * "WebGenie can transmit it." See lib/prospect/sequence-engine.ts.
 */
export type SequenceStatus = "draft" | "active" | "archived";

export interface OutreachSequence {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  status: SequenceStatus;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export type SequenceStepChannel =
  | "CALL"
  | "EMAIL"
  | "SMS"
  | "LINKEDIN"
  | "VOICEMAIL"
  | "LOOM"
  | "SEND_DEMO"
  | "FOLLOW_UP"
  | "CUSTOM_TASK";

export const SEQUENCE_STEP_CHANNEL_LABELS: Record<SequenceStepChannel, string> = {
  CALL: "Call",
  EMAIL: "Email",
  SMS: "SMS",
  LINKEDIN: "LinkedIn",
  VOICEMAIL: "Voicemail",
  LOOM: "Loom",
  SEND_DEMO: "Send demo",
  FOLLOW_UP: "Follow up",
  CUSTOM_TASK: "Custom task"
};

export interface OutreachSequenceStep {
  id: string;
  sequenceId: string;
  stepOrder: number;
  channel: SequenceStepChannel;
  delayDays: number;
  instructions: string | null;
  createdAt: string;
}

/** UPPERCASE, matching prospect_actions.status's operational-lifecycle convention -- this is a live state machine, not a content/definition row. */
export type SequenceEnrollmentStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "STOPPED";

export interface ProspectSequenceEnrollment {
  id: string;
  organizationId: string;
  prospectId: string;
  sequenceId: string;
  status: SequenceEnrollmentStatus;
  currentStepOrder: number;
  nextStepDueAt: string | null;
  startedAt: string;
  pausedAt: string | null;
  stoppedAt: string | null;
  completedAt: string | null;
  stoppedReason: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * P2: Won Client Handoff (migration 037, Architecture Decision 12). One
 * row per prospect -- created lazily the first time a handoff is touched,
 * not automatically on WON. `agreedScope`/`agreedPrice` are ONLY ever set
 * by an explicit human confirmation; nothing in this codebase may write
 * them from an AI recommendation (see opportunity_briefs.recommendedOffer,
 * which stays a completely separate field on a separate table).
 */
export type HandoffStatus = "not_started" | "in_progress" | "ready";

export interface ProspectHandoff {
  prospectId: string;
  agreedScope: string | null;
  agreedPrice: number | null;
  approvedDemoReference: string | null;
  implementationNotes: string | null;
  status: HandoffStatus;
  confirmedAt: string | null;
  confirmedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * P2: Agency Launch Mode settings (migration 037, Architecture Decision
 * 11) -- one row per organization, same shape as org_branding. Purely
 * orchestration input; Launch Mode's actual progress is always derived
 * from real prospects/prospect_actions state, never stored here.
 */
export interface LaunchSettings {
  organizationId: string;
  targetIndustry: string | null;
  targetLocation: string | null;
  agencyOffer: string | null;
  preferredChannels: string[];
  dailyProspectingTarget: number | null;
  startedAt: string | null;
  completedAt: string | null;
  updatedAt: string;
}
