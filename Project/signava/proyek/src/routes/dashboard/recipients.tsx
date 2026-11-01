import {
  Search01Icon,
  Upload01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

import { StatusTrack } from "@/components/dashboard/status-track"
import { TablePagination } from "@/components/dashboard/table-pagination"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
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
import { getBatchById, getTemplateById, mockCredentials } from "@/lib/mock"
import { useMockLoading } from "@/lib/mock/use-mock-loading"

export const Route = createFileRoute("/dashboard/recipients")({
  component: RecipientsPage,
})

const PAGE_SIZE = 10

function RecipientsPage() {
  const isLoading = useMockLoading()
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)

  const filtered = mockCredentials.filter(
    (credential) =>
      query.trim() === "" ||
      credential.recipientName.toLowerCase().includes(query.toLowerCase()) ||
      credential.recipientEmail.toLowerCase().includes(query.toLowerCase())
  )
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Penerima</h1>
          <p className="text-sm text-muted-foreground">
            Lacak semua kredensial yang diterbitkan untuk tiap penerima.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            toast.info("Impor kontak dari CSV akan tersedia di sini")
          }
        >
          <HugeiconsIcon icon={Upload01Icon} />
          Impor kontak
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
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
            placeholder="Cari nama atau email"
            className="pl-9"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {formatNumber(filtered.length)} kredensial
        </p>
      </div>

      <Card className="shadow-xs">
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {["a", "b", "c", "d", "e"].map((row) => (
                <Skeleton key={row} className="h-10 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HugeiconsIcon icon={UserGroupIcon} />
                </EmptyMedia>
                <EmptyTitle>
                  {mockCredentials.length === 0
                    ? "Belum ada penerima"
                    : "Tidak ada hasil"}
                </EmptyTitle>
                <EmptyDescription>
                  {mockCredentials.length === 0
                    ? "Penerima akan tercatat otomatis saat Anda menerbitkan batch."
                    : `Tidak ada penerima yang cocok dengan "${query}".`}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Email
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Template kredensial
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Tanggal terbit
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden xl:table-cell">
                      Kedaluwarsa
                    </TableHead>
                    <TableHead className="w-16 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((credential) => (
                    <TableRow key={credential.id}>
                      <TableCell>
                        <p className="font-medium text-foreground">
                          {credential.recipientName}
                        </p>
                        <p className="text-xs text-muted-foreground md:hidden">
                          {credential.recipientEmail}
                        </p>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {credential.recipientEmail}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground lg:table-cell">
                        {getTemplateById(
                          getBatchById(credential.batchId)?.templateId ?? ""
                        )?.name ?? "—"}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">
                        {formatDate(credential.issuedAt)}
                      </TableCell>
                      <TableCell>
                        <StatusTrack credential={credential} />
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground xl:table-cell">
                        {credential.expiresAt
                          ? formatDate(credential.expiresAt)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          to="/verify/$publicId"
                          params={{ publicId: credential.publicId }}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Lihat
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                page={page}
                pageSize={PAGE_SIZE}
                totalItems={filtered.length}
                onPageChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
