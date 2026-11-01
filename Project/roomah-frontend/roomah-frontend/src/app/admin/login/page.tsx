// src/app/admin/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSeedling,
  faEye,
  faEyeSlash,
  faShieldHalved,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

export default function AdminLoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setIsSubmitting(false);
      return;
    }

    // Cek role dari JWT claim (diisi oleh Auth Hook)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const role = (user?.app_metadata as any)?.role as string | undefined;

    if (role === "admin") {
      router.refresh();
      router.replace("/admin");
    } else {
      await supabase.auth.signOut();
      setError("Akses ditolak. Akun Anda bukan admin.");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="text-gray-500 hover:text-primary transition-colors flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Pergi ke Halaman Home</span>
        </Link>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-4xl font-bold text-primary no-underline"
          >
            <FontAwesomeIcon icon={faSeedling} className="h-9 w-9" />
            <span>Roomah</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-4 flex items-center justify-center gap-3">
            <FontAwesomeIcon icon={faShieldHalved} />
            Portal Login Admin
          </h1>
        </div>

        <div className="p-8 space-y-6 bg-white rounded-2xl shadow-lg border border-gray-200">
          <form onSubmit={handleAdminLogin} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                <strong>Error:</strong> {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 block mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 block mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="block w-full px-4 py-3 font-semibold text-white bg-primary rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
