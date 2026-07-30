create table if not exists public.delivery_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  blueprint_id uuid not null references public.website_blueprints(id) on delete cascade,
  content_package_id uuid references public.content_packages(id) on delete set null,
  prompt_package_id uuid references public.prompt_packages(id) on delete set null,
  orchestration_run_id uuid references public.orchestration_runs(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete cascade,
  target text not null,
  status text not null default 'draft',
  manifest jsonb,
  configuration jsonb not null default '{}'::jsonb,
  file_count integer not null default 0,
  total_bytes bigint not null default 0,
  external_url text,
  error_message text,
  ready_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.delivery_files (
  id uuid primary key default gen_random_uuid(),
  delivery_run_id uuid not null references public.delivery_runs(id) on delete cascade,
  path text not null,
  content text not null,
  content_type text not null default 'text',
  purpose text not null,
  byte_size integer not null default 0,
  created_at timestamptz not null default now(),
  unique(delivery_run_id, path)
);

create table if not exists public.implementation_events (
  id uuid primary key default gen_random_uuid(),
  delivery_run_id uuid not null references public.delivery_runs(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  event_type text not null,
  title text not null,
  detail text,
  external_url text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists delivery_runs_project_idx on public.delivery_runs(project_id, created_at desc);
create index if not exists delivery_files_run_idx on public.delivery_files(delivery_run_id, path);
create index if not exists implementation_events_project_idx on public.implementation_events(project_id, created_at desc);

alter table public.delivery_runs enable row level security;
alter table public.delivery_files enable row level security;
alter table public.implementation_events enable row level security;

create policy "organization members manage delivery runs" on public.delivery_runs for all using (
  exists (select 1 from public.projects p join public.organization_members om on om.organization_id = p.organization_id where p.id = delivery_runs.project_id and om.user_id = auth.uid())
) with check (
  exists (select 1 from public.projects p join public.organization_members om on om.organization_id = p.organization_id where p.id = delivery_runs.project_id and om.user_id = auth.uid())
);

create policy "organization members manage delivery files" on public.delivery_files for all using (
  exists (select 1 from public.delivery_runs d join public.projects p on p.id = d.project_id join public.organization_members om on om.organization_id = p.organization_id where d.id = delivery_files.delivery_run_id and om.user_id = auth.uid())
) with check (
  exists (select 1 from public.delivery_runs d join public.projects p on p.id = d.project_id join public.organization_members om on om.organization_id = p.organization_id where d.id = delivery_files.delivery_run_id and om.user_id = auth.uid())
);

create policy "organization members manage implementation events" on public.implementation_events for all using (
  exists (select 1 from public.projects p join public.organization_members om on om.organization_id = p.organization_id where p.id = implementation_events.project_id and om.user_id = auth.uid())
) with check (
  exists (select 1 from public.projects p join public.organization_members om on om.organization_id = p.organization_id where p.id = implementation_events.project_id and om.user_id = auth.uid())
);
