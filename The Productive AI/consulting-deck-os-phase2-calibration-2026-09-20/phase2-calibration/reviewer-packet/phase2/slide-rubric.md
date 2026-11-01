# Slide rubric v0.1

Status: draft untuk kalibrasi. Isi satu lembar temuan per slide dengan slide_id, story_role, mode, title, exhibit, evidence_ids, dan issue locations.

## Pesan, exhibit dan tampilan

| ID | Bobot pada scorecard deck | Pertanyaan review | Bukti rating kuat |
|---|---:|---|---|
| MSG1 | 5 | Apakah title menyatakan pesan yang dibuktikan? | Claim tepat scope, periode, confidence dan nilai |
| MSG2 | 5 | Apakah copy membantu memahami implikasi? | Pembaca tidak dipaksa mencari so-what sendiri; tidak repetitif |
| MSG3 | 5 | Apakah istilah dan angka konsisten? | Definisi, singkatan, grammar, unit dan precision seragam |
| CHR1 | 5 | Apakah exhibit cocok dengan analytical intent? | Bentuk membantu menjawab perbandingan/struktur/urutan yang dimaksud |
| CHR2 | 5 | Apakah encoding benar? | Sumbu, baseline, denominator, scale dan missingness jujur |
| CHR3 | 5 | Apakah label/annotation cukup? | Seri teridentifikasi, delta penting terlihat, konteks tidak terlepas |
| VIS1 | 5 | Apakah hierarchy/layout membantu scan? | Title, exhibit dan implication terbaca berurutan; alignment rapi |
| VIS2 | 5 | Apakah density sesuai mode? | Teks terbaca, spacing cukup, detail tidak menumpuk |
| VIS3 | 5 | Apakah sistem visual konsisten? | Tema, warna semantik, font, komponen dan ikon stabil |

## Skala dan agregasi

- 0: unsur relevan tidak tersedia atau tidak dapat digunakan.
- 1: masalah besar; perlu pengerjaan ulang.
- 2: sebagian terpenuhi; perlu perbaikan material.
- 3: memenuhi kebutuhan dengan kekurangan kecil.
- 4: jelas, kuat, konsisten dan didukung bukti lokasi.

Untuk MSG/CHR/VIS, reviewer mencatat rating slide relevan terlebih dahulu. Rating kriteria deck ditentukan dengan alasan berdasarkan pola lintas-slide, bukan rata-rata yang menyembunyikan slide kritis gagal. Cover/navigation tidak dimasukkan sebagai content slide untuk aturan action title. Kegagalan material satu slide tetap mengaktifkan hard fail walaupun rata-rata deck tinggi.

Jika structured text atau diagram merupakan pilihan terbaik, CHR1 dapat mendapat nilai kuat berdasarkan ketepatan pilihan exhibit; tidak perlu memaksakan chart. CHR2/CHR3 kemudian menilai encoding, hubungan, label dan konteks pada exhibit tersebut.

Perhatikan khusus: axis break, dual-axis, persentase versus percentage points, warna status tanpa label, forecast yang terlihat sebagai actual, serta source footer yang hilang atau tidak terbaca. Beberapa teknik boleh digunakan dengan justifikasi; nama firma pada referensi bukan alasan otomatis.

## Apa yang tidak bisa ditentukan dari screenshot

Screenshot hanya mendukung sebagian penilaian visual. Ia tidak membuktikan perhitungan benar, sumber dapat ditelusuri, file membuka tanpa repair, chart native/editable, atau font tampil konsisten di aplikasi lain. EVI dan TEC memerlukan evidence yang sesuai.
