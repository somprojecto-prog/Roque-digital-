-- ============================================================
-- ROQUE DIGITAL — Esquema da Base de Dados (Supabase / Postgres)
-- Corre este ficheiro em: Supabase → SQL Editor → New query → Run
-- ============================================================

-- ---------- 1. PERFIS (Admin e Gestor podem criar conta) ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null check (role in ('admin','gestor','funcionario','armazem','marketing')) default 'gestor',
  created_at timestamp with time zone default now()
);

alter table profiles enable row level security;

-- Qualquer conta autenticada pode ver os perfis da equipa (para a página "Equipa")
create policy "Equipa pode ver perfis" on profiles
  for select using (auth.role() = 'authenticated');

-- Um utilizador só pode criar o seu próprio perfil (ligado ao signup)
create policy "Utilizador cria o próprio perfil" on profiles
  for insert with check (auth.uid() = id);

-- Um utilizador só pode atualizar o seu próprio perfil
create policy "Utilizador atualiza o próprio perfil" on profiles
  for update using (auth.uid() = id);


-- ---------- 2. CATEGORIAS ----------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_id uuid references categories(id),
  created_at timestamp with time zone default now()
);

alter table categories enable row level security;
create policy "Todos podem ver categorias" on categories for select using (true);
create policy "Admin/Gestor gerem categorias" on categories for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin','gestor'))
);


-- ---------- 3. PRODUTOS ----------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  brand text,
  category_id uuid references categories(id),
  price numeric(12,2) not null,
  promo_price numeric(12,2),
  stock integer default 0,
  sku text,
  image_url text,
  tag text,              -- ex: 'NOVO', 'PROMOÇÃO', 'MAIS VENDIDO'
  active boolean default true,
  created_at timestamp with time zone default now()
);

alter table products enable row level security;
create policy "Todos podem ver produtos ativos" on products for select using (active = true);
create policy "Admin/Gestor gerem produtos" on products for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin','gestor'))
);


-- ---------- 4. CLIENTES ----------
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  email text,
  phone text,
  address text,
  created_at timestamp with time zone default now()
);

alter table customers enable row level security;
create policy "Admin/Gestor veem clientes" on customers for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin','gestor'))
);


-- ---------- 5. ENCOMENDAS ----------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number serial,
  customer_id uuid references customers(id),
  status text default 'novo' check (status in ('novo','pago','preparando','enviado','entregue','cancelado')),
  total numeric(12,2) not null default 0,
  delivery_fee numeric(12,2) default 0,
  created_at timestamp with time zone default now()
);

alter table orders enable row level security;
create policy "Admin/Gestor gerem encomendas" on orders for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin','gestor'))
);


-- ---------- 6. ITENS DA ENCOMENDA ----------
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  quantity integer not null default 1,
  unit_price numeric(12,2) not null
);

alter table order_items enable row level security;
create policy "Admin/Gestor gerem itens de encomenda" on order_items for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin','gestor'))
);


-- ============================================================
-- PRONTO. Depois de correr este ficheiro:
-- 1. Vai a Authentication → Providers → confirma que "Email" está ativo
-- 2. Cria a tua primeira conta em manager/signup.html (escolhe "Admin")
-- 3. Cola o Project URL + anon key nos ficheiros HTML (procura "COLA_AQUI")
-- ============================================================
