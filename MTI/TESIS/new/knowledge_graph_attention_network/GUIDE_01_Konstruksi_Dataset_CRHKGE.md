# GUIDE 01 — Konstruksi Dataset Aromatique → Format KGAT/CR-HKGE

> **Untuk:** Claude Code (implementasi).
> **Dari:** keputusan riset yang sudah disepakati (Fase 0–1).
> **Sifat:** spesifikasi keputusan, BUKAN kode. Claude Code yang menulis kode sesuai spec ini.
> **Aturan keras:**
> 1. JANGAN bangun ulang `positive_pair_scores` lama (formula skor global_accord/cross_ref/same_global_reference). Itu sumber evaluasi sirkular. **Label hanya `inspired_by`.**
> 2. JANGAN laporkan angka hasil eksperimen di tahap ini. Tahap ini hanya membangun data.
> 3. Setiap toggle ablation harus bisa dihidup-matikan lewat argumen, bukan hardcode.

---

## 0. Tujuan & Framing

Bangun dataset agar bisa dipakai SEMUA model di repo KGAT (`KGAT, CKE, CFKG, BPRMF, NFM`) sebagai baseline/ablation, plus model baru `CR-HKGE`.

**Framing task:** retrieval cross-reference.
- "User"/sisi-query = **parfum referensi global** (241).
- "Item"/target = **produk Aromatique** (340).
- "Interaction"/label = relasi **`inspired_by`** (produk nge-dupe referensi).
- Evaluasi = hold-out edge `inspired_by` (non-sirkular: label = fakta katalog, bukan skor turunan).

Konsekuensi penting: karena repo KGAT adalah model CF (user–item), train/test WAJIB format interaksi `ref → product`. Ini sudah jadi keputusan (D7 pakai semua model repo).

---

## 1. Input

| File | Sheet | Isi penting |
|---|---|---|
| `datasetaromatique.xlsx` | Sheet1 | 340 produk: `product_name`, `visual_note`, `visual_note_alt`, `revolutionize`, `main_accords`, `olfactory_family`, `data_quality`. (`meaning` DIBUANG, tidak dipakai.) |
| `global_reference.xlsx` | `Sheet1` | 241 referensi. Header pada **baris ke-2** (row index 1). Kolom: `Revolutionize`, `interpreted_as`, `main_accord`, `global_family`, `source_url`, `accord_1..accord_10`. Data mulai sekitar row index 5. |
| `global_reference.xlsx` | `Ambiguous`, `Ambiguous_New` | Override entity-resolution: `original_name → interpreted_as` + catatan. Pakai untuk koreksi nama yang ambigu. |

**Join key produk↔referensi:** `datasetaromatique.revolutionize` (raw string) dicocokkan ke `global_reference.Revolutionize` (raw string) → ambil `interpreted_as` sebagai nama referensi BAKU. Terapkan override dari sheet `Ambiguous*` bila ada.

**Wajib dilaporkan (bukan hasil eksperimen, ini sanity konstruksi):** berapa produk enriched yang `revolutionize`-nya TIDAK ketemu di global_reference (unmatched). Unmatched = referensi tanpa global accord → tangani eksplisit (lihat §6).

---

## 2. Normalisasi accord (KEPUTUSAN D1 — paling kritis)

**Accord global dan accord lokal HARUS jadi satu vocabulary / satu ruang node.** Global "amber" dan local "amber" = node yang SAMA.

Aturan normalisasi (terapkan ke local DAN global):
1. Lowercase, `strip()` spasi depan-belakang.
2. Local `main_accords`: split koma. Global `main_accord`: split titik-koma `;`. Gunakan juga `accord_1..accord_10` bila terisi (samakan dengan hasil split `main_accord`; ambil union, buang duplikat).
3. Hapus token kosong.
4. Bangun SATU peta `accord_name → accord_id` global (dipakai bersama local & global).
5. **(Opsional, default OFF)** pemetaan sinonim manual (mis. "vanilla" vs "vanila"). Default: cocok string ternormalisasi apa adanya. Bila diaktifkan, sediakan file `accord_synonyms.tsv` terpisah dan catat di log.

**Hasil:** satu node `amber` dipakai produk (via `has_accord`) maupun referensi (via `has_global_accord`). Inilah jembatan yang bikin propagasi graf tidak buntu.

**Toggle ablation `merge_accord`:** sediakan mode `OFF` (global & local accord jadi node TERPISAH, seperti dataset lama) HANYA untuk membuktikan bahwa merge memang diperlukan. Default = `ON`.

---

## 3. Family (KEPUTUSAN D2 — JANGAN merge)

- `olfactory_family` (lokal, 17 unik, UPPERCASE) → ruang node sendiri.
- `global_family` (Fragrantica, mis. "Oriental Woody") → ruang node sendiri.
- **Tidak** dipetakan satu sama lain (taksonomi beda). Dua relasi terpisah.

---

## 4. Entity & Relasi

### Entity (semua diberi id unik, ruang `entity`)
| Tipe | Sumber | Catatan |
|---|---|---|
| Produk (340) | `product_name` | primary key sistem |
| Referensi (241) | `interpreted_as` | nama baku, BUKAN `revolutionize` mentah |
| Accord (gabungan) | union local+global ternormalisasi (§2) | node dipakai bersama |
| Family lokal (17) | `olfactory_family` | |
| Family global | `global_family` | |
| Visual note | split `visual_note` + `visual_note_alt` pada `/` | normalisasi lowercase/strip |

### Relasi
| id | relasi | head → tail | sumber |
|---|---|---|---|
| 0 | `inspired_by` | produk → referensi | `revolutionize`→`interpreted_as` **(LABEL — lihat §5)** |
| 1 | `has_accord` | produk → accord (lokal) | `main_accords` |
| 2 | `has_visual_note` | produk → visual_note | `visual_note(_alt)` |
| 3 | `belongs_to_family` | produk → family lokal | `olfactory_family` |
| 4 | `has_global_accord` | referensi → accord | `global_reference.main_accord` (node accord SAMA dgn relasi 1) |
| 5 | `belongs_to_global_family` | referensi → family global | `global_family` |
| (opsional) | `sem_similar` | produk → produk | **toggle ablation, default OFF** (lihat §7) |

**KG dasar = fakta mentah saja** (relasi 0–5). Edge buatan (`sem_similar`) bukan bawaan.

---

## 5. Dual-role referensi (FLAG 2 — titik adaptasi loader paling penting)

Referensi harus muncul di DUA tempat:

1. **Sebagai "user" (sisi-query)** untuk interaksi `train/test` (ref → produk). Ini yang dipakai semua model CF repo untuk ranking.
2. **Sebagai entity di `kg_final`** dengan edge `has_global_accord` / `belongs_to_global_family`, supaya accord global referensi ikut menyebar di graf dan produk yang berbagi accord bisa terjangkau.

**Implikasi untuk Claude Code:**
- Sediakan file pemetaan eksplisit: `ref → user_id` (ruang user) DAN `ref → entity_id` (ruang entity). Satu referensi = satu user_id + satu entity_id.
- Loader KGAT asli tidak mengantisipasi entity yang juga user. **Adaptasi loader diperlukan** agar:
  - user-id referensi terbaca di `train.txt/test.txt`,
  - entity-id referensi terbaca di `kg_final.txt` beserta edge global-accord-nya.
- Untuk **baseline KGAT/CF lain**: kedua representasi tidak perlu berbagi embedding (biarkan apa adanya — ini justru yang memunculkan keterbatasan transduktif yang ingin kita tunjukkan).
- Untuk **CR-HKGE**: di sinilah modifikasi inductive akan mengikat representasi user(ref) ke atribut global-accord-nya (dibahas di GUIDE berikutnya, bukan di sini).

---

## 6. Produk tanpa referensi (KEPUTUSAN D4)

- 97 produk `NO_REVOLUTIONIZE`: TIDAK punya `inspired_by`, tidak jadi target berlabel.
- **Tetap dimasukkan** sebagai entity/kandidat produk (distractor saat ranking) dan tetap menyumbang edge accord/family/visual.
- Produk dengan `data_quality = MISSING_ACCORDS` (bila ada): tetap masuk sebagai kandidat; bila accord kosong, produk itu hanya tersambung lewat family/visual. Catat jumlahnya.
- Referensi unmatched (§1): produk-nya tetap masuk sebagai kandidat, tapi edge `inspired_by`-nya hanya dibuat bila referensi punya entity valid. Bila referensi tak ketemu di global_reference → JANGAN buat edge global-accord palsu; tandai dan kecualikan dari himpunan berlabel. Laporkan jumlah.

---

## 7. Output file (format KGAT)

Hasilkan, mengikuti konvensi loader KGAT repo:

| File | Isi |
|---|---|
| `user_list.txt` | referensi: `org_name remap_id` |
| `item_list.txt` | produk: `org_name remap_id` |
| `entity_list.txt` | semua entity (produk + referensi + accord + family lokal/global + visual note): `org_name remap_id` |
| `relation_list.txt` | 6 relasi (atau 7 bila `sem_similar` ON) |
| `kg_final.txt` | triple `head relation tail` (id entity) — relasi 0–5 (+sem_similar bila ON) |
| `train.txt` | per baris: `ref_id prod_id [prod_id ...]` (interaksi inspired_by, sisi train) |
| `test.txt` | per baris: `ref_id prod_id [prod_id ...]` (sisi test fold) |

Catatan: mayoritas referensi memetakan ke 1 produk; 2 referensi memetakan ke 2 produk (multi-positive — §8).

---

## 8. Split evaluasi (KEPUTUSAN D5)

- **5-fold** atas 243 edge `inspired_by`.
- Per fold test: edge `(produk, inspired_by, referensi)` yang diuji **DIHAPUS dari `kg_final` train** (cegah kebocoran), TAPI edge `has_global_accord` referensi **tetap ada** (referensi tetap punya profil aroma → bisa di-query).
- Saat evaluasi: untuk tiap referensi query, ranking SELURUH 340 produk; target = produk dupe-nya.
- **Multi-positive:** untuk 2 referensi yang dipetakan 2 produk, semua produk benar dihitung sebagai positif (gunakan metrik yang mendukung multi-relevan, mis. Hits@k/Recall@k; untuk MRR ambil rank positif terbaik).
- Simpan seed split agar reproducible. Catat mapping fold.

---

## 9. Varian dataset untuk ablation (toggle)

Bangun sebagai opsi argumen, bukan file terpisah yang dihardcode:
1. `--merge_accord {on|off}` — default `on`. `off` = buktikan merge perlu (§2).
2. `--include_ref {on|off}` — default `on`. `off` = **Sistem A (lokal-saja)**: buang entity referensi + relasi 4,5 + interaksi `inspired_by` tetap ada tapi referensi tak punya atribut → tunjukkan sistem buta-query.
   - Catatan: bila `include_ref=off`, referensi tetap jadi user-id kosong (tanpa atribut) supaya format interaksi tetap valid; ini sengaja untuk menunjukkan keterbatasan.
3. `--sem_similar {on|off}` — default `off`. `on` = tambah edge produk–produk buatan (rekonstruksi definisi lama: same local family + ≥2 shared local accord) sebagai relasi tambahan, untuk ablation.

---

## 10. Validasi yang WAJIB dijalankan setelah build (sanity, bukan hasil eksperimen)

Claude Code harus mencetak laporan validasi:
1. Jumlah entity per tipe; jumlah triple per relasi.
2. **Cek merge:** node accord yang sama dipakai oleh relasi 1 (lokal) dan relasi 4 (global) — buktikan id-nya identik untuk nama sama.
3. **Cek anti-bocor:** untuk tiap fold, pastikan TIDAK ada edge `inspired_by` test yang masih tertinggal di `kg_final` train.
4. **Cek konektivitas:** untuk sampel referensi test, pastikan ada jalur graf referensi → accord → produk (lewat node accord ter-merge). Bila banyak referensi terisolasi → ada yang salah di §2/§5.
5. Jumlah unmatched referensi, MISSING_ACCORDS, NO_REVOLUTIONIZE.
6. Konsistensi id antar `*_list.txt` dan `kg_final.txt` (tidak ada id di luar rentang).

---

## 11. Yang JANGAN dilakukan

- Jangan bangun `positive_pair_scores` / label berbobot apa pun. Label = `inspired_by` saja.
- Jangan merge family lokal↔global.
- Jangan bakar `sem_similar` ke KG dasar.
- Jangan buat edge global-accord untuk referensi yang tak terverifikasi.
- Jangan pakai `meaning`.
- Jangan optimizer beda antar model nanti (samakan Adam) — catat untuk tahap training (bukan tahap ini), karena audit lama menemukan CFKG pakai SGD = artefak.

---

## 12. Output yang diharapkan dari tahap ini

1. Script konstruksi (mis. `build_dataset.py`) dengan toggle §9.
2. Folder dataset siap-KGAT (file §7) untuk default (`merge_accord=on, include_ref=on, sem_similar=off`).
3. Laporan validasi §10.
4. Catatan adaptasi loader yang diperlukan (§5) untuk diteruskan ke GUIDE model.

Setelah ini selesai & validasi lolos → lanjut GUIDE 02 (adaptasi loader + baseline KGAT) sebelum menyentuh arsitektur CR-HKGE.
