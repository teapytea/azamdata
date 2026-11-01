"use server";

import { dateOrNull, guarded, num, req, str } from "@/lib/action";
import { FULL, type Role, type User } from "@/lib/auth";
import { tx } from "@/lib/db";
import { moveStock } from "@/lib/domain";
import { addDays, todayWIB } from "@/lib/format";
import { getSettings } from "@/lib/settings";

const CREW: Role[] = [...FULL, "employee", "cashier"];

function verifiedOnly(user: User) {
  if (user.role === "employee" && !user.employee_id) throw new Error("Akun Anda belum diverifikasi admin.");
}

/** Batch baru memotong bahan sesuai resep. Belum bisa dijual sampai labelnya dikonfirmasi. */
export async function startBatch(input: Record<string, string>) {
  return guarded(CREW, async (user) => {
    verifiedOnly(user);
    const factor = num(input.factor || 1, "Jumlah batch", 0.1);
    const settings = await getSettings();
    return tx(async (q) => {
      const [p] = await q<{ id: string; name: string; sku: string; yield_ml: number }>("select id, name, sku, yield_ml from products where id=$1 and active and mode='batch'", [input.product_id]);
      if (!p) throw new Error("Pilih menu aktif yang memakai batch seduh.");
      const items = await q<{ material_id: string; qty: number; unit_cost: number }>(
        "select r.material_id, r.qty, m.unit_cost from recipe_items r join materials m on m.id = r.material_id where r.product_id=$1", [p.id]);
      if (!items.length) throw new Error("Resep menu ini belum punya bahan.");
      const today = todayWIB();
      const n = (await q<{ n: number }>("select count(*)::int as n from batches where made_on=$1", [today]))[0].n + 1;
      const code = `BT-${today.replaceAll("-", "").slice(2)}-${String(n).padStart(3, "0")}`;
      let cost = 0;
      for (const i of items) {
        await moveStock(q, i.material_id, -i.qty * factor, "Batch seduh", code, p.name, user.name);
        cost += i.qty * factor * i.unit_cost;
      }
      const ml = p.yield_ml * factor;
      await q(
        `insert into batches (code, product_id, made_on, expires_at, initial_ml, remaining_ml, cost_per_ml, operator)
         values ($1,$2,$3, now() + make_interval(hours => $4::int), $5, $5, $6, $7)`,
        [code, p.id, today, settings.batch_expiry_hours, ml, cost / ml, user.name]);
      await q("insert into activity (title, detail, actor) values ($1,$2,$3)", ["Batch seduh dibuat", `${code} ${p.name} ${ml} ml`, user.name]);
      return code;
    });
  });
}

/** Satu-satunya pemeriksaan QC: memastikan batch sudah dilabeli tanggal produksinya. */
export async function confirmLabel(input: Record<string, string>) {
  return guarded(CREW, async (user) => {
    verifiedOnly(user);
    const date = dateOrNull(input.made_on);
    if (!date) throw new Error("Isi tanggal pada label.");
    if (date > todayWIB() || date < addDays(todayWIB(), -2)) throw new Error("Tanggal label harus sesuai hari batch dibuat.");
    await tx((q) => q("update batches set made_on=$2, labeled_at=now(), labeled_by=$3 where id=$1 and labeled_at is null", [req(input.id, "Batch"), date, user.name]));
  });
}

/** Membuang sisa batch dan mencatat nilainya sebagai waste. */
export async function drainBatch(input: Record<string, string>) {
  return guarded(CREW, async (user) => {
    verifiedOnly(user);
    await tx(async (q) => {
      const [b] = await q<{ id: string; code: string; remaining_ml: number; cost_per_ml: number; name: string }>(
        "select b.id, b.code, b.remaining_ml, b.cost_per_ml, p.name from batches b join products p on p.id = b.product_id where b.id=$1 for update of b", [input.id]);
      if (!b) throw new Error("Batch tidak ditemukan.");
      if (b.remaining_ml > 0) {
        await q("insert into waste_log (item, qty, unit, cost, reason, actor) values ($1,$2,'ml',$3,$4,$5)",
          [`${b.name} (${b.code})`, b.remaining_ml, b.remaining_ml * b.cost_per_ml, str(input.reason, 200) || "Sisa batch dibuang", user.name]);
      }
      await q("update batches set remaining_ml=0, drained_at=now() where id=$1", [b.id]);
    });
  });
}
