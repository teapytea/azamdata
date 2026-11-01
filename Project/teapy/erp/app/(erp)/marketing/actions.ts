"use server";

import { dateOrNull, guarded, num, req, str } from "@/lib/action";
import type { Role } from "@/lib/auth";
import { query, tx } from "@/lib/db";

const TEAM: Role[] = ["owner", "admin", "marketing"];

export async function savePartner(input: Record<string, string>) {
  return guarded(TEAM, async () => {
    const values = [req(input.name, "Nama partner", 120), req(input.kind, "Jenis", 40), str(input.handle, 80), str(input.platform, 40), str(input.contact, 120), str(input.niche, 80), Math.round(num(input.followers || 0, "Followers")), str(input.note, 300)];
    if (input.id) await query("update partners set name=$2, kind=$3, handle=$4, platform=$5, contact=$6, niche=$7, followers=$8, note=$9 where id=$1", [input.id, ...values]);
    else await query("insert into partners (name, kind, handle, platform, contact, niche, followers, note) values ($1,$2,$3,$4,$5,$6,$7,$8)", values);
  });
}

export async function saveCampaign(input: Record<string, string>) {
  return guarded(TEAM, async () => {
    const values = [req(input.partner_id, "Partner"), req(input.title, "Nama kampanye", 160), req(input.scheme, "Skema", 20), str(input.pic, 80), num(input.fee || 0, "Fee"), str(input.benefit, 200), num(input.benefit_cost || 0, "Estimasi benefit"),
      req(input.status, "Status", 30), dateOrNull(input.starts_on), dateOrNull(input.ends_on), dateOrNull(input.follow_up), str(input.note, 500)];
    if (input.id) await query("update campaigns set partner_id=$2, title=$3, scheme=$4, pic=$5, fee=$6, benefit=$7, benefit_cost=$8, status=$9, starts_on=$10, ends_on=$11, follow_up=$12, note=$13 where id=$1", [input.id, ...values]);
    else await query("insert into campaigns (partner_id, title, scheme, pic, fee, benefit, benefit_cost, status, starts_on, ends_on, follow_up, note) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)", values);
  });
}

export async function archiveCampaign(input: { id: string; archived: boolean }) {
  return guarded(TEAM, async () => {
    await query("update campaigns set archived=$2 where id=$1", [input.id, input.archived]);
  });
}

export async function saveDeliverable(input: Record<string, string>) {
  return guarded(TEAM, async () => {
    const values = [req(input.title, "Judul konten", 160), dateOrNull(input.deadline), req(input.status, "Status", 30), str(input.link, 300), dateOrNull(input.published_on), Math.round(num(input.views || 0, "Views")), Math.round(num(input.reach || 0, "Reach")), Math.round(num(input.engagement || 0, "Engagement"))];
    if (input.id) await query("update deliverables set title=$2, deadline=$3, status=$4, link=$5, published_on=$6, views=$7, reach=$8, engagement=$9 where id=$1", [input.id, ...values]);
    else await query("insert into deliverables (campaign_id, title, deadline, status, link, published_on, views, reach, engagement) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)", [req(input.campaign_id, "Kampanye"), ...values]);
  });
}

/** Pembayaran fee langsung menjadi beban Marketing di Finance. */
export async function payCampaign(input: Record<string, string>) {
  return guarded(TEAM, async (user) => {
    const amount = num(input.amount, "Nominal", 1);
    const date = dateOrNull(input.paid_on);
    if (!date) throw new Error("Isi tanggal pembayaran.");
    await tx(async (q) => {
      const [c] = await q<{ title: string; fee: number; partner: string; paid: number }>(
        "select c.title, c.fee, p.name as partner, (select coalesce(sum(amount),0)::float8 from campaign_payments x where x.campaign_id=c.id) as paid from campaigns c join partners p on p.id=c.partner_id where c.id=$1", [input.campaign_id]);
      if (!c) throw new Error("Kampanye tidak ditemukan.");
      if (amount > c.fee - c.paid) throw new Error("Nominal melebihi sisa fee.");
      const [e] = await q<{ id: string }>("insert into expenses (at, category, note, amount, source, ref) values (($1 || ' 12:00+07')::timestamptz,'Marketing',$2,$3,'Fee Marketing',$4) returning id",
        [date, `Fee ${c.partner}: ${c.title}`, amount, user.name]);
      await q("insert into campaign_payments (campaign_id, amount, paid_on, ref, note, expense_id) values ($1,$2,$3,$4,$5,$6)", [input.campaign_id, amount, date, str(input.ref, 200), str(input.note, 300), e.id]);
    });
  });
}
