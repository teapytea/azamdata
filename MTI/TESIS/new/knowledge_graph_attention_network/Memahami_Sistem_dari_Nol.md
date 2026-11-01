# Memahami Sistem Anda dari Nol — Dari Excel Aromatique sampai `kg_paths`

> Dokumen ini untuk dibaca pelan-pelan, berkali-kali. Tujuannya: Anda bisa menjelaskan setiap langkah dengan kata-kata sendiri di sidang. Setiap istilah Inggris langsung saya artikan. Setiap rumus saya jelaskan kata per kata. Saya pakai contoh angka nyata di tiap tahap.

---

## Peta besar (hafalkan ini dulu)

Tujuh tahap, satu arah, seperti pabrik:

```
[Tabel Excel Aromatique]
        │  Tahap 1: Bersihkan & rapikan
        ▼
[Daftar accord bersih per produk]
        │  Tahap 2: Ubah tiap produk jadi "kantong takaran" (distribusi)
        ▼
[Setiap produk & query = vektor takaran accord]
        │  Tahap 3: Bangun tabel jarak antar-accord  ← M (JANTUNG + NOVELTY)
        ▼
[Tabel M: seberapa dekat tiap pasang accord]
        │  Tahap 4: Hitung kemiripan query↔produk pakai Optimal Transport
        ▼
[Skor tiap produk] → urutkan → ambil top-3
        │  Tahap 5: Tangani masalah "hub" (accord yang terlalu umum)
        ▼
[Top-3 yang sudah diperbaiki]
        │  Tahap 6: Tarik penjelasan dari hasil OT
        ▼
[kg_paths: jalur penjelasan]
        │  Tahap 7: Bungkus jadi JSON → kirim ke Raissa
        ▼
{top3, kg_paths}
```

Sekarang kita bedah satu per satu, dengan contoh.

---

## Konsep fondasi: "parfum itu kantong takaran, bukan satu titik"

Ini ide terpenting. Kuasai ini, sisanya mudah.

Parfum **bukan** satu titik. Parfum adalah **kantong berisi beberapa accord dengan takaran yang totalnya 100%**.

Contoh produk lokal "Verve Vale":

| accord | takaran |
|---|---|
| sweet (manis) | 0.40 |
| woody (kayu) | 0.35 |
| vanila | 0.25 |
| **total** | **1.00** |

Istilah resminya: ini **distribusi** (sebaran massa). Bayangkan 1 kg pasir dibagi: 400 gram di tumpukan "manis", 350 gram di "kayu", 250 gram di "vanila". Query user nanti juga jadi kantong pasir seperti ini.

Notasi yang akan Anda lihat di tesis:
- **`μ_p`** (baca: "myu-p") = kantong takaran **produk** p. (μ huruf Yunani, biasa dipakai untuk distribusi.)
- **`ν_q`** (baca: "nu-q") = kantong takaran **query** q.

Jadi kalau dosen Anda menulis `μ_p`, itu cuma cara singkat menulis "tabel takaran accord parfum p di atas". Jangan takut simbolnya.

---

## Kenapa cosine gagal & OT menang (pakai angka, bukan teori)

Sebelum tahap teknis, pahami **kenapa** kita repot-repot pakai OT. Ini argumen inti tesis Anda.

User minta: `manis 50%, vanila 50%`. Dua kandidat parfum:

- **Parfum A** = `manis 50%, vanila 50%`
- **Parfum B** = `manis 50%, gula 50%`  ← "gula" beda kata dari "vanila", tapi baunya searah

**Cara cosine berpikir:** cosine menganggap tiap accord adalah sumbu yang saling tegak lurus. "vanila" dan "gula" = dua sumbu berbeda yang **tidak saling kenal**. Maka:
- Cosine(user, A) = tinggi (accord-nya identik).
- Cosine(user, B) = lebih rendah — cosine **tidak tahu** bahwa "gula" itu sepupu dekat "vanila". Ia memperlakukan gula seolah sejauh "asap rokok" dari vanila.

→ Cosine **gagal** menangkap "dupe searah tapi beda komponen". Inilah keluhan inti di blueprint Anda.

**Cara OT berpikir:** OT bertanya *"berapa ongkos termurah mengubah kantong user jadi kantong B?"*
- 50% massa "manis" → "manis": cocok, **ongkos 0**.
- 50% massa "vanila" → harus pindah ke "gula". Karena di tabel M, jarak(vanila, gula) kecil — misal **0.1** — maka ongkos = 0.5 × 0.1 = **0.05**.
- Total ongkos OT(user, B) = **0.05** (kecil = mirip).

→ OT **memberi kredit** untuk "beda kata, tapi berdekatan". Itulah persis fenomena "dupe" Anda. **Inilah alasan ilmiah memakai OT** — dan PDF Scopus yang Anda lampirkan mendukung klaim umum ini (OT menyelaraskan distribusi & menangani pemetaan banyak-ke-banyak, hal yang cosine tak bisa). Tapi ingat: PDF itu bicara umum, **bukan** tentang parfum. Klaim "OT bagus untuk bau" harus **Anda** buktikan sendiri lewat eksperimen — itulah tesisnya.

**Pelajaran penting:** seluruh keunggulan OT bergantung pada satu kalimat tadi — *"jarak(vanila, gula) kecil"*. Angka itu datang dari **tabel M**. Kalau M salah (misal M bilang vanila jauh dari gula), OT ikut salah. Maka **membuktikan M benar = membuktikan tesis benar.** Itu sebabnya Tahap 3 adalah jantungnya.

---

## TAHAP 1 — Dari Excel berantakan ke daftar accord bersih

**Input:** tabel Aromatique. Kolom penting: `product_name`, `main_accords` (dipisah koma, **noisy**), `revolutionize` (nama parfum global yang ditiru, untuk 243 produk).

**Masalah nyata di data Anda:** `vanila`, `freahspicy`, `coffe`, `wam spicy`, `baae:`, `haert:`. Ini typo & inkonsistensi.

**Yang dikerjakan:**
1. Perbaiki typo → kamus normalisasi: `vanila→vanilla`, `coffe→coffee`, `freahspicy→fresh spicy`, dst.
2. Samakan istilah lokal↔global yang sebenarnya sama (mis. lokal "fresh spicy" = global "fresh spicy").
3. Pisah `main_accords` jadi daftar: `"sweet, woody, vanila"` → `[sweet, woody, vanilla]`.

**Output:** tiap produk punya daftar accord bersih.

**Pembuktian ilmiah (penting untuk sidang):** ambil sampel 50 produk, perbaiki manual, bandingkan dengan hasil otomatis Anda. Laporkan **akurasi normalisasi** (mis. "94% accord ternormalisasi benar"). Ini menutup pertanyaan penguji *"bagaimana saya tahu pembersihan Anda tidak merusak data?"* — Anda jawab dengan angka, bukan klaim.

---

## TAHAP 2 — Dari daftar accord ke "kantong takaran" (distribusi)

**Input:** daftar accord bersih per produk.

**Yang dikerjakan:** ubah daftar jadi vektor takaran yang totalnya 1.

Cara paling sederhana & jujur (mulai dari sini): **takaran seragam**. Kalau produk punya 3 accord, tiap accord dapat 1/3.

"Verve Vale" = `[sweet, woody, vanilla]` →

| accord | takaran |
|---|---|
| sweet | 0.333 |
| woody | 0.333 |
| vanilla | 0.333 |

**Notasi:** ini `μ_p` untuk Verve Vale.

> Catatan: data Anda tidak punya persentase asli tiap accord, jadi seragam adalah pilihan jujur. Nanti (opsional) bisa dibobot IDF — accord langka dapat takaran lebih besar — tapi itu Tahap lanjutan; jangan dulu.

**Vektor "panjang penuh":** sebenarnya tiap `μ_p` adalah vektor sepanjang **seluruh kosakata accord** (misal ada `n` = 120 accord berbeda di seluruh katalog). Verve Vale punya angka di 3 posisi (sweet, woody, vanilla) dan **0 di 117 posisi lain**. Jadi `μ_p` adalah vektor 120-angka yang kebanyakan nol. Itu wajar.

---

## TAHAP 3 — Tabel jarak antar-accord `M` (JANTUNG + NOVELTY)

Ini bagian terpenting dan paling novel. Pelan-pelan.

**Apa itu M:** tabel berukuran `n × n` (kalau 120 accord, maka tabel 120×120). Isi sel `M[a,b]` = **jarak/ongkos antara accord a dan accord b**. Kecil = mirip bau. Besar = beda bau.

Contoh potongan M yang kita mau:

| | sweet | vanilla | sugar | woody | citrus |
|---|---|---|---|---|---|
| **sweet** | 0 | 0.1 | 0.1 | 0.7 | 0.9 |
| **vanilla** | 0.1 | 0 | 0.15 | 0.6 | 0.95 |
| **sugar** | 0.1 | 0.15 | 0 | 0.7 | 0.9 |
| **woody** | 0.7 | 0.6 | 0.7 | 0 | 0.8 |
| **citrus** | 0.9 | 0.95 | 0.9 | 0.8 | 0 |

(Diagonal selalu 0: jarak accord ke dirinya sendiri = 0.)

**Pertanyaan kunci yang jadi novelty Anda:** *dari mana angka-angka ini?* Ada banyak cara, dan **memilih + membuktikan cara terbaik itulah sumbangan ilmiah Anda.** Kita siapkan beberapa kandidat, lalu adu (Tahap 3c).

### 3a. Kandidat utama: jarak dari "accord yang sering muncul bersama"

**Ide intuitif:** kalau dua accord **sering muncul bersama** di banyak parfum, kemungkinan baunya cocok/berdekatan. "sweet" dan "vanilla" sering satu parfum → dekat. "citrus" dan "vanilla" jarang barengan → jauh.

**Langkah hitung (pelan):**
1. Hitung berapa kali tiap pasang accord muncul bersama di produk yang sama. → tabel co-occurrence (kemunculan-bersama).
2. Ubah jadi skor **PPMI** (Positive Pointwise Mutual Information = ukuran "seberapa lebih sering dari kebetulan dua hal muncul bersama"). Ini menghukum accord yang memang sering muncul di mana-mana, supaya tidak menipu. PPMI tinggi = dua accord benar-benar berpasangan, bukan kebetulan.
3. Skor PPMI tinggi → jarak kecil. (Mis. `jarak = 1 − PPMI_ternormalisasi`.)

**Output:** satu versi M, sebut `M_cooc` (co-occurrence). Ini kandidat paling sederhana & paling bisa dijelaskan.

### 3b. Kandidat lain (untuk diadu, bukan diasumsikan menang)

- `M_diff` (diffusion map): cara matematis lebih canggih yang melihat "tetangga-dari-tetangga" — bukan cuma siapa muncul bersama langsung, tapi rantai hubungan. Lebih halus, tapi lebih rumit dijelaskan. **Jangan istimewakan; uji saja.**
- `M_embed` (node2vec / RotatE): ubah tiap accord jadi titik di ruang berdimensi (embedding), lalu jarak = jarak antar titik. Standar di literatur graph.
- `M_wheel`: pakai posisi accord di "roda aroma" (sensory wheel) — peta baku ahli parfum. Dipakai sebagai **fitur tambahan/pembanding**, bukan sumber tunggal (karena pemetaannya manual & subjektif).

### 3c. Adu kandidat M (ini eksperimen yang menjustifikasi novelty)

Daripada mengklaim "diffusion terbaik", kita **buktikan** dengan menjalankan pipeline yang sama persis memakai tiap M, lalu lihat mana yang menghasilkan retrieval terbaik. Mungkin `M_cooc` sederhana menang — itu temuan bagus & jujur.

### 3d. Membuktikan M "perseptual" (menutup kelemahan terbesar)

Masalah: dari mana kita tahu M benar-benar mencerminkan **persepsi bau manusia**, bukan sekadar kebiasaan penulisan katalog?

**Solusi murah:** kumpulkan **anchor manusia**. Ambil ~30 accord paling sering. Minta 5–8 penjual/penggemar parfum menilai kemiripan pasangan accord (skala 1–5: "seberapa mirip bau 'vanilla' dan 'sugar'?"). Rata-ratakan → tabel kemiripan-versi-manusia kecil.

Lalu **korelasikan** M Anda dengan tabel manusia (uji Spearman/Mantel — uji statistik untuk "apakah dua tabel jarak sejalan"). Kalau korelasi positif & signifikan → Anda **berhak** menyebut M "perseptual" karena terbukti sejalan dengan hidung manusia. Kalau tidak → jujur turunkan istilah jadi "structure-aware" (berbasis struktur). **Dua-duanya hasil ilmiah yang sah.**

> M dihitung **sekali, offline**. Setelah jadi, dipakai untuk semua query.

---

## TAHAP 4 — Skoring kemiripan via Optimal Transport (Sinkhorn)

Sekarang kita punya: kantong query `ν_q`, kantong tiap produk `μ_p`, dan tabel jarak `M`. Saatnya menghitung skor kemiripan.

**Apa yang dihitung:** untuk tiap produk, ongkos OT memindahkan `ν_q` menjadi `μ_p` di bawah jarak M. Ongkos kecil = mirip.

**Rumus inti (dijelaskan kata per kata):**

$$ \text{OT}(\nu_q, \mu_p) = \min_{T} \sum_{a,b} T[a,b] \cdot M[a,b] $$

Baca pelan:
- `T[a,b]` = **berapa banyak massa dipindah dari accord a (di query) ke accord b (di produk)**. T disebut **transport plan** (rencana pemindahan). T ini matriks `n×n`.
- `M[a,b]` = ongkos per unit massa untuk pindah a→b (dari Tahap 3).
- `T[a,b] · M[a,b]` = ongkos untuk satu pasangan = jumlah massa × ongkos per unit.
- `Σ` (sigma) = jumlahkan ongkos atas **semua** pasangan accord.
- `min_T` = cari rencana T yang membuat total ongkos **sekecil mungkin**.

**Aturan main (constraint) — supaya tidak curang:**
- Semua massa di query harus terpakai habis: tiap baris T dijumlah = takaran query accord a. (Notasi: `T·1 = ν_q`.)
- Semua massa di produk harus terisi penuh: tiap kolom T dijumlah = takaran produk accord b. (`Tᵀ·1 = μ_p`.)
- Artinya: tidak boleh ada massa hilang atau diciptakan. Pasir cuma dipindah, tidak ditambah/dibuang.

**Contoh konkret (pakai angka tadi):**
- Query `ν_q` = manis 0.5, vanila 0.5.
- Produk B `μ_p` = manis 0.5, gula 0.5.
- Rencana terbaik T: pindah 0.5 manis→manis (ongkos 0.5×0=0), pindah 0.5 vanila→gula (ongkos 0.5×0.1=0.05).
- Total OT = **0.05**. Kecil → B mirip query. ✔

**Kenapa "Sinkhorn"?** Mencari `min_T` persis itu lambat. **Sinkhorn** (Cuturi 2013) adalah trik mempercepat dengan menambah sedikit "pengaburan" (entropic regularization). Ada satu tombol **`ε`** (epsilon):
- ε kecil → hasil tajam & akurat, tapi lambat.
- ε besar → cepat, tapi rencana T jadi "berkabut" (massa tersebar tipis ke mana-mana).

Sinkhorn bekerja dengan mengulang dua update sederhana (`u` dan `v`) sampai stabil. Yang perlu Anda tahu untuk sidang: **Sinkhorn = cara cepat & bisa diandalkan menghitung OT; ε mengatur trade-off cepat-vs-tajam; tidak perlu melatih model (no training), jadi ringan untuk 340 produk.**

**Hasil Tahap 4:** skor OT untuk tiap dari 340 produk → **urutkan dari terkecil** → ambil **3 teratas**.

---

## TAHAP 5 — Tangani "hub" (accord yang terlalu umum)

**Masalah di data Anda:** `woody` muncul di 151 produk, `citrus` di 139. Accord begini muncul di hampir semua parfum → tidak membedakan apa-apa, malah membuat banyak produk tampak "mirip" query secara palsu. Penyakit ini namanya **hubness** (ada accord yang jadi "tetangga semua orang").

**Obat baku dari literatur retrieval: CSLS** (Cross-domain Similarity Local Scaling = penskalaan kemiripan berbasis tetangga lokal). Ide sederhananya: **hukum skor accord/produk yang "terlalu ramah ke semua orang"**. Kalau sebuah produk tampak mirip ke *semua* query, kemiripannya ke query *Anda* didiskon.

Cara kerja inti (intuisi): untuk tiap produk, hitung rata-rata kemiripannya ke banyak query lain. Produk yang rata-ratanya tinggi (= hub) skornya dikurangi. Hasil: yang menonjol adalah produk yang mirip **spesifik** ke query Anda, bukan yang mirip ke semua.

**Pembuktian:** bandingkan Hit@3 dengan-CSLS vs tanpa-CSLS. Kalau naik → CSLS terbukti membantu masalah hub Anda. Prediksi jujur: ini kemungkinan besar memberi kenaikan nyata & murah.

> Catatan kejujuran: nama CSLS & formulasinya recall dari ingatan — **verifikasi sumber aslinya** (terkait karya word-translation MUSE/Conneau dkk.) sebelum menulis di tesis. Konsepnya benar; sitasi persisnya cek dulu.

---

## TAHAP 6 — Tarik penjelasan (`kg_paths`) dari hasil OT

Keindahan OT: **rencana pemindahan T sendiri adalah penjelasannya.** Tidak perlu mesin penjelas terpisah.

**Yang dikerjakan:** untuk tiap produk top-3, lihat di matriks T, **pasangan (a→b) dengan massa terbesar** — itulah "alasan utama kenapa produk ini cocok".

Contoh: untuk Verve Vale yang masuk top-3, entri T terbesar adalah `(sweet → vanilla) = 0.3`. Artinya: "produk ini direkomendasikan terutama karena bau manis Anda cocok dengan vanila di produk ini."

**Ubah jadi jalur KG (kg_path):**
```
query-accord "sweet"  →(MAPS_TO_WHEEL)→  wheel "Oriental"  →(produk punya)→  "Verve Vale"
```
- `path_score` = massa pemindahan tadi (0.3). Makin besar, makin kuat alasannya.
- Aturan: jalur ≤ 3 hop (langkah), tiap produk top-3 wajib punya ≥1 jalur valid (edge-nya benar ada di KG). Kalau tak ada jalur valid → produk tak boleh masuk top-3.

**Kenapa "faithful" (jujur pada mekanisme):** jalur ini **bukan** karangan setelah fakta. Ia ditarik langsung dari angka T yang dipakai menghitung skor. Jadi penjelasan = jejak perhitungan nyata.

**Membuktikan faithfulness secara ilmiah (jangan cuma klaim):** lakukan **uji perturbasi** — hapus accord yang ada di jalur penjelasan, lalu hitung ulang skor. Kalau skor **turun banyak**, berarti accord itu memang penyebab utama → penjelasan jujur. Kalau skor tak berubah → penjelasan menyesatkan. Laporkan angkanya. Ini mengganti klaim "faithful by construction" yang dulu terlalu percaya diri.

---

## TAHAP 7 — Bungkus jadi JSON untuk Raissa

Susun hasil jadi kontrak `{top3, kg_paths}` (format dari blueprint Anda — pertahankan supaya kerja Raissa tidak terganggu):

```json
{
  "query": "wangi manis hangat untuk malam",
  "top3": [
    {
      "rank": 1,
      "product": {"id": "p_023", "name": "Verve Vale"},
      "score": 0.142,
      "kg_paths": [
        {
          "path_score": 0.30,
          "steps": [
            {"node": {"label": "sweet", "type": "Accord"}, "relation": "SEED"},
            {"node": {"label": "Oriental", "type": "WheelCategory"}, "relation": "MAPS_TO_WHEEL"},
            {"node": {"label": "Verve Vale", "type": "Product"}, "relation": "IN_WHEEL_VIA_FAMILY"}
          ]
        }
      ]
    }
  ]
}
```

Raissa menerima ini dan membangun tampilan XAI di atasnya. **Output tidak berubah dari rencana awal Anda** — yang berubah hanya cara *menghitung* skor & jalur (lebih kuat & lebih terbukti) di belakang layar.

---

## Di mana NOVELTY-nya? (jawaban satu paragraf untuk sidang)

> "Mesin OT, Sinkhorn, diffusion map — semua sudah ada. Yang baru pada penelitian saya ada empat, dan tidak satu pun bergantung pada satu titik tunggal: **(1)** saya menyusun **tabel jarak antar-accord** dan **membuktikannya sejalan dengan persepsi bau manusia** (anchor manusia), bukan sekadar mengasumsikannya; **(2)** saya **mengukur kapan** pendekatan geometris ini benar-benar membantu — yaitu pada pasangan yang baunya searah tapi accord-nya berbeda — dan kapan cara sederhana sudah cukup; **(3)** saya menyediakan **protokol evaluasi anti-circular** untuk sistem tanpa data user; dan **(4)** sistem mengeluarkan **penjelasan yang jujur pada mekanisme dan terbukti faithful** lewat uji perturbasi. Kontribusinya bukan algoritma OT, melainkan menjadikan OT bermakna, terbukti, dan dapat dijelaskan pada domain bau."

---

## Di mana tiap BASELINE-nya? (peta sederhana)

Baseline = lawan tanding untuk membuktikan metode Anda layak. Tiap baseline menjawab satu serangan penguji:

| Baseline | Menjawab serangan | Cara |
|---|---|---|
| **Cosine / TF-IDF** | "kenapa tak pakai cara biasa?" | hitung kemiripan accord tanpa M, tanpa OT |
| **Jaccard** | "kenapa tak hitung irisan accord saja?" | berapa banyak accord yang sama persis |
| **BM25** | "kenapa tak pakai mesin pencari klasik?" | retrieval IR standar |
| **SBERT/XLM-R** | "kenapa tak pakai embedding teks modern?" | encode teks produk vs query → cosine |
| **OT + M berbeda** | "kenapa diffusion, bukan co-occurrence?" | OT yang sama, ganti-ganti M (Tahap 3c) |
| **Tanpa CSLS** | "apa CSLS benar berguna?" | pipeline penuh minus Tahap 5 |

Kalau metode penuh Anda mengalahkan semua ini **khususnya pada pasangan overlap-rendah**, klaim Anda berdiri kokoh. Kalau kalah dari yang sederhana → itu pun temuan jujur ("OT tak menambah di domain ini"), dan kontribusi 1/2/3/4 tetap berdiri.

---

## Cara membaca dokumen ini

Jangan kuasai semua sekaligus. Urutan belajar yang saya sarankan:
1. **Konsep fondasi** (kantong takaran) + **kenapa cosine gagal/OT menang**. Ini 80% pemahaman.
2. **Tahap 3 (M)** dan **Tahap 4 (OT)** — jantungnya. Baca dua kali.
3. Sisanya (1, 2, 5, 6, 7) tinggal alur, lebih mudah.

Kalau ada **satu tahap** yang masih kabur, sebutkan nomornya — saya jelaskan ulang khusus tahap itu dengan contoh angka berbeda sampai klik.

---

> **Catatan verifikasi (jujur):** klaim umum "OT > cosine" didukung literatur yang Anda lampirkan (Scopus AI), tapi literatur itu **tidak** membahas parfum/bau — jadi klaim untuk domain bau harus Anda buktikan sendiri lewat eksperimen. Nama metode CSLS, diffusion map, node2vec, RotatE, SBERT recall dari ingatan; verifikasi judul/penulis/tahun aslinya sebelum disitasi. Konsepnya benar; sitasi persisnya cek dulu.
