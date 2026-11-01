"use client";

import { useState } from "react";
import { AlertCircle, ArchiveRestore, Clock, Download, Plus, Sprout, Wallet } from "lucide-react";
import { ActionButton, Card, Empty, Field, FormModal, Kpi, PageHead, Pager, SearchBox, Tabs, usePaged } from "@/components/ui";
import { downloadCsv, fmtDate, fmtDateTime, qty, rp, todayWIB } from "@/lib/format";
import { cancelPo, createPo, payPo, receivePo, saveSupplier } from "./actions";

type Order = { id: string; number: string; ordered_at: string; supplier: string; location: string; material_id: string; material: string; unit: string; sku: string; qty: number; total: number; status: string; eta: string | null; note: string; received_at: string | null; received_by: string; payment: string; paid_at: string | null };
type Supplier = { id: string; name: string; location: string; specialty: string; contact: string; lead_days: number };
type Material = { id: string; name: string; unit: string; stock: number; min_stock: number; unit_cost: number };

export function ProcurementView({ orders, suppliers, materials, presetMaterial, presetQty }: { orders: Order[]; suppliers: Supplier[]; materials: Material[]; presetMaterial?: string; presetQty?: string }) {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [po, setPo] = useState(!!presetMaterial);
  const [supplier, setSupplier] = useState<Partial<Supplier> | null>(null);
  const [pay, setPay] = useState<Order | null>(null);
  const [materialId, setMaterialId] = useState(presetMaterial || "");
  const [poQty, setPoQty] = useState(presetQty || "");

  const open = orders.filter((o) => o.status === "Dipesan");
  const low = materials.filter((m) => m.stock <= m.min_stock);
  const today = todayWIB();
  const late = open.filter((o) => o.eta && o.eta < today);
  const unpaid = orders.filter((o) => o.status !== "Dibatalkan" && o.payment !== "Lunas");
  const filtered = orders.filter((o) => (tab === "all" || o.status === tab) && `${o.number} ${o.supplier} ${o.material} ${o.sku}`.toLowerCase().includes(search.toLowerCase()));
  const paged = usePaged(filtered, 8);
  const count = (s: string) => orders.filter((o) => o.status === s).length;
  const selected = materials.find((m) => m.id === materialId);

  return (
    <>
      <PageHead crumb="Procurement & Supplier Orders" title="Procurement & Purchase Orders"
        description="Penerbitan PO ke supplier, penerimaan barang ke stok, dan pencatatan pelunasan."
        actions={<>
          <button className="btn" onClick={() => downloadCsv("purchase-orders", [["No PO", "Tanggal", "Supplier", "Bahan", "Jumlah", "Satuan", "Total", "Status", "Pembayaran", "ETA"], ...orders.map((o) => [o.number, o.ordered_at, o.supplier, o.material, o.qty, o.unit, o.total, o.status, o.payment, o.eta])])}><Download size={15} />Ekspor Ledger PO</button>
          <button className="btn" onClick={() => setSupplier({})}><Sprout size={15} />Tambah Supplier</button>
          <button className="btn btn-primary" onClick={() => setPo(true)}><Plus size={15} />Terbitkan PO Baru</button>
        </>} />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Total PO Aktif" value={open.length} unit="Pesanan" note={`${suppliers.length} supplier terdaftar`} icon={<ArchiveRestore size={16} />} />
        <Kpi label="Nilai Pengadaan Berjalan" value={rp(open.reduce((s, o) => s + o.total, 0))} note="Belum masuk ke stok" icon={<Wallet size={16} />} />
        <Kpi label="Peringatan Restock" tone={low.length ? "red" : undefined} value={`${low.length} Bahan`} note={low.length ? low.slice(0, 3).map((m) => m.name).join(", ") : "Stok aman"} icon={<AlertCircle size={16} />} />
        <Kpi label="Hutang Supplier" tone={unpaid.length ? "red" : undefined} value={rp(unpaid.reduce((s, o) => s + o.total, 0))} note={`${unpaid.length} PO belum lunas · ${late.length} lewat ETA`} icon={<Clock size={16} />} />
      </section>

      <section className="card flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <SearchBox className="flex-1" value={search} onChange={setSearch} placeholder="Cari nomor PO, supplier, atau bahan..." />
        <Tabs value={tab} onChange={setTab} items={[{ id: "all", label: `Semua PO (${orders.length})` }, { id: "Dipesan", label: `Dipesan (${count("Dipesan")})` }, { id: "Diterima", label: `Diterima (${count("Diterima")})` }, { id: "Dibatalkan", label: `Dibatalkan (${count("Dibatalkan")})` }]} />
      </section>

      <section className="card overflow-hidden">
        <div className="bg-low px-5 py-4"><h2 className="h-card">Ledger Purchase Orders</h2></div>
        <div className="overflow-x-auto">
          <table className="tbl min-w-[900px]">
            <thead><tr><th>No. PO & Tanggal</th><th>Supplier</th><th>Bahan Baku</th><th className="num">Jumlah</th><th className="num">Nilai PO</th><th>Status</th><th>Jadwal Tiba</th><th className="num">Tindakan</th></tr></thead>
            <tbody>
              {paged.items.map((o) => (
                <tr key={o.id}>
                  <td className="mono font-medium">{o.number}<div className="font-normal text-soft">{fmtDateTime(o.ordered_at)}</div></td>
                  <td>{o.supplier}<div className="mono text-soft">{o.location}</div></td>
                  <td>{o.material}<div className="mono text-soft">{o.sku}</div></td>
                  <td className="num">{qty(o.qty)} {o.unit}</td>
                  <td className="num">{rp(o.total)}<div className={o.payment === "Lunas" ? "text-moss" : "text-danger"}>{o.payment}</div></td>
                  <td><span className={`badge ${o.status === "Diterima" ? "badge-moss" : o.status === "Dipesan" ? "badge-sand" : ""}`}>{o.status}</span></td>
                  <td className="mono">{o.received_at ? <>Tiba {fmtDate(o.received_at)}<div className="text-soft">{o.received_by}</div></> : o.eta ? <span className={o.status === "Dipesan" && o.eta < today ? "text-danger" : ""}>{fmtDate(o.eta)}</span> : "-"}</td>
                  <td className="num">
                    <div className="flex justify-end gap-1">
                      {o.status === "Dipesan" && <ActionButton className="btn btn-sm btn-primary" action={receivePo} input={{ id: o.id }} success="Barang masuk ke stok." confirm={`Terima ${qty(o.qty)} ${o.unit} ${o.material} ke stok?`}>Terima Barang</ActionButton>}
                      {o.status === "Dipesan" && <ActionButton className="btn btn-sm btn-flat" action={cancelPo} input={{ id: o.id }} confirm={`Batalkan ${o.number}?`}>Batal</ActionButton>}
                      {o.status !== "Dibatalkan" && o.payment !== "Lunas" && <button className="btn btn-sm btn-flat" onClick={() => setPay(o)}>Catat Lunas</button>}
                    </div>
                  </td>
                </tr>
              ))}
              {!paged.items.length && <tr><td colSpan={8}><Empty>Belum ada purchase order.</Empty></td></tr>}
            </tbody>
          </table>
        </div>
        <Pager {...paged} noun="PO" />
      </section>

      <Card title="Vendor & Tea Estate Directory" subtitle={`${suppliers.length} supplier terdaftar`}>
        {suppliers.length ? (
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
            {suppliers.map((s) => (
              <button key={s.id} className="flex items-center justify-between gap-3 rounded bg-low p-3 text-left hover:bg-mid" onClick={() => setSupplier(s)}>
                <span className="min-w-0"><span className="block font-medium">{s.name}</span><span className="muted block truncate text-[12px]">{[s.specialty, s.location, s.contact].filter(Boolean).join(" · ") || "Belum ada detail"}</span></span>
                <span className="mono shrink-0">Lead time: {s.lead_days} hari</span>
              </button>
            ))}
          </div>
        ) : <Empty>Tambahkan supplier sebelum menerbitkan PO.</Empty>}
      </Card>

      {po && (
        <FormModal title="Terbitkan Purchase Order" action={createPo} success="PO diterbitkan." submit="Terbitkan PO" onClose={() => setPo(false)}>
          {!suppliers.length && <p className="rounded bg-danger-soft px-3 py-2 text-[12px] text-[#93000a]">Tambahkan supplier terlebih dahulu.</p>}
          <Field label="Supplier"><select className="input" name="supplier_id" required>{suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
          <Field label="Bahan" hint={selected ? `Stok ${qty(selected.stock)} ${selected.unit} · harga kini ${rp(selected.unit_cost)}/${selected.unit}` : undefined}>
            <select className="input" name="material_id" required value={materialId} onChange={(e) => setMaterialId(e.target.value)}>
              <option value="">Pilih bahan...</option>
              {materials.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={`Jumlah${selected ? ` (${selected.unit})` : ""}`}><input className="input" name="qty" type="number" min="0.01" step="any" required value={poQty} onChange={(e) => setPoQty(e.target.value)} /></Field>
            <Field label="Total nilai PO (Rp)"><input className="input" name="total" type="number" min="1" required key={`${materialId}${poQty}`} defaultValue={selected && poQty ? Math.round(Number(poQty) * selected.unit_cost) : undefined} /></Field>
          </div>
          <Field label="Estimasi tiba"><input className="input" name="eta" type="date" /></Field>
          <Field label="Catatan"><input className="input" name="note" /></Field>
        </FormModal>
      )}
      {supplier && (
        <FormModal title={supplier.id ? "Edit Supplier" : "Tambah Supplier"} action={saveSupplier} extra={{ id: supplier.id }} success="Supplier disimpan." onClose={() => setSupplier(null)}>
          <Field label="Nama supplier"><input className="input" name="name" required defaultValue={supplier.name} /></Field>
          <Field label="Lokasi"><input className="input" name="location" defaultValue={supplier.location} /></Field>
          <Field label="Spesialisasi"><input className="input" name="specialty" defaultValue={supplier.specialty} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kontak"><input className="input" name="contact" defaultValue={supplier.contact} /></Field>
            <Field label="Lead time (hari)"><input className="input" name="lead_days" type="number" min="0" defaultValue={supplier.lead_days ?? 0} /></Field>
          </div>
        </FormModal>
      )}
      {pay && (
        <FormModal title={`Catat Pelunasan ${pay.number}`} description={`${rp(pay.total)} ke ${pay.supplier}`} action={payPo} extra={{ id: pay.id }} success="Pelunasan dicatat." submit="Konfirmasi sudah dibayar" onClose={() => setPay(null)}>
          <Field label="Referensi transfer"><input className="input" name="pay_ref" /></Field>
        </FormModal>
      )}
    </>
  );
}
