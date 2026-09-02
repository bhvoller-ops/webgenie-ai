-- Real ticket-based support (VibeLabs Phase 7) — PRODUCT.md's support
-- channel is "ticket-based"; nothing like this existed before.
--
-- is_platform_staff() is a SECURITY DEFINER helper, same discipline as
-- assign_founding_seat (028) and mark_vibelabs_onboarding_complete (030):
-- a self-referencing RLS policy on organization_members/organizations has
-- already produced real bugs in this codebase's history (the recursion
-- class of bug bootstrap_organization's own comment warns about) — this
-- sidesteps it by resolving staff-ness in a single trusted function
-- instead of a policy that joins back through organization_members from
-- inside another table's policy.
create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  opened_by uuid references auth.users(id) on delete set null,
  subject text not null,
  category text not null default 'general'
    check (category in ('billing', 'technical', 'guarantee', 'general')),
  status text not null default 'open'
    check (status in ('open', 'awaiting_member', 'awaiting_staff', 'resolved', 'closed')),
  priority text not null default 'normal'
    check (priority in ('normal', 'high', 'guarantee_risk')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.support_ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  author_type text not null check (author_type in ('member', 'staff')),
  author_user_id uuid references auth.users(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.support_tickets enable row level security;
alter table public.support_ticket_messages enable row level security;

create or replace function public.is_platform_staff(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.organization_members m
    join public.organizations o on o.id = m.organization_id
    where m.user_id = uid
      and m.role in ('owner', 'admin')
      and o.is_platform_operator
  );
$$;

create policy "members manage own tickets"
on public.support_tickets for all
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = support_tickets.organization_id
      and m.user_id = auth.uid()
  )
  or is_platform_staff(auth.uid())
)
with check (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = support_tickets.organization_id
      and m.user_id = auth.uid()
  )
  or is_platform_staff(auth.uid())
);

create policy "members read/write own ticket messages"
on public.support_ticket_messages for all
using (
  exists (
    select 1
    from public.support_tickets t
    join public.organization_members m on m.organization_id = t.organization_id
    where t.id = support_ticket_messages.ticket_id
      and m.user_id = auth.uid()
  )
  or is_platform_staff(auth.uid())
)
with check (
  exists (
    select 1
    from public.support_tickets t
    join public.organization_members m on m.organization_id = t.organization_id
    where t.id = support_ticket_messages.ticket_id
      and m.user_id = auth.uid()
  )
  or is_platform_staff(auth.uid())
);

create index support_tickets_organization_id_idx on public.support_tickets(organization_id);
create index support_ticket_messages_ticket_id_idx on public.support_ticket_messages(ticket_id);

-- One manual step, same discipline as every other "flip this by hand"
-- flag in this project (SPOTS_CLAIMED, plan defaults): set
-- is_platform_operator = true on Cassey's real organization once, by hand,
-- in the Supabase SQL editor. Deliberately not automated — this grants
-- cross-org visibility into every member's support tickets, not something
-- a migration should silently decide who gets.
