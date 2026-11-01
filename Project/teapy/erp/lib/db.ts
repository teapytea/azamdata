import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type Q = <T = Record<string, any>>(sql: string, params?: unknown[]) => Promise<T[]>;
type Driver = { query: Q; tx: <T>(fn: (q: Q) => Promise<T>) => Promise<T> };

const toNumber = (v: string) => Number(v);
const asText = (v: string) => v;
// Tanggal dan angka dikembalikan sebagai nilai polos agar aman dikirim ke komponen klien.
const asIso = (v: string) => new Date(v).toISOString();

async function pgDriver(url: string): Promise<Driver> {
  const { Pool, types } = await import("pg");
  types.setTypeParser(20, toNumber);
  types.setTypeParser(1700, toNumber);
  types.setTypeParser(1082, asText);
  types.setTypeParser(1184, asIso);
  const pool = new Pool({
    connectionString: url,
    max: 3,
    ssl: /localhost|127\.0\.0\.1/.test(url) ? undefined : { rejectUnauthorized: false },
  });
  const query: Q = async (sql, params) => (await pool.query(sql, params as unknown[])).rows;
  return {
    query,
    async tx(fn) {
      const client = await pool.connect();
      try {
        await client.query("begin");
        const result = await fn(async (sql, params) => (await client.query(sql, params as unknown[])).rows);
        await client.query("commit");
        return result;
      } catch (e) {
        await client.query("rollback");
        throw e;
      } finally {
        client.release();
      }
    },
  };
}

async function liteDriver(): Promise<Driver> {
  const { PGlite } = await import("@electric-sql/pglite");
  const { mkdirSync } = await import("node:fs");
  const dir = join(process.cwd(), "db");
  mkdirSync(join(process.cwd(), ".data"), { recursive: true });
  const db: any = await PGlite.create(join(process.cwd(), ".data", "pg"), {
    parsers: { 20: toNumber, 1700: toNumber, 1082: asText, 1184: asIso },
  } as never);
  await db.exec(readFileSync(join(dir, "schema.sql"), "utf8"));
  await db.exec(readFileSync(join(dir, "seed.sql"), "utf8"));
  const contract = JSON.parse(readFileSync(join(dir, "contract-v1.json"), "utf8"));
  await db.query(
    "insert into contract_templates (code, version, title, body) values ('v1', 1, $1, $2) on conflict (code) do nothing",
    [contract.title, contract.body],
  );
  for (const name of readdirSync(join(dir, "patches")).sort()) {
    if ((await db.query("select 1 from applied_patches where name = $1", [name])).rows.length) continue;
    await db.exec(readFileSync(join(dir, "patches", name), "utf8"));
    await db.query("insert into applied_patches (name) values ($1)", [name]);
  }
  const query: Q = async (sql, params) => (await db.query(sql, params as unknown[])).rows as never;
  return {
    query,
    tx: (fn) =>
      db.transaction(async (t: any) => fn(async (sql, params) => (await t.query(sql, params as unknown[])).rows as never)) as never,
  };
}

const store = globalThis as unknown as { __teapyDb?: Promise<Driver> };

function driver(): Promise<Driver> {
  if (!store.__teapyDb) {
    const url = process.env.DATABASE_URL;
    if (!url && process.env.VERCEL) throw new Error("DATABASE_URL belum diatur di Vercel.");
    store.__teapyDb = url ? pgDriver(url) : liteDriver();
  }
  return store.__teapyDb;
}

export const query: Q = async (sql, params) => (await driver()).query(sql, params);
export async function one<T = Record<string, any>>(sql: string, params?: unknown[]): Promise<T | undefined> {
  return (await query<T>(sql, params))[0];
}
export async function tx<T>(fn: (q: Q) => Promise<T>): Promise<T> {
  return (await driver()).tx(fn);
}
