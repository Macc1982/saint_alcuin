-- ============================================================================
-- Saint Alcuin of York Anglican College — Repositório Acadêmico
-- Setup completo do Supabase (executar no SQL Editor uma única vez)
-- ============================================================================

-- 1) Tabela principal de dissertações/teses
create table if not exists public.dissertacoes (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  titulo       text not null,
  titulo_en    text,
  resumo       text,
  resumo_en    text,
  ano          integer not null check (ano between 1900 and 2100),
  autor        text not null,
  orientador   text not null,
  banca        text[] not null default '{}',
  tipo         text not null default 'dissertacao' check (tipo in ('dissertacao','tese')),
  pdf_url      text not null,
  pdf_path     text not null,
  -- Links externos para documentos institucionais (apostilamento federal etc.)
  link_diploma   text,
  link_historico text,
  link_ata       text,
  criado_em    timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Migration para bancos já existentes (idempotente)
alter table public.dissertacoes add column if not exists link_diploma   text;
alter table public.dissertacoes add column if not exists link_historico text;
alter table public.dissertacoes add column if not exists link_ata       text;

-- Índice para listagem ordenada
create index if not exists dissertacoes_ano_idx on public.dissertacoes (ano desc, criado_em desc);

-- Trigger para manter atualizado_em
create or replace function public.tg_dissertacoes_updated()
returns trigger language plpgsql as $$
begin
  new.atualizado_em = now();
  return new;
end $$;

drop trigger if exists dissertacoes_updated on public.dissertacoes;
create trigger dissertacoes_updated
  before update on public.dissertacoes
  for each row execute function public.tg_dissertacoes_updated();

-- ============================================================================
-- 2) Row Level Security
-- ============================================================================
alter table public.dissertacoes enable row level security;

-- Leitura pública (qualquer visitante pode listar)
drop policy if exists "leitura publica" on public.dissertacoes;
create policy "leitura publica"
  on public.dissertacoes for select
  to anon, authenticated
  using (true);

-- Escrita apenas para usuários autenticados (admin logado via Supabase Auth)
drop policy if exists "admin pode inserir" on public.dissertacoes;
create policy "admin pode inserir"
  on public.dissertacoes for insert
  to authenticated
  with check (true);

drop policy if exists "admin pode atualizar" on public.dissertacoes;
create policy "admin pode atualizar"
  on public.dissertacoes for update
  to authenticated
  using (true) with check (true);

drop policy if exists "admin pode deletar" on public.dissertacoes;
create policy "admin pode deletar"
  on public.dissertacoes for delete
  to authenticated
  using (true);

-- ============================================================================
-- 3) Storage bucket para os PDFs
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('dissertacoes', 'dissertacoes', true)
on conflict (id) do update set public = true;

-- Políticas do bucket
drop policy if exists "leitura publica do bucket dissertacoes" on storage.objects;
create policy "leitura publica do bucket dissertacoes"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'dissertacoes');

drop policy if exists "admin pode subir pdf" on storage.objects;
create policy "admin pode subir pdf"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'dissertacoes');

drop policy if exists "admin pode atualizar pdf" on storage.objects;
create policy "admin pode atualizar pdf"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'dissertacoes')
  with check (bucket_id = 'dissertacoes');

drop policy if exists "admin pode remover pdf" on storage.objects;
create policy "admin pode remover pdf"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'dissertacoes');

-- ============================================================================
-- FIM. Após rodar:
--  1. Authentication → Settings → User Signups → DISABLED
--  2. Authentication → Users → Add user (cria seu admin com email + senha)
-- ============================================================================
