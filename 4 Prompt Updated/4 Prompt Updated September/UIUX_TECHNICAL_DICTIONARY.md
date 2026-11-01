# 📚 UI/UX TECHNICAL DICTIONARY — Essential Reference for Visual Analysis

> **Purpose:** Kamus istilah teknis untuk LLM saat menganalisa screenshot UI. Pakai ini sebagai vocabulary reference supaya analisa konsisten, akurat, dan tidak mengarang istilah.
>
> **Cara pakai:** Paste file ini bersamaan dengan `STITCH_PROMPT_GENERATOR.md` ketika setup LLM. LLM akan otomatis pakai istilah dari sini saat melakukan design audit.
>
> **Format:** `term` : definition

---

## 🎨 COLOR & THEME

- **Primary color** : warna utama brand, dipakai untuk CTA dan elemen paling penting
- **Accent / Secondary** : warna pendukung untuk emphasis, tidak sekuat primary
- **Surface** : warna card/panel, biasanya 1 step lebih terang/gelap dari background
- **Hex code** : 6-digit color code (#RRGGBB) — wajib pakai ini, jangan "biru muda"
- **OKLCH** : color space modern (Tailwind v4 default) — lebih perceptually uniform dari HSL
- **Contrast ratio** : rasio kontras text vs background — WCAG AA butuh ≥4.5:1 body, ≥3:1 large text
- **Semantic colors** : warna dengan makna fungsional — success (green), warning (amber), error (red), info (blue)

## 🔤 TYPOGRAPHY

- **Geometric sans** : sans-serif berbasis bentuk geometris (Inter, Geist, Söhne) — modern SaaS standard
- **Humanist sans** : sans-serif dengan karakter lebih organik (Open Sans, Lato) — friendly
- **Grotesque** : sans-serif klasik (Helvetica, Neue Haas) — Swiss/editorial vibe
- **Editorial serif** : serif dengan kontras stroke tinggi (Playfair, Fraunces, GT Sectra) — premium magazine
- **Mono** : monospace (JetBrains Mono, Geist Mono) — developer tools, code blocks
- **Type scale** : ukuran heading bertingkat (H1 48-72px, H2 32-40px, H3 24px, body 16px)
- **Line-height (leading)** : tight 1.0-1.2 untuk display, normal 1.5-1.6 untuk body
- **Letter-spacing (tracking)** : negative untuk display besar (-0.02em), positive untuk small caps
- **Tabular figures** : angka dengan lebar sama — wajib untuk KPI numbers/data tables
- **Font weight** : 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)

## 📐 LAYOUT & GRID

- **12-column grid** : standard web grid system, fleksibel untuk responsive
- **Bento grid** : grid asimetris dengan card ukuran berbeda (Apple-style)
- **Max content width** : batas lebar konten — biasanya 1200-1440px untuk readability
- **F-pattern** : pola baca user (horizontal kiri-kanan, scan vertikal) — untuk content-heavy
- **Z-pattern** : pola mata zigzag — untuk landing page dengan minimal text
- **Hero section** : section pertama landing page (headline + CTA + visual)
- **Above the fold** : area yang langsung terlihat tanpa scroll
- **Sticky** : element yang tetap fixed saat scroll (sticky header, sticky sidebar)

## 📏 SPACING

- **8px grid system** : spacing scale berbasis kelipatan 8 — standard industri
- **4px grid** : spacing scale lebih halus untuk UI dense (Linear, Notion)
- **Spacing tokens** : xs (4), sm (8), md (16), lg (24), xl (32), 2xl (48), 3xl (64)
- **Padding** : ruang dalam element (antara border dan konten)
- **Margin** : ruang di luar element (antara element dan tetangga)
- **Gap** : ruang antar element dalam flexbox/grid
- **Whitespace** : area kosong — generous (>40%) untuk premium, tight (<20%) untuk dense tools

## 🟦 SHAPE & RADIUS

- **Border radius** : sharp (0-2px), subtle (4-8px), rounded (12-16px), pillowy (20-32px), full (pill/circle)
- **Hairline border** : border 1px sangat tipis (#E5E7EB common) — pengganti shadow untuk depth
- **Pill shape** : border-radius full (9999px) — untuk badge, tag, button kecil

## 🌫️ ELEVATION & DEPTH

- **Flat design** : tanpa shadow, depth via warna/border
- **Subtle shadow** : `0 1px 2px rgba(0,0,0,0.05)` — modern SaaS standard
- **Hard shadow** : offset besar tanpa blur (`4px 4px 0 #000`) — neubrutalism signature
- **Glow** : `box-shadow: 0 0 20px <color>` — dark mode neon, gaming
- **Tonal elevation** : depth via step warna (Surface 1, Surface 2) — Material 3, iOS
- **Backdrop-filter** : CSS property untuk blur background — glassmorphism core

## 🧩 COMPONENTS

- **Atomic design** : atom (button) → molecule (search bar) → organism (header) — hierarchy komponen
- **Variant** : versi berbeda dari komponen sama — primary/secondary/ghost/destructive button
- **State** : kondisi interaktif — default, hover, active/pressed, focus, disabled, loading
- **Empty state** : tampilan saat tidak ada data — wajib ada untuk produk berkualitas
- **Skeleton loading** : placeholder shape saat data fetching — bukan spinner
- **FAB** : Floating Action Button (Material) — primary action floating
- **Affordance** : visual cue yang mengindikasikan element bisa di-interact
- **CTA** : Call-to-Action — primary button utama per screen
- **Modal / Dialog** : overlay focused yang mem-block background

## 🎬 MOTION & INTERACTION

- **Microinteraction** : feedback animasi kecil saat user beraksi (button click bounce, toggle slide)
- **Easing** : kurva animasi — ease-out (default), spring (playful), linear (jarang dipakai)
- **Duration** : 150ms (fast/snappy), 300ms (standard), 500ms+ (dramatic)
- **Hover state** : feedback saat cursor di atas — scale 1.02, shadow grow, color shift
- **Focus ring** : 2px outline saat element ter-focus — wajib untuk a11y

## ♿ ACCESSIBILITY

- **WCAG AA** : standard accessibility minimum — kontras 4.5:1 body, 3:1 large
- **WCAG AAA** : level lebih tinggi — kontras 7:1 body, 4.5:1 large
- **Touch target** : minimal 44x44px untuk mobile (Apple HIG) atau 48x48px (Material)
- **Focus indicator** : visual outline saat element ter-focus via keyboard — wajib visible
- **Semantic HTML** : pakai `<header>`, `<nav>`, `<main>`, `<button>` (bukan `<div>` untuk semua)

## 📱 RESPONSIVE

- **Breakpoints** : sm 640, md 768, lg 1024, xl 1280, 2xl 1536 (Tailwind standard)
- **Mobile-first** : design mulai dari mobile, scale up ke desktop
- **Fluid typography** : ukuran font yang scale via `clamp()` — bukan fixed px
- **Container query** : responsive berdasarkan parent size, bukan viewport

## 💼 DESIGN LANGUAGES (Visual Cues per Style)

- **Minimalist / Editorial** : whitespace >40%, max 1-2 accent, no shadow, typography dominan
- **Glassmorphism** : `backdrop-filter: blur(20px)`, transparency 60-80%, 1px white border rgba
- **Neumorphism** : dual shadow (light+dark), monochromatic, low contrast, no border
- **Neubrutalism** : border 2-4px solid black, hard shadow `4px 4px 0`, clash colors
- **Bento Grid** : asymmetric cards different sizes, radius 16-24px, mixed content types
- **Claymorphism** : inflated 3D shapes, soft saturated gradient, radius 20px+, soft shadow
- **Dark Mode Native** : background #0A0A0A-#1A1A1A, neon accent, glow shadow
- **Material Design 3** : dynamic color, FAB, ripple, tonal elevation, radius 16-28px
- **Liquid Glass (Apple)** : SF Pro, frosted glass bars, large titles, system blue #007AFF
- **Swiss / Grid-based** : Helvetica/Inter, 12-col strict, hairline horizontal, asymmetric balance
- **Bauhaus** : geometric primitives (circle/square/triangle), primary colors, form-follows-function
- **Y2K / Cyberpunk** : chrome gradient, glitch, neon pink/cyan, mesh gradient

---

## 🔧 ANALYSIS GUIDELINES (untuk LLM)

Saat melakukan visual audit dari screenshot, **gunakan istilah dari dictionary ini**, bukan istilah karangan:

✅ **Good:** "Saya melihat `backdrop-filter: blur(20px)` pada navbar + `1px white border rgba(255,255,255,0.2)` — strong indicator **glassmorphism**"

❌ **Bad:** "Navbar-nya keliatan transparan-transparan gimana gitu"

✅ **Good:** "Type scale terdeteksi: H1 48px line-height 1.1 letter-spacing -0.02em, body 16px line-height 1.6 — typical **geometric sans** seperti Inter atau Geist"

❌ **Bad:** "Font-nya gede dan ada yang kecil"

✅ **Good:** "Spacing follows **8px grid system** — card padding 24px (lg token), gap 16px (md token), section 48px (2xl token)"

❌ **Bad:** "Spacing-nya konsisten"

**Rule:** Setiap klaim teknis harus pakai vocabulary dari dictionary ini + sebut nilai numerik spesifik (hex, px, rem, ratio).

---

## 🧠 RULES & RATIONALE — Reference Standard (WHY, bukan cuma WHAT)

> Section di atas isinya **vocabulary** (istilah + definisi). Section ini beda: isinya **rule + formula + alasan teknis**, dipakai sebagai standar acuan wajib saat:
> - **AUDIT** (Phase 1 di `STITCH_PROMPT_GENERATOR.md`) — cek apakah reference image sesuai/deviate dari rule ini
> - **GENERATION** (Phase 4) — jadi default value kalau ambigu, bukan cuma dicatat doang
>
> Format tiap rule: **Rule** (apa) → **Formula** (angka pasti) → **Why** (alasan teknis) → **Audit cue** (yang dicek di gambar) → **Generation default** (dipakai kalau bikin baru/ambigu).

### 1. Spacing System (8px / 4px Grid)
- **Rule:** semua padding/margin/gap harus kelipatan base unit.
- **Formula:** token scale 4-8-16-24-32-48-64-96.
- **Why:** 8 divisible bersih ke pixel density (1x/2x/3x asset export) → no sub-pixel blur; konversi ke rem bersih (8px=0.5rem); modular progression bikin rhythm harmonis; token set ngurangin decision fatigue.
- **Audit cue:** ukur padding/gap di screenshot — kelipatan 8 (generous/marketing) atau 4 (dense dashboard)? Kalau angka aneh (13px, 19px) → flag "non-standard/inconsistent".
- **Generation default:** base 8px untuk consumer/marketing app, base 4px untuk dense admin/dashboard tool.

### 2. Column Grid per Breakpoint
- **Rule:** column count **berubah** per breakpoint (bukan fixed 12 selalu), gap tetap ikut spacing scale independen dari column count.
- **Formula:** Desktop 12 (split 6+6/4+4+4/3+9/8+4) → Tablet 8 (split 4+4/2+6/3+5) → Mobile 4 (hampir selalu full-width stack, 2+2 rare).
- **Why:** 12 divisible 1,2,3,4,6 = paling fleksibel; 8 divisible 1,2,4,8 (TIDAK by 3 → asymmetric split lazim di tablet); mobile viewport (~360-414px) kesempitan buat true 2-col tanpa clip.
- **Audit cue:** kalau ada multi-breakpoint reference, hitung berapa "slot" kolom yang keliatan tiap ukuran.
- **Generation default:** Material convention 12/8/4 — kecuali reference jelas pakai fixed-12-span-based (Bootstrap-style).

### 3. Typography Scale Ratio
- **Rule:** heading size = body size × ratio, ratio konsisten tiap tingkat (geometric progression, BUKAN penjumlahan Fibonacci).
- **Formula:** dense product UI 1.125-1.333, editorial/marketing 1.5-1.618 (golden ratio = limit rasio Fibonacci, bukan "tambah 2 angka sebelumnya").
- **Why:** rasio besar = loncatan dramatis tapi cuma cocok 3-4 tingkat (hero/editorial); rasio kecil = banyak tingkat halus, muat H1-H6+body+caption tanpa jomplang.
- **Audit cue:** ukur H1/H2/H3/body px, hitung rasio antar tingkat → cocokkan tabel ratio untuk nebak dense-UI vs editorial.
- **Generation default:** 1.25-1.333 untuk SaaS product, 1.5+ hanya untuk hero/landing yang mood-nya udah confirmed dramatic/editorial.

### 4. Corner Radius Scale
- **Rule:** radius kecil→professional, besar→playful; radius WAJIB proporsional ke ukuran komponen (bukan 1 angka global).
- **Formula:** nested radius `r_inner = max(0, r_outer − padding)` (exact, arc concentric); pill `radius = height/2` atau `border-radius: 9999px` (auto-clamp).
- **Why:** 2-4px=formal/corporate, 8-12px=modern SaaS balanced, 16px+=playful/consumer; radius sama di komponen kecil vs besar keliatan beda proporsi drastis.
- **Audit cue:** ukur radius card vs elemen di dalamnya, cek apakah dekat dengan formula nested (indikasi intentional design system) atau random.
- **Generation default:** 8-12px sebagai default modern SaaS kalau nggak ada sinyal mood lain; hitung nested radius pakai formula, jangan asal comot angka.

### 5. Element-First vs Content-First Sizing
- **Rule:** komponen atomik (button/avatar/icon/badge/input) → **fixed size**; container isi-variabel (table row/list item/card teks/chat bubble) → **height auto + padding konsisten** (rhythm dari padding, BUKAN dari height).
- **Formula:** `min-height` sebagai floor + padding fixed, height tetap bisa grow.
- **Why:** fixed height di content-variable container bikin overflow/clip kalau teks panjang; padding seragam tetap jaga visual rhythm meski tinggi row berbeda-beda.
- **Audit cue:** row/list item tinggi konsisten TAPI konten variatif → indikasi height-auto+padding (benar). Ada tanda clipping/cramped text → indikasi fixed-height yang salah.
- **Generation default:** table/list/card teks → height auto + min-height floor; button/avatar/icon/badge/input → fixed height sesuai token size (sm/md/lg).

### 6. Color Token Architecture
- **Rule:** 3 tier — Primitive (raw hex) → Semantic (role: primary/background/text) → Component (button-bg, card-border). Naming by FUNCTION bukan APPEARANCE. Tiap semantic color butuh state variants + on-color pairing.
- **Formula:** `--color-primary`, `--color-on-primary`, `--color-primary-hover/active/disabled/subtle` (~5 variant per semantic color).
- **Why:** dark mode/rebrand cuma remap tier 2 (komponen nggak disentuh); on-color pairing jamin contrast tanpa hardcode teks; dark mode elevation arahnya KEBALIK light mode (makin elevated = makin TERANG, karena shadow invisible di dark bg).
- **Audit cue:** extract primary/background/surface/text-primary/text-secondary/border, cek ada semantic color (success/warning/error) yang keliatan.
- **Generation default:** DESIGN.md WAJIB output token 3-tier structure, bukan flat hex list; sertakan `on-*` pairing tiap background.

### 7. Soft Black/White (Neutral Avoidance)
- **Rule:** jangan `#000000` untuk teks/dark-bg besar, jangan `#FFFFFF` untuk canvas besar. Card/surface KECIL yang terbingkai boleh pure white.
- **Formula:** soft black `#0A0A0A`–`#1A1A1A`, off-white `#FAFAFA`–`#F9FAFB`.
- **Why:** pure black di teks/bg besar → halation/vibration effect (edge huruf "bergetar"); pure white canvas besar → glare/eye fatigue. Card pure white di atas bg off-white justru BENAR — berfungsi sebagai elevation signal (lebih terang = "naik") tanpa perlu shadow.
- **Audit cue:** cek hex background & text-primary — kalau persis `#000000`/`#FFFFFF` di area luas → flag deviation (kecuali OLED true-dark theme yang jelas intentional).
- **Generation default:** never output `#000000`/`#FFFFFF` sebagai background/text-primary utama; selalu soft variant.

### 8. WCAG Contrast
- **Rule:** body text ≥4.5:1 (AA) / ≥7:1 (AAA); large text (≥24px reguler/≥18.66px bold) ≥3:1 (AA) / ≥4.5:1 (AAA); non-text UI component (border/icon/focus ring) ≥3:1 — **rule terpisah dari teks**.
- **Formula:** `L = 0.2126R + 0.7152G + 0.0722B` (linearized sRGB), `Contrast = (L1+0.05)/(L2+0.05)`.
- **Why:** koefisien luminance ikut sensitivitas mata (hijau paling dominan, biru paling kecil); large text lebih toleran kontras rendah karena stroke lebih tebal.
- **Audit cue:** hitung/estimasi contrast tiap text-background pairing, flag di bawah 4.5:1. Jangan pakai threshold teks (4.5:1) untuk border/icon — itu pakai 3:1.
- **Generation default:** semua pairing WAJIB pass AA minimum; upgrade ke AAA hanya kalau user explicitly minta.

### 9. Line-Height Formula
- **Rule:** `line-height = font-size × ratio`, dibulatkan ke kelipatan 4 (align spacing grid).
- **Formula:** Display 1.0-1.1, Heading 1.2-1.3, Body 1.5-1.6, Caption 1.4-1.5. Makin besar font, makin kecil ratio dibutuhkan.
- **Why:** line-height kontribusi ke total component height (`row height = line-height + padding`) — harus align grid biar vertical rhythm konsisten antar elemen.
- **Audit cue:** ukur jarak antar baris ÷ font-size, cocokkan ke rentang ratio kategori (display/heading/body/caption).
- **Generation default:** body 1.5-1.6 dibulatkan kelipatan 4; heading 1.2-1.3; output CSS pakai unitless (`line-height: 1.5`) bukan px fixed.

### 10. Vertical Rhythm / Proximity Hierarchy
- **Rule:** space ABOVE heading > space BELOW heading (~3:1-4:1); paragraph gap 1.5-2× line-height; JANGAN campur indent+blank-line (pilih satu sistem). Hierarchy: section-gap > heading-body-gap > paragraph-gap > line-height (tiap tingkat harus lebih kecil dari tingkat di atasnya).
- **Why:** Law of Proximity (Gestalt) — jarak menentukan persepsi grouping tanpa perlu divider/border. Heading dgn spacing simetris jadi ambigu "milik" section mana.
- **Audit cue:** ukur gap sebelum vs sesudah heading (harusnya asymmetric); cek sistem paragraf yang dipakai (indent-no-gap vs block-with-gap, jangan dua-duanya).
- **Generation default:** heading spacing asymmetric (atas 2-4× lebih besar dari bawah); body pakai block system (gap antar paragraf, no indent) — standar web/app modern.

---

**END OF DICTIONARY.** Total: 50+ istilah esensial (vocabulary) + 10 rules & rationale (standar acuan audit & generation).
