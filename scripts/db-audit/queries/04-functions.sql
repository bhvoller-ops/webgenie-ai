-- Part 4/7 -- every function introduced/relied on by migrations 017-036,
-- full body text via pg_get_functiondef(). READ-ONLY.
begin transaction read only;

select p.proname as function_name, pg_get_functiondef(p.oid) as definition
from pg_proc p
where p.pronamespace = 'public'::regnamespace
  and p.proname in (
    'my_organization_ids', 'assign_founding_seat', 'mark_vibelabs_onboarding_complete',
    'is_platform_staff', 'enforce_call_log_prospect_tenant', 'enforce_prospect_tenant_match'
  )
order by p.proname;

rollback;
