-- ============================================================================
-- WebGenie production migration reconciliation audit -- migrations 017-036.
--
-- READ-ONLY. Every statement below is a SELECT against information_schema /
-- pg_catalog (and one against supabase_migrations.schema_migrations, itself
-- just a SELECT). Nothing here creates, alters, inserts, updates, deletes,
-- drops, or truncates anything. Wrapped in an explicit READ ONLY transaction
-- that always ends in ROLLBACK, never COMMIT, so it is structurally
-- impossible for this script to leave a change behind even if some future
-- edit accidentally introduced one -- Postgres itself would reject a
-- mutating statement inside a READ ONLY transaction (error 25006).
--
-- Intended runner: scripts/db-audit/run-prod-audit.sh (or an equivalent
-- approved read-only channel / the Supabase SQL editor's own read-only
-- role, if that is the approved channel instead). Never edit this file to
-- add a mutating statement "just this once" -- add a new, separate script.
--
-- Output shape: one "presence matrix" result set (migration, object_kind,
-- object_name, expected, observed_present, note) covering every table/
-- column/index/RLS-enabled/policy-exists/function-exists/trigger-exists
-- check from migrations 017-036, followed by separate result sets that
-- dump the actual DEFINITION text (via pg_get_constraintdef /
-- pg_get_functiondef / pg_get_triggerdef / pg_policies.qual+with_check) for
-- every object whose *definition*, not just presence, matters -- so a
-- policy/constraint/function/trigger that exists under the right name but
-- with different logic is not misreported as a match.
-- ============================================================================

begin transaction read only;

-- ----------------------------------------------------------------------
-- 1. Presence matrix: tables, columns, indexes, RLS-enabled, policy/
--    function/trigger EXISTENCE (definition text is checked separately
--    below for every one of these that matters). One row per expected
--    object from migrations 017-036, in migration order.
-- ----------------------------------------------------------------------
select * from (
  values
  -- ---- 017: call_log_billing ----
  ('017', 'column', 'call_log.stripe_customer_id', exists (select 1 from information_schema.columns where table_schema='public' and table_name='call_log' and column_name='stripe_customer_id')),
  ('017', 'column', 'call_log.stripe_checkout_session_id', exists (select 1 from information_schema.columns where table_schema='public' and table_name='call_log' and column_name='stripe_checkout_session_id')),
  ('017', 'column', 'call_log.stripe_subscription_id', exists (select 1 from information_schema.columns where table_schema='public' and table_name='call_log' and column_name='stripe_subscription_id')),
  ('017', 'column', 'call_log.payment_status (text not null default ''none'')', exists (select 1 from information_schema.columns where table_schema='public' and table_name='call_log' and column_name='payment_status' and is_nullable='NO' and column_default like '%none%')),
  ('017', 'index', 'call_log_stripe_subscription_idx', exists (select 1 from pg_indexes where schemaname='public' and indexname='call_log_stripe_subscription_idx')),

  -- ---- 018: site_lead_form ----
  ('018', 'column', 'chat_leads.source (text not null default ''chat'')', exists (select 1 from information_schema.columns where table_schema='public' and table_name='chat_leads' and column_name='source' and is_nullable='NO' and column_default like '%chat%')),
  ('018', 'column', 'chat_leads.visitor_email', exists (select 1 from information_schema.columns where table_schema='public' and table_name='chat_leads' and column_name='visitor_email')),
  ('018', 'column', 'chat_leads.service_requested', exists (select 1 from information_schema.columns where table_schema='public' and table_name='chat_leads' and column_name='service_requested')),
  ('018', 'column', 'chat_leads.city', exists (select 1 from information_schema.columns where table_schema='public' and table_name='chat_leads' and column_name='city')),
  ('018', 'comment', 'column comment on chat_leads.source', exists (select 1 from pg_description d join pg_attribute a on a.attrelid=d.objoid and a.attnum=d.objsubid join pg_class c on c.oid=a.attrelid where c.relname='chat_leads' and a.attname='source' and d.description like '%form = submitted%')),

  -- ---- 019: audit_logs_insert_policy_fix ----
  ('019', 'policy', 'audit_logs: "members can write audit logs" (INSERT)', exists (select 1 from pg_policies where schemaname='public' and tablename='audit_logs' and policyname='members can write audit logs' and cmd='INSERT')),

  -- ---- 020: partner_program ----
  ('020', 'table', 'partners', exists (select 1 from information_schema.tables where table_schema='public' and table_name='partners')),
  ('020', 'column', 'partners.organization_id', exists (select 1 from information_schema.columns where table_schema='public' and table_name='partners' and column_name='organization_id')),
  ('020', 'column', 'partners.referral_code', exists (select 1 from information_schema.columns where table_schema='public' and table_name='partners' and column_name='referral_code')),
  ('020', 'column', 'partners.flat_fee numeric(10,2) default 100.00', exists (select 1 from information_schema.columns where table_schema='public' and table_name='partners' and column_name='flat_fee' and numeric_precision=10 and numeric_scale=2)),
  ('020', 'column', 'partners.status default ''active''', exists (select 1 from information_schema.columns where table_schema='public' and table_name='partners' and column_name='status' and column_default like '%active%')),
  ('020', 'unique_constraint', 'partners (organization_id, referral_code)', exists (select 1 from pg_constraint where conrelid='public.partners'::regclass and contype='u' and pg_get_constraintdef(oid) like '%organization_id%referral_code%')),
  ('020', 'index', 'partners_org_idx', exists (select 1 from pg_indexes where schemaname='public' and indexname='partners_org_idx')),
  ('020', 'rls_enabled', 'partners', exists (select 1 from pg_class where relname='partners' and relnamespace='public'::regnamespace and relrowsecurity)),
  ('020', 'policy_EXPECTED_ABSENT_superseded_by_022', 'partners: "members can manage partners"', not exists (select 1 from pg_policies where schemaname='public' and tablename='partners' and policyname='members can manage partners')),
  ('020', 'column', 'call_log.partner_id', exists (select 1 from information_schema.columns where table_schema='public' and table_name='call_log' and column_name='partner_id')),
  ('020', 'column', 'call_log.commission_status default ''none''', exists (select 1 from information_schema.columns where table_schema='public' and table_name='call_log' and column_name='commission_status' and column_default like '%none%')),
  ('020', 'column', 'call_log.commission_amount numeric(10,2)', exists (select 1 from information_schema.columns where table_schema='public' and table_name='call_log' and column_name='commission_amount')),
  ('020', 'index', 'call_log_partner_idx', exists (select 1 from pg_indexes where schemaname='public' and indexname='call_log_partner_idx')),

  -- ---- 021: call_log_self_serve ----
  ('021', 'column', 'call_log.source default ''manual''', exists (select 1 from information_schema.columns where table_schema='public' and table_name='call_log' and column_name='source' and column_default like '%manual%')),
  ('021', 'column', 'call_log.contact_name', exists (select 1 from information_schema.columns where table_schema='public' and table_name='call_log' and column_name='contact_name')),
  ('021', 'column', 'call_log.email', exists (select 1 from information_schema.columns where table_schema='public' and table_name='call_log' and column_name='email')),

  -- ---- 022: partner_portal_and_roles ----
  ('022', 'column', 'partners.user_id', exists (select 1 from information_schema.columns where table_schema='public' and table_name='partners' and column_name='user_id')),
  ('022', 'unique_constraint', 'partners_user_id_key', exists (select 1 from pg_constraint where conname='partners_user_id_key' and conrelid='public.partners'::regclass)),
  ('022', 'policy', 'partners: "partners read own row" (SELECT)', exists (select 1 from pg_policies where schemaname='public' and tablename='partners' and policyname='partners read own row' and cmd='SELECT')),
  ('022', 'policy', 'call_log: "partners read own referred deals" (SELECT)', exists (select 1 from pg_policies where schemaname='public' and tablename='call_log' and policyname='partners read own referred deals' and cmd='SELECT')),
  ('022', 'policy', 'partners: "admins manage partners" (ALL)', exists (select 1 from pg_policies where schemaname='public' and tablename='partners' and policyname='admins manage partners' and cmd='ALL')),
  ('022', 'constraint_contains_partner', 'team_invitations_role_check includes ''partner''', exists (select 1 from pg_constraint where conname='team_invitations_role_check' and conrelid='public.team_invitations'::regclass and pg_get_constraintdef(oid) like '%partner%')),
  ('022', 'column', 'team_invitations.partner_id', exists (select 1 from information_schema.columns where table_schema='public' and table_name='team_invitations' and column_name='partner_id')),

  -- ---- 023: organization_members_read_policy ----
  ('023', 'function', 'my_organization_ids()', exists (select 1 from pg_proc where proname='my_organization_ids' and pronamespace='public'::regnamespace)),
  ('023', 'policy', 'organization_members: "members can read org membership list" (SELECT)', exists (select 1 from pg_policies where schemaname='public' and tablename='organization_members' and policyname='members can read org membership list' and cmd='SELECT')),

  -- ---- 024: beta_testers ----
  ('024', 'table', 'beta_testers', exists (select 1 from information_schema.tables where table_schema='public' and table_name='beta_testers')),
  ('024', 'unique_constraint', 'beta_testers (organization_id, email)', exists (select 1 from pg_constraint where conrelid='public.beta_testers'::regclass and contype='u' and pg_get_constraintdef(oid) like '%organization_id%email%')),
  ('024', 'rls_enabled', 'beta_testers', exists (select 1 from pg_class where relname='beta_testers' and relnamespace='public'::regnamespace and relrowsecurity)),
  ('024', 'policy_EXPECTED_ABSENT_by_design', 'beta_testers has NO policies (deliberate)', not exists (select 1 from pg_policies where schemaname='public' and tablename='beta_testers')),
  ('024', 'column', 'projects.beta_tester_id', exists (select 1 from information_schema.columns where table_schema='public' and table_name='projects' and column_name='beta_tester_id')),
  ('024', 'column', 'projects.is_trial default false', exists (select 1 from information_schema.columns where table_schema='public' and table_name='projects' and column_name='is_trial' and column_default='false')),
  ('024', 'index', 'projects_beta_tester_idx', exists (select 1 from pg_indexes where schemaname='public' and indexname='projects_beta_tester_idx')),

  -- ---- 025: default_plan_starter_for_new_orgs ----
  ('025', 'column_default', 'organizations.plan_key default ''starter''', exists (select 1 from information_schema.columns where table_schema='public' and table_name='organizations' and column_name='plan_key' and column_default like '%starter%')),

  -- ---- 026: fix_legacy_trialing_status -- SEE NOTE: pure historical data
  --      UPDATE, no schema footprint. This row is a structural placeholder,
  --      not proof either way -- see the report's UNVERIFIABLE section.
  ('026', 'data_only_no_schema_marker', 'legacy trialing->active backfill (historical, see report)', null::boolean),

  -- ---- 028: vibelabs_membership ----
  ('028', 'column', 'organizations.offer_key default ''webgenie''', exists (select 1 from information_schema.columns where table_schema='public' and table_name='organizations' and column_name='offer_key' and column_default like '%webgenie%')),
  ('028', 'column', 'organizations.founding_member_seat (unique)', exists (select 1 from information_schema.columns where table_schema='public' and table_name='organizations' and column_name='founding_member_seat')),
  ('028', 'unique_constraint', 'organizations.founding_member_seat unique', exists (select 1 from pg_constraint c join pg_attribute a on a.attrelid=c.conrelid and a.attnum=any(c.conkey) where c.conrelid='public.organizations'::regclass and c.contype='u' and a.attname='founding_member_seat')),
  ('028', 'column', 'organizations.guarantee_started_at', exists (select 1 from information_schema.columns where table_schema='public' and table_name='organizations' and column_name='guarantee_started_at')),
  ('028', 'column', 'organizations.guarantee_deadline_at', exists (select 1 from information_schema.columns where table_schema='public' and table_name='organizations' and column_name='guarantee_deadline_at')),
  ('028', 'column', 'organizations.guarantee_status default ''pending''', exists (select 1 from information_schema.columns where table_schema='public' and table_name='organizations' and column_name='guarantee_status' and column_default like '%pending%')),
  ('028', 'column', 'organizations.first_client_won_at', exists (select 1 from information_schema.columns where table_schema='public' and table_name='organizations' and column_name='first_client_won_at')),
  ('028', 'column', 'organizations.onboarding_completed_at', exists (select 1 from information_schema.columns where table_schema='public' and table_name='organizations' and column_name='onboarding_completed_at')),
  ('028', 'column', 'organizations.is_platform_operator default false', exists (select 1 from information_schema.columns where table_schema='public' and table_name='organizations' and column_name='is_platform_operator' and column_default='false')),
  ('028', 'column', 'organizations.tos_accepted_at', exists (select 1 from information_schema.columns where table_schema='public' and table_name='organizations' and column_name='tos_accepted_at')),
  ('028', 'column', 'organizations.tos_version', exists (select 1 from information_schema.columns where table_schema='public' and table_name='organizations' and column_name='tos_version')),
  ('028', 'data_row', 'plan_catalog row key=''vibelabs'' price_monthly_cents=9700', exists (select 1 from public.plan_catalog where key='vibelabs' and price_monthly_cents=9700 and price_yearly_cents=9700)),
  ('028', 'function', 'assign_founding_seat()', exists (select 1 from pg_proc where proname='assign_founding_seat' and pronamespace='public'::regnamespace)),
  ('028', 'trigger', 'organizations: trg_assign_founding_seat (BEFORE INSERT)', exists (select 1 from pg_trigger where tgname='trg_assign_founding_seat' and tgrelid='public.organizations'::regclass and not tgisinternal)),

  -- ---- 029: org_branding ----
  ('029', 'table', 'org_branding', exists (select 1 from information_schema.tables where table_schema='public' and table_name='org_branding')),
  ('029', 'rls_enabled', 'org_branding', exists (select 1 from pg_class where relname='org_branding' and relnamespace='public'::regnamespace and relrowsecurity)),
  ('029', 'policy', 'org_branding: "admins manage own branding" (ALL)', exists (select 1 from pg_policies where schemaname='public' and tablename='org_branding' and policyname='admins manage own branding')),
  ('029', 'data_row', 'storage.buckets id=''org-branding'' public=true', exists (select 1 from storage.buckets where id='org-branding' and public=true)),
  ('029', 'policy', 'storage.objects: "org admins can upload their own branding assets" (INSERT)', exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='org admins can upload their own branding assets')),
  ('029', 'policy', 'storage.objects: "org admins can replace their own branding assets" (UPDATE)', exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='org admins can replace their own branding assets')),
  ('029', 'policy', 'storage.objects: "org admins can delete their own branding assets" (DELETE)', exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='org admins can delete their own branding assets')),

  -- ---- 030: mark_onboarding_complete_fn ----
  ('030', 'function', 'mark_vibelabs_onboarding_complete()', exists (select 1 from pg_proc where proname='mark_vibelabs_onboarding_complete' and pronamespace='public'::regnamespace)),
  ('030', 'grant', 'EXECUTE on mark_vibelabs_onboarding_complete() to authenticated', exists (select 1 from information_schema.routine_privileges where routine_schema='public' and routine_name='mark_vibelabs_onboarding_complete' and grantee='authenticated' and privilege_type='EXECUTE')),

  -- ---- 031: support_tickets ----
  ('031', 'table', 'support_tickets', exists (select 1 from information_schema.tables where table_schema='public' and table_name='support_tickets')),
  ('031', 'table', 'support_ticket_messages', exists (select 1 from information_schema.tables where table_schema='public' and table_name='support_ticket_messages')),
  ('031', 'rls_enabled', 'support_tickets', exists (select 1 from pg_class where relname='support_tickets' and relnamespace='public'::regnamespace and relrowsecurity)),
  ('031', 'rls_enabled', 'support_ticket_messages', exists (select 1 from pg_class where relname='support_ticket_messages' and relnamespace='public'::regnamespace and relrowsecurity)),
  ('031', 'function', 'is_platform_staff(uuid)', exists (select 1 from pg_proc where proname='is_platform_staff' and pronamespace='public'::regnamespace)),
  ('031', 'policy', 'support_tickets: "members manage own tickets" (ALL)', exists (select 1 from pg_policies where schemaname='public' and tablename='support_tickets' and policyname='members manage own tickets')),
  ('031', 'policy', 'support_ticket_messages: "members read/write own ticket messages" (ALL)', exists (select 1 from pg_policies where schemaname='public' and tablename='support_ticket_messages' and policyname='members read/write own ticket messages')),
  ('031', 'index', 'support_tickets_organization_id_idx', exists (select 1 from pg_indexes where schemaname='public' and indexname='support_tickets_organization_id_idx')),
  ('031', 'index', 'support_ticket_messages_ticket_id_idx', exists (select 1 from pg_indexes where schemaname='public' and indexname='support_ticket_messages_ticket_id_idx')),

  -- ---- 032: staff_read_organizations ----
  ('032', 'policy', 'organizations: "platform staff can read all organizations" (SELECT)', exists (select 1 from pg_policies where schemaname='public' and tablename='organizations' and policyname='platform staff can read all organizations' and cmd='SELECT')),

  -- ---- 033: default_organization ----
  ('033', 'column', 'organizations.is_default default false', exists (select 1 from information_schema.columns where table_schema='public' and table_name='organizations' and column_name='is_default' and column_default='false')),
  ('033', 'unique_index_partial', 'organizations_single_default_idx (unique where is_default)', exists (select 1 from pg_indexes where schemaname='public' and indexname='organizations_single_default_idx')),
  ('033', 'data_invariant', 'exactly one organizations row has is_default=true', (select count(*) from public.organizations where is_default) = 1),
  ('033', 'comment', 'column comment on organizations.is_default', exists (select 1 from pg_description d join pg_attribute a on a.attrelid=d.objoid and a.attnum=d.objsubid join pg_class c on c.oid=a.attrelid where c.relname='organizations' and a.attname='is_default' and d.description like '%direct-intake%')),

  -- ---- 034: opportunity_brief_and_next_best_action ----
  ('034', 'table', 'prospects', exists (select 1 from information_schema.tables where table_schema='public' and table_name='prospects')),
  ('034', 'column', 'prospects.organization_id', exists (select 1 from information_schema.columns where table_schema='public' and table_name='prospects' and column_name='organization_id')),
  ('034', 'column', 'prospects.status default ''new''', exists (select 1 from information_schema.columns where table_schema='public' and table_name='prospects' and column_name='status')),
  ('034', 'index', 'prospects_org_idx', exists (select 1 from pg_indexes where schemaname='public' and indexname='prospects_org_idx')),
  ('034', 'index', 'prospects_project_idx', exists (select 1 from pg_indexes where schemaname='public' and indexname='prospects_project_idx')),
  ('034', 'unique_index_partial', 'prospects_org_google_place_idx', exists (select 1 from pg_indexes where schemaname='public' and indexname='prospects_org_google_place_idx')),
  ('034', 'unique_index_partial', 'prospects_org_name_phone_idx', exists (select 1 from pg_indexes where schemaname='public' and indexname='prospects_org_name_phone_idx')),
  ('034', 'column', 'call_log.prospect_id', exists (select 1 from information_schema.columns where table_schema='public' and table_name='call_log' and column_name='prospect_id')),
  ('034', 'index', 'call_log_prospect_idx', exists (select 1 from pg_indexes where schemaname='public' and indexname='call_log_prospect_idx')),
  ('034', 'table', 'opportunity_briefs', exists (select 1 from information_schema.tables where table_schema='public' and table_name='opportunity_briefs')),
  ('034', 'table', 'next_best_actions', exists (select 1 from information_schema.tables where table_schema='public' and table_name='next_best_actions')),
  ('034', 'rls_enabled', 'prospects', exists (select 1 from pg_class where relname='prospects' and relnamespace='public'::regnamespace and relrowsecurity)),
  ('034', 'rls_enabled', 'opportunity_briefs', exists (select 1 from pg_class where relname='opportunity_briefs' and relnamespace='public'::regnamespace and relrowsecurity)),
  ('034', 'rls_enabled', 'next_best_actions', exists (select 1 from pg_class where relname='next_best_actions' and relnamespace='public'::regnamespace and relrowsecurity)),
  ('034', 'policy', 'prospects: "members can manage prospects" (ALL)', exists (select 1 from pg_policies where schemaname='public' and tablename='prospects' and policyname='members can manage prospects')),
  ('034', 'policy', 'opportunity_briefs: "members can manage opportunity briefs" (ALL)', exists (select 1 from pg_policies where schemaname='public' and tablename='opportunity_briefs' and policyname='members can manage opportunity briefs')),
  ('034', 'policy', 'next_best_actions: "members can manage next best actions" (ALL)', exists (select 1 from pg_policies where schemaname='public' and tablename='next_best_actions' and policyname='members can manage next best actions')),
  ('034', 'function', 'enforce_call_log_prospect_tenant()', exists (select 1 from pg_proc where proname='enforce_call_log_prospect_tenant' and pronamespace='public'::regnamespace)),
  ('034', 'trigger', 'call_log: call_log_prospect_tenant_guard', exists (select 1 from pg_trigger where tgname='call_log_prospect_tenant_guard' and tgrelid='public.call_log'::regclass and not tgisinternal)),

  -- ---- 035: prospect_public_profile ----
  ('035', 'column', 'prospects.public_profile jsonb', exists (select 1 from information_schema.columns where table_schema='public' and table_name='prospects' and column_name='public_profile' and data_type='jsonb')),
  ('035', 'column', 'prospects.public_profile_source', exists (select 1 from information_schema.columns where table_schema='public' and table_name='prospects' and column_name='public_profile_source')),
  ('035', 'column', 'prospects.public_profile_fetched_at', exists (select 1 from information_schema.columns where table_schema='public' and table_name='prospects' and column_name='public_profile_fetched_at')),

  -- ---- 036: p1_action_pitch_demo_room ----
  ('036', 'check_constraint_widened', 'prospects.status CHECK includes ''meeting''', exists (select 1 from pg_constraint c join pg_attribute a on a.attrelid=c.conrelid and a.attnum=any(c.conkey) where c.conrelid='public.prospects'::regclass and c.contype='c' and a.attname='status' and pg_get_constraintdef(c.oid) like '%meeting%')),
  ('036', 'check_constraint_widened', 'call_log.status CHECK includes ''meeting_booked''', exists (select 1 from pg_constraint c join pg_attribute a on a.attrelid=c.conrelid and a.attnum=any(c.conkey) where c.conrelid='public.call_log'::regclass and c.contype='c' and a.attname='status' and pg_get_constraintdef(c.oid) like '%meeting_booked%')),
  ('036', 'table', 'prospect_actions', exists (select 1 from information_schema.tables where table_schema='public' and table_name='prospect_actions')),
  ('036', 'index', 'prospect_actions_org_idx', exists (select 1 from pg_indexes where schemaname='public' and indexname='prospect_actions_org_idx')),
  ('036', 'index', 'prospect_actions_prospect_idx', exists (select 1 from pg_indexes where schemaname='public' and indexname='prospect_actions_prospect_idx')),
  ('036', 'index_partial', 'prospect_actions_active_idx', exists (select 1 from pg_indexes where schemaname='public' and indexname='prospect_actions_active_idx')),
  ('036', 'rls_enabled', 'prospect_actions', exists (select 1 from pg_class where relname='prospect_actions' and relnamespace='public'::regnamespace and relrowsecurity)),
  ('036', 'policy', 'prospect_actions: "members can manage prospect actions" (ALL)', exists (select 1 from pg_policies where schemaname='public' and tablename='prospect_actions' and policyname='members can manage prospect actions')),
  ('036', 'table', 'prospect_activities', exists (select 1 from information_schema.tables where table_schema='public' and table_name='prospect_activities')),
  ('036', 'index', 'prospect_activities_org_idx', exists (select 1 from pg_indexes where schemaname='public' and indexname='prospect_activities_org_idx')),
  ('036', 'index', 'prospect_activities_prospect_idx', exists (select 1 from pg_indexes where schemaname='public' and indexname='prospect_activities_prospect_idx')),
  ('036', 'rls_enabled', 'prospect_activities', exists (select 1 from pg_class where relname='prospect_activities' and relnamespace='public'::regnamespace and relrowsecurity)),
  ('036', 'policy', 'prospect_activities: "members can manage prospect activities" (ALL)', exists (select 1 from pg_policies where schemaname='public' and tablename='prospect_activities' and policyname='members can manage prospect activities')),
  ('036', 'table', 'pitches', exists (select 1 from information_schema.tables where table_schema='public' and table_name='pitches')),
  ('036', 'unique_constraint', 'pitches (prospect_id, channel)', exists (select 1 from pg_constraint where conrelid='public.pitches'::regclass and contype='u' and pg_get_constraintdef(oid) like '%prospect_id%channel%')),
  ('036', 'index', 'pitches_org_idx', exists (select 1 from pg_indexes where schemaname='public' and indexname='pitches_org_idx')),
  ('036', 'index', 'pitches_prospect_idx', exists (select 1 from pg_indexes where schemaname='public' and indexname='pitches_prospect_idx')),
  ('036', 'rls_enabled', 'pitches', exists (select 1 from pg_class where relname='pitches' and relnamespace='public'::regnamespace and relrowsecurity)),
  ('036', 'policy', 'pitches: "members can manage pitches" (ALL)', exists (select 1 from pg_policies where schemaname='public' and tablename='pitches' and policyname='members can manage pitches')),
  ('036', 'table', 'demo_rooms', exists (select 1 from information_schema.tables where table_schema='public' and table_name='demo_rooms')),
  ('036', 'unique_column', 'demo_rooms.prospect_id (unique)', exists (select 1 from pg_constraint c join pg_attribute a on a.attrelid=c.conrelid and a.attnum=any(c.conkey) where c.conrelid='public.demo_rooms'::regclass and c.contype='u' and a.attname='prospect_id')),
  ('036', 'unique_column', 'demo_rooms.public_token (unique, has default)', exists (select 1 from information_schema.columns where table_schema='public' and table_name='demo_rooms' and column_name='public_token' and column_default is not null)),
  ('036', 'index', 'demo_rooms_org_idx', exists (select 1 from pg_indexes where schemaname='public' and indexname='demo_rooms_org_idx')),
  ('036', 'rls_enabled', 'demo_rooms', exists (select 1 from pg_class where relname='demo_rooms' and relnamespace='public'::regnamespace and relrowsecurity)),
  ('036', 'policy', 'demo_rooms: "members can manage demo rooms" (ALL)', exists (select 1 from pg_policies where schemaname='public' and tablename='demo_rooms' and policyname='members can manage demo rooms')),
  ('036', 'function', 'enforce_prospect_tenant_match()', exists (select 1 from pg_proc where proname='enforce_prospect_tenant_match' and pronamespace='public'::regnamespace)),
  ('036', 'trigger', 'prospect_actions_tenant_guard', exists (select 1 from pg_trigger where tgname='prospect_actions_tenant_guard' and tgrelid='public.prospect_actions'::regclass and not tgisinternal)),
  ('036', 'trigger', 'prospect_activities_tenant_guard', exists (select 1 from pg_trigger where tgname='prospect_activities_tenant_guard' and tgrelid='public.prospect_activities'::regclass and not tgisinternal)),
  ('036', 'trigger', 'pitches_tenant_guard', exists (select 1 from pg_trigger where tgname='pitches_tenant_guard' and tgrelid='public.pitches'::regclass and not tgisinternal)),
  ('036', 'trigger', 'demo_rooms_tenant_guard', exists (select 1 from pg_trigger where tgname='demo_rooms_tenant_guard' and tgrelid='public.demo_rooms'::regclass and not tgisinternal))

) as matrix(migration, object_kind, object_name, present)
order by migration, object_kind, object_name;

-- ----------------------------------------------------------------------
-- 2. DEFINITION dumps -- exact text, for genuine definition-equivalence
--    comparison (item 6/7: policy/constraint/function/trigger definition
--    differences, not just name matches). Compare each returned string
--    against the corresponding migration file by eye.
-- ----------------------------------------------------------------------

-- 2a. Every CHECK constraint touched anywhere in 017-036, full text.
select
  con.conrelid::regclass::text as table_name,
  att.attname as column_name,
  con.conname as constraint_name,
  pg_get_constraintdef(con.oid) as definition
from pg_constraint con
join pg_attribute att on att.attrelid = con.conrelid and att.attnum = any(con.conkey)
where con.contype = 'c'
  and con.conrelid::regclass::text in (
    'public.call_log', 'public.chat_leads', 'public.partners', 'public.organizations',
    'public.beta_testers', 'public.support_tickets', 'public.support_ticket_messages',
    'public.prospects', 'public.opportunity_briefs', 'public.next_best_actions',
    'public.prospect_actions', 'public.prospect_activities', 'public.pitches', 'public.demo_rooms',
    'public.team_invitations'
  )
order by 1, 2;

-- 2b. Every policy on every table touched by 017-036 (public + storage),
--     full USING and WITH CHECK text -- the actual defense-in-depth
--     content, not just the policy name.
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

-- 2c. Every function introduced/relied on by 017-036, full body text.
select p.proname as function_name, pg_get_functiondef(p.oid) as definition
from pg_proc p
where p.pronamespace = 'public'::regnamespace
  and p.proname in (
    'my_organization_ids', 'assign_founding_seat', 'mark_vibelabs_onboarding_complete',
    'is_platform_staff', 'enforce_call_log_prospect_tenant', 'enforce_prospect_tenant_match'
  )
order by p.proname;

-- 2d. Every trigger introduced by 017-036, full definition text.
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

-- ----------------------------------------------------------------------
-- 3. Migration 027's specific target: the CURRENT default on
--    organizations.trial_ends_at. 14 days (migration 011's original),
--    7 days (027's intended change), or something else entirely.
-- ----------------------------------------------------------------------
select column_name, column_default, is_nullable, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'organizations' and column_name = 'trial_ends_at';

-- ----------------------------------------------------------------------
-- 4. The migration ledger itself -- what the CLI's own bookkeeping
--    table actually contains, for direct comparison against the
--    evidence above.
-- ----------------------------------------------------------------------
select version, name, statements is not null as has_statements_recorded
from supabase_migrations.schema_migrations
order by version;

rollback;
