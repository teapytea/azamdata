import { FULL, requirePage } from "@/lib/auth";
import { query } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { RecipeView } from "./view";

export default async function RecipePage() {
  await requirePage(FULL);
  const [products, items, materials, settings] = await Promise.all([
    query("select id, sku, name, type, origin, price, price_takeaway, mode, yield_ml, serving_ml, sop, active from products order by active desc, name"),
    query("select r.product_id, r.material_id, r.qty, m.name, m.unit, m.unit_cost, m.stock from recipe_items r join materials m on m.id = r.material_id order by r.qty * m.unit_cost desc"),
    query("select id, name, unit, unit_cost, stock, code from materials where active order by category, name"),
    getSettings(),
  ]);
  const cup = materials.find((m) => m.code === "cup");
  const sugar = materials.find((m) => m.code === "sugar");
  const extras = (cup?.unit_cost ?? 0) + settings.sugar_normal_ml * (sugar?.unit_cost ?? 0);
  return <RecipeView products={products as never} items={items as never} materials={materials as never} extras={extras} marginTarget={settings.margin_target} />;
}
