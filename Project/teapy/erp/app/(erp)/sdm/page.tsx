import { FULL, requirePage } from "@/lib/auth";
import { query, tx } from "@/lib/db";
import { ensureDailyTasks } from "@/lib/domain";
import { addDays, todayWIB } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { SdmView } from "./view";

const WIB = "at time zone 'Asia/Jakarta'";

export default async function SdmPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  await requirePage(FULL);
  const week = (await searchParams).week;
  const today = todayWIB();
  const base = /^\d{4}-\d{2}-\d{2}$/.test(week || "") ? week! : today;
  const offset = (new Date(base + "T00:00:00Z").getUTCDay() + 6) % 7;
  const monday = addDays(base, -offset);
  await tx((q) => ensureDailyTasks(q, today));
  const [employees, shifts, attendance, tasks, templates, leaves, templatesContract, submissions, hourly, settings, users] = await Promise.all([
    query("select * from employees order by active desc, name"),
    query("select * from shifts where date >= $1 and date < $2 order by date, starts", [monday, addDays(monday, 7)]),
    query("select s.*, e.name from shifts s join employees e on e.id=s.employee_id where s.status not in ('Batal') order by s.date desc, s.starts desc limit 200"),
    query("select t.*, e.name as employee from tasks t left join employees e on e.id=t.employee_id where t.date=$1 order by t.shift_code, t.sort, t.created_at", [today]),
    query("select * from task_templates order by shift_code, sort"),
    query("select l.*, e.name from leave_requests l join employees e on e.id=l.employee_id order by (l.status='Menunggu') desc, l.created_at desc limit 50"),
    query("select id, version, title, body, status, published_at, published_by from contract_templates order by version desc"),
    query("select id, name, email, phone, address, title, body, hash, printed_name, signature, signed_at, status, user_id, employee_id, verified_by from contract_submissions order by signed_at desc limit 100"),
    query(`select extract(hour from (s.at ${WIB}))::int as hour, sum(l.qty)::int as cups from sale_lines l join sales s on s.id=l.sale_id where s.status='Selesai' and (s.at ${WIB})::date >= $1 group by 1`, [addDays(today, -6)]),
    getSettings(),
    query("select id, email, employee_id, pos_access from users where role='employee'"),
  ]);
  return <SdmView today={today} monday={monday} employees={employees as never} shifts={shifts as never} attendance={attendance as never} tasks={tasks as never} templates={templates as never}
    leaves={leaves as never} contracts={templatesContract as never} submissions={submissions as never} hourly={hourly as never} users={users as never}
    shiftHours={{ shift1: `${settings.shift1_start} - ${settings.shift1_end}`, shift2: `${settings.shift2_start} - ${settings.shift2_end}` }} />;
}
