import { Badge } from "@/components/ui/badge"
import {
  type BatchStatus,
  batchStatusLabels,
  type CredentialStatus,
  type EmailStatus,
  emailStatusLabels,
} from "@/lib/mock"
import { cn } from "@/lib/utils"

const batchStatusStyles: Record<BatchStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  processing: "bg-primary/10 text-primary",
  completed: "bg-accent text-accent-foreground",
  failed: "bg-destructive/10 text-destructive",
}

export function BatchStatusBadge({ status }: { status: BatchStatus }) {
  return (
    <Badge variant="secondary" className={cn(batchStatusStyles[status])}>
      {batchStatusLabels[status]}
    </Badge>
  )
}

const emailStatusStyles: Record<EmailStatus, string> = {
  belum_dikirim: "bg-muted text-muted-foreground",
  terkirim: "bg-primary/10 text-primary",
  dibuka: "bg-accent text-accent-foreground",
  gagal: "bg-destructive/10 text-destructive",
}

export function EmailStatusBadge({ status }: { status: EmailStatus }) {
  return (
    <Badge variant="secondary" className={cn(emailStatusStyles[status])}>
      {emailStatusLabels[status]}
    </Badge>
  )
}

export function CredentialStatusBadge({
  status,
}: {
  status: CredentialStatus
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        status === "valid"
          ? "bg-accent text-accent-foreground"
          : "bg-destructive/10 text-destructive"
      )}
    >
      {status === "valid" ? "Berlaku" : "Dicabut"}
    </Badge>
  )
}
