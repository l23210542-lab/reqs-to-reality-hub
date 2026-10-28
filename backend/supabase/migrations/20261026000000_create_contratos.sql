-- FinScript: tabla de contratos (FR5 / US5)

create extension if not exists "pgcrypto";

create table if not exists public.contratos (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid()
                references auth.users (id) on delete cascade,
  titulo        text not null check (char_length(btrim(titulo)) between 1 and 200),
  codigo_fuente text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists contratos_user_id_updated_at_idx
  on public.contratos (user_id, updated_at desc);

-- updated_at automático
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists contratos_set_updated_at on public.contratos;
create trigger contratos_set_updated_at
  before update on public.contratos
  for each row execute function public.set_updated_at();

-- Row Level Security: cada usuario solo ve y modifica sus contratos
alter table public.contratos enable row level security;

drop policy if exists "contratos_select_own" on public.contratos;
create policy "contratos_select_own"
  on public.contratos for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "contratos_insert_own" on public.contratos;
create policy "contratos_insert_own"
  on public.contratos for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "contratos_update_own" on public.contratos;
create policy "contratos_update_own"
  on public.contratos for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "contratos_delete_own" on public.contratos;
create policy "contratos_delete_own"
  on public.contratos for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.contratos to authenticated;
