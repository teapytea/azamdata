"use server";

import { dateOrNull, guarded, num, req, str } from "@/lib/action";
import { FULL } from "@/lib/auth";
import { query, tx } from "@/lib/db";
import { moveStock } from "@/lib/domain";
import { todayWIB } from "@/lib/format";

export async function saveSupplier(input: Record<string, string>) {
  return guarded(FULL, async () => {
    const values = [req(input.name, "Nama supplier", 120), str(input.location, 120), str(input.specialty, 200), str(input.contact, 120), num(input.lead_days || 0, "Lead time")];
    if (input.id) await query("update suppliers set name=$2, location=$3, specialty=$4, contact=$5, lead_days=$6 where id=$1", [input.id, ...values]);
    else await query("insert into suppliers (name, location, specialty, contact, lead_days) values ($1,$2,$3,$4,$5)", values);
  });
}

export async function createPo(input: Record<string, string>) {
  return guarded(FULL, async (user) => {
    const qty = num(input.qty, "Jumlah", 0.01);
    const total = num(input.total, "Total nilai PO", 1);
    await tx(async (q) => {
      const [{ n }] = await q<{ n: number }>("select nextval('po_seq')::int as n");
      const number = `PO-${todayWIB().slice(0, 4)}-${String(n).padStart(3, "0")}`;
      await q("insert into purchase_orders (number, supplier_id, material_id, qty, total, eta, note) values ($1,$2,$3,$4,$5,$6,$7)",
        [number, req(input.supplier_id, "Supplier"), req(input.material_id, "Bahan"), qty, total, dateOrNull(input.eta), str(input.note, 300)]);
      await q("insert into activity (title, detail, actor) values ($1,$2,$3)", ["PO diterbitkan", number, user.name]);
    });
  });
}

/** Barang diterima: stok bertambah dan harga bahan memakai rata-rata tertimbang. */
export async function receivePo(input: { id: string }) {
  return guarded(FULL, async (user) => {
    await tx(async (q) => {
      const [po] = await q<{ id: string; number: string; material_id: string; qty: number; total: number; status: string }>("select * from purchase_orders where id=$1 for update", [input.id]);
      if (!po || po.status !== "Dipesan") throw new Error("PO ini sudah diproses.");
      const [m] = await q<{ stock: number; unit_cost: number }>("select stock, unit_cost from materials where id=$1 for update", [po.material_id]);
      const unitCost = (m.stock * m.unit_cost + po.total) / (m.stock + po.qty);
      await moveStock(q, po.material_id, po.qty, "Terima PO", po.number, "", user.name);
      await q("update materials set unit_cost=$2, note = case when track_stock then note else '' end, track_stock = true where id=$1", [po.material_id, unitCost]);
      await q("update purchase_orders set status='Diterima', received_at=now(), received_by=$2 where id=$1", [po.id, user.name]);
    });
  });
}

export async function cancelPo(input: { id: string }) {
  return guarded(FULL, async () => {
    const rows = await query("update purchase_orders set status='Dibatalkan' where id=$1 and status='Dipesan' returning id", [input.id]);
    if (!rows.length) throw new Error("PO yang sudah diterima tidak bisa dibatalkan.");
  });
}

export async function payPo(input: Record<string, string>) {
  return guarded(FULL, async () => {
    const rows = await query("update purchase_orders set payment='Lunas', paid_at=now(), pay_ref=$2 where id=$1 and status <> 'Dibatalkan' and payment <> 'Lunas' returning id", [input.id, str(input.pay_ref, 120)]);
    if (!rows.length) throw new Error("PO ini tidak bisa dicatat lunas.");
  });
}
