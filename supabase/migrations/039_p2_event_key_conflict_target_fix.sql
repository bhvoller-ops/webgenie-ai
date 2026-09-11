-- P2 pre-production database validation -- fix 1: migration 038's
-- prospect_activities_event_key_idx is a PARTIAL unique index
-- (`where event_key is not null`). logActivity()'s real call site
-- (src/lib/prospect/activity.ts) does:
--
--   supabase.from("prospect_activities").upsert(row, { onConflict: "event_key", ignoreDuplicates: true })
--
-- which PostgREST/postgres-js compiles to a bare
-- `insert ... on conflict (event_key) do nothing` -- no WHERE predicate on
-- the conflict target. Postgres's own rule for unique-index inference
-- (see "ON CONFLICT Clause" in the INSERT reference) is that a conflict
-- target with no predicate can only infer a NON-partial unique index; a
-- partial index is only eligible when the conflict target repeats that
-- index's own WHERE clause verbatim. Since the conflict target here has
-- none, Postgres cannot use prospect_activities_event_key_idx as an
-- arbiter at all and raises 42P10 ("there is no unique or exclusion
-- constraint matching the ON CONFLICT specification") on every single
-- call that passes an eventKey -- not just a concurrency edge case, every
-- call, always. This was caught by real-database testing
-- (scripts/db-tests/verify-p2-database.ts section 6) against the
-- disposable P2 pre-production test project, not by re-reading the SQL.
--
-- Fix: replace the partial index with a plain (non-partial) unique index
-- on the same column. Postgres unique indexes already treat NULL as
-- distinct from every other NULL, so this loses nothing: every existing
-- call site that never passes eventKey still inserts a null event_key
-- freely, exactly as before, with no cap on how many null rows exist. The
-- only behavior this index actually enforces -- at most one row per
-- non-null event_key -- is unchanged. What changes is that the index is
-- now a valid, predicate-free arbiter, so ON CONFLICT (event_key) can
-- actually find it.
--
-- Additive-in-spirit, corrective in fact: no column dropped, no row's
-- data touched, only the index definition backing 038's new column is
-- corrected before anything ever depended on the broken version (038 has
-- not been applied to production).
--
-- Rollback (only valid if you are reverting to a build that never called
-- logActivity() with an eventKey, since the partial form is not usable as
-- an ON CONFLICT arbiter):
--   drop index if exists public.prospect_activities_event_key_idx;
--   create unique index if not exists prospect_activities_event_key_idx
--     on public.prospect_activities(event_key) where event_key is not null;

drop index if exists public.prospect_activities_event_key_idx;

create unique index if not exists prospect_activities_event_key_idx
  on public.prospect_activities(event_key);
