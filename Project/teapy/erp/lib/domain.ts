import type { Q } from "./db";

/** Mengubah stok bahan dan mencatat mutasinya. Stok tidak boleh negatif. */
export async function moveStock(q: Q, materialId: string, delta: number, kind: string, ref: string, note: string, actor: string) {
  const rows = await q<{ stock: number; name: string; unit: string }>(
    "update materials set stock = stock + $2 where id = $1 and stock + $2 >= 0 returning stock, name, unit", [materialId, delta]);
  if (!rows.length) {
    const m = (await q<{ name: string; stock: number; unit: string }>("select name, stock, unit from materials where id = $1", [materialId]))[0];
    throw new Error(`Stok ${m?.name ?? "bahan"} tidak cukup (tersisa ${m?.stock ?? 0} ${m?.unit ?? ""}).`);
  }
  await q("insert into stock_moves (material_id, delta, kind, ref, note, actor) values ($1,$2,$3,$4,$5,$6)", [materialId, delta, kind, ref, note, actor]);
  return rows[0];
}

/** Membuat tugas harian dari template bila belum ada untuk tanggal tersebut. */
export async function ensureDailyTasks(q: Q, date: string) {
  await q(
    `insert into tasks (template_id, date, shift_code, title, description, sort)
     select id, $1::date, shift_code, title, description, sort from task_templates where active
     on conflict (template_id, date) do nothing`, [date]);
}
