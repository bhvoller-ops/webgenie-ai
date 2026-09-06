-- Closes the real (not the assumed) multi-tenancy gap: /api/get-started and
-- /api/partner-signup resolve "the org" via `.select("id").limit(1).single()`
-- with no ORDER BY — Postgres gives no ordering guarantee on that, and it
-- was only ever "correct" because exactly one organizations row has existed
-- so far. /api/site-lead's fallback branch (when a generated site's embedded
-- organizationId is missing/invalid) has the same shape.
--
-- The published-site path itself is NOT part of this gap — verified by
-- reading the code, not assumed: publishBusinessSite() already threads a
-- real, authenticated ctx.organizationId through generateSite() into both
-- the chat widget and the lead-capture form's embedded script (see
-- lib/sitegen/generate.ts, lib/publish/vercel.ts, api/publish-site/route.ts).
-- CLAUDE.md's §2c/§2d notes predate that threading landing and are stale on
-- this point.
--
-- get-started and partner-signup aren't really multi-tenant surfaces at all
-- — they're this agency's own direct-intake pages, not something a second
-- organization gets its own instance of. The fix isn't "figure out which org
-- a request belongs to" (there's no context to derive that from); it's
-- "stop depending on undefined row order to find this agency's own org."
--
-- Adding a second real organization (a Partner Program member signing up
-- via /api/vibelabs/start-trial) is exactly what makes the previously-
-- harmless ambiguity real: from that point on, `.limit(1).single()` could
-- just as easily return the new member's row as this agency's own.

alter table public.organizations
  add column is_default boolean not null default false;

-- Exactly one row may ever be the default org.
create unique index organizations_single_default_idx
  on public.organizations (is_default)
  where is_default;

-- Backfill: today there is exactly one organization row (this agency's own),
-- so marking the oldest row default is unambiguous. Written this way rather
-- than an unqualified UPDATE so it stays correct/idempotent even if this
-- migration is ever re-run against a database that already has one.
update public.organizations
set is_default = true
where id = (
  select id from public.organizations
  order by created_at asc
  limit 1
)
and not exists (
  select 1 from public.organizations where is_default
);

comment on column public.organizations.is_default is
  'The one organization that owns this agency''s own direct-intake surfaces '
  '(/get-started, /partner-signup, and /site-lead''s no-organizationId '
  'fallback) — not a "first row wins" query. Exactly one row may be true, '
  'enforced by organizations_single_default_idx. Set by hand if this agency '
  'ever needs to change which org that is.';
