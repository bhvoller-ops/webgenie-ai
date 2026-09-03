import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

/**
 * Surfaces launch-kit/ — the canonical sales/ops playbook (CLAUDE.md §9
 * calls it "the authoritative sales plan") — inside the product itself,
 * member-facing, instead of only ever living as repo-only docs Cassey read
 * directly. launch-kit/*.md stays the single source; this only renders it.
 * prospects/ (a working CSV) and samples/ (reference output, already
 * linked from within 00-START-HERE.md's own content) are deliberately not
 * listed here — not SOPs, not what a member reads as a playbook.
 */

export type PlaybookGroup = "start" | "motion-a" | "motion-b" | "general";

export interface PlaybookEntry {
  slug: string;
  title: string;
  file: string;
  kind: "md" | "html";
  group: PlaybookGroup;
  useFor: string;
}

export const PLAYBOOK_GROUPS: Record<PlaybookGroup, string> = {
  start: "Start Here",
  "motion-a": "Motion A — No Website",
  "motion-b": "Motion B — Bad Website",
  general: "General"
};

// Order matches launch-kit/00-START-HERE.md §11's own "The kit" table.
export const PLAYBOOKS: PlaybookEntry[] = [
  {
    slug: "start-here",
    title: "Program Plan",
    file: "00-START-HERE.md",
    kind: "md",
    group: "start",
    useFor: "The plan. Re-read weekly."
  },
  {
    slug: "motion-a-call-script",
    title: "Motion A Call Script",
    file: "06-Motion-A-Call-Script.md",
    kind: "md",
    group: "motion-a",
    useFor: "The cold call — your primary script."
  },
  {
    slug: "client-audit-report",
    title: "Client Audit Report",
    file: "01-Client-Audit-Report.html",
    kind: "html",
    group: "motion-b",
    useFor: "The Motion B deliverable you send a prospect."
  },
  {
    slug: "sales-playbook",
    title: "Sales Playbook",
    file: "03-Sales-Playbook.md",
    kind: "md",
    group: "motion-b",
    useFor: "Outreach, Loom script, calls, objections."
  },
  {
    slug: "manual-audit-method",
    title: "Manual Audit Method",
    file: "05-Manual-Audit-Method.md",
    kind: "md",
    group: "motion-b",
    useFor: "Producing audits by hand."
  },
  {
    slug: "landing-page",
    title: "Landing Page",
    file: "02-Landing-Page.html",
    kind: "html",
    group: "general",
    useFor: "Inbound landing page template."
  },
  {
    slug: "deployment-runbook",
    title: "Deployment Runbook",
    file: "04-Deployment-Runbook.md",
    kind: "md",
    group: "general",
    useFor: "Going from local to a real deployment."
  },
  {
    slug: "webinar-cta-kit",
    title: "Webinar CTA Kit",
    file: "07-Webinar-CTA-Kit.md",
    kind: "md",
    group: "general",
    useFor: "Slide and follow-up copy for a webinar close."
  }
];

const LAUNCH_KIT_DIR = path.join(process.cwd(), "launch-kit");

export function getPlaybook(slug: string): PlaybookEntry | undefined {
  return PLAYBOOKS.find((p) => p.slug === slug);
}

/** Resolves inside launch-kit/ only — entry.file is our own fixed registry above, never user input. */
function resolvePlaybookPath(entry: PlaybookEntry): string {
  return path.join(LAUNCH_KIT_DIR, entry.file);
}

/**
 * sanitize-html, not isomorphic-dompurify — that package's bundled jsdom
 * (nested under its own node_modules, distinct from the top-level jsdom
 * lib/capture/ genuinely needs) pulls in an ESM-only transitive dependency
 * that fails to `require()` specifically under Vercel's production Node
 * runtime (confirmed live, 3 Sep — `ERR_REQUIRE_ESM` on
 * html-encoding-sniffer's use of @exodus/bytes), even though it built and
 * ran fine locally. sanitize-html has no jsdom dependency at all, so this
 * removes the whole class of bug rather than patching around it again.
 * Playbooks are first-party trusted content, not user input — sanitized
 * anyway as cheap insurance against a markdown-rendering bug producing raw
 * HTML, not because the source is untrusted.
 */
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "title", "width", "height"],
    "*": ["id"]
  }
};

export async function readPlaybookMarkdownHtml(entry: PlaybookEntry): Promise<string> {
  const raw = await readFile(resolvePlaybookPath(entry), "utf8");
  const html = await marked.parse(raw);
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}

export async function readPlaybookRawHtml(entry: PlaybookEntry): Promise<string> {
  return readFile(resolvePlaybookPath(entry), "utf8");
}
