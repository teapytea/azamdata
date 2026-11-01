import { FULL, requirePage } from "@/lib/auth";
import { query } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { BrewingView } from "./view";

export default async function BrewingPage() {
  await requirePage(FULL);
  const [batches, products, waste, settings] = await Promise.all([
    query(`select b.id, b.code, b.made_on, b.made_at, b.expires_at, b.initial_ml, b.remaining_ml, b.cost_per_ml, b.operator, b.labeled_at, b.labeled_by, b.drained_at,
             p.name, p.origin, p.serving_ml from batches b join products p on p.id = b.product_id order by b.made_at desc limit 200`),
    query("select id, name, yield_ml from products where active and mode='batch' order by name"),
    query("select id, at, item, qty, unit, cost, reason, actor from waste_log order by at desc limit 50"),
    getSettings(),
  ]);
  return <BrewingView batches={batches as never} products={products as never} waste={waste as never} expiryHours={settings.batch_expiry_hours} />;
}
