// src/components/layout/NavbarUser.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSeedling,
  faSignOutAlt,
  faBell,
  faComments,
} from "@fortawesome/free-solid-svg-icons";

export default function NavbarUser() {
  const { logout } = useAuth();
  return (
    <nav className="fixed top-0 left-0 w-full bg-surface-color/95 backdrop-blur-sm shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link
            href="/"
            className="flex items-center gap-2 text-2xl font-bold text-primary no-underline"
          >
            <FontAwesomeIcon icon={faSeedling} className="h-7 w-7" />
            <span>Roomah</span>
          </Link>
          <div className="hidden md:flex items-baseline space-x-8">
            <Link
              href="/dashboard/cv-saya"
              className="text-text-primary hover:text-primary transition-colors no-underline"
            >
              CV Saya
            </Link>
            <Link
              href="/dashboard/taaruf-saya"
              className="text-text-primary hover:text-primary transition-colors no-underline"
            >
              {"Ta'aruf Saya"}
            </Link>
            <Link
              href="/"
              className="text-text-primary hover:text-primary transition-colors no-underline"
            >
              Cari Jodoh
            </Link>
            <Link
              href="/dashboard/koin-saya"
              className="text-text-primary hover:text-primary transition-colors no-underline"
            >
              Koin Saya
            </Link>
          </div>
          <div className="flex items-center gap-5">
            <button className="text-text-primary hover:text-primary transition-colors bg-transparent border-none">
              <FontAwesomeIcon icon={faBell} className="h-5 w-5" />
            </button>
            <a
              href="https://wa.me/NOMOR_ADMIN"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-primary hover:text-primary transition-colors"
            >
              <FontAwesomeIcon icon={faComments} className="h-5 w-5" />
            </a>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-red-500 hover:text-red-700 transition-colors bg-transparent border-none"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="h-5 w-5" />
              <span className="hidden sm:inline text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
