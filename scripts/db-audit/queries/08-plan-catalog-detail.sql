-- Follow-up part -- migration 028's plan_catalog upsert showed present=false
-- in the presence matrix; this pulls the actual row (if any) for direct
-- comparison against 028's intended values. READ-ONLY.
begin transaction read only;

select key, name, price_monthly_cents, price_yearly_cents, limits, features
from public.plan_catalog
where key = 'vibelabs';

rollback;
