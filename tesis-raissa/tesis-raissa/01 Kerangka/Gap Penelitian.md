---
tags: [kerangka]
bagian-paper: "I.B, II.E"
---

# Gap Penelitian

Dua celah yang ditutup penelitian ini.

## Celah 1 — Jenis penjelasan jarang diuji komparatif dalam CRS

Literatur [[Explainable AI]] banyak membahas **ada/tidaknya** penjelasan, tapi sedikit yang membandingkan **jenis** penjelasan secara head-to-head dalam satu [[Conversational Recommender System]].

Yang sudah ada:
- [[Wang Benbasat 2007 Explanation Facilities]] membandingkan how/why/trade-off — tapi pada recommender agent **statis**, bukan percakapan, dan tahun 2007.
- de Brito Duarte et al. (2023) membandingkan feature-importance vs counterfactual — tapi di luar konteks CRS dan e-commerce.

Belum ada yang membandingkan penjelasan **berbasis fitur vs naratif vs komparatif** dalam CRS berbasis LLM.

## Celah 2 — Domain sensorik-hedonis kurang tereksplorasi

Hampir semua studi XAI-RS berlatar domain **rasional/utilitarian**: pinjaman, medis, film, restoran, kamera.

Padahal [[Chen 2023 Post Hoc Explanation]] justru membuktikan efek penjelasan **berbeda secara sistematis** antara domain utilitarian dan hedonis. Dan Varga & Albuquerque (2023, *JMR*) menemukan efek informasi berlaku pada produk utilitarian **tapi tidak** pada hedonis maupun faktor taste-related.

Artinya: temuan XAI dari domain rasional **tidak otomatis berlaku** di domain hedonis. Ini yang belum diuji.

→ [[Domain Hedonis]] menjelaskan kenapa parfum kasus yang ekstrem.

---

## Celah spesifik yang tidak ditemukan di literatur

Dari penelusuran jurnal Q1/Q2 (lihat [[Referensi-Utama]]):

1. **Tidak ada studi Q1/Q2 yang menguji jenis penjelasan XAI secara komparatif di domain parfum/olfaktori.** Studi sensorik yang ada berpusat pada makanan dan anggur.
2. **Tidak ada yang menyilangkan *narrative-based explanation* dengan trust dalam CRS.** Literatur antropomorfisme membahas *gaya percakapan* hangat-vs-kompeten ([[Li 2024 Mind Perception]]), tapi bukan *isi penjelasan* yang naratif.

Celah kedua inilah yang diisi [[Kondisi B Narrative-based]] — dan justru menghasilkan [[Temuan Kontra-Intuitif]].
