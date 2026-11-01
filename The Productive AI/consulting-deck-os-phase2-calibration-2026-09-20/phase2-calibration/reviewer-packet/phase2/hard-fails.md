# Hard-fail register v0.1

Status: draft untuk kalibrasi. HF01–HF11 mengoperasionalkan Section 19.2 blueprint; HF12 menjaga kebutuhan human review finansial yang sudah diadopsi Phase 0.

| ID | Kondisi | Tindakan |
|---|---|---|
| HF01 | Data atau sumber faktual diada-adakan | Hapus klaim atau peroleh bukti; contoh sintetis harus diberi label |
| HF02 | Action title tidak didukung exhibit/evidence | Revisi title, evidence atau tingkat kepastian |
| HF03 | Angka material tidak konsisten antarbagian | Rekonsiliasi scope/period/version sebelum finalisasi |
| HF04 | Calculation error mengubah hasil | Hitung ulang dari input dan perbaiki lineage |
| HF05 | Chart/encoding menyesatkan | Perbaiki baseline, skala, unit, denominator atau bentuk exhibit |
| HF06 | Sumber fakta eksternal material hilang | Tambahkan sumber yang benar atau ubah status output menjadi draft |
| HF07 | PPTX tidak membuka atau meminta repair | Perbaiki file dan uji kembali |
| HF08 | Clipping/overlap material menghalangi makna | Perbaiki layout; jangan sekadar mengecilkan semua font |
| HF09 | Elemen tak sengaja di luar slide | Perbaiki geometry; bleed dekoratif yang disengaja dicatat terpisah |
| HF10 | Aset terlindungi disalin tanpa dasar penggunaan | Ganti dengan aset orisinal/berlisensi; jangan bundel sumber |
| HF11 | Konten confidential terekspos di tempat yang tidak diizinkan | Hentikan output terkait dan perbaiki batas data |
| HF12 | Human review wajib untuk kesimpulan finansial berisiko tinggi belum dipenuhi | Tahan status decision-ready sampai review yang relevan tercatat |

Rounding yang wajar, axis line bersinggungan dengan tick, atau overlay annotation yang disengaja bukan otomatis hard fail. Reviewer harus menyebut mengapa suatu masalah material. Sebaliknya, nominal kecil yang mengubah tanda go/no-go tetap material.

Untuk input penting yang unknown, statusnya `unverified` dan deck belum dapat lulus. Tidak tersedia bukan berarti pemeriksaan berhasil. Status ini tidak melarang penyusunan draft yang jelas batasnya.

Financial review pada HF12 berarti review manusia atas keputusan nyata yang berisiko tinggi, bukan persetujuan pengguna tambahan untuk membuat contoh uji sintetis dalam batch ini.
