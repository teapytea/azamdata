create table public.gmail_ingest_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  secret_hash text not null unique check (secret_hash ~ '^[a-f0-9]{64}$'),
  bca_sender text,
  bsi_sender text,
  label_name text not null default 'PersonalOS/Bank',
  last_received_at timestamptz,
  last_success_at timestamptz,
  last_error text,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (bca_sender is not null or bsi_sender is not null),
  check (bca_sender is null or bca_sender = lower(bca_sender)),
  check (bsi_sender is null or bsi_sender = lower(bsi_sender))
);

create trigger set_gmail_ingest_credentials_updated_at
  before update on public.gmail_ingest_credentials
  for each row execute function public.set_updated_at();

alter table public.gmail_ingest_credentials enable row level security;
revoke all on public.gmail_ingest_credentials from anon, authenticated;

alter table public.finance_email_candidates
  add column raw_ingest_id uuid references public.raw_ingests(id) on delete set null;
alter table public.finance_email_candidates alter column direction drop not null;
alter table public.finance_email_candidates drop constraint finance_email_candidates_direction_check;
alter table public.finance_email_candidates
  add constraint finance_email_candidates_direction_check
  check (direction is null or direction in ('debit', 'credit'));
create index finance_email_candidates_raw_ingest_idx
  on public.finance_email_candidates (raw_ingest_id)
  where raw_ingest_id is not null and deleted_at is null;
create trigger finance_email_candidates_raw_ingest_owner
  before insert or update of user_id, raw_ingest_id on public.finance_email_candidates
  for each row execute function public.enforce_owned_reference('raw_ingest_id', 'raw_ingests');

create or replace function public.ensure_finance_defaults()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
begin
  if owner_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  insert into public.accounts (user_id, name, account_type, currency, initial_balance_minor)
  values
    (owner_id, 'BCA', 'bank', 'IDR', 0),
    (owner_id, 'BSI', 'bank', 'IDR', 0),
    (owner_id, 'GoPay', 'ewallet', 'IDR', 0),
    (owner_id, 'ShopeePay', 'ewallet', 'IDR', 0),
    (owner_id, 'DANA', 'ewallet', 'IDR', 0)
  on conflict (user_id, name) do nothing;

  insert into public.categories (user_id, name, category_type, icon)
  values
    (owner_id, 'Belanja', 'expense', 'shopping_bag'),
    (owner_id, 'Makanan & Minuman', 'expense', 'restaurant'),
    (owner_id, 'Transportasi', 'expense', 'directions_car'),
    (owner_id, 'Tagihan', 'expense', 'receipt_long'),
    (owner_id, 'Lainnya', 'expense', 'category'),
    (owner_id, 'Pendapatan', 'income', 'payments'),
    (owner_id, 'Refund', 'income', 'currency_exchange')
  on conflict (user_id, name, category_type) do nothing;
end;
$$;

revoke all on function public.ensure_finance_defaults() from public, anon;
grant execute on function public.ensure_finance_defaults() to authenticated;

create or replace function public.configure_gmail_auto_sync(
  exact_bca_sender text default null,
  exact_bsi_sender text default null
)
returns table (secret text, endpoint_label text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  generated_secret text;
  normalized_bca text := nullif(lower(btrim(exact_bca_sender)), '');
  normalized_bsi text := nullif(lower(btrim(exact_bsi_sender)), '');
begin
  if owner_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if normalized_bca is null and normalized_bsi is null then
    raise exception 'At least one exact bank sender is required' using errcode = '22023';
  end if;
  if normalized_bca is not null and normalized_bca !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'BCA sender must be an exact email address' using errcode = '22023';
  end if;
  if normalized_bsi is not null and normalized_bsi !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'BSI sender must be an exact email address' using errcode = '22023';
  end if;

  generated_secret := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.gmail_ingest_credentials (
    user_id, secret_hash, bca_sender, bsi_sender, revoked_at, last_error, deleted_at
  ) values (
    owner_id,
    encode(extensions.digest(generated_secret, 'sha256'), 'hex'),
    normalized_bca,
    normalized_bsi,
    null,
    null,
    null
  )
  on conflict (user_id) do update set
    secret_hash = excluded.secret_hash,
    bca_sender = excluded.bca_sender,
    bsi_sender = excluded.bsi_sender,
    revoked_at = null,
    last_error = null,
    deleted_at = null;

  return query select generated_secret, 'PersonalOS/Bank'::text;
end;
$$;

revoke all on function public.configure_gmail_auto_sync(text, text) from public, anon;
grant execute on function public.configure_gmail_auto_sync(text, text) to authenticated;

create or replace function public.get_gmail_auto_sync_status()
returns table (
  configured boolean,
  bca_sender text,
  bsi_sender text,
  label_name text,
  last_received_at timestamptz,
  last_success_at timestamptz,
  last_error text
)
language sql
security definer
set search_path = ''
stable
as $$
  select
    true,
    credential.bca_sender,
    credential.bsi_sender,
    credential.label_name,
    credential.last_received_at,
    credential.last_success_at,
    credential.last_error
  from public.gmail_ingest_credentials credential
  where credential.user_id = auth.uid()
    and credential.revoked_at is null
    and credential.deleted_at is null
  union all
  select false, null, null, 'PersonalOS/Bank', null, null, null
  where not exists (
    select 1 from public.gmail_ingest_credentials credential
    where credential.user_id = auth.uid()
      and credential.revoked_at is null
      and credential.deleted_at is null
  )
  limit 1;
$$;

revoke all on function public.get_gmail_auto_sync_status() from public, anon;
grant execute on function public.get_gmail_auto_sync_status() to authenticated;

insert into public.accounts (user_id, name, account_type, currency, initial_balance_minor)
select users.id, defaults.name, defaults.account_type, 'IDR', 0
from auth.users users
cross join (values
  ('BCA', 'bank'),
  ('BSI', 'bank'),
  ('GoPay', 'ewallet'),
  ('ShopeePay', 'ewallet'),
  ('DANA', 'ewallet')
) as defaults(name, account_type)
on conflict (user_id, name) do nothing;

