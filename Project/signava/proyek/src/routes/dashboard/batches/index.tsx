import {
  Add01Icon,
  Certificate01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useState } from "react"

import { BatchStatusBadge } from "@/components/dashboard/status-badge"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  type BatchStatus,
  batchStatusLabels,
  getTemplateById,
  mockBatches,
} from "@/lib/mock"
import { useMockLoading } from "@/lib/mock/use-mock-loading"

export const Route = createFileRoute("/dashboard/batches/")({
  component: BatchesPage,
})

type StatusFilter = BatchStatus | "semua"

function BatchesPage() {
  const isLoading = useMockLoading()
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("semua")

  const filteredBatches = mockBatches.filter((batch) => {
    const matchesQuery =
      query.trim() === "" ||
      batch.name.toLowerCase().includes(query.toLowerCase()) ||
      batch.eventName.toLowerCase().includes(query.toLowerCase())
    const matchesStatus =
      statusFilter === "semua" || batch.status === statusFilter
    return matchesQuery && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Batch</h1>
          <p className="text-sm text-muted-foreground">
            Semua batch penerbitan kredensial organisasi Anda.
          </p>
        </div>
        <Button render={<Link to="/dashboard/batches/new" />}>
          <HugeiconsIcon icon={Add01Icon} />
          Terbitkan sertifikat baru
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
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama batch atau acara"
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Semua status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua status</SelectItem>
            {(Object.keys(batchStatusLabels) as BatchStatus[]).map((status) => (
              <SelectItem key={status} value={status}>
                {batchStatusLabels[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-xs">
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {["a", "b", "c", "d", "e"].map((row) => (
                <Skeleton key={row} className="h-10 w-full" />
              ))}
            </div>
          ) : filteredBatches.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HugeiconsIcon icon={Certificate01Icon} />
                </EmptyMedia>
                <EmptyTitle>
                  {mockBatches.length === 0
                    ? "Belum ada batch"
                    : "Tidak ada batch yang cocok"}
                </EmptyTitle>
                <EmptyDescription>
                  {mockBatches.length === 0
                    ? "Terbitkan batch pertama Anda untuk mulai membagikan kredensial."
                    : "Coba ubah kata kunci pencarian atau filter status."}
                </EmptyDescription>
              </EmptyHeader>
              {mockBatches.length === 0 && (
                <Button render={<Link to="/dashboard/batches/new" />}>
                  Terbitkan batch pertama
                </Button>
              )}
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama batch</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Template
                  </TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead className="hidden text-right md:table-cell">
                    Terkirim
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Tanggal
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBatches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell>
                      <Link
                        to="/dashboard/batches/$id"
                        params={{ id: batch.id }}
                        className="font-medium text-foreground hover:underline"
                      >
                        {batch.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {batch.eventName}
                      </p>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {getTemplateById(batch.templateId)?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(batch.totalCount)}
                    </TableCell>
                    <TableCell className="hidden text-right tabular-nums md:table-cell">
                      {formatNumber(batch.sentCount)}
                    </TableCell>
                    <TableCell>
                      <BatchStatusBadge status={batch.status} />
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {formatDate(batch.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
