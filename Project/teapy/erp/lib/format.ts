export const TZ = "Asia/Jakarta";
export const rp = (n: number) => "Rp " + Math.round(Number(n) || 0).toLocaleString("id-ID");
export const qty = (n: number) => (Number(n) || 0).toLocaleString("id-ID", { maximumFractionDigits: 1 });
export const pct = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1) + "%";

export function todayWIB(d = new Date()) {
  return d.toLocaleDateString("en-CA", { timeZone: TZ });
}
export function addDays(date: string, days: number) {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
const parse = (v: string) => new Date(v.length === 10 ? v + "T00:00:00+07:00" : v);
export const fmtDate = (v?: string | null) =>
  v ? parse(v).toLocaleDateString("id-ID", { timeZone: TZ, day: "numeric", month: "short", year: "numeric" }) : "-";
export const fmtLong = (v?: string) =>
  (v ? parse(v) : new Date()).toLocaleDateString("id-ID", { timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" });
export const fmtTime = (v?: string | null) =>
  v ? new Date(v).toLocaleTimeString("id-ID", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }) + " WIB" : "-";
export const fmtDateTime = (v?: string | null) => (v ? `${fmtDate(v)}, ${fmtTime(v)}` : "-");

export function monthRange(date = todayWIB()) {
  const from = date.slice(0, 8) + "01";
  const d = new Date(from + "T00:00:00Z");
  d.setUTCMonth(d.getUTCMonth() + 1);
  return { from, to: d.toISOString().slice(0, 10) };
}

export function downloadCsv(name: string, rows: (string | number | null | undefined)[][]) {
  const text = rows.map((r) => r.map((c) => `"${String(c ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob(["﻿" + text], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}-${todayWIB()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
