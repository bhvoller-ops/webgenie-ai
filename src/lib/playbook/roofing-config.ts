import { HOME_SERVICES_BASE_CONFIG } from "./home-services-config";
import type { PlaybookConfig } from "./types";

/**
 * Roofing specialization -- the first Home Services variant. Overrides
 * only what genuinely differs (terminology, discovery prompts, evidence
 * categories); everything else (objection responses, booking close,
 * voicemail/email templates, offer shape, assessment structure) is
 * inherited unchanged from the Home Services foundation. This is the
 * pattern a later HVAC/plumbing/etc. config should follow -- a small
 * override object, not a parallel copy of the whole playbook.
 */
export const ROOFING_CONFIG: PlaybookConfig = {
  ...HOME_SERVICES_BASE_CONFIG,
  playbookName: "Roofing Live Outreach Playbook",
  industryKey: "roofer",
  terminology: {
    businessNoun: "roofing company",
    industryAdjective: "roofing",
    assessmentNoun: "roof inspection"
  },
  commonServices: [
    "roof inspections",
    "estimates",
    "roof repair",
    "roof replacement",
    "storm damage assessment",
    "insurance claim assistance",
    "emergency tarp/repair service"
  ],
  primaryCustomerAction: "request a roof inspection or estimate",
  discoveryQuestions: [
    { key: "lead_source", question: "How are most new roofing customers finding you right now?" },
    { key: "lead_volume", question: "Are you getting enough calls or estimate requests from your online presence?" },
    { key: "desired_action", question: "When someone finds you online, what action would you most want them to take — call, request an inspection, or something else?" },
    { key: "storm_damage_volume", question: "How much of your business right now is storm-damage or insurance-related work versus routine repair and replacement?" },
    { key: "service_areas", question: "Which cities or areas do you most want to serve?" },
    { key: "missed_calls", question: "Do calls or web leads ever go unanswered, especially after a storm?" },
    { key: "response_speed", question: "How quickly does your team normally respond to a new inspection request?" },
    { key: "current_owner", question: "Who currently manages your website and marketing?" },
    { key: "biggest_problem", question: "Would you say the bigger problem right now is lead volume, lead quality or follow-up?" }
  ],
  evidenceCategories: [
    { key: "wrong_market_content", label: "Wrong-market or template content", description: "Testimonials or service-area claims (e.g. a different state's cities) that don't match the roofing company's real, verified location." },
    { key: "broken_official_site", label: "Broken official website", description: "The roofing company's own primary pages fail to load or render for a real visitor." },
    { key: "no_owned_domain", label: "No dedicated owned domain", description: "The public web presence lives on a third-party builder subdomain (e.g. a Ueni or similar hosted page) rather than a domain the roofing company owns." },
    { key: "broken_estimate_form", label: "Demonstrably broken estimate form", description: "A real, verified attempt shows the estimate/inspection-request form does not submit or respond." },
    { key: "unclear_service_area", label: "Missing or unclear service area", description: "No page or section states which cities/areas the roofing company actually serves." },
    { key: "inconsistent_contact", label: "Inconsistent contact information", description: "Two or more credible sources disagree on the roofing company's phone number or address." },
    { key: "broken_conversion_path", label: "Materially broken conversion path", description: "No working way for a storm-damaged or interested homeowner to request an inspection." },
    { key: "outdated_service_info", label: "Outdated service information", description: "Service listings, licensing, or warranty information a reliable source shows is stale." },
    { key: "missing_project_proof", label: "Missing completed-project proof (when reliably verified)", description: "No before/after photos or completed-roof case studies, confirmed absent by a real, reliable check — not merely unobserved." },
    { key: "unclear_emergency_routing", label: "Unclear emergency-call routing (when reliably verified)", description: "No stated path for an urgent storm-damage/emergency tarp call, confirmed absent by a real, reliable check." }
  ],
  offer: {
    ...HOME_SERVICES_BASE_CONFIG.offer,
    scopeComponents: [
      "Conversion-focused roofing website",
      "Mobile-responsive design",
      "Service pages (repair, replacement, storm damage, inspections)",
      "Service-area pages",
      "Free inspection / estimate request flow",
      "Call and lead routing",
      "Reviews, certifications, warranties and completed-project proof",
      "Basic CRM/pipeline setup",
      "Approved follow-up workflow",
      "Analytics and tracking",
      "Domain and hosting coordination",
      "Review and approval milestones",
      "Launch and handoff"
    ]
  }
};
