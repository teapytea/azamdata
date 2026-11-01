// app/(public)/page.tsx
import { createClient } from "@/lib/supabase/client-server";
import { Suspense } from "react";
import Hero from "@/features/home/Hero";
import Filters from "@/features/home/Filters";
import CandidateCard from "@/features/cv/components/CandidateCard";
import {
  getDistinctProvinces,
  getFilteredCandidates,
} from "@/features/home/data";

// Skeleton tetap sama…
function CandidateGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-[22rem] animate-pulse rounded-xl bg-neutral-200"
        ></div>
      ))}
    </div>
  );
}

// TERIMA object biasa (bukan Promise) di sini
async function CandidateGrid({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: candidates /*, count*/ } = await getFilteredCandidates(
    searchParams
  );

  if (!candidates || candidates.length === 0) {
    return (
      <p className="py-16 text-center text-neutral-500">
        Tidak ada kandidat yang cocok dengan kriteria Anda.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {candidates.map((candidate, index) => (
        <CandidateCard
          key={candidate.id}
          candidate={candidate}
          isLoggedIn={!!user}
          index={index}
        />
      ))}
    </div>
  );
}

// 👇 Perubahan UTAMA ada di tipe & await di sini
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams; // ✅ WAJIB
  const provinces = await getDistinctProvinces();

  return (
    <div className="bg-[#FBFBFA]">
      <Hero />
      <section
        id="explorer-section"
        className="container mx-auto px-4 py-16 sm:py-24"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-800 sm:text-4xl">
            Temukan Pasangan Hidup Anda
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-neutral-600">
            Telusuri profil calon yang siap untuk melangkah ke jenjang
            pernikahan.
          </p>
        </div>

        <div className="mt-12">
          <Filters provinces={provinces} />
        </div>

        <div className="mt-8">
          <Suspense fallback={<CandidateGridSkeleton />}>
            <CandidateGrid searchParams={sp} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
