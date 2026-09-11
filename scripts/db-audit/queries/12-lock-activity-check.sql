-- Part 12 of the WebGenie production migration reconciliation audit --
-- Step 5 lock/activity assessment. READ-ONLY: pg_stat_activity and
-- pg_locks are themselves read-only catalog views; nothing here
-- terminates a session or changes configuration. No query text or PID
-- tied to a specific application user is surfaced -- counts only.
begin transaction read only;

select * from (
  values
  ('long_running_transactions', 'count (xact_start older than 5 minutes, excluding this session)',
    (select count(*) from pg_stat_activity where state != 'idle' and xact_start is not null and now() - xact_start > interval '5 minutes' and pid != pg_backend_pid())::text),
  ('blocking_or_waiting_sessions', 'count (pg_locks granted=false)',
    (select count(*) from pg_locks where not granted)::text),
  ('active_non_idle_sessions', 'count (excluding this session)',
    (select count(*) from pg_stat_activity where state != 'idle' and pid != pg_backend_pid())::text),
  ('total_connections', 'count (all states, excluding this session)',
    (select count(*) from pg_stat_activity where pid != pg_backend_pid())::text),
  ('table_size_estimate', 'prospect_actions reltuples (planner estimate)',
    (select round(reltuples)::text from pg_class where relname = 'prospect_actions' and relnamespace = 'public'::regnamespace)),
  ('table_size_estimate', 'prospect_activities reltuples (planner estimate)',
    (select round(reltuples)::text from pg_class where relname = 'prospect_activities' and relnamespace = 'public'::regnamespace))
) as activity(check_group, check_name, result)
order by check_group, check_name;

rollback;
