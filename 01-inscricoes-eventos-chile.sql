-- =============================================================================
-- Saint Alcuin — Inscrições de Eventos (Seminário Chile 2027)
-- Idempotente: pode rodar no SQL Editor mais de uma vez sem erro.
-- Tabela genérica, reaproveitável para futuras viagens (campo "evento" = slug).
-- =============================================================================

create extension if not exists pgcrypto;

create table if not exists public.inscricoes_eventos (
  id           uuid primary key default gen_random_uuid(),
  evento       text not null,                       -- slug, ex.: 'chile-2027'
  nome         text not null,
  email        text not null,
  whatsapp     text not null,
  cidade       text,
  estado       text,                                -- preenchido pelo autocomplete (UF)
  area         text,                                -- ex.: 'Educação'
  nivel        text,                                -- 'Mestrado' | 'Doutorado'
  situacao     text,                                -- 'formado' | 'em_andamento' | 'ingressar'
  duvida       text,                                -- campo livre de pergunta
  aceite_lgpd  boolean not null,
  aceite_em    timestamptz,
  origem       text,                                -- instagram/facebook/google/whatsapp/direto
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  utm_content  text,
  status       text not null default 'nova',        -- nova / contatada / confirmada / desistiu
  email_enviado boolean not null default false,     -- marca se o e-mail de confirmação saiu
  observacao   text,
  criado_em    timestamptz not null default now()
);

-- Colunas adicionadas em re-execução (caso a tabela já exista de versão anterior)
alter table public.inscricoes_eventos add column if not exists estado text;
alter table public.inscricoes_eventos add column if not exists area text;
alter table public.inscricoes_eventos add column if not exists nivel text;
alter table public.inscricoes_eventos add column if not exists situacao text;
alter table public.inscricoes_eventos add column if not exists duvida text;
alter table public.inscricoes_eventos add column if not exists email_enviado boolean not null default false;

create index if not exists idx_insc_eventos_evento_data
  on public.inscricoes_eventos (evento, criado_em desc);

-- ------------------------------------------------------------------ RLS
alter table public.inscricoes_eventos enable row level security;

-- anon: SÓ INSERT, e somente com aceite_lgpd = true. Nunca lê.
drop policy if exists insc_eventos_anon_insert on public.inscricoes_eventos;
create policy insc_eventos_anon_insert
  on public.inscricoes_eventos
  for insert
  to anon
  with check (aceite_lgpd = true);

-- authenticated (admin): leitura e gestão total.
drop policy if exists insc_eventos_auth_select on public.inscricoes_eventos;
create policy insc_eventos_auth_select
  on public.inscricoes_eventos for select to authenticated using (true);

drop policy if exists insc_eventos_auth_update on public.inscricoes_eventos;
create policy insc_eventos_auth_update
  on public.inscricoes_eventos for update to authenticated using (true) with check (true);

drop policy if exists insc_eventos_auth_delete on public.inscricoes_eventos;
create policy insc_eventos_auth_delete
  on public.inscricoes_eventos for delete to authenticated using (true);

-- ------------------------------------------------------------------ Conferência
select
  (select count(*) from public.inscricoes_eventos) as total_inscricoes,
  (select count(*) from pg_policies where tablename='inscricoes_eventos') as policies;
