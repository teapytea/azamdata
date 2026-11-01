<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Lumina Digital - Catalog</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&amp;family=Inter:wght@400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              "colors": {
                      "primary-fixed": "#e1e0ff",
                      "on-tertiary-fixed-variant": "#7b2f00",
                      "tertiary-fixed-dim": "#ffb695",
                      "on-secondary-fixed-variant": "#6900b3",
                      "primary-fixed-dim": "#c0c1ff",
                      "error": "#ba1a1a",
                      "surface-container-highest": "#e0e3e5",
                      "surface-container-high": "#e6e8ea",
                      "surface-container-low": "#f2f4f6",
                      "outline-variant": "#c7c4d8",
                      "on-surface-variant": "#464555",
                      "tertiary-fixed": "#ffdbcc",
                      "on-secondary-fixed": "#2c0051",
                      "outline": "#777587",
                      "on-secondary-container": "#fffbff",
                      "on-primary-fixed-variant": "#2f2ebe",
                      "on-primary-fixed": "#07006c",
                      "secondary-container": "#9c48ea",
                      "on-error": "#ffffff",
                      "on-surface": "#191c1e",
                      "surface-container-lowest": "#ffffff",
                      "on-primary-container": "#d9d8ff",
                      "inverse-on-surface": "#eff1f3",
                      "surface-variant": "#e0e3e5",
                      "primary": "#3130c0",
                      "secondary": "#8127cf",
                      "on-tertiary-fixed": "#351000",
                      "tertiary": "#7e3000",
                      "inverse-primary": "#c0c1ff",
                      "primary-container": "#4b4dd8",
                      "surface-dim": "#d8dadc",
                      "surface-bright": "#f7f9fb",
                      "secondary-fixed-dim": "#ddb7ff",
                      "inverse-surface": "#2d3133",
                      "on-tertiary-container": "#ffd2be",
                      "on-background": "#191c1e",
                      "surface-tint": "#494bd6",
                      "tertiary-container": "#a44100",
                      "surface": "#f7f9fb",
                      "on-tertiary": "#ffffff",
                      "on-error-container": "#93000a",
                      "background": "#f7f9fb",
                      "error-container": "#ffdad6",
                      "on-secondary": "#ffffff",
                      "surface-container": "#eceef0",
                      "secondary-fixed": "#f0dbff",
                      "on-primary": "#ffffff"
              },
              "borderRadius": {
                      "DEFAULT": "0.125rem",
                      "lg": "0.25rem",
                      "xl": "0.5rem",
                      "full": "0.75rem"
              },
              "spacing": {},
              "fontFamily": {
                      "headline": [
                              "Plus Jakarta Sans"
                      ],
                      "body": [
                              "Inter"
                      ],
                      "label": [
                              "Inter"
                      ]
              }
      },
          },
        }
      </script>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-surface text-on-surface font-body antialiased selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen flex flex-col">
<!-- TopAppBar -->
<header class="bg-[#f7f9fb]/80 dark:bg-[#191c1e]/80 backdrop-blur-xl fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4">
<button class="text-[#4F46E5] dark:text-[#4F46E5] hover:opacity-70 transition-opacity active:scale-95 duration-200 focus:outline-none">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0;">menu</span>
</button>
<div class="font-headline font-bold tracking-tight text-xl text-[#191c1e] dark:text-[#f7f9fb]">
            Luminous
        </div>
<button class="text-[#4F46E5] dark:text-[#4F46E5] hover:opacity-70 transition-opacity active:scale-95 duration-200 focus:outline-none relative">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0;">shopping_bag</span>
<span class="absolute -top-1 -right-1 bg-secondary text-on-secondary text-[10px] font-label font-medium h-4 w-4 rounded-full flex items-center justify-center">2</span>
</button>
</header>
<div class="bg-[#eceef0] dark:bg-[#2c2e30] h-[1px] w-full fixed top-[68px] z-50"></div>
<main class="flex-grow pt-24 pb-32 px-4 flex flex-col gap-8">
<!-- Header Section -->
<section class="flex flex-col gap-2">
<h1 class="font-headline text-[1.75rem] leading-tight font-bold text-on-surface">Explore the Collection</h1>
<p class="font-body text-base text-on-surface-variant">Discover premium digital assets curated for modern creators.</p>
</section>
<!-- Search & Filter -->
<section class="flex flex-col gap-4">
<div class="relative w-full">
<span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/70">search</span>
<input class="w-full bg-surface-container-low text-on-surface font-body text-base rounded-full py-3 pl-12 pr-4 border-none focus:ring-2 focus:ring-primary shadow-[0_4px_40px_rgba(25,28,30,0.02)] placeholder:text-on-surface-variant/50 transition-all" placeholder="Search templates, UI kits..." type="text"/>
</div>
<!-- Chips -->
<div class="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 snap-x hide-scrollbar" style="scrollbar-width: none; -ms-overflow-style: none;">
<button class="snap-start shrink-0 bg-primary text-on-primary font-label text-sm font-medium px-5 py-2 rounded-full whitespace-nowrap shadow-[0_4px_20px_rgba(49,48,192,0.15)]">All Products</button>
<button class="snap-start shrink-0 bg-surface-container-highest text-on-surface font-label text-sm font-medium px-5 py-2 rounded-full whitespace-nowrap hover:bg-surface-dim transition-colors">UI Kits</button>
<button class="snap-start shrink-0 bg-surface-container-highest text-on-surface font-label text-sm font-medium px-5 py-2 rounded-full whitespace-nowrap hover:bg-surface-dim transition-colors">Framer Templates</button>
<button class="snap-start shrink-0 bg-surface-container-highest text-on-surface font-label text-sm font-medium px-5 py-2 rounded-full whitespace-nowrap hover:bg-surface-dim transition-colors">Mockups</button>
<button class="snap-start shrink-0 bg-surface-container-highest text-on-surface font-label text-sm font-medium px-5 py-2 rounded-full whitespace-nowrap hover:bg-surface-dim transition-colors">Icons</button>
</div>
<style>
                .hide-scrollbar::-webkit-scrollbar { display: none; }
            </style>
</section>
<!-- Product Grid (Single Column for Mobile) -->
<section class="flex flex-col gap-6">
<!-- Product Card 1 -->
<article class="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_8px_40px_rgba(25,28,30,0.04)] flex flex-col group relative">
<div class="absolute top-4 left-4 z-10">
<span class="bg-secondary text-on-secondary font-label text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">New</span>
</div>
<button class="absolute top-4 right-4 z-10 w-8 h-8 bg-surface/80 backdrop-blur-md rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 0;">bookmark</span>
</button>
<div class="h-48 w-full bg-surface-container-low relative overflow-hidden">
<img alt="Product thumbnail" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" data-alt="clean minimal digital interface design shown on floating generic smartphone screens against a soft lavender gradient background studio lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxF9MfwEtqFUCRkK52ykPQtUTKBxQsNH4myTjyzVxs6HsBRrsj4uiU4ModfgyUaJUk-psyWeZDpM30wJuriy7OAOxHZqJtK1pyUA8bevntoep-YLPLunEm5Y-n2JLMpK1YEXSzomYyMci7tgdlyYSFOSWWsA43JPHJWAzM9P1yIFrDIBSxMxQS0j9RhoGd5VjabekpcAAerWetGtDpRcPXOQL7qb2jmasUTGSSH7b8jVtFkiyDQOlHDnM_b3ctFV-k0D8NXerDnca9"/>
</div>
<div class="p-5 flex flex-col gap-4">
<div class="flex justify-between items-start gap-2">
<div>
<h3 class="font-headline text-lg font-bold text-on-surface mb-1">Aura UI Kit</h3>
<p class="font-label text-sm text-on-surface-variant">Design System for Figma</p>
</div>
<div class="text-right">
<span class="font-headline text-lg font-bold text-on-surface">$49</span>
</div>
</div>
<button class="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-body font-medium py-3 rounded-full hover:opacity-90 transition-opacity active:scale-[0.98] shadow-[0_8px_24px_rgba(49,48,192,0.2)]">Buy Now</button>
</div>
</article>
<!-- Product Card 2 -->
<article class="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_8px_40px_rgba(25,28,30,0.04)] flex flex-col group relative">
<div class="absolute top-4 left-4 z-10">
<span class="bg-surface-container-highest text-on-surface font-label text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">Best Seller</span>
</div>
<button class="absolute top-4 right-4 z-10 w-8 h-8 bg-surface/80 backdrop-blur-md rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 0;">bookmark</span>
</button>
<div class="h-48 w-full bg-surface-container-low relative overflow-hidden">
<img alt="Product thumbnail" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" data-alt="sleek modern laptop partially open showing clean code editor on screen placed on white marble desk next to small potted succulent" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaZIf7Wa27cxX8SSt7pn9VSU7qy_vPfr5oUE0SLe2X51f-gbg_-QGLIw-B_u-hTI2XWXGw9NBIuu7-7KVuahwbsMIoN1tTTMawnR3cNieth8buo-Rll28aX3dOrABO6A3JY1CGoqlsTPpDh4LHQYjQQjf32iUlYueR0XSzHOH27rJ1HPkBXIXWty5P1jIL2qLArB-4ABrHh7k5D4zKbRqmRmCiNh3ybN6X9dCm_n6QjM5EqGAYbxOwpvzB4FyETRhgteC1pOSzbY_l"/>
</div>
<div class="p-5 flex flex-col gap-4">
<div class="flex justify-between items-start gap-2">
<div>
<h3 class="font-headline text-lg font-bold text-on-surface mb-1">Nexus Portfolio</h3>
<p class="font-label text-sm text-on-surface-variant">Framer Template</p>
</div>
<div class="text-right">
<span class="font-headline text-lg font-bold text-on-surface">$69</span>
</div>
</div>
<button class="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-body font-medium py-3 rounded-full hover:opacity-90 transition-opacity active:scale-[0.98] shadow-[0_8px_24px_rgba(49,48,192,0.2)]">Buy Now</button>
</div>
</article>
<!-- Product Card 3 -->
<article class="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_8px_40px_rgba(25,28,30,0.04)] flex flex-col group relative">
<button class="absolute top-4 right-4 z-10 w-8 h-8 bg-surface/80 backdrop-blur-md rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 0;">bookmark</span>
</button>
<div class="h-48 w-full bg-surface-container-low relative overflow-hidden">
<img alt="Product thumbnail" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" data-alt="abstract geometric 3d shapes floating in space soft lighting pastel colors blue and purple hues high quality render minimal" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCn_bhbBY-NzdmM2-sk_WznOJ3GRY5vPIyFTSgHppOIr5UIDYZLql1gWvyMehk5G1dvmoEBhOxALGW4IN-gYSmw_OF2HGZfEcsmZUajmvlwwpNCPotGxYX8imU6bkTLcZyFixgP2x5QEMYeEdeXKlkLrXUgY2qd-gMpkF-UHFjfMoWtld-CINbWmtvpfA8J7IWjbA8MxNWiyTUiHRgvpYAcI6yOyXd42arFYFBT7st46KQghR3xZdjUefX4mRjIIfGNw7njCG-aNsQ"/>
</div>
<div class="p-5 flex flex-col gap-4">
<div class="flex justify-between items-start gap-2">
<div>
<h3 class="font-headline text-lg font-bold text-on-surface mb-1">Lumina Icons</h3>
<p class="font-label text-sm text-on-surface-variant">500+ Vector Assets</p>
</div>
<div class="text-right">
<span class="font-headline text-lg font-bold text-on-surface">$29</span>
</div>
</div>
<button class="w-full bg-surface-container-highest text-on-surface font-body font-medium py-3 rounded-full hover:bg-surface-dim transition-colors active:scale-[0.98]">View Details</button>
</div>
</article>
</section>
</main>
<!-- BottomNavBar -->
<nav class="fixed bottom-0 w-full z-50 rounded-t-3xl bg-[#ffffff]/90 dark:bg-[#191c1e]/90 backdrop-blur-2xl shadow-[0_-4px_40px_rgba(25,28,30,0.04)] fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pt-3 pb-8 md:hidden">
<!-- Active Tab: Categories -->
<a class="flex flex-col items-center justify-center bg-[#f0dbff] dark:bg-[#2c0051] text-[#2c0051] dark:text-[#f0dbff] rounded-full px-4 py-1 tap-highlight-transparent scale-90 active:scale-100 transition-transform" href="#">
<span class="material-symbols-outlined mb-1" style="font-variation-settings: 'FILL' 1;">grid_view</span>
<span class="font-['Inter'] text-[10px] font-medium tracking-wide uppercase">Categories</span>
</a>
<!-- Inactive Tabs -->
<a class="flex flex-col items-center justify-center text-[#191c1e] dark:text-[#f7f9fb] opacity-60 hover:bg-[#eceef0] dark:hover:bg-[#2c2e30] rounded-full px-4 py-1 tap-highlight-transparent scale-90 active:scale-100 transition-transform" href="#">
<span class="material-symbols-outlined mb-1" style="font-variation-settings: 'FILL' 0;">explore</span>
<span class="font-['Inter'] text-[10px] font-medium tracking-wide uppercase">Explore</span>
</a>
<a class="flex flex-col items-center justify-center text-[#191c1e] dark:text-[#f7f9fb] opacity-60 hover:bg-[#eceef0] dark:hover:bg-[#2c2e30] rounded-full px-4 py-1 tap-highlight-transparent scale-90 active:scale-100 transition-transform" href="#">
<span class="material-symbols-outlined mb-1" style="font-variation-settings: 'FILL' 0;">bookmark</span>
<span class="font-['Inter'] text-[10px] font-medium tracking-wide uppercase">Saved</span>
</a>
<a class="flex flex-col items-center justify-center text-[#191c1e] dark:text-[#f7f9fb] opacity-60 hover:bg-[#eceef0] dark:hover:bg-[#2c2e30] rounded-full px-4 py-1 tap-highlight-transparent scale-90 active:scale-100 transition-transform" href="#">
<span class="material-symbols-outlined mb-1" style="font-variation-settings: 'FILL' 0;">person</span>
<span class="font-['Inter'] text-[10px] font-medium tracking-wide uppercase">Account</span>
</a>
</nav>
</body></html>