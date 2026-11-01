import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { one, query } from "./db";

export type Role = "owner" | "admin" | "marketing" | "cashier" | "employee";
export type User = {
  id: string; email: string; name: string; role: Role; pos_access: boolean;
  employee_id: string | null; must_change_password: boolean;
};

export const FULL: Role[] = ["owner", "admin"];
const COOKIE = "teapy_session";
const WEEK = 60 * 60 * 24 * 7;

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s && process.env.VERCEL) throw new Error("AUTH_SECRET belum diatur di Vercel.");
  return new TextEncoder().encode(s || "teapy-local-development-secret-only");
}

export const signToken = (payload: Record<string, unknown>, ttl: string) =>
  new SignJWT(payload as never).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(ttl).sign(secret());

export async function readToken<T>(token?: string): Promise<T | null> {
  if (!token) return null;
  try {
    return (await jwtVerify(token, secret())).payload as T;
  } catch {
    return null;
  }
}

export const secureCookie = () => process.env.NODE_ENV === "production";

export async function startSession(userId: string) {
  (await cookies()).set(COOKIE, await signToken({ sub: userId }, "7d"), {
    httpOnly: true, sameSite: "lax", secure: secureCookie(), path: "/", maxAge: WEEK,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const payload = await readToken<{ sub: string }>((await cookies()).get(COOKIE)?.value);
  if (!payload?.sub) return null;
  const user = await one<User & { active: boolean }>(
    "select id, email, name, role, pos_access, employee_id, must_change_password, active from users where id = $1",
    [payload.sub],
  );
  return user?.active ? user : null;
}

export const homeFor = (role: Role) =>
  role === "marketing" ? "/marketing" : role === "cashier" ? "/pos" : role === "employee" ? "/karyawan" : "/dashboard";

export async function requirePage(roles: Role[], login = "/login"): Promise<User> {
  const user = await currentUser();
  if (!user) redirect(login);
  if (!roles.includes(user.role)) redirect(homeFor(user.role));
  return user;
}

export const hashPassword = (p: string) => bcrypt.hash(p, 10);
export const checkPassword = (p: string, hash: string) => bcrypt.compare(p, hash);

export async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
}

/** Membatasi percobaan per kunci; melempar pesan ramah bila melewati batas. */
export async function rateLimit(key: string, limit: number, minutes: number) {
  const row = await one<{ count: number }>(
    `insert into rate_limits (key, count, reset_at) values ($1, 1, now() + make_interval(mins => $2::int))
     on conflict (key) do update set
       count = case when rate_limits.reset_at < now() then 1 else rate_limits.count + 1 end,
       reset_at = case when rate_limits.reset_at < now() then excluded.reset_at else rate_limits.reset_at end
     returning count`,
    [key, minutes],
  );
  if (row && row.count > limit) throw new Error(`Terlalu banyak percobaan. Coba lagi dalam ${minutes} menit.`);
}

export async function log(title: string, detail: string, actor = "") {
  await query("insert into activity (title, detail, actor) values ($1, $2, $3)", [title, detail, actor]);
}
