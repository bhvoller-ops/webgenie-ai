-- Matches VibeLabs' own marketing claim ("overwhelm to business owner in
-- just 7 days") — the trial window should be the same number the pitch
-- already promises, not an arbitrary SaaS-standard 14 picked before that
-- positioning existed (migration 011, 6 Aug).
--
-- Only changes the default for FUTURE organizations — `alter column ...
-- set default` never touches existing rows. No org has hit the old 14-day
-- window yet (§2r), so there's nothing to retroactively fix here the way
-- migration 026 had to for subscription_status.
alter table public.organizations alter column trial_ends_at set default (now() + interval '7 days');
