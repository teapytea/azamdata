import { describe, expect, it } from "vitest";
import { allocateFifo, byteChunks, cupCost, escPos, priceOrder, promoDiscount, receiptLines, unitPrice, type Receipt } from "./calc";

const rules = { service_pct: 5, tax_pct: 10, rounding: 100, member_discount_pct: 10, points_per: 10000, redeem_points: 100, redeem_value: 10000 };

describe("priceOrder", () => {
  it("cocok dengan contoh struk pada desain POS", () => {
    const p = priceOrder(125000, rules, { isMember: true, redeem: true, points: 2450 });
    expect(p.memberDiscount).toBe(12500);
    expect(p.redeemValue).toBe(10000);
    expect(p.service).toBe(5125);
    expect(p.tax).toBe(10763);
    expect(p.total).toBe(118400);
    expect(p.rounding).toBe(12);
    expect(p.pointsEarned).toBe(11);
  });
  it("tanpa pajak dan service total sama dengan subtotal", () => {
    const p = priceOrder(52000, { ...rules, service_pct: 0, tax_pct: 0 });
    expect(p.total).toBe(52000);
    expect(p.pointsEarned).toBe(0);
  });
  it("poin kurang dari syarat tidak bisa ditukar", () => {
    expect(priceOrder(50000, rules, { isMember: true, redeem: true, points: 99 }).redeemValue).toBe(0);
  });
  it("potongan tidak membuat total negatif", () => {
    expect(priceOrder(5000, rules, { discount: 90000 }).total).toBe(0);
    expect(priceOrder(5000, { ...rules, member_discount_pct: 0 }, { isMember: true, redeem: true, points: 500 }).total).toBe(0);
  });
});

describe("unitPrice", () => {
  const pureLeaf = { price: 25000, price_takeaway: 20000 };
  it("membedakan dine-in dan takeaway", () => {
    expect(unitPrice(pureLeaf, "Dine-in")).toBe(25000);
    expect(unitPrice(pureLeaf, "Takeaway")).toBe(20000);
    expect(unitPrice(pureLeaf, "Kurir")).toBe(20000);
  });
  it("menu satu harga tetap sama di semua jenis pesanan", () => {
    expect(unitPrice({ price: 20000, price_takeaway: null }, "Takeaway")).toBe(20000);
  });
});

describe("promoDiscount", () => {
  it("menghitung persen dari subtotal", () => {
    expect(promoDiscount(58000, 10)).toBe(5800);
    expect(promoDiscount(58000, null)).toBe(0);
  });
});

describe("allocateFifo", () => {
  const batches = [{ id: "a", remaining_ml: 100, cost_per_ml: 2 }, { id: "b", remaining_ml: 300, cost_per_ml: 3 }];
  it("menghabiskan batch tertua lebih dulu", () => {
    expect(allocateFifo(batches, 200)).toEqual([{ id: "a", ml: 100, cost: 200 }, { id: "b", ml: 100, cost: 300 }]);
  });
  it("menolak bila stok kurang", () => {
    expect(allocateFifo(batches, 401)).toBeNull();
  });
});

describe("HPP", () => {
  it("mengikuti rumus batch per ml ditambah kemasan", () => {
    const items = [{ qty: 350, unit_cost: 650 }, { qty: 2500, unit_cost: 22 }, { qty: 750, unit_cost: 65 }, { qty: 8000, unit_cost: 0.7 }];
    expect(Math.round(cupCost(items, 10000, 200, 2160))).toBe(2160 + Math.round((227500 + 55000 + 48750 + 5600) / 50));
  });
});

describe("byteChunks", () => {
  it("memecah tanpa mengubah isi data", () => {
    const bytes = Uint8Array.from({ length: 300 }, (_, i) => i % 256);
    const chunks = byteChunks(bytes, 128);
    expect(chunks.map((c) => c.length)).toEqual([128, 128, 44]);
    expect([...chunks.flatMap((c) => [...c])]).toEqual([...bytes]);
  });
});

describe("struk 58 mm", () => {
  const receipt: Receipt = {
    store: "Teapy", address: "Pogung Dalangan RT 08 RW 50 No 187, Sinduadi, Mlati, Sleman", footer: "Terima kasih.", number: "TPY-261101-0001",
    at: "2026-11-01T07:30:00.000Z", cashier: "Crew Dengan Nama Sangat Panjang Sekali Hingga Melewati Lebar", order_type: "Dine-in", table_no: "4", taxLabel: "PB1",
    lines: [{ qty: 2, name: "Jasmine Da Bai Hao Dengan Nama Menu Yang Panjang", sugar: "Less", topping: "Soybean Curd", gross: 58000 }],
    subtotal: 58000, discount: 0, member_discount: 0, redeem_value: 0, service: 0, tax: 5800, rounding: 0, total: 63800, payment: "Tunai", tendered: 70000, change: 6200,
  };
  it("menulis gula, es, dan topping tiap baris, kecuali menu tanpa pilihan", () => {
    const text = receiptLines({ ...receipt, lines: [
      { qty: 1, name: "Grassy Genmaicha", sugar: "Normal", ice: "Normal ice", topping: "Tanpa topping", gross: 20000 },
      { qty: 1, name: "Grassy Genmaicha", sugar: "Less", ice: "Normal ice", topping: "Tanpa topping", gross: 20000 },
      { qty: 1, name: "Rou Gui", sugar: "-", ice: "-", topping: "Tanpa topping", gross: 25000 },
    ] }).join("\n");
    expect(text).toContain("* Normal sugar, Normal ice, No");
    expect(text).toContain("* Less sugar, Normal ice, No");
    expect(text).toMatch(/Rou Gui\n\s+25\.000/);
  });
  it("tidak ada baris melebihi 32 karakter", () => {
    const lines = receiptLines(receipt);
    expect(lines.every((l) => l.length <= 32)).toBe(true);
    expect(lines.join("\n")).toContain("TOTAL");
    expect(lines.join("\n")).toContain("Kembali");
  });
  it("menghasilkan perintah init dan potong kertas", () => {
    const bytes = escPos(["A"]);
    expect([...bytes.slice(0, 2)]).toEqual([0x1b, 0x40]);
    expect([...bytes.slice(-4)]).toEqual([0x1d, 0x56, 0x42, 0x00]);
  });
});
