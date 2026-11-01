-- Personal OS Finance only tracks transactions from 1 January 2026 (Asia/Jakarta).
-- Retire older imported records without physically destroying the raw audit trail.
with retired_transactions as (
  update public.transactions
  set deleted_at = now()
  where deleted_at is null
    and occurred_at < timestamptz '2025-12-31 17:00:00+00'
  returning id, raw_ingest_id
), retired_attachments as (
  update public.attachments attachment
  set deleted_at = now()
  from retired_transactions transaction
  where attachment.transaction_id = transaction.id
    and attachment.deleted_at is null
  returning attachment.id
), retired_candidates as (
  update public.finance_email_candidates
  set deleted_at = now()
  where deleted_at is null
    and occurred_at < timestamptz '2025-12-31 17:00:00+00'
  returning raw_ingest_id
)
update public.raw_ingests raw
set deleted_at = now()
where raw.deleted_at is null
  and (
    exists (select 1 from retired_transactions item where item.raw_ingest_id = raw.id)
    or exists (select 1 from retired_candidates item where item.raw_ingest_id = raw.id)
  );

alter table public.gmail_ingest_credentials
  add column apps_script_url text;
alter table public.gmail_ingest_credentials
  add constraint gmail_ingest_credentials_apps_script_url_check
  check (
    apps_script_url is null
    or apps_script_url ~ '^https://script\.google\.com/macros/s/[A-Za-z0-9_-]+/exec$'
  );

create or replace function public.set_gmail_apps_script_url(target_url text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  normalized_url text := nullif(btrim(target_url), '');
begin
  if owner_id is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if normalized_url is not null and normalized_url !~ '^https://script\.google\.com/macros/s/[A-Za-z0-9_-]+/exec$' then
    raise exception 'Enter a deployed Google Apps Script web app URL ending in /exec' using errcode = '22023';
  end if;
  update public.gmail_ingest_credentials
  set apps_script_url = normalized_url
  where user_id = owner_id and revoked_at is null and deleted_at is null;
  if not found then raise exception 'Configure Gmail sync first' using errcode = 'P0002'; end if;
end;
$$;

revoke all on function public.set_gmail_apps_script_url(text) from public, anon;
grant execute on function public.set_gmail_apps_script_url(text) to authenticated;

drop function public.get_gmail_auto_sync_status();
create function public.get_gmail_auto_sync_status()
returns table (
  configured boolean,
  bca_sender text,
  bsi_sender text,
  label_name text,
  last_received_at timestamptz,
  last_success_at timestamptz,
  last_error text,
  apps_script_url text
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
    credential.last_error,
    credential.apps_script_url
  from public.gmail_ingest_credentials credential
  where credential.user_id = auth.uid()
    and credential.revoked_at is null
    and credential.deleted_at is null
  union all
  select false, null, null, 'PersonalOS/Bank', null, null, null, null
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

create or replace function public.infer_finance_category(target_user_id uuid, target_description text)
returns uuid
language plpgsql
security invoker
set search_path = ''
stable
as $$
declare
  normalized_description text := lower(coalesce(target_description, ''));
  inferred_name text;
  inferred_id uuid;
begin
  inferred_name := case
    when normalized_description ~ '(coffee|cafe|kopi|restaurant|resto|warung|ayam|chicken|bakso|mie|noodle|martabak|geprek|sushi|tea|food|mcd|kfc|hokben|solaria|pizza|burger|bread|bakery|donut|jco|starbucks|grabfood|gofood)' then 'Makanan & Minuman'
    when normalized_description ~ '(grab|gojek|gocar|goride|maxim|bluebird|taxi|kai|kereta|toll|parkir|parking|pertamina|shell|spbu|travel)' then 'Transportasi'
    when normalized_description ~ '(pln|telkom|indihome|biznet|hostinger|google|apple|netflix|spotify|canva|adobe|openai|chatgpt|anthropic|claude|figma|subscription|insurance|bpjs|token listrik|pulsa|internet)' then 'Tagihan'
    when normalized_description ~ '(shopee|tokopedia|lazada|blibli|alfamart|indomaret|superindo|hypermart|minimarket|sembako|shop|store|market|uniqlo|ikea|ace hardware|mr[.]? diy|guardian|watsons|pharmacy|apotek)' then 'Belanja'
    else null
  end;
  if inferred_name is null then return null; end if;
  select category.id into inferred_id
  from public.categories category
  where category.user_id = target_user_id
    and category.name = inferred_name
    and category.category_type = 'expense'
    and category.deleted_at is null
  limit 1;
  return inferred_id;
end;
$$;

revoke all on function public.infer_finance_category(uuid, text) from public;

create or replace function public.apply_default_merchant_category()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  matched_merchant public.merchants%rowtype;
begin
  if new.direction <> 'debit' or new.category_id is not null then return new; end if;
  select merchant.* into matched_merchant
  from public.merchants merchant
  where merchant.user_id = new.user_id
    and merchant.deleted_at is null
    and (
      lower(btrim(merchant.name)) = lower(btrim(new.description))
      or exists (select 1 from unnest(merchant.aliases) alias where lower(btrim(alias)) = lower(btrim(new.description)))
    )
  order by merchant.updated_at desc
  limit 1;
  if matched_merchant.id is not null and matched_merchant.default_category_id is not null then
    new.merchant_id := matched_merchant.id;
    new.category_id := matched_merchant.default_category_id;
  else
    new.category_id := public.infer_finance_category(new.user_id, new.description);
  end if;
  return new;
end;
$$;

update public.transactions transaction
set category_id = public.infer_finance_category(transaction.user_id, transaction.description)
where transaction.deleted_at is null
  and transaction.direction = 'debit'
  and transaction.category_id is null
  and transaction.occurred_at >= timestamptz '2025-12-31 17:00:00+00'
  and public.infer_finance_category(transaction.user_id, transaction.description) is not null;

create table public.finance_receipt_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  raw_ingest_id uuid not null references public.raw_ingests(id) on delete restrict,
  attachment_id uuid not null references public.attachments(id) on delete restrict,
  transaction_id uuid references public.transactions(id) on delete set null,
  merchant_name text,
  total_minor bigint check (total_minor is null or total_minor > 0),
  currency text check (currency is null or currency ~ '^[A-Z]{3}$'),
  occurred_at timestamptz,
  account_hint text,
  category_hint text,
  field_confidence jsonb not null default '{}'::jsonb,
  raw_model_response jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'needs_review', 'confirmed', 'failed', 'rejected')),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, attachment_id)
);

create trigger set_finance_receipt_drafts_updated_at
  before update on public.finance_receipt_drafts
  for each row execute function public.set_updated_at();
create trigger finance_receipt_drafts_raw_ingest_owner
  before insert or update of user_id, raw_ingest_id on public.finance_receipt_drafts
  for each row execute function public.enforce_owned_reference('raw_ingest_id', 'raw_ingests');
create trigger finance_receipt_drafts_attachment_owner
  before insert or update of user_id, attachment_id on public.finance_receipt_drafts
  for each row execute function public.enforce_owned_reference('attachment_id', 'attachments');
create trigger finance_receipt_drafts_transaction_owner
  before insert or update of user_id, transaction_id on public.finance_receipt_drafts
  for each row execute function public.enforce_owned_reference('transaction_id', 'transactions');

create index finance_receipt_drafts_review_idx
  on public.finance_receipt_drafts (user_id, status, created_at desc)
  where deleted_at is null;

alter table public.finance_receipt_drafts enable row level security;
create policy "Users read their own receipt drafts"
  on public.finance_receipt_drafts for select to authenticated
  using ((select auth.uid()) = user_id);
revoke all on public.finance_receipt_drafts from anon;
grant select on public.finance_receipt_drafts to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'finance-receipts',
  'finance-receipts',
  false,
  6291456,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.confirm_finance_receipt_draft(
  target_draft_id uuid,
  target_account_id uuid,
  target_category_id uuid,
  resolved_description text,
  resolved_amount_minor bigint,
  resolved_currency text,
  resolved_occurred_at timestamptz,
  remember_merchant boolean default true
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  draft public.finance_receipt_drafts%rowtype;
  account_currency text;
  transaction_record_id uuid;
  merchant_record_id uuid;
  receipt_hash text;
begin
  if owner_id is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if nullif(btrim(resolved_description), '') is null then raise exception 'Description is required' using errcode = '22023'; end if;
  if resolved_amount_minor is null or resolved_amount_minor <= 0 then raise exception 'Amount must be greater than zero' using errcode = '22023'; end if;
  if resolved_occurred_at < timestamptz '2025-12-31 17:00:00+00' then raise exception 'Expense tracking starts on 1 January 2026' using errcode = '22023'; end if;

  select * into draft from public.finance_receipt_drafts
  where id = target_draft_id and user_id = owner_id and status in ('pending', 'needs_review', 'failed') and deleted_at is null
  for update;
  if draft.id is null then raise exception 'Receipt draft was not found or was already confirmed' using errcode = 'P0002'; end if;

  select currency into account_currency from public.accounts
  where id = target_account_id and user_id = owner_id and deleted_at is null;
  if account_currency is null or account_currency <> upper(resolved_currency) then raise exception 'Invalid payment source or currency' using errcode = '23503'; end if;
  if not exists (
    select 1 from public.categories where id = target_category_id and user_id = owner_id
      and category_type = 'expense' and deleted_at is null
  ) then raise exception 'Invalid expense category' using errcode = '23503'; end if;

  if remember_merchant then
    insert into public.merchants (user_id, name, default_category_id)
    values (owner_id, btrim(resolved_description), target_category_id)
    on conflict (user_id, name) do update
    set default_category_id = excluded.default_category_id, deleted_at = null
    returning id into merchant_record_id;
  end if;

  select content_hash into receipt_hash from public.attachments where id = draft.attachment_id;
  insert into public.transactions (
    user_id, direction, account_id, category_id, merchant_id, description, amount_minor,
    currency, occurred_at, status, source, source_bank, external_ref, confidence, raw_ingest_id
  ) values (
    owner_id, 'debit', target_account_id, target_category_id, merchant_record_id,
    btrim(resolved_description), resolved_amount_minor, upper(resolved_currency), resolved_occurred_at,
    'confirmed', 'ocr', 'RECEIPT', receipt_hash,
    nullif((draft.field_confidence->>'overall')::numeric, 0), draft.raw_ingest_id
  ) returning id into transaction_record_id;

  update public.attachments set transaction_id = transaction_record_id where id = draft.attachment_id;
  update public.finance_receipt_drafts
  set status = 'confirmed', transaction_id = transaction_record_id, error_message = null
  where id = draft.id;
  return transaction_record_id;
end;
$$;

revoke all on function public.confirm_finance_receipt_draft(uuid, uuid, uuid, text, bigint, text, timestamptz, boolean) from public, anon;
grant execute on function public.confirm_finance_receipt_draft(uuid, uuid, uuid, text, bigint, text, timestamptz, boolean) to authenticated;
