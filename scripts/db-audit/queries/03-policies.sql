-- Part 3/7 -- every RLS policy on every table touched by migrations
-- 017-036 (public + storage), full USING/WITH CHECK text via the
-- pg_policies system view. READ-ONLY.
begin transaction read only;

select schemaname, tablename, policyname, cmd, roles, qual as using_expression, with_check
from pg_policies
where (schemaname = 'public' and tablename in (
        'audit_logs', 'partners', 'organization_members', 'beta_testers', 'org_branding',
        'support_tickets', 'support_ticket_messages', 'organizations', 'prospects',
        'opportunity_briefs', 'next_best_actions', 'prospect_actions', 'prospect_activities',
        'pitches', 'demo_rooms', 'call_log'
      ))
   or (schemaname = 'storage' and tablename = 'objects' and policyname like '%branding%')
order by schemaname, tablename, policyname;

rollback;
