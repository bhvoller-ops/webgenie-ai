/**
 * The one place this app's own public origin is defined. Used for anything
 * that needs an absolute URL back to this deployment — self-hosted photo
 * references (industries.ts, gallery configs), the chat widget/lead form's
 * CORS-safe callback URLs on generated/published client sites, and links in
 * notification emails.
 *
 * Renamed from genie.vibelabsagency.com to app.vibelabsagency.com on 30 Aug
 * 2026 (Cassey connected the custom domain, then asked for this specific
 * subdomain instead). webgenie-ai-sooty.vercel.app still works too — Vercel
 * never stops serving the default domain — but everything in this codebase
 * should point at the branded one so a prospect inspecting their generated
 * site's network tab sees app.vibelabsagency.com, not a random vercel.app
 * deployment string. Change this one line, not the call sites, if the
 * domain ever moves again.
 */
export const SITE_ORIGIN = "https://app.vibelabsagency.com";
