-- Part 7/7 -- the migration ledger itself (supabase_migrations.schema_
-- migrations), for direct comparison against the schema evidence in
-- parts 1-6. READ-ONLY (a plain SELECT against a bookkeeping table).
begin transaction read only;

select version, name, statements is not null as has_statements_recorded
from supabase_migrations.schema_migrations
order by version;

rollback;
