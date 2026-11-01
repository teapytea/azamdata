create index finance_receipt_drafts_raw_ingest_idx
  on public.finance_receipt_drafts (raw_ingest_id);
create index finance_receipt_drafts_attachment_idx
  on public.finance_receipt_drafts (attachment_id);
create index finance_receipt_drafts_transaction_idx
  on public.finance_receipt_drafts (transaction_id)
  where transaction_id is not null;
