-- Hotfix (2026-09-11, docs/history.md): structured, auditable evidence
-- and contact-verification records for outreach -- replacing free-form
-- activity-description text as the only place a manually-verified
-- observation or a channel's contact-info source could live.
--
-- NOT APPLIED to production as part of this hotfix (explicit instruction:
-- "Do NOT apply migrations"). Written and reviewed here so the PR is
-- complete and ready; applying it is a separate, explicitly gated step.
--
-- Two tables, same join-through-parent tenant shape prospect_handoffs /
-- opportunity_briefs already use (RLS through prospects -> organization_
-- members, no separate tenant-guard trigger needed since organization_id
-- is denormalized and checked against the parent prospect at write time,
-- same pattern prospect_actions/prospect_activities established).

create table public.prospect_evidence_observations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  observation_text text not null,
  evidence_state text not null check (evidence_state in ('VERIFIED_PRESENT', 'VERIFIED_ABSENT', 'INCONCLUSIVE', 'CAPTURE_BLOCKED', 'EXTRACTION_FAILED')),
  source_url text,
  verification_method text not null check (verification_method in ('manual_browser_render', 'manual_http_check', 'automated_capture', 'third_party_directory', 'other')),
  verifier_type text not null check (verifier_type in ('human_operator', 'ai_agent')),
  confidence numeric(3, 2) check (confidence is null or (confidence >= 0 and confidence <= 1)),
  verified_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index prospect_evidence_observations_org_idx on public.prospect_evidence_observations(organization_id);
create index prospect_evidence_observations_prospect_idx on public.prospect_evidence_observations(prospect_id);

create table public.prospect_contact_verifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  channel text not null check (channel in ('EMAIL', 'CALL')),
  contact_value text not null,
  source_url text,
  verification_method text not null check (verification_method in ('manual_browser_render', 'manual_http_check', 'automated_capture', 'third_party_directory', 'other')),
  verifier_type text not null check (verifier_type in ('human_operator', 'ai_agent')),
  -- A single Google-Places-only record is real evidence but must never be
  -- labeled independently verified -- the exact gap that let a wrong
  -- phone number (Georgia Roof Advisors) and a wrong domain association
  -- (Best Roofing Atlanta) through without any cross-check. This column
  -- is set false only when the source is Google Places/Finder alone;
  -- a second corroborating row for the same (prospect, channel) makes
  -- the pair collectively independently-verified without needing to flip
  -- this flag on the original row.
  is_single_source boolean not null default true,
  verified_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index prospect_contact_verifications_org_idx on public.prospect_contact_verifications(organization_id);
create index prospect_contact_verifications_prospect_idx on public.prospect_contact_verifications(prospect_id);
-- Multiple rows per (prospect, channel) are expected and required -- one
-- per source -- so conflicting values can be detected (two rows, same
-- channel, different contact_value) rather than silently overwritten.
create index prospect_contact_verifications_prospect_channel_idx on public.prospect_contact_verifications(prospect_id, channel);

alter table public.prospect_evidence_observations enable row level security;
alter table public.prospect_contact_verifications enable row level security;

create policy "members can manage prospect evidence observations"
on public.prospect_evidence_observations for all
using (
  exists (
    select 1
    from public.prospects p
    join public.organization_members m on m.organization_id = p.organization_id
    where p.id = prospect_evidence_observations.prospect_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.prospects p
    join public.organization_members m on m.organization_id = p.organization_id
    where p.id = prospect_evidence_observations.prospect_id
      and m.user_id = auth.uid()
  )
);

create policy "members can manage prospect contact verifications"
on public.prospect_contact_verifications for all
using (
  exists (
    select 1
    from public.prospects p
    join public.organization_members m on m.organization_id = p.organization_id
    where p.id = prospect_contact_verifications.prospect_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.prospects p
    join public.organization_members m on m.organization_id = p.organization_id
    where p.id = prospect_contact_verifications.prospect_id
      and m.user_id = auth.uid()
  )
);

-- Tenant-consistency guard, same pattern as enforce_prospect_tenant_match()
-- (migration 036) -- organization_id on the child row must agree with the
-- parent prospect's own organization_id.
create or replace function public.enforce_evidence_observation_tenant()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.prospects p
    where p.id = new.prospect_id
      and p.organization_id = new.organization_id
  ) then
    raise exception 'prospect_evidence_observations.organization_id must match its prospect''s organization_id';
  end if;
  return new;
end;
$$;

drop trigger if exists prospect_evidence_observations_tenant_guard on public.prospect_evidence_observations;
create trigger prospect_evidence_observations_tenant_guard
before insert or update of prospect_id, organization_id on public.prospect_evidence_observations
for each row execute function public.enforce_evidence_observation_tenant();

create or replace function public.enforce_contact_verification_tenant()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.prospects p
    where p.id = new.prospect_id
      and p.organization_id = new.organization_id
  ) then
    raise exception 'prospect_contact_verifications.organization_id must match its prospect''s organization_id';
  end if;
  return new;
end;
$$;

drop trigger if exists prospect_contact_verifications_tenant_guard on public.prospect_contact_verifications;
create trigger prospect_contact_verifications_tenant_guard
before insert or update of prospect_id, organization_id on public.prospect_contact_verifications
for each row execute function public.enforce_contact_verification_tenant();
