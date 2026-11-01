<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Order Success - Luminous Marketplace</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
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
                    "fontFamily": {
                        "headline": ["Plus Jakarta Sans"],
                        "body": ["Inter"],
                        "label": ["Inter"]
                    }
                }
            }
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-surface text-on-surface font-body min-h-screen flex flex-col pt-[72px]">
<!-- TopAppBar (Transactional - Hidden on Desktop typically, but keeping mobile header simple) -->
<header class="fixed top-0 w-full z-50 bg-[#f7f9fb]/80 backdrop-blur-xl flex justify-between items-center px-6 py-4 w-full border-b border-surface-container-low md:hidden">
<div class="flex items-center gap-4">
<span class="text-xl font-black text-[#191c1e] tracking-tighter font-headline">Luminous</span>
</div>
</header>
<main class="flex-grow flex flex-col items-center px-6 py-12 md:py-24 max-w-md mx-auto w-full">
<!-- Success Animation / Icon Area -->
<div class="mb-8 flex flex-col items-center text-center">
<div class="w-24 h-24 rounded-full bg-secondary-fixed flex items-center justify-center mb-6 shadow-[0_8px_40px_rgba(49,48,192,0.1)]">
<span class="material-symbols-outlined text-on-secondary-fixed-variant text-5xl" data-weight="fill" style="font-variation-settings: 'FILL' 1;">check_circle</span>
</div>
<h1 class="font-headline text-3xl font-bold tracking-tight text-on-surface mb-3">Order Confirmed</h1>
<p class="font-body text-on-surface-variant text-base">Your digital products are ready. A receipt has been sent to your email.</p>
</div>
<!-- Order Details Card -->
<div class="w-full bg-surface-container-lowest rounded-xl p-6 mb-8 shadow-[0_4px_40px_rgba(25,28,30,0.04)]">
<h2 class="font-headline text-lg font-semibold mb-4 border-b border-surface-container-low pb-3">Order Summary</h2>
<div class="flex flex-col gap-4 mb-6">
<!-- Item 1 -->
<div class="flex items-start gap-4">
<div class="w-16 h-16 rounded-lg bg-surface-container overflow-hidden shrink-0">
<img alt="Abstract 3D Render Toolkit" class="w-full h-full object-cover" data-alt="Abstract 3D geometric shapes in vibrant purple and blue colors on a clean white background, modern digital art style" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDX6jQVU2OF6E0L5bHNmUfcoXB4iAkPe9D__Da4pAxKklY_I4gw6ZrIzGSzmYTKZN4nVcZeef6F7IKFOO7q7choPFGTz8CfNFNY-kfRDehggecu4GfoI6xs5qTRRRR3ZcmCB9s_3GF3aTSMvbbR4scUmTAlmGJ0JyGskQe-k7iSAfks9KkMJ81LfGhkOy7MqHchUpO7Z7I1jAiY0t5zSFX_btLHm4n9moMgPA2YFMLucVa5EqIUms1x9KMWo87PiZNOZTYXREP1dwnA"/>
</div>
<div class="flex-grow">
<h3 class="font-headline text-sm font-semibold">Neon UI Kit Pro</h3>
<p class="font-label text-xs text-on-surface-variant mt-1">Design System</p>
</div>
<div class="text-right">
<span class="font-body text-sm font-medium">$49.00</span>
</div>
</div>
<!-- Item 2 -->
<div class="flex items-start gap-4">
<div class="w-16 h-16 rounded-lg bg-surface-container overflow-hidden shrink-0">
<img alt="Retro Synthwave Presets" class="w-full h-full object-cover" data-alt="Retro 80s synthwave style grid landscape with vibrant neon pink and purple sunset, digital aesthetic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKvc5sgk9v5B2kfL_fHarx-EzOyUUNSqNPiNQfSuocQ6XIje3E2F-438LiXTL-fh7hJfwGrNXVPr0j-zPF7PlhG4RetkuYBQMX-8emfudxVXYrtFUlvEnN_CsC5CwFxSh2t2NO215DCJfvSl1E234lceZ915lpzp5KyfJtcQQNCl8hkwmmpXeHZjwNmA9UIXSBVfL1oHmPSoFD24VfSk2oIB17NYIUMgGZG1Wraqej-58wfBgPj-2WDFtBMrQcRt0r7wjytQrXVJHq"/>
</div>
<div class="flex-grow">
<h3 class="font-headline text-sm font-semibold">Synthwave Presets</h3>
<p class="font-label text-xs text-on-surface-variant mt-1">Lightroom Pack</p>
</div>
<div class="text-right">
<span class="font-body text-sm font-medium">$24.00</span>
</div>
</div>
</div>
<!-- Totals -->
<div class="border-t border-surface-container-low pt-4 space-y-2">
<div class="flex justify-between font-body text-sm text-on-surface-variant">
<span>Subtotal</span>
<span>$73.00</span>
</div>
<div class="flex justify-between font-body text-sm text-on-surface-variant">
<span>Tax</span>
<span>$0.00</span>
</div>
<div class="flex justify-between font-headline text-base font-bold text-primary mt-2 pt-2 border-t border-surface-container-low">
<span>Total</span>
<span>$73.00</span>
</div>
</div>
</div>
<!-- Action Buttons -->
<div class="w-full flex flex-col gap-3">
<button class="w-full bg-gradient-to-br from-primary to-primary-container text-white font-headline font-semibold py-4 rounded-full shadow-[0_8px_20px_rgba(49,48,192,0.15)] flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all">
<span class="material-symbols-outlined text-[20px]">download</span>
                Access Your Products
            </button>
<button class="w-full bg-surface-container-highest text-on-surface font-headline font-medium py-4 rounded-full flex items-center justify-center gap-2 hover:bg-surface-dim active:scale-95 transition-all">
                Continue Shopping
            </button>
</div>
</main>
<!-- Footer - Simplified for Transactional Page -->
<footer class="w-full mt-auto flex flex-col items-center gap-4 py-8 px-6 bg-surface-container-low">
<span class="font-headline font-bold text-on-surface">Luminous</span>
<p class="font-label text-xs text-on-surface-variant">© 2024 Luminous Marketplace</p>
</footer>
</body></html>