-- usage_events and audit_logs only had SELECT policies from migration 011 --
-- any real authenticated insert (recordUsage, audit logging in actions.ts)
-- was always going to fail RLS's default-deny, by omission not mystery.

create policy "members can record usage"
on public.usage_events for insert
to authenticated
with check (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = usage_events.organization_id
      and m.user_id = auth.uid()
  )
);

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
