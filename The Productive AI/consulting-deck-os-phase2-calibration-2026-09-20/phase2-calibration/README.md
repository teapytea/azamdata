# Phase 2 — paket kalibrasi siap dinilai

20 September 2026. Acuan terakhir: `checkpoint-2026-09-20.json`. Blueprint dan keputusan Phase 0/1 tetap berlaku.

## Isi konkret

- Tiga deck PPTX, masing-masing empat content slides, menggunakan kasus sintetis C02, C03, dan C04.
- Chart native beserta embedded workbook berisi nilai chart; tabel dan business text native. Semua source case ikut disertakan.
- Dua belas render final, brief, rubrik v0.1 yang dibekukan, form review kosong, serta hash artefak.
- Kunci temuan pembuat di folder operator, terpisah dari reviewer packet.
- Alat pembanding dua review. Ia memeriksa identitas/versi/hash, evidence, cakupan, selisih rating dan disagreement kondisi gagal. Ia tidak menghasilkan penilaian sendiri.

**Sebagian contoh sengaja salah untuk pengujian rubrik. Jangan memakai deck sebagai rekomendasi bisnis.** Target “kuat / bermasalah / borderline” adalah rancangan pembuat, belum hasil penilaian independen.

## Urutan penggunaan

1. Baca `phase2-calibration-status-2026-09-20.md` untuk status dan batas yang berlaku.
2. Berikan hanya `reviewer-packet/` atau ZIP reviewer terpisah kepada masing-masing penilai. Mulai dari `reviewer-packet/START-HERE.md`.
3. Dua penilai bekerja dengan konteks terpisah, tanpa kunci temuan dan tanpa melihat hasil satu sama lain. Simpan tiga JSON dari masing-masing reviewer di folder hasil yang berbeda.
4. Bekukan enam hasil pertama, kemudian jalankan perbandingan untuk setiap pasangan:

```bash
python tools/compare_reviews.py results/R1/review-CAL-A.json results/R2/review-CAL-A.json
```

5. Setelah kedua hasil tersedia, baca `operator/answer-key.md`. Bahas ketidaksepakatan dan periksa apakah kesalahan material terdeteksi. Dua reviewer dapat konsisten sekaligus sama-sama salah; agreement tidak menggantikan pemeriksaan bukti.
6. Catat keputusan gate. Jika anchor perlu diubah, simpan v0.1 dan review awal, tulis changelog v0.2, lalu gunakan artefak baru untuk memeriksa interpretasi.

## Batas tahap ini

Belum ada dua penilaian independen. Form yang tersedia masih kosong. Hasil uji kode bukan rating deck. Gate Phase 2 tetap pending dan Phase 3 belum dimulai.

Import serta render melalui Artifact Tool telah diperiksa. Microsoft PowerPoint desktop/web, Google Slides, dan proses edit–save–reopen pada aplikasi sasaran belum diuji. Bukti native chart/table tidak menjamin kompatibilitas platform. Workbook chart adalah snapshot nilai, bukan financial model workbook dengan seluruh rumus sumber.

Builder fixture memakai runtime authoring yang tersedia dalam sesi ini; ini bukan keputusan pemilihan compiler produk. Source builder disertakan di `operator/build_calibration.mjs` sebagai catatan reproduksi lingkungan, bukan installer lintas AI. Compiler spike tetap Phase 6, ikon/palet produksi tetap Phase 5.

Paket fondasi lengkap sebelumnya tetap disertakan dalam `baseline/consulting-deck-os-phase2-foundation-2026-09-18.zip`, termasuk blueprint, Phase 1B, GEI, 22-rule crosswalk dan tiga source cases. File sumber historis tidak diubah. Tidak ada tambahan raw McKinsey/BCG decks atau aset pesaing di paket baru.
