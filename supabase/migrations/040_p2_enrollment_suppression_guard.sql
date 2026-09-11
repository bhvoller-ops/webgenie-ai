-- P2 pre-production database validation -- fix 2: migration 038
-- (MANDATORY FIX 3) added a DB-layer backstop trigger blocking
-- prospect_actions from re-entering PENDING/SNOOZED for a suppressed
-- prospect, specifically because the master prompt's own suppression
-- requirement ("must be enforced in backend/domain logic... do not rely
-- solely on UI hiding") deserved the strongest available layer, not just
-- enrollProspect()'s app-level isSuppressed() check.
--
-- The exact same gap exists, unfixed, for prospect_sequence_enrollments:
-- enrollProspect() (src/lib/prospect/sequence-sync.ts) checks
-- isSuppressed() before inserting, but nothing at the database layer
-- stops a direct insert (or a future call site that forgets the check)
-- from putting a suppressed prospect back into an ACTIVE/PAUSED
-- enrollment. Found during P2 pre-production database validation by
-- checking, for each item the validation directive asked to exercise
-- for real, whether a real database-layer guarantee actually existed for
-- it -- this one did not.
--
-- Mirrors 038's enforce_prospect_actions_not_suppressed() precisely:
-- only blocks a write that would leave the row ACTIVE or PAUSED (i.e.
-- "back in the plan") for a currently-suppressed prospect. Never blocks
-- moving a row to a terminal status (COMPLETED / STOPPED) --
-- suppressProspect() itself needs to do exactly that (see
-- src/lib/prospect/suppression.ts, "stops rows that are still
-- ACTIVE/PAUSED").
--
-- Additive only: no column dropped, no existing row's meaning changed.
--
-- Rollback:
--   drop trigger if exists prospect_sequence_enrollments_suppression_guard on public.prospect_sequence_enrollments;
--   drop function if exists public.enforce_sequence_enrollments_not_suppressed();

create or replace function public.enforce_sequence_enrollments_not_suppressed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status in ('ACTIVE', 'PAUSED') and exists (
    select 1 from public.prospects p
    where p.id = new.prospect_id
      and p.suppressed_at is not null
  ) then
    raise exception 'prospect_sequence_enrollments cannot be set to % for a suppressed prospect (prospect_id=%)', new.status, new.prospect_id;
  end if;
  return new;
end;
$$;

drop trigger if exists prospect_sequence_enrollments_suppression_guard on public.prospect_sequence_enrollments;
create trigger prospect_sequence_enrollments_suppression_guard
before insert or update of status, prospect_id on public.prospect_sequence_enrollments
for each row execute function public.enforce_sequence_enrollments_not_suppressed();
