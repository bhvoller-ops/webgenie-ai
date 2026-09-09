-- P0: Opportunity Brief + Next Best Action.
--
-- The missing entity this whole feature exposed: there was no unified
-- "prospect" spanning Finder (ephemeral Business objects, never persisted),
-- the audit chain (projects -> website_references -> analysis_jobs), and
-- Call Tracker (call_log, keyed by business_name/phone, no FK to projects
-- at all). `prospects` is that entity now. Deliberately NOT a rewrite of
-- any of the three existing systems -- projects/analysis_jobs/call_log are
-- untouched; prospects optionally links to a project (once an audit runs)
-- and call_log gets one new nullable FK pointing back at it.
--
-- opportunity_briefs and next_best_actions are each ONE current row per
-- prospect (unique on prospect_id), not an append-only history log --
-- regenerated/updated in place, matching "persist it, don't regenerate on
-- every page load" and "next_best_action should be state/rule driven,"
-- not a growing workflow-state-machine table. See docs/history.md for the
-- full P0 build entry.

create table public.prospects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  source text not null default 'finder' check (source in ('finder', 'manual', 'import')),
  google_place_id text,
  business_name text not null,
  industry text,
  phone text,
  email text,
  website_url text,
  has_website boolean not null default false,
  address text,
  city text,
  state text,
  rating numeric(2,1),
  review_count integer,
  open_24_hours boolean not null default false,
  demo_url text,
  project_id uuid references public.projects(id) on delete set null,
  status text not null default 'new' check (status in (
    'new', 'audited', 'demo_ready', 'contacted', 'follow_up', 'won', 'lost', 'deprioritized'
  )),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index prospects_org_idx on public.prospects(organization_id);
create index prospects_project_idx on public.prospects(project_id) where project_id is not null;

-- One prospect per (org, source business) so re-opening the same Finder
-- result twice updates the same row instead of duplicating it. A Google
-- Places result always has a place id; manual/import entries fall back to
-- name+phone, which is the same de-dup key call_log already uses in
-- practice (business_name + phone), just enforced here.
create unique index prospects_org_google_place_idx
  on public.prospects(organization_id, google_place_id)
  where google_place_id is not null;
create unique index prospects_org_name_phone_idx
  on public.prospects(organization_id, business_name, phone)
  where google_place_id is null;

alter table public.call_log
  add column if not exists prospect_id uuid references public.prospects(id) on delete set null;
create index if not exists call_log_prospect_idx on public.call_log(prospect_id) where prospect_id is not null;

create table public.opportunity_briefs (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null unique references public.prospects(id) on delete cascade,
  version integer not null default 1,
  opportunity_level text not null check (opportunity_level in ('high', 'medium', 'low', 'insufficient_evidence')),
  summary text not null,
  reasons_to_contact jsonb not null default '[]'::jsonb,
  top_findings jsonb not null default '[]'::jsonb,
  recommended_offer text,
  recommended_offer_reason text,
  secondary_opportunities jsonb not null default '[]'::jsonb,
  sales_angle text,
  suggested_opener text,
  confidence numeric(3,2) not null default 0 check (confidence between 0 and 1),
  evidence_references jsonb not null default '[]'::jsonb,
  -- Cheap staleness check: a hash of whatever real inputs produced this
  -- brief (audit job id + overall score + has_website + demo/contact
  -- status). Regeneration compares this before doing any recompute work,
  -- rather than regenerating on every page load.
  input_fingerprint text not null,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.next_best_actions (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null unique references public.prospects(id) on delete cascade,
  action text not null check (action in (
    'REVIEW_PROSPECT', 'RUN_AUDIT', 'GENERATE_DEMO', 'GENERATE_BLUEPRINT',
    'CONTACT', 'SEND_AUDIT', 'SEND_DEMO', 'FOLLOW_UP', 'BOOK_MEETING', 'DEPRIORITIZE'
  )),
  reason text not null,
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  due_at timestamptz,
  computed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.prospects enable row level security;
alter table public.opportunity_briefs enable row level security;
alter table public.next_best_actions enable row level security;

-- Same shape as every other org-scoped table in this database (projects,
-- call_log, partners, ...): any member of the organization can manage it.
create policy "members can manage prospects"
on public.prospects for all
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = prospects.organization_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = prospects.organization_id
      and m.user_id = auth.uid()
  )
);

-- Same join-through-parent shape as website_references/analysis_jobs
-- joining through projects (migration 001) -- these two tables have no
-- organization_id column of their own, deliberately, to match that
-- existing convention rather than denormalizing it redundantly.
create policy "members can manage opportunity briefs"
on public.opportunity_briefs for all
using (
  exists (
    select 1 from public.prospects p
    join public.organization_members m on m.organization_id = p.organization_id
    where p.id = opportunity_briefs.prospect_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.prospects p
    join public.organization_members m on m.organization_id = p.organization_id
    where p.id = opportunity_briefs.prospect_id
      and m.user_id = auth.uid()
  )
);

create policy "members can manage next best actions"
on public.next_best_actions for all
using (
  exists (
    select 1 from public.prospects p
    join public.organization_members m on m.organization_id = p.organization_id
    where p.id = next_best_actions.prospect_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.prospects p
    join public.organization_members m on m.organization_id = p.organization_id
    where p.id = next_best_actions.prospect_id
      and m.user_id = auth.uid()
  )
);

-- Found during final pre-apply review (9 Sep 2026): call_log's own RLS
-- (migration 012) only re-validates call_log.organization_id -- it never
-- checks that a set prospect_id actually belongs to that same
-- organization. The FK alone only guarantees the row exists, not that its
-- tenant matches. No current app code path can trigger this (every real
-- caller sources both from the same already-org-scoped prospect), but a
-- direct authenticated request could otherwise store a real cross-tenant
-- reference. Closed at the schema level rather than trusted to app code,
-- the same discipline `bootstrap_organization` (013) and
-- `assign_founding_seat` (028) already use for cross-cutting invariants.
create or replace function public.enforce_call_log_prospect_tenant()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.prospect_id is not null then
    if not exists (
      select 1 from public.prospects p
      where p.id = new.prospect_id
        and p.organization_id = new.organization_id
    ) then
      raise exception 'call_log.prospect_id must belong to the same organization as call_log.organization_id';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists call_log_prospect_tenant_guard on public.call_log;
create trigger call_log_prospect_tenant_guard
before insert or update of prospect_id, organization_id on public.call_log
for each row execute function public.enforce_call_log_prospect_tenant();
