-- Part 13 of the WebGenie production migration reconciliation audit --
-- direct ledger inspection for versions 037-040 specifically, extending
-- 07-ledger.sql (which lists every version, no per-row detail). READ-ONLY:
-- a plain SELECT against the bookkeeping table supabase_migrations.
-- schema_migrations, no secrets or connection info involved -- this
-- table holds only migration metadata.
begin transaction read only;

select
  version,
  name,
  statements is not null as has_statements_recorded,
  coalesce(array_length(statements, 1), 0) as statement_count
from supabase_migrations.schema_migrations
where version in ('037', '038', '039', '040')
order by version;

rollback;
