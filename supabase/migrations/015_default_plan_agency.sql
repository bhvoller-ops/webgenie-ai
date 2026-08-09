-- Every new organization defaulted to 'starter' (5 projects/month), which
-- blocks real usage almost immediately -- confirmed in production when a VA
-- hit the cap on day one of real cold-calling. Stripe billing isn't wired up
-- yet, so these tiers aren't gating any actual paying customer right now;
-- defaulting to the top tier removes an arbitrary blocker with no real
-- downside until billing is real. Revisit when Stripe is connected.
alter table public.organizations alter column plan_key set default 'agency';

-- Also raise every existing organization already stuck on 'starter' so this
-- doesn't require a manual fix per-org going forward.
update public.organizations set plan_key = 'agency' where plan_key = 'starter';
