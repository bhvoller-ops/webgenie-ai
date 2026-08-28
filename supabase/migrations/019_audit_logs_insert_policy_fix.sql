-- Migration 014 defined this policy but it never actually took effect in
-- production, confirmed 27 Aug 2026 by attempting a real authenticated
-- insert as an actual org member: usage_events' insert policy worked,
-- audit_logs' did not (42501, RLS violation). See CLAUDE.md §2g. This
-- migration is a standalone re-add of just the missing policy, not a
-- re-run of 014 (which would error on usage_events' policy already
-- existing).
--
-- If a policy named "members can write audit logs" already exists on
-- audit_logs by the time this runs (e.g. it was manually patched in the
-- dashboard between the 27 Aug investigation and this migration being
-- applied), drop it first so this is safe to run either way.
drop policy if exists "members can write audit logs" on public.audit_logs;

create policy "members can write audit logs"
on public.audit_logs for insert
to authenticated
with check (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = audit_logs.organization_id
      and m.user_id = auth.uid()
  )
);
