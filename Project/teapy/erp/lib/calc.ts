/** Perhitungan murni yang dipakai server dan klien agar angkanya selalu sama. */

export type PriceRules = {
  service_pct: number; tax_pct: number; rounding: number; member_discount_pct: number;
  points_per: number; redeem_points: number; redeem_value: number;
};

export type PricedOrder = {
  subtotal: number; discount: number; memberDiscount: number; redeemValue: number;
  service: number; tax: number; rounding: number; total: number; pointsEarned: number;
};

/** Urutan: subtotal, diskon, diskon member, tukar poin, service, pajak, pembulatan. */
export function priceOrder(subtotal: number, rules: PriceRules, opts: { discount?: number; isMember?: boolean; redeem?: boolean; points?: number } = {}): PricedOrder {
  const discount = Math.min(Math.max(0, Math.round(opts.discount || 0)), subtotal);
  const memberDiscount = opts.isMember ? Math.round(((subtotal - discount) * rules.member_discount_pct) / 100) : 0;
  const canRedeem = !!opts.isMember && !!opts.redeem && rules.redeem_points > 0 && (opts.points || 0) >= rules.redeem_points;
  const redeemValue = canRedeem ? Math.min(rules.redeem_value, subtotal - discount - memberDiscount) : 0;
  const base = subtotal - discount - memberDiscount - redeemValue;
  const service = Math.round((base * rules.service_pct) / 100);
  const tax = Math.round(((base + service) * rules.tax_pct) / 100);
  const exact = base + service + tax;
  const step = Math.max(1, rules.rounding || 1);
  const total = Math.round(exact / step) * step;
  const pointsEarned = opts.isMember && rules.points_per > 0 ? Math.floor(total / rules.points_per) : 0;
  return { subtotal, discount, memberDiscount, redeemValue, service, tax, rounding: total - exact, total, pointsEarned };
}

/** Harga menu mengikuti jenis pesanan. Kurir memakai harga takeaway. */
export const unitPrice = (p: { price: number; price_takeaway?: number | null }, orderType: string) =>
  orderType === "Dine-in" || p.price_takeaway == null ? p.price : p.price_takeaway;

/** Diskon kode promo dihitung dari subtotal agar ikut berubah saat keranjang berubah. */
export const promoDiscount = (subtotal: number, percent?: number | null) => Math.round((subtotal * (percent || 0)) / 100);

export const batchCost = (items: { qty: number; unit_cost: number }[]) => items.reduce((sum, i) => sum + i.qty * i.unit_cost, 0);

/** HPP satu cup: porsi dari batch ditambah cup dan gula normal. */
export function cupCost(items: { qty: number; unit_cost: number }[], yieldMl: number, servingMl: number, extras: number) {
  return yieldMl > 0 ? (batchCost(items) / yieldMl) * servingMl + extras : extras;
}

export const marginPct = (price: number, cost: number) => (price > 0 ? ((price - cost) / price) * 100 : 0);

/** Mengambil dari batch tertua lebih dulu. Mengembalikan null bila stok tidak cukup. */
export function allocateFifo<T extends { id: string; remaining_ml: number; cost_per_ml: number }>(batches: T[], ml: number) {
  const out: { id: string; ml: number; cost: number }[] = [];
  let left = ml;
  for (const b of batches) {
    if (left <= 0) break;
    const take = Math.min(left, b.remaining_ml);
    if (take > 0) {
      out.push({ id: b.id, ml: take, cost: take * b.cost_per_ml });
      left -= take;
    }
  }
  return left > 0 ? null : out;
}

/* Struk 58 mm: 32 karakter per baris --------------------------------------- */
export type Receipt = {
  store: string; address: string; footer: string; wifi?: string; number: string; at: string; cashier: string;
  order_type: string; table_no?: string; customer?: string; taxLabel: string;
  lines: { qty: number; name: string; sugar: string; ice?: string; topping: string; note?: string; gross: number }[];
  promo_code?: string;
  subtotal: number; discount: number; member_discount: number; redeem_value: number; service: number; tax: number; rounding: number; total: number;
  payment?: string; tendered?: number; change?: number; reference?: string; note?: string; points_earned?: number;
  status?: string; void_reason?: string; draft?: boolean;
};

const WIDTH = 32;
const ascii = (s: unknown) => String(s ?? "").normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[–—]/g, "-").replace(/[^\x20-\x7e]/g, "").replace(/\s+/g, " ").trim();
const money = (n: number) => Math.round(n).toLocaleString("id-ID");

function wrap(text: unknown, width = WIDTH) {
  const out: string[] = [];
  let line = "";
  for (let word of ascii(text).split(" ")) {
    while (word.length > width) {
      if (line) { out.push(line); line = ""; }
      out.push(word.slice(0, width));
      word = word.slice(width);
    }
    if (line && line.length + word.length + 1 > width) { out.push(line); line = ""; }
    line += (line ? " " : "") + word;
  }
  if (line) out.push(line);
  return out;
}
const center = (t: string) => " ".repeat(Math.max(0, Math.floor((WIDTH - t.length) / 2))) + t;
const pair = (l: string, r: string) => {
  const left = ascii(l).slice(0, WIDTH - r.length - 1);
  return left + " ".repeat(WIDTH - left.length - r.length) + r;
};

export function receiptLines(r: Receipt): string[] {
  const rule = "-".repeat(WIDTH);
  const out: string[] = [];
  wrap(r.store.toUpperCase()).forEach((l) => out.push(center(l)));
  wrap(r.address).forEach((l) => out.push(center(l)));
  out.push(rule);
  if (r.draft) out.push(center("BILL SEMENTARA - BELUM DIBAYAR"));
  if (r.status === "Dibatalkan") out.push(center("TRANSAKSI DIBATALKAN"));
  wrap(`NO: ${r.number}`).forEach((l) => out.push(l));
  wrap(`WAKTU: ${new Date(r.at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "short", timeStyle: "short" }).replace(/\./g, ":")} WIB`).forEach((l) => out.push(l));
  wrap(`KASIR: ${r.cashier}`).forEach((l) => out.push(l));
  wrap(`${r.order_type}${r.table_no ? ` / Meja ${r.table_no}` : ""}`).forEach((l) => out.push(l));
  if (r.customer) wrap(`TAMU: ${r.customer}`).forEach((l) => out.push(l));
  out.push(rule);
  for (const l of r.lines) {
    wrap(`${l.qty}x ${l.name}`).forEach((t) => out.push(t));
    // Menu seduhan selalu menulis gula, es, dan topping. Tanda "-" berarti menu tanpa pilihan.
    const brewed = l.sugar !== "-";
    const opts = [brewed ? (l.sugar === "No sugar" ? l.sugar : `${l.sugar} sugar`) : "", brewed ? l.ice || "Normal ice" : "", brewed ? (l.topping === "Tanpa topping" ? "No topping" : l.topping) : "", l.note || ""].filter(Boolean).join(", ");
    if (opts) wrap(`* ${opts}`).forEach((t) => out.push(t));
    out.push(pair("", money(l.gross)));
  }
  out.push(rule);
  out.push(pair("Subtotal", money(r.subtotal)));
  if (r.discount) out.push(pair(r.promo_code ? `Diskon ${r.promo_code}` : "Diskon", "-" + money(r.discount)));
  if (r.member_discount) out.push(pair("Diskon member", "-" + money(r.member_discount)));
  if (r.redeem_value) out.push(pair("Tukar poin", "-" + money(r.redeem_value)));
  if (r.service) out.push(pair("Service", money(r.service)));
  if (r.tax) out.push(pair(r.taxLabel, money(r.tax)));
  if (r.rounding) out.push(pair("Pembulatan", money(r.rounding)));
  out.push(pair("TOTAL", "Rp " + money(r.total)));
  if (!r.draft && r.payment) {
    out.push(pair(`Bayar (${r.payment})`, money(r.tendered ?? r.total)));
    out.push(pair("Kembali", money(r.change ?? 0)));
    if (r.reference) wrap(`Ref: ${r.reference}`).forEach((t) => out.push(t));
  }
  if (r.points_earned) out.push(pair("Poin didapat", String(r.points_earned)));
  if (r.note) wrap(`Catatan: ${r.note}`).forEach((t) => out.push(t));
  if (r.void_reason) wrap(`Alasan batal: ${r.void_reason}`).forEach((t) => out.push(t));
  out.push(rule);
  wrap(r.footer).forEach((l) => out.push(center(l)));
  if (r.wifi) wrap(`WiFi: ${r.wifi}`).forEach((l) => out.push(center(l)));
  return out;
}

/** Memecah data cetak agar buffer printer Bluetooth tidak meluap. */
export function byteChunks(bytes: Uint8Array, size: number) {
  const out: Uint8Array[] = [];
  for (let i = 0; i < bytes.length; i += size) out.push(bytes.slice(i, i + size));
  return out;
}

/** Perintah ESC/POS: init, teks, feed, potong kertas. */
export function escPos(lines: string[]) {
  const text = new TextEncoder().encode(lines.join("\n") + "\n\n\n");
  const init = [0x1b, 0x40];
  const cut = [0x1d, 0x56, 0x42, 0x00];
  return new Uint8Array([...init, ...text, ...cut]);
}
