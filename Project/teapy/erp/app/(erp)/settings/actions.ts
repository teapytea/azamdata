"use server";

import { guarded, num, req, str } from "@/lib/action";
import { FULL, hashPassword, log, type Role } from "@/lib/auth";
import { one, query } from "@/lib/db";
import { getSettings } from "@/lib/settings";

const TIME = /^\d{2}:\d{2}$/;

export async function saveSettings(input: Record<string, string>) {
  return guarded(FULL, async (user) => {
    const s = await getSettings();
    for (const k of ["shift1_start", "shift1_end", "shift2_start", "shift2_end"]) if (!TIME.test(input[k])) throw new Error("Format jam shift harus JJ:MM.");
    const next = {
      ...s,
      store_name: req(input.store_name, "Nama toko", 80), outlet: req(input.outlet, "Nama outlet", 80), address: req(input.address, "Alamat", 200), footer: str(input.footer, 120), wifi: str(input.wifi, 60),
      service_pct: num(input.service_pct, "Service"), tax_pct: num(input.tax_pct, "Pajak"), tax_label: req(input.tax_label, "Label pajak", 12), rounding: num(input.rounding, "Pembulatan", 1),
      sugar_normal_ml: num(input.sugar_normal_ml, "Gula normal"), sugar_less_ml: num(input.sugar_less_ml, "Gula less"), topping_qty: num(input.topping_qty, "Takaran topping"), topping_price: num(input.topping_price, "Harga topping"),
      courier_fee_pct: num(input.courier_fee_pct, "Potongan kurir"), member_discount_pct: num(input.member_discount_pct, "Diskon member"), points_per: num(input.points_per, "Kelipatan poin"), redeem_points: num(input.redeem_points, "Syarat tukar poin"), redeem_value: num(input.redeem_value, "Nilai tukar poin"),
      margin_target: num(input.margin_target, "Target margin"), batch_expiry_hours: Math.round(num(input.batch_expiry_hours, "Batas pakai batch", 1)),
      shift1_start: input.shift1_start, shift1_end: input.shift1_end, shift2_start: input.shift2_start, shift2_end: input.shift2_end,
    };
    if (input.void_pin) {
      if (!/^\d{4,8}$/.test(input.void_pin)) throw new Error("PIN supervisor harus 4-8 angka.");
      next.void_pin_hash = await hashPassword(input.void_pin);
    }
    await query("update app_settings set data=$1::jsonb where key='main'", [JSON.stringify(next)]);
    await log("Pengaturan diperbarui", "", user.name);
  });
}

export async function saveAccount(input: Record<string, string>) {
  return guarded(FULL, async (user) => {
    const email = req(input.email, "Email login", 254).toLowerCase();
    const name = req(input.name, "Nama", 120);
    const role = input.role as Role;
    if (!["admin", "marketing", "cashier"].includes(role)) throw new Error("Peran tidak valid.");
    const password = String(input.password || "");
    if (password && password.length < 8) throw new Error("Password minimal 8 karakter.");
    if (input.id) {
      const target = await one<{ role: Role }>("select role from users where id=$1", [input.id]);
      if (target?.role === "owner") throw new Error("Akun owner tidak bisa diubah dari sini.");
      if (input.id === user.id && input.active === "false") throw new Error("Anda tidak bisa menonaktifkan akun sendiri.");
      await query("update users set email=$2, name=$3, role=$4, active=$5 where id=$1", [input.id, email, name, role, input.active !== "false"]);
      if (password) await query("update users set password_hash=$2, must_change_password=true where id=$1", [input.id, await hashPassword(password)]);
    } else {
      if (!password) throw new Error("Isi password awal.");
      await query("insert into users (email, name, role, password_hash, must_change_password) values ($1,$2,$3,$4,true)", [email, name, role, await hashPassword(password)]);
    }
  });
}
