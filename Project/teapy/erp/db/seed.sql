-- Data master awal. Stok dimulai dari nol; tidak ada transaksi contoh.
insert into app_settings (key, data) values ('main', '{
  "store_name":"Teapy","outlet":"Outlet Pogung Dalangan",
  "address":"Pogung Dalangan RT 08 RW 50 No 187, Sinduadi, Mlati, Sleman",
  "footer":"Terima kasih. Back to essence.","wifi":"",
  "service_pct":0,"tax_pct":0,"tax_label":"PB1","rounding":100,
  "sugar_normal_ml":20,"sugar_less_ml":10,"topping_qty":30,"topping_price":5000,
  "courier_fee_pct":20,"member_discount_pct":0,"points_per":10000,"redeem_points":100,"redeem_value":10000,
  "void_pin_hash":"","margin_target":68,"batch_expiry_hours":18,
  "shift1_start":"10:00","shift1_end":"16:00","shift2_start":"16:00","shift2_end":"22:00"
}') on conflict (key) do nothing;

insert into materials (code, sku, name, category, unit, unit_cost, min_stock) values
 ('tea0','TEA-JAS-01','Jasmine Da Bai Hao','Daun teh','g',650,1000),
 ('tea1','TEA-JIN-02','Strawberry Jin Xuan','Daun teh','g',850,1000),
 ('tea2','TEA-OSM-03','Green Osmanthus','Daun teh','g',600,1000),
 ('tea3','TEA-GEN-04','Grassy Genmaicha','Daun teh','g',550,1000),
 ('tea4','TEA-DNG-05','Nutty Dong Ding','Daun teh','g',800,1000),
 ('milk','RAW-MLK-01','Susu full cream','Bahan baku','ml',22,8000),
 ('creamer','RAW-CRM-02','Creamer','Bahan baku','g',65,2000),
 ('water','RAW-WTR-03','Air mineral','Bahan baku','ml',0.7,15000),
 ('sugar','RAW-SGR-04','Sirup gula','Bahan saji','ml',18,2000),
 ('cup','PKG-CUP-01','Paper cup 16 oz + lid','Kemasan','pcs',1800,100),
 ('jelly','TOP-JEL-01','Honey Osmanthus Jelly','Topping','g',55,1000),
 ('curd','TOP-SOY-02','Soybean Curd','Topping','g',40,1000)
on conflict (code) do nothing;

insert into products (code, sku, name, type, origin, price, image) values
 ('p0','TEA-JDBH-010','Jasmine Da Bai Hao','Green tea','China',24000,'/menu/m1.jpg'),
 ('p1','TEA-SJX-010','Strawberry Jin Xuan','Oolong tea','Taiwan',28000,'/menu/m2.jpg'),
 ('p2','TEA-GOS-010','Green Osmanthus','Green tea','China',24000,'/menu/m3.jpg'),
 ('p3','TEA-GGM-010','Grassy Genmaicha','Green tea','Jepang',26000,'/menu/m4.jpg'),
 ('p4','TEA-NDD-010','Nutty Dong Ding','Oolong tea','Taiwan',28000,'/menu/m5.jpg')
on conflict (code) do nothing;

insert into recipe_items (product_id, material_id, qty)
select p.id, m.id, r.qty from (values
 ('p0','tea0',350),('p0','milk',2500),('p0','creamer',750),('p0','water',8000),
 ('p1','tea1',350),('p1','milk',2500),('p1','creamer',750),('p1','water',8000),
 ('p2','tea2',350),('p2','milk',2500),('p2','creamer',750),('p2','water',8000),
 ('p3','tea3',350),('p3','milk',2500),('p3','creamer',750),('p3','water',8000),
 ('p4','tea4',350),('p4','milk',2500),('p4','creamer',750),('p4','water',8000)
) as r(pc, mc, qty) join products p on p.code = r.pc join materials m on m.code = r.mc
on conflict do nothing;

-- Checklist harian diturunkan dari tugas Crew pada Pasal 04 kontrak; admin bisa mengubahnya.
insert into task_templates (code, title, description, shift_code, sort) values
 ('open-1','Siapkan outlet dan peralatan','Nyalakan peralatan, cek kebersihan area bar dan meja.','shift1',1),
 ('open-2','Periksa persediaan bahan','Cek bahan, cup, dan topping. Laporkan yang menipis.','shift1',2),
 ('open-3','Pastikan batch berlabel tanggal','Setiap batch di dispenser punya label tanggal produksi.','shift1',3),
 ('open-4','Buka shift kasir','Hitung kas awal dan buka shift di POS.','shift1',4),
 ('hand-1','Serah terima shift','Tutup shift kasir, sampaikan catatan ke crew berikutnya.','shift1',5),
 ('close-1','Terima serah terima shift','Buka shift kasir dan cek stok batch siap saji.','shift2',1),
 ('close-2','Catat bahan terbuang','Catat sisa batch yang lewat batas di Brewing & QC.','shift2',2),
 ('close-3','Bersihkan peralatan dan area','Cuci dispenser, peralatan seduh, dan lap area bar.','shift2',3),
 ('close-4','Tutup shift dan hitung kas','Hitung kas akhir dan tutup shift di POS.','shift2',4),
 ('close-5','Tutup outlet','Matikan peralatan, simpan bahan, dan kunci outlet.','shift2',5)
on conflict (code) do nothing;
