create policy "authenticated users can create organizations"
on public.organizations for insert
to authenticated
with check (true);

create policy "users can read own memberships"
on public.organization_members for select
using (user_id = auth.uid());

create policy "users can create own membership"
on public.organization_members for insert
with check (user_id = auth.uid());

create policy "members can update projects"
on public.projects for update
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = projects.organization_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = projects.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "members can read analysis outputs"
on public.analysis_outputs for select
using (
  exists (
    select 1
    from public.analysis_jobs j
    join public.projects p on p.id = j.project_id
    join public.organization_members m on m.organization_id = p.organization_id
    where j.id = analysis_outputs.analysis_job_id
      and m.user_id = auth.uid()
  )
);

create policy "members can manage blueprints"
on public.website_blueprints for all
using (
  exists (
    select 1
    from public.projects p
    join public.organization_members m on m.organization_id = p.organization_id
    where p.id = website_blueprints.project_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.projects p
    join public.organization_members m on m.organization_id = p.organization_id
    where p.id = website_blueprints.project_id
      and m.user_id = auth.uid()
  )
);

create policy "members can manage prompt packages"
on public.prompt_packages for all
using (
  exists (
    select 1
    from public.projects p
    join public.organization_members m on m.organization_id = p.organization_id
    where p.id = prompt_packages.project_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.projects p
    join public.organization_members m on m.organization_id = p.organization_id
    where p.id = prompt_packages.project_id
      and m.user_id = auth.uid()
  )
);
