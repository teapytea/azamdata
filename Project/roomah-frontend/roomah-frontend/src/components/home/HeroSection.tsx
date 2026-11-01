// src/components/home/HeroSection.tsx

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

export default function HeroSection() {
  return (
    // pt-40 memberi padding atas agar konten tidak tertutup navbar
    // pb-20 memberi ruang di bawah sebelum bagian selanjutnya
    <section className="text-center pt-40 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary leading-tight">
          Mewujudkan Pernikahan Membangun Peradaban
        </h1>
        <p className="mt-6 text-lg text-text-secondary max-w-2xl mx-auto">
          Platform {"Ta'aruf"} Islami yang membantu Anda menemukan pasangan
          shaleh/shalehah untuk membangun keluarga sakinah.
        </p>
        <div className="mt-10">
          <Link
            href="#search-section"
            className="inline-flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-full font-semibold hover:bg-secondary transition-all duration-300 hover:shadow-lg text-base transform hover:-translate-y-1"
          >
            <FontAwesomeIcon icon={faSearch} />
            Mulai Pencarian
          </Link>
        </div>
      </div>
    </section>
  );
}
