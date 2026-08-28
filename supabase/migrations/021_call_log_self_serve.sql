-- Public self-serve lead intake (/get-started) for word-of-mouth / webinar
-- leads that don't come through a Google Places search. Reuses call_log
-- (the existing deal pipeline) rather than a parallel table -- this is the
-- same kind of prospect as anything added manually on /calls, just sourced
-- differently. See CLAUDE.md for the decision.

alter table public.call_log
  add column source text not null default 'manual'
    check (source in ('manual', 'self_serve')),
  add column contact_name text,
  add column email text;
