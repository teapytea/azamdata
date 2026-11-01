-- Teapy OS. Semua akses lewat server aplikasi, jadi RLS aktif tanpa policy di akhir file.

create table if not exists app_settings (key text primary key, data jsonb not null);

create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  name text not null, position text not null default 'Crew Outlet', contact text default '',
  email text default '', rate numeric not null default 0, active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique, name text not null, password_hash text,
  role text not null check (role in ('owner','admin','marketing','cashier','employee')),
  active boolean not null default true, must_change_password boolean not null default false,
  pos_access boolean not null default false,
  employee_id uuid references employees(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists rate_limits (key text primary key, count int not null, reset_at timestamptz not null);

create table if not exists activity (
  id bigserial primary key, at timestamptz not null default now(),
  title text not null, detail text default '', actor text default ''
);

create table if not exists materials (
  id uuid primary key default gen_random_uuid(),
  code text not null unique, sku text not null, name text not null, category text not null,
  unit text not null, stock numeric not null default 0, min_stock numeric not null default 0,
  unit_cost numeric not null default 0, note text default '', active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists stock_moves (
  id bigserial primary key, at timestamptz not null default now(),
  material_id uuid not null references materials(id), delta numeric not null,
  kind text not null, ref text default '', note text default '', actor text default ''
);
create index if not exists stock_moves_material on stock_moves(material_id, at desc);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  code text not null unique, sku text not null, name text not null, type text not null,
  origin text default '', price numeric not null, yield_ml numeric not null default 10000,
  serving_ml numeric not null default 200, image text default '', sop jsonb not null default '{}',
  active boolean not null default true, created_at timestamptz not null default now()
);

create table if not exists recipe_items (
  product_id uuid not null references products(id) on delete cascade,
  material_id uuid not null references materials(id),
  qty numeric not null, primary key (product_id, material_id)
);

-- Batch seduh. QC hanya berupa label tanggal produksi: batch bisa dijual setelah labeled_at terisi.
create table if not exists batches (
  id uuid primary key default gen_random_uuid(), code text not null unique,
  product_id uuid not null references products(id),
  made_on date not null, made_at timestamptz not null default now(), expires_at timestamptz not null,
  initial_ml numeric not null, remaining_ml numeric not null, cost_per_ml numeric not null,
  operator text default '', labeled_at timestamptz, labeled_by text default '',
  drained_at timestamptz
);
create index if not exists batches_fifo on batches(product_id, made_at);

create table if not exists waste_log (
  id bigserial primary key, at timestamptz not null default now(),
  item text not null, qty numeric not null, unit text not null, cost numeric not null,
  reason text default '', actor text default ''
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(), phone text not null unique, name text not null,
  points int not null default 0, created_at timestamptz not null default now()
);

create table if not exists registers (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id),
  cashier text not null, opened_at timestamptz not null default now(), opening_cash numeric not null,
  closed_at timestamptz, closing_cash numeric, expected_cash numeric, note text default ''
);

create sequence if not exists sale_seq;
create table if not exists sales (
  id uuid primary key default gen_random_uuid(), number text not null unique,
  request_token text not null unique, at timestamptz not null default now(),
  order_type text not null, table_no text default '', courier text default '',
  customer_name text default '', customer_id uuid references customers(id),
  status text not null default 'Selesai',
  subtotal numeric not null, discount numeric not null default 0, member_discount numeric not null default 0,
  redeem_points int not null default 0, redeem_value numeric not null default 0,
  service numeric not null default 0, tax numeric not null default 0, rounding numeric not null default 0,
  total numeric not null, channel_fee numeric not null default 0, cogs numeric not null default 0,
  points_earned int not null default 0,
  payment text not null, tendered numeric not null default 0, change_due numeric not null default 0,
  reference text default '', note text default '', cashier text not null, register_id uuid references registers(id),
  void_reason text default '', void_by text default '', void_at timestamptz
);
create index if not exists sales_at on sales(at desc);

create table if not exists sale_lines (
  id uuid primary key default gen_random_uuid(), sale_id uuid not null references sales(id) on delete cascade,
  product_id uuid not null references products(id), name text not null, qty int not null,
  sugar text not null, topping text not null, note text default '',
  unit_price numeric not null, topping_price numeric not null default 0, gross numeric not null,
  cogs numeric not null, serving_ml numeric not null, allocations jsonb not null default '[]', materials jsonb not null default '[]'
);
create index if not exists sale_lines_sale on sale_lines(sale_id);

create table if not exists held_orders (
  id uuid primary key default gen_random_uuid(), label text not null, data jsonb not null,
  created_by text default '', created_at timestamptz not null default now()
);

create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(), name text not null unique, location text default '',
  specialty text default '', contact text default '', lead_days int not null default 0,
  active boolean not null default true
);

create sequence if not exists po_seq;
create table if not exists purchase_orders (
  id uuid primary key default gen_random_uuid(), number text not null unique,
  ordered_at timestamptz not null default now(), supplier_id uuid not null references suppliers(id),
  material_id uuid not null references materials(id), qty numeric not null, total numeric not null,
  status text not null default 'Dipesan', eta date, note text default '',
  received_at timestamptz, received_by text default '', payment text not null default 'Belum dibayar',
  paid_at timestamptz, pay_ref text default ''
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(), at timestamptz not null default now(),
  category text not null, note text default '', amount numeric not null, source text default 'Manual', ref text default ''
);
create index if not exists expenses_at on expenses(at desc);

create table if not exists reconciliations (
  id uuid primary key default gen_random_uuid(), date date not null, method text not null,
  system_amount numeric not null, actual_amount numeric not null, note text default '', actor text default '',
  created_at timestamptz not null default now()
);

create table if not exists shifts (
  id uuid primary key default gen_random_uuid(), employee_id uuid not null references employees(id),
  date date not null, code text not null check (code in ('shift1','shift2')), starts text not null, ends text not null,
  station text default '', status text not null default 'Terjadwal', rate numeric not null default 0,
  check_in timestamptz, check_out timestamptz, paid_at timestamptz, expense_id uuid references expenses(id),
  unique (employee_id, date, code)
);
create index if not exists shifts_date on shifts(date);

create table if not exists task_templates (
  id uuid primary key default gen_random_uuid(), code text unique, title text not null, description text default '',
  shift_code text not null default 'shift1', sort int not null default 0, active boolean not null default true
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(), template_id uuid references task_templates(id) on delete set null,
  date date not null, shift_code text not null, title text not null, description text default '',
  employee_id uuid references employees(id) on delete set null, sort int not null default 100,
  done_at timestamptz, done_by text default '', note text default '', created_at timestamptz not null default now(),
  unique (template_id, date)
);
create index if not exists tasks_date on tasks(date);

create table if not exists leave_requests (
  id uuid primary key default gen_random_uuid(), employee_id uuid not null references employees(id),
  kind text not null, date_from date not null, date_to date not null, reason text default '',
  status text not null default 'Menunggu', decided_by text default '', decided_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists contract_templates (
  id uuid primary key default gen_random_uuid(), code text unique, version int not null, title text not null, body text not null,
  status text not null default 'Draft', hash text default '', published_at timestamptz, published_by text default '',
  created_at timestamptz not null default now()
);

create table if not exists contract_submissions (
  id uuid primary key default gen_random_uuid(), request_token text not null unique,
  template_id uuid not null references contract_templates(id), title text not null, body text not null, hash text not null,
  name text not null, email text not null, phone text not null, address text not null,
  printed_name text not null, signature jsonb not null, signed_at timestamptz not null default now(),
  ip text default '', user_agent text default '', status text not null default 'Menunggu verifikasi',
  user_id uuid references users(id) on delete set null, employee_id uuid references employees(id) on delete set null,
  verified_by text default '', verified_at timestamptz
);

create table if not exists partners (
  id uuid primary key default gen_random_uuid(), name text not null, kind text not null default 'KOL',
  handle text default '', platform text default 'Instagram', contact text default '', niche text default '',
  followers int not null default 0, note text default '', active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(), partner_id uuid not null references partners(id),
  title text not null, scheme text not null default 'PAID', pic text default '', fee numeric not null default 0,
  benefit text default '', benefit_cost numeric not null default 0, status text not null default 'Dihubungi',
  starts_on date, ends_on date, follow_up date, note text default '', archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists deliverables (
  id uuid primary key default gen_random_uuid(), campaign_id uuid not null references campaigns(id) on delete cascade,
  title text not null, deadline date, status text not null default 'Belum mulai', link text default '',
  published_on date, views int not null default 0, reach int not null default 0, engagement int not null default 0
);

create table if not exists campaign_payments (
  id uuid primary key default gen_random_uuid(), campaign_id uuid not null references campaigns(id) on delete cascade,
  amount numeric not null, paid_on date not null, ref text default '', note text default '',
  expense_id uuid references expenses(id)
);

alter table products add column if not exists mode text not null default 'batch';
alter table products add column if not exists price_takeaway numeric;
alter table materials add column if not exists track_stock boolean not null default true;

alter table sale_lines add column if not exists ice text not null default 'Normal ice';
alter table sales add column if not exists promo_code text not null default '';

create table if not exists promo_codes (
  code text primary key, percent numeric not null check (percent > 0 and percent <= 100),
  active boolean not null default true, created_at timestamptz not null default now()
);

create table if not exists applied_patches (name text primary key, applied_at timestamptz not null default now());

do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t.tablename);
  end loop;
end $$;
