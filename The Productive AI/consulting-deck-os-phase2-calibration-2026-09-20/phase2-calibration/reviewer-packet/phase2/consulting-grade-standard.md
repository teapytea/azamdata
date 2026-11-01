# Consulting-Grade Standard v0.1

Productive AI / Consulting Deck OS · 18 September 2026  
Status: **DRAFT UNTUK KALIBRASI**. Ditulis berdasarkan blueprint dan referensi yang ditelusuri. Belum lulus gate konsistensi dua reviewer.

## 1. Tujuan dan ruang lingkup

Standard ini mendefinisikan apa yang harus benar pada sebuah deck: keputusan yang jelas, argumentasi yang didukung bukti, perhitungan yang dapat diulang, visual yang tepat, dan output yang dapat dipakai. Berlaku untuk lima MVP C01–C05, dengan dua mode: live presentation dan executive pre-read.

Ini standard produk orisinal. Sebutan consulting-grade menunjukkan target kualitas; bukan sertifikasi, endorsement, atau standard resmi McKinsey/BCG. Kualitas tidak ditentukan hanya oleh kemiripan font, warna, atau logo.

Kata **MUST** berarti wajib, **SHOULD** adalah default yang boleh dikecualikan dengan alasan tercatat, dan **MAY** berarti opsional. Perubahan parameter bisnis pengguna tidak boleh menghilangkan validasi bukti, angka, atau status keputusan.

## 2. Decision contract — DC01–DC04

Sebelum storyboard, MUST tersedia: audience, tujuan forum (`inform`, `discuss`, `decide`), pertanyaan utama, cakupan bisnis/periode, batas input, batas slide/waktu, dan tanggal acuan.

Untuk `decide`, MUST ada keputusan yang diminta, pemilik kewenangan, tenggat, opsi yang dipertimbangkan, serta syarat material. Informasi yang belum tersedia diberi status unknown; sistem tidak membuat nama pejabat, deadline, atau approval palsu. Jika ketidaktahuan itu menghalangi kesimpulan, output tetap draft atau menjadi assessment, bukan keputusan final.

`Inform` boleh berakhir pada pemahaman hasil dan tindak lanjut pemantauan. `Discuss` menyajikan trade-off dan pertanyaan terbuka. `Decide` meminta tindakan spesifik. Semua tipe tidak harus dipaksa memiliki approval ask.

**DC01:** tujuan forum konsisten dengan penutup. **DC02:** constraints mengikat pilihan. **DC03:** pemilik/tenggat tidak diada-adakan. **DC04:** recommendation, approval, execution, dan achieved result dibedakan.

Untuk DC03, tanggal MUST valid, start tidak melampaui end, dan tanggal as-of dibedakan dari tanggal rapat serta deadline. Responsible, accountable, proposed owner, dan pihak pemberi approval harus dibedakan jika proses memakai peran tersebut.

## 3. Pyramid, MECE dan storyline — ST01–ST05

**ST01:** executive summary menjawab pertanyaan utama dan menyatakan batas kepastian. Jawaban awal boleh berupa rekomendasi bersyarat.

**ST02:** horizontal logic. Membaca seluruh action title berurutan harus menghasilkan argumen: situasi/diagnosis → pilihan atau implikasi → rekomendasi/tindak lanjut. Tidak setiap deck membutuhkan struktur identik; recurring report berpusat pada perubahan, drivers, outlook, dan aksi.

**ST03:** vertical logic. Setiap title terhubung ke exhibit dan sumber/perhitungan yang benar-benar mendukungnya. Satu governing insight boleh memiliki beberapa bukti. Dua kesimpulan independen SHOULD dipisahkan.

**ST04:** MECE sebagai pemeriksaan nyata. Definisikan universe, basis segmentasi, satuan, dan kategori residual. Jika kategori tumpang tindih secara sah, nyatakan overlap dan jangan menjumlahkan seolah eksklusif. Jangan mengklaim exhaustive hanya karena ada tiga kotak.

**ST05:** alternatif dan trade-off. Status quo dinilai bila relevan; opsi yang gagal hard constraint tidak menang hanya karena weighted score atau NPV tinggi. Keterbatasan rekomendasi tampil dekat keputusan.

## 4. Judul dan copy — TX01–TX04

Content slide MUST memiliki judul yang menyatakan insight, perbandingan, implikasi, atau rekomendasi. Cover, agenda, section divider, glossary, dan appendix index boleh memakai label navigasi. Pengecualian dicatat lewat story role.

Judul MUST sesuai scope, periode, unit, dan confidence. Klaim sebab-akibat membutuhkan bukti yang memadai; korelasi tidak otomatis sebab-akibat. Hipotesis dan proyeksi harus dikenali pembaca sebagai hipotesis dan proyeksi.

Judul SHOULD selesai dalam dua baris di template yang dipakai. Panjang kata bukan hard fail universal; wrapping, hierarchy dan keterbacaan yang menentukan. Hindari judul topik seperti “Financial Performance” pada slide yang sebenarnya membuktikan variance.

Contoh sintetis: “EBIT Juni tertinggal Rp1,1 miliar dari anggaran” didukung bridge SYN-C03. “Kinerja pasti pulih pada Juli” tidak didukung hanya oleh rencana tindakan.

**TX01:** satu pesan utama. **TX02:** judul didukung isi. **TX03:** copy menjelaskan so-what tanpa mengulang seluruh chart. **TX04:** istilah, singkatan, angka dan bahasa konsisten; ID/EN tidak diterjemahkan secara mekanis jika makna berubah.

## 5. Source, claim dan evidence — EV01–EV05

Setiap factual external claim MUST memiliki sumber yang dapat ditemukan. Tiap sumber menyimpan ID, judul/penerbit, tanggal/versi, lokasi halaman/tabel, dan status penggunaan. Sumber internal memakai label yang benar dan menjaga kerahasiaan; sistem tidak mengarang “client data”.

Claim taxonomy: observed fact, calculated result, assumption, hypothesis, recommendation, synthetic example. Jenisnya tidak boleh berubah diam-diam ketika diringkas.

Calculated result MUST menunjuk input, rumus/metode, unit, periode, dan rounding. Referensi paragraf saja tidak cukup untuk membuktikan angka yang sebenarnya dihitung dari workbook.

Sumber yang konflik MUST dicatat: scope, versi, periode atau definisi metrik dibandingkan sebelum dipilih. Jika konflik material tidak terpecahkan, hindari kesimpulan pasti. Unknown tidak sama dengan nol dan tidak sama dengan not applicable.

**EV01:** sumber resolve. **EV02:** claim-to-evidence resolve. **EV03:** kalkulasi mempunyai lineage. **EV04:** konflik/unknown eksplisit. **EV05:** synthetic dan factual dibedakan, termasuk pada footer/notes contoh.

## 6. Angka dan model — NU01–NU08

1. **NU01 — scope:** simpan unit, skala, currency, nominal/real, periode, geography, aggregation, scenario, denominator, dan comparator. Actual, budget, prior year, forecast, organic dan reported berbeda. Perubahan universe memerlukan restatement yang dijelaskan atau penandaan tidak comparable. Current FX, constant FX, retail equivalent dan GDP impact bukan basis yang saling menggantikan. Peer/survey comparisons memerlukan definisi, populasi, sampling, sample size dan periode yang dapat dibandingkan; skor ranking tidak membuktikan ROI.
2. **NU02 — perubahan:** percentage change = `(new-old)/old` jika basis sah; perubahan share dalam percentage points = `new_share-old_share` jika keduanya dinyatakan dalam persen. Satu basis point = 0,01 percentage point. Growth contribution mengikuti dekomposisi dan denominator yang dinyatakan; tidak sama dengan growth rate segmen. Basis nol atau negatif yang membuat persentase menyesatkan memerlukan bentuk lain. Jangan memaksakan CAGR pada endpoint yang tidak valid.
3. **NU03 — rekonsiliasi:** totals, bridge, share, cumulative, monthly dan YTD harus cocok dengan definisi. Selisih pembulatan boleh diterima jika berada dalam interval rounding yang dijelaskan; toleransi tidak boleh dipakai menyembunyikan kesalahan material.
4. **NU04 — timing:** NPV periodik memasukkan CF0 pada t0. IRR periodik mengasumsikan interval yang sama. Untuk jadwal tanggal tertentu, gunakan metode bertanggal dan sebut day-count convention. [Microsoft IRR](https://support.microsoft.com/en-us/excel/functions/irr-function), [Microsoft XNPV](https://support.microsoft.com/en-us/excel/functions/xnpv-function).
5. **NU05 — perspective:** project/investor return, profit/cash, capex/opex, working capital, funding dan operating benefit dibedakan. Loan inflow tidak boleh dipakai menaikkan project return yang didefinisikan sebelum financing.
6. **NU06 — sensitivitas:** gunakan scenario IDs stabil dengan baseline/versi bersama. Nyatakan variabel yang berubah dan yang tetap, rentang, serta actual/forecast; sensitivitas bukan ramalan probabilistik jika tidak ada basis probabilitas.
7. **NU07 — IRR/payback:** jangan memaksakan satu IRR pada cashflow nonconventional atau tanpa perubahan tanda. Payback harus menyebut undiscounted/discounted serta period-end/interpolated. Interpolasi bukan tanggal kas yang teramati.
8. **NU08 — forecast/benefit:** bedakan committed, conditional, potential, dan unidentified; cegah double counting. Pengumpulan piutang tidak otomatis menambah laba.

Diskonto, hurdle, tax, terminal value, toleransi dan batas dana adalah parameter kasus. Angka SYN-* tidak menjadi default rekomendasi investasi pelanggan. Kesimpulan finansial berisiko tinggi memerlukan human review sesuai Phase 0.

## 7. Memilih exhibit — CH01–CH05

| Pertanyaan analitis | Bentuk awal | Pemeriksaan penting |
|---|---|---|
| Mana lebih besar/lebih kecil? | Bar/dot dengan basis sama | Urutan, zero baseline untuk encoding panjang bar, unit |
| Bagaimana berubah sepanjang waktu? | Line atau column menurut sifat data | Interval, missing periods, actual vs forecast |
| Apa penyebab perubahan? | Waterfall atau variance table | Awal + drivers = akhir; tanda dan overlap |
| Bagaimana komposisinya? | Stacked bar/100% stacked | Denominator dan kategori lengkap/overlap |
| Apa trade-off antaropsi? | Option table atau matrix | Kriteria, bobot, batas kelayakan dan evidence |
| Bagaimana hubungan dua variabel? | Scatter | Jangan menyiratkan sebab-akibat tanpa bukti |
| Bagaimana struktur proses/peran? | Diagram atau role table | Hubungan, akuntabilitas dan arah jelas |
| Apa yang terjadi berikutnya? | Roadmap/milestone/status table | Baseline, actual, forecast, owner, dependency |

**CH01:** pilihan exhibit mengikuti analytical intent. **CH02:** basis encoding benar. **CH03:** annotation menunjukkan implikasi yang didukung. **CH04:** legend/label terhubung ke seri. **CH05:** pengecualian berisiko seperti dual-axis atau axis break memerlukan alasan dan label yang jelas.

Default chart harus mudah dibandingkan. Warna saja tidak cukup untuk status kritis. Forecast dan actual diberi encoding yang berbeda. Missing value tidak boleh digambar sebagai nol. 3D, hiasan yang mendistorsi area, dan gambar chart raster untuk konten bisnis utama tidak memenuhi kontrak editability produk.

## 8. Anatomi dan visual — VI01–VI05

Content slide SHOULD memiliki lima zona: action title, konteks exhibit, bukti, interpretasi, serta sumber/navigation. Unit, periode dan scope harus dekat dengan exhibit yang membutuhkannya.

Baseline blueprint dipertahankan sebagai **token awal yang belum divalidasi pada runtime**: 16:9; ukuran 13,333 × 7,5 inch; horizontal safe margin sekitar 0,50–0,60 inch; title zone sekitar y=0,35–1,20; body y=1,30–6,90; footer y=7,00–7,30. Koordinat final perlu konsisten dengan font metrics dan hasil render.

| Elemen | Live | Executive pre-read |
|---|---:|---:|
| Action title | 24–30 pt | 20–24 pt |
| Subtitle | 12–16 pt | 10–13 pt |
| Body | 16–22 pt | 10–14 pt |
| Chart label | 12–16 pt | 9–12 pt |
| Source/footer | 8–10 pt | 7–9 pt |

Range ini bukan lisensi mengecilkan teks agar semua muat. Jika konten melewati budget: edit → ubah archetype → pecah slide → pindah detail ke appendix. Small text yang sah pada pre-read tetap harus terbaca pada ukuran penggunaan yang dituju.

**VI01:** hierarchy dan scan order. **VI02:** alignment/shared anchors/gutter konsisten. **VI03:** warna dengan makna stabil; status memiliki label selain warna. **VI04:** density sesuai mode. **VI05:** tidak ada clipping, overlap material, atau elemen tak sengaja di luar slide.

Pemeriksaan render mencakup wrap, kontras teks/latar, precision label, dan kepadatan pada ukuran penggunaan sebenarnya. Kepatuhan kontras formal hanya boleh diklaim jika metriknya benar-benar diukur.

White analytical profile dari GEI adalah acuan utama reporting. Dark analytical dan framework modern menjadi variasi. Font, ikon, ilustrasi, chart styling dan palet produksi harus orisinal atau berlisensi; ikon/palet final tetap Phase 5. Tidak ada logo firma consulting yang diperlukan untuk membuat slide berkualitas.

## 9. Minimum per MVP — UC01–UC05

| MVP | Rantai yang wajib terwakili bila relevan dengan brief |
|---|---|
| C01 | Pertanyaan → diagnosis → opsi/trade-off → rekomendasi → risiko/tindakan |
| C02 | Scope/shortlist → entry modes → economics setara → hard gates → rekomendasi bersyarat/keputusan |
| C03 | Actual-target → drivers → forecast/kas → aksi-owner-due → tujuan forum |
| C04 | Baseline → incremental cashflow → return/funding → sensitivitas → syarat dan status keputusan |
| C05 | As-of/baseline → current status → perubahan/dependency/RAID → eskalasi → aksi/decision log |

Urutan dapat disesuaikan untuk audience, tetapi mata rantai material tidak boleh hilang. Data yang tidak cukup membatasi jenis kesimpulan; template tidak memberi izin mengisi fakta yang hilang.

## 10. Integritas PPTX — PT01–PT03

**PT01:** file terbuka tanpa repair; tidak ada asset/link hilang yang mengubah isi. **PT02:** business text, tables, chart data dan elemen kunci editable sesuai kontrak Practical; satu gambar full-slide tidak lulus. **PT03:** hasil render dan tampilan aplikasi sasaran diperiksa untuk clipping, font substitution, label, urutan dan notes.

Practical tidak berarti semua dekorasi harus dapat diedit sebagai native shapes. Full editability hanya diklaim pada archetype yang diuji. PDF referensi atau thumbnail tidak membuktikan PPTX compatibility. Windows, macOS, PowerPoint web dan import Google Slides mempunyai status uji terpisah; LibreOffice bukan satu-satunya sumber kebenaran.

Belum ada pengujian PPTX dalam batch ini. Compiler tetap dipilih melalui Phase 6 spike.

## 11. Scoring dan hard fail

Bobot terkunci: storyline 25; evidence/angka 20; message/copy 15; chart 15; visual 15; technical PPTX 10. Rumus dan kriteria ada pada `weighted-scorecard.json` serta rubrik pendamping. Ambang deck final: **≥85/100, semua dimensi dievaluasi, dan tidak ada hard fail maupun pemeriksaan wajib yang belum diketahui**.

Jika technical belum diuji, laporkan poin pada dimensi yang ditinjau beserta cakupannya; jangan normalisasi hasil parsial menjadi skor lulus /100. Skor tinggi tidak menutupi hard fail.

Hard fail lengkap ada pada `hard-fails.md`. Repair kosmetik boleh otomatis; perubahan yang menyentuh makna harus kembali ke evidence/decision contract. Jika input keputusan penting hilang, draft boleh diberikan dengan status yang benar, tetapi hasil tidak boleh diberi label decision-ready.

## 12. Protokol evaluasi dan status fase

Gunakan `reviewer-calibration.md` untuk uji dua reviewer. Threshold konsistensi v0.1 adalah usulan operasional untuk dikalibrasi, bukan hasil pengukuran yang sudah dicapai. Identitas reviewer, versi artefak, bukti per rating, dan perbedaan penilaian harus disimpan.

Pisahkan development dan evaluation pada tingkat keluarga studi/kasus, bukan sekadar file. Part, versi teks, slide berulang, dan varian satu kasus ditempatkan dalam satu evaluation group. Referensi yang sudah digunakan merancang aturan dan SYN-* dalam paket ini adalah development set; jangan menamakannya blind holdout. Holdout baru perlu ditetapkan sebelum release evaluation. Lihat `rule-crosswalk.md` untuk hubungan 22 kandidat Phase 1B dengan standard ini.

Dalam batch ini standard ditulis dan kalkulator contoh/scorecard diperiksa. Story, visual, technical PPTX, dan konsistensi dua reviewer belum mendapat skor benchmark. Phase 2 tetap **IN_PROGRESS_CALIBRATION_REQUIRED**.

## 13. Hubungan ke paket skills nanti

Standard ini menjadi core rules lintas AI. Adapter mengarahkan model membaca aturan sesuai kebutuhan; kasus JSON dan scripts menyediakan contoh/hasil uji yang reproducible. AI bertanggung jawab pada framing dan storyline; kode menangani perhitungan serta pemeriksaan deterministic. Schema formal baru dibakukan pada Phase 3.

Tidak ada jaminan satu ZIP skill dapat diinstal tanpa penyesuaian pada semua AI. Klaim kompatibilitas mengikuti adapter dan kemampuan runtime yang benar-benar diuji. Dokumen ini belum merupakan skill yang terpasang atau compiler PPTX.
