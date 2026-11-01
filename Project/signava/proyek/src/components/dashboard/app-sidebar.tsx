import {
  Analytics01Icon,
  Building01Icon,
  Certificate01Icon,
  Home01Icon,
  Invoice01Icon,
  Layers01Icon,
  UserGroup02Icon,
  UserGroupIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { formatNumber } from "@/lib/format"
import { currentOrganization } from "@/lib/mock"
import { cn } from "@/lib/utils"

type IconType = typeof Home01Icon

interface NavItemDef {
  to: string
  label: string
  icon: IconType
  exact?: boolean
}

const mainNav: NavItemDef[] = [
  { to: "/dashboard", label: "Ringkasan", icon: Home01Icon, exact: true },
  { to: "/dashboard/batches", label: "Batch", icon: Certificate01Icon },
  { to: "/dashboard/templates", label: "Template", icon: Layers01Icon },
  { to: "/dashboard/recipients", label: "Penerima", icon: UserGroupIcon },
  { to: "/dashboard/analytics", label: "Analitik", icon: Analytics01Icon },
]

const settingsNav: NavItemDef[] = [
  {
    to: "/dashboard/settings/organization",
    label: "Organisasi",
    icon: Building01Icon,
  },
  { to: "/dashboard/settings/team", label: "Tim", icon: UserGroup02Icon },
  { to: "/dashboard/settings/billing", label: "Tagihan", icon: Invoice01Icon },
  { to: "/dashboard/settings/account", label: "Akun", icon: UserIcon },
]

function NavItem({
  item,
  onNavigate,
}: {
  item: NavItemDef
  onNavigate?: () => void
}) {
  return (
    <Link
      to={item.to}
      activeOptions={{ exact: item.exact ?? false }}
      activeProps={{
        className:
          "bg-foreground text-background hover:bg-foreground hover:text-background",
      }}
      inactiveProps={{
        className:
          "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      }}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
      onClick={onNavigate}
    >
      <HugeiconsIcon icon={item.icon} className="size-4.5" />
      <span>{item.label}</span>
    </Link>
  )
}

export function AppSidebar({
  open,
  onNavigate,
}: {
  open: boolean
  onNavigate?: () => void
}) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r bg-sidebar transition-transform duration-300 md:sticky md:h-svh md:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-14 shrink-0 items-center border-b px-4">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <img
            src="/logo-signava.png"
            alt="Logo Signava"
            className="size-7 rounded-lg object-contain"
          />
          <span className="text-sm font-semibold text-foreground">Signava</span>
        </Link>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Menu utama
          </p>
          <nav className="space-y-0.5">
            {mainNav.map((item) => (
              <NavItem key={item.to} item={item} onNavigate={onNavigate} />
            ))}
          </nav>
        </div>

        <div className="space-y-1">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Pengaturan
          </p>
          <nav className="space-y-0.5">
            {settingsNav.map((item) => (
              <NavItem key={item.to} item={item} onNavigate={onNavigate} />
            ))}
          </nav>
        </div>
      </div>

      <div className="border-t p-3">
        <div className="space-y-2 rounded-xl border bg-card p-3 shadow-xs">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-foreground">
              Paket{" "}
              {currentOrganization.plan === "free"
                ? "Gratis"
                : currentOrganization.plan === "pro"
                  ? "Pro"
                  : "Bisnis"}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatNumber(currentOrganization.creditBalance)} kredit tersisa
            </p>
          </div>
          <Button
            size="xs"
            variant="outline"
            className="w-full"
            render={<Link to="/dashboard/settings/billing" />}
          >
            Kelola tagihan
          </Button>
        </div>
      </div>
    </aside>
  )
}
