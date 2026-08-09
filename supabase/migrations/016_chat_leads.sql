-- Leads captured by the AI chat/intake widget embedded on generated sites.
-- The widget is public-facing (unauthenticated site visitors), so inserts
-- come from the /api/site-chat route via the service-role admin client, not
-- from a logged-in user session -- matching how the analysis worker writes
-- page_captures/analysis_jobs. Org members can read/manage what came in.
create table public.chat_leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  business_name text not null,
  business_industry text,
  business_phone text,
  visitor_name text,
  visitor_phone text,
  reason text,
  transcript jsonb not null default '[]'::jsonb,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'closed', 'spam')),
  created_at timestamptz not null default now()
);

create index chat_leads_org_idx on public.chat_leads(organization_id);
create index chat_leads_created_idx on public.chat_leads(created_at desc);

alter table public.chat_leads enable row level security;

create policy "members can manage chat leads"
on public.chat_leads for all
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = chat_leads.organization_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = chat_leads.organization_id
      and m.user_id = auth.uid()
  )
);
