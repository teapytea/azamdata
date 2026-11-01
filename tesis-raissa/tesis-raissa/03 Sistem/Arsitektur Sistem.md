---
tags: [sistem]
bagian-paper: "III.A"
---

# Arsitektur Sistem

```
┌──────────────┐
│     User     │  percakapan natural language
└──────┬───────┘
       │
┌──────▼─────────────────────────┐
│  Lily — antarmuka percakapan   │
│  ekstraksi preferensi          │
└──────┬─────────────────────────┘
       │
┌──────▼─────────────────────────┐
│  GPT-4o-mini                   │
│  + system-prompt conditioning  │ ←── di sinilah [[Jenis Penjelasan]]
│    (A / B / C per sesi)        │     dimanipulasi
└──────┬─────────────────────────┘
       │  query preferensi
┌──────▼─────────────────────────┐
│  Backend CR-HKGE               │
│  (knowledge graph embedding)   │
└──────┬─────────────────────────┘
       │  kandidat parfum
       ▼
   Rekomendasi + penjelasan
```

> [!warning] Klaim yang harus ditegaskan di paper
> **Ini bukan RAG.** Backend-nya knowledge graph embedding, bukan retrieval atas dokumen. Reviewer kemungkinan besar akan menanyakan ini — tegaskan sejak §III.A.

## Kenapa pemisahan LLM / backend itu penting

LLM mengurus **bahasa**. KG mengurus **rekomendasi**. Karena terpisah:

- Mengganti mode penjelasan **tidak mengubah item yang direkomendasikan**
- Manipulasi jadi bersih — perbedaan antar kondisi murni dari cara menjelaskan, bukan dari apa yang direkomendasikan

Ini fondasi validitas internal [[Desain Eksperimen]].

Padanan di literatur: **Huang et al. (2023, *ACM TOIS*)** — InteRecAgent, LLM sebagai "otak" dan model rekomendasi sebagai "alat". Sitasi ini untuk memposisikan arsitektur.

## Tanpa fine-tuning

Mode penjelasan diatur murni lewat *system prompt* per sesi. Tidak ada pelatihan ulang model.

Justifikasi teoretisnya: **Fan et al. (2023, *IEEE TKDE*)** memetakan tiga paradigma LLM untuk recommender — pre-training, fine-tuning, dan **prompting**. Studi ini memakai yang ketiga.

Keuntungannya: murah, cepat, dan mudah direplikasi peneliti lain.

## Rujukan CR-HKGE

Lima model yang jadi landasan: KGAT, HKGAT, HN-DKG, HGKR, CKE.

Dari [[Referensi-Utama]], yang sudah terverifikasi Q1:
- Li et al. (2022, *ACM TOIS*) — Preference-aware GAT with Collaborative KG
- Elahi et al. (2024, *ACM TIST*) — KGCAN
- Yang et al. (2025, *IEEE TKDE*) — CoreSense (KG + CRS, menangkap emotional states)

---

Terkait: [[Conversational Recommender System]] · [[Kondisi A Feature-based]] · [[Kondisi B Narrative-based]] · [[Kondisi C Comparative-based]]
