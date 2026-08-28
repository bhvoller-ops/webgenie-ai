-- Affiliate/referrer/partner program (v1 scope, agreed 27 Aug 2026):
-- partners are other agencies/consultants who refer their own clients,
-- flat fee per closed signup, payouts handled manually by Cassey. No
-- self-serve partner signup, no automated payouts — just tracking who's
-- owed what, reusing call_log as the one source of truth for deals rather
-- than duplicating deal state in a parallel table.

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  contact_email text,
  contact_phone text,
  referral_code text not null,
  flat_fee numeric(10,2) not null default 100.00,
  status text not null default 'active' check (status in ('active', 'inactive')),
  notes text,
  created_at timestamptz not null default now(),
  unique (organization_id, referral_code)
);

create index partners_org_idx on public.partners(organization_id);

alter table public.partners enable row level security;

create policy "members can manage partners"
on public.partners for all
to authenticated
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = partners.organization_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = partners.organization_id
      and m.user_id = auth.uid()
  )
);

alter table public.call_log
  add column partner_id uuid references public.partners(id) on delete set null,
  add column commission_status text not null default 'none'
    check (commission_status in ('none', 'owed', 'paid')),
  add column commission_amount numeric(10,2);

create index call_log_partner_idx on public.call_log(partner_id);
