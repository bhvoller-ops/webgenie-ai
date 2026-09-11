-- Part 5/7 -- every trigger introduced by migrations 017-036, full
-- definition text via pg_get_triggerdef(). READ-ONLY.
begin transaction read only;

select
  t.tgname as trigger_name,
  t.tgrelid::regclass::text as table_name,
  pg_get_triggerdef(t.oid) as definition
from pg_trigger t
where not t.tgisinternal
  and t.tgname in (
    'trg_assign_founding_seat', 'call_log_prospect_tenant_guard',
    'prospect_actions_tenant_guard', 'prospect_activities_tenant_guard',
    'pitches_tenant_guard', 'demo_rooms_tenant_guard'
  )
order by t.tgname;

rollback;
