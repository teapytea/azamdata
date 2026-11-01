"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, FlaskConical, Hourglass, Plus, ShieldCheck, Wallet } from "lucide-react";
import { Bar, Card, Empty, Field, FormModal, Kpi, Modal, PageHead, Pager, SearchBox, Tabs, usePaged } from "@/components/ui";
import { downloadCsv, fmtDateTime, fmtLong, qty, rp } from "@/lib/format";
import { auditStock, saveMaterial } from "./actions";

export type Material = { id: string; sku: string; name: string; category: string; unit: string; stock: number; min_stock: number; unit_cost: number; note: string };
type Move = { id: number; at: string; delta: number; kind: string; ref: string; note: string; actor: string; name: string; unit: string };

const CATEGORIES = ["Daun teh", "Bahan baku", "Bahan saji", "Kemasan", "Topping"];

export function InventoryView({ materials, moves, expired, lastAudit }: { materials: Material[]; moves: Move[]; expired: number; lastAudit?: { at: string; detail: string; actor: string } }) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [edit, setEdit] = useState<Partial<Material> | null>(null);
  const [audit, setAudit] = useState<Material | null>(null);
  const [sim, setSim] = useState(false);

  const low = materials.filter((m) => m.stock <= m.min_stock);
  const value = materials.reduce((s, m) => s + m.stock * m.unit_cost, 0);
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return materials.filter((m) => (cat === "all" || m.category === cat) && (!q || `${m.name} ${m.sku} ${m.note}`.toLowerCase().includes(q)));
  }, [materials, search, cat]);
  const paged = usePaged(filtered, 12);
  const count = (c: string) => materials.filter((m) => m.category === c).length;

  return (
    <>
      <PageHead crumb="Inventory Ledger & Stock Movement" title="Inventory & Stock Logistics"
        description="Audit stok, pemotongan otomatis dari resep dan penjualan, serta pengelolaan bahan baku."
        right={<span className="mono rounded bg-mid px-2 py-0.5 text-soft">{fmtLong()}</span>}
        actions={<>
          <button className="btn" onClick={() => setSim(true)}><FlaskConical size={15} />Simulasi Restock</button>
          <button className="btn btn-primary" onClick={() => setEdit({})}><Plus size={15} />Tambah Bahan Baru</button>
        </>} />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Total Valuasi Bahan" value={rp(value)} note={`${materials.length} SKU bahan aktif`} icon={<Wallet size={16} />}><Bar value={100} /></Kpi>
        <Kpi label="Status Kritis" tone={low.length ? "red" : undefined} value={`${low.length} Bahan`} note={low.length ? "Di bawah atau sama dengan batas minimum" : "Tidak ada yang kritis"} icon={<AlertTriangle size={16} />}>
          <Bar tone="red" value={materials.length ? (low.length / materials.length) * 100 : 0} />
        </Kpi>
        <Kpi label="Bahan Aman" value={`${materials.length - low.length} Bahan`} note="Di atas batas minimum" icon={<CheckCircle2 size={16} />}>
          <Bar tone="moss" value={materials.length ? ((materials.length - low.length) / materials.length) * 100 : 0} />
        </Kpi>
        <Kpi label="Batch Lewat Batas" tone={expired ? "red" : undefined} value={`${expired} Batch`} note="Perlu dibuang di Brewing & QC" icon={<Hourglass size={16} />}><Bar value={expired ? 100 : 0} tone="red" /></Kpi>
      </section>

      <section className="card flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <SearchBox className="flex-1" value={search} onChange={setSearch} placeholder="Cari nama bahan atau SKU..." />
        <Tabs value={cat} onChange={setCat} items={[{ id: "all", label: `Semua (${materials.length})` }, ...CATEGORIES.filter(count).map((c) => ({ id: c, label: `${c} (${count(c)})` }))]} />
        <button className="btn btn-flat" onClick={() => downloadCsv("inventory", [["SKU", "Bahan", "Kategori", "Stok", "Satuan", "Minimum", "Harga per satuan", "Nilai"], ...filtered.map((m) => [m.sku, m.name, m.category, m.stock, m.unit, m.min_stock, m.unit_cost, m.stock * m.unit_cost])])}><Download size={14} />Ekspor CSV</button>
      </section>

      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl min-w-[860px]">
            <thead><tr><th>Bahan & SKU</th><th>Kategori</th><th className="w-52">Stok Terkini</th><th className="num">Buffer Min.</th><th className="num">Nilai / Satuan</th><th>Status</th><th className="num">Aksi Cepat</th></tr></thead>
            <tbody>
              {paged.items.map((m) => {
                const ratio = m.min_stock ? (m.stock / m.min_stock) * 100 : 100;
                const isLow = m.stock <= m.min_stock;
                return (
                  <tr key={m.id} className={isLow ? "bg-[#fff8f6]" : ""}>
                    <td><button className="text-left font-medium hover:underline" onClick={() => setEdit(m)}>{m.name}</button><div className="mono text-soft">SKU: {m.sku}{m.note ? ` · ${m.note}` : ""}</div></td>
                    <td><span className="badge">{m.category}</span></td>
                    <td>
                      <div className={`mono mb-1 flex justify-between text-[12px] ${isLow ? "text-danger" : ""}`}><span>{qty(m.stock)} {m.unit}</span><span>{Math.round(ratio)}%</span></div>
                      <Bar value={ratio / 3} tone={isLow ? "red" : "moss"} />
                    </td>
                    <td className="num">{qty(m.min_stock)} {m.unit}</td>
                    <td className="num">{rp(m.stock * m.unit_cost)}<div className="text-soft">@ {rp(m.unit_cost)}/{m.unit}</div></td>
                    <td><span className={`badge ${isLow ? "badge-red" : "badge-moss"}`}>{isLow ? "Restock" : "Aman"}</span></td>
                    <td className="num">
                      <div className="flex justify-end gap-1">
                        <button className="btn btn-sm btn-flat" onClick={() => setAudit(m)}>Audit</button>
                        {isLow && <Link className="btn btn-sm btn-primary" href={`/procurement?material=${m.id}`}>Restock</Link>}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!paged.items.length && <tr><td colSpan={7}><Empty>Tidak ada bahan yang cocok.</Empty></td></tr>}
            </tbody>
          </table>
        </div>
        <Pager {...paged} noun="SKU bahan" />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Integritas Audit Fisik" right={<ShieldCheck size={16} className="text-moss" />}>
          <p className="muted">{lastAudit ? `Audit terakhir: ${lastAudit.detail}. Oleh ${lastAudit.actor}.` : "Belum ada audit fisik. Isi stok awal lewat tombol Audit pada setiap bahan."}</p>
          {lastAudit && <p className="mono mt-3 rounded bg-low px-3 py-2">{fmtDateTime(lastAudit.at)}</p>}
        </Card>
        <Card title="Mutasi Stok Terakhir" subtitle="Penjualan dan batch seduh memotong stok secara otomatis.">
          {moves.length ? (
            <ul className="flex flex-col divide-y divide-line">
              {moves.slice(0, 6).map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3 py-1.5">
                  <span className="min-w-0 truncate">{v.name}<span className="mono ml-2 text-soft">{v.kind}{v.ref ? ` · ${v.ref}` : ""}</span></span>
                  <span className={`mono shrink-0 ${v.delta < 0 ? "text-danger" : "text-moss"}`}>{v.delta > 0 ? "+" : ""}{qty(v.delta)} {v.unit}</span>
                </li>
              ))}
            </ul>
          ) : <Empty>Belum ada mutasi stok.</Empty>}
        </Card>
      </section>

      {edit && (
        <FormModal title={edit.id ? "Edit Bahan" : "Tambah Bahan Baru"} action={saveMaterial} extra={{ id: edit.id }} success="Bahan disimpan." onClose={() => setEdit(null)}>
          <Field label="Nama bahan"><input className="input" name="name" required defaultValue={edit.name} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="SKU"><input className="input" name="sku" required defaultValue={edit.sku} /></Field>
            <Field label="Kategori"><select className="input" name="category" defaultValue={edit.category || "Bahan baku"}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Satuan"><select className="input" name="unit" defaultValue={edit.unit || "g"}><option>g</option><option>ml</option><option>pcs</option></select></Field>
            <Field label="Batas minimum"><input className="input" name="min_stock" type="number" step="any" min="0" required defaultValue={edit.min_stock} /></Field>
            <Field label="Harga per satuan (Rp)"><input className="input" name="unit_cost" type="number" step="any" min="0" required defaultValue={edit.unit_cost} /></Field>
            {!edit.id && <Field label="Stok awal"><input className="input" name="stock" type="number" step="any" min="0" defaultValue={0} /></Field>}
          </div>
          <Field label="Catatan (lot, asal, dll.)"><input className="input" name="note" defaultValue={edit.note} /></Field>
        </FormModal>
      )}
      {audit && (
        <FormModal title={`Audit Fisik: ${audit.name}`} description={`Stok sistem ${qty(audit.stock)} ${audit.unit}. Selisih kurang dicatat sebagai waste.`} action={auditStock} extra={{ id: audit.id }} success="Audit tersimpan." submit="Simpan audit" onClose={() => setAudit(null)}>
          <Field label={`Stok fisik (${audit.unit})`}><input className="input" name="actual" type="number" step="any" min="0" required autoFocus /></Field>
          <Field label="Catatan"><input className="input" name="note" placeholder="Contoh: stok awal outlet" /></Field>
        </FormModal>
      )}
      {sim && (
        <Modal title="Simulasi Restock" description="Kebutuhan agar setiap bahan kritis kembali ke 2x batas minimum." onClose={() => setSim(false)} wide>
          {low.length ? (
            <>
              <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Bahan</th><th className="num">Kebutuhan</th><th className="num">Estimasi biaya</th><th /></tr></thead>
                <tbody>{low.map((m) => {
                  const need = m.min_stock * 2 - m.stock;
                  return <tr key={m.id}><td>{m.name}</td><td className="num">{qty(need)} {m.unit}</td><td className="num">{rp(need * m.unit_cost)}</td><td className="num"><Link className="link" href={`/procurement?material=${m.id}&qty=${Math.ceil(need)}`}>Buat PO</Link></td></tr>;
                })}</tbody></table></div>
              <p className="mono mt-3 text-right">Total estimasi: {rp(low.reduce((s, m) => s + (m.min_stock * 2 - m.stock) * m.unit_cost, 0))}</p>
            </>
          ) : <Empty>Semua bahan di atas batas minimum.</Empty>}
        </Modal>
      )}
    </>
  );
}
