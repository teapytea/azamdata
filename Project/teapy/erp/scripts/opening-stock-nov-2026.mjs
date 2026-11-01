// Stok awal dari owner, November 2026. Sekali jalan; jalan kedua ditolak.
//   Pure Leaf dan Artisan: 15 g per menu. Milk Tea: 35 porsi per menu. Sirup gula: cukup 200 porsi (6.000 ml).
import pg from "pg";

const REF = "STOK-AWAL-NOV26";
const url = process.env.DATABASE_URL;
if (!url) throw new Error("Isi DATABASE_URL terlebih dahulu.");
const client = new pg.Client({ connectionString: url, ssl: /localhost|127\.0\.0\.1/.test(url) ? undefined : { rejectUnauthorized: false } });
await client.connect();
const q = async (sql, params) => (await client.query(sql, params)).rows;

await q("begin");
try {
  if ((await q("select 1 from stock_moves where ref = $1 limit 1", [REF])).length) throw new Error("Stok awal sudah pernah diterapkan.");
  const add = async (where, amount, note) => {
    const rows = await q(`update materials set stock = stock + $1 where ${where} returning id, name`, [amount]);
    for (const m of rows) await q("insert into stock_moves (material_id, delta, kind, ref, note, actor) values ($1,$2,'Stok awal',$3,$4,'Owner')", [m.id, amount, REF, note]);
    return rows.length;
  };
  console.log("daun teh", await add("code like 'pl-%' or code like 'ab-%'", 15, "15 g per menu"));
  console.log("sirup gula", await add("code = 'sugar'", 6000, "Cukup 200 porsi x 30 ml"));

  const [{ hours }] = await q("select (data->>'batch_expiry_hours')::int as hours from app_settings where key = 'main'");
  const [{ today }] = await q("select (now() at time zone 'Asia/Jakarta')::date::text as today");
  const code = today.replaceAll("-", "").slice(2);
  const menu = await q(`select p.id, p.name, p.yield_ml::float8, p.serving_ml::float8, sum(r.qty * m.unit_cost)::float8 as cost
    from products p join recipe_items r on r.product_id = p.id join materials m on m.id = r.material_id where p.type = 'Milk Tea' and p.mode = 'batch' group by p.id order by p.name`);
  let n = 0;
  for (const p of menu) {
    n += 1;
    const ml = 35 * p.serving_ml;
    await q(`insert into batches (code, product_id, made_on, expires_at, initial_ml, remaining_ml, cost_per_ml, operator, labeled_at, labeled_by)
      values ($1,$2,$3, now() + make_interval(hours => $4::int), $5, $5, $6, 'Stok awal', now(), 'Stok awal')`,
      [`BT-${code}-A${String(n).padStart(2, "0")}`, p.id, today, hours, ml, p.cost / p.yield_ml]);
    console.log("batch", p.name, ml, "ml");
  }
  await q("insert into activity (title, detail, actor) values ('Stok awal menu diterapkan', '17 menu: Milk Tea 35 porsi, Pure Leaf dan Artisan 15 g, sirup gula 6.000 ml', 'Owner')");
  await q("commit");
  console.log("Selesai.");
} catch (e) {
  await q("rollback");
  throw e;
} finally {
  await client.end();
}
