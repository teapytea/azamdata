create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.enforce_owned_reference()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  referenced_id uuid;
  referenced_user_id uuid;
begin
  referenced_id := nullif(to_jsonb(new) ->> tg_argv[0], '')::uuid;
  if referenced_id is null then
    return new;
  end if;

  execute format(
    'select user_id from public.%I where id = $1 and deleted_at is null',
    tg_argv[1]
  )
  into referenced_user_id
  using referenced_id;

  if referenced_user_id is distinct from new.user_id then
    raise exception 'Referenced % record does not belong to the authenticated owner', tg_argv[1]
      using errcode = '23503';
  end if;

  return new;
end;
$$;

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  account_type text not null check (account_type in ('bank', 'ewallet', 'cash', 'other')),
  last_four text check (last_four is null or last_four ~ '^[0-9]{4}$'),
  currency text not null default 'IDR' check (currency ~ '^[A-Z]{3}$'),
  initial_balance_minor bigint not null default 0,
  initial_balance_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, name)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category_type text not null check (category_type in ('expense', 'income')),
  color text,
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, name, category_type)
);

create table public.merchants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  aliases text[] not null default '{}',
  default_category_id uuid references public.categories(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, name)
);

create table public.raw_ingests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null,
  channel text not null,
  external_id text,
  raw_payload jsonb not null,
  process_status text not null default 'pending' check (process_status in ('pending', 'processed', 'needs_review', 'failed')),
  error_message text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index raw_ingests_external_id_idx
  on public.raw_ingests (user_id, source, external_id)
  where external_id is not null and deleted_at is null;

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  direction text not null check (direction in ('debit', 'credit', 'transfer')),
  account_id uuid not null references public.accounts(id) on delete restrict,
  counterpart_account_id uuid references public.accounts(id) on delete restrict,
  category_id uuid references public.categories(id) on delete set null,
  merchant_id uuid references public.merchants(id) on delete set null,
  description text not null,
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null default 'IDR' check (currency ~ '^[A-Z]{3}$'),
  occurred_at timestamptz not null,
  status text not null default 'confirmed' check (status in ('draft', 'confirmed', 'reconciled', 'needs_review')),
  source text not null default 'manual' check (source in ('email', 'ocr', 'manual', 'import')),
  source_bank text,
  external_ref text,
  confidence numeric(5,4) check (confidence is null or confidence between 0 and 1),
  raw_ingest_id uuid references public.raw_ingests(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (direction <> 'transfer' or counterpart_account_id is not null),
  check (account_id <> counterpart_account_id)
);

create unique index transactions_external_ref_idx
  on public.transactions (user_id, source_bank, external_ref)
  where source_bank is not null and external_ref is not null and deleted_at is null;
create index transactions_user_occurred_idx on public.transactions (user_id, occurred_at desc) where deleted_at is null;
create index transactions_account_idx on public.transactions (account_id, occurred_at desc) where deleted_at is null;

create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  transaction_id uuid references public.transactions(id) on delete set null,
  storage_path text not null,
  content_hash text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, content_hash)
);

create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null,
  name text not null,
  method_type text not null check (method_type in ('card', 'bank_transfer', 'ewallet', 'other')),
  last_four text check (last_four is null or last_four ~ '^[0-9]{4}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, name)
);

create table public.service_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  login_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, label)
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  billing_cycle text not null check (billing_cycle in ('monthly', 'yearly')),
  anchor_date date not null,
  amount_minor bigint not null check (amount_minor >= 0),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  payment_method_id uuid references public.payment_methods(id) on delete set null,
  service_account_id uuid references public.service_accounts(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'paused', 'cancelled')),
  website_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, name)
);

create index subscriptions_user_status_idx on public.subscriptions (user_id, status) where deleted_at is null;

create table public.subscription_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  transaction_id uuid references public.transactions(id) on delete set null,
  period_start date not null,
  amount_original_minor bigint not null check (amount_original_minor >= 0),
  original_currency text not null check (original_currency ~ '^[A-Z]{3}$'),
  amount_paid_idr_minor bigint check (amount_paid_idr_minor is null or amount_paid_idr_minor >= 0),
  exchange_rate numeric(18,6) check (exchange_rate is null or exchange_rate > 0),
  paid_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (subscription_id, period_start)
);

create table public.quota_providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  provider_key text not null,
  fetch_method text not null check (fetch_method in ('api', 'local_agent', 'manual')),
  last_synced_at timestamptz,
  sync_status text not null default 'idle' check (sync_status in ('idle', 'syncing', 'success', 'failed')),
  sync_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, provider_key)
);

create table public.quota_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider_id uuid not null references public.quota_providers(id) on delete cascade,
  remaining numeric not null check (remaining >= 0),
  quota_limit numeric check (quota_limit is null or quota_limit >= 0),
  unit text not null check (unit in ('credits', 'tokens', 'messages', 'requests', 'percent', 'usd', 'hours')),
  window_type text not null default 'monthly' check (window_type in ('rolling_5h', 'weekly', 'monthly', 'balance', 'manual')),
  resets_at timestamptz,
  expires_at timestamptz,
  measured_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index quota_snapshots_latest_idx on public.quota_snapshots (provider_id, window_type, measured_at desc) where deleted_at is null;

create table public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider_id uuid not null references public.quota_providers(id) on delete cascade,
  amount numeric not null default 1 check (amount > 0),
  unit text not null,
  occurred_at timestamptz not null default now(),
  client_event_id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, client_event_id)
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  obsidian_id text not null,
  title text not null,
  note_type text not null,
  status text not null,
  priority text,
  target_date date,
  relative_path text not null,
  content_markdown text not null default '',
  last_seen_at timestamptz not null,
  sync_status text not null default 'synced' check (sync_status in ('synced', 'needs_review', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, obsidian_id)
);

alter table public.notes add column search_document tsvector
  generated always as (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(content_markdown, ''))) stored;
create index notes_search_idx on public.notes using gin (search_document);
create index notes_status_idx on public.notes (user_id, status) where deleted_at is null;

create table public.note_tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  note_id uuid not null references public.notes(id) on delete cascade,
  tag text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (note_id, tag)
);

create trigger merchants_category_owner
  before insert or update of user_id, default_category_id on public.merchants
  for each row execute function public.enforce_owned_reference('default_category_id', 'categories');
create trigger transactions_account_owner
  before insert or update of user_id, account_id on public.transactions
  for each row execute function public.enforce_owned_reference('account_id', 'accounts');
create trigger transactions_counterpart_account_owner
  before insert or update of user_id, counterpart_account_id on public.transactions
  for each row execute function public.enforce_owned_reference('counterpart_account_id', 'accounts');
create trigger transactions_category_owner
  before insert or update of user_id, category_id on public.transactions
  for each row execute function public.enforce_owned_reference('category_id', 'categories');
create trigger transactions_merchant_owner
  before insert or update of user_id, merchant_id on public.transactions
  for each row execute function public.enforce_owned_reference('merchant_id', 'merchants');
create trigger transactions_ingest_owner
  before insert or update of user_id, raw_ingest_id on public.transactions
  for each row execute function public.enforce_owned_reference('raw_ingest_id', 'raw_ingests');
create trigger attachments_transaction_owner
  before insert or update of user_id, transaction_id on public.attachments
  for each row execute function public.enforce_owned_reference('transaction_id', 'transactions');
create trigger payment_methods_account_owner
  before insert or update of user_id, account_id on public.payment_methods
  for each row execute function public.enforce_owned_reference('account_id', 'accounts');
create trigger subscriptions_payment_method_owner
  before insert or update of user_id, payment_method_id on public.subscriptions
  for each row execute function public.enforce_owned_reference('payment_method_id', 'payment_methods');
create trigger subscriptions_service_account_owner
  before insert or update of user_id, service_account_id on public.subscriptions
  for each row execute function public.enforce_owned_reference('service_account_id', 'service_accounts');
create trigger subscription_payments_subscription_owner
  before insert or update of user_id, subscription_id on public.subscription_payments
  for each row execute function public.enforce_owned_reference('subscription_id', 'subscriptions');
create trigger subscription_payments_transaction_owner
  before insert or update of user_id, transaction_id on public.subscription_payments
  for each row execute function public.enforce_owned_reference('transaction_id', 'transactions');
create trigger quota_snapshots_provider_owner
  before insert or update of user_id, provider_id on public.quota_snapshots
  for each row execute function public.enforce_owned_reference('provider_id', 'quota_providers');
create trigger usage_events_provider_owner
  before insert or update of user_id, provider_id on public.usage_events
  for each row execute function public.enforce_owned_reference('provider_id', 'quota_providers');
create trigger note_tags_note_owner
  before insert or update of user_id, note_id on public.note_tags
  for each row execute function public.enforce_owned_reference('note_id', 'notes');

create or replace function public.next_subscription_billing_date(
  anchor_date date,
  billing_cycle text,
  as_of date default current_date
)
returns date
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  candidate date;
  target_month date;
  anchor_day integer := extract(day from anchor_date);
begin
  if billing_cycle = 'monthly' then
    target_month := date_trunc('month', as_of)::date;
    candidate := (target_month + (least(anchor_day, extract(day from (target_month + interval '1 month - 1 day')))::integer - 1))::date;
    if candidate < as_of then
      target_month := (target_month + interval '1 month')::date;
      candidate := (target_month + (least(anchor_day, extract(day from (target_month + interval '1 month - 1 day')))::integer - 1))::date;
    end if;
    return candidate;
  end if;

  if billing_cycle = 'yearly' then
    candidate := make_date(extract(year from as_of)::integer, extract(month from anchor_date)::integer, 1);
    candidate := candidate + (least(anchor_day, extract(day from (date_trunc('month', candidate) + interval '1 month - 1 day')))::integer - 1);
    if candidate < as_of then
      candidate := make_date(extract(year from as_of)::integer + 1, extract(month from anchor_date)::integer, 1);
      candidate := candidate + (least(anchor_day, extract(day from (date_trunc('month', candidate) + interval '1 month - 1 day')))::integer - 1);
    end if;
    return candidate;
  end if;

  raise exception 'Unsupported billing cycle: %', billing_cycle;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'accounts', 'categories', 'merchants', 'raw_ingests', 'transactions',
    'attachments', 'payment_methods', 'service_accounts', 'subscriptions',
    'subscription_payments', 'quota_providers', 'quota_snapshots',
    'usage_events', 'notes', 'note_tags'
  ]
  loop
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
    execute format('alter table public.%I enable row level security', table_name);
    execute format(
      'create policy "Users manage their own rows" on public.%I for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',
      table_name
    );
    execute format('revoke all on public.%I from anon', table_name);
    execute format('grant select, insert, update, delete on public.%I to authenticated', table_name);
  end loop;
end;
$$;

revoke all on function public.next_subscription_billing_date(date, text, date) from public;
grant execute on function public.next_subscription_billing_date(date, text, date) to authenticated;
revoke all on function public.set_updated_at() from public;
revoke all on function public.enforce_owned_reference() from public;
