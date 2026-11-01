# Phase 1B → Phase 2 rule crosswalk

22 kandidat aturan dipetakan satu per satu. Tabel ini menunjukkan keterlacakan, bukan bukti bahwa seluruh validator sudah tersedia. 23 keputusan pemilihan referensi pada batch sebelumnya adalah daftar terpisah dari 22 kandidat aturan ini.

| Rule | Aturan / standard | Rubrik | Pemeriksaan atau batas sekarang |
|---|---|---|---|
| R01 | Title-to-evidence alignment → TX02, ST03 | STR4, MSG1 | Semantic review: cocokkan judul dengan entitas, nilai, arah, periode dan scope exhibit; belum divalidasi pada generated deck. |
| R02 | Horizontal story logic → ST02 | STR3 | Title-only review menggunakan storyboards; penilaian independen belum dijalankan. |
| R03 | Typed metrics → NU01 | EVI3 | Unit/periode/basis eksplisit pada SYN-*; schema umum dan lint baru Phase 3/9. |
| R04 | Signed bridge arithmetic → NU03 | EVI2, EVI3 | SYN-C03: bridge EBIT, forecast, dan kas direkonsiliasi lewat kode. |
| R05 | Benefits overlap → ST04, NU08 | STR4, EVI3 | SYN-C03 memisahkan action committed/potential/cash; deteksi overlap bebas antarintervensi belum dibuat. |
| R06 | Rounding policy → NU03 | EVI3, CHR3 | Hitung input penuh dan batasi display precision; generalized rounding-interval validator/render belum dibuat. |
| R07 | Percent semantics → NU02 | EVI3, MSG3 | Share, relative change, pp, bp dan contribution didefinisikan; belum general-purpose semantic validator. |
| R08 | Scenario integrity → NU06, NU08 | EVI2, EVI4 | Empat skenario SYN-C04 berbagi baseline dan parameter eksplisit; kalkulasi diperiksa dengan metode lain. |
| R09 | Scope and restatement → NU01, EV04 | EVI3, EVI4 | Review kesetaraan universe/restatement; belum diuji pada model restatement baru. |
| R10 | Currency and price basis → NU01, NU05 | EVI3 | Basis nominal/currency/perspective dinyatakan; kasus FX/retail/GDP perlu pengujian lanjutan. |
| R11 | Calendar and chronology → DC03, NU04 | EVI2, EVI3 | Tanggal dan day-count SYN-C04 serta due SYN-C03 diperiksa; general calendar/roadmap lint belum dibuat. |
| R12 | Ownership and status → DC03, DC04 | STR5, EVI4 | SYN-C03 memisahkan owner/authority/status; mutation missing owner/invented approval ditolak. |
| R13 | Uncertainty and applicability → EV04, EV05, TX02 | EVI4, MSG1 | Semua SYN-* berlabel; scope dan uncertainty wajib ikut klaim. General semantic review belum diuji. |
| R14 | Comparability and survey base → NU01, CH02 | EVI3, CHR2 | Definisi survey/comparability tertulis; belum ada benchmark representativitas/sampling. |
| R15 | Evidence is not causality → TX02, CH02 | STR4, MSG1 | Review kausalitas termasuk panah/diagram; kode aritmetika tidak membuktikan sebab-akibat. |
| R16 | Render quality → VI01, VI04, VI05, PT03 | VIS1, VIS2, TEC1 | Pemeriksaan render/app diperlukan; belum dijalankan pada PPTX. |
| R17 | Source-to-slide traceability → EV01, EV02, EV03 | EVI1, EVI2 | Crosswalk source/page dan storyboard JSON pointers diverifikasi; original source assets tidak dibundel. |
| R18 | Capability boundary → PT01, PT02, PT03 | TEC1, TEC2 | Status PDF/pattern dipisahkan dari klaim editability; uji aplikasi dan artifact baru di fase build. |
| R19 | Family-level evaluation separation → Section 12 | EVI4 | Family-level split diwajibkan; semua contoh saat ini development, blind holdout belum ditetapkan. |
| R20 | Original product assets → Section 8 asset policy | VIS3 | Sumber/aset asli tidak masuk paket; D012 dikecualikan sebagai positive learning reference. |
| R21 | Display mode and hierarchy → VI01, VI04 | VIS1, VIS2 | Live/pre-read dipisahkan; typography/density masih token awal, perlu render validation. |
| R22 | No inferred commitments → DC03, EV04 | STR1, EVI4 | Unknown tidak diisi sebagai fakta. Mutation missing owner/due dan invented approval diperiksa untuk SYN-C03. |

Daftar source/page lengkap ada di `rule-crosswalk.json`. D012:21 adalah pointer historis yang dikecualikan, bukan acuan positif untuk standard saat ini. Blueprint dan keputusan lama tidak ditulis ulang.
