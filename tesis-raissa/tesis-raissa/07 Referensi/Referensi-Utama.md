---
tags: [tesis, referensi, xai, crs]
status: draft
sumber: Consensus (Semantic Scholar/Scopus/PubMed/ArXiv)
---

# Referensi Utama — XAI-CRS Domain Parfum

Arah penelitian (dari [[ieee-conference-xai]]): efek **jenis penjelasan XAI** (feature-based / narrative-based / comparative-based) terhadap **trust** dan **purchase intention** pada **conversational recommender system** di **domain hedonis-sensorik (parfum)**; desain between-subjects 3 kondisi, n=90.

**Kriteria:** 24 referensi utama = jurnal Q1/Q2, terbit 2021–2026. 6 referensi pendukung = karya seminal di luar 5 tahun terakhir. Total **30**.

> [!warning] Yang harus diverifikasi sendiri
> - **Kuartil (Q1/Q2)** di bawah ini adalah estimasi berdasarkan reputasi jurnal. Cek final di **Scimago (scimagojr.com)** per tahun terbit sebelum submit.
> - Referensi **#29 dan #30** tidak berasal dari pencarian Consensus — itu klasik yang saya rekomendasikan dari pengetahuan umum. **Wajib verifikasi sitasi lengkapnya** (volume, halaman, DOI) sebelum dipakai.

---

## A. Jenis Penjelasan dalam XAI & Recommender Systems
> Untuk: §I.A Background, §II.A Explanation Types, §VI.A Interpreting the Effect

**[1] ⭐ ANCHOR PAPER — [When Post Hoc Explanation Knocks: Consumer Responses to Explainable AI Recommendations](https://consensus.app/papers/details/9d5e2162415d5efda9ba22d6801eed82/?utm_source=claude_desktop)**
Chen et al., 2023, *Journal of Interactive Marketing* (Q1), 45 sitasi.
→ Ini **fondasi teoretis utama** Raissa. Empat studi membuktikan: efek post hoc explanation **lebih kuat di domain utilitarian daripada hedonis**, dan **jenis penjelasan** memoderasi efektivitas — *attribute-based* lebih efektif di domain utilitarian, *user-based* lebih efektif di domain hedonis. Pakai untuk merumuskan gap (§I.B) **dan** untuk membahas temuan kontra-intuitif B→trust terendah (§VI.A).

**[2] [Towards Human-Centered Explainable AI: A Survey of User Studies for Model Explanations](https://consensus.app/papers/details/2bed0d82d13f5a1e8f33716cb026884f/?utm_source=claude_desktop)**
Rong et al., 2022, *IEEE TPAMI* (Q1), 247 sitasi.
→ Survei 97 studi user-based XAI, dikategorikan per trust/understanding/usability. Sitasi untuk `[ref: XAI survey]` di §I.A dan untuk justifikasi desain user study di §IV.

**[3] [AI Trust: Can Explainable AI Enhance Warranted Trust?](https://consensus.app/papers/details/0179a98b25545597a78bd4e6acfd195f/?utm_source=claude_desktop)**
de Brito Duarte et al., 2023, *Human Behavior and Emerging Technologies* (Q1), 56 sitasi.
→ Eksperimen n=215: penjelasan **feature importance menghasilkan trust lebih tinggi daripada counterfactual**. Bukti langsung bahwa jenis penjelasan ≠ setara — dukungan kuat untuk H1.

**[4] [A Survey of Contrastive and Counterfactual Explanation Generation Methods for XAI](https://consensus.app/papers/details/404c8770cbc056889ed2bd703f6960bf/?utm_source=claude_desktop)**
Stepin et al., 2021, *IEEE Access* (Q1), 389 sitasi.
→ Taksonomi penjelasan kontrastif. Landasan konseptual untuk **kondisi C (comparative-based)** di §III.B dan §VI.A.

**[5] [Explainable recommendation: when design meets trust calibration](https://consensus.app/papers/details/589d7b68c0b5596fb0ec1710101b8a95/?utm_source=claude_desktop)**
Naiseh et al., 2021, *World Wide Web* (Q1), 55 sitasi.
→ Trust calibration error: penjelasan bisa memicu persetujuan irasional. Berguna untuk §VI.B (jangan klaim "trust tinggi = selalu baik").

**[6] [An explainable content-based approach for recommender systems](https://consensus.app/papers/details/6883d5cd8e6e5f1a8193b7eb70badd40/?utm_source=claude_desktop)**
de Campos et al., 2024, *UMUAI* (Q1), 19 sitasi.
→ User study yang mengukur transparency, satisfaction, trust, scrutability. Contoh operasionalisasi konstruk untuk §IV.C.

---

## B. Conversational Recommender Systems
> Untuk: §II.B Explanations in CRS, §III.C Conversational Interface

**[7] [A Survey on Conversational Recommender Systems](https://consensus.app/papers/details/4bf3fb33166c570696c27f073bcacbba/?utm_source=claude_desktop)**
Jannach et al., 2021, *ACM Computing Surveys* (Q1), 570 sitasi.
→ Survei rujukan standar CRS. Sitasi wajib di §I.A dan §II.B.

**[8] [Understanding and Predicting User Satisfaction with Conversational Recommender Systems](https://consensus.app/papers/details/57e3d26c4cec52a9b930be52c6707f8e/?utm_source=claude_desktop)**
Siro et al., 2023, *ACM TOIS* (Q1), 27 sitasi.
→ Enam aspek dialog yang membentuk satisfaction. Rujukan untuk pengukuran Satisfaction di §IV.C dan §V.E.

**[9] ⭐ [The effect of preference elicitation methods on the user experience in conversational recommender systems](https://consensus.app/papers/details/eb7fa390fa025e7ba17da71cb7e72939/?utm_source=claude_desktop)**
Ziegfeld et al., 2024, *Computer Speech & Language* (Q2), 5 sitasi.
→ **Paralel metodologis paling dekat**: between-subjects, 3 kondisi CRS, n=66, mengukur 10 konstruk UX. Menariknya **tidak menemukan efek signifikan pada ukuran subjektif** — pakai ini untuk memposisikan temuan Raissa yang justru signifikan, dan untuk membenarkan desain 3-kondisi di §IV.A.

**[10] [Explaining Recommendations through Conversations: Dialog Model and the Effects of Interface Type and Degree of Interactivity](https://consensus.app/papers/details/e1d174ce8c9e5d48a4c3a2d1d21e7fbc/?utm_source=claude_desktop)**
Hernandez-Bocanegra & Ziegler, 2023, *ACM TiiS* (Q2), 35 sitasi.
→ Penjelasan lewat percakapan (chatbot vs GUI), SEM ke transparency–trust–effectiveness. Rujukan inti §II.B.

**[11] [User Experience and the Role of Personalization in Critiquing-Based Conversational Recommendation](https://consensus.app/papers/details/89e87316b1f059578286419da6fd3ae4/?utm_source=claude_desktop)**
Rana et al., 2023, *ACM Transactions on the Web* (Q2), 16 sitasi.
→ User study n=228 tentang perilaku kritik & kepuasan dalam CRS.

---

## C. Arsitektur: LLM + Knowledge Graph Embedding
> Untuk: §III.A Architecture Overview (dasar klaim CR-HKGE, bukan RAG)

**[12] [Recommender Systems in the Era of Large Language Models (LLMs)](https://consensus.app/papers/details/e797e68b57fb5dd397363960ce811704/?utm_source=claude_desktop)**
Fan et al., 2023, *IEEE TKDE* (Q1), 547 sitasi.
→ Survei paradigma pre-training/fine-tuning/**prompting**. Justifikasi teoretis untuk *system-prompt conditioning tanpa fine-tuning* di §III.B.

**[13] [Recommender AI Agent: Integrating Large Language Models for Interactive Recommendations](https://consensus.app/papers/details/ab5ff0ee6ac25703b9571cda308d5a40/?utm_source=claude_desktop)**
Huang et al., 2023, *ACM TOIS* (Q1), 248 sitasi.
→ InteRecAgent: LLM sebagai "otak", model rekomendasi sebagai "alat". **Ini padanan arsitektur GPT-4o-mini + CR-HKGE milik Raissa** — sitasi untuk menegaskan pemisahan LLM/backend (bukan RAG).

**[14] [CoreSense: Social Commonsense Knowledge-Aware Context Refinement for Conversational Recommender System](https://consensus.app/papers/details/706d026eab76511b8586347c15c3f218/?utm_source=claude_desktop)**
Yang et al., 2025, *IEEE TKDE* (Q1), 3 sitasi.
→ KG + CRS yang menangkap *emotional states* dari konteks dialog. Relevan untuk domain hedonis.

**[15] [Preference-aware Graph Attention Networks for Cross-Domain Recommendations with Collaborative Knowledge Graph](https://consensus.app/papers/details/88753a5214325b6cafb2729acb5a1920/?utm_source=claude_desktop)**
Li et al., 2022, *ACM TOIS* (Q1), 32 sitasi.
→ Salah satu dari 5 rujukan CR-HKGE (kategori KGAT/collaborative KG).

**[16] [Knowledge Graph Enhanced Contextualized Attention-Based Network for Responsible User-Specific Recommendation](https://consensus.app/papers/details/ddad8a3b22ab5c8bbc4b7aeec86b1124/?utm_source=claude_desktop)**
Elahi et al., 2024, *ACM TIST* (Q1), 34 sitasi.
→ KGCAN — hierarchical/heterogeneous KG attention. Rujukan CR-HKGE kedua.

---

## D. Trust, Gaya Percakapan, dan Purchase Intention
> Untuk: §II.C, §V.D, dan **penjelasan temuan kontra-intuitif B→trust terendah (§VI.A)**

**[17] ⭐⭐ KUNCI UNTUK TEMUAN KONTRA-INTUITIF — [How does anthropomorphism promote consumer responses to social chatbots: mind perception perspective](https://consensus.app/papers/details/752cf1c163045b21a1929c25bf34a17d/?utm_source=claude_desktop)**
Li et al., 2024, *Internet Research* (Q1), 19 sitasi.
→ **Ini penjelasan teoretis terbaik untuk H1**: gaya percakapan **kompeten** mengungguli gaya **hangat** pada tugas berorientasi-**kognisi**, dan sebaliknya pada tugas berorientasi-**emosi**, dimediasi *agent-mind* vs *experience-mind perception*. Argumen Raissa jadi kuat: pemilihan parfum dibingkai user sebagai **tugas evaluatif-kognitif**, sehingga narasi emosional (kondisi B) melemahkan sinyal kompetensi → trust turun.

**[18] [Human vs. AI: Understanding the impact of anthropomorphism on consumer response to chatbots from the perspective of trust and relationship norms](https://consensus.app/papers/details/c0ba7e71f4055904b20714b671197987/?utm_source=claude_desktop)**
Cheng et al., 2022, *Information Processing & Management* (Q1), 424 sitasi.
→ *Perceived warmth* dan *perceived competence* keduanya menaikkan trust, tapi **exchange relationship memperkuat bobot kompetensi**. Konteks belanja = exchange relationship → mendukung interpretasi §VI.A.

**[19] [How do AI Chatbots Affect Customer Purchase? Uncovering the Dual Pathways of Anthropomorphism on Service Evaluation](https://consensus.app/papers/details/6c75e0cb8cd0589e9b4af6a54a090c00/?utm_source=claude_desktop)**
Li et al., 2023, *Information Systems Frontiers* (Q1), 42 sitasi.
→ Jalur ganda warmth/competence → trust **dan** chatbot overload → evaluasi layanan → pembelian. Berguna untuk menjelaskan mengapa hubungan trust→PI bisa **lemah** (§VI.B, ρ=0,229).

**[20] [Blame the Bot: Anthropomorphism and Anger in Customer–Chatbot Interactions](https://consensus.app/papers/details/5660e86092bf5328b8c1bdb24f681a31/?utm_source=claude_desktop)**
Crolic et al., 2021, *Journal of Marketing* (Q1), 602 sitasi.
→ Bukti Q1 teratas bahwa **antropomorfisme bisa menjadi bumerang** tergantung konteks. Preseden kuat untuk membingkai temuan B sebagai kontribusi, bukan anomali.

**[21] [Trust me, if you can: factors that influence consumers' purchase intention triggered by chatbots](https://consensus.app/papers/details/de59bc1e250e5f77be5a9c98bf027336/?utm_source=claude_desktop)**
Yen & Chiang, 2021, *Behaviour & Information Technology* (Q1), 227 sitasi.
→ Rantai **trust → purchase intention** pada chatbot, divalidasi kuesioner + EEG. Rujukan langsung H3.

---

## E. Domain Hedonis / Sensorik
> Untuk: §I.B Gap, §II.D Sensory/Hedonic Product Domains

**[22] [Perceived deception and online repurchase intention: The moderating effect of product type and consumer regulatory orientation](https://consensus.app/papers/details/ec5da79ac90051f2af7bacd2e9678172/?utm_source=claude_desktop)**
Wang et al., 2022, *Journal of Consumer Behaviour* (Q1), 24 sitasi.
→ Tiga studi: produk **hedonis vs utilitarian** memoderasi jalur ke repurchase intention. Bukti empiris bahwa tipe produk mengubah pemrosesan informasi — inti argumen gap Raissa.

**[23] [The Impact of Negative Reviews on Online Search and Purchase Decisions](https://consensus.app/papers/details/dfa1057033c65dc99547c1acfa1ae3b6/?utm_source=claude_desktop)**
Varga & Albuquerque, 2023, *Journal of Marketing Research* (Q1), 59 sitasi.
→ Efek informasi berlaku pada produk **utilitarian tapi tidak hedonis**, dan tidak pada faktor **taste-related**. Argumen kuat bahwa domain sensorik memang berperilaku beda — pembenaran memilih parfum.

---

## F. Familiaritas & Keahlian sebagai Moderator (RQ3)
> Untuk: §I.C RQ3, §V.D H4, §VI.C

**[24] ⭐ [The role of domain expertise in trusting and following explainable AI decision support systems](https://consensus.app/papers/details/a91d726b74e05fba8a550148e2e4f676/?utm_source=claude_desktop)**
Bayer et al., 2021, *Journal of Decision Systems* (Q2), 93 sitasi.
→ Keahlian domain **menurunkan** trust pada XAI; penjelasan "mungkin terlalu dilebih-lebihkan" untuk user berkeahlian rendah. Landasan hipotesis H4 — sekaligus konteks untuk membahas mengapa moderasi tidak ditemukan.

**[25] [How people reason with counterfactual and causal explanations for AI decisions in familiar and unfamiliar domains](https://consensus.app/papers/details/5a2ca7c51a875ad8823641b74d3ddbaf/?utm_source=claude_desktop)**
Celar & Byrne, 2023, *Memory & Cognition* (Q1), 39 sitasi.
→ Empat eksperimen (n=731) yang **secara eksplisit menyilangkan jenis penjelasan × familiaritas domain**. Struktur desain paling mirip H4 — pakai untuk membingkai H4 dan untuk membahas keterbatasan power (§VI.C, sel novice hanya ~8–12).

---

## Referensi Pendukung (seminal, di luar 5 tahun terakhir)

**[26] ⭐ [Recommendation Agents for Electronic Commerce: Effects of Explanation Facilities on Trusting Beliefs](https://consensus.app/papers/details/d85d217f42f05758a194a8cfa91b393f/?utm_source=claude_desktop)**
Wang & Benbasat, 2007, *Journal of Management Information Systems* (Q1), 515 sitasi.
→ **Wajib disitasi.** Studi pionir yang membuktikan **jenis penjelasan berbeda membangun trusting belief yang berbeda** (how→competence+benevolence, why→benevolence, trade-off→integrity). Persis premis Raissa, 18 tahun lebih awal. Sitasi di §II.A dan §II.C.

**[27] [Evaluating recommender systems from the user's perspective: survey of the state of the art](https://consensus.app/papers/details/36ecd7e45a2457c48777268dcd630973/?utm_source=claude_desktop)**
Pu, Chen & Hu, 2012, *UMUAI* (Q1), 401 sitasi.
→ **Versi jurnal dari kerangka ResQue.** Pakai ini menggantikan paper konferensi RecSys 2011 untuk `[ref: Pu et al./ResQue]` di §IV.C.

**[28] [Evaluating the effectiveness of explanations for recommender systems](https://consensus.app/papers/details/28539ef776e15c639daa90bbe6939704/?utm_source=claude_desktop)**
Tintarev & Masthoff, 2012, *UMUAI* (Q1), 337 sitasi.
→ Tujuh tujuan penjelasan (effectiveness, satisfaction, transparency, scrutability, trust, persuasiveness, efficiency). Sumber `[ref: Tintarev & Masthoff]` di §II.A. **Versi jurnal, bukan konferensi.**

**[29] [Explaining the user experience of recommender systems](https://consensus.app/papers/details/ce5b8bf4406252729d7484e7ff97e554/?utm_source=claude_desktop)**
Knijnenburg et al., 2012, *UMUAI* (Q1), 880 sitasi.
→ Kerangka evaluasi user-centric: objective system aspects → subjective aspects → experience → behavior. Peta konseptual untuk memposisikan `scent_trial` (ukuran perilaku) relatif terhadap konstruk sikap di §V.E.

**[30] Perlu verifikasi — McKnight, Choudhury & Kacmar (2002), "Developing and Validating Trust Measures for e-Commerce," *Information Systems Research* 13(3), 334–359.**
→ Sumber asli konstruk trusting beliefs (competence/benevolence/integrity) untuk `[ref: McKnight]` di §IV.C. **Tidak muncul di pencarian Consensus** — saya rekomendasikan dari pengetahuan umum, jadi **cek sendiri detail volume/halaman/DOI**.

---

## Cadangan (jika ada slot tersisa / diminta reviewer)

Metodologis — kemungkinan besar tetap dibutuhkan untuk §IV.F & §V.B, tapi belum masuk kuota 30:

- **Eisinga, Grotenhuis & Pelzer (2013)**, *International Journal of Public Health* — reliabilitas skala 2-item pakai Spearman-Brown, bukan Cronbach. **Krusial** untuk membenarkan split-half di §IV.F. Verifikasi sitasi sendiri.
- **Landis & Koch (1977)**, *Biometrics* — ambang interpretasi Cohen's κ (§V.A). Verifikasi sendiri.
- **Davis (1989)**, *MIS Quarterly* — TAM / perceived usefulness (§IV.C). Verifikasi sendiri.
- [A systematic review and taxonomy of explanations in decision support and recommender systems](https://consensus.app/papers/details/db5aecabfefb5bc5bf0e187940b8d890/?utm_source=claude_desktop) — Nunes & Jannach, 2017, *UMUAI* (Q1), 384 sitasi.
- [Sentimentally enhanced conversation recommender system](https://consensus.app/papers/details/1c19cd2267765f3a8b07ab0c8b88dd38/?utm_source=claude_desktop) — Liu et al., 2025, *Complex & Intelligent Systems* (Q1) — KG + emosi dalam CRS.
- [Enhancing chatbot effectiveness: The role of anthropomorphic conversational styles and time orientation](https://consensus.app/papers/details/630b6da24b5e5eddaf449c16246bac88/?utm_source=claude_desktop) — Roy & Naidoo, 2021, *Journal of Business Research* (Q1), 335 sitasi.

---

## Catatan Celah

Dua hal yang **tidak** saya temukan dalam pencarian dan patut disebut sebagai kontribusi orisinal di §I.D:

1. **Tidak ada studi Q1/Q2 yang menguji jenis penjelasan XAI secara komparatif di domain parfum/olfaktori.** Studi sensorik yang ada berpusat pada makanan dan anggur, bukan wewangian.
2. **Tidak ada yang menyilangkan *narrative-based explanation* dengan trust dalam CRS.** Literatur antropomorfisme membahas *gaya percakapan* hangat-vs-kompeten ([17], [18]), tapi bukan *isi penjelasan* yang naratif. Ini celah nyata yang diisi kondisi B Raissa.
