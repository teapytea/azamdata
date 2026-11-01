import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsLayout,
})

const settingsTabs = [
  { to: "/dashboard/settings/organization", label: "Organisasi" },
  { to: "/dashboard/settings/team", label: "Tim" },
  { to: "/dashboard/settings/billing", label: "Tagihan" },
  { to: "/dashboard/settings/account", label: "Akun" },
]

function SettingsLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Pengaturan</h1>
        <p className="text-sm text-muted-foreground">
          Kelola organisasi, tim, tagihan, dan akun Anda.
        </p>
      </div>

      <nav className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-lg bg-muted p-1">
        {settingsTabs.map((tab) => {
          const isActive = pathname === tab.to
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                "relative rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="settings-tab-indicator"
                  className="absolute inset-0 rounded-md bg-background shadow-xs"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </Link>
          )
        })}
      </nav>

      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Outlet />
      </motion.div>
    </div>
  )
}
