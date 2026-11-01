import { redirect } from "next/navigation";
import { currentUser, homeFor } from "@/lib/auth";
import { query, one } from "@/lib/db";
import { getSettings, publicSettings } from "@/lib/settings";
import { PosView } from "./view";

export const dynamic = "force-dynamic";

export default async function PosPage() {
  const user = await currentUser();
  if (!user) redirect("/pos/login");
  if (!["owner", "admin", "cashier"].includes(user.role) && !user.pos_access) redirect(homeFor(user.role));
  const [products, register, held, history, settings, stock, promos] = await Promise.all([
    query(`select p.id, p.name, p.type, p.origin, p.price, p.price_takeaway, p.mode, p.serving_ml, p.image, p.sku,
             (select coalesce(floor(min(m.stock / r.qty)), 0)::int from recipe_items r join materials m on m.id = r.material_id where r.product_id = p.id) as direct_portions,
             coalesce(sum(b.remaining_ml) filter (where b.labeled_at is not null and b.drained_at is null and b.expires_at > now()), 0)::float8 as ready_ml,
             coalesce(sum(b.remaining_ml) filter (where b.labeled_at is null and b.drained_at is null and b.expires_at > now()), 0)::float8 as unlabeled_ml
           from products p left join batches b on b.product_id = p.id where p.active group by p.id order by p.name`),
    one("select id, opened_at, opening_cash from registers where user_id=$1 and closed_at is null", [user.id]),
    query("select id, label, data, created_at from held_orders order by created_at"),
    query(`select s.id, s.number, s.at, s.total, s.payment, s.status, s.order_type, s.table_no, s.customer_name, s.cashier
           from sales s where s.at > now() - interval '3 days' order by s.at desc limit 100`),
    getSettings(),
    query("select code, stock from materials where code in ('cup','sugar','jelly','curd')"),
    query("select c.code, c.percent, c.active, (select count(*)::int from sales s where s.promo_code = c.code and s.status = 'Selesai') as used from promo_codes c order by c.active desc, c.code"),
  ]);
  return <PosView user={{ id: user.id, name: user.name, role: user.role }} products={products as never} register={register as never} held={held as never}
    history={history as never} settings={publicSettings(settings)} stock={Object.fromEntries(stock.map((s) => [s.code, s.stock]))} promos={promos as never} />;
}
