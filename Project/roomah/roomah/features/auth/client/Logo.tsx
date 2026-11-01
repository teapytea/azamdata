// features/auth/client/Logo.tsx

import Image from "next/image"; // Asumsikan Anda punya logo di public/logo.svg

export default function Logo() {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {/* Ganti dengan path logo Anda yang sebenarnya */}
      <Image
        src="/roomah_logo_transparant.png"
        alt="Roomah Logo"
        width={64} // Sesuaikan ukuran sesuai kebutuhan
        height={64}
        className="h-16 w-16"
        priority // Penting untuk LCP (Largest Contentful Paint)
      />
      <span className="text-xl font-bold tracking-tighter text-neutral-800">
        Roomah
      </span>
    </div>
  );
}
