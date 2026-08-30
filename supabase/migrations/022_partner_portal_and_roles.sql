-- Partner self-service portal login + real admin-only enforcement on the
-- partners table (29/30 Aug 2026 — role-based access control build).
--
-- Deliberately does NOT add partners into `organization_members`. Almost
-- every RLS policy in this app (call_log, chat_leads, projects, analysis_*,
-- etc.) grants full access to "any org member" without checking role — so
-- giving a partner a membership row there would silently hand them full
-- access to every client's data, not just their own referral stats. Instead
-- partners get their own Supabase Auth login, linked to their `partners`
-- row via a direct `user_id` column, with narrow read-only policies scoped
-- to exactly their own row and their own referred deals.

alter table public.partners
  add column user_id uuid references auth.users(id) on delete set null,
  add constraint partners_user_id_key unique (user_id);

create policy "partners read own row"
on public.partners for select
to authenticated
using (user_id = auth.uid());

create policy "partners read own referred deals"
on public.call_log for select
to authenticated
using (
  partner_id in (select id from public.partners where user_id = auth.uid())
);

-- The existing "members can manage partners" policy (020) granted full
-- CRUD to ANY org member regardless of role — meaning even an editor/viewer
-- could add partners or mark commissions paid. Replaced with an
-- owner/admin-only policy, matching how api_keys and team_invitations are
-- already scoped (011).
drop policy "members can manage partners" on public.partners;

create policy "admins manage partners"
on public.partners for all
to authenticated
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = partners.organization_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = partners.organization_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  )
);

-- Reuse team_invitations (011) for partner-portal invites too. A partner
-- invite carries partner_id so acceptance knows which partners row to
-- attach the new login to — it does NOT create an organization_members
-- row (see above), unlike an admin/editor/viewer invite.
alter table public.team_invitations
  drop constraint team_invitations_role_check,
  add constraint team_invitations_role_check check (role in ('admin', 'editor', 'viewer', 'partner')),
  add column partner_id uuid references public.partners(id) on delete cascade;
