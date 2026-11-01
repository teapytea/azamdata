import { FULL, requirePage } from "@/lib/auth";
import { query } from "@/lib/db";
import { addDays, todayWIB } from "@/lib/format";
import { SalesView } from "./view";

const WIB = "at time zone 'Asia/Jakarta'";

export default async function SalesPage() {
  await requirePage(FULL);
  const today = todayWIB();
  const [sales, lines, registers] = await Promise.all([
    query(`select id, number, at, order_type, table_no, customer_name, subtotal, total, cogs, payment, reference, status, cashier, void_reason from sales where (at ${WIB})::date >= $1 order by at desc limit 1000`, [addDays(today, -30)]),
    query(`select l.sale_id, l.name, l.qty, l.sugar, l.topping, l.gross, l.cogs, l.serving_ml, p.type, (s.at ${WIB})::date::text as date, extract(hour from (s.at ${WIB}))::int as hour
           from sale_lines l join sales s on s.id=l.sale_id join products p on p.id=l.product_id where s.status='Selesai' and (s.at ${WIB})::date >= $1`, [addDays(today, -30)]),
    query("select id, cashier, opened_at, opening_cash, closed_at, closing_cash, expected_cash, note from registers order by opened_at desc limit 20"),
  ]);
  return <SalesView today={today} sales={sales as never} lines={lines as never} registers={registers as never} />;
}
