"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function PublicNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/roomah_logo_transparant.png"
            alt="Roomah"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="text-lg font-bold text-primary">Roomah</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Beranda
          </Link>
          <Link
            href="/tentang"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Tentang Roomah
          </Link>
          <Link
            href="/kontak"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Kontak
          </Link>
        </nav>

        {/* Desktop Auth Actions */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
          >
            Daftar Gratis
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="flex items-center justify-center p-2 md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <svg
            className="h-6 w-6 text-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link
              href="/"
              className="block text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Beranda
            </Link>
            <Link
              href="/tentang"
              className="block text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Tentang Roomah
            </Link>
            <Link
              href="/kontak"
              className="block text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Kontak
            </Link>
            <div className="border-t border-border pt-4 space-y-3">
              <Link
                href="/login"
                className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Daftar Gratis
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
