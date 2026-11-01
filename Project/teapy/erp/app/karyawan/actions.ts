"use server";

import { dateOrNull, guarded, req, str } from "@/lib/action";
import type { User } from "@/lib/auth";
import { query, tx } from "@/lib/db";
import { todayWIB } from "@/lib/format";

const linked = <T,>(fn: (user: User & { employee_id: string }) => Promise<T>) =>
  guarded(["employee"], async (user) => {
    if (!user.employee_id) throw new Error("Akun Anda belum diverifikasi admin.");
    return fn(user as User & { employee_id: string });
  });

export async function checkIn(input: { id: string }) {
  return linked(async (user) => {
    const rows = await query("update shifts set check_in=now(), status='Hadir' where id=$1 and employee_id=$2 and date=$3 and status='Terjadwal' returning id", [input.id, user.employee_id, todayWIB()]);
    if (!rows.length) throw new Error("Check-in hanya untuk jadwal Anda hari ini.");
  });
}

export async function checkOut(input: { id: string }) {
  return linked(async (user) => {
    const rows = await query("update shifts set check_out=now(), status='Selesai' where id=$1 and employee_id=$2 and status='Hadir' returning id", [input.id, user.employee_id]);
    if (!rows.length) throw new Error("Shift ini belum check-in atau sudah selesai.");
  });
}

/** Hanya tugas milik karyawan atau tugas shift yang ia jalani hari itu. */
export async function toggleTask(input: { id: string; done: boolean }) {
  return linked(async (user) => {
    await tx(async (q) => {
      const [t] = await q<{ id: string; date: string; shift_code: string; employee_id: string | null }>("select id, date, shift_code, employee_id from tasks where id=$1 for update", [input.id]);
      if (!t) throw new Error("Tugas tidak ditemukan.");
      const allowed = t.employee_id ? t.employee_id === user.employee_id
        : (await q("select id from shifts where employee_id=$1 and date=$2 and code=$3 and status <> 'Batal'", [user.employee_id, t.date, t.shift_code])).length > 0;
      if (!allowed) throw new Error("Tugas ini bukan untuk shift Anda.");
      await q("update tasks set done_at=$2, done_by=$3 where id=$1", [t.id, input.done ? new Date().toISOString() : null, input.done ? user.name : ""]);
    });
  });
}

export async function requestLeave(input: Record<string, string>) {
  return linked(async (user) => {
    const from = dateOrNull(input.date_from);
    const to = dateOrNull(input.date_to);
    if (!from || !to || to < from) throw new Error("Periksa kembali tanggal pengajuan.");
    await query("insert into leave_requests (employee_id, kind, date_from, date_to, reason) values ($1,$2,$3,$4,$5)", [user.employee_id, req(input.kind, "Jenis", 40), from, to, str(input.reason, 300)]);
  });
}
