Buat frontend website **Teapy** berdasarkan konsep **“Teapy Tea House”**, yaitu website desktop **one-window, 100vh, tanpa vertical scroll**, dengan perpindahan Home → Menu → Our Story terasa seperti berada di **satu ruangan yang sama**, bukan seperti berpindah halaman biasa.

Gunakan:

- **Next.js App Router**
- **React + TypeScript**
- **Tailwind CSS**
- **Framer Motion** untuk scene transition dan shared-element animation
- Tidak perlu backend dulu
- Fokus desktop terlebih dahulu
- Struktur kode harus modular dan mudah diganti asetnya nanti

---

# 1. KONSEP UTAMA

Website bukan kumpulan page yang masing-masing memiliki background sendiri.

Website harus diperlakukan sebagai:

> **1 persistent Teapy Tea House stage + beberapa scene/state.**

Struktur utamanya:

```txt
┌──────────────┬────────────────────────────────────────────┐
│              │                                            │
│ FIXED LEFT   │            TEAPY TEA HOUSE STAGE           │
│ SIDEBAR      │                                            │
│              │  Persistent environment                    │
│              │  Dynamic scene content                     │
│              │  Persistent foreground                     │
│              │                                            │
└──────────────┴────────────────────────────────────────────┘
```

Ukuran:

```txt
width: 100vw
height: 100vh
overflow: hidden
```

Tidak boleh ada page scroll.

Target utama:

```txt
2560×1440
1920×1080
1600×900
1440×900
1366×768
```

Gunakan responsive sizing dengan `clamp()`, `%`, `vw`, `vh`, dan container scaling agar seluruh layout tetap muat dalam satu layar.

---

# 2. STRUKTUR LAYOUT

Gunakan 2 area utama:

```txt
LEFT SIDEBAR ≈ 12–13%
MAIN STAGE   ≈ 87–88%
```

Contoh:

```css
grid-template-columns: minmax(170px, 12.5vw) 1fr;
```

Sidebar tidak pernah berubah posisi ketika scene berpindah.

Jangan membuat card/container baru yang memutus background main stage.

---

# 3. FOLDER ASSET

Assume semua asset akan diletakkan di:

```txt
/public/assets/
```

Gunakan struktur:

```txt
assets/

├── brand/
│   ├── teapy-logo.png
│   ├── teapy-logo-full.png
│   ├── have-a-teapy-day.png
│   └── daun-teapy.png
│
├── environment/
│   ├── wall.webp
│   ├── floor.webp
│   ├── window-frame.webp
│   ├── window-home.webp
│   ├── window-menu.webp
│   ├── window-story.webp
│   ├── shelf-left.webp
│   ├── shelf-right.webp
│   ├── plant-left.webp
│   ├── plant-right.webp
│   └── foreground-table.webp
│
├── pipy/
│   ├── pipy-home.webp
│   ├── pipy-menu.webp
│   └── pipy-story.webp
│
├── home/
│
├── menu/
│
├── story/
│
└── icons/
```

**Environment assets sudah tersedia.**

Beberapa Pipy dan branded asset masih mungkin direvisi nantinya.

Karena itu:

- jangan bake asset ke layout;
- semua URL asset harus mudah diganti;
- buat config seperti `assets.ts`;
- gunakan fallback placeholder jika file belum tersedia.

Contoh:

```ts
export const teapyAssets = {
  environment: {
    wall: "/assets/environment/wall.webp",
    floor: "/assets/environment/floor.webp",
    windowFrame: "/assets/environment/window-frame.webp",
    windowHome: "/assets/environment/window-home.webp",
    windowMenu: "/assets/environment/window-menu.webp",
    windowStory: "/assets/environment/window-story.webp",
    shelfLeft: "/assets/environment/shelf-left.webp",
    shelfRight: "/assets/environment/shelf-right.webp",
    plantLeft: "/assets/environment/plant-left.webp",
    plantRight: "/assets/environment/plant-right.webp",
    foregroundTable: "/assets/environment/foreground-table.webp",
  },
};
```

---

# 4. DESIGN LANGUAGE

Visual Teapy:

```txt
cozy
cute
soft
warm
Japanese / Asian tea-house inspired
natural
playful
premium but approachable
```

Palet utama:

```txt
Cream / Ivory
Warm beige
Wood brown
Teapy maroon
Muted leaf green
Soft peach
```

Jangan gunakan:

- glassmorphism modern berlebihan;
- gradient neon;
- card SaaS;
- dashboard layout;
- border abu-abu generik;
- navbar modern floating pill;
- section putih yang menutupi background;
- shadow kasar.

UI harus terasa seperti bagian fisik dari Tea House.

---

# 5. SIDEBAR

Sidebar kiri harus persistent.

Layout kira-kira:

```txt
VERSION 6 – TEA HOUSE

Teapy Logo

Have a
Teapy Day!

Every cup,
a little happiness.



Pipy small line artwork



music    EN    theme
```

Style:

- cream/ivory;
- rounded outer container;
- shadow sangat lembut;
- maroon typography;
- spacing lapang;
- sidebar tidak berubah antar scene.

Bottom controls:

```txt
Music
Language
Theme
```

Buat sebagai circular/minimal controls.

---

# 6. MAIN TEA HOUSE STAGE

Buat:

```tsx
<TeapyStage>
  <EnvironmentBackground />
  <SceneWindow />
  <SceneContent />
  <PipyLayer />
  <ForegroundLayer />
  <StatusWidgets />
</TeapyStage>
```

Gunakan:

```css
position: relative;
height: 100%;
overflow: hidden;
```

Setiap environment layer:

```css
position: absolute;
pointer-events: none;
```

---

# 7. LAYERING / Z-INDEX

Gunakan sistem jelas:

```txt
z-0  wall
z-1  window scenery
z-2  window frame
z-3  shelves
z-4  decorative plants
z-10 scene UI/content
z-15 Pipy
z-20 foreground furniture/table
z-30 status widgets
```

Jangan satukan semuanya menjadi satu background image.

---

# 8. SHARED ENVIRONMENT

Elemen berikut **tidak boleh menghilang/reload** ketika pindah page:

```txt
wall
floor
window-frame
shelf-left
shelf-right
plant-left
plant-right
foreground elements
sidebar
```

Hanya beberapa elemen scene-specific yang berubah.

Contoh:

```txt
HOME        window-home
MENU        window-menu
OUR STORY   window-story
```

Window scenery harus crossfade.

---

# 9. ROUND WINDOW SEBAGAI VISUAL ANCHOR

Circular window adalah anchor utama.

Struktur:

```tsx
<div className="window">
  <AnimatePresence>
     <motion.img src={currentWindowScene} />
  </AnimatePresence>

  <img src="/assets/environment/window-frame.webp" />
</div>
```

Ketika berpindah scene:

```txt
window-home
   ↓ crossfade
window-menu
   ↓ crossfade
window-story
```

Durasi sekitar:

```txt
700–900ms
```

Tambahkan subtle:

```txt
scale 1.015 → 1
```

Jangan membuat zoom berlebihan.

---

# 10. HOME SCENE

Home mengikuti konsep referensi Version 6.

Komposisi utama:

```txt
                     small curved text
              “What would you like to do today?”

                       ROUND WINDOW
                           PIPY

MENU     OUR STORY               PROMO     STORES     CONTACT
```

Navigation berbentuk **hanging vertical fabric/paper banners**, bukan button biasa.

Kelima menu:

```txt
Menu
Our Story
Promo
Stores
Contact
```

Masing-masing:

- icon sederhana;
- title;
- subtitle kecil;
- berbeda warna pastel;
- ujung bawah sedikit irregular seperti kain/paper banner.

Home Pipy ditempatkan di tengah window area.

Gunakan placeholder apabila `pipy-home.webp` belum tersedia.

Navigation harus HTML, bukan gambar.

---

# 11. HOME BOTTOM STATUS

Pertahankan dua widget kecil di kanan bawah:

```txt
OPEN HOURS
09.00 – 21.00
```

dan

```txt
YOGYAKARTA
26°C
```

Bentuk seperti dark translucent warm-brown panel.

Jangan terlalu modern.

Gunakan icon clock/weather.

Untuk sekarang cuaca boleh mock/static.

---

# 12. MENU SCENE

Ketika user klik `Menu`:

- sidebar tetap;
- wall tetap;
- rak tetap;
- plants tetap;
- circular window tetap;
- scenery window crossfade ke `window-menu.webp`;
- Home navigation banners menghilang;
- Menu UI muncul;
- Pipy berpindah posisi.

Menu tidak boleh menjadi card grid modern.

## Header category

Letakkan di bagian atas:

```txt
Signature
Milk Tea
Pure Tea
Seasonal
```

Bentuk seperti hanging tea labels.

Active category:

```txt
Teapy maroon
```

Inactive:

```txt
cream / muted pastel
```

Gunakan HTML/CSS.

---

# 13. PRODUCT DISPLAY

Produk ditampilkan seolah berdiri di atas tea counter/meja.

Desktop:

```txt
max 4 product / view
```

Contoh dummy data:

```ts
[
 {
   name: "Osmanthus Milk Tea",
   price: 22000,
   category: "Signature",
 },
 {
   name: "Roasted Oolong Milk Tea",
   price: 24000,
   category: "Signature",
 },
 {
   name: "Jasmine Milk Tea",
   price: 22000,
   category: "Signature",
 },
 {
   name: "Teapy Classic Milk Tea",
   price: 23000,
   category: "Signature",
 }
]
```

Untuk sementara gunakan product placeholder jika image belum tersedia.

Struktur tiap product:

```txt
       CUP

Osmanthus
Milk Tea

22K
```

Tidak menggunakan boxed card.

Hover:

```txt
translateY(-8px)
scale(1.035)
```

Duration:

```txt
180–220ms
```

Tambahkan soft shadow.

---

# 14. MENU PAGINATION

Karena website tidak scroll:

```txt
‹        01 / 02        ›
```

Gunakan horizontal pagination.

Jangan membuat horizontal scrollbar terlihat.

---

# 15. OUR STORY SCENE

Klik `Our Story`.

Environment tetap.

Window scenery crossfade:

```txt
window-story.webp
```

Scene utama berupa **open tea journal / storybook experience**.

Jika asset buku belum tersedia, buat sementara melalui CSS:

```txt
large warm cream paper area
subtle paper texture
soft organic edges
```

Jangan menggunakan white modern card.

---

# 16. OUR STORY CONTENT

Heading:

```txt
Our Story
```

Intro:

```txt
Teapy started with a simple thought:
to bring carefully selected tea into a cup
that makes everyday moments a little happier.
```

Gunakan maksimal 3 chapter:

```txt
01
From Leaf

02
Our Craft

03
To You
```

Contoh isi:

### 01 From Leaf

```txt
We carefully select teas from tea-growing regions around the world.
```

### 02 Our Craft

```txt
Each tea is brewed and balanced with milk to preserve its own character.
```

### 03 To You

```txt
A simple cup, made to bring a little happiness into your day.
```

Bottom chapter selector:

```txt
01 ───── 02 ───── 03
```

Klik chapter:

- text crossfade;
- illustration kecil boleh berubah;
- tidak berpindah page;
- tidak scroll.

---

# 17. PIPY SEBAGAI SHARED ELEMENT

Pipy harus dianggap sebagai **satu karakter yang berpindah posisi**, bukan image yang tiba-tiba disappear/appear.

Gunakan Framer Motion.

Contoh konsep:

```tsx
<motion.div
  layoutId="pipy"
  animate={pipyPosition[currentScene]}
>
```

Posisi kira-kira:

```ts
const pipyPosition = {
  home: {
    x: "0%",
    y: "0%",
    scale: 1,
  },

  menu: {
    x: "32%",
    y: "10%",
    scale: 0.92,
  },

  story: {
    x: "18%",
    y: "13%",
    scale: 0.95,
  },
};
```

Sesuaikan dengan visual aktual.

Penting:

Pipy **tidak boleh blink out** saat transisi.

Kalau image pose berbeda diperlukan, gunakan crossfade pose di dalam wrapper shared `layoutId`.

---

# 18. SCENE TRANSITION

Jangan menggunakan simple page fade untuk semuanya.

Gunakan choreographed transition.

## Home → Menu

Timing target:

```txt
0ms
home navigation mulai fade-out

150ms
Pipy mulai bergerak

250ms
menu counter/product stage muncul

350ms
category hanging labels turun

450ms
products masuk staggered

750ms
transition selesai
```

Product stagger:

```txt
40–70ms
```

---

# 19. Menu → Our Story

Urutan:

```txt
products
opacity 1 → 0
translateY 0 → 15px

categories
fade-out

Pipy
move smoothly

storybook
opacity 0 → 1
scale .97 → 1
translateY 18 → 0
```

Target total:

```txt
700–900ms
```

---

# 20. EASING

Gunakan feel lembut:

```css
cubic-bezier(.22, 1, .36, 1)
```

Atau spring Framer Motion yang tidak memantul berlebihan.

Contoh:

```ts
transition={{
  duration: 0.65,
  ease: [0.22, 1, 0.36, 1]
}}
```

Tidak boleh terasa seperti PowerPoint.

---

# 21. PARALLAX

Tambahkan parallax desktop yang **sangat subtle** berdasarkan cursor.

Maximum displacement:

```txt
wall/background   1–2px
window scenery    2px
shelf             2–3px
plants            3–4px
Pipy              4–5px
foreground        5–6px
```

Gunakan requestAnimationFrame atau Framer Motion values.

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

Matikan parallax dan simplify transition jika reduced motion aktif.

---

# 22. ROUTING / URL

Walaupun secara visual satu stage, URL tetap harus bisa:

```txt
/
 /menu
 /our-story
```

Jangan hard reload.

Gunakan persistent layout sehingga Tea House environment tidak remount.

Ideal architecture:

```txt
app/
  layout.tsx
  page.tsx
  menu/page.tsx
  our-story/page.tsx
```

Dengan:

```txt
TeapyShell
└── TeaHouseStage
```

di shared layout.

Jika route-based transition menyebabkan shared environment remount, pindahkan scene state ke persistent client shell dan sinkronkan state dengan pathname.

Prioritas utama:

> tidak ada flashing/reloading environment saat route berubah.

---

# 23. COMPONENT STRUCTURE

Buat struktur minimal:

```txt
components/
├── layout/
│   ├── TeapyShell.tsx
│   └── Sidebar.tsx
│
├── environment/
│   ├── TeaHouseStage.tsx
│   ├── WallLayer.tsx
│   ├── FloorLayer.tsx
│   ├── WindowLayer.tsx
│   ├── ShelfLayer.tsx
│   ├── PlantLayer.tsx
│   └── ForegroundLayer.tsx
│
├── scenes/
│   ├── HomeScene.tsx
│   ├── MenuScene.tsx
│   └── StoryScene.tsx
│
├── pipy/
│   └── Pipy.tsx
│
├── navigation/
│   ├── HangingNav.tsx
│   └── CategoryNav.tsx
│
├── menu/
│   ├── ProductDisplay.tsx
│   └── MenuPagination.tsx
│
├── story/
│   ├── StoryBook.tsx
│   └── StoryChapters.tsx
│
└── ui/
    ├── StatusWidget.tsx
    └── IconButton.tsx
```

---

# 24. SCENE CONFIG

Jangan hardcode posisi di banyak component.

Gunakan config.

Contoh:

```ts
export const sceneConfig = {
  home: {
    window: "/assets/environment/window-home.webp",
    pipy: "/assets/pipy/pipy-home.webp",
  },

  menu: {
    window: "/assets/environment/window-menu.webp",
    pipy: "/assets/pipy/pipy-menu.webp",
  },

  story: {
    window: "/assets/environment/window-story.webp",
    pipy: "/assets/pipy/pipy-story.webp",
  },
};
```

---

# 25. RESPONSIVENESS

Prioritas **desktop**.

At 1366×768 semua konten tetap harus muat.

Gunakan:

```css
height: 100dvh;
overflow: hidden;
```

Jika viewport lebih pendek:

- scale decorative objects;
- kurangi spacing;
- jangan membuat scroll.

Jangan paksa layout menjadi mobile card stack.

Untuk sementara jika:

```txt
width < 1024px
```

boleh tampilkan simplified experience/message:

```txt
Teapy Tea House is best enjoyed on a larger screen.
```

Tetapi struktur code harus tetap memungkinkan mobile implementation nanti.

---

# 26. PERFORMANCE

Ini penting karena banyak image besar.

Gunakan:

- Next/Image bila cocok;
- preload environment yang digunakan pertama;
- lazy/preload scene berikutnya setelah Home selesai load;
- WebP;
- image decoding async;
- jangan re-download shared assets ketika route berubah.

Preload:

```txt
window-home
window-menu
window-story
pipy-home
pipy-menu
pipy-story
```

setelah initial critical environment selesai.

Tidak boleh ada blank flash ketika pertama pindah scene.

---

# 27. LOADING

Buat minimal Teapy loading state.

Bukan spinner generik.

Boleh:

```txt
small Teapy leaf
```

dengan gentle:

```txt
rotate ±5deg
scale 0.96 ↔ 1
```

Text:

```txt
Brewing your Tea House...
```

Setelah critical environment ready, fade masuk seluruh Tea House.

---

# 28. ACCESSIBILITY

Walaupun ilustratif:

- semua menu tetap `<button>` / `<a>`;
- keyboard navigation;
- visible but brand-consistent focus state;
- alt text;
- semantic headings;
- `aria-current`;
- respect reduced motion;
- cukup contrast untuk text.

---

# 29. FONT

Gunakan typography yang playful rounded dan dekat dengan identitas Teapy.

Untuk sementara gunakan:

```txt
Mali
```

untuk heading / brand-like text.

Gunakan sans-serif yang lebih readable untuk body kecil jika diperlukan.

Jangan gunakan serif.

---

# 30. INTERACTION DETAILS

Tambahkan micro-interaction:

### Hanging navigation

Hover:

```txt
translateY(-3px)
rotate ±0.5deg
```

### Pipy

Hover optional:

```txt
scale 1.01
```

### Product

```txt
translateY(-8px)
scale 1.035
```

### Plants

Parallax subtle.

### Window

Very slow ambient movement optional:

```txt
scale 1 → 1.008
duration 8–12s
```

Jangan membuat website ramai bergerak.

---

# 31. IMPORTANT: JANGAN LAKUKAN INI

Jangan:

```txt
❌ membuat Home sebagai full JPG
❌ membuat Menu sebagai full JPG
❌ membuat Story sebagai full JPG
```

Jangan membuat:

```txt
<HomeBackground />
<MenuBackground />
<StoryBackground />
```

yang mengganti seluruh layar.

Yang benar:

```txt
<TeaHouseEnvironment />  ← persistent

<HomeScene />
<MenuScene />
<StoryScene />
```

Scene hanya mengganti konten tertentu.

---

# 32. IMPORTANT: NO THIRD GRID

Main area kanan harus tetap terlihat sebagai **satu unified Tea House canvas**.

Jangan membuat:

```txt
sidebar
+
content panel
+
another content card
```

Jangan memberi background putih opaque di belakang Menu atau Our Story.

Konten harus **blend dengan ilustrasi Tea House**.

---

# 33. FIRST IMPLEMENTATION GOAL

Implement terlebih dahulu:

```txt
1. Persistent sidebar
2. Persistent Tea House stage
3. Environment layers
4. Home Scene
5. Menu Scene
6. Our Story Scene
7. Home ↔ Menu ↔ Story transitions
8. Shared Pipy movement
9. Window scenery crossfade
10. Responsive desktop scaling
```

Promo, Stores, Contact belum perlu dibuat sekarang.

Navigation-nya tetap tampil di Home, tetapi klik:

```txt
Promo
Stores
Contact
```

boleh sementara melakukan:

```txt
console.info("Coming soon")
```

atau subtle toast:

```txt
Coming soon 🌿
```

---

# 34. DEVELOPMENT MODE

Tambahkan development-only debug panel yang mudah dimatikan:

```txt
Current scene
viewport dimensions
asset loaded status
toggle parallax
toggle scene bounds
```

Contoh env:

```txt
NEXT_PUBLIC_TEAPY_DEBUG=true
```

Jika false, panel tidak tampil.

Ini penting agar positioning asset mudah kami revisi nanti.

---

# 35. ASSET POSITIONING

Karena asset masih dalam proses finalisasi:

buat seluruh posisi environment melalui central config:

```ts
export const environmentLayout = {
  shelfLeft: {
    left: "-2%",
    bottom: "4%",
    width: "18%",
  },

  shelfRight: {
    right: "-1%",
    bottom: "5%",
    width: "17%",
  },

  window: {
    left: "50%",
    top: "48%",
    width: "42%",
  },

  plantLeft: {
    left: "5%",
    bottom: "2%",
    width: "10%",
  },

  plantRight: {
    right: "3%",
    bottom: "2%",
    width: "11%",
  },
};
```

Jadi nantinya asset baru bisa masuk tanpa refactor component.

---

# 36. FINAL RESULT YANG DIHARAPKAN

Ketika website dibuka:

User melihat sebuah **cozy Teapy Tea House** satu layar penuh.

Sidebar kiri menjadi anchor brand.

Home:

```txt
Pipy menyambut user.
Hanging navigation berada di dalam ruangan.
```

Klik Menu:

```txt
Tea House tidak hilang.
Pipy bergerak.
Window berganti scenery.
Navigation berubah menjadi category.
Produk muncul di atas meja.
```

Klik Our Story:

```txt
Tea House tetap.
Produk menghilang perlahan.
Pipy berpindah.
Storybook muncul.
Window berubah menjadi story scenery.
```

Sensasinya harus:

> **bukan berpindah halaman, tetapi berpindah aktivitas di dalam Tea House yang sama.**

Prioritaskan:

```txt
visual continuity
smooth animation
stable layout
asset modularity
desktop one-window experience
```

Setelah implementasi selesai, jalankan project dan perbaiki seluruh TypeScript/runtime/build error sampai bersih.

Terakhir, tampilkan struktur file yang dibuat dan jelaskan secara singkat file mana yang harus saya edit jika saya ingin:

1. mengganti asset,
2. mengganti posisi asset,
3. mengubah animasi,
4. menambah menu,
5. menambah scene baru.