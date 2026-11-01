import { one } from "./db";

export type Settings = {
  store_name: string; outlet: string; address: string; footer: string; wifi: string;
  service_pct: number; tax_pct: number; tax_label: string; rounding: number;
  sugar_normal_ml: number; sugar_less_ml: number; topping_qty: number; topping_price: number;
  courier_fee_pct: number; member_discount_pct: number; points_per: number; redeem_points: number; redeem_value: number;
  void_pin_hash: string; margin_target: number; batch_expiry_hours: number;
  shift1_start: string; shift1_end: string; shift2_start: string; shift2_end: string;
};
export type PublicSettings = Omit<Settings, "void_pin_hash"> & { has_void_pin: boolean };

export async function getSettings(): Promise<Settings> {
  const row = await one<{ data: Settings }>("select data from app_settings where key = 'main'");
  return row!.data;
}

export function publicSettings(s: Settings): PublicSettings {
  const { void_pin_hash, ...rest } = s;
  return { ...rest, has_void_pin: !!void_pin_hash };
}
