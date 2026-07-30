import type { ComponentSpec } from "./types";

export function createCoreComponents(): ComponentSpec[] {
  return [
    {
      id: "global-header",
      type: "Header",
      purpose: "Orient visitors and expose the primary conversion path.",
      contentRequirements: [
        "Logo or wordmark",
        "Primary navigation",
        "Primary CTA",
        "Mobile navigation trigger"
      ],
      behavior: [
        "Responsive layout",
        "Visible keyboard focus",
        "Sticky only when it improves usability"
      ],
      conversionRole: "Primary navigation and CTA access"
    },
    {
      id: "hero-outcome",
      type: "Hero",
      purpose: "Explain the offer, audience, and outcome immediately.",
      contentRequirements: [
        "Audience-aware headline",
        "Specific value proposition",
        "Primary CTA",
        "Supporting proof",
        "Relevant visual"
      ],
      behavior: [
        "Readable above the fold",
        "CTA visible without interaction",
        "Responsive visual treatment"
      ],
      conversionRole: "Primary conversion initiation"
    },
    {
      id: "trust-proof",
      type: "TrustBar",
      purpose: "Reduce skepticism early in the page.",
      contentRequirements: [
        "Credentials, client logos, ratings, outcomes, or memberships",
        "Verifiable proof only"
      ],
      behavior: ["Accessible logo labels", "Responsive wrapping"],
      conversionRole: "Risk reduction"
    },
    {
      id: "benefit-grid",
      type: "BenefitGrid",
      purpose: "Translate features into visitor outcomes.",
      contentRequirements: [
        "Three to six benefit statements",
        "Short supporting explanation",
        "Optional iconography"
      ],
      behavior: ["Stack cleanly on mobile", "Maintain equal visual hierarchy"]
    },
    {
      id: "service-cards",
      type: "ServiceCards",
      purpose: "Present service options and route visitors to relevant detail.",
      contentRequirements: [
        "Service name",
        "Outcome-oriented description",
        "Detail link or CTA"
      ],
      behavior: ["Entire card keyboard accessible", "Consistent card heights"]
    },
    {
      id: "process-steps",
      type: "ProcessSteps",
      purpose: "Make the buying or onboarding process feel simple.",
      contentRequirements: ["Three to five steps", "Expected visitor action"],
      behavior: ["Ordered semantics", "Mobile-friendly progression"]
    },
    {
      id: "testimonial-grid",
      type: "Testimonials",
      purpose: "Demonstrate credible customer outcomes.",
      contentRequirements: [
        "Real customer statement",
        "Customer identity or context",
        "Specific result where available"
      ],
      behavior: ["Do not auto-rotate critical content", "Accessible citations"]
    },
    {
      id: "faq-accordion",
      type: "FAQ",
      purpose: "Resolve objections and support search discovery.",
      contentRequirements: [
        "Real buyer questions",
        "Direct answers",
        "No unsupported claims"
      ],
      behavior: ["Keyboard-operable disclosure controls"],
      conversionRole: "Objection handling"
    },
    {
      id: "lead-form",
      type: "LeadForm",
      purpose: "Capture qualified interest with minimal friction.",
      contentRequirements: [
        "Essential fields only",
        "Consent language",
        "Confirmation message",
        "Privacy link"
      ],
      behavior: [
        "Inline validation",
        "Accessible errors",
        "Server-side validation",
        "Spam protection"
      ],
      conversionRole: "Lead capture"
    },
    {
      id: "closing-cta",
      type: "ClosingCTA",
      purpose: "Give ready visitors a decisive final action.",
      contentRequirements: [
        "Outcome-focused headline",
        "Primary CTA",
        "Risk reducer"
      ],
      behavior: ["High contrast", "Single dominant action"],
      conversionRole: "Final conversion"
    },
    {
      id: "global-footer",
      type: "Footer",
      purpose: "Provide secondary navigation, trust, and compliance access.",
      contentRequirements: [
        "Contact information",
        "Navigation groups",
        "Privacy and terms",
        "Business identifiers where appropriate"
      ],
      behavior: ["Responsive columns", "Readable contrast"]
    }
  ];
}
