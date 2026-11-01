import {
  Download01Icon,
  MailSend01Icon,
  MoreVerticalIcon,
  QrCode01Icon,
  Refresh01Icon,
  Search01Icon,
  UnavailableIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

import { MetricCard } from "@/components/dashboard/metric-card"
import {
  BatchStatusBadge,
  CredentialStatusBadge,
  EmailStatusBadge,
} from "@/components/dashboard/status-badge"
import { TablePagination } from "@/components/dashboard/table-pagination"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate, formatNumber } from "@/lib/format"
import {
  type Credential,
  getBatchById,
  getCredentialsByBatch,
  getTemplateById,
} from "@/lib/mock"
import { useMockLoading } from "@/lib/mock/use-mock-loading"

export const Route = createFileRoute("/dashboard/batches/$id")({
  component: BatchDetailPage,
})

function BatchDetailPage() {
  const { id } = Route.useParams()
  const isLoading = useMockLoading()
  const batch = getBatchById(id)

  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [credentials, setCredentials] = useState<Credential[]>(() =>
    getCredentialsByBatch(id)
  )
  const [revokeTarget, setRevokeTarget] = useState<Credential | null>(null)

  if (!batch) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={UnavailableIcon} />
          </EmptyMedia>
          <EmptyTitle>Batch tidak ditemukan</EmptyTitle>
          <EmptyDescription>
            Batch yang Anda cari tidak ada atau sudah dihapus.
          </EmptyDescription>
        </EmptyHeader>
        <Button variant="outline" render={<Link to="/dashboard/batches" />}>
          Kembali ke daftar batch
        </Button>
      </Empty>
    )
  }

  const template = getTemplateById(batch.templateId)
  const pageSize = 10
  const filteredCredentials = credentials.filter(
    (credential) =>
      query.trim() === "" ||
      credential.recipientName.toLowerCase().includes(query.toLowerCase()) ||
      credential.recipientEmail.toLowerCase().includes(query.toLowerCase())
  )
  const pagedCredentials = filteredCredentials.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  const revokeCredential = (target: Credential) => {
    setCredentials((current) =>
      current.map((credential) =>
        credential.id === target.id
          ? { ...credential, status: "revoked" as const }
          : credential
      )
    )
    toast.success(`Kredensial ${target.recipientName} telah dicabut`)
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/dashboard/batches"
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          ← Kembali ke daftar batch
        </Link>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">
                {batch.name}
              </h1>
              <BatchStatusBadge status={batch.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {batch.eventName} · {template?.name ?? "Template tidak ditemukan"}{" "}
              · dibuat {formatDate(batch.createdAt)}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() =>
              toast.info(
                "Menyiapkan ZIP berisi semua PDF — tautan unduhan akan dikirim"
              )
            }
          >
            <HugeiconsIcon icon={Download01Icon} />
            Unduh semua (ZIP)
          </Button>
        </div>
      </div>

      {batch.status === "processing" && (
        <Card className="shadow-xs">
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <p className="font-medium text-foreground">
                Menerbitkan kredensial…
              </p>
              <p className="tabular-nums text-muted-foreground">
                {formatNumber(batch.issuedCount)} dari{" "}
                {formatNumber(batch.totalCount)}
              </p>
            </div>
            <Progress value={(batch.issuedCount / batch.totalCount) * 100} />
            <p className="text-xs text-muted-foreground">
              Batch diproses bertahap di latar belakang. Halaman ini akan
              diperbarui otomatis.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Kredensial terbit"
          value={batch.issuedCount}
          icon={QrCode01Icon}
          isLoading={isLoading}
        />
        <MetricCard
          label="Email terkirim"
          value={batch.sentCount}
          icon={MailSend01Icon}
          isLoading={isLoading}
        />
        <MetricCard
          label="Email dibuka"
          value={batch.openedCount}
          icon={ViewIcon}
          isLoading={isLoading}
        />
        <MetricCard
          label="Scan verifikasi"
          value={batch.scannedCount}
          icon={QrCode01Icon}
          isLoading={isLoading}
        />
      </div>

      <div className="relative w-full max-w-xs">
        <HugeiconsIcon
          icon={Search01Icon}
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setPage(1)
          }}
          placeholder="Cari nama atau email penerima"
          className="pl-9"
        />
      </div>

      <Card className="shadow-xs">
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {["a", "b", "c", "d", "e"].map((row) => (
                <Skeleton key={row} className="h-10 w-full" />
              ))}
            </div>
          ) : filteredCredentials.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HugeiconsIcon icon={Search01Icon} />
                </EmptyMedia>
                <EmptyTitle>
                  {credentials.length === 0
                    ? "Belum ada kredensial"
                    : "Tidak ada hasil"}
                </EmptyTitle>
                <EmptyDescription>
                  {credentials.length === 0
                    ? "Kredensial akan muncul di sini setelah batch diproses."
                    : `Tidak ada penerima yang cocok dengan "${query}".`}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Penerima</TableHead>
                    <TableHead className="hidden md:table-cell">
                      ID publik
                    </TableHead>
                    <TableHead>Status email</TableHead>
                    <TableHead className="hidden text-right sm:table-cell">
                      Scan
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedCredentials.map((credential) => (
                    <TableRow key={credential.id}>
                      <TableCell>
                        <p className="font-medium text-foreground">
                          {credential.recipientName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {credential.recipientEmail}
                        </p>
                      </TableCell>
                      <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                        {credential.publicId}
                      </TableCell>
                      <TableCell>
                        <EmailStatusBadge status={credential.emailStatus} />
                      </TableCell>
                      <TableCell className="hidden text-right tabular-nums sm:table-cell">
                        {credential.scanCount}
                      </TableCell>
                      <TableCell>
                        <CredentialStatusBadge status={credential.status} />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Aksi untuk ${credential.recipientName}`}
                              />
                            }
                          >
                            <HugeiconsIcon icon={MoreVerticalIcon} />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem
                              render={
                                <Link
                                  to="/verify/$publicId"
                                  params={{ publicId: credential.publicId }}
                                />
                              }
                            >
                              <HugeiconsIcon
                                icon={QrCode01Icon}
                                className="size-4"
                              />
                              Lihat halaman verifikasi
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                toast.success(
                                  `Kredensial ${credential.recipientName} dijadwalkan untuk regenerate`
                                )
                              }
                            >
                              <HugeiconsIcon
                                icon={Refresh01Icon}
                                className="size-4"
                              />
                              Regenerate kredensial
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                toast.success(
                                  `Email dikirim ulang ke ${credential.recipientEmail}`
                                )
                              }
                            >
                              <HugeiconsIcon
                                icon={MailSend01Icon}
                                className="size-4"
                              />
                              Kirim ulang email
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                toast.info(
                                  `Mengunduh PDF ${credential.recipientName}…`
                                )
                              }
                            >
                              <HugeiconsIcon
                                icon={Download01Icon}
                                className="size-4"
                              />
                              Unduh PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              disabled={credential.status === "revoked"}
                              onClick={() => setRevokeTarget(credential)}
                            >
                              <HugeiconsIcon
                                icon={UnavailableIcon}
                                className="size-4"
                              />
                              Cabut kredensial
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                page={page}
                pageSize={pageSize}
                totalItems={filteredCredentials.length}
                onPageChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={revokeTarget !== null}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cabut kredensial ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Kredensial milik {revokeTarget?.recipientName} akan ditandai
              "Dicabut" dan halaman verifikasinya menampilkan status tidak
              berlaku. Tindakan ini bisa memengaruhi penerima.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (revokeTarget) revokeCredential(revokeTarget)
                setRevokeTarget(null)
              }}
            >
              Cabut kredensial
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
