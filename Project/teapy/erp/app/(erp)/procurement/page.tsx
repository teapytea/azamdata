import { FULL, requirePage } from "@/lib/auth";
import { query } from "@/lib/db";
import { ProcurementView } from "./view";

export default async function ProcurementPage({ searchParams }: { searchParams: Promise<{ material?: string; qty?: string }> }) {
  await requirePage(FULL);
  const params = await searchParams;
  const [orders, suppliers, materials] = await Promise.all([
    query(`select o.*, s.name as supplier, s.location, m.name as material, m.unit, m.sku from purchase_orders o
           join suppliers s on s.id = o.supplier_id join materials m on m.id = o.material_id order by o.ordered_at desc`),
    query("select * from suppliers where active order by name"),
    query("select id, name, unit, stock, min_stock, unit_cost from materials where active order by name"),
  ]);
  return <ProcurementView orders={orders as never} suppliers={suppliers as never} materials={materials as never} presetMaterial={params.material} presetQty={params.qty} />;
}
