alter table public.prompt_packages
add column if not exists validation_status text not null default 'pending',
add column if not exists validation_issues jsonb not null default '[]'::jsonb,
add column if not exists token_estimate integer not null default 0,
add column if not exists updated_at timestamptz not null default now();

alter table public.prompt_packages
add constraint prompt_packages_blueprint_platform_unique
unique (blueprint_id, target_platform);

create index if not exists prompt_packages_project_idx on public.prompt_packages(project_id);
create index if not exists prompt_packages_platform_idx on public.prompt_packages(target_platform);
