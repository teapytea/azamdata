import Link from "next/link";
import LogoutButton from "@/features/auth/client/LogoutButton";

interface NavbarProps {
  variant: "public" | "app";
}

export default function Navbar({ variant }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Roomah</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            {variant === "public" && (
              <>
                <Link href="/tentang">Tentang</Link>
              </>
            )}
            {variant === "app" && (
              <>
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/cv-saya">CV Saya</Link>
                <Link href="/koin">Koin</Link>
              </>
            )}
          </nav>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {variant === "public" && <Link href="/login">Login</Link>}
          {variant === "app" && <LogoutButton />}
        </div>
      </div>
    </header>
  );
}
