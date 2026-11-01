"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock, Copy, Download, FileSignature, Plus, Users, Wallet } from "lucide-react";
import { ContractDoc, SignatureSvg, type Stroke } from "@/components/contract";
import { ActionButton, Bar, Card, Empty, Field, FormModal, Kpi, Modal, PageHead, Pager, Tabs, toast, usePaged, useRun } from "@/components/ui";
import { addDays, downloadCsv, fmtDate, fmtDateTime, fmtTime, rp } from "@/lib/format";
import {
  addShift, addTask, cancelShift, decideLeave, markAttendance, payShift, publishContract, rejectSubmission, resetEmployeePassword, saveContractDraft, saveEmployee,
  saveTaskTemplate, toggleTaskTemplate, verifySubmission,
} from "./actions";

type Employee = { id: string; name: string; position: string; contact: string; email: string; rate: number; active: boolean };
type Shift = { id: string; employee_id: string; date: string; code: string; starts: string; ends: string; station: string; status: string; rate: number; check_in: string | null; check_out: string | null; paid_at: string | null; name?: string };
type Task = { id: string; date: string; shift_code: string; title: string; description: string; employee: string | null; done_at: string | null; done_by: string };
type Template = { id: string; title: string; description: string; shift_code: string; sort: number; active: boolean };
type Leave = { id: string; name: string; kind: string; date_from: string; date_to: string; reason: string; status: string; decided_by: string };
type Contract = { id: string; version: number; title: string; body: string; status: string; published_at: string | null; published_by: string };
type Submission = { id: string; name: string; email: string; phone: string; address: string; title: string; body: string; hash: string; printed_name: string; signature: Stroke[]; signed_at: string; status: string; user_id: string | null; employee_id: string | null; verified_by: string };
type UserRow = { id: string; email: string; employee_id: string | null; pos_access: boolean };

const SHIFT_LABEL: Record<string, string> = { shift1: "Shift 1", shift2: "Shift 2" };
const badge = (s: string) => (["Selesai", "Hadir", "Disetujui", "Terverifikasi", "Diterbitkan"].includes(s) ? "badge-moss" : ["Tidak hadir", "Ditolak"].includes(s) ? "badge-red" : ["Menunggu", "Menunggu verifikasi", "Draft"].includes(s) ? "badge-sand" : "");

export function SdmView({ today, monday, employees, shifts, attendance, tasks, templates, leaves, contracts, submissions, hourly, users, shiftHours }: {
  today: string; monday: string; employees: Employee[]; shifts: Shift[]; attendance: Shift[]; tasks: Task[]; templates: Template[]; leaves: Leave[]; contracts: Contract[]; submissions: Submission[];
  hourly: { hour: number; cups: number }[]; users: UserRow[]; shiftHours: { shift1: string; shift2: string };
}) {
  const [tab, setTab] = useState("jadwal");
  const [employee, setEmployee] = useState<Partial<Employee> | null>(null);
  const [newShift, setNewShift] = useState<{ date: string; employee_id?: string } | null>(null);
  const [station, setStation] = useState("all");

  const active = employees.filter((e) => e.active);
  const week = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const planned = shifts.filter((s) => s.status !== "Batal");
  const todayShifts = planned.filter((s) => s.date === today);
  const onDuty = todayShifts.filter((s) => s.status === "Hadir").length;
  const counted = attendance.filter((s) => ["Hadir", "Selesai", "Tidak hadir"].includes(s.status));
  const present = counted.filter((s) => s.status !== "Tidak hadir").length;
  const unpaid = attendance.filter((s) => s.status === "Selesai" && !s.paid_at);
  const stations = [...new Set(planned.map((s) => s.station).filter(Boolean))];
  const pendingLeave = leaves.filter((l) => l.status === "Menunggu");
  const pendingSign = submissions.filter((s) => s.status === "Menunggu verifikasi");
  const nameOf = (id: string) => employees.find((e) => e.id === id)?.name ?? "-";
  const doneTasks = tasks.filter((t) => t.done_at).length;

  const slot = (from: number, to: number) => hourly.filter((h) => h.hour >= from && h.hour < to).reduce((s, h) => s + h.cups, 0);
  const coverage = [
    { label: `Shift 1 (${shiftHours.shift1})`, staff: todayShifts.filter((s) => s.code === "shift1").length, cups: slot(10, 16) },
    { label: `Shift 2 (${shiftHours.shift2})`, staff: todayShifts.filter((s) => s.code === "shift2").length, cups: slot(16, 22) },
  ];
  const maxCups = Math.max(...coverage.map((c) => c.cups), 1);

  return (
    <>
      <PageHead crumb="SDM & Shift Scheduling" tag="Atelier Workforce Operations" title="SDM, Shift & Staff Management" description="Penjadwalan crew, presensi, upah shift, checklist tugas, izin, dan kontrak kerja."
        actions={<>
          <button className="btn" onClick={() => downloadCsv(`jadwal-${monday}`, [["Tanggal", "Karyawan", "Shift", "Mulai", "Selesai", "Station", "Status"], ...planned.map((s) => [s.date, nameOf(s.employee_id), SHIFT_LABEL[s.code], s.starts, s.ends, s.station, s.status])])}><Download size={15} />Export Jadwal</button>
          <button className="btn" onClick={() => setEmployee({})}><Users size={15} />Tambah Karyawan</button>
          <button className="btn btn-primary" onClick={() => setNewShift({ date: today })}><Plus size={15} />Atur Shift Baru</button>
        </>} />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Total Staf" value={active.length} unit="Crew" note={`${onDuty} sedang bertugas`} icon={<Users size={16} />} />
        <Kpi label="Kehadiran" value={counted.length ? `${Math.round((present / counted.length) * 100)}%` : "-"} note={`${present} dari ${counted.length} shift tercatat`} icon={<Clock size={16} />} />
        <Kpi label="Jam Terjadwal Minggu Ini" value={planned.length * 6} unit="Jam" note={`${planned.length} shift · ${planned.length * 5.5} jam efektif`} icon={<CalendarDays size={16} />} />
        <Kpi label="Upah Belum Dibayar" tone={unpaid.length ? "red" : undefined} value={rp(unpaid.reduce((s, x) => s + x.rate, 0))} note={`${unpaid.length} shift selesai`} icon={<Wallet size={16} />} />
      </section>

      <section className="card p-2">
        <Tabs value={tab} onChange={setTab} items={[
          { id: "jadwal", label: "Jadwal" }, { id: "karyawan", label: `Karyawan (${active.length})` }, { id: "presensi", label: "Presensi & upah" }, { id: "checklist", label: `Checklist (${doneTasks}/${tasks.length})` },
          { id: "izin", label: `Izin & cuti${pendingLeave.length ? ` (${pendingLeave.length})` : ""}` }, { id: "kontrak", label: `Kontrak kerja${pendingSign.length ? ` (${pendingSign.length})` : ""}` },
        ]} />
      </section>

      {tab === "jadwal" && (
        <section className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
          <div className="flex min-w-0 flex-col gap-4">
            <Card title="Shift Coverage Hari Ini" subtitle="Crew terjadwal hari ini dibanding rata-rata cup per slot, tujuh hari terakhir.">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {coverage.map((c) => (
                  <div key={c.label} className="rounded bg-low p-3">
                    <p className="mono mb-2">{c.label}</p>
                    <div className="flex justify-between"><b>{c.staff} Staf</b><span className="mono">{Math.round(c.cups / 7)} cup/hari</span></div>
                    <Bar value={(c.cups / maxCups) * 100} />
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Jadwal Shift Mingguan" subtitle={`${fmtDate(monday)} - ${fmtDate(addDays(monday, 6))}`} right={
              <div className="flex items-center gap-1">
                <Link aria-label="Minggu sebelumnya" className="btn btn-sm btn-flat" href={`/sdm?week=${addDays(monday, -7)}`}><ChevronLeft size={14} /></Link>
                <Link className="btn btn-sm btn-flat" href="/sdm">Minggu ini</Link>
                <Link aria-label="Minggu berikutnya" className="btn btn-sm btn-flat" href={`/sdm?week=${addDays(monday, 7)}`}><ChevronRight size={14} /></Link>
              </div>}>
              {stations.length > 0 && <div className="mb-3"><Tabs value={station} onChange={setStation} items={[{ id: "all", label: "Semua Station" }, ...stations.map((s) => ({ id: s, label: s }))]} /></div>}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
                {week.map((d) => (
                  <div key={d} className={`rounded p-2 ${d === today ? "bg-sand/50" : "bg-low"}`}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="mono font-medium">{new Date(d + "T00:00:00+07:00").toLocaleDateString("id-ID", { weekday: "short", day: "numeric", timeZone: "Asia/Jakarta" })}</span>
                      <button aria-label={`Tambah shift ${d}`} className="rounded p-0.5 hover:bg-high" onClick={() => setNewShift({ date: d })}><Plus size={13} /></button>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {planned.filter((s) => s.date === d && (station === "all" || s.station === station)).map((s) => (
                        <div key={s.id} className="rounded bg-white p-1.5">
                          <p className="truncate text-[12px] font-medium">{nameOf(s.employee_id)}</p>
                          <p className="mono text-[10px] text-soft">{SHIFT_LABEL[s.code]} · {s.starts}-{s.ends}</p>
                          {s.station && <p className="mono truncate text-[10px] text-soft">{s.station}</p>}
                          <div className="mt-1 flex items-center justify-between"><span className={`badge !text-[9px] ${badge(s.status)}`}>{s.status}</span>
                            {s.status === "Terjadwal" && <ActionButton className="text-[10px] text-soft underline" action={cancelShift} input={{ id: s.id }} confirm="Batalkan jadwal ini?">Batal</ActionButton>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <Card title="Hari Ini" subtitle={`${todayShifts.length} crew terjadwal`}>
            {todayShifts.length ? <ul className="flex flex-col gap-2">{todayShifts.map((s) => (
              <li key={s.id} className="rounded bg-low p-3">
                <div className="flex items-center justify-between gap-2"><b className="font-medium">{nameOf(s.employee_id)}</b><span className={`badge ${badge(s.status)}`}>{s.status}</span></div>
                <p className="mono text-soft">{s.starts} - {s.ends} WIB{s.check_in ? ` · masuk ${fmtTime(s.check_in)}` : ""}</p>
              </li>
            ))}</ul> : <Empty>Belum ada shift hari ini.</Empty>}
          </Card>
        </section>
      )}

      {tab === "karyawan" && (
        <Card flush title="Direktori Karyawan" subtitle="Akun portal terhubung setelah kontrak diverifikasi.">
          <div className="overflow-x-auto"><table className="tbl min-w-[700px]"><thead><tr><th>Nama</th><th>Posisi</th><th>Kontak</th><th className="num">Upah / shift</th><th>Akun portal</th><th>Status</th><th className="num">Aksi</th></tr></thead><tbody>
            {employees.map((e) => {
              const u = users.find((x) => x.employee_id === e.id);
              return <tr key={e.id}><td className="font-medium">{e.name}</td><td>{e.position}</td><td className="mono">{e.contact || "-"}</td><td className="num">{rp(e.rate)}</td><td className="mono">{u ? <>{u.email}{u.pos_access ? <span className="badge badge-moss ml-1">POS</span> : null}</> : "-"}</td><td><span className={`badge ${e.active ? "badge-moss" : ""}`}>{e.active ? "Aktif" : "Nonaktif"}</span></td><td className="num"><button className="link" onClick={() => setEmployee(e)}>Edit</button></td></tr>;
            })}
            {!employees.length && <tr><td colSpan={7}><Empty>Belum ada karyawan. Tambah manual atau verifikasi kontrak.</Empty></td></tr>}
          </tbody></table></div>
        </Card>
      )}

      {tab === "presensi" && <Attendance rows={attendance} today={today} />}
      {tab === "checklist" && <Checklist tasks={tasks} templates={templates} employees={active} today={today} shiftHours={shiftHours} />}

      {tab === "izin" && (
        <Card flush title="Pengajuan Izin & Cuti" subtitle="Diajukan karyawan dari portal.">
          <div className="overflow-x-auto"><table className="tbl min-w-[640px]"><thead><tr><th>Karyawan</th><th>Jenis</th><th>Tanggal</th><th>Alasan</th><th>Status</th><th className="num">Aksi</th></tr></thead><tbody>
            {leaves.map((l) => (
              <tr key={l.id}><td className="font-medium">{l.name}</td><td>{l.kind}</td><td className="mono">{fmtDate(l.date_from)} - {fmtDate(l.date_to)}</td><td>{l.reason}</td><td><span className={`badge ${badge(l.status)}`}>{l.status}</span></td>
                <td className="num">{l.status === "Menunggu" && <div className="flex justify-end gap-1"><ActionButton className="btn btn-sm btn-primary" action={decideLeave} input={{ id: l.id, status: "Disetujui" }} success="Pengajuan disetujui.">Setujui</ActionButton><ActionButton className="btn btn-sm btn-flat" action={decideLeave} input={{ id: l.id, status: "Ditolak" }} success="Pengajuan ditolak.">Tolak</ActionButton></div>}</td></tr>
            ))}
            {!leaves.length && <tr><td colSpan={6}><Empty>Belum ada pengajuan.</Empty></td></tr>}
          </tbody></table></div>
        </Card>
      )}

      {tab === "kontrak" && <Contracts contracts={contracts} submissions={submissions} employees={employees} users={users} />}

      {employee && (
        <FormModal title={employee.id ? "Edit Karyawan" : "Tambah Karyawan"} action={saveEmployee} extra={{ id: employee.id }} success="Karyawan disimpan." onClose={() => setEmployee(null)}>
          <Field label="Nama karyawan"><input className="input" name="name" required defaultValue={employee.name} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Posisi / jabatan"><input className="input" name="position" required defaultValue={employee.position ?? "Crew Outlet"} /></Field>
            <Field label="Kontak"><input className="input" name="contact" defaultValue={employee.contact} /></Field>
            <Field label="Upah per shift (Rp)"><input className="input" type="number" min="0" name="rate" required defaultValue={employee.rate} /></Field>
            <Field label="Status"><select className="input" name="active" defaultValue={String(employee.active ?? true)}><option value="true">Aktif</option><option value="false">Nonaktif</option></select></Field>
          </div>
        </FormModal>
      )}
      {newShift && (
        <FormModal title="Atur Shift" description="Kontrak: satu shift per hari, maksimal enam hari per minggu." action={addShift} success="Shift dijadwalkan." onClose={() => setNewShift(null)}>
          {!active.length && <p className="rounded bg-danger-soft px-3 py-2 text-[12px] text-[#93000a]">Tambahkan karyawan terlebih dahulu.</p>}
          <Field label="Karyawan"><select className="input" name="employee_id" required>{active.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tanggal"><input className="input" type="date" name="date" required defaultValue={newShift.date} /></Field>
            <Field label="Shift"><select className="input" name="code"><option value="shift1">Shift 1 ({shiftHours.shift1})</option><option value="shift2">Shift 2 ({shiftHours.shift2})</option></select></Field>
          </div>
          <Field label="Station / penempatan"><input className="input" name="station" placeholder="Contoh: Kasir & Tea Bar" /></Field>
        </FormModal>
      )}
    </>
  );
}

function Attendance({ rows, today }: { rows: Shift[]; today: string }) {
  const paged = usePaged(rows, 12);
  return (
    <section className="card overflow-hidden">
      <div className="bg-low px-5 py-4"><h2 className="h-card">Presensi & Upah Shift</h2><p className="muted text-[12px]">Karyawan check-in sendiri di portal. Admin bisa mencatat bila perlu.</p></div>
      <div className="overflow-x-auto"><table className="tbl min-w-[800px]"><thead><tr><th>Karyawan</th><th>Jadwal</th><th>Presensi aktual</th><th className="num">Upah</th><th>Status</th><th className="num">Tindakan</th></tr></thead><tbody>
        {paged.items.map((s) => (
          <tr key={s.id}>
            <td className="font-medium">{s.name}<div className="mono font-normal text-soft">{s.station}</div></td>
            <td className="mono">{fmtDate(s.date)}<div className="text-soft">{s.starts} - {s.ends}</div></td>
            <td className="mono">{s.check_in ? `Masuk ${fmtTime(s.check_in)}` : "-"}<div className="text-soft">{s.check_out ? `Keluar ${fmtTime(s.check_out)}` : ""}</div></td>
            <td className="num">{rp(s.rate)}<div className={s.paid_at ? "text-moss" : "text-soft"}>{s.paid_at ? "Sudah dibayar" : "Belum dibayar"}</div></td>
            <td><span className={`badge ${badge(s.status)}`}>{s.status}</span></td>
            <td className="num"><div className="flex justify-end gap-1">
              {s.status === "Terjadwal" && s.date === today && <ActionButton className="btn btn-sm btn-flat" action={markAttendance} input={{ id: s.id, kind: "in" }}>Check-in</ActionButton>}
              {s.status === "Terjadwal" && s.date <= today && <ActionButton className="btn btn-sm btn-flat" action={markAttendance} input={{ id: s.id, kind: "absent" }} confirm="Tandai tidak hadir?">Tidak hadir</ActionButton>}
              {s.status === "Hadir" && <ActionButton className="btn btn-sm btn-flat" action={markAttendance} input={{ id: s.id, kind: "out" }}>Check-out</ActionButton>}
              {s.status === "Selesai" && !s.paid_at && <ActionButton className="btn btn-sm btn-primary" action={payShift} input={{ id: s.id }} success="Upah dicatat ke Finance." confirm={`Catat pembayaran ${rp(s.rate)} untuk ${s.name}?`}>Catat bayar</ActionButton>}
            </div></td>
          </tr>
        ))}
        {!paged.items.length && <tr><td colSpan={6}><Empty>Belum ada jadwal.</Empty></td></tr>}
      </tbody></table></div>
      <Pager {...paged} noun="shift" />
    </section>
  );
}

function Checklist({ tasks, templates, employees, today, shiftHours }: { tasks: Task[]; templates: Template[]; employees: Employee[]; today: string; shiftHours: { shift1: string; shift2: string } }) {
  const [edit, setEdit] = useState<Partial<Template> | null>(null);
  const [adding, setAdding] = useState(false);
  return (
    <section className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
      <Card title="Checklist Tugas Hari Ini" subtitle="Dikerjakan karyawan dari portal." right={<button className="btn btn-sm btn-primary" onClick={() => setAdding(true)}><Plus size={13} />Tugas khusus</button>}>
        {(["shift1", "shift2"] as const).map((code) => (
          <div key={code} className="mb-3">
            <p className="mono mb-1.5 font-medium">{SHIFT_LABEL[code]} · {shiftHours[code]}</p>
            <ul className="flex flex-col gap-1.5">{tasks.filter((t) => t.shift_code === code).map((t) => (
              <li key={t.id} className="flex items-start gap-2 rounded bg-low p-2.5">
                <CheckCircle2 size={15} className={`mt-0.5 shrink-0 ${t.done_at ? "text-moss" : "text-hair"}`} />
                <div className="min-w-0"><p className={t.done_at ? "line-through opacity-70" : "font-medium"}>{t.title}</p><p className="mono text-soft">{t.done_at ? `${t.done_by} · ${fmtTime(t.done_at)}` : t.employee ? `Untuk ${t.employee}` : "Menunggu"}</p></div>
              </li>
            ))}</ul>
          </div>
        ))}
      </Card>
      <Card title="Template Checklist Harian" subtitle="Berlaku mulai hari berikutnya." right={<button className="btn btn-sm" onClick={() => setEdit({})}><Plus size={13} />Template</button>}>
        <ul className="flex flex-col divide-y divide-line">{templates.map((t) => (
          <li key={t.id} className={`flex items-center justify-between gap-2 py-2 ${t.active ? "" : "opacity-50"}`}>
            <button className="min-w-0 text-left" onClick={() => setEdit(t)}><span className="block font-medium">{t.title}</span><span className="mono text-soft">{SHIFT_LABEL[t.shift_code]} · urutan {t.sort}</span></button>
            <ActionButton className="link" action={toggleTaskTemplate} input={{ id: t.id, active: !t.active }}>{t.active ? "Nonaktifkan" : "Aktifkan"}</ActionButton>
          </li>
        ))}</ul>
      </Card>
      {edit && (
        <FormModal title={edit.id ? "Edit Template" : "Template Baru"} action={saveTaskTemplate} extra={{ id: edit.id }} success="Template disimpan." onClose={() => setEdit(null)}>
          <Field label="Judul tugas"><input className="input" name="title" required defaultValue={edit.title} /></Field>
          <Field label="Keterangan"><input className="input" name="description" defaultValue={edit.description} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Shift"><select className="input" name="shift_code" defaultValue={edit.shift_code || "shift1"}><option value="shift1">Shift 1</option><option value="shift2">Shift 2</option></select></Field>
            <Field label="Urutan"><input className="input" type="number" name="sort" defaultValue={edit.sort ?? 10} /></Field>
          </div>
        </FormModal>
      )}
      {adding && (
        <FormModal title="Tugas Khusus" description="Tampil di portal karyawan pada tanggal dan shift tersebut." action={addTask} success="Tugas dibuat." onClose={() => setAdding(false)}>
          <Field label="Judul tugas"><input className="input" name="title" required /></Field>
          <Field label="Keterangan"><input className="input" name="description" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tanggal"><input className="input" type="date" name="date" required defaultValue={today} /></Field>
            <Field label="Shift"><select className="input" name="shift_code"><option value="shift1">Shift 1</option><option value="shift2">Shift 2</option></select></Field>
          </div>
          <Field label="Karyawan (opsional)"><select className="input" name="employee_id"><option value="">Siapa pun di shift tersebut</option>{employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select></Field>
        </FormModal>
      )}
    </section>
  );
}

function Contracts({ contracts, submissions, employees, users }: { contracts: Contract[]; submissions: Submission[]; employees: Employee[]; users: UserRow[] }) {
  const { busy, run } = useRun();
  const draft = contracts.find((c) => c.status === "Draft");
  const published = contracts.find((c) => c.status === "Diterbitkan");
  const base = draft || published;
  const [title, setTitle] = useState(base?.title ?? "");
  const [body, setBody] = useState(base?.body ?? "");
  const [confirmed, setConfirmed] = useState(false);
  const [preview, setPreview] = useState(false);
  const [review, setReview] = useState<Submission | null>(null);
  const [reset, setReset] = useState<Submission | null>(null);
  const url = typeof window !== "undefined" ? `${window.location.origin}/kontrak-kerja` : "/kontrak-kerja";
  const changed = title !== base?.title || body !== base?.body;

  return (
    <section className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)]">
      <Card title="Naskah Perjanjian" subtitle={published ? `Versi ${published.version} aktif sejak ${fmtDateTime(published.published_at)}` : "Belum ada naskah yang diterbitkan."} right={<span className={`badge ${published ? "badge-moss" : "badge-sand"}`}>{published ? "Naskah publik aktif" : "Belum diterbitkan"}</span>}>
        <div className="flex flex-col gap-3">
          <Field label="Judul"><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
          <Field label="Isi perjanjian lengkap" hint="Variabel: {{nama}}, {{alamat}}, {{email}}, {{telepon}}. Judul pasal diawali ##."><textarea className="input font-mono !text-[12px]" rows={18} value={body} onChange={(e) => setBody(e.target.value)} /></Field>
          <label className="flex items-start gap-2 rounded bg-low p-3"><input type="checkbox" className="mt-0.5" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />Saya sudah memeriksa isi naskah dan siap menerbitkannya untuk ditandatangani karyawan.</label>
          <div className="flex flex-wrap gap-2">
            <button className="btn" disabled={busy} onClick={() => run(saveContractDraft, { title, body }, "Draft disimpan.")}>Simpan draft</button>
            <button className="btn" onClick={() => setPreview(true)}>Pratinjau</button>
            <button className="btn btn-primary" disabled={busy || !confirmed} onClick={async () => {
              const saved = await run(saveContractDraft, { title, body });
              if (saved !== undefined) { await run(publishContract, undefined as never, "Naskah diterbitkan. Halaman publik kini dapat menerima tanda tangan."); setConfirmed(false); }
            }}>{changed || draft ? "Terbitkan naskah" : "Terbitkan sebagai versi baru"}</button>
          </div>
        </div>
      </Card>

      <div className="flex min-w-0 flex-col gap-4">
        <Card title="Tautan Karyawan" right={<FileSignature size={16} className="text-maroon" />}>
          <p className="mono break-all rounded bg-low p-2">{url}</p>
          <button className="btn btn-sm mt-2" onClick={async () => { try { await navigator.clipboard.writeText(url); toast("Tautan disalin."); } catch { toast("Salin tautan secara manual.", "error"); } }}><Copy size={13} />Salin tautan</button>
        </Card>
        <Card title="Hasil Tanda Tangan" subtitle={`${submissions.length} kontrak`}>
          {submissions.length ? <ul className="flex flex-col gap-2">{submissions.map((s) => (
            <li key={s.id} className="rounded bg-low p-3">
              <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate font-medium">{s.name}</p><p className="mono truncate text-soft">{s.email}</p></div><span className={`badge ${badge(s.status)}`}>{s.status}</span></div>
              <p className="mono mt-1 text-soft">{fmtDateTime(s.signed_at)} · {s.user_id ? "Akun dibuat" : "Akun belum dibuat"}</p>
              <div className="mt-2 flex gap-2"><button className="btn btn-sm" onClick={() => setReview(s)}>Periksa kontrak</button>{s.user_id && <button className="btn btn-sm btn-flat" onClick={() => setReset(s)}>Reset password</button>}</div>
            </li>
          ))}</ul> : <Empty>Belum ada kontrak ditandatangani.</Empty>}
        </Card>
      </div>

      {preview && <Modal wide title="Pratinjau draft kontrak" description="Ini bukan salinan yang telah ditandatangani." onClose={() => setPreview(false)}><ContractDoc title={title} body={body} draft /></Modal>}
      {review && (
        <Modal wide title={`Periksa kontrak · ${review.name}`} description={`${review.email} · ${review.phone}`} onClose={() => setReview(null)}>
          <ContractDoc title={review.title} body={review.body}>
            <div className="mt-6 border-t border-[#e5d9cc] pt-4"><SignatureSvg value={review.signature} className="h-20 w-64" /><p className="font-semibold">{review.printed_name}</p><p className="mono">{fmtDateTime(review.signed_at)}</p><p className="mono mt-2 break-all text-soft">{review.hash}</p></div>
          </ContractDoc>
          {review.status === "Menunggu verifikasi" && <VerifyForm submission={review} employees={employees} onDone={() => setReview(null)} />}
        </Modal>
      )}
      {reset && (
        <FormModal title={`Reset password ${reset.name}`} description="Karyawan diminta mengganti password saat login berikutnya." action={resetEmployeePassword} extra={{ user_id: reset.user_id }} success="Password sementara disimpan." onClose={() => setReset(null)}>
          <Field label="Password sementara (min. 8 karakter)"><input className="input" name="password" type="text" minLength={8} required autoComplete="off" /></Field>
        </FormModal>
      )}
    </section>
  );
}

function VerifyForm({ submission, employees, onDone }: { submission: Submission; employees: Employee[]; onDone: () => void }) {
  const { busy, run } = useRun();
  return (
    <form className="mt-4 flex flex-col gap-3 rounded bg-low p-4" onSubmit={async (e) => {
      e.preventDefault();
      const done = await run(verifySubmission, { ...Object.fromEntries(new FormData(e.currentTarget)), id: submission.id } as never, "Kontrak diverifikasi dan terhubung ke data karyawan.");
      if (done !== undefined) onDone();
    }}>
      <p className="h-card">Verifikasi & hubungkan karyawan</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Field label="Data karyawan"><select className="input" name="employee_id"><option value="">Buat karyawan baru</option>{employees.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></Field>
        <Field label="Posisi (untuk data baru)"><input className="input" name="position" defaultValue="Crew Outlet" /></Field>
        <Field label="Upah per shift (Rp)"><input className="input" type="number" min="0" name="rate" required /></Field>
      </div>
      <label className="flex items-center gap-2"><input type="checkbox" name="pos_access" defaultChecked />Beri akses aplikasi kasir (POS)</label>
      <div className="flex gap-2">
        <button className="btn btn-primary" disabled={busy}>Verifikasi kontrak</button>
        <ActionButton className="btn btn-flat" action={rejectSubmission} input={{ id: submission.id }} confirm="Tolak kontrak ini?" success="Kontrak ditolak.">Tolak</ActionButton>
      </div>
    </form>
  );
}
