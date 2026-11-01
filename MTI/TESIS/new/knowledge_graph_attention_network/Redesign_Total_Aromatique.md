# Redesign Total — Jika Saya yang Meneliti (Dataset Aromatique Dipertahankan)

> Prinsip: setiap kelemahan FATAL/SEVERE di review sebelumnya diubah menjadi keputusan desain. Saya tidak menambah sitasi yang belum saya lihat; nama metode eksternal saya beri tanda **[verify]** — Anda wajib cek judul/tahun aslinya, jangan sitasi dari ingatan. Label keyakinan: [High]/[Medium]/[Low/verify].

---

## 0. Ringkasan keputusan (TL;DR)

| Aspek | Blueprint lama | Redesign saya | Alasan |
|---|---|---|---|
| **Bingkai masalah** | Sistem rekomendasi parfum | **Cross-vocabulary olfactory retrieval** (= bilingual lexicon induction antar dua kosakata bau) | Lebih tepat secara struktural; punya literatur + solusi prinsipil yang sudah mapan. |
| **Bintang novelty** | Ground metric "perseptual" (diffusion) | **(a) Benchmark + protokol leakage-controlled, (b) diagnosis kapan geometri membantu, (c) adaptasi alignment-OT (Gromov-Wasserstein) ke domain bau** | Tiga kontribusi yang masing-masing bisa dipertahankan; tak bergantung pada satu metric yang tak tervalidasi. |
| **Penanganan hub** | Diffusion α=1 (asimtotik, tak transfer) | **CSLS / hubness-aware scaling** [verify] | Masalah Anda persis "hubness" di retrieval; fix-nya sudah ada & murah. |
| **Peran OT** | Inti (WMD-style) | **Satu hipotesis yang diuji**, dengan rumah yang benar (GW-alignment) | OT tetap, tapi tidak dipertaruhkan; menang/kalah sama-sama jadi temuan. |
| **"Perseptual"** | Diasumsikan | **Dibuktikan** lewat anchor manusia kecil, atau diturunkan jadi "structure-aware" | Menghapus kelemahan FATAL dengan data, atau dengan kejujuran. |
| **Fenomena dupe-searah** | Tak diukur | **Diukur duluan → kontribusi sentral** | Membuktikan masalah ada sebelum membangun mesin. |
| **Ground truth** | Hanya `inspired_by` (proxy marketing) | `inspired_by` **+ judgment relevansi independen** di subset | De-risk construct validity. |

**Inti perubahan dalam satu kalimat:** dari *"saya punya metric perseptual baru yang mengalahkan baseline"* menjadi *"saya mendefinisikan dan menyelesaikan masalah penyelarasan dua kosakata bau divergen tanpa data interaksi, membuktikan kapan struktur geometris benar-benar membantu, dan menyediakan benchmark + protokol yang tak bisa diakali circularity."*

---

## 1. Mengapa reframe ini, bukan tambal-sulam

Aset paling berharga dari Aromatique **bukan** "katalog untuk direkomendasikan." Aset itu adalah hal yang langka: **211 pasangan terkurasi manusia yang menyatakan "dua entitas ini berbau searah, lintas dua kosakata berbeda."** Itu secara struktural adalah *seed translation pairs* antara dua "bahasa":

- **Bahasa A** = kosakata olfaktori lokal Aromatique (17 family, accord ID, **noisy**: `vanila`, `freahspicy`, `coffe`).
- **Bahasa B** = kosakata olfaktori global Fragrantica (49 family, accord EN, **bersih**).

Tugas "diberi profil global → temukan dupe lokal" = **cross-vocabulary retrieval / bilingual lexicon induction (BLI)**. Ini penting karena tiga masalah Anda menjadi masalah yang *sudah ada namanya dan solusinya*:

1. **Hub-domination** (woody 151, citrus 139, …) = **hubness**, patologi terkenal di retrieval lintas-ruang. Fix baku: **CSLS** (cross-domain similarity local scaling) atau normalisasi inverted-softmax [verify]. Ini menggantikan klaim "α=1 menangani hub dari teori" yang tak transfer ke graph kecil Anda (W7).
2. **Granularity mismatch** (17 vs 49 family) = masalah ruang sumber/target beda dimensi/struktur → ditangani metode alignment (Procrustes bila ada seed, Gromov-Wasserstein bila tak ada seed) [verify].
3. **Dua kosakata divergen** = inti BLI. Literaturnya menyediakan baseline kuat dan metrik mapan (precision@k untuk lexicon induction).

> **Keuntungan reviewer:** menempatkan diri di literatur BLI/cross-lingual retrieval membuat baseline Anda *tampak kompeten*, bukan ad-hoc, dan memberi Anda alat siap-pakai untuk hubness yang justru menjadi kontribusi praktis nyata.

---

## 2. Gap baru (sempit, bisa dipertahankan)

Buang klaim "tak ada recommender interaction-free" (W13 — salah, content-based RS sudah begitu). Gap baru:

> **BLI/cross-lingual retrieval mengasumsikan ruang embedding kontinu yang padat (kata, dari korpus besar).** Belum ada yang menangani penyelarasan **dua taksonomi sensorik divergen** yang (i) **diskret & sangat jarang** (ratusan accord, 51 singleton), (ii) **noisy di satu sisi**, (iii) hanya disupervisi **cross-reference katalog terkurasi** (bukan kamus bilingual besar), dan (iv) menuntut **penjelasan terstruktur auditable** alih-alih sekadar pasangan. Kondisi ini mematahkan asumsi BLI standar (kepadatan, kebersihan, supervisi melimpah).

Gap ini: (a) nyata, (b) tertambat pada asumsi metode lain yang benar-benar dilanggar data Anda, (c) tidak diselesaikan baseline sederhana tanpa adaptasi. Itu tiga syarat gap yang tahan sidang.

---

## 3. Novelty berlapis (jujur, tidak bertumpu pada satu titik)

Empat kontribusi, diurut dari yang paling tak tergantikan:

1. **[Benchmark + Protokol]** Dataset cross-vocabulary olfactory retrieval pertama dengan **protokol leakage-controlled** (hold-out edge + **rekomputasi *M*/statistik dalam-fold**) dan **stratifikasi berdasarkan overlap accord**. — Tahan banting; tak tergantikan metode sederhana.
2. **[Diagnostik]** Karakterisasi empiris **kapan geometri/alignment membantu**: hipotesis bahwa keunggulan struktur terkonsentrasi pada pasangan **overlap-rendah**, dan menentukan ambangnya. — Ini temuan, bukan sekadar angka menang.
3. **[Metode]** Adaptasi **alignment berbasis Optimal Transport (Gromov-Wasserstein)** + **hubness-aware retrieval (CSLS)** ke ruang olfaktori diskret-jarang, dengan **transport plan sebagai penjelasan terukur**. — Novel sebagai transfer domain + kombinasi, dengan rumah teoretis yang benar.
4. **[Validasi perseptual]** Bila anchor manusia berhasil: bukti pertama bahwa jarak accord turunan-struktur **berkorelasi dengan kemiripan bau yang dinilai manusia** pada domain ini. — Bonus yang membuat kata "perseptual" pantas; bila gagal, dilaporkan sebagai batas (negatif yang informatif).

> Catat bedanya dengan lama: dulu novelty = (1) saja-nya metric, dan runtuh bila metric lemah. Sekarang, **bahkan jika metode Anda kalah dari baseline**, kontribusi 1, 2, dan 4 tetap berdiri. Itu desain yang anti-gagal.

---

## 4. Research Questions & Hipotesis baru

**RQ1 (karakterisasi).** Seberapa sering fenomena "dupe searah, accord berbeda" benar-benar muncul di 211 pasangan, dan bagaimana distribusi overlap accord-nya?
**RQ2 (hubness).** Apakah retrieval hubness-aware (CSLS) mengungguli skoring kemiripan polos pada katalog hub-dominated ini?
**RQ3 (alignment-OT).** Apakah alignment berbasis OT (Gromov-Wasserstein/Sinkhorn) memberi keunggulan **di atas** retrieval hubness-aware, dan **pada regime mana** (overlap-rendah vs tinggi)?
**RQ4 (non-circular).** Saat edge `inspired_by` + statistik di-hold-out dalam-fold, apakah sinyal tetap di atas chance (bukan sirkular)?
**RQ5 (perseptual).** Apakah jarak accord turunan-struktur berkorelasi dengan rating kemiripan bau manusia (anchor independen)?
**RQ6 (penjelasan).** Apakah transport plan menghasilkan penjelasan yang **faithful** (diukur via perturbasi), dan apakah penilai manusia menganggapnya plausibel?

Hipотesis falsifiable kunci (yang akan dihormati penguji):

- **H_overlap (sentral):** keunggulan metode struktur **hanya** signifikan pada subset overlap-rendah; pada overlap-tinggi, TF-IDF/CSLS sudah cukup. → *Falsifikasi:* keunggulan seragam atau nol di mana-mana.
- **H_hub:** CSLS > skoring polos secara konsisten lintas fold. → *Falsifikasi:* Δ≈0.
- **H_OT:** GW/Sinkhorn-OT > CSLS **pada subset overlap-rendah**. → *Falsifikasi:* tak ada beda bahkan di overlap-rendah → OT dekoratif (laporkan jujur).
- **H_noncirc:** hold-out dalam-fold tetap > chance. → *Falsifikasi:* runtuh ke acak.
- **H_percept:** korelasi (Spearman) *M*-struktur vs rating-manusia > 0 signifikan. → *Falsifikasi:* korelasi nol → buang kata "perseptual".

Setiap hipotesis bisa salah, dan **setiap kegagalan tetap menghasilkan paper** (temuan negatif yang informatif). Itu kuncinya.

---

## 5. Metode — desain berlapis (ladder yang menjustifikasi dirinya)

Bukan "satu mesin hebat," tapi **tangga** di mana tiap anak tangga menjawab satu RQ dan tiap lompatan harus *membuktikan diri*.

### 5.1 Stage A — Konstruksi & normalisasi (gate kualitas)
- Normalisasi accord lokal (typo, ejaan ID/EN) → **laporkan precision/recall normalisasi** pada sampel audit manual (menutup W15).
- Bangun KG typed seperti rancangan lama (Product/Accord/Family/WheelCategory/GlobalRef) — struktur ini tetap bagus.
- **Output:** dua matriks representasi accord per kosakata + tabel pemetaan (di-rilis untuk reproducibility, menutup W20 sebagian).

### 5.2 Stage B — Karakterisasi masalah (RQ1, dijalankan SEBELUM metode apa pun)
- Untuk tiap pasangan gold: hitung **Jaccard/overlap accord** lokal↔global.
- Plot distribusi; tentukan **subset overlap-rendah** (regime tempat token-matching gagal).
- **Gate keputusan:** bila overlap mayoritas tinggi → pivot tesis ke kontribusi 1+2+4 (benchmark+diagnosis+perseptual) dan **akui** OT tak banyak menambah. Ini analisis seminggu yang menyelamatkan berbulan-bulan (menutup W2).

### 5.3 Stage C — Ruang representasi accord (bahan untuk semua metode)
Bangun **beberapa** ruang jarak accord, lalu **bake-off** (bukan asumsikan diffusion menang — menutup W6):
- `R_cooc`: PPMI co-occurrence langsung (cosine). *Lantai struktur.*
- `R_diff`: diffusion map (rancangan lama). *Diuji, tak diistimewakan.*
- `R_n2v`: node2vec embedding.
- `R_kge`: RotatE/CompGCN embedding (pykeen).
- `R_wheel`: koordinat sensory wheel (opsional, sebagai fitur tambahan, **bukan** sumber tunggal).

Tiap ruang dipakai identik di hilir → perbandingan adil. **Inilah eksperimen yang menentukan "kenapa diffusion" — secara empiris, bukan retoris.**

### 5.4 Stage D — Retrieval hubness-aware (RQ2, kandidat workhorse)
- Skoring kemiripan global→lokal di tiap ruang.
- Terapkan **CSLS** [verify]: koreksi skor dengan rata-rata kemiripan ke-k tetangga di kedua sisi → menekan hub. Ini fix prinsipil & murah untuk hub-domination Anda.
- **Prediksi jujur saya [Medium]:** CSLS + IDF + ruang co-occurrence sederhana akan jadi baseline yang **sangat kuat** — mungkin mengalahkan banyak hal mewah. Itu bagus: workhorse yang jujur.

### 5.5 Stage E — Alignment via Optimal Transport (RQ3, "OT diselamatkan")
Di sinilah OT mendapat rumah yang benar:
- **Supervised-ish (ada seed):** Procrustes/orthogonal mapping antar dua ruang accord memakai pasangan seed (bukan gold test) → lalu retrieve. [verify Procrustes-BLI]
- **OT-alignment:** **Gromov-Wasserstein** menyelaraskan dua ruang kosakata accord (lokal vs global) **berdasarkan struktur intra-ruang**, tanpa butuh ruang bersama — cocok untuk granularity mismatch. [verify Alvarez-Melis & Jaakkola, GW word alignment]
- **Sinkhorn entropic** untuk efisiensi & differentiability.
- Uji **khusus pada subset overlap-rendah** (H_OT). Laporkan **fraksi biaya OT off-diagonal** (menutup W9: bukti OT bukan dekorasi).

> Kenapa GW, bukan WMD: WMD = kemiripan dokumen di **satu** ruang. Tugas Anda = menyelaraskan **dua** ruang divergen. GW persis untuk itu. Reframe ini sekaligus membuat novelty lebih kuat (transfer GW-alignment dari kata ke bau) dan menghapus serangan "ini cuma WMD ditempel" (W lama R7).

### 5.6 Stage F — Penjelasan terukur (RQ6)
- Ekstrak path dari transport plan seperti rancangan lama (≤3 hop, garansi path valid — aturan bagus, pertahankan).
- **Ukur faithfulness** dengan uji perturbasi: hapus/ubah accord di path → cek perubahan skor (deletion fidelity). Penjelasan faithful = skor turun saat path-nya dirusak. Ini menggantikan "faithful by construction" yang overclaim (menutup W10/W18).
- **Buang H5 vs Lily** (tak bisa dijalankan). Ganti dengan faithfulness intrinsik + plausibility manusia (≥3 penilai independen, bukan penulis).

---

## 6. Dua aset data baru (murah, menutup dua kelemahan FATAL/SEVERE)

### 6.1 Anchor kemiripan bau manusia (menutup W1 — bikin "perseptual" pantas)
- Pilih ~30–40 accord paling sering (cakupan tinggi).
- Rekrut **5–8 penilai** (penjual/enthusiast parfum). Sajikan **pasangan accord**; minta rating kemiripan bau (skala 1–5) atau triplet ("mana lebih mirip ke X: A atau B?").
- Agregasi → **matriks kemiripan bau manusia kecil**.
- **Validasi:** korelasikan (Spearman/Mantel) dengan tiap ruang Stage C. Ruang dengan korelasi tertinggi adalah yang "paling perseptual" — **empiris, bukan klaim**.
- Bila korelasi nol → jujur turunkan "perseptual" → "structure-aware". Itu temuan, bukan kegagalan.

> Biaya: beberapa hari kerja lapangan + ~1–2 jam per penilai. Inilah satu intervensi dengan **leverage tertinggi** di seluruh tesis.

### 6.2 Judgment relevansi independen (menutup W3 — de-risk GT proxy)
- Untuk ~30–50 query, minta penjual parfum menilai relevansi top-k **tanpa melihat** label `inspired_by`.
- Beri Anda **sumber relevansi kedua** yang independen dari klaim marketing → cek apakah `inspired_by` ≈ relevansi manusia. Bila ya, GT Anda diperkuat; bila tidak, Anda menemukan sesuatu yang penting.
- Sekaligus jadi evaluasi kedua yang **jujur** untuk jalur free-text.

---

## 7. Protokol evaluasi (anti-circular, ber-power, terstratifikasi)

- **Leakage dalam-fold:** edge `inspired_by` **dan** rekomputasi *M*/IDF/PPMI hanya dari training fold (menutup W4 — ini eksplisit jadi bagian definisi protokol).
- **Unit statistik = query (n=211), bukan 25 angka fold×seed.** Bootstrap per-query untuk CI; uji berpasangan per-query. Fold/seed dilaporkan sebagai robustness, bukan sampel inferensi (menutup W5).
- **Stratifikasi overlap** wajib di setiap tabel hasil (overlap-rendah vs tinggi) → menampilkan *di mana* tiap metode menang (H_overlap).
- **Metrik:** Hit@1, Hit@3, MRR + precision@k gaya BLI. **Buang NDCG@3** (redundan untuk single-relevant — menutup W17).
- **Effect size + CI**, bukan hanya p; koreksi multiple-comparison (Holm/BH) lintas hipotesis.
- **Akurasi grounding & normalisasi dilaporkan terpisah** (menutup W3-cascade/W15).
- **Scope klaim:** evaluasi kuantitatif utama = retrieval profil-accord; free-text = studi generalisasi terpisah dengan anchor manusia (§6.2), dibatasi jelas (menutup W11).

---

## 8. Baseline (kompeten, adil)

| Kelompok | Metode | Peran |
|---|---|---|
| Lantai | popularity / accord-freq | lower bound |
| Token | Jaccard, **TF-IDF+IDF cosine** | pesaing kuat sebenarnya |
| IR | BM25 | retrieval klasik |
| Dense | multilingual-SBERT/XLM-R | ancaman nyata (siapkan fallback) |
| **BLI** | **Procrustes-align, CSLS, GW-OT** [verify] | inti tugas (bukan tempelan) |
| Ground-metric bake-off | OT identik di {R_cooc, R_diff, R_n2v, R_kge} | menjawab "kenapa diffusion" |
| Inapplicable | KGAT/RippleNet/… | dilaporkan "tak dijalankan + alasan" (pertahankan — sudah benar) |

KGE dipakai sebagai **ruang representasi** (Stage C), bukan dipaksa jadi link-prediction yang under-trained → lebih adil (menutup W16).

---

## 9. Yang akan saya BUANG total

- Klaim "**fully interaction-free sebagai novelty**" → diturunkan jadi *setting*, bukan kontribusi (W13).
- "**Faithful by construction**" → diganti faithfulness terukur (W10).
- **H5 vs Lily** → tak bisa dijalankan, buang (W12).
- **NDCG@3** → redundan (W17).
- **Diffusion sebagai jantung yang diistimewakan** → diturunkan jadi *satu kandidat* dalam bake-off (W6/W7).
- Klaim "**perseptual**" tanpa bukti → diganti dengan klaim yang divalidasi anchor, atau "structure-aware" (W1).

---

## 10. Milestone implementasi (urutan yang melindungi Anda)

1. **Stage A** normalisasi + audit akurasi (gate kualitas).
2. **Stage B** karakterisasi overlap (RQ1) — **gate keputusan**: bila overlap tinggi, pivot sekarang.
3. **§6.1 anchor manusia** mulai dikumpulkan paralel (butuh waktu lapangan).
4. **Stage C** bangun semua ruang accord.
5. **Stage D** CSLS/hubness (RQ2) — kemungkinan besar workhorse.
6. **§7** kunci protokol leakage dalam-fold + uji **H_noncirc duluan** (gate non-circularity).
7. **Stage E** GW/Sinkhorn-OT, uji **H_OT pada subset overlap-rendah** (RQ3).
8. **§6.1 validasi** korelasi ruang vs anchor (RQ5/H_percept).
9. **Stage F** faithfulness perturbasi + plausibility (RQ6).
10. **§6.2** judgment relevansi independen + studi free-text.
11. Penulisan; integrasi modul XAI Raissa.

Gate 2, 6, 8 adalah titik di mana Anda boleh menghentikan/membelokkan tesis dengan kepala tegak.

---

## 11. Risiko jujur & plafon

- **Risiko terbesar [Medium-High]:** CSLS+IDF sudah mengalahkan OT bahkan di overlap-rendah → maka kontribusi metode menyusut ke "OT tak menambah; CSLS cukup." **Mitigasi:** itu pun temuan publishable (diagnosis regime), dan kontribusi 1/2/4 berdiri sendiri.
- **Risiko anchor manusia lemah/noisy [Medium]:** korelasi tak signifikan. **Mitigasi:** turunkan ke "structure-aware"; laporkan sebagai batas domain.
- **Risiko n=211 tetap underpowered [Medium]:** beberapa efek tak tercapai signifikansi. **Mitigasi:** laporkan effect size + CI jujur; jangan over-claim.
- **Plafon publikasi:** dengan §6.1+§6.2 terlaksana, protokol+diagnosis+anchor membuat ini **kuat untuk Scopus terapan dan kompetitif untuk Q1 IS/IR bertema benchmark/metodologi** — lebih tinggi dari plafon blueprint lama, karena tak bergantung pada satu klaim yang tak terbela.

---

## 12. Kenapa redesign ini lebih kuat (ringkas)

1. **Anti-gagal:** empat kontribusi independen; kalah-baseline pun tesis tetap berdiri.
2. **Rumah teoretis benar:** BLI + GW-alignment + hubness/CSLS — bukan WMD-ditempel + diffusion-ad-hoc.
3. **Klaim = bukti:** "perseptual" dan "dupe-searah" menjadi hal yang **diukur**, bukan diasumsikan.
4. **Tak bisa diakali:** protokol leakage dalam-fold + stratifikasi overlap menutup circularity di level statistik **dan** konstruk.
5. **Dataset tetap Aromatique** — tak ada yang hilang; yang berubah hanya pertanyaan ilmiah dan cara membuktikannya.

---

> **Catatan verifikasi (sesuai instruksi Anda):** metode eksternal yang saya sebut — CSLS / inverted-softmax (hubness), Procrustes-BLI, Gromov-Wasserstein word alignment (Alvarez-Melis & Jaakkola), literatur hubness (Radovanović dkk.) — saya recall dari ingatan dan **belum** saya verifikasi di sesi ini. **Cek judul, penulis, dan tahun aslinya sebelum menulis** — saya sengaja tidak menuliskan sitasi lengkap agar Anda tidak mengutip sumber yang belum terverifikasi. Klaim konseptual (hubness sebagai patologi retrieval; GW untuk alignment ruang berbeda; CSLS menekan hub) saya yakini benar secara konsep [Medium-High], tapi formulasi persisnya tetap perlu Anda konfirmasi langsung.
