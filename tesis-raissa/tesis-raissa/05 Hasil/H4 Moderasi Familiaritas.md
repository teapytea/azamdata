---
tags: [hasil, hipotesis]
hipotesis: H4
menjawab: RQ3
keputusan: tidak-ditemukan-bukti
---

# H4 — Moderasi Familiaritas

> **Hipotesis:** [[Familiaritas]] terhadap parfum memoderasi efek jenis penjelasan.

## Hasil

```
Two-way ANOVA (kondisi × familiaritas)
Interaksi   F = 0,45
            p = 0,638
```

> [!failure] **TIDAK DITEMUKAN BUKTI MODERASI.**

## Cara menulisnya — ini penting

❌ **Jangan tulis:** "Familiaritas tidak memoderasi efek jenis penjelasan."
❌ **Jangan tulis:** "Tidak ada perbedaan antara novice dan enthusiast."

✅ **Tulis:** "Tidak ditemukan bukti moderasi familiaritas dalam sampel ini."

**Kenapa harus sehati-hati itu:** tidak menolak H0 ≠ menerima H0. Terutama kalau power-nya rendah — dan di sini power-nya memang rendah.

## Kenapa power-nya rendah

```
Total novice = 30, tersebar ke 3 kondisi
→ sekitar 8–12 orang per sel
```

Sel sekecil itu **tidak punya kekuatan statistik** untuk mendeteksi interaksi, bahkan kalau interaksinya benar-benar ada.

Ini konsekuensi langsung dari komposisi sampel yang timpang (enthusiast 60 : novice 30). Lihat [[Desain Eksperimen]].

## Yang tetap bisa diklaim

**Balance check berhasil:** χ²=1,20; p=0,549 → familiaritas terdistribusi seimbang antar kondisi.

Ini penting. Artinya efek yang ditemukan di [[H1 Trust]] dan [[H2 Purchase Intention]] **tidak bisa dijelaskan** oleh ketimpangan komposisi antar kondisi. Randomisasi bekerja.

## Konteks literatur

Ada alasan teoretis kuat untuk menduga moderasi ini ada:

- **[[Bayer 2021 Domain Expertise]]** — keahlian domain menurunkan trust pada XAI; penjelasan lebih vital untuk yang berkeahlian tinggi
- **[[Celar Byrne 2023 Familiar Unfamiliar]]** — efek penjelasan berbeda antara domain familiar dan tidak familiar (n=731, empat eksperimen)
- **Wang & Yin (2022, *ACM TiiS*)** — banyak penjelasan AI gagal memenuhi kriteria apa pun ketika user minim keahlian

Bandingkan n: Celar & Byrne memakai **731** partisipan untuk mendeteksi efek serupa. Raissa punya 90, dengan hanya 30 novice.

> [!tip] Kalimat untuk §VI.C
> "Meskipun literatur sebelumnya menunjukkan familiaritas domain memengaruhi pemrosesan penjelasan (Bayer et al., 2021; Celar & Byrne, 2023), studi ini tidak menemukan bukti moderasi. Mengingat ukuran sel novice yang kecil (8–12 per kondisi), hasil ini lebih tepat dibaca sebagai keterbatasan power daripada bukti ketiadaan efek."

## Untuk replikasi

Lihat [[Rencana Lanjutan]] — perlu sampel lebih besar **dan** seimbang antar tingkat familiaritas.

---

Terkait: [[Familiaritas]] · [[Keterbatasan]] · [[Rencana Analisis]]
