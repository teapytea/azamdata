"use server";

import { dateOrNull, guarded, num, req, str } from "@/lib/action";
import { FULL } from "@/lib/auth";
import { query } from "@/lib/db";

export async function addExpense(input: Record<string, string>) {
  return guarded(FULL, async (user) => {
    const date = dateOrNull(input.date);
    if (!date) throw new Error("Isi tanggal beban.");
    await query("insert into expenses (at, category, note, amount, source, ref) values (($1 || ' 12:00+07')::timestamptz,$2,$3,$4,'Manual',$5)",
      [date, req(input.category, "Kategori", 40), str(input.note, 200), num(input.amount, "Nominal", 1), user.name]);
  });
}

export async function deleteExpense(input: { id: string }) {
  return guarded(FULL, async () => {
    const rows = await query("delete from expenses where id=$1 and source='Manual' returning id", [input.id]);
    if (!rows.length) throw new Error("Hanya beban manual yang bisa dihapus.");
  });
}

/** Rekonsiliasi manual: mencocokkan catatan kasir dengan mutasi atau kas yang benar-benar diterima. */
export async function addReconciliation(input: Record<string, string>) {
  return guarded(FULL, async (user) => {
    const date = dateOrNull(input.date);
    if (!date) throw new Error("Isi tanggal.");
    await query("insert into reconciliations (date, method, system_amount, actual_amount, note, actor) values ($1,$2,$3,$4,$5,$6)",
      [date, req(input.method, "Metode", 20), num(input.system_amount, "Nilai sistem"), num(input.actual_amount, "Nilai diterima"), str(input.note, 200), user.name]);
  });
}
