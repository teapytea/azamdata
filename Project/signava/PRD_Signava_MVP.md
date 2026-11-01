# PRD — Signava MVP (kaya)

**Versi:** 0.2 (living document) — selaras dengan `Signava_MVP_Spec_v2.md`
**Status:** Hipotesis kerja — bertumpu pada riset Certifier + 1 wawancara. Perlu validasi lanjutan.
**Legenda:** 🟢 MVP inti · 🔵 MVP lengkap (menyusul cepat) · ⚪ di luar MVP · 🔶 asumsi belum tervalidasi · 🔵Q open question

> Pembagian tugas dokumen: **PRD ini = APA & UNTUK SIAPA** (problem, persona, scope, epic, story). **`Signava_MVP_Spec_v2.md` = BAGAIMANA** (arsitektur, data model, detail halaman, urutan build UI-first). Keduanya harus dibaca bersama.

---

## 1. Executive Summary
Signava adalah platform penerbitan & verifikasi kredensial digital untuk penyelenggara bervolume tinggi di Indonesia (kampus/wisuda, LPK, EO, komunitas). Penyelenggara membuat/pilih template, memasukkan peserta **secara manual (volume kecil) atau via unggah Excel/CSV (volume besar)**, menerbitkan ratusan–ribuan sertifikat sekaligus, membagikannya lewat **email**, dan tiap sertifikat punya **halaman verifikasi publik ber-QR**. Penerima memiliki **portofolio kredensial lintas-penyelenggara**. Monetisasi lewat paket berbayar + volume pack dengan pembayaran **Pakasir (QRIS/VA)**. Target dampak: ≥40% penerbit menyelesaikan batch pertama, ≥25% batch kedua dalam 60 hari.

## 2. Problem Statement
**Siapa:** operator/koordinator sertifikat bervolume tinggi (wisuda sekolah/kampus, LPK, webinar, kepanitiaan), bukan desainer/IT.
**Masalah:** membuat, membagikan, dan memverifikasi sertifikat massal dilakukan manual (Word/PPT/Canva + Google Sheets + cetak/kirim satu-satu). Revisi satu nama di antara ribuan file menyulitkan; sertifikat tampak tidak profesional & sulit dibuktikan asli.
**Kenapa menyakitkan:** berjam-jam kerja per acara; biaya cetak ~Rp5.000/lembar (~Rp5 juta/1.000); rawan salah & komplain; citra kurang kredibel.
**Bukti (n=1 — perlu diperkuat):** "membuat desain… pusing sekali"; "ribuan sertifikat kita scroll satu-satu… menyebalkan"; "kalau di-share link Canva, tidak profesional"; "kalau ada QR kan enak". Volume: TK ~30, SMP ~200, universitas **sampai 5.000 sekali generate**. 🔵Q butuh 4–6 wawancara untuk saturasi.

## 3. Persona
**Primer — "Pandu, Sang Operator Sertifikat":** mengelola penerbitan untuk banyak institusi/klien; tech rendah–menengah; hidup di Canva + Sheets + printer. Goal: terbit massal cepat & benar, tampil profesional, revisi cepat, berhenti lembur. 🔵Q pelanggan langsung atau channel jasa multi-klien?
**Sekunder — "Kirana, Sang Kolektor Kredensial" (penerima):** ingin satu portofolio kredensial seumur hidup lintas-penyelenggara, terverifikasi, bisa ditunjukkan ke HR. 🔶 aspirasional (n=1) — **masuk MVP lengkap (🔵), tetap divalidasi.**

## 4. Strategic Context
North Star: kredensial terverifikasi diterbitkan & dibagikan/bulan. Beachhead: pendidikan/wisuda + LPK. Diferensiasi: kredensial terverifikasi diakui lokal + hemat cetak; harga/bahasa/pembayaran lokal sebagai keunggulan struktural. Pasar: TAM ~Rp750 M/th, SAM ~Rp260 M/th, SOM th-3 ~Rp10 M ARR (🔶 ARPU/penetrasi asumsi). Kompetitor: Certifier (USD/Inggris), Credly/Accredible (per-penerima, mahal); substitusi lokal = Canva + Sheets + jasa freelance.

## 5. Solution Overview
Aplikasi web (mobile-friendly, Bahasa Indonesia) dengan alur inti: pilih/desain template → **input peserta (manual ATAU Excel/CSV) + validasi** → terbitkan batch massal (tiap kredensial: ID unik + QR + halaman verifikasi) → **distribusi email** + unduh massal + tombol LinkedIn add-to-profile → kelola batch (cari nama, **regenerate 1 kredensial**, revoke) → analitik. Penerima: halaman kredensial + portofolio lintas-penyelenggara. Monetisasi: free/paid + volume pack via Pakasir. Detail halaman & arsitektur: `Signava_MVP_Spec_v2.md`.

## 6. Success Metrics
| Jenis | Metrik | Target (6 bln) |
|---|---|---|
| Activation | % penerbit selesai batch pertama | ≥40% 🔶 |
| Retention | % batch kedua ≤60 hari | ≥25% 🔶 |
| Distribusi | email terkirim/dibuka per batch | tren naik |
| Verifikasi | scan halaman verifikasi/kredensial | tren naik |
| Monetisasi | konversi free→berbayar (via Pakasir) | ≥3% 🔶 |
| Kualitas | waktu unggah→batch terkirim | < 15 menit |

## 7. Epics & User Stories
Epic dipetakan ke area produk. Detail halaman per epic ada di Spec v2 §4.

**E1 — Penerbitan** 🟢 *Hipotesis: jika Pandu bisa input peserta (manual/Excel) → generate massal ter-validasi, ia berhenti kerja manual.*
- **E1.1 Input manual** 🟢 — *Sebagai Pandu, saya ingin menambah peserta satu per satu lewat form* (untuk volume kecil). **G/W/T:** Given tab "Input manual", When saya isi nama (+field) & tambah baris, Then peserta masuk daftar batch tanpa perlu file.
- **E1.2 Unggah Excel/CSV** 🟢 — *…mengunggah daftar peserta dari Excel/CSV* (untuk volume besar). **G/W/T:** Given file, When unggah & map kolom→field, Then semua baris terbaca.
- **E1.3 Preview & validasi** 🟢 — deteksi nama kosong/duplikat/aneh sebelum generate.
- **E1.4 Template preset + edit dasar** 🟢 / **editor drag-drop** 🔵 — logo/teks/warna/field dinamis.
- **E1.5 Generate massal** 🟢 — batch (paket) per acara; kecil sinkron, besar async + progress.

**E2 — Verifikasi & keaslian** 🟢 *Hipotesis: QR-verifikasi bikin sertifikat tampak profesional → retensi & WTP.*
- Halaman verifikasi publik + QR + ID unik 🟢; status berlaku/dicabut (revoke) 🔵.

**E3 — Distribusi (EMAIL-only)** 🟢 *Hipotesis: hemat cetak + kemudahan bagi = alasan pakai.*
- Kirim email ber-branding (async bertahap) 🟢; unduh massal ZIP 🟢; ekspor print-ready 🔵; tombol LinkedIn add-to-profile 🔵. **WhatsApp = ⚪ (di luar MVP).**

**E4 — Sisi penerima** 🔵 *Hipotesis: portofolio lintas-penyelenggara menciptakan efek jaringan.*
- Halaman kredensial personal; dompet/portofolio publik (`/u/handle`); klaim via email.

**E5 — Pengelolaan pasca-terbit** 🟢
- Daftar & cari batch 🟢; **cari nama + regenerate 1 kredensial** 🟢 (nyeri utama); revoke & riwayat 🔵.

**E6 — Analitik** 🔵 — metrik terbit/terkirim/dibuka/discan (recharts).

**E7 — Organisasi & tim** 🟢/🔵 — branding org (nama/logo/handle) 🟢; anggota & peran 🔵.

**E8 — Monetisasi** 🔵 — free/paid tier + volume pack; **pembayaran Pakasir** (QRIS/VA) dengan verifikasi webhook ketat; saldo kredit.

**Fondasi** 🟢 — akun/auth (Supabase); backbone async (`jobs` table + worker).

## 8. Out of Scope (⚪)
e-Meterai/PSrE/TTE tersertifikasi; **WhatsApp (semua bentuk — pengiriman fokus email saja)**; API publik/SSO/webhooks pihak ketiga; custom domain; verified-issuer resmi; editor desain tingkat lanjut. Alasan: butuh perizinan/approval pihak luar atau tak sepadan untuk MVP.

## 9. Dependencies & Risks
**Dependencies:** Supabase (DB/Auth/Storage/RLS); TanStack Start server functions; Resend (email, domain terverifikasi); Pakasir (pembayaran); worker async (`jobs`).
**Risks & mitigasi:**
- WTP rendah / masalah dianggap kerepotan wajar → validasi (fake-door + concierge) sebelum bangun besar; pesan ROI vs biaya cetak.
- Verifikasi/"profesional" bukan pendorong bayar → uji di wawancara + lihat scan.
- Performa generate 5.000 → job async chunked; uji beban dini.
- Deliverability email → domain terverifikasi; kirim bertahap.
- Webhook Pakasir unsigned → verifikasi ulang ke API `transactiondetail` + idempoten.
- Musiman (event-driven) → paket pay-per-batch + rencana tahunan.

## 10. Open Questions
Pandu pelanggan atau channel? · seberapa luas kebutuhan portofolio penerima? · "hemat cetak" vs "gratisan manual" sebagai alasan bayar? · bobot verifikasi "resmi" umum vs kampus/nakes? · batas volume free tier optimal?

## Catatan validasi
Seluruh angka & sebagian scope masih **n=1**. Asumsi paling mematikan (Lean UX): **WTP + apakah verifikasi/profesional benar pendorong bayar**. Idealnya jalankan validasi paralel dengan build UI.
