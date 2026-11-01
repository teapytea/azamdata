import {
  Certificate01Icon,
  MailOpen01Icon,
  MailSend01Icon,
  QrCode01Icon,
  UnavailableIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion } from "motion/react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Credential } from "@/lib/mock"
import { cn } from "@/lib/utils"

// Jejak status ringkas per kredensial (gaya Certifier):
// terbit → email terkirim → email dibuka → halaman verifikasi discan.
export function StatusTrack({ credential }: { credential: Credential }) {
  const steps = [
    {
      key: "issued",
      icon:
        credential.status === "revoked" ? UnavailableIcon : Certificate01Icon,
      active: credential.status === "valid",
      danger: credential.status === "revoked",
      label:
        credential.status === "revoked"
          ? "Kredensial dicabut"
          : "Kredensial terbit",
    },
    {
      key: "sent",
      icon: MailSend01Icon,
      active:
        credential.emailStatus === "terkirim" ||
        credential.emailStatus === "dibuka",
      danger: credential.emailStatus === "gagal",
      label:
        credential.emailStatus === "gagal"
          ? "Email gagal terkirim"
          : credential.emailStatus === "belum_dikirim"
            ? "Email belum dikirim"
            : "Email terkirim",
    },
    {
      key: "opened",
      icon: MailOpen01Icon,
      active: credential.emailStatus === "dibuka",
      danger: false,
      label:
        credential.emailStatus === "dibuka"
          ? "Email dibuka"
          : "Email belum dibuka",
    },
    {
      key: "scanned",
      icon: QrCode01Icon,
      active: credential.scanCount > 0,
      danger: false,
      label:
        credential.scanCount > 0
          ? `Discan ${credential.scanCount} kali`
          : "Belum pernah discan",
    },
  ]

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1.5">
        {steps.map((step) => (
          <Tooltip key={step.key}>
            <TooltipTrigger
              render={
                <motion.span
                  whileHover={{ scale: 1.18 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  className={cn(
                    "flex size-6 cursor-default items-center justify-center rounded-md",
                    step.danger
                      ? "bg-destructive/10 text-destructive"
                      : step.active
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground/50"
                  )}
                />
              }
            >
              <HugeiconsIcon icon={step.icon} className="size-3.5" />
              <span className="sr-only">{step.label}</span>
            </TooltipTrigger>
            <TooltipContent>{step.label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
