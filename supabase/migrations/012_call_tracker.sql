create table public.call_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  business_name text not null,
  phone text not null,
  industry text,
  city text,
  state text,
  demo_url text,
  status text not null default 'not_called'
    check (status in ('not_called', 'no_answer', 'not_interested', 'agreed_to_see_site', 'viewed_site', 'closed', 'lost')),
  last_contacted_at timestamptz,
  follow_up_due_at timestamptz,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index call_log_org_idx on public.call_log(organization_id);
create index call_log_follow_up_idx on public.call_log(follow_up_due_at);

alter table public.call_log enable row level security;

create policy "members can manage call log"
on public.call_log for all
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = call_log.organization_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = call_log.organization_id
      and m.user_id = auth.uid()
  )
);
