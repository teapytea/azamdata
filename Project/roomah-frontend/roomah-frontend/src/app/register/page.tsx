// src/app/register/page.tsx (VERSI SUPABASE)
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

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error } = await register({
      name,
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background-color px-4 pt-32 sm:pt-10 pb-12">
      <div className="text-center mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-3 text-4xl font-bold text-primary no-underline"
        >
          <FontAwesomeIcon icon={faSeedling} className="h-9 w-9" />
          <span>Roomah</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mt-4">
          Buat Akun Baru
        </h1>
        <p className="text-text-secondary">
          Satu langkah lagi untuk memulai ikhtiar Anda.
        </p>
      </div>

      <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-white rounded-2xl shadow-lg border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="w-full">
            <label
              htmlFor="name"
              className="text-sm font-medium text-text-primary block mb-2"
            >
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <div className="w-full">
              <input
                type="text"
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-4 py-3 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary box-border"
              />
            </div>
          </div>

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
              {isSubmitting ? "Mendaftarkan..." : "Daftar"}
            </button>
          </div>
        </form>
        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-4 text-sm text-gray-500 bg-white">atau</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        {/* Google Login Button */}
        <button
          onClick={() => loginWithGoogle("/dashboard")}
          disabled={isSubmitting}
          className="group w-full h-12 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 
             hover:shadow-md transition-all duration-200 ease-in-out
             disabled:opacity-50 disabled:cursor-not-allowed
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
             inline-flex items-center justify-center gap-3 font-medium text-gray-700"
          type="button"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Lanjutkan dengan Google</span>
            </>
          )}
        </button>
        <p className="text-center text-sm text-text-secondary">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:text-secondary no-underline"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
