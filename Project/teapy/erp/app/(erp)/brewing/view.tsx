"use client";

import { useState } from "react";
import { CalendarCheck, CheckCircle2, Coffee, Droplet, Download, Plus, Tag, Timer } from "lucide-react";
import { Bar, Card, Empty, Field, FormModal, Kpi, PageHead, Pager, SearchBox, Tabs, usePaged } from "@/components/ui";
import { downloadCsv, fmtDate, fmtDateTime, fmtLong, fmtTime, qty, rp, todayWIB } from "@/lib/format";
import { confirmLabel, drainBatch, startBatch } from "./actions";

type Batch = { id: string; code: string; made_on: string; made_at: string; expires_at: string; initial_ml: number; remaining_ml: number; cost_per_ml: number; operator: string; labeled_at: string | null; labeled_by: string; drained_at: string | null; name: string; origin: string; serving_ml: number };
type Waste = { id: number; at: string; item: string; qty: number; unit: string; cost: number; reason: string; actor: string };

function stateOf(b: Batch) {
  if (b.drained_at) return { id: "archive", label: "Dibuang", cls: "" };
  if (b.remaining_ml <= 0) return { id: "archive", label: "Habis terjual", cls: "" };
  if (new Date(b.expires_at) < new Date()) return { id: "expired", label: "Lewat batas", cls: "badge-red" };
  if (!b.labeled_at) return { id: "label", label: "Belum dilabeli", cls: "badge-sand" };
  return { id: "ready", label: "Siap saji", cls: "badge-moss" };
}

export function BrewingView({ batches, products, waste, expiryHours }: { batches: Batch[]; products: { id: string; name: string; yield_ml: number }[]; waste: Waste[]; expiryHours: number }) {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [label, setLabel] = useState<Batch | null>(null);
  const [drain, setDrain] = useState<Batch | null>(null);

  const withState = batches.map((b) => ({ ...b, state: stateOf(b) }));
  const count = (id: string) => withState.filter((b) => b.state.id === id).length;
  const live = withState.filter((b) => b.state.id === "ready");
  const liveMl = live.reduce((s, b) => s + b.remaining_ml, 0);
  const today = todayWIB();
  const wasteToday = waste.filter((w) => w.at && new Date(w.at).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }) === today);
  const filtered = withState.filter((b) => (tab === "all" || b.state.id === tab) && `${b.code} ${b.name} ${b.operator}`.toLowerCase().includes(search.toLowerCase()));
  const paged = usePaged(filtered, 8);

  return (
    <>
      <PageHead crumb="Brewing & Quality Control Log" title="Batch Brewing & Quality Control"
        description="Seduh batch sesuai resep, pastikan setiap batch berlabel tanggal produksi, dan kelola sisa batch yang lewat batas."
        right={<span className="mono rounded bg-mid px-2 py-0.5 text-soft">{fmtLong()}</span>}
        actions={<>
          <button className="btn" onClick={() => downloadCsv("batch", [["Batch", "Menu", "Tanggal label", "Batas", "Awal ml", "Sisa ml", "Status", "Operator"], ...withState.map((b) => [b.code, b.name, b.labeled_at ? b.made_on : "", b.expires_at, b.initial_ml, b.remaining_ml, b.state.label, b.operator])])}><Download size={15} />Ekspor Log Batch</button>
          <button className="btn btn-primary" onClick={() => setCreating(true)}><Plus size={15} />Mulai Batch Seduh Baru</button>
        </>} />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Batch Siap Saji" value={live.length} unit="Batch" note={`${qty(liveMl)} ml tersisa`} icon={<Coffee size={16} />}><Bar value={live.length ? 100 : 0} /></Kpi>
        <Kpi label="Menunggu Label" tone={count("label") ? "red" : undefined} value={count("label")} unit="Batch" note="Belum bisa dijual di kasir" icon={<Tag size={16} />} />
        <Kpi label="Lewat Batas" tone={count("expired") ? "red" : undefined} value={count("expired")} unit="Batch" note={`Batas pakai ${expiryHours} jam sejak dibuat`} icon={<Timer size={16} />} />
        <Kpi label="Waste Hari Ini" value={rp(wasteToday.reduce((s, w) => s + w.cost, 0))} note={`${wasteToday.length} catatan`} icon={<Droplet size={16} />} />
      </section>

      <section className="card flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <SearchBox className="flex-1" value={search} onChange={setSearch} placeholder="Cari batch, menu, atau operator..." />
        <Tabs value={tab} onChange={setTab} items={[
          { id: "all", label: `Semua (${withState.length})` }, { id: "ready", label: `Siap saji (${count("ready")})` }, { id: "label", label: `Belum dilabeli (${count("label")})` },
          { id: "expired", label: `Lewat batas (${count("expired")})` }, { id: "archive", label: `Arsip (${count("archive")})` },
        ]} />
      </section>

      <section className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="card overflow-hidden">
          <div className="bg-low px-5 py-4"><h2 className="h-card">Batch Ledger</h2><p className="muted text-[12px]">Kasir mengambil batch siap saji tertua lebih dulu.</p></div>
          <div className="overflow-x-auto">
            <table className="tbl min-w-[760px]">
              <thead><tr><th>Batch & Waktu</th><th>Menu</th><th className="w-44">Volume (sisa/awal)</th><th>Label tanggal</th><th>Status</th><th>PIC</th><th className="num">Aksi</th></tr></thead>
              <tbody>
                {paged.items.map((b) => (
                  <tr key={b.id} className={b.state.id === "archive" ? "opacity-60" : ""}>
                    <td className="mono font-medium">{b.code}<div className="font-normal text-soft">{fmtTime(b.made_at)}</div></td>
                    <td className="font-medium">{b.name}<div className="mono font-normal text-soft">{b.origin}</div></td>
                    <td><div className="mono mb-1">{qty(b.remaining_ml)} / {qty(b.initial_ml)} ml</div><Bar value={(b.remaining_ml / b.initial_ml) * 100} /><div className="mono mt-1 text-soft">± {Math.floor(b.remaining_ml / b.serving_ml)} cup</div></td>
                    <td className="mono">{b.labeled_at ? <>{fmtDate(b.made_on)}<div className="text-soft">oleh {b.labeled_by}</div></> : <span className="text-soft">Belum dikonfirmasi</span>}</td>
                    <td><span className={`badge ${b.state.cls}`}>{b.state.label}</span><div className="mono mt-1 text-soft">s/d {fmtDateTime(b.expires_at)}</div></td>
                    <td>{b.operator}</td>
                    <td className="num">
                      {b.state.id === "label" && <button className="btn btn-sm btn-primary" onClick={() => setLabel(b)}>Konfirmasi Label</button>}
                      {(b.state.id === "expired" || b.state.id === "ready") && <button className={`btn btn-sm ${b.state.id === "expired" ? "btn-danger" : "btn-flat"}`} onClick={() => setDrain(b)}>Buang & Catat</button>}
                    </td>
                  </tr>
                ))}
                {!paged.items.length && <tr><td colSpan={7}><Empty>Belum ada batch. Mulai batch seduh baru.</Empty></td></tr>}
              </tbody>
            </table>
          </div>
          <Pager {...paged} noun="batch" />
        </div>
        <div className="flex flex-col gap-4">
          <Card title="Protokol Label" right={<CalendarCheck size={16} className="text-maroon" />}>
            <ol className="flex flex-col gap-3">
              {["Seduh batch sesuai resep. Bahan terpotong otomatis.", "Tempel label bertuliskan kode batch dan tanggal produksi.", "Konfirmasi label di sini atau di portal karyawan. Setelah itu batch bisa dijual di kasir.", `Sisa batch lewat ${expiryHours} jam dibuang dan dicatat sebagai waste.`].map((t, i) => (
                <li key={t} className="flex gap-2"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-moss" /><span><b className="mono mr-1">{i + 1}.</b>{t}</span></li>
              ))}
            </ol>
          </Card>
          <Card title="Waste Ledger" subtitle="Sisa batch dan selisih audit stok.">
            {waste.length ? (
              <ul className="flex flex-col divide-y divide-line">
                {waste.slice(0, 8).map((w) => (
                  <li key={w.id} className="py-2">
                    <div className="flex justify-between gap-2 font-medium"><span className="min-w-0 truncate">{w.item}</span><span className="mono shrink-0">{rp(w.cost)}</span></div>
                    <div className="mono text-soft">{qty(w.qty)} {w.unit} · {w.reason} · {fmtDate(w.at)}</div>
                  </li>
                ))}
              </ul>
            ) : <Empty>Belum ada waste.</Empty>}
          </Card>
        </div>
      </section>

      {creating && (
        <FormModal title="Mulai Batch Seduh Baru" description="Bahan langsung dipotong dari stok sesuai resep." action={startBatch} success="Batch dibuat. Tempel label lalu konfirmasi." submit="Mulai seduh" onClose={() => setCreating(false)}>
          <Field label="Menu"><select className="input" name="product_id" required>{products.map((p) => <option key={p.id} value={p.id}>{p.name} ({qty(p.yield_ml)} ml)</option>)}</select></Field>
          <Field label="Jumlah batch" hint="1 = satu resep penuh"><input className="input" name="factor" type="number" min="0.1" step="0.1" defaultValue={1} required /></Field>
        </FormModal>
      )}
      {label && (
        <FormModal title={`Konfirmasi Label ${label.code}`} description={label.name} action={confirmLabel} extra={{ id: label.id }} success="Label dikonfirmasi. Batch siap dijual." submit="Label sudah ditempel" onClose={() => setLabel(null)}>
          <Field label="Tanggal pada label"><input className="input" type="date" name="made_on" defaultValue={label.made_on} required /></Field>
        </FormModal>
      )}
      {drain && (
        <FormModal danger title={`Buang ${drain.code}`} description={`Sisa ${qty(drain.remaining_ml)} ml senilai ${rp(drain.remaining_ml * drain.cost_per_ml)} dicatat sebagai waste.`} action={drainBatch} extra={{ id: drain.id }} success="Sisa batch dicatat sebagai waste." submit="Buang & catat" onClose={() => setDrain(null)}>
          <Field label="Alasan"><input className="input" name="reason" defaultValue={stateOf(drain).id === "expired" ? "Lewat batas pakai" : ""} required /></Field>
        </FormModal>
      )}
    </>
  );
}
