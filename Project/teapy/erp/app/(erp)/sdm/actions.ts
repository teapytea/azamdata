"use server";

import { createHash } from "node:crypto";
import { dateOrNull, guarded, num, req, str } from "@/lib/action";
import { FULL, hashPassword } from "@/lib/auth";
import { query, tx } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export async function saveEmployee(input: Record<string, string>) {
  return guarded(FULL, async () => {
    const values = [req(input.name, "Nama karyawan", 120), req(input.position, "Posisi", 80), str(input.contact, 120), num(input.rate, "Upah per shift"), input.active !== "false"];
    if (input.id) await query("update employees set name=$2, position=$3, contact=$4, rate=$5, active=$6 where id=$1", [input.id, ...values]);
    else await query("insert into employees (name, position, contact, rate, active) values ($1,$2,$3,$4,$5)", values);
  });
}

export async function addShift(input: Record<string, string>) {
  return guarded(FULL, async () => {
    const date = dateOrNull(input.date);
    if (!date) throw new Error("Isi tanggal shift.");
    const code = input.code === "shift2" ? "shift2" : "shift1";
    const s = await getSettings();
    await tx(async (q) => {
      const [e] = await q<{ rate: number }>("select rate from employees where id=$1 and active", [input.employee_id]);
      if (!e) throw new Error("Pilih karyawan aktif.");
      // Kontrak: maksimal enam shift per minggu dan tetap ada satu hari istirahat.
      const [{ n }] = await q<{ n: number }>(
        `select count(distinct date)::int as n from shifts where employee_id=$1 and status <> 'Batal' and date_trunc('week', date) = date_trunc('week', $2::date) and date <> $2::date`, [input.employee_id, date]);
      if (n >= 6) throw new Error("Karyawan ini sudah enam hari kerja minggu ini. Kontrak mewajibkan satu hari istirahat.");
      const [same] = await q("select id from shifts where employee_id=$1 and date=$2 and status <> 'Batal'", [input.employee_id, date]);
      if (same) throw new Error("Karyawan ini sudah punya shift pada tanggal tersebut. Kontrak mengatur satu shift per hari.");
      await q(
        `insert into shifts (employee_id, date, code, starts, ends, station, rate) values ($1,$2,$3,$4,$5,$6,$7)
         on conflict (employee_id, date, code) do update set status='Terjadwal', station=excluded.station, check_in=null, check_out=null`,
        [input.employee_id, date, code, code === "shift1" ? s.shift1_start : s.shift2_start, code === "shift1" ? s.shift1_end : s.shift2_end, str(input.station, 80), e.rate]);
    });
  });
}

export async function cancelShift(input: { id: string }) {
  return guarded(FULL, async () => {
    const rows = await query("update shifts set status='Batal' where id=$1 and status='Terjadwal' returning id", [input.id]);
    if (!rows.length) throw new Error("Hanya shift yang belum dimulai yang bisa dibatalkan.");
  });
}

export async function markAttendance(input: { id: string; kind: "in" | "out" | "absent" }) {
  return guarded(FULL, async () => {
    const sql = input.kind === "in" ? "update shifts set check_in=now(), status='Hadir' where id=$1 and status='Terjadwal' returning id"
      : input.kind === "out" ? "update shifts set check_out=now(), status='Selesai' where id=$1 and status='Hadir' returning id"
      : "update shifts set status='Tidak hadir' where id=$1 and status='Terjadwal' returning id";
    if (!(await query(sql, [input.id])).length) throw new Error("Status shift sudah berubah. Muat ulang halaman.");
  });
}

/** Pembayaran upah menjadi beban Payroll di Finance. */
export async function payShift(input: { id: string }) {
  return guarded(FULL, async (user) => {
    await tx(async (q) => {
      const [s] = await q<{ id: string; rate: number; date: string; name: string; paid_at: string | null; status: string }>(
        "select s.id, s.rate, s.date, s.paid_at, s.status, e.name from shifts s join employees e on e.id=s.employee_id where s.id=$1 for update of s", [input.id]);
      if (!s || s.paid_at) throw new Error("Upah shift ini sudah dibayar.");
      if (s.status !== "Selesai") throw new Error("Upah dibayar setelah shift selesai.");
      const [e] = await q<{ id: string }>("insert into expenses (category, note, amount, source, ref) values ('Payroll',$1,$2,'Upah Shift',$3) returning id", [`Upah ${s.name} ${s.date}`, s.rate, user.name]);
      await q("update shifts set paid_at=now(), expense_id=$2 where id=$1", [s.id, e.id]);
    });
  });
}

export async function saveTaskTemplate(input: Record<string, string>) {
  return guarded(FULL, async () => {
    const values = [req(input.title, "Judul tugas", 160), str(input.description, 300), input.shift_code === "shift2" ? "shift2" : "shift1", num(input.sort || 0, "Urutan")];
    if (input.id) await query("update task_templates set title=$2, description=$3, shift_code=$4, sort=$5 where id=$1", [input.id, ...values]);
    else await query("insert into task_templates (title, description, shift_code, sort) values ($1,$2,$3,$4)", values);
  });
}

export async function toggleTaskTemplate(input: { id: string; active: boolean }) {
  return guarded(FULL, async () => {
    await query("update task_templates set active=$2 where id=$1", [input.id, input.active]);
  });
}

export async function addTask(input: Record<string, string>) {
  return guarded(FULL, async () => {
    const date = dateOrNull(input.date);
    if (!date) throw new Error("Isi tanggal tugas.");
    await query("insert into tasks (date, shift_code, title, description, employee_id) values ($1,$2,$3,$4,$5)",
      [date, input.shift_code === "shift2" ? "shift2" : "shift1", req(input.title, "Judul tugas", 160), str(input.description, 300), input.employee_id || null]);
  });
}

export async function decideLeave(input: { id: string; status: "Disetujui" | "Ditolak" }) {
  return guarded(FULL, async (user) => {
    const rows = await query("update leave_requests set status=$2, decided_by=$3, decided_at=now() where id=$1 and status='Menunggu' returning id", [input.id, input.status, user.name]);
    if (!rows.length) throw new Error("Pengajuan ini sudah diputuskan.");
  });
}

/* Kontrak kerja --------------------------------------------------------- */
export async function saveContractDraft(input: { title: string; body: string }) {
  return guarded(FULL, async () => {
    const title = req(input.title, "Judul", 200);
    const body = req(input.body, "Isi perjanjian", 100000);
    await tx(async (q) => {
      const [draft] = await q<{ id: string }>("select id from contract_templates where status='Draft' order by version desc limit 1");
      if (draft) await q("update contract_templates set title=$2, body=$3 where id=$1", [draft.id, title, body]);
      else {
        const [{ v }] = await q<{ v: number }>("select coalesce(max(version),0)::int + 1 as v from contract_templates");
        await q("insert into contract_templates (version, title, body) values ($1,$2,$3)", [v, title, body]);
      }
    });
  });
}

export async function publishContract() {
  return guarded(FULL, async (user) => {
    await tx(async (q) => {
      const [draft] = await q<{ id: string; title: string; body: string }>("select id, title, body from contract_templates where status='Draft' order by version desc limit 1");
      if (!draft) throw new Error("Tidak ada draft untuk diterbitkan.");
      await q("update contract_templates set status='Arsip' where status='Diterbitkan'");
      await q("update contract_templates set status='Diterbitkan', hash=$2, published_at=now(), published_by=$3 where id=$1", [draft.id, createHash("sha256").update(draft.title + draft.body).digest("hex"), user.name]);
    });
  });
}

/** Admin memverifikasi kontrak dan menghubungkannya ke data karyawan agar jadwal tampil di portal. */
export async function verifySubmission(input: Record<string, string>) {
  return guarded(FULL, async (user) => {
    const rate = num(input.rate, "Upah per shift");
    await tx(async (q) => {
      const [s] = await q<{ id: string; name: string; phone: string; email: string; user_id: string | null; status: string }>("select id, name, phone, email, user_id, status from contract_submissions where id=$1 for update", [input.id]);
      if (!s) throw new Error("Kontrak tidak ditemukan.");
      if (s.status === "Terverifikasi") throw new Error("Kontrak ini sudah diverifikasi.");
      const [e] = input.employee_id
        ? await q<{ id: string }>("update employees set contact=$2, email=$3, rate=$4 where id=$1 returning id", [input.employee_id, s.phone, s.email, rate])
        : await q<{ id: string }>("insert into employees (name, position, contact, email, rate) values ($1,$2,$3,$4,$5) returning id", [s.name, req(input.position, "Posisi", 80), s.phone, s.email, rate]);
      await q("update contract_submissions set status='Terverifikasi', employee_id=$2, verified_by=$3, verified_at=now() where id=$1", [s.id, e.id, user.name]);
      if (s.user_id) await q("update users set employee_id=$2, pos_access=$3 where id=$1", [s.user_id, e.id, input.pos_access === "on"]);
    });
  });
}

export async function rejectSubmission(input: { id: string }) {
  return guarded(FULL, async (user) => {
    const rows = await query("update contract_submissions set status='Ditolak', verified_by=$2, verified_at=now() where id=$1 and status='Menunggu verifikasi' returning id", [input.id, user.name]);
    if (!rows.length) throw new Error("Status kontrak sudah berubah.");
  });
}

export async function resetEmployeePassword(input: Record<string, string>) {
  return guarded(FULL, async () => {
    if (String(input.password).length < 8) throw new Error("Password minimal 8 karakter.");
    const rows = await query("update users set password_hash=$2, must_change_password=true where id=$1 and role='employee' returning id", [input.user_id, await hashPassword(input.password)]);
    if (!rows.length) throw new Error("Akun karyawan tidak ditemukan.");
  });
}
