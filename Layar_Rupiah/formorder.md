<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Checkout - Luminous Marketplace</title>
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
                        "headline": ["Plus Jakarta Sans", "sans-serif"],
                        "body": ["Inter", "sans-serif"],
                        "label": ["Inter", "sans-serif"]
                    }
                }
            }
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .btn-gradient {
            background: linear-gradient(135deg, #3130c0, #4b4dd8);
        }
        .input-glow:focus {
            box-shadow: 0 0 0 2px #3130c0;
        }
    </style>
</head>
<body class="bg-surface text-on-surface font-body antialiased min-h-screen">
<!-- TopNavBar (Suppressed due to checkout transactional nature, but keeping brand header for trust) -->
<header class="w-full py-6 px-8 flex justify-between items-center bg-surface-container-low max-w-[1440px] mx-auto">
<a class="text-xl font-bold tracking-tighter text-on-surface font-headline" href="#">Luminous</a>
<a class="text-primary text-sm font-medium hover:opacity-80 transition-opacity" href="#">Cancel Return</a>
</header>
<main class="max-w-[1200px] mx-auto px-4 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
<!-- Left Column: Checkout Details -->
<section class="lg:col-span-7 space-y-12">
<div class="space-y-4">
<h1 class="font-headline text-3xl font-bold tracking-tight text-on-surface">Complete your order</h1>
<p class="text-on-surface-variant text-body-lg">Please review your details and select a payment method.</p>
</div>
<!-- Customer Details Form -->
<form class="space-y-8">
<div class="space-y-6">
<h2 class="font-headline text-xl font-semibold text-on-surface">Customer Details</h2>
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
<div class="space-y-2">
<label class="font-label text-xs tracking-wide text-on-surface-variant block uppercase" for="firstName">First Name</label>
<input class="w-full bg-surface-container-low border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-0 input-glow transition-shadow" id="firstName" placeholder="Jane" type="text"/>
</div>
<div class="space-y-2">
<label class="font-label text-xs tracking-wide text-on-surface-variant block uppercase" for="lastName">Last Name</label>
<input class="w-full bg-surface-container-low border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-0 input-glow transition-shadow" id="lastName" placeholder="Doe" type="text"/>
</div>
</div>
<div class="space-y-2">
<label class="font-label text-xs tracking-wide text-on-surface-variant block uppercase" for="email">Email Address</label>
<input class="w-full bg-surface-container-low border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-0 input-glow transition-shadow" id="email" placeholder="jane.doe@example.com" type="email"/>
<p class="font-label text-xs text-on-surface-variant opacity-70">Your digital product will be sent here.</p>
</div>
</div>
<!-- Payment Method -->
<div class="space-y-6 pt-6 border-t border-outline-variant/15">
<h2 class="font-headline text-xl font-semibold text-on-surface">Payment Method</h2>
<div class="space-y-4">
<!-- Option 1 -->
<label class="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl cursor-pointer hover:bg-surface-dim transition-colors group relative overflow-hidden">
<div class="flex items-center gap-4 relative z-10">
<input checked="" class="w-5 h-5 text-primary bg-surface-container-low border-0 focus:ring-0" name="payment" type="radio"/>
<span class="font-body text-base font-medium text-on-surface">Credit Card</span>
</div>
<div class="flex gap-2 relative z-10">
<span class="material-symbols-outlined text-on-surface-variant" data-icon="credit_card">credit_card</span>
</div>
</label>
<!-- Card Details (Visible when Option 1 is selected) -->
<div class="p-6 bg-surface-container-low rounded-xl space-y-6">
<div class="space-y-2">
<label class="font-label text-xs tracking-wide text-on-surface-variant block uppercase" for="cardNumber">Card Number</label>
<div class="relative">
<span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" data-icon="credit_card">credit_card</span>
<input class="w-full bg-surface-container-lowest border-0 rounded-lg pl-12 pr-4 py-3 text-on-surface focus:ring-0 input-glow transition-shadow" id="cardNumber" placeholder="0000 0000 0000 0000" type="text"/>
</div>
</div>
<div class="grid grid-cols-2 gap-6">
<div class="space-y-2">
<label class="font-label text-xs tracking-wide text-on-surface-variant block uppercase" for="expiry">Expiry Date</label>
<input class="w-full bg-surface-container-lowest border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-0 input-glow transition-shadow" id="expiry" placeholder="MM/YY" type="text"/>
</div>
<div class="space-y-2">
<label class="font-label text-xs tracking-wide text-on-surface-variant block uppercase" for="cvv">CVC</label>
<input class="w-full bg-surface-container-lowest border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-0 input-glow transition-shadow" id="cvv" placeholder="123" type="text"/>
</div>
</div>
</div>
<!-- Option 2 -->
<label class="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl cursor-pointer hover:bg-surface-dim transition-colors">
<div class="flex items-center gap-4">
<input class="w-5 h-5 text-primary bg-surface-container-low border-0 focus:ring-0" name="payment" type="radio"/>
<span class="font-body text-base font-medium text-on-surface">PayPal</span>
</div>
<span class="font-body text-sm text-on-surface-variant font-medium">Redirects to PayPal</span>
</label>
</div>
</div>
</form>
</section>
<!-- Right Column: Order Summary -->
<aside class="lg:col-span-5">
<div class="bg-surface-container-lowest rounded-2xl p-8 sticky top-8 shadow-[0_20px_40px_-15px_rgba(25,28,30,0.05)]">
<h2 class="font-headline text-xl font-semibold text-on-surface mb-8">Order Summary</h2>
<!-- Product Item -->
<div class="flex gap-6 mb-8">
<div class="w-24 h-24 rounded-xl overflow-hidden bg-surface-container-low flex-shrink-0">
<img alt="Abstract 3D digital art gradient" class="w-full h-full object-cover" data-alt="vibrant abstract 3d digital art featuring soft gradients of electric blue and bright purple" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOiep31IJvHllHahwVxSs-GmTWdhtNeY5q1ob09FGkAMpdIyH-PR4WDMx9P83vFC3fVDaz3pSUt5l0W034-t3L7mW4LpAabsWFw6nuTRlcNseA2wJ1uSIiqPzTycP0tC_Ixfr6qVNX0H6lD53GBF6ghCP858mxm2JcH3XDMTKgdkgcrwt77cAECTvec7x8kjGlvz1-cu5IVt3muAW5f55bTaH3SmIMfksKM00N-5_2ijKlbAVutjSQARPPEUZ1f0lSH54xpvmEYvzC"/>
</div>
<div class="flex flex-col justify-between py-1">
<div>
<span class="inline-block px-3 py-1 bg-secondary-fixed text-on-secondary-fixed rounded-full font-label text-xs font-bold mb-2 tracking-wide uppercase">Software</span>
<h3 class="font-headline text-lg font-semibold text-on-surface leading-tight">Luminous UI Kit Pro</h3>
<p class="font-body text-sm text-on-surface-variant mt-1">Lifetime Access License</p>
</div>
<p class="font-headline font-bold text-on-surface">$149.00</p>
</div>
</div>
<!-- Totals -->
<div class="space-y-4 py-6 border-t border-outline-variant/15 border-b border-outline-variant/15 mb-8">
<div class="flex justify-between items-center">
<span class="font-body text-on-surface-variant">Subtotal</span>
<span class="font-body font-medium text-on-surface">$149.00</span>
</div>
<div class="flex justify-between items-center">
<span class="font-body text-on-surface-variant">Tax (Calculated at next step)</span>
<span class="font-body font-medium text-on-surface">$0.00</span>
</div>
<div class="flex justify-between items-center pt-2">
<span class="font-headline font-bold text-lg text-on-surface">Total</span>
<span class="font-headline font-bold text-2xl text-primary">$149.00</span>
</div>
</div>
<!-- Checkout Button -->
<button class="w-full btn-gradient text-on-primary font-headline font-bold text-lg rounded-full py-4 px-8 hover:opacity-90 transition-opacity flex items-center justify-center gap-2" type="button">
<span class="material-symbols-outlined" data-icon="lock" data-weight="fill" style="font-variation-settings: 'FILL' 1;">lock</span>
                    Pay $149.00
                </button>
<p class="text-center font-label text-xs text-on-surface-variant mt-4 opacity-70">Secured via Stripe. Instant delivery upon successful payment.</p>
</div>
</aside>
</main>
<!-- Footer (Suppressed for transactional focus, keeping minimalist copyright) -->
<footer class="w-full py-8 text-center text-on-surface-variant/50 font-label text-xs uppercase tracking-widest mt-12">
        © 2024 Luminous Marketplace. Secure Checkout.
    </footer>
</body></html>