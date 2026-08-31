import type { IntelligenceModuleName, ModuleScore, WebsiteIntelligenceOutput } from "@/lib/intelligence/types";

/**
 * Translates the same evidence-traced output the technical report uses into
 * language a business owner can act on without knowing what "schema markup"
 * means. Deliberately NOT another LLM call — deterministic and
 * template-driven, same "deterministic first" principle the rest of the
 * intelligence engine follows (CLAUDE.md §4). Cheap, fast, and the wording
 * is reviewed copy rather than a model's improvisation on every run.
 */

export type Band = "good" | "warn" | "bad";

export function scoreBand(score: number): Band {
  if (score >= 70) return "good";
  if (score >= 40) return "warn";
  return "bad";
}

function letterGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "B-";
  if (score >= 60) return "C";
  if (score >= 50) return "D+";
  if (score >= 40) return "D";
  return "F";
}

interface ModuleCopy {
  title: string;
  body: string;
  analogy?: string;
}

type CopyTable = Record<IntelligenceModuleName, Record<Band, ModuleCopy>>;

const COPY: CopyTable = {
  seo: {
    bad: {
      title: "Search engines",
      body: "When someone searches for what you do, Google has almost nothing to go on — no page title, no description, and none of the background information search engines look for.",
      analogy: "It's like having a store with no sign on the street. People can be standing right outside and never know to walk in."
    },
    warn: {
      title: "Search engines",
      body: "Search engines have some of what they need from your page, but important pieces — like a clear title or description — are missing or incomplete."
    },
    good: {
      title: "Search engines",
      body: "Your page gives search engines what they need to understand and list your business properly."
    }
  },
  ai_search: {
    bad: {
      title: "AI assistants (ChatGPT, Google AI)",
      body: "When someone asks an AI tool 'who's a good business like yours near me,' your site has none of the structured information those tools look for, so you won't come up."
    },
    warn: {
      title: "AI assistants (ChatGPT, Google AI)",
      body: "More people are starting to ask AI tools to recommend a business like yours instead of searching. Your site has some of the information those tools use, but not enough to be confidently recommended yet."
    },
    good: {
      title: "AI assistants (ChatGPT, Google AI)",
      body: "Your site has the structured information AI tools look for when recommending a business like yours."
    }
  },
  trust: {
    bad: {
      title: "Proof you're good at what you do",
      body: "There are no reviews, testimonials, or examples of past work shown anywhere on the site.",
      analogy: "Imagine hiring a contractor with zero reviews online, versus one with fifty five-star reviews from people nearby. Same skill, completely different decision."
    },
    warn: {
      title: "Proof you're good at what you do",
      body: "There's some proof on the site, but not enough of it near the places where someone's deciding whether to trust you."
    },
    good: {
      title: "Proof you're good at what you do",
      body: "Visitors can see real evidence — reviews, outcomes, or credentials — that backs up what you're telling them."
    }
  },
  brand: {
    bad: {
      title: "A clear sense of who you are",
      body: "The page doesn't clearly say, in one sentence, what you do and why someone should pick you over the next search result."
    },
    warn: {
      title: "A clear sense of who you are",
      body: "It's mostly clear what you do, but what makes you different from the next option isn't spelled out."
    },
    good: {
      title: "A clear sense of who you are",
      body: "A visitor can tell right away what you do and what makes you worth choosing."
    }
  },
  design: {
    bad: {
      title: "First impression",
      body: "The visual presentation isn't doing your business any favors — the page doesn't yet look as credible as the work you actually do."
    },
    warn: {
      title: "First impression",
      body: "The page is workable, but a sharper visual presentation would make a stronger first impression in the first few seconds."
    },
    good: {
      title: "First impression",
      body: "The page presents a solid visual foundation for a visitor's first few seconds on the site."
    }
  },
  conversion: {
    bad: {
      title: "A way to take action",
      body: "There isn't a single button, form, or clear next step anywhere on the page — nothing saying \"Call now,\" \"Get a quote,\" or \"Book today.\"",
      analogy: "It's like a helpful salesperson who explains everything perfectly and then never actually asks for the sale."
    },
    warn: {
      title: "A way to take action",
      body: "There's a way to get in touch, but it's not obvious or repeated enough — a visitor has to go looking for it."
    },
    good: {
      title: "A way to take action",
      body: "The page makes it obvious what to do next, and asks for it clearly."
    }
  },
  ux: {
    bad: {
      title: "Getting around the site",
      body: "The path a visitor takes through the site is unclear — there's little to guide them from \"I'm interested\" to \"I did something about it.\""
    },
    warn: {
      title: "Getting around the site",
      body: "The site is navigable, but the path from browsing to contacting you could be smoother."
    },
    good: {
      title: "Getting around the site",
      body: "It's easy for a visitor to find what they need and move toward contacting you."
    }
  },
  content: {
    bad: {
      title: "One clear main message",
      body: "The page has real content on it, but no single headline telling a visitor, in the first five seconds, what you do."
    },
    warn: {
      title: "One clear main message",
      body: "There's a main message, but it competes with everything else on the page instead of standing out."
    },
    good: {
      title: "One clear main message",
      body: "The page leads with one clear message that tells a visitor exactly what you do."
    }
  },
  technical: {
    good: {
      title: "Loads fast and safely",
      body: "No complaints here — the site loads properly and is secured (the little padlock in the browser). This part just isn't a problem."
    },
    warn: {
      title: "Loads fast and safely",
      body: "The basics mostly work, but there are technical rough edges worth cleaning up."
    },
    bad: {
      title: "Loads fast and safely",
      body: "There are real technical problems — slow loading, missing security, or delivery errors — that likely turn visitors away before they even see your content."
    }
  },
  accessibility: {
    bad: {
      title: "Works for every visitor",
      body: "The page has real gaps that make it hard to use for visitors relying on screen readers or other accessibility tools."
    },
    warn: {
      title: "Works for every visitor",
      body: "There are a few small gaps — like a missing language tag — that trip up screen readers and some accessibility tools."
    },
    good: {
      title: "Works for every visitor",
      body: "The page holds up well for visitors using screen readers and other accessibility tools."
    }
  },
  revenue: {
    good: {
      title: "Is the site even trying to make money?",
      body: "Yes — the site mentions pricing, booking, or buying, so the bones of a sales-focused site are already there. The issue isn't that it's not trying to sell; it's that other gaps are getting in the way of it working."
    },
    warn: {
      title: "Is the site even trying to make money?",
      body: "There are some signs the site is trying to generate business, but it's not consistent across the page."
    },
    bad: {
      title: "Is the site even trying to make money?",
      body: "The page doesn't clearly connect to any way of actually doing business with you — no pricing, booking, or buying language at all."
    }
  }
};

const GROUPS: Array<{ key: string; heading: string; lead: string; modules: IntelligenceModuleName[] }> = [
  {
    key: "found",
    heading: "Can people even find you?",
    lead: "When someone searches Google — or asks an AI assistant like ChatGPT — for a business like yours, this is what determines whether you show up at all.",
    modules: ["seo", "ai_search"]
  },
  {
    key: "trusted",
    heading: "Do people trust you enough to call?",
    lead: "Someone lands on your site as a total stranger. This is what convinces them you're worth trusting with their money.",
    modules: ["trust", "brand", "design"]
  },
  {
    key: "act",
    heading: "Once they're here, can they actually do something?",
    lead: "A visitor who's interested still needs an obvious next step, or they'll just leave and call the next business instead.",
    modules: ["conversion", "content", "ux"]
  },
  {
    key: "works",
    heading: "Does the site actually work right?",
    lead: "The technical basics — the stuff that's invisible when it works, and a dealbreaker when it doesn't.",
    modules: ["technical", "accessibility"]
  }
];

export interface PlainEnglishCategoryItem {
  title: string;
  band: Band;
  body: string;
  analogy?: string;
  whatWeChecked: string;
}

export interface PlainEnglishCategory {
  heading: string;
  lead: string;
  items: PlainEnglishCategoryItem[];
}

export interface PlainEnglishReport {
  businessName: string;
  url: string;
  overallScore: number;
  overallGrade: string;
  overallBand: Band;
  overallHeadline: string;
  overallBody: string;
  categories: PlainEnglishCategory[];
  goodNews: { title: string; body: string } | null;
}

function whatWeChecked(m: ModuleScore): string {
  const detail = m.evidence[0]?.detail;
  return detail ? `What we checked: ${detail}.` : "Checked against the live page.";
}

const OVERALL_HEADLINE: Record<Band, string> = {
  bad: "Needs real work",
  warn: "Getting there, not there yet",
  good: "In solid shape"
};

const OVERALL_BODY: Record<Band, string> = {
  bad: "Your website works — it loads and it's secure. But right now it isn't doing the jobs that actually bring you customers. That's fixable, and none of it is your fault — most business owners have never been told this in plain language before.",
  warn: "Your website has real strengths, but a handful of specific gaps are quietly costing you customers who visit and leave without calling.",
  good: "Your website is doing most of the right things. What's below are the last few gaps between a good site and one that's working as hard as it can for you."
};

function buildItem(byModule: Map<IntelligenceModuleName, ModuleScore>, moduleName: IntelligenceModuleName): PlainEnglishCategoryItem | null {
  const m = byModule.get(moduleName);
  if (!m) return null;
  const band = scoreBand(m.score);
  const copy = COPY[moduleName][band];
  return { title: copy.title, band, body: copy.body, analogy: copy.analogy, whatWeChecked: whatWeChecked(m) };
}

export function buildPlainEnglishReport(output: WebsiteIntelligenceOutput, businessName: string, url: string): PlainEnglishReport {
  const byModule = new Map(output.moduleScores.map((m) => [m.module, m]));
  const overallBand = scoreBand(output.overallScore);

  const categories: PlainEnglishCategory[] = [];
  for (const group of GROUPS) {
    const items: PlainEnglishCategoryItem[] = [];
    for (const moduleName of group.modules) {
      const item = buildItem(byModule, moduleName);
      if (item) items.push(item);
    }
    if (items.length > 0) categories.push({ heading: group.heading, lead: group.lead, items });
  }

  const revenueModule = byModule.get("revenue");
  const goodNews =
    revenueModule && scoreBand(revenueModule.score) === "good"
      ? { title: "The one clear bright spot", body: COPY.revenue.good.body }
      : null;

  return {
    businessName,
    url,
    overallScore: output.overallScore,
    overallGrade: letterGrade(output.overallScore),
    overallBand,
    overallHeadline: OVERALL_HEADLINE[overallBand],
    overallBody: OVERALL_BODY[overallBand],
    categories,
    goodNews
  };
}
