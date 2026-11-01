alter table public.finance_email_candidates drop constraint finance_email_candidates_direction_check;
alter table public.finance_email_candidates
  add constraint finance_email_candidates_direction_check
  check (direction is null or direction in ('debit', 'credit', 'transfer'));

drop function if exists public.approve_finance_email_candidate(uuid, uuid, uuid, text, text, bigint, text, timestamptz);

create or replace function public.approve_finance_email_candidate(
  candidate_id uuid,
  target_account_id uuid,
  target_counterpart_account_id uuid,
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
  counterpart_currency text;
begin
  if owner_id is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if resolved_direction not in ('debit', 'credit', 'transfer') then raise exception 'Invalid direction' using errcode = '22023'; end if;
  if resolved_amount_minor is null or resolved_amount_minor <= 0 then raise exception 'Amount must be greater than zero' using errcode = '22023'; end if;
  if resolved_currency is null or upper(resolved_currency) !~ '^[A-Z]{3}$' then raise exception 'Invalid currency' using errcode = '22023'; end if;
  if nullif(btrim(resolved_description), '') is null then raise exception 'Description is required' using errcode = '22023'; end if;

  select * into candidate_record
  from public.finance_email_candidates
  where id = candidate_id and user_id = owner_id and status = 'pending' and deleted_at is null
  for update;
  if candidate_record.id is null then raise exception 'Candidate was not found or was already reviewed' using errcode = 'P0002'; end if;

  select currency into account_currency from public.accounts
  where id = target_account_id and user_id = owner_id and deleted_at is null;
  if account_currency is null then raise exception 'Account does not belong to the authenticated owner' using errcode = '23503'; end if;
  if upper(resolved_currency) <> account_currency then raise exception 'Transaction currency must match the selected account currency' using errcode = '22023'; end if;

  if resolved_direction = 'transfer' then
    select currency into counterpart_currency from public.accounts
    where id = target_counterpart_account_id and user_id = owner_id and deleted_at is null;
    if counterpart_currency is null or counterpart_currency <> account_currency or target_counterpart_account_id = target_account_id then
      raise exception 'A different counterpart account with matching currency is required' using errcode = '23503';
    end if;
  elsif target_counterpart_account_id is not null then
    raise exception 'Counterpart account is only valid for transfers' using errcode = '22023';
  end if;

  if target_category_id is not null and not exists (
    select 1 from public.categories where id = target_category_id and user_id = owner_id and deleted_at is null
  ) then raise exception 'Category does not belong to the authenticated owner' using errcode = '23503'; end if;

  insert into public.transactions (
    user_id, direction, account_id, counterpart_account_id, category_id, description,
    amount_minor, currency, occurred_at, status, source, source_bank, external_ref, confidence, raw_ingest_id
  ) values (
    owner_id, resolved_direction, target_account_id,
    case when resolved_direction = 'transfer' then target_counterpart_account_id else null end,
    case when resolved_direction = 'transfer' then null else target_category_id end,
    btrim(resolved_description), resolved_amount_minor, upper(resolved_currency), resolved_occurred_at,
    'confirmed', 'email', coalesce(candidate_record.metadata->>'bank', 'gmail'), candidate_record.source_ref_hash, candidate_record.confidence, candidate_record.raw_ingest_id
  ) returning id into transaction_record_id;

  update public.finance_email_candidates set status = 'approved', transaction_id = transaction_record_id
  where id = candidate_record.id;
  return transaction_record_id;
end;
$$;

revoke all on function public.approve_finance_email_candidate(uuid, uuid, uuid, uuid, text, text, bigint, text, timestamptz) from public, anon;
grant execute on function public.approve_finance_email_candidate(uuid, uuid, uuid, uuid, text, text, bigint, text, timestamptz) to authenticated;

create or replace function public.record_parsed_email_transaction(
  owner_id uuid,
  source_account_id uuid,
  counterpart_account_id uuid,
  transaction_direction text,
  transaction_description text,
  transaction_amount_minor bigint,
  transaction_currency text,
  transaction_occurred_at timestamptz,
  transaction_source_bank text,
  transaction_external_ref text,
  transaction_confidence numeric,
  source_raw_ingest_id uuid,
  fee_amount_minor bigint default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  transaction_id uuid;
  source_currency text;
  counterpart_currency text;
begin
  if transaction_direction not in ('debit', 'credit', 'transfer') then raise exception 'Invalid direction' using errcode = '22023'; end if;
  if transaction_amount_minor is null or transaction_amount_minor <= 0 then raise exception 'Amount must be greater than zero' using errcode = '22023'; end if;
  if transaction_currency is null or upper(transaction_currency) !~ '^[A-Z]{3}$' then raise exception 'Invalid currency' using errcode = '22023'; end if;
  if nullif(btrim(transaction_description), '') is null then raise exception 'Description is required' using errcode = '22023'; end if;
  if transaction_direction = 'transfer' and counterpart_account_id is null then raise exception 'Counterpart account required' using errcode = '22023'; end if;
  if transaction_direction <> 'transfer' and counterpart_account_id is not null then raise exception 'Counterpart account is only valid for transfers' using errcode = '22023'; end if;
  if coalesce(fee_amount_minor, 0) < 0 then raise exception 'Fee cannot be negative' using errcode = '22023'; end if;
  select currency into source_currency from public.accounts where id = source_account_id and user_id = owner_id and deleted_at is null;
  if source_currency is null then raise exception 'Invalid source account' using errcode = '23503'; end if;
  if source_currency <> upper(transaction_currency) then raise exception 'Transaction currency must match source account' using errcode = '22023'; end if;
  if counterpart_account_id is not null then
    select currency into counterpart_currency from public.accounts where id = counterpart_account_id and user_id = owner_id and deleted_at is null;
    if counterpart_currency is null or counterpart_currency <> source_currency or counterpart_account_id = source_account_id then
      raise exception 'A different counterpart account with matching currency is required' using errcode = '23503';
    end if;
  end if;
  if not exists (select 1 from public.raw_ingests where id = source_raw_ingest_id and user_id = owner_id and deleted_at is null) then raise exception 'Invalid raw ingest' using errcode = '23503'; end if;

  insert into public.transactions (
    user_id, direction, account_id, counterpart_account_id, description, amount_minor, currency,
    occurred_at, status, source, source_bank, external_ref, confidence, raw_ingest_id
  ) values (
    owner_id, transaction_direction, source_account_id, counterpart_account_id,
    btrim(transaction_description), transaction_amount_minor, upper(transaction_currency), transaction_occurred_at,
    'confirmed', 'email', transaction_source_bank, transaction_external_ref, transaction_confidence, source_raw_ingest_id
  ) returning id into transaction_id;

  if coalesce(fee_amount_minor, 0) > 0 then
    insert into public.transactions (
      user_id, direction, account_id, description, amount_minor, currency, occurred_at,
      status, source, source_bank, external_ref, confidence, raw_ingest_id
    ) values (
      owner_id, 'debit', source_account_id, btrim(transaction_description) || ' admin fee', fee_amount_minor,
      upper(transaction_currency), transaction_occurred_at, 'confirmed', 'email', transaction_source_bank,
      transaction_external_ref || ':fee', transaction_confidence, source_raw_ingest_id
    );
  end if;
  return transaction_id;
end;
$$;

revoke all on function public.record_parsed_email_transaction(uuid, uuid, uuid, text, text, bigint, text, timestamptz, text, text, numeric, uuid, bigint) from public, anon, authenticated;
grant execute on function public.record_parsed_email_transaction(uuid, uuid, uuid, text, text, bigint, text, timestamptz, text, text, numeric, uuid, bigint) to service_role;

update public.finance_email_candidates candidate
set
  direction = case
    when upper(raw.raw_payload->>'body_text') ~ '(GOPAY TOPUP|PT DOMPET ANAK BANGSA|SHOPEEPAY|PT AIRPAY INTERNATIONAL|DANA TOPUP)' then 'transfer'
    else 'debit'
  end,
  metadata = candidate.metadata || jsonb_build_object(
    'reason', case
      when upper(raw.raw_payload->>'body_text') ~ '(GOPAY TOPUP|PT DOMPET ANAK BANGSA)' then 'Confirm transfer from BCA to GoPay'
      when upper(raw.raw_payload->>'body_text') ~ '(SHOPEEPAY|PT AIRPAY INTERNATIONAL)' then 'Confirm transfer from BCA to ShopeePay'
      when upper(raw.raw_payload->>'body_text') ~ 'DANA TOPUP' then 'Confirm transfer from BCA to DANA'
      else 'Confirm category for outgoing BCA transfer'
    end,
    'counterpart_account_name', case
      when upper(raw.raw_payload->>'body_text') ~ '(GOPAY TOPUP|PT DOMPET ANAK BANGSA)' then 'GoPay'
      when upper(raw.raw_payload->>'body_text') ~ '(SHOPEEPAY|PT AIRPAY INTERNATIONAL)' then 'ShopeePay'
      when upper(raw.raw_payload->>'body_text') ~ 'DANA TOPUP' then 'DANA'
      else null
    end
  )
from public.raw_ingests raw
where candidate.raw_ingest_id = raw.id
  and candidate.status = 'pending'
  and candidate.direction is null
  and candidate.metadata->>'bank' = 'BCA';

update public.transactions transaction
set description = btrim((regexp_match(raw.raw_payload->>'body_text', '(?im)^Pembayaran Ke\s*:\s*([^\r\n]+)'))[1])
from public.raw_ingests raw
where transaction.raw_ingest_id = raw.id
  and transaction.source = 'email'
  and transaction.description ~* '^PAN\s*:'
  and raw.raw_payload->>'body_text' ~* '(?im)^Pembayaran Ke\s*:';
