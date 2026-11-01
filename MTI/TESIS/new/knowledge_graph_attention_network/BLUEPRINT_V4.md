# BLUEPRINT V4 — Aromatique
## Wheel-Grounded Transport untuk Explainable Fragrance Recommendation

**Versi 4.1 — Fondasi Penelitian Tesis S2 (Post Data-Audit & Wheel-Mapping Audit)**
**Status:** Fondasi ilmiah dikunci. Implementasi code ditunda hingga blueprint disetujui.

---

## 0. Ringkasan Eksekutif (untuk pembimbing & penguji)

Penelitian Tesis S2 ini mengusulkan **satu** kontribusi inti: jarak rekomendasi parfum dihitung sebagai **Optimal Transport antar distribusi accord**, di mana **ground metric-nya bukan cosine/Euclidean melainkan jarak pada pohon Edwards Fragrance Wheel** — taksonomi perseptual eksternal yang sudah divalidasi empiris oleh Zarzo (Cosmetics, 2020). Mesin menghasilkan **Top-3 produk** dan **`kg_paths` JSON** yang dipakai layer XAI kolaborator.

Klaim kebaruan dikalibrasi level S2: **applied/moderate**, bukan "new paradigm". Kekuatan utamanya bukan kompleksitas algoritma, melainkan **desain evaluasi non-sirkular**: sumber metric, sumber distribusi, dan sumber label berasal dari tiga asal yang independen.

---

## 1. Dua Hal yang Harus Dipisahkan Sejak Awal

Bagian ini dibuat eksplisit karena sering tertukar. Ada **mesin yang sama**, dipakai dalam dua konteks:

| | **A. SISTEM (yang dipakai user)** | **B. EVALUASI (untuk pembuktian ilmiah Tesis)** |
|---|---|---|
| Sumber query | Teks bebas user ("mau yang segar, citrus, siang hari") | Parfum global dari `global_reference.xlsx` |
| Pool kandidat | **Seluruh 340 produk** (dupe + original Aromatique) | Seluruh 340 produk (dupe + original sebagai distraktor) |
| Output | Top-3 + `kg_paths` | Top-3 + `kg_paths` |
| Kunci jawaban? | **Tidak ada** (deploy nyata) | **Ada**: edge `inspired_by` yang di-hold-out |
| Tujuan | Melayani rekomendasi | Mengukur kualitas mesin secara terukur |

**Mesin penilainya identik.** Yang berbeda hanya: dari mana query datang, dan apakah tersedia kunci jawaban untuk dinilai. Analogi: mesin pencari melayani query bebas, tetapi *diukur* memakai dataset berlabel (query → dokumen benar). Recommender ini sama.

> **Mengapa pakai uji dupe?** Dataset Aromatique **tidak punya** rating/interaksi/data "user suka apa". Satu-satunya kunci jawaban yang tersedia untuk pengukuran ilmiah = link dupe `inspired_by`. Maka *dupe retrieval* dipilih sebagai **harness evaluasi**, bukan sebagai produk akhir.

**Keterbatasan proxy (wajib ditulis):** uji dupe membuktikan "mesin menemukan produk yang **perseptual-cocok**", bukan "user **suka**". Itu batas validitas proxy yang diakui terbuka.

---

## 2. Masalah & Posisi Ilmiah

### 2.1 Aplikasi
Free-text fragrance recommender: input preferensi bebas → Top-3 produk Aromatique (termasuk produk original, bukan hanya dupe) + `kg_paths` untuk penjelasan.

### 2.2 Tugas evaluasi
Cross-reference dupe retrieval (leave-one-out): query = parfum global; jawaban benar = produk Aromatique yang `revolutionize`-nya menunjuk parfum itu.

> **Koreksi atas V3:** tidak ada user/rating/sesi/interaksi di dataset. Seluruh bahasa "user preference distribution / personalized" dari V3 dibuang. Objek perbandingan adalah **query-fragrance ↔ item-fragrance**, bukan user ↔ item.

### 2.3 Kesenjangan yang ditembak
*(Grounded pada 6 ringkasan Scopus AI yang disediakan — sumber SEKUNDER, harus dikonfirmasi ke paper primer; lihat §12.)*
- Literatur OT bergeser dari "optimasi transport" ke **ground-metric / geometry learning** → ground metric ber-makna adalah front aktif, tapi bukan klaim "pertama".
- KG-guided geometry untuk OT disebut *sedang muncul* → ruang kontribusi aplikatif domain fragrance.
- Literatur fragrance menandai **perceptual probability distributions** sebagai arah menjanjikan yang belum tervalidasi lintas-dataset.
- Literatur KG-recommendation: **KG saja tidak cukup** untuk perceptual similarity → membenarkan penambahan struktur perseptual eksternal (wheel) di atas KG.

### 2.4 Yang TIDAK diklaim
Bukan algoritma rekomendasi baru. Bukan mengalahkan LightGCN/KGAT/KGIN (butuh interaksi user-item — tak tersedia). Bukan kontribusi teoretis OT.

---

## 3. Fondasi Empiris (terverifikasi langsung dari file dataset)

| Properti | Nilai terverifikasi |
|---|---|
| Produk Aromatique (`datasetaromatique.xlsx`) | 340 |
| Produk dengan link `revolutionize` (label) | 243 (`COMPLETE`); 97 `NO_REVOLUTIONIZE` |
| Entitas global (`global_reference.xlsx`) | 266 bernama |
| Family lokal (`olfactory_family`) | 17 |
| Family global (`global_family`) | 49 |
| Kosakata accord lokal | 110 unik |
| Kosakata accord global | 63 unik |
| **Accord shared lokal∩global** | **56** |
| Cakupan accord ke Edwards Wheel | **57/57 (100%)** setelah leksikon dibekukan |

Kolom yang dipakai: lokal → `product_name, main_accords, olfactory_family, revolutionize, meaning`; global → `interpreted_as, global_family, accord_1..accord_10`.

---

## 4. Definisi Formal: Semantic Perceptual Distribution (SPD)

> Menjawab kritik pembimbing pada V3: SPD harus jadi **objek matematis**, bukan "probabilitas di atas embedding".

**Base space.** `T = (V, E, w)` = pohon Edwards Fragrance Wheel:
- Root `r` → 4 super-family `{Fresh, Floral, Amber, Woody}` → 12 sub-family → 57 accord sebagai daun.
- `w` = bobot edge (default: accord↔subfamily = 1, subfamily↔superfamily = 2, superfamily↔root = 3).
- `d_T(a,b)` = jarak shortest-path berbobot pada `T` (metrik sah pada himpunan daun Ω).

**SPD sebuah fragrance `f`.** Ukuran probabilitas pada ruang metrik `(Ω, d_T)`:

```
μ_f = Σ_{a ∈ A(f)} m_a · δ_a ,    Σ m_a = 1
```

- `A(f)` = accord fragrance `f` yang ter-map ke Ω.
- **v1 (default):** `m_a = 1/|A(f)|` (uniform).
- **Ablation:** `m_a ∝ IDF(a)` (hub-discriminative; menalti accord ber-degree tinggi seperti `woody/citrus`).

**Perbandingan.** Jarak = 1-Wasserstein atas `(Ω, d_T)`:

```
W₁(μ_q, μ_p) = min_{π ∈ Π(μ_q,μ_p)} Σ_{a,b} π(a,b) · d_T(a,b)
```

Karena `T` pohon, `W₁` punya **bentuk closed-form** (tree-Wasserstein):

```
W₁(μ_q, μ_p) = Σ_{e ∈ E} w_e · | μ_q(↓e) − μ_p(↓e) |
```

`μ(↓e)` = total massa di subtree di bawah edge `e`. **Tanpa Sinkhorn, tanpa GPU, tanpa tuning, eksak.**

**Mengapa OT, bukan cosine?** Query & item hidup di 56 accord yang sama. Cost identitas → OT ≈ cosine (tak ada novelty). Cost `d_T` membuat massa **berpindah lintas-cabang dengan biaya rendah** bila perseptual-dekat (mis. `patchouli`→`vetiver` murah karena satu sub-family *Mossy Woods*). **Inilah hipotesis yang diuji.**

---

## 5. Ground Metric: Konstruksi & Audit Pemetaan Accord→Wheel

**Sumber eksternal:** Edwards Fragrance Wheel, divalidasi empiris oleh Zarzo (Cosmetics, 2020, ada di project). Penempatan kunci dari paper: `patchouli`→*Mossy Woods*; `powdery`→kategori oriental/soft; `aromatic-fougère` = lavender+oakmoss; "spicy" di antara warm-spicy dan fresh-spicy.

**Leksikon yang dibekukan (frozen sebelum evaluasi — TIDAK di-tuning ke test):**

| Super-family | Sub-family | Accord |
|---|---|---|
| Fresh | Citrus | citrus, sour |
| Fresh | Green | green, herbal, conifer, bitter |
| Fresh | Aromatic | aromatic, fresh, fresh spicy, lavender |
| Fresh | Water | aquatic, marine, ozonic, metallic, salty |
| Fresh | Fruity | fruity, cherry, tropical |
| Floral | Floral | floral, white floral, rose, tuberose, yellow floral |
| Floral | Soft Floral | aldehydic, iris, powdery, violet, lactonic |
| Amber | Amber | amber, warm spicy, cinnamon, cannabis, soft spicy |
| Amber | Soft Amber | vanilla, sweet, balsamic, honey, caramel, almond, coconut, nutty, cacao, chocolate, coffee, musky, rum, vodka, whiskey |
| Woody | Woods | woody, oud |
| Woody | Mossy Woods | patchouli, mossy, earthy |
| Woody | Dry Woods | leather, animalic, smoky, tobacco |

**Decision log (keputusan judgment yang dipertahankan di defense):**
- `rum/vodka/whiskey` → Soft Amber (boozy-sweet-warm); `smoky/tobacco` → Dry Woods.
- `musky` → Soft Amber (bukan Woody) — pilihan; sensitivitas dicek.
- `soft spicy` → Amber (default ke warm); `salty/metallic` → Water.
- Accord di luar 56 shared → di-map ke wheel bila jelas, selain itu **di-drop & dicatat** (tanpa fabrikasi).

**Refinement opsional (bukan v1):** adjacency siklik wheel (sub-family bertetangga pada lingkaran). Ditunda; v1 pohon murni.

---

## 6. Pipeline (query → Top-3 → kg_paths)

1. **Bangun KG + wheel-tree** dari dataset + leksikon §5. Node bertipe: `Product, Accord, LocalFamily, GlobalFamily, WheelSubfamily, WheelSuperfamily, GlobalRef`. Relasi: `HAS_ACCORD, IN_FAMILY, ACCORD_IN_SUBFAMILY, INSPIRED_BY` (label, di-hold-out).
2. **Query grounding.** Teks bebas / perfume global → `μ_q` dari accord yang ter-map ke Ω.
3. **Item distribusi.** Tiap produk → `μ_p` dari `main_accords`.
4. **Skor.** `score(q,p) = − W₁(μ_q, μ_p)`. Ranking 340 produk → **Top-3**.
5. **Penjelasan.** Dari closed-form tree-Wasserstein, ekstrak edge ber-flow → `kg_paths`.

---

## 7. Skema `kg_paths` JSON (kontrak untuk layer XAI)

```json
{
  "query": {
    "name": "Bad Boy Extreme By Carolina Herrera",
    "global_family": "Amber Spicy",
    "spd": {"warm spicy": 0.25, "amber": 0.25, "cacao": 0.25, "woody": 0.25}
  },
  "recommendations": [
    {
      "rank": 1,
      "product_name": "Berrylicious",
      "local_family": "AMBER",
      "transport_distance": 0.31,
      "score": 0.69,
      "kg_paths": [
        {"from_accord": "amber", "to_accord": "amber", "mass": 0.25,
         "ground_cost": 0.0, "wheel_path": ["amber", "Amber", "Amber"],
         "relation": "exact_accord_match"},
        {"from_accord": "warm spicy", "to_accord": "cacao", "mass": 0.18,
         "ground_cost": 0.4, "wheel_path": ["warm spicy", "Amber", "Soft Amber", "cacao"],
         "relation": "same_super_family"}
      ]
    }
  ],
  "meta": {"metric": "tree_wasserstein_edwards_wheel", "weighting": "uniform", "version": "v4"}
}
```

Tiap path: `from_accord → (jalur wheel) → to_accord`, dengan `mass`, `ground_cost`, dan `relation` bertipe (`exact_accord_match | same_subfamily | same_super_family | cross_family`). Auditable, simbolik, dan **otomatis konsisten dengan skor** (karena diturunkan dari plan yang sama yang menghasilkan jarak).

---

## 8. Protokol Evaluasi (non-sirkular)

**Firewall non-sirkularitas (jantung Tesis):**

| Komponen | Sumber | Independen dari |
|---|---|---|
| Distribusi item `μ_p` | accord katalog lokal | label |
| Ground metric `d_T` | Edwards Wheel eksternal (Zarzo 2020) | katalog & label |
| Label (ground truth) | edge `inspired_by` | accord-similarity |

Tiga sumber independen → kemenangan metode tidak bisa jadi artefak konstruksi label (kegagalan eksperimen 1–3 tidak terulang).

**Desain:** leave-one-out retrieval. 243 query berlabel; 97 produk tanpa label tetap di pool sebagai distraktor.

**Metrik:** Hits@1, Hits@3, MRR.

**Baseline (semua feasible):**
1. Jaccard atas himpunan accord
2. Cosine atas histogram accord
3. Sentence-BERT atas teks (`meaning` + `interpreted_as`)
4. **Plain Wasserstein cost-identitas** (ablation kunci: mematikan kontribusi wheel)
5. **Wheel-Wasserstein (proposed)**
6. Wheel-Wasserstein + IDF weighting (ablation)

**Uji hipotesis utama:** #4 vs #5. Jika `d_T` mengungguli cost-identitas → kontribusi wheel terbukti, non-sirkular.

**Statistik:**
- Metode v1 **deterministik** → "five-seed Wilcoxon" tidak valid (tak ada variansi antar-seed).
- Gunakan **Wilcoxon signed-rank berpasangan antar-QUERY** atas reciprocal rank (proposed vs tiap baseline). Pairing di query, bukan seed.
- Tambahkan **bootstrap CI atas query** (mis. 10.000 resample) untuk MRR/Hits@k.
- Untuk ablation IDF (jika melibatkan pelatihan/stokastisitas), barulah multi-seed sah.

---

## 9. Research Questions & Hipotesis (final)

**RQ1 (UTAMA) — Kualitas rekomendasi.**
Apakah ground metric berbasis Edwards Wheel mengungguli baseline metric-agnostik untuk menemukan produk yang perseptual-cocok (diukur via proxy dupe retrieval)?
→ **H1:** Wheel-W₁ > identity-W₁ dan > cosine pada MRR/Hits@k (Wilcoxon antar-query, p<0.05).

**RQ2 (UTAMA) — Kontribusi komponen (ablation).**
Komponen mana yang memberi peningkatan: struktur wheel, dan/atau IDF hub-discriminative weighting?
→ **H2a:** wheel-cost > identity-cost. **H2b:** IDF-weighting ≥ uniform.

**RQ3 (NON-UTAMA / pelengkap) — Kualitas penjelasan.**
Apakah `kg_paths` yang dihasilkan setia terhadap skor model?
→ **H3:** kontribusi accord yang diklaim plan berkorelasi dengan kontribusi marginal sejati (counterfactual accord ablation: buang accord paling dikreditkan plan, hitung ulang jarak, ukur perubahan rank).
→ **Catatan scope:** RQ3 BUKAN fokus Tesis. Tugas Tesis = **menghasilkan** `kg_paths` yang benar & konsisten. Validasi mendalam "lebih baik dari SHAP/attention" diserahkan ke kolaborator layer XAI. RQ3 dilaporkan ringan (satu metrik faithfulness, tanpa user study) bila waktu memungkinkan.

---

## 10. Limitasi (ditulis duluan, sebelum penguji menyerang)

1. **Bobot accord uniform** → produk dengan set accord identik tak terbedakan; intensitas tak ada di data. IDF-ablation memitigasi sebagian.
2. **Leksikon accord→wheel manual** → titik metodologis paling rapuh; dibekukan & didokumentasikan, tidak di-tuning ke test. Lakukan **sensitivity analysis** (acak ulang 5–10% mapping ambigu, lihat stabilitas hasil).
3. **N kecil (243 query, 1 relevant/query)** → power terbatas; laporkan CI, jangan overclaim.
4. **Validitas proxy** → uji dupe ≠ kepuasan user (lihat §1).
5. **Wheel = pohon, bukan lingkaran** di v1 → kehilangan kontinuitas siklik; refinement §5 ditunda.
6. **Generalisasi** terbatas: satu katalog proprietary, satu domain. Klaim = "metode", bukan "paradigm".

---

## 11. Yang dibuang dari V3
- Bahasa "user preference / personalized / new paradigm / multimodal".
- Data sources fiktif: `Chemical Features, User Reviews, Brand Information`.
- Baseline infeasible: Morgan Fingerprint, POM (tak ada molekul); LightGCN, KGAT, KGIN, ItemKNN, Graphormer-rec (tak ada interaksi).
- "Ground metric learned from KG" tanpa sumber supervisi (pintu sirkularitas).

---

## 12. Catatan Provenance & Verifikasi
- Fakta data (§3) & pemetaan wheel (§5) → **terverifikasi langsung** dari file. [High confidence]
- Edwards Wheel valid secara ilmiah → paper Zarzo (Cosmetics 2020) **dibaca langsung** dari project. [High confidence]
- Klaim tren literatur (§2.3) → dari **6 ringkasan Scopus AI** yang diunggah (sumber SEKUNDER, AI-generated). [Medium confidence] → **wajib dikonfirmasi ke paper primer sebelum sidang.**

---

## 13. Yang ditunda ke fase implementasi
1. `build_kg.py` — KG + wheel-tree dari kedua xlsx + leksikon §5.
2. `score.py` — tree-Wasserstein, ranking Top-3, ekspor `kg_paths.json`.
3. `evaluate.py` — leave-one-out, 6 baseline, Wilcoxon antar-query + bootstrap CI.
4. `sensitivity.py` — stabilitas terhadap leksikon ambigu.

**Keputusan yang sudah dikunci:** bobot accord = **uniform** untuk v1 (IDF sebagai ablation); RQ3 = non-utama.

---

*Fondasi dibangun dari verifikasi langsung kedua file dataset dan paper Zarzo (Cosmetics 2020). Angka pada §3 dan §5 terverifikasi, bukan asumsi.*
