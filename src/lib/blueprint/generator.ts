import type { WebsiteIntelligenceOutput } from "@/lib/intelligence/types";
import type {
  ComponentSpec,
  DesignTokens,
  PageBlueprint,
  PageSectionSpec,
  PageType,
  WebsiteBlueprint
} from "./types";
import { createCoreComponents } from "./components";
import { findModuleScore, hasRecommendation, inferSiteSize } from "./rules";

interface BlueprintProjectInput {
  id: string;
  name: string;
  industry: string;
  targetAudience?: string | null;
  primaryGoal: string;
  primaryCta: string;
}

function componentById(
  components: ComponentSpec[],
  id: string
): ComponentSpec {
  const component = components.find((item) => item.id === id);
  if (!component) throw new Error(`Missing component: ${id}`);
  return component;
}

function section(
  name: string,
  objective: string,
  component: ComponentSpec,
  order: number
): PageSectionSpec {
  return {
    id: crypto.randomUUID(),
    name,
    objective,
    component,
    order
  };
}

function designTokens(
  intelligence: WebsiteIntelligenceOutput
): DesignTokens {
  const designScore = findModuleScore(intelligence, "design");
  const trustScore = findModuleScore(intelligence, "trust");

  return {
    colorRoles: {
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#0f172a",
      mutedText: "#475569",
      primary: designScore < 65 ? "#2563eb" : "#1d4ed8",
      primaryText: "#ffffff",
      accent: trustScore < 60 ? "#0f766e" : "#7c3aed",
      border: "#e2e8f0",
      success: "#15803d",
      warning: "#a16207",
      danger: "#b91c1c"
    },
    typography: {
      headingStyle:
        "Confident, modern sans-serif with strong hierarchy and compact line length.",
      bodyStyle:
        "Highly readable sans-serif optimized for desktop and mobile scanning.",
      scale: ["14px", "16px", "18px", "24px", "32px", "48px", "64px"]
    },
    spacing: {
      section: "clamp(64px, 8vw, 112px)",
      container: "min(1200px, calc(100% - 32px))",
      card: "24px"
    },
    radius: {
      button: "12px",
      card: "20px",
      input: "10px"
    },
    shadows: {
      card: "0 12px 30px rgba(15, 23, 42, 0.08)",
      elevated: "0 24px 60px rgba(15, 23, 42, 0.12)"
    }
  };
}

function createPage(args: {
  slug: string;
  pageType: PageType;
  title: string;
  primaryGoal: string;
  primaryCta: string;
  targetIntent: string;
  schemaTypes: string[];
  sections: PageSectionSpec[];
}): PageBlueprint {
  return {
    id: crypto.randomUUID(),
    slug: args.slug,
    pageType: args.pageType,
    title: args.title,
    primaryGoal: args.primaryGoal,
    primaryCta: args.primaryCta,
    seo: {
      titleTemplate: `${args.title} | {{brandName}}`,
      metaDescriptionBrief: `Write a specific, benefit-led description for ${args.title.toLowerCase()} that matches ${args.targetIntent}.`,
      targetIntent: args.targetIntent,
      schemaTypes: args.schemaTypes
    },
    sections: args.sections
  };
}

export function generateWebsiteBlueprint(args: {
  project: BlueprintProjectInput;
  intelligence: WebsiteIntelligenceOutput;
}): WebsiteBlueprint {
  const { project, intelligence } = args;
  const components = createCoreComponents();
  const size = inferSiteSize(project.industry, project.primaryGoal);
  const trustWeak = findModuleScore(intelligence, "trust") < 65;
  const conversionWeak = findModuleScore(intelligence, "conversion") < 65;
  const seoWeak = findModuleScore(intelligence, "seo") < 70;
  const needsShortForm = hasRecommendation(
    intelligence,
    /shorten conversion forms|reduce lead-capture friction/i
  );

  const homeSections: PageSectionSpec[] = [
    section(
      "Hero",
      "Communicate the audience, offer, outcome, and primary action.",
      componentById(components, "hero-outcome"),
      1
    ),
    section(
      "Trust proof",
      "Create immediate credibility before asking for commitment.",
      componentById(components, "trust-proof"),
      2
    ),
    section(
      "Benefits",
      "Explain the most important visitor outcomes.",
      componentById(components, "benefit-grid"),
      3
    ),
    section(
      "Services",
      "Route visitors to the offer most relevant to their need.",
      componentById(components, "service-cards"),
      4
    ),
    section(
      "Process",
      "Reduce uncertainty by explaining how engagement works.",
      componentById(components, "process-steps"),
      5
    )
  ];

  if (trustWeak) {
    homeSections.push(
      section(
        "Customer outcomes",
        "Add detailed, credible proof close to the conversion path.",
        componentById(components, "testimonial-grid"),
        homeSections.length + 1
      )
    );
  }

  homeSections.push(
    section(
      "Frequently asked questions",
      "Answer buyer objections and support search discovery.",
      componentById(components, "faq-accordion"),
      homeSections.length + 1
    )
  );

  if (conversionWeak || needsShortForm) {
    homeSections.push(
      section(
        "Lead capture",
        "Allow qualified visitors to start immediately.",
        componentById(components, "lead-form"),
        homeSections.length + 1
      )
    );
  }

  homeSections.push(
    section(
      "Closing action",
      "Give ready visitors one decisive final action.",
      componentById(components, "closing-cta"),
      homeSections.length + 1
    )
  );

  const pages: PageBlueprint[] = [
    createPage({
      slug: "/",
      pageType: "home",
      title: project.name,
      primaryGoal: project.primaryGoal,
      primaryCta: project.primaryCta,
      targetIntent: `Understand ${project.name}, evaluate credibility, and take the primary action.`,
      schemaTypes: ["Organization", "WebSite", "Service"],
      sections: homeSections
    }),
    createPage({
      slug: "/services",
      pageType: "services",
      title: "Services",
      primaryGoal: "Help visitors identify the right service.",
      primaryCta: project.primaryCta,
      targetIntent: `Compare available ${project.industry} services and select the best fit.`,
      schemaTypes: ["ItemList", "Service"],
      sections: [
        section(
          "Services introduction",
          "Frame the service categories and visitor outcomes.",
          componentById(components, "hero-outcome"),
          1
        ),
        section(
          "Service options",
          "Present each offer with clear differentiation.",
          componentById(components, "service-cards"),
          2
        ),
        section(
          "How it works",
          "Explain the engagement process.",
          componentById(components, "process-steps"),
          3
        ),
        section(
          "Service questions",
          "Resolve common pre-purchase concerns.",
          componentById(components, "faq-accordion"),
          4
        ),
        section(
          "Service CTA",
          "Move visitors into the primary conversion path.",
          componentById(components, "closing-cta"),
          5
        )
      ]
    }),
    createPage({
      slug: "/about",
      pageType: "about",
      title: "About",
      primaryGoal: "Build trust and explain why the business is qualified.",
      primaryCta: project.primaryCta,
      targetIntent: `Evaluate the credibility, experience, and values behind ${project.name}.`,
      schemaTypes: ["Organization", "AboutPage"],
      sections: [
        section(
          "Positioning story",
          "Explain who the business serves and why it exists.",
          componentById(components, "hero-outcome"),
          1
        ),
        section(
          "Credentials and proof",
          "Demonstrate authority with verifiable evidence.",
          componentById(components, "trust-proof"),
          2
        ),
        section(
          "Customer outcomes",
          "Show the practical results delivered.",
          componentById(components, "testimonial-grid"),
          3
        ),
        section(
          "About CTA",
          "Connect trust-building content to the next step.",
          componentById(components, "closing-cta"),
          4
        )
      ]
    }),
    createPage({
      slug: "/contact",
      pageType: "contact",
      title: "Contact",
      primaryGoal: "Convert qualified interest into a conversation.",
      primaryCta: project.primaryCta,
      targetIntent: `Contact ${project.name}, request information, or begin service.`,
      schemaTypes: ["ContactPage", "Organization"],
      sections: [
        section(
          "Contact introduction",
          "Set expectations for response and next steps.",
          componentById(components, "hero-outcome"),
          1
        ),
        section(
          "Contact form",
          "Capture only the details needed to respond effectively.",
          componentById(components, "lead-form"),
          2
        ),
        section(
          "Contact trust",
          "Reinforce legitimacy and availability.",
          componentById(components, "trust-proof"),
          3
        )
      ]
    })
  ];

  if (size !== "small") {
    pages.push(
      createPage({
        slug: "/testimonials",
        pageType: "testimonials",
        title: "Results",
        primaryGoal: "Prove that the offer produces credible outcomes.",
        primaryCta: project.primaryCta,
        targetIntent: `Review customer results, testimonials, and evidence for ${project.name}.`,
        schemaTypes: ["CollectionPage", "Review"],
        sections: [
          section(
            "Results overview",
            "Summarize the strongest categories of customer outcome.",
            componentById(components, "hero-outcome"),
            1
          ),
          section(
            "Testimonials",
            "Present detailed customer evidence.",
            componentById(components, "testimonial-grid"),
            2
          ),
          section(
            "Results CTA",
            "Invite visitors to pursue a similar outcome.",
            componentById(components, "closing-cta"),
            3
          )
        ]
      })
    );
  }

  if (seoWeak || size === "large") {
    pages.push(
      createPage({
        slug: "/resources",
        pageType: "blog",
        title: "Resources",
        primaryGoal: "Capture informational demand and demonstrate expertise.",
        primaryCta: project.primaryCta,
        targetIntent: `Learn practical information related to ${project.industry}.`,
        schemaTypes: ["CollectionPage", "Blog"],
        sections: [
          section(
            "Resource introduction",
            "Explain the topics and value of the resource library.",
            componentById(components, "hero-outcome"),
            1
          ),
          section(
            "Featured resources",
            "Present high-value guides and articles.",
            {
              id: "resource-grid",
              type: "ResourceGrid",
              purpose: "Organize educational content by buyer intent.",
              contentRequirements: [
                "Title",
                "Summary",
                "Topic",
                "Publication date",
                "Article link"
              ],
              behavior: [
                "Responsive grid",
                "Semantic article elements",
                "Optional filtering"
              ]
            },
            2
          ),
          section(
            "Resource CTA",
            "Connect informational visitors to a commercial next step.",
            componentById(components, "closing-cta"),
            3
          )
        ]
      })
    );
  }

  const sitemap = pages.map((page, index) => ({
    pageId: page.id,
    slug: page.slug,
    label: page.title,
    priority: index === 0 ? 1 : index + 1
  }));

  const pageId = (slug: string) =>
    pages.find((page) => page.slug === slug)?.id ?? "";

  return {
    schemaVersion: "1.0",
    projectId: project.id,
    sourceAnalysisJobId: intelligence.jobId,
    generatedAt: new Date().toISOString(),
    websiteStrategy: {
      positioning: `${project.name} should present a clear, differentiated ${project.industry} offer built around visitor outcomes and verifiable proof.`,
      audience:
        project.targetAudience ||
        `Prospective customers actively evaluating ${project.industry} solutions.`,
      primaryGoal: project.primaryGoal,
      primaryCta: project.primaryCta,
      conversionPath: [
        "Understand the offer",
        "Recognize relevance",
        "Review proof",
        "Resolve objections",
        "Complete the primary CTA"
      ]
    },
    sitemap,
    navigation: {
      primary: [
        pageId("/"),
        pageId("/services"),
        pageId("/about"),
        pageId("/contact")
      ].filter(Boolean),
      utility: [],
      footerGroups: [
        {
          label: "Company",
          pageIds: [pageId("/about"), pageId("/contact")].filter(Boolean)
        },
        {
          label: "Explore",
          pageIds: [
            pageId("/services"),
            pageId("/testimonials"),
            pageId("/resources")
          ].filter(Boolean)
        }
      ]
    },
    designTokens: designTokens(intelligence),
    reusableComponents: components,
    pages,
    globalRequirements: {
      accessibility: [
        "Meet WCAG 2.2 AA for color contrast, keyboard interaction, focus visibility, forms, and semantic structure.",
        "Use one logical H1 per page.",
        "Provide meaningful alt text for informative images.",
        "Respect reduced-motion preferences."
      ],
      performance: [
        "Target Core Web Vitals in the good range.",
        "Optimize and lazy-load noncritical images.",
        "Avoid unnecessary client-side JavaScript.",
        "Set a practical performance budget for fonts, scripts, and media."
      ],
      seo: [
        "Use unique titles and meta descriptions.",
        "Add canonical URLs.",
        "Generate XML sitemap and robots directives.",
        "Use schema only when supported by visible page content."
      ],
      aiSearch: [
        "Use explicit entity names and service definitions.",
        "Create concise answer-ready sections.",
        "Support important claims with visible proof.",
        "Use question-based headings where they match real visitor intent."
      ],
      analytics: [
        "Track primary CTA clicks.",
        "Track form starts and completions.",
        "Track phone and email clicks.",
        "Track major navigation and service-detail engagement."
      ]
    }
  };
}
