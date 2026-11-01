# Q&A Preparation — Anticipated Questions per Slide
**Antisipasi Pertanyaan & Cara Menjawab** · [Basic] mendasar · [Method] metodologis · [Open] bebas

> Aturan jawab: akui jujur kalau modest/terbatas, lalu arahkan ke kekuatan (non-circular, simple-beats-complex, finding+protocol). Jangan overclaim. Angka kunci: 340 produk · 209 query · 56 accord · +9% (Δ0.042) · p=8.7e-8 · 81% dari pasangan · 86% overlap.

---

## Slide 1 — Title

**[Basic] What does "interaction-free" mean? / Apa itu "interaction-free"?**
🇬🇧 It means the data has no user signals — no ratings, clicks, or purchase history — only product content. So collaborative methods cannot apply.
🇮🇩 Artinya data tidak punya sinyal pengguna — tanpa rating, klik, atau histori beli — hanya konten produk. Maka metode kolaboratif tak bisa dipakai.

**[Basic] What is an "accord"? / Apa itu "accord"?**
🇬🇧 An accord is a scent descriptor of a perfume — e.g. amber, woody, warm spicy. Each product is a small set of accords.
🇮🇩 Accord adalah karakter aroma sebuah parfum — misalnya amber, woody, warm spicy. Tiap produk adalah sekumpulan kecil accord.

**[Basic] Why "order-2"? / Kenapa "order-2"?**
🇬🇧 Order-1 looks at single accords; order-2 looks at *pairs* of accords that co-occur. Pairs carry more discriminative signal.
🇮🇩 Order-1 melihat accord tunggal; order-2 melihat *pasangan* accord yang muncul bersama. Pasangan membawa sinyal pembeda lebih kuat.

---

## Slide 2 — What we built

**[Basic] Is this recommendation or retrieval? / Ini rekomendasi atau retrieval?**
🇬🇧 At the application level it is a content-based recommender; technically it is formulated and evaluated as a retrieval/ranking task.
🇮🇩 Di level aplikasi ini recommender berbasis konten; secara teknis diformulasikan dan dievaluasi sebagai tugas retrieval/ranking.

**[Basic] What exactly is your part vs your colleague's? / Bagian Anda vs teman Anda apa?**
🇬🇧 My colleague builds the chatbot and the HCI side; I build the recommendation engine inside it. This talk is about the recommender.
🇮🇩 Teman saya membangun chatbot dan sisi HCI; saya membangun mesin rekomendasi di dalamnya. Presentasi ini tentang recommender-nya.

**[Method] Why is small data a real problem? / Kenapa data kecil itu masalah?**
🇬🇧 With few examples per query, flexible models overfit and statistical power is limited. That is precisely what we test.
🇮🇩 Dengan sedikit contoh per query, model fleksibel overfit dan power statistik terbatas. Justru itu yang kami uji.

---

## Slide 3 — Motivation

**[Basic] How large is the data / how many branches? / Seberapa besar datanya?**
🇬🇧 340 products and 209 reference queries. Aromatique operates across many Indonesian cities and provinces; the bottleneck appears at peak hours.
🇮🇩 340 produk dan 209 query acuan. Aromatique beroperasi di banyak kota dan provinsi; bottleneck muncul saat jam ramai.

**[Open] Why a chatbot, not a simple search bar? / Kenapa chatbot, bukan kolom pencarian?**
🇬🇧 A chatbot lets customers describe a need in free language ("a perfume for school"), which is more natural than keyword search and offloads busy staff.
🇮🇩 Chatbot memungkinkan pelanggan menjelaskan kebutuhan dalam bahasa bebas ("parfum untuk sekolah"), lebih alami daripada pencarian kata kunci dan meringankan staf.

**[Open] Is it deployed in production? / Sudah dipakai di produksi?**
🇬🇧 It is a research prototype on the real Aromatique catalog; deployment is a next step, and the engine is designed to be deployable.
🇮🇩 Ini prototipe riset di katalog Aromatique nyata; deployment adalah langkah berikutnya, dan mesinnya dirancang siap dipakai.

---

## Slide 4 — Related work

**[Basic] Are these the only perfume recommenders? / Hanya ini recsys parfum yang ada?**
🇬🇧 They are representative of a small, mostly content-based literature. Perfume recsys is a niche, so there are few works and most are content-based.
🇮🇩 Mereka representatif dari literatur kecil yang mayoritas berbasis konten. Recsys parfum itu niche, jadi karyanya sedikit dan kebanyakan content-based.

**[Method] Why do they only use cosine/Jaccard? / Kenapa hanya cosine/Jaccard?**
🇬🇧 Those are the standard content-based similarities over note sets. The point is they all stay at order-1 — single accords.
🇮🇩 Itu kemiripan content-based standar atas himpunan notes. Intinya semua berhenti di order-1 — accord tunggal.

---

## Slide 5 — Research gaps

**[Method] Why can't you use KGAT / LightGCN / KGIN? / Kenapa tak pakai KGAT/LightGCN/KGIN?**
🇬🇧 They take a user–item interaction matrix and learn embeddings from it. Our data has no users, so that matrix is undefined — these models cannot even be instantiated.
🇮🇩 Mereka memerlukan matriks interaksi user–item untuk belajar embedding. Data kita tanpa user, jadi matriksnya tak terdefinisi — model itu bahkan tak bisa diinstansiasi.

**[Open] Co-occurrence is an old idea — what's new? / Co-occurrence ide lama — apa barunya?**
🇬🇧 The novelty is the *finding and the protocol*, not the model: a first non-circular demonstration that order-2 wins in a content-based, interaction-free perfume setting.
🇮🇩 Kebaruannya adalah *temuan dan protokol*, bukan modelnya: demonstrasi non-sirkular pertama bahwa order-2 menang di setting parfum berbasis konten, interaction-free.

**[Method] Is "complex overfits" always true? / Apakah "kompleks selalu overfit"?**
🇬🇧 No — it is empirical and depends on the data regime. We do not assume it; we test 15 methods and let the data decide.
🇮🇩 Tidak — ini empiris dan tergantung kondisi data. Kami tidak mengasumsikannya; kami uji 15 metode dan biarkan data yang memutuskan.

---

## Slide 6 — Proposed method

**[Method] Why order-2 and not order-3? / Kenapa order-2 bukan order-3?**
🇬🇧 Triples are far rarer on a small vocabulary, so order-3 tokens barely repeat across products and overfit. Order-2 is the sweet spot.
🇮🇩 Triple jauh lebih langka pada vocab kecil, sehingga token order-3 nyaris tak berulang antar-produk dan overfit. Order-2 adalah titik optimalnya.

**[Method] Sentence-BERT is powerful — why does it lose? / SBERT kuat — kenapa kalah?**
🇬🇧 Two reasons: embeddings blur the exact rare pairs into smooth vectors, and the query text (an accord list) is far sparser than the product prose — a text asymmetry. So its loss is not purely semantic.
🇮🇩 Dua sebab: embedding melarutkan pasangan langka menjadi vektor halus, dan teks query (daftar accord) jauh lebih miskin daripada prosa produk — asimetri teks. Jadi kekalahannya bukan murni semantik.

**[Method] "Parameter-free" — no tuning at all? / "Parameter-free" — tanpa tuning?**
🇬🇧 IDF weights are *computed* from the corpus, not *trained*. There are no learned weights — and when we added a trained fusion (P2), it did not beat the bare matcher.
🇮🇩 Bobot IDF *dihitung* dari korpus, bukan *dilatih*. Tidak ada bobot terlatih — dan saat kami tambah fusion terlatih (P2), ia tak mengalahkan matcher polos.

**[Open] Isn't this just TF-IDF with bigrams? / Bukankah ini cuma TF-IDF dengan bigram?**
🇬🇧 The components are deliberately standard — that is the point. The contribution is showing, non-circularly, that this simple recipe beats 14 more complex methods here. Simplicity is the result, not a gap.
🇮🇩 Komponennya memang sengaja standar — itu intinya. Kontribusinya menunjukkan, secara non-sirkular, bahwa resep sederhana ini mengalahkan 14 metode lebih kompleks di sini. Kesederhanaan adalah hasil, bukan kekurangan.

---

## Slide 7 — How it works

**[Method] How do you weight the pairs? / Bagaimana memboboti pasangan?**
🇬🇧 By inverse document frequency: rare, distinctive pairs get high weight; ubiquitous hub accords get low weight — automatically, with no tuning.
🇮🇩 Dengan inverse document frequency: pasangan langka dan khas berbobot tinggi; accord hub yang umum berbobot rendah — otomatis, tanpa tuning.

**[Method] How is free text turned into accords? / Bagaimana teks bebas jadi accord?**
🇬🇧 The preference text is parsed/mapped onto the accord vocabulary; the matcher then works on accords and their pairs.
🇮🇩 Teks preferensi diparsing/dipetakan ke kosakata accord; matcher lalu bekerja pada accord dan pasangannya.

**[Basic] Why cosine? / Kenapa cosine?**
🇬🇧 It is simple and, crucially, it splits exactly into an order-1 and an order-2 term — which gives both the score and the explanation.
🇮🇩 Sederhana dan, yang penting, terpisah persis menjadi term order-1 dan order-2 — memberi sekaligus skor dan penjelasan.

---

## Slide 8 — Non-circular evaluation

**[Method] How do you know there is no leakage? / Bagaimana memastikan tak ada kebocoran?**
🇬🇧 A leakage audit removes identity-bearing text, and the three sources are kept independent: item accords (catalog), query accords (external Fragrantica), and held-out labels.
🇮🇩 Audit kebocoran menghapus teks beridentitas, dan tiga sumber dijaga independen: accord item (katalog), accord query (Fragrantica eksternal), dan label hold-out.

**[Basic] What is Fragrantica? / Apa itu Fragrantica?**
🇬🇧 A large public fragrance database. We use it as an independent source for query accords; 264 of 266 links resolve to perfume-specific pages.
🇮🇩 Basis data parfum publik yang besar. Kami pakai sebagai sumber independen untuk accord query; 264 dari 266 tautan mengarah ke halaman parfum spesifik.

**[Method] Could the external source still correlate with the label? / Bisa jadi sumber eksternal tetap berkorelasi dengan label?**
🇬🇧 The label is a separate held-out "imitates" edge, independent of accord similarity; the query features come from a different source than the catalog. That separation is the firewall.
🇮🇩 Label adalah edge "meniru" terpisah yang di-hold-out, independen dari kemiripan accord; fitur query dari sumber berbeda dengan katalog. Pemisahan itulah firewall-nya.

---

## Slide 9 — Experimental setup

**[Method] Only 209 queries — is that enough? / Hanya 209 query — cukupkah?**
🇬🇧 It is small, which limits power — so we report bootstrap confidence intervals and paired tests rather than point estimates alone. We state it as a limitation.
🇮🇩 Kecil, sehingga membatasi power — maka kami laporkan confidence interval bootstrap dan uji berpasangan, bukan sekadar titik estimasi. Ini kami nyatakan sebagai limitasi.

**[Basic] What are MRR and Hits@k? / Apa itu MRR dan Hits@k?**
🇬🇧 MRR is the mean of 1/rank of the correct product; Hits@k is the fraction of queries where it lands in the top k.
🇮🇩 MRR adalah rata-rata 1/peringkat produk yang benar; Hits@k adalah proporsi query yang produknya masuk top-k.

**[Basic] What is leave-one-out? / Apa itu leave-one-out?**
🇬🇧 For each query we hold out its answer and rank the entire catalog, then check where the correct product falls. We repeat for all 209.
🇮🇩 Untuk tiap query kita hold-out jawabannya dan memeringkat seluruh katalog, lalu cek di mana produk benar berada. Diulang untuk 209 query.

---

## Slide 10 — Results

**[Method] P2 is numerically higher than P1 — why choose P1? / P2 lebih tinggi dari P1 — kenapa pilih P1?**
🇬🇧 The difference (0.004) is smaller than P2's own seed noise, and the test is not significant (p=0.18). When two methods tie, we pick the simpler, parameter-free one. (Key answer.)
🇮🇩 Selisihnya (0,004) lebih kecil dari noise seed P2 sendiri, dan ujinya tidak signifikan (p=0,18). Saat dua metode seri, kami pilih yang lebih sederhana dan parameter-free. (Jawaban kunci.)

**[Method] Why are neural methods so low? / Kenapa metode neural sangat rendah?**
🇬🇧 They smooth away the rare exact pairs and suffer the query–product text asymmetry, on data too small to learn good embeddings.
🇮🇩 Mereka menghaluskan pasangan langka dan terkena asimetri teks query–produk, pada data terlalu kecil untuk belajar embedding bagus.

**[Open] Is +9% practically meaningful? / Apakah +9% bermakna praktis?**
🇬🇧 It is modest but robust and significant. More importantly, the contribution is the finding and the honest protocol, not a record number.
🇮🇩 Modest tapi robust dan signifikan. Yang lebih penting, kontribusinya adalah temuan dan protokol yang jujur, bukan angka rekor.

---

## Slide 11 — Key finding

**[Open] Does this generalize beyond your data? / Apakah ini berlaku di luar data Anda?**
🇬🇧 The claim is scoped to this regime — small, interaction-free, content-only. External validity to other catalogs is untested and listed as a limitation.
🇮🇩 Klaimnya dibatasi pada kondisi ini — kecil, interaction-free, hanya konten. Validitas eksternal ke katalog lain belum diuji dan dicantumkan sebagai limitasi.

**[Method] Could a better-tuned neural model win? / Bisakah model neural yang lebih ditune menang?**
🇬🇧 Possibly with more or more symmetric data. In this regime, added capacity overfits — and we showed a trained fusion did not help.
🇮🇩 Mungkin dengan data lebih banyak atau lebih simetris. Di kondisi ini, kapasitas tambahan overfit — dan kami tunjukkan fusion terlatih tidak menolong.

---

## Slide 12 — Honest numbers

**[Method] p = 8.7e-8 with only 209 queries — how? / p=8.7e-8 dengan hanya 209 query — kok bisa?**
🇬🇧 It is a paired Wilcoxon across queries. The effect is small but very consistent in direction, and consistency — not magnitude — drives the tiny p-value.
🇮🇩 Itu Wilcoxon berpasangan antar-query. Efeknya kecil tapi sangat konsisten arahnya, dan konsistensi — bukan besarnya — yang menghasilkan p-value sangat kecil.

**[Method] How is the 81% computed? / Bagaimana 81% dihitung?**
🇬🇧 By decomposing the cosine into its order-1 and order-2 terms and measuring their average share of the top-ranked score.
🇮🇩 Dengan mendekomposisi cosine menjadi term order-1 dan order-2 lalu mengukur rata-rata kontribusinya pada skor peringkat-teratas.

**[Method] 86% overlap — isn't the task trivial then? / Overlap 86% — bukankah tugasnya jadi trivial?**
🇬🇧 The high overlap gives the baseline a high floor, which is exactly why the gain is modest. The order-2 pairs still discriminate among many near-identical candidates.
🇮🇩 Overlap tinggi memberi baseline lantai tinggi, justru itu yang membuat peningkatan modest. Pasangan order-2 tetap memisahkan banyak kandidat yang nyaris identik.

---

## Slide 13 — Explainability

**[Basic] Are those example reasons real? / Apakah contoh alasannya nyata?**
🇬🇧 The displayed example is illustrative, but the mechanism is real: the system exports the actual shared accord-pairs that produced each score.
🇮🇩 Contoh yang ditampilkan ilustratif, tapi mekanismenya nyata: sistem mengekspor pasangan accord nyata yang menghasilkan tiap skor.

**[Method] In what sense is it "faithful"? / Dalam arti apa "faithful"?**
🇬🇧 The explanation *is* the score decomposition itself, not a separate post-hoc model — so it cannot disagree with the prediction.
🇮🇩 Penjelasannya *adalah* dekomposisi skor itu sendiri, bukan model post-hoc terpisah — sehingga tak mungkin bertentangan dengan prediksinya.

**[Open] How would the chatbot use it? / Bagaimana chatbot memakainya?**
🇬🇧 It shows the Top-3 with a short reason per pick, giving the customer a transparent, auditable suggestion — a ready hand-off to the chatbot's XAI layer.
🇮🇩 Menampilkan Top-3 dengan alasan singkat per pilihan, memberi saran yang transparan dan bisa diaudit — siap diserahkan ke lapisan XAI chatbot.

---

## Slide 14 — Conclusion

**[Open] What is the single contribution? / Apa kontribusi tunggalnya?**
🇬🇧 A first non-circular demonstration that order-2 co-occurrence wins in interaction-free perfume recommendation, plus a reusable evaluation protocol. A finding, not a new model.
🇮🇩 Demonstrasi non-sirkular pertama bahwa ko-okurensi order-2 menang di rekomendasi parfum interaction-free, plus protokol evaluasi yang reusable. Sebuah temuan, bukan model baru.

**[Open] Is it deployed at Aromatique? / Sudah dipakai di Aromatique?**
🇬🇧 It runs on the real Aromatique catalog as a prototype and is designed to deploy inside the chatbot; production rollout is future work.
🇮🇩 Berjalan di katalog Aromatique nyata sebagai prototipe dan dirancang untuk dipasang di chatbot; rollout produksi adalah pekerjaan lanjutan.

---

## Pertanyaan bebas / big-picture (siapkan ini juga)

**[Open] What is the novelty / why is this publishable? / Apa kebaruannya / kenapa layak terbit?**
🇬🇧 The novelty is methodological: a non-circular protocol and the first such evidence in this niche, with an honest negative result against neural and learned methods. It is applied, moderate-scope research — and stated as such.
🇮🇩 Kebaruannya metodologis: protokol non-sirkular dan bukti pertama di niche ini, dengan negative result jujur terhadap metode neural dan learned. Ini riset terapan berlingkup moderat — dan dinyatakan apa adanya.

**[Open] What if you get user interactions later? / Bagaimana jika nanti ada data interaksi?**
🇬🇧 Then collaborative and KG methods become applicable and could be added; our content-based engine would serve as a strong cold-start and explainable component.
🇮🇩 Maka metode kolaboratif dan KG jadi bisa dipakai dan ditambahkan; mesin berbasis konten kami akan menjadi komponen cold-start yang kuat dan explainable.

**[Open] How does it scale to thousands of products? / Bagaimana skalanya ke ribuan produk?**
🇬🇧 It is sparse and parameter-free, so scoring is fast; the main cost is building the co-occurrence vectors, which is linear and cacheable.
🇮🇩 Sparse dan parameter-free, jadi penilaiannya cepat; biaya utama membangun vektor ko-okurensi, yang linear dan bisa di-cache.

**[Open] How do you handle a brand-new product (cold start)? / Bagaimana produk baru (cold start)?**
🇬🇧 As long as it has accords, it enters immediately — being content-based, it needs no interaction history. That is a strength here.
🇮🇩 Selama punya accord, langsung masuk — karena content-based, tak butuh histori interaksi. Itu kelebihan di sini.

**[Open] How do you objectively know two perfumes "smell similar"? / Bagaimana objektif tahu dua parfum "mirip"?**
🇬🇧 We use the imitation ("dupe") relation as ground truth — a documented engineering intent — not subjective smell tests. We are clear it is a perceptual proxy, not user satisfaction.
🇮🇩 Kami pakai relasi tiruan ("dupe") sebagai ground-truth — niat rekayasa yang terdokumentasi — bukan uji bau subjektif. Kami jelas bahwa ini proxy perseptual, bukan kepuasan user.

**[Open] What do you hope to get from this collaboration? / Apa yang diharapkan dari kolaborasi ini?**
🇬🇧 Three concrete things: validating the explanations rigorously, testing across other catalogs/domains, and exploring asymmetric similarity. I would value the team's expertise on these.
🇮🇩 Tiga hal konkret: memvalidasi penjelasan secara ketat, menguji ke katalog/domain lain, dan mengeksplor asymmetric similarity. Saya sangat menghargai keahlian tim untuk ini.

**[Open] Biggest limitation? / Limitasi terbesar?**
🇬🇧 Honestly: the modest effect size and the single proprietary catalog. Also binary accords (no intensity) and a perceptual proxy rather than user satisfaction.
🇮🇩 Jujur: ukuran efek yang modest dan katalog proprietary tunggal. Juga accord biner (tanpa intensitas) dan proxy perseptual, bukan kepuasan user.
