# 🚀 QUICK START — Dari Gambar Referensi ke Full-Stack App

Bundle ini isinya **beberapa prompt**, dipakai berurutan. Langkah 1–2 selalu sama; Langkah 3 **bercabang tergantung backend** yang mau dipakai.

| # | File | Fungsi |
|---|------|--------|
| 1 | `STITCH_PROMPT_GENERATOR.md` | Analisa gambar UI → hasilkan prompt Stitch + `DESIGN.md` |
| 2 | `UIUX_TECHNICAL_DICTIONARY.md` | Kamus istilah — pendamping prompt #1 biar analisa akurat |
| 3A | `SUPABASE_BUILDER.md` | Backend **Supabase** — chat-only (Gemini Canvas/tanpa akses file) |
| 3A′ | `AGENT_FULLSTACK_BUILDER_SUPABASE_v2.md` | Backend **Supabase** — agentic (Claude Code/Antigravity/AI Studio, akses file nyata) |
| 3B | `AGENT_APPSCRIPT_SHEET_BUILDER.md` | Backend **Google Sheets + Apps Script** — tanpa Supabase, tanpa server eksternal |

> Pakai LLM apa saja yang bisa baca gambar (Gemini, Claude, ChatGPT) untuk Langkah 1–2. Preview pakai **Gemini Canvas**.

---

## 🟣 LANGKAH 1 — Bikin Desain (prompt #1 + #2)

1. Buka chat LLM baru.
2. **Paste `STITCH_PROMPT_GENERATOR.md` + `UIUX_TECHNICAL_DICTIONARY.md`** sekaligus di pesan pertama.
3. **Upload 1–3 gambar** referensi UI (screenshot/mockup).
4. AI keluarkan **design audit** + tanya 2–3 hal → jawab singkat.
5. AI hasilkan **Stitch prompt + `DESIGN.md`**. ➜ **Simpan `DESIGN.md`**, ini dipakai terus, di kedua metode backend.

---

## 🎨 LANGKAH 2 — Preview UI

- **Opsi A (cepat):** minta AI generate `index.html` dari `DESIGN.md`, lalu **preview di Gemini Canvas**.
- **Opsi B:** paste Stitch prompt ke [stitch.withgoogle.com](https://stitch.withgoogle.com) untuk hasil visual.

Cek tampilan sudah sesuai desain. Kalau oke, **baru pilih metode backend di Langkah 3**.

---

## 🟢 LANGKAH 3 — Pilih Metode Backend

Dua opsi, tidak saling eksklusif untuk dipelajari — pilih sesuai kebutuhan project:

| | **Metode A — Supabase** | **Metode B — Google Sheets + Apps Script** |
|---|---|---|
| Butuh akun eksternal? | Ya, akun Supabase (gratis, ada limit) | Tidak — cukup akun Google yang sudah ada |
| Jenis database | PostgreSQL asli, relasi & RLS proper | Google Sheets (bukan DB sungguhan, relasi cuma konvensi) |
| Keamanan | RLS bawaan Postgres, auth Supabase siap pakai | Auth ditulis manual (hash+token), tidak ada RLS bawaan |
| Cocok untuk | App yang bakal tumbuh besar/banyak user | App skala kecil-menengah, internal, atau iterasi cepat tanpa setup akun baru |
| Effort setup awal | Bikin project Supabase, ambil URL+anon key | Bikin/pakai Google Sheet, deploy Apps Script manual |

---

### Metode A — Supabase

**A1. Kalau di chat biasa/Gemini Canvas (tidak ada akses file):**
1. Di chat yang sama (sudah ada `DESIGN.md`), **paste `SUPABASE_BUILDER.md`**.
2. AI tanya "mau bikin project apa?" → jelaskan app-nya + fitur yang butuh login.
3. AI rancang **halaman + tabel** → konfirmasi.
4. Bikin project di [app.supabase.com](https://app.supabase.com), ambil **Project URL + anon key** (Settings → API) → kasih ke AI.
   > Jangan kasih `service_role` key. Cukup anon/public key.
5. AI kasih **SQL migration** → copas ke **Supabase → SQL Editor → Run**.
6. AI kasih **`index.html` + `script.js`** (kode FULL tiap revisi) → preview di Canvas. Selesai. 🎉

**A2. Kalau di tool agentic dengan akses file (Claude Code, Antigravity, AI Studio build mode):**
1. Paste `AGENT_FULLSTACK_BUILDER_SUPABASE_v2.md` di project yang sudah ada `DESIGN.md`/`index.html`.
2. AI cek mode project (Fresh/Slicing) → tanya tech stack (framework, TS, router, state) → susun **architecture plan lengkap** → **wajib approve dulu** sebelum ada file disentuh.
3. Kasih Project URL + anon key → AI susun migration plan (via Supabase CLI kalau ada terminal).
4. Setelah approve → AI scaffold project asli, tulis file, integrasi Supabase, jalankan dev server.

---

### Metode B — Google Sheets + Apps Script

1. Di chat/tool yang bisa baca file (Gemini biasa, atau Gemini di dalam Apps Script editor, atau agent lain), **paste `AGENT_APPSCRIPT_SHEET_BUILDER.md`** + attach `index.html` yang sudah jadi dari Langkah 2 (kalau belum otomatis ada di context).
2. AI baca prototype, ekstrak model data (mana master data, mana transactional, mana angka turunan) → **konfirmasi** hasil ekstraksinya.
3. AI rancang **skema sheet** (nama sheet, kolom, relasi) + tanya container-bound/standalone → **konfirmasi**.
4. AI tampilkan **plan keamanan** (hash password, token session, deployment settings, Script Properties) → **wajib approve dulu**.
5. AI kasih **`Code.gs`** (satu file utuh, siap paste) — buka Apps Script editor (dari dalam Sheet: *Extensions → Apps Script*, atau project standalone), paste, lalu jalankan `setupSheets()` sekali dari menu Run.
6. **Deploy manual** (ini bagian yang tidak bisa diwakilkan ke AI): *Deploy → New deployment → Web app → Execute as Me → Who has access Anyone → Deploy*. Copy **URL Aplikasi Web** (`.../exec`) dan **Deployment ID** (*Deploy → Manage deployments*).
7. **Paste balik URL + Deployment ID ke chat** → AI wiring `index.html` (satu file utuh) supaya `fetch()`-nya manggil URL itu. Buka `index.html`-nya, selesai. 🎉

---

## ⚡ Catatan Penting

**Umum (semua metode):**
- **Tiap revisi**, AI selalu kasih **kode FULL** (bukan potongan) — baik `script.js`/`index.html` (Supabase) maupun `Code.gs`/`index.html` (Apps Script).
- **Warna/font berubah sendiri?** `DESIGN.md` adalah hukum — kalau AI nyimpang, ingatkan: *"ikuti DESIGN.md verbatim."*
- **Tampilan tiba-tiba putih/berantakan?** Itu bug Tailwind v4 di Canvas — prompt-prompt di atas sudah otomatis pakai Tailwind v3 stable.

**Khusus Supabase:**
- **Auth bikin error `Email not confirmed`?** Matikan: Supabase → **Authentication → Providers → Email → matikan "Confirm email" → Save**.

**Khusus Apps Script:**
- **Error `File HTML dengan nama Index tidak ditemukan`?** Berarti `doGet` salah pola (coba serve HTML padahal arsitekturnya headless API). `doGet` seharusnya cuma balikin JSON, tidak perlu file HTML apa pun di project Apps Script.
- **Jangan mengarang URL deployment.** Kalau AI belum benar-benar dikasih URL + Deployment ID dari hasil Deploy manual, `index.html`-nya belum boleh dianggap "selesai".
- **Update `Code.gs` nanti?** Pakai *Manage deployments → Edit → New version* di Deployment ID yang **sama** — supaya URL tidak berubah dan `index.html` tidak perlu di-update ulang.

---

## 🗺️ Ringkas Flow

```
Gambar referensi
   ↓  [Prompt #1 + #2]
Stitch prompt + DESIGN.md
   ↓  preview (Gemini Canvas / Stitch)
UI jadi (index.html)
   ↓
   ├── Metode A: Supabase ──────────────┐
   │     [SUPABASE_BUILDER.md /          │
   │      AGENT_FULLSTACK_BUILDER_       │
   │      SUPABASE_v2.md + creds]        │
   │     → SQL migration + kode FULL     │
   │                                     │
   └── Metode B: Sheets + Apps Script ──┤
         [AGENT_APPSCRIPT_SHEET_         │
          BUILDER.md]                    │
         → skema sheet + Code.gs         │
         → deploy manual → URL+ID        │
         → wiring index.html             │
                                         ▼
                          Full-stack app jalan ✅
```
