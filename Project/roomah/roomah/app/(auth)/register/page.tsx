// app/(auth)/register/page.tsx

import GoogleAuthButton from "@/features/auth/client/GoogleAuthButton";
import RegisterForm from "@/features/auth/client/RegisterForm";
import Logo from "@/features/auth/client/Logo";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <>
      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-[#FBFBFA] p-4">
        <div className="flex w-full max-w-md flex-col items-center space-y-6">
          <Logo />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-neutral-800">
              Selamat Datang di Roomah
            </h1>
            <p className="mt-1 text-neutral-500">
              Mewujudkan Pernikahan Membangun Peradaban
            </p>
          </div>

          <div className="w-full rounded-xl border bg-card p-8 shadow-sm">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-semibold">Register</h2>
              <p className="text-sm text-neutral-500">
                Mulai perjalanan Ta'aruf Anda
              </p>
            </div>
            <RegisterForm />
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-neutral-500">Atau</span>
              </div>
            </div>
            <GoogleAuthButton mode="register" />
          </div>

          <p className="text-center text-sm text-neutral-600">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-semibold text-green-700 hover:underline"
            >
              Login di sini
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
