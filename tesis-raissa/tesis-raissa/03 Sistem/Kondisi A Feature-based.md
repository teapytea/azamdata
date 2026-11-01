---
tags: [sistem, kondisi]
kondisi: A
logika: atributif
---

# Kondisi A — Feature-based

**Isi penjelasan:** olfactory family + accords.

Sistem menjelaskan rekomendasi lewat **komposisi objektif** parfum — keluarga wangi dan akord penyusunnya.

> "Parfum ini berada di keluarga woody-aromatic, dengan akord dominan bergamot di pembuka dan vetiver di dasarnya."

## Logika justifikasi

**Atributif** — menjawab "ini isinya apa".

Padanan di literatur XAI: *attribute-based* atau *feature-importance explanation*. Ini bentuk penjelasan yang paling banyak diteliti.

## Prediksi teoretis

**Mendukung trust tinggi.** Dua alasan:

1. de Brito Duarte et al. (2023) menemukan penjelasan feature-importance menghasilkan trust **lebih tinggi** daripada counterfactual.
2. Penjelasan berbasis atribut menyinyalkan **kompetensi** — sistem tampak tahu apa yang dibicarakan.

Tapi [[Chen 2023 Post Hoc Explanation]] memberi peringatan: attribute-based lebih efektif di domain **utilitarian**, sementara di domain hedonis justru user-based yang unggul. Jadi prediksinya tidak sepenuhnya lurus.

## Hasil

**Trust: tinggi** (setara C, keduanya > B) — lihat [[H1 Trust]]
**PI: sedang** (di bawah C) — lihat [[H2 Purchase Intention]]

Jadi A berhasil membangun kepercayaan, tapi tidak sekuat C dalam mendorong niat beli.

## Risiko yang perlu dibahas

Kondisi ini paling bergantung pada [[Familiaritas]]. Kalau user tidak paham "accord" atau "olfactory family", penjelasan jadi kosong.

Ini yang melatarbelakangi H4 — dan justru interaksinya tidak terdeteksi. Lihat [[H4 Moderasi Familiaritas]].

---

Bandingkan: [[Kondisi B Narrative-based]] · [[Kondisi C Comparative-based]] · [[Jenis Penjelasan]]
