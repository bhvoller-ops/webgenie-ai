-- Part 2/7 -- every CHECK constraint on a table touched by migrations
-- 017-036, full definition text via pg_get_constraintdef(). READ-ONLY.
begin transaction read only;

select
  con.conrelid::regclass::text as table_name,
  att.attname as column_name,
  con.conname as constraint_name,
  pg_get_constraintdef(con.oid) as definition
from pg_constraint con
join pg_attribute att on att.attrelid = con.conrelid and att.attnum = any(con.conkey)
where con.contype = 'c'
  -- regclass::text renders using search_path-aware minimal qualification
  -- (typically just "call_log", not "public.call_log", since public is on
  -- the default search_path) -- comparing regclass to regclass directly
  -- avoids that trap entirely.
  and con.conrelid = any(array[
    'public.call_log', 'public.chat_leads', 'public.partners', 'public.organizations',
    'public.beta_testers', 'public.support_tickets', 'public.support_ticket_messages',
    'public.prospects', 'public.opportunity_briefs', 'public.next_best_actions',
    'public.prospect_actions', 'public.prospect_activities', 'public.pitches', 'public.demo_rooms',
    'public.team_invitations'
  ]::regclass[])
order by 1, 2;

rollback;
