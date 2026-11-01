# CLAUDE.md — Signava

Konteks proyek untuk Claude Code. Baca file ini sebelum mengerjakan tugas apa pun. Hormati juga `AGENTS.md` bawaan repo (aturan design system).

## Apa itu Signava
Platform SaaS penerbitan & verifikasi kredensial digital untuk pasar Indonesia. Penyelenggara (kampus, LPK, EO, komunitas) menerbitkan ratusan–ribuan sertifikat sekaligus, membagikannya lewat email, dan menyediakan halaman verifikasi publik ber-QR. Penerima punya portofolio kredensial lintas-penyelenggara. Diferensiasi: terverifikasi & diakui lokal, hemat biaya cetak, harga & bahasa Indonesia.

Dibangun DI ATAS design system Faiz UI (repo ini). Bangun fitur Signava di dalam repo ini, jangan bikin project baru.

## Dokumen sumber (urutan baca)
1. `PRD_Signava_MVP.md` — problem, persona, scope, epic, user story + acceptance criteria (APA & UNTUK SIAPA).
2. `Signava_MVP_Spec_v2.md` — arsitektur, data model, dan **detail semua halaman + urutan build UI-first** (BAGAIMANA). Ini spec teknis yang berlaku.

> Catatan: dokumen lama `Signava_Technical_Spec.md` (berbasis Next.js) dan `Signava_Build_Plan.md` SUDAH USANG — digantikan `Signava_MVP_Spec_v2.md`. Abaikan.

## Tech stack (SESUAI REPO)
- **Framework:** TanStack Start + TanStack Router (rute berbasis file di `src/routes/`)
- **Runtime/build:** React 19, TypeScript, **Vite**, **Bun**
- **UI:** shadcn/ui (style `base-luma`) di `src/components/ui/`, ikon **Hugeicons**
- **Styling:** Tailwind CSS v4 — design tokens di `src/styles.css`
- **Motion & tema:** Motion, next-themes; **Font:** Geist Variable
- **Lint/format:** **Biome** (bukan ESLint/Prettier)
- **Backend:** Supabase (Postgres, Auth, Storage, RLS). Logika server via TanStack Start server functions (`createServerFn`).

## Arsitektur (ramping — jangan over-engineer)
Satu backbone async: rendering sertifikat & pengiriman email = "job" lewat **tabel `jobs` di Postgres** → worker proses per-chunk (50–100) → update progress. **Tanpa Redis / queue service di MVP** (tambah nanti kalau volume menuntut). Batch kecil (≤200) boleh sinkron; batch besar async. File di Supabase Storage (privat + signed URL). Verifikasi publik lewat RPC security-definer (field aman saja). Sumber kebenaran = DB, bukan pihak luar. Detail di `Signava_MVP_Spec_v2.md` §1–§3.

## Scope MVP (kaya — 10 area user-facing)
Penerbitan (template + **input manual & unggah Excel/CSV** + validasi + generate massal), verifikasi + QR, distribusi **email** + unduh massal + LinkedIn add-to-profile, halaman & portofolio penerima, pengelolaan batch (cari + **regenerate 1 kredensial** + revoke), analitik, organisasi & tim, monetisasi (free/paid + volume pack, pembayaran **Pakasir**). Tag prioritas (🟢/🔵) & detail per halaman ada di Spec v2 §4.

## Di luar MVP (jangan bangun)
e-Meterai/PSrE/TTE tersertifikasi, **WhatsApp (semua bentuk)**, API publik/SSO/webhooks pihak ketiga, custom domain, verified-issuer resmi, editor desain tingkat lanjut. Alasan: butuh perizinan/approval pihak luar atau tak sepadan untuk MVP. **Pengiriman fokus EMAIL saja.**

## Integrasi
- **Email:** Resend (free tier), domain diverifikasi (SPF/DKIM); kirim sebagai job bertahap.
- **Pembayaran:** Pakasir (QRIS/VA). Buat transaksi → redirect → webhook. Webhook Pakasir UNSIGNED → **wajib verifikasi ulang ke API `transactiondetail` + cocokkan order_id & amount ke DB + idempoten** sebelum aktifkan paket/kredit. Ada Sandbox untuk uji.
- **Storage:** Supabase Storage privat + signed URL.

## Cara kerja (WAJIB)
1. **Rencanakan dulu, tunggu konfirmasi, baru eksekusi.** Jangan tulis banyak kode sebelum rencana disetujui.
2. **UI dulu:** bangun halaman dengan **data mock** mengikuti urutan `Signava_MVP_Spec_v2.md` §5, baru sambungkan backend.
3. **Satu halaman/slice kecil per waktu.** Ikuti acceptance criteria (Given/When/Then) di PRD.
4. **Reuse komponen Faiz UI** dari `src/components/ui/`; tambah shadcn baru dengan `bunx shadcn@latest add <nama>`. Jangan bikin dari nol bila sudah ada.
5. **Jangan bangun item di luar MVP.**
6. **Uji tiap slice:** `bun run typecheck` + `bun run check` lolos; happy-path jalan (`bun run dev`).

## Brand & tema
Warna logo: navy `#16204A`, biru royal `#2A5BEA`, teal `#16C0AE`. **Pertahankan palet netral Faiz UI**, hanya arahkan token brand di `src/styles.css` (`:root` DAN `.dark`, ikut format oklch/hsl yang ada): `--primary` → biru, `--accent`/`--ring` → teal, tambah `--brand-navy`. Jangan ubah token netral lain. UI **Bahasa Indonesia, sentence case, kalimat aktif**. Teal = warna verified/segel.

## Keamanan (WAJIB)
- RLS aktif di semua tabel tenant; verifikasi & portofolio publik hanya via RPC security-definer.
- `public_id` acak (`nanoid` ≥16 char); file privat + signed URL; tidak ada PII di URL.
- Rahasia lewat env vars saja; JANGAN commit `.env`; JANGAN hardcode kunci.
- `SUPABASE_SERVICE_ROLE_KEY` & API key Pakasir hanya di server function.
- Token registry Faiz UI (`fui_...`) rahasia. **Manusia yang mengisi semua kunci/secret.**

## Perintah
```
bun run dev         # http://localhost:3000
bun run build
bun run typecheck   # tsc --noEmit
bun run check       # biome lint + format check
bun run fix         # biome auto-fix + format
bunx shadcn@latest add <komponen>
```

## Definition of Done per tugas
typecheck + biome check lolos; acceptance criteria terpenuhi; happy-path teruji; reuse komponen Faiz UI; tidak ada secret ter-commit; scope tidak melebar.
