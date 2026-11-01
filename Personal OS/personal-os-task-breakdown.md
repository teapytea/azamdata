# Personal OS — Rincian Task Pembangunan

Dokumen ini memecah seluruh pembangunan Personal OS menjadi task bertingkat.
Urutan bab = urutan pengerjaan. Jangan lompat bab kecuali disebutkan boleh paralel.

**Keputusan yang sudah dikunci:**

| Aspek | Keputusan |
|---|---|
| Backend | Supabase Free (Postgres, Auth, Storage, Edge Functions, Realtime, pg_cron) |
| Hosting | Vercel / Netlify / Cloudflare Pages (free tier, subdomain gratis) |
| Frontend | Sudah selesai — 5 halaman, tinggal disambungkan |
| Sinkronisasi kuota | On-demand (tombol refresh + saat halaman dibuka), bukan cron berkala |
| Cron | Hanya untuk urusan internal: notifikasi tagihan, keep-alive, backup |
| Sumber cashflow utama | Parsing email notifikasi transaksi bank (BCA, BSI) |
| Sumber cashflow dompet | Screenshot → OCR |
| Tujuan halaman Finance | Expense tracker, bukan saldo rekening: target bulanan, sisa target, kategori, histori, sumber pembayaran, bukti opsional |
| Periode Finance | Mulai 1 Januari 2026 dan berlanjut per bulan |
| Model OCR | Gemini Flash |
| Sumber Ideas & Notes | Vault Obsidian, **satu arah** — Obsidian sumber kebenaran |
| Dompet digital | Dimodelkan sebagai **akun**, bukan kategori pengeluaran |
| Anggaran | Nol rupiah — seluruh stack di free tier |

**Legenda estimasi:** S = ≤2 jam · M = setengah hari · L = 1–2 hari

---

## BAB 0 — Persiapan Lingkungan

> **Selesai bila:** semua akun aktif, key tersimpan aman, repo jalan.
> **Estimasi:** S

### 0.1 Akun dan project

- 0.1.1 Buat organisasi + project Supabase (region terdekat: Singapore)
- 0.1.2 Catat project URL dan anon key
- 0.1.3 Buat project hosting, sambungkan ke repo Git
- 0.1.4 Ambil API key Gemini dari Google AI Studio
- 0.1.5 Pasang 9Router secara lokal, catat port dan lokasi DATA_DIR-nya

### 0.2 Penyimpanan rahasia

- 0.2.1 Simpan Gemini key sebagai secret Edge Function — **jangan** di frontend
- 0.2.2 Kredensial provider 9Router tetap di mesin lokal — jangan disalin ke server
- 0.2.3 Buat satu shared secret untuk endpoint ingest (dipakai Apps Script & relay)
- 0.2.4 Pastikan `.env` masuk `.gitignore`; verifikasi tidak ada key di history repo

### 0.3 Repo dan struktur

- 0.3.1 Pisahkan folder: frontend, edge functions, migrasi SQL, script lokal
- 0.3.2 Simpan seluruh skema sebagai file migrasi SQL, bukan hasil klik dashboard
- 0.3.3 Buat repo **privat** — isinya akan menyangkut data keuangan

### 0.4 Pemetaan awal (riset, bukan koding)

- 0.4.1 Cek pengaturan notifikasi email di BCA dan BSI, pastikan aktif
- 0.4.2 Cari di Gmail: email apa saja yang selama ini dikirim GoPay, ShopeePay, DANA
- 0.4.3 Cari di Gmail: struk email Gojek dan konfirmasi Shopee
- 0.4.4 Kumpulkan 5–10 contoh email tiap sumber sebagai bahan uji parser
- 0.4.5 Kumpulkan 5–10 screenshot struk tiap dompet sebagai bahan uji OCR
- 0.4.6 Catat path vault Obsidian dan folder mana yang **tidak boleh** dibaca
- 0.4.7 Periksa apakah vault sudah tersinkron antar-perangkat, dan lewat apa

---

## BAB 1 — Fondasi Data

> **Selesai bila:** seluruh skema tercipta, RLS aktif, bisa insert/select dari dashboard.
> **Estimasi:** L
> **Bab paling menentukan. Jangan buru-buru.**

### 1.1 Autentikasi

- 1.1.1 Aktifkan email+password, matikan pendaftaran publik
- 1.1.2 Buat satu akun untuk diri sendiri
- 1.1.3 Uji login dan refresh token dari frontend

### 1.2 Konvensi wajib seluruh tabel

- 1.2.1 Kolom `id` (uuid), `created_at`, `updated_at`, `deleted_at` (soft delete)
- 1.2.2 Trigger otomatis pengisi `updated_at` di setiap update
- 1.2.3 Kolom `user_id` di semua tabel, dengan RLS aktif
- 1.2.4 Nilai uang disimpan sebagai **integer** satuan terkecil — bukan float
- 1.2.5 Semua timestamp disimpan UTC; konversi ke Asia/Jakarta hanya di tampilan

### 1.3 Tabel domain keuangan

- 1.3.1 `accounts` — rekening bank & dompet digital jadi satu tabel
  - 1.3.1.1 Field: nama, jenis (bank/ewallet), 4 digit terakhir, mata uang
  - 1.3.1.2 Field `initial_balance` + `initial_balance_date`
  - 1.3.1.3 Isi data awal: BCA, BSI, GoPay, ShopeePay, DANA
- 1.3.2 `categories` — kategori pengeluaran dan pemasukan
- 1.3.3 `merchants` — nama merchant + kategori default (untuk auto-kategorisasi)
  - 1.3.3.1 Field alias, agar variasi penulisan merchant menunjuk satu entri
- 1.3.4 `transactions`
  - 1.3.4.1 Field arah: `debit` / `credit` / `transfer`
  - 1.3.4.2 Field `account_id`, dan `counterpart_account_id` khusus transfer
  - 1.3.4.3 Field `status`: `draft` / `confirmed` / `reconciled` / `needs_review`
  - 1.3.4.4 Field `source`: `email` / `ocr` / `manual` / `import`
  - 1.3.4.5 Field `external_ref` (nomor referensi bank) + `source_bank`
  - 1.3.4.6 **Unique constraint** pada (`source_bank`, `external_ref`) — kunci anti-dobel
  - 1.3.4.7 Field `confidence` untuk menandai data berkeyakinan rendah
- 1.3.5 `attachments` — path file di Storage, hash gambar, relasi ke transaksi
  - 1.3.5.1 Unique index pada hash — cegah unggah gambar sama dua kali
- 1.3.6 `raw_ingests` — teks/berkas mentah sebelum diparsing
  - 1.3.6.1 Field: sumber, kanal, payload mentah, status proses, pesan error

### 1.4 Tabel domain langganan

- 1.4.1 `payment_methods` — relasi ke `accounts`, jenis kartu/transfer/e-wallet
- 1.4.2 `service_accounts` — akun layanan yang dipakai (email login, label)
- 1.4.3 `subscriptions`
  - 1.4.3.1 Field: nama tool, siklus, `anchor_date`, nominal + mata uang asli
  - 1.4.3.2 **Jangan** simpan `next_billing_date` sebagai kolom statis — hitung
  - 1.4.3.3 Aturan tanggal 29–31: mundur ke hari terakhir bulan
  - 1.4.3.4 Field status: aktif / dijeda / berhenti
- 1.4.4 `subscription_payments` — riwayat pembayaran aktual
  - 1.4.4.1 Field: nominal asli + mata uang, nominal IDR terbayar, kurs saat itu
  - 1.4.4.2 Relasi opsional ke `transactions` (satu pembayaran = satu transaksi)

### 1.5 Tabel domain kuota

- 1.5.1 `quota_providers` — Claude, OpenRouter, Lovable, Figma Make, dll
  - 1.5.1.1 Field: metode ambil (`api` / `local_agent` / `manual`)
  - 1.5.1.2 Field `last_synced_at`
- 1.5.2 `quota_snapshots` — nilai terukur per waktu
  - 1.5.2.1 Field: sisa, batas, satuan (kredit/token/persen), waktu reset
  - 1.5.2.2 Field `expires_at` — khusus kredit gratis OpenRouter
- 1.5.3 `usage_events` — event pemakaian bertimestamp (untuk window bergulir)

### 1.6 Tabel domain ide (cerminan vault Obsidian)

- 1.6.1 `notes` — satu baris per catatan
  - 1.6.1.1 Field `obsidian_id` (dari frontmatter) — **unique**, jadi kunci upsert
  - 1.6.1.2 Field: judul, status, prioritas, tanggal target, path relatif
  - 1.6.1.3 Field konten sebagai teks markdown mentah
  - 1.6.1.4 Field `last_seen_at` — untuk deteksi catatan yang dihapus di vault
- 1.6.2 `note_tags` — relasi tag
- 1.6.3 Aktifkan full-text search pada judul + konten
- 1.6.4 **Tidak perlu** tabel board/list/card atau kolom posisi — urutan dari Obsidian

### 1.7 Keamanan baris

- 1.7.1 Aktifkan RLS di **seluruh** tabel tanpa kecuali
- 1.7.2 Policy: hanya baris milik `auth.uid()` yang bisa dibaca/ditulis
- 1.7.3 Uji negatif: panggil API tanpa token, pastikan tertolak
- 1.7.4 Cek kebijakan grant PostgREST (project baru butuh grant eksplisit)

---

## BAB 2 — Modul Subscriptions (modul pilot)

> **Selesai bila:** halaman Subscriptions berfungsi penuh dengan data sungguhan.
> **Estimasi:** L
> **Tujuan sebenarnya:** menemukan kesalahan desain selagi baru satu modul.

### 2.1 Operasi dasar

- 2.1.1 Tampilkan daftar langganan dari database
- 2.1.2 Form tambah langganan
- 2.1.3 Edit langganan
- 2.1.4 Hapus (soft delete)
- 2.1.5 Ganti status aktif/jeda/berhenti

### 2.2 Logika turunan

- 2.2.1 Fungsi hitung tanggal tagihan berikutnya dari siklus + anchor
- 2.2.2 Uji kasus tanggal 29, 30, 31 di bulan Februari
- 2.2.3 Hitung total pengeluaran bulanan dan tahunan
- 2.2.4 Konversi langganan USD ke IDR untuk total gabungan

### 2.3 Pencatatan pembayaran

- 2.3.1 Form catat pembayaran (nominal asli, nominal IDR, kurs, metode)
- 2.3.2 Tampilkan riwayat pembayaran per langganan
- 2.3.3 Cegah pencatatan ganda untuk periode yang sama

### 2.4 Kualitas interaksi

- 2.4.1 Optimistic update di semua aksi
- 2.4.2 Rollback + pesan jelas saat gagal
- 2.4.3 Skeleton state, bukan layar kosong
- 2.4.4 Empty state yang informatif

---

## BAB 3 — Lapisan Sinkronisasi

> **Selesai bila:** lapisan ini berdiri sendiri, tidak tahu-menahu soal Subscriptions.
> **Estimasi:** L
> **Bab paling teknis. Menentukan rasa seluruh aplikasi.**

### 3.1 Cache lokal

- 3.1.1 Siapkan IndexedDB sebagai sumber baca utama di client
- 3.1.2 Muat awal: ambil dari server → tulis cache → render dari cache
- 3.1.3 Simpan `last_synced_at` per tabel

### 3.2 Realtime

- 3.2.1 Berlangganan perubahan hanya pada tabel yang relevan dengan halaman aktif
- 3.2.2 Berhenti berlangganan saat halaman ditinggalkan
- 3.2.3 Tambal cache lokal saat event masuk

### 3.3 Catch-up (jangan dilewat)

- 3.3.1 Deteksi koneksi pulih
- 3.3.2 Ambil semua baris dengan `updated_at` > `last_synced_at`
- 3.3.3 Uji skenario: matikan jaringan, ubah data dari perangkat lain, nyalakan

### 3.4 Konflik dan antrean offline

- 3.4.1 Aturan konflik: `updated_at` terbaru menang
- 3.4.2 Antrean outbox untuk aksi saat offline
- 3.4.3 ID unik dari client per aksi → server abaikan duplikat
- 3.4.4 Kirim ulang otomatis saat online, dengan jeda bertahap

### 3.5 Generalisasi

- 3.5.1 Refactor: pastikan lapisan ini bisa dipakai modul mana pun
- 3.5.2 Dokumentasikan cara memasangnya ke modul baru

---

## BAB 4 — Modul Finance (input manual dulu)

> **Selesai bila:** bisa mencatat, mengedit, dan melihat transaksi tanpa otomasi apa pun.
> **Estimasi:** M
> **Otomasi baru masuk di BAB 10–12. Fondasinya harus benar dulu.**

> **Koreksi kebutuhan terbaru:** UI Finance berfokus hanya pada pengeluaran. Saldo rekening, total kekayaan, dan pemasukan tidak ditampilkan. Transfer antar akun tetap disimpan untuk deduplikasi tetapi tidak masuk total pengeluaran. Ringkasan utama adalah target pengeluaran bulanan, jumlah terpakai, dan sisa/kelebihan target.

### 4.1 Operasi transaksi

- 4.1.1 Form tambah transaksi manual
- 4.1.2 Pilih akun, kategori, merchant, arah
- 4.1.3 Edit dan soft delete
- 4.1.4 Daftar transaksi dengan filter periode dan akun

### 4.2 Model transfer antar akun

- 4.2.1 Jenis transaksi `transfer` yang menyentuh dua akun
- 4.2.2 Top-up dompet dicatat sebagai transfer, **bukan** pengeluaran
- 4.2.3 Pastikan transfer tidak masuk total pengeluaran di laporan mana pun
- 4.2.4 Uji: top-up 200rb lalu belanja 15rb → total pengeluaran = 15rb

### 4.3 Saldo turunan

- 4.3.1 Data akun dipakai sebagai sumber pembayaran, bukan sumber saldo real
- 4.3.2 Jangan tampilkan saldo per akun atau total kekayaan di halaman Finance
- 4.3.3 Tampilkan total pengeluaran per sumber pembayaran

### 4.4 Kategorisasi

- 4.4.1 Auto-kategori dari tabel `merchants` saat merchant dikenali
- 4.4.2 Saat merchant baru dikategorikan manual, simpan agar berlaku ke depan
- 4.4.3 Layar kelola merchant dan alias

### 4.5 Ringkasan

- 4.5.1 Target maksimal pengeluaran, jumlah terpakai, serta sisa/kelebihan per bulan
- 4.5.2 Rincian per kategori
- 4.5.3 Grafik tren pengeluaran bulanan sejak 1 Januari 2026
- 4.5.4 Histori pengeluaran dengan sumber pembayaran dan bukti email/lampiran bila tersedia

---

## BAB 5 — Modul Ideas & Notes (sumber: Obsidian)

> **Selesai bila:** catatan dari vault tampil di halaman Ideas, terfilter dan terkelompok.
> **Estimasi:** S–M
> **Arah data satu arah.** Obsidian = sumber kebenaran, Personal OS = tampilan.
> Tidak ada editor, tidak ada drag-and-drop, tidak ada fractional indexing.

### 5.1 Kontrak frontmatter

- 5.1.1 Sepakati field wajib: `id`, jenis catatan, status, prioritas, tag, tanggal target
- 5.1.2 `id` dibuat sekali dan **tidak pernah berubah** — jangan pakai path sebagai identitas
- 5.1.3 Hanya catatan dengan jenis yang dikenali yang diproses
- 5.1.4 Terapkan template Obsidian agar catatan baru otomatis punya frontmatter benar
- 5.1.5 Daftar nilai status = kolom Kanban di Personal OS

### 5.2 Agen lokal pembaca vault

- 5.2.1 Tambahkan tugas ke agen yang sudah ada (dipakai 9Router) — bukan agen baru
- 5.2.2 Path vault sebagai **konfigurasi**, bukan ditulis mati di kode
- 5.2.3 Pemindaian berkala: bandingkan waktu modifikasi terhadap sinkronisasi terakhir
- 5.2.4 Kirim hanya file yang berubah dan lolos filter frontmatter
- 5.2.5 Daftar folder yang dikecualikan — filter di sisi **agen**, bukan di server
- 5.2.6 Jangan pernah kirim seluruh isi vault

### 5.3 Pemrosesan di server

- 5.3.1 Simpan ke `raw_ingests` sebelum parsing (frontmatter rusak ≠ catatan hilang)
- 5.3.2 Parse frontmatter + heading level atas; isi catatan disimpan sebagai teks
- 5.3.3 Upsert berdasarkan `id` frontmatter
- 5.3.4 Deteksi penghapusan: kirim daftar lengkap `id` berkala, tandai yang hilang
- 5.3.5 Frontmatter tidak valid → `needs_review`, jangan diam-diam dilewati

### 5.4 Tampilan

- 5.4.1 Kelompokkan kartu berdasarkan field status
- 5.4.2 Filter berdasarkan tag dan prioritas
- 5.4.3 Pencarian judul dan isi
- 5.4.4 Tautan buka catatan langsung di Obsidian (URI scheme)
- 5.4.5 Label kapan vault terakhir tersinkron — data basi harus terlihat basi

### 5.5 Tangkap ide dari HP (opsional)

- 5.5.1 Hanya **buat catatan baru**, tidak mengedit yang ada — hindari konflik
- 5.5.2 Catatan baru ditulis sebagai file baru ke vault oleh agen
- 5.5.3 Bila terasa kurang, pertimbangkan jalur Git (commit dari HP memicu proses)

---

## BAB 6 — Modul Quota (pencatatan manual + kerangka refresh)

> **Selesai bila:** halaman Quota hidup dan countdown berjalan, meski data masih manual.
> **Estimasi:** M

### 6.1 Prinsip derived state

- 6.1.1 Jangan simpan persentase — simpan event + waktu, hitung saat render
- 6.1.2 Fungsi hitung window 5 jam bergulir dari `usage_events`
- 6.1.3 Waktu reset = event tertua dalam window + 5 jam
- 6.1.4 Countdown berjalan di client dengan timer, tanpa panggil server

### 6.2 Tampilan

- 6.2.1 Kartu per penyedia: sisa, batas, waktu reset
- 6.2.2 Tampilkan batas 5 jam dan batas mingguan **terpisah**
- 6.2.3 Label "diperbarui X menit lalu" di setiap kartu
- 6.2.4 Peringatan visual untuk kredit yang mendekati tanggal kedaluwarsa

### 6.3 Kerangka refresh on-demand

- 6.3.1 Satu fungsi "ambil kuota semua penyedia" yang **agnostik terhadap pemicu**
- 6.3.2 Pemicu A: tombol refresh manual
- 6.3.3 Pemicu B: saat halaman Quota dibuka
- 6.3.4 Penjaga: lewati bila data terakhir < 5 menit
- 6.3.5 Panggil semua penyedia **paralel**, bukan berurutan
- 6.3.6 Status per penyedia — kegagalan satu tidak menjatuhkan seluruh layar
- 6.3.7 Pola stale-while-revalidate: tampilkan angka lama, ganti saat data datang

### 6.4 Input manual

- 6.4.1 Tombol "mulai sesi" untuk mencatat `usage_event`
- 6.4.2 Form update manual untuk penyedia tanpa API (Figma Make)

---

## BAB 7 — Dashboard

> **Selesai bila:** dashboard menampilkan agregat dari empat modul lain.
> **Estimasi:** M
> **Dikerjakan setelah modul lain — isinya agregasi, bukan data baru.**

### 7.1 Kartu ringkasan

- 7.1.1 Total langganan aktif + biaya bulanan
- 7.1.2 Tagihan terdekat
- 7.1.3 Ringkasan kuota kritis
- 7.1.4 Saldo dan arus kas bulan berjalan
- 7.1.5 Ide aktif terbaru

### 7.2 Kinerja

- 7.2.1 Agregasi berat dilakukan di database, bukan di client
- 7.2.2 Muat progresif — jangan tunggu semua selesai baru render

---

## BAB 8 — PWA dan Offline

> **Selesai bila:** aplikasi bisa dipasang, terbuka tanpa internet, aksi offline tersimpan.
> **Estimasi:** M
> **Sengaja setelah modul selesai — service worker terlalu dini menyulitkan development.**

### 8.1 Dasar PWA

- 8.1.1 Manifest: nama, ikon semua ukuran, warna tema, display standalone
- 8.1.2 Uji Add to Home Screen di Android dan iOS
- 8.1.3 Splash screen dan ikon adaptif

### 8.2 Strategi cache

- 8.2.1 Kerangka aplikasi: cache-first
- 8.2.2 Data: stale-while-revalidate
- 8.2.3 Gambar lampiran: cache-first dengan batas ukuran
- 8.2.4 Mekanisme pembaruan versi + prompt "versi baru tersedia"

### 8.3 Offline

- 8.3.1 Indikator status koneksi
- 8.3.2 Antrean outbox aktif (dari BAB 3.4)
- 8.3.3 Jalur cadangan pengiriman ulang untuk iOS (Background Sync tidak didukung)
- 8.3.4 Uji: matikan jaringan, catat transaksi, nyalakan, pastikan terkirim

### 8.4 Share target

- 8.4.1 Daftarkan Web Share Target (Android) untuk gambar
- 8.4.2 Buat Shortcut share sheet (iOS)
- 8.4.3 Arahkan hasil share ke pipeline OCR (BAB 9)

---

## BAB 9 — Pipeline OCR

> **Selesai bila:** foto struk dan screenshot dompet bisa jadi draft transaksi.
> **Estimasi:** L

### 9.1 Praproses di client

- 9.1.1 Kompres ke sisi terpanjang ~1000px
- 9.1.2 Auto-crop area struk
- 9.1.3 Luruskan kemiringan, naikkan kontras, skala abu-abu
- 9.1.4 Hitung hash gambar untuk deteksi duplikat

### 9.2 Unggah

- 9.2.1 Unggah ke Supabase Storage
- 9.2.2 Dukung unggah **banyak file sekaligus**
- 9.2.3 Tolak lebih awal bila hash sudah ada

### 9.3 Ekstraksi

- 9.3.1 Edge Function: ambil file → kirim ke Gemini Flash
- 9.3.2 Gunakan fitur structured output dengan skema respons eksplisit
- 9.3.3 Prompt memuat konteks Indonesia: tanggal DD/MM, titik = ribuan, IDR
- 9.3.4 Instruksi eksplisit: ambil **Total**, bukan Sub Total
- 9.3.5 Instruksi eksplisit: kembalikan `null` bila ragu — **jangan menebak**
- 9.3.6 Minta tingkat keyakinan per field
- 9.3.7 Deteksi layout dompet (GoPay/ShopeePay/DANA) untuk pemetaan lebih presisi

### 9.4 Konfirmasi (wajib, tidak boleh dilewat)

- 9.4.1 Layar konfirmasi terisi otomatis
- 9.4.2 Field berkeyakinan rendah ditandai warna
- 9.4.3 Pilihan jenis: pengeluaran / transfer antar akun — **default pengeluaran**
- 9.4.4 Baru simpan permanen setelah dikonfirmasi

### 9.5 Ketahanan

- 9.5.1 Jeda bertahap saat kena rate limit (1s, 2s, 4s)
- 9.5.2 Gagal ekstraksi → gambar **tetap disimpan**, status `needs_review`
- 9.5.3 Simpan respons mentah di samping data terkoreksi untuk evaluasi
- 9.5.4 Layar daftar item yang perlu ditinjau

---

## BAB 10 — Ingest Email Transaksi

> **Selesai bila:** transaksi BCA dan BSI masuk otomatis tanpa Anda sentuh.
> **Estimasi:** L
> **Ini komponen bernilai tertinggi di seluruh proyek.**

### 10.1 Endpoint penerima tunggal

- 10.1.1 Satu endpoint untuk semua kanal: terima teks mentah + sumber + waktu + kanal
- 10.1.2 Simpan ke `raw_ingests` **sebelum** parsing
- 10.1.3 Autentikasi dengan shared secret
- 10.1.4 Parsing berjalan terpisah dari penerimaan — gagal parse tidak hilangkan data

### 10.2 Jembatan Gmail

- 10.2.1 Buat filter Gmail berlabel khusus untuk pengirim bank
- 10.2.2 Buat Google Apps Script (bukan Gmail API — hindari OAuth)
- 10.2.3 Script baca **hanya** thread berlabel, kirim ke endpoint
- 10.2.4 Tandai pesan sudah diproses; simpan message ID sebagai kunci idempotensi
- 10.2.5 Jadwalkan script berjalan berkala

### 10.3 Verifikasi keamanan

- 10.3.1 Cocokkan alamat pengirim **persis** — bukan nama tampilan
- 10.3.2 Wajibkan lolos autentikasi pengirim (SPF/DKIM)
- 10.3.3 Gagal verifikasi → `needs_review`, jangan pernah proses otomatis
- 10.3.4 Uji dengan email palsu buatan sendiri, pastikan tertolak

### 10.4 Tabel pemetaan per bank

- 10.4.1 Struktur pemetaan: label bank → field internal
- 10.4.2 **Parser angka per bank** — BSI `Rp 15.000` vs BCA `IDR 13,000.00`
- 10.4.3 **Parser tanggal per bank** — ISO vs `28 Jul 2026`
- 10.4.4 Kamus singkatan bulan Indonesia (Agu, Okt, Des) — jangan pakai locale Inggris
- 10.4.5 Pemetaan "Jenis Transaksi" → debit/kredit/transfer
- 10.4.6 Jenis tidak dikenal → `needs_review`, **jangan menebak arah**
- 10.4.7 Hanya proses status "Berhasil"; abaikan gagal dan pending

### 10.5 Dedup

- 10.5.1 Ambil nomor referensi sebagai `external_ref`
- 10.5.2 Andalkan unique constraint (`source_bank`, `external_ref`)
- 10.5.3 Uji: kirim email sama dua kali, pastikan hanya satu transaksi

### 10.6 Deteksi transfer ke dompet sendiri

- 10.6.1 Daftar pola tujuan yang menandakan akun dompet milik sendiri
- 10.6.2 Bila cocok → tandai `transfer`, bukan pengeluaran
- 10.6.3 Uji dengan email top-up asli

### 10.7 Perluasan sumber

- 10.7.1 Tambah pemetaan untuk struk email Gojek
- 10.7.2 Tambah pemetaan untuk konfirmasi Shopee
- 10.7.3 Verifikasi tidak dobel dengan screenshot untuk transaksi yang sama

### 10.8 Uji regresi

- 10.8.1 Kumpulkan contoh email dari BAB 0.4.4 sebagai fixture
- 10.8.2 Uji otomatis parser terhadap seluruh fixture
- 10.8.3 Jalankan ulang setiap kali menambah bank baru

---

## BAB 11 — Backfill Riwayat

> **Selesai bila:** aplikasi punya riwayat berbulan-bulan sejak hari pertama dipakai.
> **Estimasi:** M
> **Bisa dikerjakan segera setelah BAB 10 stabil. Nilai instan.**

### 11.1 Proses mundur

- 11.1.1 Jalankan script Gmail atas seluruh arsip, bukan hanya email baru
- 11.1.2 Proses bertahap untuk menghindari batas eksekusi
- 11.1.3 Pantau tingkat keberhasilan parsing per bank

### 11.2 Panen data turunan

- 11.2.1 Ekstrak daftar merchant unik dari hasil backfill
- 11.2.2 Kategorikan merchant yang sering muncul sekali saja
- 11.2.3 Verifikasi auto-kategorisasi bekerja untuk transaksi baru

### 11.3 Pembersihan

- 11.3.1 Tinjau item `needs_review` hasil backfill
- 11.3.2 Tetapkan saldo awal akun berdasarkan titik mulai backfill

---

## BAB 12 — Rekonsiliasi Bulanan

> **Selesai bila:** ada satu layar yang membuktikan data Anda lengkap atau menunjukkan bocornya.
> **Estimasi:** M

### 12.1 Impor mutasi

- 12.1.1 Form unggah mutasi rekening (PDF/CSV) dengan field password PDF
- 12.1.2 Password tidak disimpan di database
- 12.1.3 Parsing mutasi jadi daftar baris

### 12.2 Pencocokan

- 12.2.1 Cocokkan lewat `external_ref` bila tersedia
- 12.2.2 Fallback: nominal sama persis + tanggal dalam ±2 hari
- 12.2.3 Saat cocok: nominal & tanggal ikut mutasi, merchant & lampiran ikut draft
- 12.2.4 Baris mutasi tanpa pasangan → transaksi baru
- 12.2.5 Draft tanpa pasangan → tandai untuk ditinjau
- 12.2.6 Ubah status menjadi `reconciled`

### 12.3 Rekonsiliasi dompet

- 12.3.1 Form input saldo asli tiap dompet
- 12.3.2 Bandingkan dengan saldo hitungan sistem
- 12.3.3 Tampilkan selisih sebagai indikator kebocoran tracking
- 12.3.4 Alur cepat menambahkan transaksi yang terlewat

### 12.4 Layar rekonsiliasi

- 12.4.1 Ringkasan: berapa cocok, berapa baru, berapa perlu tinjau
- 12.4.2 Riwayat rekonsiliasi per bulan

---

## BAB 13 — Integrasi Kuota Otomatis

> **Selesai bila:** kuota terisi sendiri saat tombol refresh ditekan.
> **Estimasi:** M
> Bisa paralel dengan BAB 10–12 karena tidak saling bergantung.

### 13.1 9Router (sumber kuota utama — kerjakan pertama)

> 9Router adalah gateway lokal di `localhost`, **bukan** layanan cloud.
> Arah datanya terbalik: agen lokal **push** ke Supabase, bukan server yang pull.

- 13.1.1 Telusuri cara membaca data kuota 9Router — pilih salah satu:
  - 13.1.1.1 Endpoint internal dashboard (periksa panggilan jaringannya)
  - 13.1.1.2 Baca langsung file data di DATA_DIR
  - 13.1.1.3 Baca kode sumbernya (MIT, terbuka)
- 13.1.2 Bangun agen lokal: baca kuota per provider → kirim ke endpoint ingest
  - 13.1.2.1 Agen ini juga membaca vault Obsidian (BAB 5.2) — satu agen, dua tugas
- 13.1.3 Simpan per provider terpisah, bukan satu angka gabungan
- 13.1.4 Simpan tanggal kedaluwarsa kredit gratis per provider
- 13.1.5 Peringatan bila mendekati kedaluwarsa
- 13.1.6 Tandai di UI kapan agen lokal terakhir aktif — data basi harus terlihat basi
- 13.1.7 Fallback: form input manual bila laptop sedang mati

### 13.2 Lovable

- 13.2.1 Ambil detail workspace termasuk saldo kredit
- 13.2.2 Simpan sebagai snapshot

### 13.3 Claude Code

> Bila trafik Claude Code diarahkan lewat 9Router, 13.1 sudah mencakup sebagian.
> Log lokal tetap berguna sebagai pembanding — pakai keduanya, jangan dijumlahkan.

- 13.3.1 Script lokal membaca log sesi di mesin sendiri
- 13.3.2 Kirim ke endpoint ingest
- 13.3.3 Pemicu berbasis hook, bukan polling
- 13.3.4 Tandai di UI: angka ini hanya mencakup Claude Code, bukan chat
- 13.3.5 Tampilkan batas mingguan terpisah dari window 5 jam

### 13.4 Codex / ChatGPT di VS Code

- 13.4.1 Cek apakah menulis log sesi lokal
- 13.4.2 Bila ya, gunakan mekanisme sama dengan 13.3

### 13.5 Figma Make

- 13.5.1 Tetap manual — sediakan form update cepat
- 13.5.2 Tampilkan tanggal pembaruan terakhir dengan jelas

---

## BAB 14 — Job Terjadwal Internal

> **Selesai bila:** tiga job harian berjalan dan terbukti tidak dobel.
> **Estimasi:** M
> **Jangan tunda — dua dari tiga job ini melindungi data Anda.**

### 14.1 Notifikasi tagihan

- 14.1.1 Job harian memeriksa tanggal jatuh tempo langganan
- 14.1.2 Kirim Web Push H-3 dan H-1
- 14.1.3 Tandai notifikasi terkirim per langganan per periode (idempoten)
- 14.1.4 Uji push di Android dan iOS (iOS wajib sudah di-Add to Home Screen)

### 14.2 Keep-alive Supabase

- 14.2.1 Ping harian ke project agar tidak dipause setelah 7 hari tanpa aktivitas
- 14.2.2 Verifikasi berjalan dengan sengaja tidak membuka aplikasi seminggu

### 14.3 Backup

- 14.3.1 Ekspor database terjadwal ke lokasi lain
- 14.3.2 **Uji restore** — backup yang belum pernah direstore bukan backup
- 14.3.3 Backup juga isi Storage (lampiran struk)

### 14.4 Pemeriksaan kedaluwarsa

- 14.4.1 Cek kredit gratis yang mendekati kedaluwarsa
- 14.4.2 Kirim notifikasi bila ada

---

## BAB 15 — Pengerasan dan Rilis

> **Selesai bila:** Anda memakainya sehari-hari tanpa khawatir.
> **Estimasi:** M

### 15.1 Keamanan

- 15.1.1 Audit: tidak ada key atau secret di bundle frontend
- 15.1.2 Verifikasi RLS lewat uji negatif menyeluruh
- 15.1.3 Pastikan tidak ada nomor kartu/PAN lengkap tersimpan
- 15.1.4 Pastikan tidak ada kredensial m-banking di mana pun

### 15.2 Ketahanan

- 15.2.1 Uji seluruh alur dalam kondisi jaringan buruk
- 15.2.2 Uji perilaku saat Gemini dan endpoint penyedia gagal
- 15.2.3 Pastikan tidak ada jalur yang menghilangkan data saat error

### 15.3 Pemantauan ringan

- 15.3.1 Halaman kesehatan: kapan tiap sumber terakhir berhasil
- 15.3.2 Hitung item `needs_review` yang menumpuk
- 15.3.3 Log kegagalan parsing dengan konteks cukup untuk diperbaiki

### 15.4 Batas free tier

- 15.4.1 Pantau ukuran database dan Storage
- 15.4.2 Kebijakan retensi lampiran (arsipkan gambar lama)
- 15.4.3 Pantau egress bulanan

### 15.5 Dokumentasi pribadi

- 15.5.1 Catat cara menambah bank/dompet/penyedia kuota baru
- 15.5.2 Catat lokasi seluruh secret dan cara memutarnya
- 15.5.3 Catat prosedur restore backup

---

## Ketergantungan antar bab

```
BAB 0 → BAB 1 → BAB 2 → BAB 3 → ┬→ BAB 4 → ┬→ BAB 7 → BAB 8 → BAB 9 → BAB 10 → BAB 11 → BAB 12
                                 │          │
                                 ├→ BAB 5 ──┤
                                 └→ BAB 6 ──┘
                                            └→ BAB 13 (paralel)
                                            └→ BAB 14 (paralel, jangan ditunda)
                                                                              → BAB 15
```

**Sudah berguna setelah BAB 4.** Sudah terasa otomatis setelah BAB 10.
Sudah bisa dipercaya penuh setelah BAB 12.

---

## Tiga aturan yang berlaku di seluruh bab

1. **Jangan pernah menebak.** Nilai `null` atau status `needs_review` selalu lebih baik daripada angka salah yang terlihat wajar. Angka salah tidak akan Anda sadari sampai laporannya sudah tidak berguna.

2. **Data mentah disimpan sebelum diolah.** Email, gambar, respons model — simpan apa adanya dulu. Kegagalan parsing tidak boleh berarti kehilangan data.

3. **Setiap sumber otomatis butuh pembuktian.** Rekonsiliasi bulanan bukan fitur tambahan; itu satu-satunya yang membedakan data yang benar dari data yang kelihatan benar.
