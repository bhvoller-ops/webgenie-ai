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
 *
 * `state` is optional for the identical reason — a second, real
 * production defect (P0.5, 10 Sep 2026): a Finder search for a bare city
 * with no state (e.g. "Atlanta" instead of "Atlanta, GA" — a completely
 * normal thing to type, and PR #24/#25's tests never covered it) left
 * every one of that search's results with `state: ""`, which this schema
 * then rejected with the same generic "Invalid business data." — this
 * time on a field neither prior hotfix touched. Real fix is two-layered:
 * lib/prospect/finder.ts now derives the real state from Google's own
 * formattedAddress whenever it can (free, already-fetched data, never
 * fabricated), and this schema stays defensively tolerant of a genuinely
 * blank one — same belt-and-suspenders shape as `phone`.
 */
export const businessSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  industry: z.string().min(1),
  phone: z.string().max(40).optional(),
  address: z.string().max(300).optional().default(""),
  city: z.string().min(1).max(100),
  state: z.string().max(20).optional().default(""),
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

/** Same convention as normalizePhone() — a genuinely unknown state (Google's
 * address didn't parse to one, and the search query didn't carry one either)
 * is stored as a real absence, never a misleading empty string. */
export function normalizeState(state: string | undefined): string | null {
  return state && state.trim() ? state.trim() : null;
}
