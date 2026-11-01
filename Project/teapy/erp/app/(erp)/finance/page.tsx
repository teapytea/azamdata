import { FULL, requirePage } from "@/lib/auth";
import { query } from "@/lib/db";
import { monthRange, todayWIB } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { FinanceView } from "./view";

const WIB = "at time zone 'Asia/Jakarta'";

export default async function FinancePage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  await requirePage(FULL);
  const month = /^\d{4}-\d{2}$/.test((await searchParams).month || "") ? (await searchParams).month! : todayWIB().slice(0, 7);
  const { from, to } = monthRange(month + "-01");
  const [sales, categories, methods, expenses, waste, unpaidPo, unpaidShifts, recon, settings] = await Promise.all([
    query(`select coalesce(sum(subtotal),0)::float8 as gross, coalesce(sum(discount + member_discount + redeem_value),0)::float8 as discount, coalesce(sum(channel_fee),0)::float8 as fee,
             coalesce(sum(service),0)::float8 as service, coalesce(sum(tax),0)::float8 as tax, coalesce(sum(rounding),0)::float8 as rounding, coalesce(sum(cogs),0)::float8 as cogs, coalesce(sum(total),0)::float8 as total, count(*)::int as n
           from sales where status='Selesai' and (at ${WIB})::date >= $1 and (at ${WIB})::date < $2`, [from, to]),
    query(`select p.type, sum(l.qty)::int as qty, sum(l.gross)::float8 as gross, sum(l.cogs)::float8 as cogs from sale_lines l join sales s on s.id=l.sale_id join products p on p.id=l.product_id
           where s.status='Selesai' and (s.at ${WIB})::date >= $1 and (s.at ${WIB})::date < $2 group by p.type order by 3 desc`, [from, to]),
    query(`select payment, coalesce(sum(total),0)::float8 as total, count(*)::int as n from sales where status='Selesai' and (at ${WIB})::date >= $1 and (at ${WIB})::date < $2 group by payment order by 2 desc`, [from, to]),
    query(`select id, at, category, note, amount, source, ref from expenses where (at ${WIB})::date >= $1 and (at ${WIB})::date < $2 order by at desc`, [from, to]),
    query(`select coalesce(sum(cost),0)::float8 as cost from waste_log where (at ${WIB})::date >= $1 and (at ${WIB})::date < $2`, [from, to]),
    query("select coalesce(sum(total),0)::float8 as total, count(*)::int as n from purchase_orders where status <> 'Dibatalkan' and payment <> 'Lunas'"),
    query("select coalesce(sum(rate),0)::float8 as total, count(*)::int as n from shifts where status='Selesai' and paid_at is null"),
    query("select id, date, method, system_amount, actual_amount, note, actor from reconciliations where date >= $1 and date < $2 order by date desc, created_at desc", [from, to]),
    getSettings(),
  ]);
  return <FinanceView month={month} sales={sales[0] as never} categories={categories as never} methods={methods as never} expenses={expenses as never} waste={waste[0].cost}
    unpaidPo={unpaidPo[0] as never} unpaidShifts={unpaidShifts[0] as never} recon={recon as never} taxLabel={settings.tax_label} target={settings.margin_target} />;
}
