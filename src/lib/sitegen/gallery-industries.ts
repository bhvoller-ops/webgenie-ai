import { industries as GALLERY_TEMPLATES } from "@/data/gallery/industries";
import type { IndustryConfig } from "@/data/gallery/types";
import type { GalleryIndustryKey } from "@/lib/sitegen/types";

/**
 * The full, heavy Gallery configs (testimonials, FAQs, pricing tiers, a
 * chatbot knowledge base — real content per industry) — server-only.
 * lib/sitegen/gallery-site.ts is the only thing that should import this;
 * anything reachable from a client component wants
 * gallery-industry-summary.ts instead. See that file's doc comment for
 * why the split exists.
 *
 * Ids that already have a purpose-built SiteGenIndustryKey with richer,
 * hand-curated content (services/trust/FAQ, a real curated photo, the AI
 * chat widget) are excluded so the picker never offers two confusingly
 * similar options for the same real-world trade — see the
 * GalleryIndustryKey doc comment in lib/sitegen/types.ts.
 */
const EXCLUDED_IDS = new Set(["auto-repair", "chiropractic", "dental", "med-spa", "restoration"]);

export const GALLERY_INDUSTRIES: Record<GalleryIndustryKey, IndustryConfig> = Object.fromEntries(
  Object.entries(GALLERY_TEMPLATES).filter(([id]) => !EXCLUDED_IDS.has(id))
) as Record<GalleryIndustryKey, IndustryConfig>;
