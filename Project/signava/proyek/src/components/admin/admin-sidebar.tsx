import {
  Building06Icon,
  DashboardSquare01Icon,
  Layers01Icon,
  Money01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@tanstack/react-router"

import { cn } from "@/lib/utils"

type IconType = typeof DashboardSquare01Icon

interface NavItemDef {
  to: string
  label: string
  icon: IconType
  exact?: boolean
}

const nav: NavItemDef[] = [
  { to: "/admin", label: "Ringkasan", icon: DashboardSquare01Icon, exact: true },
  { to: "/admin/templates", label: "Template sistem", icon: Layers01Icon },
  { to: "/admin/organizations", label: "Organisasi & user", icon: Building06Icon },
  { to: "/admin/finance", label: "Keuangan", icon: Money01Icon },
]

function NavItem({ item, onNavigate }: { item: NavItemDef; onNavigate?: () => void }) {
  return (
    <Link
      to={item.to}
      activeOptions={{ exact: item.exact ?? false }}
      activeProps={{
        className: "bg-white/15 text-white",
      }}
      inactiveProps={{
        className: "text-white/60 hover:bg-white/10 hover:text-white",
      }}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
      onClick={onNavigate}
    >
      <HugeiconsIcon icon={item.icon} className="size-4.5" />
      <span>{item.label}</span>
    </Link>
  )
}

export function AdminSidebar({
  open,
  onNavigate,
}: {
  open: boolean
  onNavigate?: () => void
}) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-white/10 bg-brand-navy text-white transition-transform duration-300 md:sticky md:h-svh md:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-white/10 px-4">
        <img
          src="/logo-signava.png"
          alt="Logo Signava"
          className="size-7 rounded-lg bg-white object-contain p-0.5"
        />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">Signava</span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#16C0AE]">
            Panel superadmin
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {nav.map((item) => (
          <NavItem key={item.to} item={item} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          onClick={onNavigate}
        >
          <HugeiconsIcon icon={DashboardSquare01Icon} className="size-4.5" />
          <span>Ke dashboard penerbit</span>
        </Link>
      </div>
    </aside>
  )
}
