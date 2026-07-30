create table if not exists public.content_packages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  blueprint_id uuid not null references public.website_blueprints(id) on delete cascade,
  schema_version text not null,
  provider text not null default 'heuristic',
  tone text not null,
  settings jsonb not null default '{}'::jsonb,
  content jsonb not null,
  content_markdown text not null,
  validation_status text not null default 'pending',
  validation_issues jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(blueprint_id, tone)
);
create index if not exists content_packages_project_idx on public.content_packages(project_id);
alter table public.content_packages enable row level security;
create policy "members can manage content packages" on public.content_packages for all
using (exists (select 1 from public.projects p join public.organization_members m on m.organization_id=p.organization_id where p.id=content_packages.project_id and m.user_id=auth.uid()))
with check (exists (select 1 from public.projects p join public.organization_members m on m.organization_id=p.organization_id where p.id=content_packages.project_id and m.user_id=auth.uid()));
