-- P0.5: "Import GMB Data" persistence.
--
-- Purely additive columns on the existing `prospects` table — deliberately
-- NOT a new table. The P0.5 master prompt's own suggested shape
-- (prospect_public_profiles, its own org_id/prospect_id/source columns and
-- RLS) was considered first, but `prospects` already carries exactly one
-- row per (org, business) with RLS already governing it correctly (the
-- join-through-parent pattern migration 034 established) — a sibling table
-- would need its own copy of that same RLS shape for zero real benefit,
-- since there is exactly one legitimate public-profile source per prospect
-- today (Google Places). Add a table later only if a second real source
-- shows up. No new RLS policy needed: the existing prospects policies
-- (migration 034) already cover every column on this table, these three
-- included.
alter table public.prospects
  add column public_profile jsonb,
  add column public_profile_source text,
  add column public_profile_fetched_at timestamptz;
