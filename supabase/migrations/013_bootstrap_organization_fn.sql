-- Direct authenticated-role INSERTs into organizations were observed to fail
-- RLS ("new row violates row-level security policy") even with a policy of
-- `for insert to authenticated with check (true)`, correct grants, and
-- correct auth.uid()/role resolution confirmed via diagnostics. Root cause
-- undetermined; this sidesteps it with the standard safer pattern for a
-- first-use bootstrap: a SECURITY DEFINER function that creates the
-- organization + owner membership atomically under elevated privilege,
-- rather than the calling user's own gated insert.

create or replace function public.bootstrap_organization(workspace_name text default 'My WebGenie Workspace')
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_org_id uuid;
  new_org_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  select organization_id into existing_org_id
  from public.organization_members
  where user_id = auth.uid()
  limit 1;

  if existing_org_id is not null then
    return existing_org_id;
  end if;

  insert into public.organizations (name) values (workspace_name)
  returning id into new_org_id;

  insert into public.organization_members (organization_id, user_id, role)
  values (new_org_id, auth.uid(), 'owner');

  return new_org_id;
end;
$$;

grant execute on function public.bootstrap_organization(text) to authenticated;
