-- VibeLabs Agency membership: a second, paid, card-backed offer sold
-- through the VibeLabs marketing site (app.vibelabsagency.com/join),
-- distinct from the existing free self-serve trial (migrations 011-027,
-- which never touches Stripe). Both write to the same `organizations`
-- table — offer_key is what tells them apart. subscription_status and
-- trial_ends_at are NOT new: a VibeLabs org reuses those exact columns
-- (set from the real Stripe subscription's trial_end, not the free-trial
-- defaults), so the existing trialExpired lockout in lib/auth/access.ts
-- applies to VibeLabs members for free, with no changes there.
--
-- plan_key stays a plain `text` column with no CHECK constraint (per
-- migration 011) — 'vibelabs' is a valid value the moment code writes it;
-- no ALTER TYPE needed. See src/lib/admin/plans.ts for the matching
-- code-side plan definition, which is what actually enforces usage limits
-- (plan_catalog, inserted into below, is not read anywhere in the app
-- today — kept in sync anyway since it's cheap and someone may build a
-- plan-comparison UI against it later).
alter table public.organizations
  add column if not exists offer_key text not null default 'webgenie'
    check (offer_key in ('webgenie', 'vibelabs')),
  add column if not exists founding_member_seat integer unique,
  add column if not exists guarantee_started_at timestamptz,
  -- Not a generated column: `timestamptz + interval` is STABLE, not
  -- IMMUTABLE, in Postgres (DST makes the result timezone-dependent), and
  -- generated/stored columns require a strictly immutable expression
  -- (42P17). Set explicitly alongside guarantee_started_at wherever a
  -- VibeLabs org is provisioned — see handleVibelabsCheckoutCompleted in
  -- api/billing/webhook/route.ts.
  add column if not exists guarantee_deadline_at timestamptz,
  add column if not exists guarantee_status text not null default 'pending'
    check (guarantee_status in ('pending', 'met', 'extended_support')),
  add column if not exists first_client_won_at timestamptz,
  add column if not exists onboarding_completed_at timestamptz,
  add column if not exists is_platform_operator boolean not null default false,
  add column if not exists tos_accepted_at timestamptz,
  add column if not exists tos_version text;

insert into public.plan_catalog (key, name, price_monthly_cents, price_yearly_cents, limits, features)
values (
  'vibelabs',
  'VibeLabs Agency',
  9700,
  9700,
  '{"projects":25,"analyses":100,"content_packages":100,"prompt_packages":100,"deliveries":50,"members":3,"api_requests":10000}'::jsonb,
  '["Lead Finder","Qualification & Audit Tool","Prebuilt AI-Integrated Websites","Upsell Path","Fulfillment playbooks","White-label branding"]'::jsonb
)
on conflict (key) do update set
  name = excluded.name,
  price_monthly_cents = excluded.price_monthly_cents,
  price_yearly_cents = excluded.price_yearly_cents,
  limits = excluded.limits,
  features = excluded.features;

-- Real, atomic 25-seat cap for the founding launch. Advisory-locked so two
-- Checkout completions racing for the last seat can't both succeed — see
-- the checkout.session.completed handler in api/billing/webhook, which
-- catches this exception and cancels the just-created (unpaid-until-trial-
-- ends) subscription rather than leaving a 26th org half-provisioned.
create or replace function public.assign_founding_seat()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  next_seat integer;
begin
  if new.offer_key <> 'vibelabs' then
    return new;
  end if;

  perform pg_advisory_xact_lock(hashtext('vibelabs_founding_seats'));

  select coalesce(max(founding_member_seat), 0) + 1
    into next_seat
    from public.organizations
    where offer_key = 'vibelabs';

  if next_seat > 25 then
    raise exception 'VIBELABS_SEATS_FULL' using errcode = 'P0001';
  end if;

  new.founding_member_seat := next_seat;
  return new;
end;
$$;

drop trigger if exists trg_assign_founding_seat on public.organizations;
create trigger trg_assign_founding_seat
  before insert on public.organizations
  for each row
  execute function public.assign_founding_seat();
