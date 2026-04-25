-- BunqPal AH Mock Site — Supabase schema
-- Run this in the Supabase SQL editor.
-- Idempotent: drops & recreates tables in dependency order.

drop table if exists public.audit_logs cascade;
drop table if exists public.notifications cascade;
drop table if exists public.future_actions cascade;
drop table if exists public.purchase_memories cascade;
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.checkout_sessions cascade;
drop table if exists public.cart_items cascade;
drop table if exists public.memberships cascade;
drop table if exists public.products cascade;
drop table if exists public.app_users cascade;

create extension if not exists pgcrypto;

create table public.app_users (
  id uuid primary key,
  email text unique not null,
  display_name text not null,
  created_at timestamptz default now()
);

create table public.products (
  id text primary key,
  slug text unique not null,
  name text not null,
  brand text,
  category text not null,
  subcategory text,
  description text,
  price numeric(10,2) not null,
  currency text default 'EUR',
  image_url text not null,
  unit_label text,
  in_stock boolean default true,
  consumable boolean default false,
  default_estimated_duration_days int,
  subscription boolean default false,
  cycle_days int,
  refundable boolean default false,
  refund_window_days int,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table public.cart_items (
  user_id uuid references public.app_users(id) on delete cascade,
  product_id text references public.products(id) on delete cascade,
  quantity int not null default 1,
  added_at timestamptz default now(),
  primary key (user_id, product_id)
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.app_users(id) on delete cascade unique,
  product_id text references public.products(id),
  status text not null default 'inactive', -- inactive / active / cancelled / refunded
  started_at timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz,
  refunded_at timestamptz,
  bunq_payment_id text,
  created_by text default 'user', -- user / bunqpal
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.app_users(id) on delete cascade,
  domain text,
  url text,
  page_intent text,
  extracted_context jsonb,
  screenshot_path text,
  mouse_context jsonb,
  detected_intent text,
  amount numeric(10,2),
  currency text default 'EUR',
  recommended_account_label text,
  status text default 'active',
  created_at timestamptz default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.app_users(id) on delete cascade,
  checkout_session_id uuid references public.checkout_sessions(id),
  merchant text default 'AH Mock',
  subtotal numeric(10,2) not null,
  shipping numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  currency text default 'EUR',
  status text default 'paid', -- paid / refund_requested / refunded / cancelled
  payment_method text default 'iban', -- iban / card / bunq
  payment_reference text, -- masked IBAN or last 4 of card; set by AH mock manual checkout
  bunq_payment_id text,    -- set by BunqPal backend after a real Bunq sandbox debit
  bunq_payment_status text,
  bunq_account_label text, -- e.g. "Pet Essentials" — set by BunqPal backend
  invoice_number text unique,
  created_by text default 'user', -- user / bunqpal
  refund_window_ends_at timestamptz,
  refund_requested_at timestamptz,
  refunded_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id text references public.products(id),
  product_name text not null,
  unit_price numeric(10,2) not null,
  quantity int not null,
  line_total numeric(10,2) not null
);

create table public.purchase_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.app_users(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  checkout_session_id uuid references public.checkout_sessions(id),
  bunq_payment_id text,
  merchant text,
  item_name text,
  category text,
  amount numeric(10,2),
  currency text default 'EUR',
  purchased_at timestamptz default now(),
  raw_context jsonb,
  created_at timestamptz default now()
);

create table public.future_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.app_users(id) on delete cascade,
  purchase_memory_id uuid references public.purchase_memories(id) on delete cascade,
  type text not null, -- refill_check / renewal_review / refund_window
  status text default 'scheduled', -- scheduled / triggered / completed / cancelled
  scheduled_at timestamptz not null,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  triggered_at timestamptz,
  completed_at timestamptz
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.app_users(id) on delete cascade,
  future_action_id uuid references public.future_actions(id) on delete cascade,
  title text,
  body text,
  actions jsonb default '[]'::jsonb,
  status text default 'pending',
  created_at timestamptz default now(),
  sent_at timestamptz
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.app_users(id) on delete cascade,
  actor text, -- agent / user / system / extension
  action text,
  input jsonb,
  output jsonb,
  created_at timestamptz default now()
);

-- Indexes
create index orders_user_idx on public.orders (user_id, created_at desc);
create index order_items_order_idx on public.order_items (order_id);
create index future_actions_due_idx on public.future_actions (status, scheduled_at);
create index purchase_memories_user_idx on public.purchase_memories (user_id, purchased_at desc);

-- Seed mock user (ID matches MOCK_USER_ID in .env.local)
insert into public.app_users (id, email, display_name)
values ('11111111-1111-1111-1111-111111111111', 'laura@bunqpal.dev', 'Laura Nicholson')
on conflict (id) do nothing;

-- RLS: open during hackathon (publishable key reads/writes everything for the mock user).
alter table public.app_users enable row level security;
alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.memberships enable row level security;
alter table public.checkout_sessions enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.purchase_memories enable row level security;
alter table public.future_actions enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

do $$
declare t text;
begin
  for t in select unnest(array[
    'app_users','products','cart_items','memberships','checkout_sessions',
    'orders','order_items','purchase_memories','future_actions','notifications','audit_logs'
  ]) loop
    execute format('drop policy if exists "anon_all" on public.%I;', t);
    execute format('create policy "anon_all" on public.%I for all using (true) with check (true);', t);
  end loop;
end $$;
