# Instruksi reviewer — pilot kalibrasi Phase 2

Tugas Anda: nilai tiga deck CAL-A, CAL-B, dan CAL-C menggunakan **standard/rubrik v0.1 yang dibekukan**. Semua data adalah simulasi orisinal. Sebagian artefak dapat memuat masalah; temukan dari bukti, tanpa menebak target skor pembuatnya.

## Akses dan independensi

- Baca hanya isi `reviewer-packet/`, termasuk brief, PPTX, preview, data kasus, dan rubrik. Jangan membaca folder operator, laporan penulis, kode pembuat deck, atau penilaian reviewer lain sebelum menyerahkan hasil pertama.
- Anda tidak boleh menjadi pembuat artefak yang sedang dinilai. Nyatakan reviewer ID, jenis reviewer, tanggal, konteks/model bila relevan, dan apakah sudah melihat review lain.
- Dua identitas yang berbeda tidak otomatis membuktikan independensi. Untuk reviewer AI, catat bahwa konteksnya terpisah serta model yang dipakai. Kesamaan model tetap menjadi keterbatasan pilot.
- Bekukan hasil pertama sebelum diskusi atau revisi. Jangan menyamakan skor agar terlihat konsisten.

## Brief

Semua deck memakai mode **live analytical presentation**, 16:9, empat content slides tanpa cover. Audience simulasi tercantum pada slide. Seluruh nominal memakai Rp miliar kecuali persentase, skor, atau jumlah bulan. **Titik adalah pemisah desimal** dalam ketiga deck. Input JSON memakai numeric values; perbedaan bentuk tampilan tidak mengubah satuan.

| ID | Dataset | Audience dan pertanyaan |
|---|---|---|
| CAL-A | SYN-C02 | Investment Committee: mode masuk apa yang layak untuk pasar terpilih dengan constraints yang tersedia? Otorisasi apa yang diminta? |
| CAL-B | SYN-C03 | Board: bagaimana kinerja terhadap budget, outlook dan risiko kasnya? Aksi dan keputusan apa yang diperlukan? |
| CAL-C | SYN-C04 | Investment Committee: bagaimana cashflow, return, pendanaan dan sensitivitas memengaruhi persetujuan investasi? |

Tujuan penilaian adalah menilai artefak sesuai brief dan input. Input/source yang berlawanan dengan isi deck tidak boleh diganti supaya deck tampak benar. File `*-expected.json` memuat hasil hitung sumber kasus; ia tidak memuat skor kualitas deck.

## Langkah penilaian

1. Baca `phase2/consulting-grade-standard.md`, tiga rubrik, `hard-fails.md`, dan `weighted-scorecard.json`.
2. Cocokkan nama/hash artefak dengan `artifact-manifest.json`. Gunakan file final yang disebut di situ, bukan file draft.
3. Baca data kasus terkait. Periksa seluruh empat slide, speaker notes dan gambar render. Jika perlu, periksa native objects di dalam PPTX. Jangan menilai hanya dari thumbnail.
4. Baca judul berurutan, kemudian cocokkan setiap title dengan exhibit dan data. Catat finding ID, lokasi slide/element, apa masalahnya, evidence pointer, dan materialitasnya.
5. Lengkapi satu salinan `reviews/review-CAL-*.json` per deck. Rating integer 0–4, dengan bukti lokasi untuk setiap rating. Null berarti belum dinilai, bukan nol.
6. Review minimal 18 kriteria STR, EVI, MSG, CHR, dan VIS. Inilah scope pembandingan awal, maksimum **90 poin mentah**. Jangan normalisasi menjadi /100 atau menyatakan deck lulus produk.
7. TEC1 memerlukan bukti aplikasi sasaran. Import/render Artifact Tool tidak membuktikan file membuka tanpa repair di Microsoft PowerPoint. Jika aplikasi tidak diperiksa, biarkan TEC1 null dan HF07 `unverified`, disertai alasan.
8. TEC2 dapat dicatat jika Anda benar-benar memeriksa native objects/data dan batas editability. Rating tersebut dilaporkan terpisah dari 18 kriteria pilot; jangan menyimpulkan cross-platform behavior dari XML.
9. Evaluasi semua hard-fail checks. `not_applicable` memerlukan alasan dan evidence. Kondisi yang belum diketahui tetap unknown. Untuk contoh finansial sintetis tanpa keputusan nyata, jelaskan applicability HF12 sesuai rubrik.
10. Kembalikan tiga review JSON beserta findings ringkas. Tidak perlu mengubah PPTX pada putaran pertama.

## Format bukti

Contoh lokasi: `CAL-A slide 2, row Partner, column NPV dasar; cases/c02-expected.json#/modes/1/npv`. Ini contoh cara merujuk lokasi, bukan rating yang harus Anda berikan.

Temuan terkait clipping/overlap harus menyebut teks/objek yang terganggu. Temuan numerik harus menyebut unit, periode dan hasil yang didukung sumber. Bedakan presentasi kurang efektif dengan kesalahan yang mengubah keputusan.

## Hal yang tidak boleh disimpulkan

Pilot tiga development cases ini belum memvalidasi kelima use cases secara luas, belum blind holdout, belum human gold review, dan belum menguji adapter Claude/GPT/Gemini/DeepSeek. Pola lama dipakai sebagai dasar aturan; raw reference decks dan aset firma consulting tidak masuk paket ini.
