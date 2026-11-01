// src/app/dashboard/koin-saya/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins } from "@fortawesome/free-solid-svg-icons";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { type coin_packages } from "@/types/database";

// Deklarasikan 'snap' di window agar TypeScript tidak error
declare global {
  interface Window {
    snap: any;
  }
}

export default function MyCoinPage() {
  const supabase = createClient();
  const { user } = useAuth();
  const [packages, setPackages] = useState<coin_packages[]>([]);
  const [coinBalance, setCoinBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const midtransClientKey =
    process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "MASUKKAN_CLIENT_KEY_ANDA";

  const fetchPageData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    // Ambil paket koin dan saldo pengguna secara bersamaan
    const [packagesRes, profileRes] = await Promise.all([
      supabase
        .from("coin_packages")
        .select("*")
        .eq("is_active", true)
        .order("price"),
      supabase
        .from("profiles")
        .select("coin_balance")
        .eq("id", user.id)
        .single(),
    ]);

    setPackages(packagesRes.data || []);
    setCoinBalance(profileRes.data?.coin_balance ?? 0);
    setIsLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    // Load script Midtrans Snap
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", midtransClientKey);
    script.async = true;
    document.body.appendChild(script);

    fetchPageData();

    return () => {
      document.body.removeChild(script);
    };
  }, [midtransClientKey, fetchPageData]);

  const handleTopUp = async (pkg: coin_packages) => {
    setIsSubmitting(pkg.id);
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-midtrans-transaction",
        {
          body: { packageId: pkg.id },
        }
      );

      if (error) throw error;
      const { token } = data;
      if (!token) throw new Error("Token transaksi tidak diterima.");

      window.snap.pay(token, {
        onSuccess: function (result: any) {
          alert("Pembayaran berhasil! Saldo koin Anda akan segera diperbarui.");
          console.log(result);
          fetchPageData(); // Refresh data setelah pembayaran berhasil
        },
        onPending: function (result: any) {
          alert("Menunggu pembayaran Anda. Periksa instruksi pembayaran.");
          console.log(result);
        },
        onError: function (result: any) {
          alert("Pembayaran gagal. Silakan coba lagi.");
          console.log(result);
        },
        onClose: function () {
          console.log("Popup pembayaran ditutup.");
        },
      });
    } catch (error: any) {
      alert(`Terjadi Kesalahan: ${error.message}`);
    } finally {
      setIsSubmitting(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-text-primary">
          Koin Ta'aruf Saya
        </h1>
        <p className="mt-2 text-text-secondary">
          Gunakan koin untuk mengajukan ta'aruf kepada kandidat pilihan Anda.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center bg-primary text-white p-8 rounded-2xl shadow-lg mb-12">
        <h2 className="text-lg font-semibold uppercase tracking-wider">
          Saldo Anda Saat Ini
        </h2>
        <div className="flex items-center gap-4 mt-2">
          <FontAwesomeIcon icon={faCoins} className="h-10 w-10" />
          <span className="text-5xl font-bold">
            {isLoading ? "..." : coinBalance}
          </span>
        </div>
      </div>

      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-text-primary">
          Pilih Paket Top Up
        </h2>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-500">Memuat paket pilihan...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-surface-color p-8 rounded-2xl shadow-md border-2 transition-all duration-300 hover:-translate-y-2 ${
                // Anda bisa menambahkan kolom 'is_popular' di tabel coin_packages
                // pkg.is_popular ? "border-primary" : "border-transparent"
                // Untuk sekarang, kita buat paket kedua populer sebagai contoh
                packages.indexOf(pkg) === 1
                  ? "border-primary"
                  : "border-border-color"
              }`}
            >
              {packages.indexOf(pkg) === 1 && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Populer
                </span>
              )}
              <h3 className="text-xl font-bold text-center text-text-primary h-14 flex items-center justify-center">
                {pkg.name}
              </h3>
              <div className="flex items-center justify-center gap-2 text-4xl font-bold text-primary my-6">
                <FontAwesomeIcon icon={faCoins} />
                <span>{pkg.coins_amount}</span>
              </div>
              <p className="text-center text-lg font-semibold text-text-secondary mb-6">
                Rp {pkg.price.toLocaleString("id-ID")}
              </p>
              <button
                onClick={() => handleTopUp(pkg)}
                disabled={isSubmitting !== null}
                className="w-full px-6 py-3 font-semibold text-white bg-primary rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting === pkg.id ? "Memproses..." : "Top Up Sekarang"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
