-- P2: Agency Growth Engine -- Assisted Outreach Sequences (human-executed),
-- prospect suppression, org test/sandbox isolation, Launch Mode, Won Client
-- Handoff, and the DB-level foundation for the Insights surface.
--
-- Architecture direction: see the P2 Architecture Gate Report (this
-- session) and docs/history.md's P2 entry. Every decision below traces to
-- an explicit "Architecture Decision" in the P2 master prompt -- referenced
-- by number in each section's comment.
--
-- What's genuinely new: outreach_sequences / outreach_sequence_steps /
-- prospect_sequence_enrollments / prospect_handoffs / organization_launch_
-- settings. Everything else is an additive column or CHECK-constraint
-- widening on tables that already exist -- prospects, prospect_actions,
-- prospect_activities, organizations are all left in place, none rewritten.
--
-- Rollback: every CHECK-constraint widening below is reversible only if no
-- row has actually used a new value yet (drop back to the narrower
-- constraint would fail otherwise, correctly, rather than silently
-- truncating real data) -- check for that first, then re-run the same
-- dynamic drop-and-recreate this migration uses with the original value
-- lists. `organizations.is_test`, `prospects.suppressed_at/suppression_
-- reason`, and the five new tables/functions/triggers are trivially and
-- safely reversible:
--   alter table public.organizations drop column if exists is_test;
--   alter table public.prospects drop column if exists suppressed_at, drop column if exists suppression_reason;
--   drop index if exists public.prospect_actions_one_active_idx;
--   drop table if exists public.prospect_sequence_enrollments,
--     public.outreach_sequence_steps, public.outreach_sequences,
--     public.prospect_handoffs, public.organization_launch_settings cascade;
--   drop function if exists public.enforce_sequence_enrollment_tenant();
-- since none of these are referenced by any other table's foreign key, and
-- every real fact they hold either originates elsewhere (a prospect's own
-- fields) or is itself the only copy of something re-creatable on demand
-- (a sequence enrollment reflects a live operational plan, not a
-- historical record -- prospect_activities preserves the history either
-- way).
--
-- IMPORTANT pre-apply check (Phase 2, not this migration): before this
-- migration is ever applied to production, run a read-only query
-- confirming no prospect currently has more than one prospect_actions row
-- with status in ('PENDING','SNOOZED') -- the new partial unique index
-- below (Architecture Decision 8) will otherwise fail to create. This
-- should be structurally impossible under the existing app-code invariant
-- (action-sync.ts), but "applying cleanly" must never be assumed without
-- checking first, same discipline as every migration in this project.

-- ============================================================
-- Architecture Decision 5: organization-level test/sandbox isolation.
-- Additive, defaults false, does not touch any existing row's meaning.
-- ============================================================
alter table public.organizations
  add column if not exists is_test boolean not null default false;

-- ============================================================
-- Architecture Decision 4: hard, sticky prospect suppression.
-- Both columns null together or set together (a suppressed prospect
-- always has a reason; an unsuppressed one never has a stale one lying
-- around to be misread).
-- ============================================================
alter table public.prospects
  add column if not exists suppressed_at timestamptz,
  add column if not exists suppression_reason text
    check (suppression_reason is null or suppression_reason in ('OPTED_OUT', 'DO_NOT_CONTACT', 'INVALID_CONTACT', 'MANUAL'));

alter table public.prospects
  add constraint prospects_suppression_consistency
    check ((suppressed_at is null) = (suppression_reason is null));

create index if not exists prospects_suppressed_idx
  on public.prospects(organization_id) where suppressed_at is not null;

-- ============================================================
-- Widen prospect_activities.activity_type (Architecture Decision 10 /
-- Event Semantics) -- eight new values, all naming exactly what happened,
-- never implying more (SEQUENCE_STEP_DUE never means performed;
-- SEQUENCE_ENROLLED never means contact occurred; see the master prompt's
-- own "EVENT SEMANTICS" section). Uses the corrected pg_attribute-based
-- dynamic lookup (join on attnum = any(conkey), single-column match) --
-- the naive `pg_get_constraintdef(oid) ilike '%activity_type%'` substring
-- match was the exact bug that broke migration 036's first apply attempt
-- against call_log's three similarly-named status columns; this table
-- only has one column matching this exact name, but the precise lookup is
-- used uniformly regardless so this pattern is never silently reintroduced.
-- ============================================================
do $$
declare
  constraint_name text;
begin
  select con.conname into constraint_name
  from pg_constraint con
  join pg_attribute att on att.attrelid = con.conrelid and att.attnum = any(con.conkey)
  where con.conrelid = 'public.prospect_activities'::regclass
    and con.contype = 'c'
    and att.attname = 'activity_type'
    and array_length(con.conkey, 1) = 1;

  if constraint_name is not null then
    execute format('alter table public.prospect_activities drop constraint %I', constraint_name);
  end if;

  alter table public.prospect_activities
    add constraint prospect_activities_activity_type_check
    check (activity_type in (
      'PROSPECT_OPENED', 'GMB_DATA_IMPORTED', 'AUDIT_COMPLETED', 'DEMO_GENERATED',
      'PITCH_GENERATED', 'CONTACT_ATTEMPTED', 'FOLLOW_UP_SCHEDULED', 'MEETING_LOGGED',
      'DEMO_ROOM_SHARED', 'PROSPECT_WON', 'PROSPECT_LOST',
      'PROSPECT_SUPPRESSED', 'PROSPECT_UNSUPPRESSED',
      'SEQUENCE_ENROLLED', 'SEQUENCE_STEP_DUE', 'SEQUENCE_PAUSED',
      'SEQUENCE_RESUMED', 'SEQUENCE_STOPPED', 'SEQUENCE_COMPLETED'
    ));
end $$;

-- ============================================================
-- Widen prospect_actions.action_type (Architecture Decision 2/3) -- one
-- new value. A due sequence step reconciles into the SAME Queue a
-- prospect_action always has -- prospect_actions stays canonical for
-- "what should the user do now," never forked into a second Queue. The
-- specific channel/sequence/step is carried in the existing `metadata`
-- jsonb column (already present since migration 036), not a new column.
-- ============================================================
do $$
declare
  constraint_name text;
begin
  select con.conname into constraint_name
  from pg_constraint con
  join pg_attribute att on att.attrelid = con.conrelid and att.attnum = any(con.conkey)
  where con.conrelid = 'public.prospect_actions'::regclass
    and con.contype = 'c'
    and att.attname = 'action_type'
    and array_length(con.conkey, 1) = 1;

  if constraint_name is not null then
    execute format('alter table public.prospect_actions drop constraint %I', constraint_name);
  end if;

  alter table public.prospect_actions
    add constraint prospect_actions_action_type_check
    check (action_type in (
      'REVIEW_PROSPECT', 'IMPORT_GMB_DATA', 'RUN_AUDIT', 'BUILD_NEW_SITE_DEMO',
      'CREATE_REDESIGN_DEMO', 'CONTACT', 'SEND_DEMO', 'FOLLOW_UP', 'BOOK_MEETING',
      'REVIEW_REPLY', 'DEPRIORITIZE', 'SEQUENCE_STEP'
    ));
end $$;

-- ============================================================
-- Architecture Decision 8: DB-level idempotency for prospect_actions.
-- "At most one active (PENDING/SNOOZED) prospect_action per prospect" was
-- previously enforced only by action-sync.ts's own select-then-branch
-- logic -- correct under today's human-paced, one-request-at-a-time usage,
-- but P2's sequence reconciliation now calls into the same reconcile path
-- from a second real trigger (sequence-due-check, alongside the existing
-- audit/demo/contact-state triggers), making the same-prospect race a
-- real possibility for the first time. This partial unique index is the
-- backstop app code alone can't fully guarantee.
-- ============================================================
create unique index if not exists prospect_actions_one_active_idx
  on public.prospect_actions(prospect_id) where status in ('PENDING', 'SNOOZED');

-- ============================================================
-- Architecture Decision 7: the smallest sequence model.
-- outreach_sequences: the reusable definition/template, org-scoped.
-- ============================================================
create table public.outreach_sequences (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  -- Lowercase, matching the older content/definition-table convention
  -- (projects, prospects, demo_rooms, pitches) -- distinct from the
  -- UPPERCASE operational-lifecycle convention prospect_actions/
  -- prospect_sequence_enrollments use below, deliberately: this table is
  -- a reusable template, not a live operational state machine.
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index outreach_sequences_org_idx on public.outreach_sequences(organization_id);

-- outreach_sequence_steps: ordered steps. No organization_id of its own --
-- same join-through-parent convention website_references/analysis_jobs/
-- opportunity_briefs already use when a child has no independent tenant
-- meaning of its own (a step doesn't move between organizations; its
-- parent sequence does, and RLS through sequence_id is sufficient).
create table public.outreach_sequence_steps (
  id uuid primary key default gen_random_uuid(),
  sequence_id uuid not null references public.outreach_sequences(id) on delete cascade,
  step_order integer not null check (step_order > 0),
  channel text not null check (channel in (
    'CALL', 'EMAIL', 'SMS', 'LINKEDIN', 'VOICEMAIL', 'LOOM', 'SEND_DEMO', 'FOLLOW_UP', 'CUSTOM_TASK'
  )),
  -- Days after the PREVIOUS step actually resolved (or after enrollment,
  -- for step 1) before this step becomes due -- computed at resolution
  -- time, not pre-scheduled at enrollment, so a late step doesn't drag
  -- every later one earlier than it should be.
  delay_days integer not null default 0 check (delay_days >= 0),
  instructions text,
  created_at timestamptz not null default now(),
  unique (sequence_id, step_order)
);

-- prospect_sequence_enrollments: WHERE a prospect is in the plan
-- (Architecture Decision 3) -- distinct from prospect_actions, which
-- answers what the user should do right now. Denormalized organization_id
-- + prospect_id + sequence_id all need same-tenant enforcement, since this
-- is the one new table with two foreign entities that must mutually agree
-- (see enforce_sequence_enrollment_tenant() below).
create table public.prospect_sequence_enrollments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  sequence_id uuid not null references public.outreach_sequences(id) on delete cascade,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'PAUSED', 'COMPLETED', 'STOPPED')),
  current_step_order integer not null default 1 check (current_step_order > 0),
  next_step_due_at timestamptz,
  started_at timestamptz not null default now(),
  paused_at timestamptz,
  stopped_at timestamptz,
  completed_at timestamptz,
  stopped_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index prospect_sequence_enrollments_org_idx on public.prospect_sequence_enrollments(organization_id);
create index prospect_sequence_enrollments_prospect_idx on public.prospect_sequence_enrollments(prospect_id);
-- The reconciliation query's own shape: this org's active enrollments with
-- something due -- mirrors prospect_actions_active_idx's exact precedent.
create index prospect_sequence_enrollments_due_idx
  on public.prospect_sequence_enrollments(organization_id, status, next_step_due_at)
  where status = 'ACTIVE';
-- Architecture Decision 8 / test #12: at most one ACTIVE-or-PAUSED
-- enrollment per prospect, at the DB level, not merely checked in app
-- code before insert. A prospect that could be "where" in two different
-- outreach plans simultaneously is exactly the ambiguity Architecture
-- Decision 3 forbids ("there must never be two active prospect_actions
-- for the same prospect because of sequence reconciliation") -- if two
-- sequences were both active for one prospect, reconciliation would have
-- no principled way to choose whose due step wins.
create unique index prospect_sequence_enrollments_one_active_idx
  on public.prospect_sequence_enrollments(prospect_id) where status in ('ACTIVE', 'PAUSED');

create or replace function public.enforce_sequence_enrollment_tenant()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.prospects p
    where p.id = new.prospect_id
      and p.organization_id = new.organization_id
  ) then
    raise exception 'prospect_sequence_enrollments.prospect_id must belong to the same organization as prospect_sequence_enrollments.organization_id';
  end if;
  if not exists (
    select 1 from public.outreach_sequences s
    where s.id = new.sequence_id
      and s.organization_id = new.organization_id
  ) then
    raise exception 'prospect_sequence_enrollments.sequence_id must belong to the same organization as prospect_sequence_enrollments.organization_id';
  end if;
  return new;
end;
$$;

drop trigger if exists prospect_sequence_enrollments_tenant_guard on public.prospect_sequence_enrollments;
create trigger prospect_sequence_enrollments_tenant_guard
before insert or update of prospect_id, sequence_id, organization_id on public.prospect_sequence_enrollments
for each row execute function public.enforce_sequence_enrollment_tenant();

-- ============================================================
-- Architecture Decision 12: Won Client Handoff. No clients table -- a WON
-- prospect stays the canonical sales identity; a project (if any) stays
-- the fulfillment artifact. Only the genuinely missing fields: the
-- human-confirmed agreed scope, kept structurally distinct from the AI's
-- recommended_offer (opportunity_briefs.recommended_offer), which must
-- never automatically become this. One row per prospect -- same
-- join-through-parent shape as opportunity_briefs, no organization_id of
-- its own, no additional tenant-guard trigger needed (RLS through
-- prospect_id is sufficient, identical reasoning to opportunity_briefs).
-- Lives on its own table rather than as columns on `prospects` because
-- that is this schema's own established convention for "one more fact
-- about a prospect that isn't core to what a prospect *is*" (see also
-- opportunity_briefs, next_best_actions) -- not because prospects itself
-- needed protecting from a handful of columns.
-- ============================================================
create table public.prospect_handoffs (
  prospect_id uuid primary key references public.prospects(id) on delete cascade,
  agreed_scope text,
  agreed_price numeric(10, 2),
  approved_demo_reference text,
  implementation_notes text,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'ready')),
  confirmed_at timestamptz,
  confirmed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Architecture Decision 11: Agency Launch Mode storage. A tiny
-- one-row-per-org settings table -- same PK-is-organization_id shape as
-- org_branding (migration 029), the established precedent for "one row
-- of optional, feature-specific settings per organization" as distinct
-- from organizations' own core tenant properties (plan_key,
-- subscription_status, is_test).
-- ============================================================
create table public.organization_launch_settings (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  target_industry text,
  target_location text,
  agency_offer text,
  preferred_channels text[] not null default array[]::text[],
  daily_prospecting_target integer check (daily_prospecting_target is null or daily_prospecting_target > 0),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.outreach_sequences enable row level security;
alter table public.outreach_sequence_steps enable row level security;
alter table public.prospect_sequence_enrollments enable row level security;
alter table public.prospect_handoffs enable row level security;
alter table public.organization_launch_settings enable row level security;

create policy "members can manage outreach sequences"
on public.outreach_sequences for all
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = outreach_sequences.organization_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = outreach_sequences.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "members can manage sequence steps"
on public.outreach_sequence_steps for all
using (
  exists (
    select 1
    from public.outreach_sequences s
    join public.organization_members m on m.organization_id = s.organization_id
    where s.id = outreach_sequence_steps.sequence_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.outreach_sequences s
    join public.organization_members m on m.organization_id = s.organization_id
    where s.id = outreach_sequence_steps.sequence_id
      and m.user_id = auth.uid()
  )
);

create policy "members can manage sequence enrollments"
on public.prospect_sequence_enrollments for all
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = prospect_sequence_enrollments.organization_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = prospect_sequence_enrollments.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "members can manage prospect handoffs"
on public.prospect_handoffs for all
using (
  exists (
    select 1
    from public.prospects p
    join public.organization_members m on m.organization_id = p.organization_id
    where p.id = prospect_handoffs.prospect_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.prospects p
    join public.organization_members m on m.organization_id = p.organization_id
    where p.id = prospect_handoffs.prospect_id
      and m.user_id = auth.uid()
  )
);

create policy "members can manage launch settings"
on public.organization_launch_settings for all
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = organization_launch_settings.organization_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = organization_launch_settings.organization_id
      and m.user_id = auth.uid()
  )
);
