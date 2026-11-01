// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSeedling,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth() as {
    login: (payload: {
      email: string;
      password: string;
    }) => Promise<{ error: { message: string } | null }>;
    loginWithGoogle?: (returnTo?: string) => Promise<void>;
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const { error } = await login({ email, password });
    if (error) setError(error.message);
    setIsSubmitting(false);
  };

  const handleGoogle = async () => {
    setError(null);
    setIsOAuthLoading(true);
    try {
      // Prefer: pakai method dari AuthContext (disarankan)
      if (loginWithGoogle) {
        await loginWithGoogle("/dashboard");
      } else {
        // Fallback: langsung dari client supabase kalau belum menambahkan loginWithGoogle di AuthContext
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${
              location.origin
            }/auth/callback?returnTo=${encodeURIComponent("/dashboard")}`,
            queryParams: { access_type: "offline", prompt: "consent" },
            scopes: "email profile openid",
          },
        });
      }
    } catch (e: any) {
      setError(e?.message ?? "Gagal memulai login Google");
      setIsOAuthLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background-color px-4 pt-32 sm:pt-28 pb-12">
      <div className="text-center mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-3 text-4xl font-bold text-primary no-underline"
        >
          <FontAwesomeIcon icon={faSeedling} className="h-9 w-9" />
          <span>Roomah</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mt-4">
          Selamat Datang Kembali
        </h1>
        <p className="text-text-secondary">Masuk ke akun Roomah Anda</p>
      </div>

      <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="text-center">
          <h2 className="text-xl font-bold text-text-primary">Login</h2>
          <p className="text-text-secondary mt-1">
            Lanjutkan perjalanan {"Ta'aruf"} Anda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="w-full">
            <label
              htmlFor="email"
              className="text-sm font-medium text-text-primary block mb-2"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <div className="w-full">
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary box-border"
              />
            </div>
          </div>

          <div className="w-full">
            <label
              htmlFor="password"
              className="text-sm font-medium text-text-primary block mb-2"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 pr-12 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary box-border"
              />
            </div>
          </div>

          <div className="w-full">
            <button
              type="submit"
              disabled={isSubmitting}
              className="block w-full px-4 py-3 font-semibold text-white bg-primary rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs text-gray-500">atau</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={isOAuthLoading}
          className="w-full h-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50
                     inline-flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {/* Logo Google (inline SVG, tanpa dep tambahan) */}
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
            s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.643,6.053,29.082,4,24,4C12.955,4,4,12.955,4,24
            s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            />
            <path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,13,24,13c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657
            C33.643,6.053,29.082,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24,44c5.163,0,9.86-1.977,13.409-5.197l-6.19-5.238C29.211,35.091,26.715,36,24,36
            c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            />
            <path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-3.993,5.565
            c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.924,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            />
          </svg>
          <span className="text-sm font-medium text-gray-700">
            {isOAuthLoading
              ? "Mengarahkan ke Google..."
              : "Lanjutkan dengan Google"}
          </span>
        </button>

        <p className="text-center text-sm text-text-secondary">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:text-secondary no-underline"
          >
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
