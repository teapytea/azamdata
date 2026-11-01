# Store Availability Improvement Guide - Pilot Test Feedback

Tanggal konteks: 2026-06-02  
Workspace utama: `D:\Azam\MTI\TESIS\knowledge_graph_attention_network`  
Repo sistem Aromatique AI: `https://github.com/rssdsyndt/aromatique-ai.git`

Dokumen ini merangkum desain dan rencana implementasi improvement berdasarkan feedback pilot test user. Masalah utama yang ditemukan adalah rekomendasi parfum sudah relevan secara preferensi aroma, tetapi belum selalu sesuai dengan stok produk pada cabang toko yang sedang dituju user.

---

## 1. Konteks Masalah

Saat pilot test, sistem Aromatique AI sudah dapat:

- melakukan percakapan dengan user;
- menangkap preferensi aroma melalui chat;
- menjalankan variasi prompt XAI A/B/C;
- menampilkan Top-3 rekomendasi produk;
- menyimpan log eksperimen dan familiarity user.

Namun ada kondisi operasional yang belum tertangani:

```text
Dataset Aromatique berisi seluruh katalog produk.
Stok di masing-masing cabang tidak selalu lengkap.
Produk yang direkomendasikan bisa saja tidak tersedia di toko tujuan user.
```

Cabang yang menjadi konteks saat ini:

```text
1. Aromatique Jamal
2. Urban Tajem
```

Dampaknya:

- rekomendasi dapat terlihat benar secara model, tetapi gagal secara pengalaman user;
- user bisa datang ke toko dan tidak menemukan produk yang direkomendasikan;
- hasil pilot test dapat bias karena user menilai sistem berdasarkan ketersediaan stok, bukan hanya kualitas rekomendasi;
- pihak store membutuhkan rekomendasi yang actionable, bukan hanya relevan secara aroma.

---

## 2. Tujuan Improvement

Tujuan utama improvement:

```text
Sistem harus merekomendasikan produk yang relevan dengan preferensi user
dan tersedia di cabang toko yang dipilih user.
```

Tujuan teknis:

- mempertahankan `dataset-aromatique-kgat-ready` sebagai master product catalog;
- menambahkan layer store availability tanpa merusak dataset training KGAT/CR-HKGE;
- menyimpan store context pada sesi percakapan;
- memfilter kandidat rekomendasi berdasarkan ketersediaan produk di store;
- mencatat store context pada log eksperimen A/B/C;
- membuat UX pemilihan store yang jelas tetapi tidak mengganggu percakapan.

Non-goals untuk tahap awal:

- tidak perlu retrain KGAT hanya karena penambahan store availability;
- tidak perlu integrasi real-time dengan POS/kasir pada versi awal;
- tidak perlu GPS otomatis;
- tidak perlu membuat admin dashboard penuh jika update stok masih bisa dilakukan via CSV/Supabase Table Editor.

---

## 3. Keputusan Arsitektur Utama

### 3.1 Jangan Menambahkan Kolom Lokasi Langsung ke Dataset Utama

Opsi awal yang dipertimbangkan adalah menambahkan satu kolom `lokasi` ke dataset produk. Opsi ini terlihat sederhana, tetapi tidak ideal sebagai desain jangka panjang.

Risiko jika memakai satu kolom lokasi:

1. Relasi produk dan store bersifat many-to-many.

   Satu produk bisa tersedia di Aromatique Jamal dan Urban Tajem sekaligus. Jika hanya ada satu kolom `lokasi`, data akan dipaksa menjadi string seperti `Jamal, Urban`, dan filtering menjadi rawan error.

2. Dataset aroma bercampur dengan data operasional.

   Metadata parfum seperti `main_accords`, `visual_note`, `olfactory_family`, dan `meaning` relatif stabil. Stok toko berubah-ubah. Jika keduanya dicampur, setiap perubahan stok akan terlihat seperti perubahan dataset penelitian.

3. Evaluasi model bisa bias.

   Jika store tertentu stoknya lebih sedikit, kualitas rekomendasi bisa terlihat lebih rendah bukan karena model atau prompt XAI buruk, tetapi karena pilihan produk yang tersedia memang lebih terbatas.

4. Sulit mendukung status stok.

   Dalam praktiknya, produk tidak hanya `ada` atau `tidak ada`. Bisa juga `limited`, `out_of_stock`, `unknown`, atau stok tersedia tetapi tinggal sedikit.

5. Sulit audit data.

   Data stok perlu `last_updated`, `source`, dan kemungkinan `updated_by`. Satu kolom lokasi tidak cukup untuk kebutuhan audit tersebut.

### 3.2 Gunakan Layer Availability Terpisah

Desain yang disarankan:

```text
products
  = master product catalog dari dataset Aromatique bersih.

stores
  = daftar cabang toko.

store_product_availability
  = status ketersediaan produk per cabang.
```

Dengan desain ini:

- dataset aroma tetap bersih;
- stok bisa diperbarui tanpa mengubah dataset training;
- satu produk bisa tersedia di banyak cabang;
- filter rekomendasi bisa dilakukan saat serving;
- log eksperimen dapat menyimpan store context secara eksplisit.

---

## 4. Target User Flow

Flow yang disarankan:

```text
Home screen
  -> Consent information
  -> Store selection
  -> Greeting chat
  -> Familiarity selection
  -> Percakapan
  -> Tampilkan rekomendasi
  -> Top-3 produk sesuai store
```

### 4.1 Pemilihan Store Setelah Consent

Lokasi/store sebaiknya dipilih setelah consent, bukan digabungkan ke dalam consent.

Alasannya:

- consent adalah persetujuan riset/data;
- store adalah konteks operasional rekomendasi;
- keduanya berbeda secara makna dan sebaiknya dipisah.

Contoh pilihan:

```text
Pilih toko tujuan

[Aromatique Jamal]
[Urban Tajem]
```

Setelah user memilih store, sistem menyimpan:

```text
store_id
store_slug
store_name
selected_at
```

### 4.2 Store Indicator di Halaman Chat

Di halaman chat, tampilkan indikator kecil di header atau area atas chat:

```text
Store: Aromatique Jamal
[Ganti]
```

Tujuannya:

- user selalu tahu rekomendasi sedang mengikuti stok store mana;
- user bisa mengganti store tanpa mengulang dari home screen;
- mengurangi risiko salah interpretasi ketika user membuka ulang web.

### 4.3 Behavior Saat Membuka Web Ulang

Rekomendasi behavior:

```text
Jika user sudah pernah memilih store:
  gunakan store terakhir sebagai default,
  tetapi tampilkan indikator store dan tombol ganti.

Jika user belum pernah memilih store:
  tampilkan store selection sebelum greeting chat.
```

Store boleh disimpan di `localStorage` untuk kenyamanan UX, tetapi tetap perlu disimpan juga di database pada level conversation/session.

### 4.4 Behavior Saat Chat Baru

Saat user memulai chat baru:

- sistem boleh memakai store terakhir sebagai default;
- UI tetap menampilkan store yang aktif;
- user bisa mengganti store sebelum atau selama chat;
- jika store diganti, rekomendasi berikutnya harus mengikuti store baru.

### 4.5 Fallback Jika User Klik Rekomendasi Tanpa Store

Jika ada edge case user masuk ke chat tanpa store lalu klik `Tampilkan Rekomendasi`, sistem harus menahan request rekomendasi dan menampilkan popup:

```text
Pilih toko terlebih dahulu agar rekomendasi sesuai stok yang tersedia.
```

Setelah store dipilih, rekomendasi diproses.

---

## 5. Desain Database

Skema saat ini sudah memiliki tabel penting:

```text
products
kg_edges
product_embeddings
conversations
messages
recommendations
feedback
experiment_sessions
```

Improvement ini membutuhkan tabel dan kolom tambahan.

### 5.1 Tabel `stores`

```sql
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_slug TEXT NOT NULL UNIQUE,
  store_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Seed awal:

```sql
INSERT INTO public.stores (store_slug, store_name, display_name)
VALUES
  ('aromatique_jamal', 'Aromatique Jamal', 'Aromatique Jamal'),
  ('urban_tajem', 'Urban Tajem', 'Urban Tajem')
ON CONFLICT (store_slug) DO UPDATE
SET
  store_name = EXCLUDED.store_name,
  display_name = EXCLUDED.display_name,
  updated_at = now();
```

### 5.2 Tabel `store_product_availability`

```sql
CREATE TABLE IF NOT EXISTS public.store_product_availability (
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(product_id) ON DELETE CASCADE,
  availability_status TEXT NOT NULL DEFAULT 'in_stock'
    CHECK (availability_status IN ('in_stock', 'limited', 'out_of_stock', 'unknown')),
  stock_qty INTEGER CHECK (stock_qty IS NULL OR stock_qty >= 0),
  source TEXT NOT NULL DEFAULT 'manual',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (store_id, product_id)
);
```

Index:

```sql
CREATE INDEX IF NOT EXISTS idx_store_availability_store_status
  ON public.store_product_availability(store_id, availability_status);

CREATE INDEX IF NOT EXISTS idx_store_availability_product
  ON public.store_product_availability(product_id);
```

### 5.3 Kolom Tambahan pada `conversations`

```sql
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id),
  ADD COLUMN IF NOT EXISTS store_slug TEXT,
  ADD COLUMN IF NOT EXISTS store_name TEXT;

CREATE INDEX IF NOT EXISTS idx_conversations_store
  ON public.conversations(store_id, created_at DESC);
```

Catatan:

- `store_id` adalah foreign key utama.
- `store_slug` dan `store_name` disimpan sebagai snapshot agar analisis log tetap stabil jika nama toko berubah.

### 5.4 Kolom Tambahan pada `experiment_sessions`

```sql
ALTER TABLE public.experiment_sessions
  ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id),
  ADD COLUMN IF NOT EXISTS store_slug TEXT,
  ADD COLUMN IF NOT EXISTS store_name TEXT;

CREATE INDEX IF NOT EXISTS idx_experiment_sessions_store_condition
  ON public.experiment_sessions(store_id, condition, assigned_at DESC);
```

Ini penting untuk analisis A/B/C per store.

### 5.5 Kolom Tambahan pada `recommendations`

```sql
ALTER TABLE public.recommendations
  ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id),
  ADD COLUMN IF NOT EXISTS store_slug TEXT,
  ADD COLUMN IF NOT EXISTS store_name TEXT,
  ADD COLUMN IF NOT EXISTS candidate_products_before_store_filter JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS filtered_out_unavailable_products JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS availability_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_recommendations_store
  ON public.recommendations(store_id, created_at DESC);
```

Kolom logging ini berguna untuk menjawab:

```text
Produk apa yang sebenarnya cocok menurut model,
tetapi tidak ditampilkan karena tidak tersedia di store?
```

### 5.6 Kolom Tambahan pada `feedback`

```sql
ALTER TABLE public.feedback
  ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id),
  ADD COLUMN IF NOT EXISTS store_slug TEXT,
  ADD COLUMN IF NOT EXISTS store_name TEXT;

CREATE INDEX IF NOT EXISTS idx_feedback_store
  ON public.feedback(store_id, created_at DESC);
```

---

## 6. RLS dan Policy

Karena sistem saat ini bersifat anonymous research chatbot dan tabel utama sudah memakai public policy, maka untuk tahap awal policy bisa mengikuti pola yang sama.

```sql
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_product_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read stores" ON public.stores;
CREATE POLICY "public read stores"
  ON public.stores FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "public read store availability" ON public.store_product_availability;
CREATE POLICY "public read store availability"
  ON public.store_product_availability FOR SELECT
  USING (true);
```

Untuk insert/update stok, rekomendasi tahap awal:

- jangan expose update dari frontend publik;
- update stok dilakukan melalui Supabase dashboard, SQL script, atau service role process;
- jika nanti ada admin UI, harus ada auth dan role khusus.

---

## 7. Strategi Data Stok

### 7.1 Format Data Minimal dari Store

Untuk tahap awal, data dari masing-masing cabang cukup seperti:

```csv
product_id,product_name,store_slug,availability_status,stock_qty,last_updated_at
115,Our First Love,aromatique_jamal,in_stock,3,2026-06-02
115,Our First Love,urban_tajem,out_of_stock,0,2026-06-02
```

Kolom minimum yang wajib:

```text
product_id
store_slug
availability_status
```

Jika `product_id` belum tersedia dari data store, gunakan `product_name` untuk mapping sementara. Namun mapping berbasis nama harus direview karena rawan typo.

### 7.2 Mapping Nama Produk

Dataset Aromatique pernah menunjukkan perbedaan nama seperti:

```text
JAMES BOND              ~= Vagabond
Alioner Sensual         ~= Alinenor
eramus                  ~= eramusk
Moonlight Meadow / SOTB ~= moonlit meadow
MADY LADY               ~= Mady Girl
```

Karena itu, stok store sebaiknya memakai `product_id` dari tabel `products`, bukan hanya nama produk.

Jika store hanya bisa memberikan nama produk:

1. Import ke staging table.
2. Normalize nama: lowercase, trim, collapse whitespace.
3. Cocokkan ke `products.product_name`.
4. Buat daftar unmatched.
5. Review manual unmatched.
6. Baru insert ke `store_product_availability`.

### 7.3 Status Availability

Gunakan status:

```text
in_stock     = boleh direkomendasikan
limited      = boleh direkomendasikan, tetapi bisa diberi label stok terbatas
out_of_stock = jangan direkomendasikan
unknown      = jangan direkomendasikan untuk mode store-specific
```

Untuk pilot test, aturan aman:

```text
Hanya produk dengan status in_stock atau limited yang boleh masuk Top-3.
```

### 7.4 Dashboard Stok Internal

Berdasarkan feedback operasional, dashboard stok internal layak dibuat sebagai improvement pendukung. Tujuannya bukan mengganti dataset rekomendasi, tetapi menyediakan cara yang lebih praktis untuk menandai ketersediaan produk per cabang.

Prinsip desain:

```text
Dashboard membaca semua produk dari tabel products.
Dashboard menulis perubahan hanya ke tabel store_product_availability.
Dashboard tidak mengubah dataset-aromatique, product metadata, KGAT item id, KG edges, atau artifact model.
```

Dengan prinsip ini, dashboard dapat menampilkan semua row produk dari dataset Aromatique yang sudah bersih, misalnya seluruh 340 produk, lalu admin operasional cukup memberi status produk per cabang.

Contoh tampilan konseptual:

```text
Store aktif: Aromatique Jamal

Search product...

Product Name        Visual Note              Status        Stock
Our First Love      Aquatic / Cedar          in_stock      3
Berrylicious        Amber / Cacao            out_of_stock  0
White Sense         Floral / Violet          limited       1
Black Lax           Amber / Leather          in_stock      4
```

Query dashboard:

```sql
SELECT
  p.product_id,
  p.product_name,
  p.visual_note,
  p.visual_note_alt,
  p.main_accords,
  p.olfactory_family,
  COALESCE(spa.availability_status, 'unknown') AS availability_status,
  spa.stock_qty,
  spa.last_updated_at
FROM public.products p
LEFT JOIN public.store_product_availability spa
  ON spa.product_id = p.product_id
 AND spa.store_id = :selected_store_id
ORDER BY p.product_name ASC;
```

Makna query:

- semua produk tetap muncul karena sumber utama adalah `products`;
- status stok muncul jika sudah ada row di `store_product_availability`;
- produk tanpa row availability tampil sebagai `unknown`;
- perubahan status hanya melakukan insert/update ke `store_product_availability`.

### 7.5 Dashboard MVP Scope

Fitur minimum dashboard:

1. Login admin.
2. Pilih store aktif:
   - Aromatique Jamal
   - Urban Tajem
3. Tampilkan semua produk dari `products`.
4. Search produk berdasarkan nama.
5. Filter status:
   - all
   - in_stock
   - limited
   - out_of_stock
   - unknown
6. Ubah status availability per produk.
7. Ubah `stock_qty` opsional.
8. Simpan perubahan dengan upsert ke `store_product_availability`.
9. Tampilkan `last_updated_at`.

Fitur yang sebaiknya tidak masuk MVP:

- dashboard analitik lengkap;
- multi-role kompleks;
- integrasi POS real-time;
- bulk stock history detail;
- GPS atau lokasi otomatis user.

### 7.6 Dashboard Upsert Logic

Saat admin mengubah status produk, backend melakukan upsert berdasarkan pasangan:

```text
store_id + product_id
```

Contoh:

```sql
INSERT INTO public.store_product_availability (
  store_id,
  product_id,
  availability_status,
  stock_qty,
  source,
  last_updated_at,
  updated_at
)
VALUES (
  :store_id,
  :product_id,
  :availability_status,
  :stock_qty,
  'admin_dashboard',
  now(),
  now()
)
ON CONFLICT (store_id, product_id)
DO UPDATE SET
  availability_status = EXCLUDED.availability_status,
  stock_qty = EXCLUDED.stock_qty,
  source = EXCLUDED.source,
  last_updated_at = now(),
  updated_at = now();
```

Desain ini aman untuk produk yang tersedia di banyak cabang.

Contoh satu produk tersedia di dua cabang:

```text
product_id | product_name
115        | Our First Love

store_id | store_name
1        | Aromatique Jamal
2        | Urban Tajem

store_id | product_id | availability_status
1        | 115        | in_stock
2        | 115        | in_stock
```

Contoh status berbeda per cabang:

```text
store_id | product_id | availability_status
1        | 115        | out_of_stock
2        | 115        | in_stock
```

Tidak ada konflik karena primary key-nya adalah kombinasi `store_id` dan `product_id`, bukan hanya `product_id`.

### 7.7 Import Spreadsheet Operasional

Karena divisi operasional memberikan spreadsheet dan menandai produk yang tersedia di Aromatique Jamal, dashboard sebaiknya mendukung dua mode kerja:

```text
Manual mode
  Admin mencari produk dan mengubah status satu per satu.

Import mode
  Admin upload CSV/spreadsheet hasil operasional, lalu sistem mencocokkan produk ke tabel products.
```

Untuk tahap awal, import bisa dilakukan via script atau Supabase SQL. Setelah dashboard MVP stabil, import CSV bisa ditambahkan ke UI.

Flow import yang aman:

```text
1. Upload CSV.
2. Normalize nama produk.
3. Match ke products.product_id.
4. Tampilkan preview:
   - matched products
   - unmatched products
   - status yang akan berubah
5. Admin confirm.
6. Sistem upsert ke store_product_availability.
```

Jangan langsung overwrite availability tanpa preview, karena data spreadsheet rawan typo dan perbedaan nama.

### 7.8 Keamanan Dashboard

Dashboard stok tidak boleh memakai policy public write.

Aturan keamanan:

- frontend chatbot publik hanya boleh read data store dan availability;
- halaman dashboard harus membutuhkan login admin;
- update availability harus melalui authenticated admin atau service role backend;
- jangan expose Supabase service role key ke browser;
- jika memakai Edge Function untuk admin update, validasi token admin di Edge Function.

Rekomendasi implementasi:

```text
Public app
  read stores
  read availability
  no write access

Admin dashboard
  authenticated access
  write availability via secure backend path
```

---

## 8. Perubahan Recommendation Logic

### 8.1 Prinsip Utama

Lokasi tidak perlu masuk ke training model. Lokasi digunakan sebagai serving-time filter.

Alur yang disarankan:

```text
1. Ambil preferensi user dari conversation.
2. Generate kandidat produk dari KGAT/static retrieval/CR-HKGE.
3. Ambil kandidat lebih banyak dari Top-3, misalnya Top-30 atau Top-50.
4. Filter kandidat berdasarkan store availability.
5. Filter produk yang sudah pernah ditampilkan atau ditolak user pada sesi yang sama.
6. Ranking ulang kandidat yang tersisa dengan score model awal.
7. Tampilkan Top-3.
8. Simpan log kandidat sebelum filter dan sesudah filter.
```

### 8.2 Jangan Filter Setelah Top-3 Saja

Desain yang harus dihindari:

```text
Model menghasilkan Top-3
-> filter store
-> hasil bisa tinggal 0 atau 1 produk
```

Desain yang benar:

```text
Model menghasilkan Top-30/Top-50
-> filter store
-> ambil Top-3 dari kandidat yang tersedia
```

Dengan begitu sistem tetap bisa memberi rekomendasi walaupun beberapa kandidat terbaik tidak tersedia di cabang tersebut.

### 8.3 Pseudocode

```ts
type Candidate = {
  product_id: string;
  product_name: string;
  score: number;
  reasons: string[];
};

async function generateStoreAwareRecommendations(input) {
  const store = await getActiveStore(input.storeId);
  if (!store) {
    throw new Error("STORE_REQUIRED");
  }

  const rawCandidates = await retrieveCandidates({
    preferences: input.preferences,
    topK: 50,
    excludeProductIds: input.previouslyRejectedProductIds,
  });

  const availability = await getAvailabilityForStore({
    storeId: store.id,
    productIds: rawCandidates.map((item) => item.product_id),
  });

  const availableCandidates = rawCandidates.filter((item) => {
    const status = availability[item.product_id]?.availability_status;
    return status === "in_stock" || status === "limited";
  });

  const finalTop3 = availableCandidates.slice(0, 3);

  await logRecommendation({
    rawCandidates,
    filteredOutUnavailable: rawCandidates.filter(
      (item) => !finalTop3.some((finalItem) => finalItem.product_id === item.product_id)
    ),
    finalTop3,
    store,
  });

  return finalTop3;
}
```

Catatan: `filteredOutUnavailable` sebaiknya hanya berisi produk yang tersaring karena stok, bukan semua produk yang tidak masuk Top-3. Implementasi final perlu membedakan:

```text
filtered_out_unavailable_products
not_selected_available_candidates
```

### 8.4 Fallback Jika Produk Tersedia Kurang dari 3

Jika setelah filter store hanya ada 1-2 produk:

1. Naikkan kandidat pool dari 50 ke 100.
2. Relax preferensi sekunder, tetapi jangan relax store availability.
3. Tampilkan produk yang tersedia dengan wording:

```text
Aku menemukan 2 pilihan yang paling dekat dan tersedia di Aromatique Jamal.
```

4. Jika ada produk sangat cocok tetapi tidak tersedia, boleh tampilkan sebagai insight sekunder, bukan sebagai rekomendasi utama:

```text
Produk yang sangat cocok tetapi sedang tidak tersedia di store ini: ...
```

Untuk tahap pilot, rekomendasi utama tetap harus hanya produk tersedia.

---

## 9. Perubahan Backend

Backend utama berada di Supabase Edge Function:

```text
_external/aromatique-ai/supabase/functions/aromatique-chat/index.ts
```

Perubahan yang dibutuhkan:

### 9.1 Request Payload

Tambahkan field:

```ts
type AromatiqueChatRequest = {
  sessionId: string;
  conversationId?: string;
  message?: string;
  action?: "chat" | "recommend";
  storeId?: string;
  storeSlug?: string;
};
```

Validasi:

- jika `action === "recommend"` dan store kosong, return error terstruktur `STORE_REQUIRED`;
- jika `storeId/storeSlug` tidak aktif, return `STORE_NOT_FOUND`;
- jika conversation sudah punya store dan request mengirim store berbeda, update conversation store jika user memang memilih ganti store.

### 9.2 Persist Store Context

Saat membuat conversation:

```text
conversations.store_id
conversations.store_slug
conversations.store_name
```

Saat membuat experiment session:

```text
experiment_sessions.store_id
experiment_sessions.store_slug
experiment_sessions.store_name
```

Saat menyimpan recommendation:

```text
recommendations.store_id
recommendations.store_slug
recommendations.store_name
recommendations.candidate_products_before_store_filter
recommendations.filtered_out_unavailable_products
recommendations.availability_snapshot
```

### 9.3 Query Availability

Contoh query:

```sql
SELECT
  spa.product_id,
  spa.availability_status,
  spa.stock_qty,
  spa.last_updated_at
FROM public.store_product_availability spa
WHERE spa.store_id = :store_id
  AND spa.product_id = ANY(:product_ids);
```

Rule:

```text
availability_status IN ('in_stock', 'limited') => eligible
availability_status IN ('out_of_stock', 'unknown') => not eligible
missing availability row => not eligible untuk mode store-specific
```

### 9.4 Response Payload

Response rekomendasi sebaiknya menambahkan metadata:

```ts
type RecommendationResponse = {
  recommendations: ProductRecommendation[];
  store: {
    id: string;
    slug: string;
    name: string;
  };
  availabilityMode: "store_filtered";
  unavailableFilteredCount: number;
  fallbackUsed: boolean;
};
```

Frontend tidak harus menampilkan semua metadata, tetapi metadata ini penting untuk debugging.

### 9.5 Backend untuk Dashboard Stok

Dashboard stok membutuhkan backend path terpisah dari endpoint chat publik.

Opsi implementasi:

```text
Opsi A - Supabase client langsung dengan authenticated admin RLS
  Dashboard membaca products dan availability.
  Dashboard update availability memakai user admin yang sudah login.

Opsi B - Admin Edge Function
  Dashboard mengirim request ke Edge Function khusus admin.
  Edge Function memvalidasi token admin.
  Edge Function melakukan upsert availability memakai service role.
```

Untuk tahap MVP, opsi B lebih terkendali karena semua perubahan stok melewati satu jalur validasi.

Endpoint konseptual:

```text
GET  /admin/stores
GET  /admin/store-products?store_slug=aromatique_jamal
POST /admin/store-availability/upsert
POST /admin/store-availability/import-preview
POST /admin/store-availability/import-commit
```

Request upsert:

```ts
type UpsertStoreAvailabilityRequest = {
  storeId: string;
  productId: string;
  availabilityStatus: "in_stock" | "limited" | "out_of_stock" | "unknown";
  stockQty?: number | null;
};
```

Response dashboard row:

```ts
type StoreProductDashboardRow = {
  productId: string;
  productName: string;
  visualNote?: string | null;
  visualNoteAlt?: string | null;
  mainAccords?: string | null;
  olfactoryFamily?: string | null;
  availabilityStatus: "in_stock" | "limited" | "out_of_stock" | "unknown";
  stockQty?: number | null;
  lastUpdatedAt?: string | null;
};
```

Aturan penting:

```text
Dashboard boleh mengubah store_product_availability.
Dashboard tidak boleh mengubah products, kg_edges, product_embeddings, atau artifact model.
```

---

## 10. Perubahan Frontend

Komponen utama saat ini:

```text
_external/aromatique-ai/src/components/AromatiqueApp.tsx
_external/aromatique-ai/src/components/AromatiqueRecs.tsx
```

Improvement yang disarankan:

### 10.1 Komponen Baru

```text
StoreSelectionDialog.tsx
StoreIndicator.tsx
```

Atau jika ingin tetap minimal pada tahap awal, logika bisa ditempatkan dulu di `AromatiqueApp.tsx`, lalu diekstrak setelah stabil.

### 10.2 State yang Dibutuhkan

```ts
type SelectedStore = {
  id: string;
  slug: string;
  name: string;
};
```

State frontend:

```text
selectedStore
isStoreDialogOpen
storeSelectionRequiredReason
```

Persist local:

```text
localStorage key: aromatique_selected_store
```

Tetapi database tetap menjadi sumber log resmi.

### 10.3 UX Store Selection

Dialog:

```text
Pilih toko tujuan
Rekomendasi akan disesuaikan dengan stok produk di toko yang kamu pilih.

[Aromatique Jamal]
[Urban Tajem]
```

Setelah pilih:

- simpan ke state;
- simpan ke localStorage;
- kirim ke backend pada request chat/recommend;
- tampilkan store indicator.

### 10.4 Store Indicator

Contoh:

```text
Aromatique Jamal [Ganti]
```

Interaction:

- klik `Ganti` membuka StoreSelectionDialog;
- jika store diganti saat conversation berjalan, rekomendasi berikutnya menggunakan store baru;
- sistem bisa menampilkan pesan assistant singkat:

```text
Baik, rekomendasi berikutnya akan disesuaikan dengan stok di Urban Tajem.
```

### 10.5 Saat Greeting

Store selection muncul sebelum greeting. Setelah store dipilih, greeting tetap memakai flow A/B/C yang sudah ada dan tetap mengakhiri dengan pertanyaan familiarity:

```text
Sebelum kita mulai, boleh aku tahu dulu - seberapa familiar kamu dengan dunia parfum?
```

Button:

```text
Pemula
Penggemar
Kolektor
```

### 10.6 Saat Klik Tampilkan Rekomendasi

Jika `selectedStore` kosong:

- jangan panggil recommendation endpoint;
- tampilkan StoreSelectionDialog;
- setelah store dipilih, lanjutkan request rekomendasi.

Jika `selectedStore` ada:

- kirim `storeId/storeSlug` ke Edge Function;
- render recommendation card seperti biasa.

### 10.7 Dashboard Stok Frontend

Dashboard stok sebaiknya dipisahkan dari UI chatbot publik.

Rute konseptual:

```text
/admin/stock
```

Komponen yang disarankan:

```text
AdminStockDashboard.tsx
StoreSelector.tsx
ProductAvailabilityTable.tsx
AvailabilityStatusControl.tsx
StockImportPreview.tsx
```

UI minimum:

```text
Header:
  Store selector
  Search input
  Status filter
  Last sync/import info

Table:
  Product name
  Visual note
  Main accords
  Availability status
  Stock qty
  Last updated
  Save state
```

Interaction:

- admin memilih store;
- dashboard mengambil semua produk dari `products`;
- dashboard left join status dari `store_product_availability`;
- admin mengubah status produk;
- perubahan disimpan per row atau lewat tombol bulk save;
- produk yang belum punya availability row tampil sebagai `unknown`.

Dashboard tidak perlu menampilkan recommendation score. Fokus dashboard adalah validitas stok, bukan evaluasi model.

---

## 11. Dampak ke A/B/C Experiment

Penambahan store adalah perubahan penting untuk analisis tesis.

Store dapat menjadi confounding variable:

```text
Jika stok Urban Tajem lebih lengkap daripada Aromatique Jamal,
hasil kepuasan user bisa berbeda karena availability,
bukan karena prompt XAI A/B/C.
```

Karena itu, semua log A/B/C wajib menyimpan:

```text
condition
explanation_type
prompt_name
prompt_version
llm_model
familiarity
store_id
store_slug
store_name
recommendation_engine
model_version
```

Analisis hasil sebaiknya dilakukan minimal dalam dua bentuk:

1. agregat seluruh store;
2. stratified analysis per store.

Contoh pertanyaan analisis:

```text
Apakah prompt A lebih disukai di Aromatique Jamal?
Apakah prompt B lebih stabil ketika stok store lebih terbatas?
Berapa banyak kandidat cocok yang terfilter karena stok?
Apakah user lebih puas saat availability_filtered_count rendah?
```

---

## 12. Data Logging Tambahan

Untuk setiap request rekomendasi, simpan:

```text
conversation_id
session_id
recommendation_id
condition
explanation_type
familiarity
store_id
store_slug
store_name
raw_candidate_count
available_candidate_count
unavailable_filtered_count
final_recommendation_count
fallback_used
candidate_products_before_store_filter
filtered_out_unavailable_products
availability_snapshot
final_recommendations
created_at
```

Contoh `filtered_out_unavailable_products`:

```json
[
  {
    "product_id": "115",
    "product_name": "Our First Love",
    "score": 0.92,
    "availability_status": "out_of_stock",
    "store_slug": "aromatique_jamal"
  }
]
```

Contoh `availability_snapshot`:

```json
{
  "store_slug": "aromatique_jamal",
  "checked_at": "2026-06-02T10:00:00Z",
  "eligible_statuses": ["in_stock", "limited"],
  "product_statuses": {
    "115": "out_of_stock",
    "118": "in_stock",
    "129": "limited"
  }
}
```

---

## 13. Testing Plan

### 13.1 Database Test

Checklist:

- tabel `stores` berhasil dibuat;
- tabel `store_product_availability` berhasil dibuat;
- store seed `aromatique_jamal` dan `urban_tajem` berhasil masuk;
- produk bisa dihubungkan ke store via `product_id`;
- produk yang sama bisa tersedia di dua store;
- status `out_of_stock` tidak eligible.

### 13.2 Backend Test

Skenario:

1. Request rekomendasi tanpa store.

   Expected:

   ```text
   Backend return STORE_REQUIRED.
   Frontend menampilkan popup pilih store.
   ```

2. Request rekomendasi untuk Aromatique Jamal.

   Expected:

   ```text
   Semua produk final Top-3 punya availability_status in_stock atau limited di Aromatique Jamal.
   ```

3. Request rekomendasi untuk Urban Tajem.

   Expected:

   ```text
   Produk final bisa berbeda dari Aromatique Jamal jika stok berbeda.
   ```

4. Produk top candidate tidak tersedia.

   Expected:

   ```text
   Produk tersebut masuk log filtered_out_unavailable_products,
   tetapi tidak muncul di recommendation card.
   ```

5. Produk tersedia kurang dari 3.

   Expected:

   ```text
   Backend memakai fallback dan response fallbackUsed = true.
   ```

### 13.3 Frontend Test

Checklist:

- StoreSelectionDialog muncul setelah consent;
- user tidak bisa masuk flow rekomendasi tanpa store;
- store indicator tampil di halaman chat;
- tombol ganti store bekerja;
- store terakhir tersimpan saat refresh;
- chat baru tetap jelas memakai store apa;
- recommendation card tidak berubah desain utama;
- UI tetap responsive di desktop, tablet, dan mobile.

### 13.4 A/B/C Logging Test

Checklist:

- `experiment_sessions.store_id` terisi;
- `recommendations.store_id` terisi;
- `feedback.store_id` terisi;
- familiarity tetap tersimpan;
- condition A/B/C tetap random/stabil sesuai desain sebelumnya;
- kandidat sebelum filter dan sesudah filter tersimpan.

### 13.5 Dashboard Stok Test

Checklist:

- dashboard hanya bisa diakses admin;
- dashboard menampilkan semua produk dari `products`;
- memilih Aromatique Jamal menampilkan availability khusus Aromatique Jamal;
- memilih Urban Tajem menampilkan availability khusus Urban Tajem;
- produk yang belum punya row availability tampil sebagai `unknown`;
- perubahan status produk hanya mengubah `store_product_availability`;
- produk yang sama bisa `in_stock` di satu cabang dan `out_of_stock` di cabang lain;
- perubahan stok dari dashboard langsung memengaruhi filter rekomendasi berikutnya;
- dashboard tidak mengubah `products`, `kg_edges`, `product_embeddings`, atau dataset training.

### 13.6 Spreadsheet Import Test

Checklist:

- CSV/spreadsheet operasional bisa diproses ke preview;
- matched products dan unmatched products ditampilkan;
- import tidak langsung overwrite tanpa confirm;
- nama produk yang typo tidak dipaksa masuk otomatis;
- hasil commit melakukan upsert berdasarkan `store_id + product_id`;
- `source` tersimpan sebagai `admin_import` atau nama sumber lain yang jelas;
- `last_updated_at` berubah setelah import.

### 13.7 Regression Test

Pastikan fitur yang sudah ada tetap berjalan:

- welcome screen;
- consent;
- greeting A/B/C;
- button Pemula/Penggemar/Kolektor;
- chat conversation;
- Markdown/bold rendering;
- recommendation card;
- alternative recommendation saat user menambah preferensi;
- Safari/iOS compatibility;
- deployment Vercel.

---

## 14. Rollout Plan

### Production-Safe Rule

Karena QR Aromatique AI sudah dipasang di dua store, implementasi store availability tidak boleh langsung mengubah flow production.

Aturan rollout:

```text
Kode boleh dikembangkan lokal.
Kode boleh diuji di Vercel Preview.
Jangan langsung commit/push/deploy ke production sebelum QA selesai.
Feature flag default harus false.
Jika feature flag false, flow production lama harus tetap berjalan.
```

Feature flag yang disarankan:

```text
VITE_ENABLE_STORE_AVAILABILITY=false
VITE_ENABLE_ADMIN_STOCK_DASHBOARD=false
ENABLE_STORE_AVAILABILITY=false
ADMIN_STOCK_DASHBOARD_TOKEN=
```

Makna flag:

```text
VITE_ENABLE_STORE_AVAILABILITY
  Mengaktifkan store selection dan pengiriman store context dari frontend.

ENABLE_STORE_AVAILABILITY
  Mengaktifkan filter availability di Supabase Edge Function.

VITE_ENABLE_ADMIN_STOCK_DASHBOARD
  Mengaktifkan route dashboard stok internal.

ADMIN_STOCK_DASHBOARD_TOKEN
  Token admin untuk update stok via Edge Function.
```

Jika semua flag false, behavior harus sama dengan production saat ini:

```text
Home -> Consent -> Chat -> Rekomendasi lama tanpa filter store.
```

### Phase 0 - Data Collection

Kumpulkan data stok dari:

```text
Aromatique Jamal
Urban Tajem
```

Format minimal:

```text
product_id atau product_name
availability_status
stock_qty optional
last_updated_at
```

Output phase:

```text
CSV stok per store siap diimport.
Unmatched product names sudah direview.
```

### Phase 1 - Database Migration

Implementasi:

- buat tabel `stores`;
- buat tabel `store_product_availability`;
- tambah kolom store pada `conversations`, `experiment_sessions`, `recommendations`, dan `feedback`;
- seed dua store awal;
- import availability data.

Output phase:

```text
Supabase sudah bisa menjawab produk apa yang tersedia per store.
```

### Phase 2 - Backend Store-Aware Recommendation

Implementasi:

- request Edge Function menerima `storeId/storeSlug`;
- validasi store;
- candidate retrieval mengambil Top-30/Top-50;
- filter availability;
- simpan logging detail.

Output phase:

```text
Recommendation endpoint hanya mengembalikan produk tersedia di store aktif.
```

### Phase 3 - Admin Stock Dashboard MVP

Implementasi:

- buat halaman `/admin/stock`;
- dashboard membaca semua produk dari `products`;
- dashboard menampilkan availability per selected store;
- admin bisa update status produk;
- update hanya menulis ke `store_product_availability`;
- proteksi akses dashboard dengan admin auth atau admin Edge Function.

Output phase:

```text
Operasional bisa memantau dan memperbarui stok per cabang tanpa mengubah dataset utama.
```

### Phase 4 - Frontend Store Selection

Implementasi:

- StoreSelectionDialog;
- StoreIndicator;
- persist selected store;
- fallback popup saat rekomendasi tanpa store.

Output phase:

```text
User memilih store sebelum chat dan bisa mengganti store kapan saja.
```

### Phase 5 - Spreadsheet Import Support

Implementasi:

- import CSV/spreadsheet operasional;
- preview matched/unmatched products;
- confirm sebelum commit;
- upsert availability hasil import.

Output phase:

```text
Data spreadsheet dari operasional bisa dimasukkan dengan kontrol dan audit yang jelas.
```

### Phase 6 - QA dan Pilot Retest

Retest dengan skenario:

- user memilih Aromatique Jamal;
- user memilih Urban Tajem;
- user mengganti store saat chat berjalan;
- admin mengubah stok di dashboard;
- produk unavailable tidak muncul;
- log A/B/C tetap lengkap.

Output phase:

```text
Sistem siap diuji ulang oleh user di masing-masing cabang.
```

---

## 15. Acceptance Criteria

Fitur dianggap selesai jika:

1. User wajib memiliki store context sebelum rekomendasi dibuat.
2. Rekomendasi Top-3 hanya berisi produk `in_stock` atau `limited` pada store aktif.
3. User bisa mengganti store tanpa mengulang dari home screen.
4. Store context tersimpan di conversation, experiment session, recommendation, dan feedback.
5. Produk yang terfilter karena stok tersimpan di log.
6. A/B/C prompt tetap berjalan seperti sebelumnya.
7. Familiarity Pemula/Penggemar/Kolektor tetap tercatat.
8. UI tetap stabil di desktop, tablet, mobile, dan Safari iOS.
9. Tidak ada perubahan pada dataset training KGAT/CR-HKGE.
10. Tidak ada produk out-of-stock yang tampil sebagai rekomendasi utama.
11. Dashboard stok menampilkan semua produk dari `products`.
12. Dashboard stok hanya menulis ke `store_product_availability`.
13. Satu produk bisa memiliki status availability berbeda di cabang berbeda.
14. Dashboard admin tidak bisa diakses sebagai user publik.
15. Import spreadsheet memiliki preview matched/unmatched sebelum commit.

---

## 16. Risiko dan Mitigasi

### Risiko 1 - Data stok tidak akurat

Mitigasi:

- tampilkan `last_updated_at` di log internal;
- update stok secara berkala;
- untuk pilot, tetapkan jadwal update manual sebelum sesi testing.

### Risiko 2 - Nama produk dari store tidak match dataset

Mitigasi:

- gunakan `product_id` sebagai identifier utama;
- buat staging import untuk nama mentah;
- review manual unmatched names.

### Risiko 3 - Terlalu sedikit produk tersedia di store tertentu

Mitigasi:

- ambil kandidat retrieval lebih banyak;
- gunakan fallback Top-N tersedia;
- simpan `fallback_used`;
- jika perlu, tampilkan insight bahwa opsi di store tersebut terbatas.

### Risiko 4 - Analisis A/B/C bias karena store

Mitigasi:

- simpan `store_id` di semua log eksperimen;
- analisis hasil per store;
- jangan hanya membaca metrik agregat.

### Risiko 5 - User lupa store aktif

Mitigasi:

- tampilkan StoreIndicator secara permanen di chat;
- sediakan tombol `Ganti`;
- saat chat baru, tetap tampilkan store aktif.

### Risiko 6 - Dashboard stok terbuka untuk publik

Mitigasi:

- proteksi route dashboard dengan admin auth;
- jangan expose service role key ke browser;
- update stok dilakukan melalui backend path yang memvalidasi admin.

### Risiko 7 - Admin tidak sengaja overwrite stok massal

Mitigasi:

- import spreadsheet wajib memakai preview;
- tampilkan jumlah produk yang berubah;
- tampilkan unmatched products;
- simpan `source` dan `last_updated_at`.

---

## 17. Open Questions

Pertanyaan yang perlu diputuskan sebelum implementasi:

1. Apakah status stok cukup `in_stock/out_of_stock`, atau perlu `limited`?
2. Siapa yang akan memperbarui stok untuk tiap cabang?
3. Apakah update stok dilakukan harian, mingguan, atau sebelum sesi testing?
4. Apakah produk `limited` boleh direkomendasikan?
5. Jika produk sangat cocok tetapi tidak tersedia di store aktif, apakah boleh ditampilkan sebagai insight non-rekomendasi?
6. Apakah user boleh melihat rekomendasi lintas cabang?
7. Apakah store selection perlu diwajibkan ulang setiap chat baru, atau cukup pakai store terakhir?
8. Apakah dashboard memakai login Supabase admin atau proteksi sederhana khusus pilot?
9. Apakah update stok dilakukan per row, bulk save, atau keduanya?
10. Apakah spreadsheet import perlu langsung masuk MVP atau cukup Phase 5?

Rekomendasi awal:

```text
Gunakan store terakhir sebagai default,
tetapi tampilkan indikator store dan tombol ganti.
```

---

## 18. Kesimpulan

Improvement store availability perlu diimplementasikan karena menyelesaikan gap nyata dari pilot test:

```text
Rekomendasi harus relevan secara aroma dan tersedia secara operasional.
```

Desain terbaik adalah memisahkan master product catalog dan data stok cabang:

```text
dataset-aromatique/products
  = identitas dan karakter aroma produk.

store_product_availability
  = ketersediaan produk per cabang.
```

Dengan desain ini, sistem tetap valid untuk penelitian, tidak merusak dataset KGAT/CR-HKGE, dan lebih siap digunakan dalam kondisi toko nyata.

Dashboard stok menjadi layer operasional di atas desain tersebut:

```text
Dashboard membaca products sebagai katalog bersih.
Dashboard menulis store_product_availability sebagai status stok per cabang.
Recommendation engine memakai availability sebagai serving-time filter.
```

Jadi perubahan stok dapat dilakukan oleh operasional tanpa retraining model dan tanpa mengubah dataset utama.
