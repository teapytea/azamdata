# Teapy OS

Satu aplikasi Next.js untuk 9 modul ERP, kasir POS, kontrak kerja, dan portal karyawan. Database memakai Postgres (Supabase).

| Alamat | Isi |
| --- | --- |
| `erp.teapy.web.id` | ERP, `/kontrak-kerja`, `/karyawan` |
| `pos.teapy.web.id` | Aplikasi kasir (semua domain berawalan `pos.` otomatis membuka kasir) |

## Jalankan di komputer

```bash
npm install
npm run dev
```

Tanpa `DATABASE_URL`, aplikasi memakai Postgres tersemat di folder `.data`. Buka `http://localhost:3000`, kasir di `http://pos.localhost:3000`. Kode setup lokal: `teapy-local`.

Jangan menaruh `DATABASE_URL` produksi di `.env.local`, karena `next dev` membacanya dan akan tersambung ke data asli. Rahasia produksi disimpan di `.env.teapy-production`, yang tidak dibaca Next dan tidak masuk Git.

Tes dan pemeriksaan:

```bash
npm test
npm run typecheck
```

## Deploy

1. Buat project Supabase region Singapore. Salin connection string **Transaction pooler** (port 6543) dari tombol Connect.
2. Siapkan database dari komputer ini:

   ```bash
   DATABASE_URL="postgresql://..." npm run db:migrate
   ```

3. Deploy ke Vercel:

   ```bash
   npx vercel login
   npx vercel --prod
   ```

4. Di Vercel, Project Settings > Environment Variables, isi lalu deploy ulang:
   - `DATABASE_URL`: connection string dari langkah 1
   - `AUTH_SECRET`: teks acak minimal 32 karakter
   - `SETUP_TOKEN`: kode rahasia untuk `/setup` dan `/recover`
5. Di Vercel, Project Settings > Domains, tambahkan `erp.teapy.web.id` dan `pos.teapy.web.id`, lalu buat record DNS sesuai petunjuk Vercel.
6. Buka `erp.teapy.web.id/setup`, masukkan `SETUP_TOKEN`, dan buat akun owner.

## Setelah online

1. **SDM & Shift > Kontrak kerja**: periksa naskah lalu terbitkan. Sebelum diterbitkan, halaman kontrak hanya bisa dibaca.
2. **Pengaturan**: atur pajak, service charge, PIN supervisor, dan identitas struk.
3. **Inventory**: isi stok awal lewat tombol Audit. Data master menu dan bahan sudah terisi, stok dimulai dari nol.
4. **Recipe / BOM**: periksa harga bahan, takaran, dan SOP.

## Alur utama

- **Stok ke penjualan:** bahan masuk lewat PO atau audit, batch seduh memotong bahan sesuai resep, label tanggal dikonfirmasi, batch bisa dijual, penjualan memotong batch (terlama lebih dulu), cup, gula, dan topping.
- **Karyawan:** tanda tangan di `/kontrak-kerja`, buat password, admin verifikasi di SDM & Shift, lalu jadwal, checklist, dan presensi tampil di `/karyawan`.

Stok menu punya dua cara: **Batch seduh** (Milk Tea) dan **Potong daun per porsi** (Pure Leaf, Artisan Blends). Perubahan data master ditaruh di `db/patches` dan dijalankan sekali oleh `npm run db:migrate`.

Struktur: `app/(erp)` modul ERP, `app/pos` kasir, `app/kontrak-kerja` dan `app/karyawan` untuk karyawan, `lib/calc.ts` perhitungan harga dan struk, `db/` skema dan data awal.
