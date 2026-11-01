import type { PlanId } from "@/lib/mock"

type OrgStatus = "aktif" | "uji_coba" | "nonaktif"

// Label + gaya badge status organisasi (dipakai di beberapa halaman admin).
export function orgStatusBadge(status: OrgStatus): {
  label: string
  className: string
} {
  switch (status) {
    case "aktif":
      return { label: "Aktif", className: "bg-accent text-accent-foreground" }
    case "uji_coba":
      return {
        label: "Uji coba",
        className: "bg-primary/10 text-primary",
      }
    case "nonaktif":
      return {
        label: "Nonaktif",
        className: "bg-muted text-muted-foreground",
      }
  }
}

export const planLabels: Record<PlanId, string> = {
  free: "Gratis",
  pro: "Pro",
  bisnis: "Bisnis",
}

export function planBadgeClass(plan: PlanId): string {
  switch (plan) {
    case "bisnis":
      return "bg-brand-navy text-white"
    case "pro":
      return "bg-primary/10 text-primary"
    case "free":
      return "bg-muted text-muted-foreground"
  }
}
