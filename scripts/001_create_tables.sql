-- Create users profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text default 'staff' check (role in ('admin', 'staff')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create products table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  brand text,
  cost_price decimal(10, 3) not null,
  selling_price decimal(10, 3) not null,
  stock_quantity integer default 0,
  barcode text unique,
  expiry_date date,
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create customers table
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references auth.users(id) on delete cascade,
  shop_name text not null,
  owner_name text not null,
  phone text not null,
  address text,
  location_lat decimal(10, 8),
  location_lng decimal(11, 8),
  outstanding_balance decimal(12, 3) default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create invoices table
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references auth.users(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete restrict,
  invoice_number text unique not null,
  invoice_date date not null,
  due_date date not null,
  subtotal decimal(12, 3) not null,
  discount_amount decimal(12, 3) default 0,
  tax_amount decimal(12, 3) default 0,
  total_amount decimal(12, 3) not null,
  paid_amount decimal(12, 3) default 0,
  payment_status text default 'unpaid' check (payment_status in ('paid', 'partial', 'unpaid')),
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create invoice items table
create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices(id) on delete cascade,
  product_id uuid references public.products(id) on delete restrict,
  quantity integer not null,
  unit_price decimal(10, 3) not null,
  line_total decimal(12, 3) not null,
  created_at timestamp with time zone default now()
);

-- Create payments table
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references auth.users(id) on delete cascade,
  invoice_id uuid references public.invoices(id) on delete cascade,
  payment_date date not null,
  amount decimal(12, 3) not null,
  payment_method text,
  notes text,
  created_at timestamp with time zone default now()
);

-- Create activity logs table
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references auth.users(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb,
  created_at timestamp with time zone default now()
);

-- Create business settings table
create table if not exists public.business_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references auth.users(id) on delete cascade unique,
  business_name text,
  business_logo_url text,
  currency text default 'TND',
  tax_rate decimal(5, 2) default 0,
  invoice_prefix text default 'INV-',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.activity_logs enable row level security;
alter table public.business_settings enable row level security;

-- RLS Policies for profiles
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- RLS Policies for products
create policy "products_select_own_org"
  on public.products for select
  using (organization_id = auth.uid());

create policy "products_insert_own_org"
  on public.products for insert
  with check (organization_id = auth.uid());

create policy "products_update_own_org"
  on public.products for update
  using (organization_id = auth.uid());

create policy "products_delete_own_org"
  on public.products for delete
  using (organization_id = auth.uid());

-- RLS Policies for customers
create policy "customers_select_own_org"
  on public.customers for select
  using (organization_id = auth.uid());

create policy "customers_insert_own_org"
  on public.customers for insert
  with check (organization_id = auth.uid());

create policy "customers_update_own_org"
  on public.customers for update
  using (organization_id = auth.uid());

create policy "customers_delete_own_org"
  on public.customers for delete
  using (organization_id = auth.uid());

-- RLS Policies for invoices
create policy "invoices_select_own_org"
  on public.invoices for select
  using (organization_id = auth.uid());

create policy "invoices_insert_own_org"
  on public.invoices for insert
  with check (organization_id = auth.uid());

create policy "invoices_update_own_org"
  on public.invoices for update
  using (organization_id = auth.uid());

create policy "invoices_delete_own_org"
  on public.invoices for delete
  using (organization_id = auth.uid());

-- RLS Policies for invoice items (accessible through invoice)
create policy "invoice_items_select"
  on public.invoice_items for select
  using (exists(
    select 1 from public.invoices
    where invoices.id = invoice_items.invoice_id
    and invoices.organization_id = auth.uid()
  ));

create policy "invoice_items_insert"
  on public.invoice_items for insert
  with check (exists(
    select 1 from public.invoices
    where invoices.id = invoice_items.invoice_id
    and invoices.organization_id = auth.uid()
  ));

-- RLS Policies for payments
create policy "payments_select_own_org"
  on public.payments for select
  using (organization_id = auth.uid());

create policy "payments_insert_own_org"
  on public.payments for insert
  with check (organization_id = auth.uid());

create policy "payments_delete_own_org"
  on public.payments for delete
  using (organization_id = auth.uid());

-- RLS Policies for activity logs
create policy "activity_logs_select_own_org"
  on public.activity_logs for select
  using (organization_id = auth.uid());

create policy "activity_logs_insert_own_org"
  on public.activity_logs for insert
  with check (organization_id = auth.uid());

-- RLS Policies for business settings
create policy "business_settings_select_own_org"
  on public.business_settings for select
  using (organization_id = auth.uid());

create policy "business_settings_insert_own_org"
  on public.business_settings for insert
  with check (organization_id = auth.uid());

create policy "business_settings_update_own_org"
  on public.business_settings for update
  using (organization_id = auth.uid());
