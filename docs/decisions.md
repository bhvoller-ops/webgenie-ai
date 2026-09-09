# WebGenie AI — Decisions & Permanent Traps

> Extracted from CLAUDE.md during the 9 Sep 2026 memory reorganization. Each of these is a standing rule this project learned the hard way — read before touching the area it names. CLAUDE.md keeps a condensed pointer list; this file keeps the full backstory for each. Cross-references (§2c, §2d, §2e, §2g, §2j, §7) point into docs/history.md.

## 10. Known traps

- **Any new hero photo candidate must be visually checked for a baked-in
  watermark before wiring it into `industries.ts`.** 4 of 11 photos in the
  23-24 Aug batch had a tiled "Magnific" AI-upscaling watermark that wasn't
  obvious until a site was actually rendered — see §2e. Read the image file
  directly and look, don't assume a "clean" filename means a clean photo.
- **`heroImage`/`secondaryImage` in `industries.ts` must be an absolute URL**,
  never a relative path like `/industry-photos/x.jpg` — a published site
  (§2d) or a client's own deployed domain isn't served from this app's
  origin, so a relative path silently 404s there even though it works fine
  when previewed from this deployment.
- **Never add a partner login to `organization_members`.** Nearly every RLS
  policy in this database grants full access to "any member of this
  organization" without checking role — that table is the real trust
  boundary, not the app-level role checks in `lib/auth/access.ts`. A
  partner's login is deliberately kept out of it, linked to their `partners`
  row via `user_id` instead, with two narrow read-only policies (own row,
  own referred `call_log` rows — migration `022`). Giving a partner an
  `organization_members` row of any role would silently hand them full
  access to every client's data. See §2j.
- **There is no `middleware.ts` in this repo**, despite an earlier version of
  this file claiming one existed for auth. Access control is per-page/per-route
  via `lib/auth/access.ts` (`requireAdminPage()`, `requirePartnerPage()`,
  `requireAdminApi()`) — check that a new page actually calls one of these,
  since nothing centrally enforces it.
- **`organization_members` SELECT is scoped per-row, not per-org — every
  team-visibility feature needs to go through `my_organization_ids()`, not
  a direct `.select()`.** The foundation migration's policy
  (`using (user_id = auth.uid())`) means a plain query only ever returns
  the caller's own membership row, never their teammates'. Migration `023`
  added a broader read policy via a `SECURITY DEFINER` helper function
  (the same pattern `bootstrap_organization`, migration `013`, already
  uses) — a naive self-referencing policy directly on this table risks
  Postgres RLS infinite recursion. This bug existed since the app's
  foundation and was invisible until a real multi-member org was tested
  (§2k) — with only one member, "I can only see myself" and "I can see
  the whole team" produce identical results.
- **Never resolve "this agency's own organization" via
  `.select("id").limit(1).single()`.** Postgres gives no ordering guarantee
  without an explicit `ORDER BY` — it only ever looked correct while exactly
  one `organizations` row existed. Use `getDefaultOrganizationId()`
  (`src/lib/organizations.ts`) instead, which queries the explicit,
  unique-indexed `organizations.is_default` column (migration `033`). Bit
  `/api/get-started`, `/api/partner-signup`, and `/api/site-lead`'s
  no-`organizationId` fallback — fixed 5 Sep 2026 (commit `5040743`, see
  docs/history.md). Migration `033` was not yet applied to production as
  of that commit; **confirmed applied on 9 Sep 2026** via a live read-only
  query (`organizations.is_default` exists, correctly set on exactly one
  real org), and the same commit is confirmed live in the current
  production deployment via the Vercel API — both code and data are live.
  Re-verify with the same read-only check before trusting this again if
  it's ever in doubt; don't assume from this note alone indefinitely.
- **Run exactly one worker replica.** Job claiming is not atomic; two workers will
  claim the same job. Add a Postgres claim function before scaling.
- **Windows vs Linux case sensitivity.** The most common cause of "builds locally,
  fails on Vercel."
- **Supabase Auth redirect URLs** must include both production and
  `https://*-your-team.vercel.app`, or login redirects to a blank page.
  **Confirmed for real, not just carried over as a general warning** —
  building password reset (§2k) hit this directly: `admin.auth.generateLink`
  with `redirectTo` set to `app.vibelabsagency.com` silently fell back to
  the old `webgenie-ai-sooty.vercel.app` Site URL, no error, until Cassey
  added the real domain in Authentication → URL Configuration → Redirect
  URLs. If any future link-based auth flow (password reset, a new invite
  variant, anything with a `redirectTo`) seems to silently redirect
  somewhere wrong, check this list before assuming the app code is broken.
- **A link that lands with `#access_token=...` in the URL fragment needs
  `supabase.auth.setSession()` called explicitly — don't rely on
  `createBrowserClient`'s auto-detection.** `@supabase/ssr`'s browser
  client (`lib/supabase/client.ts`) defaults to the PKCE flow, whose
  `detectSessionInUrl` only recognizes a `?code=` query param. Supabase's
  `admin.auth.generateLink({ type: "recovery" })` (and other admin-generated
  links) produce the older implicit-flow hash-fragment shape instead — the
  auto-detection silently never fires for it, no error, `getSession()`
  just never resolves. Bit password reset directly (§2k): the recovery
  link and its token were both genuinely valid (confirmed independently
  against Supabase's `/auth/v1/user` endpoint), the page still said
  "invalid" every time, until this was found. Parse `window.location.hash`
  and call `setSession({ access_token, refresh_token })` directly instead.
- **Migrations must run in order, one at a time.** Out-of-sequence failures produce
  unhelpful errors. `012`–`019` are now all verified against production
  (§2g) — but `014`/`019` verified `audit_logs` INSERT as still broken even
  after the policy exists correctly (`pg_policies` confirms it), proving a
  migration file existing/committed/applied-cleanly is not the same as the
  behavior it grants actually working.
- **A migration applying cleanly does not mean it fully worked.** `014`
  defined two nearly-identical insert policies in one file; only one was
  ever active in production. `019` re-added the missing one and the DDL
  itself succeeded and is confirmed present via `pg_policies` — but a real
  authenticated insert into `audit_logs` still fails RLS the same way,
  cause unresolved (§2g). Discovered only by attempting the real
  authenticated operation, not by reading the SQL or checking the policy
  exists. When "verifying" a migration, always exercise the actual behavior
  it grants (an actual insert, an actual RPC call) — checking the
  table/function/policy merely exists is not sufficient, as this case
  proves directly.
- **Don't loosen a production RLS policy (e.g. to `with check (true)`) to
  debug it, even temporarily, without explicit sign-off.** Claude Code's
  own auto-mode classifier blocked exactly this while debugging the
  `audit_logs` anomaly above — treat that as a real boundary, not an
  obstacle to route around.
- **Some sites block headless capture.** Note the URL and move on. Do not rebuild
  the capture engine for one uncooperative website.
- **Google Places radius** is implemented as a rectangle, not a circle — Places
  Text Search (New) rejects a circle parameter. Don't "simplify" this back.
- **`GOOGLE_PLACES_API_KEY` must have restriction type "API restriction"**
  (scoped to Places API (New)), never "Websites" or "IP addresses" — this key
  is only ever called server-side, and both of those restriction types 403
  every server call while leaving the key looking otherwise fine. Bit this
  twice already (23 Aug) before the actual cause was found — see §7.
- **Combining `.wrap` with another class on one sitegen element** (e.g.
  `class="wrap heroin"`) — never give the second class a `padding`/`margin`/
  `max-width` shorthand unless it's meant to fully replace `.wrap`'s value.
  It will, silently, same-specificity-later-rule-wins, not merge with it. Bit
  the two-column hero on 23 Aug — see §2c.
- **Never log or print `STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or
  `VERCEL_API_TOKEN`**, including in scripts, curl commands, or debugging output.
- **A Vercel personal access token can be valid and still do nothing.** Vercel's
  token creation UI has a "Read-only" toggle that's easy to leave on — such a
  token authenticates fine and can list projects, but 403s on creating a
  project or touching a domain. Bit the Vercel-publishing feature on 23 Aug
  (§2d). If publishing 403s, check that toggle before assuming the code broke.
- **There is no error boundary anywhere in this app** (`app/error.tsx` doesn't
  exist). Any uncaught throw — a Zod validation error, an auth check, anything —
  surfaces as Next's raw "Application error: a server-side exception has
  occurred" digest page, not a usable message. Fixed the two known instances of
  this (missing session in `getUserAndOrganization`, an overly strict
  `demoUrl` validator in `addCallLogEntryAction`) on 23 Aug, but the
  underlying gap — no boundary — is still there for the next one. Adding a
  real `error.tsx` is worth doing before more of these get found by a user
  clicking around instead of in review.

---

