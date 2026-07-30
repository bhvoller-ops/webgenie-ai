import type { WebsiteBlueprint, PageBlueprint, ComponentSpec } from "@/lib/blueprint/types";
import type { PromptDocument, PromptDocumentKind } from "./types";
import type { PlatformProfile } from "./platforms";

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function doc(kind: PromptDocumentKind, filename: string, title: string, markdown: string): PromptDocument {
  return { kind, filename, title, markdown: markdown.trim() + "\n", estimatedTokens: estimateTokens(markdown) };
}

function bullets(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

function pageSummary(page: PageBlueprint): string {
  const sections = page.sections
    .sort((a, b) => a.order - b.order)
    .map((section) => `  ${section.order}. **${section.name}** — ${section.objective} Use \`${section.component.type}\`.`)
    .join("\n");
  return `### ${page.title} (${page.slug})\n- Goal: ${page.primaryGoal}\n- CTA: ${page.primaryCta}\n- Search intent: ${page.seo.targetIntent}\n- Schema: ${page.seo.schemaTypes.join(", ")}\n- Sections:\n${sections}`;
}

function componentSummary(component: ComponentSpec): string {
  return `### ${component.type}\n**Purpose:** ${component.purpose}\n\n**Content**\n${bullets(component.contentRequirements)}\n\n**Behavior**\n${bullets(component.behavior)}${component.conversionRole ? `\n\n**Conversion role:** ${component.conversionRole}` : ""}`;
}

export function renderPromptDocuments(blueprint: WebsiteBlueprint, profile: PlatformProfile): PromptDocument[] {
  const strategy = blueprint.websiteStrategy;
  const pages = blueprint.pages.map(pageSummary).join("\n\n");
  const components = blueprint.reusableComponents.map(componentSummary).join("\n\n");

  const master = doc("master", "00-master-prompt.md", "Master Build Prompt", `
# ${profile.label} Master Build Prompt

${profile.openingInstruction}

## Required outcome
Create an original, responsive, accessible, production-quality website. Do not clone source websites or reproduce protected copy, branding, images, or distinctive layouts. Use the blueprint as functional and strategic guidance.

## Platform and stack
- Target: ${profile.label}
- Framework: ${profile.framework}
- Delivery mode: ${profile.outputMode}
- Capabilities: ${profile.capabilities.join(", ")}
- Restrictions:\n${bullets(profile.restrictions)}

## Website strategy
- Positioning: ${strategy.positioning}
- Audience: ${strategy.audience}
- Primary goal: ${strategy.primaryGoal}
- Primary CTA: ${strategy.primaryCta}
- Conversion path: ${strategy.conversionPath.join(" → ")}

## Pages
${pages}

## Global definition of done
- Every route is implemented and linked.
- Every CTA has a working destination or handler.
- Mobile, tablet, and desktop layouts are complete.
- Keyboard navigation and visible focus states work.
- Forms have client and server validation where supported.
- Metadata, canonical URLs, sitemap, robots directives, and valid structured data are included.
- No placeholder lorem ipsum, fake customer claims, fake awards, or fabricated reviews.
- Run build, type checking, linting, and tests before declaring completion.
`);

  const ui = doc("ui", "01-ui-design-system.md", "UI and Design System", `
# UI and Design System

## Design direction
Create a distinctive but restrained interface appropriate for: ${strategy.positioning}

## Color roles
${Object.entries(blueprint.designTokens.colorRoles).map(([k,v]) => `- ${k}: ${v}`).join("\n")}

## Typography
- Heading: ${blueprint.designTokens.typography.headingStyle}
- Body: ${blueprint.designTokens.typography.bodyStyle}
- Scale: ${blueprint.designTokens.typography.scale.join(", ")}

## Layout tokens
- Section spacing: ${blueprint.designTokens.spacing.section}
- Container: ${blueprint.designTokens.spacing.container}
- Card padding: ${blueprint.designTokens.spacing.card}
- Button radius: ${blueprint.designTokens.radius.button}
- Card radius: ${blueprint.designTokens.radius.card}
- Input radius: ${blueprint.designTokens.radius.input}

## Responsive requirements
- Build mobile first.
- Avoid horizontal overflow at 320px width.
- Keep line length readable.
- Preserve CTA prominence without crowding.
- Use motion only when it clarifies state and respect reduced motion.
`);

  const componentDoc = doc("components", "02-components.md", "Component Specifications", `
# Reusable Component Specifications

${components}

## Rules
- Reuse components instead of duplicating markup.
- Expose typed props or editable Framer properties as appropriate.
- Keep content separate from presentation.
- Include loading, empty, error, disabled, and success states when relevant.
`);

  const dataDoc = doc("data", "03-data-and-content-model.md", "Data and Content Model", `
# Data and Content Model

## Core entities
- Site settings: business identity, contact details, social profiles, default SEO.
- Navigation items: label, URL, order, visibility.
- Services: name, slug, summary, details, benefits, CTA, media, SEO.
- Testimonials: quote, person, role/company, result, verification status.
- FAQs: question, answer, category, order.
- Resources: title, slug, excerpt, body, author, published date, topic, SEO.
- Leads: contact fields, source page, consent, status, timestamps.

## Integrity rules
- Never generate fake testimonials, ratings, credentials, statistics, or clients.
- Make optional proof sections hide cleanly when verified data is unavailable.
- Sanitize rich text and validate all external URLs.
- Store consent evidence for submitted forms.
`);

  const authDoc = doc("auth", "04-auth.md", "Authentication", `
# Authentication

This public marketing website does not require visitor authentication unless the product scope explicitly adds protected customer or admin areas.

When an admin content area is implemented:
- Use secure passwordless or OAuth authentication.
- Protect server routes and mutations.
- Enforce tenant-aware authorization and least privilege.
- Never expose service-role credentials in client code.
- Add sign-out and session-expiry handling.
`);

  const apiDoc = doc("api", "05-api-and-forms.md", "API and Form Requirements", `
# API and Forms

## Lead form contract
- Validate required fields on client and server.
- Normalize email and phone values.
- Add rate limiting and bot protection.
- Record source route, UTM values, consent, and timestamp.
- Return safe structured errors.
- Show an accessible success state without losing entered data on failure.

## Integration boundary
Use a server-side adapter for CRM, email, calendar, or automation tools. Environment-specific secrets must remain server-only. Failed downstream delivery must be logged and retried without creating duplicate leads.
`);

  const seoDoc = doc("seo", "06-seo.md", "SEO Implementation", `
# SEO Implementation

## Per-page requirements
${blueprint.pages.map((page) => `- **${page.slug}**: title pattern \`${page.seo.titleTemplate}\`; intent: ${page.seo.targetIntent}; schema: ${page.seo.schemaTypes.join(", ")}`).join("\n")}

## Global requirements
${bullets(blueprint.globalRequirements.seo)}

- Generate canonical absolute URLs from one configured site origin.
- Prevent duplicate indexable routes.
- Add Open Graph and social metadata.
- Validate structured data against visible content.
- Create useful 404 and error pages.
`);

  const aiSearchDoc = doc("ai_search", "07-ai-search.md", "AI Search Readiness", `
# AI Search Readiness

${bullets(blueprint.globalRequirements.aiSearch)}

## Content pattern
For each important service, clearly state:
1. What it is.
2. Who it serves.
3. The problem it solves.
4. How the process works.
5. Service area or eligibility.
6. Verifiable evidence and limitations.
7. The next action.

Use concise answers, descriptive headings, consistent entity names, and internally linked supporting pages. Do not create unsupported claims solely for AI visibility.
`);

  const testingDoc = doc("testing", "08-testing.md", "Testing and Acceptance", `
# Testing and Acceptance

## Automated checks
- Type check and production build.
- Lint source code.
- Test navigation and primary CTA routes.
- Test form validation, success, failure, and duplicate submission handling.
- Test metadata generation for every route.
- Test keyboard access to menus, accordions, dialogs, and forms.

## Manual acceptance
- Review at 320px, 768px, 1024px, and 1440px.
- Verify no invented business facts or proof.
- Verify contrast, focus visibility, labels, heading order, and reduced motion.
- Verify all analytics events use stable names and do not capture sensitive form content.
`);

  const deploymentDoc = doc("deployment", "09-deployment.md", "Deployment", `
# Deployment

- Document required environment variables in an example file.
- Keep secrets out of source control and browser bundles.
- Run database migrations before enabling dependent features.
- Configure the canonical production domain and redirect aliases.
- Enable error monitoring, uptime checks, and privacy-conscious analytics.
- Provide rollback instructions and a smoke-test checklist.
- Confirm forms deliver successfully in production before launch.
`);

  return [master, ui, componentDoc, dataDoc, authDoc, apiDoc, seoDoc, aiSearchDoc, testingDoc, deploymentDoc];
}
