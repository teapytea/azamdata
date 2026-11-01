# Signava — MVP Spec v2 (arsitektur ramping + detail halaman)

Menggantikan `Signava_Technical_Spec.md`. Disesuaikan: stack asli Faiz UI (TanStack Start), MVP "kaya" (10 area user-facing), pengiriman **email-only**, pembayaran **Pakasir**, arsitektur **tidak over-engineered**. Fokus dokumen ini: **detail halaman untuk build UI dulu.**

Legenda: 🟢 MVP inti · 🔵 MVP lengkap (menyusul cepat) · ⚪ nanti/di luar MVP

---

## 1. Prinsip arsitektur (ramping)

- **Satu backbone async**: rendering sertifikat & pengiriman email = "job" yang lewat satu antrean → satu worker → progress. App tidak pernah menunggu proses berat secara langsung.
- **Antrean = tabel `jobs` di Postgres** (Supabase). **Tanpa Redis, tanpa queue service** di MVP. Tambah Redis/Cloudflare hanya kalau volume menuntut.
- **Sinkron vs async**: batch kecil (≤200) boleh diproses langsung; batch besar → job async + progress. Email selalu async (bertahap, hormati rate limit).
- **Storage**: Supabase Storage (file privat + signed URL). Cloudflare CDN di depan halaman verifikasi publik = opsional, nanti.
- **Sumber kebenaran = DB Anda**, bukan webhook/pihak luar.

## 2. Backbone (alur sistem)

```
UI (TanStack Start) ──server functions──▶ Supabase (Postgres + Auth + Storage, RLS)
                                              │
  Terbitkan batch ─▶ buat rows credentials (status: queued) + job(generate)
                                              │
  Worker (chunk 50–100) ─▶ render SVG→PNG(sharp)+PDF(pdf-lib)+QR ─▶ Storage ─▶ update progress
                                              │
  Publish ─▶ job(email) ─▶ kirim bertahap via Resend ─▶ catat email_events
                                              │
  Verifikasi publik /verify/:id ─▶ RPC security-definer (field aman) ─▶ catat verification_events
                                              │
  Bayar ─▶ Pakasir (redirect) ─▶ webhook ─▶ VERIFIKASI ke API transactiondetail ─▶ orders(paid) ─▶ aktifkan paket/kredit
```

Worker = Supabase Edge Function (cron) atau worker Node kecil (Fly/Railway free) yang polling `jobs`. Chunk kecil agar muat timeout free tier.

## 3. Data model final (menampung 10 area)

Inti:
- `profiles` — user (id = auth.users.id)
- `organizations` — penerbit (name, logo_url, handle, verified_issuer, plan)
- `memberships` — user↔org + role (owner/admin/member)
- `templates` — desain (name, layout JSON/SVG, fields[])
- `batches` — event (name, event_name, template_id, status, total_count)
- `credentials` — public_id unik (nanoid), recipient_name, recipient_email, fields jsonb, file_pdf/png/qr paths, status (valid/revoked)
- `recipients` — direktori orang (nama, email) untuk input manual & portofolio; kredensial bisa terhubung ke akun penerima via email
- `jobs` — antrean async (type: generate_batch | send_email, status, progress, total)

Pendukung:
- `email_events` — log kirim/buka per kredensial (untuk analitik distribusi)
- `verification_events` — log scan halaman verifikasi (analitik keaslian)
- `orders` — transaksi Pakasir (order_id, amount, status, verified_at)
- `credit_ledger` — saldo kredit / volume pack (untuk pay-per-batch)

RLS di semua tabel tenant (akses via `memberships`). Verifikasi & portofolio publik lewat RPC security-definer (hanya field aman).

---

## 4. PETA HALAMAN (detail) — fokus build UI

Rute = TanStack Router (file-based di `src/routes/`). Semua UI **Bahasa Indonesia, sentence case**. Warna: netral Faiz UI + brand biru `#2A5BEA` / teal `#16C0AE`. Reuse `src/components/ui/`.

### A. Publik (tanpa login)

**A1. Landing** 🔵 — `/`
Tujuan: jelaskan nilai + CTA daftar. Komponen: hero, fitur, harga, footer (reuse hero/logos Faiz UI). State: statis. Data: mock. *Build UI: bisa langsung.*

**A2. Masuk / Daftar** 🟢 — `/login`, `/register`
Tujuan: auth. Komponen: Card, Input, Button, form (email+password). State: idle/loading/error. Data: Supabase Auth (mock dulu). Aksi: masuk, daftar, lupa password.

**A3. Verifikasi publik** 🟢 — `/verify/$publicId`
Tujuan: bukti keaslian 1 kredensial (halaman brand). Komponen: card verifikasi, segel "Terverifikasi", nama (serif), penyelenggara, tanggal, ID, QR, status. State: valid / dicabut / tidak ditemukan. Data: RPC (mock dulu). Aksi: bagikan, tambah ke LinkedIn (URL add-to-profile), unduh.

**A4. Portofolio penerima publik** 🔵 — `/u/$handle`
Tujuan: halaman "seumur hidup" berisi semua kredensial seseorang lintas-penyelenggara. Komponen: header profil, grid kartu kredensial, filter (tahun/penyelenggara). State: kosong/terisi. Data: RPC publik. Aksi: klik kredensial → A3.

### B. Dashboard penerbit (login) — app shell (sidebar + topbar)

**Shell** 🟢 — layout `/dashboard/*`: sidebar (Hugeicons) + topbar (org switcher, user menu, tombol "Terbitkan batch baru"). Reuse layout "dashboard 1" Faiz UI.

**B1. Overview** 🟢 — `/dashboard`
Tujuan: ringkasan + akses cepat. Komponen: kartu metrik (kredensial terbit, batch aktif, scan verifikasi, email terkirim), tabel batch terbaru (baris padat + status chip), tombol utama terbit. State: kosong ("Terbitkan batch pertama") / terisi. Data: mock dulu.

**B2. Templates — galeri** 🟢 — `/dashboard/templates`
Tujuan: kelola template. Komponen: grid pratinjau template + tombol "Buat template", "Gunakan". State: kosong/terisi. Data: mock. Aksi: buat, edit, duplikat, hapus.

**B3. Editor template** 🔵 — `/dashboard/templates/$id/edit`
Tujuan: desain sertifikat. Komponen: kanvas pratinjau + panel properti (teks, logo, warna, posisi field dinamis {{nama}} dll), tombol simpan. State: editing/saving. Data: mock dulu. *(MVP inti bisa mulai dari 2–3 template preset + edit teks/logo/warna; editor penuh menyusul.)*

**B4. Batches — daftar** 🟢 — `/dashboard/batches`
Tujuan: semua batch. Komponen: Table (nama acara, template, jumlah, status, tanggal), search, filter status, tombol terbit. State: kosong/terisi/loading. Data: mock.

**B5. Buat batch — wizard** 🟢 — `/dashboard/batches/new`
Alur 3 langkah (stepper): 
- **Langkah 1 — Template**: pilih template. 
- **Langkah 2 — Peserta**: **dua tab → input manual (form tambah baris satu-satu)** untuk volume kecil, atau **unggah Excel/CSV** (map kolom → field) untuk volume besar. 
- **Langkah 3 — Pratinjau & terbitkan**: tabel data + peringatan validasi (nama kosong/duplikat/aneh); tombol "Terbitkan" aktif setelah dikonfirmasi; opsi "kirim email otomatis". 
Komponen: Stepper, Tabs, Input, file upload, Table, Alert, progress. State: draft/validating/issuing/progress/selesai/gagal. Data: mock dulu (UI bisa dibangun penuh tanpa backend).

**B6. Detail batch** 🟢 — `/dashboard/batches/$id`
Tujuan: kelola hasil. Komponen: header batch + progress; tabel kredensial (nama, email, status kirim, status verifikasi) + **search nama**; aksi per baris: **terbitkan-ulang/regenerate**, kirim ulang email, cabut (revoke), unduh; tombol unduh massal (ZIP); mini-analitik batch (terkirim/dibuka/discan). State: processing/completed. Data: mock.

**B7. Detail kredensial (penerbit)** 🔵 — `/dashboard/credentials/$id`
Tujuan: lihat/edit 1 kredensial. Komponen: pratinjau sertifikat, data penerima, riwayat (terbit/kirim/scan), tombol regenerate/revoke/kirim ulang. Data: mock.

**B8. Analitik** 🔵 — `/dashboard/analytics`
Tujuan: metrik lintas batch. Komponen: chart (recharts sudah ada di Faiz UI) — terbit/terkirim/dibuka/discan seiring waktu; tabel per batch. Data: mock. State: kosong/terisi.

**B9. Kontak/penerima** ⚪→🔵 — `/dashboard/recipients`
Tujuan: direktori orang (untuk input cepat & re-use). Komponen: Table + search + import. Data: mock. *(Bisa ditunda; tidak wajib untuk alur inti.)*

### C. Pengaturan (login)

**C1. Organisasi** 🟢 — `/dashboard/settings/organization`
Tujuan: branding penerbit. Komponen: form (nama, logo, handle publik), toggle verified issuer (⚪ nanti). Data: mock.

**C2. Tim** 🔵 — `/dashboard/settings/team`
Tujuan: anggota & peran. Komponen: Table anggota + undang + ubah peran. Data: mock.

**C3. Langganan & tagihan** 🔵 — `/dashboard/settings/billing`
Tujuan: paket, kredit, pembayaran. Komponen: kartu paket (Free/Pro/Bisnis), saldo kredit/volume pack, tombol upgrade → **checkout Pakasir (redirect)**, riwayat transaksi. State: current plan/pending payment/paid. Data: mock UI dulu; wiring Pakasir menyusul.

**C4. Akun** 🟢 — `/dashboard/settings/account`
Tujuan: profil user, ganti password. Komponen: form. Data: mock.

### D. Sisi penerima (login sebagai penerima)

**D1. Dompet/portofolio saya** 🔵 — `/wallet`
Tujuan: penerima kelola & tunjukkan kredensialnya. Komponen: grid kartu kredensial + filter; tombol bagikan/LinkedIn/unduh; atur handle publik (→ A4). Data: mock.

**D2. Klaim kredensial** 🔵 — `/claim/$token`
Tujuan: penerima klaim sertifikat via link email. Komponen: pratinjau + tombol "Klaim ke akun saya". Data: mock.

---

## 5. Urutan build UI-first (mock data dulu, backend nanti)

Karena Anda mau eksekusi UI dulu, bangun urutan ini dengan **data mock** — semua bisa dikerjakan tanpa Supabase aktif:

1. **Shell dashboard** (sidebar + topbar) — adaptasi "dashboard 1".
2. **B1 Overview** (kartu metrik + tabel batch, mock).
3. **B4 Batches** (tabel + filter).
4. **B5 Buat batch — wizard** (stepper + tab manual/Excel + pratinjau). ← inti pengalaman.
5. **B6 Detail batch** (tabel kredensial + search + aksi).
6. **A3 Verifikasi publik** (halaman brand) + **A2 Auth**.
7. **B2 Templates** + **B3 Editor** (mulai preset).
8. **C1/C4 Settings** dasar, **C3 Billing** (UI), **A1 Landing**.
9. **D1 Wallet** + **A4 Portofolio publik**.
10. **B8 Analitik**, **C2 Tim**, sisanya.

Setelah UI utama solid dengan mock, baru sambungkan backend mengikuti backbone (§2): Supabase schema+RLS → auth → generate job → email job → Pakasir. UI yang sudah rapi bikin wiring backend jauh lebih mudah.

## 6. Integrasi (ringkas, saat wiring)

- **Email**: Resend (free tier), domain diverifikasi (SPF/DKIM); kirim sebagai job bertahap.
- **Pakasir**: buat transaksi (order_id+amount) → redirect → **webhook diverifikasi ulang ke API `transactiondetail`** (webhook unsigned) → idempoten → `orders` paid. Sandbox untuk uji.
- **Storage**: Supabase Storage privat + signed URL.
- **Rahasia**: env only; service-role & api key Pakasir di server; jangan commit.

## 7. Di luar MVP (⚪)
e-Meterai/PSrE/TTE tersertifikasi, WhatsApp (semua bentuk), API publik/SSO/webhooks pihak ketiga, custom domain, verified-issuer resmi, editor desain tingkat lanjut. Alasan: butuh perizinan/approval pihak luar atau kompleksitas tak sepadan untuk MVP.
