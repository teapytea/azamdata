-- Menu resmi Teapy: Milk Tea, Pure Leaf, dan Artisan Blends (sumber: tiga PDF menu, November 2026).
update products set type = 'Milk Tea', price = 20000 where code in ('p0','p1','p2','p3','p4');

-- Gula hanya untuk Milk Tea: 30 ml per cup, opsi Less setengahnya.
update app_settings set data = data || '{"sugar_normal_ml":30,"sugar_less_ml":15}'::jsonb where key = 'main';

-- Jumlah cup belum dihitung, jadi penjualan belum memotong stoknya sampai ada audit atau PO.
update materials set track_stock = false, note = 'Belum dihitung: penjualan belum memotong stok' where code = 'cup' and stock = 0;

insert into materials (code, sku, name, category, unit, unit_cost, min_stock, note) values
 ('pl-rougui','PL-RGU-01','Rou Gui','Daun teh','g',0,4,'Pure Leaf'),
 ('pl-dancong','PL-DCG-02','Dan Cong','Daun teh','g',0,4,'Pure Leaf'),
 ('pl-sencha','PL-SEN-03','Japanese Sencha','Daun teh','g',0,4,'Pure Leaf'),
 ('pl-longjing','PL-LJG-04','Long Jing','Daun teh','g',0,4,'Pure Leaf'),
 ('pl-dfmr','PL-DFM-05','Dong Fang Mei Ren','Daun teh','g',0,4,'Pure Leaf'),
 ('pl-tigermonkey','PL-VTM-06','Vietnam Lung Phin Tiger Monkey Green Tea','Daun teh','g',0,4,'Pure Leaf'),
 ('pl-darkoolong','PL-DRO-07','Dark Roasted Chinese Oolong Tea','Daun teh','g',0,4,'Pure Leaf'),
 ('pl-sinensis','PL-ISJ-08','Imperial Sinensis Java Green Tea','Daun teh','g',0,4,'Pure Leaf'),
 ('ab-passion','AB-PFG-01','Passion Fruit Guan Yin','Daun teh','g',0,4,'Artisan Blends'),
 ('ab-lychee','AB-LGF-02','Lychee Green Tea Fannings','Daun teh','g',0,4,'Artisan Blends'),
 ('ab-earlgrey','AB-EGF-03','Earl Grey Green Tea Fannings','Daun teh','g',0,4,'Artisan Blends'),
 ('ab-peach','AB-PDO-04','Peach Deep Roasted Oolong Fannings','Daun teh','g',0,4,'Artisan Blends')
on conflict (code) do nothing;

insert into products (code, sku, name, type, price, price_takeaway, mode, yield_ml, serving_ml) values
 ('pl-rougui','PL-RGU-01','Rou Gui','Pure Leaf',25000,20000,'direct',1,1),
 ('pl-dancong','PL-DCG-02','Dan Cong','Pure Leaf',25000,20000,'direct',1,1),
 ('pl-sencha','PL-SEN-03','Japanese Sencha','Pure Leaf',22000,17000,'direct',1,1),
 ('pl-longjing','PL-LJG-04','Long Jing','Pure Leaf',25000,20000,'direct',1,1),
 ('pl-dfmr','PL-DFM-05','Dong Fang Mei Ren','Pure Leaf',25000,20000,'direct',1,1),
 ('pl-tigermonkey','PL-VTM-06','Vietnam Lung Phin Tiger Monkey Green Tea','Pure Leaf',22000,17000,'direct',1,1),
 ('pl-darkoolong','PL-DRO-07','Dark Roasted Chinese Oolong Tea','Pure Leaf',22000,17000,'direct',1,1),
 ('pl-sinensis','PL-ISJ-08','Imperial Sinensis Java Green Tea','Pure Leaf',22000,17000,'direct',1,1),
 ('ab-passion','AB-PFG-01','Passion Fruit Guan Yin','Artisan Blends',22000,17000,'direct',1,1),
 ('ab-lychee','AB-LGF-02','Lychee Green Tea Fannings','Artisan Blends',22000,17000,'direct',1,1),
 ('ab-earlgrey','AB-EGF-03','Earl Grey Green Tea Fannings','Artisan Blends',22000,17000,'direct',1,1),
 ('ab-peach','AB-PDO-04','Peach Deep Roasted Oolong Fannings','Artisan Blends',22000,17000,'direct',1,1)
on conflict (code) do nothing;

-- Pure Leaf dan Artisan memotong 2 g daun per porsi saat terjual, tanpa batch.
insert into recipe_items (product_id, material_id, qty)
select p.id, m.id, 2 from products p join materials m on m.code = p.code where p.mode = 'direct'
on conflict do nothing;
