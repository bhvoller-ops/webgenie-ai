import type { PlaybookConfig } from "./types";

/**
 * The reusable Home Services foundation. Generic to any local home-
 * services trade -- roofing, HVAC, plumbing, electrical, landscaping,
 * remodeling, restoration, pest control, cleaning. A specialized variant
 * (see roofing-config.ts) overrides only the fields that genuinely differ;
 * everything else here is the shared baseline so a future industry mostly
 * means a small override file, not a rebuild of the whole script set.
 *
 * Every script below is a human-read template, never sent automatically.
 * See the Human-Execution Rule -- WebGenie prepares and guides, it does
 * not place calls or send messages.
 */
export const HOME_SERVICES_BASE_CONFIG: PlaybookConfig = {
  playbookName: "Home Services Live Outreach Playbook",
  industryKey: "_default",
  terminology: {
    businessNoun: "home services business",
    assessmentNoun: "on-site assessment"
  },
  commonServices: ["repairs", "installations", "maintenance", "emergency service", "free estimates"],
  primaryCustomerAction: "request an estimate",
  discoveryQuestions: [
    { key: "lead_source", question: "How are most new customers finding you right now?" },
    { key: "lead_volume", question: "Are you getting enough calls or estimate requests from your online presence?" },
    { key: "desired_action", question: "When someone finds you online, what action would you most want them to take?" },
    { key: "profitable_service", question: "Which service is most profitable or most important for you to grow?" },
    { key: "service_areas", question: "Which locations do you most want to serve?" },
    { key: "missed_calls", question: "Do calls or web leads ever go unanswered?" },
    { key: "response_speed", question: "How quickly does your team normally respond to a new inquiry?" },
    { key: "current_owner", question: "Who currently manages your website and marketing?" },
    { key: "biggest_problem", question: "Would you say the bigger problem is lead volume, lead quality or follow-up?" }
  ],
  evidenceCategories: [
    { key: "wrong_market_content", label: "Wrong-market or template content", description: "Content, testimonials, or service-area claims that don't match the business's real, verified location." },
    { key: "broken_official_site", label: "Broken official website", description: "The site's own primary pages fail to load or render for a real visitor." },
    { key: "no_owned_domain", label: "No dedicated owned domain", description: "The public web presence lives on a third-party builder subdomain rather than a domain the business owns." },
    { key: "broken_form", label: "Demonstrably broken estimate form", description: "A form that a real, verified attempt shows does not submit or respond." },
    { key: "unclear_service_area", label: "Missing or unclear service area", description: "No page or section states which cities/areas the business actually serves." },
    { key: "inconsistent_contact", label: "Inconsistent contact information", description: "Two or more credible sources disagree on the business's phone number or address." },
    { key: "broken_conversion_path", label: "Materially broken conversion path", description: "No working way for an interested visitor to request an estimate or contact the business." },
    { key: "outdated_service_info", label: "Outdated service information", description: "Service listings, hours, or credentials that a reliable source shows are stale." },
    { key: "missing_project_proof", label: "Missing project proof (when reliably verified)", description: "No completed-project photos/case studies, confirmed absent by a real, reliable check -- not merely unobserved." },
    { key: "unclear_emergency_routing", label: "Unclear emergency-call routing (when reliably verified)", description: "No stated path for an urgent/emergency inquiry, confirmed absent by a real, reliable check." }
  ],
  openings: {
    gatekeeperOpening: "Hi, is this the owner or the person responsible for marketing at {{businessName}}?",
    gatekeeperWhatIsThisAbout:
      "It isn't a general sales pitch. I found a specific issue in the company's public online presence and would like to show the person responsible what I found. If it isn't useful, there's no obligation.",
    permissionOpening:
      "Great—my name is {{callerName}} with {{organizationName}}. I'll be brief. I was reviewing {{businessNoun}} companies around {{location}} and noticed something specific about {{businessName}}'s online presence. Do you have about 30 seconds?",
    verifiedObservationTemplate:
      "I reviewed {{evidenceTarget}}. I noticed {{verifiedObservation}}. That may {{restrainedImpact}}. We help {{industryLabel}} businesses improve how their online presence converts interested customers into real inquiries. I have a couple of practical recommendations. Would it be helpful if I shared them?"
  },
  objectionResponses: [
    {
      key: "already_have_website_person",
      label: "We already have a website person",
      response:
        "That makes sense. I'm not asking you to replace anyone today. I'm offering a second set of eyes on one customer-facing issue I observed. If the recommendation is useful, your existing person could even implement it."
    },
    {
      key: "enough_referrals",
      label: "We get enough referrals",
      response:
        "That's a good position to be in. The opportunity may not be replacing referrals—it may be helping referred prospects feel confident when they check you online before calling. Would improving that validation step be useful?"
    },
    {
      key: "send_email",
      label: "Send me an email",
      response:
        "Happy to. So I send something relevant rather than generic, should I focus on improving local credibility, generating more estimate requests or both?"
    },
    {
      key: "how_did_you_get_my_number",
      label: "How did you get my number?",
      response:
        "It was listed publicly with the business. I was researching {{businessNoun}} companies in the area. If you would rather not receive calls from us, I'll record that immediately."
    },
    {
      key: "how_much_does_it_cost",
      label: "How much does it cost?",
      response:
        "A focused website project and a complete client-acquisition system are different scopes. After the assessment, I'll give you a specific recommendation, deliverables and price without surprise add-ons."
    },
    {
      key: "im_busy",
      label: "I'm busy",
      response: "I understand. Give me ten seconds: I found {{verifiedObservation}}. Should I send the details, call at a better time or close this out?"
    },
    {
      key: "not_interested",
      label: "Not interested",
      response: "Understood. Before I let you go, would you prefer that I send the observation for your records, or should I close this out completely?"
    },
    {
      key: "just_rebuilt_website",
      label: "We just rebuilt the website",
      response:
        "Good to know — congratulations on the launch. What I noticed was specific, so it may be worth a quick look either way. Would it be alright if I mentioned it, even briefly?"
    },
    {
      key: "tried_marketing_before",
      label: "We tried marketing before",
      response: "That's fair, and a lot of {{businessNoun}} owners have had that experience. This isn't a marketing campaign — it's one specific, verified issue I can show you directly. Worth a quick look?"
    },
    {
      key: "need_to_speak_with_partner",
      label: "I need to speak with my partner",
      response: "Makes sense. Would it help if I sent a short summary you could both look at, so the conversation with your partner is easier?"
    },
    {
      key: "call_me_later",
      label: "Call me later",
      response: "Of course — what time works best for a quick follow-up?"
    }
  ],
  bookingClose:
    "Based on what you've told me, the useful next step is a short 15-minute website and lead-flow assessment. I'll show you what I found, what I would correct first and what a stronger customer-inquiry path could look like. If it makes sense, we can discuss helping you implement it. If not, you'll still leave with the recommendations. Would {{optionA}} or {{optionB}} work better?",
  voicemailScript:
    "Hi, this is {{callerName}} with {{organizationName}}. I was reviewing {{businessName}}'s online presence and noticed one specific item that may affect how local customers perceive the company. Nothing urgent, but I have a practical recommendation. You can reach me at {{callbackNumber}}. Again, this is {{callerName}} with {{organizationName}} at {{callbackNumber}}.",
  emailTemplate: {
    subject: "Quick observation about {{businessName}}",
    body:
      "Hi {{contactName}},\n\nI tried reaching you because I noticed something specific while reviewing {{businessName}}'s online presence:\n\n{{verifiedObservation}}\n\nThis may create confusion or make it harder for customers to take the next step.\n\nI have a few practical recommendations and would be happy to walk you through them in 15 minutes. Would {{timeA}} or {{timeB}} work?\n\n{{callerName}}\n{{organizationName}}\n{{callerPhone}}\n{{organizationWebsite}}"
  },
  offer: {
    name: "Lead-Ready Home Services Website + Client Acquisition Foundation",
    scopeComponents: [
      "Conversion-focused website",
      "Mobile-responsive design",
      "Service pages",
      "Service-area pages",
      "Estimate or consultation request",
      "Call and lead routing",
      "Reviews, certifications and project proof",
      "Basic CRM/pipeline setup",
      "Approved follow-up workflow",
      "Analytics and tracking",
      "Domain and hosting coordination",
      "Review and approval milestones",
      "Launch and handoff"
    ],
    optionalAddOns: ["AI receptionist", "Advanced automation", "Review automation", "Paid advertising", "SEO content", "Additional integrations"]
  },
  assessment: [
    { window: "0-2 min", title: "Confirm the goal", prompt: "Before I show you anything, what would make this conversation useful for you?" },
    { window: "2-6 min", title: "Show up to 3 verified findings", prompt: "For each: the observation, the evidence, the likely restrained impact, and the proposed correction." },
    {
      window: "6-10 min",
      title: "Explain the customer journey",
      prompt: "Search or referral -> credible online presence -> relevant proof and services -> clear inquiry action -> prompt response -> booked appointment."
    },
    { window: "10-13 min", title: "Present the recommended offer", prompt: "Walk through the Home Services offer's scope, grounded in what was just shown." },
    { window: "13-15 min", title: "Ask for the decision", prompt: "Would you like us to build this for you?" }
  ]
};
