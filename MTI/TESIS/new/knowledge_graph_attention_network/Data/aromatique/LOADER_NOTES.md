# Catatan Adaptasi Loader (GUIDE_01 §5) -> diteruskan ke GUIDE model

## Dual-role referensi
Setiap referensi muncul DUA kali dengan id berbeda:
- **user_id** (ruang user, 0..237-1) untuk `train.txt`/`test.txt`.
- **entity_id** (ruang entity, mulai 340) untuk `kg_final.txt`
  (edge `has_global_accord` / `belongs_to_global_family`).

Pemetaannya ada di `ref_user_entity_map.txt` (kolom: ref_name, user_id, entity_id).

## Konvensi id
- Produk = item: entity id 0..340-1 == item remap id (konvensi KGAT).
- n_entities = 971.
- Relasi: 0 inspired_by, 1 has_accord, 2 has_visual_note, 3 belongs_to_family,
  4 has_global_accord, 5 belongs_to_global_family, (6 sem_similar bila ON).

## inspired_by hadir DUA kali (sengaja, sesuai §7/§8)
- Sebagai **interaksi CF** di `train.txt`/`test.txt` (ref_user -> produk_item).
  `load_data.py` & `loader_kgat.py` menambahkannya sbg relasi 0 pada adjacency.
- Sebagai **edge KG** di `kg_final.txt` (produk_entity -> ref_entity, relasi 0),
  supaya ref_entity tersambung ke produk dalam propagasi graf.
Per fold, edge `inspired_by` test DIHAPUS dari KEDUA tempat (test.txt = hold-out;
kg_final = sudah dihapus saat build). `has_global_accord` ref TETAP ada (§8).

## Yang WAJIB diadaptasi di loader KGAT asli (utk GUIDE 02)
`Model/utility/load_data.py` hanya membaca train/test/kg_final dan TIDAK
mengantisipasi entity yang juga user. DUA adaptasi kritis:

1. **n_items HARUS dipaksa = jumlah produk (340), bukan
   `max(item_id)+1` dari interaksi.** `_statistic_ratings()` menurunkan
   `n_items` dari id terbesar yang muncul di interaksi. Padahal 97
   produk distractor (NO_REVOLUTIONIZE + unmatched) TIDAK pernah jadi positif,
   sehingga bisa terbuang dari kandidat ranking. §8 mewajibkan ranking SELURUH
   produk. Override: `n_items = len(item_list.txt)`.

2. **Mayoritas referensi test TIDAK ada di train** (ref ber-edge tunggal: edge-nya
   hanya ada di 1 fold). Saat fold itu jadi test, ref tsb absen dari
   `train_user_dict`. Loader/eval harus tahan `KeyError` (anggap training_items=[]).
   Ini BUKAN bug data — justru keterbatasan transduktif yang ingin ditunjukkan
   (baseline tak punya embedding utk ref test); CR-HKGE menjawabnya secara inductive.

Untuk:
- **Baseline KGAT/CF lain**: user(ref) & entity(ref) TIDAK berbagi embedding ->
  keterbatasan transduktif yang ingin ditunjukkan. Format file valid utk loader
  bawaan SETELAH dua adaptasi di atas.
- **CR-HKGE (GUIDE berikutnya)**: ikat representasi user(ref) ke atribut
  global-accord-nya (inductive) memakai `ref_user_entity_map.txt`.

## Evaluasi
- 5-fold di folder `fold_0..fold_{n-1}`, seed tercatat di `fold_assignment.json`.
- Saat evaluasi: ranking SELURUH produk untuk tiap referensi query.
- Multi-positive: train/test sudah dikelompokkan per user (boleh >1 produk benar);
  pakai metrik multi-relevan (Hits@k/Recall@k; MRR ambil rank positif terbaik).
