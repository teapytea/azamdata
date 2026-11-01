"use server";

import { redirect } from "next/navigation";
import { guarded, req, str } from "@/lib/action";
import { checkPassword, clientIp, endSession, hashPassword, homeFor, log, rateLimit, startSession, type Role } from "@/lib/auth";
import { one, query } from "@/lib/db";

type Mode = "erp" | "pos" | "employee";

function allowed(mode: Mode, user: { role: Role; pos_access: boolean }) {
  if (mode === "pos") return ["owner", "admin", "cashier"].includes(user.role) || user.pos_access;
  if (mode === "employee") return user.role === "employee";
  return ["owner", "admin", "marketing"].includes(user.role);
}

export async function loginAction(input: { email: string; password: string; mode: Mode }) {
  return guarded(null, async () => {
    const email = req(input.email, "Email", 254).toLowerCase();
    const ip = await clientIp();
    await rateLimit(`login:${ip}:${email}`, 8, 15);
    const user = await one<{ id: string; password_hash: string; role: Role; pos_access: boolean; active: boolean; must_change_password: boolean }>(
      "select id, password_hash, role, pos_access, active, must_change_password from users where email = $1", [email]);
    if (!user?.password_hash || !user.active || !(await checkPassword(String(input.password), user.password_hash))) {
      throw new Error("Email atau password salah.");
    }
    if (!allowed(input.mode, user)) {
      const place = input.mode === "pos" ? "aplikasi kasir" : input.mode === "employee" ? "portal karyawan" : "ERP";
      throw new Error(`Akun ini tidak punya akses ke ${place}.`);
    }
    await startSession(user.id);
    if (user.must_change_password) return { next: "/change-password" };
    return { next: input.mode === "pos" ? "/pos" : input.mode === "employee" ? "/karyawan" : homeFor(user.role) };
  });
}

export async function logoutAction() {
  await endSession();
  redirect("/login");
}

export async function logoutTo(path: string) {
  await endSession();
  redirect(path === "/pos/login" || path === "/karyawan/login" ? path : "/login");
}

function checkSetupToken(token: unknown) {
  const expected = process.env.SETUP_TOKEN || (process.env.NODE_ENV === "production" ? "" : "teapy-local");
  if (!expected) throw new Error("SETUP_TOKEN belum diatur pada server.");
  if (String(token) !== expected) throw new Error("Kode setup salah.");
}

function checkNewPassword(password: unknown, confirm: unknown) {
  const p = String(password ?? "");
  if (p.length < 8) throw new Error("Password minimal 8 karakter.");
  if (p !== String(confirm ?? "")) throw new Error("Ulangi password belum sama.");
  return p;
}

export async function setupAction(input: Record<string, string>) {
  return guarded(null, async () => {
    await rateLimit(`setup:${await clientIp()}`, 10, 15);
    checkSetupToken(input.token);
    const existing = await one("select id from users where role = 'owner' limit 1");
    if (existing) throw new Error("Akun owner sudah ada. Gunakan halaman login.");
    const password = checkNewPassword(input.password, input.confirm);
    const user = await one<{ id: string }>(
      "insert into users (email, name, password_hash, role) values ($1, $2, $3, 'owner') returning id",
      [req(input.email, "Email", 254).toLowerCase(), req(input.name, "Nama", 120), await hashPassword(password)]);
    await startSession(user!.id);
    await log("Workspace Teapy dibuat", "Akun owner pertama aktif.", input.name);
    return { next: "/dashboard" };
  });
}

export async function recoverAction(input: Record<string, string>) {
  return guarded(null, async () => {
    await rateLimit(`recover:${await clientIp()}`, 5, 30);
    checkSetupToken(input.token);
    const password = checkNewPassword(input.password, input.confirm);
    const rows = await query("update users set password_hash = $1, must_change_password = false where email = $2 and role = 'owner' returning id",
      [await hashPassword(password), str(input.email, 254).toLowerCase()]);
    if (!rows.length) throw new Error("Akun owner dengan email itu tidak ditemukan.");
    await log("Password owner dipulihkan", "Lewat halaman pemulihan.", "");
    return { next: "/login" };
  });
}

export async function changePasswordAction(input: Record<string, string>) {
  return guarded(["owner", "admin", "marketing", "cashier", "employee"], async (user) => {
    const row = await one<{ password_hash: string }>("select password_hash from users where id = $1", [user.id]);
    if (!(await checkPassword(String(input.current), row!.password_hash))) throw new Error("Password saat ini salah.");
    const password = checkNewPassword(input.password, input.confirm);
    await query("update users set password_hash = $1, must_change_password = false where id = $2", [await hashPassword(password), user.id]);
    return { next: homeFor(user.role) };
  });
}
