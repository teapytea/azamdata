import { FULL, requirePage } from "@/lib/auth";
import { query } from "@/lib/db";
import { InventoryView } from "./view";

export default async function InventoryPage() {
  await requirePage(FULL);
  const [materials, moves, expired, lastAudit] = await Promise.all([
    query("select * from materials where active order by category, name"),
    query(`select s.id, s.at, s.delta, s.kind, s.ref, s.note, s.actor, m.name, m.unit from stock_moves s join materials m on m.id = s.material_id order by s.at desc limit 12`),
    query("select count(*)::int as n from batches where remaining_ml > 0 and drained_at is null and expires_at < now()"),
    query("select at, title, detail, actor from activity where title = 'Audit stok fisik' order by at desc limit 1"),
  ]);
  return <InventoryView materials={materials as never} moves={moves as never} expired={expired[0].n} lastAudit={lastAudit[0] as never} />;
}
