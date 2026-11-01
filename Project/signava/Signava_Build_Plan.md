# Signava — Build Plan (task-by-task untuk Claude Code)

Cara pakai: kerjakan **satu tugas per sesi/prompt**. Untuk tiap tugas, minta Fable **membuat rencana dulu**, Anda review, baru eksekusi. Tugas Fase 1 membentuk *walking skeleton* (alur lengkap tertipis). Referensi story = `PRD_Signava_MVP.md`; teknis = `Signava_Technical_Spec.md`.

Contoh prompt untuk tiap tugas:
> "Baca CLAUDE.md dan Signava_Technical_Spec.md. Kerjakan **T4**. Buat rencana singkat dulu, tunggu saya konfirmasi, lalu implementasi mengikuti acceptance criteria. Jangan keluar dari scope."

---

## FASE 0 — Fondasi

**T0.1 — Scaffold proyek**
- Init Next.js (App Router, TS) + Tailwind + shadcn/ui. Tambah `.env.example`, `CLAUDE.md`, struktur folder.
- **Selesai bila:** `npm run dev` jalan; halaman placeholder tampil; lint & typecheck lolos.

**T0.2 — Integrasi Supabase**
- Setup client Supabase (browser & server), helper auth, dan folder `supabase/migrations/`.
- **Selesai bila:** koneksi ke Supabase berhasil (env terisi manusia); client server & browser tersedia.

**T0.3 — Skema DB + RLS (migrasi)**
- Buat migrasi SQL: `profiles, organizations, memberships, templates, batches, credentials, jobs` + policy RLS + RPC `verify_credential(public_id)` (security definer) + 2 bucket Storage (`assets`, `certificates`, privat).
- **Selesai bila:** migrasi terterap; RLS aktif; RPC bisa dipanggil.

---

## FASE 1 — Walking Skeleton (MVP)

**T1 — Auth + buat organisasi** *(PRD: Daftar/masuk; Onboarding)*
- Signup/login (Supabase Auth). Saat pertama masuk, buat `organization` + `membership(owner)` + `profile`.
- **AC:** Given user baru, When daftar & login, Then punya 1 organisasi dan masuk dashboard kosong.

**T2 — Template preset + edit dasar** *(PRD A4, disederhanakan)*
- Seed 2–3 template SVG berplaceholder (`{{name}}`, `{{event}}`, `{{date}}`, `{{issuer}}`). Halaman pilih template + edit teks/logo/warna dasar; simpan ke `templates`.
- **AC:** Given daftar template, When pilih & ubah logo/teks lalu simpan, Then template tersimpan untuk org.

**T3 — Buat batch + upload CSV + map nama** *(PRD C-import, A3 minimal)*
- Buat `batch` (draft). Upload CSV/XLSX → parse (PapaParse) → map kolom ke field (minimal `name`).
- **AC:** Given file berisi kolom nama, When unggah & map, Then baris peserta terbaca & tersimpan sebagai draft.

**T4 — Preview & validasi** *(PRD A2)*
- Tabel pratinjau + peringatan (baris kosong, duplikat, karakter aneh). Generate terkunci sampai dikonfirmasi.
- **AC:** Given data terunggah, When diproses, Then muncul pratinjau + daftar peringatan; konfirmasi membuka tombol Generate.

**T5 — Generate batch (sinkron ≤500)** *(PRD A1 + B2)*
- Untuk tiap baris: substitusi SVG → generate QR (URL `/verify/[public_id]`) → sisip QR ke SVG → `sharp` PNG + `pdf-lib` PDF → upload Storage → insert `credentials` (public_id nanoid). Set `batch.status=completed`.
- **AC:** Given batch terkonfirmasi (≤500), When klik Generate, Then tiap peserta punya PDF/PNG + QR + public_id, dan batch selesai.

**T6 — Halaman verifikasi publik** *(PRD B1)*
- Route publik `/verify/[public_id]` → panggil RPC `verify_credential` → tampilkan field aman (nama, penyelenggara, event, tanggal, status). Tanpa auth, tanpa PII sensitif.
- **AC:** Given public_id valid, When halaman dibuka, Then detail terverifikasi tampil; QR di sertifikat mengarah ke sini.

**T7 — Unduh massal (ZIP)** *(PRD C1)*
- Endpoint bundel file batch (via signed URL) jadi ZIP, tiap file dinamai per nama.
- **AC:** Given batch selesai, When klik Unduh Semua, Then ZIP berisi seluruh sertifikat terunduh.

**T8 — Daftar & lihat batch** *(PRD D1)*
- Halaman daftar batch (nama, event, jumlah, status, tanggal) + detail batch.
- **AC:** Given beberapa batch, When buka daftar, Then semua batch org tampil & bisa dibuka.

> ✅ **Checkpoint walking skeleton:** setelah T8, alur utuh daftar → template → upload → generate → verify → unduh sudah jalan. **Uji dengan 1 batch nyata** sebelum Fase 2.

---

## FASE 2 — Kelola, Skala & Monetisasi (setelah skeleton terbukti)

**T9 — Generate async untuk batch besar** *(>500)*
- Route hanya enqueue `jobs`; worker (Supabase Edge Function + pg_cron atau worker terpisah) proses per-chunk 100 + update `progress`; UI polling.
- **AC:** Given batch 2.000+, When Generate, Then diproses async dengan progress; selesai tanpa timeout.

**T10 — Cari nama + regenerate 1 kredensial** *(PRD D2/D3 — nyeri utama)*
- Cari kredensial dalam batch by nama; edit 1 data → regenerate hanya kredensial itu (public_id tetap).
- **AC:** Given batch besar, When cari nama salah & regenerate, Then hanya kredensial itu diperbarui dalam hitungan detik.

**T11 — Kirim via email + ekspor print-ready** *(PRD C2/C3)*
- Integrasi Resend untuk kirim link/lampiran ke penerima; ekspor PDF resolusi cetak.
- **AC:** Given batch selesai, When kirim, Then penerima menerima sertifikat/link; PDF cetak tersedia.

**T12 — Tier berbayar + billing (Midtrans/Xendit QRIS)**
- Free tier + batas volume; upgrade in-context; integrasi PSP lokal. **Kunci PSP di-set manusia.**
- **AC:** Given batas free terlampaui, When upgrade & bayar via QRIS, Then paket berbayar aktif.

---

## Later (gated by validasi wawancara)
Verified issuer/custom domain/analytics, API/integrasi, **e-Meterai/PSrE**, **portofolio penerima**, WhatsApp, ekspansi L&D. Jangan mulai sebelum asumsi tervalidasi (lihat PRD §10 & Lean UX Box 7).

---

## Aturan emas selama build
1. Satu tugas per waktu, rencana dulu, uji tiap slice.
2. Jaga RLS & keamanan (Technical Spec §6).
3. Jangan lewati scope MVP.
4. Manusia pegang semua secret, pembayaran, dan deploy.
