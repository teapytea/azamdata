"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, KeyRound, Leaf, LogOut, RefreshCw, Settings, UserRound } from "lucide-react";
import { logoutAction } from "@/app/auth-actions";
import type { Role } from "@/lib/auth";

export const NAV: { href: string; label: string; roles?: Role[] }[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/inventory", label: "Inventory" },
  { href: "/recipe", label: "Recipe / BOM" },
  { href: "/marketing", label: "Marketing", roles: ["owner", "admin", "marketing"] },
  { href: "/sales", label: "POS & Sales" },
  { href: "/procurement", label: "Procurement" },
  { href: "/brewing", label: "Brewing & QC" },
  { href: "/finance", label: "Finance" },
  { href: "/sdm", label: "SDM & Shift" },
];

const ROLE_LABEL: Record<Role, string> = { owner: "OWNER", admin: "ADMIN", marketing: "MARKETING", cashier: "KASIR", employee: "KARYAWAN" };

export function Logo({ tagline = "OPERATING SYSTEM" }: { tagline?: string }) {
  return (
    <div className="flex items-center gap-2">
      <Leaf size={22} className="text-maroon" />
      <span className="font-brand text-[21px] font-bold tracking-tight text-maroon">teapy</span>
      <span className="mono ml-2 hidden border-l border-hair pl-3 tracking-[.08em] text-soft sm:inline">{tagline}</span>
    </div>
  );
}

export function Shell({ user, outlet, children }: {
  user: { name: string; role: Role }; outlet: string; children: React.ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [spin, setSpin] = useState(false);
  const [syncedAt, setSyncedAt] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const items = NAV.filter((n) => (user.role === "marketing" ? n.href === "/marketing" : !n.roles || n.roles.includes(user.role)));
  const full = user.role === "owner" || user.role === "admin";
  const initials = user.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  useEffect(() => {
    setSyncedAt(new Date().toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" }));
  }, [path]);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (!menuRef.current?.contains(e.target as Node)) setMenu(false); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="no-print sticky top-0 z-40 bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 pb-2 pt-3 md:px-8 lg:px-12">
          <Link href={items[0].href}><Logo /></Link>
          <div className="flex items-center gap-2 md:gap-4">
            <span className="mono hidden items-center gap-1.5 rounded bg-mid px-2.5 py-1 text-ink md:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-moss" />{outlet}
            </span>
            <button type="button" aria-label="Muat ulang data" title="Muat ulang data" className="rounded p-1.5 hover:bg-mid"
              onClick={() => { setSpin(true); router.refresh(); setTimeout(() => setSpin(false), 700); }}>
              <RefreshCw size={16} className={spin ? "animate-spin" : ""} />
            </button>
            <form action={logoutAction}>
              <button aria-label="Keluar" title="Keluar" className="rounded p-1.5 hover:bg-mid"><LogOut size={16} /></button>
            </form>
            <div className="relative" ref={menuRef}>
              <button type="button" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label="Menu akun" className="flex items-center gap-2 rounded p-1 hover:bg-mid">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-maroon text-[11px] font-semibold text-white">{initials || <UserRound size={15} />}</span>
                <span className="mono hidden text-left leading-tight sm:block">{user.name}<br /><span className="text-soft">{ROLE_LABEL[user.role]}</span></span>
                <ChevronDown size={14} />
              </button>
              {menu && (
                <div className="card absolute right-0 top-11 z-50 w-48 border border-high p-1 shadow-lg">
                  {full && <Link href="/settings" onClick={() => setMenu(false)} className="flex items-center gap-2 rounded px-3 py-2 hover:bg-mid"><Settings size={14} />Pengaturan & akun</Link>}
                  <Link href="/change-password" onClick={() => setMenu(false)} className="flex items-center gap-2 rounded px-3 py-2 hover:bg-mid"><KeyRound size={14} />Ganti password</Link>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 md:px-8 lg:px-12">
          <nav className="flex min-w-0 items-center gap-1 overflow-x-auto [scrollbar-width:none]" aria-label="Modul">
            {items.map((n) => {
              const active = path === n.href || path.startsWith(n.href + "/");
              return (
                <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined}
                  className={`shrink-0 border-b-2 px-2.5 py-2 text-[13px] transition-colors ${active ? "border-maroon font-semibold text-maroon" : "border-transparent text-soft hover:text-maroon"}`}>
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="mono hidden shrink-0 items-center gap-2 xl:flex">
            <span className="rounded bg-mid px-2 py-0.5 text-soft">STORE OPERATIONS</span>
            <span className="rounded bg-mid px-2 py-0.5 text-soft">v1.1</span>
            <span className="flex items-center gap-1 font-medium text-moss"><span className="h-1.5 w-1.5 rounded-full bg-moss" />LIVE</span>
          </div>
        </div>
        <div className="border-b border-line" />
      </header>
      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-6 px-4 py-6 md:px-8 lg:px-12">{children}</main>
      <footer className="no-print mt-8 bg-low">
        <div className="mono mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-2 px-4 py-4 text-soft md:px-8 lg:px-12">
          <span><b className="font-brand text-[13px] text-ink">teapy</b> · Operating System Atelier Ledger</span>
          <span>Data dimuat {syncedAt} WIB · v1.1</span>
        </div>
      </footer>
    </div>
  );
}
