// app/(auth)/login/page.tsx

import GoogleAuthButton from "@/features/auth/client/GoogleAuthButton";
import LoginForm from "@/features/auth/client/LoginForm";
import Logo from "@/features/auth/client/Logo";
import Link from "next/link";

export default function LoginPage() {
  return (
    <>
      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-[#FBFBFA] p-4 pt-20">
        <div className="flex w-full max-w-md flex-col items-center space-y-6">
          <Logo />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-neutral-800">
              Selamat Datang Kembali
            </h1>
            <p className="mt-1 text-neutral-500">Masuk ke akun Roomah Anda</p>
          </div>

          <div className="w-full rounded-xl border bg-card p-8 shadow-sm">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-semibold">Login</h2>
              <p className="text-sm text-neutral-500">
                Lanjutkan perjalanan Ta'aruf Anda
              </p>
            </div>
            <LoginForm />
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-neutral-500">ATAU</span>
              </div>
            </div>
            <GoogleAuthButton mode="login" />
          </div>

          <p className="text-center text-sm text-neutral-600">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-semibold text-green-700 hover:underline"
            >
              Daftar di sini
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
