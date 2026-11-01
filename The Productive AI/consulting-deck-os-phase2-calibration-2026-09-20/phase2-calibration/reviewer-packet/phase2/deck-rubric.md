# Deck rubric v0.1

Status: draft untuk kalibrasi. Semua bobot mengikuti blueprint; tidak ada perubahan ambang lulus.

| Dimensi | Kriteria | Bobot |
|---|---|---:|
| Strategic reasoning and storyline | STR1–STR5 | 25 |
| Evidence and numeric integrity | EVI1–EVI4 | 20 |
| Slide message and copy | MSG1–MSG3 | 15 |
| Chart selection and annotation | CHR1–CHR3 | 15 |
| Visual craft and consistency | VIS1–VIS3 | 15 |
| Technical PPTX integrity | TEC1–TEC2 | 10 |
| Total | 20 kriteria × 5 poin | 100 |

Setiap kriteria diberi rating integer 0–4. Poin = bobot kriteria × rating / 4. Semua rating memerlukan bukti. `weighted-scorecard.json` menyimpan nama dan definisi setiap kriteria.

## Evidence dan technical

| ID | Rating kuat membutuhkan |
|---|---|
| EVI1 | Fakta material terhubung ke sumber yang dapat diperiksa |
| EVI2 | Hasil kalkulasi dapat diulang dari input, rumus, timing dan asumsi |
| EVI3 | Unit, scope, periode, denominator, comparator dan angka lintas-slide konsisten |
| EVI4 | Assumption/unknown, synthetic/factual, serta forecast/approval status jelas |
| TEC1 | Bukti file membuka tanpa repair dan hasil render diperiksa pada aplikasi sasaran |
| TEC2 | Pemeriksaan native objects/data memastikan Practical editability |

## Keputusan

1. Ada hard fail: `FAIL_HARD_CONDITION`, berapa pun skor.
2. Rating/evidence/identitas artefak hilang atau pemeriksaan wajib belum diketahui: `INCOMPLETE`.
3. Semua dinilai, tanpa hard fail, skor <85: `REVISE`.
4. Semua dinilai, tanpa hard fail, skor ≥85: `PASS` untuk artefak dan lingkungan yang diuji.

Rating kosong tidak sama dengan nol. Untuk review PDF, TEC biasanya belum dapat diuji. Laporkan poin yang ditinjau dan maksimum yang ditinjau, misalnya 72 dari 90 poin yang tersedia untuk pemeriksaan tersebut, **tanpa mengubahnya menjadi skor 80/100 atau memberi pass produk**.

`tools/score_review.py` hanya menjumlahkan penilaian yang diberikan reviewer. Script tidak dapat membuktikan evidence palsu menjadi benar dan tidak menggantikan review visual/semantik.

## Bukti wajib dalam review

- Artefak/version/hash, reviewer, tanggal, mode dan audience.
- Rating serta lokasi slide/element/source per kriteria.
- Daftar hard-fail checks dengan status `clear`, `failed`, `unverified`, atau `not_applicable`.
- `not_applicable` memerlukan alasan dan evidence; tidak boleh dipakai untuk menghindari pemeriksaan file/editability pada final PPTX.
- Aplikasi/renderer dan versi yang benar-benar diuji.
- Temuan, perbaikan dan hasil pemeriksaan ulang yang relevan.

Tidak ada deck yang diberi skor benchmark aktual dalam batch ini. Pengujian kalkulator scorecard memakai input buatan berlabel test fixture.
