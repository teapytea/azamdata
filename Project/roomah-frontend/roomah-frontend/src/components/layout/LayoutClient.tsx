// src/components/layout/LayoutClient.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import NavbarGuest from "./NavbarGuest";
// Kita akan membuat NavbarUser nanti
// import NavbarUser from "./NavbarUser";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();

  // Nanti di sini kita bisa memilih navbar mana yang ditampilkan
  // const Navbar = isAuthenticated ? NavbarUser : NavbarGuest;

  return (
    <>
      {/* Untuk sekarang, kita selalu tampilkan NavbarGuest */}
      <NavbarGuest />
      {children}
    </>
  );
}
