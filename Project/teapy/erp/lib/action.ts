import { currentUser, type Role, type User } from "./auth";

export type Result<T = unknown> = { ok: true; data: T } | { ok: false; error: string };

/** Pembungkus server action: memeriksa peran dan mengubah error menjadi pesan untuk UI. */
export async function guarded<T>(roles: Role[] | null, fn: (user: User) => Promise<T>): Promise<Result<T>> {
  try {
    const user = await currentUser();
    if (roles && (!user || !roles.includes(user.role))) throw new Error("Anda tidak punya akses untuk tindakan ini.");
    return { ok: true, data: await fn(user as User) };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Terjadi kesalahan.";
    if ((e as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) throw e;
    if (/duplicate key/.test(message)) return { ok: false, error: "Data yang sama sudah ada." };
    console.error(e);
    return { ok: false, error: message };
  }
}

export const str = (v: unknown, max = 500) => String(v ?? "").trim().slice(0, max);
export function req(v: unknown, label: string, max = 500) {
  const s = str(v, max);
  if (!s) throw new Error(`${label} wajib diisi.`);
  return s;
}
export function num(v: unknown, label: string, min = 0) {
  const raw = String(v ?? "").replace(",", ".").trim();
  const n = Number(raw);
  if (raw === "" || !Number.isFinite(n) || n < min) throw new Error(`${label} harus berupa angka minimal ${min}.`);
  return n;
}
export const dateOrNull = (v: unknown) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v)) ? String(v) : null);
