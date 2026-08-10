-- Tracks whether a closed client has actually paid, so "closed" in the call
-- tracker doesn't quietly mean "said yes" when it should mean "is paying."
alter table public.call_log
  add column stripe_customer_id text,
  add column stripe_checkout_session_id text,
  add column stripe_subscription_id text,
  add column payment_status text not null default 'none'
    check (payment_status in ('none', 'pending', 'active', 'past_due', 'canceled'));

create index call_log_stripe_subscription_idx on public.call_log(stripe_subscription_id);
