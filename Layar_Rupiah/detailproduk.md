<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Luminous UI Kit Pro - Luminous Marketplace</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Plus+Jakarta+Sans:wght@500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "background": "#f7f9fb",
                        "on-secondary-container": "#fffbff",
                        "error-container": "#ffdad6",
                        "surface-tint": "#494bd6",
                        "on-secondary-fixed": "#2c0051",
                        "tertiary-fixed-dim": "#ffb695",
                        "on-surface-variant": "#464555",
                        "on-primary-fixed-variant": "#2f2ebe",
                        "secondary-fixed-dim": "#ddb7ff",
                        "primary-container": "#4b4dd8",
                        "on-primary-container": "#d9d8ff",
                        "outline": "#777587",
                        "on-background": "#191c1e",
                        "error": "#ba1a1a",
                        "tertiary": "#7e3000",
                        "outline-variant": "#c7c4d8",
                        "on-secondary": "#ffffff",
                        "inverse-on-surface": "#eff1f3",
                        "surface-container-high": "#e6e8ea",
                        "on-surface": "#191c1e",
                        "primary-fixed": "#e1e0ff",
                        "on-tertiary-fixed-variant": "#7b2f00",
                        "on-tertiary-fixed": "#351000",
                        "on-tertiary": "#ffffff",
                        "inverse-primary": "#c0c1ff",
                        "on-tertiary-container": "#ffd2be",
                        "on-error": "#ffffff",
                        "surface": "#f7f9fb",
                        "secondary-fixed": "#f0dbff",
                        "on-error-container": "#93000a",
                        "surface-dim": "#d8dadc",
                        "tertiary-fixed": "#ffdbcc",
                        "primary": "#3130c0",
                        "surface-container-highest": "#e0e3e5",
                        "secondary": "#8127cf",
                        "primary-fixed-dim": "#c0c1ff",
                        "surface-container": "#eceef0",
                        "surface-variant": "#e0e3e5",
                        "surface-bright": "#f7f9fb",
                        "surface-container-lowest": "#ffffff",
                        "inverse-surface": "#2d3133",
                        "secondary-container": "#9c48ea",
                        "tertiary-container": "#a44100",
                        "surface-container-low": "#f2f4f6",
                        "on-primary-fixed": "#07006c",
                        "on-secondary-fixed-variant": "#6900b3",
                        "on-primary": "#ffffff"
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
        .glass-nav { background: rgba(247, 249, 251, 0.8); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
        .gradient-text { background: linear-gradient(135deg, #3130c0, #4b4dd8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .gradient-bg { background: linear-gradient(135deg, #3130c0, #4b4dd8); }
        .ambient-shadow { box-shadow: 0 20px 40px -10px rgba(25, 28, 30, 0.06); }
    </style>
</head>
<body class="bg-surface text-on-surface font-body antialiased min-h-screen flex flex-col">
<!-- TopNavBar -->
<header class="glass-nav fixed top-0 w-full z-50 transition-all duration-300">
<div class="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto no-border">
<!-- Logo -->
<a class="text-xl font-headline font-bold tracking-tighter text-on-surface flex items-center gap-2" href="#">
<span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">widgets</span>
                Luminous Marketplace
            </a>
<!-- Navigation Links -->
<nav class="hidden md:flex gap-8">
<a class="text-on-surface opacity-70 hover:opacity-100 transition-opacity duration-200 font-body text-sm font-medium tracking-tight" href="#">Marketplace</a>
<a class="text-on-surface opacity-70 hover:opacity-100 transition-opacity duration-200 font-body text-sm font-medium tracking-tight" href="#">Templates</a>
<a class="text-primary font-semibold border-b-2 border-primary pb-1 font-body text-sm tracking-tight" href="#">Software</a>
<a class="text-on-surface opacity-70 hover:opacity-100 transition-opacity duration-200 font-body text-sm font-medium tracking-tight" href="#">Assets</a>
</nav>
<!-- Actions -->
<div class="flex items-center gap-6">
<button class="text-on-surface opacity-70 hover:opacity-100 transition-opacity duration-200 scale-95 hover:scale-100 ease-in-out">
<span class="material-symbols-outlined">shopping_cart</span>
</button>
<a class="font-body text-sm font-medium tracking-tight text-primary hover:opacity-80 transition-opacity" href="#">Sign In</a>
</div>
</div>
</header>
<!-- Main Content -->
<main class="flex-grow pt-28 pb-24 px-4 md:px-8 max-w-7xl mx-auto w-full">
<!-- Product Header & Hero Section -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-24">
<!-- Left: Imagery Gallery (Bento-ish) -->
<div class="lg:col-span-7 flex flex-col gap-4">
<div class="rounded-xl overflow-hidden bg-surface-container-lowest ambient-shadow aspect-[4/3] group relative cursor-pointer">
<img alt="Luminous UI Kit Pro Preview" class="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500 ease-out" data-alt="sleek modern digital interface design kit preview on a bright soft background with floating abstract UI components" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAf6FE83eywRNFbfKNIOpSKuJmBUpwmSFaewLXkotC6mFONf5jXjRDEkUpTOhyMyxq2mmki8_vgqxcgXlsYDdb6GTMkUdnyAP5jCpSZZ8oq03S3iJhliN0QLE5LIW0Non8zW-hMPX-IFkwLVobaspgopVIJkS8Zv9KkuXJdMXTbBq6vJ74rkm512zCTaxG2EIAiebA8yODJUc0NSAUjusWzB9VFCrX2kVepJ7nZ19PUFjsFddZO6DrOyxkD9nSnOA967FteEXiI4IaE"/>
<div class="absolute inset-0 bg-surface/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
<span class="material-symbols-outlined text-on-secondary text-4xl bg-primary/80 p-4 rounded-full backdrop-blur-sm">zoom_in</span>
</div>
</div>
<div class="grid grid-cols-3 gap-4">
<div class="rounded-lg overflow-hidden bg-surface-container-low aspect-video cursor-pointer hover:opacity-80 transition-opacity">
<img alt="UI Components" class="w-full h-full object-cover" data-alt="close up of diverse UI components like buttons cards and input fields in light mode" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDeSXdAqC6CD1tE38MBg1GNsKz657t8TBlAFkWvVD7a7YTo8JdhVvS7oB5ZBijzh-NbAZwus1OCoFeOYkIWu6czOV12kTV7dtflClmp1HhT-f5Qr1-Ot3_YGtBX573CQ9xWDO_UXMQzpDiJFdSjKhTJnepuQpmp4xZE2fLsLtPADIWD2pzBEDTKZxFfo3FyCOjzkFN4Geae9JVOSLFff-MQelyUYQfsz9bRr3LE6HSz03ZfAp44jESz2iD8pviiqhJmdeH47SoP1Mbq"/>
</div>
<div class="rounded-lg overflow-hidden bg-surface-container-low aspect-video cursor-pointer hover:opacity-80 transition-opacity">
<img alt="Dark Mode Preview" class="w-full h-full object-cover" data-alt="dark mode version of modern sleek digital interface design components" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAT2RhIE0WQ28K6yCHVvtSEkFwZQKh0PtjEnnAeaKZvbHKYGMK76q7kPOIX0Bh6UkS3eVBNuILbREyiTI6UOsoC2Bw7sDzWwEDuFODRGRDfMGow_xlzipppM7i4pLhazsDLA0Zyu-4AbQGfxWOp5oymY7eZNw-QuTsRyf9LJ4TrEgvPUU9iuKQFRqMuTmWKFUj43x7KhbuXApf9tQigmom5pXxJBycYpEryVvHJSNTY3KlqFFRr1Y4QFn4xhV04ef-ValW6B96RnUzO"/>
</div>
<div class="rounded-lg overflow-hidden bg-surface-container-low aspect-video cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center relative">
<img alt="Styleguide Preview" class="w-full h-full object-cover opacity-50" data-alt="typography and color palette styleguide layout clean minimal white background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEJ2gE6lXHNnD6ZdBsDq0p2vG3JV_AZjaRw0vvZyKyxHsnuuuRTeE7bDDz87OAEy38gbov1Ozi-UiA5lycUtk6ucSQkt3_C0RUH-b6rOwY8_uinX-PqapE0J4yEYsYpXlcIwr3AGk85flXQejoqNQ3AgnDnF88ztopFcmZXxYjWcMpv5k36nxj-qCfInRJZF5EvUDkD1trNlZC5J_LdurAFUoUZ1B8NvCn5E8nHw94ueUeGQRMYbH01rPPSsGx0YRRafxSIjPMOKO4"/>
<span class="absolute font-headline font-semibold text-on-surface text-sm">+5 More</span>
</div>
</div>
</div>
<!-- Right: Product Details & Purchase -->
<div class="lg:col-span-5 flex flex-col pt-4">
<!-- Breadcrumb / Tags -->
<div class="flex items-center gap-3 mb-6">
<span class="bg-secondary-fixed text-on-secondary-fixed px-3 py-1 rounded-full font-label text-[0.75rem] tracking-wider uppercase font-semibold">Premium</span>
<span class="text-on-surface-variant font-label text-[0.75rem] tracking-wider uppercase">UI Kits</span>
</div>
<h1 class="font-headline text-4xl md:text-[3.5rem] leading-[1.1] font-bold tracking-tight text-on-surface mb-6">
                    Luminous UI Kit <span class="gradient-text">Pro</span>
</h1>
<p class="font-body text-body-lg text-on-surface-variant mb-8 leading-relaxed">
                    Elevate your next project with the ultimate design system for Figma. Crafted with precision, featuring over 500+ perfectly constrained components, global style variables, and both Light &amp; Dark modes right out of the box.
                </p>
<!-- Pricing & Action Card -->
<div class="bg-surface-container-lowest rounded-xl p-8 ambient-shadow mb-8 relative overflow-hidden">
<!-- Subtle gradient accent -->
<div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
<div class="flex items-end gap-4 mb-8">
<span class="font-headline text-4xl font-bold text-on-surface">$89</span>
<span class="font-body text-sm text-on-surface-variant mb-1 line-through">$129</span>
<span class="font-label text-xs text-secondary font-semibold bg-secondary/10 px-2 py-1 rounded-full mb-1">Save 30%</span>
</div>
<div class="flex flex-col gap-4">
<button class="w-full gradient-bg text-on-primary font-headline font-semibold py-4 px-6 rounded-full hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 flex items-center justify-center gap-2">
<span>Get Instant Access</span>
<span class="material-symbols-outlined text-sm">arrow_forward</span>
</button>
<button class="w-full bg-surface-container-highest text-on-surface font-headline font-semibold py-4 px-6 rounded-full hover:bg-surface-dim transition-colors duration-200 flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-sm">visibility</span>
                            Live Preview
                        </button>
</div>
<p class="text-center font-label text-xs text-on-surface-variant mt-4 flex items-center justify-center gap-1">
<span class="material-symbols-outlined text-[14px]">lock</span> Secure payment via Stripe
                    </p>
</div>
<!-- Specs Mini-Grid -->
<div class="grid grid-cols-2 gap-4">
<div class="bg-surface-container-low rounded-lg p-4 flex items-center gap-3">
<div class="bg-surface p-2 rounded-full text-on-surface-variant">
<span class="material-symbols-outlined text-xl">description</span>
</div>
<div>
<p class="font-label text-[0.65rem] text-on-surface-variant uppercase tracking-wider">Format</p>
<p class="font-body text-sm font-semibold text-on-surface">Figma (.fig)</p>
</div>
</div>
<div class="bg-surface-container-low rounded-lg p-4 flex items-center gap-3">
<div class="bg-surface p-2 rounded-full text-on-surface-variant">
<span class="material-symbols-outlined text-xl">update</span>
</div>
<div>
<p class="font-label text-[0.65rem] text-on-surface-variant uppercase tracking-wider">Version</p>
<p class="font-body text-sm font-semibold text-on-surface">2.4.1 (Latest)</p>
</div>
</div>
<div class="bg-surface-container-low rounded-lg p-4 flex items-center gap-3">
<div class="bg-surface p-2 rounded-full text-on-surface-variant">
<span class="material-symbols-outlined text-xl">folder_zip</span>
</div>
<div>
<p class="font-label text-[0.65rem] text-on-surface-variant uppercase tracking-wider">File Size</p>
<p class="font-body text-sm font-semibold text-on-surface">124 MB</p>
</div>
</div>
<div class="bg-surface-container-low rounded-lg p-4 flex items-center gap-3">
<div class="bg-surface p-2 rounded-full text-on-surface-variant">
<span class="material-symbols-outlined text-xl">support_agent</span>
</div>
<div>
<p class="font-label text-[0.65rem] text-on-surface-variant uppercase tracking-wider">Support</p>
<p class="font-body text-sm font-semibold text-on-surface">6 Months included</p>
</div>
</div>
</div>
</div>
</div>
<!-- Section Transition using tonal shift -->
<div class="w-full h-px bg-gradient-to-r from-transparent via-surface-variant to-transparent my-16 opacity-50"></div>
<!-- Features & Details (Asymmetric Layout) -->
<div class="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
<div class="md:col-span-4 sticky top-32">
<h2 class="font-headline text-3xl font-bold text-on-surface mb-4">Everything you need to build faster.</h2>
<p class="font-body text-on-surface-variant mb-6">Stop reinventing the wheel. Luminous provides a robust foundation so you can focus on the unique UX problems of your product.</p>
<div class="flex flex-col gap-3">
<div class="flex items-center gap-3 text-sm font-body text-on-surface">
<span class="material-symbols-outlined text-primary text-xl">check_circle</span> Lifetime Updates
                    </div>
<div class="flex items-center gap-3 text-sm font-body text-on-surface">
<span class="material-symbols-outlined text-primary text-xl">check_circle</span> Auto Layout v5 Ready
                    </div>
<div class="flex items-center gap-3 text-sm font-body text-on-surface">
<span class="material-symbols-outlined text-primary text-xl">check_circle</span> Component Properties
                    </div>
</div>
</div>
<div class="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
<!-- Feature Cards -->
<div class="bg-surface-container-lowest rounded-xl p-8 ambient-shadow hover:bg-surface-dim transition-colors duration-300">
<div class="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-6 text-primary">
<span class="material-symbols-outlined">dataset</span>
</div>
<h3 class="font-headline text-xl font-semibold text-on-surface mb-3">500+ Components</h3>
<p class="font-body text-sm text-on-surface-variant leading-relaxed">From simple buttons to complex data tables, everything is meticulously crafted and variants are logically structured.</p>
</div>
<div class="bg-surface-container-lowest rounded-xl p-8 ambient-shadow hover:bg-surface-dim transition-colors duration-300">
<div class="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-6 text-primary">
<span class="material-symbols-outlined">contrast</span>
</div>
<h3 class="font-headline text-xl font-semibold text-on-surface mb-3">Light &amp; Dark Mode</h3>
<p class="font-body text-sm text-on-surface-variant leading-relaxed">Seamlessly switch themes using Figma's native variable system. Colors are semantically mapped for perfect contrast.</p>
</div>
<div class="bg-surface-container-lowest rounded-xl p-8 ambient-shadow hover:bg-surface-dim transition-colors duration-300">
<div class="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-6 text-primary">
<span class="material-symbols-outlined">text_fields</span>
</div>
<h3 class="font-headline text-xl font-semibold text-on-surface mb-3">Typography System</h3>
<p class="font-body text-sm text-on-surface-variant leading-relaxed">A perfectly scaled typographic hierarchy using Google Fonts, ready to be swapped with your brand typeface in seconds.</p>
</div>
<div class="bg-surface-container-lowest rounded-xl p-8 ambient-shadow hover:bg-surface-dim transition-colors duration-300">
<div class="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-6 text-primary">
<span class="material-symbols-outlined">view_quilt</span>
</div>
<h3 class="font-headline text-xl font-semibold text-on-surface mb-3">80+ Page Templates</h3>
<p class="font-body text-sm text-on-surface-variant leading-relaxed">Kickstart your project with pre-designed dashboards, landing pages, authentication flows, and settings panels.</p>
</div>
</div>
</div>
</main>
<!-- Footer -->
<footer class="bg-surface-container w-full pt-16 pb-8 transition-colors duration-300 mt-auto">
<div class="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
<div class="text-lg font-headline font-bold text-on-surface flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-xl" style="font-variation-settings: 'FILL' 1;">widgets</span>
                 Luminous
            </div>
<div class="flex flex-wrap justify-center gap-6 md:gap-8">
<a class="font-label text-[0.75rem] tracking-wider uppercase text-on-surface opacity-60 hover:text-primary opacity-80 hover:opacity-100 transition-colors" href="#">Privacy Policy</a>
<a class="font-label text-[0.75rem] tracking-wider uppercase text-on-surface opacity-60 hover:text-primary opacity-80 hover:opacity-100 transition-colors" href="#">Terms of Service</a>
<a class="font-label text-[0.75rem] tracking-wider uppercase text-on-surface opacity-60 hover:text-primary opacity-80 hover:opacity-100 transition-colors" href="#">Refunds</a>
<a class="font-label text-[0.75rem] tracking-wider uppercase text-on-surface opacity-60 hover:text-primary opacity-80 hover:opacity-100 transition-colors" href="#">Support</a>
</div>
<div class="font-label text-[0.75rem] tracking-wider uppercase text-on-surface-variant opacity-60">
                © 2024 The Luminous Marketplace. All rights reserved.
            </div>
</div>
</footer>
</body></html>