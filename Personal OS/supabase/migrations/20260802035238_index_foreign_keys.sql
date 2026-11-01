create index attachments_transaction_idx
  on public.attachments (transaction_id)
  where transaction_id is not null and deleted_at is null;

create index merchants_default_category_idx
  on public.merchants (default_category_id)
  where default_category_id is not null and deleted_at is null;

create index note_tags_user_idx
  on public.note_tags (user_id)
  where deleted_at is null;

create index payment_methods_account_idx
  on public.payment_methods (account_id)
  where account_id is not null and deleted_at is null;

create index quota_snapshots_user_idx
  on public.quota_snapshots (user_id)
  where deleted_at is null;

create index subscription_payments_transaction_idx
  on public.subscription_payments (transaction_id)
  where transaction_id is not null and deleted_at is null;

create index subscription_payments_user_idx
  on public.subscription_payments (user_id)
  where deleted_at is null;

create index subscriptions_payment_method_idx
  on public.subscriptions (payment_method_id)
  where payment_method_id is not null and deleted_at is null;

create index subscriptions_service_account_idx
  on public.subscriptions (service_account_id)
  where service_account_id is not null and deleted_at is null;

create index transactions_category_idx
  on public.transactions (category_id)
  where category_id is not null and deleted_at is null;

create index transactions_counterpart_account_idx
  on public.transactions (counterpart_account_id)
  where counterpart_account_id is not null and deleted_at is null;

create index transactions_merchant_idx
  on public.transactions (merchant_id)
  where merchant_id is not null and deleted_at is null;

create index transactions_raw_ingest_idx
  on public.transactions (raw_ingest_id)
  where raw_ingest_id is not null and deleted_at is null;

create index usage_events_provider_idx
  on public.usage_events (provider_id)
  where deleted_at is null;
