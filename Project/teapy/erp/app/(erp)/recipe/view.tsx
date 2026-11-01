"use client";

import { useMemo, useState } from "react";
import { BarChart3, BookOpen, CheckCircle2, ClipboardList, Download, MonitorCheck, PencilLine, Plus, Printer, Trash2, TrendingUp } from "lucide-react";
import Link from "next/link";
import { ActionButton, Bar, Empty, Field, FormModal, Kpi, Modal, PageHead, SearchBox, Sparkline, Tabs } from "@/components/ui";
import { batchCost, cupCost, marginPct } from "@/lib/calc";
import { downloadCsv, fmtLong, pct, qty, rp } from "@/lib/format";
import { saveRecipe, toggleProduct } from "./actions";

type Product = { id: string; sku: string; name: string; type: string; origin: string; price: number; price_takeaway: number | null; mode: string; yield_ml: number; serving_ml: number; sop: Record<string, string>; active: boolean };
type Item = { product_id: string; material_id: string; qty: number; name: string; unit: string; unit_cost: number; stock: number };
type Material = { id: string; name: string; unit: string; unit_cost: number };

export function RecipeView({ products, items, materials, extras, marginTarget }: { products: Product[]; items: Item[]; materials: Material[]; extras: number; marginTarget: number }) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [mode, setMode] = useState<"batch" | "cup">("batch");
  const [selected, setSelected] = useState(products[0]?.id);
  const [edit, setEdit] = useState<Partial<Product> | null>(null);
  const [sim, setSim] = useState(false);

  const rows = useMemo(() => products.map((p) => {
    const bom = items.filter((i) => i.product_id === p.id);
    const batch = batchCost(bom);
    const direct = p.mode === "direct";
    const cup = cupCost(bom, p.yield_ml, p.serving_ml, direct ? 0 : extras);
    return { ...p, bom, batch, cup, direct, priced: bom.length > 0 && bom.every((b) => b.unit_cost > 0), margin: marginPct(p.price, cup) };
  }), [products, items, extras]);
  const active = rows.filter((r) => r.active);
  const priced = active.filter((r) => r.priced);
  const unpriced = active.length - priced.length;
  const avg = priced.length ? priced.reduce((s, r) => s + r.margin, 0) / priced.length : 0;
  const under = priced.filter((r) => r.margin < marginTarget);
  const types = [...new Set(products.map((p) => p.type))];
  const filtered = rows.filter((r) => (type === "all" || r.type === type) && `${r.name} ${r.origin} ${r.sku}`.toLowerCase().includes(search.toLowerCase()));
  const spot = rows.find((r) => r.id === selected) || rows[0];
  const brewed = active.filter((r) => !r.direct);
  const total = brewed.reduce((s, r) => s + r.batch, 0);

  return (
    <>
      <PageHead crumb="Recipe / BOM Matrix" tag="Standardized Blends & COGS" title="Recipe & Bill of Materials"
        description="Formulasi takaran daun teh, kalkulasi HPP otomatis berbasis harga bahan baku, dan SOP seduhan."
        right={<span className="mono rounded bg-mid px-2 py-0.5 text-soft">{fmtLong()}</span>}
        actions={<>
          <button className="btn" onClick={() => downloadCsv("resep", [["SKU", "Resep", "Jenis", "Biaya batch", "HPP per cup", "Harga jual", "Margin %"], ...rows.map((r) => [r.sku, r.name, r.type, Math.round(r.batch), Math.round(r.cup), r.price, r.margin.toFixed(1)])])}><Download size={15} />Ekspor Formula CSV</button>
          <button className="btn" onClick={() => setSim(true)}><BarChart3 size={15} />Simulasi Margin & Yield</button>
          <button className="btn btn-primary" onClick={() => setEdit({})}><Plus size={15} />Buat Resep Baru</button>
        </>} />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Resep Terdaftar" value={active.length} unit="Menu" note={<span className="flex items-center gap-1 text-moss"><CheckCircle2 size={13} />Tersinkron ke kasir POS</span>} icon={<BookOpen size={16} />}><Bar value={100} /></Kpi>
        <Kpi label="Rata-rata Gross Margin" value={pct(avg)} note={`Target ${marginTarget}%${unpriced ? ` · ${unpriced} menu belum ada harga bahan` : ""}`} icon={<Sparkline values={active.map((r) => r.margin)} width={50} height={20} />}><Bar value={avg} tone="moss" /></Kpi>
        <Kpi label="Di Bawah Target Margin" tone={under.length ? "red" : undefined} value={`${under.length} Resep`} note={under.length ? under.map((u) => u.name).join(", ") : "Semua resep memenuhi target"} icon={<TrendingUp size={16} />} />
        <Kpi label="Biaya Satu Batch Semua Menu" value={rp(total)} note={`${brewed.length} batch · ${qty(brewed.reduce((s, r) => s + r.yield_ml, 0))} ml`} icon={<ClipboardList size={16} />} />
      </section>

      <section className="card flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <SearchBox className="flex-1" value={search} onChange={setSearch} placeholder="Cari resep, daun teh, atau asal..." />
        <Tabs value={type} onChange={setType} items={[{ id: "all", label: `Semua Menu (${products.length})` }, ...types.map((t) => ({ id: t, label: `${t} (${products.filter((p) => p.type === t).length})` }))]} />
        <div className="mono flex items-center gap-1 rounded bg-low p-1">
          <span className="px-1 text-soft">Mode:</span>
          <button className={`rounded px-2 py-1 ${mode === "batch" ? "bg-white font-medium shadow-sm" : ""}`} onClick={() => setMode("batch")}>Batch</button>
          <button className={`rounded px-2 py-1 ${mode === "cup" ? "bg-white font-medium shadow-sm" : ""}`} onClick={() => setMode("cup")}>Cup</button>
        </div>
      </section>

      <section className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)]">
        <div className="card overflow-hidden">
          <div className="bg-low px-5 py-4"><h2 className="h-card">Direktori Formulasi Standar</h2><p className="muted text-[12px]">HPP mencakup bahan batch, cup, dan sirup gula normal.</p></div>
          <div className="overflow-x-auto">
            <table className="tbl min-w-[720px]">
              <thead><tr><th>Resep & Origin</th><th>{mode === "batch" ? "Takaran / Batch" : "Takaran / Cup"}</th><th className="num">Biaya Batch</th><th className="num">HPP / Cup</th><th className="num">Harga POS</th><th>Margin</th><th className="num">Aksi</th></tr></thead>
              <tbody>
                {filtered.map((r) => {
                  const lowMargin = r.priced && r.margin < marginTarget;
                  const leaf = r.bom[0];
                  const factor = mode === "batch" ? 1 : r.serving_ml / r.yield_ml;
                  return (
                    <tr key={r.id} className={r.id === spot?.id ? "bg-[#fcfaf8]" : ""}>
                      <td>
                        <div className="flex items-center gap-2 font-medium"><span className={`h-1.5 w-1.5 rounded-full ${r.id === spot?.id ? "bg-maroon" : "bg-hair"}`} />{r.name}{!r.active && <span className="badge">Nonaktif</span>}{lowMargin && r.active && <span className="badge badge-red">Review HPP</span>}</div>
                        <div className="mono ml-3.5 text-soft">{r.origin ? `${r.origin} · ` : ""}{r.type}</div>
                      </td>
                      <td className="mono">{leaf ? `${qty(leaf.qty * factor)} ${leaf.unit} ${leaf.name}` : "-"}<div className="text-soft">{r.direct ? "Per porsi, tanpa batch" : `Hasil ${qty(mode === "batch" ? r.yield_ml : r.serving_ml)} ml`}</div></td>
                      <td className="num">{r.direct ? "-" : rp(r.batch)}</td>
                      <td className="num font-medium">{r.priced ? rp(r.cup) : "-"}</td>
                      <td className="num">{rp(r.price)}{r.price_takeaway != null && <div className="text-soft">TA {rp(r.price_takeaway)}</div>}</td>
                      <td>{r.priced ? <span className={`badge ${lowMargin ? "badge-red" : "badge-moss"}`}>{pct(r.margin)}</span> : <span className="badge badge-sand">Isi harga bahan</span>}</td>
                      <td className="num"><button className="link" onClick={() => setSelected(r.id)}>Lihat →</button></td>
                    </tr>
                  );
                })}
                {!filtered.length && <tr><td colSpan={7}><Empty>Tidak ada resep yang cocok.</Empty></td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {spot && (
          <aside id="sop-print" className="card border-t-4 border-maroon p-5">
            <div className="flex items-start justify-between">
              <div><p className="micro">Active Recipe Spotlight</p><h2 className="text-[18px] font-semibold tracking-tight">{spot.name}</h2><p className="mono text-soft">SKU: {spot.sku} · {spot.direct ? "Per porsi" : `Batch ${qty(spot.yield_ml)} ml`}</p></div>
              <button aria-label="Edit resep" className="no-print rounded bg-mid p-1.5 hover:bg-high" onClick={() => setEdit(spot)}><PencilLine size={15} /></button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 rounded bg-low p-3">
              <div><p className="micro">HPP / Cup</p><p className="mono text-[15px] font-medium">{spot.priced ? rp(spot.cup) : "-"}</p></div>
              <div><p className="micro">Harga POS</p><p className="mono text-[15px] font-medium">{rp(spot.price)}</p></div>
              <div><p className="micro">Margin</p><p className="mono text-[15px] font-medium text-moss">{spot.priced ? pct(spot.margin) : "-"}</p></div>
            </div>
            <p className="mono mt-5 mb-2 font-medium uppercase tracking-wider">Bill of Materials</p>
            <div className="flex flex-col gap-2">
              {spot.bom.map((b) => (
                <div key={b.material_id} className="rounded bg-low px-3 py-2">
                  <div className="flex justify-between gap-2 font-medium"><span>{b.name}</span><span className="mono text-[12px]">{rp(b.qty * b.unit_cost)}</span></div>
                  <div className="mono flex justify-between gap-2 text-soft"><span>{qty(b.qty)} {b.unit} @ {rp(b.unit_cost)}</span><span>Stok: {qty(b.stock)} {b.unit}</span></div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded bg-low p-3">
              <p className="mono mb-2 font-medium uppercase tracking-wider">SOP Seduhan</p>
              <div className="grid grid-cols-2 gap-2">
                {[["Suhu air", spot.sop.temp], ["Waktu ekstraksi", spot.sop.time], ["Rasio daun : air", spot.sop.ratio], ["Agitasi", spot.sop.agitation]].map(([k, v]) => (
                  <div key={k} className="rounded bg-white p-2"><p className="micro">{k}</p><p className="mono text-[12px] font-medium">{v || "Belum diisi"}</p></div>
                ))}
              </div>
            </div>
            <div className="no-print mt-4 flex gap-2">
              <button className="btn btn-primary flex-1" onClick={() => window.print()}><Printer size={15} />Cetak SOP</button>
              <ActionButton className="btn btn-flat" action={toggleProduct} input={{ id: spot.id, active: !spot.active }} success="Status resep diubah." confirm={spot.active ? `Nonaktifkan ${spot.name} dari kasir?` : undefined}>
                {spot.active ? <><Trash2 size={14} />Nonaktifkan</> : "Aktifkan"}
              </ActionButton>
            </div>
          </aside>
        )}
      </section>

      <section className="card no-print flex flex-col items-start justify-between gap-4 p-5 lg:flex-row lg:items-center">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-sand text-maroon"><MonitorCheck size={20} /></span>
          <div><h2 className="h-card">Sinkronisasi Otomatis POS & Inventory</h2><p className="muted">Batch seduh memotong bahan sesuai resep. Penjualan memotong batch, cup, gula, dan topping per transaksi.</p></div>
        </div>
        <Link className="btn btn-flat" href="/inventory">Update Harga Bahan di Inventory</Link>
      </section>

      {edit && <RecipeForm edit={edit as Product} materials={materials} items={items.filter((i) => i.product_id === edit.id)} onClose={() => setEdit(null)} />}
      {sim && spot && <Simulation rows={rows} first={spot.id} extras={extras} onClose={() => setSim(false)} />}
    </>
  );
}

function RecipeForm({ edit, materials, items, onClose }: { edit: Partial<Product>; materials: Material[]; items: Item[]; onClose: () => void }) {
  const [recipeMode, setRecipeMode] = useState(edit.mode || "batch");
  const [lines, setLines] = useState<{ material_id: string; qty: number }[]>(items.length ? items.map((i) => ({ material_id: i.material_id, qty: i.qty })) : [{ material_id: "", qty: 0 }]);
  const cost = lines.reduce((s, l) => s + l.qty * (materials.find((m) => m.id === l.material_id)?.unit_cost ?? 0), 0);
  return (
    <FormModal wide title={edit.id ? `Edit Resep: ${edit.name}` : "Buat Resep Baru"} action={saveRecipe} extra={{ id: edit.id, items: lines }} success="Resep disimpan." onClose={onClose}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Field label="Nama resep" className="col-span-2"><input className="input" name="name" required defaultValue={edit.name} /></Field>
        <Field label="SKU"><input className="input" name="sku" required defaultValue={edit.sku} /></Field>
        <Field label="Kategori"><input className="input" name="type" required list="recipe-types" defaultValue={edit.type || "Milk Tea"} /><datalist id="recipe-types"><option value="Milk Tea" /><option value="Pure Leaf" /><option value="Artisan Blends" /></datalist></Field>
        <Field label="Cara stok"><select className="input" name="mode" value={recipeMode} onChange={(e) => setRecipeMode(e.target.value)}><option value="batch">Batch seduh</option><option value="direct">Potong daun per porsi</option></select></Field>
        <Field label="Asal"><input className="input" name="origin" defaultValue={edit.origin} /></Field>
        <Field label="Harga dine in (Rp)"><input className="input" name="price" type="number" min="1" required defaultValue={edit.price} /></Field>
        <Field label="Harga takeaway (Rp)" hint="Kosongkan bila sama"><input className="input" name="price_takeaway" type="number" min="1" defaultValue={edit.price_takeaway ?? undefined} /></Field>
        {recipeMode === "batch" && <Field label="Hasil batch (ml)"><input className="input" name="yield_ml" type="number" min="1" required defaultValue={edit.yield_ml ?? 10000} /></Field>}
        {recipeMode === "batch" && <Field label="Porsi per cup (ml)"><input className="input" name="serving_ml" type="number" min="1" required defaultValue={edit.serving_ml ?? 200} /></Field>}
      </div>
      <div className="rounded bg-low p-3">
        <div className="mb-2 flex items-center justify-between"><p className="mono font-medium uppercase">{recipeMode === "batch" ? "Bahan per batch" : "Bahan per porsi"}</p><p className="mono">Biaya: {rp(cost)}</p></div>
        <div className="flex flex-col gap-2">
          {lines.map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <select aria-label="Bahan" className="input flex-1" value={l.material_id} onChange={(e) => setLines(lines.map((x, j) => j === i ? { ...x, material_id: e.target.value } : x))}>
                <option value="">Pilih bahan...</option>
                {materials.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
              </select>
              <input aria-label="Jumlah" className="input w-28" type="number" min="0" step="any" value={l.qty || ""} onChange={(e) => setLines(lines.map((x, j) => j === i ? { ...x, qty: Number(e.target.value) } : x))} />
              <button type="button" aria-label="Hapus bahan" className="rounded p-1.5 hover:bg-high" onClick={() => setLines(lines.filter((_, j) => j !== i))}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
        <button type="button" className="btn btn-sm mt-2" onClick={() => setLines([...lines, { material_id: "", qty: 0 }])}><Plus size={13} />Tambah bahan</button>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Field label="Suhu air"><input className="input" name="temp" defaultValue={edit.sop?.temp} placeholder="85°C" /></Field>
        <Field label="Waktu ekstraksi"><input className="input" name="time" defaultValue={edit.sop?.time} placeholder="4 menit" /></Field>
        <Field label="Rasio"><input className="input" name="ratio" defaultValue={edit.sop?.ratio} placeholder="1 : 28" /></Field>
        <Field label="Agitasi"><input className="input" name="agitation" defaultValue={edit.sop?.agitation} /></Field>
      </div>
    </FormModal>
  );
}

function Simulation({ rows, first, extras, onClose }: { rows: (Product & { bom: Item[]; cup: number; direct: boolean })[]; first: string; extras: number; onClose: () => void }) {
  const [id, setId] = useState(first);
  const r = rows.find((x) => x.id === id)!;
  const [price, setPrice] = useState(r.price);
  const [yieldMl, setYield] = useState(r.yield_ml);
  const [change, setChange] = useState(0);
  const items = r.bom.map((b) => ({ qty: b.qty, unit_cost: b.unit_cost * (1 + change / 100) }));
  const cup = cupCost(items, yieldMl, r.serving_ml, r.direct ? 0 : extras);
  return (
    <Modal title="Simulasi Margin & Yield" description="Hanya perhitungan. Tidak mengubah resep." onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Resep" className="col-span-2">
          <select className="input" value={id} onChange={(e) => { const n = rows.find((x) => x.id === e.target.value)!; setId(n.id); setPrice(n.price); setYield(n.yield_ml); }}>
            {rows.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </Field>
        <Field label="Harga jual (Rp)"><input className="input" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} /></Field>
        <Field label="Hasil batch (ml)"><input className="input" type="number" value={yieldMl} onChange={(e) => setYield(Number(e.target.value))} /></Field>
        <Field label="Perubahan harga bahan (%)" className="col-span-2"><input className="input" type="number" value={change} onChange={(e) => setChange(Number(e.target.value))} /></Field>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 rounded bg-low p-3">
        <div><p className="micro">HPP / Cup</p><p className="mono text-[16px] font-medium">{rp(cup)}</p></div>
        <div><p className="micro">Margin</p><p className="mono text-[16px] font-medium text-moss">{pct(marginPct(price, cup))}</p></div>
      </div>
    </Modal>
  );
}
