---
tags: [kerangka]
bagian-paper: "I.D, VI.E, VI.F"
---

# Kontribusi

## 1. Artefak — CRS parfum dengan tiga mode penjelasan

Sistem [[Arsitektur Sistem|GPT-4o-mini + CR-HKGE]] yang bisa diarahkan menghasilkan tiga jenis penjelasan berbeda lewat *system-prompt conditioning*, **tanpa fine-tuning**.

Nilainya: mode penjelasan jadi variabel yang bisa dimanipulasi murah dan direplikasi.

## 2. Bukti empiris di domain hedonis

Menjawab langsung ajakan riset [[Chen 2023 Post Hoc Explanation]] yang menemukan efek penjelasan berbeda antara domain utilitarian dan hedonis, tapi belum diuji dalam setting percakapan.

## 3. Temuan kontra-intuitif — narasi emosional menurunkan trust

Ini kontribusi paling menarik. Penjelasan naratif justru menghasilkan trust **terendah**, bukan tertinggi.

Bertentangan dengan intuisi desain yang lazim ("bikin AI terdengar lebih manusiawi dan relatable"). Punya preseden teoretis kuat — lihat [[Temuan Kontra-Intuitif]].

## 4. Implikasi teoretis

Menyambungkan tiga literatur yang selama ini terpisah:

```
     XAI  ──────┐
                ├──→ studi ini
     CRS  ──────┤
                │
Domain hedonis ─┘
```

## 5. Implikasi praktis

Panduan untuk perancang CRS:

> Kalau tujuannya membangun **trust**, prioritaskan penjelasan berbasis-objektif (fitur atau perbandingan), bukan narasi emosional — bahkan di domain yang terasa emosional sekalipun.

> Kalau tujuannya mendorong **niat beli**, penjelasan komparatif paling efektif karena mengurangi ketidakpastian keputusan.

Perhatikan: kedua tujuan itu **tidak dicapai kondisi yang sama**. Trust tertinggi dan PI tertinggi ada di kondisi berbeda — ini trade-off desain yang nyata.

---

Terkait: [[Gap Penelitian]] · [[Pertanyaan Penelitian]] · [[Rencana Lanjutan]]
