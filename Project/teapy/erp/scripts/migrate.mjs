// Menyiapkan tabel dan data master di Supabase: DATABASE_URL=... npm run db:migrate
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("Isi DATABASE_URL terlebih dahulu.");
const client = new pg.Client({ connectionString: url, ssl: /localhost|127\.0\.0\.1/.test(url) ? undefined : { rejectUnauthorized: false } });
await client.connect();
const dir = join(process.cwd(), "db");
await client.query(readFileSync(join(dir, "schema.sql"), "utf8"));
await client.query(readFileSync(join(dir, "seed.sql"), "utf8"));
const contract = JSON.parse(readFileSync(join(dir, "contract-v1.json"), "utf8"));
await client.query(
  "insert into contract_templates (code, version, title, body) values ('v1', 1, $1, $2) on conflict (code) do nothing",
  [contract.title, contract.body],
);
for (const name of readdirSync(join(dir, "patches")).sort()) {
  const done = await client.query("select 1 from applied_patches where name = $1", [name]);
  if (done.rows.length) continue;
  await client.query("begin");
  await client.query(readFileSync(join(dir, "patches", name), "utf8"));
  await client.query("insert into applied_patches (name) values ($1)", [name]);
  await client.query("commit");
  console.log("Patch diterapkan:", name);
}
await client.end();
console.log("Database siap.");
