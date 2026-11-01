create table public.finance_email_candidates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  discovery_evidence_id uuid references public.discovery_evidence(id) on delete set null,
  transaction_id uuid references public.transactions(id) on delete set null,
  source_ref_hash text not null,
  merchant_name text not null,
  sender text,
  subject text not null,
  excerpt text,
  occurred_at timestamptz,
  direction text not null default 'debit' check (direction in ('debit', 'credit')),
  amount_minor bigint check (amount_minor is null or amount_minor > 0),
  currency text check (currency is null or currency ~ '^[A-Z]{3}$'),
  payment_hint text,
  confidence numeric(5,4) not null default 0.5 check (confidence between 0 and 1),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check ((amount_minor is null) = (currency is null)),
  unique (user_id, source_ref_hash)
);

create index finance_email_candidates_review_idx
  on public.finance_email_candidates (user_id, status, occurred_at desc)
  where deleted_at is null;
create index finance_email_candidates_evidence_idx
  on public.finance_email_candidates (discovery_evidence_id)
  where discovery_evidence_id is not null and deleted_at is null;
create index finance_email_candidates_transaction_idx
  on public.finance_email_candidates (transaction_id)
  where transaction_id is not null and deleted_at is null;

create trigger finance_email_candidates_evidence_owner
  before insert or update of user_id, discovery_evidence_id on public.finance_email_candidates
  for each row execute function public.enforce_owned_reference('discovery_evidence_id', 'discovery_evidence');
create trigger finance_email_candidates_transaction_owner
  before insert or update of user_id, transaction_id on public.finance_email_candidates
  for each row execute function public.enforce_owned_reference('transaction_id', 'transactions');
create trigger set_finance_email_candidates_updated_at
  before update on public.finance_email_candidates
  for each row execute function public.set_updated_at();

alter table public.finance_email_candidates enable row level security;
create policy "Users manage their own Gmail finance candidates"
  on public.finance_email_candidates
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
revoke all on public.finance_email_candidates from anon;
grant select, insert, update, delete on public.finance_email_candidates to authenticated;

create or replace function public.approve_finance_email_candidate(
  candidate_id uuid,
  target_account_id uuid,
  target_category_id uuid,
  resolved_description text,
  resolved_direction text,
  resolved_amount_minor bigint,
  resolved_currency text,
  resolved_occurred_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  candidate_record public.finance_email_candidates%rowtype;
  transaction_record_id uuid;
  account_currency text;
begin
  if owner_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if resolved_direction not in ('debit', 'credit') then
    raise exception 'Direction must be debit or credit' using errcode = '22023';
  end if;
  if resolved_amount_minor is null or resolved_amount_minor <= 0 then
    raise exception 'Amount must be greater than zero' using errcode = '22023';
  end if;
  if resolved_currency is null or upper(resolved_currency) !~ '^[A-Z]{3}$' then
    raise exception 'Currency must be a three-letter code' using errcode = '22023';
  end if;
  if nullif(btrim(resolved_description), '') is null then
    raise exception 'Description is required' using errcode = '22023';
  end if;

  select * into candidate_record
  from public.finance_email_candidates
  where id = candidate_id
    and user_id = owner_id
    and status = 'pending'
    and deleted_at is null
  for update;

  if candidate_record.id is null then
    raise exception 'Candidate was not found or was already reviewed' using errcode = 'P0002';
  end if;
  select currency into account_currency
  from public.accounts
  where id = target_account_id and user_id = owner_id and deleted_at is null;
  if account_currency is null then
    raise exception 'Account does not belong to the authenticated owner' using errcode = '23503';
  end if;
  if upper(resolved_currency) <> account_currency then
    raise exception 'Transaction currency must match the selected account currency' using errcode = '22023';
  end if;
  if target_category_id is not null and not exists (
    select 1 from public.categories
    where id = target_category_id and user_id = owner_id and deleted_at is null
  ) then
    raise exception 'Category does not belong to the authenticated owner' using errcode = '23503';
  end if;

  insert into public.transactions (
    user_id,
    direction,
    account_id,
    category_id,
    description,
    amount_minor,
    currency,
    occurred_at,
    status,
    source,
    source_bank,
    external_ref,
    confidence
  ) values (
    owner_id,
    resolved_direction,
    target_account_id,
    target_category_id,
    btrim(resolved_description),
    resolved_amount_minor,
    upper(resolved_currency),
    resolved_occurred_at,
    'confirmed',
    'email',
    'gmail',
    candidate_record.source_ref_hash,
    candidate_record.confidence
  )
  returning id into transaction_record_id;

  update public.finance_email_candidates
  set status = 'approved', transaction_id = transaction_record_id
  where id = candidate_record.id;

  return transaction_record_id;
end;
$$;

revoke all on function public.approve_finance_email_candidate(uuid, uuid, uuid, text, text, bigint, text, timestamptz) from public, anon;
grant execute on function public.approve_finance_email_candidate(uuid, uuid, uuid, text, text, bigint, text, timestamptz) to authenticated;
