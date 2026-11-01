-- Keep the Finance dashboard lightweight while categorizing all confirmed expenses.

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
    when normalized_description ~ '(coffee|coffe|cafe|kopi|koffie|restaurant|resto|warung|warkop|ayam|chicken|bebek|bakso|mie|noodle|martabak|geprek|sushi|tea|juice|food|mcd|kfc|hokben|solaria|pizza|burger|bread|bakery|donut|jco|starbucks|grabfood|gofood|siomay|batagor|gudeg|sate|kitchen|catering|seafood|steak|dapur|kantin|boga|snack|roti|susu|milk|buah|fruit|crispy|drink|bento)' then 'Makanan & Minuman'
    when normalized_description ~ '(grab|gojek|gocar|goride|maxim|bluebird|taxi|kai|kereta|toll|tol |parkir|parking|pertamina|shell|spbu|travel|trans jogja|transjakarta|smartcard|airport|bandara|pelabuhan|bus |terminal|motor|bensin)' then 'Transportasi'
    when normalized_description ~ '(pln|pdam|telkom|indihome|biznet|smartfren|telkomsel|indosat|xl |axis|tri |three |hostinger|idwebhost|domain|hosting|google|apple|netflix|spotify|canva|adobe|openai|chatgpt|anthropic|claude|figma|subscription|langganan|insurance|asuransi|bpjs|token listrik|pulsa|internet|wifi|electric|water bill)' then 'Tagihan'
    when normalized_description ~ '(shopee|tokopedia|lazada|blibli|alfamart|indomaret|superindo|hypermart|minimarket|sembako|mirota|shop|store|market|mart |mall|uniqlo|ikea|ace hardware|mr[.]? diy|guardian|watsons|pharmacy|apotek|kimia farma|toko|grocery|swalayan|agro|diamondfair|fashion|computer|electronic|gramedia|stationery)' then 'Belanja'
    else 'Lainnya'
  end;

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

-- Backfill every confirmed expense in the supported tracking period. Unknown merchants
-- intentionally fall back to Lainnya so the review queue only contains true transaction ambiguity.
update public.transactions transaction
set category_id = public.infer_finance_category(transaction.user_id, transaction.description)
where transaction.deleted_at is null
  and transaction.direction = 'debit'
  and transaction.category_id is null
  and transaction.occurred_at >= timestamptz '2025-12-31 17:00:00+00';

create or replace function public.get_finance_overview(target_month text)
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  owner_id uuid := auth.uid();
  month_date date;
  month_start timestamptz;
  month_end timestamptz;
  result jsonb;
begin
  if owner_id is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if target_month !~ '^20[0-9]{2}-(0[1-9]|1[0-2])$' then
    raise exception 'Month must use YYYY-MM format' using errcode = '22023';
  end if;

  month_date := to_date(target_month || '-01', 'YYYY-MM-DD');
  month_start := month_date::timestamp at time zone 'Asia/Jakarta';
  month_end := (month_date + interval '1 month')::timestamp at time zone 'Asia/Jakarta';

  with month_expenses as (
    select transaction.*
    from public.transactions transaction
    where transaction.user_id = owner_id
      and transaction.deleted_at is null
      and transaction.direction = 'debit'
      and transaction.status in ('confirmed', 'reconciled')
      and transaction.occurred_at >= month_start
      and transaction.occurred_at < month_end
  ), category_totals as (
    select coalesce(category.name, 'Uncategorized') as name,
      coalesce(category.icon, 'category') as icon,
      sum(expense.amount_minor)::bigint as amount_minor
    from month_expenses expense
    left join public.categories category on category.id = expense.category_id
    group by coalesce(category.name, 'Uncategorized'), coalesce(category.icon, 'category')
  ), account_totals as (
    select coalesce(account.name, 'Unknown source') as name,
      sum(expense.amount_minor)::bigint as amount_minor
    from month_expenses expense
    left join public.accounts account on account.id = expense.account_id
    group by coalesce(account.name, 'Unknown source')
  ), trend_months as (
    select generate_series(date '2026-01-01', month_date, interval '1 month')::date as month
  ), trend_totals as (
    select trend.month,
      coalesce(sum(transaction.amount_minor), 0)::bigint as amount_minor
    from trend_months trend
    left join public.transactions transaction
      on transaction.user_id = owner_id
      and transaction.deleted_at is null
      and transaction.direction = 'debit'
      and transaction.status in ('confirmed', 'reconciled')
      and transaction.occurred_at >= trend.month::timestamp at time zone 'Asia/Jakarta'
      and transaction.occurred_at < (trend.month + interval '1 month')::timestamp at time zone 'Asia/Jakarta'
    group by trend.month
    order by trend.month
  )
  select jsonb_build_object(
    'monthSpentMinor', coalesce((select sum(amount_minor) from month_expenses), 0),
    'monthRecordCount', (select count(*) from month_expenses),
    'categorySpending', coalesce((select jsonb_agg(jsonb_build_object('name', name, 'icon', icon, 'amountMinor', amount_minor) order by amount_minor desc) from category_totals), '[]'::jsonb),
    'accountSpending', coalesce((select jsonb_agg(jsonb_build_object('name', name, 'amountMinor', amount_minor) order by amount_minor desc) from account_totals), '[]'::jsonb),
    'monthlyTrend', coalesce((select jsonb_agg(jsonb_build_object('month', to_char(month, 'YYYY-MM'), 'amountMinor', amount_minor) order by month) from trend_totals), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.get_finance_overview(text) from public, anon;
grant execute on function public.get_finance_overview(text) to authenticated;

create index if not exists transactions_finance_history_idx
  on public.transactions (user_id, occurred_at desc)
  where deleted_at is null and direction = 'debit' and status in ('confirmed', 'reconciled');

create index if not exists transactions_finance_uncategorized_idx
  on public.transactions (user_id, occurred_at desc)
  where deleted_at is null and direction = 'debit' and category_id is null;
