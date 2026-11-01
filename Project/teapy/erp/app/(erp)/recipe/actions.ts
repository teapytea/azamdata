"use server";

import { guarded, num, req, str } from "@/lib/action";
import { FULL } from "@/lib/auth";
import { tx } from "@/lib/db";

export type RecipeInput = {
  id?: string; name: string; sku: string; type: string; origin: string; price: string; price_takeaway?: string; mode?: string; yield_ml?: string; serving_ml?: string;
  temp: string; time: string; ratio: string; agitation: string; items: { material_id: string; qty: number }[];
};

export async function saveRecipe(input: RecipeInput) {
  return guarded(FULL, async (user) => {
    const items = (input.items || []).filter((i) => i.material_id && Number(i.qty) > 0);
    if (!items.length) throw new Error("Tambahkan minimal satu bahan pada resep.");
    if (new Set(items.map((i) => i.material_id)).size !== items.length) throw new Error("Ada bahan yang dipilih dua kali.");
    const sop = { temp: str(input.temp, 40), time: str(input.time, 40), ratio: str(input.ratio, 40), agitation: str(input.agitation, 60) };
    const direct = input.mode === "direct";
    const takeaway = str(input.price_takeaway) ? num(input.price_takeaway, "Harga takeaway", 1) : null;
    const values = [req(input.name, "Nama resep", 120), req(input.sku, "SKU", 40).toUpperCase(), req(input.type, "Kategori", 40), str(input.origin, 80),
      num(input.price, "Harga jual", 1), direct ? 1 : num(input.yield_ml, "Hasil batch", 1), direct ? 1 : num(input.serving_ml, "Porsi per cup", 1), JSON.stringify(sop), takeaway, direct ? "direct" : "batch"];
    await tx(async (q) => {
      const id = input.id
        ? (await q<{ id: string }>("update products set name=$2, sku=$3, type=$4, origin=$5, price=$6, yield_ml=$7, serving_ml=$8, sop=$9::jsonb, price_takeaway=$10, mode=$11 where id=$1 returning id", [input.id, ...values]))[0].id
        : (await q<{ id: string }>("insert into products (code, name, sku, type, origin, price, yield_ml, serving_ml, sop, price_takeaway, mode) values ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11) returning id", [crypto.randomUUID(), ...values]))[0].id;
      await q("delete from recipe_items where product_id=$1", [id]);
      for (const i of items) await q("insert into recipe_items (product_id, material_id, qty) values ($1,$2,$3)", [id, i.material_id, Number(i.qty)]);
      await q("insert into activity (title, detail, actor) values ($1,$2,$3)", [input.id ? "Resep diperbarui" : "Resep baru dibuat", input.name, user.name]);
    });
  });
}

export async function toggleProduct(input: { id: string; active: boolean }) {
  return guarded(FULL, async () => {
    await tx((q) => q("update products set active=$2 where id=$1", [input.id, input.active]));
  });
}
