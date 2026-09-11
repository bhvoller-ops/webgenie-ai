-- Part 10 of the WebGenie production migration reconciliation audit --
-- extends 01-presence-matrix.sql's coverage (017-036) to also cover
-- 037-040 (the P2 Agency Growth Engine migrations on branch
-- feature/p2-agency-growth-engine, validated so far only against the
-- separate webgenie-p2-preprod project per 039/040's own migration
-- comments -- "038 has not been applied to production"). READ-ONLY,
-- same shape and safety discipline as 01-presence-matrix.sql: one SELECT
-- of literal (migration, object_kind, object_name, present) rows inside
-- BEGIN TRANSACTION READ ONLY ... ROLLBACK.
begin transaction read only;

select * from (
  values
  ('037', 'column', 'organizations.is_test (boolean not null default false)', exists (select 1 from information_schema.columns where table_schema='public' and table_name='organizations' and column_name='is_test' and is_nullable='NO' and column_default='false')),

  ('037', 'column', 'prospects.suppressed_at', exists (select 1 from information_schema.columns where table_schema='public' and table_name='prospects' and column_name='suppressed_at')),
  ('037', 'column', 'prospects.suppression_reason', exists (select 1 from information_schema.columns where table_schema='public' and table_name='prospects' and column_name='suppression_reason')),
  ('037', 'check_constraint', 'prospects.suppression_reason CHECK (enum incl. OPTED_OUT/DO_NOT_CONTACT/INVALID_CONTACT/MANUAL)', exists (select 1 from pg_constraint c join pg_attribute a on a.attrelid=c.conrelid and a.attnum=any(c.conkey) where c.conrelid='public.prospects'::regclass and c.contype='c' and a.attname='suppression_reason' and pg_get_constraintdef(c.oid) like '%OPTED_OUT%' and pg_get_constraintdef(c.oid) like '%MANUAL%')),
  ('037', 'check_constraint', 'prospects_suppression_consistency ((suppressed_at is null) = (suppression_reason is null))', exists (select 1 from pg_constraint where conname='prospects_suppression_consistency' and conrelid='public.prospects'::regclass)),
  ('037', 'index_partial', 'prospects_suppressed_idx', exists (select 1 from pg_indexes where schemaname='public' and indexname='prospects_suppressed_idx')),

  ('037', 'check_constraint_widened', 'prospect_activities.activity_type CHECK includes SEQUENCE_ENROLLED/SEQUENCE_STEP_DUE/SEQUENCE_PAUSED/SEQUENCE_RESUMED/SEQUENCE_STOPPED/SEQUENCE_COMPLETED', exists (select 1 from pg_constraint c join pg_attribute a on a.attrelid=c.conrelid and a.attnum=any(c.conkey) where c.conrelid='public.prospect_activities'::regclass and c.contype='c' and a.attname='activity_type' and pg_get_constraintdef(c.oid) like '%SEQUENCE_ENROLLED%' and pg_get_constraintdef(c.oid) like '%SEQUENCE_COMPLETED%')),
  ('037', 'check_constraint_widened', 'prospect_actions.action_type CHECK includes SEQUENCE_STEP', exists (select 1 from pg_constraint c join pg_attribute a on a.attrelid=c.conrelid and a.attnum=any(c.conkey) where c.conrelid='public.prospect_actions'::regclass and c.contype='c' and a.attname='action_type' and pg_get_constraintdef(c.oid) like '%SEQUENCE_STEP%')),
  ('037', 'unique_index_partial', 'prospect_actions_one_active_idx (unique where status in PENDING/SNOOZED)', exists (select 1 from pg_indexes where schemaname='public' and indexname='prospect_actions_one_active_idx')),

  ('037', 'table', 'outreach_sequences', exists (select 1 from information_schema.tables where table_schema='public' and table_name='outreach_sequences')),
  ('037', 'index', 'outreach_sequences_org_idx', exists (select 1 from pg_indexes where schemaname='public' and indexname='outreach_sequences_org_idx')),
  ('037', 'rls_enabled', 'outreach_sequences', exists (select 1 from pg_class where relname='outreach_sequences' and relnamespace='public'::regnamespace and relrowsecurity)),
  ('037', 'policy', 'outreach_sequences: "members can manage outreach sequences" (ALL)', exists (select 1 from pg_policies where schemaname='public' and tablename='outreach_sequences' and policyname='members can manage outreach sequences')),

  ('037', 'table', 'outreach_sequence_steps', exists (select 1 from information_schema.tables where table_schema='public' and table_name='outreach_sequence_steps')),
  ('037', 'unique_constraint', 'outreach_sequence_steps (sequence_id, step_order)', exists (select 1 from pg_constraint where conrelid=to_regclass('public.outreach_sequence_steps') and contype='u' and pg_get_constraintdef(oid) like '%sequence_id%step_order%')),
  ('037', 'rls_enabled', 'outreach_sequence_steps', exists (select 1 from pg_class where relname='outreach_sequence_steps' and relnamespace='public'::regnamespace and relrowsecurity)),
  ('037', 'policy', 'outreach_sequence_steps: "members can manage sequence steps" (ALL)', exists (select 1 from pg_policies where schemaname='public' and tablename='outreach_sequence_steps' and policyname='members can manage sequence steps')),

  ('037', 'table', 'prospect_sequence_enrollments', exists (select 1 from information_schema.tables where table_schema='public' and table_name='prospect_sequence_enrollments')),
  ('037', 'index', 'prospect_sequence_enrollments_org_idx', exists (select 1 from pg_indexes where schemaname='public' and indexname='prospect_sequence_enrollments_org_idx')),
  ('037', 'index', 'prospect_sequence_enrollments_prospect_idx', exists (select 1 from pg_indexes where schemaname='public' and indexname='prospect_sequence_enrollments_prospect_idx')),
  ('037', 'index_partial', 'prospect_sequence_enrollments_due_idx (org, status, next_step_due_at where ACTIVE)', exists (select 1 from pg_indexes where schemaname='public' and indexname='prospect_sequence_enrollments_due_idx')),
  ('037', 'unique_index_partial', 'prospect_sequence_enrollments_one_active_idx (unique where status in ACTIVE/PAUSED)', exists (select 1 from pg_indexes where schemaname='public' and indexname='prospect_sequence_enrollments_one_active_idx')),
  ('037', 'rls_enabled', 'prospect_sequence_enrollments', exists (select 1 from pg_class where relname='prospect_sequence_enrollments' and relnamespace='public'::regnamespace and relrowsecurity)),
  ('037', 'policy', 'prospect_sequence_enrollments: "members can manage sequence enrollments" (ALL)', exists (select 1 from pg_policies where schemaname='public' and tablename='prospect_sequence_enrollments' and policyname='members can manage sequence enrollments')),
  ('037', 'function', 'enforce_sequence_enrollment_tenant()', exists (select 1 from pg_proc where proname='enforce_sequence_enrollment_tenant' and pronamespace='public'::regnamespace)),
  ('037', 'trigger', 'prospect_sequence_enrollments_tenant_guard', exists (select 1 from pg_trigger where tgname='prospect_sequence_enrollments_tenant_guard' and tgrelid=to_regclass('public.prospect_sequence_enrollments') and not tgisinternal)),

  ('037', 'table', 'prospect_handoffs', exists (select 1 from information_schema.tables where table_schema='public' and table_name='prospect_handoffs')),
  ('037', 'rls_enabled', 'prospect_handoffs', exists (select 1 from pg_class where relname='prospect_handoffs' and relnamespace='public'::regnamespace and relrowsecurity)),
  ('037', 'policy', 'prospect_handoffs: "members can manage prospect handoffs" (ALL)', exists (select 1 from pg_policies where schemaname='public' and tablename='prospect_handoffs' and policyname='members can manage prospect handoffs')),

  ('037', 'table', 'organization_launch_settings', exists (select 1 from information_schema.tables where table_schema='public' and table_name='organization_launch_settings')),
  ('037', 'rls_enabled', 'organization_launch_settings', exists (select 1 from pg_class where relname='organization_launch_settings' and relnamespace='public'::regnamespace and relrowsecurity)),
  ('037', 'policy', 'organization_launch_settings: "members can manage launch settings" (ALL)', exists (select 1 from pg_policies where schemaname='public' and tablename='organization_launch_settings' and policyname='members can manage launch settings')),

  ('038', 'check_constraint_widened', 'prospect_actions.status CHECK includes SUPPRESSED', exists (select 1 from pg_constraint c join pg_attribute a on a.attrelid=c.conrelid and a.attnum=any(c.conkey) where c.conrelid='public.prospect_actions'::regclass and c.contype='c' and a.attname='status' and pg_get_constraintdef(c.oid) like '%SUPPRESSED%')),
  ('038', 'function', 'enforce_prospect_actions_not_suppressed()', exists (select 1 from pg_proc where proname='enforce_prospect_actions_not_suppressed' and pronamespace='public'::regnamespace)),
  ('038', 'trigger', 'prospect_actions_suppression_guard', exists (select 1 from pg_trigger where tgname='prospect_actions_suppression_guard' and tgrelid='public.prospect_actions'::regclass and not tgisinternal)),
  ('038', 'column', 'prospect_activities.event_key', exists (select 1 from information_schema.columns where table_schema='public' and table_name='prospect_activities' and column_name='event_key')),
  ('038', 'index_SUPERSEDED_BY_039_check_non_partial_below', 'prospect_activities_event_key_idx existed in some form pre-039', exists (select 1 from pg_indexes where schemaname='public' and indexname='prospect_activities_event_key_idx')),

  ('039', 'index_non_partial', 'prospect_activities_event_key_idx is a NON-partial unique index (no WHERE clause -- required as an ON CONFLICT (event_key) arbiter)', exists (select 1 from pg_indexes where schemaname='public' and indexname='prospect_activities_event_key_idx' and indexdef not ilike '%where%')),

  ('040', 'function', 'enforce_sequence_enrollments_not_suppressed()', exists (select 1 from pg_proc where proname='enforce_sequence_enrollments_not_suppressed' and pronamespace='public'::regnamespace)),
  ('040', 'trigger', 'prospect_sequence_enrollments_suppression_guard', exists (select 1 from pg_trigger where tgname='prospect_sequence_enrollments_suppression_guard' and tgrelid=to_regclass('public.prospect_sequence_enrollments') and not tgisinternal))

) as matrix(migration, object_kind, object_name, present)
order by migration, object_kind, object_name;

rollback;
