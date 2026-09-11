-- Part 6/7 -- migration 027's specific target: the CURRENT default on
-- organizations.trial_ends_at. READ-ONLY.
begin transaction read only;

select column_name, column_default, is_nullable, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'organizations' and column_name = 'trial_ends_at';

rollback;
