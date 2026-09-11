-- Follow-up -- migration 018's column comment showed present=false; pulls
-- whatever comment (if any) currently exists on chat_leads.source. READ-ONLY.
begin transaction read only;

select
  c.relname as table_name,
  a.attname as column_name,
  col_description(c.oid, a.attnum) as current_comment
from pg_attribute a
join pg_class c on c.oid = a.attrelid
where c.relname = 'chat_leads' and a.attname = 'source';

rollback;
