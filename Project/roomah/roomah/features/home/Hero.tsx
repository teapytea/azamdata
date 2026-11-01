// features/home/Hero.tsx
export default function Hero() {
  return (
    <div className="relative isolate bg-card px-6 pt-14 lg:px-8">
      <div className="mx-auto max-w-3xl text-center py-24 sm:py-32 lg:py-40">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Mewujudkan Pernikahan
          <br />
          Membangun Peradaban
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Platform Ta'aruf Islami yang membantu Anda menemukan pasangan
          shaleh/shalehah untuk membangun keluarga sakinah.
        </p>
        <div className="mt-10">
          <a
            href="#explorer-section"
            className="inline-flex items-center gap-x-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clipRule="evenodd"
              />
            </svg>
            Mulai Pencarian
          </a>
        </div>
      </div>
    </div>
  );
}
