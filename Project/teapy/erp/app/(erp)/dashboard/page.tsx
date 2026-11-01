import Link from "next/link";
import { AlertTriangle, ArrowRight, BookOpen, ClipboardCheck, Megaphone, PackagePlus, SlidersHorizontal, Terminal, UserPlus, Wallet } from "lucide-react";
import { Card, Empty, Kpi, PageHead, Sparkline } from "@/components/ui";
import { PeriodTabs } from "./period";
import { FULL, requirePage } from "@/lib/auth";
import { cupCost, marginPct } from "@/lib/calc";
import { query } from "@/lib/db";
import { addDays, fmtDate, pct, qty, rp, todayWIB } from "@/lib/format";
import { getSettings } from "@/lib/settings";

const WIB = "at time zone 'Asia/Jakarta'";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  await requirePage(FULL);
  const period = (await searchParams).period === "month" ? "month" : (await searchParams).period === "week" ? "week" : "today";
  const today = todayWIB();
  const from = period === "today" ? today : period === "week" ? addDays(today, -6) : today.slice(0, 8) + "01";
  const [materials, products, items, totals, daily, campaigns, deliverables, activity, settings, pending] = await Promise.all([
    query("select id, name, category, unit, stock, min_stock, unit_cost, code from materials where active"),
    query("select id, name, price, mode, yield_ml, serving_ml from products where active order by name"),
    query("select r.product_id, r.qty, m.unit_cost from recipe_items r join materials m on m.id = r.material_id"),
    query(`select coalesce(sum(total),0)::float8 as sales, coalesce(sum(cogs),0)::float8 as cogs, count(*)::int as n from sales where status='Selesai' and (at ${WIB})::date >= $1`, [from]),
    query(`select d::date::text as date, coalesce(sum(l.qty * l.serving_ml),0)::float8 as ml from generate_series($1::date, $2::date, interval '1 day') d
           left join sales s on (s.at ${WIB})::date = d::date and s.status='Selesai' left join sale_lines l on l.sale_id = s.id group by d order by d`, [addDays(today, -6), today]),
    query("select c.id, c.title, c.status, c.fee, p.name as partner, (select coalesce(sum(amount),0)::float8 from campaign_payments x where x.campaign_id=c.id) as paid from campaigns c join partners p on p.id=c.partner_id where not c.archived and c.status not in ('Selesai','Dibatalkan')"),
    query("select d.id, d.title, d.deadline, d.status, p.name as partner from deliverables d join campaigns c on c.id=d.campaign_id join partners p on p.id=c.partner_id where not c.archived and d.status <> 'Tayang' order by d.deadline nulls last limit 4"),
    query("select id, at, title, detail from activity order by at desc limit 5"),
    getSettings(),
    query("select count(*)::int as batches from batches where labeled_at is null and drained_at is null and remaining_ml > 0"),
  ]);

  const low = materials.filter((m) => m.stock <= m.min_stock);
  const value = materials.reduce((s, m) => s + m.stock * m.unit_cost, 0);
  const cup = materials.find((m) => m.code === "cup");
  const sugar = materials.find((m) => m.code === "sugar");
  const extras = (cup?.unit_cost ?? 0) + settings.sugar_normal_ml * (sugar?.unit_cost ?? 0);
  const costed: any[] = products.map((p) => {
    const bom = items.filter((i) => i.product_id === p.id);
    const c = cupCost(bom as never, p.yield_ml, p.serving_ml, p.mode === "direct" ? 0 : extras);
    return { ...p, cost: c, margin: marginPct(p.price, c), priced: bom.length > 0 && bom.every((b) => b.unit_cost > 0) };
  });
  const priced = costed.filter((p) => p.priced);
  const avgMargin = priced.length ? priced.reduce((s, p) => s + p.margin, 0) / priced.length : 0;
  const escrow = campaigns.reduce((s, c) => s + Math.max(0, c.fee - c.paid), 0);
  const t = totals[0];
  const liters = daily.map((d) => d.ml / 1000);
  const max = Math.max(...liters, 1);
  const safety = settings.margin_target;
  const points = daily.map((d, i) => `${40 + (i * 640) / Math.max(1, daily.length - 1)},${170 - (d.ml / 1000 / max) * 140}`);

  return (
    <>
      <PageHead crumb="Store Overview" title="Store Overview" description="Performa penjualan, stok, resep, dan marketing Teapy dalam satu tampilan."
        actions={<PeriodTabs value={period} />} />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Penjualan Periode Ini" value={rp(t.sales)} note={`${t.n} transaksi · nilai stok ${rp(value)}`} icon={<Wallet size={16} />}><Sparkline values={liters} width={120} /></Kpi>
        <Kpi label="Stock Health Status" tone={low.length ? "red" : undefined} value={`${low.length} Items`} note={low.length ? low.slice(0, 2).map((m) => m.name).join(", ") + (low.length > 2 ? ` +${low.length - 2} lagi` : "") : "Seluruh stok di atas batas minimum"} icon={<AlertTriangle size={16} />} />
        <Kpi label="Standard Menu Matrix" value={`${products.length} Recipes`} note={`Rata-rata margin: ${pct(avgMargin)}`} icon={<BookOpen size={16} />} />
        <Kpi label="Marketing Telemetry" value={`${campaigns.length} Aktif`} note={`${rp(escrow)} sisa fee`} icon={<Megaphone size={16} />} />
      </section>

      <section className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)]">
        <Card title="Tea Consumption & Yield Velocity" subtitle="Volume terjual per hari dalam liter, tujuh hari terakhir.">
          <svg viewBox="0 0 720 210" className="w-full" role="img" aria-label="Grafik volume terjual tujuh hari">
            <defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#48161b" stopOpacity=".2" /><stop offset="1" stopColor="#48161b" stopOpacity="0" /></linearGradient></defs>
            {[0, 0.5, 1].map((v) => (
              <g key={v}><line x1="40" x2="680" y1={170 - v * 140} y2={170 - v * 140} stroke="#ece7e5" strokeDasharray="4 4" /><text x="0" y={174 - v * 140} fontSize="11" fill="#857373" fontFamily="monospace">{qty(max * v)} L</text></g>
            ))}
            <polygon points={`40,170 ${points.join(" ")} 680,170`} fill="url(#fill)" />
            <polyline points={points.join(" ")} fill="none" stroke="#48161b" strokeWidth="2" />
            {daily.map((d, i) => {
              const [x, y] = points[i].split(",");
              return <g key={d.date}><circle cx={x} cy={y} r="3.5" fill="#fff" stroke="#48161b" strokeWidth="2"><title>{`${fmtDate(d.date)}: ${qty(d.ml / 1000)} L`}</title></circle><text x={x} y="195" fontSize="11" textAnchor="middle" fill="#524343" fontFamily="monospace">{d.date.slice(8)}/{d.date.slice(5, 7)}</text></g>;
            })}
          </svg>
          <div className="mt-3 flex items-center justify-between rounded bg-low px-3 py-2">
            <span>Total <b>{qty(liters.reduce((a, b) => a + b, 0))} L</b> terjual dalam 7 hari{pending[0].batches ? ` · ${pending[0].batches} batch menunggu label` : ""}</span>
            <Link href="/brewing" className="link">BATCH LOG <ArrowRight size={13} /></Link>
          </div>
        </Card>

        <Card title="Recipe Costing & Margin Matrix" subtitle={`Target margin ${safety}%`} right={<Link className="link" href="/recipe">Semua →</Link>}>
          <div className="flex flex-col gap-2">
            {priced.slice(0, 5).map((p) => (
              <Link key={p.id} href="/recipe" className="flex items-center justify-between gap-3 rounded bg-low p-3 hover:bg-mid">
                <span className="min-w-0"><span className="block truncate font-medium">{p.name}</span><span className="mono text-soft">{p.mode === "direct" ? "Per porsi" : `Yield ${qty(p.yield_ml / 1000)} L`} · HPP {rp(p.cost)}</span></span>
                <span className="shrink-0 text-right"><span className="mono block text-[14px] font-medium">{rp(p.price)}</span><span className={`badge ${p.margin < safety ? "badge-sand" : "badge-moss"}`}>{pct(p.margin)}</span></span>
              </Link>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)]">
        <Card flush title="Critical Inventory Dispatch" subtitle="Bahan di bawah batas minimum." right={low.length ? <span className="badge badge-red">Replenishment priority</span> : <span className="badge badge-moss">Stok aman</span>}>
          <div className="overflow-x-auto"><table className="tbl min-w-[560px]"><thead><tr><th>Bahan</th><th>Kategori</th><th className="num">Stok</th><th className="num">Minimum</th><th className="num">Aksi</th></tr></thead><tbody>
            {low.slice(0, 6).map((m) => (
              <tr key={m.id}><td className="font-medium">{m.name}</td><td className="muted">{m.category}</td><td className="num text-danger">{qty(m.stock)} {m.unit}</td><td className="num">{qty(m.min_stock)} {m.unit}</td><td className="num"><Link className="btn btn-sm btn-primary" href={`/procurement?material=${m.id}`}>PO Reorder</Link></td></tr>
            ))}
            {!low.length && <tr><td colSpan={5}><Empty>Seluruh stok di atas batas minimum.</Empty></td></tr>}
          </tbody></table></div>
        </Card>
        <Card title="Campaign Milestones" subtitle="Deliverable marketing berikutnya." right={<Link className="link" href="/marketing">Marketing →</Link>}>
          {deliverables.length ? <div className="flex flex-col gap-2">{deliverables.map((d) => {
            const late = d.deadline && d.deadline < today;
            return <div key={d.id} className="rounded bg-low p-3"><div className="flex items-start justify-between gap-2"><span className="font-medium">{d.partner}</span><span className={`badge ${late ? "badge-red" : ""}`}>{late ? "Lewat deadline" : d.status}</span></div><p className="muted">{d.title}</p><p className="mono text-soft">Deadline: {fmtDate(d.deadline)}</p></div>;
          })}</div> : <Empty>Belum ada agenda marketing.</Empty>}
        </Card>
      </section>

      <section className="card flex flex-col items-start justify-between gap-4 p-5 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-lg bg-maroon text-white"><Terminal size={20} /></span><div><h2 className="h-card">Store Operations Quick Routines</h2><p className="muted">Akses cepat ke pekerjaan yang paling sering dilakukan.</p></div></div>
        <div className="flex flex-wrap gap-2">
          <Link className="btn btn-flat" href="/inventory"><ClipboardCheck size={15} />Audit Stok Fisik</Link>
          <Link className="btn btn-flat" href="/recipe"><SlidersHorizontal size={15} />Penyesuaian Resep BOM</Link>
          <Link className="btn btn-flat" href="/procurement"><PackagePlus size={15} />Terbitkan PO</Link>
          <Link className="btn btn-primary" href="/marketing"><UserPlus size={15} />Tambah Kontrak Partner</Link>
        </div>
      </section>

      <Card title="Aktivitas Terakhir">
        {activity.length ? <ul className="flex flex-col divide-y divide-line">{activity.map((a) => <li key={a.id} className="flex flex-wrap justify-between gap-2 py-2"><span><b className="font-medium">{a.title}</b> <span className="muted">{a.detail}</span></span><span className="mono text-soft">{fmtDate(a.at)}</span></li>)}</ul> : <Empty>Belum ada aktivitas.</Empty>}
      </Card>
    </>
  );
}
