create table public.page_captures (
  id uuid primary key default gen_random_uuid(),
  analysis_job_id uuid not null references public.analysis_jobs(id) on delete cascade,
  reference_id uuid not null references public.website_references(id) on delete cascade,
  source_url text not null,
  final_url text not null,
  status_code integer not null default 0,
  content_type text,
  title text,
  description text,
  canonical_url text,
  language text,
  html text not null,
  visible_text text not null,
  screenshot_path text,
  captured_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index page_captures_analysis_job_idx
on public.page_captures(analysis_job_id);

create table public.extracted_features (
  id uuid primary key default gen_random_uuid(),
  page_capture_id uuid not null unique references public.page_captures(id) on delete cascade,
  features jsonb not null,
  created_at timestamptz not null default now()
);

create table public.capture_errors (
  id uuid primary key default gen_random_uuid(),
  analysis_job_id uuid not null references public.analysis_jobs(id) on delete cascade,
  reference_id uuid references public.website_references(id) on delete set null,
  error_code text not null,
  error_message text,
  created_at timestamptz not null default now()
);

alter table public.page_captures enable row level security;
alter table public.extracted_features enable row level security;
alter table public.capture_errors enable row level security;

create policy "members can read page captures"
on public.page_captures for select
using (
  exists (
    select 1
    from public.analysis_jobs j
    join public.projects p on p.id = j.project_id
    join public.organization_members m on m.organization_id = p.organization_id
    where j.id = page_captures.analysis_job_id
      and m.user_id = auth.uid()
  )
);

create policy "members can read extracted features"
on public.extracted_features for select
using (
  exists (
    select 1
    from public.page_captures c
    join public.analysis_jobs j on j.id = c.analysis_job_id
    join public.projects p on p.id = j.project_id
    join public.organization_members m on m.organization_id = p.organization_id
    where c.id = extracted_features.page_capture_id
      and m.user_id = auth.uid()
  )
);

create policy "members can read capture errors"
on public.capture_errors for select
using (
  exists (
    select 1
    from public.analysis_jobs j
    join public.projects p on p.id = j.project_id
    join public.organization_members m on m.organization_id = p.organization_id
    where j.id = capture_errors.analysis_job_id
      and m.user_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public)
values ('website-captures', 'website-captures', false)
on conflict (id) do nothing;

create policy "members can read website capture files"
on storage.objects for select
using (
  bucket_id = 'website-captures'
  and exists (
    select 1
    from public.organization_members m
    join public.projects p on p.organization_id = m.organization_id
    where m.user_id = auth.uid()
      and name like p.id::text || '/%'
  )
);
