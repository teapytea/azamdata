"use server";

import { guarded, num, req, str } from "@/lib/action";
import { FULL, log } from "@/lib/auth";
import { query, tx } from "@/lib/db";
import { moveStock } from "@/lib/domain";

export async function saveMaterial(input: Record<string, string>) {
  return guarded(FULL, async (user) => {
    const name = req(input.name, "Nama bahan", 120);
    const values = [req(input.sku, "SKU", 40).toUpperCase(), name, req(input.category, "Kategori", 40), req(input.unit, "Satuan", 10),
      num(input.min_stock, "Batas minimum"), num(input.unit_cost, "Harga per satuan"), str(input.note, 200)];
    if (input.id) {
      await query("update materials set sku=$2, name=$3, category=$4, unit=$5, min_stock=$6, unit_cost=$7, note=$8 where id=$1", [input.id, ...values]);
      await log("Bahan diperbarui", name, user.name);
    } else {
      const stock = num(input.stock || 0, "Stok awal");
      await tx(async (q) => {
        const [m] = await q<{ id: string }>(
          "insert into materials (code, sku, name, category, unit, min_stock, unit_cost, note) values ($1,$2,$3,$4,$5,$6,$7,$8) returning id",
          [crypto.randomUUID(), ...values]);
        if (stock > 0) await moveStock(q, m.id, stock, "Stok awal", "", "Input bahan baru", user.name);
      });
      await log("Bahan baru ditambahkan", name, user.name);
    }
  });
}

/** Opname fisik: stok disamakan dengan hitungan. Selisih kurang masuk waste. */
export async function auditStock(input: Record<string, string>) {
  return guarded(FULL, async (user) => {
    const actual = num(input.actual, "Stok fisik");
    const note = str(input.note, 200);
    await tx(async (q) => {
      const [m] = await q<{ id: string; name: string; unit: string; stock: number; unit_cost: number }>(
        "select id, name, unit, stock, unit_cost from materials where id=$1 for update", [input.id]);
      if (!m) throw new Error("Bahan tidak ditemukan.");
      const diff = actual - m.stock;
      if (diff !== 0) await moveStock(q, m.id, diff, "Audit fisik", "", note, user.name);
      await q("update materials set track_stock = true, note = case when track_stock then note else '' end where id = $1", [m.id]);
      if (diff < 0) {
        await q("insert into waste_log (item, qty, unit, cost, reason, actor) values ($1,$2,$3,$4,$5,$6)",
          [m.name, -diff, m.unit, -diff * m.unit_cost, note || "Selisih audit fisik", user.name]);
      }
      await q("insert into activity (title, detail, actor) values ($1,$2,$3)",
        ["Audit stok fisik", `${m.name}: sistem ${m.stock} ${m.unit}, fisik ${actual} ${m.unit}`, user.name]);
    });
  });
}

export async function toggleMaterial(input: { id: string; active: boolean }) {
  return guarded(FULL, async () => {
    await query("update materials set active=$2 where id=$1", [input.id, input.active]);
  });
}
