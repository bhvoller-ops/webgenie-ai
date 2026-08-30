-- Real bug found 30 Aug 2026 while verifying the Settings Team list: the
-- original RLS policy on organization_members (migration 002) was
--
--   create policy "users can read own memberships"
--   on public.organization_members for select
--   using (user_id = auth.uid());
--
-- which means every authenticated user can only ever SELECT their OWN row
-- from this table — never any other member's. This has been true since the
-- foundation migration and never surfaced before because this app has only
-- ever had one real member (Cassey), so "I can only see my own row" was
-- indistinguishable from "I can see the whole team." Confirmed live: with a
-- second and third organization_members row actually present, Settings'
-- Team section only ever rendered the signed-in user's own row — the
-- remove-member/change-role UI built today was correct but unreachable for
-- anyone but yourself, since the other rows never came back from the query
-- at all.
--
-- Fix: a member can read every row in an organization they belong to, not
-- just their own. A naive self-referencing policy on this exact table
-- (`exists (select 1 from organization_members m where ...)`) risks
-- Postgres RLS infinite-recursion, since the inner subquery's own row
-- visibility is governed by the same policy being evaluated — the standard
-- fix, and the one this app already uses elsewhere for exactly this kind
-- of problem (see bootstrap_organization, migration 013), is a
-- SECURITY DEFINER helper that bypasses RLS for its own internal lookup.

create or replace function public.my_organization_ids()
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  select organization_id from public.organization_members where user_id = auth.uid()
$$;

-- Additive alongside the original narrow policy (multiple permissive SELECT
-- policies on the same table are OR'd together, so this one alone now
-- determines visibility) — not dropped, since it's harmless and narrower.
create policy "members can read org membership list"
on public.organization_members for select
to authenticated
using (organization_id in (select public.my_organization_ids()));
