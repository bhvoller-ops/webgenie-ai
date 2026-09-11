-- Part 11 of the WebGenie production migration reconciliation audit --
-- Step 4 pre-apply data invariants for migrations 037-040 (P2 Agency
-- Growth Engine). READ-ONLY. Reports only aggregate counts and
-- distinct enum-like value lists -- never an individual prospect_id or
-- other business/contact data. All four tables referenced (prospects,
-- prospect_actions, prospect_activities, organizations) are already
-- confirmed present in production (017-036 presence matrix), so no
-- to_regclass guard is needed here the way 10-presence-matrix-037-040.sql
-- needed one for tables that might not exist yet.
begin transaction read only;

select * from (
  values
  -- Active-action duplicate check -- 037's own migration header names
  -- this as the exact precondition prospect_actions_one_active_idx
  -- (a non-concurrent unique index) needs to create successfully.
  ('active_action_duplicate_check', 'violating_prospects_count',
    (select count(*) from (select prospect_id from public.prospect_actions where status in ('PENDING','SNOOZED') group by prospect_id having count(*) > 1) v)::text),
  ('active_action_duplicate_check', 'max_active_actions_per_prospect',
    (select coalesce(max(cnt), 0) from (select prospect_id, count(*) cnt from public.prospect_actions where status in ('PENDING','SNOOZED') group by prospect_id) v)::text),
  ('active_action_duplicate_check', 'total_pending',
    (select count(*) from public.prospect_actions where status = 'PENDING')::text),
  ('active_action_duplicate_check', 'total_snoozed',
    (select count(*) from public.prospect_actions where status = 'SNOOZED')::text),

  ('row_counts', 'prospects', (select count(*) from public.prospects)::text),
  ('row_counts', 'prospect_actions', (select count(*) from public.prospect_actions)::text),
  ('row_counts', 'prospect_activities', (select count(*) from public.prospect_activities)::text),
  ('row_counts', 'organizations', (select count(*) from public.organizations)::text),

  ('existing_values', 'prospect_actions.status distinct',
    (select coalesce(string_agg(distinct status, ',' order by status), '(no rows)') from public.prospect_actions)),
  ('existing_values', 'prospect_actions.action_type distinct',
    (select coalesce(string_agg(distinct action_type, ',' order by action_type), '(no rows)') from public.prospect_actions)),
  ('existing_values', 'prospect_activities.activity_type distinct',
    (select coalesce(string_agg(distinct activity_type, ',' order by activity_type), '(no rows)') from public.prospect_activities)),

  -- Compatibility: 037/038 only WIDEN these CHECK constraints (add
  -- values, never remove). Verified rather than assumed -- must be 0.
  ('compatibility', 'prospect_actions.status values NOT in new allowed set',
    (select count(*) from public.prospect_actions where status not in ('PENDING','COMPLETED','SKIPPED','SNOOZED','SUPPRESSED'))::text),
  ('compatibility', 'prospect_actions.action_type values NOT in new allowed set',
    (select count(*) from public.prospect_actions where action_type not in ('REVIEW_PROSPECT','IMPORT_GMB_DATA','RUN_AUDIT','BUILD_NEW_SITE_DEMO','CREATE_REDESIGN_DEMO','CONTACT','SEND_DEMO','FOLLOW_UP','BOOK_MEETING','REVIEW_REPLY','DEPRIORITIZE','SEQUENCE_STEP'))::text),
  ('compatibility', 'prospect_activities.activity_type values NOT in new allowed set',
    (select count(*) from public.prospect_activities where activity_type not in ('PROSPECT_OPENED','GMB_DATA_IMPORTED','AUDIT_COMPLETED','DEMO_GENERATED','PITCH_GENERATED','CONTACT_ATTEMPTED','FOLLOW_UP_SCHEDULED','MEETING_LOGGED','DEMO_ROOM_SHARED','PROSPECT_WON','PROSPECT_LOST','PROSPECT_SUPPRESSED','PROSPECT_UNSUPPRESSED','SEQUENCE_ENROLLED','SEQUENCE_STEP_DUE','SEQUENCE_PAUSED','SEQUENCE_RESUMED','SEQUENCE_STOPPED','SEQUENCE_COMPLETED'))::text),

  -- Tenant/FK integrity anomalies possible in TODAY's schema (037-040
  -- add no new FK columns to these three tables) -- confirms the
  -- baseline these migrations will layer onto is itself sound.
  ('tenant_integrity', 'prospect_actions rows with no matching prospects row',
    (select count(*) from public.prospect_actions pa where not exists (select 1 from public.prospects p where p.id = pa.prospect_id))::text),
  ('tenant_integrity', 'prospects rows with no matching organizations row',
    (select count(*) from public.prospects p where not exists (select 1 from public.organizations o where o.id = p.organization_id))::text),
  ('tenant_integrity', 'prospect_actions rows whose organization_id disagrees with their prospect''s organization_id',
    (select count(*) from public.prospect_actions pa join public.prospects p on p.id = pa.prospect_id where pa.organization_id is distinct from p.organization_id)::text)

) as invariants(check_group, check_name, result)
order by check_group, check_name;

rollback;
