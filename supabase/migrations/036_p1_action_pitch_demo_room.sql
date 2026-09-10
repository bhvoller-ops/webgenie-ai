-- P1: Daily Prospecting Queue + Pitch Generator + Demo Room.
--
-- Additive only. No existing column dropped or narrowed; no existing row
-- touched by a default. Four new tables plus two widened CHECK
-- constraints (both purely additive — adding allowed values, never
-- removing one).
--
-- ARCHITECTURE, reviewed before writing a single line here (P1 master
-- prompt section 3): reused wherever real reuse was possible rather than
-- building a second CRM-shaped universe.
--   - prospects.status already has a real, working lifecycle
--     (new/audited/demo_ready/contacted/follow_up/won/lost/deprioritized,
--     computed by deriveStatus() in lib/prospect/regenerate.ts) — only
--     'meeting' is added to it here, nothing replaced.
--   - next_best_actions (migration 034) stays exactly as it is: the
--     stateless, always-recomputed "what does the system currently
--     recommend" signal. It has no queue-item lifecycle (no pending/
--     snoozed/skipped) and was never meant to — that's what
--     prospect_actions is for below, sharing the identical action-type
--     vocabulary (NextBestActionKey) rather than inventing a second one.
--   - call_log (migration 012) is a real, working *current contact
--     state* record already wired into next-best-action.ts's own
--     CallLogSnapshot — reused as-is for P1's contact-outcome logging
--     and follow-up scheduling. Only its status CHECK is widened with a
--     few outcomes P1 needs (left_voicemail, sent, interested, replied,
--     meeting_booked) that the original 7-value call-tracker vocabulary
--     didn't cover — never a second, competing status system.
--   - No activity/event log and no pitch/demo-room persistence existed
--     anywhere in this schema before this migration — prospect_activities,
--     pitches, and demo_rooms are the only genuinely new concepts.

-- ------------------------------------------------------------------
-- 1/2. Widen prospects.status and call_log.status with new allowed
--    values, additively -- every existing value stays valid, nothing
--    renamed or removed. Looks up each column's real CHECK constraint
--    name dynamically via pg_constraint rather than assuming Postgres's
--    default naming convention (table_column_check) is what the original
--    migration actually produced -- safer than a hardcoded guess that
--    could fail the whole migration on a wrong name.
-- ------------------------------------------------------------------
do $$
declare
  constraint_name text;
begin
  select conname into constraint_name
  from pg_constraint
  where conrelid = 'public.prospects'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%status%';
  if constraint_name is not null then
    execute format('alter table public.prospects drop constraint %I', constraint_name);
  end if;
  alter table public.prospects add constraint prospects_status_check
    check (status in (
      'new', 'audited', 'demo_ready', 'contacted', 'follow_up', 'meeting', 'won', 'lost', 'deprioritized'
    ));

  select conname into constraint_name
  from pg_constraint
  where conrelid = 'public.call_log'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%status%';
  if constraint_name is not null then
    execute format('alter table public.call_log drop constraint %I', constraint_name);
  end if;
  alter table public.call_log add constraint call_log_status_check
    check (status in (
      'not_called', 'no_answer', 'not_interested', 'agreed_to_see_site', 'viewed_site',
      'closed', 'lost', 'left_voicemail', 'sent', 'interested', 'replied', 'meeting_booked'
    ));
end $$;

-- ------------------------------------------------------------------
-- 3. prospect_actions — the Daily Queue's persisted item state.
--    action_type intentionally reuses NextBestActionKey's exact string
--    values (see lib/prospect/types.ts) plus IMPORT_GMB_DATA and
--    CREATE_REDESIGN_DEMO / BUILD_NEW_SITE_DEMO from the P0.5
--    Preliminary Opportunity model — one shared vocabulary across NBA,
--    Preliminary Opportunity, and the queue, never a second one.
--    Normally at most one PENDING row per prospect (enforced in
--    application code, not a DB constraint, since a prospect legitimately
--    keeps a full history of completed/skipped rows over time).
-- ------------------------------------------------------------------
create table public.prospect_actions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  action_type text not null check (action_type in (
    'REVIEW_PROSPECT', 'IMPORT_GMB_DATA', 'RUN_AUDIT', 'BUILD_NEW_SITE_DEMO',
    'CREATE_REDESIGN_DEMO', 'CONTACT', 'SEND_DEMO', 'FOLLOW_UP', 'BOOK_MEETING',
    'REVIEW_REPLY', 'DEPRIORITIZE'
  )),
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  reason text not null,
  due_at timestamptz,
  status text not null default 'PENDING' check (status in ('PENDING', 'COMPLETED', 'SKIPPED', 'SNOOZED')),
  source text not null default 'SYSTEM' check (source in ('SYSTEM', 'USER')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);
create index prospect_actions_org_idx on public.prospect_actions(organization_id);
create index prospect_actions_prospect_idx on public.prospect_actions(prospect_id);
-- The Daily Queue's own primary query: this org's active items, ordered by due date.
create index prospect_actions_active_idx on public.prospect_actions(organization_id, status, due_at)
  where status in ('PENDING', 'SNOOZED');

alter table public.prospect_actions enable row level security;
create policy "members can manage prospect actions"
on public.prospect_actions for all
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = prospect_actions.organization_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = prospect_actions.organization_id
      and m.user_id = auth.uid()
  )
);

-- ------------------------------------------------------------------
-- 4. prospect_activities — append-only event history. References real
--    state (a project id, a pitch id, ...) rather than copying it.
-- ------------------------------------------------------------------
create table public.prospect_activities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  activity_type text not null check (activity_type in (
    'PROSPECT_OPENED', 'GMB_DATA_IMPORTED', 'AUDIT_COMPLETED', 'DEMO_GENERATED',
    'PITCH_GENERATED', 'CONTACT_ATTEMPTED', 'FOLLOW_UP_SCHEDULED', 'MEETING_LOGGED',
    'DEMO_ROOM_SHARED', 'PROSPECT_WON', 'PROSPECT_LOST'
  )),
  channel text,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);
create index prospect_activities_org_idx on public.prospect_activities(organization_id);
create index prospect_activities_prospect_idx on public.prospect_activities(prospect_id, occurred_at desc);

alter table public.prospect_activities enable row level security;
create policy "members can manage prospect activities"
on public.prospect_activities for all
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = prospect_activities.organization_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = prospect_activities.organization_id
      and m.user_id = auth.uid()
  )
);

-- ------------------------------------------------------------------
-- 5. pitches — one generated pitch per (prospect, channel), versioned in
--    place rather than accumulating unbounded rows. "Regenerate" bumps
--    version and updates content; the previous version's text isn't kept
--    (a lightweight history, not full event-sourcing, per the master
--    prompt's own "do not overbuild" instruction) but source_fingerprint
--    lets the UI tell the user their pitch may be stale.
-- ------------------------------------------------------------------
create table public.pitches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  channel text not null check (channel in (
    'call_opener', 'cold_email', 'sms', 'linkedin', 'voicemail', 'loom_intro'
  )),
  subject text,
  body text not null,
  source_fingerprint text not null,
  version integer not null default 1,
  status text not null default 'draft' check (status in ('draft', 'used')),
  used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (prospect_id, channel)
);
create index pitches_org_idx on public.pitches(organization_id);
create index pitches_prospect_idx on public.pitches(prospect_id);

alter table public.pitches enable row level security;
create policy "members can manage pitches"
on public.pitches for all
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = pitches.organization_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = pitches.organization_id
      and m.user_id = auth.uid()
  )
);

-- ------------------------------------------------------------------
-- 6. demo_rooms — the client-facing presentation layer. One per
--    prospect (idempotent creation), never the raw prospect id as the
--    public token — a separate random opaque value, so a guessed/leaked
--    URL can't be walked to enumerate other prospects.
-- ------------------------------------------------------------------
create table public.demo_rooms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  prospect_id uuid not null unique references public.prospects(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  public_token text not null unique default encode(gen_random_bytes(24), 'base64url'),
  status text not null default 'draft' check (status in ('draft', 'ready', 'shared', 'archived')),
  title text not null,
  client_safe_findings jsonb not null default '[]'::jsonb,
  cta_label text not null default 'Let''s walk through this',
  cta_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index demo_rooms_org_idx on public.demo_rooms(organization_id);
create unique index demo_rooms_token_idx on public.demo_rooms(public_token);

alter table public.demo_rooms enable row level security;
-- Admin/org-member management (the internal side — creating, editing, archiving).
create policy "members can manage demo rooms"
on public.demo_rooms for all
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = demo_rooms.organization_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = demo_rooms.organization_id
      and m.user_id = auth.uid()
  )
);
-- The public, unauthenticated side (a real prospect opening their link)
-- is served through the admin/service-role client in the route itself,
-- scoped by an explicit .eq("public_token", ...) filter — the same
-- pattern already established for beta_testers (migration 024) and
-- /pay/[callLogId] — never through this RLS policy, which requires a
-- real org membership a demo-room visitor will never have.
