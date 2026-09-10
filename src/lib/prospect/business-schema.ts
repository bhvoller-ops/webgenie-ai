import { z } from "zod";

/**
 * The canonical validated shape a `Business` (Finder's ephemeral result,
 * lib/sitegen/types.ts) must have to become a persisted `Prospect`. Lives
 * here, not inline in the route file, for two reasons: Next.js's own
 * typed-routes checker rejects any named export from an app/api route.ts
 * other than the recognized HTTP-method/config set (found the hard way —
 * `tsc --noEmit` fails otherwise), and this is genuinely the "one
 * canonical shape between Finder and /api/prospects/open" a real defect
 * showed was missing.
 *
 * `phone` is deliberately optional, not required — a real production
 * defect (10 Sep 2026, docs/history.md): Google Places doesn't always
 * have a phone on file, and lib/prospect/finder.ts normalizes that
 * absence to `""` (the same empty-string convention `address` already
 * uses here), not `undefined`/`null` — `Business.phone` is a required
 * `string` elsewhere in the app (every generated site's phone link, the
 * SMS button, etc. assume it's always real), so loosening it there would
 * ripple far wider than this one boundary. Requiring `.min(1)` here
 * rejected every real business missing that field with a generic
 * "Invalid business data." — this is the fix, at the correct seam.
 */
export const businessSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  industry: z.string().min(1),
  phone: z.string().max(40).optional(),
  address: z.string().max(300).optional().default(""),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(20),
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
  open24Hours: z.boolean().optional(),
  website: z.string().nullable().optional(),
  source: z.enum(["places", "manual", "sample"])
});

export type ValidatedBusinessInput = z.infer<typeof businessSchema>;

/**
 * `/api/publish-site`'s shape — the same canonical fields above, extended
 * with the two site-generation fields (`hours`, `placeUrl`) and the two
 * per-request photo overrides Publish alone needs. `/api/publish-site`
 * had the identical `phone: z.string().min(1)` bug as Open Opportunity
 * (confirmed live 10 Sep 2026 against a real phone-less business,
 * docs/history.md) precisely because it redefined the shared fields
 * instead of reusing them. `.extend()` here means it can never drift from
 * `businessSchema`'s fix again.
 */
export const publishSiteBusinessSchema = businessSchema.extend({
  hours: z.string().max(200).optional(),
  placeUrl: z.string().optional(),
  heroImageOverride: z.string().optional(),
  secondaryImageOverride: z.string().optional()
});

/** Empty-string phone means "not on file," same as address's own
 * convention — normalize it to a real absence before it's ever persisted,
 * never store a fabricated or misleading empty value. */
export function normalizePhone(phone: string | undefined): string | null {
  return phone && phone.trim() ? phone.trim() : null;
}
