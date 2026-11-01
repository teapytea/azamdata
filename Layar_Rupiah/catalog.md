<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Luminous Marketplace - Catalog</title>
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
                },
            },
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        body {
            background-color: theme('colors.surface');
            color: theme('colors.on-surface');
            font-family: 'Inter', sans-serif;
        }
        h1, h2, h3, h4, h5, h6, .display, .headline {
            font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .btn-primary {
            background: linear-gradient(135deg, theme('colors.primary'), theme('colors.primary-container'));
            color: theme('colors.on-primary');
            border-radius: 9999px;
            transition: all 0.2s ease;
        }
        .btn-primary:hover {
            opacity: 0.9;
            transform: scale(0.98);
        }
        .card-ambient-shadow {
            box-shadow: 0 8px 40px rgba(25, 28, 30, 0.04);
        }
        .card-hover:hover {
            background-color: theme('colors.surface-dim');
            transform: scale(1.02);
            transition: all 0.2s ease;
            box-shadow: 0 12px 48px rgba(25, 28, 30, 0.08);
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: theme('colors.outline-variant');
            border-radius: 10px;
        }
    </style>
</head>
<body class="bg-surface text-on-surface antialiased min-h-screen flex flex-col">
<!-- TopNavBar (Shared Component) -->
<nav class="fixed top-0 w-full z-50 bg-[#f7f9fb]/80 dark:bg-[#191c1e]/80 backdrop-blur-xl shadow-sm dark:shadow-none">
<div class="flex justify-between items-center h-16 px-8 max-w-[1440px] mx-auto">
<div class="flex items-center gap-8">
<div class="text-xl font-bold tracking-tighter text-[#191c1e] dark:text-[#f7f9fb]">Luminous</div>
<div class="hidden md:flex gap-6">
<!-- Catalog is active -->
<a class="font-['Plus_Jakarta_Sans'] tracking-tight text-sm font-semibold text-[#4F46E5] border-b-2 border-[#4F46E5] pb-1 scale-95 active:scale-90 transition-transform duration-200" href="#">Catalog</a>
<a class="font-['Plus_Jakarta_Sans'] tracking-tight text-sm font-semibold text-[#191c1e]/60 dark:text-[#f7f9fb]/60 hover:text-[#4F46E5] transition-colors scale-95 active:scale-90 transition-transform duration-200" href="#">Library</a>
<a class="font-['Plus_Jakarta_Sans'] tracking-tight text-sm font-semibold text-[#191c1e]/60 dark:text-[#f7f9fb]/60 hover:text-[#4F46E5] transition-colors scale-95 active:scale-90 transition-transform duration-200" href="#">Support</a>
</div>
</div>
<div class="flex items-center gap-6">
<div class="relative hidden sm:block">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
<input class="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full text-sm font-body text-on-surface focus:ring-2 focus:ring-primary focus:outline-none w-64 transition-all" placeholder="Search catalog..." type="text"/>
</div>
<button class="font-['Plus_Jakarta_Sans'] tracking-tight text-sm font-semibold text-[#4F46E5] dark:text-[#4F46E5] hover:opacity-80 transition-opacity scale-95 active:scale-90 transition-transform duration-200">Cart</button>
<button class="text-[#191c1e] dark:text-[#f7f9fb] hover:opacity-80 transition-opacity scale-95 active:scale-90 transition-transform duration-200 flex items-center justify-center">
<span class="material-symbols-outlined">account_circle</span>
</button>
</div>
</div>
<div class="bg-[#eceef0] dark:bg-[#2c2e30] h-[1px] w-full"></div>
</nav>
<div class="flex-1 max-w-[1440px] mx-auto w-full flex pt-[65px]"> <!-- pt offsets fixed nav -->
<!-- SideNavBar (Shared Component) -->
<aside class="hidden md:flex h-[calc(100vh-65px)] w-64 border-r-0 bg-[#f7f9fb] dark:bg-[#191c1e] sticky top-[65px] custom-scrollbar overflow-y-auto">
<div class="flex flex-col p-6 gap-2 w-full">
<div class="mb-4 px-3">
<h2 class="font-headline text-base font-bold text-on-surface tracking-tight">Categories</h2>
<p class="font-body text-xs text-on-surface-variant mt-1">Curated Digital Goods</p>
</div>
<!-- Active Tab -->
<a class="flex items-center gap-3 px-3 py-2 font-['Inter'] text-sm font-medium text-[#4F46E5] font-bold bg-[#ffffff] dark:bg-[#2c2e30] rounded-lg translate-x-1 transition-transform" href="#">
<span class="material-symbols-outlined text-[20px]">grid_view</span>
                    All Products
                </a>
<a class="flex items-center gap-3 px-3 py-2 font-['Inter'] text-sm font-medium text-[#191c1e]/70 dark:text-[#f7f9fb]/70 hover:bg-[#eceef0] dark:hover:bg-[#2c2e30] rounded-lg hover:bg-[#eceef0] dark:hover:bg-[#2c2e30] transition-all translate-x-1 transition-transform" href="#">
<span class="material-symbols-outlined text-[20px]">description</span>
                    Templates
                </a>
<a class="flex items-center gap-3 px-3 py-2 font-['Inter'] text-sm font-medium text-[#191c1e]/70 dark:text-[#f7f9fb]/70 hover:bg-[#eceef0] dark:hover:bg-[#2c2e30] rounded-lg hover:bg-[#eceef0] dark:hover:bg-[#2c2e30] transition-all translate-x-1 transition-transform" href="#">
<span class="material-symbols-outlined text-[20px]">terminal</span>
                    Software
                </a>
<a class="flex items-center gap-3 px-3 py-2 font-['Inter'] text-sm font-medium text-[#191c1e]/70 dark:text-[#f7f9fb]/70 hover:bg-[#eceef0] dark:hover:bg-[#2c2e30] rounded-lg hover:bg-[#eceef0] dark:hover:bg-[#2c2e30] transition-all translate-x-1 transition-transform" href="#">
<span class="material-symbols-outlined text-[20px]">category</span>
                    Assets
                </a>
</div>
<div class="w-[1px] h-full bg-[#eceef0] dark:bg-[#2c2e30] absolute right-0 top-0"></div>
</aside>
<!-- Main Content -->
<main class="flex-1 bg-surface-container-low p-6 md:p-12 min-h-[calc(100vh-65px)]">
<!-- Hero / Header Section -->
<div class="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
<div>
<h1 class="font-headline text-4xl md:text-[3.5rem] font-extrabold tracking-[-0.02em] text-on-surface leading-tight">Explore the Collection</h1>
<p class="font-body text-body-lg text-on-surface-variant mt-4 max-w-2xl">Premium digital assets crafted for modern creators. Elevate your workflow with meticulously designed templates, robust software, and curated assets.</p>
</div>
<div class="flex gap-3">
<button class="px-5 py-2.5 bg-surface-container-lowest text-on-surface font-label text-sm tracking-wide rounded-full flex items-center gap-2 hover:bg-surface-dim transition-colors card-ambient-shadow">
<span class="material-symbols-outlined text-[18px]">tune</span>
                        Filter
                    </button>
<button class="px-5 py-2.5 bg-surface-container-lowest text-on-surface font-label text-sm tracking-wide rounded-full flex items-center gap-2 hover:bg-surface-dim transition-colors card-ambient-shadow">
<span class="material-symbols-outlined text-[18px]">sort</span>
                        Sort: Newest
                    </button>
</div>
</div>
<!-- Product Grid (Bento-inspired, asymmetrical) -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-[minmax(0,1fr)]">
<!-- Product Card 1 -->
<div class="group bg-surface-container-lowest rounded-xl overflow-hidden card-ambient-shadow card-hover flex flex-col">
<div class="relative h-56 bg-surface-container w-full overflow-hidden">
<img alt="Abstract gradient mesh background in vibrant blue and purple hues" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" data-alt="Smooth digital abstract background with flowing gradient from primary blue to secondary purple, clean tech aesthetic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJy0lveee3BgIQ-iFiRInNZL6Ogz49DdqMjFp2Sf4fO6yGDx7Fz_IZcO7VcOyBQ5kIiTkWZAuQNsZcycS1VeehiqhvQ9c_JBPBTKcK0gJ37sqIk3znFEslo7vxG2_bpCNcRZMsPt25sI8v8J03nnGc-xbpk_kZcyExCaInGUalsea8AknTESdUMJwxc1KnpHmnTJhBTucgV0ncNVT5BrBMF-N4QX_lmr2g0-LwN2as7aphSEyHdN3RhT4gW4E4Q6JLG7_Wr9PLhrRg"/>
<div class="absolute top-4 left-4">
<span class="px-3 py-1 bg-secondary-fixed text-on-secondary-fixed rounded-full font-label text-xs tracking-wide shadow-sm">New</span>
</div>
</div>
<div class="p-6 flex flex-col flex-1">
<div class="flex justify-between items-start mb-6">
<div>
<h3 class="font-headline text-xl font-bold text-on-surface tracking-tight">Aurora UI Kit</h3>
<p class="font-body text-sm text-on-surface-variant mt-1">Design System &amp; Component Library</p>
</div>
<span class="font-headline text-lg font-extrabold text-primary">$49</span>
</div>
<div class="mt-auto">
<button class="w-full py-3 btn-primary font-label text-sm font-semibold tracking-wide flex justify-center items-center gap-2">
                                Buy Now
                                <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">arrow_right_alt</span>
</button>
</div>
</div>
</div>
<!-- Product Card 2 -->
<div class="group bg-surface-container-lowest rounded-xl overflow-hidden card-ambient-shadow card-hover flex flex-col">
<div class="relative h-56 bg-surface-container w-full overflow-hidden">
<img alt="Clean minimal workspace with mechanical keyboard and monitor" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" data-alt="Minimalist desk setup with dark mechanical keyboard and glowing monitor screen displaying code, moody lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAImUfp69rYLOlfnSvVh9A56zOk7mVg9BunGem60uXFvsNGZ7F9trx7zVfTYX8Bn10K8JcatxmsqSuYd8sVU-vri2X-L4ZE7kYYrong-JQkxOWR5EvX4ggSAEE2lm5HXH4WBHQo7yxG_Fh8sKILXtZJUUcBpqq53leqcjhLITvGHm9sYRkJHJcuY4J-IwOCjbhilqvAjM99Z49n4y3gHuWrOtGdX7bRxtEwAtIvZtoRlELDlJX9Tp81jrWk11Qp_DjrI0SPgXwvOqXa"/>
</div>
<div class="p-6 flex flex-col flex-1">
<div class="flex justify-between items-start mb-6">
<div>
<h3 class="font-headline text-xl font-bold text-on-surface tracking-tight">Syntax Pro Theme</h3>
<p class="font-body text-sm text-on-surface-variant mt-1">VS Code &amp; Terminal Theme</p>
</div>
<span class="font-headline text-lg font-extrabold text-primary">$15</span>
</div>
<div class="mt-auto">
<button class="w-full py-3 btn-primary font-label text-sm font-semibold tracking-wide flex justify-center items-center gap-2">
                                Buy Now
                                <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">arrow_right_alt</span>
</button>
</div>
</div>
</div>
<!-- Product Card 3 (Featured - Spans 2 cols on lg) -->
<div class="group bg-surface-container-lowest rounded-xl overflow-hidden card-ambient-shadow card-hover flex flex-col lg:col-span-2 lg:flex-row">
<div class="relative h-56 lg:h-auto lg:w-1/2 bg-surface-container overflow-hidden">
<img alt="Minimalist dashboard UI mockup floating in 3D space" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" data-alt="High-end 3D mockup of a dashboard interface floating against a soft light gray background, premium lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoL-zhpolAewZRzF8tAPKmr74HyieYWV17sX4a10EWfs9-i2IkuZ5ns2aLrXYCJrTED7UJpa68J1hWqt_tQfu2vWR0K5PgtD2WzdQNrcX49WM8bOeJu40eSiIZ6XcrekWsYpa8b9YI7nsrpYShCMlcuLpgft_VBPK-PtE_Zevr23s3UT4AmZt9MyVihiwc1CCLfLxKyC_cx8IhAM3CWg8tja-EMmEb921SRjm9PDYeRWNbIWazGHLu8volIW7KkuTQrwkUflpYrcPl"/>
<div class="absolute top-4 left-4">
<span class="px-3 py-1 bg-surface-container-highest text-on-surface rounded-full font-label text-xs tracking-wide shadow-sm backdrop-blur-md bg-opacity-80">Best Seller</span>
</div>
</div>
<div class="p-8 lg:w-1/2 flex flex-col justify-center">
<div class="flex justify-between items-start mb-4">
<h3 class="font-headline text-2xl font-bold text-on-surface tracking-tight">The Ultimate Notion Architect</h3>
<span class="font-headline text-xl font-extrabold text-primary">$79</span>
</div>
<p class="font-body text-base text-on-surface-variant mb-8 leading-relaxed">A complete operating system for your digital life. Includes over 50 interconnected databases, customizable dashboards, and premium aesthetic covers.</p>
<div class="flex items-center gap-4 mt-auto">
<button class="flex-1 py-3.5 btn-primary font-label text-sm font-semibold tracking-wide flex justify-center items-center gap-2">
                                Buy Now
                            </button>
<button class="px-6 py-3.5 bg-surface-container-highest text-on-surface rounded-full font-label text-sm font-semibold hover:bg-surface-dim transition-colors">
                                Preview
                            </button>
</div>
</div>
</div>
</div>
</main>
</div>
<!-- Footer (Shared Component) -->
<footer class="w-full py-12 bg-[#eceef0] dark:bg-[#121416] flex flex-col items-center justify-center gap-6 px-8 border-t border-[#c7c4d8]/15 mt-auto">
<div class="text-lg font-black text-[#191c1e] dark:text-[#f7f9fb] font-headline tracking-tighter">Luminous</div>
<div class="flex gap-6">
<a class="font-['Inter'] text-xs tracking-widest uppercase text-[#191c1e]/50 dark:text-[#f7f9fb]/50 hover:text-[#4F46E5] underline-offset-4 hover:underline opacity-100 transition-colors" href="#">Privacy</a>
<a class="font-['Inter'] text-xs tracking-widest uppercase text-[#191c1e]/50 dark:text-[#f7f9fb]/50 hover:text-[#4F46E5] underline-offset-4 hover:underline opacity-100 transition-colors" href="#">Terms</a>
<a class="font-['Inter'] text-xs tracking-widest uppercase text-[#191c1e]/50 dark:text-[#f7f9fb]/50 hover:text-[#4F46E5] underline-offset-4 hover:underline opacity-100 transition-colors" href="#">Refund Policy</a>
<a class="font-['Inter'] text-xs tracking-widest uppercase text-[#191c1e]/50 dark:text-[#f7f9fb]/50 hover:text-[#4F46E5] underline-offset-4 hover:underline opacity-100 transition-colors" href="#">Contact</a>
</div>
<p class="font-body text-xs text-on-surface-variant/60">© 2024 Luminous Marketplace. The Digital Curator.</p>
</footer>
</body></html>