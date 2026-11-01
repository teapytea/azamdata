"use client";

import { useMemo, useState } from "react";
import { BellRing, CalendarDays, CheckCircle2, Download, ExternalLink, Network, Plus, TrendingUp, UserPlus, Wallet } from "lucide-react";
import { ActionButton, Bar, Card, Empty, Field, FormModal, Kpi, Modal, PageHead, Pager, SearchBox, Tabs, usePaged } from "@/components/ui";
import { downloadCsv, fmtDate, qty, rp, todayWIB } from "@/lib/format";
import { archiveCampaign, payCampaign, saveCampaign, saveDeliverable, savePartner } from "./actions";

type Partner = { id: string; name: string; kind: string; handle: string; platform: string; contact: string; niche: string; followers: number; note: string };
type Campaign = { id: string; partner_id: string; title: string; scheme: string; pic: string; fee: number; benefit: string; benefit_cost: number; status: string; starts_on: string | null; ends_on: string | null; follow_up: string | null; note: string; archived: boolean };
type Deliverable = { id: string; campaign_id: string; title: string; deadline: string | null; status: string; link: string; published_on: string | null; views: number; reach: number; engagement: number };
type Payment = { id: string; campaign_id: string; amount: number; paid_on: string; ref: string; note: string };

const STATUSES = ["Dihubungi", "Negosiasi", "Disepakati", "Terjadwal", "Tayang", "Selesai", "Dibatalkan"];
const CONTENT = ["Belum mulai", "Draft", "Disetujui", "Tayang"];
const PLATFORMS = ["Instagram", "TikTok", "YouTube", "Website", "Multi-platform"];

export function MarketingView({ partners, campaigns, deliverables, payments }: { partners: Partner[]; campaigns: Campaign[]; deliverables: Deliverable[]; payments: Payment[] }) {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [partner, setPartner] = useState<Partial<Partner> | null>(null);
  const [campaign, setCampaign] = useState<Partial<Campaign> | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const [content, setContent] = useState<Partial<Deliverable> | null>(null);
  const [paying, setPaying] = useState<string | null>(null);
  const today = todayWIB();

  const paid = (id: string) => payments.filter((p) => p.campaign_id === id).reduce((s, p) => s + p.amount, 0);
  const partnerOf = (id: string) => partners.find((p) => p.id === id);
  const contentOf = (id: string) => deliverables.filter((d) => d.campaign_id === id);
  const active = campaigns.filter((c) => !c.archived && !["Selesai", "Dibatalkan"].includes(c.status));
  const activeDeliver = deliverables.filter((d) => campaigns.find((c) => c.id === d.campaign_id && !c.archived));
  const doneDeliver = activeDeliver.filter((d) => d.status === "Tayang");
  const overdue = activeDeliver.filter((d) => d.status !== "Tayang" && d.deadline && d.deadline < today);
  const followUps = active.filter((c) => c.follow_up && c.follow_up <= today);
  const fees = active.reduce((s, c) => s + c.fee, 0);
  const paidAll = active.reduce((s, c) => s + paid(c.id), 0);
  const count = (fn: (c: Campaign) => boolean) => campaigns.filter((c) => !c.archived && fn(c)).length;

  const filtered = useMemo(() => campaigns.filter((c) => {
    const p = partnerOf(c.id) || partnerOf(c.partner_id);
    const match = tab === "all" ? !c.archived : tab === "paid" ? !c.archived && c.scheme === "PAID" : tab === "non" ? !c.archived && c.scheme !== "PAID"
      : tab === "review" ? !c.archived && (contentOf(c.id).some((d) => d.status !== "Tayang" && d.deadline && d.deadline < today) || (!!c.follow_up && c.follow_up <= today)) : c.archived;
    return match && `${c.title} ${c.pic} ${p?.name} ${p?.handle}`.toLowerCase().includes(search.toLowerCase());
  }), [campaigns, tab, search, partners, deliverables]); // eslint-disable-line
  const paged = usePaged(filtered, 8);

  const upcoming = activeDeliver.filter((d) => d.status !== "Tayang" && d.deadline && d.deadline >= today).slice(0, 4);
  const views = activeDeliver.reduce((s, d) => s + d.views, 0);
  const reach = activeDeliver.reduce((s, d) => s + d.reach, 0);
  const engagement = activeDeliver.reduce((s, d) => s + d.engagement, 0);
  const spent = payments.reduce((s, p) => s + p.amount, 0);
  const shown = campaigns.find((c) => c.id === detail);
  const paidShown = shown ? paid(shown.id) : 0;

  return (
    <>
      <PageHead crumb="Marketing & Partnerships" title="Marketing & Brand Collaborations" description="Kelola KOL, media partner, deliverable, deadline, dan pembayaran fee kolaborasi."
        actions={<>
          <button className="btn" onClick={() => downloadCsv("kolaborasi", [["Partner", "Kampanye", "Skema", "PIC", "Fee", "Dibayar", "Sisa", "Status", "Mulai", "Selesai", "Views", "Reach"], ...campaigns.map((c) => [partnerOf(c.partner_id)?.name, c.title, c.scheme, c.pic, c.fee, paid(c.id), c.fee - paid(c.id), c.status, c.starts_on, c.ends_on, contentOf(c.id).reduce((s, d) => s + d.views, 0), contentOf(c.id).reduce((s, d) => s + d.reach, 0)])])}><Download size={15} />Ekspor CSV</button>
          <button className="btn" onClick={() => setPartner({})}><UserPlus size={15} />Tambah Partner</button>
          <button className="btn btn-primary" onClick={() => setCampaign({})}><Plus size={15} />Buat Kolaborasi Baru</button>
        </>} />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Kolaborasi Aktif" value={active.length} unit="Mitra" note={`${active.filter((c) => c.scheme === "PAID").length} Paid, ${active.filter((c) => c.scheme !== "PAID").length} Non-paid`} icon={<Network size={16} />} />
        <Kpi label="Status Deliverables" value={`${doneDeliver.length} / ${activeDeliver.length}`} unit="Selesai" note={`${overdue.length} lewat deadline`} icon={<CheckCircle2 size={16} />}><Bar tone="moss" value={activeDeliver.length ? (doneDeliver.length / activeDeliver.length) * 100 : 0} /></Kpi>
        <Kpi label="Tenggat Waktu Kritis" tone={overdue.length + followUps.length ? "red" : undefined} value={overdue.length + followUps.length} unit="Tindakan" note={overdue[0]?.title || followUps[0]?.title || "Tidak ada yang mendesak"} icon={<BellRing size={16} />} />
        <Kpi label="Sisa Alokasi Fee" value={rp(fees - paidAll)} note={`Total ${rp(fees)} · dibayar ${rp(paidAll)}`} icon={<Wallet size={16} />} />
      </section>

      <section className="card flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <SearchBox className="flex-1" value={search} onChange={setSearch} placeholder="Cari partner, kampanye, atau PIC..." />
        <Tabs value={tab} onChange={setTab} items={[
          { id: "all", label: `Semua (${count(() => true)})` }, { id: "paid", label: `Paid KOL (${count((c) => c.scheme === "PAID")})` }, { id: "non", label: `Non-paid (${count((c) => c.scheme !== "PAID")})` },
          { id: "review", label: "Monitoring Review" }, { id: "archive", label: "Arsip" },
        ]} />
      </section>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between bg-low px-5 py-4"><h2 className="h-card">Direktori Partner & Kampanye Aktif</h2><span className="mono rounded bg-mid px-2 py-0.5">{filtered.length} record</span></div>
        <div className="overflow-x-auto">
          <table className="tbl min-w-[980px]">
            <thead><tr><th>Partner & Profil</th><th>Skema & Platform</th><th>Kampanye</th><th>Deliverables</th><th className="num">Fee</th><th>Tenggat & Follow-up</th><th>PIC</th><th className="num">Aksi</th></tr></thead>
            <tbody>
              {paged.items.map((c) => {
                const p = partnerOf(c.partner_id);
                const items = contentOf(c.id);
                const done = items.filter((d) => d.status === "Tayang").length;
                const late = items.find((d) => d.status !== "Tayang" && d.deadline && d.deadline < today);
                const next = items.find((d) => d.status !== "Tayang" && d.deadline);
                return (
                  <tr key={c.id}>
                    <td><button className="text-left font-medium hover:underline" onClick={() => p && setPartner(p)}>{p?.name}</button><div className="mono text-soft">{p?.handle}{p?.followers ? ` · ${qty(p.followers)}` : ""}</div></td>
                    <td><span className={`badge ${c.scheme === "PAID" ? "badge-red" : ""}`}>{c.scheme}</span><div className="mono mt-1 text-soft">{p?.platform}</div></td>
                    <td>{c.title}<div className="mono text-soft">{c.status}</div></td>
                    <td className="mono">{done}/{items.length} konten{late ? <div><span className="badge badge-red mt-1">Lewat deadline</span></div> : null}</td>
                    <td className="num">{rp(c.fee)}<div className="text-soft">{c.scheme === "PAID" ? `Sisa ${rp(c.fee - paid(c.id))}` : c.benefit || "Barter"}</div></td>
                    <td className="mono">{next ? fmtDate(next.deadline) : "-"}{c.follow_up && <div className={c.follow_up <= today ? "text-danger" : "text-soft"}>Follow-up {fmtDate(c.follow_up)}</div>}</td>
                    <td>{c.pic || "-"}</td>
                    <td className="num"><button className="btn btn-sm btn-flat" onClick={() => setDetail(c.id)}>Detail →</button></td>
                  </tr>
                );
              })}
              {!paged.items.length && <tr><td colSpan={8}><Empty>{partners.length ? "Belum ada kolaborasi di sini." : "Mulai dengan menambahkan partner, lalu buat kolaborasi."}</Empty></td></tr>}
            </tbody>
          </table>
        </div>
        <Pager {...paged} noun="kolaborasi" />
      </section>

      <section className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <Card title="Kalender Konten Mendatang" right={<CalendarDays size={16} className="text-maroon" />}>
          {upcoming.length ? <div className="flex flex-col gap-2">{upcoming.map((d) => {
            const c = campaigns.find((x) => x.id === d.campaign_id)!;
            const date = new Date(d.deadline + "T00:00:00+07:00");
            return (
              <button key={d.id} className="flex items-center gap-3 rounded bg-low p-3 text-left hover:bg-mid" onClick={() => setDetail(c.id)}>
                <span className="w-12 shrink-0 rounded bg-white py-1 text-center"><span className="mono block text-[9px] uppercase">{date.toLocaleDateString("id-ID", { weekday: "short", timeZone: "Asia/Jakarta" })}</span><b className="block text-[16px]">{date.toLocaleDateString("id-ID", { day: "numeric", timeZone: "Asia/Jakarta" })}</b><span className="mono block text-[9px] uppercase">{date.toLocaleDateString("id-ID", { month: "short", timeZone: "Asia/Jakarta" })}</span></span>
                <span className="min-w-0"><b className="block truncate font-medium">{d.title}</b><span className="muted block truncate">{partnerOf(c.partner_id)?.name} · {c.title}</span><span className="mono text-soft">{d.status} · PIC {c.pic || "-"}</span></span>
              </button>
            );
          })}</div> : <Empty>Tidak ada konten terjadwal.</Empty>}
        </Card>
        <Card title="Ringkasan ROI & Engagement" right={<TrendingUp size={16} className="text-moss" />}>
          <div className="grid grid-cols-3 gap-2">
            {[["Reach", qty(reach)], ["Views", qty(views)], ["Engagement", qty(engagement)]].map(([k, v]) => <div key={k} className="rounded bg-low p-3"><p className="micro">{k}</p><p className="mono mt-1 text-[16px] font-medium">{v}</p></div>)}
          </div>
          <dl className="mono mt-3 flex flex-col gap-1">
            <div className="flex justify-between"><dt>Fee dibayar</dt><dd>{rp(spent)}</dd></div>
            <div className="flex justify-between"><dt>Biaya per engagement</dt><dd>{engagement ? rp(spent / engagement) : "-"}</dd></div>
            <div className="flex justify-between"><dt>Engagement rate</dt><dd>{reach ? `${((engagement / reach) * 100).toFixed(1)}%` : "-"}</dd></div>
          </dl>
        </Card>
      </section>

      {partner && (
        <FormModal title={partner.id ? "Edit Partner" : "Tambah Partner"} action={savePartner} extra={{ id: partner.id }} success="Partner disimpan." onClose={() => setPartner(null)}>
          <Field label="Nama partner"><input className="input" name="name" required defaultValue={partner.name} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Jenis"><select className="input" name="kind" defaultValue={partner.kind || "KOL"}><option>KOL</option><option>Media Partner</option><option>Prospek</option></select></Field>
            <Field label="Platform utama"><select className="input" name="platform" defaultValue={partner.platform || "Instagram"}>{PLATFORMS.map((p) => <option key={p}>{p}</option>)}</select></Field>
            <Field label="Handle / nama kanal"><input className="input" name="handle" defaultValue={partner.handle} /></Field>
            <Field label="Followers"><input className="input" type="number" min="0" name="followers" defaultValue={partner.followers} /></Field>
            <Field label="Kontak"><input className="input" name="contact" defaultValue={partner.contact} /></Field>
            <Field label="Niche"><input className="input" name="niche" defaultValue={partner.niche} /></Field>
          </div>
          <Field label="Catatan"><textarea className="input" rows={2} name="note" defaultValue={partner.note} /></Field>
        </FormModal>
      )}
      {campaign && (
        <FormModal wide title={campaign.id ? "Edit Kolaborasi" : "Buat Kolaborasi"} description="Satu kesepakatan, semua detail tercatat." action={saveCampaign} extra={{ id: campaign.id }} success="Kolaborasi disimpan." onClose={() => setCampaign(null)}>
          {!partners.length && <p className="rounded bg-danger-soft px-3 py-2 text-[12px] text-[#93000a]">Tambahkan partner terlebih dahulu.</p>}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <Field label="Partner"><select className="input" name="partner_id" required defaultValue={campaign.partner_id}>{partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
            <Field label="Nama kampanye" className="md:col-span-2"><input className="input" name="title" required defaultValue={campaign.title} /></Field>
            <Field label="Skema"><select className="input" name="scheme" defaultValue={campaign.scheme || "PAID"}><option>PAID</option><option>NONPAID</option></select></Field>
            <Field label="Status"><select className="input" name="status" defaultValue={campaign.status || "Dihubungi"}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></Field>
            <Field label="PIC internal"><input className="input" name="pic" defaultValue={campaign.pic} /></Field>
            <Field label="Fee disepakati (Rp)"><input className="input" type="number" min="0" name="fee" defaultValue={campaign.fee ?? 0} /></Field>
            <Field label="Benefit / barter"><input className="input" name="benefit" defaultValue={campaign.benefit} /></Field>
            <Field label="Estimasi biaya benefit (Rp)"><input className="input" type="number" min="0" name="benefit_cost" defaultValue={campaign.benefit_cost ?? 0} /></Field>
            <Field label="Tanggal mulai"><input className="input" type="date" name="starts_on" defaultValue={campaign.starts_on ?? ""} /></Field>
            <Field label="Target selesai"><input className="input" type="date" name="ends_on" defaultValue={campaign.ends_on ?? ""} /></Field>
            <Field label="Follow-up berikutnya"><input className="input" type="date" name="follow_up" defaultValue={campaign.follow_up ?? ""} /></Field>
          </div>
          <Field label="Catatan kesepakatan / brief"><textarea className="input" rows={3} name="note" defaultValue={campaign.note} /></Field>
        </FormModal>
      )}
      {shown && !campaign && !content && !paying && (
        <Modal wide title={shown.title} description={`${partnerOf(shown.partner_id)?.name} · ${shown.status}`} onClose={() => setDetail(null)}>
          <div className="mb-4 flex flex-wrap gap-2">
            <button className="btn btn-sm" onClick={() => setCampaign(shown)}>Edit kolaborasi</button>
            <button className="btn btn-sm btn-primary" onClick={() => setContent({ campaign_id: shown.id })}><Plus size={13} />Tambah konten</button>
            {shown.fee - paidShown > 0 && <button className="btn btn-sm" onClick={() => setPaying(shown.id)}>Catat pembayaran fee</button>}
            <ActionButton className="btn btn-sm btn-flat" action={archiveCampaign} input={{ id: shown.id, archived: !shown.archived }} success="Status arsip diubah.">{shown.archived ? "Aktifkan" : "Arsipkan"}</ActionButton>
          </div>
          <div className="mb-4 grid grid-cols-3 gap-2 rounded bg-low p-3">
            <div><p className="micro">Fee</p><p className="mono font-medium">{rp(shown.fee)}</p></div>
            <div><p className="micro">Dibayar</p><p className="mono font-medium">{rp(paidShown)}</p></div>
            <div><p className="micro">Sisa</p><p className="mono font-medium">{rp(shown.fee - paidShown)}</p></div>
          </div>
          {shown.note && <p className="muted mb-4">{shown.note}</p>}
          <h3 className="h-card mb-2">Konten & metrik</h3>
          {contentOf(shown.id).length ? <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Konten</th><th>Deadline</th><th>Status</th><th className="num">Views</th><th className="num">Reach</th><th className="num">Aksi</th></tr></thead><tbody>
            {contentOf(shown.id).map((d) => <tr key={d.id}><td>{d.title}{d.link && <a href={d.link} target="_blank" rel="noreferrer" className="link ml-2"><ExternalLink size={11} />Bukti</a>}</td><td className="mono">{fmtDate(d.deadline)}</td><td><span className={`badge ${d.status === "Tayang" ? "badge-moss" : ""}`}>{d.status}</span></td><td className="num">{qty(d.views)}</td><td className="num">{qty(d.reach)}</td><td className="num"><button className="link" onClick={() => setContent(d)}>Edit</button></td></tr>)}
          </tbody></table></div> : <Empty>Belum ada konten.</Empty>}
          {payments.some((p) => p.campaign_id === shown.id) && (<>
            <h3 className="h-card mb-2 mt-4">Riwayat pembayaran</h3>
            <ul className="mono flex flex-col gap-1">{payments.filter((p) => p.campaign_id === shown.id).map((p) => <li key={p.id} className="flex justify-between rounded bg-low px-3 py-1.5"><span>{fmtDate(p.paid_on)}{p.ref ? ` · ${p.ref}` : ""}</span><span>{rp(p.amount)}</span></li>)}</ul>
          </>)}
        </Modal>
      )}
      {content && (
        <FormModal title={content.id ? "Edit Konten" : "Tambah Konten"} description="Deadline, bukti tayang, dan hasil konten." action={saveDeliverable} extra={{ id: content.id, campaign_id: content.campaign_id }} success="Konten disimpan." onClose={() => setContent(null)}>
          <Field label="Judul konten"><input className="input" name="title" required defaultValue={content.title} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Deadline"><input className="input" type="date" name="deadline" defaultValue={content.deadline ?? ""} /></Field>
            <Field label="Status konten"><select className="input" name="status" defaultValue={content.status || "Belum mulai"}>{CONTENT.map((s) => <option key={s}>{s}</option>)}</select></Field>
            <Field label="Link bukti tayang"><input className="input" name="link" type="url" defaultValue={content.link} /></Field>
            <Field label="Tanggal tayang"><input className="input" type="date" name="published_on" defaultValue={content.published_on ?? ""} /></Field>
            <Field label="Views"><input className="input" type="number" min="0" name="views" defaultValue={content.views ?? 0} /></Field>
            <Field label="Reach"><input className="input" type="number" min="0" name="reach" defaultValue={content.reach ?? 0} /></Field>
            <Field label="Engagement"><input className="input" type="number" min="0" name="engagement" defaultValue={content.engagement ?? 0} /></Field>
          </div>
        </FormModal>
      )}
      {paying && (
        <FormModal title="Catat pembayaran fee" description={`Sisa fee ${rp(paidShown ? (shown!.fee - paidShown) : shown?.fee ?? 0)}. Otomatis masuk beban Marketing di Finance.`} action={payCampaign} extra={{ campaign_id: paying }} success="Pembayaran dicatat." onClose={() => setPaying(null)}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nominal (Rp)"><input className="input" type="number" min="1" name="amount" required /></Field>
            <Field label="Tanggal pembayaran"><input className="input" type="date" name="paid_on" defaultValue={today} required /></Field>
          </div>
          <Field label="Referensi / link bukti"><input className="input" name="ref" /></Field>
          <Field label="Catatan"><input className="input" name="note" /></Field>
        </FormModal>
      )}
    </>
  );
}
