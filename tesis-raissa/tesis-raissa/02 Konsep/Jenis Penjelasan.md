---
tags: [konsep, variabel]
peran: variabel-bebas
bagian-paper: "II.A, III.B"
---

# Jenis Penjelasan

> [!important] Ini **variabel bebas** penelitian. Satu-satunya hal yang dimanipulasi.

Tiga level, dimanipulasi lewat *system-prompt conditioning* per sesi:

| | Kondisi | Isi penjelasan | Contoh gaya |
|---|---|---|---|
| A | [[Kondisi A Feature-based]] | Olfactory family + accords | "Parfum ini didominasi bergamot dan vetiver, keluarga woody-citrus." |
| B | [[Kondisi B Narrative-based]] | Emosi, momen, identitas | "Wangi ini seperti sore hari di kota tua — untuk kamu yang tenang tapi berkarakter." |
| C | [[Kondisi C Comparative-based]] | Perbedaan antar 3 produk | "Dibanding X yang lebih manis dan Y yang lebih berat, ini paling seimbang." |

## Kenapa tiga ini?

Ketiganya mewakili **tiga logika justifikasi** yang berbeda:

- A = **atributif** → "ini isinya apa"
- B = **afektif** → "ini rasanya bagaimana untukmu"
- C = **kontrastif** → "ini beda dari yang lain di mana"

## Akar teoretisnya

**A dan C** punya padanan mapan di literatur XAI:
- A ≈ *attribute-based / feature-importance explanation*
- C ≈ *contrastive explanation* — Stepin et al. (2021) menyusun taksonomi lengkapnya

**B adalah yang baru.** Literatur CRS membahas *gaya percakapan* yang hangat vs kompeten ([[Li 2024 Mind Perception]]), tapi bukan **isi penjelasan** yang naratif. Ini celah yang diisi studi ini.

## Yang diprediksi vs yang terjadi

| | Prediksi awal | Hasil |
|---|---|---|
| Trust | B tertinggi (paling relatable) | **B TERENDAH** ❌ |
| PI | B tertinggi | **C tertinggi** ❌ |

Dua-duanya meleset. Penjelasannya di [[Temuan Kontra-Intuitif]].

---

Terkait: [[Explainable AI]] · [[H1 Trust]] · [[H2 Purchase Intention]] · [[Manipulation Check]]
