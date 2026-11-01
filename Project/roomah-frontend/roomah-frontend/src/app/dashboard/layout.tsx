// src/app/dashboard/layout.tsx (VERSI SUPABASE)
"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Hanya jalankan redirect jika proses loading auth sudah selesai
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Selama loading, jangan render apa-apa (karena AuthProvider sudah menampilkan loading global)
  // Setelah loading selesai dan user tidak terautentikasi, tampilkan pesan ini sesaat sebelum redirect
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Verifying session...</p>
      </div>
    );
  }

  // Jika loading selesai dan user terautentikasi, tampilkan layout dashboard
  return (
    <div>
      <main className="pt-24 pb-20">{children}</main>
    </div>
  );
}
