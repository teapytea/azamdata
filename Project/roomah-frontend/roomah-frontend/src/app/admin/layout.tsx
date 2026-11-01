"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faCheckSquare,
  faUsers,
  faSignOutAlt,
  faHeart,
  faCoins,
  faCog,
  faBullhorn,
  faBars,
  faTimes,
  faChevronDown,
  faUserCircle,
  faBell,
  faSearch,
  faHome,
  faSpinner,
  faExclamationTriangle,
  faMoon,
  faSun,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

// Enhanced Loading Screen Component
const LoadingScreen = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center">
      <div className="mb-4">
        <FontAwesomeIcon
          icon={faSpinner}
          className="text-4xl text-blue-600 animate-spin"
        />
      </div>
      <p className="text-lg font-medium text-gray-700">
        Memverifikasi akses...
      </p>
      <div className="mt-4 w-48 bg-gray-200 rounded-full h-1.5">
        <div className="bg-blue-600 h-1.5 rounded-full animate-pulse w-3/4"></div>
      </div>
    </div>
  </div>
);

// Access Denied Component
const AccessDenied = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
    <div className="text-center max-w-md">
      <div className="mb-6">
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          className="text-5xl text-red-500"
        />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Akses Ditolak</h2>
      <p className="text-gray-600 mb-6">
        Anda tidak memiliki izin untuk mengakses halaman admin. Silakan hubungi
        administrator jika Anda yakin ini adalah kesalahan.
      </p>
      <div className="space-x-4">
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Coba Lagi
        </button>
        <Link
          href="/dashboard/cv-saya"
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 inline-block"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  </div>
);

// Navigation items with better organization
const navItems = [
  {
    href: "/admin/dashboard-overview",
    icon: faTachometerAlt,
    label: "Dashboard Overview",
  },
  { href: "/admin/verifikasi-cv", icon: faCheckSquare, label: "Verifikasi CV" },
  {
    href: "/admin/antrian-posting",
    icon: faBullhorn,
    label: "Antrian Posting CV",
  },
  { href: "/admin/manajemen-akun", icon: faUsers, label: "Manajemen Akun" },
  { href: "/admin/proses-taaruf", icon: faHeart, label: "Proses Ta'aruf" },
  { href: "/admin/koin-transaksi", icon: faCoins, label: "Koin & Transaksi" },
  {
    href: "/admin/pengaturan-platform",
    icon: faCog,
    label: "Pengaturan Platform",
  },
];

// Enhanced Navigation Item Component
const NavItem = ({
  item,
  isActive,
  isMobile,
  onMobileClick,
}: {
  item: (typeof navItems)[0];
  isActive: boolean;
  isMobile?: boolean;
  onMobileClick?: () => void;
}) => (
  <Link
    href={item.href}
    onClick={onMobileClick}
    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group no-underline ${
      isActive
        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200"
        : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
    }`}
  >
    <div className="flex items-center space-x-3">
      <FontAwesomeIcon
        icon={item.icon}
        className={`w-5 h-5 ${
          isActive ? "text-white" : "text-gray-500 group-hover:text-blue-600"
        }`}
      />
      <span>{item.label}</span>
    </div>
  </Link>
);

// Compact Header Component
const AdminHeader = ({
  user,
  onToggleSidebar,
  isSidebarOpen,
  onLogout,
  pathname,
}: {
  user: any;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onLogout: () => void;
  pathname: string;
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Generate breadcrumb based on pathname
  const generateBreadcrumb = (path: string) => {
    const segments = path.split("/").filter((segment) => segment);
    const breadcrumbItems = [{ label: "Home", icon: faHome }];

    if (segments.length > 1) {
      breadcrumbItems.push({ label: "Admin", icon: null });

      if (segments[1]) {
        const pageLabels: Record<string, string> = {
          "dashboard-overview": "Dashboard",
          "verifikasi-cv": "Verifikasi CV",
          "antrian-posting": "Antrian Posting",
          "manajemen-akun": "Manajemen Akun",
          "proses-taaruf": "Proses Ta'aruf",
          "koin-transaksi": "Koin & Transaksi",
          "pengaturan-platform": "Pengaturan",
        };

        const currentPage = pageLabels[segments[1]] || segments[1];
        breadcrumbItems.push({ label: currentPage, icon: null });
      }
    }

    return breadcrumbItems;
  };

  const breadcrumbItems = generateBreadcrumb(pathname);

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Left side - Compact Breadcrumb */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-1.5 rounded-md text-gray-600 hover:bg-gray-100 transition-colors duration-200"
          >
            <FontAwesomeIcon
              icon={isSidebarOpen ? faTimes : faBars}
              className="w-4 h-4"
            />
          </button>

          {/* Compact Breadcrumb */}
          <nav className="flex items-center space-x-1 text-sm">
            {breadcrumbItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-1">
                {index > 0 && (
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className="text-gray-300 w-3 h-3"
                  />
                )}
                <span
                  className={`flex items-center space-x-1 ${
                    index === breadcrumbItems.length - 1
                      ? "text-blue-600 font-medium"
                      : "text-gray-500"
                  }`}
                >
                  {item.icon && (
                    <FontAwesomeIcon icon={item.icon} className="w-3 h-3" />
                  )}
                  <span>{item.label}</span>
                </span>
              </div>
            ))}
          </nav>
        </div>

        {/* Right side - Compact Controls */}
        <div className="flex items-center space-x-2">
          {/* Dark mode toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            title="Toggle Dark Mode"
          >
            <FontAwesomeIcon
              icon={isDarkMode ? faSun : faMoon}
              className="w-4 h-4"
            />
          </button>

          {/* Notifications */}
          <button
            className="relative p-1.5 rounded-md text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            title="Notifications"
          >
            <FontAwesomeIcon icon={faBell} className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* Compact Profile */}
          <div className="flex items-center space-x-2 px-2 py-1 bg-gray-50 rounded-md">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-semibold">
                {user?.email?.charAt(0).toUpperCase() || "A"}
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-medium text-gray-900 leading-none">
                Admin
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="p-1.5 rounded-md text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
            title="Logout"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

// Main Layout Component
export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<"loading" | "allowed" | "denied">(
    "loading"
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const checkUserAccess = async () => {
    if (!user) {
      router.push("/admin/login");
      return;
    }

    const supabase = createClient();
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || profile?.role !== "admin") {
        setStatus("denied");
      } else {
        setStatus("allowed");
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      setStatus("denied");
    }
  };

  useEffect(() => {
    if (isAuthLoading) return;
    checkUserAccess();
  }, [user, isAuthLoading, router]);

  // Close sidebar when clicking outside (mobile)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isSidebarOpen) {
        const sidebar = document.getElementById("admin-sidebar");
        const target = event.target as Node;
        if (sidebar && !sidebar.contains(target)) {
          setIsSidebarOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isSidebarOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isSidebarOpen]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (status === "loading") {
    return <LoadingScreen />;
  }

  if (status === "denied") {
    return <AccessDenied onRetry={checkUserAccess} />;
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Mobile overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Narrower */}
      <aside
        id="admin-sidebar"
        className={`${
          isMobile
            ? `fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 ease-in-out ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : "fixed left-0 top-0 h-full"
        } w-64 bg-white shadow-xl flex flex-col`}
      >
        {/* Sidebar Header - More Compact */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Roomah Admin
                </h1>
                <p className="text-xs text-gray-500">Management Panel</p>
              </div>
            </div>
            {isMobile && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
        </div>

        {/* Navigation - More Compact */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
            Menu Utama
          </div>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <NavItem
                key={item.href}
                item={item}
                isActive={isActive}
                isMobile={isMobile}
                onMobileClick={() => setIsSidebarOpen(false)}
              />
            );
          })}
        </nav>

        {/* Sidebar Footer - More Compact */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="flex items-center justify-center space-x-2 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
          >
            <FontAwesomeIcon
              icon={faSignOutAlt}
              className="w-4 h-4 group-hover:scale-110 transition-transform duration-200"
            />
            <span className="font-medium text-sm">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${isMobile ? "" : "ml-64"}`}>
        <AdminHeader
          user={user}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          onLogout={logout}
          pathname={pathname}
        />
        <main className="flex-1 overflow-hidden bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
