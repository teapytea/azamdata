with eligible as (
  select
    candidate.id as candidate_id,
    candidate.user_id,
    candidate.raw_ingest_id,
    candidate.source_ref_hash,
    candidate.merchant_name,
    candidate.amount_minor,
    candidate.currency,
    candidate.occurred_at,
    candidate.confidence,
    account.id as account_id
  from public.finance_email_candidates candidate
  join public.raw_ingests raw
    on raw.id = candidate.raw_ingest_id
   and raw.user_id = candidate.user_id
   and raw.deleted_at is null
  join public.accounts account
    on account.user_id = candidate.user_id
   and lower(account.name) = 'bca'
   and account.deleted_at is null
  where candidate.status = 'pending'
    and candidate.deleted_at is null
    and candidate.direction is null
    and candidate.amount_minor > 0
    and candidate.currency = account.currency
    and candidate.occurred_at is not null
    and raw.raw_payload->>'body_text' ~* '(?im)^Jenis Transaksi\s*:\s*Transfer QRIS\s*$'
), inserted as (
  insert into public.transactions (
    user_id, direction, account_id, description, amount_minor, currency, occurred_at,
    status, source, source_bank, external_ref, confidence, raw_ingest_id
  )
  select
    user_id, 'debit', account_id, merchant_name, amount_minor, currency, occurred_at,
    'confirmed', 'email', 'BCA', source_ref_hash, confidence, raw_ingest_id
  from eligible
  on conflict (user_id, source_bank, external_ref) where source_bank is not null and external_ref is not null and deleted_at is null
  do nothing
  returning id, raw_ingest_id
), approved as (
  update public.finance_email_candidates candidate
  set status = 'approved', direction = 'debit', transaction_id = inserted.id,
      metadata = candidate.metadata || jsonb_build_object('reason', 'Automatically recognized as outgoing BCA Transfer QRIS')
  from inserted
  where candidate.raw_ingest_id = inserted.raw_ingest_id
    and candidate.status = 'pending'
  returning candidate.raw_ingest_id
)
update public.raw_ingests raw
set process_status = 'processed', error_message = null, processed_at = now()
from approved
where raw.id = approved.raw_ingest_id;

update public.finance_email_candidates candidate
set direction = 'debit',
    metadata = candidate.metadata || jsonb_build_object('reason', 'Confirm category for outgoing BCA Transfer QRIS')
from public.raw_ingests raw
where candidate.raw_ingest_id = raw.id
  and candidate.status = 'pending'
  and candidate.direction is null
  and candidate.deleted_at is null
  and raw.deleted_at is null
  and raw.raw_payload->>'body_text' ~* '(?im)^Jenis Transaksi\s*:\s*Transfer QRIS\s*$';
