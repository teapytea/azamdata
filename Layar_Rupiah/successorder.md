<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Order Success - Luminous Marketplace</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;family=Inter:wght@400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "primary-container": "#4b4dd8",
                        "on-primary-container": "#d9d8ff",
                        "surface-dim": "#d8dadc",
                        "error": "#ba1a1a",
                        "on-secondary-container": "#fffbff",
                        "on-tertiary-fixed-variant": "#7b2f00",
                        "on-primary-fixed-variant": "#2f2ebe",
                        "surface-container-highest": "#e0e3e5",
                        "secondary-fixed-dim": "#ddb7ff",
                        "inverse-on-surface": "#eff1f3",
                        "secondary-container": "#9c48ea",
                        "outline-variant": "#c7c4d8",
                        "secondary": "#8127cf",
                        "inverse-primary": "#c0c1ff",
                        "surface-container": "#eceef0",
                        "surface-container-lowest": "#ffffff",
                        "surface-tint": "#494bd6",
                        "surface-container-low": "#f2f4f6",
                        "surface-container-high": "#e6e8ea",
                        "on-tertiary-container": "#ffd2be",
                        "on-error": "#ffffff",
                        "error-container": "#ffdad6",
                        "primary-fixed-dim": "#c0c1ff",
                        "background": "#f7f9fb",
                        "on-background": "#191c1e",
                        "on-tertiary": "#ffffff",
                        "on-primary-fixed": "#07006c",
                        "surface": "#f7f9fb",
                        "tertiary": "#7e3000",
                        "tertiary-container": "#a44100",
                        "primary": "#3130c0",
                        "inverse-surface": "#2d3133",
                        "on-secondary-fixed": "#2c0051",
                        "tertiary-fixed-dim": "#ffb695",
                        "surface-bright": "#f7f9fb",
                        "on-secondary-fixed-variant": "#6900b3",
                        "tertiary-fixed": "#ffdbcc",
                        "on-primary": "#ffffff",
                        "outline": "#777587",
                        "on-surface": "#191c1e",
                        "on-error-container": "#93000a",
                        "primary-fixed": "#e1e0ff",
                        "surface-variant": "#e0e3e5",
                        "secondary-fixed": "#f0dbff",
                        "on-surface-variant": "#464555",
                        "on-secondary": "#ffffff",
                        "on-tertiary-fixed": "#351000"
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
</head>
<body class="bg-surface text-on-surface font-body min-h-screen flex flex-col antialiased">
<!-- TopNavBar (Suppressed due to Transactional/Success page intent) -->
<main class="flex-grow flex items-center justify-center p-6 md:p-12 lg:p-24">
<!-- Main Success Card Container -->
<div class="bg-surface-container-lowest rounded-xl p-8 md:p-16 max-w-3xl w-full flex flex-col items-center text-center shadow-[0_40px_80px_rgba(25,28,30,0.06)] relative overflow-hidden">
<!-- Decorative Luminous Accents behind content (Glassmorphism hint) -->
<div class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-xl z-0">
<div class="absolute -top-32 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
<div class="absolute -bottom-32 -right-32 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
</div>
<div class="relative z-10 w-full flex flex-col items-center">
<!-- Celebratory Icon -->
<div class="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center mb-8">
<span class="material-symbols-outlined text-5xl text-primary" data-icon="check_circle" data-weight="fill" style="font-variation-settings: 'FILL' 1;">check_circle</span>
</div>
<!-- Headline -->
<h1 class="font-headline text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-4">
                    Thank you for your purchase!
                </h1>
<!-- Order Number & Subtle Confirmation -->
<p class="font-body text-lg text-on-surface-variant mb-2">
                    Your digital goods are ready to download.
                </p>
<div class="inline-flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-lg mb-12">
<span class="font-label text-sm text-on-surface-variant tracking-wider uppercase">Order #</span>
<span class="font-headline font-semibold text-primary">LMN-8924-XYZ</span>
</div>
<!-- Order Summary Bento Box -->
<div class="w-full bg-surface-container-low rounded-xl p-6 md:p-8 text-left mb-12 border border-outline-variant/15">
<h3 class="font-headline text-xl font-semibold mb-6 pb-4 border-b border-surface-container-highest">Order Summary</h3>
<div class="flex flex-col gap-6">
<!-- Item 1 -->
<div class="flex items-start gap-4">
<div class="w-16 h-16 bg-surface-container-highest rounded-lg flex-shrink-0 bg-cover bg-center" data-alt="Abstract vibrant geometric shapes representing digital design assets" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDL_bnEVvnEqTHFZyZYoVCMOV9TcEs-s-3h26xP3TtfSZizwZxMGRDn2t6vZD693otMjKTqrWpQ6AVYikSnDJogXHX9SeTBATpnG1sD2LJrhgR-9Fu2PKysbMjgkQBrtuLM14ZwU4IBSsolOs8msUYtl6Yz2z1fYuHbniSnEeUnHb_1KyW3AMGNpvQvWJxwwKReKMw8dXJcv7s1xt-BmFGWC4K2A2gVfyXwY_prgufK271SmtFasqFQo7sO4OofnX01FOVkR35RK9Ng');"></div>
<div class="flex-grow">
<h4 class="font-headline font-semibold text-on-surface">Procreate Brush Masterclass Collection</h4>
<p class="font-body text-sm text-on-surface-variant mt-1">Digital Asset • .brushset</p>
</div>
<div class="font-body font-medium text-on-surface">
                                $49.00
                            </div>
</div>
<!-- Item 2 -->
<div class="flex items-start gap-4">
<div class="w-16 h-16 bg-surface-container-highest rounded-lg flex-shrink-0 bg-cover bg-center" data-alt="Clean minimal code editor on screen representing software product" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBWpqVKZl2Jq2gc0sEl3MijUQextOHmg1A4KIzbptsocF5mbKmdvWbV4vQPWbAgR2S23Ry8P5F69LcQL0CUBirrv-4JkVWkvWRwxyegEWE5s7xhEoxTZwmzhhzbTEgK8nHW_jIAIU04carBGLRRaK0HMuKFCgfyDkoo2kometMXfTVxXfQWwl-6nSyGVkscoS9gtxzHzX9itvWc_XPUzMT8zqB87USE0Q1uK0A5uoPx0X3cEImXpBvlZBDgEe-y7UbnEx6WUxLJy1C5');"></div>
<div class="flex-grow">
<h4 class="font-headline font-semibold text-on-surface">Luminous UI Kit - Framer Edition</h4>
<p class="font-body text-sm text-on-surface-variant mt-1">Software • Framer File</p>
</div>
<div class="font-body font-medium text-on-surface">
                                $129.00
                            </div>
</div>
</div>
<!-- Totals -->
<div class="mt-8 pt-6 border-t border-surface-container-highest flex flex-col gap-2">
<div class="flex justify-between font-body text-sm text-on-surface-variant">
<span>Subtotal</span>
<span>$178.00</span>
</div>
<div class="flex justify-between font-body text-sm text-on-surface-variant">
<span>Tax</span>
<span>$0.00</span>
</div>
<div class="flex justify-between font-headline font-bold text-lg text-on-surface mt-2 pt-2 border-t border-surface-container-highest/50">
<span>Total</span>
<span>$178.00</span>
</div>
</div>
</div>
<!-- Primary Action -->
<button class="bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-headline font-semibold py-4 px-12 rounded-full text-lg shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity flex items-center gap-2">
                    Access Your Products
                    <span class="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>
</button>
<a class="mt-6 font-body text-sm text-primary hover:text-primary-container transition-colors underline underline-offset-4" href="#">
                    Return to Store
                </a>
</div>
</div>
</main>
<!-- Footer -->
<footer class="w-full py-12 bg-[#eceef0] dark:bg-[#121416] flex flex-col items-center justify-center gap-6 px-8 border-t border-[#c7c4d8]/15">
<div class="text-lg font-black text-[#191c1e] dark:text-[#f7f9fb] font-headline tracking-tighter">
            Luminous
        </div>
<div class="flex flex-wrap justify-center gap-6 font-['Inter'] text-xs tracking-widest uppercase">
<a class="text-[#191c1e]/50 dark:text-[#f7f9fb]/50 hover:text-[#4F46E5] underline-offset-4 hover:underline transition-colors" href="#">Privacy</a>
<a class="text-[#191c1e]/50 dark:text-[#f7f9fb]/50 hover:text-[#4F46E5] underline-offset-4 hover:underline transition-colors" href="#">Terms</a>
<a class="text-[#191c1e]/50 dark:text-[#f7f9fb]/50 hover:text-[#4F46E5] underline-offset-4 hover:underline transition-colors" href="#">Refund Policy</a>
<a class="text-[#191c1e]/50 dark:text-[#f7f9fb]/50 hover:text-[#4F46E5] underline-offset-4 hover:underline transition-colors" href="#">Contact</a>
</div>
<div class="font-['Inter'] text-xs tracking-widest uppercase text-[#191c1e]/50 dark:text-[#f7f9fb]/50 mt-4 text-center">
            © 2024 Luminous Marketplace. The Digital Curator.
        </div>
</footer>
</body></html>