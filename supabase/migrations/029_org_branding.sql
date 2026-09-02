-- White-label branding kit (VibeLabs Phase 4) — scoped deliberately to what
-- a member's OWN CLIENTS see (generated sites, client-facing emails), not
-- the member's own dashboard chrome. Available to any organization, not
-- gated to offer_key='vibelabs' — generically useful, cheap to leave open.
create table public.org_branding (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  brand_name text,
  logo_url text,
  favicon_url text,
  primary_color text,
  accent_color text,
  support_email text,
  support_phone text,
  primary_niche text,
  updated_at timestamptz not null default now()
);

alter table public.org_branding enable row level security;

create policy "admins manage own branding"
on public.org_branding for all
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = org_branding.organization_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = org_branding.organization_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  )
);

-- Public (unlike 003_capture_engine's website-captures bucket): logos and
-- favicons need to load on generated static sites for anonymous visitors,
-- with no auth in the loop. No SELECT policy needed on storage.objects for
-- a public bucket — Supabase serves /storage/v1/object/public/... directly.
-- Objects are stored under "<organization_id>/<filename>" so the insert/
-- update/delete policies below can scope each admin to their own prefix.
insert into storage.buckets (id, name, public)
values ('org-branding', 'org-branding', true)
on conflict (id) do nothing;

create policy "org admins can upload their own branding assets"
on storage.objects for insert
with check (
  bucket_id = 'org-branding'
  and exists (
    select 1 from public.organization_members m
    where m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
      and name like m.organization_id::text || '/%'
  )
);

create policy "org admins can replace their own branding assets"
on storage.objects for update
using (
  bucket_id = 'org-branding'
  and exists (
    select 1 from public.organization_members m
    where m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
      and name like m.organization_id::text || '/%'
  )
);

create policy "org admins can delete their own branding assets"
on storage.objects for delete
using (
  bucket_id = 'org-branding'
  and exists (
    select 1 from public.organization_members m
    where m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
      and name like m.organization_id::text || '/%'
  )
);
