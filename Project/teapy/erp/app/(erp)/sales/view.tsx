"use client";

import { useState } from "react";
import { ClipboardList, Download, Leaf, Plus, ShoppingBag, TrendingUp, Wallet } from "lucide-react";
import { Bar, Card, Empty, Kpi, Modal, PageHead, Pager, SearchBox, Tabs, usePaged } from "@/components/ui";
import { addDays, downloadCsv, fmtDate, fmtDateTime, fmtTime, pct, qty, rp } from "@/lib/format";

type Sale = { id: string; number: string; at: string; order_type: string; table_no: string; customer_name: string; subtotal: number; total: number; cogs: number; payment: string; reference: string; status: string; cashier: string; void_reason: string };
type Line = { sale_id: string; name: string; qty: number; sugar: string; topping: string; gross: number; cogs: number; serving_ml: number; type: string; date: string; hour: number };
type Register = { id: string; cashier: string; opened_at: string; opening_cash: number; closed_at: string | null; closing_cash: number | null; expected_cash: number | null };

const dateOf = (v: string) => new Date(v).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });

export function SalesView({ today, sales, lines, registers }: { today: string; sales: Sale[]; lines: Line[]; registers: Register[] }) {
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("all");
  const [range, setRange] = useState<"today" | "week" | "month">("today");
  const [recap, setRecap] = useState(false);

  const from = range === "today" ? today : addDays(today, range === "week" ? -6 : -30);
  const inRange = sales.filter((s) => dateOf(s.at) >= from);
  const done = inRange.filter((s) => s.status === "Selesai");
  const rangeLines = lines.filter((l) => l.date >= from);
  const revenue = done.reduce((s, x) => s + x.total, 0);
  const cogs = done.reduce((s, x) => s + x.cogs, 0);
  const cups = rangeLines.reduce((s, l) => s + l.qty, 0);
  const ml = rangeLines.reduce((s, l) => s + l.qty * l.serving_ml, 0);
  const net = done.reduce((s, x) => s + x.subtotal, 0);
  const margin = net ? ((net - cogs) / net) * 100 : 0;

  const byMethod = (m: string) => done.filter((s) => s.payment === m).length;
  const share = (m: string) => (done.length ? Math.round((byMethod(m) / done.length) * 100) : 0);
  const filtered = inRange.filter((s) => (method === "all" || s.payment === method) && `${s.number} ${s.customer_name} ${s.cashier} ${lines.filter((l) => l.sale_id === s.id).map((l) => l.name).join(" ")}`.toLowerCase().includes(search.toLowerCase()));
  const paged = usePaged(filtered, 10);

  const board = Object.values(rangeLines.reduce<Record<string, { name: string; qty: number; gross: number; cogs: number }>>((acc, l) => {
    const x = (acc[l.name] ||= { name: l.name, qty: 0, gross: 0, cogs: 0 });
    x.qty += l.qty; x.gross += l.gross; x.cogs += l.cogs;
    return acc;
  }, {})).sort((a, b) => b.qty - a.qty);

  const hours = Array.from({ length: 13 }, (_, i) => 10 + i);
  const perHour = hours.map((h) => rangeLines.filter((l) => l.hour === h).reduce((s, l) => s + l.qty, 0));
  const peak = Math.max(...perHour, 0);

  return (
    <>
      <PageHead crumb="POS & Sales Ledger" title="POS & Sales Operations" description="Transaksi kasir, pemotongan stok otomatis, dan performa penjualan menu."
        actions={<>
          <button className="btn" onClick={() => downloadCsv("penjualan", [["No", "Waktu", "Jenis", "Pelanggan", "Item", "Total", "HPP", "Metode", "Referensi", "Kasir", "Status"], ...filtered.map((s) => [s.number, s.at, s.order_type, s.customer_name, lines.filter((l) => l.sale_id === s.id).map((l) => `${l.qty}x ${l.name}`).join("; "), s.total, Math.round(s.cogs), s.payment, s.reference, s.cashier, s.status])])}><Download size={15} />Ekspor Sales CSV</button>
          <button className="btn" onClick={() => setRecap(true)}><ClipboardList size={15} />Rekap Shift Kasir</button>
          <a className="btn btn-primary" href="/pos" target="_blank" rel="noreferrer"><Plus size={15} />Buka Kasir</a>
        </>} />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Total Penjualan" value={rp(revenue)} note={`${cups} cup terjual`} icon={<Wallet size={16} />} />
        <Kpi label="Rata-rata Transaksi (AOV)" value={rp(done.length ? revenue / done.length : 0)} note={`${done.length} struk selesai`} icon={<ShoppingBag size={16} />} />
        <Kpi label="Volume Terjual" value={qty(ml)} unit="ml" note={`${cups} cup & lid terpotong`} icon={<Leaf size={16} />} />
        <Kpi label="Gross Margin Kasir" value={pct(margin)} note={`HPP riil: ${rp(cogs)}`} icon={<TrendingUp size={16} />} />
      </section>

      <section className="card flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <SearchBox className="flex-1" value={search} onChange={setSearch} placeholder="Cari no. struk, pelanggan, atau menu..." />
        <Tabs value={range} onChange={setRange} items={[{ id: "today", label: "Hari ini" }, { id: "week", label: "7 hari" }, { id: "month", label: "30 hari" }]} />
        <Tabs value={method} onChange={setMethod} items={[{ id: "all", label: "Semua" }, { id: "QRIS", label: `QRIS ${share("QRIS")}%` }, { id: "EDC", label: `EDC ${share("EDC")}%` }, { id: "Tunai", label: `Tunai ${share("Tunai")}%` }, { id: "Marketplace", label: `Kurir ${share("Marketplace")}%` }]} />
      </section>

      <section className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="card overflow-hidden">
          <div className="bg-low px-5 py-4"><h2 className="h-card">Live Transaction Ledger</h2></div>
          <div className="overflow-x-auto">
            <table className="tbl min-w-[760px]">
              <thead><tr><th>No. Struk</th><th>Waktu</th><th>Menu</th><th className="num">Total</th><th>Metode</th><th>Status</th></tr></thead>
              <tbody>
                {paged.items.map((s) => {
                  const items = lines.filter((l) => l.sale_id === s.id);
                  return (
                    <tr key={s.id} className={s.status === "Dibatalkan" ? "opacity-60" : ""}>
                      <td className="mono font-medium">{s.number}<div className="font-normal text-soft">{s.cashier}</div></td>
                      <td className="mono">{range === "today" ? fmtTime(s.at) : fmtDateTime(s.at)}</td>
                      <td>{items.length ? items.map((l, i) => <div key={i}>{l.qty}x {l.name}{l.topping !== "Tanpa topping" ? <span className="mono text-soft"> + {l.topping}</span> : null}</div>) : <span className="muted">{s.void_reason || "-"}</span>}<div className="mono text-soft">{s.order_type}{s.table_no ? ` · Meja ${s.table_no}` : ""}{s.customer_name ? ` · ${s.customer_name}` : ""}</div></td>
                      <td className="num">{rp(s.total)}</td>
                      <td><span className="badge">{s.payment}</span></td>
                      <td><span className={`badge ${s.status === "Selesai" ? "badge-moss" : "badge-red"}`}>{s.status}</span></td>
                    </tr>
                  );
                })}
                {!paged.items.length && <tr><td colSpan={6}><Empty>Belum ada transaksi pada periode ini.</Empty></td></tr>}
              </tbody>
            </table>
          </div>
          <Pager {...paged} noun="transaksi" />
        </div>

        <div className="flex flex-col gap-4">
          <Card title="Top Selling Blends">
            {board.length ? <div className="flex flex-col gap-3">{board.slice(0, 5).map((b, i) => (
              <div key={b.name}>
                <div className="flex justify-between font-medium"><span>{i + 1}. {b.name}</span><span className="mono text-[12px]">{b.qty} cups</span></div>
                <Bar value={(b.qty / board[0].qty) * 100} />
                <div className="mono mt-1 flex justify-between text-soft"><span>{rp(b.gross)}</span><span>Margin {pct(b.gross ? ((b.gross - b.cogs) / b.gross) * 100 : 0)}</span></div>
              </div>
            ))}</div> : <Empty>Belum ada penjualan.</Empty>}
          </Card>
          <Card title="Hourly Brewing Velocity" subtitle="Jumlah cup per jam, jam operasional 10.00 - 22.00." right={peak ? <span className="badge badge-moss">Puncak {peak} cup</span> : undefined}>
            <div className="flex h-32 items-end gap-1" role="img" aria-label="Grafik cup per jam">
              {hours.map((h, i) => (
                <div key={h} className="flex h-full flex-1 flex-col justify-end gap-1">
                  <div title={`${h}.00: ${perHour[i]} cup`} className="w-full rounded-t" style={{ height: `${peak ? Math.max(3, (perHour[i] / peak) * 85) : 3}%`, background: perHour[i] === peak && peak ? "var(--color-maroon)" : perHour[i] ? "var(--color-rose)" : "var(--color-mid)" }} />
                  <span className="mono text-center text-[9px] text-soft">{h}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {recap && (
        <Modal wide title="Rekap Shift Kasir" onClose={() => setRecap(false)}>
          {registers.length ? <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Kasir</th><th>Dibuka</th><th>Ditutup</th><th className="num">Kas awal</th><th className="num">Seharusnya</th><th className="num">Dihitung</th><th className="num">Selisih</th></tr></thead><tbody>
            {registers.map((r) => {
              const variance = r.closing_cash !== null && r.expected_cash !== null ? r.closing_cash - r.expected_cash : null;
              return <tr key={r.id}><td>{r.cashier}</td><td className="mono">{fmtDateTime(r.opened_at)}</td><td className="mono">{r.closed_at ? fmtDateTime(r.closed_at) : <span className="badge badge-moss">Terbuka</span>}</td><td className="num">{rp(r.opening_cash)}</td><td className="num">{r.expected_cash === null ? "-" : rp(r.expected_cash)}</td><td className="num">{r.closing_cash === null ? "-" : rp(r.closing_cash)}</td><td className={`num ${variance ? "text-danger" : ""}`}>{variance === null ? "-" : rp(variance)}</td></tr>;
            })}
          </tbody></table></div> : <Empty>Belum ada shift kasir. Mulai dari {fmtDate(today)}.</Empty>}
        </Modal>
      )}
    </>
  );
}
