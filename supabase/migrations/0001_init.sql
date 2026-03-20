begin;

-- Recomendado para `gen_random_uuid()`
create extension if not exists pgcrypto;

-- =========================
-- Filamentos e Produtos
-- =========================

create table if not exists filamentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  nome text not null,
  cor text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists produtos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  filamento_id uuid references filamentos(id),
  nome text not null,
  descricao text,
  preco numeric not null default 0,
  ativo boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================
-- Clientes e Encomendas
-- =========================

create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  nome text not null,
  telefone text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, telefone)
);

create table if not exists encomendas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  cliente_id uuid not null references clientes(id),
  tipo_entrega text not null check (tipo_entrega in ('local', 'envio')),
  custo_entrega numeric not null default 0,
  notas text,
  estado text not null default 'pendente'
    check (estado in ('pendente', 'em_producao', 'entregue', 'cancelada')),
  tempo_producao_dias int,
  entregue_em timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists itens_encomenda (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  encomenda_id uuid not null references encomendas(id) on delete cascade,
  produto_id uuid not null references produtos(id),
  quantidade int not null check (quantidade >= 1),
  created_at timestamptz default now()
);

-- Configuracoes gerais
create table if not exists configuracoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  chave text not null,
  valor jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, chave)
);

-- =========================
-- Tabelas do Agente IA
-- =========================

create table if not exists agente_memoria (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  chave text not null,
  valor jsonb,
  updated_at timestamptz default now(),
  unique (user_id, chave)
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  nome text,
  contacto text,
  produto_interesse text,
  origem text not null check (origem in ('instagram_dm', 'whatsapp', 'facebook')),
  estado text not null default 'novo'
    check (estado in ('novo', 'contactado', 'convertido')),
  notas text,
  created_at timestamptz default now()
);

create table if not exists posts_publicados (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  plataforma text not null check (plataforma in ('instagram', 'facebook', 'tiktok')),
  texto text,
  imagem_url text,
  post_id_externo text,
  produto_id uuid references produtos(id),
  created_at timestamptz default now()
);

-- =========================
-- Indices (por ownership)
-- =========================

create index if not exists idx_filamentos_user_id on filamentos(user_id);
create index if not exists idx_produtos_user_id on produtos(user_id);
create index if not exists idx_clientes_user_id on clientes(user_id);
create index if not exists idx_encomendas_user_id on encomendas(user_id);
create index if not exists idx_itens_encomenda_user_id on itens_encomenda(user_id);
create index if not exists idx_configuracoes_user_id on configuracoes(user_id);
create index if not exists idx_agente_memoria_user_id on agente_memoria(user_id);
create index if not exists idx_leads_user_id on leads(user_id);
create index if not exists idx_posts_publicados_user_id on posts_publicados(user_id);

-- =========================
-- RLS + Policies "owner_only"
-- =========================

-- filamentos
alter table filamentos enable row level security;
alter table filamentos force row level security;

create policy "filamentos_owner_only_select"
  on filamentos for select
  using (auth.uid() = user_id);

create policy "filamentos_owner_only_insert"
  on filamentos for insert
  with check (auth.uid() = user_id);

create policy "filamentos_owner_only_update"
  on filamentos for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "filamentos_owner_only_delete"
  on filamentos for delete
  using (auth.uid() = user_id);

-- produtos
alter table produtos enable row level security;
alter table produtos force row level security;

create policy "produtos_owner_only_select"
  on produtos for select
  using (auth.uid() = user_id);
create policy "produtos_owner_only_insert"
  on produtos for insert
  with check (auth.uid() = user_id);
create policy "produtos_owner_only_update"
  on produtos for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "produtos_owner_only_delete"
  on produtos for delete
  using (auth.uid() = user_id);

-- clientes
alter table clientes enable row level security;
alter table clientes force row level security;

create policy "clientes_owner_only_select"
  on clientes for select
  using (auth.uid() = user_id);
create policy "clientes_owner_only_insert"
  on clientes for insert
  with check (auth.uid() = user_id);
create policy "clientes_owner_only_update"
  on clientes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "clientes_owner_only_delete"
  on clientes for delete
  using (auth.uid() = user_id);

-- encomendas
alter table encomendas enable row level security;
alter table encomendas force row level security;

create policy "encomendas_owner_only_select"
  on encomendas for select
  using (auth.uid() = user_id);
create policy "encomendas_owner_only_insert"
  on encomendas for insert
  with check (auth.uid() = user_id);
create policy "encomendas_owner_only_update"
  on encomendas for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "encomendas_owner_only_delete"
  on encomendas for delete
  using (auth.uid() = user_id);

-- itens_encomenda
alter table itens_encomenda enable row level security;
alter table itens_encomenda force row level security;

create policy "itens_encomenda_owner_only_select"
  on itens_encomenda for select
  using (auth.uid() = user_id);
create policy "itens_encomenda_owner_only_insert"
  on itens_encomenda for insert
  with check (auth.uid() = user_id);
create policy "itens_encomenda_owner_only_update"
  on itens_encomenda for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "itens_encomenda_owner_only_delete"
  on itens_encomenda for delete
  using (auth.uid() = user_id);

-- configuracoes
alter table configuracoes enable row level security;
alter table configuracoes force row level security;

create policy "configuracoes_owner_only_select"
  on configuracoes for select
  using (auth.uid() = user_id);
create policy "configuracoes_owner_only_insert"
  on configuracoes for insert
  with check (auth.uid() = user_id);
create policy "configuracoes_owner_only_update"
  on configuracoes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "configuracoes_owner_only_delete"
  on configuracoes for delete
  using (auth.uid() = user_id);

-- agente_memoria
alter table agente_memoria enable row level security;
alter table agente_memoria force row level security;

create policy "agente_memoria_owner_only_select"
  on agente_memoria for select
  using (auth.uid() = user_id);
create policy "agente_memoria_owner_only_insert"
  on agente_memoria for insert
  with check (auth.uid() = user_id);
create policy "agente_memoria_owner_only_update"
  on agente_memoria for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "agente_memoria_owner_only_delete"
  on agente_memoria for delete
  using (auth.uid() = user_id);

-- leads
alter table leads enable row level security;
alter table leads force row level security;

create policy "leads_owner_only_select"
  on leads for select
  using (auth.uid() = user_id);
create policy "leads_owner_only_insert"
  on leads for insert
  with check (auth.uid() = user_id);
create policy "leads_owner_only_update"
  on leads for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "leads_owner_only_delete"
  on leads for delete
  using (auth.uid() = user_id);

-- posts_publicados
alter table posts_publicados enable row level security;
alter table posts_publicados force row level security;

create policy "posts_publicados_owner_only_select"
  on posts_publicados for select
  using (auth.uid() = user_id);
create policy "posts_publicados_owner_only_insert"
  on posts_publicados for insert
  with check (auth.uid() = user_id);
create policy "posts_publicados_owner_only_update"
  on posts_publicados for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "posts_publicados_owner_only_delete"
  on posts_publicados for delete
  using (auth.uid() = user_id);

commit;

