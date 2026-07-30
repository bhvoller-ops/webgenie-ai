create extension if not exists "pgcrypto";

create type public.reference_role as enum (
  'current_site',
  'competitor',
  'inspiration',
  'benchmark'
);

create type public.analysis_job_status as enum (
  'queued',
  'validating',
  'capturing',
  'extracting',
  'analyzing',
  'scoring',
  'synthesizing',
  'validating_output',
  'completed',
  'partial',
  'failed',
  'cancelled'
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  industry text not null,
  target_audience text,
  primary_goal text not null,
  primary_cta text not null,
  status text not null default 'draft',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.website_references (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  url text not null,
  canonical_url text,
  role public.reference_role not null,
  label text,
  priority smallint not null default 3 check (priority between 1 and 5),
  validation_status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique(project_id, url)
);

create table public.analysis_jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  status public.analysis_job_status not null default 'queued',
  progress smallint not null default 0 check (progress between 0 and 100),
  current_stage text,
  error_code text,
  error_message text,
  estimated_cost_usd numeric(12,4) not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.analysis_outputs (
  id uuid primary key default gen_random_uuid(),
  analysis_job_id uuid not null unique references public.analysis_jobs(id) on delete cascade,
  schema_version text not null,
  output jsonb not null,
  created_at timestamptz not null default now()
);

create table public.website_blueprints (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  analysis_job_id uuid references public.analysis_jobs(id) on delete set null,
  schema_version text not null,
  blueprint jsonb not null,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table public.prompt_packages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  blueprint_id uuid not null references public.website_blueprints(id) on delete cascade,
  target_platform text not null,
  schema_version text not null,
  prompt_markdown text not null,
  prompt_json jsonb,
  created_at timestamptz not null default now()
);

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.projects enable row level security;
alter table public.website_references enable row level security;
alter table public.analysis_jobs enable row level security;
alter table public.analysis_outputs enable row level security;
alter table public.website_blueprints enable row level security;
alter table public.prompt_packages enable row level security;

create policy "members can read organizations"
on public.organizations for select
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = organizations.id
      and m.user_id = auth.uid()
  )
);

create policy "members can read projects"
on public.projects for select
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = projects.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "members can create projects"
on public.projects for insert
with check (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = projects.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "members can manage references"
on public.website_references for all
using (
  exists (
    select 1
    from public.projects p
    join public.organization_members m on m.organization_id = p.organization_id
    where p.id = website_references.project_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.projects p
    join public.organization_members m on m.organization_id = p.organization_id
    where p.id = website_references.project_id
      and m.user_id = auth.uid()
  )
);

create policy "members can manage analysis jobs"
on public.analysis_jobs for all
using (
  exists (
    select 1
    from public.projects p
    join public.organization_members m on m.organization_id = p.organization_id
    where p.id = analysis_jobs.project_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.projects p
    join public.organization_members m on m.organization_id = p.organization_id
    where p.id = analysis_jobs.project_id
      and m.user_id = auth.uid()
  )
);
