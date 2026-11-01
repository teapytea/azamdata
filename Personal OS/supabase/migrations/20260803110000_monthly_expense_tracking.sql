create table public.monthly_expense_targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month_start date not null check (month_start = date_trunc('month', month_start)::date),
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null default 'IDR' check (currency ~ '^[A-Z]{3}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, month_start)
);

create trigger set_monthly_expense_targets_updated_at
  before update on public.monthly_expense_targets
  for each row execute function public.set_updated_at();

alter table public.monthly_expense_targets enable row level security;
create policy "Users manage their own monthly expense targets"
  on public.monthly_expense_targets
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
revoke all on public.monthly_expense_targets from anon;
grant select, insert, update, delete on public.monthly_expense_targets to authenticated;

create or replace function public.set_monthly_expense_target(
  target_month date,
  target_amount_minor bigint,
  target_currency text default 'IDR'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  normalized_month date := date_trunc('month', target_month)::date;
  target_id uuid;
begin
  if owner_id is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if normalized_month < date '2026-01-01' then raise exception 'Expense tracking starts on 1 January 2026' using errcode = '22023'; end if;
  if target_amount_minor is null or target_amount_minor <= 0 then raise exception 'Target must be greater than zero' using errcode = '22023'; end if;
  if target_currency is null or upper(target_currency) !~ '^[A-Z]{3}$' then raise exception 'Invalid currency' using errcode = '22023'; end if;

  insert into public.monthly_expense_targets (user_id, month_start, amount_minor, currency)
  values (owner_id, normalized_month, target_amount_minor, upper(target_currency))
  on conflict (user_id, month_start) do update
  set amount_minor = excluded.amount_minor, currency = excluded.currency, deleted_at = null
  returning id into target_id;
  return target_id;
end;
$$;

revoke all on function public.set_monthly_expense_target(date, bigint, text) from public, anon;
grant execute on function public.set_monthly_expense_target(date, bigint, text) to authenticated;

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
  if matched_merchant.id is not null then
    new.merchant_id := matched_merchant.id;
    new.category_id := matched_merchant.default_category_id;
  end if;
  return new;
end;
$$;

create trigger transactions_apply_default_merchant_category
  before insert or update of description, direction, user_id on public.transactions
  for each row execute function public.apply_default_merchant_category();

create or replace function public.categorize_finance_expense(
  target_transaction_id uuid,
  target_category_id uuid,
  remember_merchant boolean default true
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  expense public.transactions%rowtype;
  remembered_merchant_id uuid;
begin
  if owner_id is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  select * into expense from public.transactions
  where id = target_transaction_id and user_id = owner_id and direction = 'debit' and deleted_at is null
  for update;
  if expense.id is null then raise exception 'Expense was not found' using errcode = 'P0002'; end if;
  if not exists (
    select 1 from public.categories
    where id = target_category_id and user_id = owner_id and category_type = 'expense' and deleted_at is null
  ) then raise exception 'Expense category was not found' using errcode = '23503'; end if;

  if remember_merchant then
    insert into public.merchants (user_id, name, default_category_id)
    values (owner_id, btrim(expense.description), target_category_id)
    on conflict (user_id, name) do update
    set default_category_id = excluded.default_category_id, deleted_at = null
    returning id into remembered_merchant_id;

    update public.transactions
    set category_id = target_category_id, merchant_id = remembered_merchant_id
    where user_id = owner_id
      and direction = 'debit'
      and deleted_at is null
      and lower(btrim(description)) = lower(btrim(expense.description));
  else
    update public.transactions set category_id = target_category_id
    where id = expense.id;
  end if;
end;
$$;

revoke all on function public.categorize_finance_expense(uuid, uuid, boolean) from public, anon;
grant execute on function public.categorize_finance_expense(uuid, uuid, boolean) to authenticated;
revoke all on function public.apply_default_merchant_category() from public;
