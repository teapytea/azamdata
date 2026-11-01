# Blueprint Penelitian Tesis (S2 — Magister Teknologi Informasi)

## Perceptual Optimal Transport untuk Sistem Rekomendasi Parfum Interaction-Free dengan Penjelasan Berbasis Knowledge Graph

> **Status dokumen:** draft kerja untuk diskusi pembimbing.
> **Catatan kejujuran metodologis:** klaim "belum ada" dalam dokumen ini bersifat *surveyed* (berdasarkan korpus 29 paper + Scopus AI ±7 sapuan), **bukan** systematic review exhaustive. Gunakan frasa *"to the best of our knowledge"* di tesis, jangan *"pertama di dunia"*.
> **Label keyakinan:** [High] = terverifikasi langsung dari teks paper/data; [Medium] = inferensi kuat; [Low/verify] = perlu verifikasi lanjutan.

---

## 1. Ringkasan Eksekutif (1 paragraf)

Penelitian ini membangun sistem rekomendasi parfum untuk brand lokal Indonesia (Aromatique) yang beroperasi **fully interaction-free** (tanpa user, sesi, rating, maupun klik). User mengetikkan preferensi bebas (free-text, ID/EN) ke sebuah chatbot; sistem mengembalikan **`{top3_products, kg_paths}`** dalam format JSON yang dikonsumsi oleh modul XAI mitra (Raissa). Kontribusi inti **bukan** algoritma optimal transport itu sendiri (sudah ada sejak Word Mover's Distance, Kusner 2015), melainkan **ground metric perseptual** — sebuah matriks jarak antar-accord yang diturunkan dari *diffusion-geometry* di atas knowledge graph olfaktori lintas-kosakata, yang di-*ground* ke *sensory wheel* terstandar (Zarzo/Edwards) — sehingga sistem dapat menangkap fenomena domain "**dupe itu baunya searah, bukan accord-nya identik**", yang tidak dapat ditangkap oleh metode pencocokan token (Jaccard/cosine) maupun embedding generik.

---

## 2. Latar Belakang & Motivasi

### 2.1 Kondisi data (fakta keras)
Dataset Aromatique memiliki karakteristik yang **mematahkan mayoritas literatur recommender system**:
- **340 produk**, **0 user, 0 interaksi** (tidak ada rating/klik/purchase log).
- Setiap produk dirancang sendiri oleh Aromatique. Sebagian **men-*dupe*** parfum global (243/340 memiliki field `revolutionize`), sebagian **original** tanpa inspirasi (97/340 = `NO_REVOLUTIONIZE`).
- "Dupe" berarti **arah bau searah**, *bukan* accord/notes identik. Ini pernyataan **geometris**, bukan sekadar catatan.

### 2.2 Mengapa ini masalah riset, bukan sekadar pindah domain
Seluruh keluarga method recommender di korpus rujukan **mengandaikan user-item interaction sebagai sinyal supervisi**. Tidak ada satu pun yang dirancang untuk katalog ber-knowledge-graph tetapi nol interaksi, di mana satu-satunya supervisi adalah cross-reference katalog terkurasi. Persyaratan tesis (purposeful novelty, bukan pindah domain, harus fragrance, harus mengalahkan baseline) justru memaksa reformulasi tugas yang genuin.

---

## 3. Rumusan Masalah

1. Bagaimana merepresentasikan dan menyelaraskan dua kosakata olfaktori yang divergen (accord lokal Aromatique yang *noisy* vs accord global Fragrantica yang bersih) dalam satu knowledge graph, tanpa data interaksi?
2. Bagaimana mengukur kemiripan parfum–preferensi yang menangkap "**searah bau, bukan cocok-token**", mengingat hub-domination dan granularity-mismatch taksonomi?
3. Bagaimana mengevaluasi sistem rekomendasi tanpa user secara **non-circular** (label tidak boleh berasal dari sinyal yang sama dengan mekanisme model)?
4. Bagaimana menghasilkan penjelasan **auditable** (`kg_paths`) yang faithful terhadap mekanisme skoring, untuk modul XAI?

---

## 4. Research Gap (4 lapis, tertambat pernyataan penulis)

Setiap lapis di bawah diturunkan dari limitation/future-work yang **ditulis penulis lain sendiri** (diparafrase), bukan asumsi.

### Lapis 1 — Interaction-dependency gap [High]
Seluruh recommender korpus menjadikan user-item interaction sebagai supervisi wajib:
- **KGAT, RippleNet, KGCN, CKE, BPR-KG, entity2rec, entity2item, HKGAT, HGKR, HN-DKG, multi-level contrastive** → semua butuh interaksi.
- **KR-GCN, TMER** (path-explainable) → tetap "historical interaction items" / "dynamic user-item evolutions".
- **DC2R, CIKGE, DKTCDR, Adaptive Anchor Link** (zero-shot/cross-domain) → zero hanya *parsial* (item/domain baru, tetapi sesi/source tetap berinteraksi).
- **RecPrompt, PromptRec** (LLM) → "clicked ground truth" / synthetic interactions.
- **FGN (Redefining Entity Integration)** membuktikan secara teoretis bahwa Collaborative KG (struktur yang dipakai KGAT) gagal memenuhi *Local Consistency* + *Inclusion of Indispensable Entities* sekaligus → fondasi keluarga KGAT cacat by design.
- **MOOCCube** menyatakan eksplisit: model canggih tak bisa dilatih di dataset kecil → memvalidasi pilihan method ringan.

→ **Nol** yang beroperasi *fully interaction-free*.

### Lapis 2 — Evaluation/circularity gap [High korpus / Medium luas]
- **CKE** mengakui implicit feedback tak berarti user benar-benar menyukai item (label interaksi *noisy*).
- Pesaing fragrance **tidak** mengevaluasi sebagai ranking terhadap relevance GT: **Lily** memakai BERTScore/cosine (kemiripan teks ke reference); **BINUS** memakai survei usability.
- Belum ada yang merumuskan protokol evaluasi *leakage-controlled* berbasis cross-reference katalog terkurasi.

### Lapis 3 — Cross-vocabulary olfactory bridge gap [Medium]
- Literatur *sensory science* (**Zarzo dkk.**) menyusun *sensory wheel* + dimensi PCA, tetapi **untuk klasifikasi sensorik, bukan recommendation/retrieval**, dan menyatakan: belum ada klasifikasi odor yang diterima luas; ruang odor adalah *kontinum*, bukan cluster diskret.
- Literatur KG-rec tak pernah merekonsiliasi dua kosakata domain divergen (vendor lokal ↔ Fragrantica).
- **BINUS** secara eksplisit menyebut keterbatasan input Indonesia vs notes Inggris (split kosakata) → masalah ini ditulis pesaing sendiri.

→ Jembatan *sensory-science ↔ KG-recommendation* belum ada.

### Lapis 4 — Structured-explanation-in-zero-interaction gap [Medium]
- Path KG auditable ada (**KR-GCN, TMER**) tetapi terikat interaksi.
- CRS fragrance (**Lily**) menghasilkan penjelasan **generatif opaque** (LLM), bukan path terstruktur.

→ Belum ada sistem fragrance interaction-free yang mengeluarkan structured KG-path sebagai kontrak XAI.

---

## 5. Research Questions

- **RQ1.** Dapatkah retrieval parfum berbasis perceptual optimal transport beroperasi *fully interaction-free* dan mengungguli baseline content-similarity pada ground truth cross-reference katalog (`inspired_by`)?
- **RQ2.** Apakah ground metric perseptual yang di-*ground* ke sensory wheel terstandar memperbaiki akurasi retrieval dibanding metric naif — meski wheel itu sendiri bersifat *fuzzy/kontinum*?
- **RQ3.** Apakah pembobotan IDF (hub-discriminative) + normalisasi anisotropik memperbaiki ranking dibanding agregasi seragam?
- **RQ4.** Apakah protokol *leakage-controlled* (membuang edge `inspired_by` dari graph latih) tetap menghasilkan ranking di atas chance — membuktikan sinyal *non-circular*?

---

## 6. Hipotesis (falsifiable)

| ID | Hipotesis | Falsifikasi | Menguji |
|----|-----------|-------------|---------|
| **H1** | Perceptual-OT > content-cosine/Jaccard pada held-out `inspired_by`, signifikan (Wilcoxon) | Δ tak signifikan | RQ1 |
| **H2** | Ground metric perseptual (M) > metric naif/identity pada Hit@3/MRR (ablation M on/off) | Δ ≈ 0 atau turun → fuzziness wheel menelan manfaat | RQ2 |
| **H3** | IDF + anisotropik (α=1) > bobot seragam pada MRR | Tak signifikan | RQ3 |
| **H4** *(inti)* | Saat `inspired_by` di-hold-out, performa **tidak runtuh ke chance** | Runtuh ≈ random → seluruh klaim non-circular gugur | RQ4 |
| **H5** *(opsional)* | Transport-plan path lebih *faithful/auditable* dibanding teks LLM (Lily-style) | Tak ada beda pada metrik faithfulness/human-eval | — |

> **H4 adalah taruhan ilmiah inti.** Jika gagal, itu *bagus secara metodologis* (hipotesis yang benar-benar bisa salah) dan menunjukkan masalah circularity — bukan kegagalan eksekusi.

---

## 7. Tujuan & Kontribusi (Novelty — terkunci & jujur)

### 7.1 Posisi terhadap prior-art (hasil verifikasi Scopus)
- **OT untuk kemiripan = BUKAN baru** → Word Mover's Distance (Kusner dkk. 2015, ICML). **Wajib disitasi sebagai prior terdekat.**
- **OT + recommendation** → ada (generik), tetapi tanpa ground metric perseptual.
- **OT + knowledge graph** → ada, tetapi untuk *entity alignment* (FGW, SWGCL, SLOTAlign), **bukan** query→item retrieval.
- **OT + odor/fragrance/perfume** → **kosong** (terkonfirmasi eksplisit oleh Scopus AI). ← whitespace utama.

### 7.2 Kalimat positioning (untuk sidang)
> "Metode kami adalah Word Mover's Distance yang digeneralisasi dari dokumen ke parfum, dengan **mengganti ground metric word-embedding generik menjadi jarak perseptual olfaktori turunan diffusion-geometry + sensory wheel**, beroperasi *fully interaction-free*, dan transport plan-nya berfungsi sebagai penjelasan *auditable*."

### 7.3 Pillar kontribusi (berperingkat)
1. **Ground metric perseptual M** (diffusion-map di KG olfaktori lintas-kosakata + grounding sensory wheel Zarzo). **Objek paling novel.** WMD memakai ground cost word2vec generik; kami memakai ground cost yang mengkodekan persepsi bau. — *menjawab Lapis 3, dan future-work entity2rec (keragaman properti) + KG-incomplete multi-contrastive.*
2. **Rezim operasi fully interaction-free** untuk fragrance recommender. — *menjawab Lapis 1 + skala-kecil MOOCCube.*
3. **Protokol evaluasi non-circular / leakage-controlled** berbasis cross-reference katalog (`inspired_by`). — *menjawab Lapis 2 (label-noise CKE; absennya ranking-eval Lily/BINUS).*
4. **Kontrak output `{top3, kg_paths}` auditable** di nol-interaksi, dengan path = jejak transport plan (faithful by construction). — *menjawab Lapis 4.*

> **Peringatan kritis:** M kini *double load-bearing* — ia mekanisme **sekaligus** novelty. Jika M lemah/arbitrer, tesis runtuh menjadi "WMD ditempel ke parfum". Karena itu konstruksi + validasi M **wajib** menjadi bab tersendiri dan diuji ablation (lihat §11, §13).

---

## 8. Batasan (Scope) & Asumsi

- Hanya domain fragrance Aromatique (340 produk) + global reference Fragrantica (241 entitas).
- Single-shot (satu query → top-3), **bukan** dialog multi-turn negosiasi preferensi (membedakan dari Conversational CBR yang butuh feedback loop).
- Ground truth retrieval = **`inspired_by`** (klaim kurasi brand) — diakui sebagai *proxy*, bukan relevansi tervalidasi user.
- Tidak menggunakan LLM sebagai mesin inti (hanya opsional sebagai ablation grounding), demi kontras dengan Lily + reproducibility + auditability.
- Sensory wheel diakui *fuzzy/kontinum* (pernyataan Zarzo) → grounding adalah *lapisan referensi bersama yang prinsipil*, bukan klaim taksonomi sempurna.

---

## 9. Dataset

### 9.1 Aromatique (340 produk)
| Kolom | Keterangan |
|-------|-----------|
| `product_name` | primary key |
| `revolutionize` | nama parfum global inspirasi (243 terisi, 97 kosong) |
| `main_accords` | accord utama, dipisah koma (selalu terisi, **noisy**) |
| `visual_note` / `visual_note_alt` | `[Family] / [Note]` |
| `olfactory_family` | di-derive dari `visual_note` (17 kelas) |
| `meaning` | deskripsi Bahasa Indonesia |
| `data_quality` | COMPLETE / NO_REVOLUTIONIZE / MISSING_ACCORDS |

### 9.2 Global Reference (241 entitas Fragrantica)
| Kolom | Keterangan |
|-------|-----------|
| `Revolutionize` | nama global sebagaimana di Aromatique |
| `interpreted_as` | nama terstandar (ejaan Fragrantica) |
| `main_accord` | accord Fragrantica, dipisah `;` (bersih) |
| `global_family` | olfactory family Fragrantica (49 kelas) |

### 9.3 Profil kuantitatif (terverifikasi dari data) [High]
- 243 produk memiliki `revolutionize`; **211 (87%) berhasil dicocokkan** ke global reference → **211 pasangan berlabel** untuk evaluasi.
- **Hanya 2 global ref menginspirasi ≥2 produk lokal** (total 4 produk) → ground truth item-item praktis **nol** → retrieval lokal↔global adalah satu-satunya sinyal evaluasi yang layak & non-circular.
- **Hub accords** (dari 340): woody 151, citrus 139, fruity 110, sweet 104, aromatic 93, floral 87, powdery 82, fresh spicy 78 → hub-domination berat.
- **51 accord** muncul hanya 1× → long tail.
- Taksonomi: lokal **17 family** vs global **49 family** → granularity mismatch.
- Noise accord lokal (contoh): `vanila`, `freahspicy`, `coffe`, `wam spicy`, `baae:`, `haert:` → perlu normalisasi.

### 9.4 Pembagian peran data
- **Query berlabel (211)** = profil accord Fragrantica global ref → produk benar = dupe lokal-nya.
- **97 produk tanpa ref** = distractor candidates (tetap dapat direkomendasikan saat online, hanya tidak menjadi query berlabel).
- **`inspired_by` TIDAK masuk ke mesin** — hanya label evaluasi. Mesin digerakkan oleh preferensi user (`ν`), sehingga jalan untuk produk dupe **maupun** original.

---

## 10. Arsitektur Usulan — Perceptual Optimal Transport (4 Stage)

### Notasi
- `V` = kosakata accord gabungan (lokal+global, sudah dimerge & dinormalisasi), ukuran `n`.
- Tiap parfum & query = **distribusi** atas `V` (vektor panjang `n`, total massa = 1).
- `μ_p` = distribusi produk `p`; `ν_q` = distribusi query `q`.
- `M ∈ R^{n×n}` = ground metric perseptual antar-accord.

### Stage 0 — Konstruksi Knowledge Graph
**Node (typed):** `Product` (340) · `Accord` (dinormalisasi, merge lokal↔global by-normalized-name) · `LocalFamily` (17) · `GlobalFamily` (49) · `WheelCategory` (14, Edwards — **node jembatan**) · `GlobalRef` (241).

**Relasi (typed):**
- `Product –HAS_ACCORD→ Accord`
- `Product –IN_LOCALFAM→ LocalFamily`
- `Product –INSPIRED_BY→ GlobalRef` **(LABEL — di-hold-out, tidak dipakai mesin)**
- `GlobalRef –HAS_ACCORD→ Accord`
- `GlobalRef –IN_GLOBALFAM→ GlobalFamily`
- `{Accord, LocalFamily, GlobalFamily} –MAPS_TO_WHEEL→ WheelCategory` **(grounding Zarzo/Edwards)**

`WheelCategory` menyatukan dua kosakata secara geometris → menyelesaikan split ID/EN.

### Stage 1 — Query grounding (free-text → distribusi ν_q)
1. Normalisasi kosakata (perbaiki typo) + fuzzy/exact lexical match ke node `Accord`/`Family`.
2. Multilingual sentence-embedding **pretrained** (XLM-R / multilingual-SBERT, *no-training*) → cosine query↔label node terdekat. Menangani parafrase ID/EN.
3. Bobot konsep dengan IDF → normalisasi → `ν_q`.
4. *(opsional, ablation)* LLM-parse free-text → profil olfaktori terstruktur. **Bukan inti** (jaga kontras vs Lily).

### Stage 2 — Konstruksi Ground Metric M (JANTUNG + NOVELTY)

**(2a) Jarak difusi dari KG — Coifman & Lafon (2006):**
1. Afinitas accord `W[a,b]` = PPMI co-occurrence (frekuensi a,b bersama di produk, log-normalisasi) + bonus jika se-`WheelCategory`.
2. Normalisasi anisotropik α=1: `W̃ = D^{-1} W D^{-1}`, lalu `P = D̃^{-1} W̃`.
   - **Konsekuensi teori:** α=1 menghasilkan geometri Laplace–Beltrami yang **bebas densitas** → hub padat (woody) otomatis tidak mendominasi metrik (hub-handling tingkat-metrik, dari teori, bukan heuristik).
3. Eigendecomposition `P`: `1 = λ₀ ≥ λ₁ ≥ …`, eigenvector `φ`. Buang `φ₀` (konstan).
4. Diffusion map waktu `t`, dimensi `k`: `Ψ_t(a) = (λ₁ᵗ φ₁(a), …, λ_kᵗ φ_k(a))`.
5. `M_diff[a,b] = ‖Ψ_t(a) − Ψ_t(b)‖₂` (jarak difusi).

**(2b) Jarak koordinat wheel — Zarzo/Edwards:**
- `z(a)` = koordinat accord `a` pada sumbu PCA Zarzo / sudut Edwards wheel.
- `M_wheel[a,b] = ‖z(a) − z(b)‖`.

**(2c) Gabung:** normalisasi tiap ke [0,1] → `M = λ · M_diff + (1−λ) · M_wheel`. `λ` di-ablation.

**(2d) VALIDASI M (wajib — anti garbage-in-garbage-out):**
- **Mantel/Spearman** korelasi `M_diff` vs `M_wheel` → korelasi positif signifikan = dua sumber independen sepakat = M tepercaya.
- **Ablation `M = Identity`** → runtuh ke bag-of-accords/cosine → harus menjadi konfigurasi **terburuk** → bukti M membawa sinyal.
- Sanity kualitatif: pasangan yang Zarzo nyatakan berdekatan (woody–amber) → cek `M` kecil.

> M dihitung **offline sekali**.

### Stage 3 — Skoring via Entropic Optimal Transport (Sinkhorn — Cuturi 2013)
Bandingkan `ν_q` vs tiap `μ_p` di bawah `M`:
- `T[a,b]` = massa dipindah dari accord-query `a` → accord-produk `b` (transport plan).
- Kendala: `T·1 = ν_q`, `Tᵀ·1 = μ_p` (massa kekal).
- **Skor OT:** `W(ν_q, μ_p) = min_T Σ_{a,b} T[a,b]·M[a,b]`.
- **Regularisasi entropik (Sinkhorn):** `K = exp(−M/ε)`; iterasi `u ← ν/(Kv)`, `v ← μ/(Kᵀu)`; `T = diag(u) K diag(v)`. Cepat, differentiable, **no-training**, ringan di 340 produk.
- Ranking produk **ascending** (skor kecil = mirip) → **top-3**.

**Mengapa OT tepat (bukan kemewahan):** Wasserstein adalah metrik yang membandingkan distribusi atas ruang-metrik *sambil memberi kredit pada kedekatan ground antar titik support yang tak identik*. "Searah tapi beda komponen" = massa di support berbeda yang berdekatan di `M` → biaya rendah. Cosine/Jaccard memperlakukan accord berbeda sebagai ortogonal → secara struktural tak mampu menangkap fenomena ini.

### Stage 4 — Ekstraksi kg_paths dari transport plan T*
- Ambil pasangan `(a→b)` dengan `T*[a,b]` terbesar per produk top-3.
- Render sebagai KG-path: `query-accord a → MAPS_TO_WHEEL → wheel-cell → produk-accord b → Product`.
- `path_score = T*[a,b]` (atau `× (1 − M[a,b])`).
- **Faithful by construction**: path = jejak transport nyata (bukan post-hoc heuristik).

---

## 11. Kontrak Output `{top3, kg_paths}`

### Aturan kg_paths
1. Panjang path ≤ **3 hop** (≤4 node); lebih panjang dibuang (anti error-propagation, prinsip KR-GCN).
2. Per produk top-3: kembalikan ≤ **3 path**, diurut `path_score` menurun.
3. `path_score` konsisten (pilih satu definisi, dokumentasikan).
4. **Diversity**: hindari 3 path melewati node-antara identik; prioritaskan intermediate beragam (accord vs family vs wheel).
5. **Guarantee**: tiap produk top-3 wajib memiliki ≥1 path valid (edge benar-benar ada di KG). Jika tak ada path ≤3 hop → produk tidak boleh masuk top-3.
6. Setiap node `{id, type, label}`; setiap step memiliki `relation` typed.

### Skema JSON
```json
{
  "query": "wangi manis hangat untuk malam",
  "grounded_concepts": [
    {"id": "acc_sweet", "type": "Accord", "label": "sweet"}
  ],
  "top3": [
    {
      "rank": 1,
      "product": {"id": "p_023", "name": "Verve Vale"},
      "score": 0.142,
      "kg_paths": [
        {
          "path_score": 0.087,
          "steps": [
            {"node": {"id": "acc_sweet", "type": "Accord", "label": "sweet"}, "relation": "SEED"},
            {"node": {"id": "wheel_oriental", "type": "WheelCategory", "label": "Oriental"}, "relation": "MAPS_TO_WHEEL"},
            {"node": {"id": "p_023", "type": "Product", "label": "Verve Vale"}, "relation": "IN_WHEEL_VIA_FAMILY"}
          ]
        }
      ]
    }
  ]
}
```

---

## 12. Baseline & Model Komparasi

### 12.1 Baseline runnable (9) — semua interaction-free, ada library, sitasi terverifikasi
| # | Method | Sitasi | Famili | Library | Catatan adaptasi |
|---|--------|--------|--------|---------|------------------|
| B1 | Popularity / accord-freq prior | — (klasik) | heuristik | numpy | lower-bound |
| B2 | Jaccard | Jaccard 1901 / textbook IR | content | sklearn | bukan ke BINUS |
| B3 | TF-IDF + Cosine | Salton & Buckley 1988 *(verify)* | content | sklearn | — |
| B4 | BM25 | Robertson & Zaragoza 2009 | IR retrieval | rank_bm25 | query→product "doc" |
| B5 | TransE | Bordes dkk. 2013 (NIPS) | KGE translational | pykeen | retrieval = link prediction query→product |
| B6 | node2vec | Grover & Leskovec 2016 (KDD) | graph-walk embed | node2vec/karateclub | unsupervised; cosine |
| B7 | RotatE | Sun dkk. 2019 (ICLR) | KGE rotational | pykeen | retrieval = link prediction |
| B8 | CompGCN | Vashishth dkk. 2020 (ICLR) | KGE relation-GCN | pykeen/PyG | retrieval = link prediction |
| B9 | Multilingual SBERT / XLM-R | Reimers & Gurevych 2019 (EMNLP) / Conneau dkk. 2020 (ACL) | dense retrieval | sentence-transformers | encode teks produk vs query (ID+EN) |
| B10 | PPR / RWR (plain) | Haveliwala 2002 (WWW) / Tong dkk. 2006 (ICDM) | graph propagation | networkx | = ablation M1 |

> Tiap famili memiliki wakil **klasik + modern** → tahan kritik "baseline usang". **Wajib nyatakan eksplisit** bahwa tugas native KGE = link prediction; retrieval adalah adaptasi (preseden: entity2item).

### 12.2 Model usulan (ablation, untuk isolasi tiap pillar)
| Konfig | Deskripsi | Menguji |
|--------|-----------|---------|
| **M1** | PPR plain (= B10) | baseline propagasi |
| **M2** | + ground metric perseptual M (diffusion) | H2/RQ2 |
| **M3** | + IDF + anisotropik (α=1) | H3/RQ3 |
| **M4 (full)** | Perceptual-OT (Sinkhorn atas M) + ekstraksi path | H1/RQ1 |

### 12.3 Grup B — bernama, dilaporkan INAPPLICABLE (jangan fake-run)
KGAT, KGCN, RippleNet, CKE, BPR-KG, NFM, KR-GCN, TMER, HKGAT, HGKR, HN-DKG, DC2R, GSNIR, CORE, CIKGE, DKTCDR, RecPrompt → **butuh user-item interaction** → struktural inapplicable. Laporkan tabel "baselines not run, and why" (satu baris alasan tiap). *(Pembimbing tidak memaksa lineage KGAT → tidak perlu sub-bab crippled-KGAT.)*

### 12.4 Related work (bukan baseline kuantitatif)
- **Lily** (Telkom — LLM+RAG, Telegram, no source code, eval teks) → pembanding kualitatif; kontras "opaque generative vs auditable path".
- **BINUS** (cosine/Jaccard, survei) → related work; Jaccard generik tetap dipakai (B2) tanpa klaim mereplikasi sistem BINUS.
- **Word Mover's Distance** (Kusner 2015) → prior terdekat metodologis; **wajib dibahas**.
- **Wasserstein-KG alignment** (FGW, SWGCL, SLOTAlign) → OT di KG untuk *alignment*, beda tugas.

---

## 13. Protokol Evaluasi (Non-Circular)

### 13.1 Ground truth & task
- GT = **211 pasangan `inspired_by`** (lokal↔global).
- Task evaluasi: query = profil accord Fragrantica global ref → retrieve produk lokal yang benar. Kandidat = 340 (97 tanpa-ref sebagai distractor).
- **Anti-leakage**: edge `inspired_by` **dibuang dari training graph** pada tiap fold. Mekanisme (accord/family/wheel/diffusion) berasal dari sumber independen → memutus circularity. Karena query (Fragrantica) ≠ mekanisme (accord lokal + M), evaluasi non-circular.

### 13.2 Metrik & uji statistik
- **Hit@1, Hit@3, MRR, NDCG@3.**
- **5-fold × 5 seed.** Laporkan mean ± variance.
- **Wilcoxon signed-rank test** model-vs-baseline lintas fold/seed.

### 13.3 Evaluasi kedua — generalisasi free-text
- Human-eval set ~30–50 query bebas (ID/EN), relevansi top-3 dinilai oleh penilai (kamu + penjual parfum). Subjektif tetapi jujur; **wajib** untuk klaim "ketik apa saja". Dokumentasikan protokol penilaian + inter-rater bila memungkinkan.

### 13.4 Peta ablation → hipotesis
| Perbandingan | Menguji |
|--------------|---------|
| M4 vs B1–B10 | H1 / RQ1 |
| M2 vs M1 (M on/off; M_diff vs M_wheel vs gabung; M=Identity) | H2 / RQ2 |
| M3 vs M2 (IDF + α=1 vs seragam) | H3 / RQ3 |
| hold-out `inspired_by` vs full-graph | H4 / RQ4 |
| transport-path vs Lily-style text | H5 |

---

## 14. Risiko & Mitigasi (jujur)

| # | Risiko | Severity | Mitigasi |
|---|--------|----------|----------|
| R1 | **M lemah/arbitrer** → tesis runtuh jadi "WMD-on-perfume" | **Tinggi** [High] | M dari 2 sumber (diffusion + wheel) + validasi Mantel + ablation M=Identity; jadikan bab tersendiri |
| R2 | Pemetaan accord Fragrantica → koordinat Zarzo tidak bersih (Zarzo berbasis odor descriptor/raw material) | Sedang [Medium] | Andalkan M_diff (graph); wheel sebagai jangkar kasar + validator, bukan sumber tunggal; uji empiris |
| R3 | Error grounding (Stage 1) meng-cascade | Tinggi [High] | Laporkan akurasi grounding **terpisah** |
| R4 | Baseline kuat (RotatE/SBERT) mengalahkan M4 di Hit@3 | Sedang [Medium] | Fallback framing: "interpretable path retrieval kompetitif + auditable + interaction-free"; siapkan sejak awal |
| R5 | Margin kecil di 340 item, high-variance | Tinggi [High] | k-fold + multi-seed + Wilcoxon; **jangan over-claim** |
| R6 | GT `inspired_by` = proxy marketing | Sedang [Medium] | Akui di limitations; kontribusi pada *protokol*, bukan kesempurnaan label |
| R7 | Reviewer keras: "ini WMD ditempel" | Sedang [Medium] | Pertahanan 4 lapis: M perseptual tervalidasi + regime + XAI + eval non-circular |
| R8 | H4 gagal (performa runtuh saat hold-out) | — | Ini hasil ilmiah yang sah (membuktikan circularity); laporkan apa adanya |

---

## 15. Status Sitasi

### Terverifikasi (aman dipakai) [High]
- Sinkhorn: **Cuturi 2013**.
- Diffusion maps: **Coifman & Lafon 2006** (*Applied and Computational Harmonic Analysis*).
- Laplacian eigenmaps: **Belkin & Niyogi 2003**.
- WMD: **Kusner, Sun, Kolkin, Weinberger 2015** (ICML).
- TransE: **Bordes dkk. 2013** (NIPS). RotatE: **Sun dkk. 2019** (ICLR). CompGCN: **Vashishth dkk. 2020** (ICLR). node2vec: **Grover & Leskovec 2016** (KDD).
- SBERT: **Reimers & Gurevych 2019** (EMNLP). XLM-R: **Conneau dkk. 2020** (ACL).
- BM25: **Robertson & Zaragoza 2009**. PPR: **Haveliwala 2002** (WWW). RWR: **Tong, Faloutsos, Pan 2006** (ICDM).
- Korpus rujukan (29): KGAT, RippleNet, KGCN, CKE, BPR-KG, entity2rec, entity2item, HKGAT, HGKR, HN-DKG, multi-contrastive, FGN, CIKGE, DKTCDR, Beyond-Overlapping, MOOCCube, KR-GCN, TMER, DC2R, RecPrompt, Lily, BINUS, + sensory Zarzo (6).

### Perlu verifikasi [Medium/verify]
- TF-IDF: Salton & Buckley 1988 (atau sitasi textbook IR generik).
- Wasserstein-KG: FGW, SWGCL, SLOTAlign (judul/penulis exact).
- Prior-art OT-recommendation & OT-odor (untuk memperkuat klaim whitespace) — Scopus AI menyatakan OT-odor kosong, tetapi *surveyed*, bukan exhaustive.

---

## 16. Tools & Library
- KGE: `pykeen` (TransE, RotatE, CompGCN).
- Graph embed: `node2vec` / `karateclub`.
- Dense retrieval: `sentence-transformers` (multilingual-SBERT, XLM-R).
- IR: `rank_bm25`, `scikit-learn` (TF-IDF, Jaccard).
- Graph & propagation: `networkx` (PPR/RWR, traversal path).
- Optimal transport: `POT` (Python Optimal Transport — `ot.sinkhorn`).
- Diffusion/spectral: `numpy`/`scipy` (eigendecomposition).
- Statistik: `scipy.stats` (Wilcoxon), Mantel test (manual/`scikit-bio`).

---

## 17. Struktur Bab Tesis (usulan)

1. **Pendahuluan** — latar belakang, kondisi data, rumusan masalah, RQ, tujuan, kontribusi, batasan.
2. **Tinjauan Pustaka** — tabel posisi 4-sumbu (fragrance rec / explainable KG-path / zero-shot new-item / cross-vocab olfactory); pembahasan WMD sebagai prior terdekat; Grup B (inapplicable).
3. **Konstruksi Dataset & Knowledge Graph** — pembersihan, merge accord, KG typed, grounding wheel; profil kuantitatif; penanganan bug data. *(Pillar 1 sebagian)*
4. **Ground Metric Perseptual M** — diffusion-map (α=1), wheel grounding, penggabungan, **validasi M**. *(Pillar 1 inti — novelty)*
5. **Metode: Perceptual Optimal Transport** — grounding query, Sinkhorn OT, ekstraksi path, kontrak JSON.
6. **Desain Eksperimen** — baseline (9), ablation (M1–M4), protokol non-circular anti-leakage, metrik, uji statistik, human-eval.
7. **Hasil & Analisis** — H1–H5, ablation, sensitivitas hyperparameter, akurasi grounding terpisah.
8. **Integrasi XAI** — kontrak `{top3, kg_paths}`, contoh keluaran, faithfulness vs Lily-style.
9. **Kesimpulan & Limitations** — proxy GT, fuzziness wheel, skala data, ancaman validitas, future work.

---

## 18. Milestone (usulan urutan kerja)
1. Finalisasi konstruksi KG + normalisasi accord + grounding wheel (Bab 3).
2. **Bangun & validasi M** (Bab 4) — gate paling kritis; jika validasi gagal, revisi sebelum lanjut.
3. Implementasi Stage 1 (grounding) + ukur akurasinya.
4. Implementasi Stage 3–4 (Sinkhorn OT + path).
5. Implementasi 9 baseline via library.
6. Protokol eval non-circular (5-fold × 5-seed) + Wilcoxon; uji H4 lebih dulu (gate non-circularity).
7. Ablation M1–M4 (H1–H3).
8. Human-eval free-text (H1 generalisasi, H5).
9. Penulisan + integrasi modul XAI Raissa.

---

## 19. Hyperparameter untuk di-tune/ablation
`ε` (entropi Sinkhorn) · `t` (waktu difusi) · `λ` (campur M_diff/M_wheel) · `k` (dimensi diffusion map) · normalisasi α (anisotropik). Gunakan nested-CV + laporkan sensitivitas.

---

### Lampiran — Klaim novelty satu kalimat (untuk abstrak)
> "Kami memperkenalkan sistem rekomendasi parfum *fully interaction-free* yang menghitung kemiripan preferensi–produk sebagai *entropic optimal transport* di atas **ground metric perseptual olfaktori** turunan *diffusion-geometry* pada *knowledge graph* lintas-kosakata yang di-*ground* ke *sensory wheel* terstandar, dengan *transport plan* sebagai penjelasan *auditable* (`kg_paths`), dievaluasi melalui protokol *leakage-controlled* berbasis cross-reference katalog."
