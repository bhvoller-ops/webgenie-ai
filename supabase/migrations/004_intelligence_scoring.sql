alter table public.analysis_outputs
add column if not exists overall_score integer,
add column if not exists overall_confidence integer;

create index if not exists analysis_outputs_score_idx
on public.analysis_outputs(overall_score);

create or replace function public.sync_analysis_output_scores()
returns trigger
language plpgsql
as $$
begin
  new.overall_score :=
    nullif(new.output->>'overallScore', '')::integer;
  new.overall_confidence :=
    nullif(new.output->>'overallConfidence', '')::integer;
  return new;
end;
$$;

drop trigger if exists sync_analysis_output_scores_trigger
on public.analysis_outputs;

create trigger sync_analysis_output_scores_trigger
before insert or update on public.analysis_outputs
for each row
execute function public.sync_analysis_output_scores();
