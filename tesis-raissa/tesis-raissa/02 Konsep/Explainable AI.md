---
tags: [konsep]
bagian-paper: "I.A, II.A"
---

# Explainable AI (XAI)

Usaha membuat sistem AI menjelaskan **kenapa** ia menghasilkan keluaran tertentu, supaya user bisa memahami, menilai, dan memutuskan seberapa jauh mau memercayainya.

## Kenapa penting di recommender system

Recommender modern = kotak hitam. Tanpa penjelasan, user tidak punya dasar untuk menilai apakah rekomendasi itu masuk akal. Penjelasan diusulkan sebagai jembatannya.

## Tujuh tujuan penjelasan (Tintarev & Masthoff, 2012)

1. **Transparency** — menjelaskan cara kerja sistem
2. **Scrutability** — memungkinkan user mengoreksi
3. **Trust** — membangun kepercayaan ← *fokus studi ini*
4. **Effectiveness** — membantu keputusan yang baik
5. **Persuasiveness** — mendorong user mencoba
6. **Efficiency** — mempercepat keputusan
7. **Satisfaction** — meningkatkan kenikmatan pakai

Poin penting dari Tintarev & Masthoff: **tujuan-tujuan ini bisa saling bertentangan.** Penjelasan yang paling persuasif belum tentu paling membangun trust.

> Studi ini menemukan bukti empiris untuk ketegangan itu: kondisi dengan [[Purchase Intention]] tertinggi ≠ kondisi dengan [[Trust]] tertinggi. Lihat [[H1 Trust]] vs [[H2 Purchase Intention]].

## Yang sering keliru diasumsikan

> "Ada penjelasan → trust naik."

Tidak selalu. Bukti bertentangan:

- Rosenbacke et al. (2024) — dari 10 studi klinis, 5 menemukan XAI menaikkan trust, 3 tidak berefek, 2 menemukan **bisa naik atau turun** tergantung kualitas penjelasan.
- de Brito Duarte et al. (2023) — penjelasan feature-importance menaikkan trust, counterfactual **tidak** sebesar itu.
- Naiseh et al. (2021) — penjelasan bisa memicu *trust calibration error*: persetujuan yang tidak dipikir matang.

Kesimpulannya: yang menentukan bukan **ada/tidaknya** penjelasan, tapi **jenisnya**. Itu premis studi ini → [[Jenis Penjelasan]].

---

Terkait: [[Conversational Recommender System]] · [[Trust]] · [[Gap Penelitian]]
