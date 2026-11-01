// src/components/layout/NavbarGuest.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSeedling, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

export default function NavbarGuest() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    // Menambahkan `relative` untuk mobile menu positioning
    <nav className="fixed top-0 left-0 w-full bg-surface-color/95 backdrop-blur-sm shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link
            href="/"
            className="flex-shrink-0 flex items-center gap-2 text-2xl font-bold text-primary no-underline"
          >
            <FontAwesomeIcon icon={faSeedling} className="h-7 w-7" />
            <span>Roomah</span>
          </Link>
          <div className="hidden md:flex items-baseline space-x-8">
            <Link
              href="/"
              className="text-text-primary hover:text-primary transition-colors no-underline"
            >
              Beranda
            </Link>
            <Link
              href="/tentang"
              className="text-text-primary hover:text-primary transition-colors no-underline"
            >
              Tentang Roomah
            </Link>
            <Link
              href="/kontak"
              className="text-text-primary hover:text-primary transition-colors no-underline"
            >
              Kontak
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="px-6 py-2 rounded-full text-sm font-semibold text-primary hover:bg-primary/10 transition-colors no-underline"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="bg-primary text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-secondary transition-all duration-300 hover:shadow-lg no-underline"
            >
              Daftar Gratis
            </Link>
          </div>
          <div className="md:hidden">
            {/* Menghilangkan border dan background dari button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-text-primary focus:outline-none bg-transparent border-none"
            >
              <FontAwesomeIcon
                icon={isMenuOpen ? faTimes : faBars}
                className="h-6 w-6"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu: Latar belakang putih, shadow, dan tombol lebih rapi */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg border-t border-border-color">
          <div className="px-4 pt-2 pb-4 space-y-2 flex flex-col">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-text-primary hover:bg-gray-100 no-underline"
              onClick={() => setIsMenuOpen(false)}
            >
              Beranda
            </Link>
            <Link
              href="/tentang"
              className="block px-3 py-2 rounded-md text-base font-medium text-text-primary hover:bg-gray-100 no-underline"
              onClick={() => setIsMenuOpen(false)}
            >
              Tentang Roomah
            </Link>
            <Link
              href="/kontak"
              className="block px-3 py-2 rounded-md text-base font-medium text-text-primary hover:bg-gray-100 no-underline"
              onClick={() => setIsMenuOpen(false)}
            >
              Kontak
            </Link>
            <div className="w-full border-t my-2"></div>
            <Link
              href="/login"
              className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-gray-100 no-underline"
              onClick={() => setIsMenuOpen(false)}
            >
              Masuk
            </Link>
            {/* Tombol Daftar Gratis tidak full-width */}
            <Link
              href="/register"
              className="self-start mt-2 bg-primary text-white px-4 py-2 rounded-full text-base font-semibold hover:bg-secondary no-underline"
              onClick={() => setIsMenuOpen(false)}
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
