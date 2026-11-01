"use client";
import { useAuth } from "@/context/AuthContext";
import NavbarGuest from "./NavbarGuest";
import NavbarUser from "./NavbarUser";
import { usePathname } from "next/navigation";
import BottomNavBar from "./BottomNavBar";

export default function DynamicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const otherPagesWithoutNav = [
    "/onboarding/verifikasi",
    "/onboarding/buat-cv",
  ];
  const hideAllNavs = isAdminRoute || otherPagesWithoutNav.includes(pathname);
  const Navbar = isAuthenticated ? NavbarUser : NavbarGuest;
  const showBottomNav = isAuthenticated && !isAdminRoute;

  if (hideAllNavs) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      {showBottomNav && <BottomNavBar />}
    </>
  );
}
