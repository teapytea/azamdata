"use server";

import { createHash } from "node:crypto";
import { cookies, headers } from "next/headers";
import { guarded, req, str } from "@/lib/action";
import { clientIp, hashPassword, rateLimit, readToken, secureCookie, signToken, startSession } from "@/lib/auth";
import { one, query, tx } from "@/lib/db";

const COOKIE = "teapy_contract";

export type SignInput = {
  requestToken: string; templateId: string; printedName: string; consent: boolean; read: boolean;
  profile: { name: string; email: string; phone: string; address: string };
  signature: [number, number][][];
};

const sameName = (a: string, b: string) => a.trim().replace(/\s+/g, " ").toLowerCase() === b.trim().replace(/\s+/g, " ").toLowerCase();

async function rememberSubmission(id: string) {
  (await cookies()).set(COOKIE, await signToken({ sub: id }, "2d"), { httpOnly: true, sameSite: "lax", secure: secureCookie(), path: "/", maxAge: 172800 });
}

export async function mySubmissionId() {
  return (await readToken<{ sub: string }>((await cookies()).get(COOKIE)?.value))?.sub ?? null;
}

export async function signContract(input: SignInput) {
  return guarded(null, async () => {
    await rateLimit(`contract:${await clientIp()}`, 15, 60);
    const name = req(input.profile?.name, "Nama lengkap", 120);
    const email = req(input.profile?.email, "Email", 254).toLowerCase();
    const phone = req(input.profile?.phone, "Nomor telepon", 25);
    const address = req(input.profile?.address, "Alamat", 500);
    if (name.length < 3) throw new Error("Nama lengkap terlalu pendek.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Format email belum benar.");
    if (phone.replace(/\D/g, "").length < 8) throw new Error("Nomor telepon belum benar.");
    if (address.length < 8) throw new Error("Alamat terlalu pendek.");
    if (!input.read || !input.consent) throw new Error("Centang pernyataan persetujuan terlebih dahulu.");
    if (!sameName(str(input.printedName, 120), name)) throw new Error("Nama terang harus sama dengan nama lengkap.");
    const strokes = input.signature;
    const points = Array.isArray(strokes) ? strokes.reduce((s, x) => s + (Array.isArray(x) ? x.length : 0), 0) : 0;
    if (points < 10) throw new Error("Bubuhkan tanda tangan terlebih dahulu.");
    if (points > 5000 || strokes.length > 100) throw new Error("Tanda tangan terlalu panjang. Hapus lalu ulangi.");
    if (!strokes.every((s) => s.every((p) => p.length === 2 && p.every((n) => typeof n === "number" && n >= 0 && n <= 1)))) throw new Error("Data tanda tangan tidak valid.");

    const token = req(input.requestToken, "Token", 80);
    const existing = await one<{ id: string }>("select id from contract_submissions where request_token=$1", [token]);
    if (existing) { await rememberSubmission(existing.id); return { id: existing.id }; }

    const template = await one<{ id: string; title: string; body: string; status: string }>("select id, title, body, status from contract_templates where id=$1", [input.templateId]);
    if (!template || template.status !== "Diterbitkan") throw new Error("Naskah sudah berganti. Muat ulang halaman ini.");
    if (await one("select id from users where email=$1", [email])) throw new Error("Email ini sudah punya akun. Masuk ke portal karyawan.");

    const body = template.body.replaceAll("{{nama}}", name).replaceAll("{{email}}", email).replaceAll("{{telepon}}", phone).replaceAll("{{alamat}}", address);
    const hash = createHash("sha256").update(JSON.stringify({ body, name, email, phone, address, strokes })).digest("hex");
    const row = await one<{ id: string }>(
      `insert into contract_submissions (request_token, template_id, title, body, hash, name, email, phone, address, printed_name, signature, ip, user_agent)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12,$13) returning id`,
      [token, template.id, template.title, body, hash, name, email, phone, address, str(input.printedName, 120), JSON.stringify(strokes), await clientIp(), ((await headers()).get("user-agent") || "").slice(0, 300)]);
    await rememberSubmission(row!.id);
    await query("insert into activity (title, detail, actor) values ($1,$2,$3)", ["Kontrak ditandatangani", name, name]);
    return { id: row!.id };
  });
}

/** Akun portal hanya bisa dibuat dari sesi penandatanganan kontrak. */
export async function createAccount(input: { password: string; confirm: string }) {
  return guarded(null, async () => {
    const id = await mySubmissionId();
    if (!id) throw new Error("Sesi kontrak berakhir. Hubungi admin Teapy.");
    if (String(input.password).length < 8) throw new Error("Password minimal 8 karakter.");
    if (input.password !== input.confirm) throw new Error("Ulangi password belum sama.");
    const hash = await hashPassword(input.password);
    const userId = await tx(async (q) => {
      const [s] = await q<{ id: string; name: string; email: string; user_id: string | null }>("select id, name, email, user_id from contract_submissions where id=$1 for update", [id]);
      if (!s) throw new Error("Kontrak tidak ditemukan.");
      if (s.user_id) throw new Error("Akun untuk kontrak ini sudah dibuat. Silakan masuk.");
      const [u] = await q<{ id: string }>("insert into users (email, name, password_hash, role) values ($1,$2,$3,'employee') returning id", [s.email, s.name, hash]);
      await q("update contract_submissions set user_id=$2 where id=$1", [s.id, u.id]);
      return u.id;
    });
    await startSession(userId);
    (await cookies()).delete(COOKIE);
    return { next: "/karyawan" };
  });
}

export async function restartContract() {
  return guarded(null, async () => {
    (await cookies()).delete(COOKIE);
  });
}
