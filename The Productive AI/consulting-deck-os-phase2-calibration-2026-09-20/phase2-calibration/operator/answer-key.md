# Kunci temuan pembuat — jangan diberikan sebelum review pertama

Ini **author diagnostic**, bukan penilaian independen dan bukan gold set produksi. Target desain tidak menetapkan skor yang harus diberikan reviewer. Pembuat memiliki konflik karena mengetahui cara contoh dibangun.

## CAL-A — target desain: rekomendasi terstruktur

Empat slide menerapkan shortlist, perbandingan economics/constraints, downside, dan approval bersyarat. Tidak ada false claim yang sengaja ditanam. Namun reviewer tetap boleh menemukan masalah, menurunkan skor, atau menyimpulkan kualitasnya belum memadai.

Pemeriksaan objektif: partner initial funding 1.5, launch 4 bulan, base NPV 3.0945685 dan downside 1.5793512 pada diskonto 12%. Build direct memiliki NPV lebih besar tetapi gagal dana/waktu. DEC-C02-01 tetap REQUESTED_NOT_APPROVED. Market B diprioritaskan melalui skor sintetis, bukan optimasi gabungan seluruh pasar dan mode.

## CAL-B — kesalahan yang sengaja ditanam

| ID | Lokasi | Masalah yang dapat diperiksa | Bukti dan koreksi | Area rubrik |
|---|---|---|---|---|
| B-F01 | Slide 1, title | “Melampaui anggaran” berlawanan dengan chart | Actual EBIT 0.4 − budget 1.5 = -1.1. Arah yang benar: tertinggal. `c03-expected.json#/monthly_ebit_variance` | HF02, STR4, MSG1 |
| B-F02 | Slide 2, forecast | Penghematan potential 0.6 dimasukkan sebagai forecast committed | ACT-04 berstatus POTENTIAL dan belum tervalidasi. `c03-performance-review.json#/actions/3` | EVI3/EVI4, NU08; material numeric finding |
| B-F03 | Slide 2, penagihan piutang | Tambahan kas 0.8 dimasukkan ke EBIT | ACT-03 adalah JULY_CASH_ONLY. Forecast yang didukung = 16.1 + 0.5 = 16.6, bukan 18.0. Penjumlahan angka literal benar, tetapi definisi agregasi salah. | HF04/NU05/NU08, EVI2/EVI3; title juga unsupported |
| B-F04 | Slide 3, row penagihan / penghematan | Owner ACT-03 dan due ACT-04 dihilangkan walaupun input tersedia | Owner Accounts Receivable Lead; due ACT-04 2026-07-20 | DC03, STR5, EVI4; tidak otomatis fabricated data |
| B-F05 | Slide 4, title dan status | Permintaan approval berubah menjadi APPROVED | `c03-performance-review.json#/decisions/1/status` = REQUESTED_NOT_APPROVED | HF02, DC04, EVI4; reviewer dapat mengusulkan HF01 dengan alasan |

CAL-B tidak boleh dipakai sebagai contoh keputusan bisnis yang benar. Seluruh slide tetap berlabel sintetis, tetapi label itu tidak membenarkan perubahan fakta di dalam source case.

## CAL-C — target desain: angka benar, pesan judul lemah

Judul keempat slide berupa label topik (“Business case automasi”, “Arus kas proyek”, “Sensitivitas investasi”, “Syarat persetujuan”). Untuk empat content slides pada brief ini, pembaca tidak mendapatkan argumen dari title-only read. Temuan terutama terkait TX01, ST02, MSG1/MSG2, dan STR3.

Tidak ada perubahan angka atau approval yang sengaja ditanam. Base initial cash 5.0, XNPV 2.67201197, XIRR 25.943687%, undiscounted period-end payback tahun ke-4. Combined downside XNPV -0.33172561 dan initial funding 5.8; komitmen penuh tetap ditahan. Hasil di slide dibulatkan dengan konsisten.

Judul topik yang lemah belum otomatis merupakan klaim palsu. Reviewer perlu menjelaskan apakah ada hard fail yang benar-benar material. Skor “borderline” adalah target rancangan, **bukan hasil pengukuran**; jangan memaksakan skor tertentu jika reviewer menilai berbeda.

## Ambiguitas rubrik untuk ditangkap pada pilot

1. Pemisahan judul topik yang kurang efektif dari judul factual yang bertentangan dengan bukti.
2. Salah agregasi jenis metrik walaupun penjumlahan literal benar.
3. Approval palsu dapat memicu lebih dari satu hard-fail code; bedakan disagreement taxonomy dari disagreement materialitas.
4. Visual terlihat rapi tidak menutupi kualitas keputusan/angka yang gagal.
5. Native chart/table di XML memberi bukti object structure, tetapi tidak membuktikan edit–save–reopen di aplikasi sasaran.

Catatan ini disimpan terpisah; standard v0.1 tidak diubah diam-diam. Jika pilot menunjukkan anchor ambigu, simpan kedua review dahulu, baru usulkan v0.2 dengan change log dan uji pada artefak baru.
