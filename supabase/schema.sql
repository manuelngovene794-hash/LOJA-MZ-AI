-- LOJA MZ AI: schema inicial de produção.
-- Executar no SQL Editor do projeto Supabase NOVO.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique,
  role text not null default 'merchant' check (role in ('merchant','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text default '',
  plan text not null default 'basic' check (plan in ('basic','pro','business')),
  subscription_status text not null default 'pending' check (subscription_status in ('pending','active','suspended','expired')),
  subscription_started_at timestamptz,
  subscription_ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  description text default '',
  price numeric(12,2) not null default 0 check (price >= 0),
  cost_price numeric(12,2) not null default 0 check (cost_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  order_number text not null,
  status text not null default 'pending' check (status in ('pending','confirmed','processing','completed','cancelled')),
  total numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  unique(store_id, order_number)
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  unit_cost numeric(12,2) not null default 0
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  description text not null,
  amount numeric(12,2) not null check (amount > 0),
  expense_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.subscription_payments (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  plan text not null check (plan in ('basic','pro','business')),
  amount_mzn numeric(12,2) not null,
  payment_reference text,
  status text not null default 'submitted' check (status in ('submitted','approved','rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);

create table if not exists public.product_likes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  visitor_key text not null,
  created_at timestamptz not null default now(),
  unique(product_id, visitor_key)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  visitor_key text not null,
  stars integer not null check (stars between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique(store_id, visitor_key)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists products_store_idx on public.products(store_id);
create index if not exists orders_store_date_idx on public.orders(store_id, created_at);
create index if not exists expenses_store_date_idx on public.expenses(store_id, expense_date);

-- Helper: authenticated user owns the store.
create or replace function public.owns_store(target_store uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.stores where id=target_store and owner_id=auth.uid()); $$;

alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.expenses enable row level security;
alter table public.subscription_payments enable row level security;
alter table public.product_likes enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;

create policy "profile self read" on public.profiles for select to authenticated using (id=auth.uid());
-- No client-side profile UPDATE policy: users must not be able to change their role.

create policy "store owner read" on public.stores for select to authenticated using (owner_id=auth.uid());
-- No client-side store UPDATE policy: plan and subscription status are server/admin controlled.

create policy "public active stores read" on public.stores for select to anon using (subscription_status='active');
create policy "products owner all" on public.products for all to authenticated using (public.owns_store(store_id)) with check (public.owns_store(store_id));
create policy "public published products read" on public.products for select to anon using (is_published=true and exists(select 1 from public.stores s where s.id=store_id and s.subscription_status='active'));

create policy "customers owner all" on public.customers for all to authenticated using (public.owns_store(store_id)) with check (public.owns_store(store_id));
create policy "orders owner all" on public.orders for all to authenticated using (public.owns_store(store_id)) with check (public.owns_store(store_id));
create policy "order items owner all" on public.order_items for all to authenticated using (exists(select 1 from public.orders o join public.stores s on s.id=o.store_id where o.id=order_id and s.owner_id=auth.uid())) with check (exists(select 1 from public.orders o join public.stores s on s.id=o.store_id where o.id=order_id and s.owner_id=auth.uid()));
create policy "expenses owner all" on public.expenses for all to authenticated using (public.owns_store(store_id)) with check (public.owns_store(store_id));
create policy "payments owner read" on public.subscription_payments for select to authenticated using (public.owns_store(store_id));
create policy "payments owner submit" on public.subscription_payments for insert to authenticated with check (public.owns_store(store_id));
create policy "likes public read" on public.product_likes for select to anon, authenticated using (true);
create policy "likes public insert" on public.product_likes for insert to anon, authenticated with check (exists(select 1 from public.products p join public.stores s on s.id=p.store_id where p.id=product_id and p.is_published=true and s.subscription_status='active'));
create policy "reviews public read" on public.reviews for select to anon, authenticated using (true);
create policy "reviews public insert" on public.reviews for insert to anon, authenticated with check (exists(select 1 from public.stores s where s.id=store_id and s.subscription_status='active'));
create policy "notifications owner all" on public.notifications for all to authenticated using (public.owns_store(store_id)) with check (public.owns_store(store_id));

-- Storage bucket for product images. Private writes are restricted to authenticated owners
-- via the storage policies below; public reads are allowed for published storefront images.
insert into storage.buckets(id,name,public) values ('product-images','product-images',true)
on conflict (id) do nothing;

create policy "product image public read" on storage.objects for select to anon, authenticated using (bucket_id='product-images');
create policy "product image authenticated upload" on storage.objects for insert to authenticated with check (
  bucket_id='product-images' and exists (
    select 1 from public.stores s
    where s.owner_id=auth.uid() and s.id::text=(storage.foldername(name))[1]
  )
);
create policy "product image owner update" on storage.objects for update to authenticated using (
  bucket_id='product-images' and exists (
    select 1 from public.stores s
    where s.owner_id=auth.uid() and s.id::text=(storage.foldername(name))[1]
  )
) with check (bucket_id='product-images');
create policy "product image owner delete" on storage.objects for delete to authenticated using (
  bucket_id='product-images' and exists (
    select 1 from public.stores s
    where s.owner_id=auth.uid() and s.id::text=(storage.foldername(name))[1]
  )
);

-- Automatically create the merchant profile and store after Supabase Auth signup.
-- Store names and requested plans are supplied by app/registar/page.tsx metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_name text;
  requested_plan text;
  base_slug text;
  final_slug text;
  suffix integer := 0;
begin
  requested_name := coalesce(nullif(trim(new.raw_user_meta_data->>'store_name'), ''), 'Minha Loja');
  requested_plan := coalesce(new.raw_user_meta_data->>'requested_plan', 'basic');

  if requested_plan not in ('basic', 'pro', 'business') then
    requested_plan := 'basic';
  end if;

  insert into public.profiles (id, phone)
  values (new.id, new.phone)
  on conflict (id) do update set phone = excluded.phone;

  base_slug := trim(both '-' from regexp_replace(
    lower(requested_name),
    '[^a-z0-9]+',
    '-',
    'g'
  ));

  if base_slug = '' then
    base_slug := 'loja';
  end if;

  final_slug := base_slug;
  while exists (select 1 from public.stores where slug = final_slug) loop
    suffix := suffix + 1;
    final_slug := base_slug || '-' || suffix::text;
  end loop;

  insert into public.stores (owner_id, name, slug, plan, subscription_status)
  values (new.id, requested_name, final_slug, requested_plan, 'pending')
  on conflict (owner_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_loja_mz on auth.users;
create trigger on_auth_user_created_loja_mz
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- IMPORTANT:
-- 1) Configure phone/password authentication in Supabase Auth.
-- 2) Create the first admin role securely from the Supabase SQL editor after creating your account.
-- 3) Never expose SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY or GROQ_API_KEY in browser code.
-- 4) Store creation, plan limits and manual activation must be implemented in trusted server functions.
