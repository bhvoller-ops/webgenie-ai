create table if not exists public.visual_analysis_results (
  id uuid primary key default gen_random_uuid(),
  analysis_job_id uuid not null references public.analysis_jobs(id) on delete cascade,
  page_capture_id uuid not null references public.page_captures(id) on delete cascade,
  provider text not null,
  model text not null,
  overall_score integer not null check (overall_score between 0 and 100),
  overall_confidence integer not null check (overall_confidence between 0 and 100),
  result jsonb not null,
  created_at timestamptz not null default now(),
  unique (analysis_job_id, page_capture_id)
);

create table if not exists public.visual_analysis_errors (
  id uuid primary key default gen_random_uuid(),
  analysis_job_id uuid not null references public.analysis_jobs(id) on delete cascade,
  page_capture_id uuid references public.page_captures(id) on delete set null,
  provider text not null,
  error_message text not null,
  created_at timestamptz not null default now()
);

alter table public.visual_analysis_results enable row level security;
alter table public.visual_analysis_errors enable row level security;

create policy "members can read visual analysis results"
on public.visual_analysis_results for select
using (exists (
  select 1 from public.analysis_jobs j
  join public.projects p on p.id = j.project_id
  join public.organization_members m on m.organization_id = p.organization_id
  where j.id = visual_analysis_results.analysis_job_id and m.user_id = auth.uid()
));

create policy "members can read visual analysis errors"
on public.visual_analysis_errors for select
using (exists (
  select 1 from public.analysis_jobs j
  join public.projects p on p.id = j.project_id
  join public.organization_members m on m.organization_id = p.organization_id
  where j.id = visual_analysis_errors.analysis_job_id and m.user_id = auth.uid()
));

create index if not exists visual_analysis_job_idx on public.visual_analysis_results(analysis_job_id);
