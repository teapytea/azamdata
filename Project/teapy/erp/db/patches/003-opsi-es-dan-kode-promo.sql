-- Kode promo pengganti input diskon manual di kasir.
insert into promo_codes (code, percent) values ('PROMO10%', 10) on conflict (code) do nothing;

-- Pure Leaf dan Artisan tidak punya pilihan gula dan es.
update sale_lines l set sugar = '-', ice = '-' from products p where p.id = l.product_id and p.mode = 'direct';
