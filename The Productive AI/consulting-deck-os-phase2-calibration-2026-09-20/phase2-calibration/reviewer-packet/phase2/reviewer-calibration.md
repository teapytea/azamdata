# Protokol kalibrasi dua reviewer v0.1

Status: **BELUM DIJALANKAN**. Dua reviewer belum memberikan penilaian independen. Hasil 51 pemeriksaan kode bukan pengganti gate ini.

## Tujuan

Menguji apakah definisi dan anchor rubrik menghasilkan penilaian yang relatif konsisten pada artefak yang sama. Ini gate Phase 2 dari blueprint; tidak membuktikan produk siap jual.

## Pelaksanaan

1. Bekukan standard, rubrik, artefak, brief dan bukti sumber dengan nomor versi/hash.
2. Pilih minimal tiga artefak dengan jenis berbeda: analitis kuat, bermasalah, dan borderline. Sertakan kasus title tidak didukung serta angka/approval ambigu. Pilihan ini adalah rancangan kalibrasi v0.1, bukan ukuran benchmark release yang sudah terpenuhi.
3. Dua reviewer menilai secara independen tanpa melihat rating reviewer lain. Identitas/jenis reviewer dicatat. Review ulang oleh satu AI tidak dihitung sebagai dua reviewer independen. Human gold review produksi tetap menjadi kebutuhan terpisah yang belum selesai.
4. Masing-masing melengkapi `review-template.json`, evidence location, hard-fail disposition dan komentar.
5. Bandingkan hanya kriteria yang sama-sama dapat dinilai. Untuk PDF, technical PPTX ditandai unverified; skor parsial tidak dipromosikan menjadi skor /100. Kalibrasi masih dapat memeriksa konsistensi kriteria story/slide/evidence dan kesepakatan bahwa technical belum diketahui.
6. Diskusikan perbedaan setelah kedua penilaian dibekukan. Perbaiki kalimat/anchor yang ambigu; simpan rating sebelum diskusi.
7. Ulangi pada artefak baru bila perubahan rubrik mengubah interpretasi. Jangan mengulang kasus yang sama sampai terlihat sepakat tanpa mencatat perubahan.

## Ambang operasional usulan

Untuk kriteria yang sama-sama dinilai:

- Selisih agregat poin ≤5 pada skala maksimum 100; jika coverage parsial, bandingkan poin mentah pada subset yang sama dan laporkan maksimum subset.
- Sedikitnya 90% rating berjarak paling banyak 1 pada skala 0–4.
- Tidak ada perbedaan material `failed` versus `clear` pada hard-fail checks tanpa penyelesaian berbukti.
- Seluruh ketidaksepakatan yang dapat mengubah keputusan tercatat dan diselesaikan.

Angka ambang ini adalah rancangan untuk mengoperasionalkan “relatif konsisten”. Belum dikalibrasi terhadap reviewer nyata dan boleh direvisi dengan alasan yang tercatat; ambang kualitas deck ≥85/100 tetap.

## Catatan saat ini

- Standard/rubrik ditulis: ya.
- Template dan kalkulator scorecard tersedia: ya.
- Kasus sintetis mempunyai expected data: ya.
- Penilaian dua reviewer terkumpul: tidak.
- Blind holdout atau validasi pengguna: tidak.
- Gate Phase 2: **IN_PROGRESS_CALIBRATION_REQUIRED**.

Keluaran gate nantinya: dua review asli, comparison report, disagreement log, revisi rubrik bila diperlukan, serta keputusan apakah Phase 3 dapat dimulai.
