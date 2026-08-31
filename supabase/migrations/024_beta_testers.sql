-- Public trial intake for the agency-facing pivot (30/31 Aug 2026) — someone
-- pastes a URL, gets a real audit + blueprint + prompt package back, no
-- admin involvement. beta_testers is a peer of `partners`, not a role
-- inside organization_members, for the same reason documented in
-- migration 022: nearly every RLS policy in this app grants full access
-- to "any org member," so a beta tester login must never become one.
--
-- Unlike partners, this table intentionally carries NO permissive RLS
-- policies of its own. Every access path to beta_testers and to
-- trial-flagged projects goes through server-side code using the admin
-- (service-role) client, scoped by explicit .eq() filters — never through
-- the caller's own authenticated session. That sidesteps the class of RLS
-- bug found twice already this project (organization_members' member-list
-- policy, migration 023; the original over-broad partners policy,
-- migration 022) by not writing new row-level policies at all for this
-- feature. RLS stays enabled so a stray anon/authenticated query still
-- denies by default rather than silently succeeding.

create table public.beta_testers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  created_at timestamptz not null default now(),
  unique (organization_id, email)
);

alter table public.beta_testers enable row level security;

alter table public.projects
  add column beta_tester_id uuid references public.beta_testers(id) on delete set null,
  add column is_trial boolean not null default false;

create index projects_beta_tester_idx on public.projects(beta_tester_id) where beta_tester_id is not null;
