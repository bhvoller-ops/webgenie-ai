alter table public.website_blueprints
add constraint website_blueprints_analysis_job_unique
unique (analysis_job_id);

create index if not exists website_blueprints_project_idx
on public.website_blueprints(project_id);

create index if not exists website_blueprints_status_idx
on public.website_blueprints(status);
