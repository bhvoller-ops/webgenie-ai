create table if not exists public.orchestration_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  blueprint_id uuid not null references public.website_blueprints(id) on delete cascade,
  content_package_id uuid references public.content_packages(id) on delete set null,
  prompt_package_id uuid references public.prompt_packages(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'queued',
  overall_score integer,
  overall_confidence integer,
  blocking_findings integer not null default 0,
  output jsonb,
  approval_note text,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_reviews (
  id uuid primary key default gen_random_uuid(),
  orchestration_run_id uuid not null references public.orchestration_runs(id) on delete cascade,
  agent text not null,
  score integer not null,
  confidence integer not null,
  summary text not null,
  findings jsonb not null default '[]'::jsonb,
  status text not null default 'needs_review',
  reviewer_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(orchestration_run_id, agent)
);

create index if not exists orchestration_runs_project_idx on public.orchestration_runs(project_id, created_at desc);
create index if not exists agent_reviews_run_idx on public.agent_reviews(orchestration_run_id);

alter table public.orchestration_runs enable row level security;
alter table public.agent_reviews enable row level security;

create policy "organization members manage orchestration runs" on public.orchestration_runs for all using (
  exists (select 1 from public.projects p join public.organization_members om on om.organization_id = p.organization_id where p.id = orchestration_runs.project_id and om.user_id = auth.uid())
) with check (
  exists (select 1 from public.projects p join public.organization_members om on om.organization_id = p.organization_id where p.id = orchestration_runs.project_id and om.user_id = auth.uid())
);

create policy "organization members manage agent reviews" on public.agent_reviews for all using (
  exists (select 1 from public.orchestration_runs r join public.projects p on p.id = r.project_id join public.organization_members om on om.organization_id = p.organization_id where r.id = agent_reviews.orchestration_run_id and om.user_id = auth.uid())
) with check (
  exists (select 1 from public.orchestration_runs r join public.projects p on p.id = r.project_id join public.organization_members om on om.organization_id = p.organization_id where r.id = agent_reviews.orchestration_run_id and om.user_id = auth.uid())
);
