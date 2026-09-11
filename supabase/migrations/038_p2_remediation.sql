-- P2 Phase 1.1 remediation -- three confirmed gaps found by re-inspecting
-- the code the 037 branch had already written, not by re-auditing the
-- architecture from scratch. Each fix below traces to one numbered
-- "MANDATORY FIX" in the remediation directive (this session).
--
-- Additive only, same discipline as 037: no column dropped, no existing
-- row's meaning changed by a default, one more CHECK value added (never
-- narrowed), two new objects (a column + a trigger) that simply don't
-- exist for any row until this migration runs.
--
-- Rollback:
--   drop trigger if exists prospect_actions_suppression_guard on public.prospect_actions;
--   drop function if exists public.enforce_prospect_actions_not_suppressed();
--   drop index if exists public.prospect_activities_event_key_idx;
--   alter table public.prospect_activities drop column if exists event_key;
--   -- the widened prospect_actions.status CHECK is reversible only if no
--   -- row has actually used 'SUPPRESSED' yet -- check first, then re-run
--   -- the same dynamic drop-and-recreate below with the original value list.

-- ============================================================
-- MANDATORY FIX 3 (part 1/2): a suppression-cancelled queue action is a
-- different real-world fact than a user-completed one -- collapsing both
-- into 'COMPLETED' (the only terminal-ish value previously available to
-- suppressProspect()'s cancellation path) would silently misstate history
-- for any future analytics that trusts status='COMPLETED' to mean "the
-- user did this." 'SUPPRESSED' names the real cause.
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
    and att.attname = 'status'
    and array_length(con.conkey, 1) = 1;

  if constraint_name is not null then
    execute format('alter table public.prospect_actions drop constraint %I', constraint_name);
  end if;

  alter table public.prospect_actions
    add constraint prospect_actions_status_check
    check (status in ('PENDING', 'COMPLETED', 'SKIPPED', 'SNOOZED', 'SUPPRESSED'));
end $$;

-- ============================================================
-- MANDATORY FIX 3 (part 2/2): suppression must block queue eligibility at
-- the database layer itself, not only wherever app code remembers to
-- check isSuppressed() first -- this is the backstop for every current
-- AND future insert/update path (regeneration, sequence reconciliation, a
-- feature not yet written), matching the original master prompt's own
-- "must be enforced in backend/domain logic... do not rely solely on UI
-- hiding," extended here to the strongest available backend layer.
--
-- Deliberately narrow: only blocks a write that would leave the row
-- PENDING or SNOOZED (i.e. "back in the queue") for a currently-suppressed
-- prospect. Never blocks moving a row to a terminal status (COMPLETED /
-- SKIPPED / SUPPRESSED) -- suppressProspect() itself needs to do exactly
-- that.
-- ============================================================
create or replace function public.enforce_prospect_actions_not_suppressed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status in ('PENDING', 'SNOOZED') and exists (
    select 1 from public.prospects p
    where p.id = new.prospect_id
      and p.suppressed_at is not null
  ) then
    raise exception 'prospect_actions cannot be set to % for a suppressed prospect (prospect_id=%)', new.status, new.prospect_id;
  end if;
  return new;
end;
$$;

drop trigger if exists prospect_actions_suppression_guard on public.prospect_actions;
create trigger prospect_actions_suppression_guard
before insert or update of status, prospect_id on public.prospect_actions
for each row execute function public.enforce_prospect_actions_not_suppressed();

-- ============================================================
-- MANDATORY FIX 2: database-backed idempotency for sequence activity
-- events. The previous "select whether SEQUENCE_STEP_DUE already exists,
-- then insert" in sequence-sync.ts was a real TOCTOU race under
-- concurrent reconciliation (two overlapping regenerateProspectIntelligence
-- calls can both pass the select before either insert lands). event_key is
-- a stable, caller-computed identity for exactly the events that must
-- happen at most once per (enrollment, step, kind) --
-- "sequence_step_due:<enrollmentId>:<stepId>",
-- "contact_attempted:<enrollmentId>:<stepId>",
-- "follow_up_scheduled:<enrollmentId>:<stepId>",
-- "sequence_stopped:<enrollmentId>" -- left null for every other activity
-- type, which keeps inserting exactly as before (a partial unique index
-- ignores nulls, so this is zero-behavior-change for every non-keyed
-- event). Enforced via logActivity()'s upsert-with-ignoreDuplicates, an
-- atomic `insert ... on conflict (event_key) do nothing` -- never a
-- second select-then-branch race reintroduced at the DB layer.
--
-- Deliberately keyed by (enrollment, step) rather than a broader
-- (enrollment) or (prospect) key -- a prospect legitimately gets contacted
-- at MULTIPLE distinct steps over a sequence's life; only a retry/
-- double-click of the SAME step's SAME event must collapse to one row.
-- ============================================================
alter table public.prospect_activities
  add column if not exists event_key text;

create unique index if not exists prospect_activities_event_key_idx
  on public.prospect_activities(event_key) where event_key is not null;
