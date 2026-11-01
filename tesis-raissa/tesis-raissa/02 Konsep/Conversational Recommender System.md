---
tags: [konsep]
bagian-paper: "II.B, III.C"
---

# Conversational Recommender System (CRS)

Recommender yang berinteraksi lewat **dialog natural language multi-turn**, bukan menyodorkan daftar sekali jalan.

## Beda dengan recommender biasa

| Recommender klasik | CRS |
|---|---|
| Sekali tembak (one-shot) | Bolak-balik (multi-turn) |
| Preferensi ditebak dari riwayat | Preferensi **digali lewat tanya-jawab** |
| Output = daftar peringkat | Output = percakapan + rekomendasi |
| Penjelasan (kalau ada) statis | Penjelasan bisa dinegosiasi |

Rujukan standar: Jannach et al. (2021, *ACM Computing Surveys*).

## Kenapa CRS cocok untuk studi ini

Karena penjelasan disampaikan **dalam bahasa alami**, jenis penjelasan bisa diubah hanya dengan mengganti system prompt — tanpa menyentuh model rekomendasi di belakang. Manipulasi jadi bersih dan murah.

Itu yang memungkinkan desain tiga kondisi di [[Desain Eksperimen]].

## Sistem dalam studi ini

Namanya **Lily**. Alurnya: sapaan → ekstraksi preferensi lewat dialog → rekomendasi + penjelasan (sesuai kondisi) → kuesioner.

Detail teknis di [[Arsitektur Sistem]].

## Konteks literatur

- **Ziegfeld et al. (2024)** — paling dekat secara metodologis: between-subjects, 3 kondisi CRS, mengukur 10 konstruk UX. Menariknya mereka **tidak menemukan** efek signifikan pada ukuran subjektif. Studi ini justru menemukannya — poin bagus untuk diskusi.
- **Hernandez-Bocanegra & Ziegler (2023)** — penjelasan lewat percakapan (chatbot vs GUI) dan efeknya ke transparency, trust, effectiveness.
- **Siro et al. (2023)** — enam aspek dialog yang membentuk user satisfaction.

---

Terkait: [[Explainable AI]] · [[Arsitektur Sistem]] · [[Jenis Penjelasan]]
