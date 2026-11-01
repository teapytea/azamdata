// src/components/layout/BottomNavBar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faPaperPlane,
  faCoins,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

const navItems = [
  { href: "/dashboard/cv-saya", icon: faUser, label: "Profil Saya" },
  { href: "/dashboard/taaruf-saya", icon: faPaperPlane, label: "Taaruf Saya" },
  { href: "/", icon: faSearch, label: "Cari Jodoh" },
  { href: "/dashboard/koin-saya", icon: faCoins, label: "Koin Saya" },
];

export default function BottomNavBar() {
  const pathname = usePathname();
  return (
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-surface-color border-t border-border-color">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex flex-col items-center justify-center px-2 pt-2 pb-1 group ${
                isActive ? "text-primary" : "text-gray-500"
              }`}
            >
              <FontAwesomeIcon icon={item.icon} className="w-5 h-5 mb-1" />
              {/* Kecilkan font dan pastikan tidak ada line-break */}
              <span
                className={`text-[11px] whitespace-nowrap ${
                  isActive ? "font-semibold" : ""
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
