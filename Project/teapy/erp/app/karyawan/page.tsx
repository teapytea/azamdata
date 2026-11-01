import type { Metadata } from "next";
import { requirePage } from "@/lib/auth";
import { one, query, tx } from "@/lib/db";
import { ensureDailyTasks } from "@/lib/domain";
import { addDays, todayWIB } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { PortalView } from "./view";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Portal Karyawan · Teapy" };

export default async function PortalPage() {
  const user = await requirePage(["employee"], "/karyawan/login");
  const today = todayWIB();
  const contract = await one("select id, title, body, hash, printed_name, signature, signed_at, status from contract_submissions where user_id=$1 order by signed_at desc limit 1", [user.id]);
  if (!user.employee_id) return <PortalView user={user as never} today={today} contract={contract as never} shifts={[]} tasks={[]} leaves={[]} batches={[]} products={[]} />;

  await tx((q) => ensureDailyTasks(q, today));
  const [shifts, leaves, batches, products, settings] = await Promise.all([
    query("select id, date, code, starts, ends, station, status, check_in, check_out from shifts where employee_id=$1 and status <> 'Batal' and date >= $2 and date <= $3 order by date, starts", [user.employee_id, addDays(today, -7), addDays(today, 21)]),
    query("select id, kind, date_from, date_to, reason, status from leave_requests where employee_id=$1 order by created_at desc limit 10", [user.employee_id]),
    query(`select b.id, b.code, b.made_on, b.expires_at, b.remaining_ml, p.name from batches b join products p on p.id=b.product_id where b.drained_at is null and b.remaining_ml > 0 and b.labeled_at is null order by b.made_at`),
    query("select id, name from products where active and mode='batch' order by name"),
    getSettings(),
  ]);
  const codes = shifts.filter((s) => s.date === today).map((s) => s.code);
  const tasks = await query(
    `select id, title, description, shift_code, done_at, done_by, employee_id from tasks where date=$1 and (employee_id=$2 or (employee_id is null and shift_code = any(string_to_array($3, ',')))) order by shift_code, sort, created_at`,
    [today, user.employee_id, codes.join(",")]);
  return <PortalView user={user as never} today={today} contract={contract as never} shifts={shifts as never} tasks={tasks as never} leaves={leaves as never} batches={batches as never} products={products as never} expiryHours={settings.batch_expiry_hours} />;
}
