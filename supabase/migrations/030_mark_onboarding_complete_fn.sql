-- organizations has never had an UPDATE policy at all (only SELECT, 001,
-- and INSERT, 002) — every existing write to it goes through the admin
-- (service role) client or bootstrap_organization's SECURITY DEFINER RPC.
-- api/actions.ts's completeVibelabsOnboardingAction is the first thing to
-- attempt a direct authenticated-client UPDATE, and it silently affected
-- zero rows (confirmed live: RLS default-denies with no error, not a
-- thrown exception — the update "succeeds" and does nothing).
--
-- Given migration 013's documented, unexplained RLS trouble specifically
-- on this table's INSERT, a narrow SECURITY DEFINER function — matching
-- bootstrap_organization's own pattern — is the safer fix here than adding
-- a blanket UPDATE policy that would let any owner/admin client update
-- every column on their org row (billing_customer_id, plan_key,
-- founding_member_seat, etc.), not just this one safe field.
create or replace function public.mark_vibelabs_onboarding_complete()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  org_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  select organization_id into org_id
  from public.organization_members
  where user_id = auth.uid()
  limit 1;

  if org_id is null then
    raise exception 'No organization found for this user.';
  end if;

  update public.organizations
  set onboarding_completed_at = now()
  where id = org_id
    and onboarding_completed_at is null;
end;
$$;

grant execute on function public.mark_vibelabs_onboarding_complete() to authenticated;
