# Signava — Technical Spec (Engineering Addendum ke PRD MVP)

**Tujuan:** melengkapi PRD MVP dengan keputusan teknis agar agen coding (Claude Code) bisa mengeksekusi. Baca bersama `PRD_Signava_MVP.md`.
**Prinsip:** stack populer & ramah-agen (banyak referensi), Supabase sebagai backend inti, MVP dulu (walking skeleton), keamanan multi-tenant sejak awal.

---

## 1. Tech Stack (terpilih)

| Lapisan | Pilihan | Alasan |
|---|---|---|
| **Framework** | **Next.js (App Router) + TypeScript** | Full-stack React (UI + route handlers), server components, deploy mudah, ekosistem & referensi melimpah → agen jarang salah |
| **Database / Auth / Storage** | **Supabase** (Postgres + Auth + Storage + RLS + Edge Functions) | Sesuai permintaan; satu paket auth+db+file+row-level-security untuk multi-tenant |
| **UI** | **Tailwind CSS + shadcn/ui** | Cepat, konsisten, komponen siap pakai, ramah-agen |
| **Parsing CSV/Excel** | **PapaParse** (CSV) + **SheetJS/xlsx** (Excel) | Standar, jalan di client & server |
| **Rendering sertifikat** | **Template SVG → PNG via `sharp`, PDF via `pdf-lib`** | Vektor tajam, substitusi placeholder mudah, **tanpa browser headless** → skalabel & ringan |
| **QR code** | **`qrcode`** (npm) | Generate QR → embed sebagai `<image>` di SVG sebelum rasterisasi |
| **ZIP unduhan massal** | **`archiver`** / `jszip` | Bundel file per-nama |
| **Antrean batch besar** | **Tabel `jobs` di Postgres + worker** (lihat §4) | Hindari timeout serverless untuk batch ribuan |
| **Hosting** | **Vercel** (Next.js) + **Supabase** (managed) | Nol-ops untuk MVP |
| **Email (Fase 2)** | **Resend** | API sederhana |
| **Pembayaran (Fase 2)** | **Midtrans** atau **Xendit** (QRIS/e-wallet) | PSP lokal Indonesia — **bukan** MVP walking skeleton |

**Alternatif yang dipertimbangkan:** `@react-pdf/renderer` (PDF-native) alih-alih SVG→PDF — dipakai bila butuh layout PDF kompleks; untuk MVP, SVG lebih mudah dijadikan "template visual". Puppeteer/Playwright (HTML→PDF) **dihindari** untuk batch besar karena berat & lambat.

---

## 2. Arsitektur (alur end-to-end)

```
[Next.js UI]  ──auth──▶  [Supabase Auth]
     │
     ├─ buat/pilih Template (SVG + placeholder {{name}}, {{event}}, {{date}}...)
     │
     ├─ upload CSV/XLSX ─▶ parse (PapaParse) ─▶ preview & validasi ─▶ konfirmasi
     │
     ├─ Generate Batch:
     │     kecil (≤500)  → route handler sinkron
     │     besar (>500)  → insert `jobs` row → Worker proses per-chunk (progress polling)
     │        └─ per baris: substitusi SVG → QR → PNG (sharp) + PDF (pdf-lib)
     │                       → upload Supabase Storage → insert `credentials` row (public_id unik)
     │
     ├─ Distribusi: unduh ZIP (signed URLs) │ (Fase 2) kirim email
     │
     ├─ Verifikasi PUBLIK: /verify/[public_id] → RPC security-definer → tampilkan field aman + QR
     │
     └─ Kelola: daftar batch │ cari nama │ regenerate 1 credential
```

**Isolasi multi-tenant:** semua data milik `organization`; akses dibatasi **Row Level Security (RLS)** berbasis keanggotaan org. Halaman verifikasi publik **tidak** membuka RLS tabel — ia memanggil fungsi `verify_credential(public_id)` (security definer) yang hanya mengembalikan field non-sensitif.

---

## 3. Data Model (Postgres / Supabase)

```sql
-- profiles: 1:1 dengan auth.users
profiles ( id uuid PK = auth.users.id, full_name text, created_at timestamptz )

organizations ( id uuid PK, name text, logo_url text, owner_id uuid FK->profiles, created_at )

memberships ( id uuid PK, org_id FK, user_id FK, role text check in ('owner','admin','member'),
              unique(org_id,user_id) )   -- MVP: cukup owner; struktur siap untuk tim

templates ( id uuid PK, org_id FK, name text, svg_source text,
            fields jsonb,               -- daftar placeholder & posisi/gaya
            created_at )

batches ( id uuid PK, org_id FK, template_id FK, name text, event_name text,
          status text check in ('draft','processing','completed','failed'),
          total_count int default 0, created_at )

credentials ( id uuid PK, batch_id FK, org_id FK,
              public_id text UNIQUE,     -- token acak tak-tertebak (nanoid), dipakai di URL verifikasi
              recipient_name text, fields jsonb,   -- data dinamis per penerima
              file_pdf_path text, file_png_path text, qr_path text,
              status text check in ('valid','revoked') default 'valid',
              issued_at timestamptz default now() )

jobs ( id uuid PK, batch_id FK, org_id FK, type text default 'generate_batch',
       status text check in ('queued','processing','done','failed'),
       progress int default 0, total int, error text, created_at, updated_at )
```

**Storage buckets (Supabase):** `assets` (logo/template, privat), `certificates` (PDF/PNG hasil, privat → diakses via signed URL). Tidak ada file yang public-read; verifikasi memakai `public_id`, bukan URL file.

**RLS (ringkas):**
- `organizations/templates/batches/credentials/jobs`: `USING (org_id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid()))`.
- `profiles`: user hanya baris sendiri.
- Verifikasi publik: **tidak** lewat RLS; via RPC `verify_credential(p_public_id text)` `SECURITY DEFINER` yang `SELECT recipient_name, event_name(org), issuer_name, issued_at, status` — **tanpa** email/PII/id internal.

---

## 4. Generate Batch & Worker (bagian paling berisiko)

- **Kecil (≤500 kredensial):** diproses sinkron di route handler (`/api/batches/[id]/generate`). Cukup untuk membuktikan nilai (walking skeleton).
- **Besar (>500, hingga 5.000):** route handler hanya membuat `jobs` row berstatus `queued` lalu balas cepat. **Worker** memproses per-chunk (mis. 100/iterasi), memperbarui `progress`; UI polling status. Pilihan worker (rekomendasi berurutan):
  1. **Supabase Edge Function** dipicu + `pg_cron` untuk mengambil job antre (paling nyatu dengan Supabase).
  2. **Worker terpisah ringan** (Railway/Render/Fly) yang polling tabel `jobs`.
- **Per kredensial:** ambil `svg_source` template → ganti `{{placeholder}}` dengan `fields` baris → generate QR (`qrcode`) berisi URL `/(verify)/[public_id]` → sisipkan QR sebagai `<image>` di SVG → `sharp` render PNG → `pdf-lib` bungkus jadi PDF 1 halaman → upload ke Storage → insert `credentials`.
- **Idempoten & retry:** job bisa diulang tanpa duplikasi (cek `public_id`/baris sudah diproses).
- ⚠️ **Catatan font:** font kustom harus di-embed (base64) dalam SVG agar `sharp` merender konsisten.

---

## 5. API Surface (route handlers Next.js, ringkas)

| Method & Path | Fungsi | Auth |
|---|---|---|
| `POST /api/orgs` | buat organisasi (saat onboarding) | user |
| `GET/POST /api/templates` | daftar / buat template | org |
| `POST /api/batches` | buat batch (draft) | org |
| `POST /api/batches/[id]/upload` | unggah CSV/XLSX → parse & validasi (balikan preview) | org |
| `POST /api/batches/[id]/generate` | generate (sync kecil / enqueue job besar) | org |
| `GET /api/batches/[id]` | detail + status job + progress | org |
| `GET /api/batches/[id]/download` | ZIP signed URLs | org |
| `GET /api/credentials?batch=&q=` | daftar/cari kredensial | org |
| `POST /api/credentials/[id]/regenerate` | terbitkan ulang 1 kredensial | org |
| `GET /verify/[public_id]` (page) + `RPC verify_credential` | halaman verifikasi publik | **publik** |

---

## 6. Non-Functional Requirements

- **Performa:** batch 5.000 selesai via worker dengan progress; target throughput realistis (chunk 100). MVP sinkron dibatasi ≤500.
- **Keamanan:** RLS wajib di semua tabel tenant; `public_id` acak (nanoid, ≥16 char); file privat + signed URL kedaluwarsa; rate-limit endpoint verifikasi; tidak ada PII di URL.
- **Privasi (UU PDP):** simpan hanya data peserta yang perlu; sediakan penghapusan batch/kredensial; jangan log PII.
- **i18n:** UI **Bahasa Indonesia** default (siapkan struktur i18n untuk multi-bahasa nanti).
- **Reliabilitas:** job retry + status `failed` + pesan error; transaksi saat insert kredensial.
- **Aksesibilitas & mobile:** responsif; kontras & label memadai.
- **Rahasia:** semua kunci lewat **env vars**; **jangan** commit `.env`; kunci PSP/Service-role di-set manusia, bukan agen.

---

## 7. Environment Variables (kerangka — isi manusia)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server-only, JANGAN diekspos ke client
NEXT_PUBLIC_APP_URL=            # untuk URL verifikasi di QR
# Fase 2:
RESEND_API_KEY=
MIDTRANS_SERVER_KEY= / XENDIT_SECRET_KEY=
```

---

## 8. Yang TIDAK dibangun di MVP (tegas)
Portofolio penerima, e-Meterai/PSrE, API pihak ketiga, custom domain, editor desain penuh, kirim WhatsApp, billing (Fase 2). Lihat PRD §8.
