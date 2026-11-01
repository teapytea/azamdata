"use server";

import { guarded, num, req, str } from "@/lib/action";
import { allocateFifo, priceOrder, promoDiscount, unitPrice, type Receipt } from "@/lib/calc";
import { checkPassword, FULL, rateLimit, type User } from "@/lib/auth";
import { one, query, tx, type Q } from "@/lib/db";
import { moveStock } from "@/lib/domain";
import { todayWIB } from "@/lib/format";
import { getSettings, type Settings } from "@/lib/settings";

function posOnly(user: User) {
  if (!["owner", "admin", "cashier"].includes(user.role) && !user.pos_access) throw new Error("Akun ini tidak punya akses kasir.");
}
const pos = <T,>(fn: (user: User) => Promise<T>) => guarded(["owner", "admin", "cashier", "employee"], async (user) => { posOnly(user); return fn(user); });

export type CartLine = { product_id: string; qty: number; sugar: string; ice?: string; topping: string; note?: string };
export type CheckoutInput = {
  token: string; lines: CartLine[]; order_type: string; table_no?: string; courier?: string; customer_name?: string; customer_id?: string;
  promo_code?: string; redeem?: boolean; payment: string; tendered?: number; reference?: string; note?: string; verified?: boolean;
};

const TOPPINGS: Record<string, string> = { "Honey Osmanthus Jelly": "jelly", "Soybean Curd": "curd" };

async function buildReceipt(q: Q, saleId: string, s: Settings): Promise<Receipt> {
  const [sale] = await q("select * from sales where id=$1", [saleId]);
  const lines = await q("select qty, name, sugar, ice, topping, note, gross from sale_lines where sale_id=$1", [saleId]);
  return {
    store: s.store_name, address: s.address, footer: s.footer, wifi: s.wifi, taxLabel: s.tax_label,
    number: sale.number, at: sale.at, cashier: sale.cashier, order_type: sale.order_type, table_no: sale.table_no, customer: sale.customer_name,
    lines: lines as never, subtotal: sale.subtotal, discount: sale.discount, promo_code: sale.promo_code, member_discount: sale.member_discount, redeem_value: sale.redeem_value,
    service: sale.service, tax: sale.tax, rounding: sale.rounding, total: sale.total, payment: sale.payment, tendered: sale.tendered, change: sale.change_due,
    reference: sale.reference, note: sale.note, points_earned: sale.points_earned, status: sale.status, void_reason: sale.void_reason,
  };
}

export async function checkout(input: CheckoutInput) {
  return pos(async (user) => {
    const token = req(input.token, "Token transaksi", 80);
    const s = await getSettings();
    return tx(async (q) => {
      // Permintaan yang diulang karena koneksi putus mengembalikan transaksi yang sama.
      const [existing] = await q<{ id: string }>("select id from sales where request_token=$1", [token]);
      if (existing) return buildReceipt(q, existing.id, s);

      const [register] = await q<{ id: string }>("select id from registers where user_id=$1 and closed_at is null", [user.id]);
      if (!register) throw new Error("Buka shift kasir sebelum menerima pembayaran.");
      if (!input.lines?.length) throw new Error("Keranjang masih kosong.");
      const orderType = req(input.order_type, "Jenis pesanan", 20);
      if (orderType === "Dine-in" && !str(input.table_no)) throw new Error("Isi nomor meja untuk dine-in.");
      if (!input.customer_id && !str(input.customer_name)) throw new Error("Nama pelanggan wajib diisi.");

      const [{ n }] = await q<{ n: number }>("select nextval('sale_seq')::int as n");
      const number = `TPY-${todayWIB().replaceAll("-", "").slice(2)}-${String(n).padStart(4, "0")}`;
      const materials = await q<{ id: string; code: string; unit_cost: number; track_stock: boolean }>("select id, code, unit_cost, track_stock from materials");
      const material = (code: string) => materials.find((m) => m.code === code)!;
      const prepared = [];
      let subtotal = 0;
      let cogs = 0;

      for (const line of input.lines) {
        const count = Math.round(num(line.qty, "Jumlah item", 1));
        const [p] = await q<{ id: string; name: string; price: number; price_takeaway: number | null; serving_ml: number; mode: string }>("select id, name, price, price_takeaway, serving_ml, mode from products where id=$1 and active", [line.product_id]);
        if (!p) throw new Error("Ada menu yang sudah tidak tersedia.");
        const direct = p.mode === "direct";
        const used: { id: string; qty: number; unit_cost: number }[] = [];
        let allocations: { id: string; ml: number; cost: number }[] = [];
        const toppingCode = TOPPINGS[line.topping];

        if (direct) {
          // Pure Leaf dan Artisan: daun dipotong per porsi. Cup hanya untuk yang dibawa pulang.
          const recipe = await q<{ material_id: string; qty: number; unit_cost: number }>(
            "select r.material_id, r.qty, m.unit_cost from recipe_items r join materials m on m.id = r.material_id where r.product_id=$1", [p.id]);
          if (!recipe.length) throw new Error(`Resep ${p.name} belum punya bahan.`);
          for (const r of recipe) used.push({ id: r.material_id, qty: r.qty * count, unit_cost: r.unit_cost });
          if (orderType !== "Dine-in") used.push({ id: material("cup").id, qty: count, unit_cost: material("cup").unit_cost });
        } else {
          const batches = await q<{ id: string; remaining_ml: number; cost_per_ml: number }>(
            `select id, remaining_ml, cost_per_ml from batches where product_id=$1 and labeled_at is not null and drained_at is null
             and remaining_ml > 0 and expires_at > now() order by made_at for update`, [p.id]);
          const allocated = allocateFifo(batches, count * p.serving_ml);
          if (!allocated) throw new Error(`Batch siap saji ${p.name} tidak cukup. Sisa ${batches.reduce((a, b) => a + b.remaining_ml, 0)} ml.`);
          allocations = allocated;
          for (const a of allocations) await q("update batches set remaining_ml = remaining_ml - $2 where id=$1", [a.id, a.ml]);
          const sugarMl = line.sugar === "Normal" ? s.sugar_normal_ml : line.sugar === "Less" ? s.sugar_less_ml : 0;
          used.push({ id: material("cup").id, qty: count, unit_cost: material("cup").unit_cost });
          if (sugarMl > 0) used.push({ id: material("sugar").id, qty: count * sugarMl, unit_cost: material("sugar").unit_cost });
        }
        if (toppingCode) used.push({ id: material(toppingCode).id, qty: count * s.topping_qty, unit_cost: material(toppingCode).unit_cost });
        // Bahan yang belum pernah dihitung tetap masuk HPP, tetapi tidak memotong stok.
        const tracked = used.filter((u) => materials.find((m) => m.id === u.id)?.track_stock !== false);
        for (const u of tracked) await moveStock(q, u.id, -u.qty, "Penjualan", number, p.name, user.name);

        const unit = unitPrice(p, orderType);
        const toppingPrice = toppingCode ? s.topping_price : 0;
        const gross = count * (unit + toppingPrice);
        const lineCogs = allocations.reduce((a, b) => a + b.cost, 0) + used.reduce((a, u) => a + u.qty * u.unit_cost, 0);
        subtotal += gross;
        cogs += lineCogs;
        prepared.push({ p, count, line, unit, sugar: line.sugar, ice: str(line.ice, 20) || "Normal ice", topping: line.topping, servingMl: direct ? 0 : p.serving_ml, toppingPrice, gross, lineCogs, allocations, used: tracked });
      }

      let customer: { id: string; name: string; points: number } | undefined;
      if (input.customer_id) [customer] = await q<{ id: string; name: string; points: number }>("select id, name, points from customers where id=$1 for update", [input.customer_id]);
      let promo: { code: string; percent: number } | undefined;
      if (str(input.promo_code)) {
        [promo] = await q<{ code: string; percent: number }>("select code, percent from promo_codes where code=$1 and active", [normalizePromo(input.promo_code)]);
        if (!promo) throw new Error("Kode promo tidak berlaku.");
      }
      const price = priceOrder(subtotal, s, { discount: promoDiscount(subtotal, promo?.percent), isMember: !!customer, redeem: !!input.redeem, points: customer?.points });
      const redeemPoints = price.redeemValue > 0 ? s.redeem_points : 0;

      const payment = req(input.payment, "Metode pembayaran", 20);
      let tendered = price.total;
      let change = 0;
      const reference = str(input.reference, 120);
      if (payment === "Tunai") {
        tendered = num(input.tendered, "Uang diterima");
        if (tendered < price.total) throw new Error("Uang diterima kurang dari total tagihan.");
        change = tendered - price.total;
      } else if (payment === "QRIS" || payment === "EDC") {
        if (!reference) throw new Error("Isi nomor referensi pembayaran.");
        if (!input.verified) throw new Error("Centang konfirmasi bahwa pembayaran sudah diterima.");
      } else if (payment !== "Marketplace") throw new Error("Metode pembayaran tidak dikenal.");

      const channelFee = orderType === "Kurir" ? Math.round(((subtotal - price.discount) * s.courier_fee_pct) / 100) : 0;
      const [sale] = await q<{ id: string }>(
        `insert into sales (number, request_token, order_type, table_no, courier, customer_name, customer_id, subtotal, discount, member_discount, redeem_points, redeem_value,
           service, tax, rounding, total, channel_fee, cogs, points_earned, payment, tendered, change_due, reference, note, cashier, register_id, promo_code)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27) returning id`,
        [number, token, orderType, str(input.table_no, 10), str(input.courier, 40), customer?.name || str(input.customer_name, 120), customer?.id ?? null,
          subtotal, price.discount, price.memberDiscount, redeemPoints, price.redeemValue, price.service, price.tax, price.rounding, price.total,
          channelFee, cogs, price.pointsEarned, payment, tendered, change, reference, str(input.note, 300), user.name, register.id, promo?.code ?? ""]);
      for (const l of prepared) {
        await q(
          `insert into sale_lines (sale_id, product_id, name, qty, sugar, topping, note, unit_price, topping_price, gross, cogs, serving_ml, allocations, materials, ice)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14::jsonb,$15)`,
          [sale.id, l.p.id, l.p.name, l.count, l.sugar, l.topping, str(l.line.note, 120), l.unit, l.toppingPrice, l.gross, l.lineCogs, l.servingMl,
            JSON.stringify(l.allocations), JSON.stringify(l.used), l.ice]);
      }
      if (customer) await q("update customers set points = points + $2 - $3 where id=$1", [customer.id, price.pointsEarned, redeemPoints]);
      return buildReceipt(q, sale.id, s);
    });
  });
}

export async function voidSale(input: { id: string; reason: string; pin?: string }) {
  return pos(async (user) => {
    const reason = req(input.reason, "Alasan pembatalan", 200);
    const s = await getSettings();
    if (!FULL.includes(user.role)) {
      await rateLimit(`void:${user.id}`, 5, 15);
      if (!s.void_pin_hash) throw new Error("PIN supervisor belum diatur. Minta admin membatalkan transaksi ini.");
      if (!(await checkPassword(String(input.pin ?? ""), s.void_pin_hash))) throw new Error("PIN supervisor salah.");
    }
    return tx(async (q) => {
      const [sale] = await q<{ id: string; number: string; status: string; customer_id: string | null; points_earned: number; redeem_points: number }>("select * from sales where id=$1 for update", [input.id]);
      if (!sale || sale.status !== "Selesai") throw new Error("Transaksi ini sudah dibatalkan.");
      const lines = await q<{ name: string; allocations: { id: string; ml: number }[]; materials: { id: string; qty: number }[] }>("select name, allocations, materials from sale_lines where sale_id=$1", [sale.id]);
      for (const l of lines) {
        for (const a of l.allocations) await q("update batches set remaining_ml = remaining_ml + $2 where id=$1 and drained_at is null", [a.id, a.ml]);
        for (const m of l.materials) await moveStock(q, m.id, m.qty, "Pembatalan", sale.number, l.name, user.name);
      }
      if (sale.customer_id) await q("update customers set points = greatest(0, points - $2 + $3) where id=$1", [sale.customer_id, sale.points_earned, sale.redeem_points]);
      await q("update sales set status='Dibatalkan', void_reason=$2, void_by=$3, void_at=now() where id=$1", [sale.id, reason, user.name]);
      await q("insert into activity (title, detail, actor) values ($1,$2,$3)", ["Transaksi dibatalkan", `${sale.number}: ${reason}`, user.name]);
      return buildReceipt(q, sale.id, s);
    });
  });
}

const normalizePromo = (code: unknown) => String(code ?? "").replace(/\s+/g, "").toUpperCase().slice(0, 30);

export async function checkPromo(input: { code: string }) {
  return pos(async () => {
    const promo = await one<{ code: string; percent: number }>("select code, percent from promo_codes where code=$1 and active", [normalizePromo(input.code)]);
    if (!promo) throw new Error("Kode promo tidak berlaku.");
    return promo;
  });
}

export async function savePromo(input: Record<string, string>) {
  return guarded(FULL, async () => {
    const code = normalizePromo(input.code);
    if (code.length < 3) throw new Error("Kode promo minimal 3 karakter.");
    const percent = num(input.percent, "Diskon", 0.01);
    if (percent > 100) throw new Error("Diskon maksimal 100%.");
    await query("insert into promo_codes (code, percent) values ($1,$2) on conflict (code) do update set percent=excluded.percent, active=true", [code, percent]);
  });
}

export async function togglePromo(input: { code: string; active: boolean }) {
  return guarded(FULL, async () => {
    await query("update promo_codes set active=$2 where code=$1", [input.code, input.active]);
  });
}

export async function getReceipt(input: { id: string }) {
  return pos(async () => {
    const s = await getSettings();
    return tx((q) => buildReceipt(q, input.id, s));
  });
}

export async function openRegister(input: Record<string, string>) {
  return pos(async (user) => {
    const open = await one("select id from registers where user_id=$1 and closed_at is null", [user.id]);
    if (open) throw new Error("Shift kasir Anda sudah terbuka.");
    await query("insert into registers (user_id, cashier, opening_cash, note) values ($1,$2,$3,$4)", [user.id, user.name, num(input.opening_cash, "Kas awal"), str(input.note, 200)]);
  });
}

export async function closeRegister(input: Record<string, string>) {
  return pos(async (user) => {
    const closing = num(input.closing_cash, "Kas akhir");
    return tx(async (q) => {
      const [r] = await q<{ id: string; opening_cash: number }>("select id, opening_cash from registers where user_id=$1 and closed_at is null for update", [user.id]);
      if (!r) throw new Error("Tidak ada shift kasir yang terbuka.");
      const [{ cash }] = await q<{ cash: number }>("select coalesce(sum(total),0)::float8 as cash from sales where register_id=$1 and payment='Tunai' and status='Selesai'", [r.id]);
      const expected = r.opening_cash + cash;
      await q("update registers set closed_at=now(), closing_cash=$2, expected_cash=$3, note=$4 where id=$1", [r.id, closing, expected, str(input.note, 200)]);
      return { expected, closing, variance: closing - expected };
    });
  });
}

export async function holdOrder(input: { label: string; data: unknown }) {
  return pos(async (user) => {
    await query("insert into held_orders (label, data, created_by) values ($1,$2::jsonb,$3)", [req(input.label, "Nama pesanan", 60), JSON.stringify(input.data), user.name]);
  });
}

export async function discardHold(input: { id: string }) {
  return pos(async () => {
    await query("delete from held_orders where id=$1", [input.id]);
  });
}

export async function findCustomer(input: { phone: string }) {
  return pos(async () => {
    const phone = req(input.phone, "Nomor telepon", 25).replace(/\D/g, "");
    return (await one("select id, phone, name, points from customers where phone=$1", [phone])) ?? null;
  });
}

export async function createCustomer(input: { phone: string; name: string }) {
  return pos(async () => {
    const phone = req(input.phone, "Nomor telepon", 25).replace(/\D/g, "");
    if (phone.length < 8) throw new Error("Nomor telepon tidak valid.");
    return one("insert into customers (phone, name) values ($1,$2) returning id, phone, name, points", [phone, req(input.name, "Nama", 120)]);
  });
}
