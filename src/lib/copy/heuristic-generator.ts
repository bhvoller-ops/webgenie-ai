import type { PageBlueprint, WebsiteBlueprint } from "@/lib/blueprint/types";
import type { ContentPackage, CopyGenerationSettings, PageCopy, SectionCopy } from "./types";

function sentence(value: string): string {
  const clean = value.trim().replace(/\s+/g, " ");
  return /[.!?]$/.test(clean) ? clean : `${clean}.`;
}

function tonePrefix(tone: CopyGenerationSettings["tone"]): string {
  return ({
    clear: "A simpler way to",
    professional: "A reliable way to",
    friendly: "Let’s make it easier to",
    bold: "Stop settling. Start building a better way to",
    premium: "A higher standard for"
  })[tone];
}

function pageKeyword(page: PageBlueprint, industry: string): string {
  if (page.pageType === "home") return industry;
  return `${industry} ${page.title}`.toLowerCase();
}

function sectionCopy(page: PageBlueprint, section: PageBlueprint["sections"][number], blueprint: WebsiteBlueprint, settings: CopyGenerationSettings): SectionCopy {
  const brand = blueprint.websiteStrategy.positioning.split(" should ")[0] || "This business";
  const audience = blueprint.websiteStrategy.audience;
  const cta = page.primaryCta;
  const type = section.component.type.toLowerCase();
  let headline = section.name;
  let body = sentence(section.objective);
  let bullets: string[] = [];

  if (type.includes("hero")) {
    headline = `${tonePrefix(settings.tone)} ${blueprint.websiteStrategy.primaryGoal.toLowerCase()}`;
    body = `${brand} helps ${audience.toLowerCase()} move from uncertainty to a clear next step—with practical guidance, credible proof, and a focused path to results.`;
  } else if (type.includes("benefit")) {
    headline = "What you gain";
    bullets = ["A clearer path forward", "Less friction and wasted effort", "A process designed around measurable outcomes"];
  } else if (type.includes("service")) {
    headline = "Choose the right solution for your next step";
    bullets = ["A focused option for immediate needs", "A complete option for end-to-end support", "A scalable option for continued growth"];
  } else if (type.includes("process")) {
    headline = "A straightforward process from first step to result";
    bullets = ["Tell us what you need", "Receive a clear recommendation", "Move forward with an actionable plan"];
  } else if (type.includes("testimonial") || type.includes("trust")) {
    headline = "Proof you can verify";
    body = "Add specific customer outcomes, credentials, ratings, memberships, and other evidence that can be independently verified. Avoid anonymous or unsupported claims.";
  } else if (type.includes("faq")) {
    headline = "Questions people ask before getting started";
  } else if (type.includes("form")) {
    headline = "Tell us what you are trying to accomplish";
    body = "Share only the essential details. We will use them to recommend the most useful next step.";
  } else if (type.includes("closing")) {
    headline = `Ready to ${blueprint.websiteStrategy.primaryGoal.toLowerCase()}?`;
    body = "Take the next step with a clear plan and no unnecessary complexity.";
  }

  return {
    sectionId: section.id,
    sectionName: section.name,
    eyebrow: page.pageType === "home" ? blueprint.websiteStrategy.audience : page.title,
    headline,
    body,
    bullets,
    primaryCta: type.includes("hero") || type.includes("closing") || type.includes("form") ? cta : undefined,
    secondaryCta: type.includes("hero") ? "Learn how it works" : undefined,
    proofPlaceholder: type.includes("trust") || type.includes("testimonial") ? "Insert verified proof here" : undefined
  };
}

function pageCopy(page: PageBlueprint, blueprint: WebsiteBlueprint, industry: string, settings: CopyGenerationSettings): PageCopy {
  const keyword = pageKeyword(page, industry);
  const brandName = blueprint.websiteStrategy.positioning.split(" should ")[0] || "Brand";
  return {
    pageId: page.id,
    pageType: page.pageType,
    slug: page.slug,
    title: page.title,
    seoTitle: `${page.title} | ${brandName}`.slice(0, 60),
    metaDescription: `${brandName} helps ${blueprint.websiteStrategy.audience.toLowerCase()} ${page.primaryGoal.toLowerCase()}. Explore the process and ${page.primaryCta.toLowerCase()}.`.slice(0, 160),
    socialDescription: `A clear, credible path to ${page.primaryGoal.toLowerCase()} with ${brandName}.`,
    primaryKeyword: keyword,
    secondaryKeywords: [page.title.toLowerCase(), blueprint.websiteStrategy.primaryGoal.toLowerCase(), industry.toLowerCase()],
    sections: page.sections.map((item) => sectionCopy(page, item, blueprint, settings)),
    faq: settings.includeFaqs ? [
      { question: `How does ${brandName} help?`, answer: `${brandName} starts by understanding your goal, then recommends a practical next step based on your needs.` },
      { question: "What happens after I get started?", answer: "You receive a clear explanation of the process, what information is needed, and what to expect next." },
      { question: "How do I know this is the right fit?", answer: "Review the service details, verified proof, process, and expected outcomes before making a decision." }
    ] : []
  };
}

export function generateHeuristicContent(args: { projectId: string; blueprintId: string; industry: string; blueprint: WebsiteBlueprint; settings: CopyGenerationSettings }): ContentPackage {
  const pages = args.blueprint.pages.map((page) => pageCopy(page, args.blueprint, args.industry, args.settings));
  return {
    schemaVersion: "1.0",
    projectId: args.projectId,
    blueprintId: args.blueprintId,
    generatedAt: new Date().toISOString(),
    provider: "heuristic",
    settings: args.settings,
    brandVoice: {
      summary: `${args.settings.tone} language that is specific, useful, credible, and easy to scan.`,
      principles: ["Lead with visitor outcomes", "Prefer concrete language", "Use one clear action at a time", "Support claims with evidence"],
      prohibitedPatterns: ["Unsupported superlatives", "Fabricated testimonials", "Guaranteed outcomes", "Empty AI buzzwords", ...args.settings.avoidClaims]
    },
    pages,
    validation: { valid: true, issues: [] }
  };
}
