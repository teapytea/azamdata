import { Menu01Icon, ShieldUserIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { createFileRoute, Outlet } from "@tanstack/react-router"
import { useState } from "react"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { ToggleTheme } from "@/components/toggle-theme"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { currentUser } from "@/lib/mock"

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
})

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-svh w-full bg-muted/30 text-foreground antialiased">
      <AdminSidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup menu navigasi"
          className="fixed inset-0 z-20 bg-foreground/20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              className="md:hidden"
              aria-label="Buka menu navigasi"
              onClick={() => setSidebarOpen((open) => !open)}
            >
              <HugeiconsIcon icon={Menu01Icon} />
            </Button>
            <Badge className="gap-1.5 bg-brand-navy text-white">
              <HugeiconsIcon icon={ShieldUserIcon} className="size-3.5!" />
              Mode superadmin
            </Badge>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden sm:block">
              <ToggleTheme />
            </div>
            <Avatar className="size-8">
              <AvatarFallback className="bg-brand-navy text-[10px] font-bold text-white">
                {currentUser.initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
