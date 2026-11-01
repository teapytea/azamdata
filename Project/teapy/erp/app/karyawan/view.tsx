"use client";

import { useState } from "react";
import { CalendarDays, CheckCircle2, ClipboardCheck, Clock, FileText, KeyRound, Leaf, LogIn, LogOut, Monitor, Plus, Tag } from "lucide-react";
import { logoutTo } from "@/app/auth-actions";
import { confirmLabel, startBatch } from "@/app/(erp)/brewing/actions";
import { ContractDoc, SignatureSvg, type Stroke } from "@/components/contract";
import { ActionButton, Bar, Empty, Field, FormModal, Modal, Tabs, useRun } from "@/components/ui";
import { fmtDate, fmtDateTime, fmtLong, fmtTime, qty } from "@/lib/format";
import { checkIn, checkOut, requestLeave, toggleTask } from "./actions";

type Shift = { id: string; date: string; code: string; starts: string; ends: string; station: string; status: string; check_in: string | null; check_out: string | null };
type Task = { id: string; title: string; description: string; shift_code: string; done_at: string | null; done_by: string; employee_id: string | null };
type Leave = { id: string; kind: string; date_from: string; date_to: string; reason: string; status: string };
type Batch = { id: string; code: string; made_on: string; expires_at: string; remaining_ml: number; name: string };
type Contract = { title: string; body: string; hash: string; printed_name: string; signature: Stroke[]; signed_at: string; status: string } | null;

export function PortalView({ user, today, contract, shifts, tasks, leaves, batches, products, expiryHours }: {
  user: { name: string; employee_id: string | null; pos_access: boolean }; today: string; contract: Contract; shifts: Shift[]; tasks: Task[]; leaves: Leave[]; batches: Batch[]; products: { id: string; name: string }[]; expiryHours?: number;
}) {
  const [tab, setTab] = useState("tugas");
  const [leave, setLeave] = useState(false);
  const [brew, setBrew] = useState(false);
  const [label, setLabel] = useState<Batch | null>(null);
  const { run, busy } = useRun();
  const todayShifts = shifts.filter((s) => s.date === today);
  const upcoming = shifts.filter((s) => s.date > today);
  const past = shifts.filter((s) => s.date < today).reverse();
  const done = tasks.filter((t) => t.done_at).length;
  const verified = !!user.employee_id;

  return (
    <div className="flex min-h-screen flex-col bg-cream text-maroon">
      <header className="no-print border-b border-[#e5d9cc]">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-4 py-4 md:px-8">
          <div className="flex items-center gap-2"><Leaf size={22} /><strong className="font-brand text-[22px] tracking-tight">teapy</strong><span className="mono ml-2 hidden border-l border-[#e5d9cc] pl-3 tracking-[.12em] sm:inline">PORTAL KARYAWAN</span></div>
          <div className="flex items-center gap-1">
            {user.pos_access && <a className="btn btn-sm" href="/pos"><Monitor size={13} />Kasir</a>}
            <a className="btn btn-sm" href="/change-password" aria-label="Ganti password"><KeyRound size={13} /><span className="hidden sm:inline">Password</span></a>
            <form action={() => logoutTo("/karyawan/login")}><button className="btn btn-sm" aria-label="Keluar"><LogOut size={13} /><span className="hidden sm:inline">Keluar</span></button></form>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col gap-5 px-4 py-6 md:px-8">
        <div className="no-print">
          <p className="mono tracking-[.12em] text-[#78645f]">{fmtLong().toUpperCase()}</p>
          <h1 className="mt-1 font-brand text-[32px] font-semibold leading-tight tracking-tight">Halo, {user.name.split(" ")[0]}.</h1>
        </div>

        {!verified && (
          <section className="no-print rounded-md border border-[#e6cf9a] bg-[#fbf2dc] p-4 text-[14px] text-[#6a4e12]">
            <strong>Kontrak Anda sedang diperiksa admin.</strong>
            <p>Jadwal dan checklist tampil setelah admin memverifikasi kontrak{contract ? ` (status: ${contract.status})` : ""}. Salinan kontrak bisa dilihat di bawah.</p>
          </section>
        )}

        {verified && (
          <section className="no-print grid gap-3 md:grid-cols-2">
            <div className="rounded-md border border-[#e5d9cc] bg-paper p-5">
              <p className="mono flex items-center gap-1.5 text-[#78645f]"><Clock size={13} />SHIFT HARI INI</p>
              {todayShifts.length ? todayShifts.map((s) => (
                <div key={s.id} className="mt-2">
                  <p className="font-brand text-[24px] font-semibold">{s.starts} - {s.ends} WIB</p>
                  <p className="text-[13px] text-[#78645f]">{s.station || "Outlet"} · {s.status}{s.check_in ? ` · masuk ${fmtTime(s.check_in)}` : ""}{s.check_out ? ` · keluar ${fmtTime(s.check_out)}` : ""}</p>
                  <div className="mt-3">
                    {s.status === "Terjadwal" && <ActionButton className="btn btn-primary !h-11 w-full !text-[14px]" action={checkIn} input={{ id: s.id }} success="Check-in tercatat."><LogIn size={16} />Check-in</ActionButton>}
                    {s.status === "Hadir" && <ActionButton className="btn btn-primary !h-11 w-full !text-[14px]" action={checkOut} input={{ id: s.id }} success="Check-out tercatat." confirm="Selesaikan shift sekarang?"><LogOut size={16} />Check-out</ActionButton>}
                    {s.status === "Selesai" && <p className="flex items-center gap-1.5 font-medium text-moss"><CheckCircle2 size={16} />Shift selesai</p>}
                  </div>
                </div>
              )) : <p className="mt-2 text-[14px]">Tidak ada shift hari ini. Selamat beristirahat.</p>}
            </div>
            <div className="rounded-md border border-[#e5d9cc] bg-paper p-5">
              <p className="mono flex items-center gap-1.5 text-[#78645f]"><ClipboardCheck size={13} />CHECKLIST HARI INI</p>
              <p className="mt-2 font-brand text-[24px] font-semibold">{done} / {tasks.length} selesai</p>
              <div className="mt-2"><Bar value={tasks.length ? (done / tasks.length) * 100 : 0} tone="moss" /></div>
              <p className="mt-2 text-[13px] text-[#78645f]">{batches.length ? `${batches.length} batch menunggu label tanggal.` : "Semua batch sudah berlabel."}</p>
            </div>
          </section>
        )}

        <div className="no-print rounded-md bg-paper p-2">
          <Tabs value={verified ? tab : "kontrak"} onChange={setTab} items={verified
            ? [{ id: "tugas", label: "Tugas" }, { id: "batch", label: `Batch & label${batches.length ? ` (${batches.length})` : ""}` }, { id: "jadwal", label: "Jadwal saya" }, { id: "izin", label: "Izin & cuti" }, { id: "kontrak", label: "Kontrak saya" }]
            : [{ id: "kontrak", label: "Kontrak saya" }]} />
        </div>

        {verified && tab === "tugas" && (
          <section className="no-print flex flex-col gap-2">
            {tasks.map((t) => (
              <label key={t.id} className={`flex cursor-pointer items-start gap-3 rounded-md border border-[#e5d9cc] bg-paper p-4 ${t.done_at ? "opacity-70" : ""}`}>
                <input type="checkbox" className="mt-1 !h-5 !w-5 shrink-0" disabled={busy} checked={!!t.done_at} aria-label={t.title} onChange={(e) => run(toggleTask, { id: t.id, done: e.target.checked })} />
                <span className="min-w-0"><b className={`block text-[15px] font-semibold ${t.done_at ? "line-through" : ""}`}>{t.title}</b>{t.description && <span className="block text-[13px] text-[#78645f]">{t.description}</span>}{t.done_at && <span className="mono block text-[#78645f]">{t.done_by} · {fmtTime(t.done_at)}</span>}</span>
              </label>
            ))}
            {!tasks.length && <Empty>{todayShifts.length ? "Belum ada tugas untuk shift ini." : "Checklist tampil pada hari Anda bertugas."}</Empty>}
          </section>
        )}

        {verified && tab === "batch" && (
          <section className="no-print flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2 rounded-md border border-[#e5d9cc] bg-paper p-4">
              <p className="text-[13px] text-[#78645f]">Setelah menyeduh, tempel label tanggal lalu konfirmasi di sini. Batch baru bisa dijual setelah dikonfirmasi. Batas pakai {expiryHours} jam.</p>
              <button className="btn btn-primary shrink-0" onClick={() => setBrew(true)}><Plus size={14} />Batch baru</button>
            </div>
            {batches.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-3 rounded-md border border-[#e5d9cc] bg-paper p-4">
                <div className="min-w-0"><b className="block truncate text-[15px] font-semibold">{b.name}</b><p className="mono text-[#78645f]">{b.code} · {qty(b.remaining_ml)} ml · s/d {fmtDateTime(b.expires_at)}</p></div>
                <button className="btn btn-primary shrink-0" onClick={() => setLabel(b)}><Tag size={14} />Konfirmasi label</button>
              </div>
            ))}
            {!batches.length && <Empty>Tidak ada batch yang menunggu label.</Empty>}
          </section>
        )}

        {verified && tab === "jadwal" && (
          <section className="no-print grid gap-3 md:grid-cols-2">
            {[{ title: "Jadwal berikutnya", rows: upcoming, empty: "Belum ada jadwal berikutnya dari admin." }, { title: "Riwayat 7 hari", rows: past, empty: "Belum ada riwayat." }].map((g) => (
              <div key={g.title} className="rounded-md border border-[#e5d9cc] bg-paper p-5">
                <p className="mono mb-3 flex items-center gap-1.5 text-[#78645f]"><CalendarDays size={13} />{g.title.toUpperCase()}</p>
                {g.rows.length ? <ul className="flex flex-col divide-y divide-[#e5d9cc]">{g.rows.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-2 py-2"><span><b className="block font-semibold">{fmtLong(s.date)}</b><span className="mono text-[#78645f]">{s.starts} - {s.ends}{s.station ? ` · ${s.station}` : ""}</span></span><span className="badge">{s.status}</span></li>
                ))}</ul> : <p className="text-[14px] text-[#78645f]">{g.empty}</p>}
              </div>
            ))}
          </section>
        )}

        {verified && tab === "izin" && (
          <section className="no-print flex flex-col gap-3">
            <button className="btn btn-primary self-start" onClick={() => setLeave(true)}><Plus size={14} />Ajukan izin / cuti</button>
            {leaves.map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-3 rounded-md border border-[#e5d9cc] bg-paper p-4">
                <div className="min-w-0"><b className="block font-semibold">{l.kind}</b><p className="mono text-[#78645f]">{fmtDate(l.date_from)} - {fmtDate(l.date_to)}{l.reason ? ` · ${l.reason}` : ""}</p></div>
                <span className={`badge ${l.status === "Disetujui" ? "badge-moss" : l.status === "Ditolak" ? "badge-red" : "badge-sand"}`}>{l.status}</span>
              </div>
            ))}
            {!leaves.length && <Empty>Belum ada pengajuan.</Empty>}
          </section>
        )}

        {(tab === "kontrak" || !verified) && (
          contract ? (
            <section className="flex flex-col gap-3">
              <button className="no-print btn self-start" onClick={() => window.print()}><FileText size={14} />Simpan salinan / cetak PDF</button>
              <ContractDoc title={contract.title} body={contract.body}>
                <div className="mt-6 border-t border-[#e5d9cc] pt-4"><SignatureSvg value={contract.signature} className="h-20 w-64" /><p className="font-semibold">{contract.printed_name}</p><p className="mono">Disetujui {fmtDateTime(contract.signed_at)}</p><p className="mono mt-2 break-all text-[#78645f]">Sidik naskah: {contract.hash}</p></div>
              </ContractDoc>
            </section>
          ) : <Empty>Salinan kontrak tidak ditemukan. Hubungi admin Teapy.</Empty>
        )}
      </main>
      <footer className="no-print mono border-t border-[#e5d9cc] py-4 text-center tracking-[.1em]">TEAPY · BACK TO ESSENCE</footer>

      {leave && (
        <FormModal title="Ajukan izin / cuti" action={requestLeave} success="Pengajuan terkirim ke admin." submit="Kirim pengajuan" onClose={() => setLeave(false)}>
          <Field label="Jenis"><select className="input" name="kind"><option>Sakit</option><option>Izin</option><option>Cuti</option></select></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Dari"><input className="input" type="date" name="date_from" required defaultValue={today} /></Field>
            <Field label="Sampai"><input className="input" type="date" name="date_to" required defaultValue={today} /></Field>
          </div>
          <Field label="Alasan"><input className="input" name="reason" /></Field>
        </FormModal>
      )}
      {brew && (
        <FormModal title="Batch seduh baru" description="Bahan dipotong dari stok sesuai resep." action={startBatch} success="Batch dibuat. Tempel label lalu konfirmasi." submit="Mulai seduh" onClose={() => setBrew(false)}>
          <Field label="Menu"><select className="input" name="product_id" required>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
          <Field label="Jumlah batch"><input className="input" name="factor" type="number" min="0.1" step="0.1" defaultValue={1} required /></Field>
        </FormModal>
      )}
      {label && (
        <FormModal title={`Konfirmasi label ${label.code}`} description={label.name} action={confirmLabel} extra={{ id: label.id }} success="Batch siap dijual." submit="Label sudah ditempel" onClose={() => setLabel(null)}>
          <Field label="Tanggal pada label"><input className="input" type="date" name="made_on" defaultValue={label.made_on} required /></Field>
        </FormModal>
      )}
    </div>
  );
}
