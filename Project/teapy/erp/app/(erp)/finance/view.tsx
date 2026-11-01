"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeftRight, CheckCircle2, Download, Landmark, Plus, Receipt, TrendingUp, Trash2, Wallet } from "lucide-react";
import { ActionButton, Card, Empty, Field, FormModal, Kpi, PageHead } from "@/components/ui";
import { downloadCsv, fmtDate, fmtDateTime, pct, rp, todayWIB } from "@/lib/format";
import { addExpense, addReconciliation, deleteExpense } from "./actions";

type Sales = { gross: number; discount: number; fee: number; service: number; tax: number; rounding: number; cogs: number; total: number; n: number };
type Expense = { id: string; at: string; category: string; note: string; amount: number; source: string; ref: string };
type Recon = { id: string; date: string; method: string; system_amount: number; actual_amount: number; note: string; actor: string };

const CATEGORIES = ["Payroll", "Sewa", "Utilitas", "Marketing", "Operasional", "Lain-lain"];
const COLORS = ["#48161b", "#8c4c4f", "#6a5b54", "#0f2d1d", "#c37a7d", "#d7c1c1"];

export function FinanceView({ month, sales, categories, methods, expenses, waste, unpaidPo, unpaidShifts, recon, taxLabel, target }: {
  month: string; sales: Sales; categories: { type: string; qty: number; gross: number; cogs: number }[]; methods: { payment: string; total: number; n: number }[];
  expenses: Expense[]; waste: number; unpaidPo: { total: number; n: number }; unpaidShifts: { total: number; n: number }; recon: Recon[]; taxLabel: string; target: number;
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [reconciling, setReconciling] = useState(false);

  const net = sales.gross - sales.discount - sales.fee + sales.service + sales.rounding;
  const gross = net - sales.cogs;
  const opex = expenses.reduce((s, e) => s + e.amount, 0);
  const operating = gross - waste - opex;
  const statement: [string, number, boolean?][] = [
    ["Penjualan bruto", sales.gross], ["Diskon & tukar poin", -sales.discount], ["Potongan kanal kurir", -sales.fee], ["Service & pembulatan", sales.service + sales.rounding],
    ["Pendapatan bersih", net, true], ["HPP penjualan", -sales.cogs], ["Laba kotor", gross, true], ["Waste & selisih stok", -waste], ["Beban operasional", -opex], ["Hasil operasional", operating, true],
  ];
  const byCategory = Object.entries(expenses.reduce<Record<string, number>>((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {})).sort((a, b) => b[1] - a[1]);
  const catGross = categories.reduce((s, c) => s + c.gross, 0);
  const catCogs = categories.reduce((s, c) => s + c.cogs, 0);

  return (
    <>
      <PageHead crumb="Finance & Accounting Ledger" title="Finance & Profit-and-Loss Statement" description="Laba rugi bulanan dari penjualan POS, HPP batch, waste, beban operasional, dan titipan pajak."
        right={<label className="mono flex items-center gap-2 text-soft">Periode<input aria-label="Periode bulan" type="month" className="input !h-7 w-40" value={month} onChange={(e) => e.target.value && router.push(`/finance?month=${e.target.value}`)} /></label>}
        actions={<>
          <button className="btn btn-primary" onClick={() => setAdding(true)}><Plus size={15} />Catat Beban Operasional</button>
          <button className="btn" onClick={() => setReconciling(true)}><ArrowLeftRight size={15} />Rekonsiliasi EDC & Kasir</button>
          <button className="btn" onClick={() => downloadCsv(`laba-rugi-${month}`, [["Komponen", "Nominal"], ...statement.map(([k, v]) => [k, Math.round(v)]), [], ["Tanggal", "Kategori", "Keterangan", "Nominal", "Sumber"], ...expenses.map((e) => [e.at, e.category, e.note, e.amount, e.source])])}><Download size={15} />Ekspor Laporan</button>
        </>} />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Total Pendapatan Bersih" value={rp(net)} note={`${sales.n} transaksi POS`} icon={<Wallet size={16} />} />
        <Kpi label="HPP / COGS" value={rp(sales.cogs)} note={`${pct(net ? (sales.cogs / net) * 100 : 0)} dari pendapatan`} icon={<Receipt size={16} />} />
        <Kpi label="Gross Profit" value={rp(gross)} note={`Margin ${pct(net ? (gross / net) * 100 : 0)} · target ${target}%`} icon={<TrendingUp size={16} />} />
        <Kpi label="Hasil Operasional" tone={operating < 0 ? "red" : undefined} value={rp(operating)} note={`Beban ${rp(opex)} · waste ${rp(waste)}`} icon={<CheckCircle2 size={16} />} />
      </section>

      <section className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card flush title="Aliran Pendapatan & Laba Kotor per Kategori" subtitle="Dihitung dari baris penjualan POS dan HPP batch.">
            <div className="overflow-x-auto"><table className="tbl min-w-[620px]">
              <thead><tr><th>Lini Produk</th><th className="num">Cup</th><th className="num">Pendapatan</th><th className="num">HPP</th><th className="num">Laba Kotor</th><th className="num">Margin</th></tr></thead>
              <tbody>
                {categories.map((c) => <tr key={c.type}><td className="font-medium">{c.type}</td><td className="num">{c.qty}</td><td className="num">{rp(c.gross)}</td><td className="num">{rp(c.cogs)}</td><td className="num">{rp(c.gross - c.cogs)}</td><td className="num">{pct(c.gross ? ((c.gross - c.cogs) / c.gross) * 100 : 0)}</td></tr>)}
                {categories.length > 0 && <tr className="bg-low font-semibold"><td>Total</td><td className="num">{categories.reduce((s, c) => s + c.qty, 0)}</td><td className="num">{rp(catGross)}</td><td className="num">{rp(catCogs)}</td><td className="num">{rp(catGross - catCogs)}</td><td className="num">{pct(catGross ? ((catGross - catCogs) / catGross) * 100 : 0)}</td></tr>}
                {!categories.length && <tr><td colSpan={6}><Empty>Belum ada penjualan pada periode ini.</Empty></td></tr>}
              </tbody>
            </table></div>
          </Card>
          <Card title="Laba Rugi" subtitle={`Periode ${month}`}>
            <dl className="flex flex-col">
              {statement.map(([k, v, bold]) => <div key={k} className={`flex justify-between gap-3 border-b border-line py-2 ${bold ? "font-semibold" : ""}`}><dt>{k}</dt><dd className={`mono text-[13px] ${v < 0 ? "text-danger" : ""}`}>{rp(v)}</dd></div>)}
            </dl>
            <p className="mono mt-3 text-soft">Pembelian bahan masuk ke nilai stok dan menjadi HPP saat terjual, sehingga tidak dihitung dua kali.</p>
          </Card>
          <Card title="Jurnal Beban Operasional" subtitle="Beban manual, upah shift, dan fee marketing yang sudah dibayar.">
            {expenses.length ? <ul className="flex flex-col divide-y divide-line">{expenses.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0"><p className="font-medium">{e.note || e.category}</p><p className="mono text-soft">{e.category} · {fmtDateTime(e.at)} · {e.source}</p></div>
                <div className="flex shrink-0 items-center gap-2"><span className="mono text-[13px]">{rp(e.amount)}</span>
                  {e.source === "Manual" && <ActionButton className="rounded p-1 hover:bg-mid" action={deleteExpense} input={{ id: e.id }} confirm="Hapus beban ini?"><Trash2 size={13} /><span className="sr-only">Hapus</span></ActionButton>}
                </div>
              </li>
            ))}</ul> : <Empty>Belum ada beban pada periode ini.</Empty>}
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <Card title="Settlement per Metode" subtitle="Ringkasan kasir dan rekonsiliasi manual.">
            {methods.length ? <div className="flex flex-col gap-2">{methods.map((m) => <div key={m.payment} className="flex justify-between rounded bg-low p-3"><span className="font-medium">{m.payment}<span className="mono ml-2 font-normal text-soft">{m.n} trx</span></span><span className="mono text-[13px]">{rp(m.total)}</span></div>)}</div> : <Empty>Belum ada settlement.</Empty>}
            {recon.length > 0 && (
              <ul className="mt-3 flex flex-col gap-1">{recon.slice(0, 6).map((r) => {
                const diff = r.actual_amount - r.system_amount;
                return <li key={r.id} className="mono flex justify-between gap-2"><span>{fmtDate(r.date)} · {r.method}</span><span className={diff ? "text-danger" : "text-moss"}>{diff ? `Selisih ${rp(diff)}` : "Cocok"}</span></li>;
              })}</ul>
            )}
          </Card>
          <Card title="Struktur Beban Operasional" right={<span className="mono">{rp(opex)}</span>}>
            {byCategory.length ? <>
              <div className="flex h-2.5 overflow-hidden rounded-full">{byCategory.map(([k, v], i) => <span key={k} title={k} style={{ width: `${(v / opex) * 100}%`, background: COLORS[i % COLORS.length] }} />)}</div>
              <ul className="mt-3 flex flex-col gap-2">{byCategory.map(([k, v], i) => <li key={k} className="flex items-center justify-between gap-2"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />{k}</span><span className="mono">{Math.round((v / opex) * 100)}% · {rp(v)}</span></li>)}</ul>
            </> : <Empty>Belum ada beban.</Empty>}
          </Card>
          <Card title={`Titipan Pajak (${taxLabel})`} right={<Landmark size={16} className="text-maroon" />}>
            <p className="mono text-[20px] font-medium">{rp(sales.tax)}</p>
            <p className="muted mt-1">Pajak yang ditagih ke pelanggan, dipisahkan dari pendapatan. Tarif diatur di Pengaturan.</p>
          </Card>
          <Card title="Kewajiban Belum Dibayar">
            <dl className="flex flex-col gap-2">
              <div className="flex justify-between"><dt>Hutang supplier ({unpaidPo.n} PO)</dt><dd className="mono">{rp(unpaidPo.total)}</dd></div>
              <div className="flex justify-between"><dt>Upah shift ({unpaidShifts.n} shift)</dt><dd className="mono">{rp(unpaidShifts.total)}</dd></div>
            </dl>
          </Card>
        </div>
      </section>

      {adding && (
        <FormModal title="Catat Beban Operasional" action={addExpense} success="Beban dicatat." onClose={() => setAdding(false)}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tanggal"><input className="input" type="date" name="date" defaultValue={todayWIB()} required /></Field>
            <Field label="Kategori"><select className="input" name="category">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
          </div>
          <Field label="Keterangan"><input className="input" name="note" required /></Field>
          <Field label="Nominal (Rp)"><input className="input" type="number" name="amount" min="1" required /></Field>
        </FormModal>
      )}
      {reconciling && (
        <FormModal title="Rekonsiliasi EDC & Kasir" description="Masukkan nilai dari mutasi bank atau hitungan kas." action={addReconciliation} success="Rekonsiliasi disimpan." onClose={() => setReconciling(false)}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tanggal"><input className="input" type="date" name="date" defaultValue={todayWIB()} required /></Field>
            <Field label="Metode"><select className="input" name="method"><option>QRIS</option><option>EDC</option><option>Tunai</option><option>Marketplace</option></select></Field>
            <Field label="Nilai sistem (Rp)"><input className="input" type="number" name="system_amount" min="0" required /></Field>
            <Field label="Nilai diterima (Rp)"><input className="input" type="number" name="actual_amount" min="0" required /></Field>
          </div>
          <Field label="Catatan"><input className="input" name="note" /></Field>
        </FormModal>
      )}
    </>
  );
}
