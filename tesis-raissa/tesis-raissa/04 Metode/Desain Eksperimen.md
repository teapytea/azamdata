---
tags: [metode]
bagian-paper: "IV.A, IV.B, IV.D"
---

# Desain Eksperimen

## Rancangan

**Between-subjects, 3 kondisi.** Setiap partisipan hanya mengalami satu mode penjelasan.

```
n = 90
├── Kondisi A (feature-based)     n = 30
├── Kondisi B (narrative-based)   n = 30
└── Kondisi C (comparative-based) n = 30
```

**Randomisasi:** berbasis counter sesi.

### Kenapa between-subjects, bukan within?

Kalau satu orang mengalami ketiga mode, dia akan **sadar sedang dibandingkan** dan mengubah caranya menilai. Efek carryover dan demand characteristics jadi ancaman serius.

Harganya: butuh lebih banyak partisipan dan power lebih rendah — inilah yang menggigit di [[H4 Moderasi Familiaritas]].

Rujukan metodologis: Shadish, Cook & Campbell untuk desain eksperimental-kuasi.

## Partisipan

**n = 90** (30 per kondisi).

Profil [[Familiaritas]]:
```
enthusiast : 60
novice     : 30
```

⚠️ Komposisi ini **timpang** — dua kali lipat enthusiast. Konsekuensinya besar untuk H4. Lihat [[Keterbatasan]].

**Balance check:** χ²=1,20; p=0,549 → distribusi familiaritas seimbang antar kondisi. Randomisasi bekerja.

## Prosedur

```
1. Sapaan & penjelasan studi
2. Interaksi dengan Lily (CRS)
   └── ekstraksi preferensi lewat dialog
3. Rekomendasi + penjelasan (sesuai kondisi acak)
4. Kuesioner 8 item + item perilaku scent_trial
```

## Perbandingan dengan studi sejenis

**Ziegfeld et al. (2024, *Computer Speech & Language*)** — desainnya nyaris identik: between-subjects, 3 kondisi CRS, mengukur konstruk UX.

Perbedaan penting: mereka **tidak menemukan** efek signifikan pada ukuran subjektif apa pun (n=66). Studi ini menemukannya (n=90).

> Poin bagus untuk diskusi: manipulasi **jenis penjelasan** tampaknya lebih kuat efeknya daripada manipulasi **metode elisitasi preferensi**.

---

Terkait: [[Instrumen dan Pengukuran]] · [[Manipulation Check]] · [[Rencana Analisis]]
