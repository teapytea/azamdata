# Speaker Script — Order-2 Co-occurrence for Interaction-Free Perfume Recommendation
**Naskah Presentasi (English + Bahasa Indonesia)** · 14 slides · ~10–12 minutes

> Tips: bicara pelan, 1 ide per kalimat. Slide **4–6** (gap & ide) dan **10–11** (hasil) adalah inti — beri waktu lebih. Jeda sejenak setelah angka penting.

---

## Slide 1 — Title

**🇬🇧 English**
> Good morning, and thank you for this opportunity. My name is Azam Azri, from the Master's program in Informatics at UGM. Today I will present a joint research project with Aromatique, an Indonesian perfume brand. The goal is a perfume recommender for a setting that is surprisingly difficult: very little data, and no user interactions at all. The title is *"Order-2 Co-occurrence for Interaction-Free Perfume Recommendation."*

**🇮🇩 Bahasa Indonesia**
> Selamat pagi, dan terima kasih atas kesempatannya. Nama saya Azam Azri, dari program Magister Informatika UGM. Hari ini saya akan memaparkan penelitian kolaborasi dengan Aromatique, sebuah brand parfum Indonesia. Tujuannya membangun sistem rekomendasi parfum untuk kondisi yang ternyata sulit: data sangat sedikit, dan tanpa interaksi pengguna sama sekali. Judulnya *"Order-2 Co-occurrence for Interaction-Free Perfume Recommendation."*

---

## Slide 2 — What we built

**🇬🇧 English**
> In one sentence: this work builds the recommendation *engine* that lives inside a customer-facing chatbot for Aromatique. Four words describe the whole setting. The object is perfume. The partner is Aromatique. The data is small. And the setting is interaction-free — meaning we only have product content, no ratings or clicks. My part of the project is specifically the recommender, not the whole system.

**🇮🇩 Bahasa Indonesia**
> Singkatnya: penelitian ini membangun *mesin* rekomendasi yang ada di dalam chatbot pelanggan Aromatique. Empat kata merangkum keseluruhan konteksnya. Objeknya parfum. Mitranya Aromatique. Datanya kecil. Dan setting-nya interaction-free — artinya kita hanya punya konten produk, tanpa rating atau klik. Bagian saya khusus pada sistem rekomendasinya, bukan keseluruhan sistem.

---

## Slide 3 — Motivation (origin story)

**🇬🇧 English**
> Here is where the problem comes from. Aromatique runs branches across many Indonesian cities and provinces. At peak hours, a few staff simply cannot serve a large crowd — a real bottleneck. So we started a joint project: a colleague builds the chatbot, focusing on human–computer interaction, and I build the recommender inside it. The idea is simple: while a customer waits, they open the chatbot and type their preference freely — for example, *"a perfume for school"* — and the system returns the Top-3 most relevant Aromatique products.

**🇮🇩 Bahasa Indonesia**
> Inilah asal-muasal masalahnya. Aromatique punya banyak cabang di berbagai kota dan provinsi di Indonesia. Saat jam ramai, staf yang sedikit tidak sanggup melayani pelanggan yang banyak — terjadi bottleneck. Maka kami memulai penelitian gabungan: teman saya membangun chatbot dengan fokus interaksi manusia–komputer, dan saya membangun sistem rekomendasi di dalamnya. Idenya sederhana: sambil menunggu, pelanggan membuka chatbot dan bebas mengetik preferensinya — misalnya *"parfum untuk ke sekolah"* — lalu sistem menampilkan Top-3 produk Aromatique yang paling relevan.

---

## Slide 4 — Related work

**🇬🇧 English**
> Before proposing anything, I looked at how existing perfume recommenders are built. A journal study by Fannisa and colleagues shows a simple TF-IDF content-based filter beating a Word2Vec variant. Lutan's survey points to subjectivity and sparse sensory data as the core obstacles. And Nurmuthia and colleagues rank perfumes using cosine and Jaccard similarity over note descriptions. The common pattern: all of them are content-based, all use single-accord similarity over note text, and none of them carry user interactions.

**🇮🇩 Bahasa Indonesia**
> Sebelum mengusulkan apa pun, saya melihat bagaimana sistem rekomendasi parfum yang ada dibangun. Studi jurnal oleh Fannisa dkk. menunjukkan filter berbasis konten TF-IDF yang sederhana mengalahkan varian Word2Vec. Survei Lutan menyoroti subjektivitas dan data sensori yang sparse sebagai kendala utama. Dan Nurmuthia dkk. memeringkat parfum memakai kemiripan cosine dan Jaccard atas deskripsi notes. Polanya sama: semuanya berbasis konten, memakai kemiripan accord tunggal atas teks notes, dan tidak ada yang punya interaksi pengguna.

---

## Slide 5 — Research gaps (the heart of the problem)

**🇬🇧 English**
> From all of this, three gaps stand out — and I deliberately back each one with Q1 journals. First, *order-1 only*: existing methods treat each accord independently. Co-occurrence is known to help, but only in settings that have user interactions. Second, *needs interactions*: the strongest modern recommenders — graph and knowledge-graph models — learn from a user–item signal that our data simply does not have, so they cannot even run here. Third, *complex overfits*: on small, imbalanced data, flexible and neural models repeatedly lose to simple baselines. So the question becomes: what actually works when the data is small and interaction-free?

**🇮🇩 Bahasa Indonesia**
> Dari semua itu, ada tiga gap yang menonjol — dan sengaja saya sandarkan masing-masing pada jurnal Q1. Pertama, *order-1 saja*: metode yang ada memperlakukan tiap accord secara independen. Ko-okurensi diketahui membantu, tapi hanya pada setting yang punya interaksi. Kedua, *butuh interaksi*: rekomendasi modern terkuat — model graph dan knowledge-graph — belajar dari sinyal user–item yang tidak dimiliki data kita, sehingga tidak bisa dijalankan di sini. Ketiga, *yang kompleks overfit*: pada data kecil dan tidak seimbang, model fleksibel dan neural berulang kali kalah dari baseline sederhana. Maka pertanyaannya: apa yang benar-benar bekerja saat data kecil dan interaction-free?

---

## Slide 6 — Proposed method

**🇬🇧 English**
> My proposal answers three "why" questions. Why not just order-1? Because single accords overlap too much, so look-alike perfumes are hard to tell apart. Why co-occurrence? Because *which accords appear together* acts like a signature — a rare pair, such as amber together with cinnamon, separates the right product from the rest. And why not embeddings, like Word2Vec or Sentence-BERT? Because they blur those exact rare pairs into smooth latent vectors and overfit on small data. So I use order-2 — pairs — not order-3, which is too sparse. And the matcher is parameter-free by design: with no trained weights, it cannot overfit.

**🇮🇩 Bahasa Indonesia**
> Usulan saya menjawab tiga pertanyaan "kenapa". Kenapa bukan order-1 saja? Karena accord tunggal terlalu banyak tumpang-tindih, sehingga parfum yang mirip sulit dibedakan. Kenapa ko-okurensi? Karena *accord mana yang muncul bersama* berfungsi seperti sidik jari — pasangan langka, misalnya amber bersama cinnamon, memisahkan produk yang benar dari yang lain. Dan kenapa bukan embedding seperti Word2Vec atau Sentence-BERT? Karena mereka melarutkan pasangan langka itu menjadi vektor laten yang halus, lalu overfit di data kecil. Maka saya pakai order-2 — pasangan — bukan order-3 yang terlalu sparse. Dan matcher-nya parameter-free by design: tanpa bobot terlatih, ia tidak bisa overfit.

---

## Slide 7 — How it works

**🇬🇧 English**
> Mechanically, the pipeline is simple. A free-text preference is turned into a set of accords. From those, we build accord *pairs*, and weight everything by rarity — rare, distinctive tokens count more. We then compare the query to all 340 products with a single cosine score, and return the Top-3 with their reasons. The nice property is that this one score splits cleanly into an order-1 part — single accords — and an order-2 part — accord pairs — and those pairs become the explanation.

**🇮🇩 Bahasa Indonesia**
> Secara mekanis, alurnya sederhana. Preferensi teks bebas diubah menjadi sekumpulan accord. Dari situ kita bentuk *pasangan* accord, lalu membobotinya berdasarkan kelangkaan — token yang langka dan khas dihitung lebih besar. Kemudian query dibandingkan dengan seluruh 340 produk lewat satu skor cosine, dan dikembalikan Top-3 beserta alasannya. Kelebihannya, satu skor ini terpisah rapi menjadi bagian order-1 — accord tunggal — dan bagian order-2 — pasangan accord — dan pasangan itulah yang menjadi penjelasannya.

---

## Slide 8 — Non-circular evaluation

**🇬🇧 English**
> Now, the most important methodological point. In studies like this, the biggest risk is leakage — features secretly carrying the answer, which makes a method look good for the wrong reason. To prevent it, I use a three-source firewall. Item features come from the local catalog. Query features come from an external source, Fragrantica, verified independently. And the ground-truth label is a held-out "imitates" edge. Because the three are kept independent, the evaluation is non-circular by construction. This directly answers the second gap.

**🇮🇩 Bahasa Indonesia**
> Sekarang, poin metodologis terpenting. Pada studi seperti ini, risiko terbesar adalah kebocoran — fitur diam-diam membawa jawaban, sehingga metode tampak bagus karena alasan yang salah. Untuk mencegahnya, saya pakai firewall tiga-sumber. Fitur item berasal dari katalog lokal. Fitur query berasal dari sumber eksternal, Fragrantica, yang diverifikasi secara independen. Dan label ground-truth adalah edge "meniru" yang di-hold-out. Karena ketiganya dijaga independen, evaluasinya non-sirkular secara konstruksi. Ini langsung menjawab gap kedua.

---

## Slide 9 — Experimental setup

**🇬🇧 English**
> The setup, in numbers. We have 340 Aromatique products, 209 queries, and 56 shared accords. Crucially, I did not just propose one method — I ran a fair tournament of 15 methods across four families: marginal similarity, neural embeddings, perceptual taxonomy, and learned models. Every method is evaluated the same way — leave-one-out ranking, MRR and Hits@k, with paired significance tests.

**🇮🇩 Bahasa Indonesia**
> Setup-nya, dalam angka. Kita punya 340 produk Aromatique, 209 query, dan 56 accord yang beririsan. Yang penting, saya tidak hanya mengusulkan satu metode — saya mengadu 15 metode secara adil dalam empat keluarga: kemiripan marginal, embedding neural, taksonomi perseptual, dan model learned. Semua metode dievaluasi dengan cara yang sama — peringkat leave-one-out, MRR dan Hits@k, dengan uji signifikansi berpasangan.

---

## Slide 10 — Result (the chart)

**🇬🇧 English**
> Here is the main result. The vertical axis is MRR — simply, how high the correct product sits in the ranking; higher is better. The proposed order-2 method, in amber, is the highest of all 15 methods, about nine percent above the standard TF-IDF baseline. And notice the rest: the neural, perceptual, and high-dimensional learned methods all fall *below* even the simple baseline.

**🇮🇩 Bahasa Indonesia**
> Inilah hasil utamanya. Sumbu vertikal adalah MRR — sederhananya, seberapa tinggi produk yang benar berada di peringkat; makin tinggi makin baik. Metode order-2 usulan saya, yang berwarna amber, paling tinggi dari 15 metode, sekitar sembilan persen di atas baseline TF-IDF standar. Dan perhatikan sisanya: metode neural, perseptual, dan learned high-dimensional semuanya jatuh *di bawah* baseline sederhana sekalipun.

---

## Slide 11 — Key finding

**🇬🇧 English**
> This leads to the headline finding: simple beats complex. The comparators fail at two levels. Some — neural embeddings, perceptual transport, high-dimensional learned models — overfit and fall clearly below the baseline. Others — moderate learned models like PPMI-SVD and gradient boosting — only *tie* the baseline; they never beat my order-2 method. The takeaway: on small, interaction-free data, adding model capacity does not help — it hurts.

**🇮🇩 Bahasa Indonesia**
> Ini mengarah ke temuan utama: yang sederhana mengalahkan yang kompleks. Para pembanding gagal di dua tingkat. Sebagian — embedding neural, transport perseptual, model learned high-dimensional — overfit dan jatuh jelas di bawah baseline. Sebagian lain — model learned moderat seperti PPMI-SVD dan gradient boosting — hanya *menyamai* baseline; tidak pernah melampaui metode order-2 saya. Intinya: pada data kecil dan interaction-free, menambah kapasitas model tidak membantu — malah merugikan.

---

## Slide 12 — Honest numbers

**🇬🇧 English**
> I want to be honest about the size of the win. The improvement is about nine percent over the baseline — modest. But it is statistically solid, with a p-value of 8.7 times ten to the minus eight. And the decomposition shows 81 percent of the signal comes from the accord *pairs*, not single accords — so it is a real second-order effect. The reason it cannot be larger is built into the task: an imitation perfume already shares about 86 percent of the reference's accords, so there is little room left.

**🇮🇩 Bahasa Indonesia**
> Saya ingin jujur soal besar kemenangannya. Peningkatannya sekitar sembilan persen di atas baseline — modest. Tapi secara statistik kokoh, dengan p-value 8,7 kali sepuluh pangkat minus delapan. Dan dekomposisinya menunjukkan 81 persen sinyal berasal dari *pasangan* accord, bukan accord tunggal — jadi ini efek orde-dua yang nyata. Alasan kenapa tidak bisa lebih besar memang melekat pada tugasnya: parfum tiruan sudah berbagi sekitar 86 persen accord dari acuannya, sehingga ruang peningkatannya kecil.

---

## Slide 13 — Explainability / use case

**🇬🇧 English**
> Finally, let me close the loop back to the chatbot. When a customer types *"a perfume for school"*, the system returns the Top-3, and each pick comes with the accord *pairs* that justify it. These reasons are faithful by construction — they are the exact pieces that produced the score, not a guess made after the fact. That makes the recommendation auditable, and it is a ready hand-off to the chatbot's explainability layer. (This example is illustrative.)

**🇮🇩 Bahasa Indonesia**
> Terakhir, izinkan saya menutup lingkaran kembali ke chatbot. Saat pelanggan mengetik *"parfum untuk ke sekolah"*, sistem mengembalikan Top-3, dan tiap pilihan disertai *pasangan* accord yang menjadi alasannya. Alasan ini faithful secara konstruksi — itu adalah komponen persis yang menghasilkan skornya, bukan tebakan yang dibuat belakangan. Hal ini membuat rekomendasi bisa diaudit, dan siap diserahkan ke lapisan explainability di chatbot. (Contoh ini bersifat ilustratif.)

---

## Slide 14 — Conclusion & collaboration

**🇬🇧 English**
> To conclude: this work contributes a finding, an honest non-circular protocol, and a deployable recommender for Aromatique. I see three directions we could explore together: validating the explanations with a counterfactual study; testing the method across other catalogs and markets; and exploring asymmetric similarity, since an imitation is essentially an accord-subset of its reference. Thank you very much — I would be glad to discuss any of these. 

**🇮🇩 Bahasa Indonesia**
> Sebagai penutup: penelitian ini menyumbang sebuah temuan, protokol non-sirkular yang jujur, dan sistem rekomendasi yang siap dipakai untuk Aromatique. Saya melihat tiga arah yang bisa kita eksplor bersama: memvalidasi penjelasan lewat studi counterfactual; menguji metode ini ke katalog dan pasar lain; dan mengeksplorasi asymmetric similarity, karena tiruan pada dasarnya adalah subset accord dari acuannya. Terima kasih banyak — saya senang mendiskusikan ini lebih lanjut.

---

## Q&A — siapkan jawaban singkat

**"What is this recommender based on?" / "Sistem ini basisnya apa?"**
> EN: *Content-based filtering* — from item features (accords), specifically accord co-occurrence (pairs). No user data, so it is purely item-to-item.
> ID: *Content-based filtering* — dari fitur item (accord), khususnya ko-okurensi accord (pasangan). Tanpa data pengguna, jadi murni item-ke-item.

**"Why not deep learning / KGAT?" / "Kenapa bukan deep learning / KGAT?"**
> EN: Those need a user–item interaction signal we don't have, and on small data they overfit — which our 15-method benchmark confirms.
> ID: Itu butuh sinyal interaksi user–item yang tidak kita miliki, dan pada data kecil mereka overfit — yang dikonfirmasi oleh benchmark 15-metode kami.

**"Is +9% enough?" / "Apakah +9% cukup?"**
> EN: It is modest but robust and significant; more importantly, the contribution is the finding and the protocol, not chasing a higher number.
> ID: Modest tapi robust dan signifikan; yang lebih penting, kontribusinya adalah temuan dan protokol, bukan mengejar angka lebih tinggi.
