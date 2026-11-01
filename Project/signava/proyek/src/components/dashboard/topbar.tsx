import {
  ArrowDown01Icon,
  Logout01Icon,
  Menu01Icon,
  Search02Icon,
  Tick02Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

import { ToggleTheme } from "@/components/toggle-theme"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { currentUser, mockOrganizations } from "@/lib/mock"
import { cn } from "@/lib/utils"

export function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const navigate = useNavigate()
  const [activeOrgId, setActiveOrgId] = useState(mockOrganizations[0].id)
  const activeOrg =
    mockOrganizations.find((org) => org.id === activeOrgId) ??
    mockOrganizations[0]

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          aria-label="Buka menu navigasi"
          onClick={onToggleSidebar}
        >
          <HugeiconsIcon icon={Menu01Icon} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground shadow-xs hover:bg-muted/60"
              />
            }
          >
            <span className="flex size-5 items-center justify-center rounded-md bg-primary text-[9px] font-bold text-primary-foreground">
              {activeOrg.initials}
            </span>
            <span className="max-w-36 truncate sm:max-w-none">
              {activeOrg.name}
            </span>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              className="size-3.5 text-muted-foreground"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>Pilih organisasi</DropdownMenuLabel>
            {mockOrganizations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => {
                  setActiveOrgId(org.id)
                  toast.success(`Beralih ke ${org.name}`)
                }}
              >
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-md text-[9px] font-bold",
                    org.id === activeOrgId
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {org.initials}
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm">{org.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {org.category}
                  </span>
                </div>
                {org.id === activeOrgId && (
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="size-4 text-primary"
                  />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative hidden w-72 lg:block">
        <HugeiconsIcon
          icon={Search02Icon}
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          placeholder="Cari batch, kredensial, atau penerima"
          className="w-full rounded-lg border bg-muted/40 py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <div className="hidden sm:block">
          <ToggleTheme />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label="Menu pengguna"
                className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            }
          >
            <Avatar className="size-8">
              <AvatarFallback className="bg-brand-navy text-[10px] font-bold text-white">
                {currentUser.initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{currentUser.name}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {currentUser.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate({ to: "/dashboard/settings/account" })}
            >
              <HugeiconsIcon icon={UserIcon} className="size-4" />
              Pengaturan akun
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                toast.success("Anda telah keluar")
                navigate({ to: "/login" })
              }}
            >
              <HugeiconsIcon icon={Logout01Icon} className="size-4" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
