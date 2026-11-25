-- Feedback do professor na nota (motivo/observação, até 500 caracteres).
-- Idempotente: pode rodar mais de uma vez.
alter table public.notas add column if not exists feedback text;

-- (opcional) garante o limite no banco também, além do front
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'notas_feedback_len'
  ) then
    alter table public.notas
      add constraint notas_feedback_len check (feedback is null or char_length(feedback) <= 500);
  end if;
end $$;

select column_name, data_type from information_schema.columns
where table_name='notas' and column_name='feedback';
