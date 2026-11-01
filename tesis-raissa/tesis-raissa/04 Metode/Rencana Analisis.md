---
tags: [metode]
bagian-paper: "IV.F, V.C"
---

# Rencana Analisis

## Kenapa non-parametrik

**Uji normalitas Shapiro-Wilk dilanggar** di sebagian sel. Sebagian data juga menunjukkan *ceiling effect* (menumpuk di skor tinggi).

Konsekuensinya: ANOVA klasik tidak aman. Beralih ke uji berbasis peringkat.

```
Perbandingan 3 kelompok  →  Kruskal-Wallis H
Post-hoc antar pasangan  →  Dunn's test
Korelasi                 →  Spearman ρ
Uji terhadap nilai netral →  Wilcoxon signed-rank
```

## Effect size

**ε² = H / (n − 1)**

Ini padanan eta-squared untuk Kruskal-Wallis. Melaporkan effect size penting — nilai p hanya bilang "ada efek", ε² bilang "seberapa besar".

| Hipotesis | ε² | Tafsir |
|---|---|---|
| [[H1 Trust]] | 0,186 | besar |
| [[H2 Purchase Intention]] | 0,133 | sedang–besar |

## Reliabilitas skala

**Split-half / Spearman-Brown**, bukan Cronbach's alpha. Alasannya di [[Instrumen dan Pengukuran]].

## Moderasi (H4)

**Two-way ANOVA** untuk menguji interaksi kondisi × [[Familiaritas]].

> [!warning] Inkonsistensi yang perlu dijelaskan
> Analisis utama pakai non-parametrik (karena normalitas dilanggar), tapi uji moderasi pakai ANOVA yang **parametrik**.
>
> Ini harus diakui sebagai keterbatasan di §IV.F, bukan dilewatkan begitu saja. Alasannya praktis: tidak ada padanan non-parametrik yang mapan untuk uji interaksi dua faktor.
>
> Reviewer yang teliti akan menangkap ini. Lebih baik Raissa yang menyebutnya duluan.

## Ringkasan uji per hipotesis

| | Uji | Statistik | p | Effect size |
|---|---|---|---|---|
| H1 | Kruskal-Wallis + Dunn | H=16,57 | <0,001 | ε²=0,186 |
| H2 | Kruskal-Wallis + Dunn | H=11,88 | 0,003 | ε²=0,133 |
| H3 | Spearman | ρ=0,229 | 0,030 | CI 0,025–0,437 |
| H4 | Two-way ANOVA | F=0,45 | 0,638 | — |

---

Terkait: [[Desain Eksperimen]] · [[Manipulation Check]] · [[Keterbatasan]]
