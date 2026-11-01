# AUDIT 01 — Vocab Accord + Isolasi Referensi (CR-HKGE Dataset)

> **Sifat:** diagnosis read-only. TIDAK ada perubahan kode/dataset.
> **Sumber:** `audit_accords.py` (impor fungsi dari `build_dataset.py`).
> **Tanggal:** 2026-06-25.
> **Cakupan:** dataset default (`merge_accord=on, include_ref=on, sem_similar=off`).

## STATUS PASCA-FIX (2026-06-25)

| Flag | Aksi | Hasil |
|---|---|---|
| 1 | `split_global_accords` split `[;,]` + buang placeholder | global vocab **255→60**, node sampah **227→0**, metrik merge jujur (has_global_accord **243→60** node, shared 56) |
| 2 | 6 ref rescue via `ref_aliases.tsv` (override clean-name) + cleanup `'—'` | terisolasi **11→5**; 5 sisa genuinely absent, ditandai eksplisit `ISOLATED-REF` di laporan |
| 3 | — | ditutup, T4 verified OK |

Sisa terisolasi (5, genuinely absent di global / accord `'—'`): Jaguar Blue Jack,
Oud Minérale TF, Rose Metallique TF, Vanilla Ice (`'—'`), Z White. Tetap kandidat
distractor, TANPA `has_global_accord` (tak difabrikasi, sesuai §6/§11).

Detail diagnosis asli di bawah (sebelum fix).

---

## Ringkasan

| Flag | Status | Tingkat | Inti |
|---|---|---|---|
| 1 — split accord | **BUG TERKONFIRMASI** | KRITIS | 230/266 baris `main_accord` pakai delimiter `,`; split hanya `;` → 227 node accord **sampah** (list koma utuh jadi 1 node). Vocab global membengkak 60→255. |
| 2 — isolasi ref | **TERKONFIRMASI** | SEDANG | 11/237 ref tanpa global accord (`g=None` / `'—'`), terisolasi di test fold (2–3 per fold). BUKAN akibat Flag 1. |
| 3 — resolusi T4_prefix | **DITUTUP (OK)** | — | 7 kasus verified manual benar, termasuk `YSL Libre→Libre Intense`. |

Angka kunci: `local_vocab=110  global_vocab=255  shared=56  global_only=199`.
Dugaan awal (over-split `"fresh spicy"`→`fresh`+`spicy`) **DISANGKAL**. Mekanisme
sebenarnya KEBALIKAN: **under-split** (list koma tak dipecah).

---

## A. Audit split accord (Flag 1)

### A.1 / A.2 — node sampah, bukan fragmen
"Multi-word" node global ternyata seluruh list koma jadi SATU node, contoh:
```
[M] aldehydic, white floral, musky, citrus, fresh, powdery, floral, sweet, fresh spicy, woody   <- 1 NODE
[M] woody, oud, warm spicy, aromatic, vanilla, balsamic, fresh spicy, amber, powdery, sweet      <- 1 NODE
```
Token single (`fresh`, `spicy`, `sweet`, `woody`) memang ada — tapi berasal dari
kolom `accord_1..accord_10` (benar), BUKAN hasil memecah `"fresh spicy"`.
Maka dugaan over-split disangkal; `fresh` sebagai single node = legit.

### A.3 — kode split (verbatim, `build_dataset.py:83`)
```python
def split_global_accords(row, accord_cols):
    """
    Global main_accord: split titik-koma ';' UNION accord_1..accord_10.
    Buang duplikat, pertahankan urutan kemunculan.
    """
    toks = []
    raw = row.get("main_accord")
    if raw:
        toks += [norm_token(x) for x in str(raw).split(";")]   # <-- BUG: hanya ';'
    for c in accord_cols:
        v = row.get(c)
        if v:
            toks.append(norm_token(v))
    out, seen = [], set()
    for t in toks:
        if t and t not in seen:
            seen.add(t)
            out.append(t)
    return out
```
Delimiter dipakai: **`;` saja**. (Accord lokal benar: split `,`.)

### Delimiter di sumber global (`main_accord`, 266 baris)
| delimiter | jumlah baris |
|---|---|
| `;` saja (benar) | 31 |
| **`,` saja (jadi node sampah)** | **230** |
| `;` dan `,` | 4 |
| tanpa delimiter | 1 |

### A.4 — multi-word
- multiword lokal = 43
- multiword global = 199
- multiword global TANPA pasangan id lokal = **194** (semua node sampah)
- distinct node sampah (mengandung `,`) = **227**

Global vocab 255 = ~28 bersih + 227 sampah. Old build ~60 → konsisten bila split benar.

### Dampak
- 227 node accord mati mencemari `entity_list`/`kg_final` (tak menjembatani apa-apa
  karena tak ada produk lokal bernama list-koma).
- Metrik bukti-merge [§10.2] terdistorsi (`has_global_accord` menyentuh node sampah).
- Buang parameter embedding utk node tak berguna.
- Bridge ref→produk TETAP jalan via `accord_1..10`, jadi isolasi tak meledak —
  tapi graf jelas kotor & salah.

### Fix yang diusulkan (BELUM diterapkan)
```python
import re
toks += [norm_token(x) for x in re.split(r"[;,]", raw)]   # split ; DAN ,
```
Ekspektasi: global vocab turun ~255 → ~30–60; metrik merge jujur.

---

## B. Isolasi referensi (Flag 2)

Definisi terisolasi: tak ada jalur
`ref → has_global_accord → accord(node bersama) → has_accord → produk`
pada KG penuh (sebelum hold-out).

### B.5 — 11 dari 237 ref berlabel terisolasi
Penyebab BUKAN Flag 1 — semua punya `global_accords = NONE` atau `['—']`
(yaitu `g=None`: target alias/override tak punya baris di global `Sheet1`;
atau placeholder em-dash):
```
Allure Homme Sport by Chanel                       | NONE
Bali by Kenzo / Kenzo travel edition               | NONE
Elixir Pour Femme by Roja Dove                     | NONE
Idôle by Lancôme                                   | NONE
Italian Love / Light Blue Italian Love (D&G)       | NONE
Jaguar Classic Blue / Blue Jack                    | NONE
Marry Me! by Lanvin                                | NONE
Oud Minérale by Tom Ford                           | NONE
Rose Prick / Metallique by Tom Ford                | NONE
Vanilla Ice by Victoria's Secret                   | ['—']
Z White                                            | NONE
```

### B.6 — ref terisolasi di test-set per fold
| fold | test_refs | terisolasi |
|---|---|---|
| 0 | 49 | 3 |
| 1 | 49 | 3 |
| 2 | 48 | 0 |
| 3 | 47 | 3 |
| 4 | 47 | 2 |

Konsekuensi: ref ini di test fold → target produknya hanya tersambung via
`inspired_by` (yang justru di-hold-out) → mustahil terjangkau lewat accord.

### Fix yang diusulkan (BELUM diterapkan)
- Lengkapi 10 baris global yang hilang (isi `main_accord`/`accord_*` Fragrantica), ATAU
- Tandai eksplisit sebagai ref tanpa-atribut & laporkan (jangan diam-diam isolasi), ATAU
- Bersihkan placeholder `'—'` (Vanilla Ice) → isi accord asli.

---

## C. Resolusi T4_prefix (Flag 3) — DITUTUP

7 kasus, verified manual oleh peneliti = benar. (Field `global_accords` tiap kasus
masih mengandung node sampah element[0] — itu efek Flag 1, akan beres setelah Flag 1.)

| produk | revolutionize | interpreted_as | makna |
|---|---|---|---|
| Cloud Grande | Tomford Oud Wood | Oud Wood Tom Ford | OK |
| SCENT SQUAD | Bvlgari Man Black Orient Bvlgari | Bvlgari Man Black Orient | OK |
| CHARMING DECIVER | Eau de Lacoste L.12.12. Green Lacoste Fragrances | Eau de Lacoste L.12.12. Green | OK |
| Dreamland | YSL Libre | Libre Intense — Yves Saint Laurent | OK (verified) |
| Stardust | Cuba Brazil Cuba Paris | Cuba Brazil | OK |
| Bad Boy | Bvlgari Extreme Bvlgari | Bvlgari Extreme | OK |
| Lovin Him | estee lauder pleasures | Pleasures — Estée Lauder | OK |

---

## Rekomendasi urutan tindakan
1. **Flag 1 dulu** (1 baris, dampak terbesar): `re.split(r"[;,]", raw)`. Rebuild,
   verifikasi global vocab turun & metrik merge [§10.2] jujur.
2. **Flag 2 berikutnya** (terpisah): lengkapi/tandai 10 ref `g=None` + 1 placeholder `'—'`.
3. Flag 3: tak ada tindakan.

> Catatan: laporan ini diagnosis. Tak ada kode/dataset diubah. `audit_accords.py`
> bersifat read-only dan bisa dijalankan ulang utk regresi setelah fix.
