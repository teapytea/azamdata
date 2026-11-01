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
                },
            },
        }
    </script>
<style>
        body { font-family: 'Inter', sans-serif; }
        h1, h2, h3, h4, h5, h6 { font-family: 'Plus Jakarta Sans', sans-serif; }
        .glass-header { backdrop-filter: blur(24px); }
        .bg-gradient-primary { background: linear-gradient(135deg, #3130c0, #4b4dd8); }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-surface text-on-surface antialiased flex flex-col min-h-screen">
<!-- TopAppBar (Transactional - simplified, no nav) -->
<header class="fixed top-0 w-full z-50 bg-[#f7f9fb]/80 dark:bg-[#191c1e]/80 glass-header flex justify-between items-center px-6 py-4 w-full bg-[#eceef0] dark:bg-[#2c2e30] h-[1px] w-full flat no shadows">
<button class="text-on-surface hover:opacity-70 transition-opacity active:scale-95 duration-200" type="button">
<span class="material-symbols-outlined" data-icon="close">close</span>
</button>
<div class="font-['Plus_Jakarta_Sans'] font-bold tracking-tight text-xl font-black text-[#191c1e] dark:text-[#f7f9fb] tracking-tighter">
            Luminous
        </div>
<div class="w-6"></div> <!-- Spacer for centering -->
</header>
<!-- Main Content -->
<main class="flex-grow pt-20 pb-32 px-4 flex flex-col gap-8 md:hidden"> <!-- Mobile only view as requested -->
<!-- Order Summary Glass Card -->
<section class="bg-surface-container-lowest rounded-xl p-6 shadow-[0_8px_40px_rgba(25,28,30,0.06)] flex flex-col gap-6 relative overflow-hidden">
<!-- Decorative Gradient Orb -->
<div class="absolute -top-10 -right-10 w-32 h-32 bg-secondary-fixed-dim rounded-full mix-blend-multiply filter blur-2xl opacity-50 pointer-events-none"></div>
<h2 class="font-headline text-headline-md font-semibold text-on-surface tracking-tight">Order Summary</h2>
<!-- Item List -->
<div class="flex flex-col gap-4">
<!-- Item 1 -->
<div class="flex items-center gap-4">
<div class="w-16 h-16 rounded-lg bg-surface-container-low overflow-hidden flex-shrink-0">
<img alt="Abstract 3D digital art piece with soft pastel colors" class="w-full h-full object-cover" data-alt="abstract 3d digital art piece with soft pastel colors flowing shapes high quality render" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2u_O0w5kSeUzJOpS_ViR8HMqbmJxujOIpuAf2LSlHtb5Hadx4x5qymk7TlSaiv_HEBu7mV1Qb4Grnp_KuB-13gKhUiTGxUyjzkaD_QCvhOdjllOe1OIE_6VUmIpMAktWzyJ22Jf5qQod0F1QQGSO1ow2fMngqjgv7or4Gb17m96HZT5qGsDL7Oihqp4q0QBa9_4aApWvznkVM-FB9UFdvy_jQ7q2-NM7bmlad_C5SzI3kYd_Tr0libSagUmSPLPG_w20oZkeWigaZ"/>
</div>
<div class="flex-grow flex flex-col justify-between">
<span class="font-body text-body-lg font-medium text-on-surface">Ethereal UI Kit Pro</span>
<span class="font-label text-label-md text-on-surface-variant mt-1 tracking-wider uppercase">License: Standard</span>
</div>
<span class="font-body text-body-lg font-semibold text-on-surface">$129</span>
</div>
</div>
<!-- Divider -->
<div class="h-[1px] w-full bg-surface-container-high rounded-full my-2"></div>
<!-- Totals -->
<div class="flex flex-col gap-2">
<div class="flex justify-between items-center text-on-surface-variant font-body text-body-md">
<span>Subtotal</span>
<span>$129.00</span>
</div>
<div class="flex justify-between items-center text-on-surface-variant font-body text-body-md">
<span>Tax (VAT)</span>
<span>$0.00</span>
</div>
<div class="flex justify-between items-center mt-2 pt-2 text-on-surface font-headline text-headline-sm font-bold">
<span>Total</span>
<span>$129.00</span>
</div>
</div>
</section>
<!-- Customer Details Form -->
<section class="flex flex-col gap-6">
<h2 class="font-headline text-title-lg font-semibold text-on-surface tracking-tight px-2">Customer Details</h2>
<form class="flex flex-col gap-4">
<!-- Email Input -->
<div class="flex flex-col gap-1.5">
<label class="font-label text-label-md text-on-surface-variant px-2 uppercase tracking-wide" for="email">Email Address</label>
<input class="w-full bg-surface-container-lowest text-body-lg text-on-surface rounded-lg px-4 py-3 border-0 shadow-sm outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-on-surface-variant/50" id="email" name="email" placeholder="you@example.com" type="email"/>
</div>
<!-- Payment Method Section (Visual only) -->
<div class="flex flex-col gap-3 mt-4">
<label class="font-label text-label-md text-on-surface-variant px-2 uppercase tracking-wide">Payment Method</label>
<div class="grid grid-cols-2 gap-3">
<!-- Option 1: Card -->
<div class="bg-surface-container-lowest border border-primary/20 rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(49,48,192,0.08)]">
<span class="material-symbols-outlined text-primary text-2xl" data-icon="credit_card">credit_card</span>
<span class="font-body text-label-md font-medium text-primary">Card</span>
</div>
<!-- Option 2: Wallet -->
<div class="bg-surface-container-low border border-transparent rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-surface-container-lowest transition-colors">
<span class="material-symbols-outlined text-on-surface-variant text-2xl" data-icon="account_balance_wallet">account_balance_wallet</span>
<span class="font-body text-label-md font-medium text-on-surface-variant">Wallet</span>
</div>
</div>
</div>
<!-- Card Details Input -->
<div class="flex flex-col gap-1.5 mt-2">
<label class="font-label text-label-md text-on-surface-variant px-2 uppercase tracking-wide" for="card">Card Information</label>
<div class="flex flex-col bg-surface-container-lowest rounded-lg shadow-sm overflow-hidden">
<input class="w-full bg-transparent text-body-lg text-on-surface px-4 py-3 border-0 outline-none focus:ring-2 focus:ring-primary focus:z-10 relative transition-all placeholder:text-on-surface-variant/50" id="card" name="card" placeholder="Card number" type="text"/>
<div class="h-[1px] w-full bg-surface-container-high"></div>
<div class="flex">
<input class="w-1/2 bg-transparent text-body-lg text-on-surface px-4 py-3 border-0 outline-none focus:ring-2 focus:ring-primary focus:z-10 relative transition-all placeholder:text-on-surface-variant/50 border-r border-surface-container-high" placeholder="MM / YY" type="text"/>
<input class="w-1/2 bg-transparent text-body-lg text-on-surface px-4 py-3 border-0 outline-none focus:ring-2 focus:ring-primary focus:z-10 relative transition-all placeholder:text-on-surface-variant/50" placeholder="CVC" type="text"/>
</div>
</div>
</div>
<!-- Name on Card -->
<div class="flex flex-col gap-1.5 mt-2">
<label class="font-label text-label-md text-on-surface-variant px-2 uppercase tracking-wide" for="name">Name on Card</label>
<input class="w-full bg-surface-container-lowest text-body-lg text-on-surface rounded-lg px-4 py-3 border-0 shadow-sm outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-on-surface-variant/50" id="name" name="name" placeholder="Name on Card" type="text"/>
</div>
</form>
</section>
</main>
<!-- Sticky Bottom Pay Button Action Area -->
<div class="fixed bottom-0 left-0 w-full bg-surface-container-lowest/90 glass-header p-4 pb-8 z-40 border-t border-surface-container-high md:hidden">
<button class="w-full bg-gradient-primary text-on-primary rounded-full py-4 font-headline text-body-lg font-bold shadow-[0_8px_30px_rgba(49,48,192,0.3)] hover:shadow-[0_12px_40px_rgba(49,48,192,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2" type="button">
<span class="material-symbols-outlined" data-icon="lock">lock</span>
            Pay $129.00
        </button>
</div>
</body></html>