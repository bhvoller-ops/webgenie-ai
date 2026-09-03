-- Real bug found live during a post-deploy QA pass (3 Sep 2026):
-- /admin/support's staff queue (031) joins organizations(name) to show
-- which org each ticket belongs to. The only existing SELECT policy on
-- organizations (001_foundation.sql) requires the requester to be a member
-- of that specific org — is_platform_staff() (031) has no such membership
-- in every org, so the nested join silently returns null for every ticket
-- not belonging to the staff member's own org, and the UI falls back to
-- "Unknown org" across the board. Confirmed live: a real staff session saw
-- every ticket in the queue labeled "Unknown org", including one from a
-- real, correctly-named test org.
--
-- Same discipline as every other staff-visibility grant in this project
-- (assign_founding_seat, mark_vibelabs_onboarding_complete,
-- is_platform_staff itself): a narrow, explicit policy rather than
-- widening the existing member policy's condition.
create policy "platform staff can read all organizations"
on public.organizations for select
using (is_platform_staff(auth.uid()));
